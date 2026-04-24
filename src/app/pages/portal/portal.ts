import {ChangeDetectionStrategy, Component, signal, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute} from '@angular/router';
import {collection, query, where, getDocs, doc, getDoc} from 'firebase/firestore';
import {db} from '../../firebase';

interface Parcel {
  parcelId: string;
  currentOwner: string;
  surface: number;
  usage: string;
  address: string;
  hash: string;
  status: string;
}

interface Transaction {
  type: string;
  newOwner: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: { toDate: () => Date } | any;
  hash: string;
  agentUid?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-portal',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatIconModule
  ],
  template: `
    <div class="max-w-4xl mx-auto py-10 space-y-12 animate-fade-in">
      
      <!-- Central Search Section -->
      <div class="text-center space-y-4 mb-10">
        <h2 class="text-3xl font-bold text-white">Vérifiez un Titre Foncier</h2>
        <p class="text-slate-400 max-w-xl mx-auto">
          Entrez l’identifiant d’une parcelle pour vérifier instantanément son propriétaire légitime, son historique et son statut sur la blockchain.
        </p>
      </div>

      <!-- Search Box (Terminal Style) -->
      <div class="glass-card overflow-hidden">
        <div class="bg-black/40 px-6 py-3 flex items-center justify-between border-b border-white/5">
          <div class="flex gap-2">
            <div class="h-3 w-3 rounded-full bg-red-500/50"></div>
            <div class="h-3 w-3 rounded-full bg-yellow-500/50"></div>
            <div class="h-3 w-3 rounded-full bg-green-500/50"></div>
          </div>
          <div class="text-[10px] font-mono text-slate-500">foncierchain-verify v2.4.1 — Accès Public</div>
        </div>
        
        <div class="p-8 space-y-6">
          <div class="flex items-center gap-2 mb-4">
             <span class="text-[--primary] font-mono">>_</span>
             <span class="text-xs font-medium text-slate-400">Entrez un ID de parcelle ou un hash SHA-256 pour vérifier</span>
          </div>
          
          <div class="flex gap-3">
            <div class="flex-1 relative group">
              <input type="text" [(ngModel)]="searchQuery" 
                     placeholder="Ex: BZV-2024-8821 ou MADIBOU-482..."
                     class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-[--primary] transition-all group-hover:border-white/20"
                     (keyup.enter)="search()">
            </div>
            <button class="bg-[--primary] hover:bg-[--primary-hover] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all shrink-0" 
                    (click)="search()" [disabled]="loading()">
              @if (loading()) {
                <mat-icon class="animate-spin !text-lg">sync</mat-icon>
              } @else {
                <mat-icon>search</mat-icon>
                Vérifier
              }
            </button>
          </div>

          <div class="flex flex-wrap gap-2 pt-2">
            @for (example of ['BZV-2024-8821', 'MADIBOU-482', 'BZV-2024-8817']; track example) {
              <button (click)="searchQuery = example; search()" 
                      class="text-[10px] font-mono px-3 py-1.5 rounded bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                {{ example }}
              </button>
            }
          </div>
        </div>
      </div>

      @if (searched() && parcel()) {
        <!-- Search Results (Official Certificate) -->
        <div class="animate-fade-in space-y-6">
          <div class="glass-card relative overflow-hidden bg-gradient-to-br from-black/60 to-black/20">
            <!-- Background Watermark -->
            <mat-icon class="absolute -right-10 -bottom-10 !text-[240px] text-white/[0.02] rotate-12">verified_user</mat-icon>
            
            <div class="relative p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start gap-8">
               <div class="space-y-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b98115] text-[--primary] border border-[--primary]/20">
                    <mat-icon class="!text-sm">verified</mat-icon>
                    <span class="text-[9px] font-bold uppercase tracking-widest">Titre Authentifié Blockchain</span>
                  </div>
                  <h3 class="text-4xl font-bold text-white tracking-tight">{{ parcel()?.parcelId }}</h3>
                  <div class="flex items-center gap-6 text-slate-400">
                    <div class="flex items-center gap-2">
                       <mat-icon class="!text-sm opacity-50">person</mat-icon>
                       <span class="text-sm font-medium">{{ parcel()?.currentOwner }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                       <mat-icon class="!text-sm opacity-50">square_foot</mat-icon>
                       <span class="text-sm font-medium">{{ parcel()?.surface }} m²</span>
                    </div>
                  </div>
               </div>

               <div class="text-right space-y-2">
                  <div class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Hash de Signature</div>
                  <div class="text-[11px] font-mono text-[--primary] px-3 py-2 bg-black/40 rounded-lg border border-white/5">
                    {{ parcel()?.hash }}
                  </div>
                  <div class="text-[9px] text-slate-600 font-bold italic">Vérifié par AfriChain Protocol v2.0</div>
               </div>
            </div>

            <div class="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
               <!-- Left: Legal Details -->
               <div class="space-y-6">
                  <h4 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <mat-icon class="!text-sm text-slate-500">info_outline</mat-icon>
                    Informations Légales
                  </h4>
                  <div class="grid grid-cols-2 gap-4">
                     <div>
                        <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Localisation</div>
                        <div class="text-xs text-white">{{ parcel()?.address }}</div>
                     </div>
                     <div>
                        <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Usage</div>
                        <div class="text-xs text-white">{{ parcel()?.usage }}</div>
                     </div>
                     <div>
                        <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Statut Foncier</div>
                        <div class="text-xs text-[--primary] font-bold">{{ parcel()?.status }}</div>
                     </div>
                     <div>
                        <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Date d'Inscription</div>
                        <div class="text-xs text-white">24 Avril 2024</div>
                     </div>
                  </div>
               </div>

               <!-- Right: Blockchain Verification (Transaction History) -->
               <div class="space-y-6">
                  <h4 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <mat-icon class="!text-sm text-slate-500">history</mat-icon>
                    Historique des Transactions
                  </h4>
                  <div class="space-y-4">
                    @for (tx of history(); track tx.hash) {
                      <div class="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[--primary]/30 hover:bg-[--primary]/5 transition-all">
                        <div class="flex justify-between items-start mb-3">
                          <div class="flex items-center gap-3">
                            <div class="p-2 rounded-lg bg-black/40 text-slate-400 group-hover:text-[--primary] transition-colors">
                              <mat-icon class="!text-sm">
                                {{ tx.type === 'TRANSFER' ? 'swap_horiz' : (tx.type === 'CREATE' ? 'add_circle' : 'edit') }}
                              </mat-icon>
                            </div>
                            <div>
                              <div class="text-[10px] font-bold text-white uppercase tracking-widest">{{ tx.type }}</div>
                              <div class="text-[9px] text-slate-500">{{ tx.date?.toDate ? (tx.date.toDate() | date:'medium') : (tx.date | date:'medium') }}</div>
                            </div>
                          </div>
                          <div class="text-right">
                             <div class="text-[9px] font-mono text-[--primary]">{{ tx.hash.substring(0, 10) }}...</div>
                             <div class="text-[8px] text-[#10b981] font-bold uppercase tracking-tighter">Confirmé</div>
                          </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                           <div>
                              <div class="text-[8px] text-slate-500 uppercase font-bold mb-0.5">Parties Impliquées</div>
                              <div class="text-[10px] text-white font-medium flex items-center gap-1">
                                 <mat-icon class="!text-[10px] opacity-40">person</mat-icon>
                                 {{ tx.newOwner }}
                              </div>
                           </div>
                           @if (tx.agentUid) {
                             <div class="text-right">
                                <div class="text-[8px] text-slate-500 uppercase font-bold mb-0.5">Signé par Agent</div>
                                <div class="text-[10px] text-slate-400 font-mono">{{ tx.agentUid.substring(0, 8) }}</div>
                             </div>
                           }
                        </div>
                      </div>
                    } @empty {
                       <div class="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                          <mat-icon class="!text-2xl text-slate-600 mb-2">history_toggle_off</mat-icon>
                          <div class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aucun historique détaillé</div>
                       </div>
                    }
                  </div>
               </div>
            </div>

            <!-- Certificate Footer -->
            <div class="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
              <div class="flex items-center gap-4">
                <button class="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white border border-white/10 transition-all flex items-center gap-2">
                  <mat-icon class="!text-sm">print</mat-icon>
                  Imprimer le Certificat
                </button>
                <button class="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white border border-white/10 transition-all flex items-center gap-2">
                  <mat-icon class="!text-sm">share</mat-icon>
                  Partager le Lien
                </button>
              </div>
              <div class="flex items-center gap-2 text-slate-600">
                <mat-icon class="!text-xs">verified_user</mat-icon>
                <span class="text-[9px] font-bold uppercase tracking-tighter">Powered by FoncierChain Node BZV-01</span>
              </div>
            </div>
          </div>
        </div>
      } @else if (searched() && !loading() && !parcel()) {
        <div class="glass-card p-12 text-center space-y-4 border-dashed border-white/20">
           <mat-icon class="!text-5xl text-red-400 opacity-20">search_off</mat-icon>
           <h3 class="text-lg font-bold text-white">Référence introuvable</h3>
           <p class="text-sm text-slate-500">Aucun titre foncier ne correspond à cet identifiant dans le ledger.</p>
        </div>
      }

      <!-- Bottom Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6 space-y-4">
           <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
             <mat-icon>security</mat-icon>
           </div>
           <h4 class="text-sm font-bold text-white">Vérification Cryptographique</h4>
           <p class="text-xs text-slate-500 leading-relaxed">
             Chaque titre est signé avec SHA-256 et inscrit de manière immuable sur la blockchain.
           </p>
        </div>

        <div class="glass-card p-6 space-y-4">
           <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
             <mat-icon>schedule</mat-icon>
           </div>
           <h4 class="text-sm font-bold text-white">Résultat Instantané</h4>
           <p class="text-xs text-slate-500 leading-relaxed">
             La vérification s’effectue en moins de 2 secondes grâce à notre réseau de 24 nœuds.
           </p>
        </div>

        <div class="glass-card p-6 space-y-4">
           <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
             <mat-icon>public</mat-icon>
           </div>
           <h4 class="text-sm font-bold text-white">Accès Public</h4>
           <p class="text-xs text-slate-500 leading-relaxed">
             Tout citoyen peut vérifier la légitimité d’un titre foncier sans inscription préalable.
           </p>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class Portal implements OnInit {
  searchQuery = '';
  loading = signal(false);
  searched = signal(false);
  parcel = signal<Parcel | null>(null);
  history = signal<Transaction[]>([]);

  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.searchQuery = params['id'];
        this.search();
      }
    });
  }

  async search() {
    if (!this.searchQuery.trim()) return;
    
    this.loading.set(true);
    this.searched.set(true);
    this.parcel.set(null);
    this.history.set([]);

    try {
      // Search by ID first
      const parcelDoc = await getDoc(doc(db, 'parcels', this.searchQuery.trim()));
      
      if (parcelDoc.exists()) {
        this.parcel.set(parcelDoc.data() as Parcel);
        await this.loadHistory(this.searchQuery.trim());
      } else {
        // Search by address
        const q = query(collection(db, 'parcels'), where('address', '==', this.searchQuery.trim()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data() as Parcel;
          this.parcel.set(data);
          await this.loadHistory(data.parcelId);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadHistory(parcelId: string) {
    try {
      const hq = query(collection(db, `parcels/${parcelId}/history`));
      const hSnapshot = await getDocs(hq);
      this.history.set(hSnapshot.docs.map(d => d.data() as Transaction).sort((a, b) => b.date - a.date));
    } catch (error) {
      console.error("History error:", error);
    }
  }
}

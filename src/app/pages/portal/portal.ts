import {ChangeDetectionStrategy, Component, signal, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute} from '@angular/router';
import {collection, query, where, getDocs, doc, getDoc} from 'firebase/firestore';
import {db} from '../../firebase';
import {FancierChain, LandHistoryEntry} from '../../services/fancier-chain';

interface Transaction {
  type: string;
  newOwner: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: { toDate: () => Date } | any;
  hash: string;
  agentUid?: string;
}

interface ParcelDisplay {
  parcelId?: string;
  id?: string;
  currentOwner?: string;
  owner?: string;
  surface?: number;
  area?: number;
  neighborhood?: string;
  city?: string;
  address?: string;
  cadastralId?: string;
  status?: string;
  hash?: string;
  blockchainTxId?: string;
  workflowStep?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
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
          Entrez l’identifiant d’une parcelle pour vérifier instantanément son propriétaire légitime, son historique et son statut sur la blockchain Hyperledger Fabric.
        </p>
      </div>
      
      <div class="glass-card overflow-hidden">
        <div class="bg-black/40 px-6 py-3 flex items-center justify-between border-b border-white/5">
          <div class="flex gap-2">
            <div class="h-3 w-3 rounded-full bg-red-500/50"></div>
            <div class="h-3 w-3 rounded-full bg-yellow-500/50"></div>
            <div class="h-3 w-3 rounded-full bg-green-500/50"></div>
          </div>
          <div class="text-[10px] font-mono text-slate-500 flex items-center gap-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            foncierchain-verify v2.6.0 — On-Chain Explorer (DC-SERVICE)
          </div>
        </div>
        
        <div class="p-8 space-y-6">
          <div class="flex items-center gap-2">
             <span class="text-[--primary] font-mono">>_</span>
             <span class="text-xs font-medium text-slate-400">Entrez un ID de parcelle (ex: bz-456) pour une vérification immuable</span>
          </div>
          
          <div class="flex gap-3">
            <div class="flex-1 relative group">
              <input type="text" [(ngModel)]="searchQuery" 
                     placeholder="Ex: bz-456, BZV-2024-8821..."
                     class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-[--primary] transition-all group-hover:border-white/20"
                     (keyup.enter)="search()">
            </div>
            <button class="bg-[--primary] hover:bg-[--primary-hover] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all shrink-0 active:scale-95" 
                    (click)="search()" [disabled]="loading()">
              @if (loading()) {
                <mat-icon class="animate-spin !text-lg">sync</mat-icon>
              } @else {
                <mat-icon>search</mat-icon>
                Vérifier On-Chain
              }
            </button>
          </div>

          <div class="flex flex-wrap gap-2 pt-2 border-t border-white/5 mt-4">
            @for (example of ['bz-456', 'BZV-2024-8821', 'MADIBOU-482']; track example) {
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
                  
                  <!-- Workflow Visual Tracker -->
                  <div class="flex items-center gap-1 mt-4">
                    @let step = parcel()?.workflowStep || 0;
                    <div class="flex items-center">
                      <div [class]="'h-2 w-8 rounded-full transition-all ' + (step >= 1 ? 'bg-blue-500' : 'bg-slate-800')"></div>
                      <mat-icon [class]="'!text-[10px] mx-1 ' + (step >= 1 ? 'text-blue-500' : 'text-slate-600')">check_circle</mat-icon>
                    </div>
                    <div class="flex items-center">
                      <div [class]="'h-2 w-8 rounded-full transition-all ' + (step >= 2 ? 'bg-orange-500' : 'bg-slate-800')"></div>
                      <mat-icon [class]="'!text-[10px] mx-1 ' + (step >= 2 ? 'text-orange-500' : 'text-slate-600')">verified</mat-icon>
                    </div>
                    <div class="flex items-center">
                      <div [class]="'h-2 w-8 rounded-full transition-all ' + (step >= 3 ? 'bg-green-500' : 'bg-slate-800')"></div>
                      <mat-icon [class]="'!text-[10px] mx-1 ' + (step >= 3 ? 'text-green-500' : 'text-slate-600')">auto_awesome</mat-icon>
                    </div>
                    <span class="text-[8px] font-bold text-slate-500 uppercase ml-2 tracking-tighter">Blockchain Lifecycle</span>
                  </div>

                  <div class="flex items-center gap-6 text-slate-400 mt-6">
                    <div class="flex items-center gap-2">
                       <mat-icon class="!text-sm opacity-50">person</mat-icon>
                       <span class="text-sm font-medium">{{ parcel()?.currentOwner }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                       <mat-icon class="!text-sm opacity-50">square_foot</mat-icon>
                       <span class="text-sm font-medium">{{ parcel()?.surface || parcel()?.area }} m²</span>
                    </div>
                  </div>
               </div>

               <div class="text-right space-y-2">
                  <div class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Preuve Blockchain</div>
                  <div class="text-[11px] font-mono text-[--primary] px-3 py-2 bg-black/40 rounded-lg border border-white/5">
                    {{ parcel()?.blockchainTxId || parcel()?.hash || 'Transaction en cours...' }}
                  </div>
                  <div class="text-[9px] text-slate-600 font-bold italic">Network: Hyperledger Fabric Channel</div>
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
                        <div class="text-xs text-white">{{ parcel()?.neighborhood }}, {{ parcel()?.city || parcel()?.address }}</div>
                     </div>
                     <div>
                        <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Cadastre National</div>
                        <div class="text-xs text-white">{{ parcel()?.cadastralId || 'N/A' }}</div>
                     </div>
                     <div>
                        <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Statut Foncier</div>
                        <div class="text-xs text-[--primary] font-bold">{{ parcel()?.status }}</div>
                     </div>
                      <div>
                        <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Date d'Inscription</div>
                        <div class="text-xs text-white">
                          @let p = parcel();
                          @if (p && p.createdAt) {
                            {{ (p.createdAt.toDate ? p.createdAt.toDate() : p.createdAt) | date:'mediumDate' }}
                          } @else {
                            N/A
                          }
                        </div>
                      </div>
                  </div>
               </div>

                <!-- Right: Blockchain Verification (Workflow & History) -->
                <div class="space-y-6">
                  <!-- Workflow Progress Section -->
                  @let pState = parcel();
                  @if (pState && pState.status !== 'FINALIZED') {
                    <div class="p-6 rounded-2xl bg-[--primary]/5 border border-[--primary]/20 space-y-4">
                      <h4 class="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <mat-icon class="!text-sm text-[--primary]">pending_actions</mat-icon>
                        Action Requise (Workflow Blockchain)
                      </h4>
                      
                      @if (pState.status === 'DRAFT') {
                        <div class="space-y-3">
                          <p class="text-[10px] text-slate-400">Étape 2 : Le Représentant Communautaire (V3) doit confirmer l'occupation réelle du terrain.</p>
                          <div class="flex gap-2">
                            <input #sigV3 type="text" placeholder="Signature V3 (Community)" class="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-[--primary]">
                            <button (click)="validateStep2(pState.parcelId || pState.id, sigV3.value)" 
                                    class="bg-[--primary] text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:scale-105 transition-all">
                              VALIDER V3
                            </button>
                          </div>
                        </div>
                      } @else if (pState.status === 'COMMUNITY_VALIDATED') {
                        <div class="space-y-3">
                          <p class="text-[10px] text-slate-400">Étape finale : L'Agent Foncier (V1) doit minté le titre définitif on-chain.</p>
                          <div class="flex gap-2">
                            <input #sigV1 type="text" placeholder="Signature V1 (Agent)" class="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-[--primary]">
                            <button (click)="validateStep3(pState.parcelId || pState.id, sigV1.value)" 
                                    class="bg-[#10b981] text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:scale-105 transition-all">
                              MINT FINAL V1
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }

                  <h4 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <mat-icon class="!text-sm text-slate-500">history</mat-icon>
                    Historique du Titre
                  </h4>
                  <div class="space-y-4">
                    @if (blockchainHistory().length > 0) {
                      @for (entry of blockchainHistory(); track entry.txId) {
                        <div class="group p-4 rounded-2xl bg-white/5 border border-white/5 border-l-2 border-l-[--primary] hover:bg-[--primary]/5 transition-all">
                          <div class="flex justify-between items-start mb-2">
                             <div>
                                <div class="text-[10px] font-bold text-white uppercase tracking-widest">{{ entry.value.status }}</div>
                                <div class="text-[9px] text-slate-500">{{ entry.timestamp | date:'medium' }}</div>
                             </div>
                             <div class="text-right">
                               <div class="text-[9px] font-mono text-[--primary]">{{ entry.txId.substring(0, 12) }}...</div>
                               <div class="text-[8px] text-[--primary] font-bold uppercase">BC-VERIFIED</div>
                             </div>
                          </div>
                          <div class="text-[10px] text-slate-400">Propriétaire: {{ entry.value.owner }}</div>
                        </div>
                      }
                    } @else {
                      @for (tx of history(); track tx.hash) {
                        <div class="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[--primary]/30 hover:bg-[--primary]/5 transition-all">
                          <!-- (Original Firebase History Items) -->
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
                          <div class="text-[10px] text-white font-medium flex items-center gap-1">
                             <mat-icon class="!text-[10px] opacity-40">person</mat-icon>
                             {{ tx.newOwner }}
                          </div>
                        </div>
                      }
                    }
                    
                    @if (blockchainHistory().length === 0 && history().length === 0) {
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
              </div>
              <div class="flex items-center gap-2 text-slate-600">
                <mat-icon class="!text-xs">cloud_done</mat-icon>
                <span class="text-[9px] font-bold uppercase tracking-tighter">foncierchain-service (us-east4) - Firebase Data Connect</span>
              </div>
            </div>
          </div>
        </div>
      } @else if (searched() && !loading() && !parcel()) {
        <div class="glass-card p-12 text-center space-y-4 border-dashed border-white/20">
           <mat-icon class="!text-5xl text-red-400 opacity-20">search_off</mat-icon>
           <h3 class="text-lg font-bold text-white">Référence introuvable</h3>
           <p class="text-sm text-slate-500">Aucun titre foncier ne correspond à cet identifiant dans le ledger blockchain.</p>
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
             Chaque titre est signé numériquement et inscrit dans l'architecture Hyperledger Fabric pour une sécurité maximale.
           </p>
        </div>

        <div class="glass-card p-6 space-y-4">
           <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
             <mat-icon>schedule</mat-icon>
           </div>
           <h4 class="text-sm font-bold text-white">Consensus Global</h4>
           <p class="text-xs text-slate-500 leading-relaxed">
             La validation est décentralisée, assurant qu'aucun acteur unique ne peut modifier le registre de manière arbitraire.
           </p>
        </div>

        <div class="glass-card p-6 space-y-4">
           <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
             <mat-icon>public</mat-icon>
           </div>
           <h4 class="text-sm font-bold text-white">Zéro-Confiance</h4>
           <p class="text-xs text-slate-500 leading-relaxed">
             Ne faites plus confiance aux certificats papier — vérifiez la vérité on-chain à tout moment.
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
  parcel = signal<ParcelDisplay | null>(null);
  history = signal<Transaction[]>([]);
  blockchainHistory = signal<LandHistoryEntry[]>([]);

  private route = inject(ActivatedRoute);
  private fancierChain = inject(FancierChain);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.searchQuery = params['id'];
        this.search();
      }
    });
  }

  async validateStep2(parcelId: string | undefined, sigV3: string) {
    if (!parcelId || !sigV3) return;
    this.loading.set(true);
    this.fancierChain.validateCommunity(parcelId, sigV3).subscribe({
      next: () => {
        this.search();
      },
      error: (e) => {
        console.error(e);
        this.loading.set(false);
      }
    });
  }

  async validateStep3(parcelId: string | undefined, sigV1: string) {
    if (!parcelId || !sigV1) return;
    this.loading.set(true);
    this.fancierChain.finalizeLand(parcelId, sigV1).subscribe({
      next: () => {
        this.search();
      },
      error: (e) => {
        console.error(e);
        this.loading.set(false);
      }
    });
  }

  async search() {
    if (!this.searchQuery.trim()) return;
    
    this.loading.set(true);
    this.searched.set(true);
    this.parcel.set(null);
    this.history.set([]);
    this.blockchainHistory.set([]);

    try {
      const qStr = this.searchQuery.trim();
      const results = await this.fancierChain.findParcel(qStr);
      
      if (results && results.length > 0) {
        const data = results[0];
        this.parcel.set(data as ParcelDisplay);
        const pid = data['parcelId'] || data['id'];
        if (pid) {
          await this.loadFirebaseHistory(pid);
        }
      }

      // Fetch Source of Truth from Blockchain API
      this.fancierChain.getLandHistory(qStr).subscribe({
        next: (res) => {
          this.blockchainHistory.set(res.history);
          if (!this.parcel() && res.history && res.history.length > 0) {
            const lastEntry = res.history[0];
            this.parcel.set({
              parcelId: res.land_id,
              currentOwner: lastEntry.value.owner,
              status: lastEntry.value.status,
              hash: lastEntry.txId,
              createdAt: lastEntry.timestamp
            });
          }
        },
        error: (err) => console.log("Blockchain history fetch failed:", err)
      });

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadFirebaseHistory(parcelId: string) {
    try {
      const hq = query(collection(db, `parcels/${parcelId}/history`));
      const hSnapshot = await getDocs(hq);
      this.history.set(hSnapshot.docs.map(d => d.data() as Transaction).sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate().getTime() : new Date(a.date).getTime();
        const dateB = b.date?.toDate ? b.date.toDate().getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      }));
    } catch (error) {
      console.error("Firebase History error:", error);
    }
  }
}

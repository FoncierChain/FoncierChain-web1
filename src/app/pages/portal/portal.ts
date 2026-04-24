import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
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
        <!-- Search Results (Glass Layout) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
           <!-- Details -->
           <div class="lg:col-span-1 space-y-6">
              <div class="glass-card p-6 border-l-4 border-l-[--primary]">
                <div class="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">Certificat Actif</div>
                <h3 class="text-xl font-bold text-white mb-6">{{ parcel()?.parcelId }}</h3>
                
                <div class="space-y-4">
                  <div>
                    <div class="text-[10px] text-slate-500 uppercase font-bold mb-1">Propriétaire</div>
                    <div class="text-sm font-semibold text-white">{{ parcel()?.currentOwner }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] text-slate-500 uppercase font-bold mb-1">Statut Juridique</div>
                    <div class="text-xs text-[--primary] font-bold flex items-center gap-1">
                      <mat-icon class="!text-xs">verified</mat-icon>
                      {{ parcel()?.status }}
                    </div>
                  </div>
                </div>
              </div>
           </div>

           <!-- History -->
           <div class="lg:col-span-2 glass-card overflow-hidden flex flex-col">
              <div class="p-5 border-b border-white/5 flex items-center justify-between">
                <span class="text-xs font-bold text-white uppercase tracking-widest">Preuve Blockchain</span>
                <mat-icon class="text-slate-500">lock</mat-icon>
              </div>
              <div class="flex-1 overflow-x-auto">
                <table class="w-full text-left">
                  <thead>
                     <tr class="text-[10px] text-slate-500 uppercase font-bold border-b border-white/5">
                        <th class="px-6 py-4">Opération</th>
                        <th class="px-6 py-4">Propriétaire</th>
                        <th class="px-6 py-4">Date</th>
                     </tr>
                  </thead>
                  <tbody>
                    @for (tx of history(); track tx.hash) {
                      <tr class="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td class="px-6 py-4">
                           <span class="badge badge-green text-[9px]">{{ tx.type }}</span>
                        </td>
                        <td class="px-6 py-4 text-xs text-white">{{ tx.newOwner }}</td>
                        <td class="px-6 py-4 text-[10px] text-slate-500">{{ tx.date?.toDate() | date:'shortDate' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
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
export class Portal {
  searchQuery = '';
  loading = signal(false);
  searched = signal(false);
  parcel = signal<Parcel | null>(null);
  history = signal<Transaction[]>([]);

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

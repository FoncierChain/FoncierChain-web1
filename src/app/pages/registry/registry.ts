import {ChangeDetectionStrategy, Component, signal, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {FancierChain} from '../../services/fancier-chain';

interface Parcel {
  parcelId: string;
  currentOwner: string;
  surface: number;
  usage: string;
  address: string;
  hash: string;
  status: string;
  createdAt?: string | Date;
}

interface LedgerBlock {
  number: number;
  type: string;
  details: string;
  timestamp: any;
  hash: string;
  proof: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-registry',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Registry Header Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-4 border border-white/5 flex items-center gap-4">
           <div class="h-10 w-10 rounded-xl bg-[--primary]/10 flex items-center justify-center text-[--primary]">
             <mat-icon>inventory_2</mat-icon>
           </div>
           <div>
             <div class="text-[10px] text-slate-500 uppercase font-bold">Total Titres</div>
             <div class="text-lg font-bold text-white">{{ stats()?.total_parcels || '...' }}</div>
           </div>
        </div>
        <div class="glass-card p-4 border border-white/5 flex items-center gap-4">
           <div class="h-10 w-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
             <mat-icon>history_edu</mat-icon>
           </div>
           <div>
             <div class="text-[10px] text-slate-500 uppercase font-bold">Transferts (24h)</div>
             <div class="text-lg font-bold text-white">42</div>
           </div>
        </div>
        <div class="glass-card p-4 border border-white/5 flex items-center gap-4">
           <div class="h-10 w-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
             <mat-icon>account_tree</mat-icon>
           </div>
           <div>
             <div class="text-[10px] text-slate-500 uppercase font-bold">Blocks Actifs</div>
             <div class="text-lg font-bold text-white">842k+</div>
           </div>
        </div>
      </div>

      <!-- Unified Header Tabs & Search -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 gap-4">
        <div class="flex gap-8">
          <button (click)="activeTab.set('list')" 
                  [class.border-b-2]="activeTab() === 'list'"
                  [class.border-[--primary]]="activeTab() === 'list'"
                  [class.text-[--primary]]="activeTab() === 'list'"
                  [class.text-slate-500]="activeTab() !== 'list'"
                  class="pb-4 text-xs font-bold uppercase tracking-widest transition-all">
            Répertoire des Parcelles
          </button>
          <button (click)="activeTab.set('ledger')" 
                  [class.border-b-2]="activeTab() === 'ledger'"
                  [class.border-[--primary]]="activeTab() === 'ledger'"
                  [class.text-[--primary]]="activeTab() === 'ledger'"
                  [class.text-slate-500]="activeTab() !== 'ledger'"
                  class="pb-4 text-xs font-bold uppercase tracking-widest transition-all">
            Blockchain Ledger
          </button>
        </div>

        @if (activeTab() === 'list') {
          <div class="pb-2 w-full md:w-64">
            <div class="relative">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 !text-sm text-slate-500">search</mat-icon>
              <input type="text" placeholder="Filtrer le registre..." (input)="onSearch($event)"
                     class="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-[--primary] transition-all">
            </div>
          </div>
        }
      </div>

      @if (activeTab() === 'list') {
        <!-- Parcels List Table -->
        <div class="glass-card overflow-hidden">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[10px] text-slate-500 uppercase font-bold border-b border-white/5 bg-white/5">
                <th class="px-6 py-4">ID Parcelle</th>
                <th class="px-6 py-4">Propriétaire</th>
                <th class="px-6 py-4">Surface</th>
                <th class="px-6 py-4">Usage</th>
                <th class="px-6 py-4">Statut</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (p of parcels(); track p.parcelId) {
                <tr class="hover:bg-white/5 transition-colors group">
                  <td class="px-6 py-4 text-xs font-mono text-white">{{ p.parcelId }}</td>
                  <td class="px-6 py-4 text-xs text-white">{{ p.currentOwner }}</td>
                  <td class="px-6 py-4 text-xs text-slate-400">{{ p.surface }} m²</td>
                  <td class="px-6 py-4 text-xs text-slate-400">{{ p.usage }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-full text-[9px] font-bold" 
                          [class.bg-[#10b98115]]="p.status === 'FINALIZED' || p.status === 'Sécurisé'"
                          [class.text-[--primary]]="p.status === 'FINALIZED' || p.status === 'Sécurisé'"
                          [class.bg-amber-400/10]="p.status === 'COMMUNITY_VALIDATED' || p.status === 'En attente'"
                          [class.text-amber-400]="p.status === 'COMMUNITY_VALIDATED' || p.status === 'En attente'"
                          [class.bg-blue-400/10]="p.status === 'DRAFT'"
                          [class.text-blue-400]="p.status === 'DRAFT'"
                          [class.bg-red-400/10]="p.status === 'Litige'"
                          [class.text-red-400]="p.status === 'Litige'">
                      {{ p.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button [routerLink]="['/portal']" [queryParams]="{id: p.parcelId}" class="p-2 text-slate-500 hover:text-[--primary] transition-colors">
                      <mat-icon class="!text-sm">verified</mat-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          
          @if (parcels().length === 0) {
            <div class="p-12 text-center text-slate-500 text-xs italic">
              Aucune parcelle trouvée dans le registre.
            </div>
          }
        </div>
      } @else {
        <!-- Blockchain Ledger View (Recent Blocks) -->
        <div class="space-y-4">
           @for (block of ledgerBlocks(); track block.hash) {
             <div class="glass-card p-6 flex items-start gap-6 border-l-4" [class.border-l-[--primary]]="block.type === 'CREATE'" [class.border-l-blue-400]="block.type === 'TRANSFER'">
               <div class="p-3 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500">
                  <mat-icon>{{ block.type === 'CREATE' ? 'add_box' : 'swap_horiz' }}</mat-icon>
               </div>
               <div class="flex-1 space-y-2">
                  <div class="flex justify-between items-start">
                     <div>
                        <div class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bloc #{{ block.number }} — {{ block.type }}</div>
                        <div class="text-sm font-bold text-white">{{ block.details }}</div>
                     </div>
                     <div class="text-right">
                        <div class="text-[10px] text-slate-400">{{ (block.timestamp?.toDate ? block.timestamp.toDate() : block.timestamp) | date:'medium' }}</div>
                        <div class="text-[9px] font-mono text-[--primary]">{{ block.hash.substring(0, 16) }}...</div>
                     </div>
                  </div>
                  <div class="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px] text-slate-500">
                     Proof: {{ block.proof }}
                  </div>
               </div>
             </div>
           }
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class Registry implements OnInit {
  private fancierChain = inject(FancierChain);
  activeTab = signal<'list' | 'ledger'>('list');
  parcels = signal<Parcel[]>([]);
  ledgerBlocks = signal<LedgerBlock[]>([]);
  stats = signal<any>(null);

  ngOnInit() {
    this.loadParcels();
    this.loadLedger();
    this.loadStats();
  }

  async loadStats() {
    this.stats.set(await this.fancierChain.getDashboardStats());
  }

  async loadParcels(search?: string) {
    let data: any[] = [];
    if (search) {
      data = await this.fancierChain.findParcel(search);
    } else {
      // Use existing findParcel logic or a generalized list if needed
      // For now we use findParcel with empty to trigger defaults or we could add a listAll to service
      // Let's use a mock for the full list if firestore query fails or just fetch first 20
      const results = await this.fancierChain.findParcel(''); 
      data = results;
    }
    this.parcels.set(data as Parcel[]);
  }

  onSearch(event: any) {
    const term = event.target.value;
    this.loadParcels(term);
  }

  loadLedger() {
    this.ledgerBlocks.set([
      { number: 18429, type: 'CREATE', details: 'Enregistrement initial de la parcelle BZV-2024-8821', timestamp: new Date(), hash: '0x9f8b2c59fd26a806444b0e3c3e2a1b0c9f8b2c59', proof: 'af78...d892' },
      { number: 18428, type: 'TRANSFER', details: 'Transfert de propriété de BZV-2024-8712 vers Alphonse Mabiala', timestamp: new Date(Date.now() - 3600000), hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0', proof: 'ee21...c901' },
      { number: 18427, type: 'CREATE', details: 'Nouvelle parcelle enregistrée TAL-9941', timestamp: new Date(Date.now() - 7200000), hash: '0x7d8e9f0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', proof: 'cc45...a112' }
    ]);
  }
}

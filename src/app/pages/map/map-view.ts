import {ChangeDetectionStrategy, Component, ElementRef, ViewChild, signal, AfterViewInit, inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {FancierChain} from '../../services/fancier-chain';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const L: any;

interface ParcelData {
  parcelId: string;
  address: string;
  currentOwner: string;
  surface: number;
  usage: string;
  hash: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coordinates: any;
  status?: string;
  workflowStep?: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule, RouterLink],
  template: `
    <div class="h-full flex flex-col lg:flex-row gap-0 animate-fade-in text-white">
      
      <!-- Left Sidebar (Stats & Filters) -->
      <div class="w-full lg:w-80 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0 overflow-y-auto">
        <div class="p-6 space-y-8">
          
          <!-- Header -->
          <div class="flex items-center gap-3">
             <button routerLink="/home" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
               <mat-icon class="!text-sm">arrow_back</mat-icon>
             </button>
             <div>
               <h2 class="text-sm font-bold tracking-tight">Carte des Parcelles</h2>
               <p class="text-[9px] text-slate-500 uppercase tracking-widest">Brazzaville SIG — Vue Blockchain</p>
             </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 bg-white/5 border border-white/5 rounded-xl">
               <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Total</div>
               <div class="text-xl font-bold">{{ stats()?.total_parcels || 0 }}</div>
            </div>
            <div class="p-4 bg-[#10b98110] border border-[#10b98120] rounded-xl">
               <div class="text-[9px] text-[--primary] uppercase font-bold mb-1">Finalisés</div>
               <div class="text-xl font-bold text-[--primary]">{{ stats()?.finalized_parcels || 0 }}</div>
            </div>
            <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
               <div class="text-[9px] text-blue-400 uppercase font-bold mb-1">En cours</div>
               <div class="text-xl font-bold text-blue-400">{{ stats()?.draft_parcels || 0 }}</div>
            </div>
            <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
               <div class="text-[9px] text-amber-400 uppercase font-bold mb-1">Validés</div>
               <div class="text-xl font-bold text-amber-400">{{ stats()?.validated_parcels || 0 }}</div>
            </div>
          </div>

          <!-- Filters -->
          <div class="space-y-4">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recherche & Filtres</div>
            
            <div class="relative">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 !text-xs text-slate-500">search</mat-icon>
              <input type="text" placeholder="Rechercher par ID ou adresse..." (input)="onSearch($event)"
                     class="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-[--primary] transition-all">
            </div>

            <div class="space-y-2">
              <label for="type-select" class="text-[9px] text-slate-500 uppercase font-medium">Usage du sol</label>
              <select id="type-select" [(ngModel)]="filterType" (change)="applyFilters()"
                      class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[--primary] transition-all">
                <option value="Tous">Tous les usages</option>
                <option value="Résidentiel">Résidentiel</option>
                <option value="Commercial">Commercial</option>
                <option value="Agricole">Agricole</option>
              </select>
            </div>
          </div>

          <!-- Legend -->
          <div class="space-y-3 pt-4 border-t border-white/5">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Immuabilité (Légende)</div>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-[10px] text-slate-400">
                <div class="w-2 h-2 rounded-full bg-[--primary]"></div> Titre Foncier Finalisé
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400">
                <div class="w-2 h-2 rounded-full bg-blue-400"></div> Draft (Inscription)
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400">
                <div class="w-2 h-2 rounded-full bg-amber-400"></div> Validation Communautaire
              </div>
            </div>
          </div>

          <!-- List -->
          <div class="space-y-4 pt-4 border-t border-white/5">
             <div class="flex justify-between items-center">
               <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Résultats ({{ filteredParcels().length }})</div>
               <mat-icon class="!text-sm text-slate-500">list</mat-icon>
             </div>
             
             <div class="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar text-white">
                @for (p of filteredParcels(); track p.parcelId) {
                  <button (click)="selectParcel(p)" 
                          [class.border-[--primary]]="selectedParcel()?.parcelId === p.parcelId"
                          [class.bg-[#10b98105]]="selectedParcel()?.parcelId === p.parcelId"
                          class="w-full p-3 rounded-xl border border-white/5 text-left hover:bg-white/5 transition-all group">
                    <div class="flex justify-between items-start mb-1">
                      <div class="text-[10px] font-bold text-white group-hover:text-[--primary]">{{ p.parcelId }}</div>
                      <div class="h-1.5 w-1.5 rounded-full" 
                           [class.bg-[--primary]]="p.status === 'FINALIZED'" 
                           [class.bg-blue-500]="p.status === 'DRAFT'" 
                           [class.bg-amber-500]="p.status === 'COMMUNITY_VALIDATED'"></div>
                    </div>
                    <div class="text-[9px] text-slate-500">{{ p.address }} — {{ p.surface }} m²</div>
                  </button>
                }
             </div>
          </div>

        </div>
      </div>

      <!-- Map Container -->
      <div class="flex-1 relative overflow-hidden bg-[#1a1c1e]">
        <div #mapContainer class="h-full w-full grayscale contrast-125 invert-[0.1]"></div>
        
        <!-- Map Overlay Header -->
        <div class="absolute top-6 left-6 right-6 z-[1000] flex justify-between items-center pointer-events-none">
           <div class="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 pointer-events-auto">
             <div class="flex items-center gap-2">
               <div class="h-1.5 w-1.5 rounded-full bg-[--primary] animate-pulse"></div>
               <span class="text-[9px] font-bold text-white uppercase tracking-widest">SIG Hyperledger Fabric On-chain</span>
             </div>
           </div>
           
           <button routerLink="/portal" class="bg-[--primary] hover:bg-[--primary-hover] text-white px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 transition-all shadow-xl pointer-events-auto">
             <mat-icon class="!text-sm">verified_user</mat-icon>
             Vérifier un Titre
           </button>
        </div>

        <!-- Selection Overlay -->
        @if (selectedParcel()) {
           <div class="absolute bottom-6 left-6 right-6 lg:left-auto lg:w-80 lg:right-6 z-[1000] animate-fade-in">
             <div class="glass-card p-6 border-l-4 border-l-[--primary] shadow-2xl relative">
                <button (click)="selectedParcel.set(null)" class="absolute top-4 right-4 text-slate-500 hover:text-white">
                  <mat-icon class="!text-sm">close</mat-icon>
                </button>
                
                <div class="text-[9px] font-bold text-[--primary] uppercase tracking-widest mb-2">Détails de la Parcelle</div>
                <h3 class="text-lg font-bold text-white mb-4">{{ selectedParcel()?.parcelId }}</h3>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Surface</div>
                    <div class="text-xs text-white">{{ selectedParcel()?.surface }} m²</div>
                  </div>
                  <div>
                    <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Usage</div>
                    <div class="text-xs text-white">{{ selectedParcel()?.usage }}</div>
                  </div>
                  <div class="col-span-2">
                    <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Propriétaire</div>
                    <div class="text-xs text-white font-semibold">{{ selectedParcel()?.currentOwner }}</div>
                  </div>
                </div>

                <div class="p-3 bg-black/40 border border-white/5 rounded-xl mb-4">
                  <div class="text-[8px] font-mono text-slate-500 break-all leading-tight">
                    Merkle Root: {{ selectedParcel()?.hash }}
                  </div>
                </div>

                <button class="w-full bg-[--primary]/10 hover:bg-[--primary]/20 text-[--primary] py-3 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 border border-[--primary]/20 transition-all" (click)="viewHistory()">
                   <mat-icon class="!text-sm">account_balance_wallet</mat-icon>
                   Consulter le Ledger Public
                </button>
             </div>
           </div>
        }
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 64px); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
  `]
})
export class MapView implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private fancierChain = inject(FancierChain);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layers: any[] = [];
  
  selectedParcel = signal<ParcelData | null>(null);
  parcels = signal<ParcelData[]>([]);
  filteredParcels = signal<ParcelData[]>([]);
  stats = signal<any>(null);

  filterType = 'Tous';
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      await this.loadStats();
      await this.loadParcels();
    }
  }

  async loadStats() {
    this.stats.set(await this.fancierChain.getDashboardStats());
  }

  initMap() {
    const brazzaville: [number, number] = [-4.2634, 15.2832];
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false
    }).setView(brazzaville, 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
  }

  async loadParcels(search?: string) {
    try {
      const results = await this.fancierChain.getMapData();
      let data = results.map((r: any) => ({
        parcelId: r.parcelId,
        address: r.address,
        currentOwner: r.currentOwner,
        surface: r.surface,
        usage: r.usage,
        hash: r.hash,
        coordinates: r.coordinates,
        status: r.status,
        workflowStep: r.workflowStep
      } as ParcelData));

      if (search) {
        const searchTerm = search.toLowerCase();
        data = data.filter(p => 
          p.parcelId.toLowerCase().includes(searchTerm) || 
          p.address.toLowerCase().includes(searchTerm)
        );
      }
      
      this.parcels.set(data);
      this.applyFilters();
    } catch (error) {
      console.error("Error loading parcels:", error);
    }
  }

  onSearch(event: any) {
    const term = event.target.value;
    this.loadParcels(term);
  }

  applyFilters() {
    const filtered = this.parcels().filter(p => {
      const matchType = this.filterType === 'Tous' || p.usage === this.filterType;
      return matchType;
    });
    
    this.filteredParcels.set(filtered);
    this.renderParcels();
  }

  renderParcels() {
    this.layers.forEach(layer => this.map.removeLayer(layer));
    this.layers = [];

    this.filteredParcels().forEach(parcel => {
      if (parcel.coordinates && parcel.coordinates.length >= 3) {
        let color = '#10b981'; // FINALIZED
        if (parcel.status === 'DRAFT') color = '#60a5fa';
        if (parcel.status === 'COMMUNITY_VALIDATED') color = '#f59e0b';
        
        const polygon = L.polygon(parcel.coordinates, {
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          weight: 1.5,
          className: 'parcel-polygon cursor-pointer'
        }).addTo(this.map);

        polygon.on('click', () => {
          this.selectedParcel.set(parcel);
        });

        this.layers.push(polygon);
      }
    });

    if (this.layers.length > 0) {
      const group = L.featureGroup(this.layers);
      this.map.fitBounds(group.getBounds(), { padding: [40, 40] });
    }
  }

  selectParcel(p: ParcelData) {
    this.selectedParcel.set(p);
    if (p.coordinates && p.coordinates.length > 0) {
      this.map.setView(p.coordinates[0], 16);
    }
  }

  viewHistory() {
    if (this.selectedParcel()) {
      this.router.navigate(['/portal'], { queryParams: { id: this.selectedParcel()?.parcelId } });
    }
  }
}

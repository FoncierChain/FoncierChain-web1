import {ChangeDetectionStrategy, Component, ElementRef, ViewChild, signal, AfterViewInit, inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {collection, getDocs, QueryDocumentSnapshot} from 'firebase/firestore';
import {db} from '../../firebase';

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
             <button routerLink="/parcels" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
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
               <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Parcelles</div>
               <div class="text-xl font-bold">12</div>
            </div>
            <div class="p-4 bg-[#10b98110] border border-[#10b98120] rounded-xl">
               <div class="text-[9px] text-[--primary] uppercase font-bold mb-1">Confirmées</div>
               <div class="text-xl font-bold text-[--primary]">9</div>
            </div>
            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
               <div class="text-[9px] text-red-400 uppercase font-bold mb-1">Litiges</div>
               <div class="text-xl font-bold text-red-400">2</div>
            </div>
            <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
               <div class="text-[9px] text-amber-400 uppercase font-bold mb-1">En Attente</div>
               <div class="text-xl font-bold text-amber-400">1</div>
            </div>
          </div>

          <!-- Filters -->
          <div class="space-y-4">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filtres</div>
            
            <div class="space-y-2">
              <label for="district-select" class="text-[9px] text-slate-500 uppercase font-medium">District</label>
              <select id="district-select" [(ngModel)]="filterDistrict" (change)="applyFilters()" 
                      class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[--primary] transition-all">
                <option value="Tous">Tous</option>
                <option value="Bacongo">Bacongo</option>
                <option value="Poto-Poto">Poto-Poto</option>
                <option value="Moungali">Moungali</option>
                <option value="Talangaï">Talangaï</option>
              </select>
            </div>

            <div class="space-y-2">
              <label for="type-select" class="text-[9px] text-slate-500 uppercase font-medium">Type</label>
              <select id="type-select" [(ngModel)]="filterType" (change)="applyFilters()"
                      class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-[--primary] transition-all">
                <option value="Tous">Tous</option>
                <option value="Résidentiel">Résidentiel</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixte">Mixte</option>
              </select>
            </div>

            <div class="space-y-2">
              <div class="text-[9px] text-slate-500 uppercase font-medium">Statut</div>
              <div class="flex flex-wrap gap-2">
                 @for (s of ['Tous', 'Confirmé', 'Litige', 'En Attente']; track s) {
                   <button (click)="filterStatus = s; applyFilters()" 
                           [class.bg-[--primary]]="filterStatus === s"
                           [class.text-white]="filterStatus === s"
                           [class.bg-white/5]="filterStatus !== s"
                           [class.text-slate-400]="filterStatus !== s"
                           class="px-3 py-1 rounded-full text-[9px] font-bold transition-all border border-white/5">
                     {{ s }}
                   </button>
                 }
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="space-y-3 pt-4 border-t border-white/5">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Légende</div>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-[10px] text-slate-400">
                <div class="w-2 h-2 rounded-full bg-[--primary]"></div> Confirmé
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400">
                <div class="w-2 h-2 rounded-full bg-red-400"></div> Litige
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400">
                <div class="w-2 h-2 rounded-full bg-amber-400"></div> En Attente
              </div>
            </div>
          </div>

          <!-- List -->
          <div class="space-y-4 pt-4 border-t border-white/5">
             <div class="flex justify-between items-center">
               <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Liste des Parcelles ({{ filteredParcels().length }})</div>
               <mat-icon class="!text-sm text-slate-500">list</mat-icon>
             </div>
             
             <div class="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                @for (p of filteredParcels(); track p.parcelId) {
                  <button (click)="selectParcel(p)" 
                          [class.border-[--primary]]="selectedParcel()?.parcelId === p.parcelId"
                          [class.bg-[#10b98105]]="selectedParcel()?.parcelId === p.parcelId"
                          class="w-full p-3 rounded-xl border border-white/5 text-left hover:bg-white/5 transition-all group">
                    <div class="flex justify-between items-start mb-1">
                      <div class="text-[10px] font-bold text-white group-hover:text-[--primary]">{{ p.parcelId }}</div>
                      <div class="h-1.5 w-1.5 rounded-full" [class.bg-[--primary]]="p.status === 'Sécurisé'" [class.bg-red-500]="p.status === 'Litige'" [class.bg-amber-500]="p.status === 'En attente'"></div>
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
               <span class="text-[9px] font-bold text-white uppercase tracking-widest">Mainnet Opérationnel</span>
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
                
                <div class="text-[9px] font-bold text-[--primary] uppercase tracking-widest mb-2">Parcelle Sélectionnée</div>
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
                    {{ selectedParcel()?.hash }}
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layers: any[] = [];
  
  selectedParcel = signal<ParcelData | null>(null);
  parcels = signal<ParcelData[]>([]);
  filteredParcels = signal<ParcelData[]>([]);

  filterDistrict = 'Tous';
  filterType = 'Tous';
  filterStatus = 'Tous';

  private platformId = inject(PLATFORM_ID);

  private router = inject(Router);

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.loadParcels();
    }
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

  async loadParcels() {
    try {
      const querySnapshot = await getDocs(collection(db, 'parcels'));
      let parcelData = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as ParcelData);
      
      if (parcelData.length === 0) {
        parcelData = this.getMockParcels();
      }
      
      this.parcels.set(parcelData);
      this.applyFilters();
    } catch (error) {
      console.error("Error loading parcels:", error);
      const mocks = this.getMockParcels();
      this.parcels.set(mocks);
      this.applyFilters();
    }
  }

  getMockParcels(): ParcelData[] {
    return [
      {
        parcelId: 'BZV-2024-8821',
        address: 'Bacongo, Rue 12',
        currentOwner: 'Jean-Baptiste Mouakala',
        surface: 420,
        usage: 'Résidentiel',
        hash: '0x9f8b...3c2a1',
        coordinates: [[-4.275, 15.280], [-4.275, 15.285], [-4.280, 15.285], [-4.280, 15.280]],
        status: 'Sécurisé'
      },
      {
        parcelId: 'MADIBOU-482',
        address: 'Madibou, Secteur 4',
        currentOwner: 'Prosper Kiminou',
        surface: 680,
        usage: 'Mixte',
        hash: '0x1a2b...f2e1c',
        coordinates: [[-4.285, 15.275], [-4.285, 15.280], [-4.290, 15.280], [-4.290, 15.275]],
        status: 'Litige'
      },
      {
        parcelId: 'TAL-9941',
        address: 'Talangaï, Avenue de la Paix',
        currentOwner: 'Marie-Claire Ngoma',
        surface: 550,
        usage: 'Commercial',
        hash: '0x7d8e...z6a7b',
        coordinates: [[-4.240, 15.295], [-4.240, 15.300], [-4.245, 15.300], [-4.245, 15.295]],
        status: 'En attente'
      }
    ];
  }

  applyFilters() {
    const filtered = this.parcels().filter(p => {
      const matchDistrict = this.filterDistrict === 'Tous' || p.address.includes(this.filterDistrict);
      const matchType = this.filterType === 'Tous' || p.usage === this.filterType;
      const matchStatus = this.filterStatus === 'Tous' || 
                        (this.filterStatus === 'Confirmé' && p.status === 'Sécurisé') ||
                        (this.filterStatus === 'Litige' && p.status === 'Litige') ||
                        (this.filterStatus === 'En Attente' && p.status === 'En attente');
      return matchDistrict && matchType && matchStatus;
    });
    
    this.filteredParcels.set(filtered);
    this.renderParcels();
  }

  renderParcels() {
    // Clear previous layers
    this.layers.forEach(layer => this.map.removeLayer(layer));
    this.layers = [];

    this.filteredParcels().forEach(parcel => {
      if (parcel.coordinates && parcel.coordinates.length >= 3) {
        let color = '#10b981'; // Confirmé
        if (parcel.status === 'Litige') color = '#ef4444';
        if (parcel.status === 'En attente') color = '#f59e0b';
        
        const polygon = L.polygon(parcel.coordinates, {
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          weight: 1.5,
          className: 'parcel-polygon'
        }).addTo(this.map);

        polygon.on('click', () => {
          this.selectedParcel.set(parcel);
        });

        this.layers.push(polygon);
      }
    });

    if (this.layers.length > 0) {
      const group = L.featureGroup(this.layers);
      this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
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

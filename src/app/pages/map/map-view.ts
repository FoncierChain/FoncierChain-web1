import {ChangeDetectionStrategy, Component, ElementRef, ViewChild, signal, AfterViewInit, inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
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
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="h-full flex flex-col lg:flex-row gap-4 lg:gap-8">
      <!-- Map Container -->
      <div class="flex-1 sleek-card !p-0 overflow-hidden relative min-h-[400px]">
        <div class="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-lg border border-border-color shadow-sm">
          <div class="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Vue Cartographique</div>
          <div class="text-sm font-bold text-sidebar-bg">Brazzaville Centre</div>
        </div>
        
        <div #mapContainer class="h-full w-full"></div>

        <!-- Legend -->
        <div class="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur p-3 lg:p-4 rounded-xl border border-border-color shadow-sm space-y-2">
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-congo-green/40 border border-congo-green"></span>
            <span class="text-[10px] lg:text-xs font-semibold">Sécurisé AfriChain solutions</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-congo-red/40 border border-congo-red"></span>
            <span class="text-[10px] lg:text-xs font-semibold">En cours de validation</span>
          </div>
        </div>
      </div>

      <!-- Sidebar Details -->
      <div class="w-full lg:w-80 flex flex-col gap-4 lg:gap-6">
        @if (selectedParcel()) {
          <div class="sleek-card space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 lg:slide-in-from-right-4 duration-300">
            <div class="sleek-card-header">
              <span class="sleek-card-title">Détails de la Sélection</span>
              <button (click)="selectedParcel.set(null)" class="text-text-muted hover:text-congo-red">
                <mat-icon class="!text-lg">close</mat-icon>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div class="space-y-4">
                <div>
                  <span class="text-[10px] uppercase text-text-muted font-bold block mb-1">ID Parcelle</span>
                  <div class="text-base lg:text-lg font-bold text-sidebar-bg">{{selectedParcel()?.parcelId}}</div>
                </div>
                <div>
                  <span class="text-[10px] uppercase text-text-muted font-bold block mb-1">Propriétaire</span>
                  <div class="text-sm font-semibold">{{selectedParcel()?.currentOwner}}</div>
                </div>
              </div>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="text-[10px] uppercase text-text-muted font-bold block mb-1">Surface</span>
                    <div class="text-xs">{{selectedParcel()?.surface}} m²</div>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase text-text-muted font-bold block mb-1">Usage</span>
                    <div class="text-xs">{{selectedParcel()?.usage}}</div>
                  </div>
                </div>
                <div>
                  <span class="text-[10px] uppercase text-text-muted font-bold block mb-1">Adresse</span>
                  <div class="text-xs text-text-muted">{{selectedParcel()?.address}}</div>
                </div>
              </div>
            </div>

            <div class="pt-4 lg:pt-6 border-t border-border-color">
              <button class="sleek-btn-primary w-full h-10 flex items-center justify-center gap-2" 
                      (click)="viewHistory()">
                <mat-icon class="!text-sm">history</mat-icon>
                Voir l'Historique
              </button>
            </div>
          </div>
        } @else {
          <div class="sleek-card flex-1 flex flex-col items-center justify-center text-center p-6 lg:p-8">
            <div class="h-12 w-12 lg:h-16 lg:w-16 rounded-2xl bg-bg-light flex items-center justify-center text-text-muted mb-4">
              <mat-icon class="!text-2xl lg:!text-3xl">touch_app</mat-icon>
            </div>
            <h3 class="font-bold text-sidebar-bg mb-2">Sélectionnez une parcelle</h3>
            <p class="text-[11px] lg:text-xs text-text-muted">Cliquez sur une zone colorée de la carte pour consulter les informations certifiées.</p>
          </div>
        }

        <div class="sleek-card !bg-sidebar-bg !text-white hidden sm:block">
          <div class="text-[10px] font-bold text-congo-yellow uppercase tracking-widest mb-2">Aide à la navigation</div>
          <p class="text-[11px] opacity-70 leading-relaxed">
            Les zones vertes indiquent des titres fonciers validés par le protocole AfriChain solutions. 
            Les zones rouges signalent des parcelles avec des transactions en attente de validation.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 100px); }
    @media (min-width: 1024px) {
      :host { height: calc(100vh - 128px); }
    }
  `]
})
export class MapView implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any;
  selectedParcel = signal<ParcelData | null>(null);
  parcels = signal<ParcelData[]>([]);

  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.loadParcels();
    }
  }

  initMap() {
    // Brazzaville coordinates
    const brazzaville: [number, number] = [-4.2634, 15.2832];
    
    this.map = L.map(this.mapContainer.nativeElement).setView(brazzaville, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  async loadParcels() {
    try {
      const querySnapshot = await getDocs(collection(db, 'parcels'));
      const parcelData = querySnapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as ParcelData);
      
      if (parcelData.length === 0) {
        // Add mock data if empty
        this.addMockParcels();
      } else {
        this.parcels.set(parcelData);
        this.renderParcels();
      }
    } catch (error) {
      console.error("Error loading parcels:", error);
      this.addMockParcels(); // Fallback to mock
    }
  }

  addMockParcels() {
    const mocks: ParcelData[] = [
      {
        parcelId: 'BZV-POTO-001',
        address: 'Poto-Poto, Rue 42, Brazzaville',
        currentOwner: 'Jean-Paul Makosso',
        surface: 450,
        usage: 'Résidentiel',
        hash: '0x9f8b2c59fd26a806444b0e3c3e2a1b0c9f8b2c59fd26a806444b0e3c3e2a1b0c',
        coordinates: [[-4.265, 15.280], [-4.265, 15.285], [-4.270, 15.285], [-4.270, 15.280]],
        status: 'Sécurisé'
      },
      {
        parcelId: 'BZV-BAC-002',
        address: 'Bacongo, Avenue de la Paix, Brazzaville',
        currentOwner: 'Marie-Louise Ngalula',
        surface: 1200,
        usage: 'Commercial',
        hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
        coordinates: [[-4.255, 15.290], [-4.255, 15.295], [-4.260, 15.295], [-4.260, 15.290]],
        status: 'Sécurisé'
      },
      {
        parcelId: 'BZV-OUEN-003',
        address: 'Ouenzé, Rue Itoumbi, Brazzaville',
        currentOwner: 'Alphonse Mabiala',
        surface: 300,
        usage: 'Résidentiel',
        hash: '0x7d8e9f0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c',
        coordinates: [[-4.250, 15.275], [-4.250, 15.280], [-4.255, 15.280], [-4.255, 15.275]],
        status: 'En attente'
      },
      {
        parcelId: 'BZV-TAL-004',
        address: 'Talangaï, Rue Mbochis, Brazzaville',
        currentOwner: 'Clémentine Okemba',
        surface: 600,
        usage: 'Mixte',
        hash: '0x3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0a1b2c3d4e',
        coordinates: [[-4.240, 15.295], [-4.240, 15.300], [-4.245, 15.300], [-4.245, 15.295]],
        status: 'Sécurisé'
      },
      {
        parcelId: 'BZV-CENT-005',
        address: 'Centre-Ville, Avenue Amilcar Cabral, Brazzaville',
        currentOwner: 'Société Immobilière du Congo',
        surface: 2500,
        usage: 'Bureaux',
        hash: '0x1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0a1b2c3d4e5f6g7h8i9j0k1l2m',
        coordinates: [[-4.268, 15.270], [-4.268, 15.275], [-4.273, 15.275], [-4.273, 15.270]],
        status: 'Sécurisé'
      }
    ];
    this.parcels.set(mocks);
    this.renderParcels();
  }

  renderParcels() {
    this.parcels().forEach(parcel => {
      if (parcel.coordinates && parcel.coordinates.length >= 3) {
        const isPending = parcel.status === 'En attente';
        const color = isPending ? '#E11D48' : '#009543';
        
        const polygon = L.polygon(parcel.coordinates, {
          color: color,
          fillColor: color,
          fillOpacity: 0.4,
          weight: 2
        }).addTo(this.map);

        polygon.on('click', () => {
          this.selectedParcel.set(parcel);
        });
      }
    });
  }

  viewHistory() {
    if (this.selectedParcel()) {
      window.location.href = `/portal?id=${this.selectedParcel()?.parcelId}`;
    }
  }
}

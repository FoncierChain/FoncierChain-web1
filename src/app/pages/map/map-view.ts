import {ChangeDetectionStrategy, Component, ElementRef, ViewChild, signal, AfterViewInit} from '@angular/core';
import {CommonModule} from '@angular/common';
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
    <div class="h-full flex gap-8">
      <!-- Map Container -->
      <div class="flex-1 sleek-card !p-0 overflow-hidden relative">
        <div class="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-lg border border-border-color shadow-sm">
          <div class="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Vue Cartographique</div>
          <div class="text-sm font-bold text-sidebar-bg">Brazzaville Centre</div>
        </div>
        
        <div #mapContainer class="h-full w-full"></div>

        <!-- Legend -->
        <div class="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur p-4 rounded-xl border border-border-color shadow-sm space-y-2">
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-congo-green/40 border border-congo-green"></span>
            <span class="text-xs font-semibold">Sécurisé FoncierChain</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-congo-red/40 border border-congo-red"></span>
            <span class="text-xs font-semibold">En cours de validation</span>
          </div>
        </div>
      </div>

      <!-- Sidebar Details -->
      <div class="w-80 flex flex-col gap-6">
        @if (selectedParcel()) {
          <div class="sleek-card space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div class="sleek-card-header">
              <span class="sleek-card-title">Détails de la Sélection</span>
              <button (click)="selectedParcel.set(null)" class="text-text-muted hover:text-congo-red">
                <mat-icon class="!text-lg">close</mat-icon>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <span class="text-[10px] uppercase text-text-muted font-bold block mb-1">ID Parcelle</span>
                <div class="text-lg font-bold text-sidebar-bg">{{selectedParcel()?.parcelId}}</div>
              </div>
              <div>
                <span class="text-[10px] uppercase text-text-muted font-bold block mb-1">Propriétaire</span>
                <div class="text-sm font-semibold">{{selectedParcel()?.currentOwner}}</div>
              </div>
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

            <div class="pt-6 border-t border-border-color">
              <button class="sleek-btn-primary w-full h-10 flex items-center justify-center gap-2" 
                      (click)="viewHistory()">
                <mat-icon class="!text-sm">history</mat-icon>
                Voir l'Historique
              </button>
            </div>
          </div>
        } @else {
          <div class="sleek-card flex-1 flex flex-col items-center justify-center text-center p-8">
            <div class="h-16 w-16 rounded-2xl bg-bg-light flex items-center justify-center text-text-muted mb-4">
              <mat-icon class="!text-3xl">touch_app</mat-icon>
            </div>
            <h3 class="font-bold text-sidebar-bg mb-2">Sélectionnez une parcelle</h3>
            <p class="text-xs text-text-muted">Cliquez sur une zone colorée de la carte pour consulter les informations certifiées.</p>
          </div>
        }

        <div class="sleek-card !bg-sidebar-bg !text-white">
          <div class="text-[10px] font-bold text-congo-yellow uppercase tracking-widest mb-2">Aide à la navigation</div>
          <p class="text-[11px] opacity-70 leading-relaxed">
            Les zones vertes indiquent des titres fonciers validés par le protocole FoncierChain. 
            Les zones rouges signalent des parcelles avec des transactions en attente de validation.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 128px); }
  `]
})
export class MapView implements AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: any;
  selectedParcel = signal<ParcelData | null>(null);
  parcels = signal<ParcelData[]>([]);

  ngAfterViewInit() {
    this.initMap();
    this.loadParcels();
  }

  initMap() {
    // Brazzaville coordinates
    const brazzaville: [number, number] = [-4.2634, 15.2832];
    
    this.map = L.map(this.mapContainer.nativeElement).setView(brazzaville, 13);

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
        parcelId: 'BZV-45785-SECURE',
        address: 'Poto-Poto, Rue 42, Brazzaville',
        currentOwner: 'Jean Dupont',
        surface: 450,
        usage: 'Residential',
        hash: '0x9f8b2c59fd26a806444b0e3c3e2a1b0c9f8b2c59fd26a806444b0e3c3e2a1b0c',
        coordinates: [[-4.265, 15.280], [-4.265, 15.285], [-4.270, 15.285], [-4.270, 15.280]]
      },
      {
        parcelId: 'BZV-99210-SECURE',
        address: 'Bacongo, Avenue de la Paix, Brazzaville',
        currentOwner: 'Marie Curie',
        surface: 1200,
        usage: 'Commercial',
        hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f',
        coordinates: [[-4.255, 15.290], [-4.255, 15.295], [-4.260, 15.295], [-4.260, 15.290]]
      }
    ];
    this.parcels.set(mocks);
    this.renderParcels();
  }

  renderParcels() {
    this.parcels().forEach(parcel => {
      if (parcel.coordinates && parcel.coordinates.length >= 3) {
        const polygon = L.polygon(parcel.coordinates, {
          color: '#009543',
          fillColor: '#009543',
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
    // Navigate to portal with parcelId
    if (this.selectedParcel()) {
      window.location.href = `/portal?id=${this.selectedParcel()?.parcelId}`;
    }
  }
}

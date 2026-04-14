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
    <div class="space-y-8">
      <!-- Search Header -->
      <div class="sleek-card">
        <div class="sleek-card-header !mb-6">
          <span class="sleek-card-title">Vérification de Titre Foncier</span>
          <div class="flex items-center gap-2 text-[10px] font-bold text-congo-green uppercase tracking-widest">
            <span class="h-2 w-2 rounded-full bg-congo-green"></span>
            Accès Public Ouvert
          </div>
        </div>
        
        <div class="sleek-search-container">
          <input type="text" [(ngModel)]="searchQuery" 
                 placeholder="Entrez l'ID de la parcelle (ex: BZV-45785-SECURE) ou l'adresse..."
                 class="flex-1 bg-transparent border-none outline-none text-sm"
                 (keyup.enter)="search()">
          <button class="sleek-btn-primary h-10" (click)="search()" [disabled]="loading()">
            @if (loading()) {
              <mat-icon class="animate-spin !text-sm">sync</mat-icon>
            } @else {
              Vérifier le Titre
            }
          </button>
        </div>
        <p class="mt-4 text-[11px] text-text-muted italic">
          * La base de données est mise à jour en temps réel par les agents certifiés du cadastre.
        </p>
      </div>

      @if (parcel()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Parcel Details -->
          <div class="lg:col-span-1 space-y-6">
            <div class="sleek-card !bg-sidebar-bg !text-white">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <div class="text-[10px] font-bold text-congo-yellow uppercase tracking-widest mb-1">Certificat Numérique</div>
                  <h2 class="text-xl font-bold">{{parcel()?.parcelId}}</h2>
                </div>
                <mat-icon class="text-congo-green">verified</mat-icon>
              </div>

              <div class="space-y-4">
                <div>
                  <span class="text-[10px] uppercase text-white/50 font-bold block mb-1">Propriétaire Actuel</span>
                  <div class="text-lg font-semibold">{{parcel()?.currentOwner}}</div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="text-[10px] uppercase text-white/50 font-bold block mb-1">Surface</span>
                    <div class="text-sm">{{parcel()?.surface}} m²</div>
                  </div>
                  <div>
                    <span class="text-[10px] uppercase text-white/50 font-bold block mb-1">Usage</span>
                    <div class="text-sm">{{parcel()?.usage}}</div>
                  </div>
                </div>
                <div>
                  <span class="text-[10px] uppercase text-white/50 font-bold block mb-1">Adresse</span>
                  <div class="text-sm">{{parcel()?.address}}</div>
                </div>
              </div>

              <div class="mt-8 pt-6 border-t border-white/10">
                <div class="text-[10px] uppercase text-white/50 font-bold mb-2">Empreinte Blockchain</div>
                <div class="font-mono text-[10px] break-all opacity-70">{{parcel()?.hash}}</div>
              </div>
            </div>

            <div class="sleek-card !bg-congo-green !text-white">
              <div class="flex items-center gap-3 mb-2">
                <mat-icon>security</mat-icon>
                <span class="font-bold">Statut: {{parcel()?.status}}</span>
              </div>
              <p class="text-xs opacity-90">Cette parcelle a été validée numériquement et son titre est protégé contre toute modification non autorisée.</p>
            </div>
          </div>

          <!-- Transaction History -->
          <div class="lg:col-span-2">
            <div class="sleek-card h-full">
              <div class="sleek-card-header">
                <span class="sleek-card-title">Historique Immuable des Transactions</span>
                <mat-icon class="text-text-muted">history</mat-icon>
              </div>

              <div class="overflow-x-auto">
                <table class="sleek-data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Nouveau Propriétaire</th>
                      <th>Date</th>
                      <th>Agent</th>
                      <th>Preuve</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (tx of history(); track tx.hash) {
                      <tr>
                        <td>
                          <span class="sleek-status-badge">{{tx.type}}</span>
                        </td>
                        <td class="font-semibold">{{tx.newOwner}}</td>
                        <td class="text-text-muted">{{tx.date?.toDate() | date:'shortDate'}}</td>
                        <td class="text-xs">{{tx.agentUid?.substring(0, 8)}}...</td>
                        <td>
                          <mat-icon class="text-congo-green !text-sm" title="Vérifié">lock</mat-icon>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="text-center py-8 text-text-muted italic">Aucun historique disponible.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      } @else if (searched() && !loading()) {
        <div class="sleek-card text-center py-16">
          <mat-icon class="!text-6xl text-congo-red/20 mb-4">location_off</mat-icon>
          <h2 class="text-xl font-bold text-sidebar-bg">Aucune parcelle trouvée</h2>
          <p class="text-text-muted">L'identifiant ou l'adresse ne correspond à aucun enregistrement certifié.</p>
        </div>
      }
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

import {ChangeDetectionStrategy, Component, signal, inject, OnInit, ViewChild, ElementRef, PLATFORM_ID, effect} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
// import {doc, setDoc, collection, addDoc, serverTimestamp} from 'firebase/firestore';
import {auth} from '../../firebase';
import {User, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';
import {Router} from '@angular/router';
import {FancierChain, LandRecord} from '../../services/fancier-chain';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const L: any;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-register-parcel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatInputModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="animate-fade-in max-w-6xl mx-auto py-8">
      @if (!user()) {
        <!-- Agent Login Screen -->
        <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <div class="glass-card max-w-md w-full overflow-hidden shadow-2xl">
            <div class="bg-black/40 px-6 py-4 flex items-center justify-between border-b border-white/5">
              <div class="flex gap-2">
                <div class="h-2.5 w-2.5 rounded-full bg-red-500/50"></div>
                <div class="h-2.5 w-2.5 rounded-full bg-yellow-500/50"></div>
                <div class="h-2.5 w-2.5 rounded-full bg-green-500/50"></div>
              </div>
              <div class="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Portail Sécurisé</div>
            </div>
            
            <div class="p-10 space-y-8">
              <div class="text-center space-y-6">
                <div class="flex justify-center">
                   <div class="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center">
                     <mat-icon class="text-[--primary]">verified_user</mat-icon>
                   </div>
                </div>
                <div class="space-y-1">
                  <div class="text-[10px] font-bold text-[--primary] uppercase tracking-widest">Authentification Agent</div>
                  <h2 class="text-xl font-bold text-[--text-primary]">Registre Foncier National</h2>
                  <p class="text-xs text-[--text-secondary]">Plateforme sécurisée — Accès réservé aux agents certifiés.</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <label for="agentId" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Matricule Agent</label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-[--primary] transition-colors">
                      <mat-icon class="!text-lg">badge</mat-icon>
                    </div>
                    <input id="agentId" type="text" placeholder="AGT-BZV-2024-XXXX" 
                           [ngModel]="adminId()" (ngModelChange)="adminId.set($event)"
                           class="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white text-sm outline-none focus:border-[--primary] transition-all">
                  </div>
                </div>

                <div class="space-y-2">
                  <label for="agentPass" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Mot de passe</label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-[--primary] transition-colors">
                      <mat-icon class="!text-lg">lock</mat-icon>
                    </div>
                    <input id="agentPass" type="password" placeholder="••••••••••••" 
                           [ngModel]="adminPass()" (ngModelChange)="adminPass.set($event)"
                           class="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white text-sm outline-none focus:border-[--primary] transition-all">
                  </div>
                </div>
              </div>

              <div class="space-y-4 pt-2">
                @if (adminId() && adminPass()) {
                  <button class="w-full bg-[--primary] hover:bg-[--primary-hover] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                          (click)="apiLogin()" [disabled]="loading()">
                     @if (loading()) {
                       <mat-icon class="animate-spin !text-lg">sync</mat-icon>
                     } @else {
                       <mat-icon>vpn_key</mat-icon>
                       SE CONNECTER AU BACKEND
                     }
                  </button>
                } @else {
                  <button class="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all" 
                          (click)="login()" [disabled]="loading()">
                     @if (loading()) {
                       <mat-icon class="animate-spin !text-lg">sync</mat-icon>
                     } @else {
                       <mat-icon>login</mat-icon>
                       Se connecter avec Google
                     }
                  </button>
                }
                <button class="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition-all border border-white/10" 
                        (click)="demoLogin()" [disabled]="loading()">
                   <mat-icon class="!text-sm">verified</mat-icon>
                   Accès Agent Démo
                </button>
                <div class="text-center">
                  <a href="#" class="text-[10px] text-slate-500 hover:text-[--primary] transition-colors">Problèmes de connexion ? Contactez le support IT.</a>
                </div>
              </div>
            </div>

            <div class="bg-white/5 p-4 text-center border-t border-white/5">
              <div class="flex items-center justify-center gap-6 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                 <div class="flex items-center gap-2">
                   <mat-icon class="!text-[10px]">lock</mat-icon>
                   TLS 1.3
                 </div>
                 <div class="flex items-center gap-2">
                   <mat-icon class="!text-[10px]">fact_check</mat-icon>
                   2FA ACTIVÉE
                 </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Registration Form -->
        <div class="space-y-8">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div class="space-y-1">
              <div class="text-[10px] font-bold text-[--primary] uppercase tracking-widest">Opération de Cadastre (Brazzaville)</div>
              <h2 class="text-3xl font-bold text-white tracking-tight">Nouvel Enregistrement</h2>
              <p class="text-sm text-slate-500">Insertion d'une nouvelle parcelle dans le ledger Hyperledger Fabric.</p>
            </div>
            
            <div class="flex gap-3 w-full md:w-auto">
               <button class="flex-1 md:flex-none bg-[--primary] hover:bg-[--primary-hover] text-white px-8 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xl shadow-[--primary]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                       (click)="onSubmit()" [disabled]="parcelForm.invalid || loading()">
                 @if (loading()) {
                   <mat-icon class="animate-spin !text-sm">sync</mat-icon>
                   Démarrage Etape 1...
                 } @else {
                   <mat-icon class="!text-sm">add_task</mat-icon>
                   INITIER LE DRAFT (ETAPE 1)
                 }
               </button>
               <button class="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xl shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                       (click)="demoDoubleAttribution()" type="button">
                 <mat-icon class="!text-sm">gavel</mat-icon>
                 DÉMO DOUBLE ATTRIBUTION
               </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Form -->
            <div class="lg:col-span-2 space-y-8">
              <div class="glass-card p-8 md:p-10 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                <form [formGroup]="parcelForm" class="space-y-10">
                  
                  <div class="space-y-6">
                    <h3 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3">
                      <span class="h-6 w-6 rounded-lg bg-[--primary]/10 flex items-center justify-center text-[--primary] text-[10px]">1</span>
                      Identification de la Parcelle
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-2">
                        <label for="reg-parcelId" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ID Unique (ex: bz-456)</label>
                        <input id="reg-parcelId" formControlName="parcelId" placeholder="ex: bz-456"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all placeholder:text-slate-700">
                      </div>

                      <div class="space-y-2">
                        <label for="reg-cadastralId" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Réf. Cadastrale Nationale</label>
                        <input id="reg-cadastralId" formControlName="cadastralId" placeholder="ex: REF-CONGO-1234"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                      </div>

                      <div class="space-y-2">
                        <label for="reg-city" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ville</label>
                        <input id="reg-city" formControlName="city"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                      </div>

                      <div class="space-y-2">
                        <label for="reg-neighborhood" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Quartier / Arrondissement</label>
                        <input id="reg-neighborhood" formControlName="neighborhood" placeholder="ex: Poto-Poto"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                      </div>

                      <div class="space-y-2">
                        <label for="reg-surface" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Surface (m²) — <span class="text-[--primary]">Calculée automatiquement</span></label>
                        <div class="relative">
                          <input id="reg-surface" type="number" formControlName="surface" [readonly]="drawnCoords().length > 0"
                                 class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all" [class.border-[--primary]]="drawnCoords().length > 0">
                          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 text-[9px] font-bold">M²</span>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <label for="reg-price" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Valeur Estimée (XAF)</label>
                        <input id="reg-price" type="number" formControlName="price"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                      </div>
                    </div>
                  </div>

                  <!-- Section 1.5: Map Drawing -->
                  <div class="space-y-4 pt-4 border-t border-white/5">
                    <h3 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3">
                      <span class="h-6 w-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-[10px]"><mat-icon class="!text-xs">map</mat-icon></span>
                      Délimitation GPS de la Parcelle
                    </h3>
                    <p class="text-[10px] text-slate-500">Utilisez l'outil de dessin pour tracer le contour exact de la parcelle sur la carte satellite. La surface sera calculée automatiquement.</p>
                    
                    <div class="rounded-xl overflow-hidden border-2 border-white/10 relative" style="height: 350px;">
                      <div #drawMapContainer class="h-full w-full"></div>
                    </div>

                    @if (drawnCoords().length > 0) {
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in">
                        <div class="p-3 bg-[--primary]/10 border border-[--primary]/20 rounded-xl text-center">
                          <div class="text-[9px] text-slate-400 uppercase font-bold mb-1">Surface Géodésique</div>
                          <div class="text-lg font-bold text-[--primary] font-mono">{{ computedArea() | number:'1.0-0' }} m²</div>
                        </div>
                        <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                          <div class="text-[9px] text-slate-400 uppercase font-bold mb-1">Sommets GPS</div>
                          <div class="text-lg font-bold text-blue-400 font-mono">{{ drawnCoords().length }}</div>
                        </div>
                        <div class="p-3 rounded-xl text-center" [class]="overlapWarning() ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'">
                          <div class="text-[9px] text-slate-400 uppercase font-bold mb-1">Chevauchement</div>
                          <div class="text-lg font-bold font-mono" [class]="overlapWarning() ? 'text-red-400' : 'text-green-400'">{{ overlapWarning() || '✓ Aucun' }}</div>
                        </div>
                      </div>
                      <div class="p-3 bg-black/40 border border-white/5 rounded-xl">
                        <div class="text-[8px] font-mono text-slate-500 break-all leading-relaxed max-h-16 overflow-y-auto">
                          GeoJSON: [{{ drawnCoords().slice(0, 3).map(coordToString).join(', ') }}{{ drawnCoords().length > 3 ? ', ...' : '' }}]
                        </div>
                      </div>
                    }
                  </div>

                  <div class="space-y-6 pt-4 border-t border-white/5">
                    <h3 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3">
                      <span class="h-6 w-6 rounded-lg bg-[--primary]/10 flex items-center justify-center text-[--primary] text-[10px]">2</span>
                      Signatures Assermentées (Blockchain)
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div class="space-y-2">
                        <label for="reg-sig2" class="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Géomètre Agréé (V2)</label>
                        <input id="reg-sig2" formControlName="signatureV2" placeholder="Signature ID"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                      </div>
                    </div>
                  </div>

                  <div class="space-y-6 pt-4 border-t border-white/5">
                    <h3 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3">
                      <span class="h-6 w-6 rounded-lg bg-[--primary]/10 flex items-center justify-center text-[--primary] text-[10px]">3</span>
                      Titulaire du Droit Foncier
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div class="space-y-2">
                        <label for="reg-currentOwner" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identité Souveraine (ID)</label>
                        <input id="reg-currentOwner" formControlName="currentOwner" placeholder="Sovereign_Identity_ID"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Stats/Security Info -->
            <div class="space-y-6">
              <div class="glass-card p-6 border-l-4 border-l-[--primary]">
                <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-6">Empreinte Numérique</h3>
                <div class="space-y-6">
                  <div class="space-y-2">
                    <div class="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Document Hash (SHA-256)</div>
                    <div class="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px] break-all text-slate-400">
                      {{ generatedHash() || 'Génération automatique...' }}
                    </div>
                  </div>
                  
                  <div class="p-4 rounded-xl bg-[--primary]/5 border border-[--primary]/10 text-center">
                    <div class="text-[9px] text-[--primary] uppercase font-bold mb-1">Architecture Blockchain</div>
                    <div class="text-[11px] text-white font-bold">Hyperledger Fabric + MySQL</div>
                  </div>
                </div>
              </div>

              <div class="glass-card p-8">
                 <h3 class="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Contraintes Critiques</h3>
                 <div class="space-y-4">
                    <div class="flex items-start gap-3">
                       <mat-icon class="!text-sm text-[--primary]">check_circle</mat-icon>
                       <p class="text-[10px] text-slate-400 leading-tight">Trois signatures obligatoires pour le minting.</p>
                    </div>
                    <div class="flex items-start gap-3">
                       <mat-icon class="!text-sm text-[--primary]">check_circle</mat-icon>
                       <p class="text-[10px] text-slate-400 leading-tight">Période de latence consensus : 2-3 secondes.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      }
      
      @if (showDemoError()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div class="bg-slate-900 border border-red-500/50 p-8 rounded-2xl max-w-xl text-center space-y-6 shadow-[0_0_100px_rgba(220,38,38,0.2)]">
            <div class="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <mat-icon class="!text-5xl text-red-500">gavel</mat-icon>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-red-500 uppercase tracking-widest">🛑 REJET DU SMART CONTRACT</h2>
              <p class="text-slate-300 mt-4 leading-relaxed font-mono text-sm">
                Tentative de double attribution détectée.<br><br>
                ERREUR : <span class="text-white">require(!registered[assetID])</span><br>
                La parcelle <span class="text-red-400 font-bold">{{ parcelForm.value.parcelId || 'Sélectionnée' }}</span> appartient déjà à un tiers et est verrouillée sur le réseau Hyperledger Fabric.<br><br>
                Action irréversible bloquée.
              </p>
            </div>
            <button (click)="closeDemoError()" class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-all">
              Fermer l'alerte
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RegisterParcel implements OnInit {
  @ViewChild('drawMapContainer') drawMapContainer!: ElementRef;
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private fancierChain = inject(FancierChain);

  user = signal<User | null>(null);
  loading = signal(false);
  generatedHash = signal('');
  showDemoError = signal(false);
  drawnCoords = signal<any[]>([]);
  computedArea = signal(0);
  overlapWarning = signal<string>('');
  adminId = signal('');
  adminPass = signal('');
  parcelForm: FormGroup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private drawMap: any;
  private drawnItems: any;
  private platformId = inject(PLATFORM_ID);
  private mapInitialized = false;

  constructor() {
    this.parcelForm = this.fb.group({
      parcelId: ['', [Validators.required]],
      cadastralId: ['', [Validators.required]],
      city: ['Brazzaville', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      surface: [null, [Validators.required, Validators.min(1)]],
      price: [null, [Validators.required, Validators.min(0)]],
      currentOwner: ['', [Validators.required]],
      signatureV2: ['', [Validators.required]]
    });

    this.parcelForm.valueChanges.subscribe(val => {
      this.updateHash(val);
    });

    // Watch for user login — when user logs in, the @if block renders the map container
    effect(() => {
      const u = this.user();
      if (u && !this.mapInitialized && isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initDrawMap(), 600);
      }
    });
  }

  ngOnInit() {
    auth.onAuthStateChanged((u: User | null) => this.user.set(u));
  }


  initDrawMap() {
    if (this.mapInitialized) return;
    if (!this.drawMapContainer?.nativeElement) {
      // Retry — DOM may not be ready yet
      setTimeout(() => this.initDrawMap(), 300);
      return;
    }
    this.mapInitialized = true;
    const brazzaville: [number, number] = [-4.2634, 15.2832];
    
    this.drawMap = L.map(this.drawMapContainer.nativeElement, {
      zoomControl: true
    }).setView(brazzaville, 14);

    // Satellite tiles
    L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps', maxZoom: 20
    }).addTo(this.drawMap);

    // Drawing layer
    this.drawnItems = new L.FeatureGroup();
    this.drawMap.addLayer(this.drawnItems);

    // Drawing controls
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#00e57a',
            fillColor: '#00e57a',
            fillOpacity: 0.3,
            weight: 3
          }
        },
        polyline: false,
        circle: false,
        rectangle: {
          shapeOptions: {
            color: '#00e57a',
            fillColor: '#00e57a',
            fillOpacity: 0.3,
            weight: 3
          }
        },
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true
      }
    });
    this.drawMap.addControl(drawControl);

    // Handle polygon created
    this.drawMap.on(L.Draw.Event.CREATED, (event: any) => {
      // Clear previous
      this.drawnItems.clearLayers();
      const layer = event.layer;
      this.drawnItems.addLayer(layer);
      
      // Extract coordinates
      const latlngs = layer.getLatLngs()[0] || layer.getLatLngs();
      const coords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
      this.drawnCoords.set(coords);
      
      // Compute geodesic area
      this.computeAndSetArea(coords);
      
      // Reverse Geocoding to auto-fill neighborhood
      if (coords.length > 0) {
        this.fetchNeighborhoodFromCoords(coords[0][0], coords[0][1]);
      }
    });

    // Handle polygon edited
    this.drawMap.on(L.Draw.Event.EDITED, (event: any) => {
      event.layers.eachLayer((layer: any) => {
        const latlngs = layer.getLatLngs()[0] || layer.getLatLngs();
        const coords = latlngs.map((ll: any) => [ll.lat, ll.lng]);
        this.drawnCoords.set(coords);
        this.computeAndSetArea(coords);
        
        // Reverse Geocoding to auto-fill neighborhood
        if (coords.length > 0) {
          this.fetchNeighborhoodFromCoords(coords[0][0], coords[0][1]);
        }
      });
    });

    // Handle polygon deleted
    this.drawMap.on(L.Draw.Event.DELETED, () => {
      this.drawnCoords.set([]);
      this.computedArea.set(0);
      this.overlapWarning.set('');
      this.parcelForm.patchValue({ surface: null });
    });
  }

  computeAndSetArea(coords: number[][]) {
    // Geodesic area calculation (Shoelace formula for spherical coordinates)
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    let area = 0;
    const n = coords.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const lat1 = toRad(coords[i][0]);
      const lat2 = toRad(coords[j][0]);
      const lng1 = toRad(coords[i][1]);
      const lng2 = toRad(coords[j][1]);
      area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    area = Math.abs((area * R * R) / 2);
    const rounded = Math.round(area);
    this.computedArea.set(rounded);
    this.parcelForm.patchValue({ surface: rounded });

    // Validate geometry against backend
    this.fancierChain.validateGeometry(coords).then((res: any) => {
      if (res && res.overlaps && res.overlaps.length > 0) {
        this.overlapWarning.set(`⚠ ${res.overlaps[0].parcelId}`);
      } else {
        this.overlapWarning.set('');
      }
    }).catch(() => {});
  }

  coordToString(c: number[]): string {
    return `[${c[0].toFixed(4)}, ${c[1].toFixed(4)}]`;
  }

  async fetchNeighborhoodFromCoords(lat: number, lng: number) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`);
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const neighborhood = addr.neighbourhood || addr.suburb || addr.city_district || addr.village || addr.town || addr.city || '';
        if (neighborhood) {
          // Format properly (Title Case)
          const cleanName = neighborhood.toLowerCase().replace(/(^\w|\s\w|-\w)/g, (m: string) => m.toUpperCase());
          this.parcelForm.patchValue({ neighborhood: cleanName });
          this.snackBar.open(`📍 Quartier détecté automatiquement : ${cleanName}`, 'Fermer', { duration: 4000 });
        }
      }
    } catch (e) {
      console.error('Erreur Reverse Geocoding', e);
    }
  }

  async login() {
    this.loading.set(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      console.error("Login error:", error);
      this.snackBar.open("Erreur de connexion.", 'Fermer', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  demoDoubleAttribution() {
    // Simulons un appel API qui se fait rejeter par le Smart Contract
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.showDemoError.set(true);
    }, 1500); // simulation du temps de consensus
  }

  closeDemoError() {
    this.showDemoError.set(false);
  }

  demoLogin() {
    const mockUser = {
      uid: 'demo-agent-id',
      email: 'demo@foncierchain.local',
      displayName: 'Agent Démo Brazzaville',
      photoURL: null
    } as unknown as User;
    this.user.set(mockUser);
    this.snackBar.open("Connecté en tant qu'agent démo", "Fermer", { duration: 3000 });
  }

  apiLogin() {
    if (!this.adminId() || !this.adminPass()) return;
    this.loading.set(true);

    this.fancierChain.loginUser({ username: this.adminId(), password: this.adminPass() }).subscribe({
      next: (res) => {
        localStorage.setItem('fancier_token', res.token);
        const userObj = {
          uid: this.adminId(),
          displayName: `Agent ${this.adminId()}`,
          email: `${this.adminId()}@foncierchain.local`
        };
        localStorage.setItem('fancier_user', JSON.stringify(userObj));
        this.user.set(userObj as unknown as User);
        this.snackBar.open("Connecté avec succès au Backend FoncierChain", "Fermer", { duration: 3000 });
        this.loading.set(false);
      },
      error: (err) => {
        console.error("API Login error:", err);
        this.snackBar.open("Échec de connexion. Vérifiez vos identifiants ou si l'API est active.", "Fermer", { duration: 5000 });
        this.loading.set(false);
      }
    });
  }

  async updateHash(val: Record<string, unknown>) {
    const parcelId = val['parcelId'] as string;
    const cadastralId = val['cadastralId'] as string;
    const currentOwner = val['currentOwner'] as string;
    const surface = val['surface'] as number;

    if (!parcelId || !cadastralId) {
      this.generatedHash.set('');
      return;
    }
    const data = `${parcelId}-${cadastralId}-${currentOwner}-${surface}`;
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    this.generatedHash.set(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
  }

  async onSubmit() {
    if (this.parcelForm.invalid) return;
    this.loading.set(true);

    const formVal = this.parcelForm.getRawValue();
    const parcelId = formVal.parcelId.trim();
    
    const payload: Partial<LandRecord> = {
      id: parcelId,
      owner: formVal.currentOwner,
      city: formVal.city,
      neighborhood: formVal.neighborhood,
      address: `${formVal.neighborhood}, ${formVal.city}`,
      cadastralId: formVal.cadastralId,
      area: formVal.surface,
      price: formVal.price,
      signatureV2: formVal.signatureV2,
      documentHash: this.generatedHash()
    };

    // Add coordinates if drawn
    if (this.drawnCoords().length > 0) {
      (payload as any).coordinates = this.drawnCoords();
    }

    // Step 1: Initiate Draft (via API)
    this.fancierChain.initiateDraft(payload).subscribe({
      next: (res) => {
        this.snackBar.open(`Étape 1 complétée : DRAFT ${res.assetId} initié. Tx: ${res.txId}`, 'Fermer', { duration: 5000 });
        this.router.navigate(['/portal'], { queryParams: { id: parcelId } });
      },
      error: (err) => {
        console.error("Submit error:", err);
        const errorMsg = err.error?.error || "Échec de l'opération via l'API.";
        
        if (errorMsg.includes('SMART CONTRACT')) {
          this.showDemoError.set(true);
        } else {
          this.snackBar.open(errorMsg, 'Fermer', { duration: 10000 });
        }
        this.loading.set(false);
      }
    });
  }
}


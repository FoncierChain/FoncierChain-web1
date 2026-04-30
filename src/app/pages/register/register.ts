import {ChangeDetectionStrategy, Component, signal, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
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
import {Router, RouterLink} from '@angular/router';
import {FancierChain, LandRecord} from '../../services/fancier-chain';

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
    MatSnackBarModule,
    RouterLink
  ],
  template: `
    <div class="animate-fade-in max-w-6xl mx-auto py-8">
      @if (!user()) {
        <!-- Login Fallback -->
        <div class="glass-card max-w-md mx-auto p-12 text-center space-y-8 shadow-2xl">
           <div class="h-16 w-16 rounded-3xl bg-[--primary]/10 flex items-center justify-center text-[--primary] mx-auto">
             <mat-icon class="!text-3xl">lock</mat-icon>
           </div>
           <div class="space-y-2">
             <h2 class="text-2xl font-bold text-white">Accès Restreint</h2>
             <p class="text-xs text-slate-500">Seuls les agents assermentés peuvent enregistrer des parcelles sur la blockchain.</p>
           </div>
           <button (click)="login()" class="w-full bg-[--primary] hover:bg-[--primary-hover] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-[--primary]/20">
             <mat-icon>login</mat-icon>
             Se connecter avec Google
           </button>
           <button (click)="demoLogin()" class="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold transition-all border border-white/10">
             Utiliser l'accès Démo Agent
           </button>
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
                        <label for="reg-surface" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Surface (m²)</label>
                        <div class="relative">
                          <input id="reg-surface" type="number" formControlName="surface"
                                 class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
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

                  <div class="space-y-6 pt-4 border-t border-white/5">
                    <h3 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3">
                      <span class="h-6 w-6 rounded-lg bg-[--primary]/10 flex items-center justify-center text-[--primary] text-[10px]">2</span>
                      Signatures Assermentées (Blockchain)
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div class="space-y-2">
                        <label for="reg-sig1" class="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Agent Foncier (V1)</label>
                        <input id="reg-sig1" formControlName="signatureV1" placeholder="Signature ID"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                      </div>
                      <div class="space-y-2">
                        <label for="reg-sig2" class="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Géomètre Agréé (V2)</label>
                        <input id="reg-sig2" formControlName="signatureV2" placeholder="Signature ID"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                      </div>
                      <div class="space-y-2">
                        <label for="reg-sig3" class="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Représentant Local (V3)</label>
                        <input id="reg-sig3" formControlName="signatureV3" placeholder="Signature ID"
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
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RegisterParcel implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private fancierChain = inject(FancierChain);

  user = signal<User | null>(null);
  loading = signal(false);
  generatedHash = signal('');
  parcelForm: FormGroup;

  constructor() {
    this.parcelForm = this.fb.group({
      parcelId: ['', [Validators.required]],
      cadastralId: ['', [Validators.required]],
      city: ['Brazzaville', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      surface: [null, [Validators.required, Validators.min(1)]],
      price: [null, [Validators.required, Validators.min(0)]],
      currentOwner: ['', [Validators.required]],
      signatureV1: ['', [Validators.required]],
      signatureV2: ['', [Validators.required]],
      signatureV3: ['', [Validators.required]]
    });

    this.parcelForm.valueChanges.subscribe(val => {
      this.updateHash(val);
    });
  }

  ngOnInit() {
    auth.onAuthStateChanged((u: User | null) => this.user.set(u));
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

    try {
      const formVal = this.parcelForm.getRawValue();
      const parcelId = formVal.parcelId.trim();

      // --- SIMULATION: Double Attribution Check ---
      const check = await this.fancierChain.simulateRegistration(parcelId);
      if (!check.allowed) {
        this.snackBar.open(check.reason || 'Erreur', 'Fermer', { 
          duration: 10000,
          panelClass: ['snackbar-error']
        });
        this.loading.set(false);
        return;
      }
      
      const payload: Partial<LandRecord> = {
        id: parcelId,
        owner: formVal.currentOwner,
        city: formVal.city,
        neighborhood: formVal.neighborhood,
        address: `${formVal.neighborhood}, ${formVal.city}`, // Searchable combined address
        cadastralId: formVal.cadastralId,
        area: formVal.surface,
        price: formVal.price,
        signatureV2: formVal.signatureV2, // Géomètre (V2) is Step 1 Actor
        documentHash: this.generatedHash()
      };

      // Step 1: Initiate Draft (Simulation + Logic)
      await this.fancierChain.simulateInitiateDraft(payload);
      
      this.snackBar.open('Étape 1 complétée : DRAFT initié sur la Blockchain simulation.', 'Fermer', { duration: 5000 });
      this.router.navigate(['/portal'], { queryParams: { id: parcelId } });
      
    } catch (error: unknown) {
      console.error("Submit error:", error);
      this.snackBar.open("Échec de l'opération (ABAC_DENIED ou double attribution).", 'Fermer', { duration: 5000 });
      this.loading.set(false);
    }
  }
}


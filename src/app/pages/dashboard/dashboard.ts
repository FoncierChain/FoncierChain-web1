import {ChangeDetectionStrategy, Component, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {doc, setDoc, collection, addDoc, serverTimestamp} from 'firebase/firestore';
import {db, auth} from '../../firebase';
import {signInWithPopup, GoogleAuthProvider, User} from 'firebase/auth';
import {FancierChain, AuthPayload} from '../../services/fancier-chain';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
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
    <div class="animate-fade-in">
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
                <div class="flex justify-center gap-4">
                   <div class="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center">
                     <mat-icon class="text-[--primary]">verified_user</mat-icon>
                   </div>
                </div>
                <div class="space-y-1">
                  <div class="text-[10px] font-bold text-[--primary] uppercase tracking-widest">Authentification Agent</div>
                  <h2 class="text-xl font-bold text-white">Registre Foncier National</h2>
                  <p class="text-xs text-slate-500">Plateforme sécurisée — Accès réservé aux agents certifiés.</p>
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

            <div class="space-y-4 pt-4">
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
        <!-- Agent Form Workspace (Image 2/4) -->
        <div class="space-y-6">
          <div class="flex justify-between items-end mb-4">
            <div>
              <h2 class="text-xl font-bold text-white">Enregistrer une Parcelle</h2>
              <p class="text-[11px] text-slate-500">Ajoutez une nouvelle propriété au registre immuable.</p>
            </div>
            <div class="flex gap-3">
               <button class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2">
                 <mat-icon class="!text-sm">save</mat-icon>
                 Brouillon
               </button>
               <button class="bg-[--primary] hover:bg-[--primary-hover] text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                       (click)="onSubmit()" [disabled]="parcelForm.invalid || loading()">
                 <mat-icon class="!text-sm">publish</mat-icon>
                 Publier sur Blockchain
               </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Form -->
            <div class="lg:col-span-2 space-y-6">
              <div class="glass-card p-8">
                <form [formGroup]="parcelForm" class="space-y-8">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label for="parcelId" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ID de la Parcelle</label>
                      <input id="parcelId" formControlName="parcelId" placeholder="ex: BZV-45785-SECURE"
                             class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-[--primary] transition-all">
                    </div>

                    <div class="space-y-2">
                      <label for="usage" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Type d'Usage</label>
                      <mat-select id="usage" formControlName="usage" class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-[--primary] transition-all">
                        <mat-option value="Residential">Résidentiel</mat-option>
                        <mat-option value="Commercial">Commercial</mat-option>
                        <mat-option value="Industrial">Industriel</mat-option>
                        <mat-option value="Agricultural">Agricole</mat-option>
                      </mat-select>
                    </div>

                    <div class="md:col-span-2 space-y-2">
                      <label for="address" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Adresse Géographique</label>
                      <input id="address" formControlName="address" placeholder="ex: Poto-Poto, Rue 42, Parcelle 12"
                             class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-[--primary] transition-all">
                    </div>

                    <div class="space-y-2">
                      <label for="surface" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Surface (m²)</label>
                      <input id="surface" type="number" formControlName="surface"
                             class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-[--primary] transition-all">
                    </div>

                    <div class="space-y-2">
                      <label for="coordinates" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Coordonnées GPS (WGS84)</label>
                      <input id="coordinates" formControlName="coordinates" placeholder="-4.26, 15.28"
                             class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-[--primary] transition-all">
                    </div>
                  </div>

                  <div class="space-y-2 pt-4 border-t border-white/5">
                    <div class="text-[10px] font-bold text-[--primary] uppercase tracking-widest ml-1">Propriétaire Initial</div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div class="space-y-2">
                        <label for="currentOwner" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nom Complet / Raison Sociale</label>
                        <input id="currentOwner" formControlName="currentOwner"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-[--primary] transition-all">
                      </div>
                      <div class="space-y-2">
                        <label for="ownerId" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">CNI / ID National</label>
                        <input id="ownerId" formControlName="ownerId"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-[--primary] transition-all">
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Side Cards -->
            <div class="space-y-6">
              <div class="glass-card p-6 border-l-4 border-l-[--primary]">
                <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-4">Intégrité Cryptographique</h3>
                <div class="space-y-4">
                  <div class="p-4 bg-black/40 border border-white/10 rounded-xl font-mono text-[9px] break-all text-slate-400">
                    <div class="text-[--primary] mb-2 font-bold uppercase tracking-tight">System Hash Generation:</div>
                    {{ generatedHash() || '0x0000000000000000000000000000000000000000' }}
                  </div>
                  <p class="text-[10px] text-slate-500 leading-relaxed italic">
                    * L'enregistrement sera horodaté et signé par la clé privée de l'agent : {{ user()?.displayName }}
                  </p>
                </div>
              </div>

              <div class="glass-card p-6">
                <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-4">Conseils de Saisie</h3>
                <ul class="space-y-3">
                  <li class="flex gap-3 text-[10px] text-slate-400">
                    <mat-icon class="!text-sm text-[--primary]">check_circle</mat-icon>
                    <span>Vérifiez deux fois les coordonnées GPS (Google Maps compatible).</span>
                  </li>
                  <li class="flex gap-3 text-[10px] text-slate-400">
                    <mat-icon class="!text-sm text-[--primary]">check_circle</mat-icon>
                    <span>L'ID de la parcelle doit suivre la nomenclature BZV-XXXX.</span>
                  </li>
                  <li class="flex gap-3 text-[10px] text-slate-400">
                    <mat-icon class="!text-sm text-[--primary]">check_circle</mat-icon>
                    <span>Numérisez les documents papier avant de valider.</span>
                  </li>
                </ul>
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
export class Dashboard {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private fancierChain = inject(FancierChain);

  user = signal<User | null>(null);
  loading = signal(false);
  generatedHash = signal('');
  parcelForm: FormGroup;
  currentDate = new Date();

  constructor() {
    this.parcelForm = this.fb.group({
      parcelId: ['', [Validators.required]],
      usage: ['Residential', [Validators.required]],
      address: ['', [Validators.required]],
      surface: [null, [Validators.required, Validators.min(1)]],
      coordinates: ['', [Validators.required]],
      currentOwner: ['', [Validators.required]],
      ownerId: ['', [Validators.required]]
    });

    this.parcelForm.valueChanges.subscribe(val => {
      this.updateHash(val);
    });

    auth.onAuthStateChanged((u: User | null) => {
      this.user.set(u);
    });

    // Also check for local token if not logged in via Firebase
    const token = localStorage.getItem('fancier_token');
    const savedUser = localStorage.getItem('fancier_user');
    if (token && savedUser && !this.user()) {
      this.user.set(JSON.parse(savedUser));
    }
  }

  adminId = signal('');
  adminPass = signal('');

  async apiLogin() {
    if (!this.adminId() || !this.adminPass()) return;
    this.loading.set(true);

    const payload: AuthPayload = {
      username: this.adminId(),
      password: this.adminPass()
    };

    this.fancierChain.loginUser(payload).subscribe({
      next: (res) => {
        localStorage.setItem('fancier_token', res.token);
        const userObj = {
          uid: this.adminId(),
          displayName: `Agent ${this.adminId()}`,
          email: `${this.adminId()}@fancierchain.local`
        };
        localStorage.setItem('fancier_user', JSON.stringify(userObj));
        this.user.set(userObj as unknown as User);
        this.snackBar.open("Connecté avec succès au Backend FancierChain", "Fermer", { duration: 3000 });
        this.loading.set(false);
      },
      error: (err) => {
        console.error("API Login error:", err);
        this.snackBar.open("Échec de connexion au Backend. Vérifiez vos identifiants ou si l'API est active sur http://localhost:8000/", "Fermer", { duration: 5000 });
        this.loading.set(false);
      }
    });
  }

  async login() {
    this.loading.set(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      console.error("Login error:", error);
      let msg = `Erreur de connexion.`;
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/unauthorized-domain') {
        msg = "Domaine non autorisé dans la console Firebase. Ajoutez cet URL aux 'Domaines autorisés'.";
      } else if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/popup-closed-by-user') {
        msg = "La fenêtre de connexion a été fermée avant la fin de l'authentification.";
      }
      this.snackBar.open(msg, 'Fermer', { duration: 8000 });
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

  logout() {
    auth.signOut();
    localStorage.removeItem('fancier_token');
    localStorage.removeItem('fancier_user');
    this.user.set(null);
  }

  async updateHash(val: Record<string, unknown>) {
    if (!val['parcelId'] || !val['coordinates']) {
      this.generatedHash.set('');
      return;
    }
    const data = `${val['parcelId']}-${val['coordinates']}-${val['currentOwner']}-${val['surface']}`;
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    this.generatedHash.set(hashHex);
  }

  async onSubmit() {
    if (this.parcelForm.invalid) return;
    this.loading.set(true);

    try {
      const formVal = this.parcelForm.value;
      const parcelData = {
        ...formVal,
        hash: this.generatedHash(),
        agentUid: this.user()?.uid,
        status: 'Validated',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save Parcel
      await setDoc(doc(db, 'parcels', formVal.parcelId), parcelData);

      // Save Initial Transaction
      await addDoc(collection(db, `parcels/${formVal.parcelId}/history`), {
        parcelId: formVal.parcelId,
        newOwner: formVal.currentOwner,
        date: serverTimestamp(),
        type: 'Initial Registration',
        hash: this.generatedHash(),
        agentUid: this.user()?.uid
      });

      this.snackBar.open('Parcelle enregistrée avec succès sur la blockchain !', 'Fermer', { duration: 5000 });
      this.parcelForm.reset();
    } catch (error) {
      console.error("Submit error:", error);
      this.snackBar.open("Erreur lors de l'enregistrement. Vérifiez vos permissions.", 'Fermer', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}


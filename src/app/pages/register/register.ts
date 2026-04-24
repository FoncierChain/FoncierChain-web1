import {ChangeDetectionStrategy, Component, signal, inject, OnInit} from '@angular/core';
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
import {User, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';
import {Router, RouterLink} from '@angular/router';

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
              <div class="text-[10px] font-bold text-[--primary] uppercase tracking-widest">Opération de Cadastre</div>
              <h2 class="text-3xl font-bold text-white tracking-tight">Nouvel Enregistrement</h2>
              <p class="text-sm text-slate-500">Insertion d'une nouvelle parcelle dans le ledger national immuable.</p>
            </div>
            
            <div class="flex gap-3 w-full md:w-auto">
               <button class="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                 <mat-icon class="!text-sm">save</mat-icon>
                 Brouillon
               </button>
               <button class="flex-1 md:flex-none bg-[--primary] hover:bg-[--primary-hover] text-white px-8 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xl shadow-[--primary]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                       (click)="onSubmit()" [disabled]="parcelForm.invalid || loading()">
                 @if (loading()) {
                   <mat-icon class="animate-spin !text-sm">sync</mat-icon>
                   Blockchain en cours...
                 } @else {
                   <mat-icon class="!text-sm">publish</mat-icon>
                   PUBLIER SUR LE LEDGER
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
                      Détails de la Propriété
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="space-y-2">
                        <label for="reg-parcelId" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ID Parcelle (Format National)</label>
                        <input id="reg-parcelId" formControlName="parcelId" placeholder="ex: BZV-45785-A"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-[--primary] transition-all placeholder:text-slate-700">
                      </div>

                      <div class="space-y-2">
                        <label for="reg-usage" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Type d'Usage</label>
                        <mat-select id="reg-usage" formControlName="usage" class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-[--primary] transition-all">
                          <mat-option value="Residential">Résidentiel</mat-option>
                          <mat-option value="Commercial">Commercial</mat-option>
                          <mat-option value="Industrial">Industriel</mat-option>
                          <mat-option value="Agricultural">Agricole</mat-option>
                        </mat-select>
                      </div>

                      <div class="md:col-span-2 space-y-2">
                        <label for="reg-address" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Adresse Complète</label>
                        <input id="reg-address" formControlName="address" placeholder="ex: Quartier Moungali, Rue de la Paix, Brazzaville"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-[--primary] transition-all">
                      </div>

                      <div class="space-y-2">
                        <label for="reg-surface" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Surface (m²)</label>
                        <div class="relative">
                          <input id="reg-surface" type="number" formControlName="surface"
                                 class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-[--primary] transition-all">
                          <span class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 text-[10px] font-bold">M²</span>
                        </div>
                      </div>

                      <div class="space-y-2">
                        <label for="reg-coordinates" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Coordonnées GPS</label>
                        <input id="reg-coordinates" formControlName="coordinates" placeholder="Lat, Lng (ex: -4.26, 15.28)"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-[--primary] transition-all">
                      </div>
                    </div>
                  </div>

                  <div class="space-y-6 pt-4 border-t border-white/5">
                    <h3 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3">
                      <span class="h-6 w-6 rounded-lg bg-[--primary]/10 flex items-center justify-center text-[--primary] text-[10px]">2</span>
                      Identification du Titulaire
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div class="space-y-2">
                        <label for="reg-currentOwner" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nom Complet</label>
                        <input id="reg-currentOwner" formControlName="currentOwner" placeholder="Mme/M. Nom Prénom"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-[--primary] transition-all">
                      </div>
                      <div class="space-y-2">
                        <label for="reg-ownerId" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">N° Pièce d'Identité (CNI/Passport)</label>
                        <input id="reg-ownerId" formControlName="ownerId" placeholder="ex: 19850101-XXXX-X"
                               class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-[--primary] transition-all">
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Stats/Security Info -->
            <div class="space-y-6">
              <div class="glass-card p-6 border-l-4 border-l-[--primary]">
                <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-6">Validation Blockchain</h3>
                <div class="space-y-6">
                  <div class="space-y-2">
                    <div class="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Empreinte (Hash)</div>
                    <div class="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-[9px] break-all text-slate-400">
                      {{ generatedHash() || 'Requiert parcelId & coordonnées...' }}
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                     <div class="h-10 w-10 rounded-xl bg-[--primary]/10 flex items-center justify-center text-[--primary]">
                       <mat-icon>verified</mat-icon>
                     </div>
                     <div>
                       <div class="text-[9px] text-slate-500 uppercase font-bold">Signature Agent</div>
                       <div class="text-[11px] text-white font-bold">{{ user()?.displayName }}</div>
                     </div>
                  </div>

                  <div class="p-4 rounded-xl border border-dashed border-white/10">
                    <p class="text-[10px] text-slate-500 leading-relaxed italic">
                      "Toute saisie sur FoncierChain est définitive et consultable publiquement. Assurez-vous de l'authenticité des documents physiques présentés."
                    </p>
                  </div>
                </div>
              </div>

              <div class="glass-card p-8">
                 <h3 class="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Aide à l'enregistrement</h3>
                 <div class="space-y-4">
                    <div class="flex items-start gap-3">
                       <mat-icon class="!text-sm text-slate-500">info</mat-icon>
                       <p class="text-[10px] text-slate-400 leading-tight">L'ID Parcelle doit être unique au niveau national.</p>
                    </div>
                    <div class="flex items-start gap-3">
                       <mat-icon class="!text-sm text-slate-500">info</mat-icon>
                       <p class="text-[10px] text-slate-400 leading-tight">Les coordonnées GPS sont utilisées pour la vérification croisée SIG.</p>
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

  user = signal<User | null>(null);
  loading = signal(false);
  generatedHash = signal('');
  parcelForm: FormGroup;

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
    if (!val['parcelId'] || !val['coordinates']) {
      this.generatedHash.set('');
      return;
    }
    const data = `${val['parcelId']}-${val['coordinates']}-${val['currentOwner']}-${val['surface']}`;
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    this.generatedHash.set(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''));
  }

  async onSubmit() {
    if (this.parcelForm.invalid) return;
    this.loading.set(true);

    try {
      const formVal = this.parcelForm.value;
      const parcelId = formVal.parcelId.trim();
      
      const parcelData = {
        ...formVal,
        parcelId,
        hash: this.generatedHash(),
        agentUid: this.user()?.uid || 'demo-agent',
        status: 'Sécurisé',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'parcels', parcelId), parcelData);
      
      await addDoc(collection(db, `parcels/${parcelId}/history`), {
        parcelId,
        newOwner: formVal.currentOwner,
        date: serverTimestamp(),
        type: 'INITIAL REGISTRATION',
        hash: this.generatedHash(),
        agentUid: this.user()?.uid || 'demo-agent'
      });

      this.snackBar.open('Parcelle enregistrée avec succès ! Redirection...', 'Fermer', { duration: 3000 });
      this.router.navigate(['/portal'], { queryParams: { id: parcelId } });
    } catch (error: unknown) {
      console.error("Submit error:", error);
      this.snackBar.open("Échec de l'enregistrement. Vérifiez vos permissions.", 'Fermer', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}

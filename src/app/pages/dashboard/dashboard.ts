import {ChangeDetectionStrategy, Component, signal, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {doc, setDoc, collection, addDoc, serverTimestamp} from 'firebase/firestore';
import {db, auth} from '../../firebase';
import {signInWithPopup, GoogleAuthProvider, User} from 'firebase/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatInputModule, 
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="space-y-8">
      @if (!user()) {
        <div class="max-w-md mx-auto text-center py-20 sleek-card">
          <div class="h-20 w-20 rounded-2xl bg-congo-green/10 flex items-center justify-center text-congo-green mx-auto mb-6">
            <mat-icon class="!text-4xl">admin_panel_settings</mat-icon>
          </div>
          <h1 class="text-2xl font-bold text-sidebar-bg mb-2">Accès Agents Fonciers</h1>
          <p class="text-text-muted mb-8">Veuillez vous authentifier pour accéder au registre immuable.</p>
          <button class="sleek-btn-primary w-full h-12" (click)="login()">
            Se connecter avec Google
          </button>
        </div>
      } @else {
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-sidebar-bg">Tableau de Bord Agent</h1>
            <p class="text-xs text-text-muted font-semibold uppercase tracking-wider">Connecté: {{user()?.displayName}}</p>
          </div>
          <button mat-stroked-button color="warn" class="!rounded-lg" (click)="logout()">Déconnexion</button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Registration Form -->
          <div class="lg:col-span-2">
            <div class="sleek-card">
              <div class="sleek-card-header">
                <span class="sleek-card-title">Nouvel Enregistrement de Parcelle</span>
                <span class="text-[10px] font-bold text-text-muted">REF-{{currentDate | date:'yyyy-MM-dd'}}</span>
              </div>
              
              <form [formGroup]="parcelForm" (ngSubmit)="onSubmit()" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-1">
                    <label for="parcelId" class="text-xs font-bold text-text-muted uppercase">ID de la Parcelle</label>
                    <input id="parcelId" matInput formControlName="parcelId" placeholder="ex: BZV-45785-SECURE"
                           class="w-full p-3 rounded-lg border border-border-color bg-bg-light focus:bg-white focus:border-congo-green outline-none transition-all">
                  </div>

                  <div class="space-y-1">
                    <label for="usage" class="text-xs font-bold text-text-muted uppercase">Usage</label>
                    <mat-select id="usage" formControlName="usage" class="w-full p-3 rounded-lg border border-border-color bg-bg-light">
                      <mat-option value="Residential">Résidentiel</mat-option>
                      <mat-option value="Commercial">Commercial</mat-option>
                      <mat-option value="Industrial">Industriel</mat-option>
                      <mat-option value="Agricultural">Agricole</mat-option>
                    </mat-select>
                  </div>

                  <div class="space-y-1 md:col-span-2">
                    <label for="address" class="text-xs font-bold text-text-muted uppercase">Adresse Complète</label>
                    <input id="address" matInput formControlName="address" placeholder="ex: Poto-Poto, Rue 42, Parcelle 12"
                           class="w-full p-3 rounded-lg border border-border-color bg-bg-light focus:bg-white focus:border-congo-green outline-none transition-all">
                  </div>

                  <div class="space-y-1">
                    <label for="surface" class="text-xs font-bold text-text-muted uppercase">Surface (m²)</label>
                    <input id="surface" matInput type="number" formControlName="surface"
                           class="w-full p-3 rounded-lg border border-border-color bg-bg-light focus:bg-white focus:border-congo-green outline-none transition-all">
                  </div>

                  <div class="space-y-1">
                    <label for="coordinates" class="text-xs font-bold text-text-muted uppercase">Coordonnées GPS</label>
                    <input id="coordinates" matInput formControlName="coordinates" placeholder="Lat, Lng; Lat, Lng; ..."
                           class="w-full p-3 rounded-lg border border-border-color bg-bg-light focus:bg-white focus:border-congo-green outline-none transition-all">
                  </div>

                  <div class="space-y-1">
                    <label for="currentOwner" class="text-xs font-bold text-text-muted uppercase">Propriétaire Actuel</label>
                    <input id="currentOwner" matInput formControlName="currentOwner"
                           class="w-full p-3 rounded-lg border border-border-color bg-bg-light focus:bg-white focus:border-congo-green outline-none transition-all">
                  </div>

                  <div class="space-y-1">
                    <label for="ownerId" class="text-xs font-bold text-text-muted uppercase">ID du Propriétaire</label>
                    <input id="ownerId" matInput formControlName="ownerId"
                           class="w-full p-3 rounded-lg border border-border-color bg-bg-light focus:bg-white focus:border-congo-green outline-none transition-all">
                  </div>
                </div>

                <!-- Hash Display -->
                <div class="p-4 rounded-xl bg-sidebar-bg text-white font-mono text-[10px] border-l-4 border-congo-green">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-congo-green font-bold uppercase tracking-widest">Empreinte Cryptographique (Hash)</span>
                    <mat-icon class="!text-xs">lock</mat-icon>
                  </div>
                  <div class="break-all opacity-80">{{generatedHash() || 'En attente de saisie...'}}</div>
                </div>

                <div class="flex justify-end gap-4 pt-4">
                  <button mat-button type="button" class="!rounded-lg" (click)="parcelForm.reset()">Réinitialiser</button>
                  <button class="sleek-btn-primary h-12 px-10" type="submit" [disabled]="parcelForm.invalid || loading()">
                    @if (loading()) {
                      <mat-icon class="animate-spin !text-sm">sync</mat-icon>
                    } @else {
                      Valider l'Enregistrement Numérique
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Sidebar Info -->
          <div class="space-y-6">
            <div class="sleek-card !bg-congo-green !text-white">
              <h3 class="font-bold mb-3 flex items-center gap-2">
                <mat-icon>info</mat-icon>
                Protocole de Sécurité
              </h3>
              <p class="text-xs opacity-90 leading-relaxed">
                Chaque enregistrement génère une empreinte unique basée sur les coordonnées GPS et l'identité du propriétaire. 
                Une fois validé, ce bloc devient immuable dans le registre national.
              </p>
            </div>

            <div class="sleek-card">
              <div class="sleek-card-header">
                <span class="sleek-card-title">Dernières Actions</span>
              </div>
              <div class="text-xs text-text-muted italic">Aucune action récente dans cette session.</div>
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

    auth.onAuthStateChanged((u: User | null) => this.user.set(u));
  }

  async login() {
    this.loading.set(true);
    try {
      const provider = new GoogleAuthProvider();
      // On force la sélection du compte pour éviter les connexions automatiques silencieuses qui peuvent échouer
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: unknown) {
      console.error("Login error:", error);
      let msg = "Erreur de connexion.";
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/unauthorized-domain') {
        msg = "Domaine non autorisé dans la console Firebase. Ajoutez cet URL aux 'Domaines autorisés'.";
      }
      this.snackBar.open(msg, 'Fermer', { duration: 8000 });
    } finally {
      this.loading.set(false);
    }
  }

  logout() {
    auth.signOut();
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


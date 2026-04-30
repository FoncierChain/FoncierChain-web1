import {ChangeDetectionStrategy, Component, signal, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {auth} from '../../firebase';
import {User, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';
import {Router, ActivatedRoute} from '@angular/router';
import {FancierChain} from '../../services/fancier-chain';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-transfer-parcel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule, 
    MatButtonModule, 
    MatIconModule, 
    MatInputModule, 
    MatFormFieldModule,
    MatSnackBarModule
  ],
  template: `
    <div class="animate-fade-in max-w-4xl mx-auto py-8">
      @if (!user()) {
        <div class="glass-card max-w-md mx-auto p-12 text-center space-y-8 shadow-2xl">
           <div class="h-16 w-16 rounded-3xl bg-[--primary]/10 flex items-center justify-center text-[--primary] mx-auto">
             <mat-icon class="!text-3xl">lock</mat-icon>
           </div>
           <h2 class="text-2xl font-bold text-white">Accès Réservé</h2>
           <p class="text-xs text-slate-500">Seuls les agents de l'Etat peuvent valider les transferts de propriété.</p>
           <button (click)="login()" class="w-full bg-[--primary] hover:bg-[--primary-hover] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-[--primary]/20">
             <mat-icon>login</mat-icon>
             Se connecter
           </button>
        </div>
      } @else {
        <div class="space-y-8">
          <div class="space-y-1 text-center md:text-left">
            <div class="text-[10px] font-bold text-[--primary] uppercase tracking-widest">Mutation de Titre Foncier</div>
            <h2 class="text-3xl font-bold text-white tracking-tight">Transfert de Propriété</h2>
            <p class="text-sm text-slate-500">Action irréversible sur le ledger Hyperledger Fabric.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Search & Preview Section -->
            <div class="glass-card p-8 space-y-6">
              <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <mat-icon class="!text-sm">search</mat-icon>
                Rechercher la Parcelle
              </h3>
              
              <div class="relative group">
                <input type="text" [(ngModel)]="searchId" (keyup.enter)="loadParcel()"
                       placeholder="Entrez l'ID (ex: bz-456)"
                       class="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-[--primary] transition-all">
                <button (click)="loadParcel()" 
                        class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[--primary]/20 text-[--primary] hover:bg-[--primary] hover:text-white transition-all">
                  <mat-icon class="!text-sm">chevron_right</mat-icon>
                </button>
              </div>

              @if (currentParcel()) {
                <div class="p-6 rounded-2xl bg-white/[0.03] border border-white/5 animate-fade-in space-y-4">
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="text-[9px] text-slate-500 uppercase font-bold">Propriétaire Actuel</div>
                      <div class="text-sm font-bold text-white">{{ currentParcel()?.currentOwner }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-[9px] text-slate-500 uppercase font-bold">Surface</div>
                      <div class="text-xs text-slate-300 font-mono">{{ currentParcel()?.surface || currentParcel()?.area }} m²</div>
                    </div>
                  </div>
                  <div class="pt-4 border-t border-white/5">
                    <div class="text-[9px] text-slate-500 uppercase font-bold">Localisation</div>
                    <div class="text-xs text-slate-400">{{ currentParcel()?.neighborhood }}, {{ currentParcel()?.city }}</div>
                  </div>
                </div>
              }
            </div>

            <!-- Transfer Form -->
            <div class="glass-card p-8">
              <form [formGroup]="transferForm" (ngSubmit)="onTransfer()" class="space-y-6">
                <h3 class="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                  <mat-icon class="!text-sm text-[--primary]">swap_horiz</mat-icon>
                  Détails de la Mutation
                </h3>

                <div class="space-y-2">
                  <label for="newOwner" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ID du Nouveau Propriétaire</label>
                  <input id="newOwner" formControlName="newOwner" placeholder="ex: USER_ID_BLOCKCHAIN"
                         class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                </div>

                <div class="space-y-2">
                  <label for="signatureV1" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Signature Agent de l'Etat (V1)</label>
                  <input id="signatureV1" formControlName="signatureV1" placeholder="Validez la mutation avec votre clé"
                         class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-[--primary] transition-all">
                </div>

                <div class="pt-4">
                  <button type="submit" 
                          [disabled]="transferForm.invalid || !currentParcel() || loading()"
                          class="w-full bg-[#10b981] hover:bg-[#059669] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#10b981]/20 group">
                    @if (loading()) {
                      <mat-icon class="animate-spin">sync</mat-icon>
                    } @else {
                      <mat-icon class="group-hover:translate-x-1 transition-transform">send</mat-icon>
                      VALIDER LA MUTATION
                    }
                  </button>
                </div>

                <div class="p-4 rounded-xl bg-red-400/5 border border-red-400/10 text-[9px] text-red-400/60 text-center leading-relaxed font-medium">
                  ATTENTION : Cette opération est immuable. Le consensus blockchain sera sollicité pour mettre à jour le ledger.
                </div>
              </form>
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
export class TransferParcel implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fancierChain = inject(FancierChain);

  user = signal<User | null>(null);
  loading = signal(false);
  searchId = '';
  currentParcel = signal<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  transferForm: FormGroup;

  constructor() {
    this.transferForm = this.fb.group({
      newOwner: ['', [Validators.required]],
      signatureV1: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    auth.onAuthStateChanged((u: User | null) => this.user.set(u));
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.searchId = params['id'];
        this.loadParcel();
      }
    });
  }

  async login() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  }

  async loadParcel() {
    if (!this.searchId.trim()) return;
    try {
      const data = await this.fancierChain.findParcel(this.searchId);

      if (data) {
        if (data.status !== 'FINALIZED') {
          this.snackBar.open("Le titre doit être FINALISÉ avant toute mutation (Validation Triple Actor requise).", "Fermer", { duration: 5000 });
        }
        this.currentParcel.set(data);
      } else {
        this.snackBar.open("Parcelle introuvable sur le ledger ou l'index Firebase.", "Fermer", { duration: 3000 });
        this.currentParcel.set(null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  onTransfer() {
    if (this.transferForm.invalid || !this.currentParcel()) return;
    if (this.currentParcel().status !== 'FINALIZED') {
      this.snackBar.open("Mutation refusée : Statut non Finalisé.", "Fermer", { duration: 5000 });
      return;
    }
    this.loading.set(true);

    const formVal = this.transferForm.value;
    const parcelId = this.currentParcel().parcelId || this.currentParcel().id;

    this.fancierChain.transferLand(parcelId, formVal.newOwner, formVal.signatureV1).subscribe({
      next: () => {
        this.snackBar.open("Mutation réussie sur la Blockchain !", "Fermer", { duration: 5000 });
        this.router.navigate(['/portal'], { queryParams: { id: parcelId } });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open("Erreur lors du transfert.", "Fermer", { duration: 5000 });
        this.loading.set(false);
      }
    });
  }
}

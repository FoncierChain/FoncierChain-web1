import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatSlideToggleModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      <!-- Project Info Card -->
      <div class="glass-card p-6 border-l-4 border-l-[--primary]">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 rounded-2xl bg-[--primary]/10 border border-[--primary]/20">
            <mat-icon class="!text-[--primary]">info</mat-icon>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Projet FoncierChain (CG-01)</h2>
            <p class="text-xs text-slate-500 uppercase tracking-widest font-bold">Équipe AfriChain solutions</p>
          </div>
        </div>
        <p class="text-sm text-slate-400 leading-relaxed">
          Système de gestion cadastrale décentralisé visant à sécuriser les titres fonciers en République du Congo. 
          Utilise une blockchain privée pour garantir l'immutabilité des registres et la transparence des transactions.
        </p>
      </div>

      <!-- Settings Sections -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- App Settings -->
        <div class="glass-card p-6 space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <mat-icon class="text-slate-500">settings_applications</mat-icon>
            <h3 class="font-bold text-white">Paramètres de l'Application</h3>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div class="text-xs font-bold text-white">Mode Hors-ligne</div>
                <div class="text-[10px] text-slate-500">Synchronisation locale activée</div>
              </div>
              <mat-slide-toggle color="primary" [checked]="true"></mat-slide-toggle>
            </div>

            <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div class="text-xs font-bold text-white">Notifications Push</div>
                <div class="text-[10px] text-slate-500">Alertes sur les nouveaux transferts</div>
              </div>
              <mat-slide-toggle color="primary" [checked]="false"></mat-slide-toggle>
            </div>
          </div>
        </div>

        <!-- Security & Blockchain -->
        <div class="glass-card p-6 space-y-6">
          <div class="flex items-center gap-3 mb-2">
            <mat-icon class="text-slate-500">security</mat-icon>
            <h3 class="font-bold text-white">Sécurité & Protocole</h3>
          </div>
          
          <div class="space-y-4">
            <div class="p-3 rounded-xl bg-black/40 border border-white/5">
              <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Algorithme de Consensus</div>
              <div class="text-xs font-mono text-[--primary]">Proof of Authority (PoA)</div>
            </div>

            <div class="p-3 rounded-xl bg-black/40 border border-white/5">
              <div class="text-[9px] text-slate-500 uppercase font-bold mb-1">Niveau de Chiffrement</div>
              <div class="text-xs font-mono text-white">AES-256-GCM</div>
            </div>
          </div>
        </div>

        <!-- Infrastructure -->
        <div class="glass-card p-6 space-y-6 md:col-span-2">
           <div class="flex items-center gap-3 mb-2">
            <mat-icon class="text-slate-500">dns</mat-icon>
            <h3 class="font-bold text-white">État des Nœuds</h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-2xl bg-white/5 border border-[#10b98120] flex flex-col items-center text-center">
              <div class="h-2 w-2 rounded-full bg-[--primary] mb-3 shadow-[0_0_8px_var(--primary)]"></div>
              <div class="text-[10px] font-bold text-white mb-1">Node Brazzaville</div>
              <p class="text-[9px] text-slate-500">Latence: 12ms</p>
            </div>
            <div class="p-4 rounded-2xl bg-white/5 border border-[#10b98120] flex flex-col items-center text-center">
              <div class="h-2 w-2 rounded-full bg-[--primary] mb-3 shadow-[0_0_8px_var(--primary)]"></div>
              <div class="text-[10px] font-bold text-white mb-1">Node Pointe-Noire</div>
              <p class="text-[9px] text-slate-500">Latence: 24ms</p>
            </div>
            <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center opacity-60">
              <div class="h-2 w-2 rounded-full bg-slate-500 mb-3"></div>
              <div class="text-[10px] font-bold text-white mb-1">Node Oyo</div>
              <p class="text-[9px] text-slate-500">Maintenance</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4">
        <button class="px-6 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-all">
          Réinitialiser
        </button>
        <button class="bg-[--primary] hover:bg-[--primary-hover] text-white px-8 py-3 rounded-xl text-xs font-bold transition-all shadow-xl shadow-[--primary]/20">
          Sauvegarder les Paramètres
        </button>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class Settings {}

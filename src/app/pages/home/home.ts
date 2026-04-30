import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {FancierChain} from '../../services/fancier-chain';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-5 flex flex-col gap-4 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <mat-icon class="!text-8xl">location_on</mat-icon>
          </div>
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
              <mat-icon>location_on</mat-icon>
            </div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+{{ stats()?.draft_parcels || 0 }} récents</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ stats()?.total_parcels || 0 }}</div>
            <div class="text-[11px] text-slate-500 font-medium">Parcelles Enregistrées</div>
          </div>
          <svg class="w-full h-8 opacity-40" viewBox="0 0 100 20">
            <polyline fill="none" stroke="currentColor" class="text-[--primary]" stroke-width="2" points="0,15 10,12 20,18 30,10 40,14 50,8 60,12 70,5 80,10 90,2 100,6" />
          </svg>
        </div>

        <div class="glass-card p-5 flex flex-col gap-4 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <mat-icon class="!text-8xl">verified_user</mat-icon>
          </div>
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
              <mat-icon>verified_user</mat-icon>
            </div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Taux: {{ (stats()?.finalized_parcels / (stats()?.total_parcels || 1) * 100).toFixed(1) }}%</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ stats()?.finalized_parcels || 0 }}</div>
            <div class="text-[11px] text-slate-500 font-medium">Titres Finalisés (On-Chain)</div>
          </div>
          <svg class="w-full h-8 opacity-40" viewBox="0 0 100 20">
            <polyline fill="none" stroke="currentColor" class="text-blue-400" stroke-width="2" points="0,18 15,10 30,14 45,8 60,12 75,4 90,9 100,2" />
          </svg>
        </div>

        <div class="glass-card p-5 flex flex-col gap-4 relative overflow-hidden group">
          <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <mat-icon class="!text-8xl">gavel</mat-icon>
          </div>
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-lg bg-orange-400/10 flex items-center justify-center text-orange-400">
              <mat-icon>pending_actions</mat-icon>
            </div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">En attente de validation V3</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ stats()?.validated_parcels || 0 }}</div>
            <div class="text-[11px] text-slate-500 font-medium">Validations Communautaires</div>
          </div>
          <svg class="w-full h-8 opacity-40" viewBox="0 0 100 20">
            <polyline fill="none" stroke="currentColor" class="text-amber-400" stroke-width="2" points="0,5 20,8 40,4 60,10 80,7 100,12" />
          </svg>
        </div>

        <div class="glass-card p-5 flex flex-col gap-4 relative overflow-hidden group">
           <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <mat-icon class="!text-8xl">square_foot</mat-icon>
          </div>
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
              <mat-icon>square_foot</mat-icon>
            </div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Zone Brazzaville</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ stats()?.total_area?.toLocaleString() || 0 }} m²</div>
            <div class="text-[11px] text-slate-500 font-medium">Surface Totale Sécurisée</div>
          </div>
          <svg class="w-full h-8 opacity-40" viewBox="0 0 100 20">
            <polyline fill="none" stroke="currentColor" class="text-amber-400" stroke-width="2" points="0,15 15,18 30,10 45,12 60,5 75,8 90,2 100,5" />
          </svg>
        </div>
      </div>

      <!-- Visual Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Curve (Line) Chart: Trend -->
        <div class="glass-card p-6 flex flex-col gap-6">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-xs font-bold text-white uppercase tracking-widest">Tendance des Enregistrements</h3>
              <p class="text-[10px] text-slate-500">Flux mensuel immuable (Simulation Hyperledger)</p>
            </div>
            <div class="flex gap-2">
              <div class="flex items-center gap-1 text-[9px] text-slate-500">
                <div class="h-2 w-2 rounded-full bg-[--primary]"></div> Brazzaville
              </div>
              <div class="flex items-center gap-1 text-[9px] text-slate-500">
                <div class="h-2 w-2 rounded-full bg-blue-400"></div> Pointe-Noire
              </div>
            </div>
          </div>
          
          <div class="h-48 relative flex items-end justify-between px-2">
             <svg class="absolute inset-x-0 bottom-0 w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="gradient-primary" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.2" />
                   <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
                 </linearGradient>
               </defs>
               <path d="M0,180 Q100,160 200,140 T400,110 T600,80 T800,60 T1000,40 L1000,200 L0,200 Z" fill="url(#gradient-primary)" />
               <path d="M0,180 Q100,160 200,140 T400,110 T600,80 T800,60 T1000,40" fill="none" stroke="var(--primary)" stroke-width="4" stroke-linecap="round" />
               <circle cx="200" cy="140" r="5" fill="var(--primary)" />
               <circle cx="400" cy="110" r="5" fill="var(--primary)" />
               <circle cx="600" cy="80" r="5" fill="var(--primary)" />
               <circle cx="800" cy="60" r="5" fill="var(--primary)" />
             </svg>
             
             <div class="absolute bottom-0 inset-x-0 flex justify-between px-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest pt-2">
               <span>Jan</span><span>Mar</span><span>Mai</span><span>Jul</span><span>Sep</span><span>Nov</span>
             </div>
          </div>
        </div>

        <!-- Circular (Pie/Donut) Chart & Bar Chart -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Circular: Usage Distribution -->
          <div class="glass-card p-6 flex flex-col items-center justify-center text-center">
            <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-6 self-start">Usage des Sols</h3>
            
            <div class="relative h-40 w-40 mb-6 group">
               <svg class="h-full w-full -rotate-90" viewBox="0 0 36 36">
                 <circle cx="18" cy="18" r="15.8" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="3"></circle>
                 <circle cx="18" cy="18" r="15.8" fill="none" stroke="var(--primary)" stroke-width="3" stroke-dasharray="70 100" stroke-linecap="round"></circle>
                 <circle cx="18" cy="18" r="15.8" fill="none" stroke="#60a5fa" stroke-width="3" stroke-dasharray="15 100" stroke-dashoffset="-70" stroke-linecap="round"></circle>
                 <circle cx="18" cy="18" r="15.8" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="15 100" stroke-dashoffset="-85" stroke-linecap="round"></circle>
               </svg>
               <div class="absolute inset-0 flex flex-col items-center justify-center">
                 <span class="text-xl font-bold text-white">70%</span>
                 <span class="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Résidentiel</span>
               </div>
            </div>

            <div class="w-full grid grid-cols-3 gap-2">
               <div class="flex flex-col items-center gap-1">
                 <div class="h-1.5 w-1.5 rounded-full bg-[--primary]"></div>
                 <span class="text-[8px] text-slate-400">Resid.</span>
               </div>
               <div class="flex flex-col items-center gap-1">
                 <div class="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                 <span class="text-[8px] text-slate-400">Comm.</span>
               </div>
               <div class="flex flex-col items-center gap-1">
                 <div class="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                 <span class="text-[8px] text-slate-400">Autres.</span>
               </div>
            </div>
          </div>

          <!-- Bar Chart: Validation Status -->
          <div class="glass-card p-6 flex flex-col gap-6">
            <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-2">État des Dossiers</h3>
            
            <div class="flex-1 flex items-end justify-between gap-3 h-32 px-2">
               <!-- Bar 1 (Finalisé) -->
               <div class="flex-1 flex flex-col items-center gap-2">
                 <div class="w-full bg-[--primary]/20 rounded-t-lg relative group overflow-hidden" [style.height]="'100%'">
                    <div class="absolute inset-x-0 bottom-0 bg-[--primary] rounded-t-lg transition-all duration-1000" [style.height]="( (stats()?.finalized_parcels / (stats()?.total_parcels || 1)) * 100) + '%'"></div>
                 </div>
                 <span class="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Final.</span>
               </div>
               <!-- Bar 2 (Validé V3) -->
               <div class="flex-1 flex flex-col items-center gap-2">
                 <div class="w-full bg-amber-500/20 rounded-t-lg relative group overflow-hidden" [style.height]="'100%'">
                    <div class="absolute inset-x-0 bottom-0 bg-amber-500 rounded-t-lg transition-all duration-1000" [style.height]="( (stats()?.validated_parcels / (stats()?.total_parcels || 1)) * 100) + '%'"></div>
                 </div>
                 <span class="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Comm.</span>
               </div>
               <!-- Bar 3 (Draft) -->
               <div class="flex-1 flex flex-col items-center gap-2">
                 <div class="w-full bg-blue-500/20 rounded-t-lg relative group overflow-hidden" [style.height]="'100%'">
                    <div class="absolute inset-x-0 bottom-0 bg-blue-500 rounded-t-lg transition-all duration-1000" [style.height]="( (stats()?.draft_parcels / (stats()?.total_parcels || 1)) * 100) + '%'"></div>
                 </div>
                 <span class="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Draft</span>
               </div>
            </div>
            
            <div class="p-3 bg-black/40 border border-white/5 rounded-xl">
               <div class="text-[10px] text-slate-400 flex items-center gap-2">
                 <mat-icon class="!text-xs text-[--primary]">verified_user</mat-icon>
                 Fiabilité Blockchain: 100%
               </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Actions & Ledger View -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Activity -->
        <div class="lg:col-span-2 glass-card flex flex-col">
          <div class="p-5 border-b border-[--border-subtle] flex justify-between items-center">
            <h3 class="text-xs font-bold text-white uppercase tracking-widest">Dernières Actions Ledger</h3>
            <button class="text-[10px] text-[--primary] font-bold hover:underline" routerLink="/registry">Accéder au Registre complet</button>
          </div>
          
          <div class="p-0 overflow-hidden">
            @for (item of recentActivity; track item.id) {
              <div class="flex items-center gap-4 px-6 py-4 border-b border-[--border-subtle] last:border-0 hover:bg-white/5 transition-all group">
                <div class="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-[--primary] transition-colors">
                  <mat-icon>{{ item.status === 'Litige' ? 'priority_high' : 'gavel' }}</mat-icon>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-bold text-white">{{ item.name }}</div>
                  <div class="text-[10px] text-slate-500">{{ item.action }} • {{ item.location }}</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] font-bold" [class.text-[--primary]]="item.status === 'Confirmé'" [class.text-blue-400]="item.status === 'Vérifié'" [class.text-amber-400]="item.status === 'En attente'" [class.text-red-400]="item.status === 'Litige'">
                    {{ item.status }}
                  </div>
                  <div class="text-[9px] text-slate-600">il y a {{ item.time }}</div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="space-y-6">
           <!-- Quick Actions -->
          <div class="glass-card p-5">
            <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-4">Actions Rapides</h3>
            <div class="space-y-2">
              <button class="w-full flex items-center justify-between p-3 rounded-lg bg-[#10b98120] border border-[#10b98140] hover:bg-[#10b98130] transition-all group" routerLink="/register">
                 <div class="flex items-center gap-3">
                   <mat-icon class="!text-lg text-[--primary]">add_circle</mat-icon>
                   <span class="text-[11px] font-bold text-[--primary]">Enregistrer une Parcelle</span>
                 </div>
                 <mat-icon class="!text-sm text-[--primary] opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</mat-icon>
              </button>
              <button class="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all group" routerLink="/portal">
                 <div class="flex items-center gap-3">
                   <mat-icon class="!text-lg text-slate-400">verified_user</mat-icon>
                   <span class="text-[11px] font-bold text-white">Vérifier un Titre</span>
                 </div>
                 <mat-icon class="!text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</mat-icon>
              </button>
              <button class="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all group" routerLink="/map">
                 <div class="flex items-center gap-3">
                   <mat-icon class="!text-lg text-slate-400">map</mat-icon>
                   <span class="text-[11px] font-bold text-white">Visualiser le SIG</span>
                 </div>
                 <mat-icon class="!text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</mat-icon>
              </button>
            </div>
          </div>

          <!-- Compliance Report Highlights -->
          <div class="glass-card p-5 space-y-4">
            <h3 class="text-xs font-bold text-white uppercase tracking-widest">Rapport de Conformité Brazzaville</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                 <span class="text-[10px] text-slate-400">Immuabilité des Titres</span>
                 <span class="text-[10px] font-bold text-[--primary]">100%</span>
              </div>
              <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full bg-[--primary]" [style.width]="'100%'"></div>
              </div>
              <div class="flex justify-between items-center pt-2">
                 <span class="text-[10px] text-slate-400">Délais de Signature COMMUNITY</span>
                 <span class="text-[10px] font-bold text-amber-500">2.4 Jours</span>
              </div>
              <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div class="h-full bg-amber-500" [style.width]="'75%'"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class Home {
  private fancierChain = inject(FancierChain);
  stats = signal<any>(null);

  constructor() {
    this.loadStats();
  }

  async loadStats() {
    try {
      const data = await this.fancierChain.getDashboardStats();
      this.stats.set(data);
    } catch (e) {
      console.error("Stats error", e);
    }
  }

  recentActivity = [
    { id: 1, name: 'Jean-Baptiste Mouakala', action: 'Draft Initié', location: 'Bacongo', status: 'Confirmé', time: '3 min' },
    { id: 2, name: 'Marie-Claire Ngoma', action: 'Validation Communautaire', location: 'Poto-Poto', status: 'Vérifié', time: '11 min' },
    { id: 3, name: 'Théodore Loemba', action: 'Titre Finalisé On-Chain', location: 'Moungali', status: 'Confirmé', time: '28 min' },
    { id: 4, name: 'Angélique Bouanga', action: 'Transfert de propriété', location: 'Talangaï', status: 'En attente', time: '45 min' },
    { id: 5, name: 'Prosper Kiminou', action: 'Signalement Anomalie', location: 'Madibou', status: 'Litige', time: '1 h' },
  ];
}

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card hover-glow p-5 flex flex-col gap-4 transition-200">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
              <mat-icon>location_on</mat-icon>
            </div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+128 ce mois</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">14 832</div>
            <div class="text-[11px] text-slate-500 font-medium">Parcelles Enregistrées</div>
          </div>
        </div>

        <div class="glass-card hover-glow p-5 flex flex-col gap-4 transition-200">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
              <mat-icon>verified_user</mat-icon>
            </div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+47 aujourd'hui</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">9 241</div>
            <div class="text-[11px] text-slate-500 font-medium">Titres Vérifiés</div>
          </div>
        </div>

        <div class="glass-card hover-glow p-5 flex flex-col gap-4 transition-200">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400">
              <mat-icon>gavel</mat-icon>
            </div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">-12% vs mois dernier</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">1 093</div>
            <div class="text-[11px] text-slate-500 font-medium">Litiges Résolus</div>
          </div>
        </div>

        <div class="glass-card hover-glow p-5 flex flex-col gap-4 transition-200">
          <div class="flex items-center justify-between">
            <div class="h-10 w-10 rounded-lg bg-[#10b98110] flex items-center justify-center text-[--primary]">
              <mat-icon>link</mat-icon>
            </div>
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">+2 340 cette semaine</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">38 560</div>
            <div class="text-[11px] text-slate-500 font-medium">Transactions Blockchain</div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Recent Activity -->
        <div class="lg:col-span-2 glass-card flex flex-col">
          <div class="p-5 border-b border-[--border-subtle] flex justify-between items-center">
            <div class="flex gap-4">
              <button class="px-4 py-1.5 rounded-lg bg-[#10b98115] text-[--primary] text-[11px] font-bold transition-all">Activité Récente</button>
              <button class="px-4 py-1.5 rounded-lg text-slate-500 text-[11px] font-bold hover:bg-white/5 transition-all">Blocs Blockchain</button>
            </div>
            <button class="text-[10px] text-[--primary] font-bold hover:underline">Voir tout</button>
          </div>
          
          <div class="p-0 overflow-hidden">
            @for (item of recentActivity; track item.id) {
              <div class="flex items-center gap-4 px-6 py-4 border-b border-[--border-subtle] last:border-0 hover:bg-white/5 transition-all group">
                <div class="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 group-hover:text-[--primary] transition-colors">
                  <mat-icon>person</mat-icon>
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

        <!-- Right Panels -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="glass-card p-5">
            <h3 class="text-xs font-bold text-white uppercase tracking-widest mb-4">Actions Rapides</h3>
            <div class="space-y-2">
              <button class="w-full flex items-center justify-between p-3 rounded-lg bg-[#10b98120] border border-[#10b98140] hover:bg-[#10b98130] transition-all group" routerLink="/dashboard">
                 <div class="flex items-center gap-3">
                   <mat-icon class="!text-lg text-[--primary]">description</mat-icon>
                   <span class="text-[11px] font-bold text-[--primary]">Nouvelle Parcelle</span>
                 </div>
                 <mat-icon class="!text-sm text-[--primary] opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</mat-icon>
              </button>
              <button class="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all group" routerLink="/portal">
                 <div class="flex items-center gap-3">
                   <mat-icon class="!text-lg text-slate-400">search</mat-icon>
                   <span class="text-[11px] font-bold text-white">Vérifier un Titre</span>
                 </div>
              </button>
              <button class="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all group" routerLink="/registry">
                 <div class="flex items-center gap-3">
                   <mat-icon class="!text-lg text-slate-400">link</mat-icon>
                   <span class="text-[11px] font-bold text-white">Consulter le Ledger</span>
                 </div>
              </button>
              <button class="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all group" routerLink="/reports">
                 <div class="flex items-center gap-3">
                   <mat-icon class="!text-lg text-slate-400">analytics</mat-icon>
                   <span class="text-[11px] font-bold text-white">Générer un Rapport</span>
                 </div>
              </button>
            </div>
          </div>

          <!-- Network Health -->
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-white uppercase tracking-widest">Santé du Réseau</h3>
              <div class="flex items-center gap-2">
                <div class="h-1.5 w-1.5 rounded-full bg-[--primary]"></div>
                <span class="text-[9px] text-[--primary] font-bold uppercase">Opérationnel</span>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[10px] text-slate-500">Noeuds Actifs</span>
                  <span class="text-[10px] font-mono text-white">24/24</span>
                </div>
                <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-[--primary] w-full"></div>
                </div>
              </div>
              
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[10px] text-slate-500">Latence Réseau</span>
                  <span class="text-[10px] font-mono text-white">42ms</span>
                </div>
                <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-[--primary] w-[85%]"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[10px] text-slate-500">Intégrité des Données</span>
                  <span class="text-[10px] font-mono text-white">100%</span>
                </div>
                <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-[--primary] w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- District Distribution -->
      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xs font-bold text-white uppercase tracking-widest">Répartition par District — Brazzaville</h3>
          <span class="text-[10px] text-slate-500">Mise à jour en temps réel</span>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
           @for (district of districts; track district.name) {
             <div class="space-y-3">
               <div class="text-center">
                 <div class="text-[14px] font-bold text-white">{{ district.count }}</div>
                 <div class="text-[9px] text-slate-500 uppercase mb-2">{{ district.name }}</div>
               </div>
               <div class="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div class="h-full bg-[--primary]" [style.width]="district.percentage + '%'"></div>
               </div>
               <div class="text-center text-[9px] font-bold text-[--primary]">{{ district.percentage }}%</div>
             </div>
           }
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class Home {
  recentActivity = [
    { id: 1, name: 'Jean-Baptiste Mouakala', action: 'Titre enregistré', location: 'Bacongo', status: 'Confirmé', time: '3 min' },
    { id: 2, name: 'Marie-Claire Ngoma', action: 'Vérification effectuée', location: 'Poto-Poto', status: 'Vérifié', time: '11 min' },
    { id: 3, name: 'Théodore Loemba', action: 'Transfert de propriété', location: 'Moungali', status: 'En attente', time: '28 min' },
    { id: 4, name: 'Angélique Bouanga', action: 'Titre enregistré', location: 'Talangaï', status: 'Confirmé', time: '45 min' },
    { id: 5, name: 'Prosper Kiminou', action: 'Litige signalé', location: 'Madibou', status: 'Litige', time: '1 h' },
    { id: 6, name: 'Célestine Mabika', action: 'Titre enregistré', location: 'Djiri', status: 'Confirmé', time: '1 h 20min' },
  ];

  districts = [
    { name: 'Bacongo', count: '2,841', percentage: 85 },
    { name: 'Poto-Poto', count: '3,102', percentage: 92 },
    { name: 'Moungali', count: '1,987', percentage: 71 },
    { name: 'Talangaï', count: '2,234', percentage: 78 },
    { name: 'Madibou', count: '1,654', percentage: 63 },
    { name: 'Djiri', count: '3,014', percentage: 88 },
  ];
}

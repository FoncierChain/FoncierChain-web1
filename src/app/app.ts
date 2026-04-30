import {ChangeDetectionStrategy, Component, signal, inject} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive, Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {auth} from './firebase';
import {User, signOut} from 'firebase/auth';
import { NetworkBackground } from './components/network-background';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, NetworkBackground],
  template: `
    <div class="flex h-screen overflow-hidden bg-[--bg-dark] text-white relative">
      <app-network-background></app-network-background>
      
      <!-- Sidebar Overlay (Mobile) -->
      @if (sidebarOpen()) {
        <button class="fixed inset-0 bg-black/80 z-40 lg:hidden w-full h-full border-none cursor-default backdrop-blur-sm" 
                (click)="toggleSidebar()"
                aria-label="Close sidebar"></button>
      }

      <!-- Sidebar -->
      <aside [class.translate-x-0]="sidebarOpen()" 
             [class.-translate-x-full]="!sidebarOpen()"
             class="fixed inset-y-0 left-0 w-64 bg-[--bg-sidebar] flex flex-col pt-6 pb-4 shrink-0 z-50 border-r border-[--border-subtle] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0">
        
        <!-- Brand -->
        <div class="px-6 mb-8">
          <div class="flex items-center gap-3 cursor-pointer" routerLink="/">
            <div class="w-10 h-10 rounded-lg bg-[--bg-card] border border-[--border-subtle] flex items-center justify-center">
              <mat-icon class="!text-[--primary] text-2xl">grid_view</mat-icon>
            </div>
            <div>
              <div class="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Foncier<span class="text-[--primary]">Chain</span>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile (Agent) -->
        @if (user()) {
          <div class="px-4 mb-6">
            <div class="p-3 bg-[--bg-card] border border-[--border-subtle] rounded-xl flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[--primary]">
                <mat-icon>person</mat-icon>
              </div>
              <div class="overflow-hidden">
                <div class="text-[11px] font-bold text-[--primary] truncate">Agent Foncier</div>
                <div class="text-[10px] text-slate-400 truncate">{{ user()?.email }}</div>
                <div class="text-[9px] text-slate-500">Brazzaville — Niveau 2</div>
              </div>
            </div>
          </div>
        }

        <!-- Navigation -->
        <nav class="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
          <a routerLink="/" routerLinkActive="bg-[#10b98115] !text-[--primary] border-r-2 border-[--primary]" [routerLinkActiveOptions]="{exact: true}"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <mat-icon class="!text-lg">dashboard</mat-icon>
            Tableau de Bord
          </a>

          <a routerLink="/map" routerLinkActive="bg-[#10b98115] !text-[--primary] border-r-2 border-[--primary]"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <mat-icon class="!text-lg">map</mat-icon>
            Carte des Parcelles
          </a>

          <a routerLink="/register" routerLinkActive="bg-[#10b98115] !text-[--primary] border-r-2 border-[--primary]"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <mat-icon class="!text-lg">add_circle_outline</mat-icon>
            Enregistrer une Parcelle
          </a>

          <a routerLink="/transfer" routerLinkActive="bg-[#10b98115] !text-[--primary] border-r-2 border-[--primary]"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <mat-icon class="!text-lg">swap_horiz</mat-icon>
            Mutation (Transfert)
          </a>

          <a routerLink="/portal" routerLinkActive="bg-[#10b98115] !text-[--primary] border-r-2 border-[--primary]"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <mat-icon class="!text-lg">smartphone</mat-icon>
            Portail Citoyen
          </a>

          <a routerLink="/registry" routerLinkActive="bg-[#10b98115] !text-[--primary] border-r-2 border-[--primary]"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <mat-icon class="!text-lg">account_balance</mat-icon>
            Registre Public
          </a>

          <a routerLink="/reports" routerLinkActive="bg-[#10b98115] !text-[--primary] border-r-2 border-[--primary]"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <mat-icon class="!text-lg">description</mat-icon>
            Rapports
          </a>

          <a routerLink="/settings" routerLinkActive="bg-[#10b98115] !text-[--primary] border-r-2 border-[--primary]"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <mat-icon class="!text-lg">settings</mat-icon>
            Paramètres
          </a>

          <a routerLink="/help" routerLinkActive="bg-[#10b98115] !text-[--primary] border-r-2 border-[--primary]"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <mat-icon class="!text-lg">help_outline</mat-icon>
            Aide & FAQ
          </a>
        </nav>

        <!-- Footer Info -->
        <div class="px-4 mt-auto pt-4 space-y-4">
          <div class="p-3 bg-[#10b98110] rounded-xl flex items-center gap-3">
             <div class="h-2 w-2 rounded-full bg-[--primary] animate-pulse"></div>
             <div class="text-[10px] font-bold text-[--primary] uppercase tracking-wider">Mainnet Opérationnel</div>
          </div>
          <button (click)="logout()" class="w-full flex items-center gap-2 px-4 py-2 text-[10px] text-slate-500 hover:text-white transition-colors">
            <mat-icon class="!text-sm">logout</mat-icon>
            Déconnexion
          </button>
          <div class="text-[9px] text-slate-600 px-4">
            ← Retour au site
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden w-full relative">
        <header class="h-16 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div class="flex items-center gap-4">
            <button class="lg:hidden p-2 text-white/70 hover:bg-white/5 rounded-lg" (click)="toggleSidebar()">
              <mat-icon>menu</mat-icon>
            </button>
            <div class="flex flex-col">
              <h1 class="text-sm lg:text-lg font-bold text-white leading-tight">
                {{ getPageTitle() }}
              </h1>
              <p class="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                {{ getPageSubtitle() }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            @if (!router.url.includes('/register')) {
              <button class="hidden md:flex items-center gap-2 bg-[--primary] hover:bg-[--primary-hover] text-white px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg shadow-[--primary]/10"
                      routerLink="/register">
                <mat-icon class="!text-sm">add_circle</mat-icon>
                ENREGISTRER
              </button>
            }
            <button class="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <mat-icon class="!text-lg">notifications</mat-icon>
            </button>
            <button class="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <mat-icon class="!text-lg">help_outline</mat-icon>
            </button>
            <div class="h-8 w-8 rounded-lg bg-[--bg-card] border border-[--border-subtle] flex items-center justify-center text-slate-400 cursor-pointer hover:border-[--primary] transition-all">
              <mat-icon class="!text-lg">person</mat-icon>
            </div>
          </div>
        </header>

        <!-- View Wrapper -->
        <div class="flex-1 overflow-y-auto px-6 lg:px-10 pb-10">
          <router-outlet></router-outlet>
        </div>

        <div class="fixed bottom-3 right-3 text-[10px] font-mono text-slate-700 pointer-events-none">
          <mat-icon class="!text-[10px] inline-block !w-auto !h-auto">schedule</mat-icon>
          03:03:47
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class App {
  public router = inject(Router);
  sidebarOpen = signal(false);
  user = signal<User | null>(null);

  constructor() {
    auth.onAuthStateChanged(u => this.user.set(u));
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebarOnMobile() {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  async logout() {
    await signOut(auth);
    this.router.navigate(['/']);
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url === '/' || url === '') return 'Tableau de Bord';
    if (url.includes('/register')) return 'Enregistrement';
    if (url.includes('/transfer')) return 'Mutation Foncier';
    if (url.includes('/portal')) return 'Portail Citoyen';
    if (url.includes('/registry')) return 'Registre Public';
    if (url.includes('/map')) return 'Carte des Parcelles';
    if (url.includes('/reports')) return 'Rapports Analytiques';
    if (url.includes('/settings')) return 'Paramètres du Système';
    if (url.includes('/help')) return 'Aide & FAQ';
    return 'FoncierChain';
  }

  getPageSubtitle(): string {
    const url = this.router.url;
    if (url === '/') return 'Vue d’ensemble visuelle du registre foncier';
    if (url.includes('/register')) return 'Gestion et enregistrement des titres fonciers';
    if (url.includes('/transfer')) return 'Transfert de propriété et mutation de ledger';
    if (url.includes('/portal')) return 'Vérification instantanée pour les citoyens';
    if (url.includes('/registry')) return 'Ledger immuable et public des transactions';
    if (url.includes('/map')) return 'Visualisation géographique du cadastre';
    if (url.includes('/reports')) return 'Rapports détaillés et audit des données';
    if (url.includes('/help')) return 'Guides utilisateur et questions fréquentes';
    return 'Portail sécurisé de gestion foncière';
  }
}

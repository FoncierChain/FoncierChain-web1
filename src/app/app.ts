import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {auth} from './firebase';
import {User} from 'firebase/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-bg-light relative">
      <!-- Sidebar Overlay (Mobile) -->
      @if (sidebarOpen()) {
        <button class="fixed inset-0 bg-black/50 z-40 lg:hidden w-full h-full border-none cursor-default" 
                (click)="toggleSidebar()"
                aria-label="Close sidebar"></button>
      }

      <!-- Sidebar -->
      <aside [class.translate-x-0]="sidebarOpen()" 
             [class.-translate-x-full]="!sidebarOpen()"
             class="fixed inset-y-0 left-0 w-64 bg-sidebar-bg flex flex-col p-6 text-white shrink-0 z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0">
        
        <div class="flex items-center justify-between mb-10">
          <div class="flex items-center gap-3 cursor-pointer" routerLink="/">
            <div class="w-1 h-8 bg-gradient-to-b from-congo-green via-congo-yellow to-congo-red"></div>
            <div>
              <div class="text-base font-extrabold tracking-tight">FoncierChain</div>
              <div class="text-[10px] opacity-70 tracking-widest uppercase">Rép. du Congo</div>
            </div>
          </div>
          <button class="lg:hidden text-white/70 hover:text-white" (click)="toggleSidebar()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <nav class="flex flex-col gap-2">
          <a routerLink="/" routerLinkActive="!bg-congo-green" [routerLinkActiveOptions]="{exact: true}"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            <mat-icon class="!text-lg">dashboard</mat-icon>
            Tableau de Bord
          </a>
          <a routerLink="/portal" routerLinkActive="!bg-congo-green"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            <mat-icon class="!text-lg">search</mat-icon>
            Vérification Publique
          </a>
          <a routerLink="/map" routerLinkActive="!bg-congo-green"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            <mat-icon class="!text-lg">map</mat-icon>
            Carte Interactive
          </a>
          <a routerLink="/dashboard" routerLinkActive="!bg-congo-green"
             (click)="closeSidebarOnMobile()"
             class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            <mat-icon class="!text-lg">admin_panel_settings</mat-icon>
            Espace Agent
          </a>
        </nav>

        <div class="mt-auto pt-5 border-t border-white/10">
          <div class="text-[10px] opacity-60 mb-1 uppercase tracking-wider font-bold">Projet</div>
          <div class="text-sm font-semibold mb-3">FoncierChain (CG-01)</div>
          
          <div class="text-[10px] opacity-60 mb-1 uppercase tracking-wider font-bold">Équipe</div>
          <div class="text-sm font-semibold">AfriChain solutions</div>
          
          <div class="text-[10px] text-congo-yellow mt-4 flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-congo-green animate-pulse"></span>
            Serveur Sécurisé Actif
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden w-full">
        <header class="h-16 bg-white border-b border-border-color flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div class="flex items-center gap-4">
            <button class="lg:hidden p-2 text-sidebar-bg hover:bg-bg-light rounded-lg" (click)="toggleSidebar()">
              <mat-icon>menu</mat-icon>
            </button>
            <div class="flex flex-col">
              <h1 class="text-sm lg:text-lg font-bold text-sidebar-bg leading-tight truncate max-w-[200px] lg:max-w-none">
                Système National de Gestion Foncière
              </h1>
              <p class="text-[9px] lg:text-[11px] text-text-muted uppercase tracking-wider font-semibold">Brazzaville • Portail de Validation</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2 lg:gap-4">
            <div class="bg-bg-light px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg border border-border-color flex items-center gap-2">
              <span class="h-2 w-2 rounded-full" [class.bg-congo-green]="user()" [class.bg-congo-red]="!user()"></span>
              <span class="text-[10px] lg:text-xs font-bold text-sidebar-bg">{{ user() ? 'Agent Connecté' : 'Mode Public' }}</span>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-4 lg:p-8 bg-bg-light">
          <router-outlet></router-outlet>
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
  sidebarOpen = signal(false);
  user = signal<User | null>(null);

  constructor() {
    auth.onAuthStateChanged(u => this.user.set(u));
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebarOnMobile() {
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }
}

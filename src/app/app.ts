import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <div class="flex h-screen overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-60 bg-sidebar-bg flex flex-col p-6 text-white shrink-0">
        <div class="flex items-center gap-3 mb-10 cursor-pointer" routerLink="/">
          <div class="w-1 h-8 bg-gradient-to-b from-congo-green via-congo-yellow to-congo-red"></div>
          <div>
            <div class="text-base font-extrabold tracking-tight">CADASTRE</div>
            <div class="text-[10px] opacity-70 tracking-widest uppercase">Rép. du Congo</div>
          </div>
        </div>

        <nav class="flex flex-col gap-2">
          <a routerLink="/" routerLinkActive="!bg-congo-green" [routerLinkActiveOptions]="{exact: true}"
             class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            <mat-icon class="!text-lg">dashboard</mat-icon>
            Tableau de Bord
          </a>
          <a routerLink="/portal" routerLinkActive="!bg-congo-green"
             class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            <mat-icon class="!text-lg">search</mat-icon>
            Vérification Publique
          </a>
          <a routerLink="/map" routerLinkActive="!bg-congo-green"
             class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            <mat-icon class="!text-lg">map</mat-icon>
            Carte Interactive
          </a>
          <a routerLink="/dashboard" routerLinkActive="!bg-congo-green"
             class="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
            <mat-icon class="!text-lg">admin_panel_settings</mat-icon>
            Espace Agent
          </a>
        </nav>

        <div class="mt-auto pt-5 border-t border-white/10">
          <div class="text-xs opacity-60 mb-1">Système National</div>
          <div class="text-sm font-semibold">FoncierChain v1.0</div>
          <div class="text-[10px] text-congo-yellow mt-1 flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-congo-green animate-pulse"></span>
            Serveur Sécurisé Actif
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <header class="h-16 bg-white border-b border-border-color flex items-center justify-between px-8 shrink-0">
          <div class="flex flex-col">
            <h1 class="text-lg font-bold text-sidebar-bg leading-tight">Système National de Gestion Foncière</h1>
            <p class="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Brazzaville • Portail de Validation</p>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="bg-bg-light px-4 py-2 rounded-lg border border-border-color flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-congo-green"></span>
              <span class="text-xs font-bold text-sidebar-bg">Connecté</span>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-8 bg-bg-light">
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
export class App {}

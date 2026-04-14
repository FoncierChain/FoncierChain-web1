import {ChangeDetectionStrategy, Component, AfterViewInit, inject, PLATFORM_ID} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {isPlatformBrowser} from '@angular/common';
import {animate, stagger} from "motion";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="space-y-8">
      <!-- Hero Section -->
      <section class="sleek-card !p-12 relative overflow-hidden bg-white">
        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-congo-green/10 text-congo-green text-xs font-bold uppercase tracking-wider mb-6">
            <mat-icon class="!text-sm">verified</mat-icon>
            AfriChain solutions Numérique Officiel
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold text-sidebar-bg mb-6 leading-tight">
            Sécurisez votre patrimoine foncier à <span class="text-congo-green">Brazzaville</span>.
          </h1>
          <p class="text-lg text-text-muted mb-8 leading-relaxed">
            AfriChain solutions utilise la technologie blockchain pour garantir l'immutabilité des titres de propriété et éliminer la double attribution des parcelles.
          </p>
          <div class="flex flex-wrap gap-4">
            <button class="sleek-btn-primary !h-12 !px-8" routerLink="/portal">
              Vérifier une parcelle
            </button>
            <button class="px-8 py-3 rounded-lg border border-border-color font-semibold hover:bg-gray-50 transition-colors" routerLink="/map">
              Explorer la carte
            </button>
          </div>
        </div>
        
        <!-- Decorative Flag Strip -->
        <div class="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
          <div class="h-full w-full bg-gradient-to-l from-congo-green via-congo-yellow to-congo-red"></div>
        </div>
      </section>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="sleek-card flex items-center gap-6 animate-item">
          <div class="h-14 w-14 rounded-2xl bg-congo-green/10 flex items-center justify-center text-congo-green">
            <mat-icon class="!text-3xl">map</mat-icon>
          </div>
          <div>
            <div class="text-2xl font-bold text-sidebar-bg">12,450+</div>
            <div class="text-xs text-text-muted font-semibold uppercase tracking-wider">Parcelles Enregistrées</div>
          </div>
        </div>
        <div class="sleek-card flex items-center gap-6 animate-item">
          <div class="h-14 w-14 rounded-2xl bg-congo-yellow/10 flex items-center justify-center text-congo-yellow">
            <mat-icon class="!text-3xl">history</mat-icon>
          </div>
          <div>
            <div class="text-2xl font-bold text-sidebar-bg">100%</div>
            <div class="text-xs text-text-muted font-semibold uppercase tracking-wider">Historique Immuable</div>
          </div>
        </div>
        <div class="sleek-card flex items-center gap-6 animate-item">
          <div class="h-14 w-14 rounded-2xl bg-congo-red/10 flex items-center justify-center text-congo-red">
            <mat-icon class="!text-3xl">security</mat-icon>
          </div>
          <div>
            <div class="text-2xl font-bold text-sidebar-bg">Zéro</div>
            <div class="text-xs text-text-muted font-semibold uppercase tracking-wider">Litiges de Double Vente</div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="sleek-card animate-item">
          <div class="sleek-card-header">
            <span class="sleek-card-title">Portail de Vérification</span>
            <mat-icon class="text-congo-green">search</mat-icon>
          </div>
          <p class="text-sm text-text-muted mb-6 leading-relaxed">
            Accédez instantanément au propriétaire légal actuel et à l'historique complet des transactions d'une parcelle en entrant son identifiant unique.
          </p>
          <button class="sleek-btn-primary !h-10 !px-6 !text-sm" routerLink="/portal">Accéder au portail</button>
        </div>

        <div class="sleek-card animate-item">
          <div class="sleek-card-header">
            <span class="sleek-card-title">Carte Interactive</span>
            <mat-icon class="text-congo-yellow">explore</mat-icon>
          </div>
          <p class="text-sm text-text-muted mb-6 leading-relaxed">
            Visualisez le cadastre de Brazzaville en temps réel via AfriChain solutions. Cliquez sur n'importe quelle parcelle pour voir son statut de validation et son certificat numérique.
          </p>
          <button class="sleek-btn-primary !h-10 !px-6 !text-sm" routerLink="/map">Voir la carte</button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class Home implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const items = document.querySelectorAll('.animate-item');
      animate(
        items,
        { opacity: [0, 1], y: [20, 0] },
        { delay: stagger(0.1), duration: 0.6, ease: "easeOut" }
      );
    }
  }
}

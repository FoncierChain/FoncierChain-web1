import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatExpansionModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
      
      <!-- Hero Section -->
      <div class="text-center space-y-4 py-8">
        <h1 class="text-4xl font-bold text-white tracking-tight">Centre d'Aide & FAQ</h1>
        <p class="text-slate-400 max-w-2xl mx-auto text-sm">
          Tout ce que vous devez savoir sur FoncierChain : du fonctionnement de la blockchain à la gestion de vos parcelles.
        </p>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-[--primary]/30 transition-all cursor-pointer group">
          <div class="h-12 w-12 rounded-2xl bg-[--primary]/10 flex items-center justify-center text-[--primary] group-hover:scale-110 transition-transform">
             <mat-icon>school</mat-icon>
          </div>
          <h3 class="font-bold text-white text-sm">Guide de Démarrage</h3>
          <p class="text-[11px] text-slate-500">Apprenez à utiliser l'interface en 5 minutes.</p>
        </div>
        <div class="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-blue-400/30 transition-all cursor-pointer group">
          <div class="h-12 w-12 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
             <mat-icon>token</mat-icon>
          </div>
          <h3 class="font-bold text-white text-sm">Concepts Blockchain</h3>
          <p class="text-[11px] text-slate-500">Pourquoi vos titres sont-ils immuables ?</p>
        </div>
        <div class="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-amber-400/30 transition-all cursor-pointer group">
          <div class="h-12 w-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
             <mat-icon>support_agent</mat-icon>
          </div>
          <h3 class="font-bold text-white text-sm">Support Technique</h3>
          <p class="text-[11px] text-slate-500">Besoin d'aide ? Contactez nos agents SIG.</p>
        </div>
      </div>

      <!-- FAQ Accordion -->
      <div class="space-y-6">
        <h2 class="text-xl font-bold text-white flex items-center gap-3">
          <mat-icon class="text-[--primary]">quiz</mat-icon>
          Questions Fréquentes
        </h2>

        <div class="glass-card overflow-hidden divide-y divide-white/5">
          <mat-accordion multi="true" class="custom-accordion">
            
            <mat-expansion-panel class="!bg-transparent !shadow-none">
              <mat-expansion-panel-header class="!h-16">
                <mat-panel-title class="!text-xs font-bold text-slate-200">
                  Comment vérifier l'authenticité d'une parcelle ?
                </mat-panel-title>
              </mat-expansion-panel-header>
              <div class="pb-6 text-xs text-slate-400 leading-relaxed">
                Utilisez l'onglet <strong>Vérification</strong> et entrez l'ID de la parcelle (ex: BZV-2024-8821). 
                Le système interrogera le ledger blockchain pour vous montrer l'historique complet et le Hash de signature unique.
              </div>
            </mat-expansion-panel>

            <mat-expansion-panel class="!bg-transparent !shadow-none">
              <mat-expansion-panel-header class="!h-16">
                <mat-panel-title class="!text-xs font-bold text-slate-200">
                  Qu'est-ce que l'immuabilité blockchain ?
                </mat-panel-title>
              </mat-expansion-panel-header>
              <div class="pb-6 text-xs text-slate-400 leading-relaxed">
                Une fois qu'un titre foncier est enregistré sur FoncierChain, il ne peut être modifié ou supprimé sans laisser de trace. 
                Chaque transaction est cryptographiquement liée à la précédente, rendant toute fraude impossible sans corrompre l'ensemble du réseau.
              </div>
            </mat-expansion-panel>

            <mat-expansion-panel class="!bg-transparent !shadow-none">
              <mat-expansion-panel-header class="!h-16">
                <mat-panel-title class="!text-xs font-bold text-slate-200">
                  Que faire en cas de litige ?
                </mat-panel-title>
              </mat-expansion-panel-header>
              <div class="pb-6 text-xs text-slate-400 leading-relaxed">
                Si une parcelle est marquée comme "En Litige", les transactions sont bloquées par le smart contract. 
                Veuillez vous rendre au bureau du cadastre avec vos documents originaux pour une résolution administrative et une mise à jour du ledger.
              </div>
            </mat-expansion-panel>

            <mat-expansion-panel class="!bg-transparent !shadow-none">
              <mat-expansion-panel-header class="!h-16">
                <mat-panel-title class="!text-xs font-bold text-slate-200">
                  Comment sont calculées les coordonnées SIG ?
                </mat-panel-title>
              </mat-expansion-panel-header>
              <div class="pb-6 text-xs text-slate-400 leading-relaxed">
                Nos agents utilisent des relevés GPS de précision centimétrique (RTK). Ces données sont ensuite injectées dans notre système 
                et visualisées sur la carte interactive pour délimiter physiquement et numériquement votre propriété.
              </div>
            </mat-expansion-panel>

          </mat-accordion>
        </div>
      </div>

      <!-- Troubleshooting Section -->
      <div class="glass-card p-8 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/10">
        <div class="flex items-start gap-6">
          <div class="p-4 rounded-2xl bg-red-400/10 text-red-400">
            <mat-icon class="!text-3xl">report_problem</mat-icon>
          </div>
          <div class="space-y-4">
            <h3 class="text-lg font-bold text-white">Résolution de Problèmes</h3>
            <div class="space-y-3">
              <div class="flex items-start gap-3">
                <div class="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5"></div>
                <p class="text-[11px] text-slate-400"><strong>Erreur de Signature :</strong> Vérifiez votre connexion au nœud principal dans les paramètres.</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5"></div>
                <p class="text-[11px] text-slate-400"><strong>Carte Blanche :</strong> Assurez-vous que le service de cartographie n'est pas bloqué par un pare-feu.</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5"></div>
                <p class="text-[11px] text-slate-400"><strong>Données non-indexées :</strong> Les nouveaux enregistrements peuvent prendre jusqu'à 30 secondes pour apparaître sur tous les nœuds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact CTA -->
      <div class="text-center space-y-6 pt-10">
        <h3 class="text-lg font-bold text-white">Toujours besoin d'aide ?</h3>
        <button class="bg-[--primary] hover:bg-[--primary-hover] text-white px-8 py-3 rounded-xl text-xs font-bold transition-all shadow-xl shadow-[--primary]/20">
          Contacter un Agent AfriChain
        </button>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .custom-accordion .mat-expansion-panel-header-title {
      font-size: 13px !important;
    }
    ::ng-deep .custom-accordion .mat-expansion-indicator::after {
      color: var(--primary) !important;
    }
    ::ng-deep .mat-expansion-panel {
      font-family: inherit !important;
    }
  `]
})
export class Help {}

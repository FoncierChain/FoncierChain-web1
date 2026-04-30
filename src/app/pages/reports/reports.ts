import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FancierChain} from '../../services/fancier-chain';

interface AuditLog {
  id: string;
  timestamp: Date;
  agent: string;
  action: string;
  entity: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

interface DistributionData {
  district: string;
  total: number;
  area: number;
  compliance: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Top Actions -->
      <div class="flex justify-between items-center">
        <div class="flex gap-4">
          <button class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <mat-icon class="!text-sm">file_download</mat-icon>
            Exporter PDF
          </button>
          <button class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2">
            <mat-icon class="!text-sm">table_view</mat-icon>
            Exporter CSV
          </button>
        </div>
        <div class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          Dernière mise à jour : {{ lastUpdate | date:'shortTime' }}
        </div>
      </div>

      <!-- Compliance Table -->
      <div class="glass-card overflow-hidden">
        <div class="p-5 border-b border-white/5">
          <h3 class="text-xs font-bold text-white uppercase tracking-widest">Rapport de Conformité par District (Live Data)</h3>
        </div>
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] text-slate-500 uppercase font-bold border-b border-white/5 bg-white/5">
              <th class="px-6 py-4">District</th>
              <th class="px-6 py-4">Titres enregistrés</th>
              <th class="px-6 py-4">Surface Totale (m²)</th>
              <th class="px-6 py-4">Taux de Validation</th>
              <th class="px-6 py-4">État</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            @for (item of distribution(); track item.district) {
              <tr class="hover:bg-white/5 transition-colors">
                <td class="px-6 py-4 text-xs font-bold text-white">{{ item.district }}</td>
                <td class="px-6 py-4 text-xs text-white">{{ item.total }}</td>
                <td class="px-6 py-4 text-xs text-slate-400">{{ item.area | number }} m²</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-[--primary]" [style.width]="item.compliance + '%'"></div>
                    </div>
                    <span class="text-[10px] font-mono text-white">{{ item.compliance }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                   <div class="flex items-center gap-2">
                     <div class="h-1.5 w-1.5 rounded-full" [class.bg-[--primary]]="item.compliance > 80" [class.bg-amber-400]="item.compliance <= 80"></div>
                     <span class="text-[9px] font-bold text-slate-400 italic">En Règle</span>
                   </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Audit Logs Table -->
      <div class="glass-card overflow-hidden">
        <div class="p-5 border-b border-white/5">
          <h3 class="text-xs font-bold text-white uppercase tracking-widest">Journaux d'Audit (Transaction Logs)</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-[10px] text-slate-500 uppercase font-bold border-b border-white/5 bg-white/5">
                <th class="px-6 py-4">Horodatage</th>
                <th class="px-6 py-4">Agent ID</th>
                <th class="px-6 py-4">Action Blockchain</th>
                <th class="px-6 py-4">Identifiant Entité</th>
                <th class="px-6 py-4">État</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (log of auditLogs; track log.id) {
                <tr class="hover:bg-white/5 transition-colors group">
                  <td class="px-6 py-4 text-[10px] text-slate-400">{{ log.timestamp | date:'medium' }}</td>
                  <td class="px-6 py-4 text-xs font-mono text-white uppercase">{{ log.agent }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                       <mat-icon class="!text-sm" [class.text-[--primary]]="log.action === 'CREATE'" [class.text-blue-400]="log.action === 'TRANSFER'">
                        {{ log.action === 'CREATE' ? 'add_box' : 'swap_horiz' }}
                       </mat-icon>
                       <span class="text-xs text-white">{{ log.action }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-xs text-[--primary] font-mono">{{ log.entity }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded-md text-[8px] font-bold tracking-widest uppercase"
                          [class.bg-green-400/10]="log.status === 'SUCCESS'"
                          [class.text-green-400]="log.status === 'SUCCESS'"
                          [class.bg-amber-400/10]="log.status === 'WARNING'"
                          [class.text-amber-400]="log.status === 'WARNING'">
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="p-4 border-t border-white/5 bg-black/20 flex justify-center">
           <button class="text-[10px] font-bold text-[--primary] hover:underline uppercase tracking-widest">Charger plus de logs</button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class Reports implements OnInit {
  private fancierChain = inject(FancierChain);
  lastUpdate = new Date();
  
  distribution = signal<DistributionData[]>([]);

  auditLogs: AuditLog[] = [
    { id: '1', timestamp: new Date(Date.now() - 1000*60*5), agent: 'AGT-001', action: 'CREATE', entity: 'BZV-102', status: 'SUCCESS' },
    { id: '2', timestamp: new Date(Date.now() - 1000*60*15), agent: 'AGT-001', action: 'TRANSFER', entity: 'BZV-098', status: 'SUCCESS' },
    { id: '3', timestamp: new Date(Date.now() - 1000*60*28), agent: 'SYS-SRV', action: 'CREATE', entity: 'BZV-201', status: 'SUCCESS' },
    { id: '4', timestamp: new Date(Date.now() - 1000*60*42), agent: 'AGT-004', action: 'CREATE', entity: 'BZV-156', status: 'WARNING' },
    { id: '5', timestamp: new Date(Date.now() - 1000*60*55), agent: 'AGT-002', action: 'TRANSFER', entity: 'BZV-042', status: 'SUCCESS' },
    { id: '6', timestamp: new Date(Date.now() - 1000*60*65), agent: 'AGT-001', action: 'CREATE', entity: 'BZV-8821', status: 'SUCCESS' }
  ];

  async ngOnInit() {
    const data = await this.fancierChain.getReports();
    if (data && data.districts) {
      this.distribution.set(data.districts.map((d: any) => ({
        district: d.name,
        total: d.total,
        area: d.total * 1200, // Simulated area
        compliance: Math.round((d.finalized / d.total) * 100)
      })));
    }
  }

}

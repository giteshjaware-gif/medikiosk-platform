/**
 * MediKiosk Platform - Table 3.2 & 3.3 Software & AI Stack Explorer
 * Interactive specification table, architecture visualization & benchmark cards
 */

class StackExplorer {
  constructor() {
    this.stackData = window.MEDIKIOSK_STACK_DATA || {};
    this.activeFilter = 'all'; // 'all', 'module_a', 'module_b', 'module_c', 'module_d'
  }

  setFilter(filterId) {
    this.activeFilter = filterId;
    this.renderStackTable();
  }

  renderStackTable() {
    const tableContainer = document.getElementById('stack-table-container');
    if (!tableContainer) return;

    const modulesToDisplay = this.activeFilter === 'all'
      ? this.stackData.modules
      : this.stackData.modules.filter(m => m.id === this.activeFilter);

    let html = `
      <div class="space-y-6">
    `;

    modulesToDisplay.forEach(mod => {
      html += `
        <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  ${mod.code}
                </span>
                <h3 class="text-base font-bold text-white">${mod.name}</h3>
              </div>
              <p class="text-xs text-slate-400">${mod.tagline}</p>
            </div>
            <span class="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
              ABDM & DPDP Compliant
            </span>
          </div>

          <!-- Component Specifications Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950/60">
                  <th class="p-3">Subsystem Layer</th>
                  <th class="p-3">Technology & AI Models</th>
                  <th class="p-3">Specifications & SLA</th>
                  <th class="p-3">Clinical Function</th>
                  <th class="p-3">Standards & Protocols</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/80">
      `;

      mod.components.forEach(comp => {
        html += `
          <tr class="hover:bg-slate-800/40 transition-colors">
            <td class="p-3 font-semibold text-cyan-300 whitespace-nowrap align-top">
              ${comp.subsystem}
            </td>
            <td class="p-3 text-slate-200 align-top font-mono text-[11px]">
              ${comp.techStack}
            </td>
            <td class="p-3 text-slate-300 align-top leading-relaxed">
              ${comp.specifications}
            </td>
            <td class="p-3 text-slate-300 align-top leading-relaxed">
              ${comp.clinicalFunction}
            </td>
            <td class="p-3 text-emerald-400 align-top whitespace-nowrap font-mono text-[11px]">
              ${comp.standard}
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    tableContainer.innerHTML = html;
  }
}

window.StackExplorer = StackExplorer;

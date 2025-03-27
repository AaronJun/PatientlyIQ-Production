<!-- ProgramOverview.svelte -->
<script lang="ts">
    interface DataEntry {
        Company: string;
        Candidate: string;
        TherapeuticArea1: string;
        Indication: string;
        "Current Development Stage": string;
        "PRV Year": string;
        "Purchase Year": string;
        Purchased?: string;
        Purchaser: string;
        "Sale Price (USD Millions)": string;
        MarketCap?: string;
        effectiveStage?: string;
        "RPDD Year"?: string;
        "RPDD Date"?: string;
        "PRV Date"?: string;
        "Commercial stage"?: string;
        "PRV Status"?: string;
        "Approved Drug"?: string;
        "COUNTRY"?: string;
    }
    
    export let data: DataEntry[] = [];
    export let sectionTitle: string = "Economic Impact";
    
    // Helper functions to get top entries
    function getTopCompanies(data: DataEntry[], count: number) {
      const companyCounts = new Map<string, number>();
      data.forEach(d => {
        if (d.Company) {
          companyCounts.set(d.Company, (companyCounts.get(d.Company) || 0) + 1);
        }
      });
      
      return Array.from(companyCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, count);
    }
    
    function getTopAreas(data: DataEntry[], count: number) {
      const areaCounts = new Map<string, number>();
      data.forEach(d => {
        if (d.TherapeuticArea1) {
          areaCounts.set(d.TherapeuticArea1, (areaCounts.get(d.TherapeuticArea1) || 0) + 1);
        }
      });
      
      return Array.from(areaCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, count);
    }
    
    function getTopIndications(data: DataEntry[], count: number) {
      const indicationCounts = new Map<string, number>();
      data.forEach(d => {
        if (d.Indication) {
          indicationCounts.set(d.Indication, (indicationCounts.get(d.Indication) || 0) + 1);
        }
      });
      
      return Array.from(indicationCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, count);
    }
</script>

<section class="mb-6 px-8 md:px-12 lg:px-16" aria-labelledby="program-overview-header">
  <div 
    class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800">
    <div class="flex items-center gap-2">
      <h2 id="program-overview-header" class="text-3xl font-normal text-slate-700">{sectionTitle}</h2>
    </div>
  </div>
  
  <div 
    id="program-overview-content"
    class="section-content p-4 duration-300"
    role="region"
    aria-labelledby="program-overview-header"
  >
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white p-4 border border-slate-200">
        <h3 class="text-base font-medium text-slate-700 mb-2">Most Active Companies</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-2 font-medium text-slate-500">Company</th>
                <th class="text-right py-2 font-medium text-slate-500">Candidates</th>
              </tr>
            </thead>
            <tbody>
              {#if data}
                {#each getTopCompanies(data, 3) as company, i}
                  <tr class={i < 2 ? 'border-b border-slate-100' : ''}>
                    <td class="py-2 text-slate-800">{company.name || 'N/A'}</td>
                    <td class="py-2 text-right text-slate-800">{company.count || 0}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="bg-white p-4 border border-slate-200">
        <h3 class="text-base font-medium text-slate-700 mb-2">Most Active Therapeutic Areas</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-2 font-medium text-slate-500">Area</th>
                <th class="text-right py-2 font-medium text-slate-500">Candidates</th>
              </tr>
            </thead>
            <tbody>
              {#if data}
                {#each getTopAreas(data, 3) as area, i}
                  <tr class={i < 2 ? 'border-b border-slate-100' : ''}>
                    <td class="py-2 text-slate-800">{area.name || 'N/A'}</td>
                    <td class="py-2 text-right text-slate-800">{area.count || 0}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="bg-white p-4 border border-slate-200">
        <h3 class="text-base font-medium text-slate-700 mb-2">Most Active Indications</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-2 font-medium text-slate-500">Indication</th>
                <th class="text-right py-2 font-medium text-slate-500">Candidates</th>
              </tr>
            </thead>
            <tbody>
              {#if data}
                {#each getTopIndications(data, 3) as indication, i}
                  <tr class={i < 2 ? 'border-b border-slate-100' : ''}>
                    <td class="py-2 text-slate-800">{indication.name || 'N/A'}</td>
                    <td class="py-2 text-right text-slate-800">{indication.count || 0}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</section> 
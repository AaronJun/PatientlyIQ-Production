<!-- RPDSummaryView.svelte -->
<script lang="ts">
    // A component to display summary statistics for the selected year
    export let data = []; // Full dataset for the selected year
    export let year = ""; // Selected year
    
    // Computed statistics
    $: totalRPDDs = data.length;
    $: uniqueCandidates = new Set(data.map(d => d.Candidate)).size;
    $: uniqueCompanies = new Set(data.filter(d => d.Company).map(d => d.Company)).size;
    $: uniqueAreas = new Set(data.filter(d => d.TherapeuticArea1).map(d => d.TherapeuticArea1)).size;
    
    // Count PRVs awarded in this year
    $: prvsAwarded = data.filter(d => d["PRV Year"] === year).length;
    
    // Calculate average time from RPDD to PRV (for those that have both)
    $: rpddToVoucherData = data.filter(d => d["RPDD Year"] && d["PRV Year"]);
    $: avgYearsToVoucher = rpddToVoucherData.length > 0 
      ? (rpddToVoucherData.reduce((sum, d) => sum + (parseInt(d["PRV Year"]) - parseInt(d["RPDD Year"])), 0) / rpddToVoucherData.length).toFixed(1)
      : "N/A";
    
    // Top therapeutic areas
    $: therapeuticAreaCounts = data.reduce((acc, d) => {
      if (d.TherapeuticArea1) {
        acc[d.TherapeuticArea1] = (acc[d.TherapeuticArea1] || 0) + 1;
      }
      return acc;
    }, {});
    
    $: topAreas = Object.entries(therapeuticAreaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([area, count]) => ({ area, count }));
  </script>
  
  <div class="summary-view">
    <h3 class="text-base font-medium text-slate-800 mb-3">
      {year} Year Summary
    </h3>
    
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="stat-card">
        <span class="text-3xl font-bold text-slate-700">{totalRPDDs}</span>
        <p class="text-xs text-slate-500 mt-1">Total RPDDs</p>
      </div>
      
      <div class="stat-card bg-slate-50 p-3 rounded-lg">
        <span class="text-3xl font-bold text-slate-700">{prvsAwarded}</span>
        <p class="text-xs text-slate-500 mt-1">PRVs Awarded</p>
      </div>
    </div>
    
    <div class="metrics-list space-y-2 mb-4">
      <div class="metric-item flex justify-between  border-b border-slate-200">
        <span class="text-xs text-slate-600">Unique Companies</span>
        <span class="text-sm font-medium text-slate-800">{uniqueCompanies}</span>
      </div>
      
      <div class="metric-item flex justify-between  border-b border-slate-200">
        <span class="text-xs text-slate-600">Unique Candidates</span>
        <span class="text-sm font-medium text-slate-800">{uniqueCandidates}</span>
      </div>
      
      <div class="metric-item flex justify-between  border-b border-slate-200">
        <span class="text-xs text-slate-600">Therapeutic Areas</span>
        <span class="text-sm font-medium text-slate-800">{uniqueAreas}</span>
      </div>
      

    </div>
    
    {#if topAreas.length > 0}
      <div>
        <h4 class="text-xs font-medium text-slate-600 mb-2">Most Active Therapeutic Areas</h4>
        <div class="space-y-2">
          {#each topAreas as area}
            <div class="flex-row gap-2">
              <span class="text-[9.275px] text-slate-800">{area.area}</span>
              <span class="text-[9.275px] font-mono text-slate-600 ml-4"> | {area.count}</span>
              <div class="flex items-center align-middle pb-1">
                
                <div class="w-full mt-1 bg-slate-200 h-2.5">
                  <div class="bg-orange-600 h-2.5" style="width: {(area.count / totalRPDDs) * 100}%"></div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    <div class="text-xs text-slate-500 mt-8">
      <p class="text-xs font-semibold">Select elements in the visualization to see details</p>
    </div>
  </div>
  
  <style>
    .summary-view {
      transition: all 0.3s ease;
    }
    
    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: center;
      text-align: center;
      transition: all 0.2s ease;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: .25px dotted #969696;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  </style>
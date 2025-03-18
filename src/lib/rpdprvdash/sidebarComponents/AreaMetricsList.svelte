<!-- AreaMetricsList.svelte -->
<script>
  // Therapeutic area metrics data
  export let metrics = {
    areaName: '',
    totalDrugs: 0,
    uniqueCompanies: 0,
    uniqueCandidates: 0
  };
  
  // Color mapping for highlighting the border
  export let color = '#4ECDC4'; // Default color
</script>

<div class="area-metrics mb-8">
  <h3 class="text-base font-semibold text-slate-800 mb-3">
    {metrics.areaName}
  </h3>
  <div class="progress-container mb-4">
    <div class="h-2 bg-slate-200 rounded-sm w-full relative">
      <div class="absolute inset-0 h-full rounded-sm progress-bar" 
           style="width: {Math.min(100, (metrics.totalDrugs / 25) * 100)}%; background-color: {color}">
      </div>
    </div>
    <div class="text-[9.25px] text-slate-500 mt-1 text-right">
      {metrics.totalDrugs} out of {Math.max(25, metrics.totalDrugs)} pipeline assets
    </div>
  </div>

  
  <div class="metrics-list space-y-2">
    <div class="metric-item flex justify-between">
      <span class="text-xs text-slate-600 font-medium">Total RPDDs</span>
      <span class="text-sm font-medium text-slate-800">{metrics.totalDrugs}</span>
    </div>
    
    <div class="metric-item flex justify-between">
      <span class="text-xs text-slate-600 font-medium">Unique companies</span>
      <span class="text-sm font-medium text-slate-800">{metrics.uniqueCompanies}</span>
    </div>
    
    <div class="metric-item flex justify-between">
      <span class="text-xs text-slate-600 font-medium">Unique candidates</span>
      <span class="text-sm font-medium text-slate-800">{metrics.uniqueCandidates}</span>
    </div>
  </div>
</div>

<style>
  .metric-item {
    border-bottom: .25px solid #4A90E2;
    padding-bottom: 0.125rem;
  }
  
  .progress-bar {
    transition: width 1s ease-in-out;
  }
</style>
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

<div class="area-metrics">
  <h3 class="text-base font-semibold text-slate-800 mb-3">{metrics.areaName}</h3>
  
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
    padding-bottom: 0.25rem;
  }
</style>
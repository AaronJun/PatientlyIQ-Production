<!-- CompanyMetricsList.svelte -->
<script>
    // Company metrics data
    import "carbon-components-svelte/css/all.css";

    export let metrics = {
      companyName: '',
      totalDrugs: 0,
      clinicalTrials: 0,
      vouchersAwarded: 0,
      uniqueIndications: 0,
      uniqueAreas: 0
    };
  </script>
  
  <div class="company-metrics pt-0">
    <h3 class="text-base font-semibold text-slate-800 mb-3">{metrics.companyName}</h3>
    
    <div class="metrics-list space-y-2">
      <div class="metric-item flex justify-between">
        <span class="text-xs text-slate-600 font-medium">In development</span>
        <span class="text-sm font-medium text-slate-800">{metrics.totalDrugs}</span>
      </div>
      
      <div class="metric-item flex justify-between">
        <span class="text-xs text-slate-600 font-medium">In Trials</span>
        <span class="text-sm font-medium text-slate-800">{metrics.clinicalTrials}</span>
      </div>
      
      <div class="metric-item flex justify-between">
        <span class="text-xs text-slate-600 font-medium">Vouchers awarded</span>
        <span class="text-sm font-medium text-slate-800">{metrics.vouchersAwarded}</span>
      </div>
      
      <div class="metric-item flex justify-between">
        <span class="text-xs text-slate-600 font-medium">Unique indications</span>
        <span class="text-sm font-medium text-slate-800">{metrics.uniqueIndications}</span>
      </div>
      
      <div class="metric-item flex justify-between">
        <span class="text-xs text-slate-600 font-medium">Therapeutic areas</span>
        <span class="text-sm font-medium text-slate-800">{metrics.uniqueAreas}</span>
      </div>
    </div>
  </div>
  
  <style>
    .company-metrics {
    }
    
    .metric-item {
      border-bottom: .25px solid #4A90E2;
      padding-bottom: 0.25rem;
    }
  </style>
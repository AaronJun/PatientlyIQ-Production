<!-- CompanyDistributionChart.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { Chart, Svg, Axis, Spline, Points } from 'layerchart';
  import { scaleBand } from 'd3-scale';
  
  interface DataEntry {
    Company: string;
    MarketCap?: string;
    "Commercial stage"?: string;
    "RPDD Year"?: string;
    "PRV Status"?: string;
    [key: string]: any;
  }
  
  export let data: DataEntry[] = [];
  export let width = 800;
  export let height = 600;
  export let viewType: 'marketCap' | 'commercialStage' = 'marketCap';
  export let onCompanySelect: (company: string) => void = (company: string) => {};
  export let showOnlyPRVs = false;
  
  const MARKET_CAP_GROUPS: Record<string, string> = {
    'Mega': '#2E79B9', // Blue
    'Large': '#3CA2E0', // Light Blue
    'Mid': '#4EB265', // Green
    'Small': '#95D840', // Light Green
    'Startup': '#F8C156', // Yellow
    'Private': '#F57F39', // Orange
    'Acquired': '#DE425B', // Red
    'Government': '#9D6CB9', // Purple
    'Advocacy': '#9D6CB9', // Purple
    'Academic': '#9D6CB9', // Purple
    'Unknown': '#B4B4B4'  // Gray
  };
  
  const COMMERCIAL_STAGE_GROUPS: Record<string, string> = {
    'Big pharma': '#2E79B9', // Blue
    'Commercial stage': '#4EB265', // Green
    'Pivotal stage': '#95D840', // Light Green
    'Clinical stage': '#F8C156', // Yellow
    'Early stage': '#F57F39', // Orange
    'Acquired/Merged': '#DE425B', // Red
    'Unknown': '#B4B4B4'  // Gray
  };
  
  const dispatch = createEventDispatcher();
  
  let initialized = false;
  let selectedCompany = '';
  let curve = "cardinalClosed";
  
  // Group data by current view type and prepare for radar chart
  function prepareChartData() {
    // Use a simpler data structure
    const grouped: Record<string, {count: number, companies: string[], prvCount: number}> = {};
    
    // Filter if showing only PRVs
    const filteredData = showOnlyPRVs 
      ? data.filter(d => d["PRV Status"] === "PRV Awarded")
      : data;
    
    // Count companies in each group
    filteredData.forEach(item => {
      if (!item.Company) return;
      
      const group = viewType === 'marketCap' 
        ? (item.MarketCap || "Unknown")
        : (item["Commercial stage"] || "Unknown");
      
      if (!grouped[group]) {
        grouped[group] = {
          count: 0,
          companies: [],
          prvCount: 0
        };
      }
      
      if (!grouped[group].companies.includes(item.Company)) {
        grouped[group].count++;
        grouped[group].companies.push(item.Company);
        
        if (item["PRV Status"] === "PRV Awarded") {
          grouped[group].prvCount++;
        }
      }
    });
    
    // Format for layerchart
    const chartPoints = Object.entries(grouped).map(([name, data]) => ({
      name,
      value: data.count,
      prvCount: data.prvCount
    }));
    
    // Use separate dataset for PRV counts
    const prvChartPoints = showOnlyPRVs ? [] : Object.entries(grouped).map(([name, data]) => ({
      name,
      value: data.prvCount
    }));
    
    return {
      totalPoints: chartPoints,
      prvPoints: prvChartPoints
    };
  }
  
  function handleCompanyClick(company: string) {
    selectedCompany = company;
    onCompanySelect(company);
  }
  
  // Toggle view between Market Cap and Commercial Stage
  export function toggleView() {
    viewType = viewType === 'marketCap' ? 'commercialStage' : 'marketCap';
  }
  
  // Toggle showing only PRVs
  export function togglePRVFilter() {
    showOnlyPRVs = !showOnlyPRVs;
  }
  
  onMount(() => {
    initialized = true;
  });
  
  $: chartData = prepareChartData();
</script>

<div class="company-distribution-chart">
  <div class="chart-container">
    {#if initialized}
      <div class="p-4 border rounded" style="height: {height}px">
        <h3 class="text-lg font-semibold text-center mb-2">
          {viewType === 'marketCap' ? 'Companies by Market Cap' : 'Companies by Commercial Stage'} 
          {showOnlyPRVs ? '(PRVs Only)' : ''}
        </h3>
        
        <Chart
          data={chartData.totalPoints}
          x="name"
          xScale={scaleBand()}
          y="value"
          yPadding={[0, 10]}
          padding={{ top: 32, bottom: 8 }}
          radial
        >
          <Svg center>
            <Axis
              placement="radius"
              grid={{ class: "stroke-slate-200 fill-slate-50" }}
              ticks={[0, Math.max(...chartData.totalPoints.map(p => p.value)) / 2, Math.max(...chartData.totalPoints.map(p => p.value))].map(Math.floor)}
              format={(d) => d.toString()}
            />
            <Axis placement="angle" grid={{ class: "stroke-slate-200" }} />
            <Spline curve={curve} class="stroke-primary fill-primary/20" />
            <Points 
              class="fill-primary stroke-slate-200" 
              tooltip={{ 
                format: (d) => `${d.name}: ${d.value} companies${d.prvCount ? `, ${d.prvCount} PRVs` : ''}` 
              }}
            />
          </Svg>
        </Chart>
        
        {#if !showOnlyPRVs && chartData.prvPoints.length > 0}
          <div class="mt-2">
            <Chart
              data={chartData.prvPoints}
              x="name"
              xScale={scaleBand()}
              y="value"
              yPadding={[0, 10]}
              padding={{ top: 32, bottom: 8 }}
              radial
            >
              <Svg center>
                <Spline curve={curve} class="stroke-red-500 fill-red-500/20" />
                <Points 
                  class="fill-red-500 stroke-slate-200" 
                  tooltip={{ 
                    format: (d) => `${d.name}: ${d.value} PRVs` 
                  }}
                />
              </Svg>
            </Chart>
          </div>
        {/if}
      </div>
    {/if}
  </div>
  
  <div class="legend">
    <h3 class="text-sm font-medium mb-2">
      {viewType === 'marketCap' ? 'Market Cap Categories' : 'Commercial Stages'}
    </h3>
    <div class="legend-items">
      <div class="legend-item">
        <span class="legend-color bg-primary"></span>
        <span class="legend-label">Total Companies</span>
      </div>
      {#if !showOnlyPRVs}
        <div class="legend-item">
          <span class="legend-color bg-red-500"></span>
          <span class="legend-label">PRVs Awarded</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .company-distribution-chart {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  
  .legend {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 8px;
    font-size: 12px;
    max-width: 200px;
    z-index: 100;
  }
  
  .legend-items {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .legend-color {
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }
  
  .legend-label {
    font-size: 10px;
    color: #555;
  }
</style> 
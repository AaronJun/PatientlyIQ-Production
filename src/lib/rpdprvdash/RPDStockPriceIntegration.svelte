<!-- RPDStockAnalysis.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import DailyStockPriceChart from './DailyStockPriceChart.svelte';
  import { ChartColumnFloating, Information, Warning, Calendar, Checkmark } from 'carbon-icons-svelte';

  export let companyName: string = '';
  export let rpddData: any[] = []; // The merged RPD data from the app
  export let stockData: any[] = []; // Daily stock price data
  export let color: string = '#37587e';
  
  // State variables
  let isLoading = true;
  let error = null;
  let showRPDD = true;
  let showPRV = true;
  let showSales = true;
  let companyEvents = [];

  // Format date helper
  function formatDate(year, month, day = ""): string {
    if (!year || !month) return "N/A";
    return `${month}/${day || ""}/${year}`;
  }

  // Get counts
  $: rpddCount = rpddData.filter(d => d.Company === companyName && d["RPDD Year"]).length;
  $: prvCount = rpddData.filter(d => d.Company === companyName && d["PRV Issue Year"]).length;
  $: salesCount = rpddData.filter(d => d.Company === companyName && d.Purchased === "Y" && d["Purchase Year"]).length;
  $: companyEvents = rpddData.filter(d => d.Company === companyName);

  $: {
    // Initialize/reset state when company changes
    if (companyName) {
      isLoading = true;
      error = null;
      
      // Simulate loading (normally you would be fetching data here)
      setTimeout(() => {
        if (stockData.length > 0) {
          isLoading = false;
        } else {
          error = "No stock data available for this company";
          isLoading = false;
        }
      }, 500);
    }
  }

  onMount(() => {
    // Initial loading
    if (companyName) {
      isLoading = true;
      error = null;
      
      setTimeout(() => {
        if (stockData.length > 0) {
          isLoading = false;
        } else {
          error = "No stock data available for this company";
          isLoading = false;
        }
      }, 500);
    }
  });
</script>

<div class="rpd-stock-analysis bg-white rounded-lg shadow-sm p-4">
  <div class="flex justify-between items-center mb-4">
    <div class="flex items-center gap-2">
      <ChartColumnFloating size={18} class="text-slate-600" />
      <h3 class="text-base font-medium text-slate-700">Stock Performance & Key Milestones</h3>
    </div>
    
    <div class="flex gap-3">
      <label class="flex items-center gap-1">
        <input type="checkbox" bind:checked={showRPDD} class="h-3 w-3 text-green-500">
        <span class="text-xs">RPDD ({rpddCount})</span>
      </label>
      <label class="flex items-center gap-1">
        <input type="checkbox" bind:checked={showPRV} class="h-3 w-3 text-orange-500">
        <span class="text-xs">PRV ({prvCount})</span>
      </label>
      <label class="flex items-center gap-1">
        <input type="checkbox" bind:checked={showSales} class="h-3 w-3 text-purple-500">
        <span class="text-xs">Sales ({salesCount})</span>
      </label>
    </div>
  </div>
  
  <div class="mb-6 relative">
    {#if isLoading}
      <div class="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
        <div class="text-center text-slate-500">
          <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading stock data...</p>
        </div>
      </div>
    {:else if error}
      <div class="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div class="text-center text-red-600 px-4">
          <Warning size={32} class="mx-auto mb-2" />
          <p class="font-medium">Unable to load stock data</p>
          <p class="text-sm mt-2">This could be a private company or the data is temporarily unavailable.</p>
          <p class="text-xs mt-4 text-red-500">{error}</p>
        </div>
      </div>
    {:else if stockData.length > 0}
      <div class="h-96 rounded-lg overflow-hidden">
        <DailyStockPriceChart
          {companyName}
          {stockData}
          allData={rpddData}
          {color}
        />
      </div>
    {:else}
      <div class="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
        <div class="text-center text-slate-500">
          <Information size={32} class="mx-auto mb-2" />
          <p>No stock data available for {companyName}</p>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Milestone Timeline -->
  <div class="milestone-timeline bg-slate-50 p-3 rounded-lg">
    <div class="flex justify-between items-center mb-3">
      <h4 class="text-sm font-medium text-slate-700">
        <div class="flex items-center gap-1">
          <Calendar size={16} />
          <span>Key Milestone Timeline</span>
        </div>
      </h4>
    </div>
    
    {#if companyEvents.length > 0}
      <div class="timeline-container overflow-y-auto max-h-64">
        <div class="timeline min-w-full relative pb-1">
          {#each companyEvents as event}
            <!-- RPDD Events -->
            {#if showRPDD && event["RPDD Year"]}
              <div class="timeline-item mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-16 text-xs text-right text-slate-500">
                    {formatDate(event["RPDD Year"], event["RPDD Month"], event["Date"] || "1")}
                  </div>
                  <div class="h-3 w-3 rounded-full bg-green-500 flex-shrink-0"></div>
                  <div class="px-2 py-1 bg-green-50 rounded text-xs flex-grow">
                    <span class="font-medium text-green-700">RPDD:</span> {event.Candidate || "Unknown product"} 
                    ({event.Indication || "Unknown indication"})
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- PRV Award Events -->
            {#if showPRV && event["PRV Issue Year"]}
              <div class="timeline-item mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-16 text-xs text-right text-slate-500">
                    {formatDate(event["PRV Issue Year"], event["PRV Issue Month"], event["Date"] || "1")}
                  </div>
                  <div class="h-3 w-3 rounded-full bg-orange-500 flex-shrink-0"></div>
                  <div class="px-2 py-1 bg-orange-50 rounded text-xs flex-grow">
                    <span class="font-medium text-orange-700">PRV Award:</span> {event.Candidate || "Unknown product"}
                    <span class="inline-flex items-center ml-1 text-orange-600 text-[8px] bg-orange-100 px-1 rounded">
                      <Checkmark size={8} class="mr-0.5" /> FDA APPROVED
                    </span>
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- PRV Sale Events -->
            {#if showSales && event.Purchased === "Y" && event["Purchase Year"]}
              <div class="timeline-item mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-16 text-xs text-right text-slate-500">
                    {formatDate(event["Purchase Year"], event["Purchase Month"], event["Purchase Date"] || "1")}
                  </div>
                  <div class="h-3 w-3 rounded-full bg-purple-500 flex-shrink-0"></div>
                  <div class="px-2 py-1 bg-purple-50 rounded text-xs flex-grow">
                    <span class="font-medium text-purple-700">PRV Sale:</span> {event.Candidate || "Unknown product"} 
                    <span class="font-medium">
                      to {event.Purchaser || "Undisclosed buyer"}
                      {#if event["Sale Price (USD Millions)"] && event["Sale Price (USD Millions)"] !== "Undisclosed"}
                        <span class="text-purple-800">($) ${event["Sale Price (USD Millions)"]}M</span>
                      {/if}
                    </span>
                  </div>
                </div>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {:else}
      <div class="text-center py-4 text-slate-500 text-sm">
        No milestone events found for this company
      </div>
    {/if}
  </div>

  <div class="info-panel mt-4 pt-3 border-t border-slate-200">
    <p class="text-xs text-slate-500">
      This chart visualizes possible relationships between stock performance and key regulatory milestones.
      Click on any milestone marker (colored dots) on the chart to see a 30-day impact analysis.
    </p>
  </div>
</div>

<style>
  .timeline-container {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .timeline::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 18px;
    width: 1px;
    background-color: #e2e8f0;
  }
</style>
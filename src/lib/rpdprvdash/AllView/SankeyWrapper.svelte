<!-- RPDDashboard.svelte -->
<script>
    import { onMount } from 'svelte';
    import StageBeeswarmPlot from './SankeyFlow.svelte';
    
    export let data = [];
    
    // Statistics
    let totalEntries = 0;
    let totalPRVs = 0;
    let totalSold = 0;
    let totalValue = 0;
    let avgSalePrice = 0;
    let topCompany = { name: '', count: 0 };
    let topArea = { name: '', count: 0 };
    let topIndication = { name: '', count: 0 };
    
    // Drawer state
    let isDrawerOpen = false;
    let selectedEntry = null;
    
    function calculateStats() {
      if (!data || data.length === 0) return;
      
      totalEntries = data.length;
      
      // Filter to just PRV data
      const prvData = data.filter(d => d["PRV Year"]);
      totalPRVs = prvData.length;
      
      // Calculate sold vouchers
      const soldData = prvData.filter(d => d.Purchased === "Y");
      totalSold = soldData.length;
      
      // Calculate total and average value
      const valuedSales = soldData.filter(d => d["Sale Price (USD Millions)"] && d["Sale Price (USD Millions)"] !== "Undisclosed")
        .map(d => parseFloat(d["Sale Price (USD Millions)"]));
        
      totalValue = valuedSales.reduce((sum, val) => sum + val, 0);
      avgSalePrice = totalValue / valuedSales.length;
      
      // Find top company by entries
      const companyCounts = new Map();
      data.forEach(d => {
        companyCounts.set(d.Company, (companyCounts.get(d.Company) || 0) + 1);
      });
      
      if (companyCounts.size > 0) {
        const topEntry = Array.from(companyCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        topCompany = { name: topEntry[0], count: topEntry[1] };
      }
      
      // Find top therapeutic area
      const areaCounts = new Map();
      data.forEach(d => {
        if (d.TherapeuticArea1) {
          areaCounts.set(d.TherapeuticArea1, (areaCounts.get(d.TherapeuticArea1) || 0) + 1);
        }
      });
      
      if (areaCounts.size > 0) {
        const topEntry = Array.from(areaCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        topArea = { name: topEntry[0], count: topEntry[1] };
      }
      
      // Find top indication
      const indicationCounts = new Map();
      data.forEach(d => {
        if (d.Indication) {
          indicationCounts.set(d.Indication, (indicationCounts.get(d.Indication) || 0) + 1);
        }
      });
      
      if (indicationCounts.size > 0) {
        const topEntry = Array.from(indicationCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        topIndication = { name: topEntry[0], count: topEntry[1] };
      }
    }
    
    function handleEntrySelect(entry) {
      selectedEntry = entry;
      isDrawerOpen = true;
    }
    
    function handleCloseDrawer() {
      isDrawerOpen = false;
    }
    
    $: if (data) {
      calculateStats();
    }
    
    onMount(() => {
      if (data) {
        calculateStats();
      }
    });
  </script>
  
  <div class="dashboard bg-slate-50 min-h-screen p-4">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-center text-gray-800">
        Rare Pediatric Disease Priority Review Voucher (PRV) Dashboard
      </h1>
      <p class="text-center text-gray-600 mt-1">
        Analysis of {totalEntries} drug candidates with {totalPRVs} PRVs awarded
      </p>
    </header>
    
    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm font-medium">Total Drug Candidates</h3>
        <p class="text-2xl font-bold text-gray-800">{totalEntries}</p>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm font-medium">PRVs Awarded</h3>
        <p class="text-2xl font-bold text-gray-800">{totalPRVs}</p>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm font-medium">PRVs Sold</h3>
        <p class="text-2xl font-bold text-gray-800">{totalSold} ({Math.round(totalSold/totalPRVs*100) || 0}%)</p>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm font-medium">Avg Sale Price</h3>
        <p class="text-2xl font-bold text-gray-800">${Math.round(avgSalePrice).toLocaleString() || 0} million</p>
      </div>
    </div>
    
    <!-- Additional summary cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm font-medium">Top Company</h3>
        <p class="text-xl font-bold text-gray-800">{topCompany.name || 'N/A'}</p>
        <p class="text-sm text-gray-500">{topCompany.count || 0} drug candidates</p>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm font-medium">Top Therapeutic Area</h3>
        <p class="text-xl font-bold text-gray-800">{topArea.name || 'N/A'}</p>
        <p class="text-sm text-gray-500">{topArea.count || 0} drug candidates</p>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-gray-500 text-sm font-medium">Top Indication</h3>
        <p class="text-xl font-bold text-gray-800">{topIndication.name || 'N/A'}</p>
        <p class="text-sm text-gray-500">{topIndication.count || 0} drug candidates</p>
      </div>
    </div>
    
    <!-- Beeswarm Plot -->
    <div class="bg-white p-4 rounded-lg shadow mb-8">
      <StageBeeswarmPlot {data} width={1100} height={600} onEntrySelect={handleEntrySelect} />
    </div>
    
    <!-- PRV Value Distribution -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-gray-700 text-base font-medium mb-4">Total PRV Sales Value</h3>
        <p class="text-5xl font-bold text-blue-600 text-center my-8">${totalValue.toLocaleString()} million</p>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-gray-700 text-base font-medium mb-4">PRV Sale Price Trends</h3>
        <div class="flex items-center justify-center h-32">
          <!-- Placeholder for future chart -->
          <p class="text-gray-500 italic">PRV values range from $67.5M to $350M with recent average of ~$110M</p>
        </div>
      </div>
    </div>
    
    <footer class="mt-8 text-center text-gray-500 text-sm">
      <p>Data analysis of Rare Pediatric Disease Priority Review Vouchers (PRVs)</p>
      <p class="text-xs mt-1">Click on any circle in the visualization for detailed information</p>
    </footer>
    
  </div>
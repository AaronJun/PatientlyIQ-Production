<!-- RPDTransactionSummaryView.svelte -->
<script lang="ts">
    // A component to display summary statistics for PRV transactions
    export let data = []; // Full dataset for the selected year
    export let year = ""; // Selected year
    
    // Filter to transactions
    $: transactions = data.filter(d => d.Purchased === "Y" && d["Purchase Year"]);
    $: transactionsInYear = transactions.filter(d => d["Purchase Year"] === year);
  
    // Computed transaction statistics
    $: totalTransactions = transactions.length;
    $: totalTransactionsInYear = transactionsInYear.length;
  
    // Calculate value statistics
    $: disclosedPrices = transactions
      .filter(d => d["Sale Price (USD Millions)"] && d["Sale Price (USD Millions)"] !== "Undisclosed")
      .map(d => parseFloat(d["Sale Price (USD Millions)"]));
      
    $: disclosedPricesInYear = transactionsInYear
      .filter(d => d["Sale Price (USD Millions)"] && d["Sale Price (USD Millions)"] !== "Undisclosed")
      .map(d => parseFloat(d["Sale Price (USD Millions)"]));
    
    $: totalValueAllTime = disclosedPrices.reduce((sum, price) => sum + price, 0);
    $: totalValueInYear = disclosedPricesInYear.reduce((sum, price) => sum + price, 0);
    
    $: averageValue = disclosedPrices.length > 0 
      ? (totalValueAllTime / disclosedPrices.length).toFixed(1) 
      : "N/A";
      
    $: averageValueInYear = disclosedPricesInYear.length > 0 
      ? (totalValueInYear / disclosedPricesInYear.length).toFixed(1) 
      : "N/A";
  
    // Calculate unique buyers and sellers
    $: allSellers = new Set(transactions.map(d => d.Company));
    $: allBuyers = new Set(transactions.map(d => d.Purchaser));
    
    $: sellersInYear = new Set(transactionsInYear.map(d => d.Company));
    $: buyersInYear = new Set(transactionsInYear.map(d => d.Purchaser));
    
    // Format currency
    function formatMoney(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount * 1000000); // Convert millions to actual value
    }
  </script>
  
  <div class="summary-view">
    <h3 class="text-sm font-medium text-slate-700 mb-3">Transaction Summary</h3>
    
    <!-- Transaction counts section -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="stat-card bg-white rounded-md shadow-sm p-3 flex flex-col items-center justify-center">
        <span class="text-xl font-bold text-slate-700">{totalTransactionsInYear}</span>
        <p class="text-xs text-slate-500">Transactions in {year}</p>
      </div>
      
      <div class="stat-card bg-white rounded-md shadow-sm p-3 flex flex-col items-center justify-center">
        <span class="text-xl font-bold text-slate-700">{totalTransactions}</span>
        <p class="text-xs text-slate-500">All-Time Transactions</p>
      </div>
    </div>
    
    <!-- Metrics list section -->
    <div class="bg-white rounded-md shadow-sm p-3 mb-4">
      <h4 class="text-xs font-medium text-slate-700 mb-2">Value Metrics</h4>
      <div class="space-y-2">
        <div class="metric-item flex justify-between items-center py-1 border-b border-slate-100">
          <span class="text-xs text-slate-600">Avg. Value ({year})</span>
          <span class="text-sm font-medium text-slate-800">
            {averageValueInYear === "N/A" ? "N/A" : `$${averageValueInYear}M`}
          </span>
        </div>
        
        <div class="metric-item flex justify-between items-center py-1 border-b border-slate-100">
          <span class="text-xs text-slate-600">Total Value ({year})</span>
          <span class="text-sm font-medium text-slate-800">
            {totalValueInYear > 0 ? formatMoney(totalValueInYear) : "N/A"}
          </span>
        </div>
        
        <div class="metric-item flex justify-between items-center py-1 border-b border-slate-100">
          <span class="text-xs text-slate-600">Avg. All-Time Value</span>
          <span class="textvba font-medium text-slate-800">${averageValue}M</span>
        </div>
        
        <div class="metric-item flex justify-between items-center py-1">
          <span class="text-xs text-slate-600">Total All-Time Value</span>
          <span class="text-sm font-medium text-slate-800">{formatMoney(totalValueAllTime)}</span>
        </div>
      </div>
    </div>
    
    <!-- Companies section -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-white rounded-md shadow-sm p-3">
        <h4 class="text-xs font-medium text-slate-600 mb-2">Buyers ({year})</h4>
        <div class="flex flex-col items-center">
          <p class="text-2xl font-bold text-slate-700">{buyersInYear.size}</p>
          <p class="text-xs text-slate-500">companies</p>
        </div>
      </div>
      
      <div class="bg-white rounded-md shadow-sm p-3">
        <h4 class="text-xs font-medium text-slate-600 mb-2">Sellers ({year})</h4>
        <div class="flex flex-col items-center">
          <p class="text-2xl font-bold text-slate-700">{sellersInYear.size}</p>
          <p class="text-xs text-slate-500">companies</p>
        </div>
      </div>
    </div>
  
    <p class="text-xs text-slate-500 mt-4 text-center">
      Select transactions in the chord diagram to see details
    </p>
  </div>
  
  <style>
    .summary-view {
      transition: all 0.3s ease;
    }
    
    .stat-card {
      transition: all 0.2s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .metric-item:last-child {
      border-bottom: none;
    }
  </style>
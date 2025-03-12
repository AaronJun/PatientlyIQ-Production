<!-- RPDTransactionSummaryView.svelte -->
<script lang="ts">
    import { hasPRVAward } from '../utils/data-processing-utils';
    
    // A component to display summary statistics for PRV transactions
    export let data: any[] = []; // Full dataset for the selected year
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
    
    // Generate transaction circles data
    $: transactionCircles = Array(Math.min(totalTransactions, 100)).fill(0).map((_, i) => {
      const isInSelectedYear = i < totalTransactionsInYear;
      return { id: i, inSelectedYear: isInSelectedYear };
    });
    
    // Format currency with appropriate abbreviation
    function formatMoney(amount: number): string {
      if (amount === 0) return "N/A";
      
      // Convert from millions to actual value
      const actualValue = amount * 1000000;
      
      if (actualValue >= 1000000000) {
        // Format as billions
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(actualValue / 1000000000) + 'B';
      } else {
        // Format as millions
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(actualValue / 1000000) + 'M';
      }
    }
    
    // Calculate percentages for the bar chart
    $: avgValueNum = averageValue === "N/A" ? 0 : parseFloat(averageValue);
    $: avgValueInYearNum = averageValueInYear === "N/A" ? 0 : parseFloat(averageValueInYear);
    $: maxValue = Math.max(avgValueNum, avgValueInYearNum);
    $: allTimeBarWidth = maxValue > 0 ? (avgValueNum / maxValue * 100) : 0;
    $: yearBarWidth = maxValue > 0 ? (avgValueInYearNum / maxValue * 100) : 0;
    $: yearPercentOfAllTime = avgValueNum > 0 ? Math.round((avgValueInYearNum / avgValueNum) * 100) : 0;
    
    // Calculate percentages for total value comparison
    $: totalValuePercentage = totalValueAllTime > 0 ? (totalValueInYear / totalValueAllTime * 100) : 0;
    
    // Unsold vouchers section
    $: unsoldVouchers = data.filter(entry => 
      hasPRVAward(entry) && (!entry.Purchased || entry.Purchased !== "Y")
    );
    
    $: unsoldVouchersInYear = unsoldVouchers.filter(entry => 
      entry["PRV Year"] === year
    );
    
    // Prepare data for the table
    $: unsoldVouchersData = (year ? unsoldVouchersInYear : unsoldVouchers).map(entry => ({
      company: entry.Company || "Unknown",
      candidate: entry.Candidate || "Unknown",
      indication: entry.Indication || "Unknown",
      prvYear: entry["PRV Year"] || "Unknown",
      stage: entry["Current Development Stage"] || "Unknown"
    }));
    
    // Sorting functionality
    let sortField = "company";
    let sortDirection = 1; // 1 for ascending, -1 for descending
    
    function sortTable(field: string) {
      if (sortField === field) {
        // Toggle direction if clicking the same field
        sortDirection = -sortDirection;
      } else {
        // New field, default to ascending
        sortField = field;
        sortDirection = 1;
      }
    }
    
    $: sortedVouchers = [...unsoldVouchersData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * sortDirection;
      }
      
      return ((aValue > bValue) ? 1 : -1) * sortDirection;
    });
  </script>
  
  <div class="summary-view">    
    <!-- Transaction visualization section -->
    <div class="bg-white rounded-sm shadow-sm mb-4">
      <div class="flex flex-col">
        <div class="transaction-counts text-xs text-slate-500 font-medium gap-2 flex justify-between align-middle">
         <h4 class="text-sm text-slate-800 font-semibold"> {year}
            </h4>
          <div class="flex items-center gap-1">
          <span class="text-emerald-600">{totalTransactionsInYear}</span> 
          <span class="italic">of</span> 
          <span>{totalTransactions}</span>
          </div>
        </div>

        <div class="transaction-circles-container">
          {#if totalTransactions > 0}
          <div class="flex justify-between items-center mb-2">
     
          </div>
          <div class="transaction-circles">
            {#each transactionCircles as circle}
            <div class="transaction-circle {circle.inSelectedYear ? 'in-year' : ''}"></div>
              {/each}
            </div>
            <div class="flex items-center text-xs mt-4 mb-2">
              <span class="inline-block w-2 h-2 rounded-full bg-slate-300 mr-1"></span>
              <span class="text-xs text-slate-500 mr-3">All-time</span>
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
              <span class="text-slate-500">{year}</span>
            </div>
          {:else}
            <p class="text-center text-slate-500 text-sm py-4">No transactions available</p>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Metrics list section -->
    <div class="bg-white rounded-md shadow-sm mb-4">
      <h4 class="text-xs font-medium text-slate-700 mb-2">Value Metrics</h4>
      <div class="space-y-2">
        <!-- Average Value Comparison Chart -->
        <div class="metric-item py-3 border-b border-slate-100">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-slate-600">Average Value Comparison</span>

          </div>
          
          <div class="chart-container">
            <!-- All-time average bar -->
            <div class="bar-label flex justify-between items-center mb-1">
              <span class="text-xs text-slate-500">All-time</span>
              <span class="text-xs font-medium text-slate-700">
                {averageValue === "N/A" ? "N/A" : formatMoney(parseFloat(averageValue))}
              </span>
            </div>
            <div class="bar-bg h-3 bg-slate-100 rounded-full mb-3">
              <div class="bar-fill h-3 bg-emerald-200 rounded-full" style="width: {allTimeBarWidth}%"></div>
            </div>
            
            <!-- Selected year average bar -->
            <div class="bar-label flex justify-between items-center mb-1">
              <span class="text-xs text-slate-500">{year}</span>
              <span class="text-xs font-medium text-slate-700">
                {averageValueInYear === "N/A" ? "N/A" : formatMoney(parseFloat(averageValueInYear))}
              </span>
            </div>
            <div class="bar-bg h-3 bg-emerald-200 rounded-full">
              <div class="bar-fill h-3 bg-emerald-500 rounded-full" style="width: {yearBarWidth}%"></div>
            </div>
          </div>
        </div>
        
        <!-- Total Value Comparison Chart -->
        <div class="flex flex-col py-3 border-b border-slate-100">
          <div class="flex-row justify-between items-center mb-2">
            <span class="text-xs text-slate-600">Total Value Comparison</span>
      
          </div>
          
          <div class="chart-container flex flex-col w-full place-items-start">
            <!-- Labels -->
            <div class="flex flex-col justify-evenly gap-1 items-center mb-1">
              <div class="flex items-center w-full place-items">
                <span class="inline-block ring-1 ring-emerald-800 w-2 h-2 rounded-full bg-emerald-200 mr-1"></span>
                <span class="text-xs text-slate-500">All-time</span>
                <span class="text-xs font-medium text-slate-700 ml-2">
                  {formatMoney(totalValueAllTime)}
                </span>
              </div>
              <div class="flex items-center">
                <span class="inline-block w-2 h-2 rounded-full ring-1 ring-emerald-800  bg-emerald-500 mr-1"></span>
                <span class="text-xs text-slate-500">{year}</span>
                <span class="text-xs font-medium text-slate-700 ml-2">
                  {formatMoney(totalValueInYear)}
                </span>
              </div>
            </div>
            
            <!-- Overlaid bars -->
            <div class="relative w-full h-5 mt-2">
              <!-- All-time bar (background) -->
              <div class="absolute top-0 left-0 w-full h-5 bg-slate-100 rounded-full">
                <div class="h-full bg-emerald-100 rounded-full" style="width: 100%"></div>
              </div>
              
              <!-- Selected year bar (overlay) -->
              <div class="absolute top-0 left-0 h-5 bg-emerald-500 rounded-full opacity-80" 
                   style="width: {totalValuePercentage}%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Companies section -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div class="bg-white rounded-md shadow-sm p-3">
        <h4 class="text-xs font-medium text-slate-600 mb-2">Buyers, {year}</h4>
        <div class="flex flex-col items-left">
          <p class="text-2xl font-bold text-slate-700">{buyersInYear.size}</p>
          <p class="text-xs text-slate-500">companies</p>
        </div>
      </div>
      
      <div class="bg-white rounded-md shadow-sm p-3">
        <h4 class="text-xs font-medium text-slate-600 mb-2">Sellers, {year}</h4>
        <div class="flex flex-col items-left">
          <p class="text-2xl font-bold text-slate-700">{sellersInYear.size}</p>
          <p class="text-xs text-slate-500">companies</p>
        </div>
      </div>
    </div>
    
    <!-- Unsold Vouchers Table Section -->
    <div class="bg-white rounded-md shadow-sm mb-4">
      <div class="p-3">
        <h4 class="text-xs font-medium text-slate-700 mb-2">
          Unsold Vouchers {year ? `(${year})` : '(All Time)'}
          <span class="text-emerald-600 ml-1">({sortedVouchers.length})</span>
        </h4>
        
        {#if sortedVouchers.length > 0}
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="text-left py-2 font-medium text-slate-600 cursor-pointer" on:click={() => sortTable('company')}>
                    Company
                    {#if sortField === 'company'}
                      <span class="ml-1">{sortDirection > 0 ? '↑' : '↓'}</span>
                    {/if}
                  </th>
                  <th class="text-left py-2 font-medium text-slate-600 cursor-pointer" on:click={() => sortTable('candidate')}>
                    Candidate
                    {#if sortField === 'candidate'}
                      <span class="ml-1">{sortDirection > 0 ? '↑' : '↓'}</span>
                    {/if}
                  </th>
                  <th class="text-left py-2 font-medium text-slate-600 cursor-pointer" on:click={() => sortTable('prvYear')}>
                    PRV Year
                    {#if sortField === 'prvYear'}
                      <span class="ml-1">{sortDirection > 0 ? '↑' : '↓'}</span>
                    {/if}
                  </th>
                  <th class="text-left py-2 font-medium text-slate-600 cursor-pointer" on:click={() => sortTable('stage')}>
                    Stage
                    {#if sortField === 'stage'}
                      <span class="ml-1">{sortDirection > 0 ? '↑' : '↓'}</span>
                    {/if}
                  </th>
                </tr>
              </thead>
              <tbody>
                {#each sortedVouchers as voucher}
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="py-2 text-slate-700">{voucher.company}</td>
                    <td class="py-2 text-slate-700">{voucher.candidate}</td>
                    <td class="py-2 text-slate-700">{voucher.prvYear}</td>
                    <td class="py-2 text-slate-700">{voucher.stage}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="text-center text-slate-500 text-sm py-4">No unsold vouchers available</p>
        {/if}
      </div>
    </div>
  
    <p class="text-xs text-slate-500 mt-4 text-left">
      Select transactions in the chord diagram to see details
    </p>
  </div>
  
  <style>
    .summary-view {
      transition: all 0.3s ease;
    }
    
    .transaction-circles-container {
      width: 100%;
    }
    
    .transaction-circles {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 8px;
    }
    
    .transaction-circle {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #cbd5e1; /* slate-300 */
      transition: transform 0.2s ease;
    }
    
    .transaction-circle.in-year {
      background-color: rgb(16 185 129/1); /* emerald-500 */
    }
    
    .transaction-circle:hover {
      transform: scale(1.5);
    }
    
    .metric-item:last-child {
      border-bottom: none;
    }
    
    .chart-container {
      margin-top: 8px;
    }
    
    .bar-bg {
      transition: all 0.5s ease;
    }
    
    .bar-fill {
      transition: width 0.5s ease-out;
    }
    
    /* Table styles */
    table {
      border-collapse: collapse;
      width: 100%;
    }
    
    th {
      position: sticky;
      top: 0;
      background-color: white;
      z-index: 10;
    }
    
    th:hover {
      background-color: #f8fafc; /* slate-50 */
    }
  </style>
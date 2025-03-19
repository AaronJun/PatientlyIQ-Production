<!-- RPDTransactionSummaryView.svelte -->
<script lang="ts">
    import { hasPRVAward } from '../utils/data-processing-utils';
    import { Arc, Chart, Svg } from 'layerchart';
    
    // A component to display summary statistics for PRV transactions
    export let data: any[] = []; // Full dataset for the selected year
    export let year = ""; // Selected year
    
    // Filter to transactions
    $: transactions = data.filter(d => d.Purchased === "Y" && d["Purchase Year"]);
    $: transactionsInYear = year === "All" ? transactions : transactions.filter(d => d["Purchase Year"] === year);
  
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
    
    $: sellersInYear = year === "All" ? allSellers : new Set(transactionsInYear.map(d => d.Company));
    $: buyersInYear = year === "All" ? allBuyers : new Set(transactionsInYear.map(d => d.Purchaser));
    
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
    
  </script>
  
  <div class="summary-view"> 
    
        <!-- Companies section -->
    <div class="grid grid-cols-2 gap-2 mb-4">
           <!-- Gauge visualization using layerchart Arc -->
           <div class="relative w-full max-w-54 h-36 flex pr-8 items-center justify-center">
            <Chart>
              <Svg center>
                <!-- Background circle (full gauge) -->
                <Arc
                  startAngle={-Math.PI}
                  endAngle={Math.PI}
                  innerRadius={65}
                  outerRadius={80}
                  fill="#f1f5f9" 
                  cornerRadius={0}
                />
                <!-- Value circle (percentage filled) -->
                <Arc
                  startAngle={-Math.PI}
                  endAngle={-Math.PI + (2 * Math.PI * totalValuePercentage / 100)}
                  innerRadius={65}
                  outerRadius={80}
                  fill="#10b981" 
                  cornerRadius={0}
                  opacity={0.8}
                />
              </Svg>
            </Chart>
            <!-- Replace percentage with year total value -->
            <div class="absolute pr-8 inset-0 flex flex-col items-center justify-center">
              {#if year === "All"}
                <span class="text-lg font-bold text-slate-700">{formatMoney(totalValueAllTime)}</span>
                <span class="text-xs text-slate-500 mt-1">All-time</span>
              {:else}
              <div class="flex flex-col align-middle items-center justify-center">
                <span class="text-xl font-bold text-slate-700">{formatMoney(totalValueInYear)}</span>
                <p class="text-xs text-slate-500 mt-1">Total, {year}</p>
                </div>
              {/if}
            </div>
          </div>
    <!-- Transaction visualization section -->
    <div class="align-bottom mb-4">
      <div class="flex flex-col h-36">
        <div class="transaction-counts text-xs text-slate-500 font-medium gap-2 flex justify-between align-middle">
          <h4 class="text-sm text-slate-800 font-semibold"> {year}
             </h4>
           <div class="flex items-center align-bottom gap-1">
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
               <span class="inline-block w-2 h-2 rounded-sm bg-slate-300 mr-1"></span>
               <span class="text-xs text-slate-500 mr-3">All-time</span>
               <span class="inline-block w-2 h-2 rounded-sm bg-emerald-500 mr-1"></span>
               <span class="text-slate-500">{year}</span>
             </div>
           {:else}
             <p class="text-center text-slate-500 text-sm py-4">No transactions available</p>
           {/if}
         </div>
      </div>
    </div>
    
      <div class="shadow-sm p-3">
          <p class="text-2xl font-bold text-slate-700">{buyersInYear.size}</p>
        <h4 class="text-xs font-medium text-slate-600 mb-2">Buyers, {year}</h4>
      </div>
      
      <div class="bg-white rounded-md shadow-sm p-3">
        <p class="text-2xl font-bold text-slate-700">{sellersInYear.size}</p>
        <h4 class="text-xs font-medium text-slate-600 mb-2">Sellers, {year}</h4>
      </div>
    </div>
    <!-- Metrics list section -->
    <div class="shadow-sm mb-4">
      <div class="space-y-2">
        <!-- Average Value Comparison Chart -->          
          <div class="chart-container">
            <!-- All-time average bar -->
            <div class="bar-label flex justify-between items-center mb-1">
              <span class="text-xs text-slate-500">All-time average</span>
              <span class="text-xs font-medium text-slate-700">
                {averageValue === "N/A" ? "N/A" : formatMoney(parseFloat(averageValue))}
              </span>
            </div>
            <div class="bar-bg h-3 bg-slate-100 rounded-sm mb-3">
              <div class="bar-fill h-3 bg-emerald-200 rounded-sm" style="width: {allTimeBarWidth}%"></div>
            </div>
            
            <!-- Selected year average bar -->
            <div class="bar-label flex justify-between items-center mb-1">
              <span class="text-xs text-slate-500">{year} average</span>
              <span class="text-xs font-medium text-slate-700">
                {averageValueInYear === "N/A" ? "N/A" : formatMoney(parseFloat(averageValueInYear))}
              </span>
            </div>
            <div class="bar-bg h-3 bg-emerald-200 rounded-sm">
              <div class="bar-fill h-3 bg-emerald-500 rounded-sm" style="width: {yearBarWidth}%"></div>
            </div>
        </div>
        
      </div>
    </div>
    

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
      width: 6px;
      height: 6px;
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

    .metric-item {
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 1rem;
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
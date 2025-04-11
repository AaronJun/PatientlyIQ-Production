<script lang="ts">
    // -----------------------------
    //  PRV Value Range Calculator
    //  (lay‑person friendly edition)
    // -----------------------------
    // 2025‑04‑09 — revision: supply & recency inputs now genuinely
    // influence the price band.  The key fix is to treat *supply* as a
    // multiplicative discount factor applied to the recency‑weighted
    // historical mean, instead of a constant weight that cancels out.
  
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    // Historical secondary‑market sales with confirmed prices.
    // Extend this array whenever a new voucher sells.
    const salesData = [
      { year: 2014, available: 4,  price:  96250000 },
      { year: 2015, available: 9,  price: 198333333 },
      { year: 2016, available: 10, price: 290000000 },
      { year: 2019, available: 21, price:  95000000 },
      { year: 2020, available: 24, price:  99000000 },
      { year: 2022, available: 28, price: 100000000 },
      { year: 2024, available: 30, price: 103000000 }
    ];
  
    // -----------------------------
    //  User‑facing inputs
    // -----------------------------
    let currentYear = new Date().getFullYear();
    let currentAvailable = 30; // PRVs currently in circulation & unsold
    let expectedNew = 0;  // PRVs expected to be issued this year
    let expectedRedeemed = 0;  // PRVs expected to be *used* this year
  
    // Sliders 0 → 5.  We translate them into the technical constants
    // using a simple linear mapping (0 → 0.05, 5 → 0.50).
    let recencyImportance = 3;  // "How much do older prices matter?"
    let supplySensitivity = 3;  // "How sensitive is price to supply?"
  
    let confidence = 0.8; // 80 % default
    
    // Result storage
    let stats = {
      mean: 0,
      sigma: 0,
      low: 0,
      high: 0,
      λ: 0,
      α: 0,
      effAvail: 0,
      baselineFactor: 0,
      discountFactor: 0
    };

    // For the PRV availability projection chart
    let projectionData: { year: number, available: number }[] = [];
    let projectionChart: HTMLDivElement;
  
    // Z‑scores for common confidence levels
    const zLookup: Record<number, number> = {
      0.8:  1.28155,
      0.9:  1.64485,
      0.95: 1.95996
    };
  
    // -----------------------------
    //  Helper mappings & functions
    // -----------------------------
    const mapSlider = (v: number): number => 0.05 + 0.09 * v; // 0‑5 → 0.05‑0.50
  
    // Format as USD with no decimals.
    const fmtUSD = (v: number): string => new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(v);
  
    /**
     * Core calculation: returns { mean, sigma, low, high, ... }
     * Algorithm
     *   1.  Compute a recency‑weighted mean & σ of historical prices.
     *   2.  Compute the average historical supply discount factor.
     *   3.  Scale the mean & σ by the ratio of *current* to historical
     *       discount factors so supply assumptions visibly move the band.
     */
    function calcRange() {
      const λ = mapSlider(recencyImportance);      // recency decay
      const α = mapSlider(supplySensitivity);      // supply elasticity
  
      // Effective supply in the scenario the user is modelling.
      const effAvail = Math.max(0, currentAvailable + expectedNew - expectedRedeemed);
  
      // 1) Recency‑only weights (no supply yet)
      const wRec = salesData.map(d => Math.exp(-λ * (currentYear - d.year)));
      const sumW = wRec.reduce((a, b) => a + b, 0);
  
      const baseMean = salesData.reduce((acc, d, i) => acc + d.price * wRec[i], 0) / sumW;
      const baseVar  = salesData.reduce((acc, d, i) => acc + wRec[i] * (d.price - baseMean) ** 2, 0) / sumW;
      const baseSigma = Math.sqrt(baseVar);
  
      // 2) Supply discount factors
      const baselineFactor = salesData.reduce((acc, d, i) => acc + wRec[i] * (1 / (1 + α * d.available)), 0) / sumW;
      const discountFactor = 1 / (1 + α * effAvail);
  
      // 3) Adjust mean & σ for current supply
      const mean  = baseMean  * (discountFactor / baselineFactor);
      const sigma = baseSigma * (discountFactor / baselineFactor);
  
      const z = zLookup[confidence];
      const low  = Math.max(0, mean - z * sigma);
      const high = mean + z * sigma;
  
      return {
        mean,
        sigma,
        low,
        high,
        λ,
        α,
        effAvail,
        baselineFactor,
        discountFactor
      };
    }

    /**
     * Calculate projected PRV availability for the next 5 years
     * based on current available and expected yearly changes
     */
    function calculateProjection(): { year: number, available: number }[] {
      const projectionYears = 5;
      const result = [];
      
      // Start with current data
      let available = currentAvailable;
      
      // Add starting point (current year)
      result.push({ year: currentYear, available });
      
      // Project forward 5 years
      for (let i = 1; i <= projectionYears; i++) {
        // Apply yearly changes
        available = Math.max(0, available + expectedNew - expectedRedeemed);
        result.push({ year: currentYear + i, available });
      }
      
      return result;
    }
    
    /**
     * Render the PRV availability projection chart using a simpler approach
     */
    function renderProjectionChart() {
      // Skip rendering if the chart container doesn't exist yet
      if (!projectionChart) return;
      
      // Clear any previous contents
      projectionChart.innerHTML = '';
      
      // Find the maximum value for scaling
      const maxAvailable = Math.max(...projectionData.map(d => d.available));
      
      // Create chart container with flexbox 
      const chartContainer = document.createElement('div');
      chartContainer.className = 'flex items-end justify-between h-[180px] w-full gap-3 pt-2';
      
      // Add each data point as a simple bar
      projectionData.forEach((data, index) => {
        // Create column container
        const column = document.createElement('div');
        column.className = 'flex flex-col items-center flex-1';
        
        // Calculate height percentage (max 90% of container height)
        const heightPercent = (data.available / maxAvailable) * 90;
        
        // Create bar
        const bar = document.createElement('div');
        bar.className = 'w-full rounded-t transition-colors';
        bar.style.height = `${heightPercent}%`;
        bar.style.backgroundColor = index === 0 ? '#4b7bec' : '#4b7bec80';
        
        // Create label for the value
        const valueLabel = document.createElement('div');
        valueLabel.className = 'text-xs font-medium text-gray-700 mb-1';
        valueLabel.textContent = data.available.toString();
        
        // Create label for the year
        const yearLabel = document.createElement('div');
        yearLabel.className = 'text-xs text-gray-500 mt-1';
        yearLabel.textContent = data.year.toString();
        
        // Assemble the column
        column.appendChild(valueLabel);
        column.appendChild(bar);
        column.appendChild(yearLabel);
        chartContainer.appendChild(column);
      });
      
      // Create x-axis label
      const axisLabel = document.createElement('div');
      axisLabel.className = 'text-xs text-gray-500 text-center mt-4';
      axisLabel.textContent = 'Projected Year';
      
      // Create chart title
      const title = document.createElement('div'); 
      title.className = 'text-sm font-medium mb-4';
      title.textContent = 'PRV Availability Projection (5 Year Outlook)';
      
      // Add the chart elements to the container
      projectionChart.appendChild(title);
      projectionChart.appendChild(chartContainer);
      projectionChart.appendChild(axisLabel);
    }
  
    // Manual update function
    function updateCalculation() {
      stats = calcRange();
      projectionData = calculateProjection();
      renderProjectionChart();
    }
    
    // Event handlers for each input
    function handleCurrentAvailable(e: Event) {
      currentAvailable = Number((e.target as HTMLInputElement).value);
      updateCalculation();
    }
    
    function handleExpectedNew(e: Event) {
      expectedNew = Number((e.target as HTMLInputElement).value);
      updateCalculation();
    }
    
    function handleExpectedRedeemed(e: Event) {
      expectedRedeemed = Number((e.target as HTMLInputElement).value);
      updateCalculation();
    }
    
    function handleRecencyImportance(e: Event) {
      recencyImportance = Number((e.target as HTMLInputElement).value);
      updateCalculation();
    }
    
    function handleSupplySensitivity(e: Event) {
      supplySensitivity = Number((e.target as HTMLInputElement).value);
      updateCalculation();
    }
    
    function handleConfidence(e: Event) {
      confidence = Number((e.target as HTMLInputElement).value);
      updateCalculation();
    }
    
    // Calculate on mount
    onMount(() => {
      updateCalculation();
    });
</script>
  

<div class="p-4 space-y-6">
  <h2 class="text-xl mb-2">PRV Price Range Calculator</h2>
  <p class="text-gray-600 text-sm mb-4 max-w-prose">
    Adjust the sliders and numbers below to see how different market
    conditions could influence the sale price of the next Priority‑Review
    Voucher.  The tool outputs a price band with your chosen confidence
    level.
  </p>

  <!-- 1. Supply assumptions -->
  <fieldset class="border rounded-xl space-y-4">
    <legend class="font-medium text-slate-500">Supply assumptions</legend>

    <div class="grid sm:grid-cols-3 gap-4">
      <label class="flex flex-col">
        <span class="mb-1">PRVs currently available</span>
        <input type="number" min="0" value={currentAvailable} on:input={handleCurrentAvailable} class="border rounded px-2 py-1" />
      </label>

      <label class="flex flex-col">
        <span class="mb-1">Expected new PRVs each year</span>
        <input type="number" min="0" value={expectedNew} on:input={handleExpectedNew} class="border rounded px-2 py-1" />
      </label>

      <label class="flex flex-col">
        <span class="mb-1">Expected PRVs redeemed</span>
        <input type="number" min="0" value={expectedRedeemed} on:input={handleExpectedRedeemed} class="border rounded px-2 py-1" />
      </label>
    </div>

    <p class="text-sm text-gray-500 mt-2">
      <strong>Effective supply:</strong> {stats.effAvail}
    </p>

    <!-- PRV Availability Projection Chart -->
    <div class="mt-6 border rounded-lg p-4 bg-gray-50" bind:this={projectionChart}></div>
    <p class="text-xs text-gray-500 mt-1">
      Based on current availability and expected yearly changes in the PRV market
    </p>
  </fieldset>

  <!-- 2. Market dynamics sliders -->
  <fieldset class="border-t-2 border-slate-800 space-y-4">
    <legend class="font-medium text-slate-500">Market dynamics</legend>

    <div class="flex flex-col gap-4">
      <!-- Recency slider -->
      <label class="flex flex-col">
        <span class="mb-1">How much do <em>older</em> sale prices matter?</span>
        <input type="range" min="0" max="5" step="1" value={recencyImportance} on:input={handleRecencyImportance} class="cursor-pointer" />
        <span class="text-sm text-gray-500 mt-1">
          {recencyImportance} / 5
        </span>
      </label>

      <!-- Supply sensitivity slider -->
      <label class="flex flex-col">
        <span class="mb-1">How sensitive is price to supply?</span>
        <input type="range" min="0" max="5" step="1" value={supplySensitivity} on:input={handleSupplySensitivity} class="cursor-pointer" />
        <span class="text-sm text-gray-500 mt-1">
          {supplySensitivity} / 5
        </span>
      </label>
    </div>
  </fieldset>

  <!-- 3. Confidence level -->
  <div class="flex items-center space-x-2">
    <label class="font-medium">Confidence band:</label>
    <select value={confidence} on:change={handleConfidence} class="border rounded px-2 py-1">
      <option value="0.8">80% (narrow)</option>
      <option value="0.9">90%</option>
      <option value="0.95">95% (wide)</option>
    </select>
  </div>

  <!-- Result card -->
  <div class="p-4 rounded-xl shadow bg-white">
    <h3 class="text-xl font-semibold mb-2">Estimated Price Range</h3>
    <p class="text-lg">
      <span class="font-medium">Low:</span> {fmtUSD(stats.low)}
      &nbsp;–&nbsp;
      <span class="font-medium">High:</span> {fmtUSD(stats.high)}
    </p>
    <p class="text-sm text-gray-500 mt-1">
      Weighted mean: {fmtUSD(stats.mean)} &middot; σ: {fmtUSD(stats.sigma)}
    </p>
  </div>

  <!-- Advanced details toggle -->
  <details class="mt-4">
    <summary class="cursor-pointer font-medium">Show advanced details</summary>
    <ul class="mt-2 text-sm text-gray-600 list-disc list-inside space-y-1">
      <li>Recency decay λ: {stats.λ.toFixed(2)}</li>
      <li>Supply elasticity α: {stats.α.toFixed(2)}</li>
      <li>Baseline supply factor (hist.): {stats.baselineFactor.toFixed(3)}</li>
      <li>Current discount factor: {stats.discountFactor.toFixed(3)}</li>
      <li>Effective supply in model: {stats.effAvail}</li>
    </ul>

    <!-- Raw data table for transparency -->
    <table class="table w-full mt-4">
      <thead>
        <tr>
          <th class="text-left">Year</th>
          <th class="text-left">Available then</th>
          <th class="text-left">Observed Price</th>
        </tr>
      </thead>
      <tbody>
        {#each salesData as d}
          <tr>
            <td>{d.year}</td>
            <td>{d.available}</td>
            <td>{fmtUSD(d.price)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </details>
</div>
  
<style>
  /* Styles for bars in the chart */
  :global(.chart-bar) {
    transition: background-color 0.3s ease;
  }
</style>
  
<!-- CompanyLeaderboard.svelte -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data = [];
    export let height = 400;
    export let maxCompanies = 10;
    
    let topCompanies = [];
    let prvsByCompany = [];
    let salesByCompany = [];
    
    function processData() {
      if (!data || data.length === 0) return;
      
      // Count PRVs and sales by company
      const companyStats = {};
      
      // Process PRVs
      data.filter(d => d["PRV Year"]).forEach(d => {
        const company = d.Company;
        if (!companyStats[company]) {
          companyStats[company] = {
            company,
            prvCount: 0,
            salesCount: 0,
            totalSalesValue: 0,
            saleDetails: []
          };
        }
        
        companyStats[company].prvCount += 1;
        
        // Track sales
        if (d.Purchased === "Y") {
          companyStats[company].salesCount += 1;
          
          // Add sale value if available
          if (d["Sale Price (USD Millions)"] && d["Sale Price (USD Millions)"] !== "Undisclosed") {
            const saleValue = parseFloat(d["Sale Price (USD Millions)"]);
            companyStats[company].totalSalesValue += saleValue;
            
            companyStats[company].saleDetails.push({
              drug: d.Candidate,
              buyer: d.Purchaser,
              year: d["Purchase Year"],
              value: saleValue
            });
          }
        }
      });
      
      // Convert to array and sort
      topCompanies = Object.values(companyStats)
        .filter(c => c.prvCount > 0)
        .sort((a, b) => b.prvCount - a.prvCount || b.totalSalesValue - a.totalSalesValue)
        .slice(0, maxCompanies);
      
      // Format data for d3
      prvsByCompany = topCompanies.map(c => ({
        company: c.company,
        count: c.prvCount
      }));
      
      salesByCompany = topCompanies
        .filter(c => c.totalSalesValue > 0)
        .map(c => ({
          company: c.company,
          totalValue: c.totalSalesValue,
          salesCount: c.salesCount,
          avgValue: c.totalSalesValue / c.salesCount,
          details: c.saleDetails
        }))
        .sort((a, b) => b.totalValue - a.totalValue);
    }
    
    $: {
      if (data) {
        processData();
      }
    }
    
    onMount(() => {
      if (data && data.length > 0) {
        processData();
      }
    });
  </script>
  
  <div class="company-leaderboard">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- PRVs Awarded by Company -->
      <div class="bg-white p-4 rounded-lg border border-slate-200">
        <h3 class="text-base font-semibold text-slate-700 mb-3">Top Companies by PRVs</h3>
        
        <div class="overflow-hidden">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="py-2 text-left text-xs font-medium text-slate-500">Company</th>
                <th class="py-2 text-right text-xs font-medium text-slate-500">PRVs Awarded</th>
              </tr>
            </thead>
            <tbody>
              {#each prvsByCompany as entry, i}
                <tr class="border-b border-slate-100 {i % 2 === 0 ? 'bg-slate-50' : ''}">
                  <td class="py-2 text-sm font-medium text-slate-700">{entry.company}</td>
                  <td class="py-2 text-sm text-right text-slate-700">
                    <span class="inline-flex items-center">
                      {entry.count}
                    </span>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Sales by Company -->
      <div class="bg-white p-4 rounded-lg border border-slate-200">
        <h3 class="text-base font-semibold text-slate-700 mb-3">Top Companies by Sales Value</h3>
        
        <div class="overflow-hidden">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="py-2 text-left text-xs font-medium text-slate-500">Company</th>
                <th class="py-2 text-right text-xs font-medium text-slate-500">Total Value (USD M)</th>
                <th class="py-2 text-right text-xs font-medium text-slate-500">Sales</th>
                <th class="py-2 text-right text-xs font-medium text-slate-500">Avg Value</th>
              </tr>
            </thead>
            <tbody>
              {#each salesByCompany as entry, i}
                <tr class="border-b border-slate-100 {i % 2 === 0 ? 'bg-slate-50' : ''}">
                  <td class="py-2 text-sm font-medium text-slate-700">{entry.company}</td>
                  <td class="py-2 text-sm text-right text-slate-700">
                    ${entry.totalValue.toFixed(1)}M
                  </td>
                  <td class="py-2 text-sm text-right text-slate-700">
                    {entry.salesCount}
                  </td>
                  <td class="py-2 text-sm text-right text-slate-700">
                    ${entry.avgValue.toFixed(1)}M
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Sale Details Expansion Section -->
    {#if salesByCompany.length > 0}
      <div class="mt-6 bg-white p-4 rounded-lg border border-slate-200">
        <h3 class="text-base font-semibold text-slate-700 mb-3">Notable Sales Details</h3>
        
        <div class="space-y-4">
          {#each salesByCompany.slice(0, 3) as company}
            <div class="border-b border-slate-100 pb-3">
              <h4 class="text-sm font-medium text-slate-700 mb-2">{company.company}</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {#each company.details.sort((a, b) => b.value - a.value).slice(0, 3) as sale}
                  <div class="bg-slate-50 p-2 rounded text-xs">
                    <div class="font-medium text-slate-700">{sale.drug}</div>
                    <div class="text-slate-500">Purchased by {sale.buyer || 'Undisclosed'}</div>
                    <div class="text-slate-500">{sale.year || 'N/A'} • ${sale.value.toFixed(1)}M</div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- PRV Distribution Visualization -->
    <div class="mt-6 bg-white p-4 rounded-lg border border-slate-200">
      <h3 class="text-base font-semibold text-slate-700 mb-3">PRV Distribution by Company</h3>
      
      <div class="h-64" id="prv-distribution-chart">
        <!-- D3 Chart will be rendered here -->
      </div>
      
      <script>
        import { afterUpdate } from 'svelte';
        
        let chart;
        
        afterUpdate(() => {
          if (prvsByCompany.length > 0) {
            renderPRVDistributionChart();
          }
        });
        
        function renderPRVDistributionChart() {
          const chartElement = document.getElementById('prv-distribution-chart');
          if (!chartElement) return;
          
          // Clear previous chart
          chartElement.innerHTML = '';
          
          // Set dimensions
          const margin = {top: 20, right: 30, bottom: 40, left: 90};
          const width = chartElement.clientWidth - margin.left - margin.right;
          const height = chartElement.clientHeight - margin.top - margin.bottom;
          
          // Create SVG
          const svg = d3.select(chartElement)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
          
          // X axis
          const x = d3.scaleLinear()
            .domain([0, d3.max(prvsByCompany, d => d.count) * 1.1])
            .range([0, width]);
          
          svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));
          
          // Y axis
          const y = d3.scaleBand()
            .domain(prvsByCompany.map(d => d.company))
            .range([0, height])
            .padding(0.2);
          
          svg.append('g')
            .call(d3.axisLeft(y));
          
          // Bars
          svg.selectAll('rect')
            .data(prvsByCompany)
            .join('rect')
            .attr('x', 0)
            .attr('y', d => y(d.company))
            .attr('width', d => x(d.count))
            .attr('height', y.bandwidth())
            .attr('fill', '#60a5fa');
          
          // Bar labels
          svg.selectAll('.bar-label')
            .data(prvsByCompany)
            .join('text')
            .attr('class', 'bar-label')
            .attr('x', d => x(d.count) + 5)
            .attr('y', d => y(d.company) + y.bandwidth() / 2)
            .attr('dy', '.35em')
            .text(d => d.count)
            .attr('fill', '#1e40af')
            .attr('font-size', '10px');
        }
      </script>
    </div>
  </div>
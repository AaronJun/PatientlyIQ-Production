<!-- CompanyLeaderboard.svelte -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { hasPRVAward } from '../utils/data-processing-utils';
    
    export let data = [];
    export let height = 300;
    
    let svg;
    let chartContainer;
    let tooltipVisible = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipContent = { company: '', count: 0, transactions: 0 };
    
    function createVisualization() {
      if (!svg || !chartContainer || !data || data.length === 0) return;
      
      const svgElement = d3.select(svg);
      svgElement.selectAll("*").remove();
      
      // Process data - extract company leaderboard data
      const companyCounts = {};
      const transactionCounts = {};
      
      // Count PRVs awarded per company
      data.filter(d => hasPRVAward(d)).forEach(d => {
        const company = d.Company || 'Unknown';
        companyCounts[company] = (companyCounts[company] || 0) + 1;
        
        // Count transactions (PRVs with purchase information)
        if (d.Purchased === "Y") {
          transactionCounts[company] = (transactionCounts[company] || 0) + 1;
        }
      });
      
      // Convert to array and sort
      const companyData = Object.entries(companyCounts)
        .map(([company, count]) => ({
          company,
          count,
          transactions: transactionCounts[company] || 0
        }))
        .sort((a, b) => b.count - a.count || b.transactions - a.transactions)
        .slice(0, 10); // Top 10 companies
      
      if (companyData.length === 0) {
        svgElement.append("text")
          .attr("x", chartContainer.clientWidth / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#4A5568")
          .text("No company data available");
        return;
      }
      
      // Get actual container width
      const containerWidth = chartContainer.clientWidth;
      
      // Set SVG width to match container
      svgElement.attr("width", containerWidth);
      
      // Set up dimensions
      const margin = { top: 20, right: 100, bottom: 40, left: 140 };
      const chartWidth = containerWidth - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      
      // Create scales
      const yScale = d3.scaleBand()
        .domain(companyData.map(d => d.company))
        .range([0, chartHeight])
        .padding(0.3);
      
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(companyData, d => d.count) * 1.1])
        .range([0, chartWidth]);
      
      // Create chart group
      const chart = svgElement.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
      // Add gridlines
      chart.append("g")
        .attr("class", "grid")
        .call(d3.axisTop(xScale)
          .tickSize(-chartHeight)
          .tickFormat("")
          .ticks(5))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-dasharray", "2,2"));
      
      // Add x-axis
      chart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle");
      
      // Add y-axis
      chart.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("font-weight", "500")
        .attr("fill", "#4A5568");
      
      // Create color scale for transaction ratio
      const colorScale = d3.scaleSequential()
        .domain([0, d3.max(companyData, d => d.count)])
        .interpolator(d3.interpolateBlues);
      
      // Add bars
      chart.selectAll(".bar")
        .data(companyData)
        .join("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.company))
        .attr("x", 0)
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.count))
        .attr("fill", d => colorScale(d.count))
        .attr("opacity", 0.8)
        .on("mouseenter", (event, d) => {
          d3.select(event.currentTarget)
            .attr("opacity", 1)
            .attr("stroke", "#2C5282")
            .attr("stroke-width", 1);
          
          tooltipContent = { 
            company: d.company, 
            count: d.count, 
            transactions: d.transactions 
          };
          
          tooltipX = event.pageX;
          tooltipY = event.pageY;
          tooltipVisible = true;
        })
        .on("mousemove", (event) => {
          tooltipX = event.pageX;
          tooltipY = event.pageY;
        })
        .on("mouseleave", (event) => {
          d3.select(event.currentTarget)
            .attr("opacity", 0.8)
            .attr("stroke", null);
          
          tooltipVisible = false;
        });
      
      // Add value and transaction labels
      chart.selectAll(".label")
        .data(companyData)
        .join("text")
        .attr("class", "label")
        .attr("y", d => yScale(d.company) + yScale.bandwidth() / 2)
        .attr("x", d => xScale(d.count) + 10)
        .attr("dy", "0.35em")
        .attr("font-size", "10px")
        .attr("fill", "#4A5568")
        .text(d => `${d.count} PRVs (${d.transactions} sold)`);
      
      // Add x-axis label
      chart.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("fill", "#4A5568")
        .text("Number of PRVs Awarded");
    }
    
    function handleResize() {
      if (chartContainer) {
        createVisualization();
      }
    }
    
    $: if (data && chartContainer) {
      setTimeout(createVisualization, 0);
    }
    
    onMount(() => {
      if (data && data.length > 0 && chartContainer) {
        setTimeout(createVisualization, 0);
      }
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });
  </script>
  
  <div bind:this={chartContainer} class="company-leaderboard-chart relative w-full">
    <svg bind:this={svg} width="100%" height={height}></svg>
    
    {#if tooltipVisible}
      <div 
        class="absolute z-10 bg-white p-2 rounded shadow-lg border border-slate-200 text-sm"
        style="left: {tooltipX}px; top: {tooltipY - 40}px; transform: translate(-50%, -100%);"
      >
        <div class="font-medium text-slate-800">{tooltipContent.company}</div>
        <div class="text-slate-600">
          <div>PRVs Awarded: <span class="font-medium">{tooltipContent.count}</span></div>
          <div>PRVs Sold: <span class="font-medium">{tooltipContent.transactions}</span></div>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    .company-leaderboard-chart {
      width: 100%;
      box-sizing: border-box;
    }
  </style>
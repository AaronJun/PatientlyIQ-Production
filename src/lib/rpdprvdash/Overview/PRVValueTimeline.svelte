<!-- PRVValueTimeline.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data: any[] = [];
    export let height = 250;
    
    let svg: any;
    let chartContainer: any;
    let tooltipVisible = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipContent = { year: '', value: 0, buyer: '', seller: '', drug: '' };
    
    // Add a variable to track if the chart was initially rendered
    let wasInitiallyRendered = false;
    
    // Export this function to allow external components to trigger a redraw
    export function createVisualization() {
      if (!svg || !chartContainer || !data || data.length === 0) return;
      
      const svgElement = d3.select(svg);
      svgElement.selectAll("*").remove();
      
      // Process data - extract PRV sale transactions
      const transactions = data
        .filter(d => d.Purchased === "Y" && d["Sale Price (USD Millions)"] && d["Sale Price (USD Millions)"] !== "Undisclosed")
        .map(d => ({
          year: d["Purchase Year"],
          date: new Date(`${d["Purchase Year"]}-${d["Purchase Month"]}-${d["Purchase Date"] || "01"}`),
          value: parseFloat(d["Sale Price (USD Millions)"]),
          buyer: d.Purchaser || "Unknown",
          seller: d.Company || "Unknown",
          drug: d.Candidate || "Unknown"
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      if (transactions.length === 0) {
        svgElement.append("text")
          .attr("x", chartContainer.clientWidth / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#4A5568")
          .text("No transaction data available");
        return;
      }
      
      // Get actual container width
      const containerWidth = chartContainer.clientWidth;
      
      // Set SVG width to match container
      svgElement.attr("width", containerWidth);
      
      // Set up dimensions
      const margin = { top: 20, right: 30, bottom: 40, left: 50 };
      const chartWidth = containerWidth - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      
      // Create scales
      const xScale = d3.scaleTime()
        .domain(d3.extent(transactions, d => d.date) as [Date, Date])
        .range([0, chartWidth])
        .nice();
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(transactions, d => d.value) * 1.1 || 0])
        .range([chartHeight, 0]);
      
      // Create chart group
      const chart = svgElement.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
      // Add gridlines
      chart.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => '')
          .ticks(5))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-dasharray", "2,2"));
      
      // Add x-axis
      chart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%Y") as any))
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle");
      
      // Add y-axis
      chart.append("g")
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}M`))
        .selectAll("text")
        .attr("font-size", "10px");
      
      // Add line
      const line = d3.line<{date: Date, value: number}>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
      
      chart.append("path")
        .datum(transactions)
        .attr("fill", "none")
        .attr("stroke", "#3182CE")
        .attr("stroke-width", 2)
        .attr("d", line);
      
      // Add points
      chart.selectAll(".point")
        .data(transactions)
        .join("circle")
        .attr("class", "point")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", 5)
        .attr("fill", "#3182CE")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("opacity", 0.8)
        .on("mouseenter", (event, d) => {
          d3.select(event.currentTarget)
            .attr("r", 7)
            .attr("opacity", 1);
          
          tooltipContent = {
            year: d.date.getFullYear().toString(),
            value: d.value,
            buyer: d.buyer,
            seller: d.seller,
            drug: d.drug
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
            .attr("r", 5)
            .attr("opacity", 0.8);
          
          tooltipVisible = false;
        });
      
      // Add title
      chart.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("fill", "#4A5568")
        .text("PRV Sale Prices Over Time");
        
      // Mark as initially rendered
      wasInitiallyRendered = true;
    }
    
    function handleResize() {
      if (chartContainer) {
        createVisualization();
      }
    }
    
    // Remove IntersectionObserver approach since we're now using direct method calling
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
  
  <div bind:this={chartContainer} class="prv-value-chart relative w-full">
    <svg bind:this={svg} width="100%" height={height}></svg>
    
    {#if tooltipVisible}
      <div 
        class="absolute z-10 bg-white p-2 rounded shadow-lg border border-slate-200 text-sm"
        style="left: {tooltipX}px; top: {tooltipY - 40}px; transform: translate(-50%, -100%);"
      >
        <div class="font-medium text-slate-800">Sale Price: <span class="text-blue-600">${tooltipContent.value}M</span></div>
        <div class="text-slate-600 text-xs">
          <div><span class="font-medium">Seller:</span> {tooltipContent.seller}</div>
          <div><span class="font-medium">Buyer:</span> {tooltipContent.buyer}</div>
          <div><span class="font-medium">Drug:</span> {tooltipContent.drug}</div>
          <div><span class="font-medium">Year:</span> {tooltipContent.year}</div>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    .prv-value-chart {
      width: 100%;
      box-sizing: border-box;
    }
  </style>
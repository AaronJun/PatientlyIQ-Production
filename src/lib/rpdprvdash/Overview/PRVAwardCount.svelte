<!-- PRVAwardCount.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let yearlyData: { year: string, count: number }[] = [];
    export let height = 250;
    
    let svg: any;
    let chartContainer: any;
    let tooltipVisible = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipContent = { year: '', count: 0 };
    
    // Track if the chart was rendered initially
    let wasInitiallyRendered = false;
    
    $: if (yearlyData && chartContainer) {
      setTimeout(createVisualization, 0);
    }
    
    function handleResize() {
      if (chartContainer) {
        createVisualization();
      }
    }
    
    // Remove the visibility checker since we now use direct method calls
    onMount(() => {
      if (yearlyData && yearlyData.length > 0 && chartContainer) {
        setTimeout(createVisualization, 0);
      }
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });
    
    // Export this function to allow external components to trigger a redraw
    export function createVisualization() {
      if (!svg || !chartContainer || !yearlyData || yearlyData.length === 0) return;
      
      const svgElement = d3.select(svg);
      svgElement.selectAll("*").remove();
      
      // Get actual container width
      const containerWidth = chartContainer.clientWidth;
      
      // Set SVG width to match container
      svgElement.attr("width", containerWidth);
      
      // Set up dimensions
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const chartWidth = containerWidth - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      
      // Create scales
      const xScale = d3.scaleBand()
        .domain(yearlyData.map(d => d.year))
        .range([0, chartWidth])
        .padding(0.3);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(yearlyData, d => d.count) * 1.1 || 0])
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
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle");
      
      // Add y-axis
      chart.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll("text")
        .attr("font-size", "10px");
      
      // Add bars
      chart.selectAll(".bar")
        .data(yearlyData)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.year) || 0)
        .attr("y", d => yScale(d.count))
        .attr("width", xScale.bandwidth())
        .attr("height", d => chartHeight - yScale(d.count))
        .attr("fill", "#ED8936")
        .attr("rx", 2)
        .attr("opacity", 0.8)
        .on("mouseenter", (event, d) => {
          d3.select(event.currentTarget)
            .attr("opacity", 1)
            .attr("stroke", "#C05621")
            .attr("stroke-width", 1);
          
          tooltipContent = { year: d.year, count: d.count };
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
      
      // Add value labels
      chart.selectAll(".label")
        .data(yearlyData)
        .join("text")
        .attr("class", "label")
        .attr("x", d => (xScale(d.year) || 0) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.count) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "#4A5568")
        .text(d => d.count);
      
      // Add title
      chart.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("fill", "#4A5568")
        .text("PRVs Awarded by Year");
        
      // Mark that the chart has been rendered
      wasInitiallyRendered = true;
    }
  </script>
  
  <div bind:this={chartContainer} class="prv-award-chart relative w-full">
    <svg bind:this={svg} width="100%" height={height}></svg>
    
    {#if tooltipVisible}
      <div 
        class="absolute z-10 bg-white p-2 rounded shadow-lg border border-slate-200 text-sm"
        style="left: {tooltipX}px; top: {tooltipY - 40}px; transform: translate(-50%, -100%);"
      >
        <div class="font-medium text-slate-800">{tooltipContent.year}</div>
        <div class="text-slate-600">PRVs Awarded: <span class="font-medium">{tooltipContent.count}</span></div>
      </div>
    {/if}
  </div>
  
  <style>
    .prv-award-chart {
      width: 100%;
      box-sizing: border-box;
    }
  </style>
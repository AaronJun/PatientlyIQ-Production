<!-- TherapeuticAreaDistribution.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { hasPRVAward } from '../utils/data-processing-utils';
    
    export let data: any[] = [];
    export let height = 250;
    
    let svg: any;
    let chartContainer: any;
    let tooltipVisible = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipContent = { area: '', count: 0, percentage: 0 };
    
    // Track if the chart was initially rendered
    let wasInitiallyRendered = false;
    
    // Therapeutic area color map
    const colorMap = {
      'Neurology': '#FF6B6B',
      'Neuromuscular': '#E63946',
      'Oncology': '#38B2AC',
      'Metabolic': '#667EEA',
      'Ophthalmology': '#68D391',
      'Cardiovascular': '#F6AD55',
      'Pulmonology': '#B794F4',
      'Hematology': '#48BB78',
      'Endocrinology': '#F59E0B',
      'Genetic': '#0BC5EA',
      'Immunology': '#E53E3E',
      'Gastroenterology': '#ECC94B',
      'Hepatology': '#9AE6B4',
      'Dermatology': '#FC8181',
      'Neonatology': '#76E4F7',
      'Urology': '#9F7AEA',
      'Other': '#CBD5E0'
    };
    
    function getColor(area: string) {
      return colorMap[area as keyof typeof colorMap] || colorMap.Other;
    }
    
    // Export this function to allow external components to trigger a redraw
    export function createVisualization() {
      if (!svg || !chartContainer || !data || data.length === 0) return;
      
      const svgElement = d3.select(svg);
      svgElement.selectAll("*").remove();
      
      // Process data - extract therapeutic area distribution for PRVs awarded
      const prvData = data.filter(d => hasPRVAward(d));
      
      if (prvData.length === 0) {
        svgElement.append("text")
          .attr("x", chartContainer.clientWidth / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#4A5568")
          .text("No PRV data available");
        return;
      }
      
      // Count areas
      const areaCounts: Record<string, number> = {};
      prvData.forEach(d => {
        const area = d.TherapeuticArea1 || 'Other';
        areaCounts[area] = (areaCounts[area] || 0) + 1;
      });
      
      // Convert to array and sort
      const areaData = Object.entries(areaCounts)
        .map(([area, count]) => ({
          area,
          count,
          percentage: (count / prvData.length) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Top 8 areas
      
      // Get actual container width
      const containerWidth = chartContainer.clientWidth;
      
      // Set SVG width to match container
      svgElement.attr("width", containerWidth);
      
      // Set up dimensions
      const margin = { top: 20, right: 30, bottom: 60, left: 120 };
      const chartWidth = containerWidth - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      
      // Create scales
      const yScale = d3.scaleBand()
        .domain(areaData.map(d => d.area))
        .range([0, chartHeight])
        .padding(0.3);
      
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(areaData, d => d.percentage) ? d3.max(areaData, d => d.percentage)! * 1.1 : 0])
        .range([0, chartWidth]);
      
      // Create chart group
      const chart = svgElement.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
      // Add gridlines
      chart.append("g")
        .attr("class", "grid")
        .call(d3.axisBottom(xScale)
          .tickSize(chartHeight)
          .tickFormat(() => '')
          .ticks(5))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-dasharray", "2,2"));
      
      // Add x-axis
      chart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${(d as number).toFixed(0)}%`))
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle");
      
      // Add y-axis
      chart.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("font-size", "10px");
      
      // Add bars
      chart.selectAll(".bar")
        .data(areaData)
        .join("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => yScale(d.area) || 0)
        .attr("width", d => xScale(d.percentage))
        .attr("height", yScale.bandwidth())
        .attr("fill", d => getColor(d.area))
        .attr("rx", 2)
        .attr("opacity", 0.8)
        .on("mouseenter", (event, d) => {
          d3.select(event.currentTarget)
            .attr("opacity", 1)
            .attr("stroke", "#4A5568")
            .attr("stroke-width", 1);
          
          tooltipContent = { 
            area: d.area, 
            count: d.count, 
            percentage: parseFloat(d.percentage.toFixed(1))
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
      
      // Add value labels
      chart.selectAll(".label")
        .data(areaData)
        .join("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.percentage) + 5)
        .attr("y", d => (yScale(d.area) || 0) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("font-size", "10px")
        .attr("fill", "#4A5568")
        .text(d => `${d.count} PRVs (${d.percentage.toFixed(1)}%)`);
      
      // Add title
      chart.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("fill", "#4A5568")
        .text("Top Therapeutic Areas");
        
      // Mark that the chart has been rendered
      wasInitiallyRendered = true;
    }
    
    function handleResize() {
      if (chartContainer) {
        createVisualization();
      }
    }
    
    // Add reactive statement to create visualization when data changes
    $: if (data && chartContainer) {
      setTimeout(createVisualization, 0);
    }
    
    // Check for visibility changes
    function checkVisibility() {
      // If the chart has been initially rendered and the element is now visible in the DOM,
      // we need to re-render it to ensure it appears properly
      if (wasInitiallyRendered && chartContainer) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // The element is visible, recreate the visualization
              setTimeout(createVisualization, 10);
              // We can stop observing once it's rendered
              observer.disconnect();
            }
          });
        });
        
        // Start observing the chart container
        observer.observe(chartContainer);
        
        return () => {
          observer.disconnect();
        };
      }
    }
    
    onMount(() => {
      if (data && data.length > 0 && chartContainer) {
        setTimeout(createVisualization, 0);
      }
      
      window.addEventListener('resize', handleResize);
      
      // Set up visibility observer
      const cleanup = checkVisibility();
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (cleanup) cleanup();
      };
    });
  </script>
  
  <div bind:this={chartContainer} class="therapeutic-area-chart relative w-full">
    <svg bind:this={svg} width="100%" height={height}></svg>
    
    {#if tooltipVisible}
      <div 
        class="absolute z-10 bg-white p-2 rounded shadow-lg border border-slate-200 text-sm"
        style="left: {tooltipX}px; top: {tooltipY - 40}px; transform: translate(-50%, -100%);"
      >
        <div class="font-medium text-slate-800" style="color: {getColor(tooltipContent.area)};">
          {tooltipContent.area}
        </div>
        <div class="text-slate-600">
          <span class="font-medium">{tooltipContent.count}</span> PRVs 
          (<span class="font-medium">{tooltipContent.percentage}%</span>)
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    .therapeutic-area-chart {
      width: 100%;
      box-sizing: border-box;
    }
  </style>
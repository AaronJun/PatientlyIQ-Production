<!-- TherapeuticAreaDistribution.svelte -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { hasPRVAward } from '../utils/data-processing-utils';
    
    export let data = [];
    export let height = 250;
    
    let svg;
    let tooltipVisible = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipContent = { area: '', count: 0, percentage: 0 };
    
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
    
    function getColor(area) {
      return colorMap[area] || colorMap.Other;
    }
    
    function createVisualization() {
      if (!svg || !data || data.length === 0) return;
      
      const svgElement = d3.select(svg);
      svgElement.selectAll("*").remove();
      
      // Process data - extract therapeutic area distribution for PRVs awarded
      const prvData = data.filter(d => hasPRVAward(d));
      
      if (prvData.length === 0) {
        svgElement.append("text")
          .attr("x", svg.clientWidth / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#4A5568")
          .text("No PRV data available");
        return;
      }
      
      // Count areas
      const areaCounts = {};
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
      
      // Set up dimensions
      const width = svg.clientWidth;
      const margin = { top: 20, right: 20, bottom: 60, left: 120 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      
      // Create scales
      const yScale = d3.scaleBand()
        .domain(areaData.map(d => d.area))
        .range([0, chartHeight])
        .padding(0.3);
      
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(areaData, d => d.percentage) * 1.1])
        .range([0, chartWidth]);
      
      // Create chart group
      const chart = svgElement.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
      
      // Add gridlines
      chart.append("g")
        .attr("class", "grid")
        .call(d3.axisBottom(xScale)
          .tickSize(chartHeight)
          .tickFormat("")
          .ticks(5))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line")
          .attr("stroke", "#e2e8f0")
          .attr("stroke-dasharray", "2,2"))
        .attr("transform", `translate(0, 0)`);
      
      // Add x-axis
      chart.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}%`))
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
        .attr("y", d => yScale(d.area))
        .attr("x", 0)
        .attr("height", yScale.bandwidth())
        .attr("width", d => xScale(d.percentage))
        .attr("fill", d => getColor(d.area))
        .attr("rx", 3)
        .attr("opacity", 0.8)
        .on("mouseenter", (event, d) => {
          d3.select(event.currentTarget)
            .attr("opacity", 1)
            .attr("stroke", "#4A5568")
            .attr("stroke-width", 1);
          
          tooltipContent = {
            area: d.area,
            count: d.count,
            percentage: d.percentage.toFixed(1)
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
        .attr("y", d => yScale(d.area) + yScale.bandwidth() / 2)
        .attr("x", d => xScale(d.percentage) + 5)
        .attr("dy", "0.35em")
        .attr("font-size", "10px")
        .attr("fill", "#4A5568")
        .text(d => `${d.percentage.toFixed(1)}% (${d.count})`);
      
      // Add title
      chart.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "500")
        .attr("fill", "#4A5568")
        .text("PRVs by Therapeutic Area");
    }
    
    $: if (data && svg) {
      setTimeout(createVisualization, 0);
    }
    
    onMount(() => {
      if (data && data.length > 0) {
        createVisualization();
    }
      
      const handleResize = () => {
        createVisualization();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });
  </script>
  
  <div class="therapeutic-area-chart relative">
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
    }
  </style>
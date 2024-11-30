<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { fade } from 'svelte/transition';
  
    interface SentimentData {
      Persona: string;
      Cohort: string;
      Topic: string;
      Subtopic: string;
      SEN: string;
      Quote: string;
    }
  
    export let data: SentimentData[] = [];
    
    let chart: HTMLDivElement;
    let tooltip: HTMLDivElement;
    
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    const height = 350;
    const rectWidth = 40;
    const rectHeight = 10;
    const rectGap = 2;
    
    $: width = chart?.clientWidth ?? 800;
    
    // Group data by sentiment
    $: groupedData = d3.group(data, d => d.SEN);
    
    // Color mapping
    const colorMap = {
      'Entirely Positive': '#2E7D33',
      'Somewhat Positive': '#4CAF50',
      'Neutral': '#C1A46E',
      'Somewhat Negative': '#ff7171',
      'Entirely Negative': '#ff5151'
    };
    
    // Order sentiments from negative to positive
    const sentimentOrder = [
      "Entirely Negative",
      "Somewhat Negative",
      "Neutral",
      "Somewhat Positive",
      "Entirely Positive"
    ];
    
    function createChart() {
      if (!chart) return;
      
      // Clear previous chart
      d3.select(chart).selectAll("*").remove();
      
      const svg = d3.select(chart)
        .append("svg")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom);
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // Create scales
      const xScale = d3.scaleBand()
        .domain(sentimentOrder)
        .range([0, width - margin.left - margin.right])
        .padding(0.1);
  
      // Create rectangles for each entry
      sentimentOrder.forEach((sentiment) => {
        const sentimentData = groupedData.get(sentiment) || [];
        
        g.selectAll(`rect.${sentiment.replace(/\s+/g, '-')}`)
          .data(sentimentData)
          .enter()
          .append("rect")
          .attr("class", sentiment.replace(/\s+/g, '-'))
          .attr("x", xScale(sentiment))
          .attr("y", (d, i) => i * (rectHeight + rectGap))
          .attr("width", rectWidth)
          .attr("height", rectHeight)
          .attr("fill", colorMap[sentiment])
          .attr("opacity", 0.8)
          .on("mouseover", (event, d) => {
            // Dim all other rectangles
            d3.selectAll("rect")
              .transition()
              .duration(200)
              .attr("opacity", 0.2);
            
            d3.select(event.target)
              .transition()
              .duration(200)
              .attr("opacity", 1);
            
            // Show tooltip with sentiment color
            const tooltipContent = `
              <div class="p-2">
                <div class="font-bold" style="color: ${colorMap[d.SEN]}">${d.Persona}</div>
                <div class="text-sm">${d.Topic}</div>
                <div class="text-sm text-black italic mt-1">${d.Quote}</div>
              </div>
            `;
            
            tooltip.innerHTML = tooltipContent;
            tooltip.style.display = "block";
            tooltip.style.left = `${event.pageX + 2}px`;
            tooltip.style.top = `${event.pageY - 1}px`;
          })
          .on("mouseout", () => {
            // Reset opacity
            d3.selectAll("rect")
              .transition()
              .duration(200)
              .attr("opacity", 0.8);
            
            // Hide tooltip
            tooltip.style.display = "none";
          });
      });
      
      // Add x-axis
      const xAxis = d3.axisBottom(xScale);
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end");
    }
    
    onMount(() => {
      createChart();
      
      // Handle window resize
      const resizeObserver = new ResizeObserver(() => {
        createChart();
      });
      
      resizeObserver.observe(chart);
      
      return () => {
        resizeObserver.disconnect();
      };
    });
  </script>
  
  <div class="relative">
    <div bind:this={chart} class="w-full"></div>
    
    <div
      bind:this={tooltip}
      class="absolute hidden bg-white shadow-lg rounded-lg border border-gray-200 z-10 max-w-xs"
      transition:fade
    ></div>
  </div>
  
  <style>
    :global(.tick text) {
      font-size: 10px;
    }
  </style>
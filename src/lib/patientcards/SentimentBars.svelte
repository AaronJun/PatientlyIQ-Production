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
    
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 600;
    const height = 600;
    const innerRadius = 100;
    const outerRadius = Math.min(width, height) / 2 - margin.top;
    
    $: groupedData = d3.group(data, d => d.SEN);
    
    const colorMap = {
      'Entirely Positive': '#2E7D33',
      'Somewhat Positive': '#4CAF50',
      'Neutral': '#C1A46E',
      'Somewhat Negative': '#ff7171',
      'Entirely Negative': '#ff5151'
    };
    
    const sentimentOrder = [
      "Entirely Negative",
      "Somewhat Negative",
      "Neutral",
      "Somewhat Positive",
      "Entirely Positive"
    ];
  
    function createChart() {
      if (!chart) return;
      
      d3.select(chart).selectAll("*").remove();
      
      const svg = d3.select(chart)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
  
      const angle = d3.scalePoint()
        .domain(sentimentOrder)
        .range([0, 2 * Math.PI]);
  
      sentimentOrder.forEach((sentiment, sIndex) => {
        const sentimentData = groupedData.get(sentiment) || [];
        const segmentAngle = 2 * Math.PI / sentimentOrder.length;
        const startAngle = sIndex * segmentAngle;
        
        sentimentData.forEach((d, i) => {
          const radius = innerRadius + (i * 12);
          const arc = d3.arc()
            .innerRadius(radius)
            .outerRadius(radius + 8)
            .startAngle(startAngle)
            .endAngle(startAngle + segmentAngle - 0.1);
  
          svg.append("path")
            .datum(d)
            .attr("d", arc)
            .attr("fill", colorMap[sentiment])
            .attr("opacity", 0.8)
            .on("mouseover", (event, d) => {
              d3.selectAll("path")
                .transition()
                .duration(200)
                .attr("opacity", 0.2);
              
              d3.select(event.target)
                .transition()
                .duration(200)
                .attr("opacity", 1);
              
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
              d3.selectAll("path")
                .transition()
                .duration(200)
                .attr("opacity", 0.8);
              
              tooltip.style.display = "none";
            });
        });
  
        // Add labels
        const labelAngle = startAngle + segmentAngle / 2;
        const labelRadius = outerRadius + 20;
        const x = labelRadius * Math.cos(labelAngle - Math.PI / 2);
        const y = labelRadius * Math.sin(labelAngle - Math.PI / 2);
        
        svg.append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("text-anchor", "middle")
          .attr("transform", `rotate(${(labelAngle * 180 / Math.PI) - 90}, ${x}, ${y})`)
          .style("font-size", "12px")
          .text(sentiment);
      });
    }
    
    onMount(() => {
      createChart();
      
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
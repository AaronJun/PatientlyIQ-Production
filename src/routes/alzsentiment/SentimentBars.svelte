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
  let containerWidth: number;
  let containerHeight: number;
  
  $: width = (containerWidth || 900) * 0.95;
  $: height = (containerHeight || 800);
  $: radius = Math.min(width, height) / 2.5;
  $: margin = {
    top: height * 0.1,
    right: width * 0.1,
    bottom: height * 0.1,
    left: width * 0.1
  };
  $: innerRadius = radius * 0.2;
  $: outerRadius = radius * 0.8;
  
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
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g");

    const angle = d3.scalePoint()
      .domain(sentimentOrder)
      .range([0, 2 * Math.PI]);

    sentimentOrder.forEach((sentiment, sIndex) => {
      const sentimentData = groupedData.get(sentiment) || [];
      const segmentAngle = 2 * Math.PI / sentimentOrder.length;
      const startAngle = sIndex * segmentAngle;
      
      sentimentData.forEach((d, i) => {
        const radius = innerRadius + (i * (outerRadius - innerRadius) / 25);
        const arc = d3.arc()
          .innerRadius(radius)
          .outerRadius(radius + (outerRadius - innerRadius) / 30)
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
            const containerRect = chart.getBoundingClientRect();
            tooltip.style.left = `${event.pageX - containerRect.left + 10}px`;
            tooltip.style.top = `${event.pageY - containerRect.top + 10}px`;
          })
          .on("mouseout", () => {
            d3.selectAll("path")
              .transition()
              .duration(200)
              .attr("opacity", 0.8);
            
            tooltip.style.display = "none";
          });
      });

      const labelAngle = startAngle + segmentAngle / 2;
      const labelRadius = outerRadius + radius * 0.1;
      const x = labelRadius * Math.cos(labelAngle - Math.PI / 2);
      const y = labelRadius * Math.sin(labelAngle - Math.PI / 2);
      
      svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(${(labelAngle * 180 / Math.PI) - 90}, ${x}, ${y})`)
        .style("font-size", `${radius * 0.025}px`)
        .text(sentiment);
    });
  }

  function handleResize() {
    containerWidth = chart.clientWidth;
    containerHeight = chart.clientHeight;
    createChart();
  }
  
  onMount(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chart);
    
    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="relative w-full h-full">
  <div bind:this={chart} class="w-full h-full"></div>
  
  <div
    bind:this={tooltip}
    class="absolute hidden bg-white shadow-lg rounded-lg border border-gray-200 z-10 max-w-xs"
    transition:fade
  ></div>
</div>

<style>
  :global(path) {
    transition: opacity 0.2s ease;
  }
  
  :global(text) {
    font-family: sans-serif;
    pointer-events: none;
  }
</style>
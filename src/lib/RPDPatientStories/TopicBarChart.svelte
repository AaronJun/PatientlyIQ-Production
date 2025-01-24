<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";
  
    export let data = [];
    export let width = 300;
    export let height = 200;
    export let title = "Top Topics";
  
    let chartContainer;
    const margin = { top: 0, right: 20, bottom: 20, left: 140 };
  
    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;
  
    $: sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 3);
  
    function createChart() {
      if (!chartContainer || !width || !height || !data.length) return;
  
      // Clear previous content
      d3.select(chartContainer).selectAll("*").remove();
  
      const svg = d3.select(chartContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
  
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

  
      // Scales
      const x = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => d.value) * 1.1]) // Add 10% padding
        .range([0, innerWidth]);
  
      const y = d3.scaleBand()
        .domain(sortedData.map(d => d.topic))
        .range([0, innerHeight])
        .padding(0.4); // Increased padding between bars
  
      // Add bars
      const bars = g.selectAll(".bar")
        .data(sortedData)
        .join("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", d => y(d.topic))
        .attr("height", y.bandwidth())
        .attr("fill", "#ff5151")
        .attr("rx", 4) // Rounded corners
        .attr("opacity", 0.85);
  
      // Animate bars
      bars.transition()
        .duration(750)
        .attr("width", d => x(d.value));
  
      // Add topic labels
      g.selectAll(".topic-label")
        .data(sortedData)
        .join("text")
        .attr("class", "topic-label")
        .attr("x", -12) // Move labels to the left of bars
        .attr("y", d => y(d.topic) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("font-size", "13px")
        .attr("font-family", "IBM Plex Mono")
        .attr("fill", "#4b5563")
        .text(d => d.topic);
  
      // Add value labels
      g.selectAll(".value-label")
        .data(sortedData)
        .join("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.value) + 8)
        .attr("y", d => y(d.topic) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("font-family", "IBM Plex Mono")
        .attr("text-anchor", "start")
        .attr("font-size", "12px")
        .attr("fill", "#6b7280")
        .text(d => d.value);

      // Add subtle grid lines
      g.selectAll(".grid-line")
        .data(x.ticks(5))
        .join("line")
        .attr("class", "grid-line")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#e5e7eb")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .style("opacity", 0.5);
  
      // Add hover effects
      bars.on("mouseenter", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("fill", "#ff3131");

        // Highlight corresponding labels
        g.selectAll(".topic-label, .value-label")
          .filter(label => label === d)
          .transition()
          .duration(200)
          .attr("fill", "#1f2937")
          .attr("font-weight", "600");
      }).on("mouseleave", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.85)
          .attr("fill", "#ff5151");

        // Reset label styles
        g.selectAll(".topic-label, .value-label")
          .filter(label => label === d)
          .transition()
          .duration(200)
          .attr("fill", d => d === d ? "#4b5563" : "#6b7280")
          .attr("font-weight", "normal");
      });
    }
  
    $: if (chartContainer && data && width && height) {
      createChart();
    }
</script>
  
<div 
  bind:this={chartContainer} 
  class="w-full h-full"
/>
  
<style>
  :global(.bar) {
    transition: all 0.2s ease;
  }
</style>
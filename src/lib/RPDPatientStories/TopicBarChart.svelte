<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    export let data = [];
    export let width = 300;
    export let height = 200;
    export let title = "Top Topics";
  
    let chartContainer;
    const margin = { top: 30, right: 20, bottom: 10, left: 120 };
  
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
  
      // Add title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .attr("fill", "#1f2937")
        .text(title);
  
      // Scales
      const x = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => d.value)])
        .range([0, innerWidth]);
  
      const y = d3.scaleBand()
        .domain(sortedData.map(d => d.topic))
        .range([0, innerHeight])
        .padding(0.3);
  
      // Add bars
      const bars = g.selectAll(".bar")
        .data(sortedData)
        .join("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.topic))
        .attr("height", y.bandwidth())
        .attr("fill", "#4f46e5")
        .attr("rx", 4)
        .attr("opacity", 0.8);
  
      // Animate bars
      bars.transition()
        .duration(750)
        .attr("width", d => x(d.value));
  
      // Add labels
      g.selectAll(".topic-label")
        .data(sortedData)
        .join("text")
        .attr("class", "topic-label")
        .attr("x", -10)
        .attr("y", d => y(d.topic) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("fill", "#4b5563")
        .text(d => d.topic);
  
      // Add value labels
      g.selectAll(".value-label")
        .data(sortedData)
        .join("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.value) + 5)
        .attr("y", d => y(d.topic) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("font-size", "12px")
        .attr("fill", "#6b7280")
        .text(d => d.value);
  
      // Add hover effects
      bars.on("mouseenter", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1);
      }).on("mouseleave", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8);
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
      transition: opacity 0.2s ease;
    }
  </style>
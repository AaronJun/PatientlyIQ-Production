<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data = [];
  export let width = 600;
  export let height = 400;
  export let margin = { top: 40, right: 40, bottom: 40, left: 40 };

  let chartContainer;

  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;

  $: xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, innerWidth]);

  $: yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([innerHeight, 0]);

  $: quadrantLabels = [
    { x: innerWidth * 0.325, y: innerHeight * 0.05, text: "Proactive" },
    { x: innerWidth * 0.325, y: innerHeight * 0.945, text:"Avoidant" },
    { x: innerWidth * 0.125, y: innerHeight * 0.45, text: "Anxious" },
    { x: innerWidth * 0.85, y: innerHeight * 0.45, text: "Resolute" }
  ];

  function createChart() {
    if (!chartContainer || !width || !height) return;

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

    // Add background quadrants with subtle colors
    const quadrants = [
      { x: 0, y: 0, width: innerWidth / 2, height: innerHeight / 2, color: "#f7f8fa" },
      { x: innerWidth / 2, y: 0, width: innerWidth / 2, height: innerHeight / 2, color: "#f7f8fa" },
      { x: 0, y: innerHeight / 2, width: innerWidth / 2, height: innerHeight / 2, color: "#f7f8fa" },
      { x: innerWidth / 2, y: innerHeight / 2, width: innerWidth / 2, height: innerHeight / 2, color: "#f7f8fa" }
    ];

    g.selectAll(".quadrant-bg")
      .data(quadrants)
      .join("rect")
      .attr("class", "quadrant-bg")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("fill", d => d.color)
      .attr("opacity", 0.3);

    // Draw quadrant lines
    g.append("line")
      .attr("x1", innerWidth / 2)
      .attr("y1", 0)
      .attr("x2", innerWidth / 2)
      .attr("y2", innerHeight)
      .attr("stroke", "#94a3b8")
      .attr("stroke-dasharray", "4,4");

    g.append("line")
      .attr("x1", 0)
      .attr("y1", innerHeight / 2)
      .attr("x2", innerWidth)
      .attr("y2", innerHeight / 2)
      .attr("stroke", "#94a3b8")
      .attr("stroke-dasharray", "4,4");

    // Add quadrant labels
    g.selectAll(".quadrant-label")
      .data(quadrantLabels)
      .join("text")
      .attr("class", "quadrant-label")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .each(function(d) {
        const lines = d.text.split('\n');
        d3.select(this).selectAll('tspan')
          .data(lines)
          .join('tspan')
          .attr('x', d.x)
          .attr('dy', (_, i) => i === 0 ? 0 : '1.2em')
          .text(line => line);
      });

    // Add axis labels without values
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", "14px")
      .attr("font-weight", "500")
      .text("Emotional State");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", "14px")
      .attr("font-weight", "500")
      .text("Motivation Level");

    // Create tooltip
    const tooltip = d3.select(chartContainer)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");

    // Plot data points
    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 6)
      .attr("fill", "#4f46e5")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(`
            <strong>${d.label}</strong><br/>
            Engagement: ${d.x}%<br/>
            Risk: ${d.y}%
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
        
        d3.select(event.currentTarget)
          .attr("r", 8)
          .attr("opacity", 1);
      })
      .on("mouseout", (event) => {
        tooltip.style("visibility", "hidden");
        d3.select(event.currentTarget)
          .attr("r", 6)
          .attr("opacity", 0.8);
      });
  }

  $: if (chartContainer && data && width && height) {
    createChart();
  }
</script>

<div 
  bind:this={chartContainer} 
  class="relative w-full h-full"
/>

<style>
  :global(.quadrant-label) {
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>
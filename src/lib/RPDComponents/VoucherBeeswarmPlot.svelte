<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let data;
  let svg;
  
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;
  
  onMount(() => {
    const purchasedVouchers = data.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]);
    const prices = purchasedVouchers.map(d => parseFloat(d["Sale  Price (USD, Millions)"]));
    
    const x = d3.scaleLinear()
      .domain([0, d3.max(prices)])
      .range([0, width]);
  
    const simulation = d3.forceSimulation(purchasedVouchers)
      .force("x", d3.forceX(d => x(parseFloat(d["Sale  Price (USD, Millions)"]))).strength(1))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(5))
      .stop();
  
    for (let i = 0; i < 120; ++i) simulation.tick();
  
    const g = d3.select(svg)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  
    const minPrice = d3.min(prices);
    const maxPrice = d3.max(prices);
  
    g.selectAll("circle")
      .data(purchasedVouchers)
      .enter()
      .append("circle")
      .attr("cx", width / 2)  // Start from the middle of the chart
      .attr("cy", height / 2) // Start from the middle of the chart
      .attr("r", 0)           // Start with radius 0
      .attr("stroke", "#161616")
      .attr("stroke-width", 2)
      .attr("fill", d => {
        const price = parseFloat(d["Sale  Price (USD, Millions)"]);
        if (price === minPrice) return "#FFCC33";
        if (price === maxPrice) return "#00B8A6";
        return "#ACA3DB";
      })
      .append("title")
      .text(d => `${d.Sponsor}: $${d["Sale  Price (USD, Millions)"]} million`);
  
    // Animate the circles
    g.selectAll("circle")
      .transition()
      .duration(1000)  // Animation duration in milliseconds
      .delay((d, i) => i * 10)  // Stagger the animation for each circle
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 7.5)
      .ease(d3.easeElasticOut);  // Add a bouncy effect to the animation
  });
  </script>
  
  <svg bind:this={svg} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}></svg>
  
  <style>
  svg {
    max-width: 100%;
    height: auto;
  }
  </style>
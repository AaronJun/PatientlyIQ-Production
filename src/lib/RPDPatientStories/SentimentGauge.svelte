<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    export let value = 0; // 0 to 100
    export let width = 200;
    export let height = 120;
    export let label = "Sentiment";
  
    let gaugeContainer;
    
    $: innerRadius = Math.min(width, height * 2) * 0.4;
    $: outerRadius = innerRadius * 1.1;
  
    function createGauge() {
      if (!gaugeContainer) return;
  
      // Clear previous content
      d3.select(gaugeContainer).selectAll("*").remove();
  
      // Create the gauge
      const svg = d3.select(gaugeContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
  
      const g = svg.append("g")
        .attr("transform", `translate(${width/2},${height})`);
  
      // Create a scale for the gauge
      const scale = d3.scaleLinear()
        .domain([0, 100])
        .range([-90, 90]);
  
      // Create arc generator
      const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);
  
      // Background arc
      g.append("path")
        .datum({
          startAngle: -Math.PI/2,
          endAngle: Math.PI/2
        })
        .attr("class", "gauge-background")
        .attr("fill", "#e2e8f0")
        .attr("d", arc);
  
      // Foreground arc (value)
      const foregroundArc = g.append("path")
        .datum({
          startAngle: -Math.PI/2,
          endAngle: -Math.PI/2
        })
        .attr("class", "gauge-foreground")
        .attr("fill", d3.interpolateRdYlGn(value/100))
        .attr("d", arc);
  
      // Animate the foreground arc
      foregroundArc.transition()
        .duration(750)
        .attrTween("d", function(d) {
          const interpolate = d3.interpolate(
            d.endAngle,
            (-Math.PI/2) + (Math.PI * (value/100))
          );
          return function(t) {
            d.endAngle = interpolate(t);
            return arc(d);
          };
        });
  
      // Add value text
      g.append("text")
        .attr("class", "gauge-value")
        .attr("transform", "translate(0,-20)")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", "#1a2238")
        .text('Sentiment Level');
  
      // Add label text
      g.append("text")
        .attr("class", "gauge-label")
        .attr("transform", "translate(0,15)")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#64748b")
        .text(label);
  
      // Add tick marks
      const ticks = scale.ticks(5);
      const tickArc = d3.arc()
        .innerRadius(outerRadius + 5)
        .outerRadius(outerRadius + 10)
        .startAngle(d => (d/100 * Math.PI) - Math.PI/2)
        .endAngle(d => (d/100 * Math.PI) - Math.PI/2);
  
      g.selectAll(".tick")
        .data(ticks)
        .join("path")
        .attr("class", "tick")
        .attr("fill", "#94a3b8")
        .attr("d", tickArc);
    }
  
    $: if (gaugeContainer && typeof value === 'number') {
      createGauge();
    }
  </script>
  
  <div 
    bind:this={gaugeContainer}
    class="w-full h-full"
  />
  
  <style>
    :global(.gauge-background) {
      opacity: 0.2;
    }
  </style>
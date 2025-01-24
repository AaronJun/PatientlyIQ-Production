<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let value = 0; // 0 to 100
  export let width = 120;
  export let height = 120;
  export let label = "Sentiment";

  let gaugeContainer;
  
  $: innerRadius = Math.min(width, height) * 0.35;
  $: outerRadius = innerRadius * 1.1;

  function createGauge() {
    if (!gaugeContainer) return;

    d3.select(gaugeContainer).selectAll("*").remove();

    const svg = d3.select(gaugeContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    const scale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 360]);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(d => d.startAngle * Math.PI / 180)
      .endAngle(d => d.endAngle * Math.PI / 180);

    // Background arc
    g.append("path")
      .datum({
        startAngle: 0,
        endAngle: 360
      })
      .attr("class", "gauge-background")
      .attr("fill", "#e2e8f0")
      .attr("d", arc);

    // Foreground arc (value)
    const foregroundArc = g.append("path")
      .datum({
        startAngle: 0,
        endAngle: 0
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
          scale(value)
        );
        return function(t) {
          d.endAngle = interpolate(t);
          return arc(d);
        };
      });

    // Value text
    g.append("text")
      .attr("class", "gauge-value")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#1a2238")
      .text(Math.round(value));

    // Label text
    g.append("text")
      .attr("class", "gauge-label")
      .attr("transform", "translate(0,15)")
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("fill", "#64748b")
      .text(label);

    // Add tick marks
    const tickData = d3.range(0, 360, 36);
    const tickArc = d3.arc()
      .innerRadius(outerRadius + 2)
      .outerRadius(outerRadius + 7)
      .startAngle(d => d * Math.PI / 180)
      .endAngle(d => d * Math.PI / 180);

    g.selectAll(".tick")
      .data(tickData)
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
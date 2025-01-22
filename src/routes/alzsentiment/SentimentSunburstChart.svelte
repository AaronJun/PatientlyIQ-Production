<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data: any[];
  
  let svg: SVGElement;
  const width = 600;
  const height = 600;
  const radius = Math.min(width, height) / 2;

  function processSentimentData(data) {
    // Group by SEN (sentiment)
    const root = {
      name: "root",
      children: Object.entries(
        d3.group(data, d => d.SEN)
      ).map(([sen, senData]) => ({
        name: sen,
        children: Object.entries(
          d3.group(senData, d => d.ST1)
        ).map(([st1, st1Data]) => ({
          name: st1,
          st1r: d3.mean(st1Data, d => +d.ST1R),
          children: Object.entries(
            d3.group(st1Data, d => d.ST2)
          ).map(([st2, st2Data]) => ({
            name: st2,
            value: d3.mean(st2Data, d => +d.ST2R)
          }))
        }))
      }))
    };
    return d3.hierarchy(root)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
  }

  onMount(() => {
    if (!data) return;

    const root = processSentimentData(data);
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Clear existing content
    d3.select(svg).selectAll("*").remove();
    
    const svgEl = d3.select(svg)
      .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
      .style("font", "10px sans-serif");

    const partition = d3.partition()
      .size([2 * Math.PI, radius]);

    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(0.002)
      .padRadius(radius / 2)
      .innerRadius(d => Math.sqrt(d.y0))
      .outerRadius(d => Math.sqrt(d.y1));

    const root_partitioned = partition(root);
    
    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
      .style("pointer-events", "none");

    // Add paths
    svgEl.selectAll("path")
      .data(root_partitioned.descendants())
      .join("path")
      .attr("fill", d => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", d => 
        d.children ? 0.6 : 0.4)
      .attr("d", arc)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .attr("fill-opacity", 1);
          
        tooltip
          .style("opacity", 1)
          .html(`
            <div class="text-sm">
              <strong>${d.data.name}</strong><br/>
              Value: ${d.value ? d.value.toFixed(1) + '%' : 'N/A'}
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .attr("fill-opacity", d => 
            d.children ? 0.6 : 0.4);
            
        tooltip.style("opacity", 0);
      });

    // Add labels for larger segments
    svgEl.selectAll("text")
      .data(root_partitioned.descendants().filter(d => d.x1 - d.x0 > 0.2))
      .join("text")
      .attr("transform", d => {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = Math.sqrt(d.y0 + d.y1) / 2;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      })
      .attr("dy", "0.35em")
      .attr("font-size", "8px")
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .text(d => d.data.name.split(' ')[0]);

    return () => {
      tooltip.remove();
    };
  });
</script>

<div class="chart-container">
  <svg bind:this={svg} width={width} height={height}></svg>
</div>

<style>
  .chart-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  svg {
    max-width: 100%;
    height: auto;
  }
</style>
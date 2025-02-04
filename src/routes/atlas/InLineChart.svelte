<!-- InlineChart.svelte -->
<script>
    import { onMount } from 'svelte';
    // @ts-ignore
    import * as d3 from 'd3';
  
    // @ts-ignore
    export let data = [];
  
    onMount(() => {
      // @ts-ignore
      const svg = d3.select(svgRef);
      const width = 100;
      const height = 20;
      const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([0, width]);
      // @ts-ignore
      const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([height, 0]);
  
      svg.selectAll('*').remove();
  
      svg.append('path')
        // @ts-ignore
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
          // @ts-ignore
          .x((d, i) => xScale(i))
          // @ts-ignore
          .y(d => yScale(d))
        );
    });
  
    // @ts-ignore
    let svgRef;
  </script>
  
  <svg bind:this={svgRef} width="100" height="20"></svg>
  
  <style>
    svg {
      display: block;
    }
  </style>
  
<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data: Array<{ Year: string, RPD: string }>;
  export let width: number;
  export let height: number;
  export let currentYear: string;

  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  $: yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.RPD) || 0])
    .range([height - 30, 30]);

  $: xScale = d3.scaleBand()
    .domain(data.map(d => d.Year))
    .range([30, width - 30])
    .padding(0.1);

  onMount(() => {
    svg = d3.select('#rpd-value-display')
      .attr('width', width)
      .attr('height', height);

    updateDisplay();
  });

  $: if (svg) updateDisplay();

  function updateDisplay() {
    const bars = svg.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.Year) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(+d.RPD))
      .attr('height', d => height - 30 - yScale(+d.RPD))
      .attr('fill', d => d.Year === currentYear ? '#43887F' : '#292F58')
      .attr('opacity', d => d.Year === currentYear ? 1 : 0.7);

    svg.selectAll('.bar-label')
      .data(data)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', d => (xScale(d.Year) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(+d.RPD) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.RPD)
      .attr('fill', '#333')
      .attr('font-size', '10px');

    svg.selectAll('.year-label')
      .data(data)
      .join('text')
      .attr('class', 'year-label')
      .attr('x', d => (xScale(d.Year) || 0) + xScale.bandwidth() / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text(d => d.Year)
      .attr('fill', '#333')
      .attr('font-size', '10px');
  }
</script>

<svg id="rpd-value-display"></svg>

<style>
  svg {
    display: block;
  }
</style>
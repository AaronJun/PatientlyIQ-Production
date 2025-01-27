<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let data = [];
  export let width = 250;
  export let height = 250;

  let chart;
  let svg;
  
  $: margin = {
    top: 0,
    right: 10,
    bottom: 20,
    left: 10
  };

  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;

  onMount(() => {
    drawChart();
  });

  $: if (chart && data) {
    updateChart();
  }

  function drawChart() {
    // Create SVG
    svg = d3.select(chart)
    .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Add axes
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(-innerHeight)
      )
      .style('font-size', '0px');

    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickSize(-innerWidth)
      )
      .style('font-size', '0px');
 // Add grid lines
 function makeGridLines(scale, ticks) {
      return d3.axisBottom(scale)
        .ticks(ticks);
    }

    // Add X gridlines
    svg.append('g')
      .attr('class', 'grid-lines')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(makeGridLines(xScale, 25)
        .tickSize(-innerHeight)
        .tickFormat('')
      );

    // Add Y gridlines
    svg.append('g')
      .attr('class', 'grid-lines')
      .call(makeGridLines(yScale, 20)
        .tickSize(-innerWidth)
        .tickFormat('')
      );

    // Add axes on top of grid lines
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
      )
      .style('font-size', '0px');
    // Add quadrant lines (slightly thicker than grid lines)
    svg.append('line')
      .attr('class', 'quadrant-line')
      .attr('x1', xScale(50))
      .attr('y1', 0)
      .attr('x2', xScale(50))
      .attr('y2', innerHeight)
      .style('stroke', '#FF8080')
      .style('stroke-width', .725);

    svg.append('line')
      .attr('class', 'quadrant-line')
      .attr('x1', 0)
      .attr('y1', yScale(50))
      .attr('x2', innerWidth)
      .attr('y2', yScale(50))
      .style('stroke', '#FF8080')
      .style('stroke-width', 1);

    // Add quadrant labels
    const labelOffset = 10;
    const fontSize = width < 400 ? '9.25px' : '12px';

    svg.append('text')
      .attr('class', 'quadrant-label')
      .attr('x', xScale(60.25))
      .attr('y', yScale(2.5))
      .attr('text-anchor', 'middle')
      .style('font-size', fontSize)
      .style('font-weight', 800)
      .style('fill', '#7C7C7C')
      .style('font-family', 'IBM Plex Mono')
      .text('Avoidant');

    svg.append('text')
      .attr('class', 'quadrant-label')
      .attr('x', xScale(9.25))
      .attr('y', yScale(42.25))
      .attr('text-anchor', 'middle')
      .style('font-size', fontSize)
      .style('font-weight', 800)
      .style('fill', '#7C7C7C')
      .style('font-family', 'IBM Plex Mono')
      .text('Proactive');

    svg.append('text')
      .attr('class', 'quadrant-label')
      .attr('x', xScale(90))
      .attr('y', yScale(42.25))
      .attr('text-anchor', 'middle')
      .style('font-size', fontSize)
      .style('font-weight', 800)
      .style('fill', '#7C7C7C')
      .style('font-family', 'IBM Plex Mono')
      .text('Motivated');

    svg.append('text')
      .attr('class', 'quadrant-label')
      .attr('x', xScale(60.25))
      .attr('y', yScale(92.5))
      .attr('text-anchor', 'middle')
      .style('font-size', fontSize)
      .style('font-weight', 800)
      .style('fill', '#7C7C7C')
      .style('font-family', 'IBM Plex Mono')
      .text('Anxious');
  }

  function updateChart() {
    if (!svg) return;

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Update or create points
    const points = svg.selectAll('.data-point')
      .data(data);

    points.enter()
      .append('circle')
      .attr('class', 'data-point')
      .merge(points)
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 8)
      .style('fill', '#ff1515')
      .style('opacity', 1);

    points.exit().remove();
  }
</script>

<div bind:this={chart} class="quadrant-chart"></div>

<style>
  .quadrant-chart :global(.tick line) {
    stroke: #e5e7eb;
    stroke-opacity: 0.5;
  }
  
  .quadrant-chart :global(.domain) {
    stroke: #e5e7eb;
  }
  
  .quadrant-chart :global(.tick text) {
    fill: #6b7280;
  }
</style>
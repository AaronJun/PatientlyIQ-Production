<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let value = 0;
  export let label = '';
  export let size = 120;

  let scale;
  
  const sentimentRanges = [
    { min: 0, max: 10, label: "Entirely Negative" },
    { min: 11, max: 31, label: "Mostly Negative" },
    { min: 32, max: 43, label: "Somewhat Negative" },
    { min: 44, max: 60, label: "Neutral" },
    { min: 61, max: 71, label: "Somewhat Positive" },
    { min: 72, max: 85, label: "Mostly Positive" },
    { min: 86, max: 100, label: "Entirely Positive" }
  ];

  $: currentSentiment = sentimentRanges.find(range => 
    value >= range.min && value <= range.max
  ) || sentimentRanges[0];

  $: boxWidth = size / 5;
  $: boxHeight = boxWidth;
  $: totalWidth = boxWidth * 10;
  $: activeIndex = sentimentRanges.indexOf(currentSentiment);
  
  onMount(() => {
    drawScale();
  });

  $: if (scale && value !== undefined) {
    updateScale();
  }

  function getBoxColor(index: number) {
    // Create a color scale from red to yellow to green
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 3, 6])
      .range(['#ef4444', '#eab308', '#22c55e'])
      .interpolate(d3.interpolateRgb.gamma(2.2));
    
    return colorScale(index);
  }

  function drawScale() {
    const svg = d3.select(scale)
      .append('svg')
      .attr('width', totalWidth)
      .attr('height', boxHeight * 2.5)  // Extra space for label
      .append('g')
      .attr('transform', `translate(0,0)`);

    // Add squares
    svg.selectAll('rect')
      .data(sentimentRanges)
      .enter()
      .append('rect')
      .attr('class', 'sentiment-box')
      .attr('x', (d, i) => i * boxWidth)
      .attr('y', 0)
      .attr('width', boxWidth - 2)  // -2 for gap
      .attr('height', boxHeight)
      .attr('rx', 2)  // Rounded corners
      .style('fill', (d, i) => getBoxColor(i))
      .style('opacity', 0.3);

    // Add active box highlight
    svg.append('rect')
      .attr('class', 'active-box')
      .attr('width', boxWidth - 2)
      .attr('height', boxHeight)
      .attr('rx', 2)
      .style('fill', getBoxColor(activeIndex));

    // Add sentiment label with left alignment
    svg.append('text')
      .attr('class', 'sentiment-label')
      .attr('text-anchor', 'start')  // Changed to start for left alignment
      .attr('x', 0)  // Set x to 0 for left alignment
      .attr('y', boxHeight * 1.725)
      .style('font-size', `${boxWidth * 0.45}px`)
      .style('fill', '#1f2937')
      .style('font-family', 'IBM Plex Mono')
      .style('font-weight', '600');
  }

  function updateScale() {
    // Update active box position and color
    d3.select(scale)
      .select('.active-box')
      .transition()
      .duration(300)
      .attr('x', activeIndex * boxWidth)
      .style('fill', getBoxColor(activeIndex));

    // Update label
    d3.select(scale)
      .select('.sentiment-label')
      .text(currentSentiment.label);
  }
</script>

<div bind:this={scale} class="flex items-start">
</div>

<style>
  /* Add any additional styles here if needed */
</style>
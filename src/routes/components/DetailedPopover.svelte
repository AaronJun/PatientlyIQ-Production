<script lang="ts">
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';

  export let title: string;
  export let data: {
    sentiment: string;
    driver: string;
    value: number;
  };
  export let color: string;
  export let onClose: () => void;

  interface ChartData {
    function: string;
    value: number;
  }

  let chartContainer: HTMLDivElement;
  let popover: HTMLDivElement;
  let isActive = false; // Add this line to define isActive

  $: backgroundColor = color;
  $: textColor = getContrastColor(color);

  
  function getContrastColor(hexColor: string) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  function handleClickOutside(event: MouseEvent) {
    if (popover && !popover.contains(event.target as Node)) {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = chartContainer.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(chartContainer)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .range([height, 0]);

    const chartData: ChartData[] = [
      { function: data.driver, value: data.value }
    ];

    x.domain(chartData.map(d => d.function));
    y.domain([0, d3.max(chartData, d => d.value) || 0]);

    svg.selectAll('.bar')
      .data(chartData)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.function) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))
      .attr('fill', color);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .call(d3.axisLeft(y));

    // Add labels
    svg.selectAll('.label')
      .data(chartData)
      .enter().append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.function) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.value)
      .attr('fill', textColor);
  });

  onDestroy(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  });
</script>

<div class="popover" class:active={isActive} bind:this={popover} style="background-color: {backgroundColor}; color: {textColor};">
  <div class="popover-header">
    <h2>{title}</h2>
    <button class="close-btn" on:click={onClose} style="color: {textColor};">CLOSE</button>
  </div>
  <div class="popover-content">
    <div class="chart-container" bind:this={chartContainer}></div>
  </div>
</div>

<style>
  .popover {
    position: fixed;
    top: 0;
    right: 0;
    width: 100%;
    max-width: 65vw;
    height: 100%;
    overflow-y: auto;
    padding: 1rem;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    z-index: 9999;
  }

  .popover.active {
    transform: translateX(0);
  }

  .popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1em;
    cursor: pointer;
  }

  .chart-container {
    height: 300px;
  }

  :global(.bar) {
    transition: fill 0.3s ease;
  }

  :global(.bar:hover) {
    fill: #ffd700;
  }

  :global(.label) {
    font-size: 12px;
    font-weight: bold;
  }
</style>
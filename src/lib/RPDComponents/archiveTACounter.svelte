<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import * as d3 from 'd3';
    import { fly } from 'svelte/transition';
  
    export let data: any[];
    export let currentYear: string;
    export let barHeight = 20;
  
    let container: HTMLDivElement;
    let chart: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  
    const therapeuticAreas = [
      'Neurology', 'Hematology', 'Immunology', 'Metabolic', 'Oncology',
      'Pulmonology', 'Ophthalmology', 'Dermatology', 'Orthopaedics', 'Hepatology', 
      'Nephrology', 'Genetic', 'Endocrinology', 'Gastroenterology'
    ];
  
    const margin = { top: 40, right: 20, bottom: 20, left: 20 };
    const width = 400 - margin.left - margin.right;
    
    $: height = therapeuticAreas.length * (barHeight + 25);
  
    $: processedData = processData(data, currentYear);
  
    $: maxSum = d3.max(therapeuticAreas, area => 
      data.filter(d => +d.Year <= +currentYear && d.TherapeuticArea.trim() === area).length
    ) || 0;
  
    $: visible = +currentYear >= 2014;
  
    function processData(data: any[], year: string) {
      return therapeuticAreas.map(area => {
        const sum = data.filter(d => +d.Year <= +year && d.TherapeuticArea.trim() === area).length;
        return { area, sum };
      }).sort((a, b) => b.sum - a.sum);
    }
  
    onMount(() => {
      if (visible) {
        initChart();
      }
    });
  
    afterUpdate(() => {
      if (visible) {
        if (!chart) {
          initChart();
        } else {
          updateChart();
        }
      }
    });
  
    function initChart() {
      if (!container) return;
      
      chart = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
      updateChart();
    }
  
    function updateChart() {
      if (!chart) return;
  
      const x = d3.scaleLinear()
        .domain([0, maxSum])
        .range([0, width]);
  
      const y = d3.scaleBand()
        .range([0, height])
        .domain(processedData.map(d => d.area))
        .padding(0.4);
  
      const t = chart.transition().duration(750);
  
      // Update bars
      chart.selectAll('.bar')
        .data(processedData, d => d.area)
        .join(
          enter => enter.append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => (y(d.area) || 0))
            .attr('height', y.bandwidth() - 20)
            .attr('width', 0),
          update => update,
          exit => exit.remove()
        )
        .transition(t)
        .attr('x', 0)
        .attr('y', d => (y(d.area) || 0) + 20)
        .attr('height', y.bandwidth() - 20)
        .attr('width', d => x(d.sum))
        .attr('fill', (d, i) => d3.schemeCategory10[i % 10]);
  
      // Update area labels
      chart.selectAll('.area-label')
        .data(processedData, d => d.area)
        .join(
          enter => enter.append('text')
            .attr('class', 'area-label')
            .attr('x', 0)
            .attr('y', d => (y(d.area) || 0) + 10)
            .attr('dy', '0')
            .attr('text-anchor', 'start')
            .attr('opacity', 0),
          update => update,
          exit => exit.remove()
        )
        .transition(t)
        .attr('x', 0)
        .attr('y', d => (y(d.area) || 0) + 10)
        .attr('opacity', 1)
        .text(d => d.area);
  
      // Update count labels
      chart.selectAll('.count-label')
        .data(processedData, d => d.area)
        .join(
          enter => enter.append('text')
            .attr('class', 'count-label')
            .attr('x', d => x(d.sum) + 5)
            .attr('y', d => (y(d.area) || 0) + y.bandwidth() / 2 + 10)
            .attr('dy', '0.25em')
            .attr('opacity', 0),
          update => update,
          exit => exit.remove()
        )
        .transition(t)
        .attr('x', d => x(d.sum) + 5)
        .attr('y', d => (y(d.area) || 0) + y.bandwidth() / 2 + 10)
        .attr('opacity', 1)
        .text(d => d.sum);
    }
  </script>
  
  {#if visible}
    <div class="chart-container" bind:this={container} transition:fly={{ x: 200, duration: 800 }}>
      <h2 class="text-m font-bold mb-4">Awarded Vouchers by Therapeutic Area</h2>
    </div>
  {/if}
  
  <style>
    .chart-container {
      background-color: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 8px;
    }
  
    h2 {
      font-size: .75rem;
      font-weight: 800;
      text-transform: uppercase;
      cursor: pointer;
    }
  
    :global(.bar) {
      transition: fill 0.3s;
    }
  
    :global(.bar:hover) {
      fill: #ff7f0e;
    }
  
    :global(.area-label) {
      font-size: 12px;
      fill: #333;
      font-weight: 600;
    }
  
    :global(.count-label) {
      font-size: .85rem;
      fill: #333;
      font-weight: 600;
    }
  </style>
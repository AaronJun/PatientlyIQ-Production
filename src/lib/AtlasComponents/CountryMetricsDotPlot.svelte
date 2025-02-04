<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    export let allData: any[];
    export let selectedCountry: any;
    export let metrics: string[];
  
    let svg: SVGSVGElement;
    let width = 600;
    let height = 400;
    let margin = { top: 40, right: 60, bottom: 40, left: 150 };
  
    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;
  
    $: yScale = d3.scaleBand()
      .domain(metrics)
      .range([0, innerHeight])
      .padding(0.1);
  
    function getThresholds(metric: string) {
      const values = allData.map(d => d[metric]).filter(v => typeof v === 'number');
      const sortedValues = values.sort((a, b) => a - b);
      return {
        low: d3.quantile(sortedValues, 0.33),
        high: d3.quantile(sortedValues, 0.67)
      };
    }
  
    function getCategory(value: number, low: number, high: number) {
      if (value < low) return 'Low';
      if (value > high) return 'High';
      return 'Average';
    }
  
    onMount(() => {
      const svgElement = d3.select(svg);
      svgElement.selectAll('*').remove();
  
      const g = svgElement.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
      metrics.forEach((metric, index) => {
        const { low, high } = getThresholds(metric);
        const xScale = d3.scaleLinear()
          .domain([Math.min(low, selectedCountry[metric]), Math.max(high, selectedCountry[metric])])
          .range([0, innerWidth]);
  
        // Draw the line
        g.append('line')
          .attr('x1', 0)
          .attr('x2', innerWidth)
          .attr('y1', yScale(metric))
          .attr('y2', yScale(metric))
          .attr('stroke', '#ccc')
          .attr('stroke-width', 2);
  
        // Draw threshold markers
        ['Low', 'Average', 'High'].forEach((category, i) => {
          const x = i === 0 ? xScale(low) : i === 2 ? xScale(high) : (xScale(low) + xScale(high)) / 2;
          g.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', yScale(metric) - 5)
            .attr('y2', yScale(metric) + 5)
            .attr('stroke', '#999')
            .attr('stroke-width', 1);
          
          g.append('text')
            .attr('x', x)
            .attr('y', yScale(metric) - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .text(category);
        });
  
        // Draw the dot for the selected country
        const category = getCategory(selectedCountry[metric], low, high);
        g.append('circle')
          .attr('cx', xScale(selectedCountry[metric]))
          .attr('cy', yScale(metric))
          .attr('r', 6)
          .attr('fill', category === 'Low' ? '#ff9999' : category === 'High' ? '#99ff99' : '#ffff99')
          .attr('stroke', '#000')
          .attr('stroke-width', 1);
  
        // Add metric labels
        g.append('text')
          .attr('x', -10)
          .attr('y', yScale(metric))
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .text(metric);
  
        // Add value labels
        g.append('text')
          .attr('x', innerWidth + 10)
          .attr('y', yScale(metric))
          .attr('dominant-baseline', 'middle')
          .text(selectedCountry[metric].toFixed(2));
      });
  
      // Add title
      svgElement.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '16px')
        .attr('font-weight', 'bold')
        .text(`Metrics for ${selectedCountry.name}`);
    });
  </script>
  
  <div class="country-metrics-dot-plot">
    <svg bind:this={svg} {width} {height}></svg>
  </div>
  
  <style>
    .country-metrics-dot-plot {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
  </style>
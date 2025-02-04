<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    export let allData: any[];
    export let selectedMetric: string;
    export let hoveredData: any | null;
  
    let svg: SVGSVGElement;
    let width = 600;
    let height = 100;
    let margin = { top: 20, right: 20, bottom: 20, left: 20 };
  
    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;
  
    $: metricValues = allData.map(d => d[selectedMetric]).filter(v => typeof v === 'number');
    $: sortedValues = metricValues.sort((a, b) => a - b);
    
    $: lowThreshold = d3.quantile(sortedValues, 0.33);
    $: highThreshold = d3.quantile(sortedValues, 0.67);
  
    $: categories = allData.map(d => {
      const value = d[selectedMetric];
      if (value < lowThreshold) return 'Low';
      if (value > highThreshold) return 'High';
      return 'Average';
    });
  
    $: xScale = d3.scalePoint()
      .domain(['Low', 'Average', 'High'])
      .range([0, innerWidth]);
  
    function getColor(category: string) {
      switch (category) {
        case 'Low': return '#ff9999';
        case 'Average': return '#ffff99';
        case 'High': return '#99ff99';
        default: return '#cccccc';
      }
    }
  
    onMount(() => {
      const svgElement = d3.select(svg);
      
      svgElement.selectAll('*').remove();
  
      const g = svgElement.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
      // Draw the line
      g.append('line')
        .attr('x1', xScale('Low'))
        .attr('x2', xScale('High'))
        .attr('y1', innerHeight / 2)
        .attr('y2', innerHeight / 2)
        .attr('stroke', '#000')
        .attr('stroke-width', 2);
  
      // Draw category labels
      g.selectAll('.category-label')
        .data(['Low', 'Average', 'High'])
        .enter()
        .append('text')
        .attr('class', 'category-label')
        .attr('x', d => xScale(d))
        .attr('y', innerHeight + 15)
        .attr('text-anchor', 'middle')
        .text(d => d);
  
      // Draw dots for all countries
      g.selectAll('.country-dot')
        .data(allData)
        .enter()
        .append('circle')
        .attr('class', 'country-dot')
        .attr('cx', d => xScale(categories[allData.indexOf(d)]))
        .attr('cy', innerHeight / 2)
        .attr('r', 5)
        .attr('fill', d => getColor(categories[allData.indexOf(d)]))
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .attr('opacity', 0.7);
  
      // Highlight hovered country
      if (hoveredData) {
        g.append('circle')
          .attr('class', 'hovered-dot')
          .attr('cx', xScale(categories[allData.indexOf(hoveredData)]))
          .attr('cy', innerHeight / 2)
          .attr('r', 8)
          .attr('fill', 'none')
          .attr('stroke', '#000')
          .attr('stroke-width', 2);
      }
    });
  </script>
  
  <div class="category-dot-plot">
    <svg bind:this={svg} {width} {height}></svg>
  </div>
  
  <style>
    .category-dot-plot {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
  </style>
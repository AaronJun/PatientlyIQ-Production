<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    type Data = { name: string; value: number };
  
    let data: Data[] = [
      { name: 'A', value: 30 },
      { name: 'B', value: 80 },
      { name: 'C', value: 45 },
      { name: 'D', value: 60 },
      { name: 'E', value: 20 },
      { name: 'F', value: 90 },
      { name: 'G', value: 55 },
    ];
  
    onMount(() => {
      const width = 500;
      const height = 500;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      const innerRadius = 90;
      const outerRadius = Math.min(width, height) / 2 - 6;
  
      const x = d3
        .scaleBand()
        .domain(data.map(d => d.name))
        .range([0, 2 * Math.PI])
        .align(0);
  
      const y = d3
        .scaleRadial()
        .domain([0, d3.max(data, d => d.value) ?? 0])
        .range([innerRadius, outerRadius]);
  
      const arc = d3
        .arc<Data>()
        .innerRadius(innerRadius)
        .outerRadius(d => y(d.value)!)
        .startAngle(d => x(d.name)!)
        .endAngle(d => x(d.name)! + x.bandwidth())
        .padAngle(0.01)
        .padRadius(innerRadius);
  
      const svg = d3
        .select('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);
  
      svg
        .append('g')
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .attr('fill', 'steelblue')
        .attr('d', arc as any);
  
      svg
        .append('g')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr(
          'text-anchor',
          d =>
            (x(d.name)! + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
              ? 'end'
              : 'start'
        )
        .attr(
          'transform',
          d =>
            `rotate(${((x(d.name)! + x.bandwidth() / 2) * 180) / Math.PI - 90})translate(${outerRadius + 10},0)`
        )
        .append('text')
        .attr('transform', d =>
          (x(d.name)! + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI
            ? 'rotate(180)translate(-16)'
            : null
        )
        .text(d => d.name);
    });
  </script>
  
  <style>
    svg {
      display: block;
      margin: auto;
    }
  </style>
  
  <svg></svg>
  
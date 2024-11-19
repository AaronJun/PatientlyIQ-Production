<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
  
    export let data;
    let svg;
  
    const dispatch = createEventDispatcher();
  
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const width = 1500 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
  
    const radius = 6.5;
    const spacing = 2.5; // Adjusted spacing between circles
  
    onMount(() => {
      createCirclesChart();
    });
  
    function createCirclesChart() {
      const g = d3.select(svg)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
      const color = d3.scaleOrdinal(d3.schemeCategory10);
  
      const circlesPerRow = 25;
      const totalCircles = data.reduce((sum, d) => sum + d.count, 0);
      const rows = Math.ceil(totalCircles / circlesPerRow);
      const chartHeight = rows * (2 * radius + spacing);
  
      let animationComplete = 0;
  
      const circles = g.selectAll('circle')
        .data(data.flatMap(d => Array(d.count).fill(d)))
        .enter()
        .append('circle')
        .attr('cx', (d, i) => (i % circlesPerRow) * (2 * radius + spacing))
        .attr('cy', -50) // Start above the chart
        .attr('r', radius)
        .attr('fill', 'grey')
        .attr('stroke', '#161616')
        .attr('stroke-width', 1);
  
      circles.append('title')
        .text(d => `${d.area}: ${d.count}`);
  
      // Animate the circles
      circles.each(function(d, i) {
        const circle = d3.select(this);
        const delay = Math.random() * 2000; // Random delay between 0 and 2 seconds
        const duration = 1000 + Math.random() * 1000; // Random duration between 1 and 2 seconds
  
        circle.transition()
          .delay(delay)
          .duration(duration)
          .attr('cy', Math.floor(i / circlesPerRow) * (2 * radius + spacing))
          .ease(d3.easeBounce)
          .on('end', () => { 
            animationComplete++;
            if (animationComplete === totalCircles) {
              changeColors();
            }
          });
      });
  
      function changeColors() {
        circles.transition()
          .duration(500)
          .attr('fill', d => color(d.area))
          .on('end', (d, i) => {
            if (i === totalCircles - 1) {
              groupCircles();
            }
          });
      }
  
      function groupCircles() {
        const areaGroups = d3.group(circles.data(), d => d.area);
        const groupWidth = 4 * (2 * radius + spacing);
        const groupHeight = 4 * (2 * radius + spacing);
        const groupsPerRow = 4;
        const groupSpacingX = 40;
        const groupSpacingY = 60;
        
        let groupIndex = 0;
        areaGroups.forEach((circlesGroup, area) => {
          const rowIndex = Math.floor(groupIndex / groupsPerRow);
          const columnIndex = groupIndex % groupsPerRow;
          
          circlesGroup.forEach((d, i) => {
            const circle = circles.filter(c => c === d);
            const delay = Math.random() * 1000;
            const duration = 1000 + Math.random() * 1000;
            
            const rowInGroup = Math.floor(i / 4);
            const columnInGroup = i % 10;
            
            circle.transition()
              .delay(delay)
              .duration(duration)
              .attr('cx', columnIndex * (groupWidth + groupSpacingX) + columnInGroup * (2 * radius + spacing))
              .attr('cy', rowIndex * (groupHeight + groupSpacingY) + rowInGroup * (2 * radius + spacing))
              .ease(d3.easeElastic);
          });
          
          // Add label
          g.append('text')
            .attr('x', columnIndex * (groupWidth + groupSpacingX) + groupWidth / 2)
            .attr('y', rowIndex * (groupHeight + groupSpacingY) + groupHeight + 20)
            .attr('text-anchor', 'middle')
            .attr('fill', color(area))
            .text(`${area}: ${circlesGroup.length}`)
            .style('opacity', 0)
            .transition()
            .delay(2000)
            .duration(500)
            .style('opacity', 1);
          
          groupIndex++;
        });
        
        // Dispatch the animationComplete event after all animations are done
        setTimeout(() => {
          dispatch('animationComplete');
        }, 3000);
      }
    }
  </script>
  
  <svg bind:this={svg} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}></svg>
  
  <style>
    svg {
      max-width: 100%;
      height: auto;
    }
  </style>
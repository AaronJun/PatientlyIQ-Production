<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte"
    
    export let key; // Keep the key prop for refreshing
    
    let svgElement;
    
    const timelineLabels = [
      "Diagnostic journey",
      "Treatment search",
      "New treatment search",
      "Clinical trial consideration"
    ];
    
    function generateRandomData() {
      const startDate = new Date('1993-01-01');
      const endDate = new Date('2023-12-31');
      const timeRange = endDate.getTime() - startDate.getTime();
    
      return Array.from({ length: 5 }, () => ({
        date: new Date(startDate.getTime() + Math.random() * timeRange),
        type: ['circle', 'circle', 'circle'][Math.floor(Math.random() * 3)],
        value: Math.random() * 6 + 1
      })).sort((a, b) => a.date - b.date);
    }
    
    function drawTimelines() {
      if (!svgElement) return;
    
      d3.select(svgElement).selectAll("*").remove(); // Clear existing content
    
      const margin = { top: 50, right: 20, bottom: 20, left: 200 };
      const width = 1200 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;
      const timelineHeight = height / 4;
    
      const svg = d3.select(svgElement)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
      const x = d3.scaleTime()
        .domain([new Date('1980-01-01'), new Date('2023-12-31')])
        .range([0, width]);
    
      // Add x-axis at the top
      svg.append('g')
        .call(d3.axisTop(x));
    
      const symbolTypes = {
        circle: d3.symbolCircle,
        triangle: d3.symbolTriangle,
        square: d3.symbolSquare
      };
    
      // Create a tooltip div
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");
    
      timelineLabels.forEach((label, index) => {
        const data = generateRandomData();
        const yPosition = index * timelineHeight + timelineHeight / 2;
    
        // Add timeline label
        svg.append('text')
          .attr('x', -140)
          .attr('y', yPosition-50)
          .attr('text-anchor', 'top')
          .attr('alignment-baseline', 'middle')
          .text(label)
          .style('font-size', '12px')
          .style('font-weight', '600');
    
        // Add symbols with tooltips
        svg.selectAll(`.symbol-${index}`)
          .data(data)
          .enter()
          .append('path')
          .attr('class', `symbol-${index}`)
          .attr('d', d => d3.symbol().type(symbolTypes[d.type]).size(d.value * 200)())
          .attr('transform', d => `translate(${x(d.date)},${yPosition})`)
          .attr('fill', '#f151159e')
          
          .on("mouseover", (event, d) => {
            tooltip.transition()
              .duration(200)
              .style("opacity", .9);
            tooltip.html(`Date: ${d.date.toDateString()}<br/>Value: ${d.value.toFixed(2)}`)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", (d) => {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          });
      });
    }
    
    onMount(drawTimelines);
    afterUpdate(drawTimelines);
</script>

<svg bind:this={svgElement}></svg>

<style>
svg {
  width: 100%;
}
</style>
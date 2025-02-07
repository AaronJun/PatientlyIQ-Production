<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, Svg, Bars, Grid, Axis } from 'layerchart';
    import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
    import { stack } from 'd3-shape';
  
    export let data = [];
    export let stageColor = "#4A90E2";
    
    let width;
    let height = 450;
    let container;
  
    $: stackedData = processData(data);
    $: colorScale = scaleOrdinal()
      .domain(data[0]?.relatedSearches.map((_, i) => i.toString()) || [])
      .range(generateColorRange(stageColor, data[0]?.relatedSearches.length || 0));
  
    function generateColorRange(baseColor, count) {
      return Array.from({ length: count }, (_, i) => {
        const color = d3.color(baseColor);
        return color.brighter(i * 1.725).toString();
      });
    }
  
    function processData(rawData) {
      if (!rawData?.length) return [];
      
      const stackData = stack()
        .keys(rawData[0].relatedSearches.map((_, i) => i.toString()))
        .value((d, key) => d.relatedSearches[parseInt(key)]?.volume || 0);
  
      return stackData(rawData);
    }
  
    function handleBarClick(event, d) {
      const segment = d.data.relatedSearches[d.index];
      console.log(`Clicked: ${segment.term}, Volume: ${segment.volume}`);
    }
  
    let tooltipContent = '';
    let tooltipVisible = false;
    let tooltipX = 0;
    let tooltipY = 0;
  
    function showTooltip(event, d) {
      const segment = d.data.relatedSearches[d.index];
      tooltipContent = `
        <div class="font-medium mb-2">${segment.term}</div>
        <div class="mt-1">${segment.volume.toLocaleString()} searches</div>
      `;
      tooltipVisible = true;
      tooltipX = event.clientX + 10;
      tooltipY = event.clientY - 10;
    }
  </script>
  
  <div class="relative w-full p-6" bind:clientWidth={width}>
    <h3 class="text-sm font-medium mb-4">Search Volume Distribution</h3>
    
    <div bind:this={container} class="w-full">
      <Chart
        {data}
        x={d => d.term}
        y={d => d.relatedSearches.reduce((sum, rs) => sum + rs.volume, 0)}
        xScale={scaleBand().padding(0.3)}
        yScale={scaleLinear()}
        padding={{ top: 20, right: 15, bottom: 75, left: 45 }}
      >
        <Svg>
          <Grid y />
          <Axis 
            placement="bottom"
            transform={({ text }) => {
              text.attr('transform', 'rotate(-90)')
                .attr('text-anchor', 'start')
                .attr('dx', '1em')
                .attr('dy', '-9.25em')
                .style('font-size', '10.25px')
                .style('font-weight', '600');
            }}
          />
          <Axis placement="left" />
          
          <Bars
            data={stackedData}
            fill={colorScale}
            on:click={handleBarClick}
            on:pointerenter={showTooltip}
            on:pointermove={(e) => {
              tooltipX = e.clientX + 10;
              tooltipY = e.clientY - 10;
            }}
            on:pointerleave={() => tooltipVisible = false}
          />
        </Svg>
      </Chart>
    </div>
  
    {#if tooltipVisible}
      <div 
        class="fixed z-50 bg-gray-800 text-white px-4 py-3 rounded text-sm pointer-events-none"
        style="left: {tooltipX}px; top: {tooltipY}px;"
      >
        {@html tooltipContent}
      </div>
    {/if}
  </div>
  
  <style>
    :global(.tick text) {
      fill: #666;
    }
  
    :global(.tick line) {
      stroke: #ddd;
    }
  
    :global(.domain) {
      stroke: #ddd;
    }
  </style>
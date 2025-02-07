<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, Svg, Points, Grid, Axis } from 'layerchart';
    import { scaleLinear } from 'd3-scale';
  
    export let data = [];
    export let width = 250;
    export let height = 250;
  
    let margin = {
      top: 0,
      right: 10,
      bottom: 20,
      left: 10
    };
  
    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;
  
    const quadrantLabels = [
      { text: 'Avoidant', x: 60.25, y: 2.5 },  
      { text: 'Proactive', x: 9.25, y: 42.25 },
      { text: 'Motivated', x: 90, y: 42.25 },
      { text: 'Anxious', x: 60.25, y: 92.5 }
    ];
  </script>
  
  <div class="quadrant-chart">
    <Chart
      {data}
      x="x"
      y="y"
      xScale={scaleLinear().domain([0, 100])}
      yScale={scaleLinear().domain([0, 100])}
      padding={margin}
    >
      <Svg>
        <Grid 
          x
          y
          strokeDasharray="4,4"
          stroke="#e5e7eb"
          strokeOpacity={0.5}
        />
        
        <!-- Quadrant lines -->
        <line 
          x1={50} y1={0} 
          x2={50} y2={100} 
          stroke="#FF8080" 
          stroke-width={0.725}
        />
        <line 
          x1={0} y1={50} 
          x2={100} y2={50} 
          stroke="#FF8080" 
          stroke-width={1}
        />
  
        <!-- Quadrant labels -->
        {#each quadrantLabels as label}
          <text
            x={label.x}
            y={label.y}
            text-anchor="middle"
            font-size="9.25px"
            font-weight="800"
            fill="#7C7C7C"
            font-family="IBM Plex Mono"
          >
            {label.text}
          </text>
        {/each}
  
        <Points
          stroke="#ff1515"
          fill="#ff1515"
          opacity={1}
          r={8}
        />
      </Svg>
    </Chart>
  </div>
  
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
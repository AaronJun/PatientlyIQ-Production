<script lang="ts">
  import { Axis, Chart, Grid, Svg } from 'layerchart';
  import { onMount } from 'svelte';
  import studyMetadata from '../../data/journeymap/study_metadata_xackt.json';
  import { scaleLinear } from 'd3-scale';

  // Get total weeks from metadata
  const totalWeeks = studyMetadata.total_weeks;
  
  // Create data array for weeks
  const data = Array.from({ length: totalWeeks + 1 }, (_, i) => ({ week: i }));
  
  // Chart dimensions
  const width = 1000;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  
  // Generate tick values for every 4th week
  const xTicks = Array.from(
    { length: Math.floor(totalWeeks / 4) + 1 },
    (_, i) => i * 4
  );
  
  onMount(() => {
    console.log('Component mounted');
  });
</script>

<div class="chart-container" style="height: {height}px;">
  <Chart 
    {data}
    x="week"
    y={() => 1}
    {width} 
    {height} 
    {padding}
    xScale={scaleLinear().domain([0, totalWeeks])}
    yScale={scaleLinear().domain([0, 2])}
  >
    <Svg>
      <Grid horizontal={false} stroke="#ddd" strokeDasharray="2,2" />
      <Axis 
        placement="bottom"
        label="Weeks"
        tickValues={xTicks}
        gridlines={true}
      />
    </Svg>
  </Chart>
</div>

<style>
  .chart-container {
    width: 100%;
    overflow-x: auto;
    background: white;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 1rem;
  }

  :global(.tick text) {
    fill: #666;
    font-size: 12px;
  }

  :global(.tick line) {
    stroke: #ddd;
  }

  :global(.domain) {
    stroke: #ddd;
  }
</style>

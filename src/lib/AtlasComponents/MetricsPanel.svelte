<script lang="ts">
  interface SubMetric {
    value: number;
    weight: number;
    min: number;
    max: number;
  }
  
  interface MetricGroup {
    score: number;
    weight: number;
    isInverse: boolean;
    subMetrics: {
      [key: string]: SubMetric;
    };
  }
  
  interface CountryData {
    name: string;
    calculatedMetrics: {
      [key: string]: MetricGroup;
    };
  }
 
  export let hoveredData: CountryData | null;
  
  $: if (hoveredData) {
    console.log("Hovered Data:", hoveredData);
    console.log("Base Metrics:", hoveredData.baseMetrics);
    console.log("Calculated Metrics:", hoveredData.calculatedMetrics);
  }
  
  function formatMetricName(name: string): string {
    return name.replace(/([A-Z])/g, ' $1').trim();
  }
</script>

<div class="metrics-panel">
  <h3 class="text-lg font-medium mb-4">
    {hoveredData ? hoveredData.name : 'Hover over a country'}
  </h3>
  
  {#if hoveredData?.calculatedMetrics}
    <div class="space-y-4">
      <table class="w-full">
        <thead>
          <tr class="text-left bg-gray-100">
            <th class="p-2">Category</th>
            <th class="p-2">Score</th>
            <th class="p-2">Weight</th>
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(hoveredData.calculatedMetrics) as [key, value]}
            <tr class="border-t border-gray-200">
              <td class="p-2 capitalize">{formatMetricName(key)}</td>
              <td class="p-2">{value.score.toFixed(2)}</td>
              <td class="p-2">{(value.weight * 100).toFixed(0)}%</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="text-sm text-gray-500 mt-2">
        {#if hoveredData.calculatedMetrics}
          Total Score: {Object.values(hoveredData.calculatedMetrics)
            .reduce((acc, curr) => acc + (curr.score * curr.weight), 0)
            .toFixed(2)}
        {/if}
      </div>
    </div>
  {:else}
    <p class="text-gray-500">Select a country to view detailed metrics</p>
  {/if}
</div>

<style>
  .metrics-panel {
    min-height: 200px;
  }
  
  table {
    border-collapse: collapse;
  }

  th {
    @apply text-xs font-mono font-bold text-gray-700;
  }

  td {
    @apply text-sm;
  }
</style>
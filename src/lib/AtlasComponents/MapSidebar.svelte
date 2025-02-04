<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { ChevronDown, ChevronUp } from 'carbon-icons-svelte';
  import MetricsPanel from './MetricsPanel.svelte';
  import { countryStore } from './stores/countryStore';
  
  const dispatch = createEventDispatcher();
  
  export let allData;
  export let selectedMetric;
  export let rankedData;
  export let colorGradient;
  export let hoveredData;
  export let getColorForRank;
  
  let isExpanded = true;
  
  $: sortedData = allData
    .sort((a, b) => rankedData[a.id] - rankedData[b.id])
    .map((country, index) => ({
      ...country,
      rank: index + 1
    }));
  
  $: topThreeCountries = sortedData.slice(0, 3);
  
  function handleCountryHover(country) {
    dispatch('countryHover', country);
  }
  
  function handleCountryClick(country) {
    dispatch('countryClick', country);
  }
  
  function handleAdjustInputs() {
    dispatch('openCalculator');
  }
  
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
</script>

<div class="sidebar flex flex-col rounded-sm drop-shadow-sm bg-slate-50">
  <button 
    on:click={toggleExpanded}
    class="flex items-center align-middle justify-between py-4 w-full bg-slate-100 hover:bg-gray-200"
  >    <svelte:component this={isExpanded ? ChevronUp : ChevronDown} class="w-7 h-7" />
  </button>

  {#if isExpanded}
    <div class="content" transition:slide>
      <div class="grid grid-cols-12 gap-4 p-4">
        <div class="col-span-7">
          <div class="overflow-y-auto max-h-[60vh]">
            <table class="w-full">
              <thead class="sticky top-0 bg-white">
                <tr class="text-left uppercase">
                  <th class="p-2">Rank</th>
                  <th class="p-2">Country</th>
                  <th class="p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {#each sortedData as country}
                  <tr 
                    class:highlighted={hoveredData?.id === country.id}
                    on:mouseenter={() => handleCountryHover(country)}
                    on:mouseleave={() => handleCountryHover(null)}
                    on:click={() => handleCountryClick(country)}
                    class="cursor-pointer hover:bg-blue-50"
                  >
                    <td class="p-2">
                      <div class="color-indicator" style="background-color: {getColorForRank(country.rank)}">
                        <span class="rank">{country.rank}</span>
                      </div>
                    </td>
                    <td class="p-2">{country.name}</td>
                    <td class="p-2">{country[selectedMetric].toFixed(2)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>

        <div class="col-span-5">
          <div class="bg-gray-50 p-4 rounded-lg h-full">
			<MetricsPanel 
			hoveredData={hoveredData} 
		  />          </div>
        </div>
      </div>

      <div class="p-4">
        <button 
          on:click={handleAdjustInputs}
          class="w-full bg-blue-600 text-white p-3 rounded-md font-semibold 
                 hover:bg-blue-700 transition-colors"
        >
          Adjust Inputs
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .sidebar {
    width: 100%;
    border-top: 1px solid #e5e7eb;
  }

  .color-indicator {
    @apply inline-flex items-center justify-center;
    width: 2rem;
    height: 2rem;
    border-radius: 9999px;
  }

  .rank {
    @apply text-xs font-mono font-medium text-white;
  }

  .highlighted {
    @apply bg-blue-50;
  }

  thead {
    @apply bg-gray-50 text-gray-700 text-xs font-mono font-bold;
  }

  td {
    @apply text-sm;
  }

  .tr {
	border-top: 1px solid #e5e7eb;
  }
</style>
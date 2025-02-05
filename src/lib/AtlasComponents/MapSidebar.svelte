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
<div class="sidebar flex flex-col pl-4 pr-2">
  {#if isExpanded}
    <div class="content" transition:slide>
      <div class="grid grid-cols">
        <div class="align-top">
          <div class="overflow-y-auto h-[90vh]">
            <table class="w-full border-separate border-spacing-0">
              <thead class="sticky top-0">
                <tr class="text-left font-mono uppercase text-xs font-semibold text-slate-500">
                  <th class="w-12">Rank</th>
                  <th class="text-left">Country</th>
                  <th class="text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {#each sortedData as country}
                  <tr 
                    class:highlighted={hoveredData?.id === country.id}
                    on:mouseenter={() => handleCountryHover(country)}
                    on:mouseleave={() => handleCountryHover(null)}
                    on:click={() => handleCountryClick(country)}
                    class="cursor-pointer hover:bg-blue-100"
                  >
                    <td class="p-1">
                      <div class="color-indicator max-w-12" style="background-color: {getColorForRank(country.rank)}">
                        <span class="rank">{country.rank}</span>
                      </div>
                    </td>
                    <td class="p-2">{country.name}</td>
                    <td class="p-2 text-right">{country[selectedMetric].toFixed(2)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
            <button 
              on:click={handleAdjustInputs}
              class="w-full bg-[#ff4A4A] text-white p-3 mt-8 font-medium font-mono text-sm tracking-wide upper hover:bg-blue-700 transition-colors"
            >
              Adjust Inputs
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .sidebar {
    border-top: 1px solid #e5e7eb;
  }

  .color-indicator {
    width: 100%;
    height: 100%;
    padding: 0.2725rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
  }

  .rank {
    @apply text-[9.25px] font-mono font-medium text-white;
  }

  .highlighted {
    @apply bg-orange-200;
  }

  th {
  }

  td {
    font-family: 'ibm plex mono', monospace;
    height: 100%;
    font-size: 0.75rem;
  }

  th {
    @apply text-[10.25px] font-mono font-medium text-slate-600;
  }
</style>
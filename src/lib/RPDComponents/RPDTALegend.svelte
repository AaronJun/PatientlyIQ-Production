<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import "carbon-components-svelte/css/all.css";
  
  const dispatch = createEventDispatcher();

  export const therapeuticAreaColors = {
    "Gastroenterology": "#a6cee3",
    "Neurology": "#1f78b4",
    "Ophthalmology": "#6C6C6C",
    "Immunology": "#33a02c",
    "Metabolic": "#fb9a99",
    "Dermatology": "#fdbf6f",
    "Hematology": "#e31a1c",
    "Orthopedics": "#ff7f00",
    "Pulmonology": "#cab2d6",
    "Nephrology": "#6a3d9a",
    "Oncology": "#ffff99",
    "Endocrinology": "#b15928",
    "Hepatology": "#8dd3c7",
  };
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

  $: positionClass = {
    'top-right': 'top-32 right-8',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-16 right-10',
    'bottom-left': 'bottom-4 left-4'
  }[position];

  function handleMouseEnter(area: string) {
    dispatch('areaHover', { area });
  }

  function handleMouseLeave() {
    dispatch('areaLeave');
  }
</script>

<div class={`legend-contain absolute p-4 pl-4 pb-4 bg-white dark:bg-gray-800 z-10 
  max-w-[340px] sm:max-w-[340px] transition-colors duration-200 ${positionClass}`}>
  <h3 class="text-xs font-semibold mb-6 text-slate-800 dark:text-gray-100">
    Therapeutic Areas
  </h3>
  <div class="grid grid-cols-1 pb-1 sm:grid-cols-1 gap-1 sm:gap-1">
    {#each Object.entries(therapeuticAreaColors) as [area, color]}
      <div 
        class="legend flex items-center gap-2 min-w-[140px] cursor-pointer hover:bg-orange-300 dark:hover:bg-gray-700 p-1 px-1 rounded transition-colors duration-150"
        on:mouseenter={() => handleMouseEnter(area)}
        on:mouseleave={handleMouseLeave}
      >
        <div 
          class="w-2 h-3 ring-[.5px] ring-sky-900 dark:border-gray-200 rounded-full flex-shrink-0"
          style:background-color={color}
        />
        <span class="text-[10.25px] font-mono pr-2 mr-2 text-gray-600 dark:text-gray-300 whitespace-normal break-words">{area}</span>
      </div>
    {/each}
  </div>
</div>

<style>
.legend-contain {
  border: 1px dotted #e0e0e0;
}

  .legend {
    transition: background-color 0.2s;
  }

  .legend:hover {
    border-radius: 100px;
    padding:.25rem;
  }
</style>
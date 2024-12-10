<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import "carbon-components-svelte/css/all.css";
  
  const dispatch = createEventDispatcher();

  export  const therapeuticAreaColors = {
    "Gastroenterology": "#39FF14",
    "Neurology": "#4D4DFF",
    "Ophthalmology": "#E79028",
    "Immunology": "#EA38A5",
    "Metabolic": "#133B11",
    "Dermatology": "#559368",
    "Hematology": "#CF3630",
    "Orthopedics": "#441780",
    "Pulmonology": "#CBC09F",
    "Nephrology": "#ACA3DB",
    "Oncology": "#FF84DE",
    "Hepatology": "#FF00D4",
  };
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

  $: positionClass = {
    'top-right': 'top-32 right-8',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-8 right-10',
    'bottom-left': 'bottom-4 left-4'
  }[position];

  function handleMouseEnter(area: string) {
    dispatch('areaHover', { area });
  }

  function handleMouseLeave() {
    dispatch('areaLeave');
  }
</script>

<div class={`legend-contain absolute p-4 pl-4 pb-8 bg-white dark:bg-gray-800 z-10 
  max-w-[340px] sm:max-w-[340px] transition-colors duration-200 ${positionClass}`}>
  <h3 class="text-xs font-semibold mb-6 text-[#063D37] dark:text-gray-100">
    Therapeutic Areas
  </h3>
  <div class="grid grid-cols-1 pb-1 sm:grid-cols-2 gap-1 sm:gap-3">
    {#each Object.entries(therapeuticAreaColors) as [area, color]}
      <div 
        class="legend flex items-center gap-2 min-w-[140px] cursor-pointer hover:bg-orange-300 dark:hover:bg-gray-700 p-1 px-4 rounded transition-colors duration-150"
        on:mouseenter={() => handleMouseEnter(area)}
        on:mouseleave={handleMouseLeave}
      >
        <div 
          class="w-2 h-2 ring-[.25px] ring-sky-900 dark:border-gray-200 rounded-full flex-shrink-0"
          style:background-color={color}
        />
        <span class="text-xs font-mono ml-1 mr-4 text-gray-600 dark:text-gray-300 whitespace-normal break-words">{area}</span>
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
<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { ArrowUpRight } from 'carbon-icons-svelte';

  export let date: string;
  export let drugName: string;
  export let sponsor: string;
  export let onSponsorClick: () => void;
  export let TEXT_ANIMATION_DURATION: number;
</script>

<div class="header grid grid-cols-2 justify-stretch gap-4 pb-4 mr-6">
  <h3 class="text-xs col-span-2 font-semibold text-sky-800">
    {date}
  </h3>
  
  <div class="flex items-end mt-6 pb-2">
    <h2 class="text-4xl font-light text-sky-800" 
        in:fly={{duration: TEXT_ANIMATION_DURATION}}>
      {drugName}
    </h2>
  </div>

  <div class="flex items-end justify-end w-full">
    <button 
      class="text-lg text-sky-800 hover:text-green-600 font-base flex items-center gap-2"
      on:click={onSponsorClick}
      in:fade={{duration: TEXT_ANIMATION_DURATION}}
    >   
      {sponsor} 
      <ArrowUpRight size={16} />
    </button>
  </div>
</div>

<style>
  .header {
    border-bottom: .525px solid #377e6b;
  }
</style>
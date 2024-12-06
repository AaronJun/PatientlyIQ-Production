<script lang="ts">
    import { fade } from 'svelte/transition';
    import { ArrowLeft } from 'carbon-icons-svelte';
  
    export let onClick: () => void;
    export let TEXT_ANIMATION_DURATION: number;
  </script>
  
  <button 
    class="flex gap-1 py-1 pr-3 pl-2 items-center justify-self-start bg-[#37587e] rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800"
    on:click={onClick}
    in:fade={{duration: TEXT_ANIMATION_DURATION}}
  >
    <ArrowLeft /> Back
  </button>
  
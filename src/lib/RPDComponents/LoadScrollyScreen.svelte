<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import ScrollyLoad from './ScrollyLoad.svelte';
    
    const dispatch = createEventDispatcher();
    
    function handleContinue() {
      dispatch('complete');
    }
  </script>
  
  <div 
    class="loading-drawer"
    transition:fly={{ y: '-100%', duration: 800 }}>
    <ScrollyLoad on:continue={handleContinue} />
  </div>
  
     
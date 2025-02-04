<script lang="ts">
  import { fly } from 'svelte/transition';
  import AtlasInfoContent from '../AtlasComponents/AtlasInfoContent.svelte';

  export let isOpen: boolean;
  export let onClose: () => void;
  export let data: any;
  export let circleColor: string = '#FF7F00';
  export let selectedMetric: string = 'compositeScore';
  export let rank: number | null = null;
  export let totalCountries: number = 0;
  export let allData: any[] = [];

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="drawer-backdrop" 
       on:click={handleBackdropClick}
       transition:fly={{ duration: 500, opacity: 0 }}>
    <div class="drawer">
      <div class="drawerContent">
        <AtlasInfoContent 
          {data} 
          {circleColor} 
          {selectedMetric} 
          {rank} 
          {totalCountries} 
          {allData}
        />
      </div>
      <button class="close-button" on:click={onClose}>&times;</button>
    </div>
  </div>
{/if}
  <style>
    .drawer-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, .7);
      z-index: 9999;
    }
  
    .drawer {
      position: fixed;
      width: 70vw;
      top: 0;
      right: 0;
      height: 100%;
      background-color: #fff;
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      overflow-y: auto;
    }
  
    .drawerContent {
      height: 100vh;
      width: 70vw;    
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  
    .close-button {
      position: absolute;
      top: 0px;
      right: 0px;
      font-size: 2rem;
      background: none;
      border: none;
      cursor: pointer;
    }
  </style>
<!-- RPDComponents/RPDFLowerInfoPanel.svelte -->
<script lang="ts">
    import type { RPDData, ConstellationEntry } from '$lib/types';
    import RPDPageSummary from './RPDPageSummary.svelte';
    import { YearlySummary } from '$lib/componentStores';
    
    export let currentYear: string;
    export let processedRpdPrvData: RPDData[];
    export let processedConstellationData: ConstellationEntry[];
    export let hoveredPetalData: ConstellationEntry | null;
    export let isDrawerOpen: boolean;
    export let selectedData: ConstellationEntry | null;
  </script>
  
  <div class="info-panel row col-span-2 align-center p-8 pl-0 pb-10 text-green-900">
    <h2 class="text-xs mb-8 font-bold col-span-1">Nurturing New Treatments</h2>
    <p class="text-base w-full max-w-4xl col-span-2 text-gray-900 mb-8">
      The FDA's Rare Pediatric Disease (RPD) Priority Review Voucher program offers valuable incentives for drug developers tackling rare childhood diseases. By rewarding successful development of these treatments, the program aims to stimulate innovation in areas that might otherwise see limited research investment.
    </p>
    <RPDPageSummary 
      rpdPrvData={processedRpdPrvData}
      constellationData={processedConstellationData} 
      {currentYear} 
    />
    {#if $YearlySummary && processedConstellationData.length > 0}
      <svelte:component 
        this={$YearlySummary}
        {currentYear}
        constellationData={processedConstellationData}
        {hoveredPetalData}
        {isDrawerOpen}
        {selectedData}
        on:clusterElementClick
      />
    {/if}
  </div>
  
  <style>
    .info-panel {
      width: 25vw;
    }
    
    :global(.info-panel p) {
      line-height: 1.6;
    }
  </style>
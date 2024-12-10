<script lang="ts">
    export let summaryText: string = '';
    export let currentArea: string | null = null;
  
    // Handle initial/empty state
    $: if (!summaryText && !currentArea) {
      summaryText = `This visualization shows the therapeutic areas that have received rare pediatric disease priority review vouchers. 
        Hover over an area or individual petals to explore the program's impact across different medical fields.`;
    }
  </script>
  
  <div class="summary-container">
    {#if currentArea}
      <div class="info-panel row col-span-2 align-center p-8 pl-0 text-orange-600">
        <h2 class="text-xs mb-2 font-bold col-span-1">
          Therapeutic Area Impact
        </h2>
      </div>
    {/if}
  
    <p class="text-base w-full pr-2 max-w-4xl col-span-2 text-gray-900 mt-4">
      {@html summaryText}
    </p>
  </div>
  
  <style>
    .highlight {
      color: #C9623F;
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 800;
      text-decoration: underline dotted;
      padding: 0 0.15rem;
    }
  </style>
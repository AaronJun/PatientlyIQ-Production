<!-- RPDTooltip.svelte -->
<script lang="ts">
	import { back } from "@melt-ui/svelte/internal/helpers";
  import { ArrowUpRight } from "carbon-icons-svelte";
	import { ArrowUp } from "lucide-svelte";
  export let visible: boolean = false;
  export let content: {
      sponsor: string;
      drugName?: string;
      therapeuticArea?: string;
      id: string;
  };
  export let borderColor: string = "#4a5568";
  export let x: number = 0;
  export let y: number = 0;
</script>

{#if visible}
  <div 
      class="tooltip-container"
      style="
          left: {x}px;
          top: {y}px;
          border-color: {borderColor};
      "
  >
      <div class="tooltip-header">
          <h3 class="tooltip-title capitalize text-sm">{content.sponsor}</h3>
          {#if content.drugName}
          <span class="tooltip-subtitle capitalize text-sm">{content.drugName}</span>
          {/if}
      </div>
      <div class="tooltip-body">
          {#if content.therapeuticArea}
              <div class="tooltip-row">
                  <span class="text-xs">{content.therapeuticArea}</span>
              </div>
          {/if}
          <div class="tooltip-row">
              <span class="font-normal text-xs">{content.id}</span>
          </div>
        </div>
        <div class="tooltip-detail bg-emerald-100 px-2 py-1">
            <span class="label text-xs font-medium text-slate-900">Click for details</span>
            <ArrowUpRight size="16" class="text-slate-900" />
        </div>  
      </div>
        {/if}
        
<style>
  .tooltip-container {
      position: absolute;
      z-index: 1000;
      min-width: 180px;
      max-width: 325px;
      background-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border-left: 4.245px solid;
      pointer-events: none;
      font-family: 'IBM Plex Sans', sans-serif;
      transform: translate(0, 0);
      animation: fade-in 0.2s ease-out;
  }

  .tooltip-header {
      background-color: #f8fafc;
      padding: 8px 12px;
      border-top-right-radius: 4px;
      border-bottom: .5425px solid #718096;
  }

  .tooltip-title {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #2d3748;
  }

  .tooltip-subtitle {
      display: block;
      margin-top: 2px;
      color: #2d3748;
  }

  .tooltip-body {
      padding: 8px 12px;
  }

  .tooltip-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
  }

  .tooltip-detail {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: .5425px solid #718096;
  }

  .tooltip-row:last-child {
      margin-bottom: 0;
  }

  .label {
      color: #718096;
      font-weight: 500;
      margin-right: 8px;
  }

  .value {
      color: #4a5568;
      font-weight: 600;
      text-align: right;
  }

  @keyframes fade-in {
      from {
          opacity: 0;
      }
      to {
          opacity: 1;
      }
  }
</style>
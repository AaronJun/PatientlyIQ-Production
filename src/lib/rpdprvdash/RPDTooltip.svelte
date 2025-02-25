<!-- RPDTooltip.svelte -->
<script lang="ts">
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
          <h3 class="tooltip-title">{content.sponsor}</h3>
          {#if content.drugName}
              <span class="tooltip-subtitle">{content.drugName}</span>
          {/if}
      </div>
      <div class="tooltip-body">
          {#if content.therapeuticArea}
              <div class="tooltip-row">
                  <span class="label">Therapeutic Area:</span>
                  <span class="value">{content.therapeuticArea}</span>
              </div>
          {/if}
          <div class="tooltip-row">
              <span class="label">Status:</span>
              <span class="value">{content.id}</span>
          </div>
      </div>
  </div>
{/if}

<style>
  .tooltip-container {
      position: absolute;
      z-index: 1000;
      min-width: 180px;
      max-width: 240px;
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      pointer-events: none;
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 12px;
      transform: translate(0, 0);
      animation: fade-in 0.2s ease-out;
  }

  .tooltip-header {
      background-color: #f8fafc;
      padding: 8px 12px;
      border-top-right-radius: 4px;
      border-bottom: 1px solid #e2e8f0;
  }

  .tooltip-title {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: #2d3748;
  }

  .tooltip-subtitle {
      display: block;
      font-size: 11px;
      margin-top: 2px;
      color: #4a5568;
      font-style: italic;
  }

  .tooltip-body {
      padding: 8px 12px;
  }

  .tooltip-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
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
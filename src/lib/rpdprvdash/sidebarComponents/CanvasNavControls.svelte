<!-- CanvasNavControls.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Help, ZoomIn, ZoomOut, ZoomReset } from 'carbon-icons-svelte';

  // Props
  export let orientation: 'vertical' | 'horizontal' = 'vertical';
  export let isCollapsed: boolean = false;
  export let isTouchDevice: boolean = false;
  
  // State
  let isHovered: boolean = false;
  
  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Navigation functions
  function handleZoomIn() {
    dispatch('zoomIn');
  }

  function handleZoomOut() {
    dispatch('zoomOut');
  }

  function handleResetView() {
    dispatch('resetView');
  }

  function handleHowToNavigate() {
    dispatch('howToNavigate');
  }
</script>

<div 
  class="nav-controls {orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row'} gap-3"
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => isHovered = false}
  role="toolbar"
  tabindex="0"
  aria-label="Canvas navigation controls"
>
  <div class="main-controls flex {orientation === 'vertical' ? 'flex-col' : 'flex-row'} gap-3" role="group" aria-label="Zoom controls">
    <button 
      class="nav-button bg-slate-50 ring-2 ring-emerald-300 ring-offset-2 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-emerald-300"
      on:click={handleZoomIn}
      aria-label="Zoom In"
    >
      <ZoomIn class="w-5 h-5 text-slate-600" aria-hidden="true"/>
    </button>
    <button 
      class="nav-button bg-slate-50 ring-2 ring-emerald-300 ring-offset-2 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-emerald-300"
      on:click={handleZoomOut}
      aria-label="Zoom Out"
    >
      <ZoomOut class="w-5 h-5 text-slate-600" aria-hidden="true"/>
    </button>
    <button 
      class="nav-button bg-slate-50 ring-2 ring-emerald-300 ring-offset-2 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-emerald-300"
      on:click={handleResetView}
      aria-label="Reset View"
    >
      <ZoomReset class="w-5 h-5 text-slate-600" aria-hidden="true"/>
    </button>
  </div>
  <div class="{orientation === 'vertical' ? 'mt-6' : 'ml-6'}">
    <button 
      class="help-button bg-slate-50 ring-2 ring-emerald-300 ring-offset-2 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-emerald-300"
      on:click={handleHowToNavigate}
      title={isCollapsed && !isHovered ? "How to Navigate" : ''}
      aria-label="Help with navigation"
    >
      <Help class="w-5 h-5 text-slate-600" aria-hidden="true"/>
    </button>
  </div>
</div>

<style>
  .nav-controls {
    z-index: 10;
  }
  
  /* Mobile-specific styles */
  @media (max-width: 768px) {
    .nav-controls {
      position: fixed;
      bottom: 24px;
      right: 24px;
    }
  }
</style> 
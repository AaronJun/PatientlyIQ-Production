<script lang="ts">
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import RPDTooltip from '$lib/RPDComponents/RPDTooltip.svelte';

  // Use default values instead of window properties for SSR compatibility
  export let width = 1020;
  export let height = width;
  
  // Tooltip state
  let tooltipVisible = false;
  let tooltipContent = {
    sponsor: '',
    drugName: '',
    therapeuticArea: '',
    id: ''
  };
  let tooltipBorderColor = '#000000';
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipTimeout: ReturnType<typeof setTimeout> | null = null;
  const tooltipOffset = { x: 15, y: 15 };

  // Create event dispatcher
  const dispatch = createEventDispatcher();
  
  let svg: SVGSVGElement;
  let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let transform = d3.zoomIdentity;
  let container: HTMLDivElement;
  let initialized = false;

  // Initialize zoom behavior with proper typing
  const zoom = d3.zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.5, 2.5]) // Increased minimum scale to 0.5 to limit zoom out
  .on('zoom', (event) => {
    transform = event.transform;
    if (mainGroup) {
      mainGroup.attr('transform', event.transform.toString());
    }
  });
  // Navigation control functions
  function zoomIn() {
    if (svg) {
      const svgSelection = d3.select<SVGSVGElement, unknown>(svg);
      svgSelection.transition()
        .duration(300)
        .call(zoom.scaleBy, 1.3);
    }
  }

  function zoomOut() {
    if (svg) {
      const svgSelection = d3.select<SVGSVGElement, unknown>(svg);
      svgSelection.transition()
        .duration(300)
        .call(zoom.scaleBy, 0.7);
    }
  }

  // Update dimensions when container size changes
  function updateDimensions() {
    if (container) {
      const rect = container.getBoundingClientRect();
      width = rect.width || width;
      height = rect.height || height;
      console.log("Container dimensions:", width, height);
    }
  }

  // Initialize the canvas with proper error handling
  async function initializeCanvas() {
    if (!svg || initialized) return;
    
    try {
      console.log("Initializing InfiniteCanvasWrapper");
      
      // Update dimensions based on container
      updateDimensions();
      
      // Initialize the SVG and main group
      const svgSelection = d3.select<SVGSVGElement, unknown>(svg);
      
      // Add dotted pattern for background
      const defs = svgSelection.append('defs');
      const pattern = defs.append('pattern')
        .attr('id', 'dotGrid')
        .attr('width', 10)
        .attr('height', 10)
        .attr('patternUnits', 'userSpaceOnUse');
        
      // Add dot at center of pattern
      pattern.append('circle')
        .attr('cx', 10)
        .attr('cy', 10)
        .attr('r', 1.625)
        .attr('fill', '#EBE9E3');
      
      // Add background rect with dotted pattern
      svgSelection.insert('rect', ':first-child')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'url(#dotGrid)')
        .attr('opacity', 1);  // Increased opacity since dots are subtle
      
      // Create main group
      mainGroup = svgSelection.append('g');
      console.log("mainGroup created:", mainGroup);
      
      // Apply zoom behavior
      svgSelection.call(zoom);
        
      // Center the view initially
      const initialTransform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(1.135);
      
      svgSelection.call(zoom.transform, initialTransform);
      console.log("Initial transform applied:", initialTransform);
      
      initialized = true;
      
      // Force a Svelte update to ensure the slot content renders
      await tick();
    } catch (error) {
      console.error("Error initializing InfiniteCanvasWrapper:", error);
    }
  }

  onMount(async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    if (!svg) {
      console.error("SVG element not available");
      return;
    }
    
    // Initialize the canvas
    await initializeCanvas();
    
    // Add resize observer
    if (container && typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
        
        // Update SVG dimensions
        if (svg) {
          const svgSelection = d3.select<SVGSVGElement, unknown>(svg);
          svgSelection
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);
        }
      });
      
      resizeObserver.observe(container);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  });

  // Function to reset zoom/pan
  export function resetView() {
    if (svg) {
      console.log("Resetting view");
      const svgSelection = d3.select<SVGSVGElement, unknown>(svg);
      svgSelection.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(1)
        );
    }
  }

  // Tooltip functions
  function clearTooltipTimeout() {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }
  }

  export function showTooltip(event: MouseEvent | FocusEvent, data: any, isCompany = false) {
    clearTooltipTimeout();
    
    // Get the event coordinates in page space
    let pageX = 0;
    let pageY = 0;
    
    if (event instanceof MouseEvent) {
      // Handle mouse event
      pageX = event.pageX || event.clientX;
      pageY = event.pageY || event.clientY;
    } else {
      // Handle focus event - use target's position
      if (event.target) {
        const targetRect = (event.target as Element).getBoundingClientRect();
        pageX = targetRect.left + window.scrollX + targetRect.width/2;
        pageY = targetRect.top + window.scrollY + targetRect.height/2;
      }
    }
    
    // Position tooltip with a small offset from the cursor
    tooltipX = pageX + tooltipOffset.x;
    tooltipY = pageY + tooltipOffset.y;
    
    // Set tooltip content
    if (isCompany) {
      tooltipContent = {
        sponsor: data.company || data.Company || '',
        drugName: '',
        therapeuticArea: '',
        id: data.totalDrugs ? `${data.totalDrugs} drugs in pipeline` : ''
      };
      tooltipBorderColor = data.color || '#549E7D';
    } else {
      tooltipContent = {
        sponsor: data.Company || '',
        drugName: data.Candidate || '',
        therapeuticArea: data.TherapeuticArea1 || '',
        id: data["Current Development Stage"] || ''
      };
      tooltipBorderColor = data.color || '#549E7D';
    }
    
    // Force tooltip to be visible
    tooltipVisible = true;
    
    // Dispatch event for parent components
    dispatch('tooltipShow', { content: tooltipContent, isCompany });
  }

  export function hideTooltip() {
    clearTooltipTimeout();
    
    tooltipTimeout = setTimeout(() => {
      tooltipVisible = false;
      tooltipTimeout = null;
      
      // Dispatch event for parent components
      dispatch('tooltipHide');
    }, 100);
  }

  // Update dimensions when container is available
  $: if (container && !initialized) {
    updateDimensions();
    initializeCanvas();
  }
</script>

<div class="infinite-canvas-container" bind:this={container}>
  <svg
    bind:this={svg}
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    class="w-full h-full"
  >
    <slot {mainGroup} {showTooltip} {hideTooltip} />
  </svg>
  
  <!-- Tooltip component -->
  <div 
    class="tooltip-container" 
    style="left: {tooltipX}px; top: {tooltipY}px; pointer-events: none;"
  >
    <RPDTooltip 
      visible={tooltipVisible} 
      content={tooltipContent} 
      borderColor={tooltipBorderColor} 
    />
  </div>
  
  <!-- Navigation controls moved to top left and arranged vertically -->
  <div class="navigation-controls">
    <button on:click={zoomIn} class="nav-button" title="Zoom In">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    </button>
    <button on:click={zoomOut} class="nav-button" title="Zoom Out">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
      </svg>
    </button>
    <button on:click={resetView} class="nav-button" title="Reset View">
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .infinite-canvas-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #fafafa;
    position: relative;
  }

  svg {
    cursor: grab;
  }

  :global(svg:active) {
    cursor: grabbing;
  }

  .tooltip-container {
    position: fixed;
    z-index: 1000;
  }

  /* Updated navigation controls styles for vertical layout on top left */
  .navigation-controls {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    flex-direction: column;
    border: 1px solid #549E7D;
    gap: 8px;
    background: white;
    padding: 8px;
    border-radius: 5.245px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-button {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 100px;
    background: white;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .nav-button:hover {
    background: #549E7D;
    color: white;
  }

  .nav-button:active {
    background: #e0e0e0;
    transform: translateX(1px);
  }
</style>
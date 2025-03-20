<script lang="ts">
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import RPDTooltip from '$lib/RPDComponents/RPDTooltip.svelte';

  // Use default values instead of window properties for SSR compatibility
  export let width = 1200;
  export let height = width;
  
  // Export className to accept custom CSS classes
  export let className = '';
  
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
      const isMobile = window.innerWidth < 768;
      
      // Get the parent container's dimensions
      const parentHeight = container.parentElement ? container.parentElement.getBoundingClientRect().height : window.innerHeight;
      
      // Set width based on container width
      width = rect.width || width;
      
      // Set height with a minimum value to prevent shrinking too much
      if (isMobile) {
        // On mobile, use 80vh as minimum height
        height = Math.max(parentHeight, window.innerHeight * 0.8) || height;
      } else {
        // On desktop, use parent height with a minimum of 60vh
        height = Math.max(parentHeight, window.innerHeight * 0.6) || height;
      }
      
      console.log("Container dimensions:", width, height, "isMobile:", isMobile, "parentHeight:", parentHeight);
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

  onMount(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    if (!svg) {
      console.error("SVG element not available");
      return;
    }
    
    // Initialize the canvas
    initializeCanvas();
    
    // Add resize observer
    if (container && typeof ResizeObserver !== 'undefined') {
      let prevWidth = width;
      let prevHeight = height;
      
      const resizeObserver = new ResizeObserver(() => {
        const oldWidth = width;
        const oldHeight = height;
        
        updateDimensions();
        
        // Update SVG dimensions
        if (svg) {
          const svgSelection = d3.select<SVGSVGElement, unknown>(svg);
          svgSelection
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);
            
          // If size changed significantly (over 20%), adjust the view
          const widthChange = Math.abs(width - prevWidth) / prevWidth;
          const heightChange = Math.abs(height - prevHeight) / prevHeight;
          
          if (widthChange > 0.2 || heightChange > 0.2) {
            console.log("Significant size change detected, resetting view");
            // Save current transform scale
            const currentScale = transform.k;
            
            // Reset view with current scale
            setTimeout(() => {
              resetView();
            }, 100);
            
            // Update previous dimensions
            prevWidth = width;
            prevHeight = height;
          }
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

<div 
  bind:this={container} 
  class="infinite-canvas-container {className}" 
  style="width: 100%; height: 100%; position: relative; overflow: hidden;"
>
  <!-- SVG canvas for visualization -->
  <svg 
    bind:this={svg} 
    width="100%" 
    height="100%"
    viewBox="0 0 {width} {height}" 
    preserveAspectRatio="xMidYMid meet"
    style="display: block; touch-action: none;"
  >
    <slot {mainGroup} {showTooltip} {hideTooltip} />
  </svg>
  
  <!-- Tooltip component -->
  <div 
    class="tooltip-container" 
    style="position: absolute; left: {tooltipX}px; top: {tooltipY}px; pointer-events: none; z-index: 1000;"
  >
    <RPDTooltip 
      visible={tooltipVisible} 
      content={tooltipContent} 
      borderColor={tooltipBorderColor} 
    />
  </div>
  
  <!-- Controls for mobile -->
  <div class="controls absolute bottom-8 right-8 flex space-x-2">
    <button 
      class="zoom-in bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md text-slate-700 hover:bg-slate-50"
      on:click={zoomIn}
      aria-label="Zoom In"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="11" y1="8" x2="11" y2="14"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
    </button>
    <button 
      class="zoom-out bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md text-slate-700 hover:bg-slate-50"
      on:click={zoomOut}
      aria-label="Zoom Out"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
    </button>
    <button 
      class="reset-view bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-md text-slate-700 hover:bg-slate-50"
      on:click={resetView}
      aria-label="Reset View"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    </button>
  </div>
</div>

<style>
  :global(.infinite-canvas-container) {
    width: 100%;
    height: 100%;
  }
  
  .controls {
    z-index: 10;
  }
  
  /* Ensure the canvas fills parent container */
  @media (max-width: 768px) {
    .controls {
      bottom: 20px;
      right: 20px;
    }
  }
</style>
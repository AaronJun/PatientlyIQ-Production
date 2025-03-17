<script lang="ts">
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import RPDTooltip from '$lib/RPDComponents/RPDTooltip.svelte';

  // Use default values instead of window properties for SSR compatibility
  export let width = 1200;
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

<div class="infinite-canvas-container" bind:this={container}>  
  
  <svg
    bind:this={svg}
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    preserveAspectRatio="xMidYMid meet"
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
      <svg viewBox="0 0 24 24" width="12" height="12">
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
    min-height: 60vh; /* Add minimum height for small screens */
    overflow: hidden;
    background-color: #fafafa;
    position: relative;
  }

  @media (max-width: 768px) {
    .infinite-canvas-container {
      min-height: 80vh; /* Increase min-height on mobile to ensure it displays properly */
      height: 100vh; /* Set explicit height for mobile devices */
    }
  }

  svg {
    cursor: grab;
    width: 100%;
    height: 100%;
    min-height: inherit; /* Inherit the minimum height from the container */
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
    top: 52px;
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
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 10px;
    background: white;
    padding: 2px;
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
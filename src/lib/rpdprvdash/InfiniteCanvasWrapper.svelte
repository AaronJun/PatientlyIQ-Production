<script lang="ts">
  import { onMount, tick, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import RPDTooltip from '$lib/RPDComponents/RPDTooltip.svelte';
  import { fixMobileTouchSupport } from './utils/svg-utils';

  // Use default values instead of window properties for SSR compatibility
  export let width = 1200;
  export let height = width;
  
  // Export className to accept custom CSS classes
  export let className = '';
  export let isCollapsed: boolean = false;
  let isHovered: boolean = false;
  let isTouchDevice = false;

  
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

  // Navigation control functions - exported for external use
  export function zoomIn() {
    if (svg) {
      const svgSelection = d3.select<SVGSVGElement, unknown>(svg);
      svgSelection.transition()
        .duration(300)
        .call(zoom.scaleBy, 1.3);
    }
  }

  export function zoomOut() {
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
      
      // Apply zoom behavior with touch event support
      svgSelection
        .call(zoom)
        .on("touchstart", handleTouchStart, { passive: false })
        .on("touchmove", handleTouchMove, { passive: false })
        .on("touchend", handleTouchEnd, { passive: false });
        
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

  // Touch event handlers to prevent default behavior and allow canvas interaction
  function handleTouchStart(event: TouchEvent) {
    // Mark as touch device when touch events are used
    if (!isTouchDevice) {
      isTouchDevice = true;
    }
    
    // Prevent default scroll behavior on touch
    event.preventDefault();
    event.stopPropagation();
  }

  function handleTouchMove(event: TouchEvent) {
    // Prevent default scroll behavior on touch
    event.preventDefault();
    event.stopPropagation();
  }

  function handleTouchEnd(event: TouchEvent) {
    // Prevent default behavior that might interfere with pan/zoom
    event.preventDefault();
    event.stopPropagation();
  }

  // Allow wheel events for desktop zooming but prevent them from scrolling the page
  function handleWheel(event: WheelEvent) {
    // Prevent the default scrolling behavior
    event.preventDefault();
  }

  onMount(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    if (!svg) {
      console.error("SVG element not available");
      return;
    }
    
    // Check if we're on a touch device
    isTouchDevice = 'ontouchstart' in window || 
                  navigator.maxTouchPoints > 0 ||
                  (navigator as any).msMaxTouchPoints > 0;
    
    console.log("InfiniteCanvasWrapper mounted, isTouchDevice:", isTouchDevice);
    
    // Apply mobile touch fixes to SVG and container
    fixMobileTouchSupport(svg, container);
    
    // Initialize the canvas
    initializeCanvas();
    
    // Add touch event handlers to the container
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
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
        
        // Remove event listeners when component is destroyed
        if (container) {
          container.removeEventListener('touchstart', handleTouchStart);
          container.removeEventListener('touchmove', handleTouchMove);
          container.removeEventListener('touchend', handleTouchEnd);
          container.removeEventListener('wheel', handleWheel);
        }
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

  function handleHowToNavigateClick() {
    dispatch('howToNavigate');
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
  style="width: 100%; height: 100%; position: relative; overflow: hidden; touch-action: none; -webkit-overflow-scrolling: none;"
>
  <!-- SVG canvas for visualization -->
  <svg 
    bind:this={svg} 
    width="100%" 
    height="100%"
    viewBox="0 0 {width} {height}" 
    preserveAspectRatio="xMidYMid meet"
    style="display: block; touch-action: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; pointer-events: all;"
    data-touch-device={isTouchDevice}
  >
    <slot {mainGroup} {showTooltip} {hideTooltip} />
  </svg>
  
  <!-- Tooltip component -->
  <div 
    class="tooltip-container" 
    style="position: absolute; left: {tooltipX}px; top: {tooltipY}px; pointer-events: none; z-index: 10;"
  >
    <RPDTooltip 
      visible={tooltipVisible} 
      content={tooltipContent} 
      borderColor={tooltipBorderColor} 
    />
  </div>
</div>
  
  
<style>
  :global(.infinite-canvas-container) {
    width: 100%;
    height: 100%;
    z-index: 0;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  /* Ensure the canvas fills parent container and position controls for mobile */
  @media (max-width: 768px) {
    /* Mobile-specific styles */
    :global(.infinite-canvas-container svg) {
      touch-action: none !important;
    }
  }
</style>

      
<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let width = window.innerWidth;
  export let height = window.innerHeight;
  
  let svg: SVGSVGElement;
  let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let transform = d3.zoomIdentity;
  let container: HTMLDivElement;

  // Initialize zoom behavior with proper typing
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
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
      width = rect.width;
      height = rect.height;
      console.log("Container dimensions:", width, height);
    }
  }

  onMount(() => {
    if (!svg) {
      console.error("SVG element not available");
      return;
    }
    
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
    
    // Add resize observer
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
      
      // Update SVG dimensions
      svgSelection
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    });
    
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
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
</script>

<div class="infinite-canvas-container" bind:this={container}>
  <svg
    bind:this={svg}
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    class="w-full h-full"
  >
    {#if mainGroup}
      <slot {mainGroup} />
    {/if}
  </svg>
  
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

  .navigation-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 8px;
    background: white;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-button {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 4px;
    background: white;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .nav-button:hover {
    background: #f0f0f0;
    color: #333;
  }

  .nav-button:active {
    background: #e0e0e0;
    transform: translateY(1px);
  }
</style> 
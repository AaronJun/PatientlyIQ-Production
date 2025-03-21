<!-- SponsorWrapper.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { ChevronRight, ChevronLeft } from 'carbon-icons-svelte';
  
  import RPDPRVHorizontalTimeline from '../RPDPRVTimeline.svelte';
  import RpdprvCompanyTree from '../RadialComponents/RPDPRVCompanyTree.svelte';
  import RpdprvSearch from '../RPDPRVSearch.svelte';
  import RPDRadialLegend from '../RPDRadialLegend.svelte';
  import SponsorSidebar from '../sidebarComponents/SponsorSidebar.svelte';
  import MobileSponsorSidebar from '../sidebarComponents/MobileSponsorSidebar.svelte';
  import InfiniteCanvasWrapper from '../InfiniteCanvasWrapper.svelte';
  import CanvasNavControls from '../sidebarComponents/CanvasNavControls.svelte';
  
  // Define interfaces
  interface CompanyHoverData {
    entries?: any[];
    areaName?: string;
    totalDrugs?: number;
    uniqueCompanies?: number;
    uniqueCandidates?: number;
    companyName?: string;
    clinicalTrials?: number;
    vouchersAwarded?: number;
    uniqueIndications?: number;
    uniqueAreas?: number;
  }
  
  // Props
  export let data: any[] = []; // Full dataset
  export let filteredData: any[] = []; // Data filtered by year
  export let selectedYear: string = "All";
  export let isSidebarCollapsed: boolean = true;
  export let isMobileView: boolean = false;
  export let onShowDrugDetail: (detail: any) => void = () => {};
  export let onShowCompanyDetail: (detail: any) => void = () => {};
  export let onShowTherapeuticAreaDetail: (detail: any) => void = () => {};
  export let onYearSelect: (year: string) => void = () => {};
  export let onHowToNavigate: () => void = () => {};
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // State variables
  let isRightSidebarCollapsed = false;
  let isMobileSidebarExpanded = false;
  let infiniteCanvas: { resetView: () => void; zoomIn?: () => void; zoomOut?: () => void; };
  let hoveredTherapeuticArea = "";
  let currentEntries: any[] = [];
  let currentView: string | null = null;
  let currentCompanyMetrics: any | null = null;
  let currentArea: string | null = null;
  let areaMetrics: any | null = null;
  let isCanvasActive = false; // Track if user is interacting with canvas
  
  // Add a change detection mechanism
  let previousFilteredDataLength = 0;
  
  // Track transform changes to detect continuous scrolling
  let lastTransform = '';
  let consecutiveTransforms = 0;
  let transformCheckInterval: ReturnType<typeof setInterval> | null = null;
  
  // Process data for the legend
  const processedData = Object.entries(
    data.reduce((acc, d) => {
      if (d.TherapeuticArea1) {
        acc[d.TherapeuticArea1] = (acc[d.TherapeuticArea1] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([area, count]) => ({ area, count: count as number }));
  
  // Define the therapeutic area color map
  const colorMap = {
    'Neurology': '#FF6B6B',
    'Neuromuscular': '#E63946',
    'Oncology': '#38B2AC',
    'Metabolic': '#667EEA',
    'Ophthalmology': '#68D391',
    'Cardiovascular': '#F6AD55',
    'Pulmonology': '#B794F4',
    'Hematology': '#48BB78',
    'Endocrinology': '#F59E0B',
    'Genetic': '#0BC5EA',
    'Immunology': '#E53E3E',
    'Gastroenterology': '#ECC94B',
    'Hepatology': '#9AE6B4',
    'Dermatology': '#FC8181',
    'Neonatology': '#76E4F7',
    'Urology': '#9F7AEA'
  };
  
  const colorScale = (area: string) => {
    const key = area as keyof typeof colorMap;
    return colorMap[key] || '#999999';
  };
  
  // Functions
  function handleCompanyHover(data: CompanyHoverData | any[]) {
    if (Array.isArray(data)) {
      // Old format - just array of entries
      currentEntries = data;
      currentView = 'Company View';
      currentCompanyMetrics = null;
      currentArea = null;
      areaMetrics = null;
      // Try to get therapeutic area from first entry
      hoveredTherapeuticArea = data.length > 0 ? data[0].TherapeuticArea1 || "" : "";
    } else if (data.entries && data.areaName) {
      // New format with therapeutic area metrics
      currentEntries = data.entries;
      currentArea = data.areaName;
      areaMetrics = {
        totalDrugs: data.totalDrugs || data.entries.length,
        uniqueCompanies: data.uniqueCompanies || new Set(data.entries.map((d: any) => d.Company)).size,
        uniqueCandidates: data.uniqueCandidates || new Set(data.entries.map((d: any) => d.Candidate)).size
      };
      currentView = 'Area View';
      currentCompanyMetrics = null;
      hoveredTherapeuticArea = data.areaName;
    } else if (data.entries) {
      // Company format with additional metrics
      currentEntries = data.entries;
      currentCompanyMetrics = {
        companyName: data.companyName || (data.entries.length > 0 ? data.entries[0].Company : 'Unknown'),
        totalDrugs: data.totalDrugs || data.entries.length,
        clinicalTrials: data.clinicalTrials || 0,
        vouchersAwarded: data.vouchersAwarded || 0,
        uniqueIndications: data.uniqueIndications || new Set(data.entries.map((d: any) => d.Indication)).size,
        uniqueAreas: data.uniqueAreas || new Set(data.entries.map((d: any) => d.TherapeuticArea1)).size
      };
      currentView = 'Company View';
      currentArea = null;
      areaMetrics = null;
      // Try to get most common therapeutic area from entries
      const areaCounter: Record<string, number> = {};
      data.entries.forEach((entry: any) => {
        if (entry.TherapeuticArea1) {
          areaCounter[entry.TherapeuticArea1] = (areaCounter[entry.TherapeuticArea1] || 0) + 1;
        }
      });
      // Find the most common area
      hoveredTherapeuticArea = Object.entries(areaCounter)
        .sort((a, b) => b[1] - a[1])
        .map(([area]) => area)[0] || "";
    }
  }
  
  function handleStageHover(entries: any[]) {
    currentEntries = entries;
    currentView = 'Stage View';
    // Reset company metrics when viewing stages
    currentCompanyMetrics = null;
    currentArea = null;
    areaMetrics = null;
    
    // Extract and count therapeutic areas from entries
    const areaCounter: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.TherapeuticArea1) {
        areaCounter[entry.TherapeuticArea1] = (areaCounter[entry.TherapeuticArea1] || 0) + 1;
      }
    });
    // Find the most common area
    hoveredTherapeuticArea = Object.entries(areaCounter)
      .sort((a, b) => b[1] - a[1])
      .map(([area]) => area)[0] || "";
  }
  
  function handleLeave() {
    // Keep the current view if we want to persist data
    // Reset hovered area when mouse leaves
    hoveredTherapeuticArea = "";
  }
  
  function resetSidebarView() {
    currentEntries = [];
    currentView = null;
    currentCompanyMetrics = null;
    currentArea = null;
    areaMetrics = null;
    hoveredTherapeuticArea = "";
  }
  
  function toggleRightSidebar() {
    isRightSidebarCollapsed = !isRightSidebarCollapsed;
  }
  
  function handleLegendAreaClick(area: string) {
    // Find entries for this therapeutic area
    const areaEntries = filteredData.filter(d => d.TherapeuticArea1 === area);
    
    // Calculate metrics for this area
    const uniqueCompanies = new Set(areaEntries.map(d => d.Company)).size;
    const uniqueCandidates = new Set(areaEntries.map(d => d.Candidate)).size;
    const indications = new Set(areaEntries.filter(d => d.Indication).map(d => d.Indication));
    
    // Count clinical trials (phases 1-3)
    const clinicalTrials = areaEntries.filter(d => 
      d["Current Development Stage"]?.startsWith("P1") || 
      d["Current Development Stage"]?.startsWith("P2") || 
      d["Current Development Stage"]?.startsWith("P3")
    ).length;
    
    // Count vouchers awarded
    const vouchersAwarded = areaEntries.filter(d => 
      d["PRV Status"] === "PRV Awarded" || d["PRV Year"]
    ).length;
    
    // Create detail object for the drawer
    const areaDetail = {
      areaName: area,
      entries: areaEntries,
      totalDrugs: areaEntries.length,
      uniqueCompanies,
      uniqueCandidates,
      clinicalTrials,
      vouchersAwarded,
      indications
    };
    
    // Call the onShowTherapeuticAreaDetail handler
    onShowTherapeuticAreaDetail(areaDetail);
  }
  
  afterUpdate(() => {
    // Check if filtered data has changed
    if (filteredData && filteredData.length !== previousFilteredDataLength) {
      previousFilteredDataLength = filteredData.length;
      
      // If the canvas is initialized, reset the view to prevent drift
      if (infiniteCanvas && infiniteCanvas.resetView) {
        // Use setTimeout to ensure this happens after rendering
        setTimeout(() => {
          infiniteCanvas.resetView();
        }, 100);
      }
    }
  });
  
  onMount(() => {
    // Check if we're in mobile view
    const checkMobileView = () => {
      isMobileView = window.innerWidth < 768; // 768px is the md breakpoint in Tailwind
    };
    
    // Initial check
    checkMobileView();
    
    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    
    // Initialize any necessary setup
    if (isMobileView) {
      // Add event listeners for canvas interaction on mobile
      document.addEventListener('touchstart', handleTouchInteraction, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      window.removeEventListener('resize', checkMobileView);
      
      // Clean up transform check interval
      if (transformCheckInterval) {
        clearInterval(transformCheckInterval);
        transformCheckInterval = null;
      }
      // Clean up event listeners
      if (isMobileView) {
        document.removeEventListener('touchstart', handleTouchInteraction);
        document.removeEventListener('touchend', handleTouchEnd);
      }
      // Remove body class if component is destroyed while active
      document.body.classList.remove('canvas-active');
    };
  });

  // Handle touch interaction detection
  function handleTouchInteraction(event: TouchEvent) {
    // Only capture events inside our canvas
    const path = event.composedPath();
    const isCanvasTouch = path.some(el => {
      const element = el as HTMLElement;
      return element.classList && 
        (element.classList.contains('sponsor-infinite-canvas') || 
         element.classList.contains('infinite-canvas-container'));
    });

    if (isCanvasTouch) {
      handleCanvasInteractionStart();
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    // Always end interaction on touch end
    handleCanvasInteractionEnd();
  }

  // Add functions to handle canvas interaction for mobile devices
  function handleCanvasInteractionStart() {
    if (isMobileView) {
      isCanvasActive = true;
      document.body.classList.add('canvas-active');
    }
  }

  function handleCanvasInteractionEnd() {
    if (isMobileView) {
      isCanvasActive = false;
      document.body.classList.remove('canvas-active');
    }
  }

  // Handler functions for canvas navigation 
  function handleZoomIn() {
    if (infiniteCanvas && infiniteCanvas.zoomIn) {
      infiniteCanvas.zoomIn();
    }
  }
  
  function handleZoomOut() {
    if (infiniteCanvas && infiniteCanvas.zoomOut) {
      infiniteCanvas.zoomOut();
    }
  }
  
  function handleResetView() {
    if (infiniteCanvas && infiniteCanvas.resetView) {
      infiniteCanvas.resetView();
    }
  }

  function handleHowToNavigate() {
    onHowToNavigate();
  }
</script>

<svelte:head>
  <script>
    // This script attempts to override any problematic d3 zoom behaviors
    document.addEventListener('DOMContentLoaded', () => {
      // Wait for the sponsor tab to be active
      const checkAndFixZoom = () => {
        const sponsorCanvas = document.querySelector('.sponsor-infinite-canvas');
        if (sponsorCanvas) {
          // Look for SVG
          const svg = sponsorCanvas.querySelector('svg');
          if (svg && window.d3) {
            // Ensure SVG has proper cursor and pointer events
            svg.style.cursor = 'grab';
            svg.style.pointerEvents = 'all';
          }
        }
      };
      
      // Try to fix zoom after the canvas is likely to be rendered
      setTimeout(checkAndFixZoom, 1000);
    });
  </script>
</svelte:head>

<div class="sponsor-tab-content flex flex-row flex-grow relative h-full"
     on:touchstart={handleCanvasInteractionStart}
     on:touchend={handleCanvasInteractionEnd}
     on:touchcancel={handleCanvasInteractionEnd}>
     
  <div class="w-full h-full items-center relative">
    <div class="timeline-container fixed justify-center place-items-start w-full z-20 bg-slate-100 transition-all duration-300">
      <RPDPRVHorizontalTimeline 
        data={data}
        selectedYear={selectedYear}
        onYearSelect={onYearSelect}
      />
    </div>
    
    {#if isMobileView}
      <div class="mobile-hint fixed z-10 top-20 left-1/2 transform -translate-x-1/2 text-emerald-800 px-4 py-2 rounded-full ring-1 ring-emerald-400 ring-offset-2 shadow-md text-xs font-medium" transition:fade={{ duration: 300 }}>
        Use two fingers to zoom & pan the chart
      </div>
    {/if}
    
    <InfiniteCanvasWrapper 
      bind:this={infiniteCanvas} 
      let:mainGroup 
      let:showTooltip 
      let:hideTooltip
      on:howToNavigate={onHowToNavigate}
      isCollapsed={isSidebarCollapsed} 
      className="sponsor-infinite-canvas w-full h-[calc(100vh-150px)] mt-16 overflow-hidden"
    >
      {#if mainGroup}
        <RpdprvCompanyTree 
          data={filteredData}
          isAllYearView={selectedYear === "All"}
          onCompanyHover={handleCompanyHover}
          onStageHover={handleStageHover}
          onLeave={handleLeave}
          onShowDrugDetail={onShowDrugDetail}
          onShowCompanyDetail={onShowCompanyDetail}
          {mainGroup}
          {showTooltip}
          {hideTooltip}
        />
      {:else}
        <!-- Loading spinner -->
        <g transform="translate(460, 460)">
          <circle r="40" fill="none" stroke="#e2e8f0" stroke-width="8"></circle>
          <path 
            d="M40 0 A40 40 0 0 1 40 0" 
            fill="none" 
            stroke="#3b82f6" 
            stroke-width="8" 
            stroke-linecap="round"
          >
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              from="0" 
              to="360" 
              dur="1s" 
              repeatCount="indefinite"
            />
          </path>
        </g>
      {/if}
    </InfiniteCanvasWrapper>
  </div>

    <div 
      class="sidebar-area fixed top-16 bottom-0 right-0 z-10 flex flex-col transition-all duration-300 cubic-in-out pt-8 pb-4 shadow-md bg-slate-50/90 backdrop-blur-sm"
      class:w-96={!isRightSidebarCollapsed}
      class:w-7={isRightSidebarCollapsed}
      transition:slide={{ duration: 300, axis: 'x' }}
    >
      <div class="sidebar-controls-area absolute top-32 -left-12 z-40 flex flex-col gap-4">
        <!-- Toggle button -->
    <button 
      class="nav-button bg-slate-50 ring-2 ring-emerald-300 ring-offset-2 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-emerald-300"
          on:click={toggleRightSidebar}
          aria-label={isRightSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svelte:component this={isRightSidebarCollapsed ? ChevronLeft : ChevronRight} class="w-4 h-4 `text-slate-500"/>
        </button>
        
        <!-- Canvas navigation controls -->
        <CanvasNavControls 
          orientation="vertical"
          isCollapsed={isRightSidebarCollapsed}
          isTouchDevice={isMobileView}
          on:zoomIn={handleZoomIn}
          on:zoomOut={handleZoomOut}
          on:resetView={handleResetView}
          on:howToNavigate={handleHowToNavigate}
        />
      </div>
      
      <div class="flex flex-col h-full w-full overflow-hidden">
        <!-- Search component -->
        {#if !isRightSidebarCollapsed}
          <div class="px-3 flex-none z-10">
            <RpdprvSearch
              data={data}
              onShowDrugDetail={onShowDrugDetail}
              onShowCompanyDetail={onShowCompanyDetail}
            />
          </div>
          
          <!-- Sidebar content -->
          <div class="scrollbar-thin overflow-y-auto flex-grow mt-4 px-3">
            <SponsorSidebar 
              {currentView} 
              {currentEntries} 
              {currentCompanyMetrics}
              {colorMap}
              {onShowDrugDetail}
              fullYearData={filteredData}
              selectedYear={selectedYear}
              isCollapsed={isRightSidebarCollapsed}
            />
          </div>
          
          <div class="legend-container flex-none mt-6 pb-4">
            <RPDRadialLegend 
              items={processedData.map(item => ({
                ...item,
                yearCount: selectedYear === "All" ? 
                  item.count : 
                  filteredData.filter(d => d.TherapeuticArea1 === item.area).length
              }))}
              selectedYear={selectedYear}
              showYearCounts={selectedYear !== "All"}
              hoveredArea={hoveredTherapeuticArea}
              on:areaHover={(e) => hoveredTherapeuticArea = e.detail.area}
              on:areaLeave={() => hoveredTherapeuticArea = ""}
              on:areaClick={(e) => handleLegendAreaClick(e.detail.area)}
              {colorScale}
            />
          </div>
        {/if}
      </div>
    </div>
  
</div>

<style>
  .legend-container {
    border-top: .5px solid #549E7D;
  }

  .timeline-container {
    border-bottom: .5px solid #549E7D;
    z-index: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Fix for continuous scrolling - keeping minimal styles that don't affect panning */
  :global(.sponsor-infinite-canvas svg) {
    cursor: grab;
  }
  
  :global(.sponsor-infinite-canvas svg:active) {
    cursor: grabbing;
  }
  
  /* Mobile view adjustments */
  @media (max-width: 768px) {
    /* Mobile specific styles */
    :global(.infinite-canvas-container) {
      height: calc(100vh - 200px) !important;
    }
  }
  
  @media (min-width: 769px) and (max-width: 1200px) {
    /* Tablet specific styles */
    :global(.infinite-canvas-container) {
      height: calc(100vh - 160px) !important;
    }
  }
  
  @media (min-width: 1201px) {
    /* Desktop specific styles */
    :global(.infinite-canvas-container) {
      height: calc(100vh - 150px) !important;
    }
  }
  
  /* Custom scrollbar styles with Safari support */
  :global(.scrollbar-thin::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }

  :global(.scrollbar-thin::-webkit-scrollbar-track) {
    background: #e5e7eb;
    border-radius: 3px;
  }

  :global(.scrollbar-thin::-webkit-scrollbar-thumb) {
    background-color: #94a3b8;
    border-radius: 3px;
    transition: background-color 0.2s;
  }

  :global(.scrollbar-thin::-webkit-scrollbar-thumb:hover) {
    background-color: #64748b;
  }

  /* Firefox scrollbar styles */
  :global(.scrollbar-thin) {
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 #e5e7eb;
  }

  /* Mobile hint message styling */
  .mobile-hint {
    animation: fade-out 5s ease-in-out forwards;
    backdrop-filter: blur(4px);
    max-width: 90%;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
    border: 1px solid #10b981;
  }
  
  @keyframes fade-out {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; visibility: hidden; }
  }
  
  /* Add responsive sizing for canvas containers */
  @media (max-width: 768px) {
    /* Mobile specific styles */
    :global(.sponsor-wrapper .infinite-canvas-container) {
      height: calc(100vh - 200px) !important;
      touch-action: none !important;
      -webkit-overflow-scrolling: none !important;
    }
    
    /* Ensure the SVG fills the entire container on mobile */
    :global(.sponsor-infinite-canvas svg) {
      width: 100% !important;
      height: 100% !important;
      touch-action: none !important;
    }
    
    /* Prevent parent scrolling on mobile when interacting with canvas */
    :global(body.canvas-active) {
      overflow: hidden !important;
      position: fixed;
      width: 100%;
      height: 100%;
    }
  }
  
  @media (min-width: 769px) and (max-width: 1200px) {
    /* Tablet specific styles */
    :global(.sponsor-wrapper .infinite-canvas-container) {
      height: calc(100vh - 160px) !important;
      touch-action: none;
    }
  }
  
  /* Safari-specific fixes */
  @supports (-webkit-touch-callout: none) {
    /* CSS specific to iOS devices and Safari */
    :global(.sponsor-infinite-canvas) {
      -webkit-user-select: none;
      user-select: none;
      touch-action: none !important;
    }
  }
</style> 
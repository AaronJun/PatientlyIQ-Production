<!-- TherapeuticAreaWrapper.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { ChevronRight, ChevronLeft } from 'carbon-icons-svelte';
  
  import RPDPRVHorizontalTimeline from '../RPDPRVTimeline.svelte';
  import RPDDRadialYear from '../RPDPRVTherapeuticAreaChart.svelte';
  import RpdprvSearch from '../RPDPRVSearch.svelte';
  import RPDRadialLegend from '../RPDRadialLegend.svelte';
  import TherapeuticAreaSidebar from '../sidebarComponents/TherapeuticAreaSidebar.svelte';
  import MobileTherapeuticAreaSidebar from '../sidebarComponents/MobileTherapeuticAreaSidebar.svelte';
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
  export let isTabletView: boolean = false;
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
  let infiniteCanvas: { resetView: () => void; zoomIn: () => void; zoomOut: () => void; };
  let hoveredTherapeuticArea = "";
  let currentEntries: any[] = [];
  let currentView: string | null = null;
  let currentCompanyMetrics: any | null = null;
  let currentArea: string | null = null;
  let areaMetrics: any | null = null;
  let isCanvasActive = false; // Track if user is interacting with canvas
  let isTouchDevice = false; // Track if we're on a touch device
  
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
  
  function toggleRightSidebar() {
    isRightSidebarCollapsed = !isRightSidebarCollapsed;
  }
  
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
    
    // Notify parent to open the therapeutic area drawer
    onShowTherapeuticAreaDetail(areaDetail);
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

  onMount(() => {
    // Check if we're on a touch device
    isTouchDevice = 'ontouchstart' in window || 
                   navigator.maxTouchPoints > 0 ||
                   (navigator as any).msMaxTouchPoints > 0;
                   
    // Initialize any necessary setup
    if (isMobileView) {
      // Add event listeners for canvas interaction on mobile
      document.addEventListener('touchstart', handleTouchInteraction, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
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
        (element.classList.contains('therapeutic-area-canvas') || 
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

<div class="therapeutic-area-wrapper flex flex-row flex-grow relative h-full"
     on:touchstart={handleCanvasInteractionStart}
     on:touchend={handleCanvasInteractionEnd}
     on:touchcancel={handleCanvasInteractionEnd}>

  <div class="w-full h-full items-center relative">
    <div class="timeline-container fixed justify-center place-items-start w-full z-20 bg-slate-100 transition-all duration-300">
      <RPDPRVHorizontalTimeline 
        data={data}
        {selectedYear}
        onYearSelect={onYearSelect}
      />
    </div>
    
    {#if isMobileView}
    <div class="mobile-hint fixed z-50 top-20 left-1/2 transform -translate-x-1/2 text-emerald-800 px-4 py-2 rounded-full ring-1 ring-emerald-400 ring-offset-2 shadow-md text-xs font-medium" 
    transition:fade={{ duration: 300 }}>
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
      className="therapeutic-area-canvas w-full h-[calc(100vh-150px)] mt-16 overflow-hidden"
      >
      {#if mainGroup}
        <RPDDRadialYear 
          data={filteredData}
          isAllYearView={selectedYear === "All"}
          onCompanyHover={handleCompanyHover}
          onStageHover={handleStageHover}
          onLeave={handleLeave}
          onShowDrugDetail={onShowDrugDetail}
          onShowCompanyDetail={onShowCompanyDetail}
          onShowTherapeuticAreaDetail={onShowTherapeuticAreaDetail}
          {mainGroup}
          {showTooltip}
          {hideTooltip}
          hoveredTherapeuticArea={hoveredTherapeuticArea}
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

  <!-- Desktop right information sidebar - only show on non-mobile -->
  {#if !isMobileView}
    <div 
      class="sidebar-area fixed top-16 bottom-0 right-0 z-30 flex flex-col transition-all duration-300 ease-in-out pt-20 pb-4 shadow-md bg-slate-50/80 backdrop-blur-sm"
      class:w-64={!isRightSidebarCollapsed}
      class:w-7={isRightSidebarCollapsed}
      transition:slide={{ duration: 300, axis: 'x' }}
    >
      <div class="sidebar-controls-area absolute top-32 -left-12 z-40 flex flex-col gap-4">
        <!-- Toggle button -->
        <button 
          class="sidebar-toggle bg-slate-100 p-2 rounded-full shadow-md hover:bg-slate-200 transition-all ring-1 ring-slate-200"
          on:click={toggleRightSidebar}
          aria-label={isRightSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svelte:component this={isRightSidebarCollapsed ? ChevronLeft : ChevronRight} size={16} class="text-slate-500"/>
        </button>
        
        <!-- Canvas navigation controls -->
        <CanvasNavControls 
          orientation="vertical"
          isCollapsed={isRightSidebarCollapsed}
          isTouchDevice={isTouchDevice}
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
            <TherapeuticAreaSidebar 
              {currentEntries} 
              {currentArea}
              {areaMetrics}
              {colorMap}
              {onShowDrugDetail}
              fullYearData={filteredData}
              selectedYear={selectedYear}
              isCollapsed={isRightSidebarCollapsed}
              isTouchDevice={isTouchDevice}
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
  {/if}
  
  <!-- Mobile/Tablet bottom sidebar - show on mobile -->
  {#if isMobileView}
    <MobileTherapeuticAreaSidebar
      {currentEntries}
      currentArea={currentArea}
      {areaMetrics}
      {colorMap}
      onShowDrugDetail={onShowDrugDetail}
      fullYearData={filteredData}
      {selectedYear}
      isExpanded={isMobileSidebarExpanded}
      on:click={() => isMobileSidebarExpanded = !isMobileSidebarExpanded}
    >
      {#if isMobileSidebarExpanded}
        <div class="mb-4 px-4 pt-4">
          <RpdprvSearch
            data={data}
            onShowDrugDetail={onShowDrugDetail}
            onShowCompanyDetail={onShowCompanyDetail}
          />
        </div>
      {/if}
    </MobileTherapeuticAreaSidebar>
  {/if}
</div>

<style>
  .timeline-container {
    border-bottom: .5px solid #549E7D;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Fix for continuous scrolling - keeping minimal styles that don't affect panning */
  :global(.therapeutic-area-canvas svg) {
    cursor: grab;
  }
  
  :global(.therapeutic-area-canvas svg:active) {
    cursor: grabbing;
  }
  
  .legend-container {
    border-top: .5px solid #549E7D;
  }
  
  .rounded-btn {
    border: 1px solid #549E7D;
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
    :global(.therapeutic-area-wrapper .infinite-canvas-container) {
      height: calc(100vh - 200px) !important;
      touch-action: none !important;
      -webkit-overflow-scrolling: none !important;
    }
    
    /* Ensure the SVG fills the entire container on mobile */
    :global(.therapeutic-area-canvas svg) {
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
    :global(.therapeutic-area-wrapper .infinite-canvas-container) {
      height: calc(100vh - 160px) !important;
      touch-action: none;
    }
  }
  
  @media (min-width: 1201px) {
    /* Desktop specific styles */
    :global(.therapeutic-area-wrapper .infinite-canvas-container) {
      height: calc(100vh - 150px) !important;
    }
    
    /* Ensure the sidebar has the right height */
    .h-fit {
      max-height: 64.25vh;
      overflow-y: auto;
    }
  }
  
  /* Custom scrollbar styles with Safari support */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px; /* Add height for horizontal scrollbars */
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: #e5e7eb;
    border-radius: 3px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #94a3b8;
    border-radius: 3px;
    transition: background-color 0.2s;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background-color: #64748b;
  }

  /* Firefox scrollbar styles */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #94a3b8 #e5e7eb;
  }

  /* For Edge */
  .scrollbar-thin {
    -ms-overflow-style: -ms-autohiding-scrollbar;
  }
  
  /* Safari-specific fixes */
  @supports (-webkit-touch-callout: none) {
    /* CSS specific to iOS devices and Safari */
    .scrollbar-thin {
      /* Ensure scrollbars are visible in Safari */
      overflow-y: auto !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
    }
    
    :global(.therapeutic-area-canvas) {
      -webkit-user-select: none;
      user-select: none;
      touch-action: none !important;
    }
  }
</style> 
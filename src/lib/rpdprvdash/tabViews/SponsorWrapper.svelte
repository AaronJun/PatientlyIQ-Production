<!-- SponsorWrapper.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  import RPDPRVHorizontalTimeline from '../RPDPRVTimeline.svelte';
  import RpdprvCompanyTree from '../RadialComponents/RPDPRVCompanyTree.svelte';
  import RpdprvSearch from '../RPDPRVSearch.svelte';
  import RPDRadialLegend from '../RPDRadialLegend.svelte';
  import SponsorSidebar from '../sidebarComponents/SponsorSidebar.svelte';
  import MobileSponsorSidebar from '../sidebarComponents/MobileSponsorSidebar.svelte';
  import InfiniteCanvasWrapper from '../InfiniteCanvasWrapper.svelte';
  
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
  let infiniteCanvas: { resetView: () => void };
  let hoveredTherapeuticArea = "";
  let currentEntries: any[] = [];
  let currentView: string | null = null;
  let currentCompanyMetrics: any | null = null;
  let currentArea: string | null = null;
  let areaMetrics: any | null = null;
  
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
  ).map(([area, count]) => ({ area, count }));
  
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
    
    // Clean up on component destruction
    return () => {
      window.removeEventListener('resize', checkMobileView);
      
      // Clean up transform check interval
      if (transformCheckInterval) {
        clearInterval(transformCheckInterval);
        transformCheckInterval = null;
      }
    };
  });
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

<div class="sponsor-tab-content flex flex-row flex-grow relative h-full">
  <div class="w-full h-full items-center relative">
    <div class="timeline-container fixed justify-center place-items-start w-full z-0 bg-slate-100 transition-all duration-300">
      <RPDPRVHorizontalTimeline 
        data={data}
        selectedYear={selectedYear}
        onYearSelect={onYearSelect}
      />
    </div>
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
          hoveredTherapeuticArea={hoveredTherapeuticArea}
          allYearsData={selectedYear === "All" ? data : undefined}
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

  <!-- Desktop right sidebar - only show on non-mobile -->
  {#if !isMobileView}
    <div class="absolute right-6 top-25h-full mt-24 {isRightSidebarCollapsed ? 'w-4' : 'w-96'} transition-all duration-300">
      
      <button
        class="rounded-btn absolute -left-3 top-4 z-50 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full shadow-md transition-colors duration-200"
        on:click={toggleRightSidebar}
        title={isRightSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          class="w-4 h-4 transform transition-transform duration-200 {isRightSidebarCollapsed ? 'rotate-180' : ''}"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <div class="h-full {isRightSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg rounded-l-lg px-4 pt-6 flex flex-col">
        <!-- Search component in desktop sidebar -->
        <div class="mb-4">
          <RpdprvSearch
            data={data}
            onShowDrugDetail={onShowDrugDetail}
            onShowCompanyDetail={onShowCompanyDetail}
          />
        </div>
        
        <!-- Scrollable content area -->
        <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-200 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500">
          <!-- Use the updated sidebar component -->
          <SponsorSidebar
            currentView={currentView}
            currentEntries={currentEntries}
            currentCompanyMetrics={currentCompanyMetrics}
            colorMap={colorMap}
            onShowDrugDetail={onShowDrugDetail}
            fullYearData={filteredData}
            selectedYear={selectedYear}
          />
        </div>

        <!-- Legend stays at bottom -->
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
      </div>
    </div>
  {/if}
  
  <!-- Mobile/Tablet bottom sidebar - show on mobile -->
  {#if isMobileView}
    <MobileSponsorSidebar
      currentView={currentView}
      currentEntries={currentEntries}
      currentCompanyMetrics={currentCompanyMetrics}
      colorMap={colorMap}
      onShowDrugDetail={onShowDrugDetail}
      fullYearData={filteredData}
      selectedYear={selectedYear}
      isExpanded={isMobileSidebarExpanded}
      on:click={() => isMobileSidebarExpanded = !isMobileSidebarExpanded}
    >
      <!-- Add search component to mobile sponsor sidebar -->
      {#if isMobileSidebarExpanded}
        <div class="mb-4 px-4 pt-4">
          <RpdprvSearch
            data={data}
            onShowDrugDetail={onShowDrugDetail}
            onShowCompanyDetail={onShowCompanyDetail}
          />
        </div>
      {/if}
    </MobileSponsorSidebar>
  {/if}
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
  
  .rounded-btn {
    border: 1px solid #549E7D;
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
</style> 
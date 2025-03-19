<script lang="ts">
  import { onMount } from 'svelte';
  import { Separator } from 'bits-ui';
  import { fade, fly, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  import RpdprvSearch from '$lib/rpdprvdash/RPDPRVSearch.svelte';
  
  import RPDPRVHorizontalTimeline from '$lib/rpdprvdash/RPDPRVTimeline.svelte';
  import PRVPurchaseTimeline from '$lib/rpdprvdash/sidebarComponents/PRVPurchaseTimeline.svelte';
  import RPDRadialLegend from '$lib/rpdprvdash/RPDRadialLegend.svelte';
  
  import RpdprvCompanyTree from '$lib/rpdprvdash/RadialComponents/RPDPRVCompanyTree.svelte';
  import SellerBuyerChord from '$lib/rpdprvdash/TransactionChord.svelte';
  import RPDDRadialYear from '$lib/rpdprvdash/RPDPRVTherapeuticAreaChart.svelte';
  import { getTherapeuticAreaColor } from '$lib/rpdprvdash/utils/colorDefinitions';
  
  import SponsorSidebar from '$lib/rpdprvdash/sidebarComponents/SponsorSidebar.svelte';
  import TherapeuticAreaSidebar from '$lib/rpdprvdash/sidebarComponents/TherapeuticAreaSidebar.svelte';
  import HowToReadRadialChart from '$lib/rpdprvdash/HowToReadRadialChart.svelte';
  
  // Import mobile sidebar components
  import MobileSponsorSidebar from '$lib/rpdprvdash/sidebarComponents/MobileSponsorSidebar.svelte';
  import MobileTherapeuticAreaSidebar from '$lib/rpdprvdash/sidebarComponents/MobileTherapeuticAreaSidebar.svelte';
  import MobileTransactionSidebar from '$lib/rpdprvdash/sidebarComponents/MobileTransactionSidebar.svelte';
  
  import RPDTransactionSummaryView from '$lib/rpdprvdash/sidebarComponents/RPDTransactionsSummary.svelte';
  import VoucherBeeswarmPlot from '$lib/rpdprvdash/VoucherBeeswarmPlot.svelte';
  
  import RpdCompanyDetailDrawer from '$lib/rpdprvdash/RPDCompanyDetailDrawer.svelte';
  import RPDPRVDrawer from '$lib/rpdprvdash/RPDPRVDrawer.svelte';
  import RPDPRVDashboardView from '$lib/rpdprvdash/RPDPRVDashboardView.svelte';
  import InfiniteCanvasWrapper from '$lib/rpdprvdash/InfiniteCanvasWrapper.svelte';

  // New PRV Analytics Components
  import RPDPRVAnalytics from '$lib/rpdprvdash/Overview/OverviewWrapper.svelte';

  // New TransactionsWrapper component
  import TransactionsWrapper from '$lib/rpdprvdash/tabViews/TransactionsWrapper.svelte';

  // Import data sources
  import rpddData from '$lib/data/rpdprvdash/mergeddata.json';
  import rpdCompanyValues from '$lib/data/rpdprvdash/rpdCompanyValues.json';
  import constellationDataRaw from '$lib/data/rpdprvdash/RPDConstellationData.json';

  // Import the TherapeuticAreaDetailDrawer component
  import TherapeuticAreaDetailDrawer from '$lib/rpdprvdash/components/TherapeuticAreaDetailDrawer.svelte';
  
  // Import the new VerticalSidebar component
  import VerticalSidebar from '$lib/rpdprvdash/sidebarComponents/NavSidebar.svelte';

  // Interface definitions
  interface DrawerProps {
    isCompanyView?: boolean;
    Company: string;
    drugName?: string;
    year?: string;
    therapeuticArea?: string;
    entries: any[];
    color: string;
    currentStage?: string;
    rpddAwardDate?: string;
    voucherAwardDate?: string;
    indication?: string;
    treatmentClass?: string;
    mechanismOfAction?: string;
    companyUrl?: string;
    country?: string;
    publicPrivate?: string;
    marketCap?: string;
  }

  interface TabSelectEvent {
    detail: string;
  }

  interface SidebarToggleEvent {
    detail: boolean;
  }

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

  interface DataEntry {
    'RPDD Year': string;
    'RPDD Date': string;
    'PRV Date': string;
    Company: string;
    Candidate: string;
    Indication: string;
    TherapeuticArea1: string;
    [key: string]: string | number | boolean | undefined; // Index signature for other potential fields
  }

  interface HTMLElementWithStyle extends HTMLElement {
    style: CSSStyleDeclaration;
    offsetHeight: number;
  }

  // State variables
  let activeTab = 'Program Overview';
  let previousTab = activeTab; // Track previous tab for animations
  let animationDirection = 1; // For determining animation direction
  let selectedTransactionYear = "All"; // Default transaction year
  let highlightedTransaction: { seller: string, buyer: string } | null = null;
  let selectedData: any | null = null;
  let processedConstellationData: any[] = [];
  let selectedColor: string = "";
  let currentArea: string | null = null;
  let currentView: string | null = null;
  let currentEntries: any[] = [];
  let currentCompanyMetrics: any | null = null;
  let areaMetrics: any | null = null;
  let isDrawerOpen = false;
  let isDashboardOpen = false;
  let selectedYear = "2024"; // Default year
  let isCompanyDetailDrawerOpen = false;
  let selectedCompany = "";
  let isSidebarCollapsed = true; // Default to collapsed for vertical sidebar
  let isRightSidebarCollapsed = false; // Default to collapsed for right sidebar
  let isHowToReadOpen = false; // New state variable for How to Read modal
  let isDropdownOpen = false; // New state variable for dropdown menu
  let isMobileSidebarExpanded = false; // New state variable for mobile sidebar expansion
  let isMobileView = false; // Track if we're in mobile view
  let isTabletView = false; // Track if we're in tablet/iPad view
  
  // Track currently hovered therapeutic area for legend highlighting
  let hoveredTherapeuticArea = "";
  
  // Process stock data and store by company
  let stockDataByCompany: Record<string, any[]> = {};
  
  // Filter data based on selected year (for non-transaction tabs)
  $: filteredData = selectedYear === "All" 
    ? rpddData // Use all data when "All" is selected
    : rpddData.filter(entry => {
        // Include all entries where PRV Year matches the selected year
        if (entry["PRV Status"] === "PRV Awarded" && entry["PRV Year"] === selectedYear) {
          return true;
        }
        // For entries with no PRV Year but an RPDD year, show them in their RPDD Year
        if (!entry["PRV Year"] || entry["PRV Year"].trim() === "") {
          return entry["RPDD Year"] === selectedYear;
        }
        // For other PRV entries, only show them in the selected year if it matches their PRV Year
        return entry["PRV Year"] === selectedYear || entry["RPDD Year"] === selectedYear;
      });
  
  // Filter transaction data based on selected transaction year (for transaction tab)
  $: filteredTransactionData = selectedTransactionYear === "All"
    ? rpddData.filter(entry => entry.Purchased === "Y") // Show all transactions when "All" is selected
    : rpddData.filter(entry => 
      entry.Purchased === "Y" && entry["Purchase Year"] === selectedTransactionYear
    );
  
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
  
  // Process the stock data
  function processStockData(stockData: any[]): Record<string, any[]> {
    const companyMap: Record<string, any[]> = {};
    
    stockData.forEach(item => {
      if (!companyMap[item.Company]) {
        companyMap[item.Company] = [];
      }
      companyMap[item.Company].push(item);
    });
    
    return companyMap;
  }
  
  function handleYearSelect(year: string) {
    selectedYear = year;
  }
  
  function handleTransactionYearSelect(year: string) {
    selectedTransactionYear = year;
  }

  let drawerProps: DrawerProps = {
    isCompanyView: false,
    Company: '',
    drugName: '',
    entries: [],
    color: '',
    companyUrl: ''
  };

  // Add state for therapeutic area drawer
  let isTherapeuticAreaDrawerOpen = false;
  let selectedTherapeuticAreaDetail: any = null;

  // Handle vertical sidebar events
  function handleTabSelect(event: TabSelectEvent) {
    setActiveTab(event.detail);
  }
  
  function handleSidebarToggle(event: SidebarToggleEvent) {
    isSidebarCollapsed = event.detail;
  }
  
  function handleHowToNavigate() {
    isHowToReadOpen = true;
  }
  
  function handleDashboard() {
    isDashboardOpen = true;
  }
  
  // Add a separate state for right sidebar
  function toggleRightSidebar() {
    isRightSidebarCollapsed = !isRightSidebarCollapsed;
  }

  // Update handleCompanyHover to also handle therapeutic area data
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

  function setActiveTab(tab: string) {
    if (tab === activeTab) return;
    
    // Determine animation direction based on tab order
    const tabOrder = ['Program Overview', 'By Sponsor', 'By Therapeutic Area', 'By Transactions'];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(tab);
    
    animationDirection = newIndex > currentIndex ? 1 : -1;
    previousTab = activeTab;
    activeTab = tab;
    
    // Reset views when changing tabs
    resetSidebarView();
    // Also reset the hovered area
    hoveredTherapeuticArea = "";
  }
  
  // New function to reset the sidebar to default view
  function resetSidebarView() {
    currentEntries = [];
    currentView = null;
    currentCompanyMetrics = null;
    currentArea = null;
    areaMetrics = null;
    highlightedTransaction = null;
    hoveredTherapeuticArea = "";
  }
  
  // Window click handler to reset sidebar
  function handleWindowClick(event: MouseEvent) {
    // Check if click was on an interactive element
    const isInteractiveElement = (event.target as Element).closest('.interactive-element, button, a, input, select, .drug-node, .area-node, .tooltip');
    
    // Skip if click was on an interactive element or sidebar
    if (isInteractiveElement || (event.target as Element).closest('.sidebar') || isDrawerOpen || isDashboardOpen) {
      return;
    }
    
    // Reset sidebar view and close dropdown
    resetSidebarView();
    isDropdownOpen = false;
  }

  function handleShowCompanyDetail(detail: any) {
    const companyEntries = detail.entries || rpddData.filter(entry => entry.Company === detail.Company);
    selectedCompany = detail.Company;
    drawerProps = {
      isCompanyView: true,
      Company: detail.Company,
      entries: companyEntries,
      color: '#37587e',
      companyUrl: detail.companyUrl,
      country: companyEntries[0]?.COUNTRY || 'N/A',
      publicPrivate: companyEntries[0]?.['Public/Private/NIH'] || 'N/A',
      marketCap: companyEntries[0]?.MarketCap || 'N/A'
    };
    isDrawerOpen = true;
    isCompanyDetailDrawerOpen = true;
  }

  function handleShowDrugDetail(detail: any) {
    drawerProps = {
      isCompanyView: false,
      ...detail
    };
    isDrawerOpen = true;
    isCompanyDetailDrawerOpen = false;
  }

  function handleCloseDrawer() {
    isDrawerOpen = false;
    isCompanyDetailDrawerOpen = false;
  }

  function handleDashboardClose() {
    isDashboardOpen = false;
  }

  const processedData = Object.entries(
    rpddData.reduce((acc, d) => {
      if (d.TherapeuticArea1) {
        acc[d.TherapeuticArea1] = (acc[d.TherapeuticArea1] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([area, count]) => ({ area, count }));

  // Define the therapeutic area color map type
  type TherapeuticAreaColorMap = {
    [key in keyof typeof colorMap]: string;
  };

  const colorScale = (area: string) => {
    const key = area as keyof typeof colorMap;
    return colorMap[key] || '#999999';
  };

  // Add reference to infinite canvas
  let infiniteCanvas: { resetView: () => void };

  // Add function to handle therapeutic area detail
  function handleShowTherapeuticAreaDetail(detail: any) {
    selectedTherapeuticAreaDetail = detail;
    isTherapeuticAreaDrawerOpen = true;
  }
  
  // Add function to close therapeutic area drawer
  function handleCloseTherapeuticAreaDrawer() {
    isTherapeuticAreaDrawerOpen = false;
    // Optional: clear the selection after a delay
    setTimeout(() => {
      selectedTherapeuticAreaDetail = null;
    }, 300);
  }

  function updateSidebarHeight() {
    const sidebar = document.querySelector('.sidebar') as HTMLElementWithStyle;
    const header = document.querySelector('.header') as HTMLElementWithStyle;
    if (sidebar && header) {
        sidebar.style.height = `calc(100vh - ${header.offsetHeight}px)`;
    }
  }

  function processData(data: DataEntry[]) {
    // ... existing code ...
    const rpddYear = entry['RPDD Year'] || '';
    if (rpddYear) {
        handleYearSelect(rpddYear);
    }
    
    // Update date handling
    const rpddDate = entry['RPDD Date'];
    const prvDate = entry['PRV Date'];
    // ... rest of the code ...
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
    
    // Open the therapeutic area drawer
    selectedTherapeuticAreaDetail = areaDetail;
    isTherapeuticAreaDrawerOpen = true;
  }

  onMount(() => {
    try {
      // Process stock data on mount
      stockDataByCompany = processStockData(rpdCompanyValues);
      
      // Other initialization logic
      if (constellationDataRaw) {
        processedConstellationData = constellationDataRaw;
      }
      
      // Add window click event listener
      window.addEventListener('click', handleWindowClick);
      
      // Check if we're in mobile view
      const checkMobileView = () => {
        // Standard width detection
        isMobileView = window.innerWidth < 768; // 768px is the md breakpoint in Tailwind
        isTabletView = window.innerWidth >= 768 && window.innerWidth < 1200; // iPad-sized devices
        
        // Additional Safari-specific detection
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || 
                        /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Force sidebar visibility for Safari
        if (isSafari) {
          // Add a small delay to ensure DOM is ready
          setTimeout(() => {
            // Force repaint of sidebars for Safari
            const sidebars = document.querySelectorAll('.absolute');
            sidebars.forEach(sidebar => {
              sidebar.style.display = 'none';
              // Force reflow
              void sidebar.offsetHeight;
              sidebar.style.display = '';
            });
          }, 100);
        }
      };
      
      // Initial check
      checkMobileView();
      
      // Add resize listener
      window.addEventListener('resize', checkMobileView);
      
      // Clean up on component destruction
      return () => {
        window.removeEventListener('click', handleWindowClick);
        window.removeEventListener('resize', checkMobileView);
      };
    } catch (error) {
      console.error('Error initializing:', error);
    }
  });
</script>

<!-- Mark non-interactive areas with a data attribute -->
<div class="flex flex-col bg-slate-50 min-h-screen">
  <!-- Main content area with proper spacing -->
  <main class="flex-1 pb-8 relative transition-all duration-300 min-h-[80vh] pl-8">

    <div class="tab-content w-full h-full min-h-[80vh] flex relative">
      <!-- Main content area taking full width -->
      <div class="w-full relative min-h-[80vh]">
        <div class="overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-200 z-50 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500">
          <VerticalSidebar 
            {activeTab} 
            isCollapsed={isSidebarCollapsed}
            on:tabSelect={handleTabSelect}
            on:toggleCollapse={handleSidebarToggle}
            on:howToNavigate={handleHowToNavigate}
            on:dashboard={handleDashboard}
          />
          
        </div>
        
        <!-- By Sponsor Tab with animations -->
        {#if activeTab === 'By Sponsor'}
          <div 
            in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
            out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
            class="sponsor-tab-content flex flex-row flex-grow relative"
          >
            <div class="w-full h-full items-center md:min-h-[70vh] lg:min-h-[80vh] relative">
              <div class="timeline-container fixed justify-center place-items-start w-full z-50 bg-slate-100 transition-all duration-300">
                <RPDPRVHorizontalTimeline 
                  data={rpddData}
                  selectedYear={selectedYear}
                  onYearSelect={handleYearSelect}
                />
              </div>
              <InfiniteCanvasWrapper bind:this={infiniteCanvas} let:mainGroup let:showTooltip let:hideTooltip>
                {#if mainGroup}
                  <RpdprvCompanyTree 
                    data={filteredData}
                    isAllYearView={selectedYear === "All"}
                    onCompanyHover={handleCompanyHover}
                    onStageHover={handleStageHover}
                    onLeave={handleLeave}
                    onShowDrugDetail={handleShowDrugDetail}
                    onShowCompanyDetail={handleShowCompanyDetail}
                    {mainGroup}
                    {showTooltip}
                    {hideTooltip}
                    selectedYear={selectedYear}
                    hoveredTherapeuticArea={hoveredTherapeuticArea}
                    allYearsData={selectedYear === "All" ? rpddData : undefined}
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

            <!-- Desktop right sidebar - only show on non-mobile and non-tablet -->
            {#if !isMobileView }
              <div class="absolute right-6 top-25 h-[80vh] mt-24 {isRightSidebarCollapsed ? 'w-4' : 'w-96'} transition-all duration-300">
                
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
                      data={rpddData}
                      onShowDrugDetail={handleShowDrugDetail}
                      onShowCompanyDetail={handleShowCompanyDetail}
                    />
                  </div>
                  
                  <!-- Scrollable content area -->
                  <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-200 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500">
                    <!-- Use the updated sidebar component -->
                    <SponsorSidebar
                      {currentView}
                      {currentEntries}
                      {currentCompanyMetrics}
                      colorMap={colorMap}
                      onShowDrugDetail={handleShowDrugDetail}
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
            
            <!-- Mobile/Tablet bottom sidebar - show on both mobile and tablet -->
            {#if isMobileView}
            
              <MobileSponsorSidebar
                {currentView}
                {currentEntries}
                {currentCompanyMetrics}
                colorMap={colorMap}
                onShowDrugDetail={handleShowDrugDetail}
                fullYearData={filteredData}
                selectedYear={selectedYear}
                isExpanded={isMobileSidebarExpanded}
                on:click={() => isMobileSidebarExpanded = !isMobileSidebarExpanded}
              >
              <RpdprvSearch
                      data={rpddData}
                      onShowDrugDetail={handleShowDrugDetail}
                      onShowCompanyDetail={handleShowCompanyDetail}
                    />
                <!-- Add search component to mobile sponsor sidebar -->
                {#if isMobileSidebarExpanded}
                  <div class="mb-4 px-4 pt-4">
                    <RpdprvSearch
                      data={rpddData}
                      onShowDrugDetail={handleShowDrugDetail}
                      onShowCompanyDetail={handleShowCompanyDetail}
                    />
                  </div>
                {/if}
              </MobileSponsorSidebar>
            {/if}
          </div>

        <!-- By Therapeutic Area Tab with animations -->
        {:else if activeTab === 'By Therapeutic Area'}
          <div 
            in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
            out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
            class="therapeutic-area-tab-content flex flex-row flex-grow relative"
          >
            <div class="w-full h-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] relative">
              <div class="timeline-container fixed justify-center place-items-start w-full z-50 bg-slate-100 transition-all duration-300">
                <RPDPRVHorizontalTimeline 
                  data={rpddData}
                  selectedYear={selectedYear}
                  onYearSelect={handleYearSelect}
                />
              </div>
              <InfiniteCanvasWrapper bind:this={infiniteCanvas} let:mainGroup let:showTooltip let:hideTooltip>
                {#if mainGroup}
                  <RPDDRadialYear 
                    data={filteredData}
                    isAllYearView={selectedYear === "All"}
                    onCompanyHover={handleCompanyHover}
                    onStageHover={handleStageHover}
                    onLeave={handleLeave}
                    onShowDrugDetail={handleShowDrugDetail}
                    onShowCompanyDetail={handleShowCompanyDetail}
                    onShowTherapeuticAreaDetail={handleShowTherapeuticAreaDetail}
                    {mainGroup}
                    {showTooltip}
                    {hideTooltip}
                    selectedYear={selectedYear}
                    hoveredTherapeuticArea={hoveredTherapeuticArea}
                    allYearsData={selectedYear === "All" ? rpddData : undefined}
                  />
                {:else}
                  <!-- Loading state with spinner -->
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

            <!-- Desktop right information sidebar - only show on non-mobile and non-tablet -->
            {#if !isMobileView}
            <div class="absolute right-6 top-25 h-[80vh] mt-24 {isRightSidebarCollapsed ? 'w-4' : 'w-96'} transition-all duration-300">

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
                <div class="h-full {isRightSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg rounded-l-lg p-6 flex flex-col">
                  <!-- Search component in therapeutic area sidebar -->
                  <div class="mb-4">
                    <RpdprvSearch
                      data={rpddData}
                      onShowDrugDetail={handleShowDrugDetail}
                      onShowCompanyDetail={handleShowCompanyDetail}
                    />
                  </div>
            
                  <!-- Scrollable content area -->
                  <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-200 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500">
                    <!-- Use the updated therapeutic area sidebar component -->
                    <TherapeuticAreaSidebar
                      {currentEntries}
                      {currentArea}
                      {areaMetrics}
                      colorMap={colorMap}
                      onShowDrugDetail={handleShowDrugDetail}
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
            
            <!-- Mobile/Tablet bottom sidebar - show on both mobile and tablet -->
            {#if isMobileView}
              <MobileTherapeuticAreaSidebar
                {currentEntries}
                {currentArea}
                {areaMetrics}
                colorMap={colorMap}
                onShowDrugDetail={handleShowDrugDetail}
                fullYearData={filteredData}
                selectedYear={selectedYear}
                isExpanded={isMobileSidebarExpanded}
                on:click={() => isMobileSidebarExpanded = !isMobileSidebarExpanded}
              >
              <RpdprvSearch
                      data={rpddData}
                      onShowDrugDetail={handleShowDrugDetail}
                      onShowCompanyDetail={handleShowCompanyDetail}
                    />
                <!-- Add search component to mobile therapeutic area sidebar -->
                {#if isMobileSidebarExpanded}
                  <div class="mb-4 px-4 pt-4">
                    <RpdprvSearch
                      data={rpddData}
                      onShowDrugDetail={handleShowDrugDetail}
                      onShowCompanyDetail={handleShowCompanyDetail}
                    />
                  </div>
                {/if}
              </MobileTherapeuticAreaSidebar>
            {/if}
          </div>

        <!-- By Transactions Tab with animations -->
        {:else if activeTab === 'By Transactions'}
          <div 
            in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
            out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
            class="transactions-tab-content flex flex-col h-full relative"
          >
            <!-- Timeline section -->
            <div class="timeline-container sticky justify-center place-items-start z-20 px-4 py-2 bg-slate-100 transition-all duration-300">
              <PRVPurchaseTimeline 
                data={rpddData}
                selectedYear={selectedTransactionYear}
                onYearSelect={handleTransactionYearSelect}
                transactionYearSelected={handleTransactionYearSelect}
              />
            </div>

            <!-- Main content area with new TransactionsWrapper -->
            <div class="flex flex-1 h-full overflow-y-auto">
              <TransactionsWrapper 
                data={rpddData} 
                stockData={rpdCompanyValues}
                isAllYearView={selectedTransactionYear === "All"}
                selectedTransactionYear={selectedTransactionYear}
                onEntrySelect={(entry) => handleShowDrugDetail({
                  Company: entry.Company,
                  drugName: entry.Candidate,
                  therapeuticArea: entry.TherapeuticArea1,
                  year: entry["RPDD Year"],
                  color: getTherapeuticAreaColor(entry.TherapeuticArea1).stroke,
                  entries: [entry],
                  currentStage: entry["Current Development Stage"],
                  rpddAwardDate: entry["RPDD Date"],
                  voucherAwardDate: entry["PRV Date"],
                  indication: entry.Indication
                })}
                on:yearSelect={(e) => handleTransactionYearSelect(e.detail)}
              />
            </div>
          </div>
          
        <!-- Program Overview (Analytics) Tab with animations -->
        {:else if activeTab === 'Program Overview'}
          <div 
            in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
            out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
            class="overview-tab-content w-full"
          >
            <RPDPRVAnalytics 
              data={rpddData} 
              isAllYearView={selectedYear === "All"}
              on:navigateToSponsor={() => setActiveTab('By Sponsor')}
              onEntrySelect={(entry) => handleShowDrugDetail({
                Company: entry.Company,
                drugName: entry.Candidate,
                therapeuticArea: entry.TherapeuticArea1,
                year: entry["RPDD Year"],
                color: getTherapeuticAreaColor(entry.TherapeuticArea1).stroke,
                entries: [entry],
                // Add other properties needed for your drug detail drawer
                currentStage: entry["Current Development Stage"],
                rpddAwardDate: entry["RPDD Date"],
                voucherAwardDate: entry["PRV Date"],
                indication: entry.Indication
              })}
            />
          </div>
        {/if}
      </div>
    </div>
  </main>
<footer class="grid grid-cols-2 w-full justify-between items-center mb-8 mx-24 gap-2">
<Separator.Root
class="bg-[#ff4a4a]/20 mt-8 mb-2 col-span-2 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]"
/>
<p class="text-2xs text-[#ff4a4a] col-span-1 font-mono">Copyright 2025 Patiently Studio</p>
<p class="text-2xs text-[#ff4a4a] col-span-1 font-mono">Data updated through {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
<a href="/contact" target="_blank" class="text-2xs text-sky-800 underline cursor-pointer underline-offset-4 font-semibold hover:text-emerald-500 col-span-1 font-mono">Contact us</a>
</footer>
</div>

{#if isHowToReadOpen}
  <HowToReadRadialChart
    isOpen={isHowToReadOpen}
    onClose={() => isHowToReadOpen = false}
  />
{/if}

{#if isDashboardOpen}
  <RPDPRVDashboardView
    isOpen={isDashboardOpen}
    onClose={handleDashboardClose}
    onShowDrugDetail={handleShowDrugDetail}
  />
{/if}

{#if isDrawerOpen}
  {#if drawerProps.isCompanyView}
    <RpdCompanyDetailDrawer
      companyName={drawerProps.Company}
      allData={rpddData}
      stockData={rpdCompanyValues}
      isOpen={isDrawerOpen}
      onClose={handleCloseDrawer}
      onShowDrugDetail={handleShowDrugDetail}
      color={drawerProps.color}
    />
  {:else}
    <RPDPRVDrawer
      {...drawerProps}
      isOpen={isDrawerOpen}
      onClose={handleCloseDrawer}
      onShowDrugDetail={handleShowDrugDetail}
      onShowCompanyDetail={handleShowCompanyDetail}
      color={drawerProps.color}
    />
  {/if}
{/if}

<!-- Add the TherapeuticAreaDetailDrawer component at the end of the file -->
{#if isTherapeuticAreaDrawerOpen}
  <TherapeuticAreaDetailDrawer 
    isOpen={isTherapeuticAreaDrawerOpen}
    areaDetail={selectedTherapeuticAreaDetail}
    onClose={handleCloseTherapeuticAreaDrawer}
    onShowDrugDetail={handleShowDrugDetail}
  />
{/if}
  


<style>
.header {
  background-color: #e0e0e0;
}

.legend-container {
  border-top: .5px solid #549E7D;
}

.timeline-container {
  border-bottom: .5px solid #549E7D;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
  
  .tab-button {
    border-bottom: 1px solid #e0e0e0;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .tab-button:active {
    border-bottom: 2px solid #ff7373;
  }
  
  .active-tab {
    border-bottom: 2px solid #FF5501 !important;
    position: relative;
  }
  
  .active-tab::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #FF5501;
  }
  
  /* Add responsive sizing for canvas containers */
  @media (max-width: 768px) {
    /* Mobile specific styles */
    .infinite-canvas-container, :global(.infinite-canvas-container) {
      min-height: 70vh !important;
      height: 100vh !important;
    }
  }
  
  @media (min-width: 769px) and (max-width: 1200px) {
    /* Tablet specific styles */
    .infinite-canvas-container, :global(.infinite-canvas-container) {
      min-height: 75vh !important;
      height: 100vh !important;
    }
  }
  
  @media (min-width: 1201px) {
    /* Desktop specific styles */
    .infinite-canvas-container, :global(.infinite-canvas-container) {
      min-height: 80vh !important;
      height: 100vh !important;
    }
  }
  
  /* Keep your other existing styles */
  .interactive-element:hover {
    border-bottom: 2px solid #ff7373;
  }
  
  .interactive-element:focus {
    outline: 1px solid #ff7373;
  }
  
  .interactive-element:active {
    border-bottom: 2px solid #ff7373;
  }
  
  .sidebar-header {
    padding: 0.5rem 0;
    border-bottom: .525px solid #535353;
  }
  
  .sidebar {
    max-height: 65vh;
    overflow-y: scroll;
    scrollbar-color: #e5e7eb #f9fafb;
  }

  .rounded-btn {
    border: 1px solid #549E7D;
  }
  
  .nav-bar {
    align-items: stretch;
  }
  
  .highlight {
    color: #549E7D;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
  }
  
  .card {
    border-bottom: .5px dotted #535353;
    padding: .25rem 1rem 1rem 0;
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
    
    /* Fix for absolute positioning in Safari */
    .absolute {
      position: absolute;
      /* Force hardware acceleration */
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
  }

  /* Base styles for smooth animations */
  .sponsor-tab-content,
  .therapeutic-area-tab-content,
  .transactions-tab-content,
  .overview-tab-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
</style>
<script lang="ts">
  import { onMount } from 'svelte';

  import RpdprvSearch from '$lib/rpdprvdash/RPDPRVSearch.svelte';
  
  import RPDPRVHorizontalTimeline from '$lib/rpdprvdash/RPDPRVTimeline.svelte';
  import PRVPurchaseTimeline from '$lib/rpdprvdash/sidebarComponents/PRVPurchaseTimeline.svelte';
  import RPDRadialLegend from '$lib/rpdprvdash/RPDRadialLegend.svelte';
  
  import RpdprvCompanyTree from '$lib/rpdprvdash/RadialComponents/RPDPRVCompanyTree.svelte';
  import SellerBuyerChord from '$lib/rpdprvdash/SellerBuyerChord.svelte';
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
  import RPDPRVAnalytics from '$lib/rpdprvdash/AllView/SankeyWrapper.svelte';

  import { ArrowUpRight, Bee, DashboardReference, Globe, Analytics } from 'carbon-icons-svelte';
  import { Balanced } from 'carbon-pictograms-svelte';

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

  // State variables
  let activeTab = 'By Sponsor';
  let selectedTransactionYear = "2024"; // Default transaction year
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
  
  // Process stock data and store by company
  let stockDataByCompany: Record<string, any[]> = {};
  
  // Filter data based on selected year (for non-transaction tabs)
  $: filteredData = selectedYear === "All" 
    ? rpddData // Use all data when "All" is selected
    : rpddData.filter(entry => {
        // If entry has PRV Status = "PRV Awarded" and a PRV Year, only show it in the PRV Year
        if (entry["PRV Status"] === "PRV Awarded" && entry["PRV Year"] && entry["PRV Year"].trim() !== "") {
          return entry["PRV Year"] === selectedYear;
        }
        // Otherwise, show it in its RPDD Year
        return entry["RPDD Year"] === selectedYear;
      });
  
  // Filter transaction data based on selected transaction year (for transaction tab)
  $: filteredTransactionData = rpddData.filter(entry => 
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
  function handleTabSelect(event) {
    setActiveTab(event.detail);
  }
  
  function handleSidebarToggle(event) {
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
  function handleCompanyHover(data) {
    if (Array.isArray(data)) {
      // Old format - just array of entries
      currentEntries = data;
      currentView = 'Company View';
      currentCompanyMetrics = null;
      currentArea = null;
      areaMetrics = null;
    } else if (data.entries && data.areaName) {
      // New format with therapeutic area metrics
      currentEntries = data.entries;
      currentArea = data.areaName;
      areaMetrics = {
        totalDrugs: data.totalDrugs || data.entries.length,
        uniqueCompanies: data.uniqueCompanies || new Set(data.entries.map(d => d.Company)).size,
        uniqueCandidates: data.uniqueCandidates || new Set(data.entries.map(d => d.Candidate)).size
      };
      currentView = 'Area View';
      currentCompanyMetrics = null;
    } else if (data.entries) {
      // Company format with additional metrics
      currentEntries = data.entries;
      currentCompanyMetrics = {
        companyName: data.companyName || (data.entries.length > 0 ? data.entries[0].Company : 'Unknown'),
        totalDrugs: data.totalDrugs || data.entries.length,
        clinicalTrials: data.clinicalTrials || 0,
        vouchersAwarded: data.vouchersAwarded || 0,
        uniqueIndications: data.uniqueIndications || new Set(data.entries.map(d => d.Indication)).size,
        uniqueAreas: data.uniqueAreas || new Set(data.entries.map(d => d.TherapeuticArea1)).size
      };
      currentView = 'Company View';
      currentArea = null;
      areaMetrics = null;
    }
  }

  function handleStageHover(entries) {
    currentEntries = entries;
    currentView = 'Stage View';
    // Reset company metrics when viewing stages
    currentCompanyMetrics = null;
    currentArea = null;
    areaMetrics = null;
  }
 
  function handleLeave() {
    // Keep the current view if we want to persist data
    // currentEntries = [];
    // currentView = null;
  }

  function setActiveTab(tab: string) {
    activeTab = tab;
    // Reset views when changing tabs
    resetSidebarView();
  }
  
  // New function to reset the sidebar to default view
  function resetSidebarView() {
    currentEntries = [];
    currentView = null;
    currentCompanyMetrics = null;
    currentArea = null;
    areaMetrics = null;
    highlightedTransaction = null;
  }
  
  // Window click handler to reset sidebar
  function handleWindowClick(event) {
    // Check if click was on an interactive element
    const isInteractiveElement = event.target.closest('.interactive-element, button, a, input, select, .drug-node, .area-node, .tooltip');
    
    // Skip if click was on an interactive element or sidebar
    if (isInteractiveElement || event.target.closest('.sidebar') || isDrawerOpen || isDashboardOpen) {
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

  const colorScale = (area: string) => colorMap[area] || '#999999';

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
<div class="flex flex-col min-h-screen bg-slate-100/50">
  <!-- Fixed header area with timeline -->
  <div class="sticky top-0 left-0 right-0 z-10 backdrop-blur-sm shadow-sm">
    <div class="w-full transition-all duration-300"
         style="margin-left: {isMobileView ? '0' : (isSidebarCollapsed ? '4rem' : '16rem')}; padding-top: 0.75rem;">
      <RPDPRVHorizontalTimeline 
        data={rpddData}
        selectedYear={selectedYear}
        onYearSelect={handleYearSelect}
      />
    </div>
  </div>

  <!-- Main content area with proper spacing -->
  <main class="flex-1 mt-4 pb-8 relative transition-all duration-300" 
        style="margin-left: {isSidebarCollapsed ? '4rem' : '16rem'};">
    <div class="tab-content w-full h-full flex relative">
      <!-- Main content area taking full width -->
      <div class="{activeTab === 'Program Overview' ? 'w-full px-8' : 'w-full px-4'} relative">
        <div class="overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-200 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500">
  
          <VerticalSidebar 
            {activeTab} 
            isCollapsed={isSidebarCollapsed}
            on:tabSelect={handleTabSelect}
            on:toggleCollapse={handleSidebarToggle}
            on:howToNavigate={handleHowToNavigate}
            on:dashboard={handleDashboard}
          />
          
        </div>
        {#if activeTab === 'By Sponsor'}
          <div class="flex flex-row flex-grow relative">
            <!-- Main visualization area taking full width -->
            <div class="w-full h-[calc(100vh-2rem)] relative">
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
              <div class="absolute right-0 top-25 max-h-[1024px] {isRightSidebarCollapsed ? 'w-16' : 'w-96'} transition-all duration-300">
                
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
                  <div class="flex-none mt-6 pt-4 border-t border-slate-200">
                    <RPDRadialLegend 
                      items={processedData}
                      {colorScale}
                    />
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- Mobile/Tablet bottom sidebar - show on both mobile and tablet -->
            {#if isMobileView || isTabletView}
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

        <!-- By Therapeutic Area Tab Layout -->  
        {:else if activeTab === 'By Therapeutic Area'}
          <div class="flex flex-row relative">
            <!-- Main visualization area taking full width -->
            <div class="w-full h-[calc(100vh-2rem)] relative">
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
            {#if !isMobileView && !isTabletView}
              <div class="absolute right-0 top-16 max-h-[1024px] {isRightSidebarCollapsed ? 'w-16' : 'w-96'} transition-all duration-300">
                <button
                  class="rounded-btn absolute -left-3 top-32 z-50 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full shadow-md transition-colors duration-200"
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
                  <div class="flex-none mt-6 pt-4 border-t border-slate-200">
                    <RPDRadialLegend 
                      items={processedData}
                      {colorScale}
                    />
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- Mobile/Tablet bottom sidebar - show on both mobile and tablet -->
            {#if isMobileView || isTabletView}
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

        <!-- By Transactions Tab Layout -->
        {:else if activeTab === 'By Transactions'}
          <!-- Updated Transactions Tab Layout -->
          <div class="flex flex-row relative">
            <div class="w-{isMobileView || isTabletView ? 'full' : (isRightSidebarCollapsed ? '11/12' : '4/5')} {isMobileView || isTabletView ? '' : 'pl-32'} transition-all duration-300">
              <SellerBuyerChord 
                data={rpddData}
                stockData={rpdCompanyValues}
                selectedYear={selectedTransactionYear}
                {highlightedTransaction}
                onShowDrugDetail={handleShowDrugDetail}
                on:transactionHover={(event) => highlightedTransaction = event.detail}
                on:transactionLeave={() => highlightedTransaction = null}
              />
            </div>
            
            <!-- Left timeline sidebar for By Transactions tab -->
            <div class="absolute left-0 top-0 w-auto h-auto z-10">
              <div class="flex flex-col bg-white/70 ring-1 ring-slate-100 backdrop-blur-sm shadow-lg rounded-r-lg py-4 {isMobileView || isTabletView ? 'px-4 max-w-[90vw]' : 'px-2'}">
                <div class="overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-200 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500">
                  <PRVPurchaseTimeline 
                    data={rpddData}
                    selectedYear={selectedTransactionYear}
                    onYearSelect={handleTransactionYearSelect}
                    transactionYearSelected={handleTransactionYearSelect}
                  />
                </div>
              </div>
            </div>
            
            <!-- Desktop sidebar - only show on non-mobile and non-tablet -->
            {#if !isMobileView && !isTabletView}
              <div class="relative {isRightSidebarCollapsed ? 'w-1/12' : 'w-1/5'} transition-all duration-300 pr-8 pl-12">
                <button
                  class="rounded-btn absolute -left-3 top-32 z-50 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full shadow-md transition-colors duration-200"
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
                <div class="sticky top-32 {isRightSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-all duration-300">
                  <div class="sidebar-header mb-4">
                    <h4 class="text-xs uppercase font-semibold text-slate-600">                              
                      {highlightedTransaction ? 'Transaction Details' : 'Transaction Overview'}
                    </h4>
                  </div>

                  <!-- Show transaction summary when no transaction is selected -->
                  <div class="flex flex-col gap-4">
                    <div class="bg-white rounded-lg shadow-sm p-4 mt-4 h-[35vh]">
                      <h5 class="text-xs font-medium text-slate-600 mb-2">Voucher Distribution</h5>
                      <VoucherBeeswarmPlot 
                        data={rpddData}
                        {highlightedTransaction}
                        selectedYear={selectedTransactionYear}
                        onPointClick={handleShowDrugDetail}
                        on:transactionHover={(event) => highlightedTransaction = event.detail}
                        on:transactionLeave={() => highlightedTransaction = null}
                      />
                    </div>
                    <div class="bg-white rounded-lg shadow-sm p-4">
                      <RPDTransactionSummaryView 
                        data={rpddData}
                        year={selectedTransactionYear}
                      />
                    </div>
                  </div>
                </div>
              </div>
            {/if}
            
            <!-- Mobile/Tablet bottom sidebar - show on both mobile and tablet -->
            {#if isMobileView || isTabletView}
              <MobileTransactionSidebar
                data={rpddData}
                selectedYear={selectedTransactionYear}
                {highlightedTransaction}
                onPointClick={handleShowDrugDetail}
                isExpanded={isMobileSidebarExpanded}
                on:click={() => isMobileSidebarExpanded = !isMobileSidebarExpanded}
                on:transactionHover={(event) => highlightedTransaction = event.detail}
                on:transactionLeave={() => highlightedTransaction = null}
              >
                <!-- Add search component to mobile transaction sidebar -->
                {#if isMobileSidebarExpanded}
                  <div class="mb-4 px-4 pt-4">
                    <RpdprvSearch
                      data={rpddData}
                      onShowDrugDetail={handleShowDrugDetail}
                      onShowCompanyDetail={handleShowCompanyDetail}
                    />
                  </div>
                {/if}
              </MobileTransactionSidebar>
            {/if}
          </div>
          
        <!-- Program Overview (Analytics) Tab Layout -->
        {:else if activeTab === 'Program Overview'}
          <div class="w-full">
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 class="text-xl font-semibold text-slate-800 mb-4">RPDD + PRV Program Analytics</h2>
              <p class="text-slate-600 mb-6">Comprehensive analysis of the Rare Pediatric Disease Priority Review Voucher program performance and impact.</p>
              
              <RPDPRVAnalytics 
                data={rpddData} 
                isAllYearView={selectedYear === "All"}
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
          </div>
        {/if}
      </div>
    </div>
  </main>
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
</style>
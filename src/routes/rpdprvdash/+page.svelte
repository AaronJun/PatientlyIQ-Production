<script lang="ts">
  import { onMount } from 'svelte';

  import RpdprvSearch from '$lib/rpdprvdash/RPDPRVSearch.svelte';
  
  import RPDPRVVerticalTimeline from '$lib/rpdprvdash/RPDPRVTimeline.svelte';
  import PRVPurchaseTimeline from '$lib/rpdprvdash/sidebarComponents/PRVPurchaseTimeline.svelte';
  import RPDRadialLegend from '$lib/rpdprvdash/RPDRadialLegend.svelte';
  
  import RpdprvCompanyTree from '$lib/rpdprvdash/RadialComponents/RPDPRVCompanyTree.svelte';
  import SellerBuyerChord from '$lib/rpdprvdash/SellerBuyerChord.svelte';
  import RPDDRadialYear from '$lib/rpdprvdash/RPDPRVTherapeuticAreaChart.svelte';
  import { getTherapeuticAreaColor } from '$lib/rpdprvdash/utils/colorDefinitions';
  
  import SponsorSidebar from '$lib/rpdprvdash/sidebarComponents/SponsorSidebar.svelte';
  import TherapeuticAreaSidebar from '$lib/rpdprvdash/sidebarComponents/TherapeuticAreaSidebar.svelte';
  import HowToReadRadialChart from '$lib/rpdprvdash/HowToReadRadialChart.svelte';
  
  import RPDTransactionSummaryView from '$lib/rpdprvdash/sidebarComponents/RPDTransactionsSummary.svelte';
  import VoucherBeeswarmPlot from '$lib/rpdprvdash/VoucherBeeswarmPlot.svelte';
  
  import RpdCompanyDetailDrawer from '$lib/rpdprvdash/RPDCompanyDetailDrawer.svelte';
  import RPDPRVDrawer from '$lib/rpdprvdash/RPDPRVDrawer.svelte';
  import RPDPRVDashboardView from '$lib/rpdprvdash/RPDPRVDashboardView.svelte';
  import RpdprvCompanyDrawer from '$lib/rpdprvdash/RPDPRVCompanyDrawer.svelte';
  import InfiniteCanvasWrapper from '$lib/rpdprvdash/InfiniteCanvasWrapper.svelte';

  // New PRV Analytics Components
  import RPDPRVAnalytics from '$lib/rpdprvdash/AllView/SankeyWrapper.svelte';

  import { ArrowUpRight, Bee, DashboardReference, Globe, Analytics } from 'carbon-icons-svelte';
  import { Balanced } from 'carbon-pictograms-svelte';
  import { ChevronDown } from 'carbon-icons-svelte';

  // Import data sources
  import rpddData from '$lib/data/rpdprvdash/mergeddata.json';
  import rpdCompanyValues from '$lib/data/rpdprvdash/rpdCompanyValues.json';
  import constellationDataRaw from '$lib/data/rpdprvdash/RPDConstellationData.json';

  // Import Google Analytics tracking
  import * as tracker from '$lib/rpdprvdash/RPDPRVTracker.svelte';

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
  let currentCompanyMetrics = null;
  let areaMetrics = null;
  let isDrawerOpen = false;
  let isDashboardOpen = false;
  let selectedYear = "2024"; // Default year
  let isCompanyDetailDrawerOpen = false;
  let selectedCompany = "";
  let isSidebarCollapsed = false; // Add state for sidebar collapse
  let isHowToReadOpen = false; // New state variable for How to Read modal
  let isDropdownOpen = false; // New state variable for dropdown menu
  
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
    tracker.trackYearSelection(year, activeTab);
  }
  
  function handleTransactionYearSelect(year: string) {
    selectedTransactionYear = year;
    tracker.trackYearSelection(year, 'By Transactions');
  }
  
  let drawerProps: DrawerProps = {
    isCompanyView: false,
    Company: '',
    drugName: '',
    entries: [],
    color: '',
    companyUrl: ''
  };

  function handleCompanyHover(data) {
    if (Array.isArray(data)) {
      // Old format - just array of entries
      currentEntries = data;
      currentView = 'Company View';
      currentCompanyMetrics = null;
      currentArea = null;
      areaMetrics = null;
      
      // Track visualization interaction
      if (data.length > 0) {
        tracker.trackVisualizationInteraction(
          'company_radial', 
          'hover', 
          { company: data[0].Company, count: data.length }
        );
      }
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
      
      // Track visualization interaction
      tracker.trackVisualizationInteraction(
        'therapeutic_area_radial', 
        'hover', 
        { area: data.areaName, count: data.entries.length }
      );
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
      
      // Track visualization interaction
      if (data.companyName) {
        tracker.trackVisualizationInteraction(
          'company_detail', 
          'hover', 
          { company: data.companyName, count: data.entries.length }
        );
      }
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
    // Track tab change
    tracker.trackTabChange(tab);
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

  // Function to handle dropdown toggle
  function toggleDropdown(event: Event) {
    event.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
  }

  // Function to handle mobile tab selection
  function handleMobileTabSelect(tab: string, event: Event) {
    event.stopPropagation();
    setActiveTab(tab);
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
    
    // Track company detail view
    tracker.trackCompanyDetailView(detail.Company, companyEntries.length);
  }

  function handleShowDrugDetail(detail: any) {
    drawerProps = {
      isCompanyView: false,
      ...detail
    };
    isDrawerOpen = true;
    isCompanyDetailDrawerOpen = false;
    
    // Track drug detail view
    tracker.trackDrugDetailView(
      detail.drugName || '',
      detail.Company || '',
      detail.therapeuticArea || ''
    );
  }

  function handleCloseDrawer() {
    isDrawerOpen = false;
    isCompanyDetailDrawerOpen = false;
  }

  function handleDashboardClick() {
    isDashboardOpen = true;
    tracker.trackDashboardInteraction('open');
  }

  function handleDashboardClose() {
    isDashboardOpen = false;
    tracker.trackDashboardInteraction('close');
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

  onMount(() => {
    try {
      // Initialize tracking
      tracker.initializeTracking();
      
      // Initialize section view tracking
      const unobserveFunction = tracker.trackSectionViews();
      
      // Process stock data on mount
      stockDataByCompany = processStockData(rpdCompanyValues);
      
      // Other initialization logic
      if (constellationDataRaw) {
        processedConstellationData = constellationDataRaw;
      }
      
      // Add window click event listener
      window.addEventListener('click', handleWindowClick);
      
      // Clean up on component destruction
      return () => {
        window.removeEventListener('click', handleWindowClick);
        if (unobserveFunction) unobserveFunction();
      };
    } catch (error) {
      console.error('Error initializing:', error);
    }
  });
</script>

<!-- Mark non-interactive areas with a data attribute -->
<div class="flex flex-col min-h-screen bg-slate-100/50">
  <!-- Fixed header area -->
  <div class="relative top-0 left-0 right-0 z-50">
    <div class="header flex align-baseline justify-between font-sans bg-slate-900 text-slate-50">
      <div class="flex gap-2 justify-evenly items-center">
        <Balanced class="p-2 max-h-12 max-w-12 text-slate-300" />
        <h1 class="flex text-sm text-slate-300 font-medium tracking-wide uppercase">
            RPDD + PRV Constellation
        </h1>
      </div>
      <button 
      class="interactive-element flex px-2 gap-2 align-middle items-center justify-center font-medium text-xs transition-colors text-slate-800 bg-emerald-200 hover:bg-[#FF4A4A] hover:text-slate-50"
      on:click={() => isHowToReadOpen = true}
    >
      <Globe size={16}/>
      How to Navigate
    </button>
    </div>
    
    <nav class="nav-bar justify-stretch bg-slate-50 w-full h-full pt-2 px-2">
      <div class="flex place-items-baseline gap-4 justify-between min-w-full mx-auto">
        <!-- Desktop Navigation -->
        <div class="hidden md:flex">
          {#each ['By Sponsor', 'By Therapeutic Area', 'By Transactions', 'Program Overview'] as tab}
            <button
              class="tab-button px-4 py-2 text-xs transition-colors duration-300 ease-in-out tracking-relaxed 
              {activeTab === tab ? 
                'text-[#FF5501] px-2 font-bold border-b-2 border-[#FF5501] active-tab' : 
                'hover:text-[#e05501] text-slate-400 px-2 hover:text-orange-500'}"
              on:click={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          {/each}
        </div>

        <!-- Mobile Navigation -->
        <div class="relative md:hidden">
          <button
            class="flex items-center gap-2 px-2 py-2 text-xs font-medium text-slate-700 bg-white rounded-full ring-1 ring-emerald-200 shadow-sm hover:bg-slate-50 focus:outline-none"
            on:click={(e) => {
              toggleDropdown(e);
              tracker.trackDashboardInteraction('toggle_mobile_dropdown');
            }}
          >
            {activeTab}
            <ChevronDown
              size={16}
              class="transform transition-transform duration-200 {isDropdownOpen ? 'rotate-180' : ''}"
            />
          </button>

          {#if isDropdownOpen}
            <div
              class="absolute left-0 mt-2 rounded-md shadow-lg bg-white ring-2 ring-emerald-500 px-2 z-50"
              on:click|stopPropagation
            >
              <div class="py-1" role="menu" aria-orientation="vertical">
                {#each ['By Sponsor', 'By Therapeutic Area', 'By Transactions', 'Program Overview'] as tab}
                  <button
                    class="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-[#FF5501]
                    {activeTab === tab ? 'bg-emerald-200 text-[#FF5501] font-medium' : ''}"
                    on:click={(e) => handleMobileTabSelect(tab, e)}
                    role="menuitem"
                  >
                    {tab}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- Search and Dashboard Buttons -->
        <div class="flex gap-2 items-stretch">
          <!-- Search component with responsive width -->
          <div class="w-full md:w-48 lg:w-64">
            <RpdprvSearch
              data={rpddData}
              onShowDrugDetail={handleShowDrugDetail}
              onShowCompanyDetail={handleShowCompanyDetail}
              onSearch={(term, count) => tracker.trackSearch(term, count)}
            />
          </div>
          
          <!-- Dashboard button with responsive design -->
          <button 
            class="interactive-element hidden md:flex px-2 justify-center place-items-center rounded-sm gap-1 align-middle font-normal text-xs transition-colors text-slate-50 bg-slate-600 hover:bg-[#FF4A4A] hover:text-slate-50"
            on:click={handleDashboardClick}
          >
            <DashboardReference size={16}/>
            <span class="hidden lg:inline">Dashboard</span>
          </button>
          
          <!-- Mobile Dashboard Icon Button -->
          <button 
            class="interactive-element md:hidden p-2 rounded-sm transition-colors text-slate-50 bg-slate-600 hover:bg-[#FF4A4A]"
            on:click={handleDashboardClick}
          >
            <DashboardReference size={16}/>
          </button>
        </div>
      </div>
    </nav>
  </div>
  
  <!-- Main content area with proper spacing -->
  <main class="flex-1 mt-4 pb-8">
    <div class="tab-content w-full h-full flex relative">
      <!-- Main content area taking full width -->
      <div class="{activeTab === 'Program Overview' ? 'w-full px-8' : 'w-full px-4'}">
        {#if activeTab === 'By Sponsor'}
          <div class="flex flex-row flex-grow relative">
            <!-- Main visualization area taking full width -->
            <div class="w-full h-full relative" data-section="sponsor-visualization" data-section-name="Sponsor Visualization">
              <InfiniteCanvasWrapper bind:this={infiniteCanvas} let:mainGroup let:showTooltip let:hideTooltip>
                {#if mainGroup}
                  <RpdprvCompanyTree 
                    data={filteredData}
                    isAllYearView={selectedYear === "All"}
                    onCompanyHover={handleCompanyHover}
                    onStageHover={(entries) => {
                      handleStageHover(entries);
                      if (entries.length > 0) {
                        tracker.trackVisualizationInteraction(
                          'stage_view',
                          'hover',
                          { stage: entries[0]['Current Development Stage'], count: entries.length }
                        );
                      }
                    }}
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

            <!-- Left timeline sidebar -->
            {#if activeTab !== 'Program Overview'}
              <div class="absolute left-0 top-0 h-fit w-fit z-10">
                <div class="h-full bg-white/70 ring-1 ring-slate-100 backdrop-blur-sm shadow-lg rounded-r-lg py-6 flex flex-col">    <!-- Timeline content -->
                  <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-200 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500">
                    {#if activeTab === 'By Transactions'}
                      <PRVPurchaseTimeline 
                        data={rpddData}
                        selectedYear={selectedTransactionYear}
                        onYearSelect={handleTransactionYearSelect}
                        transactionYearSelected={handleTransactionYearSelect}
                      />
                    {:else}
                      <RPDPRVVerticalTimeline 
                        data={rpddData}
                        selectedYear={selectedYear}
                        onYearSelect={handleYearSelect}
                      />
                    {/if}
                  </div>
                </div>
              </div>
            {/if}

            <!-- Right information sidebar -->
            <div class="absolute right-0 top-16 h-fit fit max-h-[1280px] {isSidebarCollapsed ? 'w-16' : 'w-96'} transition-all duration-300">
              <button
                class="rounded-btn absolute -left-3 top-4 z-50 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full shadow-md transition-colors duration-200"
                on:click={() => isSidebarCollapsed = !isSidebarCollapsed}
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg
                  class="w-4 h-4 transform transition-transform duration-200 {isSidebarCollapsed ? 'rotate-180' : ''}"
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
              <div class="h-full {isSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg rounded-l-lg p-6 flex flex-col">
                <!-- Sidebar header stays at top -->
                <div class="flex-none mb-4">
                  <h4 class="text-xs uppercase font-semibold text-slate-600">
                    {currentArea ? `${currentArea}` : 'Overview'}
                  </h4>
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
          </div>

        <!-- By Therapeutic Area Tab Layout -->  
        {:else if activeTab === 'By Therapeutic Area'}
          <div class="flex flex-row relative">
            <!-- Main visualization area taking full width -->
            <div class="w-full h-[calc(100vh-12rem)] relative" data-section="therapeutic-area-visualization" data-section-name="Therapeutic Area Visualization">
              <InfiniteCanvasWrapper bind:this={infiniteCanvas} let:mainGroup let:showTooltip let:hideTooltip>
                {#if mainGroup}
                  <RPDDRadialYear 
                    data={filteredData}
                    isAllYearView={selectedYear === "All"}
                    onCompanyHover={handleCompanyHover}
                    onStageHover={(entries) => {
                      handleStageHover(entries);
                      if (entries.length > 0) {
                        tracker.trackVisualizationInteraction(
                          'stage_view',
                          'hover',
                          { stage: entries[0]['Current Development Stage'], count: entries.length }
                        );
                      }
                    }}
                    onLeave={handleLeave}
                    onShowDrugDetail={handleShowDrugDetail}
                    onShowCompanyDetail={handleShowCompanyDetail}
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

            <!-- Left timeline sidebar -->
            {#if activeTab !== 'Program Overview'}
            <div class="absolute left-0 top-0 h-fit w-fit z-10">
              <div class="h-full bg-white/70 ring-1 ring-slate-100 backdrop-blur-sm shadow-lg rounded-r-lg py-6 flex flex-col"> 
                  <!-- Timeline content -->
                  <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-200 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500">
                    <RPDPRVVerticalTimeline 
                      data={rpddData}
                      selectedYear={selectedYear}
                      onYearSelect={handleYearSelect}
                    />
                  </div>
                </div>
              </div>
            {/if}

            <!-- Right information sidebar -->
            <div class="absolute right-0 top-0 h-full {isSidebarCollapsed ? 'w-16' : 'w-96'} transition-all duration-300">
              <button
                class="rounded-btn absolute -left-3 top-32 z-50 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full shadow-md transition-colors duration-200"
                on:click={() => isSidebarCollapsed = !isSidebarCollapsed}
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg
                  class="w-4 h-4 transform transition-transform duration-200 {isSidebarCollapsed ? 'rotate-180' : ''}"
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
              <div class="h-full {isSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-lg rounded-l-lg p-6 flex flex-col">
                <!-- Sidebar header stays at top -->
                <div class="flex-none mb-4">
                  <div class="sidebar-header">
                    <h4 class="text-xs uppercase font-semibold text-slate-600">              
                      {currentArea ? `${currentArea}` : 'Overview'}
                    </h4>
                  </div>
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
          </div>

          
        <!-- By Transactions Tab Layout -->
        {:else if activeTab === 'By Transactions'}
         <!-- Updated Transactions Tab Layout -->
          <div class="flex flex-row">
            <div class="w-{isSidebarCollapsed ? '11/12' : '4/5'} transition-all duration-300 pl-24" data-section="transactions-visualization" data-section-name="Transactions Visualization">
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

            <!-- Left timeline sidebar -->
            {#if activeTab !== 'Program Overview'}
              <div class="absolute left-0 top-0 h-fit w-fit z-10">
                <div class="h-full bg-white/70 ring-1 ring-slate-400 backdrop-blur-sm shadow-lg rounded-r-lg py-6 flex flex-col">    <!-- Timeline content -->
                  <div class="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-200 scrollbar-thumb-slate-400 hover:scrollbar-thumb-slate-500">
                    {#if activeTab === 'By Transactions'}
                      <PRVPurchaseTimeline 
                        data={rpddData}
                        selectedYear={selectedTransactionYear}
                        onYearSelect={handleTransactionYearSelect}
                        transactionYearSelected={handleTransactionYearSelect}
                      />
                    {:else}
                      <RPDPRVVerticalTimeline 
                        data={rpddData}
                        selectedYear={selectedYear}
                        onYearSelect={handleYearSelect}
                      />
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
            
            <div class="relative {isSidebarCollapsed ? 'w-1/12' : 'w-1/5'} transition-all duration-300 pr-8 pl-12">
              <button
                class="rounded-btn absolute -left-3 top-32 z-50 p-1.5 bg-white hover:bg-slate-200 rounded-full shadow-md transition-colors duration-200"
                on:click={() => isSidebarCollapsed = !isSidebarCollapsed}
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg
                  class="w-4 h-4 transform transition-transform duration-200 {isSidebarCollapsed ? 'rotate-180' : ''}"
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
              <div class="sticky top-32 {isSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-all duration-300">
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
          </div>

        <!-- Therapeutic Area Tab Layout -->  
        {:else if activeTab === 'By Therapeutic Area'}
          <div class="flex flex-row relative">
            <!-- Main visualization area taking full width -->
            <div class="w-full px-6 h-[calc(100vh-12rem)] relative">
              <InfiniteCanvasWrapper bind:this={infiniteCanvas} let:mainGroup let:showTooltip let:hideTooltip>
                {#if mainGroup}
                  <RPDDRadialYear 
                    data={filteredData}
                    isAllYearView={selectedYear === "All"}
                    onCompanyHover={handleCompanyHover}
                    onStageHover={(entries) => {
                      handleStageHover(entries);
                      if (entries.length > 0) {
                        tracker.trackVisualizationInteraction(
                          'stage_view',
                          'hover',
                          { stage: entries[0]['Current Development Stage'], count: entries.length }
                        );
                      }
                    }}
                    onLeave={handleLeave}
                    onShowDrugDetail={handleShowDrugDetail}
                    onShowCompanyDetail={handleShowCompanyDetail}
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
          </div>
          
        <!-- Program Overview (Analytics) Tab Layout -->
        {:else if activeTab === 'Program Overview'}
          <div class="w-full">
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6" data-section="program-analytics" data-section-name="Program Analytics">
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
            />            </div>
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
      {isDrawerOpen}
      onClose={handleCloseDrawer}
      onShowDrugDetail={handleShowDrugDetail}
      color={drawerProps.color}
    />
  {/if}
{/if}

<style>
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

  /* Custom scrollbar styles */
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
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
</style>
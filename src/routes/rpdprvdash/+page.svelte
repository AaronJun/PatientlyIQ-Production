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
  
  import RPDTransactionSummaryView from '$lib/rpdprvdash/sidebarComponents/RPDTransactionsSummary.svelte';
  import VoucherBeeswarmPlot from '$lib/rpdprvdash/VoucherBeeswarmPlot.svelte';
  
  import RpdCompanyDetailDrawer from '$lib/rpdprvdash/RPDCompanyDetailDrawer.svelte';
  import RPDPRVDrawer from '$lib/rpdprvdash/RPDPRVDrawer.svelte';
  import RPDPRVDashboardView from '$lib/rpdprvdash/RPDPRVDashboardView.svelte';
  import RpdprvCompanyDrawer from '$lib/rpdprvdash/RPDPRVCompanyDrawer.svelte';

  // New PRV Analytics Components
  import RPDPRVAnalytics from '$lib/rpdprvdash/AllView/SankeyWrapper.svelte';

  import { ArrowUpRight, Bee, DashboardReference, Globe, Analytics } from 'carbon-icons-svelte';
  import { Balanced } from 'carbon-pictograms-svelte';

  // Import data sources
  import rpddData from '$lib/data/rpdprvdash/mergeddata.json';
  import rpdCompanyValues from '$lib/data/rpdprvdash/rpdCompanyValues.json';
  import constellationDataRaw from '$lib/data/rpdprvdash/RPDConstellationData.json';

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
  
  // Process stock data and store by company
  let stockDataByCompany: Record<string, any[]> = {};
  
  // Filter data based on selected year (for non-transaction tabs)
  $: filteredData = selectedYear === "All" 
    ? rpddData // Use all data when "All" is selected
    : rpddData.filter(entry => entry["RPDD Year"] === selectedYear);
  
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
    
    // Reset sidebar view
    resetSidebarView();
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

  function handleDashboardClick() {
    isDashboardOpen = true;
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
      
      // Clean up on component destruction
      return () => {
        window.removeEventListener('click', handleWindowClick);
      };
    } catch (error) {
      console.error('Error initializing:', error);
    }
  });
</script>

<!-- Mark non-interactive areas with a data attribute -->
<div class="flex flex-col min-h-screen bg-slate-100/50">
  <!-- Fixed header area -->
  <div class="sticky top-0 left-0 right-0 z-50">
    <div class="header flex align-baseline font-sans bg-slate-900 text-slate-50 px-8">
      <div class="flex gap-2 justify-evenly items-center">
        <Balanced class="p-2 max-h-12 max-w-12 text-slate-300" />
        <h1 class="flex text-sm text-slate-300 font-medium tracking-wide uppercase">
            RPDD + PRV Constellation
        </h1>
      </div>
    </div>
    
    <nav class="nav-bar justify-stretch bg-slate-50 w-full h-full py-2 px-8">
      <div class="flex place-items-baseline gap-4 justify-between min-w-full mx-auto">
        <div class="flex">
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

        <div class="flex w-1/5 gap-2">
          <RpdprvSearch
            data={rpddData}
            onShowDrugDetail={handleShowDrugDetail}
            onShowCompanyDetail={handleShowCompanyDetail}
          />
          <button 
            class="interactive-element flex px-2 pt-2.5 rounded-sm gap-1 align-middle font-normal text-xs transition-colors text-slate-50 bg-slate-600 hover:bg-[#FF4A4A] hover:text-slate-50"
            on:click={handleDashboardClick}
          >
            <DashboardReference size={16}/>
            Dashboard
          </button>
        </div>
      </div>
    </nav>
  </div>
  
  <!-- Main content area with proper spacing -->
  <main class="flex-1 mt-4 pb-8">
    
    <div class="tab-content w-full h-full flex">
      <!-- Vertical timeline on the left - conditionally show either RPDD timeline or Purchase timeline -->
      <div class="timeline-wrapper max-w-1/5 min-h-full">
        {#if activeTab === 'By Transactions'}
        <PRVPurchaseTimeline 
        data={rpddData}
        selectedYear={selectedTransactionYear}
        onYearSelect={handleTransactionYearSelect}
        transactionYearSelected={handleTransactionYearSelect}
      />
        {:else if activeTab !== 'Program Overview'}
          <RPDPRVVerticalTimeline 
            data={rpddData}
            selectedYear={selectedYear}
            onYearSelect={handleYearSelect}
          />
        {/if}
        
      </div>

      <!-- Main content area with adjusted width to accommodate the vertical timeline -->
      <div class="{activeTab === 'Program Overview' ? 'w-full px-8' : 'flex-1 ml-4'}">
        {#if activeTab === 'By Sponsor'}
          <div class="flex flex-row flex-grow">
            <!-- Main visualization area -->
            <div class="w-4/5 pr-8 pl-2">
              <RpdprvCompanyTree 
                data={filteredData}
                isAllYearView={selectedYear === "All"}
                onCompanyHover={handleCompanyHover}
                onStageHover={handleStageHover}
                onLeave={handleLeave}
                onShowDrugDetail={handleShowDrugDetail}
                onShowCompanyDetail={handleShowCompanyDetail}
              />
            </div>

            <!-- Sticky sidebar -->
            <div class="w-1/5 pr-8 pl-12">
              <div class="sticky top-32">
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
                <div class="mt-12">
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
            <div class="w-4/5 px-12">
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
            
            <div class="w-1/5 pr-8 pl-12">
              <div class="sticky top-32">
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
          <div class="flex flex-row">
            <!-- Main visualization area -->
            <div class="w-4/5 px-6">
            <RPDDRadialYear 
                data={filteredData}
                onCompanyHover={handleCompanyHover}
                onStageHover={handleStageHover}
                onLeave={handleLeave}
                onShowDrugDetail={handleShowDrugDetail}
                onShowCompanyDetail={handleShowCompanyDetail}
              />
            </div>

            <!-- Sticky sidebar -->
            <div class="w-1/5 pr-8 pl-12">
              <div class="sticky top-32">
                <div class="sidebar-header mb-2">
                  <h4 class="text-xs uppercase font-semibold text-slate-600">              
                    {currentArea ? `${currentArea}` : 'Overview'}
                  </h4>
                </div>
                
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
                <div class="mt-12">
                  <RPDRadialLegend 
                    items={processedData}
                    {colorScale}
                  />
                </div>
              </div>
            </div>
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
            />            </div>
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>

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
    border-top: 0px;
    overflow-y: scroll;
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
  </style>
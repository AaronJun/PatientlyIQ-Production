<script lang="ts">
  import { onMount } from 'svelte';

  import RPDDRadialYear from '$lib/rpdprvdash/RPDPRVTherapeuticAreaChart.svelte';
  import RPDPRVVerticalTimeline from '$lib/rpdprvdash/RPDPRVTimeline.svelte';
  import VoucherBeeswarmPlot from '$lib/rpdprvdash/VoucherBeeswarmPlot.svelte';
  import CompanyMetricsList from '$lib/rpdprvdash/CompanyMetricsList.svelte';
  import AreaMetricsList from '$lib/rpdprvdash/AreaMetricsList.svelte';
  import RPDRadialLegend from '$lib/rpdprvdash/RPDRadialLegend.svelte';
  import RPDPRVDrawer from '$lib/rpdprvdash/RPDPRVDrawer.svelte';
  import RPDPRVDashboardView from '$lib/rpdprvdash/RPDPRVDashboardView.svelte';
  import RpdprvCompanyDrawer from '$lib/rpdprvdash/RPDPRVCompanyDrawer.svelte';
  import RpdprvSearch from '$lib/rpdprvdash/RPDPRVSearch.svelte';
  import RpdprvCompanyTree from '$lib/rpdprvdash/RPDPRVCompanyTree.svelte';
  import SellerBuyerChord from '$lib/rpdprvdash/SellerBuyerChord.svelte';
  import RpdCompanyDetailDrawer from '$lib/rpdprvdash/RPDCompanyDetailDrawer.svelte';

  import { ArrowUpRight, Bee, DashboardReference, Globe } from 'carbon-icons-svelte';
  import { Balanced } from 'carbon-pictograms-svelte';

  // Import data sources
  import rpddData from '$lib/data/rpdprvdash/mergeddata.json';
  import rpdCompanyValues from '$lib/data/rpdprvdash/rpdCompanyValues.json';
  import constellationDataRaw from '$lib/data/rpdprvdash/RPDConstellationData.json';

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

  let activeTab = 'By Sponsor';
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
  let selectedYear = "2023"; // Default year
  let isCompanyDetailDrawerOpen = false;
  let selectedCompany = "";
  
  // Process stock data and store by company
  let stockDataByCompany: Record<string, any[]> = {};
  
  // Filter data based on selected year
  $: filteredData = rpddData.filter(entry => entry["RPDD Year"] === selectedYear);
  
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
  }

  function getSummaryText() {
    if (!currentView || !currentEntries.length) return '';
    
    if (currentView === 'Company View' && currentCompanyMetrics) {
      // Return formatted metrics for company
      return null; // Will use the list format component instead
    } else if (currentView === 'Stage View') {
      const stats = {
        totalEntries: currentEntries.length,
        uniqueCompanies: new Set(currentEntries.map(d => d.Company)).size,
        uniqueIndications: new Set(currentEntries.map(d => d.Indication)).size
      };
      
      return `This development stage includes ${stats.totalEntries} drugs from ${stats.uniqueCompanies} companies across ${stats.uniqueIndications} indications.`;
    }
    return '';
  }

  function handleLeave() {
    currentEntries = [];
    currentView = null;
  }

  function setActiveTab(tab: string) {
    activeTab = tab;
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
      publicPrivate: companyEntries[0]?.['Public/Private'] || 'N/A',
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

  const colorMap: Record<string, string> = {
    'Neurology': '#FF6B6B',
    'Neuromuscular': '#FF1010',
    'Oncology': '#4ECDC4',
    'Metabolic': '#45B7D1',
    'Ophthalmology': '#96CEB4',
    'Cardiovascular': '#FFEEAD',
    'Pulmonology': '#D4A5A5',
    'Hematology': '#9DE0AD',
    'Endocrinology': '#FF9F1C',
    'Genetic': '#2EC4B6',
    'Immunology': '#E71D36',
    'Gastroenterology': '#FDFFB6',
  'Hepatology': '#CBE896',
    'Dermatology': '#FFA07A',
    'Neonatology': '#98D8C8',
    'Urology': '#B8B8D1'
  };

  const colorScale = (area: string) => colorMap[area] || '#999999';

  const processedData = Object.entries(
    rpddData.reduce((acc, d) => {
      if (d.TherapeuticArea1) {
        acc[d.TherapeuticArea1] = (acc[d.TherapeuticArea1] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([area, count]) => ({ area, count }));

  onMount(() => {
    try {
      // Process stock data on mount
      stockDataByCompany = processStockData(rpdCompanyValues);
      
      // Other initialization logic
      if (constellationDataRaw) {
        processedConstellationData = constellationDataRaw;
      }
    } catch (error) {
      console.error('Error initializing:', error);
    }
  });
</script>

<div class="flex flex-col min-h-screen bg-slate-100/50">
  <!-- Fixed header area -->
  <div class="z-50">
    <div class="header flex align-baseline font-sans shadow-md bg-slate-800 text-slate-50 px-8">
      <div class="flex gap-2 justify-evenly items-center">
        <Balanced class="p-2 max-h-12 max-w-12 text-slate-300" />
        <h1 class="flex text-sm text-slate-300 font-medium tracking-wide uppercase">
            RPDD + PRV Constellation
        </h1>
      </div>
    </div>
    
    <nav class="nav-bar justify-stretch bg-slate-800 w-full h-full py-4 px-8">
      <div class="flex place-items-baseline gap-4 justify-between min-w-full mx-auto">
        <div class="flex gap-2">
          {#each ['By Sponsor', 'By Therapeutic Area', 'By Transactions'] as tab}
            <button
              class="tab-button px-4 py-2 text-xs transition-colors duration-300 ease-in-out tracking-relaxed 
              {activeTab === tab ? 
                'bg-[#ff4a4a] shadow-lg text-slate-100 px-4 font-semibold' : 
                'bg-slate-600 hover:bg-[#FF5501] text-slate-400 px-2 hover:text-slate-50 hover:px-4'}"
              on:click={() => setActiveTab(tab)}
              >
              {tab}
            </button>
          {/each}
        </div>

        <div class="flex gap-4 min-w-96">
          <RpdprvSearch
            data={rpddData}
            onShowDrugDetail={handleShowDrugDetail}
            onShowCompanyDetail={handleShowCompanyDetail}
          />
          <button 
            class="flex px-2 pt-2.5 rounded-sm gap-2 align-middle font-normal text-xs transition-colors text-slate-50 bg-slate-600 hover:bg-[#FF4A4A] hover:text-slate-50"
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
  <main class="flex-1 pb-[4vh]">
    
    <div class="tab-content w-full h-full flex">
      <!-- Vertical timeline on the right side -->
      <div class="sticky top-[calc(20vh)">
      <div class="timeline-wrapper top-[calc(20vh) h-fit border-l border-slate-200 flex items-center justify-center pt-12 p-2">
        <RPDPRVVerticalTimeline 
          data={rpddData}
          selectedYear={selectedYear}
          onYearSelect={handleYearSelect}
        />
      </div>
      <div class="legend flex flex-row w-full">
        <RPDRadialLegend 
        items={processedData}
        {colorScale}
        />
        </div>
    </div>

      <!-- Main content area with adjusted width to accommodate the vertical timeline -->
      <div class="w-[calc(100%-5rem)]">
        {#if activeTab === 'By Sponsor'}
          <div class="flex flex-row flex-grow px-2">
            <!-- Main visualization area -->
            <div class="w-5/6 flex-col pb-18 pr-8 pl-8">
              <RpdprvCompanyTree 
                data={filteredData}
                onCompanyHover={handleCompanyHover}``
                onStageHover={handleStageHover}
                onLeave={handleLeave}
                onShowDrugDetail={handleShowDrugDetail}
                onShowCompanyDetail={handleShowCompanyDetail}
              />
            </div>

        <!-- Sticky sidebar -->
          <div class="w-1/6 max-w-[320px] mx-8">
              <div class="sticky top-[calc(20vh)] max-h-[80vh]">
              <div class="sidebar-header ml-2 flex gap-2 uppercase place-items-center">
                <div class="w-2 h-2 rounded-full bg-slate-600" />               
                <h4 class="text-xs/snug uppercase font-base">              
                  {currentView || 'Overview by Sponsor'}
                </h4>
              </div>
          <!-- Updated sidebar implementation with clickable cards -->
<div class="sidebar bg-slate-50/50 pt-4 px-2 overflow-y-auto" style="max-height: calc(80vh - 2rem)">
  <div class="space-y-6">
    <div class="mb-12">
    {#if currentView === 'Company View' && currentCompanyMetrics}
      <!-- Display company metrics in list format -->
      <CompanyMetricsList metrics={currentCompanyMetrics} />
    {:else if currentView === 'Stage View' && currentEntries.length > 0}
      <!-- Display stage summary -->
      <p class="text-sm/snug w-full pr-2 max-w-4xl text-slate-900">
        This development stage includes {currentEntries.length} drugs from 
        {new Set(currentEntries.map(d => d.Company)).size} companies across 
        {new Set(currentEntries.map(d => d.Indication)).size} indications.
      </p>
    {/if}
  </div>
    <div class="space-y-4">
      {#each currentEntries as entry}
        <!-- Added onClick handler to the card -->
        <div 
          class="card px-4 py-4 hover:bg-slate-200 hover:cursor-pointer transition-all duration-200 ease-in-out"
          on:click={() => handleShowDrugDetail({
            drugName: entry.Candidate,
            year: entry["RPDD Year"],
            Company: entry.Company,
            therapeuticArea: entry.TherapeuticArea1,
            entries: currentEntries.filter(d => d.TherapeuticArea1 === entry.TherapeuticArea1),
            color: colorMap[entry.TherapeuticArea1] || '#999999',
            currentStage: entry["Current Development Stage"] || "TBD",
            indication: entry.Indication || "",
            rpddAwardDate: entry["RPDD Year"],
            voucherAwardDate: entry["PRV Issue Year"] || "",
            treatmentClass: entry.Class1 || "TBD",
            mechanismOfAction: entry.MOA || "TBD",
            companyUrl: entry["Link to CrunchBase"] || ""
          })}
        >
          <div class="flex flex-col">
            <div class="flex justify-between items-start">
              <h3 class="text-sm font-semibold text-slate-900">{entry.Candidate}</h3>
              <ArrowUpRight class="text-slate-500" size={16} />
            </div>
            <div>
              <p class="text-xs text-slate-500 capitalize mt-2">{entry.Indication}</p>
            </div>
            <div class="flex gap-2">
            <span class="text-[9.25px] w-fit mt-2 bg-slate-200 text-slate-800 px-2 py-1 rounded-lg" style="border: .5px solid #565656">
              {entry["Current Development Stage"]}
            </span>
            <span class="text-[9.25px] w-fit mt-2 bg-slate-200 text-slate-800 px-2 py-1 rounded-lg" style=" background-color: {colorMap[entry.TherapeuticArea1] || '#999999'}">
              {entry.TherapeuticArea1}
            </span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
</div>
</div>
</div>

<!-- By Transactions Tab Layout -->
{:else if activeTab === 'By Transactions'}
  <div class="flex flex-row">
    <div class="w-5/6 bg-slate-50">
      <SellerBuyerChord 
        data={rpddData}
        stockData={rpdCompanyValues}
        {highlightedTransaction}
        onShowDrugDetail={handleShowDrugDetail}
        on:transactionHover={(event) => highlightedTransaction = event.detail}
        on:transactionLeave={() => highlightedTransaction = null}
      />

    </div>
    
    <div class="w-1/6 min-w-[300px]">
        <div class="sticky top-[calc(20vh)] max-h-[80vh]">
        <div class="sidebar-header ml-2 flex gap-2 uppercase place-items-center">
          <div class="w-2 h-2 rounded-full bg-slate-600" />               
          <h4 class="text-xs/snug uppercase font-base">                              
            Transaction Value Distribution</h4>
        </div>
        <div class="sidebar overflow-hidden py-12" style="height: calc(80vh - 2rem)">
          <VoucherBeeswarmPlot 
            data={rpddData}
            {highlightedTransaction}
            onPointClick={handleShowDrugDetail}
            on:transactionHover={(event) => highlightedTransaction = event.detail}
            on:transactionLeave={() => highlightedTransaction = null}
          />
        </div>
      </div>
    </div>
  </div>

<!-- Therapeutic Area Tab Layout -->  
{:else if activeTab === 'By Therapeutic Area'}
  <div class="flex flex-col">
    <!-- Main content area with visualization and sticky sidebar -->
    <div class="flex flex-row flex-grow px-2">
      <!-- Main visualization area -->
      <div class="w-5/6 flex-col pb-18 pr-8 pl-8">
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
   <!-- Updated Therapeutic Area tab sidebar with consistent styling -->
<div class="w-1/6 max-w-[420px] align-top">
    <div class="sticky top-[calc(20vh)] max-h-[80vh]">
    <div class="sidebar-header ml-2 flex gap-2 uppercase place-items-center">
      <div class="w-2 h-2 rounded-full bg-slate-600" />               
      <h4 class="text-xs/snug uppercase font-base">              
        {currentArea ? currentArea : 'By Therapeutic Area'}
      </h4>
  </div>                
    <div class="sidebar bg-slate-50/50 pt-4 px-2 overflow-y-auto" 
    style="max-height: calc(90vh - 2rem)">
      <div class="space-y-2">
        {#if currentEntries.length > 0 && currentArea && areaMetrics}
          <AreaMetricsList 
            metrics={{
              areaName: currentArea,
              totalDrugs: areaMetrics.totalDrugs,
              uniqueCompanies: areaMetrics.uniqueCompanies,
              uniqueCandidates: areaMetrics.uniqueCandidates
            }}
            color={colorMap[currentArea] || '#4ECDC4'}
          />
        {/if}
        
        <!-- Entries list -->
        <div class="space-y-4">
          {#each currentEntries as entry}
            <div 
              class="card px-4 py-4 hover:bg-slate-200 hover:cursor-pointer transition-all duration-200 ease-in-out"
              on:click={() => handleShowDrugDetail({
                drugName: entry.Candidate,
                year: entry["RPDD Year"],
                Company: entry.Company,
                therapeuticArea: entry.TherapeuticArea1,
                currentStage: entry["Current Development Stage"],
                indication: entry.Indication,
                entries: currentEntries,
                color: colorScale(entry.TherapeuticArea1),
                rpddAwardDate: entry["RPDD Year"],
                voucherAwardDate: entry["PRV Issue Year"] || "",
                treatmentClass: entry.Class1 || "TBD",
                mechanismOfAction: entry.MOA || "TBD",
                companyUrl: entry["Link to CrunchBase"] || ""
              })}
            >
              <div class="flex flex-col gap-2">
                <div class="flex justify-between items-start">
                  <h3 class="text-xs font-semibold capitalize text-slate-800">{entry.Candidate}</h3>
                  <span class="text-[9.25px] bg-slate-200 text-slate-800 p-2 rounded-sm">
                    {entry["Current Development Stage"]}
                  </span>
                </div>
                <p class="text-xs text-slate-800">{entry.Candidate}</p>
                <div>
                  <p class="text-xs capitalize text-slate-500">{entry.Indication}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
          </div>
        </div>
      {/if}
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
    <RpdprvCompanyDrawer
      Company={drawerProps.Company}
      entries={drawerProps.entries}
      color={drawerProps.color}
      companyUrl={drawerProps.companyUrl}
      country={drawerProps.country}
      publicPrivate={drawerProps.publicPrivate}
      marketCap={drawerProps.marketCap}
      {isDrawerOpen}
      onClose={handleCloseDrawer}
    />
  {:else}
    <RPDPRVDrawer
      {...drawerProps}
      {isDrawerOpen}
      onClose={handleCloseDrawer}
      onShowCompanyDetail={handleShowCompanyDetail}
    />
  {/if}
{/if}

{#if isCompanyDetailDrawerOpen}
  <RpdCompanyDetailDrawer
    isOpen={isCompanyDetailDrawerOpen}
    companyName={selectedCompany}
    allData={rpddData}
    stockData={stockDataByCompany[selectedCompany] || []}
    onClose={handleCloseDrawer}
    onShowDrugDetail={handleShowDrugDetail}
    color={drawerProps.color}
  />
{/if}

<style>
.tab-button {
  border-bottom: 2px solid #ff7373;
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
    text-decoration: underline dotted;
    padding: 0 0.15rem;
  }

  .card {
    border-bottom: .5px dotted #535353;
    padding: .25rem 1rem 1rem 0;
  }
</style>
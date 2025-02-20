<script lang="ts">
  import { onMount } from 'svelte';

  import RPDDRadialYear from '$lib/rpdprvdash/RPDPRVTherapeuticAreaChart.svelte';
  import RpdprvTimeline from '$lib/rpdprvdash/RPDPRVTimeline.svelte';
  import VoucherBeeswarmPlot from '$lib/rpdprvdash/VoucherBeeswarmPlot.svelte';
  import { RadialTimeline, YearlySummary } from '$lib/componentStores';

  import RPDRadialLegend from '$lib/rpdprvdash/RPDRadialLegend.svelte';
  import RPDPRVDrawer from '$lib/rpdprvdash/RPDPRVDrawer.svelte';
  import RPDPRVDashboardView from '$lib/rpdprvdash/RPDPRVDashboardView.svelte';
  import RpdprvCompanyDrawer from '$lib/rpdprvdash/RPDPRVCompanyDrawer.svelte';
  import RpdprvSearch from '$lib/rpdprvdash/RPDPRVSearch.svelte';
  import RpdprvCompanyTree from '$lib/rpdprvdash/RPDPRVCompanyTree.svelte';
  import SellerBuyerChord from '$lib/rpdprvdash/SellerBuyerChord.svelte';
  import SaleBenchmarks from '$lib/RPDComponents/SaleBenchmarks.svelte';

  import rpddData from '$lib/data/rpdprvdash/mergeddata.json';
  import rpdPrvDataRaw from '../data/RPDPRVOverviewData.json';
  import constellationDataRaw from '$lib/data/rpdprvdash/RPDConstellationData.json';

  import { Bee, DashboardReference, Globe } from 'carbon-icons-svelte';
  import { Balanced } from 'carbon-pictograms-svelte';

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
    // Add new company info properties
    country?: string;
    publicPrivate?: string;
    marketCap?: string;
  }


  let activeTab = 'By Sponsor + Stage';
  let processedRpdPrvData: rpddData[] = [];
  let highlightedTransaction: { seller: string, buyer: string } | null = null;
  let selectedData: ConstellationEntry | null = null;
  let processedConstellationData: ConstellationEntry[] = [];
  let selectedColor: string = "";
  let currentArea: string | null = null;
  let currentView: string | null = null;
  let currentEntries: any[] = [];
  let isDrawerOpen = false;
  let isDashboardOpen = false;
  let selectedYear = "2023"; // Default year
  
  // Filter data based on selected year
  $: filteredData = rpddData.filter(entry => entry["RPDD Year"] === selectedYear);
  
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

  function getColorForTherapeuticArea(ta: string): string {
    const colorMap = {
    "Gastroenterology": "#a6cee3",
    "Neurology": "#1f78b4",
    "Ophthalmology": "#6C6C6C",
    "Immunology": "#33a02c",
    "Metabolic": "#fb9a99",
    "Dermatology": "#fdbf6f",
    "Hematology": "#e31a1c",
    "Orthopedics": "#ff7f00",
    "Pulmonology": "#cab2d6",
    "Nephrology": "#6a3d9a",
    "Oncology": "#ffff99",
    "Endocrinology": "#b15928",
    "Hepatology": "#8dd3c7",
  };
    return colorMap[ta] || "#000000";
  }

  function handleCompanyHover(entries: any[]) {
    currentEntries = entries;
    currentView = 'Company View';
  }

  function handleStageHover(entries: any[]) {
    currentEntries = entries;
    currentView = 'Stage View';
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
    drawerProps = {
      isCompanyView: true,
      Company: detail.Company,
      entries: companyEntries,
      color: '#37587e',
      companyUrl: detail.companyUrl,
      // Add company info from the first entry
      country: companyEntries[0]?.COUNTRY || 'N/A',
      publicPrivate: companyEntries[0]?.['Public/Private'] || 'N/A',
      marketCap: companyEntries[0]?.MarketCap || 'N/A'
    };
    isDrawerOpen = true;
  }

  function handleShowDrugDetail(detail: any) {
    drawerProps = {
      isCompanyView: false,
      ...detail
    };
    isDrawerOpen = true;
  }

  function handleCloseDrawer() {
    isDrawerOpen = false;
  }

  function handleDashboardClick() {
    isDashboardOpen = true;
  }

  function handleDashboardClose() {
    isDashboardOpen = false;
  }

  function getSummaryText() {
    if (!currentView || !currentEntries.length) return '';
    
    const stats = {
      totalEntries: currentEntries.length,
      companyName: currentEntries[0].Company,
      uniqueCompanies: new Set(currentEntries.map(d => d.Company)).size,
      uniqueIndications: new Set(currentEntries.map(d => d.Indication)).size,
      uniqueAreas: new Set(currentEntries.map(d => d.TherapeuticArea1)).size
    };
    
    if (currentView === 'Company View') {
      return `This company has ${stats.totalEntries} drugs in development across ${stats.uniqueIndications} indications in ${stats.uniqueAreas} therapeutic areas.`;
    } else if (currentView === 'Stage View') {
      return `This development stage includes ${stats.totalEntries} drugs from ${stats.uniqueCompanies} companies across ${stats.uniqueIndications} indications.`;
    }
    return '';
  }

  const handleClusterElementClick = (event: CustomEvent) => {
    const { entry, color } = event.detail;
    selectedData = entry;
    selectedColor = color;
    isDrawerOpen = true;
  };

  const colorMap: Record<string, string> = {
    'Neurology': '#FF6B6B',
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

  onMount(async () => {
    try {
      processedConstellationData = processConstellationData(constellationDataRaw as ConstellationEntry[]);
            
    } catch (error) {
      console.error('Error initializing:', error);
    }
  });
</script>

<div class="flex flex-col min-h-screen bg-slate-50">
  <!-- Fixed header area -->
  <div class="fixed top-0 left-0 right-0 z-50 bg-slate-50">
    <div class="header flex align-baseline justify-between font-sans bg-slate-100 text-slate-800 font-medium text-6xl px-4 py-4">
      <div class="flex gap-12 align-middle justify-evenly items-center">
        <Balanced class="p-1 mb-2 max-h-8 max-w-8 rounded-full bg-slate-700 text-slate-50" />
        <h1 class="flex">
          <span class="text-sm">
            RPDD + PRV Constellation
          </span>
        </h1>
      </div>
    </div>
    
    <nav class="justify-stretch w-full bg-slate-50 border-b border-slate-200 shadow-sm">
      <div class="flex align-baseline place-items-baseline gap-12 justify-between px-4 min-w-full max-w-7xl mx-auto my-auto">
        <div class="flex mt-4 mb-2 space-x-4">
          {#each ['By Sponsor + Stage', 'By Therapeutic Area', 'By Transactions'] as tab}
            <button
              class="px-1 py-1 border-b-2 font-normal text-xs transition-colors
              {activeTab === tab ? 
                'border-orange-500 text-orange-600 font-semibold' : 
                'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}"
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
            <DashboardReference size={14}/>
            Dashboard
          </button>
        </div>
      </div>
      <div class="w-full max-w-5xl justify-start">
        <RpdprvTimeline 
          data={rpddData}
          selectedYear="2023"
          onYearSelect={handleYearSelect}
        />
      </div>    
    </nav>
  </div>
  
  <!-- Main content area with proper spacing -->
  <main class="flex-1 pt-[calc(24vh)] pb-[4vh]">
    <div class="tab-content w-full">
      {#if activeTab === 'By Sponsor + Stage'}
        <div class="flex flex-row flex-grow px-2 py-4">
          <!-- Main visualization area -->
          <div class="w-5/6 flex-col pb-18 pr-24 pl-8">
            <RpdprvCompanyTree 
              data={filteredData}
              onCompanyHover={handleCompanyHover}
              onStageHover={handleStageHover}
              onLeave={handleLeave}
              onShowDrugDetail={handleShowDrugDetail}
              onShowCompanyDetail={handleShowCompanyDetail}
            />
            <div class="legend flex flex-row mx-auto w-full place-content-center pt-8">
              <RPDRadialLegend 
                items={processedData}
                {colorScale}
              />
            </div>
          </div>

          <!-- Sticky sidebar -->
          <div class="w-1/6 max-w-[320px] mx-8">
            <div class="sticky top-[calc(24vh+1rem)]">
              <div class="sidebar-header ml-2 flex gap-2 uppercase place-items-center">
              <div class="w-2 h-2 rounded-full bg-slate-600" />               
                <h4 class="text-xs/snug uppercase font-base">              
                  {currentView || 'Overview by Sponsor'}
                </h4>
              </div>
              <div class="sidebar bg-slate-50/50 pt-4 px-2 overflow-y-auto" style="max-height: calc(72vh - 2rem)">
                <div class="space-y-6">
                  {#if currentEntries.length > 0}
                    <p class="text-sm/snug w-full pr-2 max-w-4xl text-slate-900">
                      {getSummaryText()}
                    </p>
                  {/if}
                  
                  <div class="space-y-4">
                {#each currentEntries as entry}
                  <div class="card px-4 py-4 hover:bg-slate-200 hover:cursor-pointer transition-all duration-200 ease-in-out">
                    <div class="flex flex-col gap-2">
                      <div class="flex justify-between items-start">
                        <h3 class="text-sm font-semibold text-slate-900">{entry.Company}</h3>
                        <span class="text-[8.25px] bg-slate-200 text-slate-800 px-1 py-1 rounded-sm">
                          {entry["Current Development Stage"]}
                        </span>
                      </div>
                      <div>
                        <p class="text-sm text-slate-600">{entry.Candidate}</p>
                        <p class="text-xs text-slate-400 mt-1">{entry.Indication}</p>
                        <p class="text-xs text-slate-400 mt-1">{entry.TherapeuticArea1}</p>
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

        {:else if activeTab === 'By Transactions'}
        <div class="flex flex-row gap-8 px-4">
          <div class="w-5/6 bg-slate-50 rounded-lg shadow-sm">
            <SellerBuyerChord 
              data={rpddData}
              {highlightedTransaction}
              onShowDrugDetail={handleShowDrugDetail}
              on:transactionHover={(event) => highlightedTransaction = event.detail}
              on:transactionLeave={() => highlightedTransaction = null}
            />
            <div class="legend flex flex-row mx-auto w-full place-content-center pt-8">
              <RPDRadialLegend 
                items={processedData}
                {colorScale}
              />
            </div>
          </div>
          
          <div class="w-1/6 min-w-[300px] mx-8">
            <div class="sticky top-[calc(24vh+1rem)]">
              <div class="sidebar-header ml-2 flex gap-2 uppercase place-items-center">
                <div class="w-2 h-2 rounded-full bg-slate-600" />               
                <h4 class="text-xs/snug uppercase font-base">                              
                  Transaction Value Distribution</h4>
              </div>
              <div class="sidebar overflow-hidden py-12" style="height: calc(72vh - 2rem)">
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
  <div class="flex flex-row flex-grow px-2 py-4">
    <!-- Main visualization area -->
    <div class="w-5/6 flex-col pb-18 pr-24 pl-8">
      <RPDDRadialYear 
        data={filteredData}
        onCompanyHover={handleCompanyHover}
        onStageHover={handleStageHover}
        onLeave={handleLeave}
        onShowDrugDetail={handleShowDrugDetail}
        onShowCompanyDetail={handleShowCompanyDetail}
      />
      
      <!-- Legend section -->
      <div class="legend flex flex-row mx-auto w-full place-content-center pt-8">
        <div class="info-panel bg-slate-100/50 pt-4 px-4 w-full max-w-3xl">
          <RPDRadialLegend 
            items={processedData}
            {colorScale}
          />
        </div>
      </div>
    </div>

    <!-- Sticky sidebar -->
    <div class="w-1/6 max-w-[350px] mx-8">
      <div class="sticky top-[calc(24vh+1rem)]">
        <div class="sidebar-header ml-2 flex gap-2 uppercase place-items-center">
          <div class="w-2 h-2 rounded-full bg-slate-600" />               
          <h4 class="text-xs/snug uppercase font-base">              
            {currentArea ? currentArea : 'Overview by Therapeutic Area'}
          </h4>
        </div>                
        <div class="sidebar pt-4 px-2 overflow-y-auto" style="max-height: calc(72vh - 2rem)">
          <div class="space-y-6">
            {#if currentEntries.length > 0}
              <p class="text-sm w-full pr-2 max-w-4xl text-slate-900">
                <span class="highlight">{currentArea}</span> represents 
                <span class="highlight">{currentEntries.length}</span> RPDDs from
                <span class="highlight">{new Set(currentEntries.map(d => d.Company)).size}</span> unique companies,
                developing <span class="highlight">{new Set(currentEntries.map(d => d.Candidate)).size}</span> candidates.
              </p>
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
                    color: colorScale(entry.TherapeuticArea1)
                  })}
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-xs capitalize text-slate-600 mt-1">{entry.Indication}</p>
                      <h3 class="text-sm font-semibold text-slate-900">{entry.Company}</h3>
                      <p class="text-xs text-slate-600 mt-1">{entry.Candidate}</p>
                    </div>
                    <span class="text-[8.25px] bg-slate-200 text-slate-800 px-1 py-1 rounded-sm">
                      {entry["Current Development Stage"]}
                    </span>
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
  {#if !drawerProps.isCompanyView}
    <RPDPRVDrawer
      {...drawerProps}
      {isDrawerOpen}
      onClose={handleCloseDrawer}
      onShowCompanyDetail={handleShowCompanyDetail}
    />
    {:else}
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
  {/if}
{/if}f

<style>
  .sidebar {
    max-height: 65vh;
    overflow-y: scroll;
    scrollbar-color: #e5e7eb #f9fafb;
    border-top: 0px;
    overflow-y: scroll;
  }
  .sidebar-header {
  }

  .legend {
    position: relative;
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
    padding-bottom: 2rem;
  }

  .header {
    min-height: 2vh;
    align-items: center;
    border-bottom: .525px solid #565656;
  }

  .highlight {
    color: #549E7D;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    text-decoration: underline dotted;
    padding: 0 0.15rem;
  }

  .card {
    border-bottom: .5px dotted #969696;
    padding: .25rem 1rem 1rem 0;
  }
</style>
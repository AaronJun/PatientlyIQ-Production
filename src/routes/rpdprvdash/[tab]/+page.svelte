<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { Separator } from 'bits-ui';
  import { page } from '$app/stores';
  import { goto, invalidate } from '$app/navigation';
  import { browser } from '$app/environment';
  
  // Import components
  import SponsorWrapper from '$lib/rpdprvdash/tabViews/SponsorWrapper.svelte';  
  import TherapeuticAreaWrapper from '$lib/rpdprvdash/tabViews/TherapeuticAreaWrapper.svelte';
  import RPDPRVAnalytics from '$lib/rpdprvdash/Overview/OverviewWrapper.svelte';
  import TransactionsWrapper from '$lib/rpdprvdash/tabViews/TransactionsWrapper.svelte';
  import NavHeader from '$lib/rpdprvdash/sidebarComponents/NavHeader.svelte';
  import HowToReadRadialChart from '$lib/rpdprvdash/HowToReadRadialChart.svelte';
  import RPDPRVDashboardView from '$lib/rpdprvdash/RPDPRVDashboardView.svelte';
  import RpdCompanyDetailDrawer from '$lib/rpdprvdash/RPDCompanyDetailDrawer.svelte';
  import RPDPRVDrawer from '$lib/rpdprvdash/RPDPRVDrawer.svelte';
  import TherapeuticAreaDetailDrawer from '$lib/rpdprvdash/components/TherapeuticAreaDetailDrawer.svelte';

  // Import utilities
  import { getTherapeuticAreaColor } from '$lib/rpdprvdash/utils/colorDefinitions';

  // Import data sources
  import rpddData from '$lib/data/rpdprvdash/mergeddata.json';
  import rpdCompanyValues from '$lib/data/rpdprvdash/rpdCompanyValues.json';
  import constellationDataRaw from '$lib/data/rpdprvdash/RPDConstellationData.json';

  // Define DataEntry interface for type safety
  interface DataEntry {
    'RPDD Year': string;
    'RPDD Date': string;
    'PRV Date': string;
    'PRV Year'?: string;
    'PRV Status'?: string;
    'Current Development Stage'?: string;
    Company: string;
    Candidate: string;
    Indication: string;
    TherapeuticArea1: string;
    COUNTRY?: string;
    'Public/Private/NIH'?: string;
    MarketCap?: string;
    [key: string]: string | number | boolean | undefined; // Index signature for other potential fields
  }

  // Type the data arrays
  const typedRpddData = rpddData as DataEntry[];
  const typedRpdCompanyValues = rpdCompanyValues as any[];
  
  // Get the tab parameter from the page store
  $: tab = $page.params.tab;
  let previousTab = ''; // Track previous tab for navigation
  
  // Map tab route parameters to display names
  const tabDisplayNames = {
    'overview': 'Program Overview',
    'sponsor': 'By Sponsor',
    'therapeutic-area': 'By Therapeutic Area',
    'transactions': 'By Transactions'
  };
  
  // Set the active tab based on the route parameter
  $: activeTab = tabDisplayNames[tab as keyof typeof tabDisplayNames] || 'Program Overview';
  
  // State variables
  let selectedYear = "2024"; // Default year
  let selectedTransactionYear = "All"; // Default transaction year
  let isDrawerOpen = false;
  let isDashboardOpen = false;
  let isCompanyDetailDrawerOpen = false;
  let isSidebarCollapsed = true; // Default to collapsed for vertical sidebar
  let isHowToReadOpen = false; // State variable for How to Read modal
  let isMobileView = false; // Track if we're in mobile view
  let isTabletView = false; // Track if we're in tablet/iPad view
  let processedConstellationData: any[] = [];
  let stockDataByCompany: Record<string, any[]> = {};
  let isNavigating = false;
  
  // State for drawer components
  interface DrawerProps {
    isCompanyView?: boolean;
    Company: string;
    drugName?: string;
    year?: string;
    therapeuticArea?: string;
    entries: DataEntry[];
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
  
  let drawerProps: DrawerProps = {
    isCompanyView: false,
    Company: '',
    drugName: '',
    entries: [],
    color: '',
    companyUrl: ''
  };
  
  interface TherapeuticAreaDetail {
    areaName: string;
    entries: DataEntry[];
    totalDrugs: number;
    uniqueCompanies: number;
    uniqueCandidates: number;
    clinicalTrials: number;
    vouchersAwarded: number;
    indications: Set<string>;
  }
  
  // Add state for therapeutic area drawer
  let isTherapeuticAreaDrawerOpen = false;
  let selectedTherapeuticAreaDetail: TherapeuticAreaDetail | null = null;
  
  // Filter data based on selected year (for non-transaction tabs)
  $: filteredData = selectedYear === "All" 
    ? typedRpddData // Use all data when "All" is selected
    : typedRpddData.filter(entry => {
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
  
  // Reset relevant state when tab changes
  $: if (tab !== previousTab && browser) {
    // Reset drawer states when changing tabs
    isDrawerOpen = false;
    isCompanyDetailDrawerOpen = false;
    isTherapeuticAreaDrawerOpen = false;
    isDashboardOpen = false;
    
    // Update the previous tab
    previousTab = tab;
    
    // Force invalidation of the current URL to ensure data is fresh
    invalidate(`/rpdprvdash/${tab}`);
  }
  
  // Functions
  async function handleTabSelect(tabName: string) {
    // Avoid navigation if already navigating
    if (isNavigating) return;
    
    try {
      isNavigating = true;
      
      // Convert display name to route parameter
      const tabParam = Object.entries(tabDisplayNames).find(([_, v]) => v === tabName)?.[0];
      if (tabParam && tabParam !== tab) {
        // Force hard navigation for better reliability
        const url = `/rpdprvdash/${tabParam}`;
        await goto(url, { invalidateAll: true });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      isNavigating = false;
    }
  }
  
  function handleSidebarToggle(event: CustomEvent<boolean>) {
    isSidebarCollapsed = event.detail;
  }
  
  function handleHowToNavigate() {
    isHowToReadOpen = true;
  }
  
  function handleDashboard() {
    isDashboardOpen = true;
  }
  
  function handleYearSelect(year: string) {
    selectedYear = year;
  }
  
  function handleTransactionYearSelect(year: string) {
    selectedTransactionYear = year;
  }
  
  function handleShowCompanyDetail(detail: any) {
    const companyEntries = detail.entries || typedRpddData.filter(entry => entry.Company === detail.Company);
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
  
  // Process stock data
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

  afterUpdate(() => {
    // Ensure the component re-renders properly after tab changes
    if (browser && previousTab !== tab) {
      previousTab = tab;
    }
  });

  onMount(() => {
    try {
      // Set initial previous tab
      previousTab = tab;
      
      // Process stock data on mount
      stockDataByCompany = processStockData(typedRpdCompanyValues);
      
      // Process constellation data
      if (constellationDataRaw) {
        processedConstellationData = constellationDataRaw;
      }
      
      // Check if we're in mobile view
      const checkMobileView = () => {
        isMobileView = window.innerWidth < 768; // 768px is the md breakpoint in Tailwind
        isTabletView = window.innerWidth >= 768 && window.innerWidth < 1200; // iPad-sized devices
      };
      
      // Initial check
      checkMobileView();
      
      // Add resize listener
      window.addEventListener('resize', checkMobileView);
      
      // Clean up on component destruction
      return () => {
        window.removeEventListener('resize', checkMobileView);
      };
    } catch (error) {
      console.error('Error initializing:', error);
    }
  });
</script>

<div class="sticky overflow-y-auto overflow-x-hidden md:h-16 z-20">
  <NavHeader 
    {activeTab} 
    isCollapsed={isSidebarCollapsed}
    on:tabSelect={(e) => handleTabSelect(e.detail)}
    on:toggleCollapse={handleSidebarToggle}
    on:howToNavigate={handleHowToNavigate}
    on:dashboard={handleDashboard}
  />
</div>
<div class="flex flex-col bg-slate-50 min-h-screen h-screen overflow-hidden">

  <!-- Main content area with proper spacing -->
  <main class="flex-1 relative transition-all duration-300 h-full overflow-hidden">

    <div class="tab-content w-full h-full z-0 flex relative">
      <!-- Main content area taking full width -->
      <div class="w-full relative h-full overflow-hidden">
        <!-- Tab content based on route parameter -->
        {#if tab === 'sponsor'}
          <SponsorWrapper
            data={typedRpddData}
            filteredData={filteredData}
            selectedYear={selectedYear}
            isSidebarCollapsed={isSidebarCollapsed}
            isMobileView={isMobileView}
            onShowDrugDetail={handleShowDrugDetail}
            onShowCompanyDetail={handleShowCompanyDetail}
            onShowTherapeuticAreaDetail={handleShowTherapeuticAreaDetail}
            onYearSelect={handleYearSelect}
            onHowToNavigate={handleHowToNavigate}
          />
        {:else if tab === 'therapeutic-area'}
          <TherapeuticAreaWrapper
            data={typedRpddData}
            filteredData={filteredData}
            selectedYear={selectedYear}
            isSidebarCollapsed={isSidebarCollapsed}
            isMobileView={isMobileView}
            isTabletView={isTabletView}
            onShowDrugDetail={handleShowDrugDetail}
            onShowCompanyDetail={handleShowCompanyDetail}
            onShowTherapeuticAreaDetail={handleShowTherapeuticAreaDetail}
            onYearSelect={handleYearSelect}
            onHowToNavigate={handleHowToNavigate}
          />
        {:else if tab === 'transactions'}
          <div class="transactions-tab-content flex flex-col h-full relative">
            <div class="flex h-full">
              <TransactionsWrapper 
                data={typedRpddData} 
                stockData={typedRpdCompanyValues}
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
        {:else if tab === 'overview'}
          <div class="overview-tab-content w-full h-full overflow-y-auto">
            <RPDPRVAnalytics 
              data={typedRpddData} 
              isAllYearView={selectedYear === "All"}
              on:navigateToSponsor={() => handleTabSelect('By Sponsor')}
              on:navigateToTab={(e) => {
                handleTabSelect(e.detail.tab);
              }}
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
            />
          </div>
        {/if}
      </div>
    </div>
  </main>
  
</div>

<Separator.Root
    class="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]"
/>
<footer class="flex flex-row justify-between w-full self-stretch pl-12 pr-2 gap-2 md:pl-12 md:pr-6 py-4">
  <div class="flex flex-col"> 
    <p class="text-2xs text-[#ff4a4a] font-mono">Copyright 2025 Patiently Studio</p>

    <a href="/contact" target="_blank" class="text-2xs text-sky-800 underline cursor-pointer underline-offset-4 font-semibold hover:text-emerald-500 font-mono">Contact us</a>
  </div>
  <div class="flex flex-col w-32 md:w-auto place-items-end justify-end text-right">
  <p class="text-2xs text-slate-500 font-mono">Data updated through <span class="text-[#ff4a4a]">{new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</span></p>
  </div>
</footer> 

<!-- Modals and Drawers -->
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
      allData={typedRpddData}
      stockData={typedRpdCompanyValues}
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
      onShowCompanyDetail={handleShowCompanyDetail}
    />
  {/if}
{/if}

{#if isTherapeuticAreaDrawerOpen}
  <TherapeuticAreaDetailDrawer 
    isOpen={isTherapeuticAreaDrawerOpen}
    areaDetail={selectedTherapeuticAreaDetail}
    onClose={handleCloseTherapeuticAreaDrawer}
    onShowDrugDetail={handleShowDrugDetail}
  />
{/if}

<style>
  .tab-content {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* Additional styles for full height containers */
  :global(.infinite-canvas-container) {
    height: 100% !important;
  }
  
  /* Mobile specific styles */
  @media (max-width: 768px) {
    :global(.infinite-canvas-container) {
      height: calc(100vh - 200px) !important;
    }
  }
  
  /* Tablet specific styles */
  @media (min-width: 769px) and (max-width: 1200px) {
    :global(.infinite-canvas-container) {
      height: calc(100vh - 160px) !important;
    }
  }
  
  /* Desktop specific styles */
  @media (min-width: 1201px) {
    :global(.infinite-canvas-container) {
      height: calc(100vh - 150px) !important;
    }
  }
</style> 
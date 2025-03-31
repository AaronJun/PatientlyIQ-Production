  <!-- RPDPRVAnalytics.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import OverviewIntroduction from './OverviewIntroduction.svelte';   
    import { Report, ChartParallel, Money, ArrowRight, WatsonHealthDna } from 'carbon-icons-svelte';
    import { hasPRVAward } from '../utils/data-processing-utils';
    import { createEventDispatcher } from 'svelte';
    import TherapeuticAreaWaffleChart from './TherapeuticAreaWaffleChart.svelte';
    import { Separator } from 'bits-ui';
    import QuoteCard from './QuoteCard.svelte';
    import MarketCapRadialChart from './MarketCapRadialChart.svelte';
    import ChartCarouselSection from './ChartCarouselSection.svelte';
    import ProgramFlowSankey from './ProgramFlowSankey.svelte';
    import QuoteCardCarousel from './QuoteCardCarousel.svelte';
    import CompanyDistributionChart from './CompanyDistributionChart.svelte';
    import ProgramOverview from './ProgramOverview.svelte';
    import TherapeuticAreaSection from './TherapeuticAreaSection.svelte';
    import MarketCapSection from './MarketCapSection.svelte';
    import RPDDFilteredTable from '../components/RPDDFilteredTable.svelte';
    import EconomicsSection from './EconomicsSection.svelte';
    interface DataEntry {
        Company: string;
        Candidate: string;
        TherapeuticArea1: string;
        Indication: string;
        "Current Development Stage": string;
        "PRV Year": string;
        "Purchase Year": string;
        Purchased?: string;
        Purchaser: string;
        "Sale Price (USD Millions)": string;
        MarketCap?: string;
        effectiveStage?: string;
        "RPDD Year"?: string;
        "RPDD Date"?: string;
        "PRV Date"?: string;
        "Commercial stage"?: string;
        "PRV Status"?: string;
        "Approved Drug"?: string;
        "COUNTRY"?: string;
    }
    
    export let data: DataEntry[] = [];
    export let isAllYearView: boolean = true;
    export let selectedCompany: string = "";
    export let selectedEntry: DataEntry | null = null;
    export let onEntrySelect: (entry: DataEntry) => void = () => {};
    
    const dispatch = createEventDispatcher();
    
    // Add width variable for responsive components
    let width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    
    // Define the type for modal content
    interface ModalContent {
        title: string;
        description: string;
        chartComponent: any;
        chartProps: any;
        actionButtonText: string;
        actionButtonDestination: string;
    }
    
    // Modal state
    let isModalOpen = false;
    let modalContent: ModalContent = {
        title: '',
        description: '',
        chartComponent: null as any,
        chartProps: {},
        actionButtonText: '',
        actionButtonDestination: ''
    };
    
    // Statistics
    let totalEntries = 0;
    let totalPRVs = 0;
    let totalSold = 0;
    let totalValue = 0;
    let avgSalePrice = 0;
    let topCompany = { name: '', count: 0 };
    let topArea = { name: '', count: 0 };
    let topIndication = { name: '', count: 0 };
    let yearlyPRVs: { year: string, count: number }[] = [];
    
    // Additional statistics
    let smallCapCompanies = 0;
    let earlyStageResearch = 0; 
    let newDrugsToMarket = 0;
    let countriesSupported = 0;
    
    // MarketCap statistics
    let companiesByMarketCap: { 
      small: number;
      mid: number;
      large: number;
      mega: number;
      private: number;
      na: number;
    } = {
      small: 0,
      mid: 0,
      large: 0,
      mega: 0,
      private: 0,
      na: 0
    };
    
    // Track the state of each collapsible section
    let expandedSections: Record<string, boolean> = {
      overview: true,
      sankey: true,
      distribution: true,
      marketCap: true,
      programFlow: true,
      companyDistribution: true,
      rpdd2018Table: true  // Set to true so it's visible by default
    };
    
    function toggleSection(section: keyof typeof expandedSections) {
      expandedSections[section] = !expandedSections[section];
    }
    
    let previousActiveElement: HTMLElement | null = null;
    let modalCloseButton: HTMLButtonElement;
    let companyChartRef: any = null;
    
    function handleChartOpen(event: CustomEvent) {
        // Store the currently focused element
        previousActiveElement = document.activeElement as HTMLElement;
        
        // Get the detail information from the event
        modalContent = event.detail;
        isModalOpen = true;
        
        // Focus the close button when modal opens
        setTimeout(() => {
            if (modalCloseButton) {
                modalCloseButton.focus();
            }
        }, 0);
    }
    
    function closeModal() {
        isModalOpen = false;
        
        // Return focus to the previously focused element
        if (previousActiveElement) {
            previousActiveElement.focus();
        }
    }
    
    function handleModalKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    
    function handleModalAction() {
        // Navigate to the appropriate tab
        if (modalContent.actionButtonDestination) {
            console.log("Modal action clicked - navigating to tab:", modalContent.actionButtonDestination);
            // Use direct dispatch with tab value
            dispatch('navigateToTab', { tab: modalContent.actionButtonDestination });
            // Close the modal after navigation
            closeModal();
        }
    }
    
    function handleNavigateToSponsor() {
      dispatch('navigateToSponsor');
    }
    
    function handleAreaClick(area: string) {
      // Filter to show only entries for this therapeutic area
      const areaEntries = data.filter(d => d.TherapeuticArea1 === area);
      if (areaEntries.length > 0) {
        // Select the first entry from this area
        onEntrySelect(areaEntries[0]);
      }
    }
    
    function handleCompanySelect(company: string) {
      // Find the first entry for the selected company
      const entry = data.find(d => d.Company === company);
      if (entry) {
        selectedCompany = company;
        
        // Update the selected entry
        selectedEntry = entry;
        
        // Call the parent's onEntrySelect if provided
        onEntrySelect(entry);
      }
    }
    
    function handleAreaSelect(area: string) {
      // Find the first entry for the selected therapeutic area
      const entry = data.find(d => d.TherapeuticArea1 === area);
      if (entry) {
        // Select first company in that area
        selectedCompany = entry.Company;
        
        // Update the selected entry
        selectedEntry = entry;
        
        // Call the parent's onEntrySelect if provided
        onEntrySelect(entry);
      }
    }
    
    function calculateStats() {
      if (!data || data.length === 0) return;
      
      totalEntries = data.length;
      
      // Filter to just PRV data using PRV Year
      const prvData = data.filter(d => hasPRVAward(d) && d["PRV Year"]);
      totalPRVs = prvData.length;
      
      // Calculate sold vouchers
      const soldData = prvData.filter(d => d.Purchased === "Y");
      totalSold = soldData.length;
      
      // Calculate total and average value
      const valuedSales = soldData.filter(d => d["Sale Price (USD Millions)"] && d["Sale Price (USD Millions)"] !== "Undisclosed")
        .map(d => parseFloat(d["Sale Price (USD Millions)"] ?? '0'));
        
      totalValue = valuedSales.reduce((sum, val) => sum + val, 0);
      avgSalePrice = valuedSales.length > 0 ? totalValue / valuedSales.length : 0;
      
      // Calculate new stats
      // Count small cap companies
      const uniqueCompanies = new Map<string, boolean>();
      data.forEach(entry => {
        if (entry.Company && entry.MarketCap === "Small") {
          uniqueCompanies.set(entry.Company, true);
        }
      });
      smallCapCompanies = uniqueCompanies.size;
      
      // Count early stage research (Preclinical or Phase 1)
      earlyStageResearch = data.filter(d => 
        d["Commercial stage"] === "Early stage" || 
        d["Current Development Stage"] === "Preclinical" || 
        d["Current Development Stage"] === "Phase 1"
      ).length;
      
      // Count new drugs brought to market - corrected calculation
      newDrugsToMarket = data.filter(d => 
        d["PRV Status"] === "PRV Awarded" && 
        d["Approved Drug"] === "Y"
      ).length;
      
      // Count unique countries
      const uniqueCountries = new Set<string>();
      data.forEach(entry => {
        if (entry.COUNTRY) {
          uniqueCountries.add(entry.COUNTRY);
        }
      });
      countriesSupported = uniqueCountries.size;
      
      // Calculate yearly PRV distribution using PRV Year
      const prvsGroupedByYear: Record<string, number> = {};
      prvData.forEach(d => {
        const year = d["PRV Year"];
        if (year) {
          prvsGroupedByYear[year] = (prvsGroupedByYear[year] || 0) + 1;
        }
      });
      
      yearlyPRVs = Object.entries(prvsGroupedByYear)
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year.localeCompare(b.year));
      
      // Find top company by entries
      const companyCounts = new Map<string, number>();
      data.forEach(d => {
        companyCounts.set(d.Company, (companyCounts.get(d.Company) || 0) + 1);
      });
      
      if (companyCounts.size > 0) {
        const topEntry = Array.from(companyCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        topCompany = { name: topEntry[0], count: topEntry[1] };
      }
      
      // Find top therapeutic area
      const areaCounts = new Map<string, number>();
      data.forEach(d => {
        if (d.TherapeuticArea1) {
          areaCounts.set(d.TherapeuticArea1, (areaCounts.get(d.TherapeuticArea1) || 0) + 1);
        }
      });
      
      if (areaCounts.size > 0) {
        const topEntry = Array.from(areaCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        topArea = { name: topEntry[0], count: topEntry[1] };
      }
      
      // Find top indication
      const indicationCounts = new Map<string, number>();
      data.forEach(d => {
        if (d.Indication) {
          indicationCounts.set(d.Indication, (indicationCounts.get(d.Indication) || 0) + 1);
        }
      });
      
      if (indicationCounts.size > 0) {
        const topEntry = Array.from(indicationCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        topIndication = { name: topEntry[0], count: topEntry[1] };
      }
      
      // Calculate companies by market cap
      calculateCompaniesByMarketCap();
    }
    
    function calculateCompaniesByMarketCap() {
      // Get unique companies
      const uniqueCompanies = new Map<string, string>();
      
      // For each company, store its market cap
      data.forEach(entry => {
        if (entry.Company && !uniqueCompanies.has(entry.Company)) {
          uniqueCompanies.set(entry.Company, entry.MarketCap || "");
        }
      });
      
      // Reset counts
      companiesByMarketCap = {
        small: 0,
        mid: 0,
        large: 0,
        mega: 0,
        private: 0,
        na: 0
      };
      
      // Count companies by market cap
      uniqueCompanies.forEach((marketCap, company) => {
        const cap = marketCap.toLowerCase();
        if (cap === "small" || cap === "smal") {
          companiesByMarketCap.small++;
        } else if (cap === "mid") {
          companiesByMarketCap.mid++;
        } else if (cap === "large") {
          companiesByMarketCap.large++;
        } else if (cap === "mega") {
          companiesByMarketCap.mega++;
        } else if (cap === "private" || cap === "pvt") {
          companiesByMarketCap.private++;
        } else if (cap === "#n/a" || cap.includes("n/a")) {
          companiesByMarketCap.na++;
        }
      });
    }
    
    function handleNavigateToTab(event: CustomEvent) {
      const { tab } = event.detail;
      console.log("Navigating to tab:", tab);
      // Forward the tab navigation to the parent
      dispatch('navigateToTab', { tab });
    }
    
    $: if (data) {
      calculateStats();
    }
    
    onMount(() => {
      if (data) {
        calculateStats();
      }
      
      // Add resize listener to update width
      const handleResize = () => {
        width = window.innerWidth;
      };
      
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });
</script>

<div class="overview-wrapper w-full">  
  <OverviewIntroduction on:navigateToSponsor={handleNavigateToSponsor} />

  <section class="section-slanted-both flex flex-col md:flex-row gap-4 py-12 md:py-16 lg:py-24 px-8 md:px-16 lg:px-20 bg-slate-200">
    News Feed 
  </section>
  <!-- Section 1: Program Overview Stats -->
  <section class="bg-blue-900 min-h-96 py-20 md:py-24">
    <div class="flex flex-col gap-4 justify-start px-8 md:px-16 lg:px-20">
      <p class="text-4xl text-left font-normal text-slate-100 col-span-1 max-w-lg text-pre-wrap mb-8">
        <span class="font-semibold text-blue-200">"Children do not have the time to wait.</span> <br> <br> We must act now to reauthorize the rare pediatric disease PRV program."
      </p>
    </div>

  </section>
  <section class="section-slanted-both z-0 grid grid-cols-1 md:grid-cols-3 
  gap-4 px-8 md:px-16 lg:px-20 pt-8 md:pt-16 pb-16 md:pb-24 bg-slate-800">
    <div class="col-span-2">
    <h3 class="text-3xl font-normal text-slate-100 col-span-1 mb-8">
    The program spurred the development of new treatments for <span class="font-semibold text-orange-200">previously untreatable diseases</span>.
    </h3>
    </div>
    
    <div class="flex flex-col gap-4 mt-4 col-span-2 md:max-w-4xl">      
      <div 
      class="stat-card-2 flex justify-between gap-12 pb-8 px-2 bg-transparent border-2 border-slate-100" 
      role="region"
      aria-labelledby="prvs-awarded-label"
    >
      <h3 id="prvs-awarded-label" class="text-xl font-medium text-slate-50 col-span-1">Small + Start-Up Companies Supported</h3>
      <p class="text-7xl font-bold text-slate-50 col-span-1" aria-label="Small Cap Companies Supported: {smallCapCompanies}">
            {smallCapCompanies}
      </p>
    </div>
    
      <div 
        class="stat-card-2 flex justify-between gap-12 pb-8 px-2"
        role="region"
        aria-labelledby="rpd-designations-label"
      >
        <h3 id="rpd-designations-label" class="text-xl tracking-wide font-medium text-slate-200">RPD Designations Granted</h3>
        <p class="text-7xl font-semibold text-right text-slate-50" aria-label="Total RPD Designations: an estimated 738">
          738<br> 
          <span class="text-sm font-normal text-right align-top text-slate-50">Estimated</span>   
        </p>
      </div>

      <div 
      class="stat-card-2 flex justify-between gap-12 pb-8 px-2" 
      role="region"
      aria-labelledby="prvs-awarded-label"
    >
      <h3 id="prvs-awarded-label" class="text-xl font-medium text-slate-50 col-span-1">PRVs Awarded</h3>
      <p class="text-7xl font-bold text-slate-50 col-span-1" aria-label="Total PRVs Awarded: {totalPRVs}">
        {totalPRVs}
      </p>
    </div>

      <div 
      class="stat-card-2 flex justify-between gap-12 pb-8 px-2 bg-transparent border-2 border-slate-100" 
      role="region"
      aria-labelledby="prvs-awarded-label"
    >
      <h3 id="prvs-awarded-label" class="text-xl font-medium text-slate-50 col-span-1">PRVs Sold</h3>
      <p class="text-7xl font-bold text-slate-50 col-span-1" aria-label="Total PRVs Awarded: {totalSold}, {Math.round(totalSold/totalPRVs*100)}% of total">
            {totalSold}
      </p>
    </div>
</section>


<section class="section-slanted-both flex flex-col md:flex-row gap-4 py-12 md:py-16 lg:py-24 px-8 md:px-16 lg:px-20 bg-slate-200">
  <QuoteCardCarousel />
</section>

<!-- Replace the therapeutic area section with the new component -->
<section class="section-slanted-both flex flex-col md:flex-row gap-4 pt-16 md:py-16 lg:py-24 px-8 bg-stone-100">
<TherapeuticAreaSection {data} onAreaClick={handleAreaClick} />
</section>


<section class="section-slanted-top flex flex-col md:flex-row gap-4 py-12 md:py-16 lg:py-24 px-8 bg-stone-200">
  <MarketCapSection {data} onMarketCapClick={handleCompanySelect}/>
<!-- </section>

<section class="section-slanted-both flex flex-col md:flex-row gap-4 py-12 md:py-16 lg:py-24 bg-slate-100">
<EconomicsSection {data} />
</section> -->

<!-- Additional diagonal separator can be added here if needed -->
<!-- <div class="diagonal-separator-container">
  <div class="diagonal-separator diagonal-separator--emerald"></div>
</div> -->

  <!--
    </section> 
    Section 2: Program Overview Stats
    <ProgramOverview {data} sectionTitle="Economic Impact" />

    <section class="mb-6 px-8 md:px-12 lg:px-16">
      <div 
        class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800"     >
        <div class="flex items-center gap-2">
          <h2 id="program-overview-header" class="text-3xl font-normal text-slate-600">Health Impact</h2>
        </div>


      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 px-8 md:px-12 lg:px-16">
      <div>
        <div 
          class="section-header flex align-top justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800">
          <h2 id="company-impact-header" class="text-3xl font-normal text-slate-700">Company Incubation Impact</h2>
        </div>

        <div class="flex flex-col mt-4 gap-4">
          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="prvs-sold-label"
          >
            <h3 id="prvs-sold-label" class="text-xs font-medium text-slate-500">PRVs Sold</h3>
            <p class="text-4xl font-bold text-emerald-700" aria-label="PRVs Sold: {totalSold}, {Math.round(totalSold/totalPRVs*100)}% of total">
              {totalSold} <span class="text-xs text-slate-500">({Math.round(totalSold/totalPRVs*100) || 0}%)</span>
            </p>
          </div>

          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="avg-sale-price-label"
          >
            <h3 id="avg-sale-price-label" class="text-xs font-medium text-slate-500">Avg Sale Price</h3>
            <p class="text-4xl font-bold text-emerald-800" aria-label="Average Sale Price: ${Math.round(avgSalePrice).toLocaleString()} Million">
              ${Math.round(avgSalePrice).toLocaleString() || 0}M
            </p>
          </div>
        </div>
      </div>

      <div>
        <div 
          class="section-header flex align-top justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800">
          <h2 id="economic-value-header" class="text-3xl font-normal text-slate-700">Economic Value</h2>
        </div>

        <div class="flex flex-col mt-4 gap-4">
          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="total-value-label"
          >
            <h3 id="total-value-label" class="text-xs font-medium text-slate-500">Total Value Generated</h3>
            <p class="text-4xl font-bold text-emerald-800" aria-label="Total Value Generated: ${(totalValue/1000).toFixed(1)} Billion">
              ${(totalValue/1000).toFixed(1)}B
            </p>
          </div>

          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="market-incentive-label"
          >
            <h3 id="market-incentive-label" class="text-xs font-medium text-slate-500">Market Incentive</h3>
            <p class="text-4xl font-bold text-blue-700" aria-label="Market Incentive: ${((totalPRVs * avgSalePrice)/1000).toFixed(1)} Billion potential value">
              ${((totalPRVs * avgSalePrice)/1000).toFixed(1)}B
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-8 md:px-12 lg:px-16">
      <div>
        <div 
          class="section-header flex align-top justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800">
          <h2 id="research-impact-header" class="text-3xl font-normal text-slate-700">Research Impact</h2>
        </div>

        <div class="flex flex-col mt-4 gap-4">
          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="small-cap-label"
          >
            <h3 id="small-cap-label" class="text-xs font-medium text-slate-500">Small Cap Companies Supported</h3>
            <p class="text-4xl font-bold text-indigo-700" aria-label="Small Cap Companies Supported: {smallCapCompanies}">
              {smallCapCompanies}
            </p>
          </div>

          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="early-stage-label"
          >
            <h3 id="early-stage-label" class="text-xs font-medium text-slate-500">Early Stage Research Projects</h3>
            <p class="text-4xl font-bold text-cyan-700" aria-label="Early Stage Research Projects: {earlyStageResearch}">
              {earlyStageResearch}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div 
          class="section-header flex align-top justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800">
          <h2 id="health-outcomes-header" class="text-3xl font-normal text-slate-700">Health Outcomes</h2>
        </div>

        <div class="flex flex-col mt-4 gap-4">
          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="new-drugs-label"
          >
            <h3 id="new-drugs-label" class="text-xs font-medium text-slate-500">New Drugs Brought to Market</h3>
            <p class="text-4xl font-bold text-green-700" aria-label="New Drugs Brought to Market: {newDrugsToMarket}">
              {newDrugsToMarket}
            </p>
          </div>

          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="therapeutic-areas-label"
          >
            <h3 id="therapeutic-areas-label" class="text-xs font-medium text-slate-500">Therapeutic Areas Impacted</h3>
            <p class="text-4xl font-bold text-amber-700" aria-label="Therapeutic Areas Impacted">
              {new Set(data.map(d => d.Indication).filter(Boolean)).size}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div 
          class="section-header flex align-top justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800">
          <h2 id="program-efficiency-header" class="text-3xl font-normal text-slate-700">Program Efficiency</h2>
        </div>

        <div class="flex flex-col mt-4 gap-4">
          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="success-rate-label"
          >
            <h3 id="success-rate-label" class="text-xs font-medium text-slate-500">PRV Program Success Rate</h3>
            <p class="text-4xl font-bold text-orange-700" aria-label="PRV Program Success Rate: {Math.round((totalPRVs/738)*100)}%">
              {Math.round((totalPRVs/738)*100) || 0}<span class="text-xl">%</span>
            </p>
          </div>

          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="cost-per-drug-label"
          >
            <h3 id="cost-per-drug-label" class="text-xs font-medium text-slate-500">Incentive Cost per Approved Drug</h3>
            <p class="text-4xl font-bold text-red-700" aria-label="Cost per Approved Drug: ${((avgSalePrice * (totalPRVs/newDrugsToMarket))/1000).toFixed(1)}B">
              ${newDrugsToMarket ? ((avgSalePrice * (totalPRVs/newDrugsToMarket))/1000).toFixed(1) : 0}B
            </p>
          </div>
          
          <div 
            class="stat-card-2 flex justify-between py-4 px-2 bg-transparent border-t-2 border-slate-800"
            role="region"
            aria-labelledby="countries-supported-label"
          >
            <h3 id="countries-supported-label" class="text-xs font-medium text-slate-500">Countries Supported</h3>
            <p class="text-4xl font-bold text-purple-500" aria-label="Countries Supported: {countriesSupported}">
              {countriesSupported}
            </p>
          </div>
        </div>
      </div>
    </section> -->
<!-- 
  <section class="chart-insights-section flex flex-col md:flex-row gap-4 mb-6">
    <div class="chart-carousel-container w-full">
      <ChartCarouselSection 
        data={data} 
        onCompanySelect={handleCompanySelect} 
        onAreaSelect={handleAreaSelect}
        on:chartOpen={handleChartOpen}
        on:navigateToTab={handleNavigateToTab}
      />
    </div>
  </section>
  



 Program Flow Section -->
  <!-- <section class="mb-6 px-8 md:px-12 lg:px-16" aria-labelledby="program-flow-header">
    <div 
      class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800" 
      on:click={() => toggleSection('programFlow')}
      on:keydown={(e) => e.key === 'Enter' && toggleSection('programFlow')}
      role="button"
      tabindex="0"
      aria-expanded={expandedSections.programFlow}
      aria-controls="program-flow-content"
    >
      <div class="flex items-center gap-2">
        <ArrowRight class="text-slate-600 w-8 h-4" aria-hidden="true" />
        <h2 id="program-flow-header" class="text-lg font-semibold text-slate-700">Program Flow</h2>
      </div>
      <div class="text-slate-400" aria-hidden="true">
        {expandedSections.programFlow ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.programFlow}
      <div 
        id="program-flow-content"
        class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300"
        role="region"
        aria-labelledby="program-flow-header"
      >
        <div 
          class="sankey-container flex flex-col md:flex-row justify-center h-80 border border-slate-100 rounded-md bg-white mb-4 p-4"
          role="img"
          aria-label="Program Flow Sankey Diagram"
        >
          <ProgramFlowSankey 
            {data}
            width={width < 768 ? 380 : 720}
            height={280}
          />
        </div>
        
        <div class="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded">
          <p class="font-medium mb-1">How to read this chart:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>The width of each flow represents the number of drug candidates</li>
            <li>RPD Designations branch into PRVs Awarded and Ongoing Development</li>
            <li>PRVs Awarded split into PRVs Sold and Unsold PRVs</li>
            <li>Hover over any section to see the exact count</li>
          </ul>
        </div>
      </div>
    {/if}
  </section> -->

  <!-- Company Distribution Chart Section -->
  <!-- <section class="mb-6 px-8 md:px-12 lg:px-16" aria-labelledby="company-distribution-header">
    <div 
      class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800" 
      on:click={() => toggleSection('companyDistribution')}
      on:keydown={(e) => e.key === 'Enter' && toggleSection('companyDistribution')}
      role="button"
      tabindex="0"
      aria-expanded={expandedSections.companyDistribution || false}
      aria-controls="company-distribution-content"
    >
      <div class="flex items-center gap-2">
        <ChartParallel class="text-slate-600 w-8 h-4" aria-hidden="true" />
        <h2 id="company-distribution-header" class="text-lg font-semibold text-slate-700">Company Distribution</h2>
      </div>
      <div class="text-slate-400" aria-hidden="true">
        {expandedSections.companyDistribution ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.companyDistribution}
      <div 
        id="company-distribution-content"
        class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300"
        role="region"
        aria-labelledby="company-distribution-header"
      >
        <div class="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div class="max-w-xl">
            <p class="text-sm text-slate-600 mb-2">
              This interactive visualization shows the distribution of companies across different stages of development
              or market capitalization categories at the time they received their first RPD designation.
            </p>
            <p class="text-sm text-slate-600 mb-4">
              Each circle represents a unique company, with colors indicating either their market cap class or commercial stage.
              Larger circles indicate companies with more drug candidates, and those with PRVs are marked with a small badge.
            </p>
          </div>
          <div class="flex items-center gap-4">
            <button 
              class="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm text-slate-700 flex items-center gap-1 border border-slate-300"
              on:click={() => {
                if (companyChartRef?.toggleView) {
                  companyChartRef.toggleView();
                }
              }}
              aria-label="Toggle between Market Cap and Commercial Stage views"
            >
              <span>Toggle View</span>
            </button>
            <button 
              class="px-3 py-1 bg-purple-100 hover:bg-purple-200 rounded text-sm text-purple-700 flex items-center gap-1 border border-purple-300"
              on:click={() => {
                if (companyChartRef?.togglePRVFilter) {
                  companyChartRef.togglePRVFilter();
                }
              }}
              aria-label="Toggle PRV filter"
            >
              <span>Show Only PRVs</span>
            </button>
          </div>
        </div>
        
        <div 
          class="company-chart-container h-[600px] border border-slate-100 rounded-md bg-white mb-4 p-4"
          role="img"
          aria-label="Company Distribution Chart"
        >
          <CompanyDistributionChart 
            bind:this={companyChartRef}
            {data}
            width={width < 768 ? 380 : Math.min(width - 120, 800)}
            height={500}
            onCompanySelect={handleCompanySelect}
          />
        </div>
        
        <div class="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded">
          <p class="font-medium mb-1">Key insights:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Small and mid-sized companies constitute the majority of participants in the RPD PRV program</li>
            <li>Companies at clinical stage are the most active in developing treatments for rare pediatric diseases</li>
            <li>The program has successfully incentivized a diverse range of company types and sizes</li>
            <li>PRVs are awarded across the full spectrum of company sizes and development stages</li>
          </ul>
        </div>
      </div>
    {/if}
  </section>

Market Cap Distribution Section
  <section class="mb-6 px-8 md:px-12 lg:px-16" aria-labelledby="market-cap-header">
    <div 
      class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border border-slate-200"
      on:click={() => toggleSection('marketCap')}
      on:keydown={(e) => e.key === 'Enter' && toggleSection('marketCap')}
      role="button"
      tabindex="0"
      aria-expanded={expandedSections.marketCap}
      aria-controls="market-cap-content"
    >
      <div class="flex items-center gap-2">
        <h2 id="market-cap-header" class="text-lg font-semibold text-slate-700">Company Stages at Time of First RPD Designation</h2>
      </div>
      <div class="text-slate-400" aria-hidden="true">
        {expandedSections.marketCap ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.marketCap}
      <div 
        id="market-cap-content"
        class="section-content flex flex-col bg-slate-50 p-2 shadow-sm border-x border-b border-slate-200 transition-all duration-300"
        role="region"
        aria-labelledby="market-cap-header"
      >    
        <div class="mt-4 w-full md:w-1/3 lg:w-1/4 text-xs text-slate-800 bg-slate-50/80 p-3 rounded">
          <p class="text-sm text-slate-600 mb-4">
            The RPD PRV program has primarily helped catalyze research within early stage companies. 
          </p>
          <p class="text-sm font-medium mb-1">How to read this chart:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Each colored square represents one company</li>
            <li>Color indicates market capitalization category</li>
            <li>Different shades within the same color represent different companies</li>
            <li>Hover over any square to see company details</li>
            <li>Click on any square to explore that company's drug candidates</li>
          </ul>
        </div>
        
        <div 
          class="waffle-chart-container flex w-full"
          role="img"
          aria-label="Market Cap Distribution Waffle Chart"
        >
          <MarketCapRadialChart 
            {data}
            width={width < 768 ? width - 40 : Math.min(width - 80, 900)}
            height={width < 768 ? 600 : 1120}
            maxCols={width < 768 ? 10 : 18}
            cellSize={width < 768 ? 14 : 18}
            cellPadding={width < 768 ? 2 : 2}
            legendPosition={width < 768 ? "bottom" : "bottom"}
            onCompanySelect={handleCompanySelect}
          />
        </div>
      </div>
    {/if}


Chart Detail Modal -->
{#if isModalOpen}
<div 
  class="modal-overlay" 
  on:click={closeModal}
  on:keydown={handleModalKeydown}
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true"
>
  <div 
    class="modal-container" 
    on:click|stopPropagation
    role="document"
  >
    <div class="modal-header">
      <h2 id="modal-title">{modalContent.title}</h2>
      <button 
        class="close-button" 
        on:click={closeModal}
        bind:this={modalCloseButton}
        aria-label="Close modal"
      >×</button>
    </div>
    <div class="modal-body">
      <p id="modal-description" class="modal-description">{modalContent.description}</p>
      
      {#if modalContent.chartComponent}
        <div class="modal-chart" role="img" aria-label="{modalContent.title} visualization">
          <svelte:component 
            this={modalContent.chartComponent} 
            {...modalContent.chartProps} 
            width={Math.min(width - 80, 900)} 
            height={400} 
          />
        </div>
      {/if}
    </div>
    <div class="modal-footer">
      {#if modalContent.actionButtonText}
        <button 
          class="action-button" 
          on:click={handleModalAction}
          aria-label="{modalContent.actionButtonText}"
        >
          {modalContent.actionButtonText}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </button>
      {/if}
    </div>
  </div>
</div>
{/if}
<!-- 
{#if expandedSections.rpdd2018Table}
  <RPDDFilteredTable 
    {data} 
    filterYear="2018" 
    filterPRVStatus="non-awarded"
    title="RPDD 2018 Entries with Development Status Details"
    {onEntrySelect}
  />
{/if} -->
</div>

<style>
  .section-content {
    overflow: hidden;
  }
  
  .stat-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
  }
  
  .stat-card:focus-within {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }
  
  .stat-card-2 {
    transition: transform 0.2s ease;
    position: relative;
  }
  
  .waffle-chart-container {
    overflow: hidden;
  }
  
  .waffle-chart-container:focus-within {
    outline: 2px solid #4f46e5;
    outline-offset: 4px;
  }
  
  /* Diagonal separator styles */
  .diagonal-separator-container {
    height: 72px;
    overflow: hidden;
    position: relative;
    width: 100%;
    z-index: 10;
  }
  
  .diagonal-separator {
    height: 10px;
    position: absolute;
    width: 100%;
    left: 0;
    right: 0;
    transform: skewY(-6deg) translateY(-0.35px);
    transform-origin: 100% 0;
  }
  
  .diagonal-separator--teal {
    background-color: #2dd4bf; /* teal-400 */
  }
  
  .diagonal-separator--sky {
    background-color: #38bdf8; /* sky-400 */
  }
  
  .diagonal-separator--emerald {
    background-color: #34d399; /* emerald-400 */
  }
  
  /* Slanted section styles */
  .section-slanted-top {
    position: relative;
    margin-top: -72px;
    padding-top: calc(72px + 3rem);
    clip-path: polygon(0 72px, 100% 0, 100% 100%, 0 100%);
    z-index: 5;
  }
  
  /* New slanted both top and bottom style */
  .section-slanted-both {
    position: relative;
    margin-top: -72px;
    z-index: 999;
    padding-top: calc(72px + 3rem);
    padding-bottom: calc(72px + 3rem);
    clip-path: polygon(0 72px, 100% 0, 100% calc(100% - 72px), 0 100%);
    z-index: 10;
  }

    /* New slanted both top and bottom style */
    .section-slanted-bottom {
    position: relative;
    padding-bottom: calc(72px + 3rem);
    clip-path: polygon(0 72px, 100% 0, 100% calc(100% - 72px), 0 100%);
    z-index: 5;
  }
  
  @media (max-width: 768px) {
    .section-slanted-top, .section-slanted-both {
      padding-top: calc(72px + 3rem);
    }
    
    .section-slanted-both {
      padding-bottom: calc(72px + 3rem);
    }
  }
  
  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(3px);
  }
  
  .modal-container {
    background-color: white;
    border-radius: 12px;
    width: 90%;
    max-width: 1000px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0.5rem;
    line-height: 1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close-button:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
  
  .modal-body {
    padding: 1.5rem;
    flex: 1;
    overflow-y: auto;
  }
  
  .modal-description {
    margin-bottom: 1.5rem;
    color: #1f2937;
    line-height: 1.5;
  }
  
  .modal-chart {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 1rem;
    background-color: #f9fafb;
    border-radius: 8px;
    min-height: 400px;
  }
  
  .modal-footer {
    padding: 1.5rem;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #e5e7eb;
  }
  
  .action-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #4338ca;
    color: white;
    border: none;
    border-radius: 0.375rem;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .action-button:hover {
    background-color: #3730a3;
  }
  
  @media (max-width: 768px) {
    .modal-container {
      width: 95%;
      max-height: 95vh;
    }
    
    .modal-header, .modal-body, .modal-footer {
      padding: 1rem;
    }
    
    .modal-chart {
      min-height: 300px;
    }
  }
  
  /* Improve focus visibility */
  .section-header:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }
  
  .close-button:focus-visible,
  .action-button:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px white;
  }
</style>
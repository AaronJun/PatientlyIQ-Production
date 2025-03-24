<!-- RPDPRVAnalytics.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import OverviewIntroduction from './OverviewIntroduction.svelte';   
    import { Report, ChartParallel, Money, ArrowRight } from 'carbon-icons-svelte';
    import { hasPRVAward } from '../utils/data-processing-utils';
    import { createEventDispatcher } from 'svelte';
    import TherapeuticAreaWaffleChart from './TherapeuticAreaWaffleChart.svelte';
    import MarketCapWaffleChart from './MarketCapWaffleChart.svelte';
    import ChartCarouselSection from './ChartCarouselSection.svelte';
    import ProgramFlowSankey from './ProgramFlowSankey.svelte';
    
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
      programFlow: true
    };
    
    function toggleSection(section: keyof typeof expandedSections) {
      expandedSections[section] = !expandedSections[section];
    }
    
    let previousActiveElement: HTMLElement | null = null;
    let modalCloseButton: HTMLButtonElement;
    
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

  <section class="chart-insights-section">
    <ChartCarouselSection 
      data={data} 
      onCompanySelect={handleCompanySelect} 
      onAreaSelect={handleAreaSelect}
      on:chartOpen={handleChartOpen}
      on:navigateToTab={handleNavigateToTab}
    />
  </section>
  
    <!-- Section 1: Program Overview Stats -->
    <section class="mb-6" aria-labelledby="program-overview-header">
      <div 
        class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800" 
        on:click={() => toggleSection('overview')}
        on:keydown={(e) => e.key === 'Enter' && toggleSection('overview')}
        role="button"
        tabindex="0"
        aria-expanded={expandedSections.overview}
        aria-controls="program-overview-content"
      >
        <div class="flex items-center gap-2">
          <Report  class="text-slate-800" aria-hidden="true" />
          <h2 id="program-overview-header" class="text-3xl font-normal text-slate-700">Program Overview</h2>
        </div>
        <div class="text-slate-400" aria-hidden="true">
          {expandedSections.overview ? '−' : '+'}
        </div>
      </div>
    
    {#if expandedSections.overview}
      <div 
        id="program-overview-content"
        class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300"
        role="region"
        aria-labelledby="program-overview-header"
      >
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div 
          class="stat-card bg-yellow-50 p-4 border border-yellow-100"
            role="region"
            aria-labelledby="rpd-designations-label"
          >
            <h3 id="rpd-designations-label" class="text-xs tracking-wide font-medium text-slate-500">RPD Designations Granted</h3>
            <p class="text-2xl font-bold text-slate-800" aria-label="Total RPD Designations: an estimated 738">738 <span class="text-xs text-slate-500">Estimated</span></p>
          </div>
          
          <div 
            class="stat-card bg-purple-50 p-4 border border-purple-100"
            role="region"
            aria-labelledby="prvs-awarded-label"
          >
            <h3 id="prvs-awarded-label" class="text-xs font-medium text-slate-500">PRVs Awarded</h3>
            <p class="text-2xl font-bold text-purple-700" aria-label="Total PRVs Awarded: {totalPRVs}">{totalPRVs}</p>
          </div>
          
          <div 
            class="stat-card bg-emerald-50 p-4 border border-emerald-100"
            role="region"
            aria-labelledby="prvs-sold-label"
          >
            <h3 id="prvs-sold-label" class="text-xs font-medium text-slate-500">PRVs Sold</h3>
            <p class="text-2xl font-bold text-emerald-700" aria-label="PRVs Sold: {totalSold}, {Math.round(totalSold/totalPRVs*100)}% of total">
              {totalSold} <span class="text-xs text-slate-500">({Math.round(totalSold/totalPRVs*100) || 0}%)</span>
            </p>
          </div>
          
          <div 
            class="stat-card bg-orange-50 p-4 border border-orange-100"
            role="region"
            aria-labelledby="avg-sale-price-label"
          >
            <h3 id="avg-sale-price-label" class="text-xs font-medium text-slate-500">Avg Sale Price</h3>
            <p class="text-2xl font-bold text-orange-700" aria-label="Average Sale Price: ${Math.round(avgSalePrice).toLocaleString()} Million">
              ${Math.round(avgSalePrice).toLocaleString() || 0}M
            </p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4  border border-slate-200">
            <h3 class="text-xs font-medium text-slate-500">Top Company</h3>
            <p class="text-xl font-semibold text-slate-800">{topCompany.name || 'N/A'}</p>
            <p class="text-xs text-slate-500">{topCompany.count || 0} drug candidates</p>
          </div>
          
          <div class="bg-white p-4  border border-slate-200">
            <h3 class="text-xs font-medium text-slate-500">Top Therapeutic Area</h3>
            <p class="text-xl font-semibold text-slate-800">{topArea.name || 'N/A'}</p>
            <p class="text-xs text-slate-500">{topArea.count || 0} drug candidates</p>
          </div>
          
          <div class="bg-white p-4  border border-slate-200">
            <h3 class="text-xs font-medium text-slate-500">Top Indication</h3>
            <p class="text-xl font-semibold text-slate-800">{topIndication.name || 'N/A'}</p>
            <p class="text-xs text-slate-500">{topIndication.count || 0} drug candidates</p>
          </div>
        </div>
      </div>
    {/if}
  </section>

  <!-- Program Flow Section -->
  <section class="mb-6" aria-labelledby="program-flow-header">
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
        <ArrowRight  class="text-slate-600 w-8 h-4" aria-hidden="true" />
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
      width={width < 768 ? 380 : 750}
      height={280}
      />
      <p class="caption text-xs text-slate-600 mb-4 border-t-2 mt-2 border-slate-800 pt-2">
        This diagram visualizes the flow of drug candidates through the RPD PRV program,
        from initial RPD designations to Priority Review Voucher (PRV) awards and sales. The width of each flow represents
        the relative number of drug candidates.
      </p>
      
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
  </section>

  <!-- Market Cap Distribution Section -->
  <section class="mb-6" aria-labelledby="market-cap-header">
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
        <Money  class="text-indigo-500" aria-hidden="true" />
        <h2 id="market-cap-header" class="text-lg font-semibold text-slate-700">Company Market Cap Distribution</h2>
      </div>
      <div class="text-slate-400" aria-hidden="true">
        {expandedSections.marketCap ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.marketCap}
      <div 
        id="market-cap-content"
        class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300"
        role="region"
        aria-labelledby="market-cap-header"
      >
        <p class="text-sm text-slate-600 mb-4">
          This chart shows the distribution of companies by market capitalization category.
          Each square represents one company, with different shades of the same color indicating different companies within the same market cap category.
          Hover over any square to see company details, and click to view more information about that company.
        </p>
        
        <div 
          class="waffle-chart-container flex justify-center p-8"
          role="img"
          aria-label="Market Cap Distribution Waffle Chart"
        >
          <MarketCapWaffleChart 
            {data}
            width={width < 768 ? width - 40 : Math.min(width - 80, 900)}
            height={width < 768 ? 600 : 800}
            maxCols={width < 768 ? 10 : 18}
            cellSize={width < 768 ? 14 : 18}
            cellPadding={width < 768 ? 2 : 4}
            legendPosition={width < 768 ? "bottom" : "right"}
            onCompanySelect={handleCompanySelect}
          />
        </div>
        
        <div class="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded">
          <p class="font-medium mb-1">How to read this chart:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Each colored square represents one company</li>
            <li>Color indicates market capitalization category</li>
            <li>Different shades within the same color represent different companies</li>
            <li>Hover over any square to see company details</li>
            <li>Click on any square to explore that company's drug candidates</li>
          </ul>
        </div>
      </div>
    {/if}
  </section>
  
  <!-- Therapeutic Area Distribution Section -->
  <section class="mb-6" aria-labelledby="therapeutic-area-header">
    <div 
      class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border-b-2 border-slate-800" 
      on:click={() => toggleSection('distribution')}
      on:keydown={(e) => e.key === 'Enter' && toggleSection('distribution')}
      role="button"
      tabindex="0"
      aria-expanded={expandedSections.distribution}
      aria-controls="therapeutic-area-content"
    >
      <div class="flex items-center gap-2">
        <Report  class="text-purple-500" aria-hidden="true" />
        <h2 id="therapeutic-area-header" class="text-lg font-semibold text-slate-700">Therapeutic Area Distribution</h2>
      </div>
      <div class="text-slate-400" aria-hidden="true">
        {expandedSections.distribution ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.distribution}
      <div 
        id="therapeutic-area-content"
        class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300"
        role="region"
        aria-labelledby="therapeutic-area-header"
      >
        <p class="text-sm text-slate-600 mb-4">
          This chart shows the distribution of drug candidates across therapeutic areas. Each square represents a single drug candidate,
          with different color shades indicating different indications within the same therapeutic area.
          Hover over any square to see the specific indication, and click to view details about that therapeutic area.
        </p>
        
        <div 
          class="waffle-chart-container flex justify-center"
          role="img"
          aria-label="Therapeutic Area Distribution Waffle Chart"
        >
          <TherapeuticAreaWaffleChart 
            {data} 
            width={800} 
            height={400}
            maxCols={16}
            cellSize={16}
            cellPadding={3}
            onAreaClick={handleAreaClick}
          />
        </div>
        
        <div class="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded">
          <p class="font-medium mb-1">How to read this chart:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Each colored square represents one drug candidate</li>
            <li>Squares are grouped by therapeutic area (see legend below)</li>
            <li>Different color shades within the same area represent different indications</li>
            <li>Hover over any square to see detailed information</li>
            <li>Click on any square to explore that therapeutic area</li>
          </ul>
        </div>
      </div>
    {/if}
  </section>


<!-- Chart Detail Modal -->
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
</div>

<style>
  .section-content {
    overflow: hidden;
  }
  
  .section-header {
    transition: background-color 0.2s ease;
  }
  
  .section-header:hover {
    background-color: #f1f5f9;
  }
  
  .stat-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
  }
  
  .stat-card:focus-within {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
  }
  
  .waffle-chart-container {
    overflow: hidden;
  }
  
  .waffle-chart-container:focus-within {
    outline: 2px solid #4f46e5;
    outline-offset: 4px;
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
    color: #4b5563;
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
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 0.375rem;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .action-button:hover {
    background-color: #4338ca;
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
  
  /* Ensure sufficient color contrast */
  .modal-description {
    color: #1f2937; /* Darker gray for better contrast */
  }
  
  .action-button {
    background-color: #4338ca; /* Darker indigo for better contrast */
  }
  
  .action-button:hover {
    background-color: #3730a3;
  }
</style>
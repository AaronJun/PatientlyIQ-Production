<!-- RPDPRVAnalytics.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import OverviewIntroduction from './OverviewIntroduction.svelte';   
    import ProgramSankey from './TimelineSankeyFlow.svelte';
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
    
    // Handle the selection of an entry from the Sankey diagram
    function handleEntrySelect(entry: DataEntry) {
      // Pass the selected entry to the parent component
      onEntrySelect(entry);
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
  
<div class="program-analytics pl-4 pr-2 pt-2 md:px-8 md:pt-8 h-full overflow-y-auto">
  <OverviewIntroduction on:navigateToSponsor={handleNavigateToSponsor} />


  <section class="chart-insights-section">
    <ChartCarouselSection 
      data={data} 
      onCompanySelect={handleCompanySelect} 
      onAreaSelect={handleAreaSelect}
      on:navigateToTab={handleNavigateToTab}
    />
  </section>
  
    <!-- Section 1: Program Overview Stats -->
    <section class="mb-6">
      <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3  border border-slate-200" 
           on:click={() => toggleSection('overview')}>
        <div class="flex items-center gap-2">
          <Report size={20} class="text-orange-500" />
          <h2 class="text-lg font-semibold text-slate-700">Program Overview</h2>
        </div>
        <div class="text-slate-400">
          {expandedSections.overview ? '−' : '+'}
        </div>
      </div>
    
    {#if expandedSections.overview}
      <div class="section-content bg-white p-4  shadow-sm border-x border-b border-slate-200 transition-all duration-300">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div class="stat-card bg-gradient-to-br from-blue-50 to-slate-50 p-4  border border-blue-100">
            <h3 class="text-2xs tracking-wide font-medium text-slate-500">RPD Designations Granted</h3>
            <p class="text-2xl font-bold text-slate-800">{totalEntries}</p>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-green-50 to-slate-50 p-4  border border-green-100">
            <h3 class="text-sm font-medium text-slate-500">PRVs Awarded</h3>
            <p class="text-2xl font-bold text-green-700">{totalPRVs}</p>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-purple-50 to-slate-50 p-4  border border-purple-100">
            <h3 class="text-sm font-medium text-slate-500">PRVs Sold</h3>
            <p class="text-2xl font-bold text-purple-700">{totalSold} <span class="text-sm text-slate-500">({Math.round(totalSold/totalPRVs*100) || 0}%)</span></p>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-amber-50 to-slate-50 p-4  border border-amber-100">
            <h3 class="text-sm font-medium text-slate-500">Avg Sale Price</h3>
            <p class="text-2xl font-bold text-amber-700">${Math.round(avgSalePrice).toLocaleString() || 0}M</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-4  border border-slate-200">
            <h3 class="text-sm font-medium text-slate-500">Top Company</h3>
            <p class="text-xl font-semibold text-slate-800">{topCompany.name || 'N/A'}</p>
            <p class="text-sm text-slate-500">{topCompany.count || 0} drug candidates</p>
          </div>
          
          <div class="bg-white p-4  border border-slate-200">
            <h3 class="text-sm font-medium text-slate-500">Top Therapeutic Area</h3>
            <p class="text-xl font-semibold text-slate-800">{topArea.name || 'N/A'}</p>
            <p class="text-sm text-slate-500">{topArea.count || 0} drug candidates</p>
          </div>
          
          <div class="bg-white p-4  border border-slate-200">
            <h3 class="text-sm font-medium text-slate-500">Top Indication</h3>
            <p class="text-xl font-semibold text-slate-800">{topIndication.name || 'N/A'}</p>
            <p class="text-sm text-slate-500">{topIndication.count || 0} drug candidates</p>
          </div>
        </div>
      </div>
    {/if}
  </section>

  <!-- Section 2: Program Overview -->
  <section class="overview-section chart-insights-section">
    <ChartCarouselSection 
      data={data} 
      onCompanySelect={handleCompanySelect} 
      onAreaSelect={handleAreaSelect}
      on:navigateToTab={handleNavigateToTab}
    />
  </section>

  

  <!-- Add new section for Program Flow Sankey after Program Overview section but before chart carousel -->
  <section class="mb-6">
    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border border-slate-200" 
         on:click={() => toggleSection('programFlow')}>
      <div class="flex items-center gap-2">
        <ArrowRight size={20} class="text-cyan-600" />
        <h2 class="text-lg font-semibold text-slate-700">Program Flow</h2>
      </div>
      <div class="text-slate-400">
        {expandedSections.programFlow ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.programFlow}
      <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
        <p class="text-sm text-slate-600 mb-4">
          This Sankey diagram visualizes the flow of drug candidates through the Rare Pediatric Disease (RPD) program,
          from initial designations to Priority Review Voucher (PRV) awards and sales. The width of each flow represents
          the relative number of drug candidates.
        </p>
        
        <div class="sankey-container flex justify-center">
          <ProgramFlowSankey 
            {data}
            width={width < 768 ? 380 : 750}
            height={300}
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
  </section>

  <!-- Section 3: Market Cap Distribution -->
  <section class="mb-6">
    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border border-slate-200"
         on:click={() => toggleSection('marketCap')}>
      <div class="flex items-center gap-2">
        <Money size={20} class="text-indigo-500" />
        <h2 class="text-lg font-semibold text-slate-700">Company Market Cap Distribution</h2>
      </div>
      <div class="text-slate-400">
        {expandedSections.marketCap ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.marketCap}
      <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
        <p class="text-sm text-slate-600 mb-4">
          This chart shows the distribution of companies by market capitalization category.
          Each square represents one company, with different shades of the same color indicating different companies within the same market cap category.
          Hover over any square to see company details, and click to view more information about that company.
        </p>
        
        <div class="waffle-chart-container flex justify-center">
          <MarketCapWaffleChart 
            {data}
            width={900}
            height={300}
            maxCols={18}
            cellSize={18}
            cellPadding={4}
            legendPosition="right"
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
  
  <!-- Section 4: Therapeutic Area Distribution Waffle Chart -->
  <section class="mb-6">
    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border border-slate-200" 
         on:click={() => toggleSection('distribution')}>
      <div class="flex items-center gap-2">
        <Report size={20} class="text-purple-500" />
        <h2 class="text-lg font-semibold text-slate-700">Therapeutic Area Distribution</h2>
      </div>
      <div class="text-slate-400">
        {expandedSections.distribution ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.distribution}
      <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
        <p class="text-sm text-slate-600 mb-4">
          This chart shows the distribution of drug candidates across therapeutic areas. Each square represents a single drug candidate,
          with different color shades indicating different indications within the same therapeutic area.
          Hover over any square to see the specific indication, and click to view details about that therapeutic area.
        </p>
        
        <div class="waffle-chart-container flex justify-center">
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

 
</div>

<style>
  .program-analytics {
    display: flex;
    flex-direction: column;
  }
  
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
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .waffle-chart-container {
    overflow: hidden;
  }
  
  .chart-insights-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f9fafb;
    border-radius: 8px;
  }
</style>
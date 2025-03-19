<!-- RPDPRVAnalytics.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import OverviewIntroduction from './OverviewIntroduction.svelte';   
    import ProgramSankey from './TimelineSankeyFlow.svelte';
    import PRVAwardCount from './PRVAwardCount.svelte';
    import PRVValueTimeline from './PRVValueTimeline.svelte';
    import TherapeuticAreaDistribution from './TherapeuticAreaDistribution.svelte';
    import CompanyLeaderboard from './CompanyLeaderboard.svelte';
    import UnsoldVouchersTable from './UnsoldVouchersTable.svelte';
    import { Report, Money, ChartParallel, CicsTransactionServerZos, Catalog } from 'carbon-icons-svelte';
    import { hasPRVAward } from '../utils/data-processing-utils';
    import { createEventDispatcher } from 'svelte';
    
    interface DataEntry {
        Company: string;
        Purchased?: string;
        "Sale Price (USD Millions)"?: string;
        "PRV Year"?: string;
        TherapeuticArea1?: string;
        Indication?: string;
        Candidate?: string;
        "Current Development Stage"?: string;
        "Purchase Year"?: string;
        Purchaser?: string;
        MarketCap?: string;
    }
    
    export let data: DataEntry[] = [];
    export let isAllYearView: boolean = true;
    export let onEntrySelect = (entry: DataEntry) => {};
    
    const dispatch = createEventDispatcher();

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
      unknown: number;
    } = {
      small: 0,
      mid: 0,
      large: 0,
      mega: 0,
      private: 0,
      na: 0,
      unknown: 0
    };
    
    // Track the state of each collapsible section
    let expandedSections: Record<string, boolean> = {
      overview: true,
      sankey: true,
      valueTrends: true,
      topPerformers: true,
      unsoldVouchers: true
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
        na: 0,
        unknown: 0
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
        } else {
          companiesByMarketCap.unknown++;
        }
      });
    }
    
    $: if (data) {
      calculateStats();
    }
    
    onMount(() => {
      if (data) {
        calculateStats();
      }
    });

    // Extract owners of unsold vouchers
    $: unsoldVouchers = data.filter(d => d.Purchased !== "Y");
    $: unsoldVoucherOwners = new Set(unsoldVouchers.map(d => d.Company));

    // Calculate the number of unsold vouchers for each company
    $: unsoldVoucherCounts = Array.from(unsoldVoucherOwners).map(owner => {
      const count = unsoldVouchers.filter(v => v.Company === owner).length;
      return { owner, count };
    });
</script>
  
<div class="program-analytics pl-4 pr-2 pt-2 md:px-8 md:pt-8">
  <OverviewIntroduction on:navigateToSponsor={handleNavigateToSponsor} />
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
            <h3 class="text-sm font-medium text-slate-500">RPD Designations Granted</h3>
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
        
        <!-- Market Cap Distribution Cards -->
        <h3 class="text-base font-semibold text-slate-700 mb-3 mt-4">Companies by Market Cap</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div class="stat-card bg-gradient-to-br from-indigo-50 to-slate-50 p-3 border border-indigo-100 text-center">
            <h3 class="text-xs font-medium text-slate-500">Small Cap</h3>
            <p class="text-xl font-bold text-indigo-700">{companiesByMarketCap.small}</p>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-teal-50 to-slate-50 p-3 border border-teal-100 text-center">
            <h3 class="text-xs font-medium text-slate-500">Mid Cap</h3>
            <p class="text-xl font-bold text-teal-700">{companiesByMarketCap.mid}</p>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-cyan-50 to-slate-50 p-3 border border-cyan-100 text-center">
            <h3 class="text-xs font-medium text-slate-500">Large Cap</h3>
            <p class="text-xl font-bold text-cyan-700">{companiesByMarketCap.large}</p>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-emerald-50 to-slate-50 p-3 border border-emerald-100 text-center">
            <h3 class="text-xs font-medium text-slate-500">Mega Cap</h3>
            <p class="text-xl font-bold text-emerald-700">{companiesByMarketCap.mega}</p>
          </div>
        </div>
        
        <!-- <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="stat-card bg-gradient-to-br from-violet-50 to-slate-50 p-3 border border-violet-100 text-center">
            <h3 class="text-xs font-medium text-slate-500">Private Companies</h3>
            <p class="text-xl font-bold text-violet-700">{companiesByMarketCap.private}</p>
          </div>
          
          <div class="stat-card bg-gradient-to-br from-amber-50 to-slate-50 p-3 border border-amber-100 text-center">
            <h3 class="text-xs font-medium text-slate-500">N/A</h3>
            <p class="text-xl font-bold text-amber-700">{companiesByMarketCap.na}</p>
          </div>
          
        <div class="stat-card bg-gradient-to-br from-gray-50 to-slate-50 p-3 border border-gray-100 text-center">
            <h3 class="text-xs font-medium text-slate-500">Empty/Unknown</h3>
            <p class="text-xl font-bold text-gray-700">{companiesByMarketCap.unknown}</p>
          </div> --> 
        <!-- </div> -->
        
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
  
  <!-- Section 2: PRV Program Flow (Sankey Diagram)
  <section class="mb-6">
    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3  border border-slate-200" 
         on:click={() => toggleSection('sankey')}>
      <div class="flex items-center gap-2">
        <ChartParallel size={20} class="text-blue-500" />
        <h2 class="text-lg font-semibold text-slate-700">Program Flow Visualization</h2>
      </div>
      <div class="text-slate-400">
        {expandedSections.sankey ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.sankey}
      <div class="section-content bg-white p-4  shadow-sm border-x border-b border-slate-200 transition-all duration-300">
        <div class="flex justify-center">
          <ProgramSankey 
            {data} 
            width={1000} 
            height={500} 
            onEntrySelect={handleEntrySelect} 
          />
        </div>
      </div>
    {/if}
  </section> -->
  
  <!-- Section 3: PRV Value Trends -->
  <section class="mb-6">
    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3  border border-slate-200" 
         on:click={() => toggleSection('valueTrends')}>
      <div class="flex items-center gap-2">
        <Money size={20} class="text-green-500" />
        <h2 class="text-lg font-semibold text-slate-700">Value & Distribution Trends</h2>
      </div>
      <div class="text-slate-400">
        {expandedSections.valueTrends ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.valueTrends}
      <div class="section-content bg-white p-4  shadow-sm border-x border-b border-slate-200 transition-all duration-300">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- PRV Value Timeline -->
          <div class="p-4 border border-slate-200 ">
            <h3 class="text-base font-semibold text-slate-700 mb-3">PRV Value Timeline</h3>
            <PRVValueTimeline {data} />
            <p class="text-sm text-slate-500 mt-3">PRV values have ranged from $68M to $350M since program inception, with recent stabilization around $110M.</p>
          </div>
          
          <!-- PRV Award Count by Year -->
          <div class="p-4 border border-slate-200 ">
            <h3 class="text-base font-semibold text-slate-700 mb-3">PRV Awards by Year</h3>
            <PRVAwardCount yearlyData={yearlyPRVs} />
            <p class="text-sm text-slate-500 mt-3">The number of PRVs awarded has increased in recent years, with {yearlyPRVs[yearlyPRVs.length-1]?.count || 0} vouchers in {yearlyPRVs[yearlyPRVs.length-1]?.year || 'the latest year'}.</p>
          </div>
          
          <!-- Total PRV Value -->
          <div class="p-4 border border-slate-200  bg-gradient-to-br from-blue-50 to-slate-50">
            <h3 class="text-base font-semibold text-slate-700 mb-2">Total PRV Sales Value</h3>
            <p class="text-5xl font-bold text-blue-600 text-center my-4">${totalValue.toLocaleString()}M</p>
            <p class="text-sm text-slate-500 text-center">Cumulative value of sold PRVs to date</p>
          </div>
          
          <!-- Therapeutic Area Distribution -->
          <div class="p-4 border border-slate-200 ">
            <h3 class="text-base font-semibold text-slate-700 mb-3">Therapeutic Area Distribution</h3>
            <TherapeuticAreaDistribution {data} />
            <p class="text-sm text-slate-500 mt-3">Therapeutic areas with the most PRVs awarded include neuromuscular disorders, metabolic diseases, and rare cancers.</p>
          </div>
        </div>
      </div>
    {/if}
  </section>
  
  <!-- Section 4: Top Performers -->
  <section class="mb-6">
    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3  border border-slate-200" 
         on:click={() => toggleSection('topPerformers')}>
      <div class="flex items-center gap-2">
        <CicsTransactionServerZos size={20} class="text-amber-500" />
        <h2 class="text-lg font-semibold text-slate-700">Program Leaders</h2>
      </div>
      <div class="text-slate-400">
        {expandedSections.topPerformers ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.topPerformers}
      <div class="section-content bg-white p-4  shadow-sm border-x border-b border-slate-200 transition-all duration-300">
        <div class="mb-4">
          <CompanyLeaderboard {data} />
        </div>
        
      </div>
    {/if}
  </section>
  
  
  <!-- New Section: Unsold Vouchers Table -->
  <section class="mb-6">
    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border border-slate-200" 
         on:click={() => toggleSection('unsoldVouchers')}>
      <div class="flex items-center gap-2">
        <Catalog size={20} class="text-emerald-500" />
        <h2 class="text-lg font-semibold text-slate-700">Unsold Vouchers</h2>
      </div>
      <div class="text-slate-400">
        {expandedSections.unsoldVouchers ? '−' : '+'}
      </div>
    </div>
    
    {#if expandedSections.unsoldVouchers}
      <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
        <p class="text-sm text-slate-600 mb-4">
          The following table shows all PRV vouchers that have been awarded but not yet sold or transacted.
          Click on any row to view detailed information about the drug candidate.
        </p>
        
        <UnsoldVouchersTable 
          data={data} 
          year={isAllYearView ? "" : data[0]?.["PRV Year"] || ""}
          {onEntrySelect}
        />
      </div>
    {/if}
  </section>
  
  <footer class="text-slate-500 text-xs mt-6 pb-4">
    <p>Rare Pediatric Disease Priority Review Voucher (PRV) Program Analysis</p>
    <p class="mt-1">Data updated through {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long'})}</p>
  </footer>
</div>

<style>
  .section-content {
    max-height: 2000px;
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
</style>
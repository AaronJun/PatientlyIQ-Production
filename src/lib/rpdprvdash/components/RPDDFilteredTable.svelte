<script lang="ts">
  import { onMount } from 'svelte';
  import RPDCompanyDetailDrawer from '../RPDCompanyDetailDrawer.svelte';
  
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
    "Current Study"?: string;
    "CurrentStudyStatus"?: string;
    "EstimatedStudyCompletion"?: string;
    LastFundraise?: string;
    FundraiseDate?: string;
    LastStatusUpdate?: string;
  }
  
  export let data: DataEntry[] = [];
  export let filterYear: string = "2018";
  export let filterPRVStatus: string = "non-awarded"; // "non-awarded" or "all" or specific status
  export let title: string = "RPDD Entries";
  export let onEntrySelect: (entry: DataEntry) => void = () => {};
  export let stockData: any[] = []; // Added stock data prop
  
  // Company drawer state
  let isCompanyDrawerOpen = false;
  let selectedCompany = '';
  
  function openCompanyDrawer(company: string, event: MouseEvent) {
    event.stopPropagation(); // Prevent toggling the row expansion
    selectedCompany = company;
    isCompanyDrawerOpen = true;
  }
  
  function closeCompanyDrawer() {
    isCompanyDrawerOpen = false;
  }
  
  function handleDrugDetail(detail: any) {
    // Handle drug detail view if needed
    console.log('Drug detail selected:', detail);
  }
  
  // Format date from YYYY-MM-DD to MM/DD/YYYY
  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    
    // If already in MM/DD/YYYY format, return as is
    if (dateStr.includes('/')) return dateStr;
    
    // Handle YYYY-MM-DD format
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${month}/${day}/${year}`;
    }
    
    // For any other format, return as is
    return dateStr;
  }
  
  // Function to determine MarketCap color based on text value
  function getMarketCapColor(marketCap: string | undefined): string {
    if (!marketCap) return 'bg-gray-200 text-gray-700'; // Default color for N/A
    
    const marketCapLower = marketCap.toLowerCase();
    
    if (marketCapLower.includes('mega')) return 'bg-blue-100 text-blue-800'; // Mega cap
    if (marketCapLower.includes('large')) return 'bg-green-100 text-green-800'; // Large cap
    if (marketCapLower.includes('mid')) return 'bg-teal-100 text-teal-800'; // Mid cap
    if (marketCapLower.includes('small')) return 'bg-emerald-100 text-emerald-800'; // Small cap
    if (marketCapLower.includes('micro')) return 'bg-yellow-100 text-yellow-800'; // Micro cap
    if (marketCapLower.includes('nano')) return 'bg-orange-100 text-orange-800'; // Nano cap
    
    return 'bg-gray-200 text-gray-700'; // Default for unknown values
  }
  
  // Format MarketCap for display
  function formatMarketCap(marketCap: string | undefined): string {
    if (!marketCap) return 'N/A';
    return marketCap;
  }
  
  // Get unique years from data for the dropdown
  $: uniqueYears = [...new Set(data.map(entry => entry["RPDD Year"]).filter(Boolean))].sort((a, b) => {
    if (!a || !b) return 0;
    return b.localeCompare(a);
  });
  
  // State for sorting
  let sortKey = 'Company';
  let sortDirection = 'asc';
  let filteredData: DataEntry[] = [];
  let showTerminated = true; // Default to showing all entries
  let expandedCompanies: Record<string, boolean> = {}; // Track expanded state for each company
  
  // Function to toggle expansion of a company row
  function toggleCompanyExpansion(company: string) {
    expandedCompanies[company] = !expandedCompanies[company];
  }

  // Group entries by company for expandable rows
  function groupByCompany(entries: DataEntry[]): Record<string, DataEntry[]> {
    const groups: Record<string, DataEntry[]> = {};
    
    entries.forEach(entry => {
      const company = entry.Company || 'Unknown';
      if (!groups[company]) {
        groups[company] = [];
      }
      groups[company].push(entry);
    });
    
    return groups;
  }
  
  // Function to check if company is small cap and active
  function isSmallCapActive(entry: DataEntry): boolean {
    const marketCap = entry.MarketCap?.toLowerCase() || '';
    const isSmallCap = ['nano', 'micro', 'small'].some(size => marketCap.includes(size));
    const isNotTerminated = !entry.CurrentStudyStatus?.includes('Terminated, Liquidated') && 
                           !entry.CurrentStudyStatus?.includes('Liquidated');
    
    return isSmallCap && isNotTerminated;
  }
  
  // Function to check if entity is non-commercial (advocacy/academic/government)
  function isNonCommercialEntity(company: string): boolean {
    const nonCommercialKeywords = [
      'university', 'college', 'institute', 'foundation', 'hospital',
      'clinic', 'medical center', 'research center', 'national',
      'federal', 'ministry', 'department of', 'govt', 'government',
      'association', 'society', 'organization', 'organisation', 'academic',
      'advocacy', 'academic', '.edu', 'school of', 'center for'
    ];
    
    const companyLower = company.toLowerCase();
    return nonCommercialKeywords.some(keyword => companyLower.includes(keyword.toLowerCase()));
  }
  
  // Filter data based on provided criteria
  function filterData() {
    let result = [...data];
    
    // First filter out non-commercial entities
    result = result.filter(entry => !isNonCommercialEntity(entry.Company || ''));
    
    // Debug log to check EstimatedStudyCompletion values
    console.log('Sample entries with EstimatedStudyCompletion:', 
      result.slice(0, 5).map(entry => ({
        company: entry.Company,
        candidate: entry.Candidate,
        estimatedCompletion: entry["EstimatedStudyCompletion"]
      }))
    );
    
    // Filter by RPDD Year if specified
    if (filterYear && filterYear !== "all") {
      result = result.filter(entry => entry["RPDD Year"] === filterYear);
    }
    
    // Filter by PRV Status
    if (filterPRVStatus === "non-awarded") {
      result = result.filter(entry => entry["PRV Status"] !== "PRV Awarded");
    } else if (filterPRVStatus !== "all") {
      result = result.filter(entry => entry["PRV Status"] === filterPRVStatus);
    }
    
    // Filter by terminated status if needed
    if (!showTerminated) {
      result = result.filter(entry => 
        !entry["CurrentStudyStatus"] || 
        !(entry["CurrentStudyStatus"].includes('Terminated') || 
          entry["CurrentStudyStatus"].includes('Liquidated'))
      );
    }
    
    return result;
  }
  
  // Function to handle sorting
  function handleSort(key: string) {
    if (sortKey === key) {
      // Toggle sort direction if clicking the same column
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort key and default to ascending
      sortKey = key;
      sortDirection = 'asc';
    }
    sortData();
  }
  
  function sortData() {
    filteredData = [...filteredData].sort((a, b) => {
      // Use index signature to safely access properties
      const valueA = (a as any)[sortKey] || '';
      const valueB = (b as any)[sortKey] || '';
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  // Update filtered data when inputs change
  $: {
    filteredData = filterData();
    sortData();
    // Debug log to check data
    console.log('Sample entry:', filteredData[0]);
  }
  
  onMount(() => {
    filteredData = filterData();
    sortData();
    // Debug log to check initial data
    console.log('Initial data sample:', data[0]);
  });
</script>

<section class="rpdd-table-section mt-6 mb-8 w-full">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-medium">{title}</h2>
    
    <!-- Add filter options -->
    <div class="flex items-center space-x-4">
      <!-- Year dropdown -->
      <div class="flex items-center">
        <label for="yearFilter" class="text-sm text-gray-600 mr-2">Filter by Year:</label>
        <select 
          id="yearFilter"
          bind:value={filterYear}
          class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Years</option>
          {#each uniqueYears as year}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </div>


    </div>
  </div>
  
  <div class="overflow-x-auto">
    <table class="w-full min-w-[90vw] bg-stone-100 border-1 border-slate-800 text-xs shadow-md rounded-lg">
      <thead>
        <tr>
          <th class="header-cell py-2 w-4 text-center font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600"></th>
          <th class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600">INDICATOR</th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700" 
            on:click={() => handleSort('Company')}
          >
            COMPANY {sortKey === 'Company' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700" 
            on:click={() => handleSort('MarketCap')}
          >
            SIZE {sortKey === 'MarketCap' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700" 
            on:click={() => handleSort('LastFundraise')}
          >
            RECENT FINANCING {sortKey === 'LastFundraise' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700" 
            on:click={() => handleSort('FundraiseDate')}
          >
            FINANCING DATE {sortKey === 'FundraiseDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
        </tr>
      </thead>
      <tbody>
        {#if filteredData.length === 0}
          <tr>
            <td colspan="6" class="py-2 text-center">No data found matching the criteria.</td>
          </tr>
        {:else}
          {#each Object.entries(groupByCompany(filteredData)) as [company, entries], companyIndex}
            {@const firstEntry = entries[0]}
            <!-- Company Row -->
            <tr 
              class="company-row data-entry {(firstEntry['CurrentStudyStatus'] && (firstEntry['CurrentStudyStatus'].includes('Terminated') || firstEntry['CurrentStudyStatus'].includes('Liquidated'))) ? 'bg-gray-100' : companyIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-200 cursor-pointer" 
              on:click={() => toggleCompanyExpansion(company)}
            >
              <td class="px-2 py-2 text-center">
                <span class="text-xs font-bold">{expandedCompanies[company] ? '−' : '+'}</span>
              </td>
              <td class="w-8 px-2 py-2 text-center">
                {#if isSmallCapActive(firstEntry)}
                  <div class="w-3 h-3 bg-emerald-500 rounded-full mx-auto"></div>
                {:else}
                  <div class="w-3 h-3 rounded-full mx-auto"></div>
                {/if}
              </td>
              <td class="pl-2 pr-8 py-1 text-xs w-1/8 font-medium border-r-2 border-slate-800 overflow-hidden text-ellipsis {(firstEntry['CurrentStudyStatus'] && (firstEntry['CurrentStudyStatus'].includes('Terminated') || firstEntry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">
                <a 
                  href="#" 
                  class="company-link hover:underline {(firstEntry['CurrentStudyStatus'] && (firstEntry['CurrentStudyStatus'].includes('Terminated') || firstEntry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : 'text-blue-600'}"
                  on:click|preventDefault={(e) => openCompanyDrawer(company, e)}
                >
                  {company}
                </a>
              </td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs border-r-2 border-slate-800">
                <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium {getMarketCapColor(firstEntry.MarketCap)}">
                  {formatMarketCap(firstEntry.MarketCap)}
                </span>
              </td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs {(firstEntry['CurrentStudyStatus'] && (firstEntry['CurrentStudyStatus'].includes('Terminated') || firstEntry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">{firstEntry.LastFundraise || 'N/A'}</td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs border-r-2 border-slate-800">{formatDate(firstEntry.FundraiseDate) || 'N/A'}</td>
            </tr>
            
            <!-- Expanded Details -->
            {#if expandedCompanies[company]}
              {#each entries as entry, entry_index}
                <tr class="detail-row hover:bg-slate-100 {entry_index % 2 === 0 ? 'bg-slate-50/70' : 'bg-white/70'}">
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                  <td colspan="4" class="px-4 py-2 border-b border-gray-200">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <span class="text-[9px] text-gray-500 uppercase font-mono">Candidate</span>
                        <div class="font-medium capitalize">{entry.Candidate || 'N/A'}</div>
                      </div>
                      <div>
                        <span class="text-[9px] text-gray-500 uppercase font-mono">Indication</span>
                        <div>{entry.Indication || 'N/A'}</div>
                      </div>
                      <div>
                        <span class="text-[9px] text-gray-500 uppercase font-mono">Status</span>
                        <div class="flex flex-col">
                          {#if entry['CurrentStudyStatus']}
                            {#if entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated')}
                              <span class="text-slate-300">{entry['CurrentStudyStatus']}</span>
                            {:else if entry['CurrentStudyStatus'].includes('Filed')}
                              <span class="text-emerald-600 font-medium">{entry['CurrentStudyStatus']}</span>
                            {:else}
                              <span>{entry['CurrentStudyStatus']}</span>
                            {/if}
                          {:else}
                            <span>N/A</span>
                          {/if}
                          <span class="text-[9px] text-gray-500"> {entry["PRV Status"] || 'N/A'}</span>
                        </div>
                      </div>
                      <div>
                        <span class="text-[9px] text-gray-500 uppercase font-mono">Study Details</span>
                        <div class="flex flex-col">
                          <div class="flex items-center">
                            {#if entry["Current Study"]}
                              <a 
                                href={entry["Current Study"]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                class="{(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-blue-400' : 'text-blue-600'} hover:underline"
                                on:click|stopPropagation
                              >
                                View Study
                              </a>
                            {:else}
                              <span>N/A</span>
                            {/if}
                          </div>
                          <div class="flex flex-col text-[9px] mt-1 text-gray-600">
                            <span>Est. Completion: {formatDate(entry["EstimatedStudyCompletion"])}</span>
                            <span>Last Update: {formatDate(entry.LastStatusUpdate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

</section>

<!-- Add RPDCompanyDetailDrawer component -->
<RPDCompanyDetailDrawer 
  isOpen={isCompanyDrawerOpen}
  companyName={selectedCompany}
  allData={data}
  {stockData}
  onClose={closeCompanyDrawer}
  onShowDrugDetail={handleDrugDetail}
  color="#37587e"
/>

<style>
  .rpdd-table-section {
    width: 100%;
    padding: 0 1rem;
  }

  .header-cell {

  }

  .data-entry {
    border: 1px dotted #E0E0E0;
  }
  
  /* Style for sortable headers */
  th.cursor-pointer {
    position: relative;
    user-select: none;
    transition: background-color 0.15s ease;
  }
  
  th.cursor-pointer:hover::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #cbd5e0;
  }
  
  @media (min-width: 768px) {
    .rpdd-table-section {
      padding: 0 2rem;
    }
  }
  
  .company-link {
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    display: block;
  }
  
  .company-link:hover {
    text-decoration: underline;
    opacity: 0.85;
  }
</style> 
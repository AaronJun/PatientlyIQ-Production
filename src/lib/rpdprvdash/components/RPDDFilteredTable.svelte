<script lang="ts">
  import { onMount } from 'svelte';
  import RPDCompanyDetailDrawer from '../RPDCompanyDetailDrawer.svelte';
  import { ArrowUpRight } from 'carbon-icons-svelte';
  
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
    "Public/Private"?: string;
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
    
    // Public company market caps
    if (marketCapLower.includes('mega')) return 'bg-blue-100 text-blue-800'; // Mega cap
    if (marketCapLower.includes('large')) return 'bg-green-100 text-green-800'; // Large cap
    if (marketCapLower.includes('mid')) return 'bg-teal-100 text-teal-800'; // Mid cap
    if (marketCapLower.includes('small')) return 'bg-emerald-100 text-emerald-800'; // Small cap
    if (marketCapLower.includes('micro')) return 'bg-yellow-100 text-yellow-800'; // Micro cap
    if (marketCapLower.includes('nano')) return 'bg-orange-100 text-orange-800'; // Nano cap
    
    // Private company financing stages
    if (marketCapLower.includes('series a')) return 'bg-pink-100 text-pink-800'; // Series A
    if (marketCapLower.includes('series b')) return 'bg-purple-100 text-purple-800'; // Series B
    if (marketCapLower.includes('series c')) return 'bg-indigo-100 text-indigo-800'; // Series C
    if (marketCapLower.includes('series d')) return 'bg-violet-100 text-violet-800'; // Series D
    if (marketCapLower.includes('seed')) return 'bg-rose-100 text-rose-800'; // Seed
    if (marketCapLower.includes('grant')) return 'bg-lime-100 text-lime-800'; // Grant-supported
    
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
  let searchQuery = ''; // Add search query state
  let showOnlySmallCapActive = false; // Filter for small cap active companies
  let filterPublicPrivate = "all"; // Filter for public/private status
  let filterMarketCap = "all"; // Filter for company size/market cap (deprecated)
  
  // Multiple market cap selection using checkboxes
  let selectedMarketCaps = {
    mega: false,
    large: false,
    mid: false,
    small: false,
    micro: false,
    nano: false,
    // Add financing series options
    seriesa: false,
    seriesb: false,
    seriesc: false,
    seriesd: false,
    seed: false,
    grant: false  // Add grant-supported option
  };
  
  // Add class filter state
  let selectedClasses = {
    green: false,
    yellow: false,
    red: false
  };
  
  // Function to check if any market cap is selected
  function isAnyMarketCapSelected(): boolean {
    return Object.values(selectedMarketCaps).some(value => value);
  }
  
  // Function to check if any class is selected
  function isAnyClassSelected(): boolean {
    return Object.values(selectedClasses).some(value => value);
  }
  
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
      'advocacy', 'academic', '.edu', 'school of', 'center for', 'NCATS', 'Rosa'
    ];
    
    const companyLower = company.toLowerCase();
    return nonCommercialKeywords.some(keyword => companyLower.includes(keyword.toLowerCase()));
  }
  
  // Function to check company classification
  function getCompanyClassification(entries: DataEntry[]): 'green' | 'yellow' | 'red' | 'none' {
    // Check if any entry meets the size/funding criteria
    const hasValidSize = entries.some(entry => {
      const marketCap = entry.MarketCap?.toLowerCase() || '';
      const isSmallCap = ['nano', 'micro', 'small'].some(size => marketCap.includes(size));
      const isEarlyStage = ['series a', 'series b', 'seed', 'grant'].some(stage => marketCap.includes(stage));
      return isSmallCap || isEarlyStage;
    });

    const hasLaterStage = entries.some(entry => {
      const marketCap = entry.MarketCap?.toLowerCase() || '';
      return ['series c', 'series d'].some(stage => marketCap.includes(stage));
    });

    if (!hasValidSize && !hasLaterStage) return 'none';

    // Check study statuses
    const hasActiveStudy = entries.some(entry => {
      const status = entry.CurrentStudyStatus?.toLowerCase() || '';
      return ['active', 'recruiting', 'initiating', 'active, not recruiting'].some(s => status.includes(s));
    });

    const hasUnknownStudy = entries.some(entry => {
      const status = entry.CurrentStudyStatus?.toLowerCase() || '';
      return status.includes('unknown');
    });

    const hasTerminatedStudy = entries.some(entry => {
      const status = entry.CurrentStudyStatus?.toLowerCase() || '';
      return status.includes('terminated');
    });

    // Apply classification rules
    if (hasActiveStudy && (hasValidSize || !hasLaterStage)) return 'green';
    if (hasUnknownStudy) return 'yellow';
    if (hasTerminatedStudy) return 'red';
    
    return 'none';
  }

  // Update the table row to show the new classification indicators
  $: getClassIndicator = (entries: DataEntry[]) => {
    const classification = getCompanyClassification(entries);
    switch (classification) {
      case 'green':
        return 'w-3 h-3 bg-emerald-500 rounded-full mx-auto';
      case 'yellow':
        return 'w-3 h-3 bg-yellow-500 rounded-full mx-auto';
      case 'red':
        return 'w-3 h-3 bg-red-500 rounded-full mx-auto';
      default:
        return 'w-3 h-3 rounded-full mx-auto';
    }
  };
  
  // Update filterData function to include class filtering
  function filterData() {
    let result = [...data];
    
    // First filter out non-commercial entities
    result = result.filter(entry => !isNonCommercialEntity(entry.Company || ''));

    // Apply class filter if any classes are selected
    if (isAnyClassSelected()) {
      // Get all companies that match the selected classifications
      const validCompanies = new Set(
        result.filter(entry => {
          const company = entry.Company || '';
          const entries = groupByCompany(result)[company] || [];
          const classification = getCompanyClassification(entries);
          return selectedClasses[classification as keyof typeof selectedClasses];
        }).map(entry => entry.Company)
      );
      
      // Keep only entries from companies that match the classification
      result = result.filter(entry => validCompanies.has(entry.Company));
    }

    // Apply search filter if there is a search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(entry => {
        // Search across multiple fields
        return (
          (entry.Company || '').toLowerCase().includes(query) || 
          (entry.Candidate || '').toLowerCase().includes(query) || 
          (entry.Indication || '').toLowerCase().includes(query) || 
          (entry.TherapeuticArea1 || '').toLowerCase().includes(query) ||
          (entry['Current Development Stage'] || '').toLowerCase().includes(query)
        );
      });
    }
    
    // Filter by Market Cap / Size and Financing Series
    if (isAnyMarketCapSelected()) {
      // Get all companies that match the market cap criteria
      const validCompanies = new Set(
        result.filter(entry => {
          const marketCap = entry.MarketCap?.toLowerCase() || '';
          const lastFundraise = entry.LastFundraise?.toLowerCase() || '';
          
          // Check public company market caps
          const isSelectedPublicSize = Object.entries(selectedMarketCaps)
            .filter(([key, _]) => ['mega', 'large', 'mid', 'small', 'micro', 'nano'].includes(key))
            .some(([size, isSelected]) => isSelected && marketCap.includes(size));
          
          // Check private company financing series
          const isSelectedPrivateFinancing = Object.entries(selectedMarketCaps)
            .filter(([key, _]) => ['seriesa', 'seriesb', 'seriesc', 'seriesd', 'seed'].includes(key))
            .some(([series, isSelected]) => {
              if (!isSelected) return false;
              // More flexible matching for series financing - check both LastFundraise and MarketCap fields
              if (series === 'seriesa' && (
                lastFundraise.includes('series a') || lastFundraise.includes('seriesa') || 
                marketCap.includes('series a') || marketCap.includes('seriesa')
              )) return true;
              if (series === 'seriesb' && (
                lastFundraise.includes('series b') || lastFundraise.includes('seriesb') || 
                marketCap.includes('series b') || marketCap.includes('seriesb')
              )) return true;
              if (series === 'seriesc' && (
                lastFundraise.includes('series c') || lastFundraise.includes('seriesc') || 
                marketCap.includes('series c') || marketCap.includes('seriesc')
              )) return true;
              if (series === 'seriesd' && (
                lastFundraise.includes('series d') || lastFundraise.includes('seriesd') || 
                marketCap.includes('series d') || marketCap.includes('seriesd')
              )) return true;
              if (series === 'seed' && (
                lastFundraise.includes('seed') || marketCap.includes('seed')
              )) return true;
              return false;
            });
          
          // Check grant support
          const isGrantSupported = selectedMarketCaps.grant && 
            (lastFundraise.toLowerCase().includes('grant') || marketCap.toLowerCase().includes('grant'));
          
          return isSelectedPublicSize || isSelectedPrivateFinancing || isGrantSupported;
        }).map(entry => entry.Company)
      );
      
      // Keep only entries from companies that match the market cap criteria
      result = result.filter(entry => validCompanies.has(entry.Company));
    }
    
    // Filter by RPDD Year if specified - only allow 2020
    if (filterYear && filterYear !== "all") {
      result = result.filter(entry => entry["RPDD Year"] === "2020");
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
      // Special handling for Class sorting
      if (sortKey === 'Class') {
        const groupsA = groupByCompany([a]);
        const groupsB = groupByCompany([b]);
        const classA = getCompanyClassification(groupsA[a.Company || ''] || []);
        const classB = getCompanyClassification(groupsB[b.Company || ''] || []);
        
        // Define order: green > yellow > red > none
        const classOrder = { green: 4, yellow: 3, red: 2, none: 1 };
        
        const orderA = classOrder[classA as keyof typeof classOrder];
        const orderB = classOrder[classB as keyof typeof classOrder];
        
        if (sortDirection === 'asc') {
          return orderA - orderB;
        } else {
          return orderB - orderA;
        }
      }

      // Regular sorting for other columns
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
  <div class="flex flex-col space-y-4 mb-4">
    <!-- Top row with title and common filters -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-medium">{title}</h2>
      
      <!-- Common filters (Search and Year) -->
      <div class="flex items-center space-x-4">
        <!-- Search input -->
        <div class="flex items-center">
          <label for="searchFilter" class="text-sm text-gray-600 mr-2">Search:</label>
          <input
            id="searchFilter"
            type="text"
            bind:value={searchQuery}
            on:input={() => { filteredData = filterData(); sortData(); }}
            placeholder="Search companies, drugs..."
            class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>
        
        <!-- Year dropdown -->
        <div class="flex items-center">
          <label for="yearFilter" class="text-sm text-gray-600 mr-2">Filter by Year:</label>
          <select 
            id="yearFilter"
            bind:value={filterYear}
            on:change={() => { filteredData = filterData(); sortData(); }}
            class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all" disabled class="text-gray-400">All Years</option>
            {#each uniqueYears as year}
              <option 
                value={year} 
                disabled={year !== "2020"}
                class={year !== "2020" ? "text-gray-400" : ""}
              >{year}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <!-- Filter rows -->
    <div class="flex flex-col space-y-2">
      <!-- Class filters -->
      <div class="flex items-center space-x-4 bg-slate-50 p-2 rounded-lg">
        <span class="text-sm font-medium text-slate-800 min-w-[100px]">Classification:</span>
        <div class="flex items-center space-x-4">
          <div class="flex flex-wrap gap-2 items-center">
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedClasses.green}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-emerald-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500"
              >
              <span class="ml-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Green</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedClasses.yellow}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-yellow-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-yellow-500"
              >
              <span class="ml-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Yellow</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedClasses.red}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-red-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-red-500"
              >
              <span class="ml-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Red</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Public company filters -->
      <div class="flex items-center space-x-4 bg-purple-50 p-2 rounded-lg">
        <span class="text-sm font-medium text-purple-800 min-w-[100px]">Public Companies:</span>
        <div class="flex items-center space-x-4">
          <!-- Market Cap filters for public companies -->
          <div class="flex flex-wrap gap-2 items-center">
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.mega}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
              >
              <span class="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Mega</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.large}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-green-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-green-500"
              >
              <span class="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Large</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.mid}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-teal-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-teal-500"
              >
              <span class="ml-1 text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">Mid</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.small}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-emerald-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-emerald-500"
              >
              <span class="ml-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Small</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.micro}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-yellow-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-yellow-500"
              >
              <span class="ml-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Micro</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.nano}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-orange-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-orange-500"
              >
              <span class="ml-1 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Nano</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Private company filters -->
      <div class="flex items-center space-x-4 bg-gray-50 p-2 rounded-lg">
        <span class="text-sm font-medium text-gray-800 min-w-[100px]">Private Companies:</span>
        <div class="flex items-center space-x-4">
          <!-- Financing Series filters -->
          <div class="flex flex-wrap gap-2 items-center">
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.seriesa}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-pink-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-pink-500"
              >
              <span class="ml-1 text-xs bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">Series A</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.seriesb}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-purple-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-purple-500"
              >
              <span class="ml-1 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Series B</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.seriesc}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-indigo-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500"
              >
              <span class="ml-1 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Series C</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.seriesd}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-violet-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-violet-500"
              >
              <span class="ml-1 text-xs bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">Series D</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.seed}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-rose-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-rose-500"
              >
              <span class="ml-1 text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">Seed</span>
            </label>
            <label class="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={selectedMarketCaps.grant}
                on:change={() => { filteredData = filterData(); sortData(); }}
                class="form-checkbox h-3 w-3 text-lime-600 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-lime-500"
              >
              <span class="ml-1 text-xs bg-lime-100 text-lime-800 px-2 py-0.5 rounded-full">Grant-Supported</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="overflow-x-auto overflow-y-auto max-h-[70vh] scrollbar-container">
    <table class="w-full min-w-[90vw] bg-stone-100 border-1 border-slate-800 text-xs shadow-md rounded-lg">
      <thead class="sticky top-0 z-10">
        <tr>
          <th class="header-cell py-2 w-4 text-center font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 shadow-sm"></th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700 shadow-sm"
            on:click={() => handleSort('Class')}
          >
            CLASS {sortKey === 'Class' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700 shadow-sm" 
            on:click={() => handleSort('Company')}
          >
            COMPANY {sortKey === 'Company' ? (sortDirection === 'asc' ? '▲' : '▼') : ''} 
          </th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700 shadow-sm" 
            on:click={() => handleSort('Public/Private')}
          >
            PUBLIC/PRIVATE {sortKey === 'Public/Private' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700 shadow-sm" 
            on:click={() => handleSort('MarketCap')}
          >
            SIZE {sortKey === 'MarketCap' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700 shadow-sm" 
            on:click={() => handleSort('LastFundraise')}
          >
            RECENT FINANCING {sortKey === 'LastFundraise' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th 
            class="header-cell py-2 w-fit text-left font-medium text-[9.2px] font-mono px-2 text-slate-50 bg-slate-600 cursor-pointer hover:bg-slate-700 shadow-sm" 
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
                <div class={getClassIndicator(entries)}></div>
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
                <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium {firstEntry['Public/Private'] === 'Public' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">
                  {firstEntry['Public/Private'] || 'Private'}
                </span>
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
              <!-- Classification Explanation Row -->
              {@const classification = getCompanyClassification(entries)}
              {#if classification !== 'none'}
                {@const marketCap = entries[0].MarketCap?.toLowerCase() || ''}
                {@const studyStatus = entries[0].CurrentStudyStatus?.toLowerCase() || ''}
                {@const activeStudyCount = entries.filter(e => 
                  ['active', 'recruiting', 'initiating', 'active, not recruiting']
                    .some(s => e.CurrentStudyStatus?.toLowerCase().includes(s))
                ).length}`
                {@const unknownStudyCount = entries.filter(e => 
                  e.CurrentStudyStatus?.toLowerCase().includes('unknown')
                ).length}
                {@const terminatedStudyCount = entries.filter(e => 
                  e.CurrentStudyStatus?.toLowerCase().includes('terminated')
                ).length}
                <tr class="detail-row bg-slate-50/90 border-b border-gray-200 bg-slate-200/80 w-full">
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                  <td colspan="4" class="px-4 py-2">
                    <div class="text-xs">
                      {#if classification === 'green'}
                        <span class="text-emerald-700">
                          {company} is a <span class="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">GREEN</span> target, due to 
                          {#if ['nano', 'micro', 'small'].some(size => marketCap.includes(size))}
                            market cap class of <span class="font-semibold border-b border-dotted border-emerald-700">{marketCap.toUpperCase()}</span>
                          {:else if ['series a', 'series b', 'seed', 'grant'].some(stage => marketCap.includes(stage))}
                            being a <span class="font-semibold border-b border-dotted border-emerald-700">{marketCap.toUpperCase()}</span> company
                          {/if}
                          and {activeStudyCount === 1 ? 'one study' : `${activeStudyCount} studies`} with a status of <span class="font-semibold border-b border-dotted border-emerald-700">{studyStatus.toUpperCase()}</span>.
                        </span>
                      {:else if classification === 'yellow'}
                        <span class="text-yellow-700">
                          {company} is a <span class="inline-block px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold">YELLOW</span> target due to {unknownStudyCount === 1 ? 'one study' : `${unknownStudyCount} studies`} with <span class="font-semibold border-b border-dotted border-yellow-700">unknown</span> study status.
                        </span>
                      {:else if classification === 'red'}
                        <span class="text-red-700">
                          {company} is a <span class="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">RED</span> target due to {terminatedStudyCount === 1 ? 'one study' : `${terminatedStudyCount} studies`} with <span class="font-semibold border-b border-dotted border-red-700">terminated</span> study status.
                        </span>
                      {/if}
                    </div>
                  </td>
                </tr>
              {/if}
              
              <!-- Existing entry details rows -->
              {#each entries as entry, entry_index}
                <tr class="detail-row hover:bg-slate-100 {entry['CurrentStudyStatus']?.toLowerCase().includes('terminated') || entry['CurrentStudyStatus']?.toLowerCase().includes('suspended') ? 'bg-gray-200/70 text-gray-500' : entry_index % 2 === 0 ? 'bg-slate-50/70' : 'bg-white/70'}">
                  <td class="px-2 py-2"></td>
                  <td class="px-2 py-2"></td>
                  <td colspan="4" class="px-4 py-2 border-b border-gray-200">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <span class="text-[9px] text-gray-500 uppercase font-mono">Candidate</span>
                        <div class="font-medium capitalize {entry['CurrentStudyStatus']?.toLowerCase().includes('terminated') || entry['CurrentStudyStatus']?.toLowerCase().includes('suspended') ? 'text-gray-500' : ''}">{entry.Candidate || 'N/A'}</div>
                      </div>
                      <div>
                        <span class="text-[9px] text-gray-500 uppercase font-mono">Indication</span>
                        <div class="{entry['CurrentStudyStatus']?.toLowerCase().includes('terminated') || entry['CurrentStudyStatus']?.toLowerCase().includes('suspended') ? 'text-gray-500' : ''}">{entry.Indication || 'N/A'}</div>
                      </div>
                      <div>
                        <span class="text-[9px] text-gray-500 uppercase font-mono">Status</span>
                        <div class="flex flex-col">
                          {#if entry['CurrentStudyStatus']}
                            {#if entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Suspended')}
                              <span class="text-gray-500">{entry['CurrentStudyStatus']}</span>
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
    position: sticky;
    top: 0;
    z-index: 20;
  }
  
  /* Make sure the z-index is lower than our drawer */
  thead.sticky {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    z-index: 20;
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

  /* Style for table with scrollable body */
  .scrollbar-container {
    scrollbar-width: thin;
    overflow-y: scroll; /* Always show scrollbar */
    border: 1px solid #f0f0f0;
    border-radius: 6px;
  }
  
  .scrollbar-container::-webkit-scrollbar {
    width: 10px;
    height: 10px; /* For horizontal scrollbar */
    display: block; /* Always display scrollbar */
  }
  
  .scrollbar-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .scrollbar-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
    border: 1px solid #f1f1f1;
  }
  
  .scrollbar-container::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  
  .scrollbar-container::-webkit-scrollbar-corner {
    background: #f1f1f1;
  }
</style> 
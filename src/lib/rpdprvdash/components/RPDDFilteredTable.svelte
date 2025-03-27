<script lang="ts">
  import { onMount } from 'svelte';
  
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
  }
  
  export let data: DataEntry[] = [];
  export let filterYear: string = "2018";
  export let filterPRVStatus: string = "non-awarded"; // "non-awarded" or "all" or specific status
  export let title: string = "RPDD Entries";
  export let onEntrySelect: (entry: DataEntry) => void = () => {};
  
  // Format date from YYYY-MM-DD to MM/DD/YYYY
  function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
  }
  
  // Get unique years from data for the dropdown
  $: uniqueYears = [...new Set(data.map(entry => entry["RPDD Year"]).filter(Boolean))].sort((a, b) => {
    if (!a || !b) return 0;
    return b.localeCompare(a);
  });
  
  // Define table headers with configuration
  const headers = [
    { key: 'RPDD Year', label: 'RPDD Year', sortable: true },
    { key: 'Company', label: 'Company', sortable: true },
    { key: 'Candidate', label: 'Candidate', sortable: true },
    { key: 'Indication', label: 'Indication', sortable: true },
    { key: 'Current Development Stage', label: 'Phase at RPD', sortable: true },
    { key: 'CurrentStudyStatus', label: 'Current Study Phase', sortable: true },
    { key: 'PRV Status', label: 'Current Status', sortable: true },
    { key: 'EstimatedStudyCompletion', label: 'Est. Completion', sortable: true },
    { key: 'Current Study', label: 'Study Link', sortable: true }
  ];
  
  // State for sorting
  let sortKey = 'Company';
  let sortDirection = 'asc';
  let filteredData: DataEntry[] = [];
  let showTerminated = true; // Default to showing all entries
  
  // Filter data based on provided criteria
  function filterData() {
    let result = [...data];
    
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

<section class="rpdd-table-section mt-6 mb-8">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-2xl font-semibold">{title}</h2>
    
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

      <!-- Existing terminated entries checkbox -->
      <div class="flex items-center">
        <label for="showTerminated" class="flex items-center text-sm text-gray-600">
          <input 
            type="checkbox" 
            id="showTerminated" 
            bind:checked={showTerminated}
            class="mr-2"
          >
          Show Terminated/Liquidated Entries
        </label>
      </div>
    </div>
  </div>
  
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 text-xs shadow-md rounded-lg">
      <thead>
        <tr>
          {#each headers as header}
            <th 
              class="py-2 text-left font-medium text-2xs font-mono text-slate-600 bg-stone-200 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
              on:click={() => header.sortable && handleSort(header.key)}
            >
              <div class="flex px-2">
                <span>{header.label}</span>
                {#if sortKey === header.key}
                  <span class="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                {/if}
                
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if filteredData.length === 0}
          <tr>
            <td colspan={headers.length} class="py-2 text-center">No data found matching the criteria.</td>
          </tr>
        {:else}
          {#each filteredData as entry}
            <tr 
              class="hover:bg-gray-50 cursor-pointer {(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'bg-gray-50' : ''}" 
              on:click={() => onEntrySelect(entry)}
            >
              <td class="px-1 py-2 border-b border-gray-200 text-xs w-1/12 {(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">{entry["RPDD Year"] || 'N/A'}</td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs w-1/4 overflow-hidden text-ellipsis {(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">{entry.Company || 'N/A'}</td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs w-1/6 {(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">{entry.Candidate || 'N/A'}</td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs w-16 overflow-hidden text-ellipsis whitespace-nowrap {(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">{entry.Indication || 'N/A'}</td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs text-xs w-22 {(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">{entry["Current Development Stage"] || 'N/A'}</td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs w-22" title="Green: Filed status | Gray: Terminated or Liquidated">
                {#if entry['CurrentStudyStatus']}
                  {#if entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated')}
                    <span class="text-slate-300">{entry['CurrentStudyStatus']}</span>
                  {:else if entry['CurrentStudyStatus'].includes('Filed')}
                    {#if entry["Current Study"]}
                      <a 
                        href={entry["Current Study"]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="text-emerald-600 font-medium hover:underline"
                        on:click|stopPropagation
                      >
                        {entry['CurrentStudyStatus']}
                      </a>
                    {:else}
                      <span class="text-emerald-600 font-medium">{entry['CurrentStudyStatus']}</span>
                    {/if}
                  {:else}
                    {#if entry["Current Study"]}
                      <a 
                        href={entry["Current Study"]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="hover:underline"
                        on:click|stopPropagation
                      >
                        {entry['CurrentStudyStatus']}
                      </a>
                    {:else}
                      <span>{entry['CurrentStudyStatus']}</span>
                    {/if}
                  {/if}
                {:else}
                  <span>N/A</span>
                {/if}
              </td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs {(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">
                {#if entry["Current Study"]}
                  <a 
                    href={entry["Current Study"]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="{(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-blue-400' : 'text-blue-600'} hover:underline"
                    on:click|stopPropagation
                  >
                    {entry["PRV Status"] || 'N/A'}
                  </a>
                {:else}
                  {entry["PRV Status"] || 'N/A'}
                {/if}
              </td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs {(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">
                {formatDate(entry["EstimatedStudyCompletion"])}
              </td>
              <td class="px-2 py-2 border-b border-gray-200 text-xs {(entry['CurrentStudyStatus'] && (entry['CurrentStudyStatus'].includes('Terminated') || entry['CurrentStudyStatus'].includes('Liquidated'))) ? 'text-slate-400' : ''}">
                {#if entry["Current Study"]}
                  <a 
                    href={entry["Current Study"]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline"
                    on:click|stopPropagation
                  >
                    View Study
                  </a>
                {:else}
                  N/A
                {/if}
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  
  <div class="mt-4 text-gray-600">
    <p>Showing {filteredData.length} entries with the applied filters</p>
  </div>

  <!-- Add a color legend -->
  <div class="mt-4 text-sm">
    <p class="mb-2 text-gray-600 font-medium">Status Legend:</p>
    <div class="flex items-center space-x-6 flex-wrap">
      <div class="flex items-center mb-2">
        <span class="inline-block w-3 h-3 mr-2 bg-emerald-600 rounded-full"></span>
        <span class="text-gray-700">Filed</span>
      </div>
      <div class="flex items-center mb-2">
        <span class="inline-block w-3 h-3 mr-2 bg-slate-300 rounded-full"></span>
        <span class="text-gray-700">Terminated/Liquidated</span>
      </div>
      <div class="flex items-center mb-2">
        <span class="inline-block w-3 h-3 mr-2 bg-blue-600 rounded-full"></span>
        <span class="text-gray-700">Clickable Links - Both Current Study Phase and Current Status columns may contain links to studies</span>
      </div>
    </div>
  </div>
</section>

<style>
  .rpdd-table-section {
    width: 100%;
    padding: 0 1rem;
  }
  
  @media (min-width: 768px) {
    .rpdd-table-section {
      padding: 0 2rem;
    }
  }
</style> 
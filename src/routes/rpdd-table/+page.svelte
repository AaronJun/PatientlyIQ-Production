<script>
  import { onMount } from 'svelte';
  import mergedData from '$lib/data/rpdprvdash/mergeddata.json';
  
  // Define table headers
  const headers = [
    { key: 'Company', label: 'Company', sortable: true },
    { key: 'RPDD Year', label: 'RPDD Year', sortable: true },
    { key: 'Current Development Stage', label: 'Current Development Stage', sortable: true },
    { key: 'PRV Status', label: 'PRV Status', sortable: true }
  ];
  
  // Filter data for entries with RPDD Year = 2018 and PRV Status is not "PRV Awarded"
  let filteredData = [];
  let sortKey = 'Company';
  let sortDirection = 'asc';
  
  onMount(() => {
    filteredData = mergedData.filter(entry => 
      entry["RPDD Year"] === "2018" && 
      entry["PRV Status"] !== "PRV Awarded"
    );
    sortData();
  });
  
  // Function to handle sorting
  function sortData() {
    filteredData = [...filteredData].sort((a, b) => {
      const valueA = a[sortKey] || '';
      const valueB = b[sortKey] || '';
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  function handleSort(key) {
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
</script>

<svelte:head>
  <title>RPDD 2018 Entries (Non-PRV Awarded)</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-6">RPDD 2018 Entries (Non-PRV Awarded)</h1>
  
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
      <thead>
        <tr>
          {#each headers as header}
            <th 
              class="px-4 py-2 bg-gray-100 border-b border-gray-200 text-left font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
              on:click={() => header.sortable && handleSort(header.key)}
            >
              <div class="flex items-center">
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
            <td colspan="4" class="px-4 py-2 text-center">No data found matching the criteria.</td>
          </tr>
        {:else}
          {#each filteredData as entry}
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-2 border-b border-gray-200">{entry.Company || 'N/A'}</td>
              <td class="px-4 py-2 border-b border-gray-200">{entry["RPDD Year"] || 'N/A'}</td>
              <td class="px-4 py-2 border-b border-gray-200">{entry["Current Development Stage"] || 'N/A'}</td>
              <td class="px-4 py-2 border-b border-gray-200">{entry["PRV Status"] || 'N/A'}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  
  <div class="mt-4 text-gray-600">
    <p>Showing {filteredData.length} entries where RPDD Year = 2018 and PRV Status is not "PRV Awarded"</p>
  </div>
</div> 
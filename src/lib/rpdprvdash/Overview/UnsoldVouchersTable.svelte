<!-- UnsoldVouchersTable.svelte -->
<script lang="ts">
  import { hasPRVAward } from '../utils/data-processing-utils';
  
  // Use a more generic type that will be compatible with the parent component
  export let data: any[] = []; // Full dataset
  export let year: string = ""; // Selected year
  export let onEntrySelect: (entry: any) => void = () => {}; // Callback for when an entry is selected
  
  // Unsold vouchers section
  $: unsoldVouchers = data.filter(entry => 
    hasPRVAward(entry) && (!entry.Purchased || entry.Purchased !== "Y")
  );
  
  $: unsoldVouchersInYear = unsoldVouchers.filter(entry => 
    entry["PRV Year"] === year
  );
  
  // Prepare data for the table
  $: unsoldVouchersData = (year ? unsoldVouchersInYear : unsoldVouchers).map(entry => ({
    company: entry.Company || "Unknown",
    candidate: entry.Candidate || "Unknown",
    indication: entry.Indication || "Unknown",
    prvYear: entry["PRV Year"] || "Unknown",
    stage: entry["Current Development Stage"] || "Unknown",
    originalEntry: entry // Keep the original entry for the onEntrySelect callback
  }));
  
  // Define a type for the table data
  type TableEntry = {
    company: string;
    candidate: string;
    indication: string;
    prvYear: string;
    stage: string;
    originalEntry: any;
  };
  
  // Sorting functionality
  let sortField: keyof TableEntry = "company";
  let sortDirection = 1; // 1 for ascending, -1 for descending
  
  function sortTable(field: keyof TableEntry) {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      sortDirection = -sortDirection;
    } else {
      // New field, default to ascending
      sortField = field;
      sortDirection = 1;
    }
  }
  
  // Type-safe sorting function
  $: sortedVouchers = [...unsoldVouchersData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * sortDirection;
    }
    
    return ((aValue > bValue) ? 1 : -1) * sortDirection;
  });
  
  // Handle row click
  function handleRowClick(entry: TableEntry) {
    onEntrySelect(entry.originalEntry);
  }
</script>

<div class="unsold-vouchers-table">
  <div class="mb-3 flex justify-between items-center">
    <h3 class="text-base font-semibold text-slate-700">
      Unsold Vouchers {year ? `(${year})` : '(All Time)'}
      <span class="text-emerald-600 ml-1">({sortedVouchers.length})</span>
    </h3>
  </div>
  
  {#if sortedVouchers.length > 0}
    <div class="overflow-x-auto border border-slate-200 rounded-md">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="text-left py-2 px-3 font-medium text-slate-600 cursor-pointer" on:click={() => sortTable("company")}>
              Company
              {#if sortField === "company"}
                <span class="ml-1">{sortDirection > 0 ? '↑' : '↓'}</span>
              {/if}
            </th>
            <th class="text-left py-2 px-3 font-medium text-slate-600 cursor-pointer" on:click={() => sortTable("candidate")}>
              Candidate
              {#if sortField === "candidate"}
                <span class="ml-1">{sortDirection > 0 ? '↑' : '↓'}</span>
              {/if}
            </th>
            <th class="text-left py-2 px-3 font-medium text-slate-600 cursor-pointer" on:click={() => sortTable("indication")}>
              Indication
              {#if sortField === "indication"}
                <span class="ml-1">{sortDirection > 0 ? '↑' : '↓'}</span>
              {/if}
            </th>
            <th class="text-left py-2 px-3 font-medium text-slate-600 cursor-pointer" on:click={() => sortTable("prvYear")}>
              PRV Year
              {#if sortField === "prvYear"}
                <span class="ml-1">{sortDirection > 0 ? '↑' : '↓'}</span>
              {/if}
            </th>
          </tr>
        </thead>
        <tbody>
          {#each sortedVouchers as voucher}
            <tr 
              class="border-b-2 border-slate-700 bg-slate-100 hover:bg-slate-50 cursor-pointer" 
              on:click={() => handleRowClick(voucher)}
            >
              <td class="py-2 px-3 text-slate-800 text-xs md:text-sm font-md">{voucher.company}</td>
              <td class="py-2 px-3 text-slate-600 text-xs md:text-sm font-md">{voucher.candidate}</td>
              <td class="py-2 px-3 text-slate-800 text-xs md:text-sm font-normal capitalize">{voucher.indication}</td>
              <td class="py-2 px-3 text-slate-700">{voucher.prvYear}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="text-center text-slate-500 text-sm py-4 border border-slate-200 rounded-md">No unsold vouchers available</p>
  {/if}
</div>

<style>
  /* Table styles */
  table {
    border-collapse: collapse;
    width: 100%;
  }
  
  th {
    position: sticky;
    top: 0;
    background-color: #f8fafc; /* slate-50 */
    z-index: 10;
  }
  
  th:hover {
    background-color: #e2e8f0; /* slate-200 */
  }
  
  tr:last-child {
    border-bottom: none;
  }
</style> 
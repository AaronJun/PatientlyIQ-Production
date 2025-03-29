<script lang="ts">
  import RPDDFilteredTable from '../components/RPDDFilteredTable.svelte';
  
  // Accept generic data and pass it to RPDDFilteredTable 
  export let data: any[] = [];
  export let filterYear: string = "2018";
  export let filterPRVStatus: string = "non-awarded";
  export let title: string = "Rare Pediatric Disease Designations";
  export let onEntrySelect: any = () => {};
  export let stockData: any[] = [];
</script>

<div class="rpdd-table-wrapper">
  <RPDDFilteredTable 
    {data}
    {filterYear}
    {filterPRVStatus}
    {title}
    {onEntrySelect}
    {stockData}
  />
</div>

<style>
  .rpdd-table-wrapper {
    width: 100%;
  }
</style> 
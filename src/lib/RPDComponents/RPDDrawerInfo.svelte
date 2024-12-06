<script lang="ts">
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
    import { ArrowUpRight } from 'carbon-icons-svelte';
  
    export let headers: Array<{key: string, value: string}>;
    export let rows: any[];
    export let onRowClick: (row: any) => void;
    export let searchTerm: string;
    export let isCurrentEntry: (row: any) => boolean;
  </script>

<Toolbar size="sm">
    <ToolbarContent>
      <ToolbarSearch bind:value={searchTerm} />
    </ToolbarContent>
  </Toolbar>
  
  <DataTable
    {headers}
    {rows}
    size="medium"
    sortable
    zebra
  >
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'drugName'}
        <div class="clickable-cell flex items-center gap-2"
             class:active={isCurrentEntry(row)}
             on:click={() => onRowClick(row)}>
          {cell.value}
          <ArrowUpRight size={12} />
        </div>
      {:else}
        {cell.value}
      {/if}
    </svelte:fragment>
  </DataTable>
  
  <style>
    .clickable-cell {
      cursor: pointer;
      color: #377e6b;
    }
  
    .clickable-cell:hover {
      border-bottom: 1px solid #377e6b;
    }
  
    :global(.bx--data-table-container) {
      width: 100%;
      height: 100%;
    }
  
    :global(.bx--data-table th, .bx--data-table td) {
      font-weight: 500;
      text-transform: capitalize;
      background-color: #eff7ff;
      color: #292F58;
      font-size: 10px;
    }
  </style>
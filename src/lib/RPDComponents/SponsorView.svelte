<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
  
    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let sponsorData: any;
    export let constellationData: any[];
  
    const ANIMATION_DURATION = 525;
    const TEXT_ANIMATION_DURATION = 300;
  
    let searchTerm = "";
  
    function formatDate(month: string, date: string, year: string): string {
      const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
      const monthIndex = monthNames.indexOf(month);
      if (monthIndex === -1) {
        console.error(`Invalid month: ${month}`);
        return `${date}, ${year}`;
      }
      return `${monthNames[monthIndex]} ${date}, ${year}`;
    }
  
    function formatSalePrice(price: string): string {
      if (!price || price === "NA") return 'N/A';
      const numPrice = parseFloat(price.replace(/[^0-9.-]+/g,""));
      return numPrice ? `$${numPrice.toFixed(2)} million` : 'N/A';
    }
  
    function filterData(data, searchTerm) {
      if (!searchTerm) return data;
      return data.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
  </script>
  
  <svelte:window on:keydown={handleKeydown}/>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
  {#if isOpen}
    <div class="drawer-backdrop"
         on:click={onClose} 
         transition:fade={{duration: ANIMATION_DURATION}}>
      
         <div class="drawer" 
           on:click|stopPropagation
           transition:fly={{x: 100, duration: ANIMATION_DURATION, delay: 200, easing: circInOut}}>
        <button class="close-button" on:click={onClose}>&times;</button>
        <div class="drawer-content">

            <div class="view-header">
                <h2 in:fade={{duration: TEXT_ANIMATION_DURATION}}>
                  {sponsorData.sponsor}
                </h2>
                <h4 class="detail" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
                  Sponsor Overview
                </h4>
              </div>
  
          <div class="table-container">
            <h3 in:fly={{duration: ANIMATION_DURATION}}>Vouchers Awarded</h3>
            <Toolbar size="sm">
              <ToolbarContent>
                <ToolbarSearch bind:value={searchTerm} />
              </ToolbarContent>
            </Toolbar>
        
            <DataTable
              size="medium"
              stickyHeader
              headers={[
                { key: 'date', value: 'Date' },
                { key: 'drugName', value: 'Drug Name' },
                { key: 'therapeuticArea', value: 'Therapeutic Area' },
                { key: 'indication', value: 'Indication' }
              ]}
              rows={filterData(sponsorData.sponsorData.map(entry => ({
                id: entry["Drug Name"],
                date: formatDate(entry.Month, entry.Date, entry.Year),
                drugName: entry["Drug Name"],
                therapeuticArea: entry.name || 'N/A',
                indication: entry.id || 'N/A'
              })), searchTerm)}
              sortable
              zebra
            />
          </div>
  
          {#if sponsorData.sponsorTransactions.length > 0}
            <div class="table-container">
              <h3 in:fade={{duration: TEXT_ANIMATION_DURATION}}>Voucher Transactions</h3>
              <Toolbar size="sm">
                <ToolbarContent>
                  <ToolbarSearch bind:value={searchTerm} />
                </ToolbarContent>
              </Toolbar>
             
              <DataTable
                size="medium"
                stickyHeader             
                headers={[
                  { key: 'date', value: 'Date' },
                  { key: 'drugName', value: 'Drug Name' },
                  { key: 'role', value: 'Role' },
                  { key: 'counterparty', value: 'Counterparty' },
                  { key: 'salePrice', value: 'Sale Price' }
                ]}
                rows={filterData(sponsorData.sponsorTransactions.map(entry => ({
                  id: entry["Drug Name"],
                  date: entry["Purchase Month"] && entry["Purchase Date"] && entry["Purchase Year"] 
                    ? formatDate(entry["Purchase Month"], entry["Purchase Date"], entry["Purchase Year"]) 
                    : 'N/A',
                  drugName: entry["Drug Name"],
                  role: entry.Sponsor === sponsorData.sponsor ? 'Seller' : 'Buyer',
                  counterparty: entry.Sponsor === sponsorData.sponsor ? entry.Purchaser : entry.Sponsor,
                  salePrice: formatSalePrice(entry["Sale Price"])
                })), searchTerm)}
                sortable
                zebra
              />
            </div>
          {:else}
            <p>No voucher transactions found for this sponsor.</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
  
  <style>
    .drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
    }
  
    .drawer {
      position: relative;
      width: 70vw;
      height: 100%;
      background-color: white;
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
      z-index: 1001;
      overflow-y: auto;
      border-left: 5px solid;
      padding: 2rem 2rem 2rem 2rem;
      box-sizing: border-box;
    }
  
    h2 {
        font-size: 1.825rem;
        font-weight: 800;
        color: #292F58;
        margin-left: -0.125rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
    }
  
    h4.detail {
        font-weight: 800;
        font-family: "IBM Plex Mono", 1rem;
        font-size: .725rem;
        color: #7c7c7c;
        text-transform: uppercase;
    }
  
    .drawer-content {
        padding: 3rem 2rem 5rem 1rem;
    }
  
    .close-button {
        position: absolute;
        right: 1rem;
        top: 3.5rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #878787;
        font-size: 1.35rem;
        font-weight: 400;
        font-family: "IBM Plex Mono", monospace;
        margin-top: 1rem;
        z-index: 1002;
    }
  
    .close-button:hover {
        color: #EC5E57;
        font-weight: 800;
    }
  
    .sponsor-id, .view-id {
        font-size: .825rem;
        font-weight: 800;
        cursor: pointer;
        text-transform: capitalize;
        color: #56709f;
    }
  
    .sponsor-id:hover {
      font-size: .825rem;
      font-weight: 800;
      text-transform: capitalize;
      color: #37587e;
    }
  
    .table-container {
        min-height: 250px;
        overflow-y: auto;
        max-width: 95%;
        margin: 2.25rem 0 2.25rem 0;
    }
  
    h3 {
        font-weight: 800;
        cursor: pointer;
        font-size: .75rem;
        text-transform: uppercase;
        color: #292F58;
        margin-bottom: 12px;
    }
  
    .label {
        font-size: .65rem;
        max-width: 150px;
        line-height: 1rem;
        font-family: "IBM Plex Mono", monospace;
        font-weight: 600;
    }
  
    .back-link {
      cursor: pointer;
      color: #737dc0;
      font-size: 2.25rem;
      font-weight: 800;
      font-family: "IBM Plex Mono", monospace;
      margin-bottom: rem;
      right: 1rem;
      top: 1.25rem;
      background: none;
      border: none;
      padding: 0;
      z-index: 1002;
    }
  
    .back-link:hover {
      color: #37587e;
      font-weight: 800;
      text-decoration: underline;
    }
  
    .clickable, .sponsor-id, .back-link {
      background: none;
      border: none;
      padding: 0;
      font: inherit;
      cursor: pointer;
      color: inherit;
    }
  
    .clickable:hover, .sponsor-id:hover, .back-link:hover {
      color: #37587e;
    }
  
    .clickable:focus, .sponsor-id:focus, .back-link:focus {
      outline: 1px dotted #37587e;
      outline-offset: 4px;
    }
  
    .view-header {
        display: column;
        justify-content: left;
        border-bottom: .5px solid #292F58;
        align-items: center;
        padding-bottom: 1.725rem;
        padding-top: 1.25rem;
        margin-bottom: 2rem;
    }
  
    table {
        width: 100%;
        border-collapse: collapse;
    }
  
    td {
        padding-top: .5rem;
        padding-bottom: .5rem;
        text-transform: capitalize;
        padding-right: .25rem;
        font-size: .75rem;
        padding-right: 1rem;
        line-height: 1rem;
        text-align: left;
    }
  
    th {
        position: sticky;
        font-size: .65rem;
        font-family: "IBM Plex Mono", monospace;
        top: 0;
        padding-top: 1rem;
        padding-bottom: 1rem;
        font-weight: 600;
        text-align: left;
    }
  
    .date {
        font-size: .65rem;
    }
  
    .sponsor {
        font-weight: 800;
    }
  
    tr {
      border-bottom: .5px #292F58;
      border-style: dotted;
    }
  
    tr:hover {
        background-color: #b7e0fe;
        cursor: pointer;
        border: 1px dotted #737dc0;
    }
  
    tr.active {
      background-color: #eff7ff;
      font-weight: 800;
      border-bottom: 2px solid #737dc0;
    }
  
    tr.active:hover {
      background-color: #d9edff;
    }
  
    .learn-more {
      font-size: 0.75rem;
      color: #56709f;
      cursor: pointer;
      margin-left: 0.5rem;
      font-weight: 600;
    }
  
    .learn-more:hover {
      color: #37587e;
      text-decoration: underline;
    }
  
    /* Ensure the learn more text doesn't wrap */
    td {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .clickable-cell {
      cursor: pointer;
      color: #0f62fe;
    }
  
    .clickable-cell:hover {
      text-decoration: underline;
    }
  
    :global(.bx--data-table-container) {
      width: 100%;
    }
  
    :global(.bx--toolbar-content) {
      margin-bottom: 1rem;
    }
  </style>
<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { circInOut } from 'svelte/easing';
  import SaleBenchmarks from './SaleBenchmarks.svelte';
  import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let data: any;
  export let constellationData: any[];
  export let color: string;
  export let sponsorData: any = null;

$: {
  if (sponsorData) {
    currentView = 'sponsor';
    currentViewTitle = sponsorData.sponsor;
    displayData = sponsorData.sponsorData[0] || {};
    color = getColorForTherapeuticArea(displayData.name);
  }
}

  const ANIMATION_DURATION = 525;
  const TEXT_ANIMATION_DURATION = 300;

  let currentView = 'original';
  let currentViewTitle = '';
  let displayData: any = data;
  let isTransitioning = false;
  let breadcrumbs: string[] = ['Home'];
  let searchTerm = "";

  // Update this reactive statement to handle sponsorData
  $: {
    if (sponsorData) {
      currentView = 'sponsor';
      currentViewTitle = sponsorData.sponsor;
      displayData = sponsorData.sponsorData[0] || {}; // Use the first entry as display data
      color = getColorForTherapeuticArea(displayData.name);
    } else {
      displayData = data;
      currentView = 'original';
      color = getColorForTherapeuticArea(data.name);
    }
  }

  $: yearData = constellationData
      .filter(d => d.Year === displayData.Year)
      .sort((a, b) => {
          const dateA = new Date(`${a.Year}-${a.Month}-${a.Date}`);
          const dateB = new Date(`${b.Year}-${b.Month}-${b.Date}`);
          return dateA.getTime() - dateB.getTime();
      });
  
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

  function showSponsorData(sponsor: string) {
    const sponsorData = constellationData.filter(d => d.Sponsor === sponsor);
    const sponsorTransactions = constellationData.filter(d => 
      (d.Sponsor === sponsor && d.Purchased === "Y") || d.Purchaser === sponsor
    );
    currentView = 'sponsor';
    currentViewTitle = `${sponsor}`;
    return { sponsorData, sponsorTransactions };
  }

  function showTherapeuticAreaData(ta: string) {
      const taData = constellationData.filter(d => d.name === ta);
      currentView = 'ta';
      currentViewTitle = `${ta}`;
      return taData;
  }

  function showIndicationData(indication: string) {
      const indicationData = constellationData.filter(d => d.id === indication);
      currentView = 'indication';
      currentViewTitle = `${indication}`;
      return indicationData;
  }

  function showEntryData(entry: any) {
      displayData = entry;
      currentView = 'original';
      color = getColorForTherapeuticArea(entry.name);
  }

  function showSaleBenchmarks() {
      currentView = 'saleBenchmarks';
      currentViewTitle = 'Voucher Transactions';
  }

  function backToOriginalView() {
      console.log('Returning to original view');
      displayData = data;
      currentView = 'original';
      color = getColorForTherapeuticArea(data.name);
  }

  function closeDrawer() {
      console.log('Closing drawer');
      if (currentView !== 'original') {
          backToOriginalView();
      } else {
          console.log('Calling onClose');
          onClose();
      }
  }

  function handleClick(action) {
      if (!isTransitioning) {
          isTransitioning = true;
          action();
          setTimeout(() => {
              isTransitioning = false;
          }, TEXT_ANIMATION_DURATION);
      }
  }

  function handleLearnMore(action) {
    if (!isTransitioning) {
      isTransitioning = true;
      action();
      setTimeout(() => {
        isTransitioning = false;
      }, TEXT_ANIMATION_DURATION);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
          closeDrawer();
      }
  }

  function getColorForTherapeuticArea(ta: string): string {
      const colorMap = {
        "Gastroenterology": "#4CAE3B",
        "Neurology": "#4D4DFF",
        "Ophthalmology": "#E79028",
        "Immunology": "#EA38A5",
        "Metabolic": "#133B11",
        "Dermatology": "#559368",
        "Hematology": "#CF3630",
        "Orthopedics": "#441780",
        "Respiratory": "#CBC09F",
        "Nephrology": "#ACA3DB",
        "Oncology": "#FF84DE",
        "Hepatology": "#FF00D4",
      };
      return colorMap[ta] || "#000000"; // Default to black if no match
  }

  function filterData(data, searchTerm) {
    if (!searchTerm) return data;
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  $: isCurrentEntry = (entry) => entry["Drug Name"] === displayData["Drug Name"];
</script>

<svelte:window on:keydown={handleKeydown}/>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="drawer-backdrop"
   on:click={closeDrawer} 
   transition:fly={{duration: ANIMATION_DURATION}}>

  <div class="drawer" 
       on:click|stopPropagation
       transition:fly={{x: 100, duration: ANIMATION_DURATION, easing: circInOut}}>

    <button class="close-button" 
            on:click={() => handleClick(closeDrawer)}>&times;</button>

    <div class="drawer-content">
      {#if currentView === 'original'}
        <div class="view-header">
          <h3>{displayData.Year}</h3>
          <h2 style="color: {color};" 
              in:fly={{duration: TEXT_ANIMATION_DURATION}}>
            {displayData["Drug Name"]}
          </h2>
   
          <button class="sponsor-id" 
                  on:click={() => handleClick(() => showSponsorData(displayData.Sponsor))}
                  in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            {displayData.Sponsor}
          </button>
        </div>
        <div class="table-container">
          <h3 in:fade={{duration: TEXT_ANIMATION_DURATION}}>Drug Details</h3>
          <table>
            <tbody>
              {#each ['Therapeutic Area', 'Indication', 'FDA-Approved Therapy Prior to 2012', 'Treatment Type', 'Treatment Detail'] as field}
                <tr class="clickable-row" 
                    on:click={() => handleClick(() => field === 'Therapeutic Area' ? showTherapeuticAreaData(displayData.name) : 
                                    field === 'Indication' ? showIndicationData(displayData.id) : null)}
                    tabindex="0" role="button">
                  <th class="label">{field}</th>
                  <td in:fade={{duration: TEXT_ANIMATION_DURATION}}>
                    {#if field === 'Therapeutic Area'}
                      {displayData.name}
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <span class="learn-more" on:click|stopPropagation={() => handleLearnMore(() => showTherapeuticAreaData(displayData.name))}>
                        All entries &rarr;
                      </span>
                    {:else if field === 'Indication'}
                      {displayData.id}
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <span class="learn-more" on:click|stopPropagation={() => handleLearnMore(() => showIndicationData(displayData.id))}>
                        All entries &rarr;
                      </span>
                    {:else if field === 'FDA-Approved Therapy Prior to 2012'}
                      {displayData["FDA-Approved Therapy Prior to 2012"] || 'N/A'}
                    {:else if field === 'Treatment Type'}
                      {displayData["Treatment Type"]}
                    {:else if field === 'Treatment Detail'}
                      {displayData["MOA"] || 'N/A'}
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="table-container">
          <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
          <h3 in:fade={{duration: TEXT_ANIMATION_DURATION}}
              on:click={() => handleClick(showSaleBenchmarks)}
              tabindex="0" role="button"
              class="clickable">
            Voucher Transaction
            <span class="learn-more">Learn more &rarr;</span>
          </h3>
          <table>
            <tbody>
              {#each ['Purchased', 'Purchaser', 'Sale Price', 'Purchase Date'] as field}
                <tr>
                  <th class="label">{field}</th>
                  <td in:fade={{duration: TEXT_ANIMATION_DURATION}}>
                    {#if field === 'Purchased'}
                      {displayData.Purchased || 'N/A'}
                    {:else if field === 'Purchaser'}
                      {displayData.Purchaser || 'N/A'}
                    {:else if field === 'Sale Price'}
                      {formatSalePrice(displayData["Sale  Price (USD, Millions)"])}
                    {:else if field === 'Purchase Date'}
                      {displayData["Purchase Month"] && displayData["Purchase Date"] && displayData["Purchase Year"] 
                        ? formatDate(displayData["Purchase Month"], displayData["Purchase Date"], displayData["Purchase Year"]) 
                        : 'N/A'}
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="table-container">
          <h3 in:fade={{duration: TEXT_ANIMATION_DURATION}}>Vouchers Awarded in {displayData.Year}</h3>
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
              { key: 'sponsor', value: 'Sponsor' },
              { key: 'drugName', value: 'Drug Name' }
            ]}
            rows={filterData(yearData.map(entry => ({
              id: entry["Drug Name"],
              date: formatDate(entry.Month, entry.Date, entry.Year),
              sponsor: entry.Sponsor,
              drugName: entry["Drug Name"]
            })), searchTerm)}
            sortable
            zebra
          >
            <svelte:fragment slot="cell" let:row let:cell>
              {#if cell.key === 'drugName'}
                <div
                  class="clickable-cell"
                  class:active={isCurrentEntry(row)}
                  on:click={() => handleClick(() => showEntryData(yearData.find(e => e["Drug Name"] === row.id)))}
                >
                  {cell.value}
                </div>
              {:else}
                {cell.value}
              {/if}
            </svelte:fragment>
          </DataTable>
        </div>
      {:else if currentView === 'sponsor'}
        <button class="back-link" 
          on:click={() => handleClick(closeDrawer)}
          in:fade={{duration: TEXT_ANIMATION_DURATION}}>&larr; Back
        </button>
        <div class="view-header"> 
          <h2 style="color: {color};" 
          in:fade={{duration: TEXT_ANIMATION_DURATION}}>
          {currentViewTitle}</h2>
          
          <h4 class="detail" 
          in:fade={{duration: TEXT_ANIMATION_DURATION}}>
          Sponsor Overview</h4>
        </div>

        {#if sponsorData || showSponsorData(displayData.Sponsor)}
          {@const { sponsorData: currentSponsorData, sponsorTransactions } = sponsorData || showSponsorData(displayData.Sponsor)}
          
          <div class="table-container">
            <h3 in:fade={{duration: TEXT_ANIMATION_DURATION}}>Vouchers Awarded</h3>
            <Toolbar size="sm">
              <ToolbarContent>
                <ToolbarSearch 
                bind:value={searchTerm} />
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
              rows={filterData(currentSponsorData.map(entry => ({
                id: entry["Drug Name"],
                date: formatDate(entry.Month, entry.Date, entry.Year),
                drugName: entry["Drug Name"],
                therapeuticArea: entry.name || 'N/A',
                indication: entry.id || 'N/A'
              })), searchTerm)}
              sortable
              zebra
            >
              <svelte:fragment slot="cell" let:row let:cell>
                {#if cell.key === 'drugName'}
                  <div
                    class="clickable-cell"
                    on:click={() => handleClick(() => showEntryData(currentSponsorData.find(e => e["Drug Name"] === row.id)))}
                  >
                    {cell.value}
                  </div>
                {:else}
                  {cell.value}
                {/if}
              </svelte:fragment>
            </DataTable>
          </div>

          {#if sponsorTransactions.length > 0}
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
                rows={filterData(sponsorTransactions.map(entry => ({
                  id: entry["Drug Name"],
                  date: entry["Purchase Month"] && entry["Purchase Date"] && entry["Purchase Year"] 
                    ? formatDate(entry["Purchase Month"], entry["Purchase Date"], entry["Purchase Year"]) 
                    : 'N/A',
                  drugName: entry["Drug Name"],
                  role: entry.Sponsor === displayData.Sponsor ? 'Seller' : 'Buyer',
                  counterparty: entry.Sponsor === displayData.Sponsor ? entry.Purchaser : entry.Sponsor,
                  salePrice: formatSalePrice(entry["Sale  Price (USD, Millions)"])
                })), searchTerm)}
                sortable
                zebra
              >
                <svelte:fragment slot="cell" let:row let:cell>
                  {#if cell.key === 'drugName'}
                    <div
                      class="clickable-cell"
                      on:click={() => handleClick(() => showEntryData(sponsorTransactions.find(e => e["Drug Name"] === row.id)))}
                    >
                      {cell.value}
                    </div>
                  {:else}
                    {cell.value}
                  {/if}
                </svelte:fragment>
              </DataTable>
            </div>
          {:else}
            <p>No voucher transactions found for this sponsor.</p>
          {/if}
        {/if}
      {:else if currentView === 'saleBenchmarks'}
        <div class="view-header"> 
          <button class="back-link" 
          on:click={() => handleClick(closeDrawer)}
          in:fade={{duration: TEXT_ANIMATION_DURATION}}>&larr; Back
        </button>
        
          <h2 style="color: {color};" 
          in:fade={{duration: TEXT_ANIMATION_DURATION}}>
          {currentViewTitle}</h2>
        </div>

        <SaleBenchmarks {constellationData} />
      {:else}
        <div class="view-header"> 
          <button class="back-link" 
             on:click={() => handleClick(closeDrawer)}
             in:fade={{duration: TEXT_ANIMATION_DURATION}}>&larr; Back
          </button>
        
          <h2 style="color: {color};" 
          in:fade={{duration: TEXT_ANIMATION_DURATION}}>
          {currentViewTitle}</h2>
          
          <h4 class="detail" 
          in:fade={{duration: TEXT_ANIMATION_DURATION}}>
          All Entries </h4>
        </div>

        <div class="table-container">
          <Toolbar size="sm">
            <ToolbarContent>
              <ToolbarSearch bind:value={searchTerm} />
            </ToolbarContent>
          </Toolbar>
          <DataTable
            headers={[
              { key: 'date', value: 'Date' },
              { key: 'sponsor', value: 'Sponsor' },
              { key: 'drugName', value: 'Drug Name' },
              { key: 'indication', value: 'Indication' },
              { key: 'treatmentType', value: 'Treatment Type' },
              { key: 'salePrice', value: 'Sale Price' }
            ]}
            rows={filterData((currentView === 'ta' ? showTherapeuticAreaData(displayData.name) :
                showIndicationData(displayData.id)).map(entry => ({
              id: entry["Drug Name"],
              date: formatDate(entry.Month, entry.Date, entry.Year),
              sponsor: entry.Sponsor,
              drugName: entry["Drug Name"],
              indication: entry.id || 'N/A',
              treatmentType: entry["Treatment Type"] || 'N/A',
              salePrice: formatSalePrice(entry["Sale  Price (USD, Millions)"])
            })), searchTerm)}
            sortable
            zebra
          >
            <svelte:fragment slot="cell" let:row let:cell>
              {#if cell.key === 'drugName'}
                <div
                  class="clickable-cell"
                  on:click={() => handleClick(() => showEntryData(
                    (currentView === 'ta' ? showTherapeuticAreaData(displayData.name) : showIndicationData(displayData.id))
                      .find(e => e["Drug Name"] === row.id)
                  ))}
                >
                  {cell.value}
                </div>
              {:else}
                {cell.value}
              {/if}
            </svelte:fragment>
          </DataTable>
        </div>
      {/if}
    </div> <!-- Close drawer-content -->
  </div> <!-- Close drawer -->
</div> <!-- Close drawer-backdrop -->

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
    width: 55vw;
    height: 100%;
    background-color: white;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow-y: auto;
    border-left: 5px solid;
    padding: 0rem 1.5rem 1rem 1rem;
    box-sizing: border-box;
  }

  h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #292F58;
      margin-left: -0.125rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
  }

  h4.detail {
      font-weight: 800;
      font-family: "IBM Plex Mono", 1rem;
      font-size: .625rem;
      color: #7c7c7c;
      text-transform: uppercase;
  }

  .drawer-content {
      padding: 1rem 1rem 2rem 1rem;
  }

  .close-button {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      cursor: pointer;
      color: #424242;
      font-size: 1.125rem;
      font-weight: 400;
      font-family: "IBM Plex Mono", monospace;
      margin-top: 1.25rem;
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
      font-size: .725rem;
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
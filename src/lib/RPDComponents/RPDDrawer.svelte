<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { circInOut } from 'svelte/easing';
  import SaleBenchmarks from './SaleBenchmarks.svelte';
  import DrugDescription from './DrugDescription.svelte';
  import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
  import { 
    ArrowRight, 
    ArrowUpRight,
    Building, 
    ReminderMedical, 
    Medication, 
    Stethoscope, 
    WhitePaper, 
    Money 
  } from 'carbon-icons-svelte';

  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let data: any;
  export let constellationData: any[];
  export let color: string;
  export let sponsorData: any = null;

  const ANIMATION_DURATION = 525;
  const TEXT_ANIMATION_DURATION = 300;

  let currentView = 'original';
  let currentViewTitle = '';
  let displayData: any = data;
  let isTransitioning = false;
  let searchTerm = "";

  $: {
    if (sponsorData) {
      currentView = 'sponsor';
      currentViewTitle = sponsorData.sponsor;
      displayData = sponsorData.sponsorData[0] || {};
      color = getColorForTherapeuticArea(displayData.name);
    }
  }

  $: yearData = constellationData
    .filter(d => d.Year === displayData.Year)
    .sort((a, b) => {
      const dateA = new Date(`${a.Year}-${a.Month}-${a.Date}`);
      const dateB = new Date(`${b.Year}-${b.Month}-${b.Date}`);
      return dateA.getTime() - dateB.getTime();
    });

  function showTreatmentType(type: string) {
    const typeData = constellationData.filter(d => d["Treatment Type"] === type);
    currentView = 'treatmentType';
    currentViewTitle = `${type}`;
    return typeData;
  }

  function showTreatmentDetail(detail: string) {
    const detailData = constellationData.filter(d => d["MOA"] === detail);
    currentView = 'treatmentDetail';
    currentViewTitle = `${detail}`;
    return detailData;
  }

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
    currentViewTitle = sponsor;
    return { sponsorData, sponsorTransactions };
  }

  function showTherapeuticAreaData(ta: string) {
    const taData = constellationData.filter(d => d.name === ta);
    currentView = 'ta';
    currentViewTitle = ta;
    return taData;
  }

  function showIndicationData(indication: string) {
    const indicationData = constellationData.filter(d => d.id === indication);
    currentView = 'indication';
    currentViewTitle = indication;
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
    displayData = data;
    currentView = 'original';
    color = getColorForTherapeuticArea(data.name);
  }

  function closeDrawer() {
    if (currentView !== 'original') {
      backToOriginalView();
    } else {
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
    return colorMap[ta] || "#000000";
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
<div class="drawer-backdrop" on:click={closeDrawer} transition:fly={{duration: ANIMATION_DURATION}}>
  <div class="drawer" on:click|stopPropagation transition:fly={{x: 100, duration: ANIMATION_DURATION, easing: circInOut}}>
    <button class="close-button" on:click={() => handleClick(closeDrawer)}>&times;</button>

    <div class="drawer-content">
      {#if currentView === 'original'}
      <div class="view-header">
         <p class="text-xs mt-2 font-semibold text-gray-600" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
          Approved {formatDate(displayData.Month, displayData.Date, displayData.Year)}
         </p>
        <div class="view-subheader">
          <div class="title-group">
            <h2 style="color: {color};" in:fly={{duration: TEXT_ANIMATION_DURATION}}>
              {displayData["Drug Name"]}
            </h2>

          </div>
          <button class="sponsor-id" on:click={() => handleClick(() => showSponsorData(displayData.Sponsor))} in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            {displayData.Sponsor} <div class="circle"><ArrowUpRight size={12} /></div>
          </button>
        </div>
      </div>  

        <!-- <DrugDescription {displayData} /> -->

        <div class="table-container">
          <table>
            <tbody>
              <h3>Disease Information</h3>
              {#each [
                { label: 'Therapeutic Area', icon: ReminderMedical, value: displayData.name },
                { label: 'Indication', icon: Stethoscope, value: displayData.id }
              ] as { label, icon, value }}
                <tr class="clickable-row" 
                    on:click={() => handleClick(() => label === 'Therapeutic Area' ? showTherapeuticAreaData(displayData.name) : showIndicationData(displayData.id))}
                    tabindex="0" role="button">
                  <th class="label">
                    <svelte:component this={icon} size={12} /> {label}
                  </th>
                  <td class="value-cell" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
                    <span class="truncate-text">
                    {value}
                    </span>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <button class="learn-more flex gap-2" on:click|stopPropagation={() => handleLearnMore(() => label === 'Therapeutic Area' ? showTherapeuticAreaData(displayData.name) : showIndicationData(displayData.id))}>
                      All entries <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        
        <div class="table-container">
          <table>
            <tbody>
              <h3>Treatment Information</h3>
              {#each [
                { label: 'Previously Approved Therapies', icon: WhitePaper, value: displayData["FDA-Approved Therapy Prior to 2012"] || 'N/A' },
                { label: 'Treatment Type', icon: Medication, value: displayData["Treatment Type"], onClick: () => showTreatmentType(displayData["Treatment Type"]) },
                { label: 'Mechanism of Action', icon: Medication, value: displayData["MOA"] || 'N/A', onClick: () => showTreatmentDetail(displayData["MOA"]) }
              ] as { label, icon, value, onClick }}
                <tr class="clickable-row" 
                    on:click={() => handleClick(onClick)}
                    tabindex="0" role="button">
                  <th class="label">
                    <svelte:component this={icon} size={12} /> {label}
                  </th>
                  <td class="value-cell" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
                    <span class="truncate-text">{value}</span>
                    {#if value !== 'N/A' && label !== 'Previously Approved Therapies'}
                      <button class="learn-more flex gap-2" on:click|stopPropagation={() => handleLearnMore(onClick)}>
                        All entries <ArrowRight size={12} />
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>


        <div class="table-container">
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <h3 in:fade={{duration: TEXT_ANIMATION_DURATION}} on:click={() => handleClick(showSaleBenchmarks)} tabindex="0">
            Voucher Transaction
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

          <!-- svelte-ignore a11y-no-static-element-interactions -->
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
                <div class="clickable-cell" class:active={isCurrentEntry(row)}
                     on:click={() => handleClick(() => showEntryData(yearData.find(e => e["Drug Name"] === row.id)))}>
                  {cell.value}
                </div>
              {:else}
                {cell.value}
              {/if}
            </svelte:fragment>
          </DataTable>
        </div>

      {:else if currentView === 'treatmentType' || currentView === 'treatmentDetail'}
        <div> 
          <button class="back-link" on:click={() => handleClick(closeDrawer)} in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            &larr; Back
          </button>

        <div class="detailview-header">
          <h2 style="color: {color};" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            {currentViewTitle}
          </h2>
          <h4 class="detail" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            All Entries
          </h4>
        </div>
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
              { key: 'therapeuticArea', value: 'Therapeutic Area' },
              { key: 'indication', value: 'Indication' },
              { key: currentView === 'treatmentType' ? 'treatmentType' : 'treatmentDetail', 
                value: currentView === 'treatmentType' ? 'Treatment Type' : 'Treatment Detail' }
            ]}
            rows={filterData((currentView === 'treatmentType' ? 
              constellationData.filter(d => d["Treatment Type"] === displayData["Treatment Type"]) :
              constellationData.filter(d => d["MOA"] === displayData["MOA"])).map(entry => ({
                id: entry["Drug Name"],
                date: formatDate(entry.Month, entry.Date, entry.Year),
                sponsor: entry.Sponsor,
                drugName: entry["Drug Name"],
                therapeuticArea: entry.name || 'N/A',
                indication: entry.id || 'N/A',
                treatmentType: entry["Treatment Type"] || 'N/A',
                treatmentDetail: entry["MOA"] || 'N/A'
            })), searchTerm)}
            sortable
            zebra
          >
            <svelte:fragment slot="cell" let:row let:cell>
              {#if cell.key === 'drugName'}
                <div class="clickable-cell"
                     on:click={() => handleClick(() => showEntryData(
                       (currentView === 'treatmentType' ? 
                         constellationData.filter(d => d["Treatment Type"] === displayData["Treatment Type"]) :
                         constellationData.filter(d => d["MOA"] === displayData["MOA"]))
                         .find(e => e["Drug Name"] === row.id)
                     ))}>
                  {cell.value}
                </div>
              {:else}
                {cell.value}
              {/if}
            </svelte:fragment>
          </DataTable>
        </div>

      {:else if currentView === 'sponsor'}
        <button class="back-link" on:click={() => handleClick(closeDrawer)} in:fade={{duration: TEXT_ANIMATION_DURATION}}>
          &larr; Back
        </button>
        <div class="detailview-header"> 
          <h2 style="color: {color};" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            {currentViewTitle}
          </h2>
          <h4 class="detail" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            Sponsor Overview
          </h4>
        </div>

        {#if sponsorData || showSponsorData(displayData.Sponsor)}
          {@const { sponsorData: currentSponsorData, sponsorTransactions } = sponsorData || showSponsorData(displayData.Sponsor)}
          
          <div class="table-container">
            <h3 in:fade={{duration: TEXT_ANIMATION_DURATION}}>Vouchers Awarded</h3>
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
                  <div class="clickable-cell"
                       on:click={() => handleClick(() => showEntryData(currentSponsorData.find(e => e["Drug Name"] === row.id)))}>
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
             
              <!-- svelte-ignore a11y-click-events-have-key-events -->
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
                    <div class="clickable-cell"
                         on:click={() => handleClick(() => showEntryData(sponsorTransactions.find(e => e["Drug Name"] === row.id)))}>
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
          <button class="back-link" on:click={() => handleClick(closeDrawer)} in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            &larr; Back
          </button>
          <h2 style="color: {color};" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            {currentViewTitle}
          </h2>
        </div>
        <SaleBenchmarks {constellationData} />

      {:else}
        <div> 
          <button class="back-link" on:click={() => handleClick(closeDrawer)} in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            &larr; Back
          </button>
          <div class="detailview-header">
          <h2 style="color: {color};" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            {currentViewTitle}
          </h2>
          <h4 class="detail" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            All Entries
          </h4>
        </div>
      </div>

<div class="custom-table">
  <div class="table-search">
    <Toolbar size="sm">
      <ToolbarContent>
        <ToolbarSearch bind:value={searchTerm} />
      </ToolbarContent>
    </Toolbar>
  </div>

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
      <div class="clickable-cell"
           on:click={() => handleClick(() => showEntryData(
             (currentView === 'ta' ? showTherapeuticAreaData(displayData.name) : showIndicationData(displayData.id))
               .find(e => e["Drug Name"] === row.id)
           ))}>
        {cell.value}
      </div>
    {:else}
      {cell.value}
    {/if}
  </svelte:fragment>
</DataTable>
</div>
{/if}
</div>
</div>
</div>

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
      font-size: 1.325rem;
      font-weight: 500;
      margin-left: -0.125rem;
      margin-bottom: 0.125rem;
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
      padding: 1rem 1rem 2rem 1rem;
  }

  .close-button {
      position: absolute;
      right: 2.25rem;
      background: none;
      border: none;
      cursor: pointer;
      color: #424242;
      font-size: 1.125rem;
      font-weight: 400;
      font-family: "IBM Plex Mono", monospace;
      margin-top: 1.25rem;
      margin-right: 2.25rem;
      z-index: 1002;
  }

  .close-button:hover {
      color: #EC5E57;
      font-weight: 800;
  }

  .metadata-row {
    display: flex;
  }

  .metadata-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.725rem;
    font-weight: 600;
    color: #56709f;
  }

  .sponsor-id {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
      overflow-y: auto;
      max-width: 95%;
      margin: 1.25rem 0 2.25rem 0;
  }

  .learn-more {
      font-size: 0.625rem;
      padding: .25rem .5rem .25rem .5rem;
      background-color: #37587e;
      border-radius: 20px;
      min-width: 92.5px;
      color: #eff7ff;
      cursor: pointer;
      margin-left: 2.25rem;
      font-weight: 600;
  }

  h3 {
      font-weight: 800;
      cursor: pointer;
      font-size: .725rem;
      text-transform: capitalize;
      font-family: 'IBM Plex Mono', monospace;
      color: #d95656;
      margin-bottom: .5rem;
  }

  .label {
      display: flex;
      gap: 0.525rem;
      font-size: .65rem;
      color: #292F58;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 400;
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
      display: row;
      border-bottom: 1.25px solid #161616;
      padding-top: 1.25rem;
      margin-right: 2.25rem;
      margin-bottom: 1.725rem;
  }

  .view-subheader {
      display: flex;
      justify-content: space-between;
      flex-direction: row;
      padding-bottom: 0.725rem;
      padding-top: 1.25rem;
    
  }

  .detailview-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      border-bottom: 1.25px solid #161616;
      padding-top: 1.25rem;
      padding-bottom: .725rem;
      margin-bottom: 1.725rem;
      margin-right: 2.25rem;
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
      font-size: .825rem;
      padding-right: 1rem;
      line-height: 1rem;
      max-width: 65%;
  }

  td.value-cell {
    display: flex;
    align-items: center;
    justify-content: right;
    text-align: right;
    gap: 1rem;
    width: 100%;
    max-width: 65%;
    padding-top: .5rem;
    padding-bottom: .5rem;
    padding-right: 1rem;
  }

  .truncate-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
    font-size: .825rem;
    line-height: 1rem;
    flex: 1;
  }

  th {
      position: sticky;
      font-size: .65rem;
      font-family: "IBM Plex Mono", monospace;
      top: 0;
      padding-top: 1rem;
      padding-bottom: .25rem;
      font-weight: 600;
      text-align: left;
  }

  .date {
      font-size: .65rem;
  }

  .sponsor {
      font-weight: 800;
  }

  .circle {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #37587e;
      border-radius: 50%;
      width: 1.25rem;
      height: 1.25rem;
      color: #eff7ff;
  }

  .circle:hover {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #377e6b;
      border-radius: 50%;
      width: 1.25rem;
      height: 1.25rem;
      color: #eff7ff;
  }

  tr {
    display: flex;
    flex-direction: row;
    border-bottom: .5px dotted #292F58;
    justify-content: space-between;
    align-items: left;
    gap: 2rem;
  }

  tr:hover {
    color: #37587e;  /* Changed from #ff1515 to match other hover states */
    font-weight: 800;
  }

  tr:hover {
    font-weight: 800;
    color: #ff1515;
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
    font-size: 0.625rem;
    padding: .25rem .5rem .25rem .725rem;
    width: 80px;
    align-items: center;
    background-color: #37587e;
    border-radius: 20px;
    color: #eff7ff;
    cursor:rgb(226, 226, 226);
    margin-left: 2.25rem;
    font-weight: 600;
  }

  .back-link {
    font-size: 0.625rem;
    padding: .325rem .825rem .325rem .5275rem;
    background-color: #37587e;
    align-items: center;
    border-radius: 20px;
    color: #eff7ff;
    cursor:rgb(226, 226, 226);
    font-weight: 600;
  }

  .back-link:hover {
    background-color: #377e6b;
    color: #eff7ff;
  }

  .year {
    font-size: .625rem;
    color: #313131;
    padding: .25rem .5rem .25rem 0rem;
    text-transform: uppercase;
    margin-bottom: .25rem;
  }

  .learn-more:hover {
    background-color: #377e6b;
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

  :global(.bx--data-table th) {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #292F58;
   font-size: 10px;
  }

  :global(.bx--toolbar-content) {
    margin-bottom: 0.725rem;
  }
  
</style>
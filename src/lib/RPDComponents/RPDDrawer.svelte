<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
  import { 
    ArrowRight, 
    ArrowLeft,
    ArrowUpRight,
    Building, 
    WatsonHealthDna,
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
  export let initialView: string | null = null;
  export let sponsorData: any = null;

  const ANIMATION_DURATION = 525;
  const TEXT_ANIMATION_DURATION = 300;

  let currentView = initialView || 'original';
  let currentViewTitle = initialView === 'ta' ? data.name : '';
  let displayData: any = data;
  let isTransitioning = false;
  let searchTerm = "";

  // Reactive statements
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

  // Helper functions
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

  // View management functions
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

  function showSaleBenchmarks() {
    currentView = 'saleBenchmarks';
    currentViewTitle = 'Voucher Transactions';
  }

  function showEntryData(entry: any) {
    displayData = entry;
    currentView = 'original';
    color = getColorForTherapeuticArea(entry.name);
  }

  // Navigation and state management
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

  function handleDrawerClick(event: MouseEvent) {
    event.stopPropagation();
  }

  // Utility functions
  function getColorForTherapeuticArea(ta: string): string {
    const colorMap = {
      "Gastroenterology": "#a6cee3",
    "Neurology": "#1f78b4",
    "Ophthalmology": "#6C6C6C",
    "Immunology": "#33a02c",
    "Metabolic": "#fb9a99",
    "Dermatology": "#fdbf6f",
    "Hematology": "#e31a1c",
    "Orthopedics": "#ff7f00",
    "Pulmonology": "#cab2d6",
    "Nephrology": "#6a3d9a",
    "Oncology": "#ffff99",
    "Endocrinology": "#b15928",
    "Hepatology": "#8dd3c7",
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
<div 
  class="fixed inset-0 w-full min-w-[400px] h-full bg-black/60 z-[1000] flex justify-end cursor-pointer"
  on:click|self={onClose}
  transition:fly={{duration: ANIMATION_DURATION}}
>

  <div 
    class="drawer relative w-[62.25vw] h-full bg-white shadow-lg z-[1000] overflow-y-auto border-l-[10px] pl-2 pr-2 py-1 cursor-default"
    on:click={handleDrawerClick}
    style="border-color: {color}"
  >
    <div class="drawer-content">
      
      {#if currentView === 'original'}
        <!-- Original View -->

        <div class="header grid grid-cols-2 justify-stretch gap-4 pb-4 mr-6">
          <h3 class="text-xs col-span-2 font-semibold text-slate-800">
            {formatDate(displayData.Month, displayData.Date, displayData.Year)}
          </h3>
          
          <div class="col-span-2 flex justify-between align-bottom items-end">
            <h2 class="text-4xl font-light text-slate-800" 
                in:fly={{duration: TEXT_ANIMATION_DURATION}}>
              {displayData["Drug Name"]}
            </h2>
            <div class="flex items-end gap-4 underline-offset-4 justify-end w-full"> <!-- Added items-end, justify-end, and w-full -->
            <button 
              class="text-lg text-slate-800 hover:text-green-600 font-base flex items-center gap-2"
              on:click={() => handleClick(() => showSponsorData(displayData.Sponsor))}
              in:fade={{duration: TEXT_ANIMATION_DURATION}}
            >   
              {displayData.Sponsor} 
              <div class="bg-slate-900 text-slate-50 rounded-full p-1"><ArrowUpRight size={16} /></div>
            </button>
            </div>
          </div>
        </div>

        <!-- Disease Information Section -->
        <section class="mb-8">
          <h3 class="text-lg font-base text-slate-800 mt-12 mb-8">
            Disease Information
          </h3>
          
          <table>
            <tbody>
              {#each [
                { label: 'Therapeutic Area', icon: ReminderMedical, value: displayData.name },
                { label: 'Indication', icon: Stethoscope, value: displayData.id }
              ] as { label, icon, value }}
                <tr class="fitems-end align-middle">
                  <td class="flex flex-none w-3/12 gap-2">                    
                    <svelte:component this={icon} size={16} />
                    <p class="text-xs text-gray-600 font-medium">{label}</p>
                  </td>
                  
                  <td class="flex flex-none w-7/12 gap-2">                    
                    <p class="text-ellipsis text-sm capitalize overflow-hidden">
                      {value}
                    </p>
                  </td>
                  
                  <td class="flex flex-none w-1/12 gap-2">                    
                    <button class="flex gap-4 pr-2 pl-2 py-1 align-center items-stretch justify-self-start  bg-[#37587e] col-span-1 rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800" 
                      on:click|stopPropagation={() => handleLearnMore(() => 
                        label === 'Therapeutic Area' 
                          ? showTherapeuticAreaData(displayData.name) 
                          : showIndicationData(displayData.id)
                      )}
                    >
                      All <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </section>

        <!-- Treatment Information Section -->
        <section class="mb-8">
          <h3 class="text-lg font-base text-slate-800 mt-12 mb-8">
            Treatment Information
          </h3>
          
          <table>
            <tbody>
              {#each [
                { label: 'Approved Treatment Pre-2012', icon: WhitePaper, value: displayData["FDA-Approved Therapy Prior to 2012"] || 'N/A' },
                { label: 'Treatment Type', icon: Medication, value: displayData["Treatment Type"], onClick: () => showTreatmentType(displayData["Treatment Type"]) },
                { label: 'Mechanism of Action', icon: WatsonHealthDna, value: displayData["MOA"] || 'N/A', onClick: () => showTreatmentDetail(displayData["MOA"]) }
              ] as { label, icon, value, onClick }}
                <tr class="h-12">
                  <td class="flex flex-none w-3/12 gap-2">                    
                    <svelte:component this={icon} size={16} />
                    <p class="text-xs text-gray-600 font-medium">{label}</p>
                  </td>
                   
                  <td class="flex flex-none w-7/12 text-left justify-start">
                    <p class="text-ellipsis text-sm capitalize leading-4 overflow-hidden">
                      {value}
                    </p>
                  </td>
        
                  <td class="flex flex-none w-1/12 text-left justify-start">
                    {#if value !== 'N/A' && label !== 'Previously Approved Therapies' && onClick}
                      <button class="flex gap-4 pr-3 pl-3 py-1 align-middle items-stretch justify-start bg-[#37587e] col-span-1 rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800" 
                        on:click|stopPropagation={() => handleLearnMore(onClick)}>
                        All <ArrowUpRight size={16} />
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </section>

        <!-- Voucher Transaction Section -->
        <section class="mb-8">
          <h3 class="text-lg font-base text-slate-800 mt-8 mb-4">
            Voucher Transaction
          </h3>
          
          <table>
            <tbody>
              {#each ['Purchased', 'Purchaser', 'Sale Price', 'Purchase Date'] as field}
                <tr class="h-12">
                  <td class="flex flex-none w-3/12 gap-2">                    
                    <p class="text-xs text-gray-600 font-medium">{field}</p>
                  </td>
                  
                  <td class="flex flex-none w-9/12 gap-2">                    
                    <p class="text-ellipsis text-sm capitalize leading-4 overflow-hidden"
                       in:fade={{duration: TEXT_ANIMATION_DURATION}}>
                      {#if field === 'Purchased'}
                        {displayData.Purchased || 'N/A'}
                      {:else if field === 'Purchaser'}
                        {displayData.Purchaser || 'N/A'}
                      {:else if field === 'Sale Price'}
                        {formatSalePrice(displayData["Sale Price (USD"])}
                      {:else if field === 'Purchase Date'}
                        {displayData["Purchase Month"] && displayData["Purchase Date"] && displayData["Purchase Year"] 
                          ? formatDate(displayData["Purchase Month"], displayData["Purchase Date"], displayData["Purchase Year"]) 
                          : 'N/A'}
                      {/if}
                    </p>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </section>

        <!-- Awarded Vouchers Section -->
        <section>
          <h3 class="text-lg font-base text-slate-800 mt-12 mb-8" 
              in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            Vouchers Awarded in {displayData.Year}
          </h3>
          
          <Toolbar size="sm">
            <ToolbarContent>
              <ToolbarSearch bind:value={searchTerm} />
            </ToolbarContent>
          </Toolbar>

          <DataTable
            size="medium"
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
          >
            <svelte:fragment slot="cell" let:row let:cell>
              {#if cell.key === 'drugName'}
                <div class="clickable-cell flex items-center gap-2" 
                     class:active={isCurrentEntry(row)}
                     on:click={() => handleClick(() => showEntryData(yearData.find(e => e["Drug Name"] === row.id)))}>
                  {cell.value} 
                  <ArrowUpRight size={16} />
                </div>
              {:else}
                {cell.value}
              {/if}
            </svelte:fragment>
          </DataTable>
        </section>

      {:else if currentView === 'treatmentType' || currentView === 'treatmentDetail'}
        <!-- Treatment Type/Detail View -->
        <div class="header grid grid-cols-2 justify-stretch gap-4 pb-4 mr-6">
          <button 
            class="flex gap-1 py-1 pr-3 pl-2 items-center justify-self-start bg-[#37587e] col-span-2 rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800"
            on:click={() => handleClick(closeDrawer)}
            in:fade={{duration: TEXT_ANIMATION_DURATION}}
          >
            <ArrowLeft /> Back
          </button>

          <div class="col-span-2 flex justify-between align-bottom items-end">
            <h2 class="text-lg text-slate-800 capitalize" 
                in:fade={{duration: TEXT_ANIMATION_DURATION}}>
              {currentViewTitle}
            </h2>
            <h3 class="text-sm font-bold align-bttom text-gray-500" 
                in:fade={{duration: TEXT_ANIMATION_DURATION}}>
              All Entries
            </h3>
          </div>
        </div>

        <section class="mt-8">
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
              { 
                key: currentView === 'treatmentType' ? 'treatmentType' : 'treatmentDetail', 
                value: currentView === 'treatmentType' ? 'Treatment Type' : 'Treatment Detail' 
              }
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
                <div class="clickable-cell flex items-center gap-2"
                     on:click={() => handleClick(() => showEntryData(
                       (currentView === 'treatmentType' ? 
                         constellationData.filter(d => d["Treatment Type"] === displayData["Treatment Type"]) :
                         constellationData.filter(d => d["MOA"] === displayData["MOA"]))
                         .find(e => e["Drug Name"] === row.id)
                     ))}>
                  {cell.value}
                  <ArrowUpRight size={16} />
                </div>
              {:else}
                {cell.value}
              {/if}
            </svelte:fragment>
          </DataTable>
        </section>

      {:else if currentView === 'sponsor'}
        <!-- Sponsor View -->
        <button 
          class="flex mt-4 mb-8 gap-1 pr-3 pl-2 py-1 items-center justify-self-start bg-[#37587e] rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800"
          on:click={() => handleClick(closeDrawer)}
          in:fade={{duration: TEXT_ANIMATION_DURATION}}
        >
          <ArrowLeft /> Back
        </button>

        <div class="header col-span-2 flex justify-between items-end pb-4 mb-8 mr-12">
          <h2 class="text-xl text-slate-800" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            {currentViewTitle}
          </h2>
          <h3 class="text-xs font-bold text-gray-500" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            Sponsor Overview
          </h3>
        </div>

        {#if sponsorData || showSponsorData(displayData.Sponsor)}
          {@const { sponsorData: currentSponsorData, sponsorTransactions } = sponsorData || showSponsorData(displayData.Sponsor)}
          
          <!-- Vouchers Awarded Section -->
          <section class="mb-8">
            <h3 class="text-lg font-base text-slate-800 mt-8 mb-4" 
                in:fade={{duration: TEXT_ANIMATION_DURATION}}>
              Vouchers Awarded
            </h3>

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
                  <div class="clickable-cell flex items-center uppercase gap-2"
                       on:click={() => handleClick(() => showEntryData(currentSponsorData.find(e => e["Drug Name"] === row.id)))}>
                    {cell.value}
                    <ArrowUpRight size={12} />
                  </div>
                {:else}
                  {cell.value}
                {/if}
              </svelte:fragment>
            </DataTable>
          </section>

          <!-- Transactions Section -->
          {#if sponsorTransactions.length > 0}
            <section class="mb-8">
              <h3 class="text-lg font-base text-slate-800 mt-8 mb-4" 
                  in:fade={{duration: TEXT_ANIMATION_DURATION}}>
                Voucher Transactions
              </h3>

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
                  salePrice: formatSalePrice(entry["Sale Price (USD"])
                })), searchTerm)}
                sortable
                zebra
              >
                <svelte:fragment slot="cell" let:row let:cell>
                  {#if cell.key === 'drugName'}
                    <div class="clickable-cell flex items-center gap-2"
                         on:click={() => handleClick(() => showEntryData(sponsorTransactions.find(e => e["Drug Name"] === row.id)))}>
                      {cell.value}
                      <ArrowUpRight size={12} />
                    </div>
                  {:else}
                    {cell.value}
                  {/if}
                </svelte:fragment>
              </DataTable>
            </section>
          {:else}
            <p class="text-gray-600">No voucher transactions found for this sponsor.</p>
          {/if}
        {/if}

      {:else if currentView === 'saleBenchmarks'}
        <!-- Sale Benchmarks View -->
        <div class="header grid grid-cols-2 justify-stretch gap-4 pb-4 mr-6">
          <button 
            class="flex gap-1 py-1 pr-3 pl-2 items-center justify-self-start bg-[#37587e] rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800"
            on:click={() => handleClick(closeDrawer)}
            in:fade={{duration: TEXT_ANIMATION_DURATION}}
          >
            <ArrowLeft /> Back
          </button>

          <h2 class="text-xl text-slate-800" in:fade={{duration: TEXT_ANIMATION_DURATION}}>
            {currentViewTitle}
          </h2>
        </div>

        <SaleBenchmarks {constellationData} />

      {:else}
        <!-- Default View (Therapeutic Area/Indication) -->
        <div class="header grid grid-cols-2 justify-stretch gap-4 pb-4 mr-6">
          <button  
          class="flex gap-1 py-1 pr-3 pl-2 items-center justify-self-start bg-[#37587e] col-span-2 rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800"
            on:click={() => handleClick(closeDrawer)}
            in:fade={{duration: TEXT_ANIMATION_DURATION}}
          >
            <ArrowLeft /> Back
          </button>

          <div class="col-span-2 flex justify-between align-bottom items-end">
            <h2 class="text-xl text-slate-800 capitalize" 
                in:fade={{duration: TEXT_ANIMATION_DURATION}}>
              {currentViewTitle}
            </h2>
            <h3 class="text-sm font-bold text-gray-500" 
                in:fade={{duration: TEXT_ANIMATION_DURATION}}>
              All Entries
            </h3>
          </div>
            </div>
    

        <section class="mt-8">
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
            ]}
            rows={filterData((currentView === 'ta' ? 
              showTherapeuticAreaData(displayData.name) :
              showIndicationData(displayData.id)).map(entry => ({
                id: entry["Drug Name"],
                date: formatDate(entry.Month, entry.Date, entry.Year),
                sponsor: entry.Sponsor,
                drugName: entry["Drug Name"],
                indication: entry.id || 'N/A',
                treatmentType: entry["Treatment Type"] || 'N/A',
                                  salePrice: formatSalePrice(entry["Sale Price (USD"])
            })), searchTerm)}
            sortable
            zebra
          >
            <svelte:fragment slot="cell" let:row let:cell>
              {#if cell.key === 'drugName'}
                <div class="clickable-cell flex items-center gap-2"
                     on:click={() => handleClick(() => showEntryData(
                       (currentView === 'ta' ? 
                         showTherapeuticAreaData(displayData.name) :
                         showIndicationData(displayData.id))
                         .find(e => e["Drug Name"] === row.id)
                     ))}>
                  {cell.value}
                  <ArrowUpRight size={12} />
                </div>
              {:else}
                {cell.value}
              {/if}
            </svelte:fragment>
          </DataTable>
        </section>
      {/if}

    </div>
  </div>
</div>

<style>
  .drawer {
    border-left: 10px solid #377e6b;
  }

  .drawer-content {
    padding: 2rem;
  }

  .header {
    border-bottom: .525px solid #377e6b;
  }

  tr {
    display: flex;
    flex-direction: row;
    border-bottom: .5px dotted #292F58;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    min-height: 3rem;
    padding: 0.5rem 0;
  }

  .clickable-cell {
    cursor: pointer;
    color: #377e6b;
  }

  .clickable-cell:hover {
    border-bottom: 1px solid #377e6b;
  }

  .clickable-cell.active {
    font-weight: 600;
    color: #37587e;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td {
    padding: 0.75rem 0;
    text-transform: capitalize;
    padding-right: 1rem;
    font-size: .825rem;
    line-height: 1.2;
  }

  td.value-cell {
    display: flex;
    align-items: center;
    justify-content: right;
    text-align: right;
    gap: 1rem;
    width: 100%;
    max-width: 65%;
    padding: 0.75rem 1rem 0.75rem 0;
  }

  th {
    position: sticky;
    font-family: "IBM Plex Mono", monospace;
    top: 0;
    padding-top: 1rem;
    padding-bottom: .25rem;
    font-weight: 600;
    text-align: left;
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

  /* Carbon Components Overrides */
  :global(.bx--data-table-container) {
    width: 100%;
    height: 100%;
  }

  :global(.bx--data-table th, .bx--data-table td) {
    font-weight: 500;
    text-transform: capitalize;
    color: #292F58;
    font-size: 11.25px;
  }

  :global(.bx--toolbar-content) {
    margin-bottom: 0.725rem;
  }

  :global(.bx--data-table thead) {
    background-color: #eff7ff;
  }

  :global(.bx--data-table tbody tr:hover) {
    background-color: #f5f9ff;
  }

  :global(.bx--data-table tbody tr.active) {
    background-color: #e5f0ff;
  }

  :global(.bx--search-input) {
    background-color: white;
    border: 1px solid #3b5779;
    height: 2rem;
  }

  :global(.bx--search-input:focus) {
    border-color: #ff1515;
  }

  :global(.bx--search-magnifier) {
    width: 1rem;
    height: 1rem;
  }

  /* Transitions and Animations */
  .fade-enter {
    opacity: 0;
  }

  .fade-enter-active {
    opacity: 1;
    transition: opacity 300ms ease-in-out;
  }

  .fade-exit {
    opacity: 1;
  }

  .fade-exit-active {
    opacity: 0;
    transition: opacity 300ms ease-in-out;
  }

  /* Responsive Adjustments */
  @media (max-width: 1024px) {
    .drawer-content {
      padding: 1.5rem;
    }

    td {
      font-size: .675rem;
    }

    .text-4xl {
      font-size: 2rem;
    }
  }

  @media (max-width: 768px) {
    .drawer-content {
      padding: 1rem;
    }

    td {
      font-size: .7rem;
    }

    .text-4xl {
      font-size: 1.75rem;
    }

    .flex-initial.w-96 {
      width: 64px;
    }
  }
</style>
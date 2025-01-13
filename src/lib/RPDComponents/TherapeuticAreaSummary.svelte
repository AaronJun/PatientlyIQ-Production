<script lang="ts">
    import { Calendar, Purchase, WatsonHealthDna } from 'carbon-icons-svelte';
    
    interface ConstellationEntry {
      Year: string;
      id: string;
      name: string;
      Sponsor: string;
      "Drug Name": string;
      "Treatment Type"?: string;
      Purchased: string;
      Month: string;
      Date: string;
      Purchaser?: string;
    }
  
    export let constellationData: ConstellationEntry[] = [];
    export let selectedArea: string | null = null;
    export let hoveredPetalData: ConstellationEntry | null = null;
    export let summaryText: string = '';
  
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
  
    $: areaName = hoveredPetalData?.name || selectedArea;
    $: relatedEntries = constellationData.filter(entry => entry.name === areaName);
    $: uniqueSponsors = [...new Set(relatedEntries.map(entry => entry.Sponsor))];
    $: sortedEntries = [...relatedEntries].sort((a, b) => {
      const dateA = new Date(b.Year + '-' + b.Month + '-' + b.Date);
      const dateB = new Date(a.Year + '-' + a.Month + '-' + a.Date);
      return dateA.getTime() - dateB.getTime();
    });
  
    function handleRowClick(entry: ConstellationEntry) {
      dispatch('clusterElementClick', { entry });
    }
  
    function handleRowHover(entry: ConstellationEntry) {
      dispatch('rowHover', { entry });
    }
  
    function handleRowLeave() {
      dispatch('rowLeave');
    }
  </script>
  
  {#if !areaName && !hoveredPetalData}
    <div class="card">
      <div class="card-header">
        <h3>Therapeutic Areas</h3>
      </div>
      <div class="card-content">
        <p class="text-gray">Hover over an area or petal to see related information</p>
      </div>
    </div>
  {:else}
    <div class="card">
      <div class="card-header">
        <div class="header-content">
          <h3>{areaName}</h3>
          <span class="entry-count">{relatedEntries.length} entries</span>
        </div>
      </div>
  
      <div class="card-content">
        {#if summaryText}
          <p class="summary-text">{@html summaryText}</p>
        {/if}
  
        <div class="entries-list">
          {#each sortedEntries as entry (entry.id)}
            <div 
              class="entry-card"
              on:click={() => handleRowClick(entry)}
              on:mouseenter={() => handleRowHover(entry)}
              on:mouseleave={handleRowLeave}
            >
              <div class="entry-header">
                <div class="entry-title">
                  <h4>{entry["Drug Name"]}</h4>
                  <p class="sponsor">{entry.Sponsor}</p>
                </div>
                <span class="date">{entry.Month} {entry.Year}</span>
              </div>
              
              {#if entry.id}
                <p class="disease-id">{entry.id}</p>
              {/if}
              
              <div class="tags">
                {#if entry["Treatment Type"]}
                  <span class="tag treatment">
                    <WatsonHealthDna size={12} />
                    {entry["Treatment Type"]}
                  </span>
                {/if}
                
                {#if entry.Purchased === "Y"}
                  <span class="tag purchased">
                    <Purchase size={12} />
                    Voucher Sold
                  </span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
  
  <style>
    .card {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      width: 100%;
      margin-bottom: 1rem;
    }
  
    .card-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
  
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }
  
    .entry-count {
      font-size: 0.75rem;
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }
  
    .card-content {
      padding: 1rem;
    }
  
    .text-gray {
      color: #6b7280;
      font-size: 0.875rem;
    }
  
    .summary-text {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1rem;
    }
  
    .entries-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 60vh;
      overflow-y: auto;
      padding-right: 0.5rem;
    }
  
    .entry-card {
      background: #f9fafb;
      padding: 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
  
    .entry-card:hover {
      background: #f3f4f6;
      transform: translateY(-1px);
    }
  
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
  
    .entry-title h4 {
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
      margin: 0;
    }
  
    .sponsor {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
  
    .date {
      font-size: 0.75rem;
      color: #6b7280;
    }
  
    .disease-id {
      font-size: 0.75rem;
      color: #374151;
      margin-top: 0.25rem;
    }
  
    .tags {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }
  
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }
  
    .tag.treatment {
      background: #dbeafe;
      color: #1d4ed8;
    }
  
    .tag.purchased {
      background: #d1fae5;
      color: #047857;
    }
  </style>
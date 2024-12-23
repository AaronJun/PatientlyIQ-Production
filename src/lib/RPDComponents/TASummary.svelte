<script lang="ts">
    export let summaryText: string = '';
    export let currentArea: string | null = null;
  
    interface ConstellationEntry {
      Year: string;
      id: string;
      name: string;
      Sponsor: string;
      "Drug Name": string;
      "Treatment Type": string;
      Purchased: string;
      "Sale  Price (USD, Millions)"?: string;
      "Approved Drug": string;
    }
  
    export let constellationData: ConstellationEntry[];
  
    $: overviewStats = {
      totalVouchers: constellationData.length,
      uniqueAreas: new Set(constellationData.map(d => d.name)).size,
      totalValue: constellationData
        .filter(d => d.Purchased?.toLowerCase() === 'y' && d["Sale  Price (USD, Millions)"])
        .reduce((sum, d) => {
          const price = parseFloat(d["Sale  Price (USD, Millions)"]) || 0;
          return sum + price;
        }, 0),
      purchasedCount: constellationData.filter(d => d.Purchased?.toLowerCase() === 'y').length,
      uniqueIndications: new Set(constellationData.map(d => d.id)).size,
      uniqueTreatmentTypes: new Set(constellationData.map(d => d["Treatment Type"]).filter(Boolean)).size,
      noApprovedTreatments: new Set(
        constellationData
          .filter(d => d["Approved Drug"]?.toLowerCase() === 'n')
          .map(d => d.id)
      ).size
    };
  
    function formatNumber(num: number): string {
      return num.toLocaleString();
    }
  </script>
  
  <div class="summary-container">
    <div class="info-panel row col-span-2 align-center">
        <h2 class="text-xs mb-8 font-bold col-span-1  p-8 pl-0 text-[#C9623F] uppercase">        
            The Impact on Therapeutic Areas
      </h2>
    </div>
  
    {#if !currentArea}
    <p class="text-base md:text-sm sm:text-xs w-full pr-2 max-w-4xl col-span-2 text-gray-900">
        The program has awarded <span class="highlight">{formatNumber(overviewStats.totalVouchers)}</span> vouchers across 
        <span class="highlight">{formatNumber(overviewStats.uniqueAreas)}</span> therapeutic areas. 
        <br><br>
        New treatments have been developed for <span class="highlight">{formatNumber(overviewStats.uniqueIndications)}</span> indications, 
        including <span class="highlight">{formatNumber(overviewStats.noApprovedTreatments)}</span> that previously had no FDA-approved options.
        These span <span class="highlight">{formatNumber(overviewStats.uniqueTreatmentTypes)}</span> distinct treatment modalities.
        <br><br>
        Explore specific therapeutic areas by hovering over the flower clusters or labels.
      </p>
    {:else}
      <p class="text-base w-full pr-2 max-w-4xl col-span-2 text-gray-900 mt-4">
        {@html summaryText}
      </p>
    {/if}
  </div>
  
  <style>
    .highlight {
      color: #C9623F;
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 800;
      text-decoration: underline dotted;
      padding: 0 0.15rem;
    }
  
    :global(.highlight) {
      color: #C9623F;
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 800;
      text-decoration: underline dotted;
      padding: 0 0.15rem;
    }
  </style>
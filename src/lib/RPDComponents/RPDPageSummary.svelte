<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';

  export let rpdPrvData: Array<{
    Year: string;
    RPD: string;
    "RPD PRV": string;
  }>;
  
  export let constellationData: Array<{
    Year: string;
    Purchased: string;
    "Sale  Price (USD, Millions)"?: string;
  }>;
  
  export let currentYear: string;

  let summaryStats = {
    rpdCount: 0,
    voucherCount: 0,
    soldCount: 0,
    totalValue: 0
  };

$: {
  if (currentYear && rpdPrvData && constellationData) {
    if (currentYear === "Overview") {
      summaryStats = {
        rpdCount: rpdPrvData.reduce((sum, d) => sum + (parseInt(d.RPD) || 0), 0),
        voucherCount: constellationData.length, // Count all vouchers
        soldCount: constellationData.filter(d => d.Purchased?.toLowerCase() === 'y').length,
        totalValue: constellationData
          .filter(d => d.Purchased?.toLowerCase() === 'y' && d["Sale  Price (USD, Millions)"])
          .reduce((sum, d) => {
            const price = parseFloat(d["Sale  Price (USD, Millions)"]);
            return !isNaN(price) ? sum + price : sum;
          }, 0)
      };
    } else {
      const yearRpdData = rpdPrvData.find(d => d.Year === currentYear);
      const yearConstellationData = constellationData.filter(d => d.Year === currentYear);
      
      summaryStats = {
        rpdCount: parseInt(yearRpdData?.RPD || "0"),
        voucherCount: yearConstellationData.length,
        soldCount: yearConstellationData.filter(d => d.Purchased?.toLowerCase() === 'y').length,
        totalValue: yearConstellationData
          .filter(d => d.Purchased?.toLowerCase() === 'y' && d["Sale  Price (USD, Millions)"])
          .reduce((sum, d) => {
            const price = parseFloat(d["Sale  Price (USD, Millions)"]);
            return !isNaN(price) ? sum + price : sum;
          }, 0)
      };
    }
  }
}

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
  {#if currentYear === "2012"}
  <div class="info-panel row col-span-2 align-center pt-8 pl-0 text-[#C9623F] uppercase">
    <h2 class="text-xs mb-8 font-bold col-span-1">        
      Nurturing New Treatments</h2>
  </div>

  <p class="text-base md:text-sm sm:text-xs w-full pr-2 max-w-4xl col-span-2 text-gray-900 mt-4">      
    The FDA's rare pediatric disease priority review voucher program produced an estimated 
      <span class="highlight">{formatNumber(569)}</span> RPD designations from 2012 to 2025. These vouchers are like seeds with the potential to grow rapidly into new treatment options.  
      <br><br>

      New treatments have been developed for <span class="highlight">{formatNumber(overviewStats.uniqueIndications)}</span> indications, 
      including <span class="highlight">{formatNumber(overviewStats.noApprovedTreatments)}</span> that previously had no FDA-approved options.
      <br><br>
      
      <p class="text-base md:text-sm sm:text-xs md:text-sm sm:text-xs w-full pr-2 max-w-4xl col-span-2 text-gray-900">
        The program has awarded <span class="highlight">{formatNumber(overviewStats.totalVouchers)}</span> vouchers across 
        <span class="highlight">{formatNumber(overviewStats.uniqueAreas)}</span> therapeutic areas. 

        These span <span class="highlight">{formatNumber(overviewStats.uniqueTreatmentTypes)}</span> distinct treatment modalities.
        <br><br>
      To learn more, hover over and tap on the flower petals, the sidebar cards, or individual years to explore the ways this programmed nurtured key milestones in rare disease treatment.
    </p>

  {:else if currentYear === "2013"}
  <h2 class="text-lg font-mono mb-8 font-bold col-span-1 p-8 pl-0 text-[#C9623F] uppercase">        
    {currentYear}</h2>  
  
  <p class="text-base md:text-sm sm:text-xs w-full pr-2 max-w-4xl col-span-2 text-gray-900 mt-4">
    The FDA granted <span class="highlight">{formatNumber(summaryStats.rpdCount)}</span> rare pediatric disease designations. Though no priority review vouchers were awarded this year, these designations were initial seeds which would grow into the program's success.
    </p>

  {:else if currentYear === "2020"}
  <h2 class="text-lg font-mono mb-8 font-bold col-span-1 p-8 pl-0 text-[#C9623F] uppercase">        
    {currentYear}</h2>  
    <p class="text-base md:text-sm sm:text-xs w-full pr-2 max-w-4xl col-span-2 text-gray-900 mt-4">
      <span class="highlight">{currentYear}</span> saw a significant increase in the number of RPD designations, with <span class="highlight">{formatNumber(summaryStats.rpdCount)}</span> granted. This was likely driven by the RPD program's planned sunset, which was to begin in September 2020.
      <br><br>
      <span class="highlight">{formatNumber(summaryStats.voucherCount)}</span> priority review vouchers were awarded, which was also a record high. 
      <br><br>
      Additionally, 
      <span class="highlight">{formatNumber(summaryStats.soldCount)}</span> vouchers were sold for a total of
      <span class="highlight">${formatNumber(summaryStats.totalValue)}</span> million.
    </p>

  {:else if currentYear >= "2023"}
  <h2 class="text-lg font-mono mb-8 font-bold col-span-1 p-8 pl-0 text-[#C9623F] uppercase">        
    {currentYear}</h2>  
    <p class="text-base md:text-sm sm:text-xs w-full pr-2 max-w-4xl col-span-2 text-gray-900 mt-4">
      An estimated <span class="highlight">{formatNumber(summaryStats.rpdCount)}</span> designations were granted, and
      <span class="highlight">{formatNumber(summaryStats.voucherCount)}</span> priority review vouchers were awarded.
      <br><br>
      <span class="highlight">{formatNumber(summaryStats.soldCount)}</span> vouchers were sold for a total of
      <span class="highlight">${formatNumber(summaryStats.totalValue)}</span> million.
    </p>

  {:else}
  <h2 class="text-lg font-mono mb-8 font-bold col-span-1 p-8 pl-0 text-[#C9623F] uppercase">        
    {currentYear}</h2>  
    <p class="text-base md:text-sm sm:text-xs w-full pr-2 max-w-4xl col-span-2 text-gray-900 mt-4">
     There were <span class="highlight">{formatNumber(summaryStats.rpdCount)}</span> RPD designations and
      <span class="highlight">{formatNumber(summaryStats.voucherCount)}</span> priority review vouchers awarded.
      <br><br>
      <span class="highlight">{formatNumber(summaryStats.soldCount)}</span> vouchers were sold for a total of
      <span class="highlight">${formatNumber(summaryStats.totalValue)}</span> million.
    </p>
  {/if}
</div>

<style>
  .summary-text {
    font-size: .25rem;
    color: #2b2b2b;
  }

  .highlight {
    color: #C9623F;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    text-decoration: underline dotted;
    padding: 0 0.15rem;
  }
</style>
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
          voucherCount: constellationData.length,
          soldCount: constellationData.filter(d => d.Purchased?.toLowerCase() === 'y').length,
          totalValue: constellationData
            .filter(d => d["Sale  Price (USD, Millions)"] && !isNaN(parseFloat(d["Sale  Price (USD, Millions)"])))
            .reduce((sum, d) => sum + parseFloat(d["Sale  Price (USD, Millions)"]), 0)
        };
      } else {
        const yearRpdData = rpdPrvData.find(d => d.Year === currentYear);
        const yearConstellationData = constellationData.filter(d => d.Year === currentYear);
        
        summaryStats = {
          rpdCount: parseInt(yearRpdData?.RPD || "0"),
          voucherCount: yearConstellationData.length,
          soldCount: yearConstellationData.filter(d => d.Purchased?.toLowerCase() === 'y').length,
          totalValue: yearConstellationData
            .filter(d => d["Sale  Price (USD, Millions)"] && !isNaN(parseFloat(d["Sale  Price (USD, Millions)"])))
            .reduce((sum, d) => sum + parseFloat(d["Sale  Price (USD, Millions)"]), 0)
        };
      }
    }
  }

  function formatNumber(num: number): string {
    return num.toLocaleString();
  }
</script>

<div class="summary-container">
  {#if currentYear === "2012"}
    <p class="summary-text">
      The FDA's rare pediatric disease priority review voucher program produced an estimated 
      <span class="highlight">{formatNumber(569)}</span> RPD designations from 2012 to 2022.These vouchers are like seeds with the potential to grow rapidly into new treatment options.  
      <br><br>
      Through 2024,
      <span class="highlight">{formatNumber(54)}</span> priority review vouchers have been awarded. With each voucher representing 4 months of expedited review, the program has saved an estimated
      <span class="highlight">{formatNumber(216)}</span> months of regulatory review.

      <br><br>
      Please scroll or click forward, tap on the flower petals or sidebar, and explore the ways this programmed nurtured key milestones in rare disease treatment.
    </p>
  {:else if currentYear === "2013"}
    <p class="summary-text">
      In 2013, the FDA granted <span class="highlight">{formatNumber(8)}</span> rare pediatric disease designations. Though no priority review vouchers were awarded this year, these designations were initial seeds which would grow into the program's success.
    </p>

    {:else if currentYear === "2020"}
    <p class="summary-text">
      2020 saw a significant increase in the number of RPD designations, with <span class="highlight">{formatNumber(summaryStats.rpdCount)}</span> granted. This was likely driven by the RPD program's planned sunset, which was to begin in September 2020.
      <br><br>
      <span class="highlight">{formatNumber(summaryStats.voucherCount)}</span> priority review vouchers were awarded, which was also a record high. 
      <br><br>
      Additionally, 
      <span class="highlight">{formatNumber(summaryStats.soldCount)}</span> vouchers were sold  for a total of
      <span class="highlight">${formatNumber(summaryStats.totalValue)}</span> million.
    </p>
  {:else}
    <p class="summary-text">
      There were <span class="highlight">{formatNumber(summaryStats.rpdCount)}</span> RPD designations and
      <span class="highlight">{formatNumber(summaryStats.voucherCount)}</span> priority review vouchers awarded.
      <span class="highlight">{formatNumber(summaryStats.soldCount)}</span> vouchers were sold  for a total of
      <span class="highlight">${formatNumber(summaryStats.totalValue)}</span> million.
    </p>
  {/if}
</div>

<style>
  .summary-container {
    padding: 0 0 0 1rem;
  }

  .summary-text {
    font-size: .925rem;
    color: #2b2b2b;
    margin-top: 1rem;
  }

  .highlight {
    color: #C9623F;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    text-decoration: underline dotted;
    padding: 0 0.15rem;
  }
</style>
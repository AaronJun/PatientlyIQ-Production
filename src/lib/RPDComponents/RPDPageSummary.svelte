<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import "carbon-components-svelte/css/all.css";

  export let rpdPrvData: any[];
  export let constellationData: any[];
  export let currentYear: string;
  export let showAutomatedText: boolean = true; // Controls automated text for years with custom text

  let summaryData: any[] = [];
  let chart: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  $: currentYearData = summaryData.find(data => data.year === currentYear) || {};
  $: isOverview = currentYear === "Overview";
  $: is2012 = currentYear === "2012";
  $: is2013 = currentYear === "2013";
  $: hasCustomText = isOverview || is2012 || is2013;

  $: totalRPDDesignations = isOverview ? summaryData.reduce((sum, data) => sum + data.rpdDesignations, 0) : currentYearData.rpdDesignations || 0;
  $: totalVouchersAwarded = isOverview ? summaryData.reduce((sum, data) => sum + data.vouchersAwarded, 0) : currentYearData.vouchersAwarded || 0;
  $: totalVouchersSold = isOverview ? summaryData.reduce((sum, data) => sum + data.vouchersSold, 0) : currentYearData.vouchersSold || 0;
  $: totalVoucherSalesAmount = isOverview ? summaryData.reduce((sum, data) => sum + data.voucherSalesTotal, 0) : currentYearData.voucherSalesTotal || 0;

  onMount(() => {
    processData();
  });  

  function processData() {
    summaryData = rpdPrvData.map(yearData => {
      const year = yearData.Year;
      const yearConstellationData = constellationData.filter(item => item.Year === year);
      
      const vouchersAwarded = yearConstellationData.length;
      const vouchersSold = yearConstellationData.filter(item => item.Purchased.toLowerCase() === 'y').length;
      const voucherSalesTotal = yearConstellationData.reduce((total, item) => {
        const salePrice = parseFloat(item["Sale  Price (USD, Millions)"]) || 0;
        return total + salePrice;
      }, 0);

      return {
        year,
        rpdDesignations: parseInt(yearData.RPD) || 0,
        vouchersAwarded,
        vouchersSold,
        voucherSalesTotal
      };
    });
  }

  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  function formatOverviewText() {
    return [
      "The FDA's rare pediatric disease priority review voucher program produced ",
      { value: 569, highlight: true },
      " RPD designations from 2012 to 2022. Through 2024, ",
      { value: 54, highlight: true },
      " priority review vouchers have been awarded. With each voucher representing 4 months of expedited review, the program has saved an estimated ",
      { value: 216, highlight: true }, " months of regulatory review.",
    ];
  }

  function format2012Text() {
    return [
      "The FDA launched the rare pediatric disease priority review voucher program in 2012 with the passage of the Food and Drug Administration Safety and Innovation Act (FDASIA)."
    ];
  }

  function format2013Text() {
    return [
      "In 2013, the FDA granted ",
      { value: 8, highlight: true },
      " rare pediatric disease designations. Though no priority review vouchers were awarded this year, these designations were initial seeds which would grow into the program's success."
    ];
  }
</script>

<div class="summary-card">
  {#if isOverview}
    <p class="summary-sentence">
      {#each formatOverviewText() as part}
        {#if typeof part === 'string'}
          {part}
        {:else}
          <span class="highlight">{formatNumber(part.value)}</span>
        {/if}
      {/each}
    </p>
  {:else if is2012}
    <p class="summary-sentence">
      {#each format2012Text() as part}
        {#if typeof part === 'string'}
          {part}
        {:else}
          <span class="highlight">{formatNumber(part.value)}</span>
        {/if}
      {/each}
    </p>
  {:else if is2013}
    <p class="summary-sentence">
      {#each format2013Text() as part}
        {#if typeof part === 'string'}
          {part}
        {:else}
          <span class="highlight">{formatNumber(part.value)}</span>
        {/if}
      {/each}
    </p>
  {/if}

  {#if !hasCustomText || (hasCustomText && showAutomatedText)}
    <p class="summary-sentence">
      There were <span class="highlight">{formatNumber(totalRPDDesignations)}</span> RPD designations and <span class="highlight">{formatNumber(totalVouchersAwarded)}</span> priority review vouchers awarded.
      <span class="highlight">{formatNumber(totalVouchersSold)}</span> vouchers were sold for a total of <span class="highlight">${formatNumber(totalVoucherSalesAmount.toFixed(2))} million.</span>
    </p>  
  {/if}
</div>

<style>
  .highlight {
    padding-left: 0.125rem;
    padding-right: 0.15rem;
    font-size: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    color: #C9623F;
    text-decoration: dotted underline;
    font-weight: 800;
  }

  .summary-sentence {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    width: 100%
  }
</style>
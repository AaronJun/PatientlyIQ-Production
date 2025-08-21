<script lang="ts">
    import { fade } from 'svelte/transition';
    import { Building, DocumentAdd, Medication, Stethoscope, Money } from 'carbon-icons-svelte';
  
    export let sponsor: string;
    export let constellationData: any[];
  
    $: sponsorData = constellationData.filter(d => d.Sponsor === sponsor);
    $: awardedVouchers = sponsorData.length;
    $: purchasedVouchers = sponsorData.filter(d => d.Purchased === "Y").length;
    $: totalSpent = sponsorData
          .filter(d => d.Purchased === "Y" && d["Sale Price"])
    .reduce((total, d) => total + parseFloat(d["Sale Price"]), 0);
  
    function formatCurrency(value: number): string {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    }
  </script>
  
  <div class="sponsor-view" transition:fade>
    <h2>{sponsor}</h2>
    <div class="sponsor-stats">
      <div class="stat-item">
        <Building size={24} />
        <span>Awarded Vouchers: {awardedVouchers}</span>
      </div>
      <div class="stat-item">
        <DocumentAdd size={24} />
        <span>Purchased Vouchers: {purchasedVouchers}</span>
      </div>
      <div class="stat-item">
        <Money size={24} />
        <span>Total Spent: {formatCurrency(totalSpent)} million</span>
      </div>
    </div>
    <h3>Voucher Details</h3>
    <div class="voucher-list">
      {#each sponsorData as voucher}
        <div class="voucher-item">
          <div class="voucher-header">
            <Medication size={16} />
            <span class="drug-name">{voucher["Drug Name"]}</span>
          </div>
          <div class="voucher-details">
            <Stethoscope size={16} />
            <span class="indication">{voucher.id}</span>
          </div>
          <div class="voucher-details">
            <span class="year">{voucher.Year}</span>
            <span class="status">{voucher.Purchased === "Y" ? "Purchased" : "Awarded"}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
  
  <style>
    .sponsor-view {
      padding: 1rem;
    }
    h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    h3 {
      font-size: 1.2rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
    .sponsor-stats {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .voucher-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .voucher-item {
      border: 1px solid #ccc;
      padding: 0.5rem;
      border-radius: 4px;
    }
    .voucher-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .voucher-details {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }
    .drug-name {
      font-weight: bold;
    }
    .indication {
      font-style: italic;
    }
    .year, .status {
      color: #666;
    }
  </style>
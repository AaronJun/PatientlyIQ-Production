<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
import { Close, Information, Receipt, Chemistry, Development } from 'carbon-icons-svelte';
  // Import our new enhanced stock price chart instead of the original
  import EnhancedStockPriceChart from './StockPriceChart.svelte';
  import { hasPRVAward } from './utils/data-processing-utils';
  import { onMount } from 'svelte';

  export let isOpen: boolean = false;
  export let companyName: string = '';
  export let allData: any[] = [];
  export let stockData: any[] = [];
  export let onClose: () => void;
  export let onShowDrugDetail: (detail: any) => void;
  export let color: string = '#37587e';

  let companyData: any[] = [];
  let companyProfile = {
    country: 'N/A',
    publicPrivate: 'N/A',
    marketCap: 'N/A',
    therapyAreas: [] as string[],
    rpddCount: 0,
    prvCount: 0,
    transactions: 0
  };
  
  // Add mobile detection
  let isMobile: boolean = false;
  
  onMount(() => {
    console.log("RPDCompanyDetailDrawer mounted", { isOpen, companyName });
    console.log("Drawer props:", { allData: allData?.length, stockData: stockData?.length });
    console.log("Company profile:", companyProfile);
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });
  
  function checkMobile() {
    isMobile = window.innerWidth < 768;
  }

  // Log when isOpen changes
  $: console.log("isOpen changed:", isOpen);

  $: {
    if (allData && companyName) {
      console.log("Processing company data for:", companyName);
      companyData = allData.filter(d => d.Company === companyName);
      
      // Calculate company profile stats
      const uniqueAreas = [...new Set(companyData.map(d => d.TherapeuticArea1))].filter(Boolean);
      const rpddEntries = companyData.filter(d => d["RPDD Year"]);
      const prvEntries = companyData.filter(d => hasPRVAward(d));
      const transactionEntries = companyData.filter(d => d.Purchased === "Y" && d.Purchaser);
      
      companyProfile = {
        country: companyData[0]?.COUNTRY || 'N/A',
        publicPrivate: companyData[0]?.['Public/Private'] || 'N/A',
        marketCap: companyData[0]?.MarketCap || 'N/A',
        therapyAreas: uniqueAreas,
        rpddCount: rpddEntries.length,
        prvCount: prvEntries.length,
        transactions: transactionEntries.length
      };
    }
  }

  function handleCloseClick() {
    console.log("Close button clicked in company drawer");
    onClose();
  }

  function handleDrugClick(drug: any) {
    onShowDrugDetail({
      drugName: drug.Candidate,
      year: drug["RPDD Year"],
      Company: drug.Company,
      therapeuticArea: drug.TherapeuticArea1,
      entries: companyData,
      color,
      currentStage: drug["Current Development Stage"] || "TBD",
      indication: drug.Indication || "",
      rpddAwardDate: drug["RPDD Year"],
      voucherAwardDate: drug["PRV Year"] || "",
      treatmentClass: drug.Class1 || "TBD",
      mechanismOfAction: drug.MOA || "TBD"
    });
  }
</script>

{#if isOpen}
<div class="drawer-backdrop" on:click={handleCloseClick} transition:fade={{ duration: 300, easing: cubicOut }}>
  <div 
    class="drawer  w-[94.275vw] lg:w-[55vw] xl:w-[47.25vw]"
    on:click|stopPropagation={() => {}}
    transition:fly={{ x: 400, duration: 400, opacity: 1, easing: cubicOut }}
  >
    <div class="drawer-header">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold">{companyName || 'Company Name Not Set'}</h2>
        <button class="close-button" on:click={handleCloseClick}>
          <Close size={20} />
        </button>
      </div>
      <div class="company-meta">
        <div class="flex {isMobile ? 'flex-wrap' : ''} items-center gap-2">
          <span class="meta-item">
            {companyProfile.publicPrivate}
          </span>
          <span class="meta-item">
            {companyProfile.country}
          </span>
          {#if companyProfile.marketCap !== 'N/A'}
            <span class="meta-item">
              {companyProfile.marketCap}
            </span>
          {/if}
        </div>
      </div>
    </div>

    <div class="drawer-content">
      <!-- Enhanced Stock Price Chart Section with Milestone Analysis -->
      <section class="mb-8">
        <EnhancedStockPriceChart
          {companyName}
          {stockData}
          {allData}
          {color}
        />
      </section>

      <!-- Company Overview Section -->
      <section class="mb-8">
        <h3 class="section-title">
          <Information size={16} /> 
          Company Overview
        </h3>
        <div class="stats-grid {isMobile ? 'grid-cols-2' : 'grid-cols-4'}">
          <div class="stat-card">
            <span class="stat-value">{companyProfile.rpddCount}</span>
            <span class="stat-label">RPDDs</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{companyProfile.prvCount}</span>
            <span class="stat-label">PRVs</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{companyProfile.transactions}</span>
            <span class="stat-label">Transactions</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{companyProfile.therapyAreas.length}</span>
            <span class="stat-label">Therapy Areas</span>
          </div>
        </div>
      </section>

      <!-- Therapeutic Areas Section -->
      <section class="mb-8">
        <h3 class="section-title">
          <Chemistry size={16} />
          Focus Therapeutic Areas
        </h3>
        <div class="chips-container">
          {#each companyProfile.therapyAreas as area}
            <span class="chip">
              {area}
            </span>
          {/each}
        </div>
      </section>

      <!-- Drug Candidates Section -->
      <section>
        <h3 class="section-title">
          <Development size={16} />
          Drug Candidates ({companyData.length})
        </h3>
        <div class="candidates-list">
          {#each companyData as drug}
            <div class="candidate-card" on:click={() => handleDrugClick(drug)}>
              <div class="flex {isMobile ? 'flex-col' : 'justify-between'} items-start">
                <div>
                  <h4 class="candidate-name">{drug.Candidate}</h4>
                  <p class="candidate-indication capitalize">{drug.Indication || 'Unknown Indication'}</p>
                </div>
                <span class="candidate-stage {isMobile ? 'mt-2' : ''}">
                  {drug["Current Development Stage"] || 'Unknown Stage'}
                </span>
              </div>
              <div class="flex mt-2 {isMobile ? 'flex-wrap' : ''} gap-2">
                {#if drug["RPDD Year"]}
                  <span class="award-chip rpdd">RPDD {drug["RPDD Year"]}</span>
                {/if}
                {#if hasPRVAward(drug)}
                  <span class="award-chip prv">PRV {drug["PRV Year"] || "Awarded"}</span>
                {/if}
                {#if drug["Purchase Year"]}
                  <span class="award-chip sale">PRV Sale {drug["Purchase Year"]}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </section>
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
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    justify-content: flex-end;
  }

  .drawer {
    height: 100%;
    background-color: white;
    overflow-y: auto;
    z-index: 10000;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .drawer-header {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    background-color: #f8fafc;
  }

  .drawer-content {
    padding: 1rem;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: #e2e8f0;
  }

  .company-meta {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #4a5568;
  }

  .meta-item {
    background-color: #e2e8f0;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
    color: #4a5568;
  }

  .stats-grid {
    display: grid;
    gap: 1rem;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
  }

  .stat-label {
    font-size: 0.725rem;
    margin-top: 0.25rem;
    color: #4a5568;
  }

  .chips-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    background-color: #e2e8f0;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: #4a5568;
  }

  .candidates-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .candidate-card {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .candidate-card:hover {
    background-color: #f8fafc;
  }

  .candidate-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: #2d3748;
  }

  .candidate-indication {
    font-size: 0.75rem;
    color: #4a5568;
  }

  .candidate-stage {
    font-size: 0.625rem;
    background-color: #e2e8f0;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: #4a5568;
  }

  .award-chip {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .rpdd {
    background-color: #ebf8ee;
    color: #38a169;
  }

  .prv {
    background-color: #fff8eb;
    color: #dd6b20;
  }
  
  .sale {
    background-color: #f3ebff;
    color: #805ad5;
  }
  
  /* Mobile styles */
  @media (max-width: 767px) {
    .drawer-content {
      padding: 0.75rem;
    }
    
    .section-title {
      font-size: 0.875rem;
    }
    
    .stat-value {
      font-size: 1.25rem;
    }
    
    .candidate-card {
      padding: 0.5rem;
    }
  }
</style>
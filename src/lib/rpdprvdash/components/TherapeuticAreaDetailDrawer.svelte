<script lang="ts">
  import { fly } from 'svelte/transition';
  import { getTherapeuticAreaColor } from '../utils/colorDefinitions';
  import { onMount, onDestroy } from 'svelte';
  
  export let isOpen = false;
  export let areaDetail: any = null;
  export let onClose: () => void = () => {};
  export let onShowDrugDetail: (detail: any) => void = () => {};
  export let selectedYear: number = new Date().getFullYear(); // Default to current year
  export let availableYears: number[] = []; // Years available in the dataset
  export let onYearChange: (year: number) => void = () => {}; // Callback for year changes
  
  // Reference to the drawer element
  let drawerElement: HTMLElement;
  
  // Handle click outside
  function handleClickOutside(event: MouseEvent) {
    if (isOpen && drawerElement && !drawerElement.contains(event.target as Node)) {
      onClose();
    }
  }
  
  // Handle ESC key press
  function handleKeydown(event: KeyboardEvent) {
    if (isOpen && event.key === 'Escape') {
      onClose();
    }
  }
  
  // Set up and clean up event listeners
  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
  });
  
  onDestroy(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleKeydown);
  });
  
  // Format numbers with commas
  function formatNumber(num: number): string {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
  }
  
  // Calculate percentage
  function calculatePercentage(value: number, total: number): string {
    if (!total) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }
  
  // Get color for the therapeutic area
  $: areaColor = areaDetail?.areaName ? getTherapeuticAreaColor(areaDetail.areaName) : { fill: '#CBD5E0', stroke: '#718096' };

  // Get unique indications
  $: uniqueIndications = areaDetail?.indications ? Array.from(areaDetail.indications) : [];
  $: indicationCount = uniqueIndications.length;
  
  // Track which accordions are open
  let openAccordions = {
    drugCandidates: false,
    indications: false,
    developmentStages: false,
    companies: false
  };
  
  // Toggle accordion state
  function toggleAccordion(section) {
    openAccordions[section] = !openAccordions.section;
  }

  // Handle drug selection
  function handleDrugClick(drug) {
    if (onShowDrugDetail) {
      onShowDrugDetail({
        drugName: drug.Candidate,
        year: drug["PRV Year"] || drug["RPDD Year"],
        Company: drug.Company,
        therapeuticArea: drug.TherapeuticArea1,
        entries: areaDetail.entries.filter(d => d.TherapeuticArea1 === drug.TherapeuticArea1),
        color: areaColor.fill,
        strokeColor: areaColor.stroke,
        currentStage: drug["Current Development Stage"],
        indication: drug.Indication || "",
        rpddAwardDate: drug["RPDD Year"],
        voucherAwardDate: drug["PRV Year"] || "",
        treatmentClass: drug.Class1 || "TBD",
        mechanismOfAction: drug.MOA || "TBD",
        companyUrl: drug["Link to CrunchBase"] || ""
      });
    }
  }
  
  // Count drugs by indication
  function getDrugsByIndication() {
    if (!areaDetail?.entries) return [];
    
    const indicationMap = {};
    areaDetail.entries.forEach(entry => {
      if (entry.Indication) {
        indicationMap[entry.Indication] = (indicationMap[entry.Indication] || 0) + 1;
      }
    });
    
    return Object.entries(indicationMap)
      .map(([indication, count]) => ({ indication, count }))
      .sort((a, b) => b.count - a.count);
  }
  
  // Get company distribution
  function getCompanyDistributionSorted() {
    if (!areaDetail?.entries) return [];
    
    const companies = getCompanyDistribution(areaDetail.entries);
    return Object.entries(companies)
      .sort((a, b) => b[1] - a[1])
      .map(([company, count]) => ({ company, count }));
  }
  
  // Get stage distribution
  function getStageDistributionSorted() {
    if (!areaDetail?.entries) return [];
    
    const stages = getStageDistribution(areaDetail.entries);
    return Object.entries(stages)
      .sort((a, b) => b[1] - a[1])
      .map(([stage, count]) => ({ stage, count }));
  }
  
  $: indicationsWithCounts = getDrugsByIndication();
  $: companiesWithCounts = getCompanyDistributionSorted();
  $: stagesWithCounts = getStageDistributionSorted();
</script>

<div 
  class="therapeutic-area-drawer"
  class:open={isOpen}
  transition:fly={{ x: 400, duration: 300 }}
  bind:this={drawerElement}
>
  {#if areaDetail}
    <div class="drawer-header" style="border-color: {areaColor.stroke}">
      <div class="area-color-indicator" style="background-color: {areaColor.fill}; border-color: {areaColor.stroke}"></div>
      <div class="header-content">
        <h2>{areaDetail.areaName}</h2>
        <div class="year-selector">
          <span>Year:</span>
          <select 
            bind:value={selectedYear} 
            on:change={() => onYearChange(selectedYear)}
          >
            {#if availableYears.length === 0}
              <option value={selectedYear}>{selectedYear}</option>
            {:else}
              {#each availableYears as year}
                <option value={year}>{year}</option>
              {/each}
            {/if}
          </select>
        </div>
      </div>
      <button class="close-button" on:click={onClose}>×</button>
    </div>
    
    <div class="drawer-content">
      <div class="stat-grid">
        <!-- Drug Candidates Card with Preview and Accordion -->
        <div class="stat-card">
          <div class="stat-header" on:click={() => toggleAccordion('drugCandidates')}>
            <div>
              <h3>Drug Candidates</h3>
              <p class="stat-value">{formatNumber(areaDetail.totalDrugs)}</p>
            </div>
            <div class="accordion-icon" class:open={openAccordions.drugCandidates}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          
          <!-- Preview of first 3 drugs always visible -->
          {#if areaDetail.entries && areaDetail.entries.length > 0}
            <div class="preview-content">
              <div class="drugs-list">
                <div class="list-header">
                  <div class="drug-name-header">Drug</div>
                  <div class="drug-company-header">Company</div>
                  <div class="drug-stage-header">Stage</div>
                </div>
                {#each areaDetail.entries.slice(0, 3) as drug}
                  <div class="drug-item" on:click={() => handleDrugClick(drug)}>
                    <div class="drug-name">{drug.Candidate || 'Unnamed'}</div>
                    <div class="drug-company">{drug.Company || 'Unknown'}</div>
                    <div class="drug-stage">{drug["Current Development Stage"] || 'N/A'}</div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Expanded content -->
          {#if openAccordions.drugCandidates && areaDetail.entries && areaDetail.entries.length > 3}
            <div class="accordion-content">
              <div class="drugs-list">
                {#each areaDetail.entries.slice(3, 15) as drug}
                  <div class="drug-item" on:click={() => handleDrugClick(drug)}>
                    <div class="drug-name">{drug.Candidate || 'Unnamed'}</div>
                    <div class="drug-company">{drug.Company || 'Unknown'}</div>
                    <div class="drug-stage">{drug["Current Development Stage"] || 'N/A'}</div>
                  </div>
                {/each}
                {#if areaDetail.entries.length > 15}
                  <div class="more-items">
                    +{areaDetail.entries.length - 15} more candidates
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Companies Card with Preview and Accordion -->
        <div class="stat-card">
          <div class="stat-header" on:click={() => toggleAccordion('companies')}>
            <div>
              <h3>Companies</h3>
              <p class="stat-value">{formatNumber(areaDetail.uniqueCompanies)}</p>
            </div>
            <div class="accordion-icon" class:open={openAccordions.companies}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          
          <!-- Preview of first 3 companies always visible -->
          {#if companiesWithCounts.length > 0}
            <div class="preview-content">
              <div class="companies-list">
                <div class="list-header">
                  <div>Company</div>
                  <div>Drugs</div>
                </div>
                {#each companiesWithCounts.slice(0, 3) as {company, count}}
                  <div class="company-item">
                    <div class="company-name">{company}</div>
                    <div class="company-count">{count}</div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Expanded content -->
          {#if openAccordions.companies && companiesWithCounts.length > 3}
            <div class="accordion-content">
              <div class="companies-list">
                {#each companiesWithCounts.slice(3, 10) as {company, count}}
                  <div class="company-item">
                    <div class="company-name">{company}</div>
                    <div class="company-count">{count}</div>
                  </div>
                {/each}
                {#if companiesWithCounts.length > 10}
                  <div class="more-items">
                    +{companiesWithCounts.length - 10} more companies
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Indications Card with Preview and Accordion -->
        <div class="stat-card">
          <div class="stat-header" on:click={() => toggleAccordion('indications')}>
            <div>
              <h3>Indications</h3>
              <p class="stat-value">{formatNumber(indicationCount)}</p>
            </div>
            <div class="accordion-icon" class:open={openAccordions.indications}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          
          <!-- Preview of first 3 indications always visible -->
          {#if indicationsWithCounts.length > 0}
            <div class="preview-content">
              <div class="indications-list">
                <div class="list-header">
                  <div>Indication</div>
                  <div>Drugs</div>
                </div>
                {#each indicationsWithCounts.slice(0, 3) as {indication, count}}
                  <div class="indication-item">
                    <div class="indication-name">{indication}</div>
                    <div class="indication-count">{count}</div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Expanded content -->
          {#if openAccordions.indications && indicationsWithCounts.length > 3}
            <div class="accordion-content">
              <div class="indications-list">
                {#each indicationsWithCounts.slice(3, 10) as {indication, count}}
                  <div class="indication-item">
                    <div class="indication-name">{indication}</div>
                    <div class="indication-count">{count}</div>
                  </div>
                {/each}
                {#if indicationsWithCounts.length > 10}
                  <div class="more-items">
                    +{indicationsWithCounts.length - 10} more indications
                  </div>
                {/if}
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Development Stages Card with Preview and Accordion -->
        <div class="stat-card">
          <div class="stat-header" on:click={() => toggleAccordion('developmentStages')}>
            <div>
              <h3>Development Stages</h3>
              <p class="stat-value">{stagesWithCounts.length}</p>
            </div>
            <div class="accordion-icon" class:open={openAccordions.developmentStages}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          
          <!-- Preview of first 3 stages always visible -->
          {#if stagesWithCounts.length > 0 && areaDetail.entries}
            <div class="preview-content">
              <div class="stages-chart">
                <div class="stages-bars">
                  <div class="list-header">
                    <div>Stage</div>
                    <div>Progress</div>
                    <div>Count</div>
                  </div>
                  {#each stagesWithCounts.slice(0, 3) as {stage, count}}
                    {@const percentage = (count / areaDetail.entries.length) * 100}
                    <div class="stage-bar-container">
                      <div class="stage-label">{stage}</div>
                      <div class="stage-bar-wrapper">
                        <div class="stage-bar" style="width: {percentage}%; background-color: {getStageColor(stage)}"></div>
                      </div>
                      <div class="stage-count">{count}</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
          
          <!-- Expanded content -->
          {#if openAccordions.developmentStages && stagesWithCounts.length > 3}
            <div class="accordion-content">
              <div class="stages-chart">
                <div class="stages-bars">
                  {#each stagesWithCounts.slice(3) as {stage, count}}
                    {@const percentage = (count / areaDetail.entries.length) * 100}
                    <div class="stage-bar-container">
                      <div class="stage-label">{stage}</div>
                      <div class="stage-bar-wrapper">
                        <div class="stage-bar" style="width: {percentage}%; background-color: {getStageColor(stage)}"></div>
                      </div>
                      <div class="stage-count">{count}</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Clinical Trials Card -->
        <div class="stat-card">
          <h3>Clinical Trials</h3>
          <p class="stat-value">{formatNumber(areaDetail.clinicalTrials)}</p>
          <p class="stat-subtext">{calculatePercentage(areaDetail.clinicalTrials, areaDetail.totalDrugs)} of drugs</p>
        </div>
        
        <!-- Vouchers Awarded Card -->
        <div class="stat-card">
          <h3>Vouchers Awarded</h3>
          <p class="stat-value">{formatNumber(areaDetail.vouchersAwarded)}</p>
          <p class="stat-subtext">{calculatePercentage(areaDetail.vouchersAwarded, areaDetail.totalDrugs)} of drugs</p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .therapeutic-area-drawer {
    position: fixed;
    top: 0;
    right: -400px;
    width: 55.25vw;
    height: 100vh;
    background-color: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    overflow-y: auto;
    transition: right 0.3s ease;
  }
  
  .therapeutic-area-drawer.open {
    right: 0;
  }
  
  .drawer-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 3px solid;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
  }
  
  .header-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
  
  .year-selector {
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-top: 4px;
  }
  
  .year-selector span {
    margin-right: 8px;
    color: #4A5568;
  }
  
  .year-selector select {
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #CBD5E0;
    background-color: #F7FAFC;
    font-size: 12px;
    color: #2D3748;
    cursor: pointer;
    min-width: 80px;
    display: inline-block;
  }
  
  .area-color-indicator {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid;
    margin-right: 12px;
  }
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    flex-grow: 1;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #4A5568;
  }
  
  .drawer-content {
    padding: 20px;
  }
  
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-card {
    background-color: #F7FAFC;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    cursor: pointer;
    margin-bottom: 12px;
  }
  
  .stat-card h3 {
    font-size: 14px;
    color: #4A5568;
    margin: 0 0 8px 0;
    font-weight: 500;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: #2D3748;
  }
  
  .stat-subtext {
    font-size: 12px;
    color: #718096;
    margin: 4px 0 0 0;
  }
  
  .accordion-icon {
    color: #718096;
    transition: transform 0.3s ease;
  }
  
  .accordion-icon.open {
    transform: rotate(180deg);
  }
  
  .preview-content {
    margin-bottom: 8px;
  }
  
  .accordion-content {
    padding-top: 8px;
    border-top: 1px dashed #E2E8F0;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .list-header {
    display: grid;
    padding: 4px 0;
    font-size: 11px;
    font-weight: 600;
    color: #718096;
    border-bottom: 1px solid #E2E8F0;
    margin-bottom: 4px;
  }
  
  .drugs-list .list-header {
    grid-template-columns: 2fr 2fr 1fr;
  }
  
  .companies-list .list-header, 
  .indications-list .list-header {
    grid-template-columns: 3fr 1fr;
  }
  
  .drug-item {
    display: grid;
    grid-template-columns: 2fr 2fr 1fr;
    padding: 6px 0;
    border-bottom: 1px solid #EDF2F7;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 12px;
  }
  
  .drug-item:hover {
    background-color: #EDF2F7;
  }
  
  .drug-name, .company-name, .indication-name {
    font-weight: 500;
    color: #2D3748;
  }
  
  .drug-company, .drug-stage, .company-count, .indication-count {
    color: #718096;
  }
  
  .company-item, .indication-item {
    display: grid;
    grid-template-columns: 3fr 1fr;
    padding: 6px 0;
    border-bottom: 1px solid #EDF2F7;
    font-size: 12px;
  }
  
  .more-items {
    padding: 6px 0;
    text-align: center;
    color: #718096;
    font-style: italic;
    font-size: 12px;
    background-color: #EDF2F7;
    margin-top: 4px;
    border-radius: 4px;
  }
  
  .stages-chart {
    margin-top: 4px;
  }
  
  .stages-bars {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .stages-bars .list-header {
    display: grid;
    grid-template-columns: 1fr 2fr 0.5fr;
  }
  
  .stage-bar-container {
    display: grid;
    grid-template-columns: 1fr 2fr 0.5fr;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
    font-size: 12px;
  }
  
  .stage-label {
    color: #4A5568;
  }
  
  .stage-bar-wrapper {
    height: 8px;
    background-color: #EDF2F7;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .stage-bar {
    height: 100%;
    border-radius: 4px;
  }
  
  .stage-count {
    color: #718096;
    text-align: right;
  }
  
  /* Scrollbar styling */
  .accordion-content {
    scrollbar-width: thin;
    scrollbar-color: #CBD5E0 #EDF2F7;
  }
  
  .accordion-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .accordion-content::-webkit-scrollbar-track {
    background: #EDF2F7;
  }
  
  .accordion-content::-webkit-scrollbar-thumb {
    background-color: #CBD5E0;
    border-radius: 3px;
  }
</style>

<script context="module">
  // Helper function to get stage distribution
  function getStageDistribution(entries) {
    const stages = {};
    entries.forEach(entry => {
      const stage = entry["Current Development Stage"] || "Unknown";
      stages[stage] = (stages[stage] || 0) + 1;
    });
    return stages;
  }
  
  // Helper function to get company distribution
  function getCompanyDistribution(entries) {
    const companies = {};
    entries.forEach(entry => {
      if (entry.Company) {
        companies[entry.Company] = (companies[entry.Company] || 0) + 1;
      }
    });
    return companies;
  }
  
  // Helper function to get color for stage
  function getStageColor(stage) {
    const stageColors = {
      "Phase 1": "#4299E1",
      "Phase 1/2": "#3182CE",
      "Phase 2": "#2B6CB0",
      "Phase 2/3": "#2C5282",
      "Phase 3": "#2A4365",
      "Filed": "#553C9A",
      "Approved": "#38A169",
      "Marketed": "#276749",
      "Preclinical": "#718096",
      "Discovery": "#A0AEC0",
      "Unknown": "#CBD5E0"
    };
    
    // Map common abbreviations to full names
    const stageMap = {
      "P1": "Phase 1",
      "P1/2": "Phase 1/2",
      "P2": "Phase 2",
      "P2/3": "Phase 2/3",
      "P3": "Phase 3",
      "PRV": "Approved",
      "RPDD": "Preclinical"
    };
    
    const mappedStage = stageMap[stage] || stage;
    return stageColors[mappedStage] || "#CBD5E0";
  }
</script> 
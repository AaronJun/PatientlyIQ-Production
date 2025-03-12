<!-- MobileSponsorSidebar.svelte -->
<script lang="ts">
    import DrugEntryCard from './DrugEntryCard.svelte';
    import CompanyMetricsList from './CompanyMetricsList.svelte';
    import RPDSummaryView from './RPDSummaryView.svelte';
    import { getTherapeuticAreaStroke } from '../utils/colorDefinitions';
    import { ChevronUp } from 'carbon-icons-svelte';
    
    export let currentView: string | null = null;
    export let currentEntries: any[] = [];
    export let currentCompanyMetrics: any | null = null;
    export let colorMap: any = {}; // Kept for backward compatibility
    export let onShowDrugDetail = (details: any) => {};
    export let fullYearData: any[] = []; // All data for the selected year
    export let selectedYear: string = "";
    export let isExpanded: boolean = false;
    
    // Handle drug card click by formulating the appropriate detail object
    function handleDrugClick(entry: any) {
      onShowDrugDetail({
        drugName: entry.Candidate,
        year: entry["RPDD Year"],
        Company: entry.Company,
        therapeuticArea: entry.TherapeuticArea1,
        entries: currentEntries.filter(d => d.TherapeuticArea1 === entry.TherapeuticArea1),
        color: getTherapeuticAreaStroke(entry.TherapeuticArea1),
        currentStage: entry["Current Development Stage"] || "TBD",
        indication: entry.Indication || "",
        rpddAwardDate: entry["RPDD Year"],
        voucherAwardDate: entry["PRV Year"] || "",
        treatmentClass: entry.Class1 || "TBD",
        mechanismOfAction: entry.MOA || "TBD",
        companyUrl: entry["Link to CrunchBase"] || ""
      });
    }
    
    // Get a summary for stage view
    function getStageSummary() {
      if (!currentEntries.length) return '';
      
      const stats = {
        totalEntries: currentEntries.length,
        uniqueCompanies: new Set(currentEntries.map((d: any) => d.Company)).size,
        uniqueIndications: new Set(currentEntries.map((d: any) => d.Indication)).size
      };
      
      return `This development stage includes ${stats.totalEntries} drugs from ${stats.uniqueCompanies} companies across ${stats.uniqueIndications} indications.`;
    }
</script>

<div class="mobile-sidebar fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg rounded-t-xl transition-transform duration-300 transform {isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'}">
  <!-- Handle to expand/collapse -->
  <div 
    class="handle flex justify-center items-center h-14 cursor-pointer bg-white rounded-t-xl border-t border-x border-slate-200"
    on:click={() => isExpanded = !isExpanded}
  >
    <div class="w-16 h-1 bg-slate-300 rounded-full mb-2"></div>
    <div class="absolute right-4">
      <ChevronUp 
        size={20} 
        class="text-slate-500 transform transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}"
      />
    </div>
    <div class="absolute left-4 text-sm font-medium text-slate-700">
      {#if currentView === 'Company View' && currentCompanyMetrics}
        {currentCompanyMetrics.companyName}
      {:else if currentView === 'Stage View' && currentEntries.length > 0}
        {currentView}
      {:else}
        Overview
      {/if}
    </div>
  </div>
  
  <!-- Content area -->
  <div class="content p-4 overflow-y-auto" style="max-height: calc(70vh - 3.5rem)">
    <div class="space-y-4">
      <div class="mb-4">
        {#if currentView === 'Company View' && currentCompanyMetrics}
          <!-- Display company metrics -->
          <CompanyMetricsList metrics={currentCompanyMetrics} />
        {:else if currentView === 'Stage View' && currentEntries.length > 0}
          <!-- Display stage summary -->
          <div class="border border-slate-200 rounded-lg p-3 mb-4">
            <h3 class="text-sm font-semibold text-slate-800 mb-2">{currentView}</h3>
            <p class="text-sm text-slate-700">
              {getStageSummary()}
            </p>
          </div>
        {:else if fullYearData.length > 0}
          <!-- Display year summary when no specific selection is made -->
          <RPDSummaryView data={fullYearData} year={selectedYear} />
        {/if}
      </div>
      
      <!-- List of drug entries -->
      <div class="space-y-3">
        {#if currentEntries.length > 0}
          {#each currentEntries as entry}
            <DrugEntryCard 
              {entry}
              onClick={handleDrugClick}
              {colorMap}
            />
          {/each}
        {:else if fullYearData.length === 0}
          <div class="text-center py-8 text-slate-500">
            <p>Select a company or stage to view drugs</p>
            <p class="text-xs mt-2">Tap on elements in the visualization</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .mobile-sidebar {
    max-height: 80vh;
  }
  
  /* Tablet-specific styles */
  @media (min-width: 768px) and (max-width: 1023px) {
    .mobile-sidebar {
      max-height: 90vh;
    }
    
    .content {
      max-height: calc(85vh - 3.5rem) !important;
    }
  }
  
  .handle {
    position: relative;
  }
  
  .content {
    scrollbar-color: #e5e7eb #f9fafb;
    scrollbar-width: thin;
  }
  
  .content::-webkit-scrollbar {
    width: 4px;
  }
  
  .content::-webkit-scrollbar-track {
    background: #f9fafb;
  }
  
  .content::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 4px;
  }
</style> 
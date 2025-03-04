<!-- SponsorSidebar.svelte -->
<script lang="ts">
    import DrugEntryCard from './DrugEntryCard.svelte';
    import CompanyMetricsList from './CompanyMetricsList.svelte';
    import RPDSummaryView from './RPDSummaryView.svelte';
    import { getTherapeuticAreaStroke } from '../utils/colorDefinitions';
    
    export let currentView = null;
    export let currentEntries = [];
    export let currentCompanyMetrics = null;
    export let colorMap = {}; // Kept for backward compatibility
    export let onShowDrugDetail = (details) => {};
    export let fullYearData = []; // All data for the selected year
    export let selectedYear = "";
    
    // Handle drug card click by formulating the appropriate detail object
    function handleDrugClick(entry) {
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
        voucherAwardDate: entry["PRV Issue Year"] || "",
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
        uniqueCompanies: new Set(currentEntries.map(d => d.Company)).size,
        uniqueIndications: new Set(currentEntries.map(d => d.Indication)).size
      };
      
      return `This development stage includes ${stats.totalEntries} drugs from ${stats.uniqueCompanies} companies across ${stats.uniqueIndications} indications.`;
    }
  </script>
  
  <div class="sidebar pt-4 overflow-y-auto" style="max-height: calc(80vh - 2rem)">
    <div class="space-y-6">
      <div class="mb-6">
        {#if currentView === 'Company View' && currentCompanyMetrics}
          <!-- Display company metrics -->
          <CompanyMetricsList metrics={currentCompanyMetrics} />
        {:else if currentView === 'Stage View' && currentEntries.length > 0}
          <!-- Display stage summary -->
          <div class="border border-late-200 mb-4">
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
            <p class="text-xs mt-2">Hover over elements in the visualization</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <style>
    .sidebar {
      /* These styles are primarily handled through Tailwind classes above */
      scrollbar-color: #e5e7eb #f9fafb;
      scrollbar-width: thin;
    }
    
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }
    
    .sidebar::-webkit-scrollbar-track {
      background: #ff1515;
    }
    
    .sidebar::-webkit-scrollbar-thumb {
      background-color: #e5e7eb;
    }
  </style>
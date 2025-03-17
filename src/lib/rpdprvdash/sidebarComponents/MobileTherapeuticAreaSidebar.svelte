<!-- MobileTherapeuticAreaSidebar.svelte -->
<script lang="ts">
    import DrugEntryCard from './DrugEntryCard.svelte';
    import AreaMetricsList from './AreaMetricsList.svelte';
    import RPDSummaryView from './RPDSummaryView.svelte';
    import { getTherapeuticAreaFill, getTherapeuticAreaStroke } from '../utils/colorDefinitions';
    import { ChevronUp } from 'carbon-icons-svelte';
    
    export let currentEntries: any[] = [];
    export let currentArea: string | null = null;
    export let areaMetrics: any | null = null;
    export let colorMap: any = {}; // Kept for backward compatibility
    export let onShowDrugDetail = (details: any) => {};
    export let fullYearData: any[] = []; // All data for the selected year
    export let selectedYear: string = "";
    export let isExpanded: boolean = false;
    
    // Detect if we're on a tablet device (for styling adjustments)
    let isTablet = false;
    
    import { onMount } from 'svelte';
    
    onMount(() => {
      // Check if we're on a tablet device (iPad)
      isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      
      // Update on resize
      const handleResize = () => {
        isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });
    
    // Handle drug card click
    function handleDrugClick(entry: any) {
      onShowDrugDetail({
        drugName: entry.Candidate,
        year: entry["RPDD Year"],
        Company: entry.Company,
        therapeuticArea: entry.TherapeuticArea1,
        currentStage: entry["Current Development Stage"],
        indication: entry.Indication,
        entries: currentEntries,
        color: getTherapeuticAreaStroke(entry.TherapeuticArea1),
        rpddAwardDate: entry["RPDD Year"],
        voucherAwardDate: entry["PRV Issue Year"] || "",
        treatmentClass: entry.Class1 || "TBD",
        mechanismOfAction: entry.MOA || "TBD",
        companyUrl: entry["Link to CrunchBase"] || ""
      });
    }
</script>

<div class="mobile-sidebar fixed bottom-0 left-0 right-0 bg-slate-200 shadow-md rounded-t-md transition-transform duration-300 transform {isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'}">
  <!-- Handle to expand/collapse -->
  <div 
    class="handle flex justify-center items-center h-14 cursor-pointer rounded-t-xl border-t border-x border-slate-50"
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
      {#if currentArea}
        {currentArea}
      {:else}
        Therapeutic Areas
      {/if}
    </div>
  </div>
  
  <!-- Content area -->
  <div class="content p-4 overflow-y-auto" style="max-height: calc(70vh - 3.5rem)">
    <div class="space-y-4">
      <!-- Slot for additional content like search -->
      <slot></slot>
      
      <div class="mb-4">
        {#if currentEntries.length > 0 && currentArea && areaMetrics}
          <!-- Display area metrics -->
          <AreaMetricsList 
            metrics={{
              areaName: currentArea,
              totalDrugs: areaMetrics.totalDrugs,
              uniqueCompanies: areaMetrics.uniqueCompanies,
              uniqueCandidates: areaMetrics.uniqueCandidates
            }}
            color={getTherapeuticAreaStroke(currentArea)}
          />
        {:else if fullYearData.length > 0}
          <!-- Display year summary when no specific selection is made -->
          <RPDSummaryView data={fullYearData} year={selectedYear} />
        {:else if currentEntries.length === 0}
          <div class="text-center py-8 text-slate-500">
            <p>Select a therapeutic area to view drugs</p>
            <p class="text-xs mt-2">Tap on sections in the chart</p>
          </div>
        {/if}
      </div>
      
      <!-- Entries list -->
      <div class="space-y-3">
        {#each currentEntries as entry}
          <DrugEntryCard 
            {entry}
            onClick={handleDrugClick}
            {colorMap}
          />
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .mobile-sidebar {
    z-index: 1000;
    max-height: 80vh;
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
  }
</style> 
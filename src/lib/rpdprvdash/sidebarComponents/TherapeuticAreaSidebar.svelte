<!-- TherapeuticAreaSidebar.svelte -->
<script lang="ts">
    import DrugEntryCard from './DrugEntryCard.svelte';
    import AreaMetricsList from './AreaMetricsList.svelte';
    import RPDSummaryView from './RPDSummaryView.svelte';
    import { getTherapeuticAreaFill, getTherapeuticAreaStroke } from '../utils/colorDefinitions';
    import { createEventDispatcher } from 'svelte';
    
    export let currentEntries: any[] = [];
    export let currentArea: string | null = null;
    export let areaMetrics: any | null = null;
    export let colorMap: Record<string, string> = {}; // Kept for backward compatibility
    export let onShowDrugDetail = (details: any) => {};
    export let fullYearData: any[] = []; // All data for the selected year
    export let selectedYear: string = "";
    export let isCollapsed: boolean = false;
    export let isTouchDevice: boolean = false;
    
    // Create event dispatcher for canvas events
    const dispatch = createEventDispatcher();
    
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
  
  <div class="sidebar bg-slate-50/90 overflow-y-auto" style="max-height: calc(80vh - 2rem)">
    <div class="space-y-2">
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
        <div class="text-left py-8 text-slate-500">
          <p>Select a therapeutic area to view drugs</p>
          <p class="text-xs mt-2">Click on sections in the chart</p>
        </div>
      {/if}
      
      <!-- Entries list -->
      <div class="space-y-3">
        {#each currentEntries as entry}
          <DrugEntryCard 
            {entry}
            onClick={handleDrugClick}
            colorMap={null}
          />
        {/each}
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
      background: #f9fafb;
    }
    
    .sidebar::-webkit-scrollbar-thumb {
      background-color: #e5e7eb;
      border-radius: 6px;
    }
  </style>
<!-- DrugEntryCard.svelte -->
<script lang="ts">
  import { ArrowUpRight, 
          Building,
          Medication,
          HealthCross,
   } from 'carbon-icons-svelte';
  import { getTherapeuticAreaFill, getTherapeuticAreaStroke } from '../utils/colorDefinitions';
  
  export let entry; // The drug entry data
  export let onClick; // Function to handle click
  export let colorMap = null; // Legacy parameter, kept for compatibility
</script>

<div 
  class="card-2 px-4 py-4 hover:bg-sky-200 hover:cursor-pointer transition-all duration-200 ease-in-out"
  on:click={() => onClick(entry)}
>
  <div class="flex flex-col gap-2">
    <div class="flex justify-between items-start">
      <div class="flex align-baseline gap-2">
      <Medication class="text-slate-500" size={16} />      
      <h3 class="text-sm font-semibold text-slate-900 capitalize">{entry.Candidate}</h3>
      </div>
      <div class="bg-slate-200 p-1 rounded-full"><ArrowUpRight class="text-slate-600" size={16} />
    </div>
  </div>
    <div>
      <div class="flex align-baseline gap-2">
        <Building class="text-slate-500" size={16} />      
      <p class="text-xs text-slate-500 capitalize font-medium">{entry.Company}</p>
      </div>

      <div class="flex align-baseline gap-2 mt-1">
        <HealthCross class="text-slate-500" size={16} />      
      <p class="text-xs text-slate-600 capitalize">{entry.Indication || 'Not specified'}</p>
    </div>
    </div>
    
    <div class="flex flex-wrap gap-2 mt-1">
      {#if entry["Current Development Stage"]}
        <span class="text-[9.25px] w-fit bg-slate-200 text-slate-800 px-2 py-1 rounded-lg" 
              style="border: .5px solid #565656">
          {entry["Current Development Stage"]}
        </span>
      {/if}
      
      {#if entry.TherapeuticArea1}
        <span class="text-[9.25px] w-fit px-2 py-1 rounded-lg" 
              style="background-color: {getTherapeuticAreaFill(entry.TherapeuticArea1)}; 
                     color: {getTherapeuticAreaStroke(entry.TherapeuticArea1)};
                     border: 1.5px solid {getTherapeuticAreaStroke(entry.TherapeuticArea1)};">
          {entry.TherapeuticArea1}
        </span>
      {/if}
      
      {#if entry["PRV Issue Year"]}
        <span class="text-[9.25px] w-fit bg-amber-100 text-amber-800 px-2 py-1 rounded-lg border border-amber-200">
          PRV {entry["PRV Issue Year"]}
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  .card {
    border-bottom: .725px dotted #535353;
    padding: .5rem .25rem .75rem .325rem;
    transition: all 0.2s ease-in-out;
  }
  
  .card:hover {
    transform: translateX(4px);
    border-bottom: 1px solid #535353;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }
</style>
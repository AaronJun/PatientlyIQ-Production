<!-- RPDRadialLegend.svelte -->
<script lang="ts">
    import { getTherapeuticAreaColor, therapeuticAreaColors } from './utils/colorDefinitions';
    
    interface LegendItem {
        area: string;
        count: number;
    }

    // Get all areas from the colorDefinitions file
    const allTherapeuticAreas = Object.keys(therapeuticAreaColors);
    
    // Allow external items but default to the complete list from colorDefinitions
    export let items: LegendItem[] = allTherapeuticAreas.map(area => ({ area, count: 0 }));
    
    // Optionally filter items to only show areas with counts > 0
    export let showOnlyWithCounts = false;
    
    // colorScale is now optional since we'll use the imported color function by default
    export let colorScale: (area: string) => string = (area) => getTherapeuticAreaColor(area).fill;
    
    $: displayItems = showOnlyWithCounts ? items.filter(item => item.count > 0) : items;
</script>

<div class="legend-container flex-row flex-wrap align-middle justify-left gap-4 px-2 py-1 w-full bg-slate-100/20">
    <h3 class="text-xs font-medium text-slate-500 uppercase mb-2">Therapeutic Area</h3>
    {#each displayItems as d}
        <div class="flex flex-row justify-start align-middle legend-item">
            <div class="legend-color w-3 h-3 rounded-full relative overflow-hidden">
                <div class="absolute inset-0 right-1/2 bg-left-half" 
                     style="background-color: {colorScale(d.area)};">
                </div>
                <div class="absolute inset-0 left-1/2 bg-right-half" 
                     style="background-color: {getTherapeuticAreaColor(d.area).stroke};">
                </div>
            </div>
            <span class="text-xs text-slate-800 font-sans font-base">{d.area}</span>
        </div>
    {/each}
</div>

<style>
    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.45725rem;
    }

    .legend-color {
        display: flex;
    }
    
    .bg-left-half {
        border-top-left-radius: 50%;
        border-bottom-left-radius: 50%;
    }
    
    .bg-right-half {
        border-top-right-radius: 50%;
        border-bottom-right-radius: 50%;
    }

    .legend-container {
        border-bottom: 1px solid #e2e8f0;
    }
</style>
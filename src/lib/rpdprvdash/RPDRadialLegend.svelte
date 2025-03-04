<!-- RPDRadialLegend.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
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
    
    // Responsive layout variables
    let containerWidth = 0;
    let legendContainer: HTMLElement;
    let columns = 3;

    // Watch container size and update columns
    function updateColumns() {
        if (!legendContainer) return;
        
        const width = legendContainer.offsetWidth;
        
        if (width < 250) {
            columns = 1;
        } else if (width < 450) {
            columns = 2;
        } else {
            columns = 3;
        }
        
        containerWidth = width;
    }

    onMount(() => {
        updateColumns();
        
        // Set up resize observer to monitor container width changes
        const resizeObserver = new ResizeObserver(() => {
            updateColumns();
        });
        
        if (legendContainer) {
            resizeObserver.observe(legendContainer);
        }
        
        return () => {
            if (legendContainer) {
                resizeObserver.disconnect();
            }
        };
    });

    // Filtered items
    $: displayItems = showOnlyWithCounts ? items.filter(item => item.count > 0) : items;
</script>

<div 
    class="legend-container grid flex-wrap align-middle justify-left w-ful gap-x-4" 
    style="grid-template-columns: repeat({columns}, minmax(0, 1fr));"
    bind:this={legendContainer}
>
    <h3 class="text-xs font-semibold text-slate-800 capitalize mb-4" style="grid-column: span {columns};">Therapeutic Areas</h3>
    {#each displayItems as d}
        <div class="legend-row flex flex-row justify-start align-middle legend-item">
            <div class="legend-color w-3 h-3 rounded-full relative overflow-hidden">
                <div class="absolute inset-0 right-1/2 bg-left-half" 
                     style="background-color: {colorScale(d.area)};">
                </div>
                <div class="absolute inset-0 left-1/2 bg-right-half" 
                     style="background-color: {getTherapeuticAreaColor(d.area).stroke};">
                </div>
            </div>
            <span class="text-[9.725px] text-slate-800 font-sans font-base">
                {d.area}{d.count > 0 ? ` | ${d.count}` : ''}
            </span>
        </div>
    {/each}
</div>

<style>
    .legend-row {
        margin-bottom: 0.425rem;
        padding-bottom: .25rem;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.32725rem;
    }

    .legend-color {
        border: 1px solid #161616;
        display: flex;

    }
   
    .legend-container {
        border-top: .325px solid #161616;
        padding-top: .5625rem;
    }
</style>
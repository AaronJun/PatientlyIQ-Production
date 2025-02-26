<!-- RPDRadialLegend.svelte -->
<script lang="ts">
    interface LegendItem {
        area: string;
        count: number;
    }

    export let items: LegendItem[] = [];
    export let colorScale: (area: string) => string;
</script>

<div class="legend-container flex-row flex-wrap align-middle justify-left gap-4 px-2 py-1 w-full bg-slate-100/20">
    <h3 class="text-xs font-semibold text-slate-500 uppercase">Therapeutic Area</h3>
    {#each items as d}
        <div class="flex flex-row justify-start align-middle gap-1 legend-item">
            <div 
                class="legend-color w-2 h-2 rounded-full"
                style="background-color: {colorScale(d.area)}"
            ></div>
            <span class="text-xs text-slate-800 font-sans font-base">{d.area}</span>
        </div>
    {/each}
    
</div>


<style>
    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.245rem;
    }

    .legend-color {
     border: 1px solid #505050;
    }

    .legend-container {
        border-bottom: 1px solid #e2e8f0;
    }
</style>
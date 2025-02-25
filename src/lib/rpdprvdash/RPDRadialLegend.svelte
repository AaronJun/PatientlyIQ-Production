<!-- RPDRadialLegend.svelte -->
<script lang="ts">
    interface LegendItem {
        area: string;
        count: number;
    }

    export let items: LegendItem[] = [];
    export let colorScale: (area: string) => string;
</script>

<div class="flex flex-wrap align-middle justify-center gap-4">
    {#each items as d}
        <div class="flex flex-row justify-center align-middle gap-2 legend-item">
            <div 
                class="legend-color w-2 h-2 rounded-full"
                style="background-color: {colorScale(d.area)}"
            ></div>
            <span class="text-xs font-sans font-base">{d.area}</span>
        </div>
    {/each}
</div>


<style>
    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .legend-color {
     border: 1px solid #505050;
    }
</style>
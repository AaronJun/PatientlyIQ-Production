<!-- RPDRadialLegend.svelte -->
<script lang="ts">
    interface LegendItem {
        area: string;
        count: number;
    }

    export let items: LegendItem[] = [];
    export let colorScale: (area: string) => string;
</script>

<div class="flex flex-wrap justify-center gap-4">
    {#each items as d}
        <div class="flex flex-row justify-center align-middle gap-1">
            <div 
                class="w-2 h-[9.5px] rounded"
                style="background-color: {colorScale(d.area)}"
            ></div>
            <span class="text-[9.725px] font-sans font-medium">{d.area}</span>
        </div>
    {/each}
</div>
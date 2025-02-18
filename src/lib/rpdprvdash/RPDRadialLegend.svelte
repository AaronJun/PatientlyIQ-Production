<!-- RPDRadialLegend.svelte -->
<script lang="ts">
    interface LegendItem {
        area: string;
        count: number;
    }

    export let items: LegendItem[] = [];
    export let colorScale: (area: string) => string;
</script>

<div class="flex flex-wrap max-w-2xl align-baseline justify-center gap-4">
    {#each items as d}
        <div class="flex flex-row justify-center align-middle gap-1">
            <div 
                class="w-3 h-3 rounded-full"
                style="background-color: {colorScale(d.area)}"
            ></div>
            <span class="text-[9.725px] font-sans font-base">{d.area}</span>
        </div>
    {/each}
</div>
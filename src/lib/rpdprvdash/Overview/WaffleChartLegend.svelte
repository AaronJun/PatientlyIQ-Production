<!-- WaffleChartLegend.svelte -->
<script lang="ts">
    import { Separator } from 'bits-ui';
    export let legendItems: { 
        id: string;
        label: string;
        count: number;
        color: string;
    }[] = [];
    export let onItemClick: (id: string) => void = () => {};
    export let title: string = '';
</script>

<div class="legend-sidebar flex flex-col gap-2 overflow-x-scroll">
    {#if title}
        <div class="legend-title text-xs font-medium text-slate-800">{title}</div>
    {/if}
    <Separator.Root
    orientation="horizontal"
    class="bg-slate-600 shrink-0 data-[orientation=horizontal]:h-[.25px] data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]"
    />
    
    <div class="legend-items grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-1 w-full">
        {#each legendItems as item}
            <div 
                class="legend-item flex flex-row gap-2 w-full align- items-top" 
                on:click={() => onItemClick(item.id)}
            >
                <div 
                    class="legend-color w-2 h-2 ring-1 ring-slate-800 rounded-full" 
                    style="background-color: {item.color};"
                ></div>
                <span class="legend-text text-2xs">{item.label} ({item.count})</span>
            </div>
        {/each}
    </div>
</div>

<style>
   
</style> 
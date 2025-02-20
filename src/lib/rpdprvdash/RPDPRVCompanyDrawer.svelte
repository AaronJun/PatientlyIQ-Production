<!-- RPDPRVCompanyDrawer.svelte -->
<script lang="ts">
    import { fly } from 'svelte/transition';
    import { ArrowLeft, ArrowUpRight, BookmarkAdd, BookmarkFilled, Globe } from 'carbon-icons-svelte';
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
    import RPDPipelineMetrics from './PipelineVisualization.svelte';

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let Company: string;
    export let entries: any[];
    export let color: string;
    export let companyUrl: string = "";

    let searchTerm = "";
    let isTracked = false;

    $: companyInfo = entries.length > 0 ? {
        country: entries[0].COUNTRY || 'N/A',
        type: entries[0]['Public/Private'] || 'N/A',
        marketCap: entries[0].MarketCap || 'N/A'
    } : null;

    function handleClose() {
        onClose();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            handleClose();
        }
    }

    function handleDrawerClick(event: MouseEvent) {
        event.stopPropagation();
    }

    function filterData(data: any[], term: string) {
        if (!term) return data;
        return data.filter(item => 
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(term.toLowerCase())
            )
        );
    }

    function handleCompanyClick() {
        if (companyUrl) {
            window.open(companyUrl, '_blank');
        }
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div 
    class="fixed inset-0 w-full min-w-[400px] h-full bg-black/60 z-[1000] flex justify-end cursor-pointer"
    on:click|self={onClose}
    transition:fly={{duration: 525}}
>
    <div 
        class="drawer relative w-[62.25vw] h-full bg-white shadow-lg z-[1000] overflow-y-auto border-l-[10px] cursor-default"
        on:click={handleDrawerClick}
        style="border-color: {color}"
    >
        <div class="header flex flex-row bg-slate-100 justify-between pl-2 pr-4 py-2 w-full">
            <button 
                class="flex gap-1 pr-3 pl-2 py-1 items-center justify-self-start text-xs font-semibold text-[#37587e] hover:bg-green-800"
                on:click={handleClose}
                in:fly={{duration: 300}}
            >
                <ArrowLeft size={12}/> Back
            </button>
            
            <button 
                class="flex gap-2 px-3 py-2 items-center justify-self-start text-xs text-base font-semibold text-gray-100 transition-all duration-300 ease-in-out {isTracked ? 'bg-emerald-600' : 'bg-[#37587e] hover:bg-green-800'}"
                in:fly={{duration: 300}}
                on:click={() => isTracked = !isTracked}
            >
                {#if isTracked}
                    <BookmarkFilled class="transition-transform" /> Tracked
                {:else}
                    <BookmarkAdd class="transition-transform" /> Track
                {/if}
            </button>
        </div>

        <div class="drawer-content">
            <div class="header flex gap-4 my-4 pb-4 w-full align-bottom min-w-max justify-between">
                <div class="flex flex-col gap-4 rounded-lg">
                    <div class="flex w-full items-center gap-24">
                        <h2 class="text-4xl font-light text-slate-800" in:fly={{duration: 300}}>
                            {Company}
                        </h2>
                    </div>
               
                </div>
                <div class="flex gap-4 w-fit rounded-lg">
                    <div class="flex flex-col gap-4 w-64 rounded-lg">
                        <div class="entries flex-row">
                            <p class="text-base text-slate-800 font-medium">{companyInfo?.country}</p>
                            <span class="text-[9.25px] uppercase tracking-wide text-slate-500 font-semibold">Country</span>
                        </div>

                        <div class="entries flex-row">
                            <p class="text-base text-slate-800 font-medium">{companyInfo?.type}</p>
                            <span class="text-[9.25px] uppercase tracking-wide text-slate-500 font-semibold">Status</span>
                        </div>
                        <div class="entries flex-row">
                            <p class="text-base text-slate-800 font-medium">${companyInfo?.marketCap}</p>
                            <span class="text-[9.25px] uppercase tracking-wide text-slate-500 font-semibold">
                            Market Cap</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4 w-64 rounded-lg">
                <RPDPipelineMetrics data={entries} company={Company}  />
                </div>
                </div>
                        {#if companyUrl}
                        <button 
                        class="flex text-sm capitalize gap-1 font-semibold text-slate-800 hover:text-emerald-600"
                        on:click={handleCompanyClick}
                        in:fly={{duration: 300}}
                    >
                        View Profile <ArrowUpRight size={12}/>
                    </button>
                {/if}
            </div>

            <section class="mt-8">
                <h3 class="text-lg font-base text-slate-800 mb-4">
                    Development Pipeline
                </h3>
                
                <Toolbar size="sm">
                    <ToolbarContent>
                        <ToolbarSearch bind:value={searchTerm} />
                    </ToolbarContent>
                </Toolbar>

                <DataTable
                    size="medium"
                    headers={[
                        { key: 'candidate', value: 'Drug Candidate' },
                        { key: 'indication', value: 'Indication' },
                        { key: 'area', value: 'Therapeutic Area' },
                        { key: 'stage', value: 'Development Stage' },
                        { key: 'rpddYear', value: 'RPDD Year' }
                    ]}
                    rows={filterData(entries.map(entry => ({
                        id: entry.Candidate,
                        candidate: entry.Candidate,
                        indication: entry.Indication,
                        area: entry.TherapeuticArea1,
                        stage: entry["Current Development Stage"],
                        rpddYear: entry["RPDD Year"]
                    })), searchTerm)}
                    sortable
                >
                    <svelte:fragment slot="cell" let:row let:cell>
                        {cell.value}
                    </svelte:fragment>
                </DataTable>
            </section>
        </div>
    </div>
</div>

<style>
    .drawer-content {
        padding: 1rem 1.5rem;
    }

    :global(.bx--data-table-container) {
        width: 100%;
        height: 100%;
    }

    :global(.bx--data-table th, .bx--data-table td) {
        font-weight: 500;
        text-transform: capitalize;
        color: #292F58;
        font-size: 11.25px;
    }

    :global(.bx--toolbar-content) {
        margin-bottom: 0.725rem;
    }

    :global(.bx--data-table tbody tr:hover) {
        background-color: #f5f9ff;
    }

    .company-info {
        border-top: 1px solid #e2e8f0;
        padding-top: 0.5rem;
    }


.entries {
    position: relative;
    padding-bottom: .425rem;
    border-bottom: .25px solid #e5e5e5;
}
</style>
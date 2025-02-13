<!-- RPDPRVCompanyDrawer.svelte -->
<script lang="ts">
    import { fly } from 'svelte/transition';
    import { ArrowLeft, ArrowUpRight, BookmarkAdd, BookmarkFilled } from 'carbon-icons-svelte';
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let Company: string;
    export let entries: any[];
    export let color: string;
    export let companyUrl: string = "";

    let searchTerm = "";
    let isTracked = false;

    $: pipelineStats = entries.length > 0 ? {
        totalRPDDs: entries.length,
        inClinicalTrials: entries.filter(entry => {
            const stage = entry["Current Development Stage"];
            return ["Phase 1", "Phase 1/2", "Phase 2", "Phase 2a", "Phase 2b", "Phase 3"].includes(stage);
        }).length,
        prvAwarded: entries.filter(entry => entry["PRV Issue Year"]).length,
        prvAvailable: entries.filter(entry => entry["PRV Issue Year"] && !entry["Sale Year"]).length,
        byStage: entries.reduce((acc, curr) => {
            const stage = curr["Current Development Stage"];
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
        }, {}),
        byArea: entries.reduce((acc, curr) => {
            const area = curr.TherapeuticArea1;
            acc[area] = (acc[area] || 0) + 1;
            return acc;
        }, {})
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
            <div class="header flex gap-4 my-4 pb-4 w-full align-bottom justify-between">
                <div class="flex flex-col gap-2">
                    <h2 class="text-4xl font-light text-slate-800" in:fly={{duration: 300}}>
                        {Company}
                    </h2>
                    <p class="text-sm text-slate-600">
                        {pipelineStats.totalRPDDs} RPDD drugs in development<br/>
                        {pipelineStats.inClinicalTrials} RPDD drugs in clinical trials<br/>
                        {pipelineStats.prvAwarded} PRV awarded<br/>
                        {pipelineStats.prvAvailable} PRV available
                    </p>
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

            <!-- Pipeline Table -->
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
</style>
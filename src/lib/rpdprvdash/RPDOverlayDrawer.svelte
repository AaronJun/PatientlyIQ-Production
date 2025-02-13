<!-- RPDOverlayDrawer.svelte -->
<script lang="ts">
    import { fly } from 'svelte/transition';
    import { ArrowLeft, ArrowUpRight } from 'carbon-icons-svelte';
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let title: string;
    export let data: any[];
    export let color: string;
    export let type: 'stage' | 'therapeuticArea' | 'indication' | 'treatmentClass' | 'moa';
    export let onDrugClick: (drugData: any) => void = () => {};

    let searchTerm = "";

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

    function handleDrugClick(drugData: any) {
        // Find the complete drug entry from the data array
        const drugEntry = data.find(entry => entry.Candidate === drugData.drugName);
        if (drugEntry) {
            onDrugClick({
                drugName: drugEntry.Candidate,
                Company: drugEntry.Company,
                year: drugEntry["RPDD Year"],
                therapeuticArea: drugEntry.TherapeuticArea1,
                currentStage: drugEntry["Current Development Stage"],
                rpddAwardDate: drugEntry["RPDD Month"] + "/" + drugEntry["RPDD Year"],
                voucherAwardDate: drugEntry["PRV Issue Month"] ? 
                    drugEntry["PRV Issue Month"] + "/" + drugEntry["PRV Issue Year"] : "",
                indication: drugEntry.Indication,
                treatmentClass: drugEntry.Class1,
                mechanismOfAction: drugEntry.MOA,
                entries: data,
                color
            });
            handleClose();
        }
    }

    const headers = {
        stage: [
            { key: 'year', value: 'Year' },
            { key: 'drugName', value: 'Drug Name' },
            { key: 'company', value: 'Company' },
            { key: 'therapeuticArea', value: 'Therapeutic Area' },
            { key: 'stage', value: 'Stage' }
        ],
        therapeuticArea: [
            { key: 'year', value: 'Year' },
            { key: 'drugName', value: 'Drug Name' },
            { key: 'company', value: 'Company' },
            { key: 'indication', value: 'Indication' },
            { key: 'stage', value: 'Stage' }
        ],
        indication: [
            { key: 'year', value: 'Year' },
            { key: 'drugName', value: 'Drug Name' },
            { key: 'company', value: 'Company' },
            { key: 'therapeuticArea', value: 'Therapeutic Area' },
            { key: 'stage', value: 'Stage' }
        ],
        treatmentClass: [
            { key: 'year', value: 'Year' },
            { key: 'drugName', value: 'Drug Name' },
            { key: 'company', value: 'Company' },
            { key: 'therapeuticArea', value: 'Therapeutic Area' },
            { key: 'stage', value: 'Stage' }
        ],
        moa: [
            { key: 'year', value: 'Year' },
            { key: 'drugName', value: 'Drug Name' },
            { key: 'company', value: 'Company' },
            { key: 'therapeuticArea', value: 'Therapeutic Area' },
            { key: 'stage', value: 'Stage' }
        ]
    };

    function mapDataToRows(data: any[]) {
        return data.map(entry => ({
            id: entry.Candidate,
            year: entry["RPDD Year"],
            drugName: entry.Candidate,
            company: entry.Company,
            therapeuticArea: entry.TherapeuticArea1,
            indication: entry.Indication,
            stage: entry["Current Development Stage"]
        }));
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if isOpen}
<div 
    class="fixed inset-0 bg-black/40 z-[1001] flex justify-end cursor-pointer"
    on:click|self={onClose}
    transition:fly={{duration: 400, x: 200}}
>
    <div 
        class="relative w-[55vw] h-full bg-white shadow-lg z-[1001] overflow-y-auto border-l-[10px] cursor-default"
        on:click={handleDrawerClick}
        style="border-color: {color}"
    >
        <div class="header flex flex-row bg-slate-100 justify-between pl-2 pr-4 py-2 w-full">
            <button 
                class="flex gap-1 pr-3 pl-2 py-1 items-center justify-self-start text-xs font-semibold text-[#37587e] hover:text-emerald-800 hover:underline"
                on:click={handleClose}
            >
                <ArrowLeft size={12}/> Back
            </button>
        </div>

        <div class="drawer-content">
            <div class="header flex gap-4 my-4 pb-4 w-full items-baseline">
                <h2 class="text-2xl font-light text-slate-800">
                    {title}
                </h2>
            </div>

            <section>
                <Toolbar size="sm">
                    <ToolbarContent>
                        <ToolbarSearch bind:value={searchTerm} />
                    </ToolbarContent>
                </Toolbar>

                <DataTable
                    size="medium"
                    headers={headers[type]}
                    rows={filterData(mapDataToRows(data), searchTerm)}
                    sortable
                >
                    <svelte:fragment slot="cell" let:row let:cell>
                        {#if cell.key === 'drugName'}
                            <button 
                                class="flex items-center gap-2 text-[#37587e] hover:underline"
                                on:click={() => handleDrugClick(row)}
                            >
                                {cell.value}
                                <ArrowUpRight size={12} />
                            </button>
                        {:else}
                            {cell.value}
                        {/if}
                    </svelte:fragment>
                </DataTable>
            </section>
        </div>
    </div>
</div>
{/if}

<style>
    .drawer-content {
        padding: 1rem 1.5rem;
    }

    .header {
        border-bottom: 1px solid #e2e8f0;
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

    :global(.bx--data-table thead) {
        background-color: #eff7ff;
    }

    :global(.bx--data-table tbody tr:hover) {
        background-color: #f5f9ff;
    }
</style>
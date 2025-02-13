<!-- RPDPRVDrawer.svelte -->
<script lang="ts">
    import { fly } from 'svelte/transition';
    import { ArrowLeft, ArrowUpRight, BookmarkAdd, BookmarkFilled } from 'carbon-icons-svelte';
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
    import { trackedDrugs } from '$lib/trackingStores';
    import RPDOverlayDrawer from './RPDOverlayDrawer.svelte';

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let Company: string;
    export let drugName: string;
    export let year: string;
    export let therapeuticArea: string;
    export let entries: any[];
    export let color: string;
    export let currentStage: string = "TBD";
    export let rpddAwardDate: string = "";
    export let voucherAwardDate: string = "";
    export let indication: string = "";
    export let treatmentClass: string = "TBD";
    export let mechanismOfAction: string = "TBD";
    export let companyUrl: string = "";
    export let onShowCompanyDetail: (detail: any) => void;

    let searchTerm = "";
    $: isTracked = $trackedDrugs.some(drug => drug.drugName === drugName);

    let overlayData = {
        isOpen: false,
        title: '',
        data: [],
        type: null as any,
        color: ''
    };

    function toggleTracking() {
        if (isTracked) {
            trackedDrugs.update(drugs => 
                drugs.filter(d => d.drugName !== drugName)
            );
        } else {
            trackedDrugs.update(drugs => [...drugs, {
                drugName,
                Company,
                therapeuticArea,
                currentStage,
                indication,
                rpddAwardDate,
                voucherAwardDate,
                treatmentClass,
                mechanismOfAction,
                companyUrl,
                color
            }]);
        }
    }

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
        onShowCompanyDetail({
            Company,
            entries: entries.filter(entry => entry.Company === Company),
            color: '#37587e',
            companyUrl
        });
    }

    function showStageView(stage: string) {
        if (stage !== "TBD" && stage !== "N/A") {
            overlayData = {
                isOpen: true,
                title: `Development Stage: ${stage}`,
                data: entries.filter(entry => entry["Current Development Stage"] === stage),
                type: 'stage',
                color
            };
        }
    }

    function showTherapeuticAreaView(area: string) {
        if (area !== "TBD" && area !== "N/A") {
            overlayData = {
                isOpen: true,
                title: `Therapeutic Area: ${area}`,
                data: entries.filter(entry => entry.TherapeuticArea1 === area),
                type: 'therapeuticArea',
                color
            };
        }
    }

    function showIndicationView(indication: string) {
        if (indication !== "TBD" && indication !== "N/A") {
            overlayData = {
                isOpen: true,
                title: `Indication: ${indication}`,
                data: entries.filter(entry => entry.Indication === indication),
                type: 'indication',
                color
            };
        }
    }

    function showTreatmentClassView(treatmentClass: string) {
        if (treatmentClass !== "TBD" && treatmentClass !== "N/A") {
            overlayData = {
                isOpen: true,
                title: `Treatment Class: ${treatmentClass}`,
                data: entries.filter(entry => entry.Class1 === treatmentClass),
                type: 'treatmentClass',
                color
            };
        }
    }

    function showMOAView(moa: string) {
        if (moa !== "TBD" && moa !== "N/A") {
            overlayData = {
                isOpen: true,
                title: `Mechanism of Action: ${moa}`,
                data: entries.filter(entry => entry.MOA === moa),
                type: 'moa',
                color
            };
        }
    }

    function formatDate(date: string): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                class="flex gap-1 pr-3 pl-2 py-1 items-center justify-self-start text-xs font-semibold text-[#37587e] hover:text-emerald-800 hover:underline"
                on:click={handleClose}
                in:fly={{duration: 300}}
            >
                <ArrowLeft size={12}/> Back
            </button>
            
            <button 
                class="flex gap-2 px-3 py-2 items-center justify-self-start text-xs font-semibold text-gray-100 transition-all duration-300 ease-in-out {isTracked ? 'bg-emerald-600' : 'bg-[#37587e] hover:bg-green-800'}"
                on:click={toggleTracking}
                in:fly={{duration: 300}}
            >
                {#if isTracked}
                    <BookmarkFilled class="transition-transform" />
                {:else}
                    <BookmarkAdd class="transition-transform" /> Track
                {/if}
            </button>
        </div>

        <div class="drawer-content">
            <h3 class="text-[9.725px] font-semibold text-slate-800">
                {year}
            </h3>

            <div class="header flex gap-4 my-4 pb-4 w-full items-baseline justify-between">
                <h2 class="text-2xl max-w-96 capitalize font-light text-slate-800" 
                    in:fly={{duration: 300}}>
                    {drugName}
                </h2>
                <button 
                    class="flex text-sm capitalize gap-1 font-semibold text-slate-800 hover:text-emerald-600"
                    on:click={handleCompanyClick}
                    in:fly={{duration: 300}}
                >
                    {Company} <ArrowUpRight size={12}/>
                </button>
            </div>

            <!-- Timeline Information Section -->
            <section class="main-section mb-8">
                <h3 class="section-title text-lg font-base text-slate-800 mt-6 mb-4">
                    Timeline Information
                </h3>
                <table class="w-full align-baseline">
                    <tbody class="min-w-full">
                        <tr class="flex w-full align-baseline">
                            <div class="flex align-baseline w-5/12 gap-2">                    
                                <p class="text-[9.25px] text-slate-500 font-bold tracking-wide align-baseline uppercase">Current Stage</p>
                            </div>
                            <div class="flex justify-between w-8/12 gap-2">                    
                                <p class="text-ellipsis align-baseline text-sm text-slate-800 font-base capitalize overflow-hidden tracking-wide">
                                    {currentStage}
                                </p>
                                {#if currentStage !== "TBD" && currentStage !== "N/A"}
                                    <button 
                                        class="flex gap-1 px-3 py-1 items-center bg-[#37587e] rounded text-xs font-semibold text-gray-100 hover:bg-green-800"
                                        on:click={() => showStageView(currentStage)}
                                    >
                                        All <ArrowUpRight size={12} />
                                    </button>
                                {/if}
                            </div>
                        </tr>
                        <tr class="flex w-full align-baseline">
                            <div class="flex align-baseline w-5/12 gap-2">                    
                                <p class="text-[9.25px] text-slate-500 font-bold tracking-wide align-baseline uppercase">RPDD Award Date</p>
                            </div>
                            <div class="flex justify-items-stretch w-8/12 gap-2">                    
                                <p class="text-ellipsis align-baseline text-sm text-slate-800 font-base capitalize overflow-hidden tracking-wide">
                                    {rpddAwardDate || 'Not Available'}
                                </p>
                            </div>
                        </tr>
                        <tr class="flex w-full align-baseline">
                            <div class="flex align-baseline w-5/12 gap-2">                    
                                <p class="text-[9.25px] text-slate-500 font-bold tracking-wide align-baseline uppercase">Est. Next Milestone</p>
                            </div>
                            <div class="flex justify-items-stretch w-8/12 gap-2">                    
                                <p class="text-ellipsis align-baseline text-sm text-slate-800 font-base overflow-hidden tracking-wide">
                                    {'XYZ months' || 'Not Available'}
                                </p>
                            </div>
                        </tr>
                        <tr class="flex w-full align-baseline">
                            <div class="flex align-baseline w-5/12 gap-2">                    
                                <p class="text-[9.25px] text-slate-500 font-bold tracking-wide align-baseline uppercase">Voucher Award Date</p>
                            </div>
                            <div class="flex justify-items-stretch w-8/12 gap-2">                    
                                <p class="text-ellipsis align-baseline text-sm text-slate-800 font-base capitalize overflow-hidden tracking-wide">
                                    {voucherAwardDate || 'Not yet applicable'}
                                </p>
                            </div>
                        </tr>
                        <tr class="flex w-full align-baseline">
                            <div class="flex align-baseline w-5/12 gap-2">                    
                                <p class="text-[9.25px] text-slate-500 font-bold tracking-wide align-baseline uppercase">Est. Approval</p>
                            </div>
                            <div class="flex justify-items-stretch w-8/12 gap-2">                    
                                <p class="text-ellipsis align-baseline text-sm text-slate-800 font-base overflow-hidden tracking-wide">
                                    {'XYZ months' || 'Not Available'}
                                </p>
                            </div>
                        </tr>
                    </tbody>
                </table>
            </section>

            <!-- Disease Information Section -->
            <section class="main-section mb-8">
                <h3 class="section-title text-lg font-base text-slate-800 mt-6 mb-4">
                    Disease Information
                </h3>
                <table class="w-full align-baseline">
                    <tbody class="min-w-full">
                        <tr class="flex w-full align-baseline">
                            <div class="flex align-baseline w-5/12 gap-2">                    
                                <p class="text-[9.25px] text-slate-500 font-bold tracking-wide align-baseline uppercase">Therapeutic Area</p>
                            </div>
                            <div class="flex justify-between w-8/12 gap-2">                    
                                <p class="text-ellipsis align-baseline text-sm text-slate-800 font-base capitalize overflow-hidden tracking-wide">
                                    {therapeuticArea}
                                </p>
                                {#if therapeuticArea !== "TBD" && therapeuticArea !== "N/A"}
                                    <button 
                                        class="flex gap-1 px-3 py-1 items-center bg-[#37587e] rounded text-xs font-semibold text-gray-100 hover:bg-green-800"
                                        on:click={() => showTherapeuticAreaView(therapeuticArea)}
                                    >
                                        All <ArrowUpRight size={12} />
                                    </button>
                                {/if}
                            </div>
                        </tr>
                        <tr class="flex w-full align-baseline">
                            <div class="flex align-baseline w-5/12 gap-2">                    
                                <p class="text-[9.25px] text-slate-500 font-bold tracking-wide align-baseline uppercase">Indication</p>
                            </div>
                            <div class="flex justify-between w-8/12 gap-2">                    
                                <p class="text-ellipsis align-baseline text-sm text-slate-800 font-base capitalize overflow-hidden tracking-wide">
                                    {indication}
                                </p>
                                {#if indication !== "TBD" && indication !== "N/A"}
                                    <button 
                                        class="flex gap-1 px-3 py-1 items-center bg-[#37587e] rounded text-xs font-semibold text-gray-100 hover:bg-green-800"
                                        on:click={() => showIndicationView(indication)}
                                    >
                                        All <ArrowUpRight size={12} />
                                    </button>
                                {/if}
                            </div>
                        </tr>
                    </tbody>
                </table>
            </section>

            <!-- Treatment Information Section -->
            <section class="main-section mb-8">
                <h3 class="section-title text-lg font-base text-slate-800 mt-6 mb-4">
                    Treatment Information
                </h3>
                <table class="w-full align-baseline">
                    <tbody class="min-w-full">
                        <tr class="flex w-full align-baseline">
                            <div class="flex align-baseline w-5/12 gap-2">                    
                                <p class="text-[9.25px] text-slate-500 font-bold tracking-wide align-baseline uppercase">Treatment Class</p>
                            </div>
                            <div class="flex justify-between w-8/12 gap-2">                    
                                <p class="text-ellipsis align-baseline text-sm text-slate-800 font-base capitalize overflow-hidden tracking-wide">
                                    {treatmentClass}
                                </p>
                                {#if treatmentClass !== "TBD" && treatmentClass !== "N/A"}
                                    <button 
                                        class="flex gap-1 px-3 py-1 items-center bg-[#37587e] rounded text-xs font-semibold text-gray-100 hover:bg-green-800"
                                        on:click={() => showTreatmentClassView(treatmentClass)}
                                    >
                                        All <ArrowUpRight size={12} />
                                    </button>
                                {/if}
                            </div>
                        </tr>
                        <tr class="flex w-full align-baseline">
                            <div class="flex align-baseline w-5/12 gap-2">                    
                                <p class="text-[9.25px] text-slate-500 font-bold tracking-wide align-baseline uppercase">Mechanism of Action</p>
                            </div>
                            <div class="flex justify-between w-8/12 gap-2">                    
                                <p class="text-ellipsis align-baseline text-sm text-slate-800 font-base capitalize overflow-hidden tracking-wide">
                                    {mechanismOfAction}
                                </p>
                                {#if mechanismOfAction !== "TBD" && mechanismOfAction !== "N/A"}
                                    <button 
                                        class="flex gap-1 px-3 py-1 items-center bg-[#37587e] rounded text-xs font-semibold text-gray-100 hover:bg-green-800"
                                        on:click={() => showMOAView(mechanismOfAction)}
                                    >
                                        All <ArrowUpRight size={12} />
                                    </button>
                                {/if}
                            </div>
                        </tr>
                    </tbody>
                </table>
            </section>

            <!-- Related RPDDs Section -->
            <section>
                <h3 class="text-lg font-base text-slate-800 mt-6 mb-4" 
                    in:fly={{duration: 300}}>
                    Related RPDDs in {therapeuticArea}
                </h3>
                
                <Toolbar size="sm">
                    <ToolbarContent>
                        <ToolbarSearch bind:value={searchTerm} />
                    </ToolbarContent>
                </Toolbar>

                <DataTable
                    size="medium"
                    headers={[
                        { key: 'year', value: 'Year' },
                        { key: 'drugName', value: 'Drug Name' },
                        { key: 'company', value: 'Company' }
                    ]}
                    rows={filterData(entries.map(entry => ({
                        id: entry.Candidate,
                        year: entry["RPDD Year"],
                        drugName: entry.Candidate,
                        company: entry.Company
                    })), searchTerm)}
                    sortable
                >
                    <svelte:fragment slot="cell" let:row let:cell>
                        {#if cell.key === 'drugName'}
                            <button 
                                class="flex items-center gap-2 text-[#37587e] hover:underline"
                                on:click={() => onShowCompanyDetail({
                                    ...entries.find(e => e.Candidate === row.drugName),
                                    color: '#37587e'
                                })}
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

<RPDOverlayDrawer 
    bind:isOpen={overlayData.isOpen}
    title={overlayData.title}
    data={overlayData.data}
    type={overlayData.type}
    color={overlayData.color}
    onClose={() => overlayData.isOpen = false}
/>

<style>
    .drawer-content {
        padding: 1rem 1.5rem;
    }

    .main-section {
        margin-top: 1.25rem;
    }

    .header {
        border-bottom: 1px solid #e2e8f0;
    }

    .section-title {
        padding-bottom: .25rem;
        border-bottom: .525px dotted #666666;
    }

    tr {
        display: flex;
        flex-direction: row;
        border-bottom: .5px dotted #e2e8f0;
        justify-content: space-between;
        align-items: center;
        gap: 2rem;
        min-height: 3rem;
        padding: 0.5rem 0;
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
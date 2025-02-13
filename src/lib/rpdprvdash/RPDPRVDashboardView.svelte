<!-- RPDPRVDashboardView.svelte -->
<script lang="ts">
    import { fly } from 'svelte/transition';
    import { ArrowLeft, BookmarkFilled, Close } from 'carbon-icons-svelte';
    import { trackedDrugs } from '$lib/trackingStores';

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let onShowDrugDetail: (detail: any) => void;

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

    function handleDrugClick(drug: any) {
        onShowDrugDetail({
            drugName: drug.drugName,
            Company: drug.Company,
            therapeuticArea: drug.therapeuticArea,
            currentStage: drug.currentStage,
            indication: drug.indication,
            rpddAwardDate: drug.rpddAwardDate,
            voucherAwardDate: drug.voucherAwardDate,
            treatmentClass: drug.treatmentClass,
            mechanismOfAction: drug.mechanismOfAction,
            companyUrl: drug.companyUrl,
            color: drug.color,
            entries: []
        });
    }

    function removeFromTracking(drugName: string, event: MouseEvent) {
        event.stopPropagation();
        trackedDrugs.update(drugs => drugs.filter(d => d.drugName !== drugName));
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div 
    class="fixed inset-0 w-full min-w-[400px] h-full bg-black/60 z-[1000] flex justify-end cursor-pointer"
    on:click|self={onClose}
    transition:fly={{duration: 525}}
>
    <div 
        class="drawer relative w-[62.25vw] h-full bg-white shadow-lg z-[1000] overflow-y-auto border-l-[10px] pl-2 pr-2 py-1 cursor-default"
        on:click={handleDrawerClick}
        style="border-color: #37587e"
    >
        <div class="drawer-content">
            <button 
                class="flex mt-4 mb-8 gap-1 pr-3 pl-2 py-1 items-center justify-self-start bg-[#37587e] rounded-full text-xs font-semibold text-gray-100 hover:bg-green-800"
                on:click={handleClose}
                in:fly={{duration: 300}}
            >
                <ArrowLeft /> Back
            </button>

            <h2 class="text-4xl font-light text-slate-800 mb-8">
                <span class="inline-flex items-center gap-2">
                    <BookmarkFilled class="text-emerald-600" /> 
                    Tracked Drugs
                </span>
            </h2>

            {#if $trackedDrugs.length === 0}
                <div class="text-center text-gray-500 py-8">
                    <p>No drugs tracked yet. Click the track button on any drug to add it to your dashboard.</p>
                </div>
            {:else}
                <div class="grid grid-cols-1 gap-4">
                    {#each $trackedDrugs as drug}
                        <div 
                            class="card hover:shadow-md transition-shadow cursor-pointer group relative"
                            on:click={() => handleDrugClick(drug)}
                        >
                            <button
                                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                on:click={(e) => removeFromTracking(drug.drugName, e)}
                            >
                                <Close class="text-gray-400 hover:text-red-500" size={16} />
                            </button>
                            <div class="card flex justify-between items-start">
                                <div>
                                    <h3 class="text-lg font-semibold">{drug.drugName}</h3>
                                    <p class="text-sm text-gray-600">{drug.Company}</p>
                                    <p class="text-sm text-gray-500">{drug.therapeuticArea}</p>
                                    <p class="text-sm text-gray-400">{drug.indication}</p>
                                </div>
                                <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                    {drug.currentStage}
                                </span>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .drawer-content {
        padding: 2rem;
    }

    .card {
        border-bottom: 1px solid #e5e7eb;
        transition: all 0.2s ease-in-out;
    }

    .card:hover {
        transform: translateY(-2px);
    }
</style>
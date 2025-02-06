<script lang="ts">
    import { diseases } from '$lib/data/diseases';
    import { createEventDispatcher } from 'svelte';
    import { ChevronDown } from 'lucide-svelte';
    import { Motion, useAnimation } from "svelte-motion";

    const dispatch = createEventDispatcher();
    let isOpen = false;
    let tooltipVisible = false;
    let tooltipPosition = { x: 0, y: 0 };
    
    let selectedDisease = {
        id: 'cidp',
        name: 'CIDP',
        description: 'Chronic inflammatory demyelinating polyneuropathy'
    };

    function handleDiseaseSelect(disease) {
        if (disease.id === 'cidp') {
            selectedDisease = disease;
            isOpen = false;
            dispatch('diseaseChange', disease);
        }
    }

    function showTooltip(event, disease) {
        if (disease.id !== 'cidp') {
            tooltipVisible = true;
            // Position tooltip near the cursor but slightly offset
            tooltipPosition = {
                x: event.clientX + 10,
                y: event.clientY + 10
            };
        }
    }

    function hideTooltip() {
        tooltipVisible = false;
    }

    const dropdownVariants = {
        open: {
            clipPath: "inset(0% 0% 0% 0% round 8px)",
            transition: { type: "spring", bounce: 0 }
        },
        closed: {
            clipPath: "inset(10% 50% 90% 50% round 8px)",
            transition: { duration: 0.3 }
        }
    };
</script>

<div class="relative inline-block">
    <button
        on:click={() => isOpen = !isOpen}
        class="inline-flex items-baseline gap-1 px-1 mx-1 font-serif font-medium text-emerald-800 hover:bg-orange-300 transition-colors" 
        style="border-bottom: 1px solid #161616;"
    >

        {selectedDisease.name}
        <ChevronDown class="h-4 w-4" />
    </button>

    <Motion
        animate={isOpen ? "open" : "closed"}
        variants={dropdownVariants}
        initial="closed"
    >
        {#if isOpen}
            <div class="menu absolute z-50 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200">
                {#each diseases as category}
                    <div class="px-2 py-1.5">
                        <div class="text-xs font-semibold text-slate-500">
                            {category.category}
                        </div>
                        {#each category.items as disease}
                            <button
                                class="w-full text-left px-2 py-1.5 hover:bg-emerald-200 rounded-md transition-colors"
                                class:cursor-not-allowed={disease.id !== 'cidp'}
                                class:opacity-50={disease.id !== 'cidp'}
                                on:click={() => handleDiseaseSelect(disease)}
                                on:mouseenter={(e) => showTooltip(e, disease)}
                                on:mouseleave={hideTooltip}
                            >
                                <div class="text-sm font-medium">{disease.name}</div>
                                {#if disease.description}
                                    <div class="text-xs text-slate-500">{disease.description}</div>
                                {/if}
                            </button>
                        {/each}
                    </div>
                    {#if category !== diseases[diseases.length - 1]}
                        <div class="h-px bg-slate-200" />
                    {/if}
                {/each}
            </div>
        {/if}
    </Motion>
</div>

{#if tooltipVisible}
    <div 
        class="fixed z-[60] bg-slate-900 font-sans text-left text-white text-xs max-w-xs px-4 py-2 shadow-lg"
        style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px"
    >
        Contact team@patiently.studio for early access to our complete disease database.
    </div>
{/if}

<style>
    /* Ensure tooltip transitions smoothly */
    div {
        transition: opacity 150ms ease-in-out;
    }
.menu {
    max-height: 27.25rem;
    overflow-y: auto;
    border: .5px dotted #161616;
}
</style>
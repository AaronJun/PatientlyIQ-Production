<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import CompositeScoreCalculator from './CompositeScoreCalculator.svelte';
    import { onMount } from 'svelte';
    
    export let isOpen: boolean;
    export let onClose: () => void;
    export let selectedCountry = null;
    
    const dispatch = createEventDispatcher();
    let drawerElement: HTMLDivElement;

    function handleScoreUpdate(event) {
        dispatch('scoreUpdated', event.detail);
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && isOpen) {
            onClose();
        }
    }

    function handleClickOutside(event: MouseEvent) {
        if (drawerElement && !drawerElement.contains(event.target as Node) && isOpen) {
            onClose();
        }
    }

    onMount(() => {
        document.addEventListener('keydown', handleKeydown);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleKeydown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    });
</script>

{#if isOpen}
    <div 
        class="fixed inset-0 bg-black bg-opacity-80 z-40"
        transition:fly={{ duration: 200, opacity: 0.5 }}
    > 
        <div
            bind:this={drawerElement}
            class="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-slate-50 shadow-xl z-50 overflow-y-auto"
            transition:fly={{ x: 400, duration: 300, easing: quintOut }}
        >
            <div class="sticky top-0 z-10 bg-slate-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <button 
                    class="rounded-md h-4 w-4 flex items-center justify-center text-slate-700 hover:bg-gray-100"
                    on:click={onClose}
                >
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="p-4">
                <CompositeScoreCalculator 
                    {selectedCountry}
                    on:scoreUpdated={handleScoreUpdate} 
                />
            </div>
        </div>
    </div>
{/if}

<style>
    /* Prevent body scroll when drawer is open */
    :global(body.drawer-open) {
        overflow: hidden;
        z-index: 99;
    }
</style>
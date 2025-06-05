<script lang="ts">
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { onMount } from 'svelte';
    import sakigakeListData from '../../routes/KYBORAdemo/sakigakelist.json';

    export let isOpen: boolean = false;
    export let onClose: () => void;

    let drawerElement: HTMLDivElement;

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
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        transition:fly={{ duration: 200, opacity: 0.5 }}
    > 
        <div
            bind:this={drawerElement}
            class="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-2/3 xl:w-1/2 bg-slate-50 shadow-xl z-50 overflow-y-auto"
            transition:fly={{ x: 400, duration: 300, easing: quintOut }}
        >
            <div class="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 class="text-xl text-sky-700">
                    <span class="font-serif font-semibold italic">Sakigake</span> Designated Products
                </h2>
                <button 
                    class="rounded-md p-2 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    on:click={onClose}
                >
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="p-6">
                <div class="mb-6">
                    <h3 class="text-sm font-medium text-slate-700 mb-2">About Sakigake Designation</h3>
                    <p class="text-gray-600">
                        Products that have received <span class="font-mono font-bold text-sky-900">Sakigake</span> (pioneer) designation from Japan's MHLW for accelerated review and approval. The program aims to fast-track innovative treatments for serious, unmet medical needs in Japan.
                    </p>
                </div>

                <div class="space-y-4">
                    <h3 class="text-sm font-medium text-slate-700 mb-4">Designated Products</h3>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full border-collapse border border-slate-300 bg-white rounded-lg overflow-hidden">
                            <thead>
                                <tr class="bg-slate-100">
                                    <th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700 text-sm">
                                        #
                                    </th>
                                    <th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700 text-sm">
                                        Drug Name
                                    </th>
                                    <th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700 text-sm">
                                        Indication
                                    </th>
                                    <th class="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-700 text-sm">
                                        Company
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each sakigakeListData as item, index}
                                    <tr class="hover:bg-slate-50 transition-colors">
                                        <td class="border border-slate-300 px-4 py-3 text-sm text-slate-600">
                                            {index + 1}
                                        </td>
                                        <td class="border border-slate-300 px-4 py-3">
                                            <span class="font-mono font-semibold text-sm text-sky-900">
                                                {item.drug}
                                            </span>
                                        </td>
                                        <td class="border border-slate-300 px-4 py-3 text-sm text-slate-700">
                                            {item.indication}
                                        </td>
                                        <td class="border border-slate-300 px-4 py-3 text-sm text-slate-700">
                                            {item.company}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="mt-8 p-4 rounded-lg border border-sky-200 bg-sky-50">
                    <h4 class="text-sm font-medium text-slate-700 mb-2">
                        Program Benefits
                    </h4>
                    <p class="text-sm text-slate-600">
                        <span class="font-semibold">Sakigake</span> designation provides accelerated review (6 months vs 12 months), priority consultations with PMDA, potential price premiums, and extended market exclusivity. However, designation does not guarantee approval.
                    </p>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Prevent body scroll when drawer is open */
    :global(body.drawer-open) {
        overflow: hidden;
    }
</style> 
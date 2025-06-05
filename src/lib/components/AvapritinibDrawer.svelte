<script lang="ts">
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { onMount } from 'svelte';

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let timelineData: any = null;

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

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    function getRegionColor(region: string): string {
        const colorMap: { [key: string]: string } = {
            'United States': '#1f77b4',
            'European Union': '#ff7f0e', 
            'China': '#d62728'
        };
        return colorMap[region] || '#2ca02c';
    }
</script>

{#if isOpen && timelineData}
    <div 
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        transition:fly={{ duration: 200, opacity: 0.5 }}
    > 
        <div
            bind:this={drawerElement}
            class="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-slate-50 shadow-xl z-50 overflow-y-auto"
            transition:fly={{ x: 400, duration: 300, easing: quintOut }}
        >
            <div class="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 class="text-xl text-orange-700">
                    <span class="font-serif font-semibold italic capitalize">{timelineData.drug}</span> Approval Timeline
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
                    <h3 class="text-sm font-medium text-slate-700 mb-2">Drug Information</h3>
                    <p class="text-gray-600">
                        <span class="uppercase font-bold text-orange-900">{timelineData.drug}</span> is a targeted therapy that has received regulatory approvals across multiple regions for various indications.
                    </p>
                </div>

                <div class="space-y-4">
                    <h3 class="text-sm font-medium text-slate-700 mb-2">Approval Timeline</h3>
                    
                    {#each timelineData.approval_history as approval, index}
                        <div class="relative">
                            <!-- Timeline line -->
                            {#if index < timelineData.approval_history.length - 1}
                                <div class="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                            {/if}
                            
                            <!-- Timeline item -->
                            <div class="flex items-start space-x-4">
                                <div 
                                    class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                    style="background-color: {getRegionColor(approval.region)}"
                                >
                                    {index + 1}
                                </div>
                                
                                <div class="flex-1 min-w-0">
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        <div class="flex items-center justify-between mb-2">
                                            <h4 class="text-sm font-medium text-gray-900">
                                                
                                                <p class="text-sm text-gray-600 mb-2">
                                                    <strong>Date:</strong> {formatDate(approval.date)}
                                                </p>
                                                {approval.region}
                                            </h4>
                                            <span class="text-xs text-gray-500 font-mono">
                                                {approval.agency}
                                            </span>
                                        </div>
                                        
                                        <p class="text-sm text-gray-600">
                                            <strong>Indication:</strong> {approval.indication}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>

                <div class="mt-8 p-4 rounded-lg border border-orange-200">
                    <h4 class="text-sm font-medium text-slate-700 mb-2">
                        Japan Status
                    </h4>
                    <p class="text-sm">
                        Despite approvals in the US (2020), EU (2020), and China (2021), 
                        <span class="font-mono font-bold">{timelineData.drug}</span> has still not been approved in Japan, 
                        highlighting the drug lag issue discussed in this article.
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
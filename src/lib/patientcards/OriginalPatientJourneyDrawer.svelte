<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import SentimentRadar from './SentimentRadar.svelte';
    import JourneyMap from './PatientJourneyMap.svelte';

    export let isOpen: boolean = false;
    export let patient: any;
    export let onClose: () => void;
    export let onNext: () => void;
    export let onPrev: () => void;

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') onClose();
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

{#if isOpen}
    <!-- Backdrop and drawer wrapper with high z-index -->
    <div 
        class="fixed inset-0 z-[9999] isolate"
        transition:fade={{ duration: 200 }}
    >
        <!-- Backdrop with blur -->
        <div 
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            on:click={onClose}
        />
        
        <!-- Drawer panel -->
        <div 
            class="absolute right-0 top-0 h-full w-full max-w-3xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden flex flex-col"
            on:click|stopPropagation
            transition:fly={{ x: 100, duration: 300 }}
        >
            <!-- Scrollable content area -->
            <div class="flex-1 overflow-y-auto">
                <div class="p-8 space-y-8">
                    <!-- Header section -->
                    <div class="relative">
                        <!-- Close button -->
                        <button 
                            class="absolute -right-4 -top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                            on:click={onClose}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>

                        <!-- Patient info -->
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff5151] to-[#ff8151] flex items-center justify-center text-white">
                                <span class="text-lg font-serif">{patient.name[0]}</span>
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{patient.name}</h2>
                                <p class="text-[#ff5151]">{patient.persona} • {patient.age}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Quote section -->
                    <div class="bg-gray-50 dark:bg-neutral-800 rounded-xl p-6">
                        <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Patient Quote</h3>
                        <p class="text-gray-600 dark:text-gray-300 italic">"{patient.quote}"</p>
                    </div>

                    <!-- Sentiment Analysis -->
                    <div>
                        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Sentiment Analysis</h3>
                        <SentimentRadar {patient} />
                    </div>

                    <!-- Metrics Grid -->
                    <div class="grid grid-cols-3 gap-4">
                        <div class="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                            <div class="text-sm text-gray-500 dark:text-gray-400">Trial Sentiment</div>
                            <div class="text-xl font-bold text-gray-900 dark:text-gray-100">{patient['trial-sentiment']}/5</div>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                            <div class="text-sm text-gray-500 dark:text-gray-400">Treatment Sentiment</div>
                            <div class="text-xl font-bold text-gray-900 dark:text-gray-100">{patient['treatment-sentiment']}/5</div>
                        </div>
                        <div class="p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl">
                            <div class="text-sm text-gray-500 dark:text-gray-400">Medical Literacy</div>
                            <div class="text-xl font-bold text-gray-900 dark:text-gray-100">{patient['medical-literacy']}/5</div>
                        </div>
                    </div>

                    <!-- Journey Map -->
                    <div>
                        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Patient Journey</h3>
                        <div class="bg-gray-50 dark:bg-neutral-800 rounded-xl p-6">
                            <JourneyMap journey={patient.journey} />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation footer (sticky) -->
            <div class="sticky bottom-0 flex justify-between items-center p-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800">
                <button
                    on:click={onPrev}
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6"/>
                    </svg>
                    <span class="text-sm">Previous Patient</span>
                </button>
                <button
                    on:click={onNext}
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <span class="text-sm">Next Patient</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Prevent body scroll when drawer is open */
    :global(body:has(.drawer-open)) {
        overflow: hidden;
    }
</style>
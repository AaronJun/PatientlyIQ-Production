<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import SentimentRadar from './SentimentRadar.svelte';

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
    <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        on:click={onClose}
        transition:fade
    >
        <div 
            class="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-neutral-900 shadow-xl p-8 overflow-y-auto"
            on:click|stopPropagation
            transition:fly={{ x: 100, duration: 300 }}
        >
            <button 
                class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                on:click={onClose}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>

            <div class="mb-8">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff5151] to-[#ff8151] flex items-center justify-center text-white">
                        <span class="text-lg font-serif">{patient.name[0]}</span>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold">{patient.name}</h2>
                        <p class="text-[#ff5151]">{patient.persona} • {patient.age}</p>
                    </div>
                </div>
            </div>

            <div class="space-y-8">
                <div>
                    <h3 class="text-lg font-semibold mb-4">Patient Quote</h3>
                    <p class="text-gray-600 dark:text-gray-300">{patient.quote}</p>
                </div>

                <div>
                    <h3 class="text-lg font-semibold mb-4">Sentiment Analysis</h3>
                    <SentimentRadar {patient} />
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <div class="p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                        <div class="text-sm text-gray-500 dark:text-gray-400">Trial Sentiment</div>
                        <div class="text-xl font-bold">{patient['trial-sentiment']}/5</div>
                    </div>
                    <div class="p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                        <div class="text-sm text-gray-500 dark:text-gray-400">Treatment Sentiment</div>
                        <div class="text-xl font-bold">{patient['treatment-sentiment']}/5</div>
                    </div>
                    <div class="p-4 bg-gray-100 dark:bg-neutral-800 rounded-lg">
                        <div class="text-sm text-gray-500 dark:text-gray-400">Medical Literacy</div>
                        <div class="text-xl font-bold">{patient['medical-literacy']}/5</div>
                    </div>
                </div>
            </div>

            <div class="flex justify-between mt-8">
                <button
                    on:click={onPrev}
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6"/>
                    </svg>
                </button>
                <button
                    on:click={onNext}
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
{/if}
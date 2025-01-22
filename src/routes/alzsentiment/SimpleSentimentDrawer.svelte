<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';
    import insightData from '$lib/data/diseaseInsights.json';
    import TopTopicsChart from './TopTopicsChart.svelte';
    import TopNegativeTopicsChart from './TopNegativeTopicsChart.svelte';
    import wordCloudData from '$lib/data/wordCloudData.json';

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let disease: string;
    export let sentiments: Record<string, number>;
    export let currentTopicData: Array<{topic: string, score: number}>;
    export let selectedDisease: string;

    const ANIMATION_DURATION = 400;
    const INITIAL_TERMS_COUNT = 10;

    let isTermsExpanded = false;
    
    $: totalEntries = Object.values(sentiments).reduce((sum, val) => sum + val, 0);
    $: currentInsights = insightData.diseaseInsights[selectedDisease]?.keyInsights;
    $: termData = wordCloudData.wordCloudData[selectedDisease]?.sort((a, b) => b.value - a.value) || [];
    $: visibleTerms = isTermsExpanded ? termData : termData.slice(0, INITIAL_TERMS_COUNT);
    $: remainingTermsCount = Math.max(0, termData.length - INITIAL_TERMS_COUNT);
</script>

<svelte:window on:keydown={event => event.key === 'Escape' && isOpen && onClose()}/>

{#if isOpen}
<div 
    class="drawer-backdrop"
    transition:fade={{duration: ANIMATION_DURATION / 2}}
>
    <div 
        class="drawer" 
        on:click|stopPropagation
        transition:fly={{
            x: 500,
            duration: ANIMATION_DURATION,
            easing: cubicOut
        }}
    >        
        <button class="close-button" on:click={onClose}>&times;</button>

        <div class="drawer-content">
            <h2 class="text-xl font-light mb-8">
                Analysis for <span class="text-[#ff5151] font-normal">{disease}</span>
            </h2>
            
            {#if currentInsights}
                <div class="insights-section mb-12">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Patient Concerns
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        {currentInsights.patientConcerns}
                    </p>
                </div>
                <div class="insights-section mb-12">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Caregiver Impact
                    </h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        {currentInsights.caregiverImpact}
                    </p>
                </div>
            {/if}

            <div class="mt-6">
                <div class="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    Total Entries: {totalEntries}
                </div>
                
                <div class="space-y-4">
                    {#each Object.entries(sentiments) as [sentiment, count]}
                        <div class="border-t border-dotted border-[#ff5151] pt-4">
                            <div class="flex justify-between items-center">
                                <span class="text-xs font-medium capitalize">
                                    {sentiment.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span class="text-[#ff5151] text-sm font-mono">
                                    {count} ({((count / totalEntries) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="mt-16">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Common Terms
                    </h3>
                    {#if termData.length > INITIAL_TERMS_COUNT}
                        <button 
                            class="text-xs bg-[#ff1515] text-white hover:bg-orange-400 transition-colors flex items-center gap-2 p-2 pl-4 rounded-full"
                            on:click={() => isTermsExpanded = !isTermsExpanded}
                        >
                            {#if isTermsExpanded}
                                <span>Show Less</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m18 15-6-6-6 6"/>
                                </svg>
                            {:else}
                                <span>Show {remainingTermsCount} More</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m6 9 6 6 6-6"/>
                                </svg>
                            {/if}
                        </button>
                    {/if}
                </div>

                <div class="terms-grid">
                    {#each visibleTerms as term}
                        <div class="term-item" transition:fade={{duration: 150}}>
                            <span class="term-text text-xs text-gray-600 dark:text-gray-300">{term.text}</span>
                            <div class="term-bar" style="--value: {term.value}%">
                                <span class="term-value">{term.value}</span>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
{/if}

<style>
    .drawer-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 1000;
        display: flex;
        justify-content: flex-end;
    }

    .drawer {
        width: 55vw;
        height: 100%;
        background-color: hsl(var(--background));
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        overflow-y: auto;
        border-left: 4px solid #ff5151;
        padding: 1.5rem;
    }

    .close-button {
        position: absolute;
        right: 1rem;
        top: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #878787;
        font-size: 1.35rem;
    }

    .drawer-content {
        padding: 1rem 0;
    }

    .terms-grid {
        display: grid;
        gap: 0.5rem;
    }

    .term-item {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        border-radius: 0.25rem;
        background: rgba(255, 81, 81, 0.05);
    }

    .term-text {
        min-width: 120px;
        font-size: 0.875rem;
    }

    .term-bar {
        flex-grow: 1;
        height: 12px;
        background: linear-gradient(to right, rgba(255, 81, 81, 0.2) var(--value), transparent var(--value));
        border-radius: 3px;
        position: relative;
        margin-left: 2rem;
        margin-right: 4rem;
    }

    .term-value {
        position: absolute;
        right: -20px;
        top: 50%;
        padding-left: 5rem;
        transform: translateY(-50%);
        font-size: 0.75rem;
        color: #ff6d6d;
    }

    .terms-grid {
        transition: height 0.3s ease;
    }
</style>
<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let disease: string;
    export let sentiments: Record<string, number>;

    export let currentTopicData: Array<{topic: string, score: number}>;

    const ANIMATION_DURATION = 525;
    $: totalEntries = Object.values(sentiments).reduce((sum, val) => sum + val, 0);
</script>

<svelte:window on:keydown={event => event.key === 'Escape' && isOpen && onClose()}/>

{#if isOpen}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="drawer-backdrop"
     on:click={onClose} 
     transition:fly={{duration: ANIMATION_DURATION}}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="drawer" 
         on:click|stopPropagation
         transition:fly={{x: 200, duration: ANIMATION_DURATION, easing: circInOut}}>
        
        <button class="close-button" on:click={onClose}>&times;</button>

        <div class="drawer-content">
            <h2 class="text-xl font-light mb-4">
                Analysis for <span class="text-[#ff5151] font-normal">{disease}</span>
            </h2>
            
            <div class="mt-6">
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Total Entries: {totalEntries}
                </div>
                
                <div class="space-y-4">
                    {#each Object.entries(sentiments) as [sentiment, count]}
                        <div class="border-t border-dotted border-[#ff5151] pt-4">
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-medium capitalize">
                                    {sentiment.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span class="text-[#ff5151] font-mono">
                                    {count} ({((count / totalEntries) * 100).toFixed(1)}%)
                                </span>
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
        width: 24rem;
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
</style>
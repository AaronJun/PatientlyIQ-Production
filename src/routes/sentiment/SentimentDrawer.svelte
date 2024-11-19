// Update SentimentDrawer.svelte
<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
    import TimeSeriesChart from './TimeSeriesChart.svelte';

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let data: any;

    const ANIMATION_DURATION = 525;
    
    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            onClose();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="drawer-backdrop"
     on:click={onClose} 
     transition:fly={{duration: ANIMATION_DURATION}}>

    <div class="drawer" 
         on:click|stopPropagation
         transition:fly={{x: 100, duration: ANIMATION_DURATION, easing: circInOut}}>

        <button class="close-button" on:click={onClose}>&times;</button>

        <div class="drawer-content">
            <div class="view-header">
                <div class="mb-4 flex items-left gap-2">
                    <span class="font-mono text-xs text-gray-500 dark:text-gray-400">Analysis</span>
                </div>
                
                <h2 class="-translate-y-4 animate-fade-in antialiased text-balance bg-gradient-to-br from-gray-800 from-30% to-gray-500 bg-clip-text py-6 text-3xl font-extralight opacity-0 [--animation-delay:200ms] dark:from-white/80 dark:to-white/70">
                    {data.category}
                    <span class="font-serif subpixel-antialiased italic text-[#ff5151]">
                        Insights
                    </span>
                </h2>
                
                <p class="mb-12 -translate-y-4 animate-fade-in text-balance text-sm text-gray-600 opacity-0 [--animation-delay:400ms] dark:text-gray-400">
                    Based on {data.details.totalMentions.toLocaleString()} patient mentions
                </p>
            </div>

            <div class="table-container border-t border-dotted border-[#ff5151] pt-4">
                <h3 class="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">Sentiment Distribution</h3>
                <table>
                    <tbody>
                        {#each ['Positive', 'Neutral', 'Negative', 'Mixed'] as sentiment}
                            <tr>
                                <th class="label">{sentiment}</th>
                                <td>{data[sentiment.toLowerCase()]}%</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="table-container border-t border-dotted border-[#ff5151] pt-4">
                <h3 class="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">Top Terms</h3>
                <div class="terms-container">
                    {#each data.details.topTerms as term}
                        <span class="term-badge font-mono text-xs">{term}</span>
                    {/each}
                </div>
            </div>

            <div class="table-container border-t border-dotted border-[#ff5151] pt-4">
                <h3 class="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">Trend Analysis</h3>
                <TimeSeriesChart data={data.details.trends} />
            </div>
        </div>
    </div>
</div>

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
        position: relative;
        width: 50vw;
        height: 100%;
        background-color: hsl(var(--background));
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        overflow-y: auto;
        border-left: 5px solid #ff5151;
        padding: 2rem;
        box-sizing: border-box;
    }

    .drawer-content {
        padding: 3rem 2rem 5rem 1rem;
    }

    .close-button {
        position: absolute;
        right: 1rem;
        top: 3.5rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #878787;
        font-size: 1.35rem;
        font-weight: 400;
        font-family: "IBM Plex Mono", monospace;
        margin-top: 1rem;
        z-index: 1002;
        transition: color 0.2s ease;
    }

    .close-button:hover {
        color: #ff5151;
    }

    .view-header {
        border-bottom: 0.5px solid #292F58;
        padding-bottom: 1.725rem;
        margin-bottom: 2rem;
    }

    .table-container {
        margin: 2.25rem 0;
        min-height: 250px;
        overflow-y: auto;
        max-width: 95%;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th.label {
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.65rem;
        font-weight: 600;
        text-align: left;
        padding: 0.5rem 0;
        width: 150px;
        color: #7c7c7c;
        line-height: 1rem;
    }

    td {
        padding: 0.5rem 0;
        font-size: 0.75rem;
        line-height: 1rem;
        text-align: left;
        color: hsl(var(--foreground));
    }

    tr {
        border-bottom: 0.5px dotted #292F58;
    }

    .terms-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        padding: 0.5rem 0;
    }

    .term-badge {
        background-color: rgba(255, 81, 81, 0.1);
        color: #ff5151;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        border: 1px solid rgba(255, 81, 81, 0.2);
        transition: all 0.2s ease;
    }

    .term-badge:hover {
        background-color: rgba(255, 81, 81, 0.15);
    }

    :global(.dark) .drawer {
        background-color: hsl(var(--background));
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.3);
    }

    :global(.dark) td {
        color: hsl(var(--foreground));
    }

    :global(.dark) .term-badge {
        background-color: rgba(255, 81, 81, 0.15);
        border-color: rgba(255, 81, 81, 0.3);
    }

    :global(.dark) .term-badge:hover {
        background-color: rgba(255, 81, 81, 0.2);
    }

    @media (max-width: 768px) {
        .drawer {
            width: 100vw;
        }
    }
</style>
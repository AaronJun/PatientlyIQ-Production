<script lang="ts">
    export let words: Array<{ text: string; value: number }>;
    export let context: string;

    // Scale bubble sizes between min and max diameter
    $: processedWords = words.map(word => ({
        ...word,
        size: Math.max(60, Math.min(120, 60 + (word.value / 100) * 60)),
        opacity: 0.7 + (word.value / 100) * 0.3
    }));
</script>

<div class="bubble-chart-container">
    <h3 class="context-title">{context}</h3>
    <div class="bubble-chart">
        {#if words && words.length > 0}
            {#each processedWords as word}
                <div 
                    class="bubble"
                    style="
                        width: {word.size}px;
                        height: {word.size}px;
                        opacity: {word.opacity};
                    "
                >
                    <span class="bubble-text">{word.text}</span>
                    <span class="bubble-value">{word.value}</span>
                </div>
            {/each}
        {:else}
            <div class="no-data">No topics available</div>
        {/if}
    </div>
</div>

<style>
    .bubble-chart-container {
        padding: 1rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .context-title {
        font-size: 1.25rem;
        color: #ff5151;
        font-weight: 500;
        margin: 0;
    }

    .bubble-chart {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 81, 81, 0.05);
        border-radius: 8px;
        align-items: center;
        justify-items: center;
    }

    .bubble {
        background: rgba(255, 81, 81, 0.1);
        border: 2px solid #ff5151;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        transition: all 0.3s ease;
        cursor: default;
        text-align: center;
    }

    .bubble:hover {
        transform: scale(1.05);
        background: rgba(255, 81, 81, 0.15);
    }

    .bubble-text {
        font-size: 0.875rem;
        font-weight: 500;

        margin-bottom: 0.25rem;
    }

    .bubble-value {
        font-size: 0.75rem;
        color: #666;
    }

    .no-data {
        color: #666;
        font-size: 0.875rem;
        padding: 2rem;
        text-align: center;
    }
</style>
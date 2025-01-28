<script lang="ts">
    import { WordCloudChart } from "carbon-components-svelte";
    export let words: Array<{text: string, value: number}>;

    // Format data for Carbon's WordCloud
    $: wordCloudData = words.map(word => ({
        text: word.text,
        value: word.value,
        // Scale values to work better with Carbon's defaults
        size: Math.max(12, Math.min(48, Math.sqrt(word.value) * 3))
    }));
</script>

<div class="word-cloud-container">
    <WordCloudChart
        data={wordCloudData}
        showLegend={false}
        width="100%"
        height={300}
    />
</div>

<style>
    .word-cloud-container {
        width: 100%;
        background: rgba(255, 81, 81, 0.03);
        border-radius: 8px;
        padding: 1rem;
    }

    :global(.word-cloud-container text) {
        font-family: 'Inter', sans-serif;
    }
</style>
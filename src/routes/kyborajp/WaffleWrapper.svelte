<script lang="ts">
    import { onMount } from 'svelte';
    import WaffleStages from './WaffleStages.svelte';
    import { mergedSentimentData } from './mergedSentimentData';
    
    export let sentimentStagesData;
</script>

<div class="flex flex-col space-y-6">
    <div class="w-full">
        <WaffleStages data={mergedSentimentData} />
    </div>
</div>
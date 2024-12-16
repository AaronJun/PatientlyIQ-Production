<script lang="ts">
    export let currentDiseaseData: {
        name: string;
        sentiments: Record<string, number>;
    } | undefined;

    $: totalEntries = currentDiseaseData 
        ? Object.values(currentDiseaseData.sentiments).reduce((sum, val) => sum + val, 0)
        : 0;
</script>

{#if currentDiseaseData}
    <div class="text-xl text-slate-500 dark:text-gray-200 mb-8">
        We've collected 
        <span class="text-orange-600 font-semibold">
            {totalEntries}
        </span> 
        entries for 
        <span class="text-orange-600 font-semibold">
            {currentDiseaseData.name}</span>.
    </div>
{/if}
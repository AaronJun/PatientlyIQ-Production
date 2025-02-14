<!-- RPDPipelineMetrics.svelte -->
<script lang="ts">
    export let metrics: {
        totalRPDDs: number;
        inClinicalTrials: number;
        prvAwarded: number;
        prvAvailable: number;
    };

    const maxCircles = 5;
    const categories = [
        { key: 'totalRPDDs', label: 'RPDD Pipeline', color: '#4ECDC4' },
        { key: 'inClinicalTrials', label: 'Clinical Trials', color: '#FF6B6B' },
        { key: 'prvAwarded', label: 'PRV Awarded', color: '#FFD93D' },
        { key: 'prvAvailable', label: 'PRV Available', color: '#95D5B2' }
    ];

    function getCircles(value: number, max: number) {
        const filled = Math.min(Math.ceil((value / max) * maxCircles), maxCircles);
        return Array(maxCircles).fill(null).map((_, i) => i < filled);
    }

    $: maxValue = Math.max(...Object.values(metrics));
</script>

<div class="flex flex-col gap-4 p-4 bg-slate-50 rounded-lg">
    {#each categories as { key, label, color }}
        <div class="flex items-center justify-between gap-4">
            <span class="text-sm text-slate-600 w-32">{label}:</span>
            <div class="flex gap-2">
                {#each getCircles(metrics[key], maxValue) as isFilled}
                    <div
                        class="w-4 h-4 rounded-full border transition-colors duration-300"
                        style="background-color: {isFilled ? color : 'transparent'}; border-color: {color};"
                    />
                {/each}
            </div>
            <span class="text-sm font-mono w-8 text-right">{metrics[key]}</span>
        </div>
    {/each}
</div>
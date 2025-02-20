<!-- RPDPipelineMetrics.svelte -->
<script lang="ts">
    export let data: any[] = [];
    export let company: string;

    $: metrics = {
        totalRPDDs: data.filter(d => d.Company === company).length,
        inClinicalTrials: data.filter(d => {
            const stage = d["Current Development Stage"];
            return d.Company === company && ["Phase 1", "Phase 1/2", "Phase 2", "Phase 2a", "Phase 2b", "Phase 3"].includes(stage);
        }).length,
        prvAwarded: data.filter(d => 
            d.Company === company && d["Current Development Stage"] === "PRV Awarded"
        ).length,
        prvTransacted: data.filter(d => 
            d.Company === company && 
            d["Purchased"] === "Purchased" && 
            d.Purchased == "Y"
        ).length,
        prvAvailable: data.filter(d => 
            d.Company === company && 
            d["Current Development Stage"] === "PRV Awarded" && 
            d.Purchased !== "Y"
        ).length
    };

    const maxCircles = 5;
    const categories = [
        { key: 'totalRPDDs', label: 'RPDD Pipeline', color: '#4ECDC4' },
        { key: 'inClinicalTrials', label: 'Clinical Trials', color: '#FF6B6B' },
        { key: 'prvAwarded', label: 'PRV Awarded', color: '#FFD93D' },
        { key: 'prvTransacted', label: 'PRV Transacted', color: '#95D5B2' },
        { key: 'prvAvailable', label: 'PRV Available', color: '#95D5B2' }
    ];

    function getCircles(value: number, max: number) {
        const filled = Math.min(Math.ceil((value / max) * maxCircles), maxCircles);
        return Array(maxCircles).fill(null).map((_, i) => i < filled);
    }

    $: maxValue = Math.max(...Object.values(metrics));
</script>

<div class="flex flex-col gap-4 rounded-lg">
    {#each categories as { key, label, color }}
        <div class="entries flex items-center justify-between gap-4">
            <span class="text-xs text-slate-600 font-medium w-32">{label}</span>
            <div class="flex gap-2">
            </div>
            <span class="text-sm font-mono w-8 text-right">{metrics[key]}</span>
        </div>
    {/each}
</div>

<style>
.entries {
    position: relative;
    padding-bottom: .425rem;
    border-bottom: .25px solid #e5e5e5;
}

</style>
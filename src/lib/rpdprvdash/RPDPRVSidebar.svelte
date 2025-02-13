<!-- TASummaryRadial.svelte -->
<script lang="ts">
    interface RPDDEntry {
        Company: string;
        TherapeuticArea1: string;
        Candidate: string;
        RPDD_Year: string;
        CurrentStage: string;
        Indication: string;
        [key: string]: string;
    }

    export let currentArea: string | null = null;
    export let entries: RPDDEntry[] = [];

    $: summaryStats = entries.length > 0 ? {
        totalEntries: entries.length,
        uniqueCompanies: new Set(entries.map(d => d.Company)).size,
        uniqueCandidates: new Set(entries.map(d => d.Candidate)).size
    } : null;

    function formatNumber(num: number): string {
        return num.toLocaleString();
    }
</script>

    <div class="info-panel bg-slate-50 px-4 min-h-full">
        <h2 class="text-lg leading-normal font-extrabold mb-4 px-8 pl-0 text-emerald-800 uppercase">        
            {currentArea ? currentArea : 'Overview'}
        </h2>
        <div class="space-y-6">
            <p class="text-sm w-full max-w-4xl text-slate-900">
                <span class="highlight">{currentArea}</span> represents 
                <span class="highlight">{formatNumber(summaryStats?.totalEntries || 0)}</span> RPDDs from
                <span class="highlight">{formatNumber(summaryStats?.uniqueCompanies || 0)}</span> unique companies,
                developing <span class="highlight">{formatNumber(summaryStats?.uniqueCandidates || 0)}</span> candidates.
            </p>
            
            <div class="space-y-4">
                {#each entries as entry}
                    <div class="card px-4 py-4 hover:bg-slate-200 hover:cursor-pointer transition-all duration-200 ease-in-out">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-xs text-slate-600 mt-1">{entry.Indication}
                                </p>
                                <h3 class="text-sm font-semibold text-slate-900">{entry.Company}</h3>
                                <p class="text-xs text-slate-600 mt-1">{entry.Candidate}</p>
                            </div>
                            <span class="text-[7.275px] bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                {entry.CurrentStage}
                            </span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>

<style>
    .highlight {
        color: #549E7D;
        font-family: 'IBM Plex Mono', monospace;
        font-weight: 800;
        text-decoration: underline dotted;
        padding: 0 0.15rem;
    }

    .card {
        border-bottom: .5px dotted #969696;
        padding: .25rem 1rem 1rem 0;
    }

</style>
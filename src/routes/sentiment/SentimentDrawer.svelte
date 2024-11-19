// src/routes/sentiment/SentimentDrawer.svelte
<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';
    import TimeSeriesChart from './TimeSeriesChart.svelte';
    import BeeswarmChart from './Beeswarm.svelte';
    import DiseaseComparison from './DiseaseComparison.svelte';
    import { exampleDiseaseData } from '$lib/data/diseaseSentimentStats';

    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let data: any;

    const ANIMATION_DURATION = 525;

    // Placeholder expanded data
    const expandedData = {
        keyInsights: {
            patientConcerns: "Patients with this condition frequently report challenges with medication adherence and side effect management. The primary factors driving negative sentiment are treatment costs and access to specialists.",
            caregiverImpact: "Caregivers express significant stress related to care coordination and emotional support, particularly in cases requiring complex medication schedules."
        },
        sentimentFactors: [
            {
                factor: "Treatment Burden",
                description: "Daily medication management and therapy routines",
                patientSentiment: 65,
                caregiverSentiment: 58
            },
            {
                factor: "Quality of Life",
                description: "Impact on daily activities and social interactions",
                patientSentiment: 45,
                caregiverSentiment: 42
            },
            {
                factor: "Healthcare Navigation",
                description: "Coordination between healthcare providers",
                patientSentiment: 52,
                caregiverSentiment: 48
            }
        ],
        regionalVariation: {
            high: ["Northeast", "West Coast"],
            low: ["Southeast", "Midwest"],
            factors: "Access to specialists and support services varies significantly by region, with urban areas showing more positive sentiment regarding care access."
        }
    };

    function formatNumber(num: number): string {
        return new Intl.NumberFormat('en-US').format(num);
    }
</script>

<svelte:window on:keydown={event => event.key === 'Escape' && onClose()}/>

<div class="drawer-backdrop"
     on:click={onClose} 
     transition:fly={{duration: ANIMATION_DURATION}}>

    <div class="drawer" 
         on:click|stopPropagation
         transition:fly={{x: 100, duration: ANIMATION_DURATION, easing: circInOut}}>
        
        <button class="close-button" on:click={onClose}>&times;</button>

        <div class="drawer-content">
            <div class="view-header">
                <h2 class="text-2xl font-base mb-12">Why the <span class="serif-italic text-3xl"> {data.category} </span>sentiment is consequential</h2>
                <div class="divide-x-0"></div>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Analysis of {formatNumber(data.details.totalMentions)} patient and caregiver experiences reveals distinctive patterns in how this condition impacts daily life and treatment outcomes.
                </p>
            </div>

            <div class="section">
                <h3 class="font-mono text-xs font-bold text-orange-8000 dark:text-[#ff1515] mb-4">Key Sentiment Patterns</h3>
                <p class="text-gray-800 dark:text-gray-200 mb-6">
                    {expandedData.keyInsights.patientConcerns}
                </p>
                <div class="mb-8">
                    <BeeswarmChart data={{
                        positive: data.positive,
                        negative: data.negative,
                        neutral: data.neutral,
                        mixed: data.mixed
                    }} />
                </div>
            </div>

            <div class="section border-t border-dotted border-[#ff5151] pt-6">
                <h3 class="font-mono text-xs font-bold text-orange-8000 dark:text-[#ff1515] mb-4">Sentiment Factors</h3>
                {#each expandedData.sentimentFactors as factor}
                    <div class="mb-6">
                        <div class="flex justify-between mb-2">
                            <span class="font-medium text-sm">{factor.factor}</span>
                            <span class="font-mono text-sm">{factor.patientSentiment}% positive</span>
                        </div>
                        <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <div class="h-full bg-[#ff5151] rounded-full" style="width: {factor.patientSentiment}%"></div>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">{factor.description}</p>
                    </div>
                {/each}
            </div>

            <div class="section border-t border-dotted border-[#ff5151] pt-6">
                <h3 class="font-mono text-xs font-bold text-orange-8000 dark:text-[#ff1515] mb-4">Temporal Trends</h3>
                <div class="h-64 mb-6">
                    <TimeSeriesChart data={data.details.trends} />
                </div>
                <div class="grid grid-cols-3 gap-4">
                    {#each data.details.trends.slice(-3) as trend}
                        <div class="stat-card">
                            <span class="text-sm text-orange-8000 dark:text-[#ff1515]">{trend.date}</span>
                            <span class="text-lg font-bold text-[#ff5151]">{trend.value}%</span>
                        </div>
                    {/each}
                </div>
            </div>

            <div class="section border-t border-dotted border-[#ff5151] pt-6">
                <h3 class="font-mono text-xs font-bold text-orange-8000 dark:text-[#ff1515] mb-4">Regional Variations</h3>
                <p class="text-gray-800 dark:text-gray-200 mb-4">{expandedData.regionalVariation.factors}</p>
                <div class="grid grid-cols-2 gap-4">
                    <div class="region-card">
                        <span class="text-sm font-medium">Higher Sentiment</span>
                        <div class="flex flex-wrap gap-2">
                            {#each expandedData.regionalVariation.high as region}
                                <span class="tag">{region}</span>
                            {/each}
                        </div>
                    </div>
                    <div class="region-card">
                        <span class="text-sm font-medium">Lower Sentiment</span>
                        <div class="flex flex-wrap gap-2">
                            {#each expandedData.regionalVariation.low as region}
                                <span class="tag">{region}</span>
                            {/each}
                        </div>
                    </div>

<div class="section border-t border-dotted border-[#ff5151] pt-6">
    <h3 class="font-mono text-xs font-bold text-orange-8000 dark:text-[#ff1515] mb-4">
        Comparison to {exampleDiseaseData.categoryBaseline}
    </h3>
    <DiseaseComparison data={exampleDiseaseData} />
</div>
                </div>
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
    }

    .drawer-content {
        padding: 2rem 1rem;
    }

    .section {
        margin-bottom: 2rem;
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
        font-weight: 400;
        font-family: "IBM Plex Mono", monospace;
    }

    .stat-card {
        padding: 1rem;
        background-color: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .region-card {
        padding: 1rem;
        background-color: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        border-radius: 0.5rem;
    }

    .tag {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background-color: rgba(255, 81, 81, 0.1);
        color: #ff5151;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-family: "IBM Plex Mono", monospace;
    }

    @media (max-width: 768px) {
        .drawer {
            width: 100vw;
        }
    }
</style>
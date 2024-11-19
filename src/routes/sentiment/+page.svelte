// src/routes/sentiment/+page.svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import SentimentChart from './SentimentChart.svelte';
    import SentimentDrawer from './SentimentDrawer.svelte';
    import SentimentFilter from './SentimentFilter.svelte';
    
    let isDrawerOpen = false;
    let selectedData: any = null;
    
    const baseData = {
        diabetes: [
            {
                category: "Safety",
                positive: 45,
                neutral: 30,
                negative: 15,
                mixed: 10,
                disease: "Diabetes",
                timeframe: "lastQuarter",
                details: {
                    totalMentions: 2345,
                    topTerms: ["safe", "effective", "risks", "concerns"],
                    trends: [
                        { date: "2024-01", value: 78 },
                        { date: "2024-02", value: 82 },
                        { date: "2024-03", value: 85 }
                    ]
                }
            },
            {
                category: "Efficacy",
                positive: 55,
                neutral: 25,
                negative: 12,
                mixed: 8,
                disease: "Diabetes",
                timeframe: "lastQuarter",
                details: {
                    totalMentions: 3156,
                    topTerms: ["glucose control", "A1C", "improvement", "management"],
                    trends: [
                        { date: "2024-01", value: 88 },
                        { date: "2024-02", value: 92 },
                        { date: "2024-03", value: 89 }
                    ]
                }
            },
            {
                category: "Side Effects",
                positive: 35,
                neutral: 28,
                negative: 25,
                mixed: 12,
                disease: "Diabetes",
                timeframe: "lastQuarter",
                details: {
                    totalMentions: 1897,
                    topTerms: ["weight", "nausea", "manageable", "temporary"],
                    trends: [
                        { date: "2024-01", value: 65 },
                        { date: "2024-02", value: 68 },
                        { date: "2024-03", value: 72 }
                    ]
                }
            }
        ],
        cancer: [
            {
                category: "Safety",
                positive: 50,
                neutral: 25,
                negative: 15,
                mixed: 10,
                disease: "Cancer",
                timeframe: "lastQuarter",
                details: {
                    totalMentions: 3156,
                    topTerms: ["treatment", "safety", "side-effects", "effective"],
                    trends: [
                        { date: "2024-01", value: 75 },
                        { date: "2024-02", value: 80 },
                        { date: "2024-03", value: 82 }
                    ]
                }
            },
            {
                category: "Efficacy",
                positive: 60,
                neutral: 20,
                negative: 10,
                mixed: 10,
                disease: "Cancer",
                timeframe: "lastQuarter",
                details: {
                    totalMentions: 2789,
                    topTerms: ["remission", "response", "shrinkage", "progression"],
                    trends: [
                        { date: "2024-01", value: 82 },
                        { date: "2024-02", value: 85 },
                        { date: "2024-03", value: 88 }
                    ]
                }
            },
            {
                category: "Side Effects",
                positive: 30,
                neutral: 25,
                negative: 35,
                mixed: 10,
                disease: "Cancer",
                timeframe: "lastQuarter",
                details: {
                    totalMentions: 2234,
                    topTerms: ["fatigue", "nausea", "hair loss", "manageable"],
                    trends: [
                        { date: "2024-01", value: 55 },
                        { date: "2024-02", value: 58 },
                        { date: "2024-03", value: 62 }
                    ]
                }
            }
        ]
    };

    let filteredData = Object.values(baseData).flat();

    function handleBarClick(event: CustomEvent) {
        selectedData = event.detail;
        isDrawerOpen = true;
    }

    function handleDrawerClose() {
        isDrawerOpen = false;
        selectedData = null;
    }

    function handleFilter(event: CustomEvent) {
        const filters = event.detail;
        
        // Start with all data flattened
        let filtered = Object.values(baseData).flat();
        
        // Apply disease filter
        if (filters.disease !== 'all') {
            filtered = filtered.filter(item => 
                item.disease.toLowerCase() === filters.disease.toLowerCase()
            );
        }
        
        // Apply aspect filter
        if (filters.aspect !== 'all') {
            filtered = filtered.filter(item => 
                item.category.toLowerCase() === filters.aspect.toLowerCase()
            );
        }
        
        // Apply timeframe filter
        if (filters.timeframe !== 'all') {
            filtered = filtered.filter(item => 
                item.timeframe === filters.timeframe
            );
        }

        filteredData = filtered;
    }

    let chartWidth: number;
    let chartHeight: number;

    onMount(() => {
        const updateDimensions = () => {
            const container = document.querySelector('.chart-container');
            if (container) {
                chartWidth = container.clientWidth;
                chartHeight = Math.min(chartWidth * 0.5, 400);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    });
</script>

<svelte:head>
    <title>Patient Sentiment Analysis | PatientlyIQ</title>
    <meta name="description" content="Analyze patient sentiment across different aspects of treatment and care." />
</svelte:head>

<div class="relative mx-auto mt-2 px-2 md:px-8">
    <div class="text-left mb-16">
        <div class="mb-4 flex items-left gap-5">
            <span class="font-mono text-xs font-bold text-gray-500">05</span>
            <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                Patient sentiment analysis
            </span>
        </div>
    </div>

    <h1 class="-translate-y-4 animate-fade-in antialiased text-balance bg-gradient-to-br from-gray-800 from-30% to-gray-500 bg-clip-text py-6 text-4xl font-extralight opacity-0 [--animation-delay:200ms] dark:from-white/80 dark:to-white/70 sm:text-3xl md:text-2xl lg:text-3xl">
        Understanding the
        <span class="font-serif subpixel-antialiased italic text-[#ff5151]">
            patient voice
        </span>
        across conditions.
    </h1>

    <p class="mb-12 -translate-y-4 animate-fade-in text-balance text-base text-gray-800 opacity-0 [--animation-delay:400ms] dark:text-gray-400 md:text-sm lg:text-base lg:w-5/6">
        Comprehensive analysis of patient sentiment across key treatment aspects, providing deep insights into patient experiences and needs. Filter by condition, aspect, and timeframe to explore specific trends and patterns.
    </p>

    <div class="relative mt-12 animate-fade-up opacity-0 [--animation-delay:200ms]">
        <SentimentFilter on:filter={handleFilter} />
        
        <div class="border border-orange-900 rounded-sm bg-white dark:bg-gray-800 bg-opacity-[0.01]">
            <div class="chart-container p-6" bind:clientWidth={chartWidth} bind:clientHeight={chartHeight}>
                <SentimentChart 
                    data={filteredData} 
                    on:barClick={handleBarClick}
                    width={chartWidth}
                    height={chartHeight}
                />
            </div>
        </div>

        <div class="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p class="font-mono">Click on any bar to view detailed insights</p>
        </div>
    </div>
</div>

{#if isDrawerOpen && selectedData}
    <SentimentDrawer 
        isOpen={isDrawerOpen}
        data={selectedData}
        onClose={handleDrawerClose}
    />
{/if}

<style>
    .mb-4 {
        border-top: .25px solid #ff5151;
        padding-top: .525rem;
    }

    :global(.serif-italic) {
        font-family: 'IBM Plex Serif', serif;
        font-weight: 300;
        font-style: italic;
        color: #ff5151;
    }

    .chart-container {
        width: 100%;
        min-height: 400px;
    }
</style>
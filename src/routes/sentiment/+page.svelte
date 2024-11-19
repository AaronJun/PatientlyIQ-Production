<script lang="ts">
    import { onMount } from 'svelte';
    import SentimentChart from './SentimentChart.svelte';
    import SentimentDrawer from  './SentimentDrawer.svelte';
    
    let isDrawerOpen = false;
    let selectedData: any = null;
    
    // Placeholder data for the stacked bar chart
    const data = [
        {
            category: "Safety",
            positive: 45,
            neutral: 30,
            negative: 15,
            mixed: 10,
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
            details: {
                totalMentions: 3156,
                topTerms: ["works", "helped", "improvement", "results"],
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
            details: {
                totalMentions: 1897,
                topTerms: ["mild", "manageable", "severe", "temporary"],
                trends: [
                    { date: "2024-01", value: 65 },
                    { date: "2024-02", value: 68 },
                    { date: "2024-03", value: 72 }
                ]
            }
        },
        {
            category: "Cost",
            positive: 30,
            neutral: 35,
            negative: 25,
            mixed: 10,
            details: {
                totalMentions: 2567,
                topTerms: ["expensive", "affordable", "insurance", "worth"],
                trends: [
                    { date: "2024-01", value: 58 },
                    { date: "2024-02", value: 62 },
                    { date: "2024-03", value: 65 }
                ]
            }
        },
        {
            category: "Access",
            positive: 40,
            neutral: 30,
            negative: 20,
            mixed: 10,
            details: {
                totalMentions: 1789,
                topTerms: ["available", "pharmacy", "prescription", "wait"],
                trends: [
                    { date: "2024-01", value: 75 },
                    { date: "2024-02", value: 78 },
                    { date: "2024-03", value: 82 }
                ]
            }
        },
        {
            category: "Support",
            positive: 50,
            neutral: 25,
            negative: 15,
            mixed: 10,
            details: {
                totalMentions: 2123,
                topTerms: ["helpful", "responsive", "care", "team"],
                trends: [
                    { date: "2024-01", value: 85 },
                    { date: "2024-02", value: 88 },
                    { date: "2024-03", value: 92 }
                ]
            }
        }
    ];

    function handleBarClick(event: CustomEvent) {
        selectedData = event.detail;
        isDrawerOpen = true;
    }

    function handleDrawerClose() {
        isDrawerOpen = false;
        selectedData = null;
    }
</script>


<div class="relative mx-auto mt-32 max-w-7xl px-6 md:px-8">
    <div class="text-left mb-16">
        <div class="mb-4 flex items-left gap-5">
            <span class="font-mono text-xs font-bold text-gray-500">05</span>
            <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                Patient sentiment analysis
            </span>
        </div>
    </div>

    <h1 class="-translate-y-4 animate-fade-in antialiased text-balance bg-gradient-to-br from-gray-800 from-30% to-gray-500 bg-clip-text py-6 text-4xl font-extralight opacity-0 [--animation-delay:200ms] dark:from-white/80 dark:to-white/70 sm:text-2xl md:text-2xl lg:text-2xl">
        Understanding the
        <span class="font-serif subpixel-antialiased italic text-[#ff5151]">
            patient voice
        </span>
        <br class="hidden md:block" />
        across channels.
    </h1>

    <p class="mb-12 -translate-y-4 animate-fade-in text-balance text-base text-gray-800 opacity-0 [--animation-delay:400ms] dark:text-gray-400 md:text-sm lg:text-base lg:w-5/6">
        Comprehensive analysis of patient sentiment across key treatment aspects, providing deep insights into patient experiences and needs.
    </p>

    <div class="relative mt-12 mb-12 animate-fade-up opacity-0 [--animation-delay:200ms]">
        <div class="border border-orange-900 rounded-sm bg-white bg-opacity-[0.01]">
            <SentimentChart {data} on:barClick={handleBarClick} />
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

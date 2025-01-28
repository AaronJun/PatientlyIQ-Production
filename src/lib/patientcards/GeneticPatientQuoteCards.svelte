<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import * as d3 from 'd3';
    import patientData from '$lib/data/geneticQuotes.json';
    import "carbon-components-svelte/css/all.css";

    let visibleQuotes = 0;
    let observer: IntersectionObserver;

    const sentimentColors = {
        "Entirely Negative": "#AC0003",
        "Somewhat Negative": "#FF676A",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#59AA49",
        "Entirely Positive": "#083607"
    };

    const colorScale = d3.scaleOrdinal()
        .domain(Object.keys(sentimentColors))
        .range(Object.values(sentimentColors));

    onMount(() => {
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startAnimation();
                    observer.disconnect();
                }
            });
        });

        const container = document.querySelector('.forum-container');
        if (container) observer.observe(container);

        return () => observer.disconnect();
    });

    function startAnimation() {
        const animateQuotes = () => {
            if (visibleQuotes < patientData.patients.length) {
                visibleQuotes++;
                setTimeout(animateQuotes, 500);
            }
        };
        animateQuotes();
    }
</script>

<div class="forum-container w-96 max-w-3xl p-2">
    {#each patientData.patients.slice(0, visibleQuotes) as quote, index (quote.id)}
        <div class="relative mb-2">
            {#if index > 0}
                <div class="absolute left-8 -top-4 w-px -mt-4 h-8 bg-slate-300"></div>
            {/if}
            <div 
                transition:fade={{ duration: 500 }}
                class="forum-post bg-white rounded-lg shadow-sm p-4 {index > 0 ? 'ml-6' : ''}"
                style:border="1px solid {colorScale(quote.sentiment)}"
            >
                <div class="flex flex-row items-center align-middle gap-3 mb-3">
                    <div 
                        class="h-2 w-2 rounded-full shrink-0"
                        style:background-color={colorScale(quote.sentiment)}
                    >
                    </div>

                    <span 
                    class="text-[9.25px] text-left font-semibold uppercase shrink-0"
                    style:color={colorScale(quote.sentiment)}
                >{quote.sentiment}</span>
                </div>
                    <div class="flex flex-col gap-2 items-baseline">
                   
       <h3 class="text-sm font-medium text-slate-800 shrink-0">{quote.name}</h3>
                </div>
                
                <div class="mt-2">
                    <p class="text-slate-600 text-left text-sm">{quote.quote}</p>
                    <div class="mt-4 text-[9.25px] text-left font-semibold uppercase text-slate-400">
                        <span class="text-[9.25px] text-left font-semibold uppercase text-slate-400 shrink-0">{quote.age}</span>       
                        <span class="text-[9.25px] text-left font-semibold uppercase text-slate-400 shrink-0"> | </span>       
                        <span class="text-[9.25px] text-left font-semibold uppercase text-slate-400 shrink-0">{quote.persona}</span>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>

<style>
    .forum-post {
        transition: transform 0.5s;
    }
    
    .forum-post:hover {
        transform: translateY(-2px);
    }
</style>
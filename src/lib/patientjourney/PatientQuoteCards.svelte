<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";

    export let stageId: number;
    export let quotes;
    export let quotesDescription;
    export let color: string;

    let containerRef: HTMLDivElement;
    let active = 0;
    let startX: number;
    let currentQuotes = [];
    
    $: {
        if (quotes?.stages) {
            const stageData = quotes.stages.find(s => s.id === stageId);
            currentQuotes = stageData?.quotes || [];
        }
    }

    function handleNext() {
        if (!currentQuotes.length) return;
        active = (active + 1) % currentQuotes.length;
        updateCards();
    }
    
    function handlePrev() {
        if (!currentQuotes.length) return;
        active = (active - 1 + currentQuotes.length) % currentQuotes.length;
        updateCards();
    }

    function handleTouchStart(e: TouchEvent) {
        startX = e.touches[0].clientX;
    }

    function handleTouchMove(e: TouchEvent) {
        if (!startX) return;
        e.preventDefault();
        
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) handleNext();
            else handlePrev();
            startX = null;
        }
    }

    function handleTouchEnd() {
        startX = null;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
    }

    function updateCards() {
        if (!containerRef || !currentQuotes.length) return;
        
        d3.select(containerRef)
            .selectAll('.quote-card')
            .data(currentQuotes, (d: any) => d.id)
            .join('div')
            .attr('class', 'quote-card absolute inset-0 rounded-xl shadow-xl overflow-hidden bg-white')
            .style('z-index', (_, i) => i === active ? 19 : currentQuotes.length + 2 - i)
            .transition()
            .duration(600)
            .ease(d3.easeQuadInOut)
            .style('transform', (_, i) => {
                const translateY = i === active ? 0 : '8.25px';
                const translateZ = i === active ? 0 : '-12px';
                const scale = i === active ? 1 : 0.95;
                const rotate = i === active ? 0 : Math.floor(Math.random() * 12) - 10;
                return `translate3d(0, ${translateY}, ${translateZ}) scale(${scale}) rotate(${rotate}deg)`;
            });
    }

    function initializeCards() {
        if (!containerRef || !currentQuotes.length) return;
        
        const container = d3.select(containerRef);
        
        container.selectAll('.quote-card')
            .data(currentQuotes, (d: any) => d.id)
            .join('div')
            .attr('class', 'quote-card absolute inset-0 rounded-xl shadow-xl overflow-hidden bg-white')
            .html(d => `
                <div class="h-full w-full p-8 flex flex-col items-center justify-between">
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-slate-700">${d.name}</h3>
                        <p class="text-sm mt-1" style="color: ${color}">${d.persona} • ${d.age}</p>
                        <div class="mt-2 px-4 py-1 rounded-full text-xs inline-block" style="background-color: ${color}1a; color: ${color}">
                            ${d.emotionalState}
                        </div>
                    </div>
                    
                    <div class="flex-grow flex items-center justify-center text-center">
                        <p class="text-lg text-slate-800 leading-normal">${d.quote}</p>
                    </div>
                    
                    <div class="mt-4 text-center">
                        <span class="text-xs text-slate-400">Theme: ${d.theme}</span>
                    </div>
                </div>
            `);

        updateCards();
    }

    $: if (currentQuotes.length && containerRef) {
        initializeCards();
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<div class="quote-container w-full bg-blue-50 px-8 pt-8 pb-4 place-content-center items-center mx-auto">
    {#if currentQuotes.length}
        <div class="flex justify-center">
            <div 
                bind:this={containerRef}
                class="relative h-[28rem] w-full max-w-lg cursor-grab active:cursor-grabbing"
                on:touchstart={handleTouchStart}
                on:touchmove={handleTouchMove}
                on:touchend={handleTouchEnd}
            ></div>
        </div>

        <div class="flex justify-center gap-4 mt-8">
            <button
                class="navigation-button"
                on:click={handlePrev}
                style="--button-color: {color}"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    class="h-5 w-5 group-hover:rotate-12 transition-transform duration-300"
                >
                    <path d="m12 19-7-7 7-7" stroke="currentColor" fill="none" stroke-width="2"/>
                    <path d="M19 12H5" stroke="currentColor" fill="none" stroke-width="2"/>
                </svg>
            </button>
            <button
                class="navigation-button"
                on:click={handleNext}
                style="--button-color: {color}"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    class="h-5 w-5 group-hover:-rotate-12 transition-transform duration-300"
                >
                    <path d="M5 12h14" stroke="currentColor" fill="none" stroke-width="2"/>
                    <path d="m12 5 7 7-7 7" stroke="currentColor" fill="none" stroke-width="2"/>
                </svg>
            </button>
        </div>
        
        <div class="flex justify-center gap-2 mt-4">
            {#each currentQuotes as _, i}
                <div 
                    class="w-2 h-2 rounded-full transition-colors duration-300"
                    style="background-color: {i === active ? color : '#e2e8f0'}"
                ></div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .quote-card {
        backface-visibility: hidden;
        transform-style: preserve-3d;
    }

    .navigation-button {
        height: 2.5rem;
        width: 2.5rem;
        border-radius: 9999px;
        background-color: color-mix(in srgb, var(--button-color) 10%, white);
        color: var(--button-color);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
    }

    .navigation-button:hover {
        background-color: var(--button-color);
        color: white;
    }

    .quote-container {
     border: 1px dotted #AA9AFA;
    }
</style>
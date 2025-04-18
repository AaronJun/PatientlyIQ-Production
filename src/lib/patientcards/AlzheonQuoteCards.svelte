<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";
    import patientData from '$lib/data/alzheonQuotes.json';
    import { Quotes } from 'carbon-icons-svelte';   

    let containerRef;
    let active = 0;
    let startX;

    const handleNext = () => {
        active = (active + 1) % patientData.patients.length;
        updateCards();
    };
    
    const handlePrev = () => {
        active = (active - 1 + patientData.patients.length) % patientData.patients.length;
        updateCards();
    };

    const handleTouchStart = (e) => {
        startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        if (!startX) return;
        
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) handleNext();
            else handlePrev();
            startX = null;
        }
    };

    const handleTouchEnd = () => {
        startX = null;
    };

    const updateCards = () => {
        const container = d3.select(containerRef);
        
        container.selectAll('.card')
            .data(patientData.patients, d => d.id)
            .join('div')
            .attr('class', 'card absolute inset-0 rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-neutral-800')
            .style('z-index', (d, i) => i === active ? 9 : patientData.patients.length + 2 - i)
            .transition()
            .duration(800)
            .ease(d3.easeQuadInOut)
            .style('transform', (d, i) => {
                const translateY = i === active ? 0 : '12.25px';
                const translateZ = i === active ? 0 : '-10px';
                const scale = i === active ? 1 : 0.95;
                const rotate = i === active ? 0 : Math.floor(Math.random() * 21) - 10;
                return `translate3d(0, ${translateY}, ${translateZ}) scale(${scale}) rotate(${rotate}deg)`;
            })
    };

    const initializeCards = () => {
        const container = d3.select(containerRef);
        
        container.selectAll('.card')
            .data(patientData.patients, d => d.id)
            .join('div')
            .attr('class', 'card absolute inset-0 rounded-2xl shadow-xl overflow-hidden bg-white dark:bg-neutral-800')
            .html(d => `
                <div class="h-full w-full px-8 pt-8 flex flex-col">
                    <div class="mb-6">
                        <h3 class="text-lg font-bold text-slate-700 dark:text-white">
                            ${d.name}
                        </h3>
                        <p class="text-xs font-bold text-orange-400">
                            ${d.persona} • ${d.age}
                        </p>
                    </div>
                    <div class="space-y-2 flex-grow">
                        <p class="text-sm text-gray-600 dark:text-gray-300">
                            ${d.quote}
                        </p>
                    </div>
                </div>
            `);

        updateCards();
    };

    onMount(() => {
        initializeCards();
        
        // Add keyboard event listeners
        const handleKeydown = (e) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        
        window.addEventListener('keydown', handleKeydown);
        
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<div class="w-full">
    <div class="flex justify-center">
        <div 
            bind:this={containerRef}
            class="relative h-72 w-full max-w-sm cursor-grab active:cursor-grabbing"
            on:touchstart={handleTouchStart}
            on:touchmove={handleTouchMove}
            on:touchend={handleTouchEnd}
        >
            <!-- Cards will be inserted here by D3 -->
        </div>
    </div>

    <!-- Navigation controls -->
    <div class="flex justify-center gap-4 mt-4">
        <button
            on:click={handlePrev}
            class="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-orange-200 dark:bg-neutral-800 dark:hover:bg-orange-500 flex items-center justify-center group hover:bg-orange-500 hover:text-white transition-all duration-300"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4 lg:h-5 lg:w-5 group-hover:rotate-12 transition-transform duration-300"
            >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
            </svg>
        </button>
        <button
            on:click={handleNext}
            class="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-orange-200 dark:bg-neutral-800 dark:hover:bg-orange-500 flex items-center justify-center group hover:bg-orange-500 hover:text-white transition-all duration-300"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4 lg:h-5 lg:w-5 group-hover:-rotate-12 transition-transform duration-300"
            >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
            </svg>
        </button>
    </div>
</div>

<style>
    :global(body) {
        overflow-x: hidden;
    }
</style>
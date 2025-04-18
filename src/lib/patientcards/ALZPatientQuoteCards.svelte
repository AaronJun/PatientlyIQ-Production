<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";
    import patientData from '$lib/data/apoe4Quotes.json';
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
            .style('z-index', (d, i) => i === active ? 19 : patientData.patients.length + 2 - i)
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
            .attr('class', 'card absolute inset-0 rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-neutral-800')
            .html(d => `
                <div class="h-full w-full p-8 flex flex-col items-center text-center">
                    <div class="mb-6">
                        <h3 class="text-xl font-bold text-slate-700 dark:text-white">
                            ${d.name}
                        </h3>
                        <p class="text-sm font-bold text-orange-400">
                            ${d.persona} • ${d.age}
                        </p>
                    </div>
                    <div class="space-y-4 flex-grow">
                        <p class="text-lg text-gray-600 dark:text-gray-300">
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

<div class="w-full bg-blue-50 text-slate-800 px-12 pt-12 pb-4 outline-dashed outline-1 place-content-center items-center mx-auto">
    <div class="flex justify-center">
        <div 
            bind:this={containerRef}
            class="relative h-72 w-96 cursor-grab active:cursor-grabbing"
            on:touchstart={handleTouchStart}
            on:touchmove={handleTouchMove}
            on:touchend={handleTouchEnd}
        >
            <!-- Cards will be inserted here by D3 -->
        </div>
    </div>

    <!-- Navigation controls -->
    <div class="flex justify-center gap-4 mt-8">
        <button
            on:click={handlePrev}
            class="h-10 w-10 rounded-full bg-orange-200 dark:bg-neutral-800 dark:hover:bg-orange-500 flex items-center justify-center group hover:bg-orange-500 hover:text-white transition-all duration-300"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5 group-hover:rotate-12 transition-transform duration-300"
            >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
            </svg>
        </button>
        <button
            on:click={handleNext}
            class="h-10 w-10 rounded-full bg-orange-200  dark:bg-neutral-800 dark:hover:bg-orange-500 flex items-center justify-center group hover:bg-orange-500 hover:text-white transition-all duration-300"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor    "
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5 group-hover:-rotate-12 transition-transform duration-300"
            >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
            </svg>
        </button>
    </div>
    <p class="caption text-sm max-w-96 font-serif text-left mx-auto mt-12">
        Posts on social media and online communities provide a look into the wide range of experiences and perspectives of individuals living with the APOE4 genotype. 
    </p>
</div>

<style>
    :global(body) {
        overflow-x: hidden;
    }
</style>
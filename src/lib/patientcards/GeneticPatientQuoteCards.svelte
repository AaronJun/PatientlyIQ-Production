<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";
    import patientData from '$lib/data/geneticQuotes.json';
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
            .style('z-index', (d, i) => {
                const distance = (i - active + patientData.patients.length) % patientData.patients.length;
                return patientData.patients.length - distance;
            })
            .transition()
            .duration(800)
            .ease(d3.easeQuadInOut)
            .style('transform', (d, i) => {
                const translateY = i === active ? 0 : '12.25px';
                const translateZ = i === active ? 0 : '-10px';
                const scale = i === active ? 1 : 0.95;
                const rotate = i === active ? 0 : Math.floor(Math.random() * 21) - 10;
                return `translate3d(0, ${translateY}, ${translateZ}) scale(${scale}) rotate(${rotate}deg)`;
            });
    };

    const initializeCards = () => {
        const container = d3.select(containerRef);
        
        container.selectAll('.card')
            .data(patientData.patients, d => d.id)
            .join('div')
            .attr('class', 'card absolute inset-0 rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-neutral-800')
            .html(d => `
                <div class="h-full w-full p-8 flex flex-col">
                    <div class="mb-6">
                        <h3 class="text-xl font-bold text-slate-700 dark:text-white">
                            ${d.name}
                        </h3>
                        <p class="text-xs font-bold text-orange-400">
                            ${d.persona} • ${d.age}
                        </p>
                    </div>
                    <div class="space-y-4 flex-grow">
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
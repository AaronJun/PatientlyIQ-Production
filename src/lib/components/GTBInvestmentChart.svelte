<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';

    let containerRef: HTMLDivElement;
    let active = 0;
    let clickedCard: number | null = null;
    let startX: number | null = null;

    interface InvestmentData {
        id: number;
        category: string;
        value: number;
        unit: string;
        period: string;
        color: string;
        description: string;
        details: string;
    }

    const data: InvestmentData[] = [
        {
            id: 1,
            category: 'GTB Investment',
            value: 3.3,
            unit: 'Billion USD',
            period: '2021-2023',
            color: '#ff1515',
            description: 'Private investment in Greater Tokyo Biocommunity',
            details: 'Significant private or investment driving biotech innovation in the Tokyo metropolitan area.'
        },
        {
            id: 2,
            category: 'BiocK Partners',
            value: 100,
            unit: 'Institutions',
            period: 'Current',
            color: '#ff4444',
            description: 'Research institutes, companies, and government agencies',
            details: 'Collaborative network spanning academia, industry, and government for biotech advancement.'
        },
        {
            id: 3,
            category: 'Government Support',
            value: 60,
            unit: 'Million USD',
            period: 'Per Project',
            color: '#ff6666',
            description: 'Strengthening Program for Pharmaceutical Startup Ecosystem',
            details: 'Government subsidies, tax breaks, and startup funds with venture capital collaboration to support early stage drug development.'
        },
        {
            id: 4,
            category: 'Pharma Research Funds',
            value: 3,
            unit: 'Major Companies',
            period: 'Active Programs',
            color: '#ff8888',
            description: 'Astellas, Shionogi, and Daiichi Sankyo dedicated funds',
            details: 'Japanese pharmaceutical companies have launched research funds to encourage partnerships and invest in innovative drug development domestically and internationally.'
        }
    ];

    const handleNext = () => {
        active = (active + 1) % data.length;
        updateCards();
    };
    
    const handlePrev = () => {
        active = (active - 1 + data.length) % data.length;
        updateCards();
    };

    const handleCardClick = (cardId: number) => {
        if (clickedCard === cardId) {
            clickedCard = null; // Collapse if already expanded
        } else {
            clickedCard = cardId; // Expand this card
        }
        updateCards();
    };

    const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
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
        
        container.selectAll('.investment-card')
            .data(data, (d: any) => d.id)
            .join('div')
            .attr('class', 'investment-card absolute rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-neutral-800 cursor-pointer transition-all duration-300')
            .html((d: any) => `
                <div class="h-full w-full py-8 flex flex-col items-center text-center">
                    <div class="mb-2">
                        <h3 class="text-lg font-bold text-slate-500 dark:text-white">
                            ${d.category}
                        </h3>
                        <p class="text-xs font-bold text-slate-500 dark:text-gray-400">
                            ${d.period}
                        </p>
                    </div>
                    
                    <div class="mb-6">
                        <div class="text-4xl font-bold" style="color: ${d.color}">
                            ${d.value}
                        </div>
                        <div class="font-medium text-slate-600 dark:text-gray-300">
                            ${d.unit}
                        </div>
                    </div>
                    
                    <div class="expanded-content space-y-4 flex-grow flex flex-col justify-center transition-all duration-300 ${clickedCard === d.id ? 'opacity-100 max-h-96 delay-300' : 'opacity-0 max-h-0 overflow-hidden delay-0'}">
                        <p class="text-base text-gray-600 dark:text-gray-300 font-medium">
                            ${d.description}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            ${d.details}
                        </p>
                    </div>
                    
                    <div class="click-hint ${clickedCard === d.id ? 'opacity-0 delay-0' : 'opacity-60 delay-300'} transition-opacity duration-300 text-xs text-gray-400 mt-4">
                        Click to expand
                    </div>
                </div>
            `)
            .style('z-index', (d: any, i: number) => {
                if (clickedCard === d.id) return 25; // Highest z-index for expanded card
                return i === active ? 19 : data.length + 2 - i;
            })
            .on('click', (event: any, d: any) => handleCardClick(d.id))
            .transition()
            .duration(300)
            .ease(d3.easeQuadInOut)
            .style('transform', (d: any, i: number) => {
                if (clickedCard === d.id) {
                    // Expanded card - larger and centered
                    return `translate3d(0, -20px, 0) scale(1.15)`;
                }
                const translateY = i === active ? 0 : '12.25px';
                const translateZ = i === active ? 0 : '-10px';
                const scale = i === active ? 1 : 0.95;
                const rotate = i === active ? 0 : Math.floor(Math.random() * 21) - 10;
                return `translate3d(0, ${translateY}, ${translateZ}) scale(${scale}) rotate(${rotate}deg)`;
            })
            .style('width', (d: any) => clickedCard === d.id ? '400px' : '320px')
            .style('height', (d: any) => clickedCard === d.id ? '500px' : '384px')
            .style('left', (d: any) => clickedCard === d.id ? '-40px' : '0px')
            .style('top', (d: any) => clickedCard === d.id ? '-58px' : '0px');
    };

    const initializeCards = () => {
        const container = d3.select(containerRef);
        
        container.selectAll('.investment-card')
            .data(data, (d: any) => d.id)
            .join('div')
            .attr('class', 'investment-card absolute rounded-3xl shadow-xl overflow-hidden bg-white dark:bg-neutral-800 cursor-pointer transition-all duration-300')
            .style('width', '320px')
            .style('height', '384px')
            .html((d: any) => `
                <div class="h-full w-full p-8 flex flex-col items-center text-center">
                    <div class="mb-6">
                        <h3 class="text-2xl font-bold text-slate-700 dark:text-white">
                            ${d.category}
                        </h3>
                        <p class="text-sm font-medium text-slate-500 dark:text-gray-400">
                            ${d.period}
                        </p>
                    </div>
                    
                    <div class="mb-6">
                        <div class="text-2xl font-bold" style="color: ${d.color}">
                            ${d.value}
                        </div>
                        <div class="text-lg font-medium text-slate-600 dark:text-gray-300">
                            ${d.unit}
                        </div>
                    </div>
                    
                    <div class="expanded-content space-y-4 flex-grow flex flex-col justify-center transition-all duration-300 ${clickedCard === d.id ? 'opacity-100 max-h-96 delay-300' : 'opacity-0 max-h-0 overflow-hidden delay-0'}">
                        <p class="text-base text-gray-600 dark:text-gray-300 font-medium">
                            ${d.description}
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            ${d.details}
                        </p>
                    </div>
                    
                    <div class="click-hint ${clickedCard === d.id ? 'opacity-0 delay-0' : 'opacity-60 delay-300'} transition-opacity duration-300 text-xs text-gray-400 mt-4">
                        Click to expand
                    </div>
                </div>
            `)
            .on('click', (event: any, d: any) => handleCardClick(d.id));

        updateCards();
    };

    onMount(() => {
        initializeCards();
        
        // Add keyboard event listeners
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        
        window.addEventListener('keydown', handleKeydown);
        
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<div class="flex flex-col md:flex-row w-full bg-orange-50 text-slate-800 px-12 py-12 outline-dashed outline-1 my-8">
    <div class="align-middle text-left md:w-1/4">
        <h5 class="text-sm font-semibold text-slate-700">
            Japan Biotech Investment & Collaboration Metrics
        </h5>

    <p class="caption text-sm font-serif text-left mt-2 text-slate-600">
        Investment and collaboration metrics showcase Japan's commitment to biotech innovation through the Greater Tokyo Biocommunity initiative and strategic partnerships.
    </p>
    </div>
    
    <div class="flex flex-col justify-center align-center place-items-end  md:w-2/3 ml-12">

    <!-- Progress indicators -->
    <div class="flex gap-2 mt-4">
        {#each data as _, i}
            <button
                on:click={() => { active = i; updateCards(); }}
                class="w-2 h-2 rounded-full transition-all duration-300 {i === active ? 'bg-orange-600' : 'bg-slate-400'}"
            ></button>
        {/each}
    </div>
        <div 
            bind:this={containerRef}
            class="relative h-96 w-80 mt-8 cursor-grab active:cursor-grabbing overflow-visible"
            on:touchstart={handleTouchStart}
            on:touchmove={handleTouchMove}
            on:touchend={handleTouchEnd}
        >
            <!-- Cards will be inserted here by D3 -->
        </div>
         <div class="flex justify-center gap-4 mt-8">
        <button
            on:click={handlePrev}
            class="h-10 w-10 rounded-full bg-slate-100 dark:bg-neutral-800 dark:hover:bg-red-500 flex items-center justify-center group hover:bg-red-500 hover:text-white transition-all duration-300"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                stroke-linecap="square"
                class="h-5 w-5 group-hover:rotate-12 transition-transform duration-300"
            >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
            </svg>
        </button>
        <button
            on:click={handleNext}
            class="h-10 w-10 rounded-full bg-slate-100 dark:bg-neutral-800 dark:hover:bg-red-500 flex items-center justify-center group hover:bg-red-500 hover:text-white transition-all duration-300"
            >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1"
                stroke-linecap="square"
                class="h-5 w-5 group-hover:-rotate-12 transition-transform duration-300"
            >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
            </svg>
        </button>
    </div>
    </div>

    
</div>

<style>
    :global(body) {
        overflow-x: hidden;
    }
</style> 
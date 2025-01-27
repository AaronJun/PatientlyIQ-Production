<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import { fade } from 'svelte/transition';
    import "carbon-components-svelte/css/all.css";
    import patientData from '$lib/data/patient-stories.json';
    import QuadrantChart from '../RPDPatientStories/PatientQuadrantAnalysis.svelte';
    import TopicBarChart from '../RPDPatientStories/TopicBarChart.svelte';
    import SentimentGauge from '../RPDPatientStories/SentimentGauge.svelte';
   
    export let selectedDisease = "pompe";
    export let selectedId = null;

    let showGrid = false;
    let containerRef;
    let active = 0;
    let startX;
    let selectedPatient;
    let expandedCards = [];

    function getImagePath(imgPath) {
        if (!imgPath) return '/api/placeholder/128/128';
        return imgPath.startsWith('http') ? imgPath : `/img${imgPath}`;
    }

    $: {
        if (selectedId && patientData.diseases[selectedDisease]) {
            selectedPatient = patientData.diseases[selectedDisease].patients.find(
                p => p.id === selectedId
            );
            if (selectedPatient) {
                const introCard = {
                    type: 'intro',
                    isIntro: true,
                    ...selectedPatient
                };

                const firstQuoteCard = {
                    ...selectedPatient.cards[0],
                    isQuote: true
                };

                const bioCard = {
                    ...selectedPatient.cards[0],
                    isQuote: false,
                    type: 'Bio'
                };

                const remainingCards = selectedPatient.cards.slice(1).flatMap(card => [
                    { ...card, isQuote: true },
                    { ...card, isQuote: false }
                ]);

                expandedCards = [introCard, firstQuoteCard, bioCard, ...remainingCards];
            }
        }
    }

    const handleNext = () => {
        if (!showGrid && active === expandedCards.length - 1) {
            showGrid = true;
            return;
        }
        if (!showGrid && expandedCards.length) {
            active = (active + 1) % expandedCards.length;
            updateCards();
        }
    };

    const handlePrev = () => {
        if (showGrid) {
            active = expandedCards.length - 1;
            showGrid = false;
            setTimeout(() => {
                initializeCards();
                updateCards();
            }, 300);
            return;
        }
        if (!showGrid && expandedCards.length) {
            active = (active - 1 + expandedCards.length) % expandedCards.length;
            updateCards();
        }
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

    const createVisualizationCard = (card) => {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'flex flex-col gap-6 mt-6';

        const chartsWrapper = document.createElement('div');
        chartsWrapper.className = 'grid grid-cols-1 sm:grid-cols-2 gap-6';
        
        if (card.quadrantData) {
            const quadrantContainer = document.createElement('div');
            quadrantContainer.className = 'bg-white rounded-lg shadow-sm p-4';
            
            const quadrantTitle = document.createElement('h3');
            quadrantTitle.className = 'text-xs font-mono text-slate-600 mb-2';
            quadrantTitle.textContent = 'Patient Journey Progress';
            
            new QuadrantChart({
                target: quadrantContainer,
                props: {
                    data: card.quadrantData,
                    width: 250,
                    height: 250
                }
            });
            
            quadrantContainer.insertBefore(quadrantTitle, quadrantContainer.firstChild);
            chartsWrapper.appendChild(quadrantContainer);
        }

        if (card.topics) {
            const topicsContainer = document.createElement('div');
            topicsContainer.className = 'bg-white rounded-lg shadow-sm p-4';
            
            const topicsTitle = document.createElement('h3');
            topicsTitle.className = 'text-xs font-mono text-slate-600 mb-2';
            topicsTitle.textContent = 'Most Frequent Discussion Topics';
            
            new TopicBarChart({
                target: topicsContainer,
                props: {
                    data: card.topics,
                    width: 250,
                    height: 200
                }
            });
            
            topicsContainer.insertBefore(topicsTitle, topicsContainer.firstChild);
            chartsWrapper.appendChild(topicsContainer);
        }

        chartContainer.appendChild(chartsWrapper);
        return chartContainer;
    };

    const createCardContent = (d) => {
        if (d.isIntro) {
            return `
                <div class="h-full w-full flex flex-col items-center justify-top bg-gradient-to-b from-orange-50 to-white px-4 sm:px-8 pt-12 sm:pt-16 pb-8">
                    <div class="cardcircle flex flex-col items-center gap-8 sm:gap-16 max-w-3xl sm:max-w-5xl">
                        <img 
                            src="${d.img}" 
                            alt="${d.name}"
                            class="w-24 sm:w-32 h-24 sm:h-32 rounded-full object-cover"
                        />
                        
                        <div class="text-center">
                            <h2 class="text-xl sm:text-2xl font-serif text-slate-800">
                                ${d.name}
                            </h2>
                            
                            <p class="text-base sm:text-lg mx-auto w-11/12 sm:w-5/6 text-pretty text-slate-600 font-serif leading-normal mt-4 sm:mt-6">
                                ${d.bio}
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-2 items-end mb-6 sm:mb-8">
                            ${[d.age, d.disease, d.persona].map(tag => `
                                <span class="px-3 py-1.5 bg-orange-100 rounded-full text-xs font-medium text-orange-900">
                                    ${tag}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        if (d.isQuote) {
            return `
                <div class="h-full mx-auto px-6 sm:px-12 pt-8 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center justify-center">
                    <div class="mb-6 sm:mb-8">
                        <p class="text-3xl sm:text-4xl">“</p>
                    </div>
                    <p class="text-xl sm:text-2xl font-serif text-slate-800 text-center leading-normal">
                        ${d.quote}
                    </p>
                    <p class="text-3xl sm:text-4xl mt-8 sm:mt-12 rotate-180 font-serif">“</p>
                </div>
            `;
        }

        const container = document.createElement('div');
        container.className = 'h-full w-full px-4 sm:px-8 pt-6 sm:pt-8 pb-8 sm:pb-10 flex flex-col';
        
        if (d.type === "Bio" && !d.isIntro && !d.isQuote) {
            container.innerHTML = `
                <div class="w-full flex-col">
                    <div class="w-full sm:w-5/6">
                        <h3 class="text-base font-bold text-orange-400 mb-2">
                            ${d.context}
                        </h3>
                        <p class="text-lg sm:text-lg prose text-pretty font-serif text-slate-700 mb-6">
                            ${d.contextDescription}
                        </p>
                    </div>
                    
                    <div class="flex flex-col w-full sm:w-5/6 space-evenly gap-6 sm:gap-8 mt-4 sm:mt-6 pb-2 border-b border-slate-200">
                        <div class="grid-item basis-1/3 flex flex-col gap-4">
                            <h3 class="text-xs font-bold text-orange-400">Goals</h3>
                            <p class="text-sm text-slate-800 font-serif">${d.goals || 'Not specified'}</p>
                        </div>
                        <div class="grid-item basis-1/3 flex flex-col gap-4">
                            <h3 class="text-xs font-bold text-orange-400">Strengths</h3>
                            <p class="text-sm text-slate-800 font-serif">${d.strengths || 'Not specified'}</p>
                        </div>
                        <div class="grid-item basis-1/3 flex flex-col gap-4">
                            <h3 class="text-xs font-bold text-orange-400">Anxieties</h3>
                            <p class="text-sm text-slate-800 font-serif">${d.anxieties || 'Not specified'}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="w-full sm:w-5/6 mb-6">
                    <h3 class="text-xs font-bold text-orange-400 mb-2">
                        ${d.context}
                    </h3>
                    <p class="text-base sm:text-lg prose text-pretty font-serif text-slate-700 mb-4">
                        ${d.contextDescription}
                    </p>
                </div>
            `;
        }

        if (d.sentiment) {
            const gaugeContainer = document.createElement('div');
            gaugeContainer.className = 'sentiment-gauge mb-6';
            container.appendChild(gaugeContainer);

            setTimeout(() => {
                new SentimentGauge({
                    target: gaugeContainer,
                    props: {
                        value: d.sentiment,
                        label: "Stage Sentiment",
                        size: 100
                    }
                });
            }, 0);
        }

        if (d.quadrantData || d.topics) {
            container.appendChild(createVisualizationCard(d));
        }

        return container;
    };

    const updateCards = () => {
        if (!expandedCards.length) return;
        
        const container = d3.select(containerRef);
        
        container.selectAll('.journey-card')
            .data(expandedCards, (d, i) => `${d.type}-${d.isQuote}-${i}`)
            .join('div')
            .attr('class', 'journey-card absolute inset-0 rounded-3xl shadow-xl overflow-hidden')
            .style('z-index', (d, i) => i === active ? 999 : expandedCards.length + 2 - i)
            .style('background-color', d => d.isQuote ? '#EEF2FF' : 'white')
            .transition()
            .duration(800)
            .ease(d3.easeQuadInOut)
            .style('transform', (d, i) => {
                const translateY = i === active ? 0 : '2.25px';
                const translateZ = i === active ? 0 : '-10px';
                const scale = i === active ? 1 : 0.95;
                const rotate = i === active ? 0 : Math.floor(Math.random() * 21) - 10;
                return `translate3d(0, ${translateY}, ${translateZ}) scale(${scale}) rotate(${rotate}deg)`;
            });
    };

    const initializeCards = () => {
        if (!expandedCards.length) return;
        
        const container = d3.select(containerRef);
        
        container.selectAll('.journey-card')
            .data(expandedCards, (d, i) => `${d.type}-${d.isQuote}-${i}`)
            .join('div')
            .attr('class', 'journey-card absolute inset-0 rounded-3xl shadow-xl overflow-hidden')
            .style('background-color', d => d.isQuote ? '#EEF2FF' : 'white')
            .each(function(d) {
                const content = createCardContent(d);
                if (content instanceof Element) {
                    this.innerHTML = '';
                    this.appendChild(content);
                } else {
                    this.innerHTML = content;
                }
            });

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

    $: if (selectedPatient) {
        initializeCards();
    }
</script>

<div class="max-w-5xl mx-auto px-2 sm:px-2 lg:px-2">
    {#if selectedPatient}
        {#if !showGrid}
            <div class="flex justify-center">
                <div 
                    bind:this={containerRef}
                    class="relative h-[40rem] sm:h-[42.25rem] w-full sm:w-[] md:w-[56rem] lg:w-[64rem] cursor-grab active:cursor-grabbing"
                    on:touchstart={handleTouchStart}
                    on:touchmove={handleTouchMove}
                    on:touchend={handleTouchEnd}
                >
                    <!-- Cards will be inserted here by D3 -->
                </div>
            </div>

            <div class="flex justify-between gap-4 mt-16 sm:mt-24 px-4 md:px-0">
                <button
                    on:click={handlePrev}
                    class="h-10 w-10 rounded-full bg-orange-600 dark:bg-neutral-800 dark:hover:bg-orange-500 flex items-center justify-center group hover:bg-orange-500 hover:text-white transition-all duration-300"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#e5e7eb"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-5 w-5 group-hover:rotate-12 transition-transform duration-300"
                    >
                        <path d="m12 19-7-7 7-7" />
                        <path d="M19 12H5" />
                    </svg>
                </button>
                <div class="flex justify-center gap-2 mt-4">
                    {#each expandedCards as _, i}
                        <div 
                            class="w-2 h-2 gap-4 transition-colors duration-300"
                            class:bg-orange-600={i === active}
                            class:bg-slate-200={i !== active}
                        ></div>
                    {/each}
                </div>
                <button
                    on:click={handleNext}
                    class="h-10 w-10 rounded-full bg-orange-600 dark:bg-neutral-800 dark:hover:bg-orange-500 flex items-center justify-center group hover:bg-orange-500 hover:text-white transition-all duration-300"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#e5e7eb"
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

            <!-- Progress indicators -->
         
        {:else}
            <!-- Grid View -->
            <div 
                in:fade={{ duration: 800 }}
                class="grid grid-cols-2 md:grid-cols-3 gap-2 py-2"
            >
                {#each expandedCards as card, i}
                    <button
                        on:click={() => {
                            active = i;
                            showGrid = false;
                            // Wait for grid to fade out before reinitializing cards
                            setTimeout(() => {
                                initializeCards();
                                updateCards();
                            }, 300);
                        }}
                        class="transform transition-transform hover:scale-105 focus:outline-none"
                    >
                        <div 
                            class="h-[15rem] w-full rounded-lg shadow-md overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
                        >
                            {#if card.isIntro}
                                <div class="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white p-6">
                                    <img 
                                    src="${getImagePath(card.img)}" 
                                    alt={card.name}
                                    class="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-orange-200 mb-4"
                                    onerror="this.src='/api/placeholder/128/128'"
                                />
                                    <h3 class="text-base text-slate-800 mb-2">{card.name}</h3>
                                    <p class="text-xs text-slate-600 text-center line-clamp-2">{card.bio}</p>
                                </div>
                            {:else if card.isQuote}
                                <div class="h-full w-full flex flex-col items-center justify-center bg-blue-50 p-4">
                                    <div class="mb-4">
                                        <p class="text-xl font-serif"> “ </p>
                                    </div>
                                    <p class="text-xs font-serif text-slate-800 text-center line-clamp-3">
                                        {card.quote}
                                    </p>

                                </div>
                            {:else}
                                <div class="h-full w-full flex flex-col p-6">
                                    <h3 class="text-[9.25px] capitalize font-bold text-orange-400 mb-2">
                                        {card.context}
                                    </h3>
                                  
                                    <p class="text-xs text-slate-700 line-clamp-3">
                                        {card.contextDescription}
                                    </p>
                                    {#if card.sentiment}
                                        <div class="mt-auto pt-2">
                                            <SentimentGauge 
                                                value={card.sentiment}
                                                label="Stage Sentiment"
                                                size={75}
                                            />
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    {/if}
</div>

<style>
    :global(body) {
        overflow-x: hidden;
    }


    .journey-card {
        backface-visibility: hidden;
        transform-style: preserve-3d;
    }

    /* Add line-clamp utility classes */
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .line-clamp-4 {
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .line-clamp-6 {
        display: -webkit-box;
        -webkit-line-clamp: 6;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

</style>
<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import { fade } from 'svelte/transition';
    import { assets } from '$app/paths';
    import "carbon-components-svelte/css/all.css";
    import patientData from '$lib/data/cidp-patient-stories.json';
    import QuadrantChart from './QuadrantChart.svelte';
    import TopicBarChart from '../RPDPatientStories/TopicBarChart.svelte';
    import SentimentGauge from '../RPDPatientStories/SentimentGauge.svelte';
   
    export let selectedDisease = "cidp";
    export let selectedId = null;
    export let cardWidth = 500;  // Customizable card width
    export let cardHeight = 700; // Customizable card height
    export let gridCols = 4;     // Customizable grid columns

    let showGrid = false;
    let containerRef;
    let active = 0;
    let startX;
    let selectedPatient;
    let expandedCards = [];

    // CSS Variables for easy dimension management
    $: containerStyle = `
        --card-width: ${cardWidth}px;
        --card-height: ${cardHeight}px;
        --grid-cols: ${gridCols};
    `;

    function getImagePath(imgPath) {
        if (!imgPath) return '/api/placeholder/128/128';
        if (imgPath.startsWith('http')) return imgPath;
        return imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
    }

    $: {
        if (selectedId && patientData?.diseases[selectedDisease]) {
            selectedPatient = patientData.diseases[selectedDisease].patients.find(
                p => p.id === selectedId
            );
            if (selectedPatient) {
                expandedCards = processPatientData(selectedPatient);
            }
        }
    }

    function processPatientData(patient) {
        const introCard = {
            type: 'intro',
            isIntro: true,
            ...patient
        };

        const firstQuoteCard = {
            ...patient.cards[0],
            isQuote: true
        };

        const bioCard = {
            ...patient.cards[0],
            isQuote: false,
            type: 'Bio'
        };

        const remainingCards = patient.cards.slice(1).flatMap(card => [
            { ...card, isQuote: true },
            { ...card, isQuote: false }
        ]);

        return [introCard, firstQuoteCard, bioCard, ...remainingCards];
    }

    function handleNext() {
        if (!showGrid && active === expandedCards.length - 1) {
            showGrid = true;
            return;
        }
        if (!showGrid && expandedCards.length) {
            active = (active + 1) % expandedCards.length;
            updateCards();
        }
    }

    function handlePrev() {
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
    }

    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
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

    function createVisualizationCard(card) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'flex flex-col gap-4';

        if (card.quadrantData) {
            const quadrantContainer = document.createElement('div');
            quadrantContainer.className = 'p-4 bg-white rounded-lg';
            
            new QuadrantChart({
                target: quadrantContainer,
                props: {
                    data: card.quadrantData,
                    width: cardWidth * 0.8,
                    height: cardWidth * 0.6
                }
            });
            
            chartContainer.appendChild(quadrantContainer);
        }

        if (card.topics) {
            const topicsContainer = document.createElement('div');
            topicsContainer.className = 'p-4 bg-white rounded-lg';
            
            new TopicBarChart({
                target: topicsContainer,
                props: {
                    data: card.topics,
                    width: cardWidth * 0.8,
                    height: cardWidth * 0.4
                }
            });
            
            chartContainer.appendChild(topicsContainer);
        }

        return chartContainer;
    }

    function createCardContent(d) {
        if (d.isIntro) {
            const imageId = `img-${d.id}`;
            imageLoading.set(imageId, true);

            return `
                <div class="flex flex-col items-center justify-top bg-gradient-to-b from-orange-50 to-white pt-12 px-8 pb-6">
                    <div class="cardcircle flex flex-col items-center gap-8">
                        <div class="relative w-24 h-24 mb-4">
                            ${d.img ? `
                                <div class="image-loading-skeleton absolute inset-0 rounded-full bg-gray-200 animate-pulse ${imageId}-loading"></div>
                                <img 
                                    src="${getImagePath(d.img)}"
                                    alt="${d.name}"
                                    class="rounded-full object-cover w-full h-full shadow-lg border-2 border-orange-200 transition-opacity duration-300"
                                    onload="this.classList.add('opacity-100'); document.querySelector('.${imageId}-loading').style.display = 'none';"
                                    onerror="this.src='/api/placeholder/128/128'; this.classList.add('error-fallback');"
                                    loading="lazy"
                                    style="opacity: 0;"
                                />
                            ` : `   
                                <div class="w-full h-full rounded-full bg-orange-100 flex items-center justify-center">
                                    <span class="text-2xl text-orange-500">${d.name[0]}</span>
                                </div>
                            `}
                        </div>
                        
                        <div class="text-center">
                            <h2 class="text-xl font-sans font-semibold text-slate-600">
                                ${d.name}
                            </h2>
                            
                            <p class="text-base mx-auto text-pretty px-8 max-w-prose text-slate-600 font-sans mt-12">
                                ${d.bio}
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-2 mb-6 sm:mb-8">
                            ${[d.age, d.disease, d.persona].map(tag => `
                                <span class="px-2.5 py-1 bg-orange-200 rounded-full text-xs font-semibold text-slate-900">
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
                <div class="h-full mx-auto px-8 pt-8 pb-8 flex flex-col place-items-center align-middle justify-center">
                    <div class="mb-6">
                        <p class="text-[2.25rem] font-sans w-[2.75rem] h-[2.75rem] bg-slate-50 justify-center text-center rounded-full text-orange-500">"</p>
                    </div>
                    <p class="text-2xl font-sans text-orange-50 text-center leading-normal">
                        ${d.quote}
                    </p>
                </div>
            `;
        }

        const container = document.createElement('div');
        container.className = 'h-full w-full px-4 sm:px-8 pt-6 sm:pt-8 pb-8 sm:pb-10 flex flex-col';
        
        if (d.type === "Bio" && !d.isIntro && !d.isQuote) {
            container.innerHTML = `
                <div class="w-full flex-col">
                    <div class="w-full">
                        <h3 class="text-lg font-semibold text-[#FF4A4A] mb-2">
                            ${d.context}
                        </h3>
                        <p class="text-base leading-normal max-w-prose text-pretty font-sans text-slate-800 mb-12">
                            ${d.contextDescription}
                        </p>
                    </div>
                    
                    <div class="flex flex-col space-evenly gap-6 sm:gap-8 mt-4 sm:mt-6 pb-2">
                        <div class="flex flex-col gap-4">
                            <h3 class="px-2 py-1.5 max-w-fit bg-green-200 rounded-full text-xs font-semibold text-slate-900">Goals</h3>
                            <p class="text-sm text-slate-800 max-w-prose text-pretty">${d.goals || 'Not specified'}</p>
                        </div>
                        <div class="bio-item basis-1/3 flex flex-col gap-4">
                            <h3 class="px-3 py-1.5 max-w-fit bg-red-200 rounded-full text-xs font-semibold text-slate-900">Strengths</h3>
                            <p class="text-sm text-slate-800 max-w-prose text-pretty">${d.strengths || 'Not specified'}</p>
                        </div>
                        <div class="bio-item basis-1/3 flex flex-col gap-4">
                            <h3 class="px-3 py-1.5 max-w-fit bg-yellow-200 rounded-full text-xs font-semibold text-slate-900">Anxieties</h3>
                            <p class="text-sm text-slate-800 max-w-prose text-pretty">${d.anxieties || 'Not specified'}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="w-full mb-4">
                    <h3 class="text-2xl sm:text-xl font-medium capitalize font-bold text-[#FF4A4A] mb-2">
                        ${d.context}
                    </h3>
                    <p class="text-base sm:text-base prose text-pretty font-sans text-slate-700 mb-2">
                        ${d.contextDescription}
                    </p>
                </div>
            `;
        }

        if (d.sentiment) {
            const gaugeContainer = document.createElement('div');
            gaugeContainer.className = 'sentiment-gauge mb-4';
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
    }

  
    function updateCards() {
        if (!expandedCards.length) return;
        
        const container = d3.select(containerRef);
        
        container.selectAll('.journey-card')
            .data(expandedCards, (d, i) => `${d.type}-${d.isQuote}-${i}`)
            .join('div')
            .attr('class', 'journey-card absolute inset-0 rounded-lg shadow-xl overflow-hidden')
            .style('z-index', (d, i) => i === active ? 20 : expandedCards.length + 2 - i)
            .style('background-color', d => d.isQuote ? '#FF4A4A' : 'white')
            .transition()
            .duration(600)
            .ease(d3.easeQuadInOut)
            .style('transform', (d, i) => {
                const translateY = i === active ? 0 : '4px';
                const translateZ = i === active ? 0 : '-4px';
                const scale = i === active ? 1 : 0.98;
                const rotate = i === active ? 0 : Math.floor(Math.random() * 11) - 5;
                return `translate3d(0, ${translateY}, ${translateZ}) scale(${scale}) rotate(${rotate}deg)`;
            });
    }

    function initializeCards() {
        if (!expandedCards.length) return;
        
        const container = d3.select(containerRef);
        
        container.selectAll('.journey-card')
            .data(expandedCards, (d, i) => `${d.type}-${d.isQuote}-${i}`)
            .join('div')
            .attr('class', 'journey-card absolute inset-0 rounded-lg shadow-xl overflow-hidden')
            .style('background-color', d => d.isQuote ? '#FF4A4A' : 'white')
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
    }

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

<div class="journey-container w-full mx-auto px-4" style={containerStyle}>
    {#if selectedPatient}
        {#if !showGrid}
            <div class="flex justify-center">
                <div 
                    bind:this={containerRef}
                    class="relative cursor-grab active:cursor-grabbing"
                    style="width: var(--card-width); height: var(--card-height);"
                    on:touchstart={handleTouchStart}
                    on:touchmove={handleTouchMove}
                    on:touchend={handleTouchEnd}
                >
                    <!-- Cards will be inserted here by D3 -->
                </div>
            </div>

            <div class="navigation mt-8 flex justify-center items-center gap-8">
                <button
                    on:click={handlePrev}
                    class="nav-button"
                    aria-label="Previous card"
                >
                    <svg viewBox="0 0 24 24" class="w-6 h-6">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" fill="none" stroke-width="2"/>
                    </svg>
                </button>

                <div class="flex gap-2">
                    {#each expandedCards as _, i}
                        <div 
                            class="w-2 h-2 rounded-full transition-colors duration-200"
                            class:bg-[#FF4A4A]={i === active}
                            class:bg-slate-200={i !== active}
                        ></div>
                    {/each}
                </div>

                <button
                    on:click={handleNext}
                    class="nav-button"
                    aria-label="Next card"
                >
                    <svg viewBox="0 0 24 24" class="w-6 h-6">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" fill="none" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        {:else}
            <div 
                in:fade={{ duration: 800 }}
                class="grid gap-4 mx-auto"
                style="grid-template-columns: repeat(var(--grid-cols), 1fr);"
            >
                {#each expandedCards as card, i}
                    <button
                        on:click={() => {
                            active = i;
                            showGrid = false;
                            setTimeout(() => {
                                initializeCards();
                                updateCards();
                            }, 300);
                        }}
                        class="transform transition-transform hover:scale-105 focus:outline-none"
                    >
                        <!-- Grid card content -->
                    </button>
                {/each}
            </div>
        {/if}
    {/if}
</div>

<style>
    .journey-container {
        --card-width: 500px;
        --card-height: 700px;
        --grid-cols: 4;
    }

    .journey-card {
        backface-visibility: hidden;
        transform-style: preserve-3d;
        border: 1px solid #FF4A4A;
    }

    .nav-button {
        @apply h-10 w-10 rounded-full bg-[#FF4A4A] text-white 
               flex items-center justify-center
               hover:bg-orange-500 transition-colors duration-200;
    }

    @media (max-width: 768px) {
        .journey-container {
            --card-width: 90vw;
            --card-height: 80vh;
            --grid-cols: 2;
        }
    }
</style>
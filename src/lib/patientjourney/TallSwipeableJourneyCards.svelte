<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as d3 from 'd3';
    import { fade } from 'svelte/transition';
    import { assets } from '$app/paths';
    import "carbon-components-svelte/css/all.css";
    import patientData from '$lib/data/cidp-patient-stories.json';
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
    let imageLoading = new Map();

    function getImagePath(imgPath) {
    if (!imgPath) return '/api/placeholder/128/128';
        
    if (imgPath.startsWith('http')) return imgPath;
    return imgPath.startsWith('/') ? imgPath : `/${imgPath}`;        
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
        e.preventDefault();
        if (!startX) return;
        
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
        chartContainer.className = 'flex flex-col gap-6 mt-6';

        const chartsWrapper = document.createElement('div');
        chartsWrapper.className = 'grid grid-cols-3 lg:grid-cols-3 gap-6 mb-8';

        if (card.quadrantData) {
            const quadrantContainer = document.createElement('div');
            quadrantContainer.className = 'bg-white rounded-lg shadow-sm p-4';
            
            const quadrantTitle = document.createElement('h3');
            quadrantTitle.className = 'text-[9.25px] font-mono text-slate-600 mb-2';
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
            topicsTitle.className = 'text-[9.25px] font-mono text-slate-600 mb-2';
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
    }

    function createCardContent(d) {
        if (d.isIntro) {
            const imageId = `img-${d.id}`;
            imageLoading.set(imageId, true);

            return `
                <div class="flex flex-col items-center justify-top bg-gradient-to-b from-orange-50 to-white pt-12 px-8 pb-6">
                    <div class="cardcircle flex flex-col items-center gap-8">
                        <div class="relative w-24 sm:w-32 h-24 sm:h-32 mb-4">
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
                            <h2 class="text-xl font-sans font-medium text-slate-600">
                                ${d.name}
                            </h2>
                            
                            <p class="text-base mx-auto text-pretty px-8 max-w-prose text-slate-600 font-sans mt-4 sm:mt-6">
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
                <div class="h-full mx-auto px-8 sm:px-24 pt-8 sm:pt-12 pb-8 sm:pb-10 flex flex-col items-center justify-center">
                    <div class="mb-6 sm:mb-8">
                        <p class="text-3xl sm:text-4xl font-serif text-orange-50">"</p>
                    </div>
                    <p class="text-xl sm:text-2xl font-serif text-orange-50 text-center leading-normal">
                        ${d.quote}
                    </p>
                    <p class="text-3xl sm:text-4xl text-orange-50 mt-8 sm:mt-12 rotate-180 font-serif">"</p>
                </div>
            `;
        }

        const container = document.createElement('div');
        container.className = 'h-full w-full px-4 sm:px-8 pt-6 sm:pt-8 pb-8 sm:pb-10 flex flex-col';
        
        if (d.type === "Bio" && !d.isIntro && !d.isQuote) {
            container.innerHTML = `
                <div class="w-full flex-col">
                    <div class="w-full sm:w-5/6">
                        <h3 class="text-2xl sm:text-xl font-medium text-[#FF4A4A] mb-2">
                            ${d.context}
                        </h3>
                        <p class="text-lg sm:text-lg prose text-pretty font-serif text-slate-800 mb-12">
                            ${d.contextDescription}
                        </p>
                    </div>
                    
                    <div class="flex flex-col space-evenly gap-6 sm:gap-8 mt-4 sm:mt-6 pb-2">
                        <div class="flex flex-col gap-4">
                            <h3 class="px-2 py-1.5 max-w-fit bg-green-200 rounded-full text-xs font-semibold text-slate-900">Goals</h3>
                            <p class="text-sm text-slate-800">${d.goals || 'Not specified'}</p>
                        </div>
                        <div class="bio-item basis-1/3 flex flex-col gap-4">
                            <h3 class="px-3 py-1.5 max-w-fit bg-red-200 rounded-full text-xs font-semibold text-slate-900">Strengths</h3>
                            <p class="text-sm text-slate-800">${d.strengths || 'Not specified'}</p>
                        </div>
                        <div class="bio-item basis-1/3 flex flex-col gap-4">
                            <h3 class="px-3 py-1.5 max-w-fit bg-yellow-200 rounded-full text-xs font-semibold text-slate-900">Anxieties</h3>
                            <p class="text-sm text-slate-800">${d.anxieties || 'Not specified'}</p>
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
                    <p class="text-base sm:text-base prose text-pretty font-serif text-slate-700 mb-2">
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
            .attr('class', 'journey-card absolute inset-0 rounded-sm shadow-xl overflow-hidden')
            .style('z-index', (d, i) => i === active ? 20 : expandedCards.length + 2 - i)
            .style('background-color', d => d.isQuote ? '#FF4A4A' : 'white')
            .transition()
            .duration(600)
            .ease(d3.easeQuadInOut)
            .style('transform', (d, i) => {
                const translateY = i === active ? 0 : '12.25px';
                const translateZ = i === active ? 0 : '-10px';
                const scale = i === active ? 1 : 0.95;
                const rotate = i === active ? 0 : Math.floor(Math.random() * 21) - 10;
                return `translate3d(0, ${translateY}, ${translateZ}) scale(${scale}) rotate(${rotate}deg)`;
            });
    }

    function initializeCards() {
    if (!expandedCards.length) return;
    
    const container = d3.select(containerRef);
    
    container.selectAll('.journey-card')
        .data(expandedCards, (d, i) => `${d.type}-${d.isQuote}-${i}`)
        .join('div')
        .attr('class', 'journey-card pt-12 absolute inset-0 rounded-sm shadow-xl overflow-hidden')
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

<div class="w-full max-w-[900px] mx-auto px-4">
{#if selectedPatient}
    {#if !showGrid}
        <div class="flex justify-center">
            <div 
                bind:this={containerRef}
                class="relative h-[40rem] sm:h-[42.25rem] w-full cursor-grab active:cursor-grabbing"
                on:touchstart={handleTouchStart}
                on:touchmove={handleTouchMove}
                on:touchend={handleTouchEnd}
            >
                <!-- Cards will be inserted here by D3 -->
            </div>
        </div>

        <div class="flex place-content-center mx-auto justify-between max-w-xl gap-4 mt-28 sm:mt-24 px-4 md:px-0">
            <button
                on:click={handlePrev}
                class="h-10 w-10 rounded-full bg-orange-600 dark:bg-neutral-800 dark:hover:bg-orange-500 flex items-center justify-center group hover:bg-orange-500 hover:text-white transition-all duration-300"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="6"
                    height="10"
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
                        class="w-2 h-2 gap-4 rounded-full transition-colors duration-100"
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
    {:else}
        <!-- Grid View -->
        <div 
            in:fade={{ duration: 800 }}
            class="grid grid-cols-2 md:grid-cols-4 gap-2 py-2 px-8"
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
                    <div 
                        class="h-[12.25rem] w-full rounded-lg shadow-md overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
                    >
                        {#if card.isIntro}
                            <div class="h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white py-2 px-2">
                                <div class="relative w-12 h-12 mb-4">
                                    {#if card.img}
                                        <div class="absolute inset-0 rounded-full bg-gray-200 animate-pulse"></div>
                                        <img 
                                            src={getImagePath(card.img)}
                                            alt={card.name}
                                            class="rounded-full object-cover w-full h-full shadow-lg border-2 border-orange-200 transition-opacity duration-300"
                                            on:load={(e) => e.currentTarget.classList.add('opacity-100')}
                                            on:error={(e) => {
                                                e.currentTarget.src = '/api/placeholder/128/128';
                                                e.currentTarget.classList.add('error-fallback');
                                            }}
                                            loading="lazy"
                                            style="opacity: 0;"
                                        />
                                    {:else}
                                        <div class="w-full h-full rounded-full bg-orange-100 flex items-center justify-center">
                                            <span class="text-sm text-orange-500">{card.name[0]}</span>
                                        </div>
                                    {/if}
                                </div>
                                <h3 class="text-base font-serif text-slate-800">{card.name}</h3>
                                <p class="text-[11px] text-slate-800 text-center line-clamp-2">{card.bio}</p>
                            </div>
                        {:else if card.isQuote}
                            <div class="h-full w-full flex flex-col items-center justify-center bg-[#FF4A4A] p-4">
                                <div>
                                    <p class="text-xl text-orange-100 font-serif"> " </p>
                                </div>
                                <p class="text-xs font-serif text-orange-50 text-center line-clamp-3">
                                    {card.quote}
                                </p>
                            </div>
                        {:else}
                            <div class="h-full w-full flex flex-col p-6">
                                <h3 class="text-[9.25px] capitalize font-bold text-[#FF4A4A] mb-2">
                                    {card.context}
                                </h3>
                                <p class="text-[11px] text-slate-800 line-clamp-2">
                                    {card.contextDescription}
                                </p>
                                {#if card.sentiment}
                                    <div class="mt-auto mx-auto mt-2 pt-2">
                                        <SentimentGauge 
                                            value={card.sentiment}
                                            label="Stage Sentiment"
                                            size={82.5}
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
@media (max-width: 768px) {
    .cardcircle {
        gap: 1rem;
    }
    .journey-card {
        width: 100%;
        padding: 0.5rem;
    }
}

:global(body) {
    overflow-x: hidden;
}

.bio-item {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    border-top: 1px solid #ff1155;
}

.journey-card {
    backface-visibility: hidden;
    transform-style: preserve-3d;
    border: 1px solid #ff1155;
}

.image-loading-skeleton {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: .5;
    }
}

.error-fallback {
    opacity: 0.75;
    filter: grayscale(100%);
}

img {
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

@media (max-width: 640px) {
    img {
        width: 100%;
        height: auto;
    }
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

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
<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';
    import * as d3 from 'd3';
    import { fade } from 'svelte/transition';
    import { assets } from '$app/paths';
    import "carbon-components-svelte/css/all.css";
    import patientData from '$lib/data/patient-stories.json';
    import QuadrantChart from '../RPDPatientStories/PatientQuadrantAnalysis.svelte';
    import TopicBarChart from '../RPDPatientStories/TopicBarChart.svelte';
    import SentimentGauge from '../RPDPatientStories/SentimentGauge.svelte';
   
    export let selectedDisease: string = "pompe";
    export let selectedId: string | null = null;
    export let isVisible: boolean = false;  // Added prop to control lazy loading

    let showGrid: boolean = false;
    let containerRef: HTMLElement;
    let active: number = 0;
    let startX: number | null = null;
    let selectedPatient: any;
    let expandedCards: any[] = [];
    let isInitialized: boolean = false;
    
    // Image handling
    type ImageStatus = 'loading' | 'loaded' | 'error';
    let imageStatus: Record<string, ImageStatus> = {};

    // Memoize image paths
    const imagePathCache = new Map<string, string>();

    /**
     * Constructs the proper image path with caching
     */
    function getImagePath(imgPath: string | undefined): string {
        if (!imgPath) return '/api/placeholder/128/128';
        
        if (imagePathCache.has(imgPath)) {
            return imagePathCache.get(imgPath)!;
        }
        
        let path: string;
        if (imgPath.startsWith('http')) {
            path = imgPath;
        } else {
            try {
                const cleanPath = imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
                path = `${assets}${cleanPath}`;
            } catch (error) {
                console.error('Error processing image path:', error);
                path = '/api/placeholder/128/128';
            }
        }
        
        imagePathCache.set(imgPath, path);
        return path;
    }

    // Handle type safety for accessing patient data
    const patientDataCache = new Map<string, any>();
    function getPatientData(disease: string) {
        if (patientDataCache.has(disease)) {
            return patientDataCache.get(disease);
        }
        
        if (disease in patientData.diseases) {
            const data = patientData.diseases[disease as keyof typeof patientData.diseases];
            patientDataCache.set(disease, data);
            return data;
        }
        return null;
    }

    // Debounce function for performance optimization
    function debounce<T extends (...args: any[]) => void>(
        fn: T,
        delay: number
    ): (...args: Parameters<T>) => void {
        let timeoutId: ReturnType<typeof setTimeout>;
        return (...args: Parameters<T>) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }

    $: {
        if (selectedId && selectedDisease) {
            const diseaseData = getPatientData(selectedDisease);
            if (diseaseData) {
                selectedPatient = diseaseData.patients.find(
                    (p: any) => p.id === selectedId
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

                    const remainingCards = selectedPatient.cards.slice(1).flatMap((card: any) => [
                        { ...card, isQuote: true },
                        { ...card, isQuote: false }
                    ]);

                    expandedCards = [introCard, firstQuoteCard, bioCard, ...remainingCards];
                    
                    // Reset image statuses
                    imageStatus = {};
                    
                    // Set initialized to start Svelte rendering
                    isInitialized = true;
                }
            }
        }
    }

    // Throttle touch events
    const handleTouchMove = debounce((e: TouchEvent): void => {
        e.preventDefault();
        if (startX === null) return;
        
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) handleNext();
            else handlePrev();
            startX = null;
        }
    }, 16); // ~60fps

    function handleTouchStart(e: TouchEvent): void {
        startX = e.touches[0].clientX;
    }

    function handleTouchEnd(): void {
        startX = null;
    }

    function handleNext(): void {
        if (!showGrid && active === expandedCards.length - 1) {
            showGrid = true;
            return;
        }
        if (!showGrid && expandedCards.length) {
            active = (active + 1) % expandedCards.length;
        }
    }

    function handlePrev(): void {
        if (showGrid) {
            active = expandedCards.length - 1;
            showGrid = false;
            return;
        }
        if (!showGrid && expandedCards.length) {
            active = (active - 1 + expandedCards.length) % expandedCards.length;
        }
    }

    /**
     * Update the status of an image
     * @param id - Image identifier
     * @param status - New status
     */
    function updateImageStatus(id: string, status: ImageStatus): void {
        imageStatus[id] = status;
        imageStatus = {...imageStatus}; // Trigger reactivity
    }

    // Preload the images for better user experience
    function preloadImages(): void {
        if (!expandedCards.length) return;
        
        expandedCards.forEach(card => {
            if (card.isIntro && card.img) {
                const imageId = `img-${card.id}`;
                const imgSrc = getImagePath(card.img);
                
                // Create a new Image object to preload
                const img = new Image();
                img.onload = () => updateImageStatus(imageId, 'loaded');
                img.onerror = () => updateImageStatus(imageId, 'error');
                img.src = imgSrc;
            }
        });
    }

    // Handle visibility changes
    $: if (isVisible && selectedPatient && !isInitialized) {
        preloadImages();
        isInitialized = true; // Mark as initialized to trigger Svelte rendering
    }

    onMount(() => {
        if (isVisible && selectedPatient) {
            preloadImages();
        }
        
        const handleKeydown = debounce((e: KeyboardEvent): void => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        }, 100);
        
        window.addEventListener('keydown', handleKeydown);
        
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    });
</script>

<div class="w-full md:max-w-2xl mx-auto px-4" 
     in:fade={{ duration: 800, delay: 200 }}>
{#if selectedPatient}
    {#if !showGrid}
        <div class="flex justify-center">
            <div 
                bind:this={containerRef}
                class="relative h-[40rem] w-full cursor-grab active:cursor-grabbing"
                on:touchstart={handleTouchStart}
                on:touchmove={handleTouchMove}
                on:touchend={handleTouchEnd}
            >
                <!-- Cards rendered with D3 will be replaced with Svelte components -->
                {#each expandedCards as card, i}
                    <div 
                        class="journey-card pb-4 pt-8 absolute inset-0 rounded-2xl shadow-xl overflow-hidden"
                        style="background-color: {card.isQuote ? '#FF4A4A' : 'white'}; 
                               z-index: {i === active ? 99 : expandedCards.length + 2 - i};
                               transform: translate3d(0, {i === active ? 0 : '12.25px'}, {i === active ? 0 : '-10px'}) 
                                          scale({i === active ? 1 : 0.95}) 
                                          rotate({i === active ? 0 : Math.floor(Math.random() * 21) - 10}deg);"
                    >
                        {#if card.isIntro}
                            <div class="h-full w-full flex flex-col items-center justify-top px-8 pb-6">
                                <div class="cardcircle flex flex-col items-center gap-8">
                                    <div class="relative w-24 sm:w-32 h-24 sm:h-32 mb-4">
                                        {#if card.img}
                                            {@const imageId = `img-${card.id}`}
                                            {@const imgSrc = getImagePath(card.img)}
                                            
                                            <div class="image-loading-skeleton absolute inset-0 rounded-full bg-gray-200 animate-pulse" 
                                                class:hidden={imageStatus[imageId] === 'loaded' || imageStatus[imageId] === 'error'}>
                                            </div>
                                            
                                            <img 
                                                src={imgSrc}
                                                alt={card.name}
                                                class="rounded-full object-cover w-full h-full shadow-lg border-2 border-slate-200 transition-opacity duration-300"
                                                class:opacity-100={imageStatus[imageId] === 'loaded'}
                                                class:opacity-0={imageStatus[imageId] !== 'loaded'}
                                                class:error-fallback={imageStatus[imageId] === 'error'}
                                                id={imageId}
                                                on:error={() => updateImageStatus(imageId, 'error')}
                                                on:load={() => updateImageStatus(imageId, 'loaded')}
                                                loading="eager"
                                            />
                                        {:else}
                                            <div class="w-full h-full rounded-full bg-orange-100 flex items-center justify-center">
                                                <span class="text-2xl text-orange-500">{card.name[0]}</span>
                                            </div>
                                        {/if}
                                    </div>
                                    
                                    <div class="text-center">
                                        <h2 class="text-xl sm:text-2xl font-serif text-slate-800">
                                            {card.name}
                                        </h2>
                                        
                                        <p class="text-base sm:text-lg mx-auto w-11/12 sm:w-5/6 text-pretty text-slate-600 font-serif leading-normal mt-4 sm:mt-6">
                                            {card.bio}
                                        </p>
                                    </div>
                                    <div class="flex flex-wrap gap-2 mb-6 sm:mb-8">
                                        {#each [card.age, card.disease, card.persona] as tag}
                                            <span class="px-3 py-1.5 bg-orange-200 rounded-full text-xs font-semibold text-slate-900">
                                                {tag}
                                            </span>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        {:else if card.isQuote}
                            <div class="h-full mx-auto px-8 pb-8 sm:pb-10 flex flex-col items-center justify-center">
                                <div class="mb-6">
                                    <p class="text-3xl font-serif text-orange-50">"</p>
                                </div>
                                <p class="text-xl sm:text-2xl font-serif text-orange-50 text-center leading-normal">
                                    {card.quote}
                                </p>
                                <p class="text-3xl sm:text-4xl text-orange-50 mt-8 sm:mt-12 rotate-180 font-serif">"</p>
                            </div>
                        {:else if card.type === "Bio" && !card.isIntro && !card.isQuote}
                            <div class="h-full w-full px-8 pb-8 sm:pb-10 flex flex-col">
                                <div class="max-w-prose flex flex-col">
                                    <div class="w-full">
                                        <h3 class="text-lg md:text-xl font-medium text-[#FF4A4A]">
                                            {card.context}
                                        </h3>
                                        <p class="mt-4 max-w-prose text-pretty font-serif text-slate-800">
                                            {card.contextDescription}
                                        </p>
                                    </div>
                                    
                                    <div class="flex flex-col space-evenly gap-6 pb-2">
                                    <div class="bio-item basis-1/3 mt-6 flex flex-col gap-4">
                                     <h3 class="px-3 py-1.5 max-w-fit bg-blue-200 rounded-full text-xs font-semibold text-slate-900">Goals</h3>
                                            <p class="text-sm text-slate-800">{card.goals || 'Not specified'}</p>
                                        </div>
                                        <div class="bio-item basis-1/3 flex flex-col gap-4">
                                            <h3 class="px-3 py-1.5 max-w-fit bg-emerald-200 rounded-full text-xs font-semibold text-slate-900">Strengths</h3>
                                            <p class="text-sm text-slate-800">{card.strengths || 'Not specified'}</p>
                                        </div>
                                        <div class="bio-item basis-1/3 flex flex-col gap-4">
                                            <h3 class="px-3 py-1.5 max-w-fit bg-yellow-200 rounded-full text-xs font-semibold text-slate-900">Anxieties</h3>
                                            <p class="text-sm text-slate-800">{card.anxieties || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <div class="h-full w-full px-8 pb-8 sm:pb-10 flex flex-col">
                                <div class="w-full mb-4">
                                {#if card.sentiment}
                                    <div class="sentiment-gauge">
                                        <SentimentGauge
                                            value={card.sentiment}
                                            label="Stage Sentiment"
                                            size={100}
                                        />
                                    </div>
                                {/if}
                                
                                    <h3 class="text-lg md:text-xl font-medium capitalize font-bold text-[#FF4A4A] mb-2">
                                        {card.context}
                                    </h3>
                                    <p class="text-base sm:text-base prose text-pretty font-serif text-slate-700 mb-2">
                                        {card.contextDescription}
                                    </p>
                                </div>
                                
                                {#if card.quadrantData || card.topics}
                                    <div class="flex flex-col gap-6 mt-6">
                                        <div class="grid grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
                                            {#if card.quadrantData}
                                                <div class="bg-white rounded-lg shadow-sm p-4">
                                                    <h3 class="text-xs font-mono text-slate-600 mb-2">Patient Journey Progress</h3>
                                                    <QuadrantChart
                                                        data={card.quadrantData}
                                         
                                                    />
                                                </div>
                                            {/if}
                                            
                                            {#if card.topics}
                                                <div class="bg-white rounded-lg shadow-sm p-4">
                                                    <h3 class="text-xs font-mono text-slate-600 mb-2">Most Frequent Discussion Topics</h3>
                                                    <TopicBarChart
                                                        data={card.topics}
                                                    />
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>

        <div class="flex place-content-center mx-auto justify-between max-w-prose gap-4 mt-28 sm:mt-24 px-4 md:px-0">
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
                        class="w-2 h-2 gap-4 rounded-full transition-colors duration-300"
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
                    }}
                    class="transform transition-transform hover:scale-105 focus:outline-none"
                >
                    <div 
                        class="w-full rounded-lg shadow-md overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
                    >
                        {#if card.isIntro}
                            <div class="h-full w-full flex flex-col items-center justify-center px-2">
                                <div class="relative w-12 h-12 mb-4">
                                    {#if card.img}
                                        {@const imageId = `img-${card.id}`}
                                        {@const imgSrc = getImagePath(card.img)}
                                        
                                        <div class="absolute inset-0 rounded-full bg-gray-200 animate-pulse" 
                                             class:hidden={imageStatus[imageId] === 'loaded' || imageStatus[imageId] === 'error'}>
                                        </div>
                                        
                                        <img 
                                            src={imgSrc}
                                            alt={card.name}
                                            id={imageId}
                                            class="rounded-full object-cover w-full h-full shadow-lg border-2 border-slate-200 transition-opacity duration-300"
                                        />
                                    {:else}
                                        <div class="w-full h-full rounded-full bg-orange-100 flex items-center justify-center">
                                            <span class="text-sm text-orange-500">{card.name[0]}</span>
                                        </div>
                                    {/if}
                                </div>
                                <h3 class="text-sm font-serif text-slate-800">{card.name}</h3>
                                <p class="text-sm text-slate-800 text-center line-clamp-2">{card.bio}</p>
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
                            <div class="h-full w-full flex flex-col px-8">
                                <h3 class="text-sm capitalize font-bold text-[#FF4A4A] mb-2">
                                    {card.context}
                                </h3>
                                <p class="text-sm text-slate-800 line-clamp-2">
                                    {card.contextDescription}
                                </p>
                                {#if card.sentiment}
                                    <div class="mt-auto mx-auto pt-2">
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
:global(body) {
    overflow-x: hidden;
}

.bio-item {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.journey-card {
    backface-visibility: hidden;
    transform-style: preserve-3d;
    border: 1px solid #ff1155;
    will-change: transform;
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

</style>
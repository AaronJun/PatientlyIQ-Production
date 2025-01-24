<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { spring } from 'svelte/motion';
  import * as d3 from 'd3';
  import "carbon-components-svelte/css/all.css";
  import QuadrantChart from './PatientQuadrantAnalysis.svelte';
  import SentimentGauge from './SentimentGauge.svelte';
  import TopicBarChart from './TopicBarChart.svelte';
  import { Quotes } from 'carbon-icons-svelte';
  
  export let selectedPatient = null;
  export let isVisible = false;
  
  let current = 0;
  let chartContainer;
  let containerWidth;
  let containerHeight;
  let windowWidth;
  
  const BASE_CARD_TYPES = ['Bio', 'Initial Response', 'First Steps', 'Moving Forward'];
  
  $: currentCard = selectedPatient?.cards?.[currentBaseIndex] || null;
  $: currentBaseIndex = Math.floor(current / 2);
  $: isQuoteCard = current % 2 === 0;
  $: isDesktop = windowWidth >= 768; // Changed breakpoint to be more mobile-friendly
  $: chartWidth = isDesktop ? Math.min((containerWidth / 2) - 40, 600) : Math.min(containerWidth - 32, 600);

  function closeModal(e) {
    if (e.type === 'keydown' && e.key === 'Escape' || e.target === e.currentTarget || e.target.closest('button[data-close]')) {
      dispatch('close');
      setTimeout(() => {
        current = 0;
      }, 400);
    }
  }

  function handleNext() {
    if (current < (BASE_CARD_TYPES.length * 2) - 1) {
      current = current + 1;
    }
  }

  function handleBack() {
    if (current > 0) {
      current = current - 1;
    }
  }

  function handleCardTypeClick(index) {
    current = index * 2;
  }
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<svelte:window 
  on:keydown={closeModal}
  bind:innerWidth={windowWidth}
/>

{#if isVisible && selectedPatient}
  <div 
    class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 py-1 px-2 sm:py-2 sm:px-8 overflow-hidden"
    on:click={closeModal}
    transition:fade={{ duration: 400 }}
  >
    <div class="relative w-[95vw] sm:w-[85vw] z-50 max-w-5xl h-[90vh] sm:h-[80vh]" on:click|stopPropagation>
      <div class="w-full h-full bg-white rounded-lg sm:rounded-xl shadow-xl flex flex-col">
        <!-- Close button -->
        <button
        data-close
        on:click={closeModal}
        class="absolute top-1 right-1 p-1 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
      >
        <svg class="w-5 h-5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

        <!-- Header -->
        {#if currentBaseIndex !== 0}
          <div class="card-header sticky top-0 z-10 bg-backdrop-blur-sm pt-2 pb-0.5 px-3 sm:pt-4 sm:pb-1 sm:px-8 rounded-t-lg sm:rounded-t-xl">  
            <div class="bio-pic flex justify-between items-center gap-2 sm:gap-4 mb-1 sm:mb-2">
              <img 
                src={selectedPatient.img} 
                alt={selectedPatient.name}
                class="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover outline-1 outline-orange-700"
              />
              <div class="grid gap-1">
                <h2 class="text-xs sm:text-base font-bold text-right text-slate-800">
                  {selectedPatient.name}
                </h2>
                <div class="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
                  {#each [selectedPatient.age, selectedPatient.disease, selectedPatient.persona] as tag}
                    <span class="px-1.5 py-0.5 sm:px-2 sm:py-1.5 bg-sky-100 rounded-full text-[10px] sm:text-xs font-medium text-slate-400">
                      {tag}
                    </span>
                  {/each}
                </div>
              </div>
            </div>        
          </div>
        {/if}

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          {#key current}
            <div
              in:fly={{ x: 200, duration: 300, opacity: 0 }}
              out:fly={{ x: -200, duration: 300, opacity: 0 }}
              class="h-full"
            >
              {#if isQuoteCard && currentCard}
                <!-- Quote Card -->
                <div class="bg-blue-50 min-h-full w-full flex items-center justify-center rounded-lg sm:rounded-xl">
                  <div class="w-full rounded-lg sm:rounded-xl p-4 sm:p-6 items-center">
                    <div class="flex items-center justify-center mb-4 sm:mb-8">
                      <Quotes size={16} class="mx-auto" />
                    </div>
                    <p class="text-xl sm:text-3xl text-pretty font-base font-serif italic text-slate-800 text-center w-11/12 sm:w-7/12 mx-auto">
                      {currentCard.quote}
                    </p>
                  </div>
                </div>
              {:else if currentCard}
                <!-- Content Card -->
                <div class="p-3 sm:p-12">
                  {#if currentBaseIndex === 0}
                    <!-- Bio Layout -->
                    <div class="flex-col items-center max-w-4x mx-auto">
                      <div class="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-4 sm:mb-12">
                        <img 
                          src={selectedPatient.img} 
                          alt={selectedPatient.name}
                          class="w-24 h-24 sm:w-48 sm:h-48 rounded-full object-cover shadow-lg mx-auto"
                        />
                        <div class="flex-1 text-center sm:text-left">
                          <h2 class="text-lg sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-4">
                            {selectedPatient.name}
                          </h2>
                          
                          <div class="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-6 justify-center sm:justify-start">
                            {#each [selectedPatient.age, selectedPatient.disease, selectedPatient.persona] as tag}
                              <span class="px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-200 rounded-full text-xs sm:text-sm font-medium text-slate-600">
                                {tag}
                              </span>
                            {/each}
                          </div>
                          
                          <p class="text-sm sm:text-lg text-slate-600 font-serif leading-normal">
                            {selectedPatient.bio}
                          </p>
                        </div>
                      </div>
                    </div>
                  {:else}
                    <!-- Other Cards -->
                    <div class="px-1 sm:px-2">
                      <div class="pt-1 sm:pt-2 max-w-prose">
                        <h4 class="text-[10px] sm:text-xs text-slate-600 font-bold font-mono">
                          {#if currentCard?.context}
                            {currentCard.context}
                          {/if}
                        </h4>
                        <p class="text-sm sm:text-base font-serif leading-5 sm:leading-6">
                          {currentCard.contextDescription}
                        </p>
                        <div class="flex justify-start mt-2 sm:mt-4">
                          <SentimentGauge 
                            value={currentCard.sentiment} 
                            label="Stage Sentiment"
                            size={isDesktop ? 120 : 80}
                          />
                        </div>
                      </div>

                      <div class="flex flex-col lg:flex-row gap-4 sm:gap-8 w-full mt-4 sm:mt-6" bind:clientWidth={containerWidth}>
                        {#if currentCard.quadrantData}
                          <div class="flex-1 bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6">
                            <h3 class="text-[10px] sm:text-xs text-slate-600 mb-2 font-mono font-bold">Patient Journey Progress</h3>
                            <QuadrantChart
                              data={currentCard.quadrantData}
                              width={chartWidth}
                              height={isDesktop ? 285 : 200}
                            />
                          </div>
                        {/if}
                        {#if currentCard.topics}
                          <div class="flex-1 bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-6">
                            <h3 class="text-[10px] sm:text-xs text-slate-600 mb-2 font-mono font-bold">
                              Most Frequent Discussion Topics</h3>
                            <TopicBarChart
                              data={currentCard.topics}
                              width={chartWidth}
                              height={isDesktop ? 270 : 250}
                            />
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/key}
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 backdrop-blur-sm border-t px-2 sm:px-8 py-2 sm:py-4 rounded-b-lg sm:rounded-b-xl flex justify-between items-center">
          <nav class="flex items-center justify-center text-[10px] sm:text-sm font-medium gap-1 sm:gap-3">
            {#each BASE_CARD_TYPES as type, i}
              <button 
                on:click={() => handleCardTypeClick(i)}
                class="group flex items-center"
              >
                <div class="px-2 sm:px-4 py-1 sm:py-2 min-w-16 sm:min-w-20 font-mono text-[8px] sm:text-[9px] rounded-full transition-all duration-200 {
                  Math.floor(current / 2) === i ? 'bg-orange-100 text-orange-700 font-semibold' : 
                  Math.floor(current / 2) < i ? 'text-slate-400 hover:text-slate-600' : 'text-orange-600 hover:bg-orange-50'
                }">
                  {type}
                </div>
              </button>
            {/each}
          </nav>
     
          <div class="flex gap-2 sm:gap-4">
            <button
              on:click={handleBack}
              class="px-2 sm:px-4 py-1 sm:py-2 rounded-full text-orange-600 border-2 border-orange-600 
                     hover:bg-orange-50 transition-all duration-200 flex items-center justify-center text-xs sm:text-base font-medium shadow-sm"
            >
              ← 
            </button>

            <button
              on:click={handleNext}
              class="px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-orange-600 text-white hover:bg-orange-700 
                     transition-all duration-200 flex items-center justify-center text-xs sm:text-base font-medium"
            >
               →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .card-header {
    border-bottom: .25px solid #ff1515;
  }

  .bio-pic img {
   border: 1px solid #ff5151;
  }
</style>
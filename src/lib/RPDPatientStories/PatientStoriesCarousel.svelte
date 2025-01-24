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
  $: isDesktop = windowWidth >= 1024;
  $: chartWidth = isDesktop ? Math.min((containerWidth / 2) - 80, 600) : Math.min(containerWidth - 48, 600);
  
  function closeModal(e) {
    if (e.type === 'keydown' && e.key === 'Escape' || e.target === e.currentTarget) {
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
    class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 py-8 px-8 overflow-hidden"
    on:click={closeModal}
    transition:fade={{ duration: 400 }}
  >
    <div class="relative w-full z-50 max-w-5xl h-[85vh]" on:click|stopPropagation>
      <div class="w-full h-full bg-white rounded-2xl shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-8 pt-6 pb-4 border-b rounded-t-2xl">
          <nav class="flex items-center justify-center text-sm font-medium gap-3">
            {#each BASE_CARD_TYPES as type, i}
              <button 
                on:click={() => handleCardTypeClick(i)}
                class="group flex items-center"
              >
                <div class="px-4 py-2 font-mono text-xs rounded-full transition-all duration-200 {
                  Math.floor(current / 2) === i ? 'bg-orange-100 text-orange-700 font-semibold shadow-sm' : 
                  Math.floor(current / 2) < i ? 'text-slate-400 hover:text-slate-600' : 'text-orange-600 hover:bg-orange-50'
                }">
                  {type}
                </div>
                {#if i < BASE_CARD_TYPES.length - 1}
                  <div class="mx-2 text-slate-300">→</div>
                {/if}
              </button>
            {/each}
          </nav>
        </div>

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
                <div class="min-h-full flex items-center justify-center p-12">
                  <div class="w-full rounded-2xl p-12">
                    <div class="flex items-center justify-center mb-8">
                    <Quotes size={32} class="mx-auto" />
                    </div>
                    <p class="text-2xl font-base text-slate-800 text-center w-9/12 mx-auto leading-normal">
                        {currentCard.quote}
                      </p>
                  </div>
                </div>
              {:else if currentCard}
                <!-- Content Card -->
                <div class="p-12">
                  {#if currentBaseIndex === 0}
                    <div class="max-w-4xl mx-auto">
                      <div class="flex flex-row mx-auto lg:flex-row gap-8 mb-12">
                        <img 
                          src={selectedPatient.img} 
                          alt={selectedPatient.name}
                          class="w-48 h-48 rounded-full object-cover shadow-lg mx-auto lg:mx-0"
                        />
                        <div class="flex-1">
                          <h2 class="text-2xl font-bold text-slate-800 mb-4 text-center lg:text-left">
                            {selectedPatient.name}
                          </h2>
                          
                          <div class="flex flex-wrap gap-3 mb-6 justify-center lg:justify-start">
                            {#each [selectedPatient.age, selectedPatient.disease, selectedPatient.persona] as tag}
                              <span class="px-3 py-1.5 bg-slate-200 rounded-full text-sm font-medium text-slate-600">
                                {tag}
                              </span>
                            {/each}
                          </div>
                          
                          <p class="text-lg text-slate-600 leading-normal text-center w-8/12 lg:text-left">
                            {selectedPatient.bio}
                          </p>
                        </div>
                      </div>
                    </div>
                  {:else}
                    <div class="space-y-8 px-8">
                      <div class="flex flex-col md:flex-row w-full justify-between items-center gap-6">
                        <img 
                          src={selectedPatient.img} 
                          alt={selectedPatient.name}
                          class="w-28 h-28 rounded-full mx-auto object-cover shadow-md"
                        />
                        <SentimentGauge 
                          value={currentCard.sentiment} 
                          label="Stage Sentiment"
                        />
                      </div>
                      <div class="flex flex-col md:flex-row w-full justify-between items-center gap-4">
                        <h2 class="text-base font-bold text-slate-800">
                          {selectedPatient.name}
                        </h2>
                        <div class="flex flex-wrap gap-2 justify-center md:justify-start">
                          {#each [selectedPatient.age, selectedPatient.disease, selectedPatient.persona] as tag}
                            <span class="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-slate-600 shadow-sm">
                              {tag}
                            </span>
                          {/each}
                        </div>
                      </div>

                      <div class="flex flex-col lg:flex-row gap-8 w-full" bind:clientWidth={containerWidth}>
                        {#if currentCard.quadrantData}
                          <div class="flex-1 bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-sm text-slate-600 mb-4">Patient Journey Progress</h3>
                            <QuadrantChart
                              data={currentCard.quadrantData}
                              width={chartWidth}
                              height={300}
                            />
                          </div>
                        {/if}
                        {#if currentCard.topics}
                          <div class="flex-1 bg-white rounded-xl shadow-sm p-6">
                            <h3 class="text-sm text-slate-600 mb-4">Most Frequent Discussion Topics</h3>
                            <TopicBarChart
                              data={currentCard.topics}
                              width={chartWidth}
                              height={300}
                              title="Most Frequent Discussion Topics"
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
        <div class="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t px-8 py-4 rounded-b-2xl flex justify-between items-center">
          <div class="text-sm text-slate-400">
            {#if currentCard?.context}
              {currentCard.context}
            {/if}
          </div>
          <div class="flex gap-4">
            {#if current > 0}
              <button
                on:click={handleBack}
                class="px-6 py-2.5 rounded-full bg-white text-orange-600 border-2 border-orange-600 
                       hover:bg-orange-50 transition-all duration-200 flex items-center justify-center font-medium shadow-sm"
              >
                ← Back
              </button>
            {/if}
            {#if current < (BASE_CARD_TYPES.length * 2) - 1}
              <button
                on:click={handleNext}
                class="px-6 py-2.5 rounded-full bg-orange-600 text-white hover:bg-orange-700 
                       transition-all duration-200 flex items-center justify-center font-medium shadow-sm"
              >
                Continue →
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
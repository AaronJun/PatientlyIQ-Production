<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { spring } from 'svelte/motion';
  import * as d3 from 'd3';
  import "carbon-components-svelte/css/all.css";
  import QuadrantChart from './PatientQuadrantAnalysis.svelte';
  import SentimentGauge from './SentimentGauge.svelte';
  import TopicBarChart from './TopicBarChart.svelte';
  
  export let patients;
  export let isVisible = false;
  export let current = 0;
  export let transitionDuration = 6000;
  
  let chartContainer;
  let containerWidth;
  let containerHeight;
  
  const CARD_TYPES = ['Bio', 'Initial Response', 'First Steps', 'Moving Forward'];
  
  $: patient = patients[current] || null;
  
  function closeModal(e) {
    if (e.type === 'keydown' && e.key === 'Escape' || e.target === e.currentTarget) {
      dispatch('close');
    }
  }
  
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<svelte:window on:keydown={closeModal}/>

{#if isVisible && patient}
  <div 
    class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 py-8 px-8 overflow-hidden"
    on:click={closeModal}
    transition:fade={{ duration: 400 }}
  >
    <div class="relative w-full max-w-3xl h-[80vh]">
      <div class="w-full h-full bg-white rounded-2xl shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-8 py-4 border-b rounded-t-2xl">
          <nav class="flex items-center justify-center text-sm font-medium gap-3">
            {#each CARD_TYPES as type, i}
              <button 
                on:click={() => current = i}
                class="group flex items-center"
              >
                <div class="px-4 py-2 rounded-full transition-all duration-200 {
                  i === current ? 'bg-orange-100 text-orange-700 font-semibold shadow-sm' : 
                  i < current ? 'text-orange-600 hover:bg-orange-50' : 'text-slate-400 hover:text-slate-600'
                }">
                  {type}
                </div>
                {#if i < CARD_TYPES.length - 1}
                  <div class="mx-2 text-slate-300">→</div>
                {/if}
              </button>
            {/each}
          </nav>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
          {#each [current] as n (n)}
            <div
              in:fly={{ x: 200, duration: 300, opacity: 0 }}
              out:fly={{ x: -200, duration: 300, opacity: 0 }}
              class="h-full"
            >
              <div class="p-8">
                {#if current === 0}
                  <div class="grid gap-8">
                    <div class="space-y-6">
                        <img 
                          src={patient.photoUrl} 
                          alt={patient.name}
                          class="w-52 h-52 rounded-full object-cover"
                        />
                    </div>
                          
                    <p class="text-lg text-slate-800 font-medium">
                      "{patient.quote}"
                    </p>     
                    
                    <div class="space-y-8">
                      <div>
                        <h2 class="text-xl font-bold text-slate-800 mb-4">
                          {patient.name}
                        </h2>
                        
                        <div class="flex flex-wrap gap-3 mb-6">
                          {#each [patient.age, patient.disease, patient.persona] as tag}
                            <span class="px-2 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                              {tag}
                            </span>
                          {/each}
                        </div>
                      </div>
                 <p class="text-slate-600">
                        {patient.bio}
                      </p>
                      
                    </div>
                  </div>
                {:else}
                  <div class="grid lg:grid-cols-[1fr,2fr] gap-8">
                    <div class="space-y-6">
                      <h2 class="text-sm font-bold text-slate-800">
                        {patient.name}
                      </h2>
                      <div class="flex flex-wrap gap-3">
                        {#each [patient.age, patient.disease, patient.persona] as tag}
                        <span class="px-2 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                        {tag}
                          </span>
                        {/each}
                      </div>
                      <img 
                        src={patient.photoUrl} 
                        alt={patient.name}
                        class="w-32 h-32 rounded-full object-cover"
                      />
                      <div class="text-sm text-orange-600 font-semibold">
                        {patient.context}
                      </div>
                      <p class="text-lg text-slate-800">
                        "{patient.quote}"
                      </p>
                      {#if patient.sentiment}
                      <div>
                        <SentimentGauge 
                          value={patient.sentiment} 
                          label="Stage Sentiment"
                        />
                      </div>
                    {/if}
                    </div>

                    <div class="space-y-8" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>

                        {#if patient.quadrantData}
                          <div class="bg-slate-50 rounded-2xl p-6 shadow-sm">
                            <QuadrantChart
                              data={patient.quadrantData}
                              width={Math.min(containerWidth - 48, 600)}
                              height={300}
                            />
                          </div>
                        {/if}
                        {#if patient.topics}
                          <div class="bg-slate-50 rounded-2xl p-6 shadow-sm">
                            <TopicBarChart
                              data={patient.topics}
                              width={Math.min(containerWidth - 48, 600)}
                              height={300}
                              title="Most Frequent Discussion Topics"
                            />
                          </div>
                        {/if}

                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t px-8 py-4 rounded-b-2xl flex justify-end gap-4">
          {#if current > 0}
            <button
              on:click={() => current = Math.max(0, current - 1)}
              class="px-6 py-2.5 rounded-full bg-white text-orange-600 border-2 border-orange-600 
                     hover:bg-orange-50 transition-all duration-200 flex items-center justify-center font-medium shadow-sm"
            >
              ← Back
            </button>
          {/if}
          {#if current < CARD_TYPES.length - 1}
            <button
              on:click={() => current = Math.min(current + 1, CARD_TYPES.length - 1)}
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
{/if}
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { spring } from 'svelte/motion';
  import * as d3 from 'd3';
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
class="fixed inset-0 bg-gray-900/85 flex items-center justify-center z-50 overflow-hidden"
on:click={closeModal}
transition:fade={{ duration: 800 }}
>
<div class="relative w-full max-w-5xl mx-4 h-[85vh]">
  <div class="w-full h-full bg-white rounded-xl shadow-2xl flex flex-col">
    <!-- Breadcrumbs -->
    <div class="sticky top-0 z-10 bg-white px-8 py-4 border-b">
      <div class="flex items-center justify-center text-sm font-medium gap-2">
        {#each CARD_TYPES as type, i}
          <button 
            on:click={() => current = i}
            class="flex items-center"
          >
            <div class="px-4 py-2 rounded-full transition-colors cursor-pointer hover:bg-indigo-50 {
              i === current ? 'bg-indigo-100 text-indigo-700 font-semibold' : 
              i < current ? 'text-indigo-700' : 'text-gray-400'
            }">
              {type}
            </div>
            {#if i < CARD_TYPES.length - 1}
              <div class="mx-2 text-gray-400">→</div>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto">
      {#each [current] as n (n)}
        <div
          in:fly={{ x: 300, duration: 300 }}
          out:fly={{ x: -300, duration: 300 }}
          class="h-full"
        >
          <div class="p-8">
            {#if current === 0}
              <div class="flex flex-col lg:flex-row gap-8">
                <div class="space-y-6">
                  <div class="aspect-square lg:aspect-auto lg:h-[400px] rounded-xl overflow-hidden">
                    <img 
                      src={patient.photoUrl} 
                      alt={patient.name}
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <p class="text-gray-700 leading-relaxed">
                    {patient.bio}
                  </p>
                </div>
                <div class="space-y-8">
                  <div>
                    <h2 class="text-3xl font-bold text-gray-900 mb-3">
                      {patient.name}
                    </h2>
                    <div class="flex flex-wrap gap-3 mb-4">
                      <span class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                        {patient.age}
                      </span>
                      <span class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                        {patient.disease}
                      </span>
                      <span class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                        {patient.persona}
                      </span>
                    </div>
                  </div>
                  <blockquote class="text-xl text-gray-800 font-medium">
                    "{patient.quote}"
                  </blockquote>
                  {#if patient.sentiment}
                    <div class="w-48">
                      <SentimentGauge 
                        value={patient.sentiment} 
                        label="Overall Sentiment"
                      />
                    </div>
                  {/if}
                  {#if patient.topics}
                    <div class="h-64">
                      <TopicBarChart
                        data={patient.topics}
                        width={350}
                        height={220}
                        title="Key Topics"
                      />
                    </div>
                  {/if}
                </div>
              </div>
            {:else}
                  <div class="space-y-8">
                    <div class="flex flex-col lg:flex-row gap-8">
                      <img 
                        src={patient.photoUrl} 
                        alt={patient.name}
                        class="w-40 h-40 rounded-xl object-cover flex-shrink-0"
                      />
                      <div>
                        <div class="text-sm text-orange-600 font-semibold mb-3">
                          {patient.context}
                        </div>
                        <blockquote class="text-xl text-gray-800 mb-6">
                          "{patient.quote}"
                        </blockquote>
                        {#if patient.sentiment}
                          <div class="w-32">
                            <SentimentGauge 
                              value={patient.sentiment} 
                              label="Current Sentiment"
                            />
                          </div>
                        {/if}
                      </div>
                    </div>
                    
                    <div class="grid lg:grid-cols-2 gap-8" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
                      <div class="bg-gray-50 rounded-xl p-6">
                        {#if containerWidth && containerHeight && patient.quadrantData}
                          <QuadrantChart
                            data={patient.quadrantData}
                            width={Math.min(containerWidth / 2 - 48, 500)}
                            height={300}
                          />
                        {/if}
                      </div>
                      <div class="bg-gray-50 rounded-xl p-6">
                        {#if patient.topics}
                          <TopicBarChart
                            data={patient.topics}
                            width={Math.min(containerWidth / 2 - 48, 500)}
                            height={300}
                            title="Most Frequent Discussion Topics"
                          />
                        {/if}
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>

        <!-- Navigation -->
        <div class="sticky bottom-0 bg-white border-t px-8 py-4 flex justify-end gap-4">
          {#if current > 0}
            <button
              on:click={() => current = Math.max(0, current - 1)}
              class="px-6 py-2.5 rounded-full bg-white text-orange-600 border-2 border-orange-600 
                     hover:bg-orange-50 transition-colors flex items-center justify-center font-medium"
            >
              ← Back
            </button>
          {/if}
          {#if current < CARD_TYPES.length - 1}
            <button
              on:click={() => current = Math.min(current + 1, CARD_TYPES.length - 1)}
              class="px-6 py-2.5 rounded-full bg-orange-600 text-white hover:bg-orange-700 
                     transition-colors flex items-center justify-center font-medium"
            >
              Continue →
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { spring } from 'svelte/motion';
    import QuadrantChart from './PatientQuadrantAnalysis.svelte';
    import SentimentGauge from './SentimentGauge.svelte';
    import TopicBarChart from './TopicBarChart.svelte';
    
    export let patients;
    export let isVisible = false;
    export let current = 0;
    
    let chartContainer;
    let containerWidth;
    let containerHeight;
    
    const CARD_TYPES = ['Bio', 'Initial Response', 'First Steps', 'Clinical Trial'];
    
    // Get current patient data
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
    class="fixed inset-0 bg-gray-900/85 flex items-center justify-center z-50"
    on:click={closeModal}
    transition:fade={{ duration: 200 }}
  >
    <div class="relative w-[75.9375vh] h-[55vh] max-w-4xl">
      <div class="w-full h-full relative overflow-hidden rounded-lg bg-white">
        {#each [current] as n (n)}
          <div
            in:fly={{ x: 300, duration: 300 }}
            out:fly={{ x: -300, duration: 300 }}
            class="absolute inset-0 p-6"
          >
            <!-- Navigation -->
            <div class="flex items-center justify-center mb-6 text-sm font-medium">
              {#each CARD_TYPES as type, i}
                <div 
                  class="px-3 py-1 rounded transition-colors {
                    i === current 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : i < current 
                        ? 'text-indigo-700' 
                        : 'text-gray-500'
                  }"
                >
                  {type}
                </div>
                {#if i < CARD_TYPES.length - 1}
                  <div class="mx-2 text-gray-400">→</div>
                {/if}
              {/each}
            </div>

            <!-- Content -->
            {#if current === 0}
              <div class="grid grid-cols-2">
                <div class="w-64 h-96 mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={patient.photoUrl} 
                    alt={patient.name}
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1">
                  <div class="mb-4 max-w-72">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">
                      {patient.name}
                    </h2>
                    <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>{patient.age}</span>
                      <span>{patient.disease}</span>
                      <span>{patient.persona}</span>
                    </div>
                  </div>
                  <div class="max-w-72 text-xl text-gray-800 font-medium mb-6">
                    "{patient.quote}"
                  </div>
                  <div class="space-y-6">
                    {#if patient.sentiment}
                      <div class="w-48">
                        <SentimentGauge 
                          value={patient.sentiment} 
                          label="Overall Sentiment"
                        />
                      </div>
                    {/if}
                    {#if patient.topics}
                      <div class="w-full h-48">
                        <TopicBarChart
                          data={patient.topics}
                          width={300}
                          height={180}
                          title="Key Topics"
                        />
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {:else}
              <div class="flex flex-col h-full gap-6">
                <div class="flex items-start gap-6">
                  <img 
                    src={patient.photoUrl} 
                    alt={patient.name}
                    class="w-32 h-32 rounded-lg object-cover"
                  />
                  <div class="flex-2">
                    <div class="text-sm text-indigo-600 font-medium mb-2">
                      {patient.context}
                    </div>
                    <div class="text-lg text-gray-800 mb-4">
                      "{patient.quote}"
                    </div>
                    {#if patient.sentiment}
                      <div class="w-48">
                        <SentimentGauge 
                          value={patient.sentiment} 
                          label="Current Sentiment"
                        />
                      </div>
                    {/if}
                  </div>
                </div>
                
                <!-- Charts Section -->
                <div class="flex-1 grid max-h-20 grid-cols-2 gap-6" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
                  <div class="bg-gray-50 rounded-lg p-6">
                    {#if containerWidth && containerHeight && patient.quadrantData}
                      <QuadrantChart
                        data={patient.quadrantData}
                        width={containerWidth / 2 - 48}
                        height={200}
                      />
                    {/if}
                  </div>
                  <div class="bg-gray-50 rounded-lg p-6">
                    {#if patient.topics}
                      <TopicBarChart
                        data={patient.topics}
                        width={containerWidth / 2 - 48}
                        height={200}
                        title="Current Topics"
                      />
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/each}

        <!-- Navigation -->
        <div class="absolute bottom-6 right-6 flex gap-3">
          {#if current > 0}
            <button
              on:click={() => current = Math.max(0, current - 1)}
              class="px-4 py-2 rounded-full bg-white text-indigo-600 border border-indigo-600 
                     hover:bg-indigo-50 transition-colors flex items-center justify-center"
            >
              ← Back
            </button>
          {/if}
          {#if current < CARD_TYPES.length - 1}
            <button
              on:click={() => current = Math.min(current + 1, CARD_TYPES.length - 1)}
              class="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 
                     transition-colors flex items-center justify-center"
            >
              Continue →
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
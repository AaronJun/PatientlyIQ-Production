<script lang="ts">
    import { spring } from 'svelte/motion';
    import { fade } from 'svelte/transition';
    import WordCloud from './WordCloud.svelte';
    
    export let patients;
    export let isVisible = false;
    export let current = 0;
    
    const SLIDE_DURATION = 5000;
    
    $: currentPatientIndex = Math.floor(current / 3);
    $: currentCardInPatient = current % 3;
    $: totalPatients = Math.ceil(patients.length / 3);
  
    function mod(n: number, m: number): number {
        return ((n % m) + m) % m;
    }
    
    function closeModal(e: MouseEvent | KeyboardEvent) {
        if (e instanceof KeyboardEvent) {
            if (e.key === 'Escape') isVisible = false;
            return;
        }
        
        if (e.target === e.currentTarget) {
            isVisible = false;
        }
    }
    
    function getSentimentColor(value: string): string {
        const sentiments = {
            "1": "#FF4136",
            "2": "#FF851B",
            "3": "#FFDC00",
            "4": "#2ECC40",
            "5": "#01FF70"
        };
        return sentiments[value] || "#DDDDDD";
    }
  
    function goToCard(cardIndex: number) {
        current = (currentPatientIndex * 3) + cardIndex;
    }
  </script>
  
  <svelte:window on:keydown={closeModal}/>
  
  {#if isVisible}
  <div 
    class="fixed inset-0 bg-gray-900/85 flex items-center justify-center z-50"
    on:click={closeModal}
    transition:fade={{ duration: 200 }}
  >
    <div class="relative w-[75.9375vh] h-[55vh] max-w-[1080px] max-h-[1920px]">
    
        <div class="w-full h-full relative overflow-hidden rounded-sm bg-white">
            {#each patients as story, idx}
                <div 
                    class="absolute w-full h-full transition-transform duration-500 ease-in-out bg-white p-8"
                    style="transform: translateX({(idx - current) * 100}%)"
                    class:active={idx === current}
                >
                    <div class="h-full flex flex-col gap-6">
                        {#if story.type === 'wordcloud'}
                            <div class="patient-info">
                                <div>
                                    <img 
                                        src={story.photoUrl} 
                                        alt={story.name}
                                        class="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div class="patient-bio grid grid-cols-3">
                                        <h2 class="text-base font-semibold mt-2 col-span-3">{story.name}</h2>
                                        <div class="text-sm text-gray-600 col-span-3">{story.persona}</div>
                                        <span class="text-xs text-gray-600">{story.age} years old</span>
                                        <div class="text-xs text-gray-600">{story.disease}</div>
                                       
                                    </div>
                                </div>
                            </div>
                            <WordCloud words={story.words} context={story.context} />
                        {:else}
                            <div>
                                <div class="flex gap-4 items-center mb-4">
                                    <img 
                                        src={story.photoUrl} 
                                        alt={story.name}
                                        class="w-full h-32 rounded-sm object-cover"
                                    />
                                    
                                    <div>
                                        <h2 class="text-lg font-semibold m-0">{story.name}</h2>
                                        <span class="text-sm text-gray-600">{story.age}</span>
                                        <div class="text-sm text-gray-600 mt-1">{story.disease}</div>
                                        <div class="text-sm text-gray-600 mt-1">{story.persona}</div>
                                    </div>
                                </div>
                                <div class="text-sm text-red-500 font-medium mt-2">{story.context}</div>
                            </div>
                            
                            <div class="text-base text-gray-800 leading-relaxed  flex-grow">"{story.quote}"</div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                {#each ['Treatment Sentiment', 'Trial Sentiment', 'Medical Literacy', 'Financial Stability'] as metric, i}
                                    <div class="flex flex-col gap-2">
                                        <span class="text-xs text-gray-600">{metric}</span>
                                        <div class="h-1 rounded" style="background: {getSentimentColor(story[metric.toLowerCase().replace(' ', '-')])}" />
                                    </div>
                                {/each}
                            </div>
                        {/if}
  
                        <div class="flex justify-center gap-3 mt-6">
                            {#each [0, 1, 2] as cardIndex}
                                <button
                                    class="w-2 h-2 rounded-full bg-red-500/20 p-0 relative overflow-hidden transition-transform duration-200 hover:bg-red-500/50"
                                    class:scale-120={cardIndex === currentCardInPatient}
                                    on:click={() => goToCard(cardIndex)}
                                    aria-label={`Go to card ${cardIndex + 1}`}
                                >
                                    <div class="absolute inset-0 bg-red-500 origin-left scale-x-0"
                                         class:animate-progress={cardIndex === currentCardInPatient} />
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
  
        <div class="absolute top-1/2 -translate-y-1/2 -left-12 -right-12 flex justify-between">
            <button 
                class="w-12 h-12 rounded-full bg-white/80 hover:bg-red-500 hover:text-white transition-colors"
                on:click={() => current = mod(current - 1, patients.length)}
            >←</button>
            <button 
                class="w-10 h-10 rounded-full bg-white/80 hover:bg-red-500 hover:text-white transition-colors"
                on:click={() => current = mod(current + 1, patients.length)}
            >→</button>
        </div>
    </div>
  </div>
  {/if}
  
  <style>
  @keyframes progress {
      from { transform: scaleX(0); }
      to { transform: scaleX(1); }
  }
  
  .scale-120 {
      transform: scale(1.2);
  }
  
  .animate-progress {
      animation: progress 5s linear forwards;
  }

  .patient-info {
      display: flex;
      gap: 1rem;
      background-color: #FCFCF4;
  }

  .patient-bio {
  }

  </style>
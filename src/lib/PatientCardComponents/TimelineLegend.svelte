<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { getSentimentColor } from '$lib/utils';
    import "carbon-components-svelte/css/all.css";
  
    export let activeSentiment: string | null = null;
    export let activePersona: string | null = null;
  
    const dispatch = createEventDispatcher();
    const sentiments = ['Positive', 'Neutral', 'Negative'];
    const personas = ['Patient', 'Caregiver'];
  
    function handleInteraction(type: 'sentiment' | 'persona', value: string, isActive: boolean) {
      dispatch('legendInteraction', { type, value, isActive });
    }
  </script>
  
  <div class="legend">
    <h3>Legend</h3>
    <div class="legend-section">
      <h4>Sentiment</h4>
      <div class="legend-items">
        {#each sentiments as sentiment}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div 
            class="legend-item" 
            class:active={activeSentiment === sentiment}
            on:mouseenter={() => handleInteraction('sentiment', sentiment, true)}
            on:mouseleave={() => handleInteraction('sentiment', sentiment, false)}
            on:click={() => handleInteraction('sentiment', sentiment, activeSentiment !== sentiment)}
          >
            <div class="color-box" style="background-color: {getSentimentColor(sentiment)}"></div>
            <span>{sentiment}</span>
          </div>
        {/each}
      </div>
    </div>
    <div class="legend-section">
      <h4>Persona</h4>
      <div class="legend-items">
        {#each personas as persona}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div 
            class="legend-item" 
            class:active={activePersona === persona}
            on:mouseenter={() => handleInteraction('persona', persona, true)}
            on:mouseleave={() => handleInteraction('persona', persona, false)}
            on:click={() => handleInteraction('persona', persona, activePersona !== persona)} 
          >
            <div class="icon-box">
              {#if persona === 'Patient'}
                <svg width="16" height="16" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="#36466B" />
                </svg>
              {:else}
                <svg width="16" height="16" viewBox="0 0 100 100">
                  <rect width="80" height="80" x="10" y="10" fill="#F56900" />
                </svg>
              {/if}
            </div>
            <span>{persona}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
  
  <style>
    .legend {
      margin-top: 1rem;
      padding: 0.5rem;
      border-top: 1px solid #ccc;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  
    h3 {
      margin: 1rem 0 1rem 0;
      font-weight: 800;
      font-size: 1rem;
    }
  
    h4 {
      margin: 0.5rem 0;
      font-weight: 600;
      font-size: 0.9rem;
    }
  
    .legend-section {
      margin-bottom: 1rem;
    }
  
    .legend-items {
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
    }
  
    .legend-item {
      display: flex;
      align-items: center;
      gap: .45rem;
      cursor: pointer;
      padding: 0 1.15rem 0 1.15rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
  
    .legend-item:hover, .legend-item.active {
      scale: 1.15;
      font-weight: 600;
    }
  
    .color-box {
      width: 1rem;
      height: 1rem;
      border-radius: 100px;
      border: .25px solid #3e3e3e;
    }
  
    .icon-box {
      width: 1rem;
      height: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  </style>
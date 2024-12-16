<script lang="ts">
  import { spring } from 'svelte/motion';
  import { fade } from 'svelte/transition';
  import WordCloud from './WordCloud.svelte';
  
  export let patients;
  export let isVisible = false;
  export let current = 0;
  
  const SLIDE_DURATION = 5000;
  
  // Calculate which patient and card we're currently viewing
  $: currentPatientIndex = Math.floor(current / 3);
  $: currentCardInPatient = current % 3;
  $: totalPatients = Math.ceil(patients.length / 3);

  function mod(n: number, m: number): number {
      return ((n % m) + m) % m;
  }
  
  function closeModal(e: MouseEvent) {
      if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
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

{#if isVisible}
<div 
  class="modal-backdrop"
  on:click={closeModal}
  transition:fade={{ duration: 200 }}
>
  <div class="modal-content">
      <div class="carousel">
          {#each patients as story, idx}
              <div 
                  class="card" 
                  style="transform: translateX({(idx - current) * 100}%)"
                  class:active={idx === current}
              >
                  <div class="card-content">
                      {#if story.type === 'wordcloud'}
                          <div class="patient-info">
                              <div class="profile-section">
                                  <img 
                                      src={story.photoUrl} 
                                      alt={story.name}
                                      class="profile-photo"
                                  />
                                  <div class="patient-header">
                                      <h2>{story.name}</h2>
                                      <span class="age">{story.age}</span>
                                      <div class="disease">{story.disease}</div>
                                      <div class="persona">{story.persona}</div>
                                  </div>
                              </div>
                          </div>
                          <WordCloud words={story.words} context={story.context} />
                      {:else}
                          <div class="patient-info">
                              <div class="profile-section">
                                  <img 
                                      src={story.photoUrl} 
                                      alt={story.name}
                                      class="profile-photo"
                                  />
                                  <div class="patient-header">
                                      <h2>{story.name}</h2>
                                      <span class="age">{story.age}</span>
                                      <div class="disease">{story.disease}</div>
                                      <div class="persona">{story.persona}</div>
                                  </div>
                              </div>
                              <div class="context">{story.context}</div>
                          </div>
                          
                          <div class="quote">"{story.quote}"</div>
                          
                          <div class="metrics">
                              <div class="metric">
                                  <span class="label">Treatment Sentiment</span>
                                  <div class="indicator" style="background: {getSentimentColor(story['treatment-sentiment'])}"></div>
                              </div>
                              <div class="metric">
                                  <span class="label">Trial Sentiment</span>
                                  <div class="indicator" style="background: {getSentimentColor(story['trial-sentiment'])}"></div>
                              </div>
                              <div class="metric">
                                  <span class="label">Medical Literacy</span>
                                  <div class="indicator" style="background: {getSentimentColor(story['medical-literacy'])}"></div>
                              </div>
                              <div class="metric">
                                  <span class="label">Financial Stability</span>
                                  <div class="indicator" style="background: {getSentimentColor(story['financial-stability'])}"></div>
                              </div>
                          </div>
                      {/if}

                      <!-- Card Indicators -->
                      <div class="card-indicators">
                          {#each [0, 1, 2] as cardIndex}
                              <button
                                  class="indicator-dot"
                                  class:active={cardIndex === currentCardInPatient}
                                  on:click={() => goToCard(cardIndex)}
                                  aria-label={`Go to card ${cardIndex + 1}`}
                              >
                                  <div class="indicator-fill" />
                              </button>
                          {/each}
                      </div>
                  </div>
              </div>
          {/each}
      </div>

      <div class="navigation">
          <button 
              class="nav-button prev" 
              on:click={() => current = mod(current - 1, patients.length)}
          >←</button>
          <button 
              class="nav-button next" 
              on:click={() => current = mod(current + 1, patients.length)}
          >→</button>
      </div>
  </div>
</div>
{/if}

<style>
  .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(22, 22, 22, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
  }

  .modal-content {
      position: relative;
      width: 30.9375vh;
      height: 55vh;
      max-width: 1080px;
      max-height: 1920px;
  }

  .carousel {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      background: white;
  }

  .card {
      position: absolute;
      width: 100%;
      height: 100%;
      transition: transform 0.5s ease;
      background: white;
      padding: 2rem;
  }

  .profile-section {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
  }

  .profile-photo {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      object-fit: cover;
  }

  .context {
      font-size: 0.875rem;
      color: #ff5151;
      margin-top: 0.5rem;
      font-weight: 500;
  }

  .card-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
  }

  .patient-header {
      flex-grow: 1;
  }

  .patient-info h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
  }

  .age {
      color: #666;
      font-size: 0.875rem;
  }

  .disease {
      font-size: 1rem;
      color: #333;
      margin-top: 0.25rem;
  }

  .persona {
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.25rem;
  }

  .quote {
      font-size: 1rem;
      line-height: 1.6;
      color: #333;
      font-style: italic;
      flex-grow: 1;
  }

  .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
  }

  .metric {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
  }

  .label {
      font-size: 0.8rem;
      color: #666;
  }

  .indicator {
      height: 4px;
      border-radius: 2px;
  }

  .card-indicators {
      display: flex;
      justify-content: center;
      gap: 0.75rem;
      margin-top: 1.5rem;
  }

  .indicator-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: rgba(255, 81, 81, 0.2);
      border: none;
      padding: 0;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
  }

  .indicator-dot.active {
      background: rgba(255, 81, 81, 0.2);
      transform: scale(1.2);
  }

  .indicator-dot:not(.active):hover {
      background: rgba(255, 81, 81, 0.5);
  }

  .indicator-fill {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #ff5151;
      transform: scaleX(0);
      transform-origin: left;
  }

  .indicator-dot.active .indicator-fill {
      animation: fillProgress 5s linear forwards;
  }

  @keyframes fillProgress {
      from {
          transform: scaleX(0);
      }
      to {
          transform: scaleX(1);
      }
  }

  .navigation {
      position: absolute;
      top: 50%;
      left: -3rem;
      right: -3rem;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
  }

  .nav-button {
      background: rgba(255, 255, 255, 0.8);
      border: none;
      border-radius: 50%;
      width: 2.5rem;
      height: 2.5rem;
      cursor: pointer;
      transition: background-color 0.3s;
  }

  .nav-button:hover {
      background: #ff1515;
      color: white;
  }
</style>
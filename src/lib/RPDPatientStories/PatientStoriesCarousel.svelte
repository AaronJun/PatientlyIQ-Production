<script lang="ts">
   
   import { spring } from 'svelte/motion';
    import { fade } from 'svelte/transition';
    import { selectedQuote, selectedPatient, selectedImage } from './patientCardStore';
    import { patientStories } from './patient-stories-data';
    import { onMount } from 'svelte';

    onMount(() => {
      selectedPatient.set(patientStories[0]);
      selectedQuote.set(patientStories[0].quote);
      selectedImage.set(patientStories[0].img);
    });

    export let patients;
    export let isVisible = false;
    export let current = 0;
    
    let i = spring(0, { precision: 0.001 });
    let dragging = false;
    let i_start = null;
    let drag_start = null;
    let width = null;
  
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
  
    $: {
      if (patients?.[current]) {
        selectedQuote.set(patients[current].quote);
        selectedPatient.set(patients[current]);
        selectedImage.set(patients[current].photoUrl);
      }
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
        {#each patients as patient, idx}
          <div 
            class="card" 
            style="transform: translateX({(idx - current) * 100}%)"
            class:active={idx === current}
          >
            <div class="card-content">
              <div class="patient-info">
                <div class="patient-header">
                  <h2>{patient.name}</h2>
                  <span class="age">{patient.age}</span>
                </div>
                <div class="disease">{patient.disease}</div>
                <div class="persona">{patient.persona}</div>
              </div>
  
              <div class="quote">"{patient.quote}"</div>
  
              <div class="metrics">
                <div class="metric">
                  <span class="label">Treatment Sentiment</span>
                  <div class="indicator" style="background: {getSentimentColor(patient['treatment-sentiment'])}"></div>
                </div>
                <div class="metric">
                  <span class="label">Trial Sentiment</span>
                  <div class="indicator" style="background: {getSentimentColor(patient['trial-sentiment'])}"></div>
                </div>
                <div class="metric">
                  <span class="label">Medical Literacy</span>
                  <div class="indicator" style="background: {getSentimentColor(patient['medical-literacy'])}"></div>
                </div>
                <div class="metric">
                  <span class="label">Financial Stability</span>
                  <div class="indicator" style="background: {getSentimentColor(patient['financial-stability'])}"></div>
                </div>
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
  
    .card-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  
    .patient-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .patient-info h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }
  
    .age {
      color: #666;
      font-size: 0.9rem;
    }
  
    .disease {
      font-size: 1.1rem;
      color: #333;
      margin-top: 0.5rem;
    }
  
    .persona {
      font-size: 0.9rem;
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
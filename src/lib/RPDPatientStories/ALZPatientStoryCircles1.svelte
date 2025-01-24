<script lang="ts">
  import { onMount } from 'svelte';
  import PatientStoriesCarousel from './PatientStoriesCarousel.svelte';
  import patientData from '$lib/data/patient-stories.json';
  import "carbon-components-svelte/css/all.css";

  export let selectedDisease;
  export let selectedId;
  
  let isCarouselVisible = false;
  let selectedPatient = null;
  
  $: {
    if (selectedId && patientData.diseases[selectedDisease]) {
      selectedPatient = patientData.diseases[selectedDisease].patients.find(
        p => p.id === selectedId
      );
    }
  }
  
  function handleCircleClick() {
    isCarouselVisible = true;
  }
  
  function handleCarouselClose() {
    isCarouselVisible = false;
  }
</script>

<div class="flex justify-center items-center gap-4">
  <div class="patient-circle-container">
    <button 
      class="story-circle"
      on:click={handleCircleClick}
    >
      {#if selectedPatient?.img}
        <img 
          src={selectedPatient.img} 
          alt={selectedPatient.name}
          class="w-full h-full object-cover"
        />
      {/if}
      <div class="hover-circle"></div>
    </button>
    <span class="patient-name">{selectedPatient?.name || ''}</span>
  </div>
</div>

<PatientStoriesCarousel
  selectedPatient={selectedPatient}
  isVisible={isCarouselVisible}
  on:close={handleCarouselClose}
/>

<style>
  .story-circle {
    width: 10rem;
    height: 10rem;
    border-radius: 100%;
    background: rgba(255, 81, 81, 0.1);
    border: 2.5px solid #ff5151;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    position: relative;
    overflow: hidden;
  }

  .hover-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: rgba(255, 81, 81, 0);
    transition: background-color 0.2s ease;
  }

  .story-circle:hover {
    transform: scale(1.1);
  }

  .story-circle:hover .hover-circle {
    background: rgba(255, 81, 81, 0.3);
  }

  .patient-circle-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .patient-name {
    font-size: 0.75rem;
    color: #666;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
  }
</style>
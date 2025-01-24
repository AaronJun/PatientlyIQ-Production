<script lang="ts">
    import { onMount } from 'svelte';
    import PatientStoriesCarousel from './PatientStoriesCarousel.svelte';
    import patientData from '$lib/data/patient-stories.json';
    import {Cursor_1} from 'carbon-icons-svelte';
    export let selectedDisease;
    export let selectedId;
    
    let isCarouselVisible = false;
    let selectedPatient = null;
    let imageError = false;
    
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
  
    function handleImageError() {
      imageError = true;
    }
</script>
  
<div class="flex justify-center items-center gap-4">
    <div class="patient-circle-container">
      <button 
        class="story-circle"
        on:click={handleCircleClick}
      >
        {#if selectedPatient?.img && !imageError}
          <img 
            src={selectedPatient.img} 
            alt={selectedPatient.name}
            on:error={handleImageError}
            class="w-full h-full object-cover"
          />
        {:else}
          <div class="fallback-circle">
            <span class="text-2xl font-bold text-orange-600">
              {selectedPatient?.name?.[0] || '?'}
            </span>
          </div>
        {/if}
        <div class="hover-circle"></div>
        <div class="click-circle">
            <Cursor_1 size="1.5rem" />
        </div>
      </button>
      <span class="patient-name text-sm font-semibold text-slate-700">{selectedPatient?.name || ''}</span>
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
  
    .fallback-circle {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ff5151;
    }
  
    .hover-circle {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(255, 81, 81, 0);
      transition: background-color 0.2s ease;
    }

    .click-circle {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      width: 2rem;
      height: 2rem;
      background: #ff5151;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
    }
  
    .story-circle:hover {
      transform: scale(1.1);
    }
  
    .story-circle:hover .hover-circle {
      background: rgba(255, 81, 81, 0.3);
    }

    .story-circle:hover .click-circle {
      transform: scale(1.1);
    }
  
    .patient-circle-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
</style>
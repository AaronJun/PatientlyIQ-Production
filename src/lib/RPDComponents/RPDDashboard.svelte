<script lang="ts">
    import { onMount } from 'svelte';
    import HorizontalTimeline from './RPDTimeline.svelte';
    import rpdConstellationData from '../../routes/data/RPDConstellationData.json';
    
    let width = 1000; // You can adjust this or make it responsive
    let currentYear = rpdConstellationData[0].Year;
    let data = rpdConstellationData;
  
    function handleYearChange(event) {
      currentYear = event.detail.year;
    }
  
    onMount(() => {
      // You can add any initialization logic here if needed
    });
  </script>
  
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">RPD PRV Dashboard</h1>
  
    <div class="mb-8">
      <HorizontalTimeline 
        {width} 
        {data} 
        {currentYear}
        on:yearChange={handleYearChange} 
      />
    </div>
  
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 class="text-2xl font-bold mb-4">Timeline Details</h2>
        <p>Current Year: {currentYear}</p>
        <p>Total Entries: {data.length}</p>
        <p>Entries up to {currentYear}: {data.filter(d => +d.Year <= +currentYear).length}</p>
      </div>
    </div>
  </main>
  
  <style>
    /* You can add any global styles here if needed */
  </style>
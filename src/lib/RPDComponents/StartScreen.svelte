<script lang="ts">
    import { Button } from "carbon-components-svelte";
    import { ArrowRight } from 'carbon-icons-svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import advocatesImage from './AdvocatesDith.png';
    import patientImage from './PatientDith.png';
    import familyImage from './Family.png';

    export let active = false;
  
    const dispatch = createEventDispatcher();
  
    function handleExplore() {
      dispatch('explore');
    }

    function handleImageError(event) {
      console.error('Image failed to load:', event);
      event.target.style.display = 'none';
    }

    onMount(() => {
        setTimeout(() => {
            active = true;
        }, 200);
    });
</script>
  
<div class="start-screen" class:active>
    {#if active}
    <div class="image-grid" in:fly="{{ x: 500, duration: 400, delay: 200 }}">
            <img src={advocatesImage} alt="Advocates" class="image" on:error={handleImageError} />
            <img src={patientImage} alt="Patient" class="image" on:error={handleImageError} />
            <img src={familyImage} alt="Family" class="image" on:error={handleImageError} />
        </div>
        <div class="content" 
        in:fly="{{ x: -500, duration: 500, delay: 200 }}">                
        
        <div class="content-column-md">    
        <h3>A Data Narrative</h3>
        <h1>Planting the seeds of rare disease treatment</h1>
        </div>
    
        <div class="content-column">
        <p>Since its launch 12 years ago, a program to incentivize drug development for rare diseases that affect children has led to the approval of dozens of new treatments. Explore the profound impact of this gamechanging program for patients and their loved ones, as well as the positive impact on industry, in our timeline.</p>
            <Button icon={ArrowRight} on:click={handleExplore}>Explore the impact</Button>
        </div>
        </div>
    {/if}
</div>
  
<style>
    .image-grid {
        display: row;
        align-items: center;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .start-screen {
        position: fixed;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        background-color: white;
        padding: 2rem;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
        z-index: 1000;
    }
  
    .start-screen.active {
        transform: translateX(0);
    }
  
    .content {
        max-width: 1200px;
        margin: 0 auto;
        text-align: left;
        display: flex;
        align-content: bottom;
        gap: 4rem;
    }

    .content-column {
        display: flex;
        flex-direction: column;
        width: 1000px;
        border-left: 1px solid #45306e;
        padding-left: 5rem;
    }
 
    .image {
        width: 100%;
        max-width: 400px;
        margin-bottom: 2rem;
    }
  
    h1 {
        font-weight: 200;
        text-transform: capitalize;
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }

    h3 {
        font-weight: 800;
        text-transform: uppercase;
        font-size: .85rem;
        color: #45306e;
        margin-bottom: 1rem;
    }
  
    p {
        margin-bottom: 2rem;
    }
</style>
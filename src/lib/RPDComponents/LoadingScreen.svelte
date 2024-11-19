<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { Button } from "carbon-components-svelte";
  import { ArrowRight } from 'carbon-icons-svelte';
  import SingleCircle from './ScrollySoloCircleChart.svelte';
  import LoadingBeeswarm from './LoadingBeeswarm.svelte';
  import "carbon-components-svelte/css/all.css";

  export let isLoading: boolean;
  export let progress: number = 0;

  const data = [
    { area: "Neurology", count: 149 },
    { area: "Metabolism", count: 131 },
    { area: "Oncology", count: 105 },
    { area: "Hematology", count: 32 },
    { area: "Immunology", count: 25 },
    { area: "Ophthalmology", count: 22 },
    { area: "Dermatology", count: 21 },
    { area: "Other", count: 84 }
  ];

  const sections = [
    {
      id: 1,
      header: "Planting the seeds of rare disease research",
      text: "Rare Pediatric Disease (RPD) designations are like seeds of hope, planted to nurture the development of new treatments for children with rare diseases."
    },
    {
      id: 2,
      header: "Special Incentives for Growth",
      text: "Each seed represents a commitment to research and develop treatments for a specific rare pediatric condition. When the FDA grants an RPD designation, it helps that seed take root through special incentives and support."
    },
    {
      id: 3,
      header: "Hundreds of Potential Breakthroughs",
      text: "From 2013 to 2022, 569 RPD designations that have been granted. Each one represents a seed that could bloom into potential breakthrough for rare disease communities waiting for effective treatments."
    },
    {
      id: 4,
      header: "Diverse Therapeutic Areas",
      text: "These seeds have been planted across different therapeutic areas, each one carefully cultivated to address specific types of rare pediatric conditions. From neurological disorders to metabolic diseases, each color represents a different field of medicine where these treatments are growing"
    },
    {
      id: 5,
      header: "Growing Communities of Research",
      text: "As these seeds of research grow, they create communities of knowledge. Neurology leads with 149 designations, followed by Metabolism with 131 and Oncology with 105. Each cluster represents a growing body of research and potential treatments in its field."
    }
  ];

  let active = false;
  let transitioning = false;
  let beeswarmAnimationComplete = false;
  let activeSection = 0;
  let container;

  const dispatch = createEventDispatcher();

  onMount(() => {
    setTimeout(() => {
      active = true;
    }, 200);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeSection = parseInt(entry.target.dataset.index);
        }
      });
    }, {
      threshold: 0.5
    });

    document.querySelectorAll('.section').forEach(section => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  });

  function handleExplore() {
    transitioning = true;
    setTimeout(() => {
      dispatch('explore');
    }, 500);
  }

  function handleBeeswarmAnimationComplete() {
    beeswarmAnimationComplete = true;
  }
</script>

<div class="screen" class:active class:transitioning>
  {#if active}
    <div class="content-wrapper">
      <!-- Left sticky content -->
      <div class="sticky-content">
        <div class="content-column-md">    
          <h3>A Data Narrative</h3>
          <h1>{sections[activeSection].header}</h1>
          <p>{sections[activeSection].text}</p>
        </div>
      </div>

      <!-- Center sticky visualization -->
      <div class="sticky-viz">
        <SingleCircle {activeSection} />
      </div>

      <!-- Scroll sections -->
      <div class="scroll-sections">
        {#each sections as section, i}
          <div class="section" data-index={i}>
            {#if i === sections.length - 1}
              <div class="final-section">
                <LoadingBeeswarm {data} on:animationComplete={handleBeeswarmAnimationComplete}/>
                {#if isLoading}
                  <div class="progress-bar">
                    <div class="progress" style="width: {progress}%"></div>
                  </div>
                  <p class="progress-text">{progress}% complete</p>
                {:else}
                  <Button icon={ArrowRight} on:click={handleExplore}>Explore the impact</Button>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: 9999;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
  }

  .screen.active {
    transform: translateX(0);
  }

  .screen.transitioning {
    transform: translateX(-100%);
  }

  .content-wrapper {
    display: flex;
    position: relative;
    height: 100%;
  }

  .sticky-content {
    position: fixed;
    left: 0;
    top: 0;
    width: 25vw;
    height: 100vh;
    padding: 2rem;
    background: #f5f5f5;
  }

  .sticky-viz {
    position: fixed;
    left: 25vw;
    width: 75vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .scroll-sections {
    margin-left: 25vw;
    width: 75vw;
  }

  .section {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .final-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
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
    color: #C9623F;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background-color: #eee;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress {
    height: 100%;
    background-color: #C9623F;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.8rem;
    color: #666;
    text-align: center;
    margin-bottom: 0;
  }
</style>
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import SingleCircle from './ScrollySoloCircleChart.svelte';
  import "carbon-components-svelte/css/all.css";
  import { fade } from 'svelte/transition';

  const dispatch = createEventDispatcher();
  const recommendedReading = [
    {
      title: "The Impact of RPD Designations",
      source: "FDA Research Journal",
      url: "#",
      year: "2023"
    },
    {
      title: "Pediatric Drug Development",
      source: "Clinical Research Quarterly",
      url: "#",
      year: "2023"
    },
    {
      title: "Future of Rare Disease Treatment",
      source: "Medicine & Innovation Review",
      url: "#",
      year: "2022"
    }
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
      text: "As these seeds of research grow, they create communities of knowledge. Neurology leads with 149 designations, followed by Metabolism with 131 and Oncology with 105. Each cluster represents a growing body of research and potential treatments in its field. Together, they form a garden of hope for children with rare diseases"
    },
    {
      id: 6,
      header: "Finding Fertile Ground",
      text: "Like seeds finding fertile soil, each RPD designation settles into place, ready to grow into tomorrow's treatments."
    },
    {
      id: 7,
      header: "What the Program Has Grown",
      text: "This program has created new treatments for children with rare diseases, many of whom did not have access to approved options before the ones developed through the RPD PRV program. Let's explore the way these treatments came to be and the impact they have had on the rare disease community."
    }
  ];

  let activeSection = 0;
  let showContinueButton = false;
  let container;

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const newSection = parseInt(entry.target.dataset.index);
          activeSection = newSection;
          
          if (newSection === sections.length - 1) {
            showContinueButton = true;
          }
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

  function handleContinue() {
    dispatch('continue');
  }

  function handleSkip() {
    dispatch('continue');
  }

  function navigateSection(direction: 'next' | 'prev') {
    const newSection = direction === 'next' 
      ? Math.min(activeSection + 1, sections.length - 1)
      : Math.max(activeSection - 1, 0);
    
    if (newSection !== activeSection) {
      activeSection = newSection;
      const sectionElement = document.querySelector(`[data-index="${newSection}"]`);
      sectionElement?.scrollIntoView({ behavior: 'smooth' });
      
      if (newSection === sections.length - 1) {
        showContinueButton = true;
      } else {
        showContinueButton = false;
      }
    }
  }
</script>

<main>
  <!-- Left sticky content -->
  <div class="sticky-content">
    <div class="full-width-header">
      <div class="content-column-header">
        <h3>A Data Narrative</h3>
        <h1>Planting the seeds of rare disease treatment</h1>
      </div>
    </div>
    <h2>{sections[activeSection].header}</h2>
    <p>{sections[activeSection].text}</p>
 
    <!-- Navigation buttons -->
    <div class="navigation-buttons">
      <button 
        class="nav-button"
        on:click={() => navigateSection('prev')}
        disabled={activeSection === 0}
      >
        ← Previous
      </button>
      <button 
        class="nav-button"
        on:click={() => navigateSection('next')}
        disabled={activeSection === sections.length - 1}
      >
        Next →
      </button>
      
    </div>

    <!-- Reading section moved to sidebar bottom -->
    <div class="reading-section">
      <div class="divider"></div>
      <h4>Recommended Reading</h4>
      <div class="reading-list">
        {#each recommendedReading as reading}
          <a href={reading.url} class="reading-item">
            <div class="reading-content">
              <span class="reading-title">{reading.title}</span>
              <div class="reading-meta">
                <span class="reading-source">{reading.source}</span>
                <span class="reading-year">{reading.year}</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </div>
       
    {#if showContinueButton}
      <button 
        class="continue-button"
        on:click={handleContinue}
        transition:fade
      >
        Explore the Timeline
      </button>
    {/if}
  </div>

  <!-- Center sticky visualization -->
  <div class="sticky-viz">
    <div class="skip-button-container">
      <button 
        class="skip-button"
        on:click={handleSkip}
      >
        Skip to Timeline
      </button>
    </div>
    <SingleCircle {activeSection} />
  </div>

  <!-- Scroll sections -->
  <div class="scroll-sections">
    {#each sections as section, i}
      <div class="section" data-index={i} />
    {/each}
  </div>
</main>

<style>
  main {
    display: flex;
    min-height: 100vh;
    background-color: #fff;
    position: relative;
    overflow: hidden;
  }

  .sticky-content {
    position: fixed;
    left: 0;
    top: 10;
    bottom: 10;
    padding-bottom: 5rem;
    width: 25vw;
    height: 90vh;
    border-right: 1px dotted #292F58;
    border-top: 1px dotted #292F58;
    border-bottom: 1px dotted #292F58;
    padding: 2rem;
    background: #f5f5f5;
    display: flex;
    flex-direction: column;
  }
  .sticky-viz {
    position: fixed;
    left: 25vw;
    top: 10;
    width: 75vw;
    padding-left: 2rem;
    height: 100vh;
  }

  .skip-button-container {
    position: absolute;
    top: 5rem;
    right: 4rem;
    z-index: 100;
  }

  .skip-button {
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    color: #C9623F;
    border: 1px solid #C9623F;
    border-radius: 100px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .skip-button:hover {
    background-color: #C9623F;
    color: white;
  }

  .full-width-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 2.5rem;
    margin-bottom: 2.5rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }

  .scroll-sections {
    margin-left: 25vw;
    width: 75vw;
  }


  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .nav-button {
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    color: #292F58;
    border: 1px solid #292F58;
    border-radius: 100px;
    cursor: pointer;
    font-size: 0.725rem;
    font-weight: 400;
    transition: all 0.3s ease;
  }

  .nav-button:hover:not(:disabled) {
    background-color: #C9623F;
    color: white;
  }

  .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #ccc;
    color: #999;
  }


  .section {
    height: 100vh;
  }

  .continue-button {
    margin-top: auto;
    margin-bottom: 10rem;
    padding: 0.75rem 1.5rem;
    background-color: #C9623F;
    color: white;
    border: none;
    border-radius: 100px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s ease;
  }

  .continue-button:hover {
    background-color: #A34E32;
  }

  /* Rest of the styles remain the same */
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #161616;
    margin-bottom: 1rem;
  }

  p {
    line-height: 1.5;
    color: #393939;
  }

  h1 {
    font-weight: 200;
    text-transform: capitalize;
    font-size: 1.745rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: .65rem;
    color: #C9623F;
    margin-bottom: .62rem;
  }

  .reading-section {
    padding-top: 1.5rem;
    background: #f5f5f5;
    margin-bottom: 2rem;
  }

  .divider {
    height: 1px;
    background: #292F58;
    opacity: 0.2;
    margin-bottom: 1.5rem;
  }

  h4 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: .65rem;
    color: #C9623F;
    margin-bottom: 1rem;
  }

  .reading-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .reading-item {
    display: block;
    text-decoration: none;
    padding-top: 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .reading-item:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }

  .reading-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .reading-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    line-height: 1.25;
  }

  .reading-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .reading-source {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .reading-year {
    font-size: 0.75rem;
    color: #9ca3af;
  }

</style>
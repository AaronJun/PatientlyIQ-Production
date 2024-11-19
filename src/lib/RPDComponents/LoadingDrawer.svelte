<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
  
    export let isLoading: boolean;
    export let progress: number;
    
    let showDismissButton = false;
    let isVisible = true;
    let scrollContainer: HTMLElement;
    let sections: HTMLElement[];
    
    onMount(() => {
      sections = Array.from(document.querySelectorAll('.loading-section'));
      
      const observer = new IntersectionObserver(
        (entries) => {
          const lastSection = entries[0];
          if (lastSection.isIntersecting && !isLoading && progress === 100) {
            showDismissButton = true;
          }
        },
        { threshold: 0.8 }
      );
      
      if (sections.length > 0) {
        observer.observe(sections[sections.length - 1]);
      }
      
      return () => observer.disconnect();
    });
    
    function handleDismiss() {
      isVisible = false;
    }
    
    function handleScroll(e: Event) {
      const target = e.target as HTMLElement;
      const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
      
      if (scrollPercentage > 90 && !isLoading && progress === 100) {
        showDismissButton = true;
      }
    }
  </script>
  
  {#if isVisible}
    <div 
      class="loading-drawer"
      transition:fly={{ y: '-100%', duration: 800 }}
    >
      <div 
        class="loading-content"
        bind:this={scrollContainer}
        on:scroll={handleScroll}
      >
        <div class="loading-section">
          <h2>Welcome to the Rare Disease Timeline</h2>
          <p>Scroll to explore the story of rare disease treatment development.</p>
        </div>
        
        <div class="loading-section">
          <h3>Loading Progress</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: {progress}%"></div>
          </div>
          <p>{progress}% Complete</p>
        </div>
        
        <div class="loading-section">
          <h3>About This Visualization</h3>
          <p>This interactive timeline shows the evolution of rare disease treatments and their impact on patient care.</p>
        </div>
        
        <div class="loading-section">
          <h3>How to Navigate</h3>
          <ul>
            <li>Use arrow keys or buttons to move between years</li>
            <li>Click on elements to see detailed information</li>
            <li>Hover over sections to explore data points</li>
          </ul>
        </div>
        
        {#if showDismissButton}
          <div class="dismiss-button-container" transition:fade>
            <button on:click={handleDismiss}>
              Enter Visualization
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
  
  <style>
    .loading-drawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #f8f9fa;
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }
    
    .loading-content {
      height: 100%;
      overflow-y: auto;
      scroll-behavior: smooth;
      padding: 2rem;
    }
    
    .loading-section {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      text-align: center;
    }
    
    .progress-bar {
      width: 80%;
      max-width: 400px;
      height: 8px;
      background-color: #eee;
      border-radius: 4px;
      overflow: hidden;
      margin: 1rem 0;
    }
    
    .progress-fill {
      height: 100%;
      background-color: #C9623F;
      transition: width 0.3s ease;
    }
    
    .dismiss-button-container {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      padding: 1rem;
    }
    
    button {
      background-color: #C9623F;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 100px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: background-color 0.3s ease;
    }
    
    button:hover {
      background-color: #A34E32;
    }
    
    h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 200;
    }
    
    h3 {
      font-weight: 800;
      text-transform: uppercase;
      font-size: 0.85rem;
      color: #C9623F;
      margin-bottom: 1rem;
    }
    
    p {
      font-size: 1.1rem;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }
    
    ul {
      list-style: none;
      padding: 0;
      text-align: left;
      max-width: 600px;
    }
    
    li {
      margin: 1rem 0;
      padding-left: 1.5rem;
      position: relative;
    }
    
    li:before {
      content: "•";
      color: #C9623F;
      position: absolute;
      left: 0;
    }
  </style>
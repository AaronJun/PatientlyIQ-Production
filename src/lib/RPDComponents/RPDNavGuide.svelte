<script lang="ts">
    import { onMount } from 'svelte';
    import {ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronDown, ChevronUp} from 'carbon-icons-svelte';
    import "carbon-components-svelte/css/all.css";
    
    let fourPetalSVG: string;
    let isExpanded = true;

    onMount(async () => {
      const response = await fetch('/Petals/4Petal.svg');
      fourPetalSVG = await response.text();
    });

    function toggleExpand() {
      isExpanded = !isExpanded;
    }
</script>

<div class="navigation-guide-wrapper" class:collapsed={!isExpanded}>
  <button class="toggle-button" on:click={toggleExpand}>
    {#if isExpanded}
      <ChevronDown size={16} />
    {:else}
      <ChevronUp size={16} />
    {/if}
  </button>
  
  <div class="navigation-guide" class:hidden={!isExpanded}>
    <div class="section">
      <h3>How to Navigate</h3>
      <div class="nav">
        <div class="navigation-squares">
          <div class="square"><ArrowUp size="12"/></div>
          <div class="square"><ArrowLeft size="12"/></div>
        </div>
        <p>The up + left keys navigate to the past.</p>
      </div>  

      <div class="nav">
        <div class="navigation-squares">
          <div class="square"><ArrowDown size="12"/></div>
          <div class="square"><ArrowRight size="12"/></div>
        </div>
        <p>The down + right keys navigate to the future.</p>
      </div> 
    </div>
    
    <div class="section">
      <h3>How to Read</h3>
      <div class="cluster-holder">            
        <div class="cluster">
          {@html fourPetalSVG}
        </div>
        <p>Each petal represents one awarded voucher from the year.</p>
      </div>
      <div class="line-holder">
        <div class="vertical-line"></div>
      </div>
      <p>Each stem's height is based on the year's total RPD designations.</p>
    </div>
  </div>
</div>

<style>
  .navigation-guide-wrapper {
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 1000;
    background-color: #F8F9FA;
    transition: height 0.3s ease-in-out;
    height: auto;
  }

  .navigation-guide-wrapper.collapsed {
    border: .25px solid #8d8d8d;
    height: 30px; /* Adjust this value to set the desired height when collapsed */
  }

  .navigation-guide {
    display: flex;
    flex-direction: row;
    gap: 2.25rem;
    background-color: rgba(255, 255, 255, 0.825);
    border: 1px solid #ccc;
    padding: 1rem;
    transition: opacity 0.3s ease-in-out, max-height 0.3s ease-in-out;
    opacity: 1;
    max-height: 20%; /* Adjust this value based on your content's maximum height */
    overflow: hidden;
  }

  .navigation-guide.hidden {
    opacity: 0;
    max-height: 0;
    padding: 0;
    border: none;
  }

  .toggle-button {
    position: absolute;
    top: -0.55rem;
    background-color: #C9623F;
    color: white;
    border: none;
    border-radius: 0px 5px 5px 0;
    width: 5rem;
    height: 1.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 1001;
  }

  .navigation-guide {
    display: flex;
    flex-direction: row;
    gap: 2.25rem;
    background-color: rgba(255, 255, 255, 0.825);
    border: 1px solid #ccc;
    padding: 1rem;
  }

  .section {
    margin-bottom: 15px;
  }

  h3 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: .65rem;
    color: #C9623F;
    margin-bottom: .925rem;
  }

  .cluster {
    width: 50px;
    height: 90px;
    z-index: 999;
    justify-content: center;
  }

  .cluster-holder {
    display: grid;
    grid-template-columns: 1fr 0.495fr;
    width: 100%;
    justify-content: center;
  }

  .nav {
    margin-top: .525rem;
    margin-bottom: .525rem;
  }

  .navigation-squares {
    display: flex;
    flex-direction: row;
    gap: .525rem;
    justify-content: left;
    margin-bottom: 5px;
  }

  .square {
    width: 1.725rem;
    height: 1.725rem;
    background-color: #fff4f0;
    border: 1px solid #d1d1d1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  .vertical-line {
    width: 2px;
    height: 0px;
    z-index: 1;
    background-color: #325846;
  }

  .line-holder {
    display: flex;
    width: 100%;
    margin-top: -1rem;
    flex-direction: row;
    align-content: center;
    justify-content: center;
    gap: 1.25rem;
  }

  p {
    font-size: .825rem;
  }
</style>
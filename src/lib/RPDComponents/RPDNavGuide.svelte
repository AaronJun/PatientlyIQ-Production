<script lang="ts">
  import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  
  let isOpen = false;
  let fourPetalSVG: string;

  onMount(async () => {
    const response = await fetch('/Petals/4Petal.svg');
    fourPetalSVG = await response.text();
  });
</script>

<div class="navigation-drawer" class:open={isOpen}>
  <button 
    class="toggle-button" 
    on:click={() => isOpen = !isOpen}
    aria-label={isOpen ? 'Close navigation guide' : 'Open navigation guide'}
  >
    {#if isOpen}
      <ChevronLeft size={16} />
    {:else}
      <ChevronRight size={16} />
    {/if}
  </button>

  {#if isOpen}
    <div class="drawer-content" transition:slide={{duration: 300}}>
      <div class="section">
        <h3>Navigation</h3>
        <div class="nav-item">
          <div class="key-combo">
            <div class="key"><ArrowLeft size={12}/></div>
            <div class="key"><ArrowRight size={12}/></div>
          </div>
          <p>Navigate between years</p>
        </div>
        <div class="nav-item">
          <div class="key-combo">
            <div class="key">Click</div>
          </div>
          <p>Select a year or petal for details</p>
        </div>
      </div>

      <div class="section">
        <h3>Reading the Visualization</h3>
        <div class="visual-guide">
          <div class="cluster">
            {@html fourPetalSVG}
          </div>
          <p>Each petal represents one awarded voucher from that year</p>
        </div>
        <div class="line-guide">
          <div class="line"></div>
          <p>Line height shows total RPD designations for the year</p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .navigation-drawer {
    position: fixed;
    top: 50%;
    transform: translateY(-20%);
    left: 0;
    height: 100vh;
    background-color: #fff4f077;
    z-index: 50;
    display: flex;
  }

  .toggle-button {
    background-color: #C9623F;
    color: white;
    width: 2rem;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 65vh;
    border: none;
    border-radius: 0 0.25rem 0.25rem 0;
    cursor: pointer;
  }

  .drawer-content {
    border: .5px solid #ccc;
    padding: 1.5rem 1.25rem 0;
    max-width: 35vw;
  }

  .section {
    margin-bottom: 1.5rem;
  }

  h3 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: #C9623F;
    margin-bottom: 1rem;
  }

  .nav-item {
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .key-combo {
    display: flex;
    gap: 0.5rem;
  }

  .key {
    background-color: #fff4f0;
    border: 1px solid #d1d1d1;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    min-width: 2rem;
  }

  .visual-guide {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .cluster {
    width: 50px;
    height: 90px;
  }

  .line-guide {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: center;
  }

  .line {
    width: 2px;
    height: 60px;
    background-color: #325846;
  }

  p {
    font-size: 0.875rem;
    margin: 0;
  }
</style>
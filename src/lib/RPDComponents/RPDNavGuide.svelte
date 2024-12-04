<script lang="ts">
  import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-svelte';
  import { slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  
  let isOpen = false;
  let fourPetalSVG: string;

  onMount(async () => {
    const response = await fetch('/Petals/PetalAndStem.svg');
    fourPetalSVG = await response.text();
  });
</script>

      <div class="section">
        <h3>Navigation</h3>
        <div class="nav-item">
          <div class="key-combo">
            <div class="key"><ArrowLeft size={12}/></div>
            <div class="key"><ArrowRight size={12}/></div>
          </div>
          <p class="text-xs">Navigate between years</p>
        </div>
        <div class="nav-item">
          <div class="key-combo">
            <div class="key">Click</div>
          </div>
          <p class="text-xs">Select a year or petal for details</p>
        </div>
      </div>

      <div class="section">
        <h3>Reading the Visualization</h3>
        <div class="visual-guide">
          <div class="cluster">
            {@html fourPetalSVG}
          </div>
          <div class="grid grid-rows-2 gap-4 pr-12">
          <p class="text-xs">Each petal represents one awarded voucher from that year</p>
          <p class="text-xs">Line height shows total RPD designations for the year</p>
        </div>
        </div>
      </div>

<style>
  .navigation-drawer {
    background-color: #fffbf9;
    z-index: 50;
    display: flex;
  }

  .toggle-button {
    background-color: #C9623F;
    color: white;
    width: 2rem;
    height: 10rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10.5rem;
    cursor: pointer;
  }

  .drawer-content {
    border: .5px solid #ccc;
    display: flex;
    flex-direction: column;
  }

  .section {
    margin-bottom: 1.5rem;
  }

  h3 {
    font-weight: 800;
    text-transform: uppercase;
    font-size: .625rem;
    color: #C9623F;
    margin-bottom: .62rem;
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
    border: .5px solid #d1d1d1;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    min-width: 2rem;
  }

  .visual-guide {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    margin-bottom: 1rem;
  }

  .cluster {
    width: 34px;
    gap: .25rem;
    
  }

  .line-guide {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    margin-bottom: 1rem;
  }

  .line {
    width: 1.25px;
    align-items: center;
    height: 22px;
    background-color: #325846;
  }

  p {
    font-size: 0.8275rem;
  }
</style>
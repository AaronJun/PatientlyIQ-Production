<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronRight, ChevronLeft, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Help} from 'carbon-icons-svelte';
  import "carbon-components-svelte/css/all.css";
  
  export let therapeuticAreaColors: Record<string, string>;
  
  let fourPetalSVG: string;
  let isExpanded = true;

  $: sortedEntries = Object.entries(therapeuticAreaColors).sort((a, b) => a[0].localeCompare(b[0]));

  onMount(async () => {
    const response = await fetch('/Petals/4Petal.svg');
    fourPetalSVG = await response.text();
  });

  function toggleExpand() {
    isExpanded = !isExpanded;
  }
</script>

<div class="combined-container" class:collapsed={!isExpanded}>
<button class="toggle-button" on:click={toggleExpand}>
  {#if isExpanded}
    <ChevronRight size={16} />
  {:else}
    <ChevronLeft size={16} />
  {/if}
</button>

<div class="combined-label" class:visible={!isExpanded}>
<Help size={22} />
  </div>

<div class="combined-content" class:hidden={!isExpanded}>
  <div class="legend-section">
    <h4>Therapeutic Areas</h4>
    <div class="legend-grid">
      {#each sortedEntries as [area, color]}
        <div class="legend-item">
          <span class="color-box" style="background-color: {color};"></span>
          <span class="area-name">{area}</span>
        </div>
      {/each}
    </div>
  </div>
  
  <div class="nav-section">
    <h4>How to Navigate</h4>
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
  
  <div class="legend-section">
    <h4>How to Read</h4>
    <div class="nav">            
      <div class="cluster">
        {@html fourPetalSVG}
      </div>
      <p>Each petal represents one awarded voucher from the year.</p>
    </div>
    <div class="nav">
    <div class="line-holder">
      <div class="vertical-line"></div>
    </div>
    <p>Each stem's height is based on the year's total RPD designations.</p>
  </div>
  </div>
</div>
</div>

<style>
.combined-container {
  position: absolute;
  top: 12rem;
  right: 10px;
  z-index: 200;
  background-color: #ffffffec;
  border: .5px solid #929292;
  border-radius: 4px;
  transition: height 0.3s ease-in-out, width 0.3s ease-in-out;
  width: 17.5vw;
  max-width: 3020x;
  overflow: hidden;
}

.combined-container.collapsed {
  height: 30px;
  width: 70px;
}

.toggle-button {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #C9623F;
  color: white;
  border: none;
  border-radius: 0 0 0 0px;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1001;
}
.legend-section {
  margin: .625rem 0 .25rem 0;
}

.combined-label {
  position: absolute;
  top: 0;
  left: 30px;
  right: 0;
  height: 30px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-size: 0.825rem;
  font-weight: 600;
  color: #292F58;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.combined-label.visible {
  opacity: 1;
}

.combined-content {
  padding: 1rem;
  padding-top: 2rem;
  transition: opacity 0.3s ease-in-out, max-height 0.3s ease-in-out;
  opacity: 1;
  max-height: 80vh;
  overflow-y: auto;
}

.combined-content.hidden {
  opacity: 0;
  max-height: 0;
  padding: 0;
}

h4 {
  font-size: 0.825rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #292F58;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.825rem;
}

.color-box {
  width: 10px;
  height: 10px;
  margin-right: 0.5rem;
  border: 1px solid #d8bd74;
}

.nav-section, .read-section {
  margin-top: 1rem;
}

.nav {
  margin-bottom: 0.5rem;
  display: grid;
  grid: auto / 2fr 2fr;
  align-items: center;

}

.navigation-squares {
  display: flex;
  gap: 0.525rem;
  margin-bottom: 0.25rem;
}

.square {
  width: 1.725rem;
  height: 1.725rem;
  background-color: #fff4f0;
  border: 1px solid #d1d1d1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cluster-holder {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.cluster {
  width: 50px;
  height: 90px;
  margin-right: 0.5rem;
}

.line-holder {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-right: 2.6rem;
  margin-bottom: 0.5rem;
}

.vertical-line {
  width: 2px;
  height: 30px;
  background-color: #325846;
}

p {
  font-size: 0.825rem;
  margin: 0;
}
</style>
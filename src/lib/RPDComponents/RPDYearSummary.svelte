<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onMount, createEventDispatcher } from 'svelte';
  import { ArrowRight, Building, Medication, Stethoscope } from 'carbon-icons-svelte';
  import 'carbon-components-svelte/css/all.css';
  export let constellationData: any[];
  export let currentYear: string;
  export let hoveredPetalData: any = null;
  export let isDrawerOpen: boolean = false;
  export let selectedData: any = null;

  const dispatch = createEventDispatcher();
  let activeArea: string;
  let mounted = false;
  let previousYear: string;

  $: {
    if (currentYear !== previousYear) {
      previousYear = currentYear;
      if (therapeuticAreas.length) {
        activeArea = therapeuticAreas[0];
      }
    }
  }
  $: yearData = constellationData
    .filter(d => d.Year === currentYear)
    .sort((a, b) => {
      const dateA = new Date(`${a.Year}-${a.Month}-${a.Date}`);
      const dateB = new Date(`${b.Year}-${b.Month}-${b.Date}`);
      return dateA.getTime() - dateB.getTime();
    });

  $: groupedYearData = groupByTherapeuticArea(yearData);
  $: therapeuticAreas = Object.keys(groupedYearData);
  $: if (therapeuticAreas.length && !activeArea) {
    activeArea = therapeuticAreas[0];
  }

  function groupByTherapeuticArea(data) {
    return data.reduce((acc, entry) => {
      if (!acc[entry.name]) acc[entry.name] = [];
      acc[entry.name].push(entry);
      return acc;
    }, {});
  }

  const therapeuticAreaColors = {
    "Gastroenterology": "#39FF14",
    "Neurology": "#4D4DFF",
    "Ophthalmology": "#E79028",
    "Immunology": "#EA38A5",
    "Metabolic": "#133B11",
    "Dermatology": "#559368",
    "Hematology": "#CF3630",
    "Orthopedics": "#441780",
    "Pulmonology": "#CBC09F",
    "Nephrology": "#ACA3DB",
    "Oncology": "#FF84DE",
    "Genetic": "#4D4D",
    "Hepatology": "#FF00D4",
  };

  function getColor(name: string): string {
    return therapeuticAreaColors[name] || "#000000";
  }

  function shouldUseDarkText(bgColor: string): boolean {
    const lightColors = ['#FF84DE', '#CBC09F', '#ACA3DB', '#39FF14'];
    return lightColors.includes(bgColor);
  }

  const handleRowClick = (entry) => dispatch('clusterElementClick', { entry, color: getColor(entry.name) });

  function isRowHighlighted(entry) {
    if (isDrawerOpen && selectedData) return entry.id === selectedData.id;
    return hoveredPetalData && hoveredPetalData.id === entry.id;
  }

  onMount(() => mounted = true);
</script>

{#if mounted}
  <div class="horizontal-panel">
    <div class="year-container">
      <h3>Vouchers Awarded in <span class="bold">{currentYear}</span></h3>
      
      <div class="area-tabs">
        {#each therapeuticAreas as area}
          <button 
            class="area-tab"
            class:active={area === activeArea}
            style="
              color: {area === activeArea ? (shouldUseDarkText(getColor(area)) ? '#1f1f1f' : '#f0f0f0') : getColor(area)};
              border-color: {getColor(area)};
              background-color: {area === activeArea ? getColor(area) : 'transparent'}
            "
            on:click={() => activeArea = area}
          >
            {area}
          </button>
        {/each}
      </div>

      <div class="area-content" transition:fly={{ duration: 300 }}>
        <div class="horizontal-cards">
          {#each groupedYearData[activeArea] || [] as entry (entry["Drug Name"])}
            <div 
              class="entry-card clickable"
              class:highlighted={isRowHighlighted(entry)}
              on:click={() => handleRowClick(entry)}
              on:mouseenter={() => dispatch('rowHover', { entry })}
              on:mouseleave={() => dispatch('rowLeave')}
            >
              <div class="card-content" style="border-top: 4px solid {getColor(entry.name)}">
                <div class="card-header">
                  <Building size="12" />
                  <span class="sponsor-name">{entry.Sponsor}</span>
                </div>
                <div class="drug-info">
                  <Medication size="12" />
                  <span class="drug-name">{entry["Drug Name"]}</span>
                </div>
                <div class="card-footer">
                  <Stethoscope size="12" />
                  <span class="indication">{entry.id}</span>
                  <ArrowRight size="10" class="arrow-icon" />
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
.horizontal-panel {
    max-width: 25vw;
    padding: 2.25rem 0 0 0;
    margin-top: 5.25vh;
    min-height: 34.25vh;
    border-top: .25px solid #e0e0e0;
    overflow-x: hidden;
  }

.area-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.325rem;
  padding: 1rem 1rem 0 0;
  margin-bottom: 1rem;
}

.area-tab {
    width: 100%;
    font-weight: 800;
    font-size: 0.525rem;
    letter-spacing: 1px;
    border-radius: 200px;
    text-transform: uppercase;
    padding: 0.325rem .25rem;
    border: .5px solid;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: transparent;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }  /* .area-tab.active {
    color: #f0f0f0 !important;
  } */

  .area-tab:hover:not(.active) {
    transform: scale(1.02);
  }

  .horizontal-cards {
    display: column;
    flex-wrap: nowrap;
    gap: 1rem;
    overflow-x: auto;
    scroll-behavior: smooth;
  }

  .entry-card {
    min-width: 97.25%;
    max-width: 325px;
    height: 100%;
    margin-bottom: .525rem;
    flex-shrink: 0;
    background: #fff;
    border: .5px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .card-content {
    padding: .5725rem .725rem 1rem .5725rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-header, .drug-info, .card-footer {
    display: grid;
    grid-template-columns: 20px 1fr 20px;
    align-items: center;
    height: 100%;
    gap: 0.5rem;
  }

  .card-header {
    margin-bottom: .3425rem;
    border-bottom: .5px dotte;
  }

  h3 {
    font-weight: 400;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: #1f1f1f;
    margin-bottom: 0.855rem;
    letter-spacing: 0.025em;
  }

  .bold {
    font-weight: 800;
    color: #ff1515;
    border-bottom: 1px dotted #ff1515;
  }

  .sponsor-name {
    font-weight: 400;
    font-size: .925rem;
    color: #1f1f1f;
    text-transform: capitalize;
  }

  .drug-name {
    font-size: 0.725rem;
    font-weight: 800;
    color: #6f6f6f;
    height: 100%;
    text-transform: uppercase;  
  }

  .indication {
    font-size: 0.725rem;
    font-weight: 800;
    height: 100%;
    color: #6f6f6f;
    text-transform: capitalize;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .clickable {
    cursor: pointer;
  }

  .clickable:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .arrow-icon {
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .clickable:hover .arrow-icon {
    opacity: 1;
  }

  .highlighted {
    background-color: #f8f8f8;
  }
</style>
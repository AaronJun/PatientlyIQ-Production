<script lang="ts">
  import { Button, ComboBox, Row } from "carbon-components-svelte";
  import { createEventDispatcher } from 'svelte';
  import Shuffle from "carbon-icons-svelte/lib/Shuffle.svelte";


  const dispatch = createEventDispatcher();

  let selectedPersona = "all";
  let selectedAgeRange = "all";
  let selectedDisease = "all";
  let personaRef;
  let ageRangeRef;
  let diseaseRef;

  const personaItems = [
    { id: "all", text: "All" },
    { id: "patient", text: "Patient" },
    { id: "caregiver", text: "Caregiver" }
  ];

  const ageRangeItems = [
    { id: "all", text: "All" },
    { id: "18-30", text: "18-30" },
    { id: "31-50", text: "31-50" },
    { id: "51-70", text: "51-70" },
    { id: "71+", text: "71+" }
  ];

  const diseaseItems = [
    { id: "all", text: "All" },
    { id: "cancer", text: "Cancer" },
    { id: "diabetes", text: "Diabetes" },
    { id: "heartDisease", text: "Heart Disease" },
    { id: "alzheimers", text: "Alzheimer's" }
  ];

  function handlePersonaSelect(event) {
    selectedPersona = event.detail.selectedId;
    dispatchFilters();
  }

  function handleAgeRangeSelect(event) {
    selectedAgeRange = event.detail.selectedId;
    dispatchFilters();
  }

  function handleDiseaseSelect(event) {
    selectedDisease = event.detail.selectedId;
    dispatchFilters();
  }

  function dispatchFilters() {
    dispatch('filter', { 
      persona: selectedPersona, 
      ageRange: selectedAgeRange, 
      disease: selectedDisease 
    });
  }

  function clearFilters() {
    selectedPersona = "all";
    selectedAgeRange = "all";
    selectedDisease = "all";
    personaRef.clear();
    ageRangeRef.clear();
    diseaseRef.clear();
    dispatchFilters();
  }
</script>

<div class="filter-container">
  <div class="filters">
    <ComboBox
      light
      titleText="Filter by Persona"
      placeholder="Choose a persona"
      bind:this={personaRef}
      items={personaItems}
      on:select={handlePersonaSelect}
      selectedId={selectedPersona}
    />
    <ComboBox
      light
      titleText="Filter by Age Range"
      placeholder="Choose an age range"
      bind:this={ageRangeRef}
      items={ageRangeItems}
      on:select={handleAgeRangeSelect}
      selectedId={selectedAgeRange}
    />
    <ComboBox
      light
      titleText="Filter by Disease"
      placeholder="Choose a disease"
      bind:this={diseaseRef}
      items={diseaseItems}
      on:select={handleDiseaseSelect}
      selectedId={selectedDisease}
    />
  </div>
  <Button on:click={clearFilters}>Clear filters</Button>
</div>
<div>
  
</div>

<style>
  .filters {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: baseline;
    gap: 1rem;
  }

  .filter-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left;
    width: 100%;
    gap: 1rem;
    margin-bottom: 10rem;
  }
  :global(.bx--combo-box) {
    width: 300px;
  }
</style>
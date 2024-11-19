<script lang="ts">
  import { ComboBox, Button } from "carbon-components-svelte";
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let selectedDisease = "all";
  let selectedAspect = "all";
  let selectedTimeframe = "all";
  let diseaseRef;
  let aspectRef;
  let timeframeRef;

  const diseaseItems = [
      { id: "all", text: "All Conditions" },
      { id: "diabetes", text: "Diabetes" },
      { id: "cancer", text: "Cancer" },
      { id: "heartDisease", text: "Heart Disease" },
      { id: "alzheimers", text: "Alzheimer's" },
      { id: "arthritis", text: "Arthritis" }
  ];

  const aspectItems = [
      { id: "all", text: "All Aspects" },
      { id: "safety", text: "Safety" },
      { id: "efficacy", text: "Efficacy" },
      { id: "sideEffects", text: "Side Effects" },
      { id: "cost", text: "Cost" },
      { id: "access", text: "Access" },
      { id: "support", text: "Support" }
  ];

  const timeframeItems = [
      { id: "all", text: "All Time" },
      { id: "lastQuarter", text: "Last Quarter" },
      { id: "lastSixMonths", text: "Last 6 Months" },
    { id: "lastYear", text: "Last Year" },
      { id: "ytd", text: "Year to Date" }
  ];

  function handleDiseaseSelect(event) {
      selectedDisease = event.detail.selectedId;
      dispatchFilters();
  }

  function handleAspectSelect(event) {
      selectedAspect = event.detail.selectedId;
      dispatchFilters();
  }

  function handleTimeframeSelect(event) {
      selectedTimeframe = event.detail.selectedId;
      dispatchFilters();
  }

  function dispatchFilters() {
      dispatch('filter', {
          disease: selectedDisease,
          aspect: selectedAspect,
          timeframe: selectedTimeframe
      });
  }

  function clearFilters() {
      selectedDisease = "all";
      selectedAspect = "all";
      selectedTimeframe = "all";
      diseaseRef?.clear();
      aspectRef?.clear();
      timeframeRef?.clear();
      dispatchFilters();
  }
</script>

<div class="filter-container">
  <div class="filters">
      <ComboBox
          light
          placeholder="Choose a condition"
          bind:this={diseaseRef}
          items={diseaseItems}
          on:select={handleDiseaseSelect}
          selectedId={selectedDisease}
      />
      <ComboBox
          light
          placeholder="Choose an aspect"
          bind:this={aspectRef}
          items={aspectItems}
          on:select={handleAspectSelect}
          selectedId={selectedAspect}
      />
      <ComboBox
          light
          placeholder="Choose a timeframe"
          bind:this={timeframeRef}
          items={timeframeItems}
          on:select={handleTimeframeSelect}
          selectedId={selectedTimeframe}
      />
  </div>
  <Button kind="primary" on:click={clearFilters}>Clear filters</Button>
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
      margin-bottom: 2rem;
  }

  :global(.bx--combo-box) {
      width: 300px;
  }
</style>
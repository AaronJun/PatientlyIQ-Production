<script lang="ts">
  // @ts-nocheck
  import { onMount } from 'svelte';
  import "carbon-components-svelte/css/all.css";
  import '@carbon/charts-svelte/styles.css';
  import Arrow from "carbon-icons-svelte/lib/ArrowRight.svelte";
  import Shuffle from "carbon-icons-svelte/lib/Shuffle.svelte";

  import {
    Dropdown,
    Content,
    Grid,
    Tag,
    Tooltip,
    TooltipDefinition,
    Row,
    Column,
    Button,
    DataTable
  } from "carbon-components-svelte";

  // Import the diseases data
  import { diseases } from '../data/rareDiseaseData.js';

  let areas = [...new Set(diseases.map(d => d.area))];
  let therapeuticAreas = areas.map((area, index) => ({ id: index.toString(), text: area }));
  
  let dropdown1_selectedId = "";
  let dropdown2_selectedId = "";

  $: dropdown2_items = dropdown1_selectedId
    ? diseases.filter(d => d.area === therapeuticAreas.find(a => a.id === dropdown1_selectedId).text)
        .map((disease, index) => ({ id: disease.id, text: disease.name }))
    : [];

  $: filteredDiseases = dropdown1_selectedId
    ? diseases.filter(d => d.area === therapeuticAreas.find(a => a.id === dropdown1_selectedId).text)
    : diseases;

  $: filteredDiseases = dropdown2_selectedId
    ? filteredDiseases.filter(d => d.id === dropdown2_selectedId)
    : filteredDiseases;

  function handleFilter() {
    console.log("Selected Therapeutic Area:", therapeuticAreas.find(a => a.id === dropdown1_selectedId)?.text);
    console.log("Selected Disease State:", dropdown2_items.find(d => d.id === dropdown2_selectedId)?.text);
    // Add your filter logic here if needed
  }

  function shuffleFilter() {
    const randomAreaIndex = Math.floor(Math.random() * therapeuticAreas.length);
    dropdown1_selectedId = therapeuticAreas[randomAreaIndex].id;

    // Wait for the dropdown2_items to update
    setTimeout(() => {
      // Select a random Disease State from the selected Therapeutic Area
      if (dropdown2_items.length > 0) {
        const randomDiseaseIndex = Math.floor(Math.random() * dropdown2_items.length);
        dropdown2_selectedId = dropdown2_items[randomDiseaseIndex].id;
      } else {
        dropdown2_selectedId = "";
      }

      // Trigger the filter
      handleFilter();
    }, 0);
  }

  let headers = [
    { key: 'area', value: 'Therapeutic Area' },
    { key: 'name', value: 'Rare Disease' },
  ];

  let isHeaderCollapsed = false;
  let headerText = "Patiently Atlas";

  onMount(() => {
    const handleScroll = () => {
      isHeaderCollapsed = window.scrollY > 50;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="filters-container" class:collapsed={isHeaderCollapsed}>
  <Grid>
    <Row padding class="header-row">
      <Column padding>
        <h1 class="header-text" class:collapsed={isHeaderCollapsed}>{headerText}</h1>
      </Column>
    </Row>
   <!--  <Row>
      <Column>
        <Dropdown
          light
          size="sm"
          titleText="Therapeutic Area"
          bind:selectedId={dropdown1_selectedId}
          items={therapeuticAreas}
        />
      </Column>   
      <Column>
        <Dropdown
          light
          size="sm"
          titleText="Disease State"
          bind:selectedId={dropdown2_selectedId}
          items={dropdown2_items}
          disabled={!dropdown1_selectedId}
        />
      </Column>
      <Column padding>
        <Button icon={Arrow} on:click={handleFilter}>
          Generate  
        </Button> 
        <Button kind="secondary" 
          icon={Shuffle}
          on:click={shuffleFilter}>Shuffle</Button>
      </Column>
    </Row> -->
  </Grid>
</div>

<style>
  .filters-container {
    align-content: left;
    align-items: left;
    color: var(--cds-ui-text-01, #152935);
    border-bottom: 2px solid #FF5150;
    font-weight: 200;
    transition: padding-top 0.3s ease, padding-bottom 0.3s ease;
  }

  .filters-container.collapsed {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .header-row {
    transition: height 0.3s ease, opacity 0.3s ease;
    height: 2rem;
    opacity: 1;
  }

  .header-text {
    transition: font-size 0.3s ease, opacity 0.3s ease;
    font-size: 2rem;
    margin-bottom: 1.15rem;
  }

  .header-text.collapsed {
    font-size: 0;
    opacity: 0;
  }
</style>
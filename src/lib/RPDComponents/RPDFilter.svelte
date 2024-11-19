<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { Dropdown, Button } from "carbon-components-svelte";
    import Shuffle from "carbon-icons-svelte/lib/Shuffle.svelte";
    import Arrow from "carbon-icons-svelte/lib/ArrowRight.svelte";
  
    export let data: any[];
    export let svg: any;
  
    const dispatch = createEventDispatcher();
  
    let filterType = "";
    let filterValue = "";
    let filterOptions: { id: string; text: string }[] = [];
  
    $: filterTypeOptions = [
      { id: "name", text: "Therapeutic Area" },
      { id: "id", text: "Disease" },
      { id: "Treatment Type", text: "Treatment Type" },
      { id: "Sponsor", text: "Sponsor" }
    ];
  
    $: {
      if (filterType) {
        filterOptions = [...new Set(data.map(d => d[filterType]))].map((value, index) => ({
          id: index.toString(),
          text: value
        }));
        filterValue = "";
      }
    }
  
    function handleFilter() {
      if (filterType && filterValue) {
        highlightFilteredPetals();
        dispatch('filter', { type: filterType, value: filterValue });
      }
    }
  
    function shuffleFilter() {
      const randomTypeIndex = Math.floor(Math.random() * filterTypeOptions.length);
      filterType = filterTypeOptions[randomTypeIndex].id;
  
      // Wait for filterOptions to update
      setTimeout(() => {
        if (filterOptions.length > 0) {
          const randomValueIndex = Math.floor(Math.random() * filterOptions.length);
          filterValue = filterOptions[randomValueIndex].id;
        } else {
          filterValue = "";
        }
        handleFilter();
      }, 0);
    }
  
    function highlightFilteredPetals() {
      svg.selectAll('.petal')
        .style('filter', d => d[filterType] === filterOptions[parseInt(filterValue)].text ? 'saturate(1)' : 'saturate(0.2)')
        .style('stroke', d => d[filterType] === filterOptions[parseInt(filterValue)].text ? '#E5D054' : 'none')
        .style('stroke-width', d => d[filterType] === filterOptions[parseInt(filterValue)].text ? '2px' : '0');
    }
  
    onMount(() => {
      shuffleFilter();
    });
  </script>
  
  <div class="filters-container">
    <div class="filter-row">
      <span class="filter-label">Filter by</span>
      <Dropdown
        light
        size="sm"
        titleText=""
        bind:selectedId={filterType}
        items={filterTypeOptions}
      />
      <Dropdown
        light
        size="sm"
        titleText=""
        bind:selectedId={filterValue}
        items={filterOptions}
        disabled={!filterType}
      />
      <Button icon={Arrow} on:click={handleFilter}>
        Apply Filter
      </Button>
      <Button kind="secondary" icon={Shuffle} on:click={shuffleFilter}>
        Shuffle
      </Button>
    </div>
  </div>
  
  <style>
    .filters-container {
      padding-top: 1rem;
      padding-bottom: 1.2rem;
      color: var(--cds-ui-text-01, #152935);
      font-weight: 800;
      display: flex;
      justify-content: center;
    }
  
    .filter-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
  
    .filter-label {
      font-size: 14px;
      font-weight: 400;
    }
  
    :global(.bx--dropdown) {
      background-color: rgba(255, 255, 255, 0);
      width: auto;
      font-size: 20px;
      min-width: 200px;
      border-radius: 100px;
    }
  
    :global(.bx--dropdown--light) {
      background-color: rgba(255, 255, 255);
      border-radius: 100px;
      border: .25px solid #152935;
    }
  
    :global(.bx--dropdown-text) {
      padding-right: 1rem;
      font-weight: 800;
    }
  </style>
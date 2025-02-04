<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let metricName: string;
    export let countryValue: number;
    export let averageValue: number;
    export let ranking: number;
    export let totalCountries: number;
  
    const dispatch = createEventDispatcher();
  
    $: formattedCountryValue = countryValue.toFixed(2);
    $: formattedAverageValue = averageValue.toFixed(2);
  
    function handleClick() {
      dispatch('click', { metricName });
    }
  </script>
  
  <div class="metric-tile" on:click={handleClick} tabindex="0" role="button">
    <h3 class="metric-name">{metricName}</h3>
    <p class="country-value">{formattedCountryValue}</p>
    <p class="average-value">Avg: {formattedAverageValue}</p>
    <p class="ranking">Rank: {ranking} of {totalCountries}</p>
  </div>
  
  <style>
    .metric-tile {
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      padding: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  
    .metric-tile:hover, .metric-tile:focus {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  
    .metric-name {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }
  
    .country-value {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
  
    .average-value, .ranking {
      font-size: 12px;
      color: rgba(57, 57, 57, 0.7);
      margin-bottom: 4px;
    }
  </style>
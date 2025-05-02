<script lang="ts">
    import { Accordion, AccordionItem, ProgressBar } from "carbon-components-svelte";
    import RadarChart from "./RadarChart.svelte";
    export let metricName: string;
    export let countryName: string;
    export let countryValue: number;
    export let averageValue: number;
    export let ranking: number;
    export let totalCountries: number;
  
    $: formattedCountryValue = countryValue.toFixed(2);
    $: percentile = ((totalCountries - ranking + 1) / totalCountries) * 100;
  
    // Normalize values to 0-100 scale for radar chart
    $: normalizedCountryValue = Math.min(100, Math.max(0, countryValue));
    $: normalizedAverageValue = Math.min(100, Math.max(0, averageValue));
    
    function underline(text: string) {
      return `<span class="underlined">${text}</span>`;
    }
  </script>
  
  <Accordion>
    <AccordionItem>
        
      <svelte:fragment slot="title">
      <div class="chart">
        <ProgressBar value={percentile} helperText="Percentile ranking" />
      </div>
 
      <h3>{metricName}</h3>
      <p>
        {@html `${underline(countryName)} ranks ${underline(ranking.toString())} out of ${underline(totalCountries.toString())} when measured by ${underline(metricName.toLowerCase())}.`}
      </p>
      </svelte:fragment>
      
      <svelte:fragment slot="default">
        <div class="radar-wrapper">
          <RadarChart 
            data={[
              normalizedCountryValue, 
              normalizedAverageValue,
              normalizedCountryValue > normalizedAverageValue ? 100 : 0,
              50
            ]} 
            labels={[
              metricName,
              'Comparison',
              'Target',
              'Baseline'
            ]} 
            color={normalizedCountryValue > normalizedAverageValue ? '#2D9D78' : '#C94B32'}
            size={140}
          />
        </div>
        <p>
          This is a placeholder for additional details about {countryName}'s performance in {metricName.toLowerCase()}. 
          More specific information and analysis would be provided here based on the data and context of the metric.
        </p>
      </svelte:fragment>
    </AccordionItem>
  </Accordion>
  
  <style>
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }
  
    .country-value {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
  
    .chart {
      margin: 16px 0;
    }

    .radar-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      margin: 12px 0;
      max-width: 200px;
      margin-left: auto;
      margin-right: auto;
    }
  
    :global(.bx--accordion__content) {
      padding-right: 1rem;
    }
  
    :global(.underlined) {
      border-bottom: 1px dotted currentColor;
    }
  </style>
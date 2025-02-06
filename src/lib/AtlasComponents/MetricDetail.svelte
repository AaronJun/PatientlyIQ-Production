p<script lang="ts">
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
    
        <RadarChart />
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
  
    p {
      font-size: 14px;
      color: #6f6f6f;
      margin-bottom: 8px;
    }
  
    .chart {
      margin: 16px 0;
    }
  
    :global(.bx--accordion__content) {
      padding-right: 1rem;
    }
  
    :global(.underlined) {
      border-bottom: 1px dotted currentColor;
    }
  </style>
<script lang="ts">
  import { Chart, Svg, Bars, Axis, Tooltip } from 'layerchart';

  interface SentimentDriver {
    word: string;
    frequency: number;
    topic?: string;
    "parent topic"?: string;
    group: string;
    sentiment: string;
  }

  export let data: SentimentDriver[] = [];
  export let title: string = "Sentiment Drivers";
  export let height: number = 400;

  // Color mapping for sentiments
  const sentimentColors = {
    'entirely positive': '#24a148',
    'somewhat positive': '#42be65', 
    'neutral': '#f59e0b',
    'somewhat negative': '#fa4d56',
    'entirely negative': '#da1e28'
  };

  // Sort data by frequency descending
  $: sortedData = [...data].sort((a, b) => b.frequency - a.frequency);

  function getColor(sentiment: string): string {
    return sentimentColors[sentiment as keyof typeof sentimentColors] || '#6b7280';
  }
</script>

<div class="bar-chart-container">
  <h4 class="chart-title text-sm font-semibold">{title}</h4>
  {#if sortedData.length === 0}
    <div class="no-data">No data available</div>
  {:else}
  <div class="chart-wrapper" style="height: {height}px;">
    <div class="simple-bars">
      {#each sortedData as item, i}
        <div class="bar-row">
          <div class="bar-container">
            <div 
              class="bar" 
              style="width: {(item.frequency / Math.max(...sortedData.map(d => d.frequency))) * 85}%; background-color: {getColor(item.sentiment)};"
              title="{item.word}: {item.frequency} mentions ({item.sentiment})"
            ></div>
            <div class="bar-value">{item.frequency}</div>
          </div>
          <div class="bar-label capitalize text-xs">{item.topic || item.word}</div>
        </div>
      {/each}
    </div>
  </div>
  {/if}
  <div class="chart-description">
    <p class="chart-description-text text-xs max-w-md">
      This chart shows the percentage of quotes in which key sentiment drivers are mentioned. More than one topic can be mentioned in a single quote. 
    </p>
  </div>
</div>

<style>
  .bar-chart-container {
    width: 100%;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
  }
  
  .no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 150px;
    color: #6b7280;
    font-style: italic;
    text-align: center;
  }
  
  .chart-title {
        margin: 0 0 1rem 0;
  }

  .chart-description {
    margin-top: 1rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }
  
  .chart-wrapper {
    width: 100%;
    position: relative;
  }
  
  .simple-bars {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 1rem 0;
  }
  
  .bar-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .bar-container {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
  }
  
  .bar {
    height: 25px;
    min-width: 4px;
    transition: opacity 0.2s ease;
  }
  
  .bar:hover {
    opacity: 0.8;
  }
  
  .bar-value {
    font-size: 12px;
    color: #6b7280;
    font-weight: 800;
    min-width: 20px;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
  
  .bar-label {
    color: #6b7280;
    font-size: 12px;
    font-family: 'IBM Plex Mono', monospace;
    margin-left: 4px;
  }
</style> 
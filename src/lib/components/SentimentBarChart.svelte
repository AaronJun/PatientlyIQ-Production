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
  <h4 class="chart-title">{title}</h4>
  {#if sortedData.length === 0}
    <div class="no-data">No data available</div>
  {:else}
  <div class="chart-wrapper" style="height: {height}px;">
    <div class="simple-bars">
      {#each sortedData as item, i}
        <div class="bar-row">
          <div class="bar-label">{item.topic || item.word}</div>
          <div class="bar-container">
            <div 
              class="bar" 
              style="width: {(item.frequency / Math.max(...sortedData.map(d => d.frequency))) * 100}%; background-color: {getColor(item.sentiment)};"
              title="{item.word}: {item.frequency} mentions ({item.sentiment})"
            ></div>
            <div class="bar-value">{item.frequency}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>
  {/if}
</div>

<style>
  .bar-chart-container {
    width: 100%;
    padding: 1rem;
    background: white;
    border-radius: 8px;
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
    font-size: 1.1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem 0;
    text-align: center;
  }
  
  .chart-wrapper {
    width: 100%;
    position: relative;
  }
  
  .simple-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 1rem 0;
  }
  
  .bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .bar-label {
    min-width: 120px;
    font-size: 11px;
    font-weight: 500;
    color: #374151;
    text-align: right;
  }
  
  .bar-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .bar {
    height: 20px;
    border-radius: 4px;
    min-width: 4px;
    transition: opacity 0.2s ease;
  }
  
  .bar:hover {
    opacity: 0.8;
  }
  
  .bar-value {
    font-size: 11px;
    color: #6b7280;
    font-weight: 500;
    min-width: 20px;
  }
</style> 
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from "d3";
    import rawData from "../data/SampleSentimentData.json";

    let selectedSentiment = selectedSentiment[0];
    


    interface Quote {
      type: string;
      quote: string;
      sentiment: string;
    }
    
    interface ChartDataItem {
      sentiment: string;
      count: number;
    }
    
    let data: Quote[] = [];
    let chartData: ChartDataItem[] = [];
    
    onMount(async () => {
      // Fetch the data (in a real scenario, you'd import or fetch the JSON)
      const response = await fetch('../data/sampleSentimentData.json');
      const json = await response.json();
      data = json.quotes;
    
      // Process the data
      const sentimentCounts = d3.rollup(
        data,
        (v: Quote[]) => d3.count(v),
        (d: Quote) => d.sentiment
      );
    
      chartData = Array.from(sentimentCounts, ([key, value]) => ({ sentiment: key, count: value }));
    });
    </script>
    
    <main>
      <h1>Sentiment Distribution</h1>
      {#if chartData.length > 0}
        <div class="chart">
          {#each chartData as item}
            <div class="bar" style="height: {item.count * 10}px;">
              <span class="label">{item.sentiment}</span>
              <span class="value">{item.count}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p>Loading data...</p>
      {/if}
    </main>
    
    <style>
      .chart {
        display: flex;
        align-items: flex-end;
        height: 300px;
        padding: 20px;
        border: 1px solid #ccc;
      }
    
      .bar {
        flex: 1;
        margin: 0 5px;
        background-color: #3498db;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        color: white;
        transition: height 0.5s ease;
      }
    
      .label {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        padding: 5px;
      }
    
      .value {
        padding: 5px;
      }
    </style>
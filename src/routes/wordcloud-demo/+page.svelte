<script lang="ts">
  import CarbonWordCloud from '$lib/wordcloud/CarbonWordCloud.svelte';
  import { onMount } from 'svelte';
  
  interface WordCloudItem {
    word: string;
    frequency: number;
    group: string;
    sentiment: string;
  }
  
  let allData: WordCloudItem[] = [];
  let drugSentimentData: WordCloudItem[] = [];
  let infusionExperienceData: WordCloudItem[] = [];
  let loading: boolean = true;
  let error: string | null = null;
  
  onMount(async () => {
    try {
      console.log('Starting to fetch data...');
      const response = await fetch('/data/rare-obesity-phrases.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      allData = await response.json();
      console.log('Data loaded successfully:', allData.length, 'items');
      
      // Filter data by group
      drugSentimentData = allData.filter((item: WordCloudItem) => item.group === 'Drug Sentiment');
      infusionExperienceData = allData.filter((item: WordCloudItem) => item.group === 'Infusion Experience');
      
      console.log('Drug Sentiment data:', drugSentimentData.length, 'items');
      console.log('Infusion Experience data:', infusionExperienceData.length, 'items');
      
      loading = false;
    } catch (err: unknown) {
      console.error('Error loading data:', err);
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      loading = false;
    }
  });
</script>

<div class="container bg-slate-100 text-left align-left justify-start">
  <h1 class="text-2xl font-bold">Pompe Disease Patient Journey Wordclouds</h1>
  <p class="description">
    For the Pompe community, treatment  a mix of resilience and exhaustion. While the availability of enzyme therapies offers a critical lifeline, the day-to-day realities—logistical, emotional, and physical—often undermine that sense of progress. What emerges across patient narratives is not just a medical journey, but a sustained negotiation with systems, side effects, and uncertainty. Sentiment runs deeper than satisfaction or dissatisfaction; it reflects the strain of maintaining stability in a landscape where access, response, and relief are never guaranteed.
  </p>
  
  {#if loading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading patient data...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <h3>Error Loading Data</h3>
      <p>Unable to load patient data: {error}</p>
      <p>Please check that the data file is accessible and try refreshing the page.</p>
    </div>
  {:else if drugSentimentData.length === 0 && infusionExperienceData.length === 0}
    <div class="error-container">
      <h3>No Data Available</h3>
      <p>No patient data was found in the expected format.</p>
    </div>
  {:else}
    <div class="wordclouds-grid">
      <div class="wordcloud-section">
        <h2>Drug Sentiment ({drugSentimentData.length} phrases)</h2>
        <p class="section-description">Patient feelings and experiences related to medication effectiveness and treatment outcomes.</p>
        <div class="chart-container">
          {#if drugSentimentData.length > 0}
            <CarbonWordCloud 
              dataSource={drugSentimentData} 
              title=""
              height="500px"
            />
          {:else}
            <div class="no-data">No Drug Sentiment data available</div>
          {/if}
        </div>
      </div>
      
      <div class="wordcloud-section">
        <h2>Infusion Experience ({infusionExperienceData.length} phrases)</h2>
        <p class="section-description">Patient experiences with the infusion process, logistics, and treatment administration.</p>
        <div class="chart-container">
          {#if infusionExperienceData.length > 0}
            <CarbonWordCloud 
              dataSource={infusionExperienceData} 
              title=""
              height="500px"
            />
          {:else}
            <div class="no-data">No Infusion Experience data available</div>
          {/if}
        </div>
      </div>
    </div>
    
    <div class="legend">
      <h3>Sentiment Legend</h3>
      <div class="legend-items">
        <div class="legend-item">
          <span class="legend-color entirely-negative"></span>
          <span>Entirely Negative</span>
        </div>
        <div class="legend-item">
          <span class="legend-color somewhat-negative"></span>
          <span>Somewhat Negative</span>
        </div>
        <div class="legend-item">
          <span class="legend-color neutral"></span>
          <span>Neutral</span>
        </div>
        <div class="legend-item">
          <span class="legend-color somewhat-positive"></span>
          <span>Somewhat Positive</span>
        </div>
        <div class="legend-item">
          <span class="legend-color entirely-positive"></span>
          <span>Entirely Positive</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 2000px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #161616;
    text-align: center;
  }
  
  .description {
    font-size: 1.1rem;
    color: #525252;
    max-width: 900px;
    margin: 0 auto 3rem auto;
    text-align: center;
    line-height: 1.6;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-container {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 2rem;
    margin: 2rem 0;
    text-align: center;
  }
  
  .error-container h3 {
    color: #dc2626;
    margin-bottom: 1rem;
  }
  
  .error-container p {
    color: #7f1d1d;
    margin-bottom: 0.5rem;
  }
  
  .no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #6b7280;
    font-style: italic;
  }
  
  .wordclouds-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .wordcloud-section {
    display: flex;
    flex-direction: column;
  }
  
  .wordcloud-section h2 {
    font-size: 1.5rem;
    color: #161616;
    margin-bottom: 0.5rem;
    text-align: center;
  }
  
  .section-description {
    font-size: 0.9rem;
    color: #6f6f6f;
    text-align: center;
    margin-bottom: 1rem;
    line-height: 1.4;
    min-height: 2.8rem;
  }
  
  .chart-container {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    background-color: white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    flex-grow: 1;
  }
  
  .legend {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
  }
  
  .legend h3 {
    font-size: 1.2rem;
    color: #161616;
    margin-bottom: 1rem;
  }
  
  .legend-items {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #374151;
  }
  
  .legend-color {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }
  
  .entirely-negative {
    background-color: #da1e28;
  }
  
  .somewhat-negative {
    background-color: #fa4d56;
  }
  
  .neutral {
    background-color: #f59e0b;
  }
  
  .somewhat-positive {
    background-color: #42be65;
  }
  
  .entirely-positive {
    background-color: #24a148;
  }
  
  @media (max-width: 1024px) {
    .wordclouds-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .container {
      padding: 1rem;
    }
    
    .legend-items {
      gap: 1rem;
    }
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
    
    .description {
      font-size: 1rem;
    }
    
    .section-description {
      min-height: auto;
    }
    
    .legend-items {
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
  }
</style> 
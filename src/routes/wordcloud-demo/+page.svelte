<script>
  import CarbonWordCloud from '$lib/wordcloud/CarbonWordCloud.svelte';
  
  // Use the static file path instead of embedding the data
  const dataPath = '/data/rare-obesity-phrases.json';
</script>

<div class="container">
  <h1>Rare Obesity Patient Empathy Phrases</h1>
  <p class="description">
    This wordcloud visualizes common phrases from patient narratives, colored by sentiment and sized by frequency.
    Pre-treatment phrases are shown in purple, while post-treatment phrases appear in blue.
  </p>
  
  <div class="chart-container">
    <CarbonWordCloud 
      dataSource={dataPath} 
      title=""
      height="600px"
    />
  </div>
  
  <div class="legend">
    <div class="legend-item">
      <span class="legend-color pre-treatment"></span>
      <span>Pre-Treatment</span>
    </div>
    <div class="legend-item">
      <span class="legend-color post-treatment"></span>
      <span>Post-Treatment</span>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #161616;
  }
  
  .description {
    font-size: 1rem;
    color: #525252;
    max-width: 800px;
    margin-bottom: 2rem;
  }
  
  .chart-container {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 1rem;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 2rem;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .legend-color {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }
  
  .pre-treatment {
    background-color: #8A3FFC; /* Purple */
  }
  
  .post-treatment {
    background-color: #1192E8; /* Blue */
  }
</style> 
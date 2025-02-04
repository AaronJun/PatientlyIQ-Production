<script lang="ts">
    import "carbon-components-svelte/css/all.css";
    export let quote: string = '';
    export let sentiment: string = '';
    export let persona: string = '';
  
    function getSentimentColor(sentiment: string): string {
      switch (sentiment.toLowerCase()) {
        case 'positive': return '#B0F0B9';
        case 'negative': return '#C34244';
        default: return '#F5BE6B';
      }
    }
  </script>
  
  <div class="sidebar">
    {#if quote}
      <div class="event-info">
        <div class="sentiment-box" style="background-color: {getSentimentColor(sentiment)}"></div>
        <p><strong>Persona:</strong> {persona}</p>
        <p><strong>Sentiment:</strong> {sentiment}</p>
        <p><strong>Quote:</strong> "{quote}"</p>
      </div>
    {:else}
      <p>Click on a rectangle to see event details</p>
    {/if}
  </div>
  
  <style>
    .sidebar {
      width: 400px;
      padding: 2.25rem;
      border-right: 1px solid #ccc;
      height: 100%;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .event-info {
      margin-top: 20px;
    }
    .sentiment-box {
      width: 2rem;
      height: 2rem;
      border-radius: 100%;
      margin-bottom: 10px;
    }
  </style>
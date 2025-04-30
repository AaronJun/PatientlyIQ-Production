<script lang="ts">
  import { onMount } from 'svelte';
  import { WordCloudChart } from '@carbon/charts-svelte';
  import '@carbon/charts/styles.css';
  
  // Define types for our data structure
  interface WordCloudItem {
    word: string;
    frequency: number;
    group: string;
    sentiment: string;
  }
  
  interface FormattedWordCloudItem {
    word: string;
    value: number;
    group: string;
    sentiment: string;
    // Add a field for color assignment that won't affect grouping
    colorGroup: string;
  }
  
  // Props for customization
  export let height = "400px";
  export let width = "100%";
  export let title = "Patient Sentiment Wordcloud";
  export let dataSource: WordCloudItem[] | string | undefined = undefined;
  
  let data: FormattedWordCloudItem[] = [];
  let originalData: FormattedWordCloudItem[] = [];
  
  // Available sentiment values for filtering
  let availableSentiments: string[] = [
    "entirely negative",
    "somewhat negative", 
    "neutral", 
    "somewhat positive", 
    "entirely positive"
  ];
  
  // Selected sentiments (all selected by default)
  let selectedSentiments: string[] = [...availableSentiments];
  
  let options = {
    title,
    height,
    width,
    resizable: true,
    theme: 'white',

    wordCloud: {
      fontSizeMapsTo: 'value',
      wordMapsTo: 'word'
    },
    legend: {
      enabled: true,
      alignment: 'center',
      // Group the legend items by main category, not by sentiment
      customGrouping: (items: any[]) => {
        const groupedItems: { [key: string]: any[] } = {};
        items.forEach((item: any) => {
          const group = item.name.split('-')[0]; // Extract main category
          if (!groupedItems[group]) {
            groupedItems[group] = [];
          }
          groupedItems[group].push(item);
        });
        return Object.values(groupedItems);
      }
    },
    tooltip: {
      enabled: true,
      customHTML: (data: any) => { // Add type annotation
        return `
          <div class="carbon-tooltip">
            <p><strong>${data[0].data.word}</strong></p>
            <p>Frequency: ${data[0].data.value}</p>
            <p>Group: ${data[0].data.group}</p>
            <p>Sentiment: ${data[0].data.sentiment}</p>
          </div>
        `;
      }
    }
  };

  // Format data for Carbon Charts WordCloud with sentiment-based coloring
  function formatData(rawData: WordCloudItem[] | undefined): FormattedWordCloudItem[] {
    if (!rawData || !Array.isArray(rawData)) return [];
    
    return rawData.map(item => ({
      word: item.word,
      value: item.frequency,
      group: item.group, // Keep original group for filtering
      sentiment: item.sentiment,
      colorGroup: `${item.group}-${item.sentiment}` // Use combined value for coloring
    }));
  }

  // Filter data based on selected sentiments
  function filterData() {
    if (selectedSentiments.length === availableSentiments.length) {
      // If all sentiments are selected, show all data
      data = [...originalData];
    } else {
      // Filter data to only show selected sentiments
      data = originalData.filter(item => selectedSentiments.includes(item.sentiment));
    }
  }
  
  // Handle sentiment selection changes
  function handleSentimentChange(sentiment: string) {
    if (selectedSentiments.includes(sentiment)) {
      // Remove sentiment if already selected
      selectedSentiments = selectedSentiments.filter(s => s !== sentiment);
    } else {
      // Add sentiment if not selected
      selectedSentiments = [...selectedSentiments, sentiment];
    }
    
    filterData();
  }
  
  // Toggle all sentiments
  function toggleAllSentiments(selectAll: boolean) {
    selectedSentiments = selectAll ? [...availableSentiments] : [];
    filterData();
  }

  onMount(() => {
    if (dataSource) {
      if (typeof dataSource === 'string') {
        // If dataSource is a URL or path, fetch it
        fetch(dataSource)
          .then(response => response.json())
          .then(jsonData => {
            originalData = formatData(jsonData);
            data = [...originalData]; // Initialize data with all items
          })
          .catch(error => {
            console.error('Error loading wordcloud data:', error);
            // Use fallback data in case of error
            useFallbackData();
          });
      } else {
        // If dataSource is already a data object
        originalData = formatData(dataSource);
        data = [...originalData]; // Initialize data with all items
      }
    } else {
      // No data source provided, use fallback
      useFallbackData();
    }
  });

  function useFallbackData() {
    // Fallback to using sample data
    const fallbackData: WordCloudItem[] = [
      { "word": "Why won't they listen?", "frequency": 7, "group": "Pre-Treatment", "sentiment": "entirely negative" },
      { "word": "Hopeless", "frequency": 8, "group": "Pre-Treatment", "sentiment": "entirely negative" },
      { "word": "Can't lose weight", "frequency": 7, "group": "Pre-Treatment", "sentiment": "entirely negative" },
      { "word": "It's finally working", "frequency": 9, "group": "Post-Treatment", "sentiment": "entirely positive" },
      { "word": "Hopeful again", "frequency": 8, "group": "Post-Treatment", "sentiment": "entirely positive" },
      { "word": "We're not alone", "frequency": 7, "group": "Post-Treatment", "sentiment": "somewhat positive" }
    ];
    originalData = formatData(fallbackData);
    data = [...originalData]; // Initialize data with all items
  }

  // Update options when data changes
  $: {
    if (data.length > 0) {
      options = {
        ...options,
        title,
        height,
        width
      };
    }
  }
</script>

<div class="filter-container">
  <div class="filter-header">
    <h4>Filter by Sentiment</h4>
    <div class="filter-actions">
      <button class="select-all" on:click={() => toggleAllSentiments(true)}>Select All</button>
      <button class="clear-all" on:click={() => toggleAllSentiments(false)}>Clear All</button>
    </div>
  </div>
  <div class="sentiment-filters">
    {#each availableSentiments as sentiment}
      <label class="sentiment-checkbox">
        <input 
          type="checkbox" 
          checked={selectedSentiments.includes(sentiment)} 
          on:change={() => handleSentimentChange(sentiment)} 
        />
        <span class="sentiment-label">{sentiment}</span>
      </label>
    {/each}
  </div>
</div>

{#if data.length > 0}
  <div class="wordcloud-container">
    <WordCloudChart data={data} options={options} />
  </div>
{:else}
  <div class="loading">Loading wordcloud data...</div>
{/if}

<style>
  .wordcloud-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    color: #525252;
    font-style: italic;
  }
  
  .filter-container {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 4px;
    background-color: #f4f4f4;
  }
  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .filter-header h4 {
    margin: 0;
    font-size: 1rem;
  }
  
  .filter-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .filter-actions button {
    background: none;
    border: none;
    color: #0062ff;
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    text-decoration: underline;
  }
  
  .sentiment-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .sentiment-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .sentiment-label {
    font-size: 0.875rem;
  }
</style> 
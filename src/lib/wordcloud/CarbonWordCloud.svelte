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
    originalGroup: string;
    color: string;
  }
  
  // Props for customization
  export let height = "600px";
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

  // Available group values for filtering
  let availableGroups: string[] = [];
  
  // Selected sentiments (all selected by default)
  let selectedSentiments: string[] = [...availableSentiments];
  
  // Selected groups (all selected by default)
  let selectedGroups: string[] = [];
  
  let options = {
    title,
    height,
    width,
    resizable: true,
    theme: 'white',
    color: {
      scale: {
        'entirely negative': '#da1e28',
        'somewhat negative': '#fa4d56', 
        'neutral': '#f59e0b',
        'somewhat positive': '#42be65',
        'entirely positive': '#24a148'
      }
    },
    wordCloud: {
      fontSizeMapsTo: 'value',
      wordMapsTo: 'word'
    },
    legend: {
      enabled: true,
      alignment: 'center',
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
    
    // Extract unique groups for filtering
    const uniqueGroups = [...new Set(rawData.map(item => item.group))];
    availableGroups = uniqueGroups;
    if (selectedGroups.length === 0) {
      selectedGroups = [...uniqueGroups]; // Initialize with all groups selected
    }
    
    return rawData.map(item => ({
      word: item.word,
      value: item.frequency,
      group: item.sentiment, // Use sentiment for grouping/coloring
      sentiment: item.sentiment,
      originalGroup: item.group, // Keep original group for filtering
      color: getSentimentColor(item.sentiment)
    }));
  }

  // Get color based on sentiment
  function getSentimentColor(sentiment: string): string {
    switch (sentiment) {
      case 'entirely negative':
        return '#da1e28'; // Dark red
      case 'somewhat negative':
        return '#fa4d56'; // Light red
      case 'neutral':
        return '#f59e0b'; // Dark Yellow
      case 'somewhat positive':
        return '#42be65'; // Light green
      case 'entirely positive':
        return '#24a148'; // Dark green
      default:
        return '#0f62fe'; // Default blue
    }
  }

  // Filter data based on selected sentiments and groups
  function filterData() {
    if (selectedSentiments.length === availableSentiments.length && 
        selectedGroups.length === availableGroups.length) {
      // If all sentiments and groups are selected, show all data
      data = [...originalData];
    } else {
      // Filter data to only show selected sentiments and groups
      data = originalData.filter(item => 
        selectedSentiments.includes(item.sentiment) && 
        selectedGroups.includes(item.originalGroup)
      );
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
  
  // Handle group selection changes
  function handleGroupChange(group: string) {
    if (selectedGroups.includes(group)) {
      // Remove group if already selected
      selectedGroups = selectedGroups.filter(g => g !== group);
    } else {
      // Add group if not selected
      selectedGroups = [...selectedGroups, group];
    }
    
    filterData();
  }
  
  // Toggle all sentiments
  function toggleAllSentiments(selectAll: boolean) {
    selectedSentiments = selectAll ? [...availableSentiments] : [];
    filterData();
  }

  // Toggle all groups
  function toggleAllGroups(selectAll: boolean) {
    selectedGroups = selectAll ? [...availableGroups] : [];
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

<div class="filters-section">
  <div class="filter-container">
    <div class="filter-header">
      <h4 class="filter-title">Filter by Sentiment</h4>
      <div class="filter-actions">
        <button class="action-btn primary" on:click={() => toggleAllSentiments(true)}>Select All</button>
        <button class="action-btn secondary" on:click={() => toggleAllSentiments(false)}>Clear All</button>
      </div>
    </div>
    <div class="filter-options">
      {#each availableSentiments as sentiment}
        <label class="filter-checkbox">
          <input 
            type="checkbox" 
            checked={selectedSentiments.includes(sentiment)} 
            on:change={() => handleSentimentChange(sentiment)} 
          />
          <span class="filter-label">{sentiment}</span>
        </label>
      {/each}
    </div>
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
    min-height: 500px;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    color: #525252;
    font-style: italic;
  }
  
  .filters-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .filter-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .filter-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-btn {
    border: none;
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  
  .action-btn.primary {
    background: #3b82f6;
    color: #fff;
  }
  
  .action-btn.primary:hover {
    background: #112233;
  }
  
  .action-btn.secondary {
    background: #e2e8f0;
  }
  
  .action-btn.secondary:hover {
    background: #cbd5e1;
  }
  
  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .filter-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.25rem 0;
  }
  
  .filter-checkbox input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    accent-color: #3b82f6;
  }
  
  .filter-label {
    font-size: 0.875rem;
    color: #374151;
    text-transform: capitalize;
    font-weight: 500;
  }
  
  .filter-checkbox:hover .filter-label {
    color: #1f2937;
  }
  
  @media (max-width: 768px) {
    .filters-section {
      padding: 1rem;
    }
    
    .filter-container {
      padding: 1rem;
    }
    
    .filter-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
    
    .filter-actions {
      width: 100%;
      justify-content: flex-end;
    }
    
    .filter-options {
      gap: 0.75rem;
    }
  }
</style> 
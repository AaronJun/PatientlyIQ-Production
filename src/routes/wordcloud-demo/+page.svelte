<script lang="ts">
  import CarbonWordCloud from '$lib/wordcloud/CarbonWordCloud.svelte';
  import SentimentBarChart from '$lib/components/SentimentBarChart.svelte';
  import { onMount } from 'svelte';
  
  interface WordCloudItem {
    word: string;
    frequency: number;
    group: string;
    sentiment: string;
    topic?: string;
    "parent topic"?: string;
  }

  interface PompeData {
    executive_summary: string;
    drug_sentiment: {
      positive_drivers: {
        themes: string[];
        quotes: string[];
      };
      negative_drivers: {
        themes: string[];
        quotes: string[];
      };
    };
    infusion_experience: {
      positive_drivers: {
        themes: string[];
        quotes: string[];
      };
      negative_drivers: {
        themes: string[];
        quotes: string[];
      };
    };
  }

  interface PatientQuote {
    quote: string;
    sentiment: string;
    topic_1: string;
    topic_2: string;
    topic_3: string;
    topic_4: string;
    topic_5: string;
    group?: string;
  }
  
  let allData: WordCloudItem[] = [];
  let drugSentimentData: WordCloudItem[] = [];
  let infusionExperienceData: WordCloudItem[] = [];
  let loading: boolean = true;
  let error: string | null = null;
  
  // Sentiment drivers data
  let sentimentDriversData: WordCloudItem[] = [];
  let drugSentimentDrivers: WordCloudItem[] = [];
  let infusionExperienceDrivers: WordCloudItem[] = [];
  let driversLoading: boolean = true;
  let driversError: string | null = null;
  
  // Pompe data
  let pompeData: PompeData | null = null;
  let pompeLoading: boolean = true;
  let pompeError: string | null = null;

  // Patient quotes data
  let patientQuotes: PatientQuote[] = [];
  let drugSentimentQuotes: PatientQuote[] = [];
  let infusionExperienceQuotes: PatientQuote[] = [];
  let quotesLoading: boolean = true;
  let quotesError: string | null = null;

  // Section expansion state
  let expandedSection: 'drug' | 'infusion' | null = 'infusion';

  function toggleSection(section: 'drug' | 'infusion') {
    if (expandedSection === section) {
      expandedSection = null;
    } else {
      expandedSection = section;
    }
  }

  function categorizeQuote(quote: PatientQuote): 'drug' | 'infusion' | 'neither' {
    if (quote.group === 'Drug Sentiment') return 'drug';
    if (quote.group === 'Infusion Experience') return 'infusion';
    return 'neither';
  }

  function getTopicTags(quote: PatientQuote): string[] {
    return [quote.topic_1, quote.topic_2, quote.topic_3, quote.topic_4, quote.topic_5];
  }
  
  onMount(async () => {
    try {
      // Load original word cloud data
      console.log('Starting to fetch word cloud data...');
      const response = await fetch('/data/rare-obesity-phrases.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.json();
      // Convert frequency from string to number
      allData = rawData.map((item: any) => ({
        ...item,
        frequency: parseInt(item.frequency, 10) || 1
      }));
      console.log('Word cloud data loaded successfully:', allData.length, 'items');
      
      // Use all data without filtering
      drugSentimentData = allData;
      infusionExperienceData = allData;
      
      console.log('All word cloud data:', allData.length, 'items');
      
      loading = false;
    } catch (err: unknown) {
      console.error('Error loading word cloud data:', err);
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      loading = false;
    }

    // Load patient quotes data
    try {
      console.log('Starting to fetch patient quotes data...');
      const quotesResponse = await fetch('/data/pompe-patient-quotes.json');
      
      if (!quotesResponse.ok) {
        throw new Error(`HTTP error! status: ${quotesResponse.status}`);
      }
      
      patientQuotes = await quotesResponse.json();
      console.log('Patient quotes loaded successfully:', patientQuotes.length, 'quotes');
      
      // Categorize quotes
      drugSentimentQuotes = patientQuotes.filter(quote => {
        const category = categorizeQuote(quote);
        return category === 'drug';
      });
      
      infusionExperienceQuotes = patientQuotes.filter(quote => {
        const category = categorizeQuote(quote);
        return category === 'infusion';
      });
      
      console.log('Drug sentiment quotes:', drugSentimentQuotes.length);
      console.log('Infusion experience quotes:', infusionExperienceQuotes.length);
      
      quotesLoading = false;
    } catch (err: unknown) {
      console.error('Error loading patient quotes:', err);
      quotesError = err instanceof Error ? err.message : 'Unknown error occurred';
      quotesLoading = false;
    }

    // Load Pompe patient sentiment data
    try {
      console.log('Starting to fetch Pompe patient data...');
      const pompeResponse = await fetch('/data/pompe-patient-sentiment-summary.json');
      
      if (!pompeResponse.ok) {
        throw new Error(`HTTP error! status: ${pompeResponse.status}`);
      }
      
      pompeData = await pompeResponse.json();
      console.log('Pompe data loaded successfully:', pompeData);
      
      pompeLoading = false;
    } catch (err: unknown) {
      console.error('Error loading Pompe data:', err);
      pompeError = err instanceof Error ? err.message : 'Unknown error occurred';
      pompeLoading = false;
    }

    // Load sentiment drivers data
    try {
      console.log('Starting to fetch sentiment drivers data...');
      const driversResponse = await fetch('/data/pompe-top-sentiment-drivers.json');
      
      if (!driversResponse.ok) {
        throw new Error(`HTTP error! status: ${driversResponse.status}`);
      }
      
      const rawDriversData = await driversResponse.json();
      sentimentDriversData = rawDriversData.map((item: any) => ({
        ...item,
        frequency: parseInt(item.frequency, 10) || item.frequency
      }));
      
      // Use all sentiment drivers data without filtering
      drugSentimentDrivers = sentimentDriversData;
      infusionExperienceDrivers = sentimentDriversData;
      
      console.log('All sentiment drivers data loaded successfully:', sentimentDriversData.length, 'items');
      
      // Debug sentiment filtering
      const drugPositive = drugSentimentDrivers.filter(d => d.sentiment === 'entirely positive' || d.sentiment === 'somewhat positive');
      const drugNegative = drugSentimentDrivers.filter(d => d.sentiment === 'entirely negative' || d.sentiment === 'somewhat negative');
      const infusionPositive = infusionExperienceDrivers.filter(d => d.sentiment === 'entirely positive' || d.sentiment === 'somewhat positive');
      const infusionNegative = infusionExperienceDrivers.filter(d => d.sentiment === 'entirely negative' || d.sentiment === 'somewhat negative');
      
      console.log('Drug Positive drivers:', drugPositive);
      console.log('Drug Negative drivers:', drugNegative);
      console.log('Infusion Positive drivers:', infusionPositive);
      console.log('Infusion Negative drivers:', infusionNegative);
      
      // Check all unique sentiment values
      const allSentiments = [...new Set(sentimentDriversData.map(d => d.sentiment))];
      console.log('All sentiment values found:', allSentiments);
      
      driversLoading = false;
    } catch (err: unknown) {
      console.error('Error loading sentiment drivers data:', err);
      driversError = err instanceof Error ? err.message : 'Unknown error occurred';
      driversLoading = false;
    }
  });
</script>

<div class="min-h-screen bg-slate-100">
  <!-- Header Section -->
  <header class="bg-slate-700 text-white py-8 px-4 md:px-8">
    <div class="container mx-auto max-w-6xl">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex flex-col">
            <h1 class="text-2xl md:text-3xl font-bold">Pompe Disease</h1>
            <h2 class="text-lg md:text-xl text-slate-300">Patient Journey Data</h2>
          </div>
        </div>
        
        <!-- Patient Sentiment Summary in Header -->
        {#if !pompeLoading && !pompeError && pompeData}
          <div class="max-w-md">
            <h3 class="text-lg font-semibold mb-2 text-slate-200">Patient Sentiment Summary</h3>
            <p class="text-sm text-slate-300 leading-relaxed">{pompeData.executive_summary}</p>
          </div>
        {/if}
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="container mx-auto max-w-6xl px-4 md:px-8">
    <!-- Loading States -->
    {#if pompeLoading}
      <div class="pompe-loading py-8">
        <p>Loading patient sentiment data...</p>
      </div>
    {:else if pompeError}
      <div class="pompe-error py-8">
        <p>Error loading patient sentiment data: {pompeError}</p>
      </div>
    {:else if pompeData}
      <!-- Sticky Tab Navigation -->
      <div class="sticky top-0 z-10 bg-white shadow-sm">
        <div class="tab-navigation">
          <button 
            class="tab-button" 
            class:active={expandedSection === 'infusion'}
            on:click={() => toggleSection('infusion')}
          >
            Infusion Experience
          </button>
          <button 
            class="tab-button" 
            class:active={expandedSection === 'drug'}
            on:click={() => toggleSection('drug')}
          >
            Drug Sentiment
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content py-6">
        <!-- Infusion Experience Content -->
        {#if expandedSection === 'infusion'}
          <div class="tab-panel">
            <!-- Patient Quotes for Infusion Experience -->
            <div class="quotes-section bg-slate-50 rounded-lg">
              <h4 class="text-left text-lg font-semibold mb-4">Quotes from Patients & Caregivers</h4>
              {#if quotesLoading}
                <div class="loading-mini">Loading patient quotes...</div>
              {:else if quotesError}
                <div class="error-mini">Error loading quotes: {quotesError}</div>
              {:else if infusionExperienceQuotes.length > 0}
                <div class="quotes-carousel">
                  {#each infusionExperienceQuotes as quote}
                    <div class="quote-card w-full md:min-w-[400px] lg:min-w-[475px]"
                     class:positive={quote.sentiment.includes('positive')} class:negative={quote.sentiment.includes('negative')} class:mixed={quote.sentiment === 'mixed'}>
                      <div class="quote-text">"{quote.quote}"</div>
                      <div class="quote-sentiment">{quote.sentiment}</div>
                      <div class="quote-topics">
                        {#each getTopicTags(quote) as topic}
                          <span class="topic-tag">{topic}</span>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="no-quotes">No infusion experience quotes available</div>
              {/if}
            </div>
            
            <div class="section-content flex flex-col lg:flex-row gap-6">
              <div class="sentiment-summary flex-1">
                <div class="sentiment-drivers flex flex-col gap-6">
                  <div class="positive-drivers">
                    <h4 class="text-lg font-semibold mb-3">Commonly-Mentioned Positive Drivers</h4>
                    <div class="flex flex-col">
                    <p class="driver-summary text-base py-4 max-w-prose text-slate-600">{pompeData.infusion_experience.positive_drivers.themes.join(', ')}</p>
                    {#if driversLoading}
                      <div class="loading-mini">Loading drivers data...</div>
                    {:else if driversError}
                      <div class="error-mini">Error loading drivers: {driversError}</div>
                    {:else if infusionExperienceDrivers.length > 0}
                      <SentimentBarChart 
                        data={infusionExperienceDrivers.filter(d => d.sentiment === 'entirely positive' || d.sentiment === 'somewhat positive')} 
                        title="Topics, by Mention Rate"
                        height={200}
                      />
                    {:else}
                      <div class="no-data">No Topics, by Mention Rate data available</div>
                    {/if}
                  </div>
                  </div>
                  
                  <div class="negative-drivers">
                    <h4 class="text-lg font-semibold mb-3">Commonly-Mentioned Negative Drivers</h4>
                    <p class="driver-summary text-base py-4 max-w-prose text-slate-600">{pompeData.infusion_experience.negative_drivers.themes.join(', ')}</p>
                    {#if driversLoading}
                      <div class="loading-mini">Loading drivers data...</div>
                    {:else if driversError}
                      <div class="error-mini">Error loading drivers: {driversError}</div>
                    {:else if infusionExperienceDrivers.length > 0}
                      <SentimentBarChart 
                        data={infusionExperienceDrivers.filter(d => d.sentiment === 'entirely negative' || d.sentiment === 'somewhat negative')} 
                        title="Topics, by Mention Rate"
                        height={200}
                      />
                    {:else}
                      <div class="no-data">No Topics, by Mention Rate data available</div>
                    {/if}
                  </div>
                </div>
              </div>
              
              <div class="wordcloud-container flex-1 min-h-[400px] lg:min-h-[500px]">
                {#if loading}
                  <div class="loading-mini">Loading word cloud...</div>
                {:else if infusionExperienceData.length > 0}
                  <div class="chart-container h-full">
                    <CarbonWordCloud 
                      dataSource={infusionExperienceData} 
                      title=""
                      height="100%"
                    />
                  </div>
                {:else}
                  <div class="no-data">No Infusion Experience data available</div>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        <!-- Drug Sentiment Content -->
        {#if expandedSection === 'drug'}
          <div class="tab-panel">
            <!-- Patient Quotes for Drug Sentiment -->
            <div class="quotes-section bg-slate-50 rounded-lg">
              {#if quotesLoading}
                <div class="loading-mini">Loading patient quotes...</div>
              {:else if quotesError}
                <div class="error-mini">Error loading quotes: {quotesError}</div>
              {:else if drugSentimentQuotes.length > 0}
              <h4 class="text-left text-lg font-semibold mb-4">Quotes from Patients & Caregivers</h4>
              <div class="quotes-carousel">
                  {#each drugSentimentQuotes as quote}
                    <div class="quote-card w-full md:min-w-[400px] lg:min-w-[475px]" class:positive={quote.sentiment.includes('positive')} class:negative={quote.sentiment.includes('negative')} class:mixed={quote.sentiment === 'mixed'}>
                      <div class="quote-text">"{quote.quote}"</div>
                      <div class="quote-sentiment">{quote.sentiment}</div>
                      <div class="quote-topics">
                        {#each getTopicTags(quote) as topic}
                          <span class="topic-tag">{topic}</span>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="no-quotes">No drug sentiment quotes available</div>
              {/if}
            </div>
            
            <div class="section-content flex flex-col lg:flex-row gap-6">
              <div class="sentiment-summary flex-1">
                <div class="sentiment-drivers flex flex-col gap-6">
                  <div class="positive-drivers">
                    <h4 class="text-lg font-semibold mb-3">Commonly-Mentioned Positive Drivers</h4>
                    <p class="driver-summary text-base py-4 max-w-prose text-slate-600">{pompeData.drug_sentiment.positive_drivers.themes.join(', ')}</p>
                    {#if driversLoading}
                      <div class="loading-mini">Loading drivers data...</div>
                    {:else if driversError}
                      <div class="error-mini">Error loading drivers: {driversError}</div>
                    {:else if drugSentimentDrivers.length > 0}
                      <SentimentBarChart 
                        data={drugSentimentDrivers.filter(d => d.sentiment === 'entirely positive' || d.sentiment === 'somewhat positive')} 
                        title="Topics, by Mention Rate"
                        height={200}
                      />
                    {:else}
                      <div class="no-data">No Topics, by Mention Rate data available</div>
                    {/if}
                  </div>
                  
                  <div class="negative-drivers">
                    <h4 class="text-lg font-semibold mb-3">Commonly-Mentioned Negative Drivers</h4>
                    <p class="driver-summary text-base py-4 max-w-prose text-slate-600">{pompeData.drug_sentiment.negative_drivers.themes.join(', ')}</p>
                    {#if driversLoading}
                      <div class="loading-mini">Loading drivers data...</div>
                    {:else if driversError}
                      <div class="error-mini">Error loading drivers: {driversError}</div>
                    {:else if drugSentimentDrivers.length > 0}
                      <SentimentBarChart 
                        data={drugSentimentDrivers.filter(d => d.sentiment === 'entirely negative' || d.sentiment === 'somewhat negative')} 
                        title="Topics, by Mention Rate"
                        height={200}
                      />
                    {:else}
                      <div class="no-data">No Topics, by Mention Rate data available</div>
                    {/if}
                  </div>
                </div>
              </div>
              
              <div class="wordcloud-container flex-1 min-h-[400px] lg:min-h-[500px]">
                {#if loading}
                  <div class="loading-mini">Loading word cloud...</div>
                {:else if drugSentimentData.length > 0}
                  <div class="chart-container h-full">
                    <CarbonWordCloud 
                      dataSource={drugSentimentData} 
                      title=""
                      height="100%"
                    />
                  </div>
                {:else}
                  <div class="no-data">No Drug Sentiment data available</div>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
    
    <!-- Error States for Word Cloud Data -->
    {#if loading}
      <div class="loading-container py-8">
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
    {/if}
  </main>
</div>

<style>
  /* Header Styles */
  header {
    position: relative;
  }

  /* Tab Navigation Styles */
  .tab-navigation {
    display: flex;
    border-bottom: 2px solid #e0e0e0;
    background: white;
    padding: 0 1rem;
  }
  
  .tab-button {
    padding: 1rem 2rem;
    background: transparent;
    border: none;
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
  }
  
  .tab-button:hover {
    color: #374151;
    background: #f9fafb;
  }
  
  .tab-button.active {
    color: #161616;
    border-bottom-color: #6b7280;
    background: #f9fafb;
  }
  
  .tab-content {
    flex: 1;
    overflow-y: auto;
  }
  
  .tab-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  }

  /* Quotes Section Styles */
  .quotes-section {
    margin-bottom: 2rem;
    padding: 2.125rem;
  }

  .quotes-carousel {
    display: flex;
    gap: 1.5rem;
    overflow-x: auto;
    padding: 1rem 0;
    scroll-behavior: smooth;
  }

  .quotes-carousel::-webkit-scrollbar {
    height: 8px;
  }

  .quotes-carousel::-webkit-scrollbar-thumb {
    background: #c1c1c1;
  }

  .quotes-carousel::-webkit-scrollbar-thumb:hover {
    background: #c1c1c1;
  }

  .quote-card {
    padding: 2.125rem;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1.25px solid #e5e7eb;
    gap: 1rem;
    transition: all 0.3s ease;
  }

  .quote-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .quote-card.positive {
    border-left: 4px solid #22c55e;
  }

  .quote-card.negative {
    border-left: 4px solid #ef4444;
  }

  .quote-card.mixed {
    border-left: 4px solid #f59e0b;
  }

  .quote-text {
    font-size: 1rem;
    line-height: 1.6;
    color: #374151;
    flex-grow: 1;
    min-height: 3rem;
  }

  .quote-sentiment {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    align-self: flex-start;
  }

  .quote-card.positive .quote-sentiment {
    background: #dcfce7;
    color: #166534;
  }

  .quote-card.negative .quote-sentiment {
    background: #fee2e2;
    color: #991b1b;
  }

  .quote-card.mixed .quote-sentiment {
    background: #fef3c7;
    color: #92400e;
  }

  .quote-topics {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .topic-tag {
    font-size: 0.7rem;
    background: #f3f4f6;
    color: #6b7280;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    font-weight: 500;
  }

  .no-quotes {
    text-align: left;
    color: #6b7280;
    padding: 2rem;
  }
  
  .section-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  }
  
  .sentiment-summary {
    padding: 1rem;
    background: white;
  }
  
  .sentiment-drivers {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  @media (min-width: 768px) {
    .sentiment-drivers {
      flex-direction: row;
      gap: 2rem;
    }
    
    .positive-drivers, .negative-drivers {
      flex: 1;
    }
  }
  
  .positive-drivers, .negative-drivers {
    padding: 1rem;
  }
  
  .positive-drivers {
    background: #f0f9f0;
    border-left: 4px solid #24a148;
  }
  
  .negative-drivers {
    background: #fef2f2;
    border-left: 4px solid #da1e28;
  }
  
  .positive-drivers h4 {
    color: #0f5132;
    margin-bottom: 0.75rem;
  }
  
  .negative-drivers h4 {
    color: #842029;
    margin-bottom: 0.75rem;
  }
  
  .themes, .quotes {
    margin-bottom: 1rem;
  }
  
  .themes strong, .quotes strong {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .themes ul, .quotes ul {
    margin: 0;
    padding-left: 1.5rem;
  }
  
  .themes li, .quotes li {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .quotes li {
    color: #525252;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }
  
  .pompe-loading, .pompe-error {
    text-align: left;
    padding: 1rem;
    margin: 1rem 0;
  }
  
  .pompe-error {
    color: #dc2626;
    background: #fef2f2;
    border-radius: 8px;
  }
  
  .wordclouds-header {
    margin: 3rem 0 2rem 0;
    text-align: left;
  }
  
  .wordclouds-header h2 {
    font-size: 2rem;
    color: #161616;
    margin-bottom: 0.5rem;
  }
  
  .description {
    font-size: 1.1rem;
    color: #525252;
    max-width: 900px;
    margin: 0 auto 3rem auto;
    text-align: left;
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
    text-align: left;
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
    text-align: left;
  }
  
  .section-description {
    font-size: 0.9rem;
    color: #6f6f6f;
    text-align: left;
    margin-bottom: 1rem;
    line-height: 1.4;
    min-height: 2.8rem;
  }
  
  .wordcloud-container {

    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .wordcloud-container .chart-container {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }
  
  .loading-mini {
    color: #6b7280;
    font-style: italic;
    text-align: left;
    padding: 2rem;
  }
  
  .error-mini {
    color: #dc2626;
    background: #fef2f2;
    border-radius: 8px;
    text-align: left;
    padding: 1rem;
    font-size: 0.9rem;
  }
  
  .legend {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: left;
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
  
  /* Responsive Styles */
  @media (max-width: 768px) {
    .tab-navigation {
      padding: 0 0.5rem;
    }
    
    .tab-button {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      text-align: center;
      flex: 1;
    }
    
    .quotes-carousel {
      padding: 0.5rem 0;
    }
    
    .quote-card {
      min-width: 280px;
      padding: 1.5rem;
    }
    
    .section-content {
      flex-direction: column;
    }
    
    .sentiment-drivers {
      gap: 1rem;
    }
    
    .wordcloud-container {
      min-height: 300px;
    }
    
    .legend-items {
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
  }
  
  @media (max-width: 480px) {
    .quote-card {
      min-width: 250px;
      padding: 1rem;
    }
    
    .tab-button {
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
    }
  }
</style> 
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

  // Topics that relate to drug sentiment
  const drugSentimentTopics = [
    'treatment efficacy', 'drug availability', 'drug response', 'drug tolerance', 
    'drug safety', 'drug sustainability', 'treatment burden', 'lab improvement',
    'clinical response', 'long-term outcome', 'treatment milestone', 'hope',
    'muscle function', 'stability', 'immunogenicity', 'antibody monitoring',
    'adverse reactions', 'treatment access', 'decision burden'
  ];

  // Topics that relate to infusion experience
  const infusionExperienceTopics = [
    'infusion duration', 'infusion routine', 'infusion logistics', 'infusion interruption',
    'caregiver support', 'treatment burden', 'fatigue', 'emotional toll'
  ];

  function categorizeQuote(quote: PatientQuote): 'drug' | 'infusion' | 'both' | 'neither' {
    const allTopics = [quote.topic_1, quote.topic_2, quote.topic_3, quote.topic_4, quote.topic_5];
    
    const hasDrugTopic = allTopics.some(topic => drugSentimentTopics.includes(topic));
    const hasInfusionTopic = allTopics.some(topic => infusionExperienceTopics.includes(topic));
    
    if (hasDrugTopic && hasInfusionTopic) return 'both';
    if (hasDrugTopic) return 'drug';
    if (hasInfusionTopic) return 'infusion';
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
      
      // Filter data by group
      drugSentimentData = allData.filter((item: WordCloudItem) => item.group === 'Drug Sentiment');
      infusionExperienceData = allData.filter((item: WordCloudItem) => item.group === 'Infusion Experience');
      
      console.log('Drug Sentiment data:', drugSentimentData.length, 'items');
      console.log('Infusion Experience data:', infusionExperienceData.length, 'items');
      
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
        return category === 'drug' || category === 'both';
      });
      
      infusionExperienceQuotes = patientQuotes.filter(quote => {
        const category = categorizeQuote(quote);
        return category === 'infusion' || category === 'both';
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
      
      // Filter data by group
      drugSentimentDrivers = sentimentDriversData.filter((item: WordCloudItem) => item.group === 'Drug Sentiment');
      infusionExperienceDrivers = sentimentDriversData.filter((item: WordCloudItem) => item.group === 'Infusion Experience');
      
      console.log('Sentiment drivers data loaded successfully:', sentimentDriversData.length, 'items');
      console.log('Drug Sentiment drivers:', drugSentimentDrivers.length, 'items');
      console.log('Infusion Experience drivers:', infusionExperienceDrivers.length, 'items');
      
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

<div class="container flex flex-col text-left align-left justify-start h-full">
  <div class="flex flex-col">
    <div class="flex flex-row">
    <h1 class="text-2xl font-bold">Pompe Disease Patient Journey Wordclouds</h1>
  </div>
  </div>
  <!-- Pompe Patient Sentiment Summary -->
  {#if pompeLoading}
    <div class="pompe-loading">
      <p>Loading patient sentiment data...</p>
    </div>
  {:else if pompeError}
    <div class="pompe-error">
      <p>Error loading patient sentiment data: {pompeError}</p>
    </div>
  {:else if pompeData}
    <div class="pompe-summary flex flex-col md:flex-row md:justify-between w-full h-full">
      <h2>Patient Sentiment Summary</h2>
      <p class="executive-summary max-w-prose">{pompeData.executive_summary}</p>
      </div>
      <div class="flex flex-col h-full">
            <div class="integrated-sections min-h-full">
        <!-- Infusion Experience Section -->
        <div class="integrated-section"
             class:expanded={expandedSection === 'infusion'}
             class:collapsed={expandedSection !== null && expandedSection !== 'infusion'}>
          <div class="section-title"
               on:click={() => toggleSection('infusion')}>
            <h3 class="vertical-title">Infusion Experience</h3>
          </div>
          <div class="section-content-wrapper"
               class:hidden={expandedSection !== null && expandedSection !== 'infusion'}>
            
            
            <!-- Patient Quotes for Infusion Experience -->
            <div class="quotes-section bg-slate-50">
              <h4 class="text-left text-base font-semibold">Quotes from Patients & Caregivers</h4>
              {#if quotesLoading}
                <div class="loading-mini">Loading patient quotes...</div>
              {:else if quotesError}
                <div class="error-mini">Error loading quotes: {quotesError}</div>
              {:else if infusionExperienceQuotes.length > 0}
                <div class="quotes-carousel">
                  {#each infusionExperienceQuotes as quote}
                    <div class="quote-card w-full md:min-w-[475px]"
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
            
            <div class="section-content flex flex-col">
              <div class="sentiment-summary flex flex-col">
                <div class="sentiment-drivers flex flex-col md:flex-row gap-4">
                  <div class="positive-drivers">
                    <h4>Positive Drivers</h4>
                    <div class="flex flex-col">
                    <p class="driver-summary text-base py-4 max-w-prose">{pompeData.infusion_experience.positive_drivers.themes.join(', ')}</p>
                    {#if driversLoading}
                      <div class="loading-mini">Loading drivers data...</div>
                    {:else if driversError}
                      <div class="error-mini">Error loading drivers: {driversError}</div>
                    {:else if infusionExperienceDrivers.length > 0}
                      <SentimentBarChart 
                        data={infusionExperienceDrivers.filter(d => d.sentiment === 'entirely positive' || d.sentiment === 'somewhat positive')} 
                        title="Positive Sentiment Drivers"
                        height={200}
                      />
                    {:else}
                      <div class="no-data">No positive sentiment drivers data available</div>
                    {/if}
                  </div>
                  </div>
                  
                  <div class="negative-drivers">
                    <h4>Negative Drivers</h4>
                    <p class="driver-summary text-base py-4 max-w-prose">{pompeData.infusion_experience.negative_drivers.themes.join(', ')}</p>
                    {#if driversLoading}
                      <div class="loading-mini">Loading drivers data...</div>
                    {:else if driversError}
                      <div class="error-mini">Error loading drivers: {driversError}</div>
                    {:else if infusionExperienceDrivers.length > 0}
                      <SentimentBarChart 
                        data={infusionExperienceDrivers.filter(d => d.sentiment === 'entirely negative' || d.sentiment === 'somewhat negative')} 
                        title="Negative Sentiment Drivers"
                        height={200}
                      />
                    {:else}
                      <div class="no-data">No negative sentiment drivers data available</div>
                    {/if}
                  </div>
                </div>
              </div>
              
              <div class="wordcloud-container">
                {#if loading}
                  <div class="loading-mini">Loading word cloud...</div>
                {:else if infusionExperienceData.length > 0}
                  <div class="chart-container">
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
        </div>
        
        <!-- Drug Sentiment Section -->
        <div class="integrated-section" 
             class:expanded={expandedSection === 'drug'}
             class:collapsed={expandedSection !== null && expandedSection !== 'drug'}>
          <div class="section-title"
               on:click={() => toggleSection('drug')}>
            <h3 class="vertical-title">Drug Sentiment</h3>
          </div>
          <div class="section-content-wrapper"
               class:hidden={expandedSection !== null && expandedSection !== 'drug'}>
            
            <!-- Patient Quotes for Drug Sentiment -->
            <div class="quotes-section bg-slate-50">
              {#if quotesLoading}
                <div class="loading-mini">Loading patient quotes...</div>
              {:else if quotesError}
                <div class="error-mini">Error loading quotes: {quotesError}</div>
              {:else if drugSentimentQuotes.length > 0}
              <h4 class="text-left text-base font-semibold">Quotes from Patients & Caregivers</h4>
              <div class="quotes-carousel">
                  {#each drugSentimentQuotes as quote}
                    <div class="quote-card w-full md:min-w-[475px]" class:positive={quote.sentiment.includes('positive')} class:negative={quote.sentiment.includes('negative')} class:mixed={quote.sentiment === 'mixed'}>
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
            
            <div class="section-content">
              <div class="sentiment-summary flex flex-col">
                <div class="sentiment-drivers flex flex-col md:flex-row gap-4">
                  <div class="positive-drivers">
                    <h4>Positive Drivers</h4>
                    <p class="driver-summary text-base py-4 max-w-prose">{pompeData.drug_sentiment.positive_drivers.themes.join(', ')}</p>
                    {#if driversLoading}
                      <div class="loading-mini">Loading drivers data...</div>
                    {:else if driversError}
                      <div class="error-mini">Error loading drivers: {driversError}</div>
                    {:else if drugSentimentDrivers.length > 0}
                      <SentimentBarChart 
                        data={drugSentimentDrivers.filter(d => d.sentiment === 'entirely positive' || d.sentiment === 'somewhat positive')} 
                        title="Positive Sentiment Drivers"
                        height={200}
                      />
                    {:else}
                      <div class="no-data">No positive sentiment drivers data available</div>
                    {/if}
                  </div>
                  
                  <div class="negative-drivers">
                    <h4>Negative Drivers</h4>
                    <p class="driver-summary text-base py-4 max-w-prose">{pompeData.drug_sentiment.negative_drivers.themes.join(', ')}</p>
                    {#if driversLoading}
                      <div class="loading-mini">Loading drivers data...</div>
                    {:else if driversError}
                      <div class="error-mini">Error loading drivers: {driversError}</div>
                    {:else if drugSentimentDrivers.length > 0}
                      <SentimentBarChart 
                        data={drugSentimentDrivers.filter(d => d.sentiment === 'entirely negative' || d.sentiment === 'somewhat negative')} 
                        title="Negative Sentiment Drivers"
                        height={200}
                      />
                    {:else}
                      <div class="no-data">No negative sentiment drivers data available</div>
                    {/if}
                  </div>
                </div>
              </div>
              
              <div class="wordcloud-container">
                {#if loading}
                  <div class="loading-mini">Loading word cloud...</div>
                {:else if drugSentimentData.length > 0}
                  <div class="chart-container">
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
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Error States for Word Cloud Data -->
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
  {/if}
  
</div>

<style>
  .container {
    max-width: 2000px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #161616;
    text-align: left;
  }
  
  .pompe-summary {
    padding: 2rem;
    margin: 2rem 0;
  }
  
  .pompe-summary h2 {
    font-size: 1.8rem;
    color: #161616;
    margin-bottom: 1rem;
  }

  
  .integrated-sections {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    height: 80vh;
    border: .5254px solid #e0e0e0;
  }
  
  .integrated-section {
    position: relative;
    display: flex;
    background: white;
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    min-width: 80px;
  }
  
  .integrated-section:not(.expanded):not(.collapsed) {
    flex: 1;
  }
  
  .integrated-section.expanded {
    flex: 3;
  }
  
  .integrated-section.collapsed {
    flex: 0 0 80px;
  }
  
  .section-title {
    position: relative;
    width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #6b7280;
    z-index: 2;
    cursor: pointer;
  }
  
  .vertical-title {
    writing-mode: vertical-lr;
    text-orientation: mixed;
    font-size: 1.625rem;
    font-weight: 600;
    font-family: 'IBM Plex Serif', serif;
    font-style: italic;
    color: #ffffff;
    text-align: center;
    margin: 0;
    padding: 1rem 0;
  }
  
  .section-content-wrapper {
    flex: 1;
    padding: 1.5rem;
    opacity: 1;
    transition: opacity 0.3s ease;
    overflow-y: auto;
  }
  
  .section-content-wrapper.hidden {
    opacity: 0;
    pointer-events: none;
  }

  /* Quotes Section Styles */
  .quotes-section {
    margin-bottom: 2rem;
    padding: 1rem;
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
  
  @media (min-width: 1200px) {
    .section-content {
      flex-direction: column;
      gap: 2rem;
    }
    
    .sentiment-summary {
      width: 100%;
    }
    
    .wordcloud-container {
      width: 100%;
    }
  }
  
  @media (max-width: 1024px) {
    .integrated-sections {
      flex-direction: column;
      height: auto;
      gap: 1rem;
    }
    
    .integrated-section {
      min-height: 200px;
      flex-direction: column;
    }
    
    .integrated-section.expanded,
    .integrated-section.collapsed,
    .integrated-section:not(.expanded):not(.collapsed) {
      flex: none;
    }
    
    .section-title {
      width: 100%;
      height: 60px;
      border-right: none;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .vertical-title {
      writing-mode: horizontal-tb;
      padding: 1rem;
    }
    
    .section-content-wrapper {
      padding: 1rem;
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
    
    .integrated-sections {
      gap: 1rem;
    }
    
    .pompe-summary {
      padding: 1rem;
    }
  }
</style> 
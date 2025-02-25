<script lang="ts">
    import { onMount } from 'svelte';
    import EnhancedStockChart from './RPDTooltip.svelte';
  
    export let companyToDisplay: string = 'Sarepta';
    
    let stockData: any[] = [];
    let milestoneData: any[] = [];
    let loading = true;
    let error = '';
    let loadingProgress = 0;
    
    async function loadData() {
      try {
        // First load the stock price data
        loadingProgress = 25;
        const stockDataResponse = await window.fs.readFile('rpdCompanyValues.json', { encoding: 'utf8' });
        const parsedStockData = JSON.parse(stockDataResponse);
        stockData = parsedStockData;
        
        // Then load the milestone data
        loadingProgress = 50;
        const milestoneDataResponse = await window.fs.readFile('mergeddata.json', { encoding: 'utf8' });
        const parsedMilestoneData = JSON.parse(milestoneDataResponse);
        milestoneData = parsedMilestoneData;
        
        // Check if our company exists in the milestone data
        const companyExists = milestoneData.some(item => item.Company === companyToDisplay);
        if (!companyExists) {
          error = `Company "${companyToDisplay}" not found in milestone data`;
        }
        
        loadingProgress = 100;
        loading = false;
      } catch (err) {
        error = `Error loading data: ${err.message}`;
        loading = false;
      }
    }
  
    // When the component mounts, load the data
    onMount(loadData);
  </script>
  
  <div class="data-processor">
    {#if loading}
      <div class="loading">
        <p>Loading data... {loadingProgress}%</p>
        <div class="progress-bar">
          <div class="progress" style="width: {loadingProgress}%"></div>
        </div>
      </div>
    {:else if error}
      <div class="error">
        <p>{error}</p>
      </div>
    {:else}
      <EnhancedStockChart 
        companyName={companyToDisplay}
        stockData={stockData}
        milestoneData={milestoneData}
        color="#37587e"
      />
    {/if}
  </div>
  
  <style>
    .data-processor {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .loading, .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      width: 100%;
      background-color: #f8fafc;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }
    
    .error {
      color: #ef4444;
    }
    
    .progress-bar {
      width: 80%;
      height: 8px;
      background-color: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    
    .progress {
      height: 100%;
      background-color: #3b82f6;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
  </style>
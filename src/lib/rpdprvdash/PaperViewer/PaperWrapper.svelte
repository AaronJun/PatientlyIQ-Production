<script lang="ts">
    import { onMount } from 'svelte';
    import AcademicPaperNavigator from './PaperViewer.svelte';
    import { Balanced } from 'carbon-pictograms-svelte';
    
    // State for the paper content
    let paperContent = '';
    let isLoading = true;
    let error = null;
  
    // You have two options for loading the HTML content:
    
    // OPTION 1: If you've saved the HTML as a static file in your public directory
    // Load it via fetch (this assumes you put the file at /static/prv-paper.html)
    async function loadPaperContent() {
      try {
        const response = await fetch('/static/research/prv-research-main.html');
        if (!response.ok) {
          throw new Error(`Failed to load paper: ${response.status}`);
        }
        paperContent = await response.text();
        isLoading = false;
      } catch (err) {
        console.error('Error loading paper:', err);
        error = err.message;
        isLoading = false;
      }
    }
    
    // OPTION 2: If you want to import it directly in your code
    // You could include it as a string variable or import it
    // import paperHtmlContent from '$lib/data/prv-paper.html?raw';
    // Then set paperContent = paperHtmlContent;
    
    onMount(() => {
      loadPaperContent();
    });
  </script>
  
  <div class="min-h-screen bg-slate-100/50">

    </div>
    
    <!-- Main content area -->
    <main class="flex-1 mt-4 pb-8">
      {#if isLoading}
        <div class="flex justify-center items-center h-64">
          <div class="spinner border-t-4 border-orange-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
        </div>
      {:else if error}
        <div class="text-center text-red-500 p-8">
          <h2 class="text-xl font-bold">Error Loading Paper</h2>
          <p class="mt-2">{error}</p>
          <button 
            class="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            on:click={loadPaperContent}
          >
            Try Again
          </button>
        </div>
      {:else}
        <AcademicPaperNavigator content={paperContent} />
      {/if}
    </main>
  </div>
  
  <style>
    /* Spinner animation */
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    /* Match your existing styles */
    .tab-button {
      border-bottom: 1px solid #e0e0e0;
      position: relative;
      transition: all 0.3s ease;
    }
    
    .tab-button:active {
      border-bottom: 2px solid #ff7373;
    }
    
    .active-tab {
      border-bottom: 2px solid #FF5501 !important;
      position: relative;
    }
    
    .active-tab::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #FF5501;
    }
  </style>
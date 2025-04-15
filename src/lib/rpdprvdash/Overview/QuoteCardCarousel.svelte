<script lang="ts">
    import { onMount } from 'svelte';
    import CardCarousel from './CardCarousel.svelte';
    import QuoteCard from './QuoteCard.svelte';
    
    // Define the interface here directly instead of trying to import it
    interface RPDCompanyQuote {
        Company: string;
        Name: string;
        Position: string;
        HighlightedQuote: string;
        FullQuote: string;
        QuoteSource: string;
    }
    
    // Import quotes - note that the data is directly an array, not wrapped in a data property
    import quotesImport from '../../../lib/data/rpdprvdash/RPDCompanyQuotes.json';
    
    // Create a local array to hold all quotes
    let quotes: RPDCompanyQuote[] = [];
    
    // Track expanded state for ea   quote
    let expandedStates: boolean[] = [];

    // If we have just one quote, duplicate it to make carousel work better
    function prepareQuotes() {
        if (Array.isArray(quotesImport)) {
            if (quotesImport.length === 1) {
                // If only one quote, duplicate it to enable carousel
                quotes = [...quotesImport, ...quotesImport] as RPDCompanyQuote[];
            } else if (quotesImport.length < 4) {
                // If we have less than 4 quotes (needed for grid view), duplicate them
                quotes = [...quotesImport, ...quotesImport] as RPDCompanyQuote[];
            } else {
                quotes = quotesImport as RPDCompanyQuote[];
            }
        } else {
            console.error('Quote data has unexpected structure:', quotesImport);
            quotes = [];
        }
        
        // Initialize expanded states
        expandedStates = new Array(quotes.length).fill(false);
    }
    
    onMount(() => {
        prepareQuotes();
    });
    
    function handleToggle(index: number) {
        expandedStates[index] = !expandedStates[index];
        expandedStates = [...expandedStates]; // Trigger reactivity
    }
</script>

<div class="flex flex-col md:flex-row align-top justify-evenly">
<h2 class="text-xl font-medium text-slate-700 lg:w-1/3 text-pretty">
    Industry Perspectives
</h2> 
<div class="quote-carousel-container flex flex-col gap-8 lg:gap-16 h-full align-top ">
    
    {#if quotes.length > 0}
        <CardCarousel cards={quotes} >
            <svelte:fragment let:card let:index>
                <div class="quote-card flex flex-col justify-between w-full md:max-w-prose h-full align-top mb-2 mr-2 p-4 bg-slate-100/50">
                    <QuoteCard 
                        quote={card} 
                        isExpanded={expandedStates[index]} 
                        on:toggle={() => handleToggle(index)}
                    />
                </div>
            </svelte:fragment>
        </CardCarousel>
    {:else}
        <div class="loading-container">
            <p>Loading quotes...</p>
        </div>
    {/if}
</div>
</div>

<style>
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        color: #6b7280;
    }

    .quote-card {
    }
    
</style> 
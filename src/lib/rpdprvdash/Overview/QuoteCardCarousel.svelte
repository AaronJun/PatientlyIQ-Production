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
    
    // Track expanded state for each quote
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

<div class="quote-carousel-container flex flex-col lg:flex-row gap-8 lg:gap-16 h-full py-12">
    <h2 class="text-3xl font-medium text-slate-700 mb-4 lg:w-1/3 text-pretty lg:pr-8">
        Perspectives from the Industry
    </h2> 
    
    {#if quotes.length > 0}
        <CardCarousel cards={quotes} >
            <svelte:fragment let:card let:index>
                <div class="card h-full">
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

<style>
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        color: #6b7280;
    }
    
</style> 
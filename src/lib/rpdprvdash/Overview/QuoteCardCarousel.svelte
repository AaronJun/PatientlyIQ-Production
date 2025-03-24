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

<div class="quote-carousel-container w-96 h-full rounded-lg border border-slate-200 pt-8 pl-8">
    <h3 class="text-2xl font-light text-slate-700 mb-4">Perspectives <span class="italic font-serif"> from</span> the Industry</h3>
    
    {#if quotes.length > 0}
        <CardCarousel cards={quotes} focusScale={1.1}>
            <svelte:fragment let:card let:index>
                <div class="card">
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
    .quote-carousel-container {
        width: 100%;
        height: 100%;
        min-height: 250px;
    }
    
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 200px;
        color: #6b7280;
    }
    
    /* Enhance the card appearance */
    :global(.card) {
        transition: all 0.3s ease;
        height: 100%;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        overflow: hidden;
    }
</style> 
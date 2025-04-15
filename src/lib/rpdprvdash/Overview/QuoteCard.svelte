<script lang="ts">
    import { fade } from "svelte/transition";
    import { createEventDispatcher } from 'svelte';
    import {Quotes, ArrowUpRight} from 'carbon-icons-svelte';
    import { Separator } from 'bits-ui';
    // Define the type locally since it's not exported from the JSON file
    interface RPDCompanyQuote {
        Company: string;
        Name: string;
        Position: string;
        HighlightedQuote: string;
        FullQuote: string;
        QuoteSource: string;
    }

    export let quote: RPDCompanyQuote;
    export let isExpanded = false;
    
    const dispatch = createEventDispatcher();
    
    function toggleExpanded() {
        isExpanded = !isExpanded;
        dispatch('toggle');
    }

    function getQuoteText() {
        return isExpanded ? quote.FullQuote : quote.HighlightedQuote;
    }
</script>

<div class="quote-card transition-all duration-300 flex flex-col justify-between h-full">
    <div class="card-content relative">
        <Quotes class="text-slate-100 w-10 h-10 font-serif mb-8 p-3 bg-slate-500 rounded-full" />
        <div class="quote-text text-slate-700 font-light text-base leading-relaxed mb-4" in:fade={{ duration: 300 }}>
            <p>{getQuoteText()}</p>
            <!-- <button 
                class="read-more-btn mt-2 text-slate-500 text-xs hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 rounded px-2"
                on:click={toggleExpanded}
                aria-label={isExpanded ? "Show less" : "Read more"}
            >
                {isExpanded ? 'Show less' : 'Read more'}
            </button> -->
        </div>
    </div>
    
    <div class="quote-footer mt-12 pt-2 border-t border-slate-100">
        <div class="quote-author text-slate-800 font-medium text-base">{quote.Name}</div>
        <div class="quote-position text-slate-600 text-xs">{quote.Position}, {quote.Company}</div>
        {#if quote.QuoteSource}
            <a 
                href={quote.QuoteSource} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="quote-source inline-flex items-center text-emerald-700 font-semibold text-xs mt-2 hover:text-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded pt-2"
                aria-label="View source of quote"
            >
                Source <ArrowUpRight class="ml-1 h-3 w-3" />
            </a>
        {/if}
    </div>


</div>

<style>
    

</style>
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

<div class="quote-card border border-slate-100 rounded-lg transition-all duration-300 flex flex-col justify-between h-full px-4 py-6 bg-white relative">
    <div class="card-content relative">
        <Quotes class="text-slate-800 w-4 h-4 font-serif mb-2 absolute -top-2 -left-1" />

        <Separator.Root
            orientation="horizontal"
            class="bg-slate-400 shrink-0 data-[orientation=horizontal]:h-[.2725px] data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px] mb-4"
        />      
          
        <div class="quote-text text-slate-700 font-light text-base leading-relaxed mb-4" in:fade={{ duration: 300 }}>
            <p class="first-letter:text-xl first-letter:font-serif">{getQuoteText()}</p>
            <button 
                class="read-more-btn mt-2 text-slate-500 text-xs hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 rounded px-2"
                on:click={toggleExpanded}
                aria-label={isExpanded ? "Show less" : "Read more"}
            >
                {isExpanded ? 'Show less' : 'Read more'}
            </button>
        </div>
    </div>
    
    <div class="quote-footer mt-auto pt-2 border-t border-slate-100">
        <div class="quote-author text-slate-800 font-medium text-base">{quote.Name}</div>
        <div class="quote-position text-slate-600 text-xs">{quote.Position}<br>{quote.Company}</div>
        {#if quote.QuoteSource}
            <a 
                href={quote.QuoteSource} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="quote-source inline-flex items-center text-slate-800 text-xs mt-2 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded px-1 py-0.5"
                aria-label="View source of quote"
            >
                Source <ArrowUpRight class="ml-1 h-3 w-3" />
            </a>
        {/if}
    </div>

    <!-- Add a hover effect overlay -->
    <div class="card-hover-effect"></div>
</div>

<style>
    .quote-card {
        max-width: 100%;
        height: 100%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        position: relative;
        overflow: hidden;
    }
    
    .quote-text {
        line-height: 1.6;
        position: relative;
        z-index: 1;
    }
    
    .quote-footer {
        position: relative;
        z-index: 1;
    }
    
    /* Hide the read more button if quote is short */
    .read-more-btn {
        display: none;
    }
    /* Card hover effect overlay */
    .card-hover-effect {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(249, 250, 251, 0.05) 100%);
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 0;
        transform: translateY(100%);
        pointer-events: none;
    }
    
    .quote-card:hover .card-hover-effect {
        opacity: 1;
        transform: translateY(0);
    }
</style>
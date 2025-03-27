<!-- CardCarousel.svelte -->
<script lang="ts">

    import { fly } from 'svelte/transition';

    export let cards: any[] = [];
    

    let currentPage = 0;
    let totalPages = 0;
    let isMobileView = true; // Track if we're in mobile view
    
    // Calculate total pages based on view mode and cards length
    $: {
        // In mobile view, each page is 1 card
        // In desktop view, each page is 4 cards (2x2 grid)
        const cardsPerPage = isMobileView ? 1 : 4;
        totalPages = Math.ceil(cards.length / cardsPerPage);
    }
    
    $: currentPage = Math.min(currentPage, totalPages - 1);
    $: currentPage = Math.max(currentPage, 0);
    

</script>

<div class="quotes-container h-full">
        <div class="flex flex-col gap-4">
            {#each Array(totalPages) as _, pageIndex}
                {#if currentPage === pageIndex}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {#each Array(4) as _, gridIndex}
                            {#if cards[pageIndex * 4 + gridIndex]}
                                <div 
                                    class="grid-card-container"
                                    in:fly={{ y: 20, duration: 300, delay: gridIndex * 100 }}
                                >
                                    <slot 
                                        card={cards[pageIndex * 4 + gridIndex]} 
                                        index={pageIndex * 4 + gridIndex}
                                    ></slot>
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/if}
            {/each}
        </div>

</div>

<style>
        
</style> 
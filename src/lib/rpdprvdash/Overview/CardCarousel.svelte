<!-- CardCarousel.svelte -->
<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import { fly } from 'svelte/transition';
    import { ArrowLeft, ArrowRight } from 'carbon-icons-svelte';

    export let cards: any[] = [];
    
    let carouselEl: HTMLElement;
    let cardWidth = 300; 
    let currentPage = 0;
    let totalPages = 0;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isProgrammaticScroll = false; // Flag to indicate programmatic scrolling
    
    $: totalPages = Math.ceil(cards.length);
    $: currentPage = Math.min(currentPage, totalPages - 1);
    $: currentPage = Math.max(currentPage, 0);
    
    function goToPage(pageNum: number) {
        if (pageNum >= 0 && pageNum < totalPages) {
            currentPage = pageNum;
            scrollToPage();
        }
    }
    
    function scrollToPage() {
        // Set flag to indicate programmatic scrolling
        isProgrammaticScroll = true;
        
        // Increased overlap for more stacking effect
        const scrollPos = currentPage * (cardWidth - 150); // More overlap (150px instead of 60px)
        if (carouselEl) {
            carouselEl.scrollTo({
                left: scrollPos,
                behavior: 'smooth'
            });
            
            // Reset the flag after the scroll animation is likely to be complete
            setTimeout(() => {
                isProgrammaticScroll = false;
            }, 500);
        } else {
            isProgrammaticScroll = false;
        }
    }
    
    function nextCard() {
        if (currentPage < totalPages - 1) {
            currentPage++;
            scrollToPage();
        }
    }
    
    function prevCard() {
        if (currentPage > 0) {
            currentPage--;
            scrollToPage();
        }
    }
    
    function handleTouchStart(e: TouchEvent) {
        startX = e.touches[0].clientX;
        isDragging = true;
        prevTranslate = currentTranslate;
    }
    
    function handleTouchMove(e: TouchEvent) {
        if (isDragging) {
            const currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            currentTranslate = prevTranslate + diff;
            
            // Add a visual drag effect
            if (carouselEl) {
                // Calculate a drag offset but limit it to prevent excessive movement
                const maxDrag = 50;
                const dragOffset = Math.max(Math.min(diff / 3, maxDrag), -maxDrag);
                carouselEl.style.transform = `translateX(${dragOffset}px)`;
            }
            
            // Prevent default to block page scrolling while swiping
            e.preventDefault();
        }
    }
    
    function handleTouchEnd() {
        isDragging = false;
        // Reset any visual transformation
        if (carouselEl) {
            carouselEl.style.transform = '';
        }
        
        const threshold = cardWidth / 8; // Make it easier to swipe
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -threshold && currentPage < totalPages - 1) {
            nextCard();
        } else if (movedBy > threshold && currentPage > 0) {
            prevCard();
        } else {
            scrollToPage(); // Go back to current page position
        }
    }
    
    function handleMouseDown(e: MouseEvent) {
        e.preventDefault();
        startX = e.clientX;
        isDragging = true;
        prevTranslate = currentTranslate;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    function handleMouseMove(e: MouseEvent) {
        if (isDragging) {
            const currentX = e.clientX;
            const diff = currentX - startX;
            currentTranslate = prevTranslate + diff;
            
            // Add a visual drag effect
            if (carouselEl) {
                const maxDrag = 50;
                const dragOffset = Math.max(Math.min(diff / 3, maxDrag), -maxDrag);
                carouselEl.style.transform = `translateX(${dragOffset}px)`;
            }
        }
    }
    
    function handleMouseUp() {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        isDragging = false;
        
        // Reset any visual transformation
        if (carouselEl) {
            carouselEl.style.transform = '';
        }
        
        const threshold = cardWidth / 4; // Make it easier to swipe
        const movedBy = currentTranslate - prevTranslate;
        
        if (movedBy < -threshold && currentPage < totalPages - 1) {
            nextCard();
        } else if (movedBy > threshold && currentPage > 0) {
            prevCard();
        } else {
            scrollToPage(); // Go back to current page position
        }
    }
    
    function handleScroll() {
        if (carouselEl && !isProgrammaticScroll) {
            // Only update currentPage if the scroll was initiated by user, not by our code
            const scrollPos = carouselEl.scrollLeft;
            currentPage = Math.round(scrollPos / (cardWidth - 150));
        }
    }
    
    onMount(() => {
        if (carouselEl) {
            cardWidth = carouselEl.querySelector('.card')?.clientWidth || 300;
            carouselEl.addEventListener('scroll', handleScroll);
        }
        
        // Set initial scroll position after a small delay to ensure cardWidth is correct
        setTimeout(scrollToPage, 100);
        
        return () => {
            if (carouselEl) {
                carouselEl.removeEventListener('scroll', handleScroll);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    });
</script>

<div class="carousel-container">
    <div 
        class="carousel flex flex-row overflow-x-auto"
        bind:this={carouselEl}
        on:touchstart={handleTouchStart}
        on:touchmove={handleTouchMove}
        on:touchend={handleTouchEnd}
        on:mousedown={handleMouseDown}
        role="listbox"
        tabindex="0"
        aria-label="Card carousel"
        aria-roledescription="carousel"
    >
    {#each cards as card, i}

        <div 
            class="card-container"
            in:fly={{ x: 100, duration: 300, delay: i * 100 }}
            role="option"
            aria-selected={currentPage === i}
            >
            <slot {card} index={i}></slot>
            </div>
    {/each}
</div>
    
    <div class="carousel-controls">
        <button 
            class="nav-button prev"
            on:click={prevCard}
            disabled={currentPage === 0}
            aria-label="Previous card"
        >
            <ArrowLeft class="w-4 h-4" />
        </button>
        
        <div class="dots">
            {#each Array(totalPages) as _, i}
                <button 
                    class="dot {currentPage === i ? 'active' : ''}"
                    on:click={() => goToPage(i)}
                    aria-label="Go to slide {i + 1}"
                ></button>
            {/each}
        </div>
        
        <button 
            class="nav-button next"
            on:click={nextCard}
            disabled={currentPage === totalPages - 1}
            aria-label="Next card"
        >
            <ArrowRight class="w-4 h-4" />
        </button>
    </div>
</div>

<style>
    .carousel {
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    
    .carousel::-webkit-scrollbar {
        display: none;
    }
    
    .card-container {
        transition: transform 0.3s ease-out;
    }
    
    /* Hover effect to bring card forward */
    .card-container:hover {
        transform: translateY(-10px) !important;
        z-index: 100 !important;
    }
    
    .carousel-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 1rem;
        gap: 1rem;
    }
    
    .dots {
        display: flex;
        gap: 6px;
    }
    
    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #6FF117;
        filter: saturate(0.125);
        border: none;
        cursor: pointer;
        transition: background-color 0.2s, filter 0.2s, ease-in-out;
    }
    
    .dot.active {
        background-color: #6EE999;
        outline: 1px solid #6EE7B7;
        filter: saturate(1.25);
        outline-offset: 2px;
    }
</style> 
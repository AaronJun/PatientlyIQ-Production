<!-- CardCarousel.svelte -->
<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import { fly } from 'svelte/transition';
    import { ArrowLeft, ArrowRight } from 'carbon-icons-svelte';

    export let cards: any[] = [];
    export let focusScale: number = 1.08; // Scale factor for focused cards
    
    let carouselEl: HTMLElement;
    let cardWidth = 520; 
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
            cardWidth = carouselEl.querySelector('.card')?.clientWidth || 500;
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

<div class="carousel-container h-full py-8">
    <div 
        class="carousel flex flex-row gap-16 overflow-x-auto w-full"
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
            class="card-container pb-8"
            class:active={currentPage === i}
            style="--focus-scale: {focusScale};"
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
        overflow-x: auto;
        overflow-y: show;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding: 0 2rem; /* Increased padding for better spacing */
    }
    
    .carousel::-webkit-scrollbar {
        display: none;
    }
    
    .carousel-container {
        position: relative;
        width: 100%;
        max-width: 100vw;
        overflow: hidden;
        padding: 0 1rem; /* Add container padding */
    }
    
    .card-container {
        scroll-snap-align: start;
        transition: transform 0.3s ease, filter 0.3s ease; 
        flex: 0 0 auto;
        width: min(520px, 85vw);
        will-change: transform;
        margin: 0 0.5rem; /* Add small margin to prevent edge touching */
    }
    
    .card-container.active {
        transform: scale(var(--focus-scale, 1.08));
        filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.1));
        z-index: 10;
    }
    
    .carousel-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
        padding: 0 1rem; /* Add padding to align with cards */
    }
    
    .nav-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border: none;
        border-radius: 50%;
        background-color: white;
        color: #4b5563;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: background-color 0.2s, transform 0.2s;
    }
    
    .nav-button:hover:not([disabled]) {
        background-color: #f3f4f6;
        transform: translateY(-1px);
    }
    
    .nav-button:active:not([disabled]) {
        transform: translateY(0);
    }
    
    .nav-button[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .dots {
        display: flex;
        gap: 0.5rem;
    }
    
    .dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background-color: #d1d5db;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: transform 0.2s, background-color 0.2s;
    }
    
    .dot:hover {
        transform: scale(1.2);
    }
    
    .dot.active {
        background-color: #4b5563;
        transform: scale(1.2);
    }
    
    /* Responsive adjustments */
    @media (max-width: 640px) {
        .card-container {
            width: 85vw;
        }
        
        .carousel-controls {
            margin-top: 0.5rem;
        }
        
        .nav-button {
            width: 2rem;
            height: 2rem;
        }
    }
</style> 
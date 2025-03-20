<!-- CardCarousel.svelte -->
<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import { fly } from 'svelte/transition';
    
    export let cards: any[] = [];
    
    let carouselEl: HTMLElement;
    let cardWidth = 380; // Increased from 320
    let currentPage = 0;
    let totalPages = 0;
    let isDragging = false;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    
    $: totalPages = Math.ceil(cards.length);
    $: currentPage = Math.min(currentPage, totalPages - 1);
    $: currentPage = Math.max(currentPage, 0);
    
    // Generate random skew angles for cards between -20 and 15 degrees
    const cardRotations = cards.map(() => Math.floor(Math.random() * 35) - 20);
    
    function goToPage(pageNum: number) {
        if (pageNum >= 0 && pageNum < totalPages) {
            currentPage = pageNum;
            scrollToPage();
        }
    }
    
    function scrollToPage() {
        // Increased overlap for more stacking effect
        const scrollPos = currentPage * (cardWidth - 150); // More overlap (150px instead of 60px)
        if (carouselEl) {
            carouselEl.scrollTo({
                left: scrollPos,
                behavior: 'smooth'
            });
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
        if (carouselEl) {
            // Adjust scroll position calculation for increased overlap
            const scrollPos = carouselEl.scrollLeft;
            currentPage = Math.round(scrollPos / (cardWidth - 150));
        }
    }
    
    onMount(() => {
        if (carouselEl) {
            cardWidth = carouselEl.querySelector('.card')?.clientWidth || 380;
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
    
    afterUpdate(() => {
        if (carouselEl) {
            cardWidth = carouselEl.querySelector('.card')?.clientWidth || 380;
        }
    });
</script>

<div class="carousel-container">
    <div 
        class="carousel"
        bind:this={carouselEl}
        on:touchstart={handleTouchStart}
        on:touchmove={handleTouchMove}
        on:touchend={handleTouchEnd}
        on:mousedown={handleMouseDown}
    >
        {#each cards as card, i}
            <div 
                class="card-container"
                in:fly={{ x: 20, duration: 300, delay: i * 100 }}
                style="transform: rotate({cardRotations[i]}deg); z-index: {totalPages - i};"
            >
                <slot {card} index={i}></slot>
            </div>
        {/each}
    </div>
    
    <div class="controls">
        <button 
            class="nav-button prev"
            on:click={prevCard}
            disabled={currentPage === 0}
            aria-label="Previous card"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    </div>
</div>

<style>
    .carousel-container {
        position: relative;
        width: 100%;
        height: 40vh; /* Increased height for larger cards */
        padding: 1rem 0;
    }
    
    .carousel {
        display: flex;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        gap: -150px; /* Increased negative gap for more stack-like overlap */
        padding: 2rem;
        scrollbar-width: none;
        -ms-overflow-style: none;
        perspective: 1000px; /* For 3D effect */
    }
    
    .carousel::-webkit-scrollbar {
        display: none;
    }
    
    .card-container {
        flex: 0 0 auto;
        width: 380px; /* Increased width */
        height: 40vh; /* Increased height */
        scroll-snap-align: center;
        transition: transform 0.3s ease-out;
        transform-origin: center center;
        margin: 0;
        padding: 10px;
        position: relative; /* Required for z-index to work */
        box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.15); /* Enhanced shadow for stacked look */
    }
    
    /* Hover effect to bring card forward */
    .card-container:hover {
        transform: translateY(-15px) scale(1.05) !important;
        z-index: 100 !important;
    }
    
    .controls {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 1rem;
        gap: 1rem;
    }
    
    .nav-button {
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f3f4f6;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        cursor: pointer;
        color: #374151;
        transition: background-color 0.2s, opacity 0.2s;
    }
    
    .nav-button:hover:not(:disabled) {
        background: #e5e7eb;
    }
    
    .nav-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
    
    .dots {
        display: flex;
        gap: 6px;
    }
    
    .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #d1d5db;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.2s;
    }
    
    .dot.active {
        background-color: #6366f1;
        transform: scale(1.25);
    }
    
    @media (max-width: 768px) {
        .card-container {
            width: 340px;
        }
    }
</style> 
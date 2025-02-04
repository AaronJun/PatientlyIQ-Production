<script lang="ts">
    import { onMount } from 'svelte';
    import PatientCard from '../AtlasComponents/PatientCard.svelte';

    export let patients = [];
    let currentIndex = 0;
    let carouselElement: HTMLElement;
    
    const cardsToShow = 3;

    $: totalSlides = Math.ceil(patients.length / cardsToShow);

    function next() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
    }

    function prev() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
    }

    function updateCarousel() {
        if (carouselElement) {
            carouselElement.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    }

    onMount(() => {
        updateCarousel();
    });
</script>

<div class="carousel-container">
    <button class="nav-button prev" on:click={prev}>&lt;</button>
    <div class="carousel-wrapper">
        <div class="carousel" bind:this={carouselElement}>
            {#each patients as patient, i}
                <div class="carousel-item">
                    <PatientCard {...patient} />
                </div>
            {/each}
        </div>
    </div>
    <button class="nav-button next" on:click={next}>&gt;</button>
</div>

<style>
    .carousel-container {
        position: relative;
        width: 100%;
        margin-bottom: 5rem;
    }

    .carousel-wrapper {
        overflow: hidden;
    }

    .carousel {
        display: flex;
        transition: transform 0.3s ease;
    }

    .carousel-item {
        flex: 0 0 calc(33.333% - 20px); /* Subtracting margin */
        padding-bottom: 10px;
        margin: 0 10px;
    }

    .nav-button {
        position: absolute;
        top: 100%;
        transform: translateY(-50%);
        background: rgba(96, 96, 96, 0.0);
        color: #005D5D;
        border: 1pt solid rgba(96, 96, 96, 0.9);
        border-radius: 2px;
        width: 40px;
        height: 40px;
        align-content: center;
        font-size: 1rem;
        cursor: pointer;
        z-index: 10;
    }

    .prev { left: 0; }
    .next { right: 0; }

    @media (max-width: 768px) {
        .carousel-container {
            max-width: 500spx; /* Adjust for single card view on smaller screens */
        }

        .carousel-item {
            flex: 0 0 100%;
            margin: 0;
        }
    }
</style>
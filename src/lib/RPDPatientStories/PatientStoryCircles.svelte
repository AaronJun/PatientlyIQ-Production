<script lang="ts">
    import { fade } from 'svelte/transition';
    import PatientStoriesCarousel from './PatientStoriesCarousel.svelte';
    import { onMount, onDestroy } from 'svelte';
    import patientStoriesData from '$lib/data/patient-stories.json';
    import { writable } from 'svelte/store';
    
    // Import images
    import emmaPhoto from '$lib/assets/profiles/emmal.jpg';
    import sarahPhoto from '$lib/assets/profiles/sarahm.jpg';
    import michaelPhoto from '$lib/assets/profiles/michaelr.jpg';
    
    export let selectedDisease: string;
    
    const isCarouselVisible = writable(false);
    const current = writable(0);
    let autoPlayInterval: number;

    const photoMap = {
        '/profiles/emmal.jpg': emmaPhoto,
        '/profiles/sarahm.jpg': sarahPhoto,
        '/profiles/michaelr.jpg': michaelPhoto
    };
    
    $: originalPatients = patientStoriesData.diseases[selectedDisease]?.patients || [];
    $: totalCards = originalPatients.reduce((acc, patient) => acc + patient.cards.length, 0);
    
    $: patients = originalPatients.flatMap(patient => 
        patient.cards.map(card => ({
            name: patient.name,
            age: patient.age,
            disease: patient.disease,
            persona: patient.persona,
            photoUrl: photoMap[patient.img],
            type: card.type,
            quote: card.quote,
            context: card.context,
            words: card.words,
            "treatment-sentiment": card.treatmentSentiment,
            "trial-sentiment": card.trialSentiment,
            "medical-literacy": card.medicalLiteracy,
            "financial-stability": card.financialStability
        }))
    );

    function handleCircleClick(patientIndex: number) {
        stopAutoPlay();
        current.set(originalPatients.slice(0, patientIndex).reduce((acc, p) => acc + p.cards.length, 0));
        isCarouselVisible.set(true);
        startAutoPlay();
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = window.setInterval(() => {
            current.update(n => (n + 1) % totalCards);
        }, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    function handleClose() {
        stopAutoPlay();
        isCarouselVisible.set(false);
        current.set(0);
    }

    onDestroy(() => {
        stopAutoPlay();
    });
</script>

<div class="patient-circles">
    <div class="circles-container">
        {#each originalPatients as patient, i}
            <div class="patient-circle-container">
                <button
                    class="story-circle"
                    on:click={() => handleCircleClick(i)}
                >
                    <div class="image-container">
                        <img
                            src={photoMap[patient.img]}
                            alt={patient.name}
                            class="profile-image"
                        />
                    </div>
                    <div class="hover-circle"></div>
                </button>
                <span class="patient-name">{patient.name}</span>
            </div>
        {/each}
        <slot />
    </div>
</div>

{#if $isCarouselVisible}
    <PatientStoriesCarousel
        {patients}
        isVisible={$isCarouselVisible}
        current={$current}
        on:close={handleClose}
    />
{/if}

<style>
    .patient-circles {
        display: flex;
        flex-direction: column;
        align-items: left;
        gap: 0.5rem;
        margin-top: 2rem;
    }

    .circles-container {
        display: flex;
        gap: 1.5rem;
        align-items: flex-start;
    }

    .patient-circle-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .story-circle {
        width: 4.5rem;
        height: 4.5rem;
        border-radius: 100%;
        background: rgba(255, 81, 81, 0.1);
        border: 2.5px solid #ff5151;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        position: relative;
        overflow: hidden;
    }

    .image-container {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 50%;
        overflow: hidden;
    }

    .profile-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s ease;
    }

    .hover-circle {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(255, 81, 81, 0);
        transition: background-color 0.2s ease;
    }

    .story-circle:hover {
        transform: scale(1.1);
    }

    .story-circle:hover .hover-circle {
        background: rgba(255, 81, 81, 0.3);
    }

    .story-circle:hover .profile-image {
        transform: scale(1.1);
    }

    .patient-name {
        font-size: 0.75rem;
        color: #666;
        font-weight: 500;
        text-align: center;
        white-space: nowrap;
    }
</style>
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import type { Writable } from 'svelte/store';
    
    export let selectedDisease: string;
    export let patientIndex: number;
    export let currentCard: number = 0;
    
    let sentimentGauge;
    let topicsChart;
    let patientData;
    
    $: {
        const data = JSON.parse('$lib/data/patient-stories.json');
        patientData = data.diseases[selectedDisease]?.patients[patientIndex];
    }
    
    onMount(() => {
        if (patientData?.cards[currentCard]) {
            updateVisualizations();
        }
    });
    
    $: if (patientData?.cards[currentCard]) {
        updateVisualizations();
    }
    
    function updateVisualizations() {
        const card = patientData.cards[currentCard];
        if (sentimentGauge && card.sentiment !== undefined) {
            createSentimentGauge(card.sentiment);
        }
        if (topicsChart && card.topics) {
            createTopicsChart(card.topics);
        }
    }
    
    function createSentimentGauge(value) {
        // Sentiment gauge D3 code remains the same
    }
    
    function createTopicsChart(topics) {
        // Topics chart D3 code remains the same
    }
</script>

<div class="card">
    {#if patientData}
    <div class="content-grid">
        <div class="profile-section">
            <img 
                src={patientData.img} 
                alt={patientData.name}
                class="profile-image"
            />
            <div class="profile-info">
                <h2>{patientData.name}</h2>
                <p>{patientData.age} • {patientData.disease}</p>
                <p class="persona">{patientData.persona}</p>
            </div>
        </div>
        
        <div class="card-navigation">
            {#each patientData.cards as card, i}
                <button 
                    class="nav-button {currentCard === i ? 'active' : ''}"
                    on:click={() => currentCard = i}
                >
                    {card.type}
                </button>
            {/each}
        </div>
        
        {#if patientData.cards[currentCard]}
            <div class="card-content">
                <div class="quote-section">
                    <blockquote>
                        {patientData.cards[currentCard].quote}
                    </blockquote>
                    <p class="context">{patientData.cards[currentCard].context}</p>
                </div>
                
                <div class="metrics-section">
                    <div class="sentiment-gauge" bind:this={sentimentGauge}></div>
                    <div class="topics-chart" bind:this={topicsChart}></div>
                </div>
            </div>
        {/if}
    </div>
    {/if}
</div>


<style>
    .card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }
    
    .content-grid {
        display: grid;
        gap: 2rem;
    }
    
    .profile-section {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
    
    .profile-image {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .profile-info h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
    }
    
    .persona {
        color: #666;
        font-size: 0.875rem;
    }
    
    .card-navigation {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .nav-button {
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        background: #f3f4f6;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .nav-button.active {
        background: #4F46E5;
        color: white;
    }
    
    .card-content {
        display: grid;
        gap: 2rem;
    }
    
    .quote-section blockquote {
        font-size: 1.25rem;
        color: #1a1a1a;
        font-style: italic;
        margin: 0 0 1rem 0;
        padding-left: 1rem;
        border-left: 4px solid #4F46E5;
    }
    
    .context {
        color: #666;
        font-size: 0.875rem;
    }
    
    .metrics-section {
        display: grid;
        gap: 2rem;
    }
    
    .sentiment-gauge, .topics-chart {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 0.5rem;
    }
</style>
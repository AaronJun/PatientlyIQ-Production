<script lang="ts">
    import { selectedQuote, selectedPatient, selectedImage } from './patientCardStore';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { fade } from 'svelte/transition';

    let previewHeight = tweened(20, {
        duration: 400,
        easing: cubicOut
    });

    function getSentimentsquares(sentiment: number, type: string) {
        const squares = [];
        previewHeight.set(100);
        for (let i = 1; i <= 5; i++) {
            squares.push({
                filled: i <= sentiment,
                color: $selectedPatient?.persona.toLowerCase() === 'patient' ? '#AA9AFA' : '#2a647f'
            });
        }
        return squares;
    }


$: console.log('Selected Patient:', $selectedPatient);
$: console.log('Selected Quote:', $selectedQuote);
$: console.log('Selected Image:', $selectedImage);
$: patientTag = $selectedPatient?.persona.toLowerCase() === 'patient' ? 'Patient' : 'Caregiver';

</script>

<div class="sidebar">
{#if $selectedPatient}
<div class="patient-info" transition:fade={{duration: 300}}>
    <h2>{$selectedPatient.name}</h2>
    <span class="tag" style="background-color: {$selectedPatient?.persona.toLowerCase() === 'patient' ? '#221275' : '#2a647f'}">
        {patientTag}
    </div>
{/if}

{#if $selectedImage}
<div class="photo-container" transition:fade={{duration: 300}}>
    <img src={$selectedImage} alt="Patient" />
</div>
{/if}

{#if $selectedQuote}
<h4>Quote</h4>
  <p class="block-quote">{$selectedQuote}</p>
  
  {#if $selectedPatient}
  
    <div class="sentiment-container">
      <h4>Sentiment tracker</h4>
      <div class="sentiment-row">
        <span>Trial sentiment:</span>
        <div class="squares">
          {#each getSentimentsquares(parseInt($selectedPatient['trial-sentiment']), 'trial') as square}
            <div class="square" style="background-color: {square.filled ? square.color : 'transparent'}; border-color: {square.color};"></div>
          {/each}
        </div>
      </div>
      <div class="sentiment-row">
        <span>Treatment sentiment:</span>
        <div class="squares">
          {#each getSentimentsquares(parseInt($selectedPatient['treatment-sentiment']), 'trial') as square}
            <div class="square" style="background-color: {square.filled ? square.color : 'transparent'}; border-color: {square.color};"></div>
          {/each}
        </div>
      </div>

<div class="sentiment-container">

    <h4>Day-to-day considerations</h4>
        <div class="sentiment-row">
            <span>Medical literacy:</span>
                <div class="squares">
                    {#each getSentimentsquares(parseInt($selectedPatient['medical-literacy']), 'literacy') as square}
                        <div class="square" style="background-color: {square.filled ? square.color : 'transparent'}; border-color: {square.color};"></div>
                    {/each}
                </div>
        </div>
        <div class="sentiment-row">
            <span>Financial security:</span>
            <div class="squares">
                {#each getSentimentsquares(parseInt($selectedPatient['financial-stability']), 'finances') as square}
                    <div class="square" style="background-color: {square.filled ? square.color : 'transparent'}; border-color: {square.color};"></div>
                {/each}
        </div>
        </div>
        </div> 
        </div>
    {/if}
{:else}
    <p>Hover over a participant to learn more.</p>
{/if}
</div>

<style>
    .sidebar {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 1rem 0.25rem 0 0.25rem;
        height: 100%;
        margin-right: 5rem;
        border-top: 1px solid #161616;
    }
    
    h2 {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: .725rem;
        transition: font-weight 0.3s ease-in-out;
    }
    
    h4 {
        font-size: .82rem;
        font-weight: 1000;
        font-family: 'IBM Plex';
        margin-bottom: 1.25rem;
        color: #9a9a9a;
    }

    .photo-container {
        margin-bottom: 1rem;
        overflow: hidden;
        border-radius: 5px;
        transition: fade 0.56s ease-in-out;
    }

    .photo-container img {
        width: 100%;
        height: auto;
        object-fit: cover;
    }

    .block-quote {
        font-size: 1.25rem;
        line-height: 1.35;
        font-weight: 400;
        transition: font-size 0.3s ease-in-out;
        padding-bottom: 1.15rem;
        border-bottom: .5px solid #9a9a9a;
    }

    .quote-update {
        font-size: 2em;
    }

    .sentiment-container {
        margin-top: 4rem;
        width: 100%;
    }

    .sentiment-row {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: .625rem;
        border-bottom: .5px solid #9a9a9a;
    }

    .sentiment-row span {
        margin-right: 0.5rem;
        width: 450%;
        font-weight: 500;
    }

    p {
        transition: slide 0.5s ease-in-out;
    }

    .squares {
        display: flex;
        transition: 0.67s ease-in;
    }

    .square {
        width: 20px;
        height: 20px;
        border: 2px solid;
        margin-right: 4px;
        transition: .5s ease-in;
    }

    .patient-info {
        margin-bottom: 1rem;
        }

    .tag {
        display: flex;
        padding: .5rem 1.2rem .5rem 1rem;
        border-radius: 100px;
        color: white;
        font-size: 0.85rem;
        font-weight: 800;
    }

    h3 {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

</style>

<script lang="ts">
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import "carbon-components-svelte/css/all.css";
    import {
        Button,
    } from "carbon-components-svelte";
    import PatientSentenceSummary from './PatientSentenceSummary.svelte';
    import PatientDetails from './PatientDetails.svelte';
    import ChevronLeft from "carbon-icons-svelte/lib/ChevronLeft.svelte";
    import ChevronRight from "carbon-icons-svelte/lib/ChevronRight.svelte";
  
    export let patient: { persona: string, 'trial-sentiment': string } | null = null;
    export let isOpen = false;
    export let onClose = () => {};
    export let allPatients: string | any[] = [];
    export let currentIndex = 0;
    export let onNavigate = (index: number) => {};
  
    $: backgroundColor = patient?.persona.toLowerCase() === 'patient' ? '#AA9AFA' : '#A9C8D6';
    $: prevPatient = allPatients[(currentIndex - 1 + allPatients.length) % allPatients.length];
    $: nextPatient = allPatients[(currentIndex + 1) % allPatients.length];

    function navigatePatient(direction) {
        if (direction === 'prev') {
            currentIndex = (currentIndex - 1 + allPatients.length) % allPatients.length;
        } else {
            currentIndex = (currentIndex + 1) % allPatients.length;
        }
        onNavigate(currentIndex);
    }
</script>

{#if isOpen && patient}
<div class="drawer-overlay" on:click={onClose}></div>
    <div 
      class="drawer" 
      style="background-color: {backgroundColor}; border-left-color: {backgroundColor};"
      transition:slide={{ duration: 550, easing: quintOut, axis: 'x' }}
    >
    <button class="close-btn" on:click={onClose}>&times;</button>
        
    <div class="drawer-header">
        <div class="navigation">
            <Button kind="secondary" 
                on:click={(e) => {
                    e.preventDefault();
                    navigatePatient('prev')}}
                >   
                <ChevronLeft size={22}/>
                <span class="nav-name">{prevPatient.name}</span>
            </Button>
            
            <Button kind="secondary" 
                on:click={(e) => {
                    e.preventDefault();
                    navigatePatient('next')}}
                >   
            <span class="nav-name">{nextPatient.name}</span>
            <ChevronRight size={22}/>
            </Button>
        </div>
        <div class="patient-info-column">
            <div class="patient-photo" style="border-color: {backgroundColor};">
                <img src={patient.photoUrl} alt={patient.name} />
            </div>
                <PatientSentenceSummary 
                    name={patient.name}
                    persona={patient.persona}
                    age={patient.age}
                    trialSentiment={parseInt(patient['trial-sentiment'])}
                    treatmentSentiment={parseInt(patient['treatment-sentiment'])}
                />
        </div>
    </div>     
    <PatientDetails {patient} {backgroundColor} />
    </div>
{/if}

<style>
    .drawer-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.75);
        z-index: 9999;
    }

    .drawer {
        position: fixed;
        display: flex;
        flex-direction: column;
        top: 0;
        right: 0;
        width: 80vw;
        max-width: 1800px;
        height: 100%;
        padding: 0rem 0rem 0rem 0rem;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        overflow-y: auto;
        color: #333;
    }
    
    .drawer-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.625rem 0 0 0;
        background-color: #ffffff;
        position: relative;
    }

    .patient-info-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 2rem;
        max-width: 1000px;
        text-align: center;
    }

    .patient-photo {
        width: 170px;
        height: 170px;
        margin-bottom: 2rem;
        overflow: hidden;
        border-radius: 50%;
        padding: .25rem;
        border: 3.5px solid #333;
    }

    .patient-photo img {
        width: 100%;
        height: 100%;
        border-radius: 100px;
        object-fit: cover;
    }

    .navigation {
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0 2rem 2rem;
    }

    .nav-name {
        font-size: 1rem;
        margin-left: 1rem;
        margin-right: 1rem;
        font-weight: 400;
        color: #161616;
    }

    .close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 2.5rem;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 9999;
    }
</style>
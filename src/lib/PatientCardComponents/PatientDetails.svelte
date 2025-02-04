<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import {
        Row,
        Column,
        Button
    } from "carbon-components-svelte";
    import PatientDetailSummary from "./PatientDetailSummary.svelte";
    import PatientTimelines from "./PatientTimelines.svelte";
    import "carbon-components-svelte/css/all.css";
    import ArrowRight from "carbon-icons-svelte/lib/ArrowRight.svelte";
    import DataRefinery from 'carbon-icons-svelte/lib/DataRefinery.svelte';
    import Medication from 'carbon-icons-svelte/lib/Medication.svelte';
    import HealthCross from 'carbon-icons-svelte/lib/HealthCross.svelte';
    import Quote from "carbon-icons-svelte/lib/Quotes.svelte";
    import { easeBack } from 'd3';

    export let patient: {
        id: string;
        name: string;
        disease: string;
        persona: string;
        age: string;
        summary: string;
        quote: string;
        "trial-sentiment": string;
        "treatment-sentiment": string;
        "medical-literacy": string;
        "financial-stability": string;
        photoUrl: string;
    };
    export let backgroundColor: string;

    let scrollContainer: HTMLElement;
    let cards: HTMLElement[];
    let cardHeight: number;
    let scrollProgress = 0;
    let selectedColumn = 1;
    let maxScroll = 1; // New variable to store the maximum scroll value

    // Updated columnData with five cards for each column
    const columnData = [
        [
            { type: 'metric', title: 'Diagnostic Journey' },
            { type: 'quote', quote: patient.quote },
            { type: 'metric', title: 'Symptoms Timeline' },
            { type: 'metric', title: 'Healthcare Interactions' },
            { type: 'quote', quote: "Another relevant quote about day-to-day experiences" },
        ],
        [
            { type: 'metric', title: 'Treatment Overview' },
            { type: 'metric', title: 'Side Effects' },
            { type: 'quote', quote: "Patient's thoughts on treatment" },
            { type: 'metric', title: 'Treatment Efficacy' },
            { type: 'metric', title: 'Treatment Adherence' },
        ],
        [
            { type: 'metric', title: 'Information Sources' },
            { type: 'quote', quote: "Patient's view on medical information" },
            { type: 'metric', title: 'Understanding of Condition' },
            { type: 'metric', title: 'Misconceptions' },
            { type: 'metric', title: 'Preferred Learning Methods' },
        ]
    ];

    function handleScroll() {
        const containerHeight = scrollContainer.clientHeight;
        const scrollHeight = scrollContainer.scrollHeight;
        const scrollTop = scrollContainer.scrollTop;

        // Calculate the new scroll progress
        scrollProgress = scrollTop / (scrollHeight - containerHeight);

        // Limit scrollProgress to maxScroll
        scrollProgress = Math.min(scrollProgress, maxScroll);

        cards.forEach((card, index) => {
            const baseOffset = index+10;
            if (scrollProgress > 0 && scrollProgress < maxScroll) {
                const yOffset = baseOffset * 20 * scrollProgress;
                const xOffset = index * -30 * scrollProgress;
                card.style.transform = `translate(${-xOffset}px, ${yOffset}px)`;
            } else if (scrollProgress <= 0) {
                card.style.transform = `translate(0, ${baseOffset}px)`;
            } 
        });
        // If we've reached the maxScroll, prevent further scrolling
        if (scrollProgress >= maxScroll) {
            scrollContainer.scrollTop = maxScroll * (scrollHeight - containerHeight);
        }
    }

    function handleButtonClick() {
        console.log("Button clicked");
    }

    function selectColumn(column: number) {
        selectedColumn = column;
    }

    onMount(() => {
        cards = Array.from(scrollContainer.querySelectorAll('.card'));
        cardHeight = cards[0].clientHeight-20;
        handleScroll();
    });
</script>

<div class="column-selector" style="--button-color: {backgroundColor};">
    <Button on:click={() => selectColumn(1)} kind={selectedColumn === 1 ? "primary" : "secondary"} icon={DataRefinery}>Day-to-Day</Button>
    <Button on:click={() => selectColumn(2)} kind={selectedColumn === 2 ? "primary" : "secondary"} icon={Medication}>Treatment</Button>
    <Button on:click={() => selectColumn(3)} kind={selectedColumn === 3 ? "primary" : "secondary"} icon={HealthCross}>Information Diet</Button>
</div>

<div class="patient-details">
    <Row padding>
        <Column>
            <div class="scroll-container" bind:this={scrollContainer} on:scroll={handleScroll}>
                <div class="custom-scrollbar">
                    <div class="scrollbar-track">
                        <div class="scrollbar-thumb" style="height: {scrollProgress * 100}%;"></div>
                    </div>
                    <div class="scrollbar-circles">
                        {#each columnData[selectedColumn - 1] as _, index}
                            <div class="scrollbar-circle"></div>
                        {/each}
                    </div>
                </div>
                <div class="scroll-content">
                    {#key selectedColumn}
                        <div class="column" in:fly="{{ x: 300, duration: 300 }}" out:fly="{{ x: -300, duration: 300  }}">
                            {#each columnData[selectedColumn - 1] as card, index}
                                {#if card.type === 'metric'}
                                    <div class="card metric-card" style="transform: translateY({index * -10}px);">
                                        <div class="card-header metric-header">
                                            <h3>{card.title}</h3>
                                            <Button kind="tertiary" icon={ArrowRight}
                                            on:click={handleButtonClick}>More detail</Button>
                                        </div>
                                        <div class="chart-holder">
                                            <div class="patient-summary">
                                                <PatientDetailSummary
                                                    name={patient.name}
                                                    medicalLiteracy={parseInt(patient["medical-literacy"])}
                                                    financialSecurity={parseInt(patient["financial-stability"])}
                                                />
                                            </div>
                                            <PatientTimelines key={patient.id} />
                                        </div>
                                    </div>
                                {:else if card.type === 'quote'}
                                    <div class="card quote-card" style="transform: translateY({index * -10}px);">
                                        <div class="card-header quote-header">
                                            <Quote size={40} />
                                        </div>
                                        <div class="quote-content">
                                            <blockquote>"{card.quote}"</blockquote>
                                        </div>
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    {/key}
                </div>
            </div>
        </Column>
    </Row>
</div>

<style>
    .patient-details {
        height: 100%;
        background-color: #e1e1e1;
        overflow: hidden;
    }

    .column-selector {
    display: flex;
    justify-content: center;
    padding: 1rem 0 3.25rem 0;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .column-selector :global(button) {
    margin: 0 0.5rem;
  }

  .column-selector :global(button.bx--btn--primary) {
    background-color: var(--button-color);
    border-color: var(--button-color);
    color: var(--button-text-color);
    box-shadow: rgba(113, 113, 113, 0.122);
    font-weight: 800;
    cursor: clickable;
  }

  .column-selector :global(button.bx--btn--primary:hover) {
    background-color: var(--button-color);
    filter: brightness(90%);
  }

    .patient-summary {
        padding: 0 0rem 1.15rem 1rem;
        max-width: 75%;
    }

    .scroll-container {
        height: 100%;
        width: 80%;
        overflow-y: auto;
        position: fixed;
    }

    .scroll-content {
        height: 250vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
    }

    .column {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .card {
        position: sticky;
        top: 0;
        min-height: calc(35vh);
        width: 80%;
        border-radius: 10px;
        transition: transform 0.5s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out;
        margin: 1rem 0;
        outline: rgba(0, 0, 0, 0.1) solid 1px;
        box-shadow: 2px 2px 2px 1px rgba(113, 113, 113, 0.122);
    }

    .metric-card {
        background-color: #f1f1f1;
        border: .25px solid #f15115;
    }

    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.25rem;
        border-radius: 20px 20px 0 0;
        border-bottom: 1px solid #f15115;
        color: #f1f1f1;
    }

    .metric-header {
        color: #f15115;
        border-bottom: 1px solid #f15115;
    }

    .chart-holder {
        padding: 1.25rem;
        height: calc(100% - 70px);
        align-items: center;
        overflow-y: auto;
    }

    .quote-content {
        padding: 10rem 5rem 0 0;
        font-size: 2.5rem;
        line-height: 1.35;
        font-weight: 400;
        text-align: left;
        color: #161616;
        max-width: 90%;
    }
    
    .quote-header {
        color: #f1f1f1;
        background-color: #f15115;
        border-radius: 100px;
        width: 60px;
        height: 60px;
    }

    .quote-card {
        background-color: #ffffff;
        border-radius: 20px 20px 20px 20px;
        border: 1px solid #b3d4ff;
        display: flex;
        flex-direction: column;
        padding: 1.25rem 0 0 2.25rem;
        align-items: left;
        justify-content: left;
    }

    .custom-scrollbar {
        position: fixed;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        height: 80%;
        width: 20px;
        z-index: 1000;
    }

    .scrollbar-track {
        height: 100%;
        width: 2px;
        background-color: #ccc;
        position: relative;
    }

    .scrollbar-thumb {
        width: 100%;
        background-color: #f15115;
        position: absolute;
        top: 0;
        left: 0;
        transition: height 0.1s;
    }

    .scrollbar-circles {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }

    .scrollbar-circle {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #f15115;
    }
</style>
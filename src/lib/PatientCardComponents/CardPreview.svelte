<script lang="ts">
    import { selectedQuote } from './patientCardStore';
    import ArrowRight from "carbon-icons-svelte/lib/ArrowRight.svelte";
    import { Tag, Row, Column, Grid } from "carbon-components-svelte";
    import { tweened } from 'svelte/motion';
    import { cubicIn, cubicOut, cubicInOut } from 'svelte/easing';

    export let name: string;
    export let persona: string;
    export let summary: string;
    export let quote: string;
  
    let isHovered = false;
    let previewHeight = tweened(120, {
        duration: 400,
        easing: cubicInOut
    });

    let summaryLength = tweened(120, {
        duration: 350,
        easing: cubicIn
    });

    $: truncatedSummary = summary.length > $summaryLength ? summary.slice(0, $summaryLength) + '...' : summary;

    function handleMouseEnter() {
        isHovered = true;
        previewHeight.set(200);
        summaryLength.set(200);
    }

    function handleMouseLeave() {
        isHovered = false;
        previewHeight.set(120);
        summaryLength.set(120);
    }
</script>
  
<div 
    class="preview" 
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    style="height: {$previewHeight}px;"
    role="button"
    tabindex="0"
> 
    <div class={`persona-indicator ${persona.toLowerCase()}`}>
        {persona}
    </div>
    <div class="content">
        <div class="name-and-persona">
            <h3 class:hovered={isHovered}>{name}</h3>
        </div>
    </div>
    <div class="bio-preview">
        <p class="left-aligned">{truncatedSummary}</p>
    </div>
    <ArrowRight />

</div>
  
<style>
    .preview {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem .5rem 1rem 1rem;
        border-bottom: 1px solid #ccc;
        border-top: 1px solid #ccc;
        cursor: pointer;
        overflow: hidden;
        transition: all 0.5s ease-;
    }

    .preview:hover {
        border-bottom: 2px solid #FF5150;
    }
  
    .content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
  
    .name-and-persona {
        display: flex;
        align-items: left;
        width: 125px;
    }
  
    .left-aligned {
        text-align: left;
        margin-bottom: 1rem;
    }
    
    .persona-indicator {
        width: 100px;
        height: 25px;
        border-radius: 100px;
        font-weight: 600;
        margin-right: 2.65rem;
        align-content: center;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
  
    .persona-indicator.patient {
        border: 1.55px solid #AA9AFA;
        color: #221275;
    }
  
    .persona-indicator.caregiver {
        border: 1.55px solid #a9d6b7;
        color: #2a647f;
    }
  
    h3 {
        margin: 0;
        transition: font-weight 0.2s ease-in-out;
    }

    h3.hovered {
        font-weight: 600;
    }
  
    p {
        white-space: normal;
        text-align: left;
        margin: 0;
        transition: all 0.3s ease-in-out;
    }

    .bio-preview {
        flex: 1;
        max-width: 40%;
        margin-left: 2rem;
        margin-right: 2rem;
        justify-items: center;
        align-items: center;
        overflow: hidden;
    }
</style>
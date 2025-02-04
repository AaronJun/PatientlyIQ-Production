<script lang="ts">
    export let name: string;
    export let persona: string;
    export let age: string;
    export let trialSentiment: number;
    export let treatmentSentiment: number;

    function getTrialSentimentDescription(score: number): string {
        if (score <= 2) return "low interest";
        if (score === 3) return "ambivalence";
        return "high interest";
    }

    function getTreatmentSentimentDescription(score: number): string {
        if (score <= 1) return "mostly unhappy";
        if (score <= 2) return "somewhat unhappy";
        if (score === 3) return "satisfied";
        if (score <= 4) return "somewhat happy";
        return "happy";
    }

    $: trialSentimentDesc = getTrialSentimentDescription(trialSentiment);
    $: treatmentSentimentDesc = getTreatmentSentimentDescription(treatmentSentiment);
</script>
<div class="summary-container">
<p class="sentence-headline">
    <span class="highlight">{name}</span> is a <span class="highlight">{persona.toLowerCase()}</span> in their <span class="highlight">{age}</span>.
</p>
<p class="sentence-summary">
    They exhibit <span class="highlight">{trialSentimentDesc}</span> towards clinical trials and are <span class="highlight">{treatmentSentimentDesc}</span> with their current treatment plan.
</p>
</div>

<style>
.summary-container {
    max-width: 75%;
}
  .sentence-headline {
        font-size: 2rem;
        line-height: 1.5;
        color: rgb(50, 50, 50);
        margin-bottom: 1rem;
    }

.sentence-summary {
        font-size: 1.65rem;
        line-height: 1.5;
        color: #333;
        margin-bottom: 1rem;
    }

    .highlight {
        font-weight: bold;
        border-bottom: 1px dotted #333333;
        padding-bottom: 2px;
    }
</style>
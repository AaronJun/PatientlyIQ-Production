<script lang="ts">
    export let name: string;
    export let medicalLiteracy: number;
    export let financialSecurity: number;

    function getMedicalLiteracyDescription(score: number): string {
        if (score <= 2) return "uncomfortable";
        if (score === 3) return "familiar";
        return "comfortable";
    }

    function getFinancialSecurityDescription(score: number): string {
        if (score <= 2) return "finances, insurance, and medical access";
        if (score === 3) return "end of life planning and family security";
        return "finding a new treatment option";
    }

    $: medLitDesc = getMedicalLiteracyDescription(medicalLiteracy);
    $: treatmentSentimentDesc = getFinancialSecurityDescription(financialSecurity);
</script>

<p class="sentence-summary">
    <span class="highlight">{name}</span> is
     <span class="highlight">{medLitDesc}</span> with complex medical language. Their biggest challenges are <span class="highlight">{treatmentSentimentDesc}</span>.
</p>

<style>
    .sentence-summary {
        font-size: 1.5rem;
        line-height: 1.5;
        color: #333;
        margin: 1rem 0 1rem 0;
    }

    .highlight {
        font-weight: bold;
        border-bottom: 1px dotted #333333;
        padding-bottom: 2px;
    }
</style>
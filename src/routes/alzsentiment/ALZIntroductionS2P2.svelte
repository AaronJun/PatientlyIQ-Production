<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import "carbon-components-svelte/css/all.css";
    import GeneticPatientQuoteCards from '$lib/patientcards/GeneticPatientQuoteCards.svelte';
    import GeneticWaffleCounseling from './GeneticWaffleCounseling.svelte';
    import geneticCounselingData from './geneCounselingsentimentData.json';



</script>

<div class="flex-row text-center items-center place-content-center pt-8">
    <div class="max-w-4xl mx-auto px-4 place-content-center">

            <div class="w-10/12 mx-auto mt-16">
            <h3 class="subsection-header text-lg font-semibold  text-slate-500 mb-6">2.2<br>Infrequent Mentions of Genetic Counseling</h3>    
            <p class="prose text-left place-content-center text-lg text-slate-600 font-serif mt-8 mb-12">
            The APOE4 community's online conversations do not often mention genetic counseling. When the topic does come up, the sentiment is mixed, with negative sentiments driven by a lack of clarity or firsthand knowledge about what genetic counseling entails. 
             </p>
            </div>
        </div>
        <GeneticWaffleCounseling {geneticCounselingData} />
        </div>
        

<style>
    .subsection-header {
        font-family: 'IBM Plex Sans', sans-serif;
        border-top: 1px solid #116661;
        padding-top: 4rem;
        margin-top: 2rem;
    }
</style>
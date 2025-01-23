<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import GeneticPatientQuoteCards from '$lib/patientcards/GeneticPatientQuoteCards.svelte';
    import "carbon-components-svelte/css/all.css";
    import AlzPatientStoryCircles1 from '$lib/RPDPatientStories/ALZPatientStoryCircles1.svelte';
    import GeneticWaffleStages from './GeneticWaffleStages.svelte';

</script>

<div class="flex-row text-center items-center place-content-center pt-8">
    <div class="max-w-4xl mx-auto px-4 place-content-center">

            <div class="w-10/12 mx-auto mt-16">
            <h3 class="subsection-header text-lg font-semibold  text-slate-500 mb-6">2.3<br>A Disorienting Emotional Burden</h3>    
            <p class="prose text-left place-content-center text-lg text-slate-600 font-serif mt-8 mb-12">
            Some find out about their genetic risk by happenstance, through tests conducted for purposes other than ascertaining one's APOE genotype. Others actively seek out this information, driven by a desire to understand their risk and take preventive measures.<br> <br> Regardless of how they learn about their APOE status, many individuals experience a range of emotions, including fear, anxiety, and uncertainty. Many of them express an unexpectedly disorienting aftermath, even if they had believed themselves to be prepared for the results. This emotional burden can be overwhelming, especially when coupled with the lack of clear guidance on what to do next.<br><br>
            The story below, from a member of the APOE4 community, illustrates the emotional turmoil that can accompany the discovery of one's genetic risk.
             </p>
            </div>
        </div>
        </div>  

<style>
    .subsection-header {
        font-family: 'IBM Plex Sans', sans-serif;
        border-top: 1px solid #116661;
        padding-top: 4rem;
        margin-top: 2rem;
    }
</style>
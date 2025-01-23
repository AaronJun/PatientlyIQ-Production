<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import GeneticPatientQuoteCards from '$lib/patientcards/GeneticPatientQuoteCards.svelte';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import "carbon-components-svelte/css/all.css";

</script>

<div class="grid text-center items-center place-content-center pt-8">
    <div class="max-w-4xl mx-auto px-4 place-content-center">

            <div class="w-10/12 mx-auto mt-16">
            <h3 class="subsection-header text-lg font-semibold  text-slate-500 mb-6">2.1<br>Genetic Testing</h3>    
            <p class="prose text-left place-content-center text-lg text-slate-600 font-serif mt-8 mb-12">
                The development of more accessible and affordable genetic testing methods has made it easier for individuals to obtain information about their APOE genotype. Direct-to-consumer genetic testing companies now offer APOE genotyping, allowing people to learn about their genetic risk for AD without necessarily going through a healthcare provider.<br><br>
                However, the lack of genetic counseling and the potential for misinterpretation of results can lead to unnecessary anxiety and confusion. There are many expressed concerns about genotyping and a resultant impact on insurance, disability benefits, and other financial considerations. Some believe that genetic counseling has little to offer.<br><br> 
                There is a clash between limited community knowledge about genetic counseling, low conversation volume about counseling, and the continued rise of genetic testing that lead to more frequent and more intensely negative reactions to test results. This suggests that there is a significant role for genetic counselors within this new paradigm, and an associated need for an increase in the educational materials and outreach provided to the APOE4 and overall Alzheimer's community.</p>
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
<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import ALZPatientQuoteCards from '$lib/patientcards/ALZPatientQuoteCards.svelte';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import "carbon-components-svelte/css/all.css";

</script>

<div class="grid items-center place-content-center">
    <div class="min-w-[100vw] pt-16 pb-12 bg-slate-800 mx-auto px-4 place-content-center">
        <img src={PIQLogo} alt="PIQ Logo" class="h-8 w-full" />
    
        <div class="text-center py-16">
            <h1 class="text-5xl font-serif text-slate-100 px-8 mb-6">A Deep Dive <span class="italic">into</span> <br>the APOE4 Experience</h1>
            <h2 class="text-xl font-base text-slate-50 max-w-2xl mx-auto px-16">
                What an analysis of more than 350 online posts, conversations, and comments reveal about the needs and hopes of this population.
            </h2>
            </div>
            </div>

            <div class="max-w-prose justify-center mx-auto  px-8 mt-8">
            <h3 class="section-header text-lg font-semibold place-content-center mx-auto text-slate-500 mb-6">The Paradox of Knowledge</h3>   
            <p class="text-left place-content-center text-lg text-slate-600 font-serif mt-8 mb-12">
                We often talk about medical breakthroughs and genetic testing as unalloyed goods – more knowledge means better outcomes. <br><br> Or so we assume. <br> <br>
                But what happens when that knowledge arrives before the solutions? Our analysis of over 350 conversations among APOE4 carriers and caregivers reveals a profound mismatch between genetic awareness and therapeutic options. This gap creates a distinctly modern predicament: people armed with precise knowledge of their genetic risks but limited tools to act on this information.
                <br><br></p>
                </div>
                <ALZPatientQuoteCards />
                <div class="max-w-prose mx-auto px-8 mt-8">
               <p class="prose text-left place-content-center text-lg text-slate-600 font-serif mt-8 mb-12">
                Their stories, chronicled through online communities and support groups, show us how medical advances are outpacing our systems for handling their psychological and social implications. Understanding this disconnect isn't just about improving patient care – it's about rethinking how we help people navigate the sometimes painful space between genetic knowledge and intervention.                          
            </div>
        </div>
<style>
    .section-header {
        font-family: 'IBM Plex Sans', sans-serif;
    }
</style>
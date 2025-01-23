<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
    import "carbon-components-svelte/css/all.css";
    import AlzPatientStoryCircles1 from '$lib/RPDPatientStories/ALZPatientStoryCircles1.svelte';
    
    let selectedDisease = "pompe";

</script>

<div class="flex-col text-center items-center place-content-center">
    <div class="max-w-4xl mx-auto px-4 place-content-center">

            <div class="w-10/12 mx-auto mt-8">
            <h3 class="sub-header text-lg font-semibold  text-slate-500 mb-6">3.2<br>APOE4-Specificity's Impact on Decision Making</h3>    
            <p class="prose text-left place-content-center text-lg text-slate-600 font-serif mt-8 mb-12">
            The APOE4 community is active in their search for options. They are more likely to discuss the impact of their genetic status on their decision-making process, and they are more likely to discuss the impact of their genetic status on their decision-making process. In the following story from a member of the community, we can see the powerful draw that a trial focused on APOE4 carriers can have on those who are affected by the gene.
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
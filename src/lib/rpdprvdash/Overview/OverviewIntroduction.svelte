<script lang="ts">
import { ArrowDown, ArrowUpRight } from "carbon-icons-svelte";
import { Button, Separator } from "bits-ui"; 
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

function navigateToSponsorTab() {
    dispatch('navigateToSponsor');
}

function navigateToLearnMore() {
    scrollToSection('learn-more');
}
</script>

<header class="flex flex-row justify-between items-center h-64 bg-slate-400">
    <h3 class="text-left text-muted-foreground font-base text-xs lg:text-sm"> Constellations of Hope for Rare Pediatric Disease Research</h3> 
</header>

<div class="section-intro flex flex-row justify-between content-end gap-8 py-8">
    
    <h1 class="text-slate-600 text-balance text-left font-medium text-4xl w-full md:w-1/3 md:justify-end lg:text-5xl mb-2">
        A Catalyst <span class="italic">for</span> 
        Rare Pediatric Disease Research</h1>


<div class="flex-container w-full md:w-4/5 lg:w-3/5 justify-end place-content-end"> 
    <p class="text-slate-800 text-left w-full md:w-2/3 lg:w-4/5 max-w-lg font-base text-sm md:text-base">  
        Like the Big Bang, <span class="highlight font-extrabold text-[#ff4a4a]">the RPD Priority Review Voucher Program (RPD PRV)</span> introduced new energy into a space that previously had fewer incentives for investment, catalyzing the development of rare pediatric disease treatments across more than 100 indications.<br> <br> 
        This dashboard provides insights into how PRVs have been awarded, used, and traded—helping researchers, policymakers, and industry leaders assess their impact within the evolving rare disease ecosystem.</p>  

<div class="flex flex-row gap-4 mt-8">   
    <Button.Root class="primary-button rounded-full align-middle flex flex-row gap-2 bg-[#ff4a4a] text-slate-50 font-semibold px-4 py-2 ring-1 ring-[#ff4a4a] ring-offset-2 shadow-xl text-sm hover:ring-amber-500 hover:bg-orange-500 hover:text-slate-50" on:click={navigateToSponsorTab}>
            Explore the Data
            <ArrowUpRight class="text-slate-50 text-center align-middle justify-center baseline" />
    </Button.Root>

    <Button.Root class="secondary-button rounded-full bg-slate-50 shadow-md text-slate-800 font-medium px-4 py-2 text-sm border-1 border-slate-800 hover:bg-slate-800 hover:text-slate-50 on:click={navigateToLearnMore}">
            Learn More
    </Button.Root>
</div>
</div>
</div>

<Separator.Root
class="bg-border mb-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]"
/>
<style>
   
    
</style>
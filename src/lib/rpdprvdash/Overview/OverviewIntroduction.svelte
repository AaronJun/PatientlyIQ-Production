<script lang="ts">
import { ArrowDown, ArrowUpRight } from "carbon-icons-svelte";
import { Button, Separator } from "bits-ui"; 
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

function navigateToSponsorTab() {
    dispatch('navigateToSponsor');
}
</script>

<div class="overview-card flex bg-slate-50 flex-col items-start justify-evenly gap-8 pl-8 pr-4 py-2 md:px-8 md:py-4 lg:pl-16 lg:pr-8 lg:py-8">

    <h3 class="text-left text-muted-foreground font-base text-xs py-2"> Constellations of Hope for Rare Pediatric Disease Research</h3>
    <div class="flex flex-col lg:flex-row gap-4 lg:gap-12 lg:pr-12">       
    <h1 class="text-slate-600 text-left font-medium text-4xl lg:text-5xl mb-2">
        A Catalyst <span class="italic">for</span> 
        Rare Pediatric Disease Research</h1>


    <p class="text-slate-800 text-left w-11/12 font-base text-sm md:w-9/12 lg:w-8/12 xl:w-7/12 ">
    <span class="font-medium"> 
    Like the Big Bang, <span class="highlight font-extrabold text-[#ff4a4a]">the RPD Priority Review Voucher Program (RPD PRV)</span> introduced new energy into a space that previously had fewer incentives for investment, catalyzing the development of rare pediatric disease treatments across more than 100 indications.</span> <br> <br> 
    This dashboard provides insights into how PRVs have been awarded, used, and traded—helping researchers, policymakers, and industry leaders assess their impact within the evolving rare disease ecosystem.</p>  
    </div>
    <div class="flex flex-row gap-4 my-8">   
        <Button.Root class="primary-button rounded-full align-middle flex flex-row gap-2 bg-[#ff4a4a] text-slate-50 font-semibold px-4 py-2 ring-1 ring-[#ff4a4a] ring-offset-2 shadow-xl text-sm hover:ring-amber-500 hover:bg-orange-500 hover:text-slate-50" on:click={navigateToSponsorTab}>
                Explore the Data
                <ArrowUpRight size={16} class="text-slate-50 text-center align-middle justify-center baseline hover:text-slate-50" />
        </Button.Root>
    
        <Button.Root class="secondary-button rounded-full bg-slate-50 shadow-md text-slate-800 font-medium px-4 py-2 text-sm border-1 border-slate-800 hover:bg-slate-800 hover:text-slate-50">
                Learn More
        </Button.Root>
    </div>
</div>

<Separator.Root
class="bg-border mb-4 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]"
/>
<style>
   
    
</style>
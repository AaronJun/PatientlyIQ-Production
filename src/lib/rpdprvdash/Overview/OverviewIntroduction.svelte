<script lang="ts">
import { ArrowDown, ArrowUpRight } from "carbon-icons-svelte";
import { Button } from "bits-ui"; 
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

function navigateToSponsorTab() {
    dispatch('navigateToSponsor');
}
</script>

<div class="overview-card bg-slate-600 shadow-md flex flex-col items-start justify-evenly gap-8 pl-8 pr-4 py-2 md:px-8 md:py-4 lg:pl-16 lg:pr-8 lg:py-8">
    <div class="flex flex-col items-start w-11/12 py-4 gap-4 md:w-9/12 lg:w-8/12 xl:w-7/12 justify-start">
    <h3 class="text-slate-100 text-left font-medium text-sm">The RPD Priority Review Voucher Program's Constellations of Hope</h3>
    <h1 class="text-slate-50 text-left font-light text-4xl">A Catalyst for Rare Pediatric Disease Research</h1>
</div>
<p class="text-slate-50 text-left w-11/12 font-base text-lg md:w-9/12 lg:w-8/12 xl:w-7/12 ">The Rare Pediatric Disease Priority Review Voucher (PRV) program is one of several factors that have helped shape the landscape of rare disease drug development. Like the Big Bang, it introduced new energy into a space that previously had fewer incentives for investment. While the program is not the sole reason for progress, it has contributed to the momentum by offering a pathway to faster regulatory review. This dashboard provides insights into how PRVs have been awarded, used, and traded—helping researchers, policymakers, and industry leaders assess their impact within the evolving rare disease ecosystem.</p>  
    
    <div class="flex flex-row gap-4 my-8">   
    <Button.Root class="primary-button align-middle flex flex-row gap-2 bg-slate-200 text-slate-900 font-semibold px-4 py-2 shadow-md rounded-full text-sm hover:bg-slate-400 hover:text-slate-50" on:click={navigateToSponsorTab}>
            Explore the Data
            <ArrowUpRight size={16} class="text-slate-800 align-middle hover:text-slate-50" />
    </Button.Root>

    <Button.Root class="secondary-button bg-none text-slate-50 font-medium px-4 py-2 rounded-full text-sm border-1 border-slate-200 hover:bg-slate-800 hover:text-slate-50">
            Learn More
    </Button.Root>
</div>
</div>

<style>
    .overview-card {
        border: .5px solid #e0e0e0;
        box-shadow: 0 2px -2px rgba(0, 0, 0, 0.1);
    }
    
</style>
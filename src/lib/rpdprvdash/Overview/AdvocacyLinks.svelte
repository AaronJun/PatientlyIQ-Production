<!-- AdvocacyLinks.svelte -->
<script lang="ts">
    import { Separator, Button } from 'bits-ui';
    import { ArrowUpRight, ChatBot } from 'carbon-icons-svelte';
</script>

<section class="advocacy-section flex flex-col gap-6 mb-6 md:px-4 lg:px-8 h-fit  p-6">
    <div class="flex flex-col items-start gap-4">
        <h3 class="text-2xl font-medium text-slate-800">Support the <span class="text-emerald-700 font-semibold">Pediatric Rare Disease Priority Review Voucher Program</span></h3>
        
        <p class="text-slate-600">
         Join advocacy efforts to support the Give Kids a Chance Act, which reauthorizes this important program.
        </p>
        
        <Separator.Root
            orientation="horizontal"
            class="bg-slate-300 shrink-0 data-[orientation=horizontal]:h-[.25px] data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px] my-2"
        />

        <div class="w-full space-y-4">
            <a href="https://everylifefoundation.quorum.us/campaign/110385/" target="_blank" rel="noopener noreferrer" 
               class="advocacy-link flex items-center justify-between p-4 bg-white border border-slate-200  hover:bg-slate-100 transition-all duration-200 group">
                <div class="flex flex-col">
                    <span class="font-semibold text-base text-emerald-700 group-hover:text-emerald-800">Contribute Your Voice With the EveryLife Foundation</span>
                    <span class="text-xs text-slate-500 mt-1">everylifefoundation.quorum.us</span>
                </div>
                <ArrowUpRight class="text-emerald-600 group-hover:text-emerald-800 w-5 h-5" />
            </a>
            
            <a href="https://www.congress.gov/bill/118th-congress/house-bill/3433" target="_blank" rel="noopener noreferrer"
               class="advocacy-link flex items-center justify-between p-4 bg-white border border-slate-200  hover:bg-slate-100 transition-all duration-200 group">
                <div class="flex flex-col">
                    <span class="font-semibold text-base text-emerald-700 group-hover:text-emerald-800">Keep Updated on the Status of the Program Legislation</span>
                    <span class="text-xs text-slate-500 mt-1">congress.gov</span>
                </div>
                <ArrowUpRight class="text-emerald-600 group-hover:text-emerald-800 w-5 h-5" />
            </a>
            
            <a href="https://kidsvcancer.org/combinations" target="_blank" rel="noopener noreferrer"
               class="advocacy-link flex items-center justify-between p-4 bg-white border border-slate-200  hover:bg-slate-100 transition-all duration-200 group">
                <div class="flex flex-col">
                    <span class="font-semibold text-base text-emerald-700 group-hover:text-emerald-800">Learn More About the Legislation</span>
                    <span class="text-xs text-slate-500 mt-1">kidsvcancer.org</span>
                </div>
                <ArrowUpRight class="text-emerald-600 group-hover:text-emerald-800 w-5 h-5" />
            </a>
        </div>
        
    </div>
</section>

<style>
    .advocacy-link {
        border-bottom: 1px solid #e0e0e0;
    }
    
    .advocacy-link:hover {
        border-bottom: 1px solid #e4e4e4;
    }
</style> 
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
    const dispatch = createEventDispatcher();
    
    function startReading() {
        dispatch('startReading');
    }
</script>

<div class="title-page-container h-full flex flex-col items-center justify-center p-4 md:p-8" 
    in:fade={{ duration: 800, delay: 200 }}>
    
    <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Header with gradient background -->
        <div class="bg-gradient-to-r from-slate-800 to-slate-700 p-6 md:p-10">
            <h1 class="text-2xl md:text-4xl font-bold text-white mb-2">
                Case Study: Sarepta Therapeutics
            </h1>
            <p class="text-slate-200 text-sm md:text-base">
                From Catalyst to Enduring Impact: The Evolution of Priority Review Vouchers
            </p>
        </div>
        
        <!-- Content section -->
        <div class="p-6 md:p-10">
            <div class="prose max-w-none">
                <h2 class="text-xl md:text-2xl font-semibold text-slate-800 mb-4">About This Case Study</h2>
                
                <p class="text-slate-600 mb-4">
                    This in-depth case study examines how Sarepta Therapeutics strategically leveraged the FDA's Priority Review Voucher program to accelerate development of treatments for rare diseases.
                </p>
                
                <div class="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-slate-50 p-4 rounded-lg border-l-4 border-emerald-500">
                        <h3 class="font-medium text-slate-800 mb-2">Key Highlights</h3>
                        <ul class="list-disc list-inside text-sm text-slate-600 space-y-1">
                            <li>How PRVs influenced R&D investment decisions</li>
                            <li>Strategic monetization of vouchers for research capital</li>
                            <li>Impact on treatment development for Duchenne Muscular Dystrophy</li>
                            <li>Pricing and accessibility implications</li>
                        </ul>
                    </div>
                    
                    <div class="bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-500">
                        <h3 class="font-medium text-slate-800 mb-2">Study Overview</h3>
                        <p class="text-sm text-slate-600">
                            This detailed analysis covers Sarepta's business strategy, the economic impact of PRVs, and the broader implications for healthcare economics and patient access to treatments for rare diseases.
                        </p>
                    </div>
                </div>
                
                <blockquote class="italic text-slate-600 border-l-4 border-emerald-300 pl-4 my-6">
                    "Sarepta has opted to sell its PRVs for large sums, then reinvest the proceeds to fund its pipeline. In July 2023 Sarepta sold the voucher earned from Elevidys' approval for $102 million in cash."
                </blockquote>
            </div>
            
            <div class="mt-8 text-center">
                <button 
                    class="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg shadow hover:bg-emerald-700 transition-colors"
                    on:click={startReading}
                    in:fly={{ y: 20, duration: 500, delay: 500 }}
                >
                    Begin Reading Case Study
                </button>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-500">
            Part of the Priority Review Voucher Analysis Dashboard
        </div>
    </div>
</div>

<style>
    .title-page-container {
        background-color: #f8fafc;
        min-height: calc(100vh - 200px);
    }
    
    .prose h2 {
        color: #1e293b;
    }
    
    .prose p {
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    
    blockquote {
        position: relative;
        font-style: italic;
    }
    
    @media (max-width: 768px) {
        .title-page-container {
            padding: 1rem;
        }
    }
</style> 
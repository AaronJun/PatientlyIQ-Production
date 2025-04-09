<!-- TherapeuticAreaSection.svelte -->
<script lang="ts">
    import { Separator, Button } from 'bits-ui';
    import { WatsonHealthDna, ArrowUpRight } from 'carbon-icons-svelte';
    import TherapeuticAreaWaffleChart from './TherapeuticAreaWaffleChart.svelte';
    
    interface DataEntry {
        Company: string;
        Candidate: string;
        TherapeuticArea1: string;
        Indication: string;
        "Current Development Stage": string;
        "PRV Year": string;
        "Purchase Year": string;
        Purchased?: string;
        Purchaser: string;
        "Sale Price (USD Millions)": string;
        MarketCap?: string;
        effectiveStage?: string;
        "RPDD Year"?: string;
        "RPDD Date"?: string;
        "PRV Date"?: string;
        "Commercial stage"?: string;
        "PRV Status"?: string;
        "Approved Drug"?: string;
        "COUNTRY"?: string;
    }
    
    export let data: DataEntry[] = [];
    export let onAreaClick: (area: string) => void = () => {};
    
    // Set default width and height to ensure the chart is fully visible
    let chartWidth = 800;
    let chartHeight = 500;
    
    // Get container dimensions for responsive sizing
    let containerWidth: number;
    let containerRef: HTMLDivElement;
    
    // Update chart dimensions when container size changes
    function updateChartDimensions() {
        if (containerRef) {
            // Set the chart width based on container size, with a minimum
            containerWidth = containerRef.clientWidth;
            chartWidth = Math.max(700, Math.min(containerWidth - 40, 1000));
            
            // Adjust height based on width to maintain aspect ratio
            chartHeight = Math.max(450, chartWidth * 0.6);
        }
    }
    
    import { onMount } from 'svelte';
    
    onMount(() => {
        updateChartDimensions();
        
        // Add resize listener
        const handleResize = () => {
            updateChartDimensions();
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });
</script>
<section class="market-cap-section flex flex-col lg:flex-row gap-8 lg:gap-16 mb-6 md:px-4 lg:px-8 justify-evenly h-fit min-h-[45.25vh] place-content-stretch align-baseline" aria-labelledby="market-cap-header">
    <div 
    bind:this={containerRef}
    class="waffle-chart-container justify-items-around items-center align-middle flex w-full"
    role="img"
    aria-label="Therapeutic Area Distribution Waffle Chart"
>
    <TherapeuticAreaWaffleChart 
        {data} 
        width={chartWidth} 
        height={chartHeight}
        maxCols={28}
        cellSize={8}
        cellPadding={2}
        onAreaClick={onAreaClick}
    />
</div>
    <div class="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-16 w-full lg:w-2/5">
        <div class="flex flex-col md:flex-row items-start gap-8 align-top">
            <div class="flex flex-col items-start gap-8 align-top">
                <h3 class="text-3xl font-medium text-pretty text-slate-800">New research sparked by the program yielded treatment options for <span class="text-teal-700 font-semibold">43 pediatric diseases</span> which lacked previously-approved treatments.</h3>

                   <Separator.Root
            orientation="horizontal"
            class="bg-slate-600 shrink-0 data-[orientation=horizontal]:h-[.25px] data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]  mt-20"
            />
            <div class="flex align-middle items-center place-content-evenly justify-start gap-2 w-full">          
                  <WatsonHealthDna class="text-teal-800 w-10 h-10 p-2 bg-teal-200" aria-hidden="true" />
                <h4 id="therapeutic-area-header" class="font-semibold text-slate-800">
                    Therapeutic Area Distribution
                </h4>
        </div>
            <p class="text-sm text-slate-600 mb-4">
                This chart shows the distribution of drug candidates across therapeutic areas. Each square represents a single drug candidate,
                with different color shades indicating different indications within the same therapeutic area.
                Hover over any square to see the specific indication, and click to view details about that therapeutic area.
            </p>
       <Button.Root class="rounded-input flex-row gap-2 border-b-1 border-emerald-800 text-emerald-800 text-left text-sm shadow-mini hover:border-blue-700 hover:text-blue-700 inline-flex w-full py-2 h-12 place-items-center justify-between font-semibold active:scale-[0.98] active:transition-all">
                Explore Data by Therapeutic Area <ArrowUpRight class="p-1 ring-1 ring-slate-800 w-6 h-6 font-light rounded-full" />   
            </Button.Root>
        </div>
        </div>
        </div>
 

</section>

<style>
    .waffle-chart-wrapper {
        min-height: 500px;
        position: relative;
        margin-bottom: 2rem;
    }
    
    .waffle-chart-container {
        position: relative;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .waffle-chart-wrapper {
            min-height: 400px;
        }
    }
</style> 
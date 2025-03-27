<!-- MarketCapSection.svelte -->
<script lang="ts">
    import { Button,    Separator } from 'bits-ui';
    import { ChartBar, ArrowUpRight } from 'carbon-icons-svelte';
    import MarketCapWaffleChart from './MarketCapWaffleChart.svelte';
    
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
    export let onMarketCapClick: (marketCap: string) => void = () => {};
    
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
    aria-label="Company Size Cap Distribution Waffle Chart"
>
        <MarketCapWaffleChart 
            {data} 
            width={chartWidth} 
            height={chartHeight}
            maxCols={20}
            cellSize={20}
            cellPadding={2}
            onMarketCapClick={onMarketCapClick}
            />
        </div>
        
        <div class="flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-16 w-full lg:w-2/5">
            <div class="flex flex-col md:flex-row items-start gap-8 align-top">
                <div class="flex flex-col items-start gap-8 align-top">
            <h3 class="text-4xl/10 font-medium text-slate-800">The program overwhelmingly encouraged research and development from <span class="text-sky-700 font-semibold">smaller teams and companies</span>.</h3>
            <Separator.Root
            orientation="horizontal"
            class="bg-slate-600 shrink-0 data-[orientation=horizontal]:h-[.25px] data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]  mt-20"
            />
            <div class="flex align-middle items-center place-content-evenly justify-start gap-2 w-full">
                <ChartBar class="text-sky-800 w-10 h-10 p-2 bg-sky-200" aria-hidden="true" />
                <h4 id="therapeutic-area-header" class="font-semibold text-slate-800">
                Company size distribution    
                </h4>
            </div>
                    <p class="text-sm text-slate-600 mb-4">
                        This visualization shows the distribution of drug candidates across different company market caps. Each square represents a drug candidate,
                        with colors indicating the company's market cap category. Hover over any square to see details about the company and indication,
                        and click to filter the data by market cap.
                    </p>
                    <Button.Root class="rounded-input flex-row gap-2 bg- border-1 border-slate-800 text-slate-800 text-left shadow-mini hover:bg-slate-200 inline-flex w-full px-4 py-2 h-12 place-items-center justify-between font-semibold active:scale-[0.98] active:transition-all">
                        Explore Economics + Transactions Data <ArrowUpRight class="p-1 ring-1 ring-slate-800 w-8 h-8 font-light rounded-full" />   
                    </Button.Root>
            </div>

 
            </div>

</section>

<style>
</style> 
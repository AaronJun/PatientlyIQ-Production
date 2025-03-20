<!-- ChartCarouselSection.svelte -->
<script lang="ts">
    import CardCarousel from './CardCarousel.svelte';
    import ChartCard from './ChartCard.svelte';
    import MarketCapWaffleChart from './MarketCapWaffleChart.svelte';
    import TherapeuticAreaWaffleChart from './TherapeuticAreaWaffleChart.svelte';
    import { createEventDispatcher } from 'svelte';
    
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
        [key: string]: any;
    }
    
    export let data: DataEntry[] = [];
    export let onCompanySelect = (company: string) => {};
    export let onAreaSelect = (area: string) => {};
    
    const dispatch = createEventDispatcher();
    
    // Card data for the carousel
    const cardData = [
        {
            title: 'Market Cap Distribution',
            description: 'Visualizes the distribution of companies by market capitalization categories, highlighting the representation of each group in the PRV landscape.',
            chartComponent: MarketCapWaffleChart,
            props: {
                data,
                onCompanySelect
            },
            actionButtonText: 'View Transactions',
            actionButtonDestination: 'By Transactions'
        },
        {
            title: 'Therapeutic Area Distribution',
            description: 'Shows the distribution of drug candidates across therapeutic areas, providing insights into where research and development efforts are concentrated.',
            chartComponent: TherapeuticAreaWaffleChart,
            props: {
                data,
                onAreaSelect
            },
            actionButtonText: 'View Therapeutic Areas',
            actionButtonDestination: 'By Therapeutic Area'
        }
    ];
    
    function handleCardOpen(event: CustomEvent) {
        // Forward the open event to the parent component
        dispatch('chartOpen', event.detail);
    }
    
</script>


<div class="section-intro w-full flex flex-col md:flex-row justify-evenly md:justify-center lg:justify-center content-end gap-8 md:gap-24 lg:gap-32 px-8 py-8">
    <h2 class="text-slate-600 w-full md:w-1/2 lg:w-2/5 text-balance text-left font-light text-3xl/8 lg:text-4xl md:justify-end mb-2">
        A constellation <span class="highlight-italics italic font-serif">of</span> new companies
            </h2>
            <div class="flex-container justify-end w-full md:w-2/3 lg:w-3/5 max-w-prose"> 
            <p class="text-slate-800 text-left font-base text-sm md:text-base">  
                We've compiled a list of key insights from the data to help you understand the RPD PRV landscape. For those interested in a deeper dive, we've also included a list of resources to help you learn more.
            </p>  
        </div>
    </div>

    <div class="carousel-wrapper px-8 overflow-x-auto md:px-12">
        <CardCarousel cards={cardData}>
            <div class="card" slot="default" let:card>
                <ChartCard 
                    title={card.title}
                    description={card.description}
                    chartComponent={card.chartComponent}
                    chartProps={card.props}
                    actionButtonText={card.actionButtonText}
                    actionButtonDestination={card.actionButtonDestination}
                    on:open={handleCardOpen}
                />
            </div>
        </CardCarousel>
    </div>

<style>
    .carousel-wrapper {
        width: 100%;
        position: relative;
        margin-bottom: 2rem;
        padding: rem; /* Added padding for better spacing */
    }
    
    .card {
        height: 100%;
    }

    
    /* Media queries for responsive behavior */
        .carousel-wrapper {
            animation: fadeIn 0.5s ease-in-out;
        }
</style> 
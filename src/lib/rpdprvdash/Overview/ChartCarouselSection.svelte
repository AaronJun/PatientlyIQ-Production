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

    <div class="section-intro flex flex-col items-start justify-evenly gap-8 py-8">
        <h3 class="text-left text-muted-foreground font-base text-xs lg:text-sm w-full md:w-8/12 lg:w-5/12">Key Insights</h3>
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:pr-4">      
            <h2 class="text-balance text-left text-slate-600 font-medium text-3xl md:text-4xl w-full md:w-8/12 lg:w-5/12">
                Insights <span class="italic">from</span> the Data
            </h2>
            <p class="text-left text-slate-800 font-base text-sm md:text-base w-full md:w-8/12 lg:w-5/12">
                We've compiled a list of key insights from the data to help you understand the RPD PRV landscape. For those interested in a deeper dive, we've also included a list of resources to help you learn more.
            </p>  
        </div>
    </div>

    <div class="carousel-wrapper">
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
            min-height: 50vh; /* Adjust for smaller screens */
        }
</style> 
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

<section class="chart-carousel-section flex flex-col lg:flex-row lg:gap-12 gap-4">
    <div class="flex flex-col gap-4">
        <h2 class="section-title text-slate-700 text-3xl font-semibold">Key Insights</h2>
        <p class="section-description text-slate-600 text-sm">
            Explore key distribution patterns across market capitalization and therapeutic areas.
            Tap on any card to view detailed information and interact with the full visualization.
        </p>
    </div>
    <div class="flex-1">
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
</section>

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
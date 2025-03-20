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
            actionButtonDestination: 'transactions'
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
            actionButtonDestination: 'therapeuticAreas'
        }
    ];
    
    function handleCardOpen(event: CustomEvent) {
        console.log('Card opened:', event.detail);
    }
    
    function handleButtonAction(event: CustomEvent) {
        const { destination } = event.detail;
        dispatch('navigateToTab', { tab: destination });
    }
</script>

<section class="chart-carousel-section">
    <h2 class="section-title">Key Insights</h2>
    <p class="section-description">
        Explore key distribution patterns across market capitalization and therapeutic areas.
        Tap on any card to view detailed information and interact with the full visualization.
    </p>
    
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
                    on:action={handleButtonAction}
                />
            </div>
        </CardCarousel>
    </div>
</section>

<style>
    .chart-carousel-section {
        margin: 2rem 0;
    }
    
    .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
        margin-bottom: 0.5rem;
    }
    
    .section-description {
        color: #6b7280;
        margin-bottom: 1.5rem;
        max-width: 800px;
    }
    
    .carousel-wrapper {
        width: 100%;
    }
    
    .card {
        height: 100%;
    }
    
    /* Media queries for responsive behavior */
    @media (max-width: 768px) {
        .section-title {
            font-size: 1.25rem;
        }
        
        .section-description {
            font-size: 0.9rem;
        }
    }
</style> 
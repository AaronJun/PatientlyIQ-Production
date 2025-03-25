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
    export let focusScale: number = 1.12; // Scale factor for focused cards
    
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

<div class="section-intro w-full flex flex-col md:flex-row justify-evenly md:justify-between lg:justify-between gap-8 md:gap-24 lg:gap-32 px-8 py-8">
    <h2 class="text-3xl font-light text-slate-700 mb-4">
        Insights <span class="italic font-serif">from</span> the Data
    </h2>
    <div class="flex-container justify-end w-full md:w-2/3 lg:w-3/5 max-w-prose"> 
        <p class="text-slate-800 text-left font-base text-sm md:text-base">  

        </p>  
    </div>
</div>

<div class="carousel-wrapper">
    <CardCarousel cards={cardData} focusScale={focusScale}>
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
        padding: 1rem 0; /* Remove horizontal padding, keep vertical */
    }
    
    .card {
        height: 100%;
    }
    
    /* Media queries for responsive behavior */
    .carousel-wrapper {
        animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
</style> 
<!-- EconomicsSection.svelte -->
<script lang="ts">
    import { Button, Separator } from 'bits-ui';
    import { ChartBar, ArrowUpRight } from 'carbon-icons-svelte';
    import MarketCapWaffleChart from './MarketCapWaffleChart.svelte';
    import RPDDFilteredTable from '../components/RPDDFilteredTable.svelte';
    import { hasPRVAward } from '../utils/data-processing-utils';
    import { onMount } from 'svelte';
    
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
    
    // Define onEntrySelect function to resolve the linter error
    const onEntrySelect = (entry: DataEntry) => {};
    
    // Set default width and height to ensure the chart is fully visible
    let chartWidth = 800;
    let chartHeight = 500;
    
    // Get container dimensions for responsive sizing
    let containerWidth: number;
    let containerRef: HTMLDivElement;
    
    // Statistics for PRV sales
    let totalPRVs = 0;
    let totalSold = 0;
    let avgSalePrice = 0;
    
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
    
    function calculateStats() {
        if (!data || data.length === 0) return;
        
        // Filter to just PRV data using PRV Year and Status
        const prvData = data.filter(d => hasPRVAward(d));
        totalPRVs = prvData.length;
        
        // Calculate sold vouchers
        const soldData = prvData.filter(d => d.Purchased === "Y");
        totalSold = soldData.length;
        
        // Calculate average value from sale prices
        const valuedSales = soldData
            .filter(d => d["Sale Price (USD Millions)"] && d["Sale Price (USD Millions)"] !== "Undisclosed")
            .map(d => parseFloat(d["Sale Price (USD Millions)"] ?? '0'));
            
        const totalValue = valuedSales.reduce((sum, val) => sum + val, 0);
        avgSalePrice = valuedSales.length > 0 ? totalValue / valuedSales.length : 0;
    }
    
    $: if (data) {
        calculateStats();
    }
    
    onMount(() => {
        calculateStats();
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


<section class="market-cap-section flex flex-col md:flex-row gap-8 lg:gap-16 mb-6 md:px-4 lg:px-8 justify-evenly h-fit min-h-[45.25vh] place-content-stretch align-baseline" aria-labelledby="market-cap-header">

    
    <RPDDFilteredTable 
    {data} 
    filterYear="2018" 
    filterPRVStatus="non-awarded"
    title="Company Navigator"
    {onEntrySelect}
/>
</section>
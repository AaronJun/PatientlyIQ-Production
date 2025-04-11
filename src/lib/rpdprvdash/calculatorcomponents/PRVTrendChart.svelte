<script lang="ts">
    import { onMount } from 'svelte';
    
    // Define the expected data structure
    interface PRVSaleData {
        year: number;
        available: number;
        price: number;
    }
    
    // Add proper typings to props
    export let salesData: PRVSaleData[] = [
        { year: 2014, available: 4,  price:  96250000 },
        { year: 2015, available: 9,  price: 198333333 },
        { year: 2016, available: 10, price: 290000000 },
        { year: 2019, available: 21, price:  95000000 },
        { year: 2020, available: 24, price:  99000000 },
        { year: 2022, available: 28, price: 100000000 },
        { year: 2024, available: 30, price: 103000000 }
    ];
    
    // Accept the parameters to show their impact visually
    export let lambdaRec = 0.25;
    export let currentYear = new Date().getFullYear();
    export let minPriceFloor = 0; // Display price floor line
    export let alphaSupply = 0.15; // Supply elasticity parameter
    
    // Formatting helper
    const fmtUSD = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(value);
    };
    
    // Format for display in millions
    const formatMillions = (value: number) => {
        return `$${Math.round(value / 1000000)}M`;
    };
    
    let chartContainer: HTMLDivElement;
    let maxPrice = Math.max(...salesData.map(d => d.price));
    let chartHeight = 250;  // pixels
    
    function getBarHeight(price: number): number {
        return (price / maxPrice) * (chartHeight - 40);
    }
    
    // Get the Y position for the price floor line
    $: priceFloorPosition = minPriceFloor > 0 
        ? chartHeight - getBarHeight(minPriceFloor) 
        : null;
    
    // Calculate the visual weight of a year based on recency decay
    $: getRecencyWeight = (year: number) => {
        const weight = Math.exp(-lambdaRec * (currentYear - year));
        // Map weight (0-1) to opacity (0.3-1)
        return 0.3 + (weight * 0.7);
    };
    
    // Calculate the saturation based on recency weight (0-100%)
    $: getBarColor = (year: number) => {
        const weight = getRecencyWeight(year);
        // Convert weight to a saturation percentage (30-100%)
        const saturation = Math.round(30 + (weight * 70));
        return `hsl(210, ${saturation}%, 50%)`;
    };
    
    // Calculate the supply weight for each data point
    $: getSupplyWeight = (available: number) => {
        return 1 / (1 + alphaSupply * available);
    };
</script>

<div class="prv-trend-chart p-4">
    <h3 class="text-xl font-semibold mb-4">Historical PRV Sale Prices</h3>
    <p class="text-sm text-gray-600 mb-4">
        Bars with stronger color have more influence on the current calculation
        {#if lambdaRec > 0.3}
            (recent years are weighted more heavily)
        {:else if lambdaRec < 0.15}
            (all years are weighted similarly)
        {:else}
            (balanced weighting)
        {/if}
    </p>
    
    <div class="chart-container" bind:this={chartContainer}>
        <div class="chart-bars flex items-end justify-between h-[250px] relative">
            <!-- Y-axis labels -->
            <div class="absolute left-0 top-0 h-full flex flex-col justify-between pointer-events-none text-xs text-gray-500">
                <span>{formatMillions(maxPrice)}</span>
                <span>{formatMillions(maxPrice * 0.75)}</span>
                <span>{formatMillions(maxPrice * 0.5)}</span>
                <span>{formatMillions(maxPrice * 0.25)}</span>
                <span>$0M</span>
            </div>
            
            <!-- Horizontal grid lines -->
            <div class="absolute left-0 top-0 w-full h-full pointer-events-none">
                <div class="border-t border-gray-200 h-1/4"></div>
                <div class="border-t border-gray-200 h-1/4"></div>
                <div class="border-t border-gray-200 h-1/4"></div>
                <div class="border-t border-gray-200 h-1/4"></div>
            </div>
            
            <!-- Price floor line -->
            {#if minPriceFloor > 0}
                <div 
                    class="absolute left-10 right-0 border-t-2 border-dashed border-blue-500 z-10 flex items-center"
                    style="top: {priceFloorPosition}px;"
                >
                    <div class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded -mt-6 ml-2">
                        Price Floor: {formatMillions(minPriceFloor)}
                    </div>
                </div>
            {/if}
            
            <!-- Bars -->
            <div class="bars-wrapper flex items-end justify-between w-full pl-10">
                {#each salesData as item}
                    <div class="bar-group flex flex-col items-center">
                        <div 
                            class="hover:bg-blue-600 rounded-t w-12 transition-colors cursor-pointer group relative" 
                            style="height: {getBarHeight(item.price)}px; background-color: {getBarColor(item.year)}; opacity: {getRecencyWeight(item.year)}"
                        >
                            <!-- Supply weight indicator (border width based on supply influence) -->
                            <div 
                                class="absolute inset-0 border-t-2 border-green-500 rounded-t"
                                style="border-width: {Math.round(getSupplyWeight(item.available) * 4)}px;"
                            ></div>
                        
                            <!-- Tooltip -->
                            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white p-2 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                <p class="font-bold">{item.year}</p>
                                <p>Price: {fmtUSD(item.price)}</p>
                                <p>Available: {item.available} PRVs</p>
                                <p>Recency Weight: {(getRecencyWeight(item.year) * 100).toFixed(0)}%</p>
                                <p>Supply Weight: {(getSupplyWeight(item.available) * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                        <div class="text-xs mt-1 font-medium">{item.year}</div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
    

</div>

<style>
    .chart-container {
        overflow-x: auto;
        padding-bottom: 1rem;
    }
    
    .bars-wrapper {
        min-width: 400px;
    }
</style> 
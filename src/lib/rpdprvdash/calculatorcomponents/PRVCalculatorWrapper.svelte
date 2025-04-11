<script lang="ts">
    import PRVValueCalc from './PRVValueCalc.svelte';
    import PRVTrendChart from './PRVTrendChart.svelte';
    
    // Define proper interfaces for type safety
    interface PRVSaleData {
        year: number;
        available: number;
        price: number;
    }
    
    // Historical PRV data to share between components
    const salesData: PRVSaleData[] = [
        { year: 2014, available: 4,  price:  96250000 },
        { year: 2015, available: 9,  price: 198333333 },
        { year: 2016, available: 10, price: 290000000 },
        { year: 2019, available: 21, price:  95000000 },
        { year: 2020, available: 24, price:  99000000 },
        { year: 2022, available: 28, price: 100000000 },
        { year: 2024, available: 30, price: 103000000 }
    ];
    
    // Shared parameters that will be updated by the calculator component
    let currentYear = new Date().getFullYear();
    let lambdaRec = 0.25;
    let alphaSupply = 0.15;
    let confidence = 0.8;
    let minPriceFloor = 70000000; // Will be set automatically by calculator component
    
    // Listen for parameter changes from the calculator
    function handleParametersChanged(event: CustomEvent<{
        currentYear: number;
        lambdaRec: number;
        alphaSupply: number;
        confidence: number;
        minPriceFloor: number;
    }>) {
        currentYear = event.detail.currentYear;
        lambdaRec = event.detail.lambdaRec;
        alphaSupply = event.detail.alphaSupply;
        confidence = event.detail.confidence;
        minPriceFloor = event.detail.minPriceFloor;
        
        console.log("Parameters changed in wrapper:", {
            currentYear,
            lambdaRec,
            alphaSupply,
            confidence,
            minPriceFloor
        });
    }
    
    // Handle when the calculator initially calculates the recommended price floor
    function handlePriceFloorCalculated(event: CustomEvent<{ minPriceFloor: number }>) {
        minPriceFloor = event.detail.minPriceFloor;
    }
</script>

<div class="prv-calculator-wrapper p-6 max-w-5xl mx-auto">
    <div class="mb-8">
        <h1 class="text-3xl font-bold mb-4">Priority Review Voucher (PRV) Calculator</h1>
        <p class="text-gray-700 mb-2">
            This calculator estimates the market value of Priority Review Vouchers (PRVs) based on historical sale data.
            The model uses weighted pricing data that accounts for both recency and market supply.
        </p>
        <p class="text-gray-700 mb-4">
            Adjust the parameters below to see how different factors impact PRV valuation.
        </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Calculator section -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <PRVValueCalc 
                {salesData}
                bind:currentYear
                bind:lambdaRec
                bind:alphaSupply
                bind:confidence
                bind:minPriceFloor
                on:parametersChanged={handleParametersChanged}
                on:priceFloorCalculated={handlePriceFloorCalculated}
            />
        </div>

        <!-- Chart section -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <PRVTrendChart 
                {salesData}
                {currentYear}
                {lambdaRec}
                {alphaSupply}
                {minPriceFloor}
            />
        </div>
    </div>

    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-8">
        <h3 class="text-xl font-semibold mb-2">How This Works</h3>
        <p class="mb-2">The PRV valuation model considers these key factors:</p>
        <ul class="list-disc pl-5 space-y-1 mb-4">
            <li><strong>Remaining PRVs in Market:</strong> The current supply of available PRVs that could be sold</li>
            <li><strong>Expected New PRVs per Year:</strong> Anticipated future PRVs that may enter the market</li>
            <li><strong>Market Trend Relevance:</strong> How much weight is given to recent sales versus historical sales</li>
            <li><strong>Historical Price Floor:</strong> Sets a minimum price based on recent transaction data</li>
            <li><strong>Price Range Confidence:</strong> How conservative or aggressive you want the price estimate to be</li>
        </ul>
        <p>The model automatically translates these intuitive inputs into technical parameters that power the statistical calculation.</p>
    </div>
</div>

<style>
    /* Any additional styling if needed */
</style> 
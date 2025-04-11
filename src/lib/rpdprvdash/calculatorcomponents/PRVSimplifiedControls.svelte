<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    // The component will emit these technical parameters
    export let currentYear = new Date().getFullYear();
    export let lambdaRec = 0.25;    // Recency decay
    export let alphaSupply = 0.15;  // Supply elasticity
    export let confidence = 0.8;    // Confidence level
    export let minPriceFloor = 70000000; // Minimum price ($70M default)
    
    // User-friendly inputs
    let futureAwardedPRVs = 3;      // Expected new PRVs per year
    let remainingPRVs = 8;          // Current PRVs available in market
    let marketRelevance = 3;        // How much recent transactions matter (1-5)
    let riskTolerance = 2;          // User's risk profile (1-3)
    let useHistoricalMinimum = true;// Whether to enforce a price floor
    
    const dispatch = createEventDispatcher();
    
    // More visible factor calculation
    let supplyFactor = 0; // Will be calculated reactively
    
    // Map simple values to technical parameters
    $: {
        // Map market relevance (1-5) to lambda (0.1-0.5)
        // Higher market relevance = higher lambda = more weight on recent data
        lambdaRec = marketRelevance * 0.1;
        
        // Map future awarded PRVs and remaining PRVs to supply elasticity
        // More expected PRVs = higher alpha = more price sensitivity to supply
        supplyFactor = remainingPRVs * 0.01 + futureAwardedPRVs * 0.025;
        alphaSupply = 0.05 + Math.min(0.3, supplyFactor); // Cap at reasonable level
        
        // Map risk tolerance to confidence level
        // 1 = conservative (95%), 2 = balanced (90%), 3 = aggressive (80%)
        confidence = riskTolerance === 1 ? 0.95 : riskTolerance === 2 ? 0.9 : 0.8;
        
        // Dispatch event when parameters change
        dispatch('parametersChanged', {
            currentYear,
            lambdaRec,
            alphaSupply,
            confidence,
            minPriceFloor: useHistoricalMinimum ? minPriceFloor : 0
        });
    }
    
    // User-friendly descriptions
    const relevanceDescriptions = [
        "Historical prices (pre-2015) matter as much as recent ones",
        "Historical prices matter, but recent ones have more weight",
        "Balanced weighting between historical and recent prices",
        "Recent prices matter more than historical ones",
        "Only the most recent prices really matter"
    ];
    
    const riskToleranceDescriptions = [
        "Conservative (95% confidence, narrower range)",
        "Balanced (90% confidence)",
        "Aggressive (80% confidence, wider range)"
    ];
    
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };
    
    // Calculate the impact level for UI feedback
    $: remainingImpact = getImpactLevel(remainingPRVs, 0, 20);
    $: futureImpact = getImpactLevel(futureAwardedPRVs, 1, 6);
    $: marketRelevanceImpact = getImpactLevel(marketRelevance, 1, 5);
    
    // Helper to get impact level for UI (returns "low", "medium", "high")
    function getImpactLevel(value: number, min: number, max: number): string {
        const range = max - min;
        const third = range / 3;
        
        if (value <= min + third) return "low";
        if (value <= min + (2 * third)) return "medium";
        return "high";
    }
</script>

<div class="simplified-controls p-4 space-y-6">
    <div>
        <h3 class="text-lg font-medium mb-4">PRV Valuation Controls</h3>
        <p class="text-sm text-gray-600 mb-4">
            Use these controls to adjust the model parameters and see the impact on PRV valuation.
        </p>
    </div>
    
    <!-- Current Year -->
    <div class="mb-4">
        <label class="flex flex-col">
            <span class="mb-1 font-medium">Current Year</span>
            <input 
                type="number" 
                bind:value={currentYear} 
                min="2007" 
                max="2030"
                class="border rounded px-2 py-1" 
            />
        </label>
    </div>
    
    <!-- Market Supply Factors (grid layout) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Remaining PRVs -->
        <div>
            <label class="flex flex-col">
                <div class="flex justify-between">
                    <span class="mb-1 font-medium">Remaining PRVs in Market</span>
                    <span class="text-xs px-2 py-0.5 rounded {remainingImpact === 'low' ? 'bg-green-100 text-green-800' : remainingImpact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                        {remainingImpact === 'low' ? 'Low impact' : remainingImpact === 'medium' ? 'Medium impact' : 'High impact'}
                    </span>
                </div>
                <div class="flex items-center">
                    <input 
                        type="range" 
                        min="0" 
                        max="20"
                        step="1" 
                        bind:value={remainingPRVs} 
                        class="flex-grow"
                    />
                    <span class="ml-2 text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                        {remainingPRVs} PRVs
                    </span>
                </div>
                <span class="text-xs text-gray-500 mt-1">
                    Current PRVs awaiting sale. More availability → lower price.
                </span>
            </label>
        </div>
        
        <!-- Expected Annual PRVs -->
        <div>
            <label class="flex flex-col">
                <div class="flex justify-between">
                    <span class="mb-1 font-medium">Expected New PRVs per Year</span>
                    <span class="text-xs px-2 py-0.5 rounded {futureImpact === 'low' ? 'bg-green-100 text-green-800' : futureImpact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                        {futureImpact === 'low' ? 'Low impact' : futureImpact === 'medium' ? 'Medium impact' : 'High impact'}
                    </span>
                </div>
                <div class="flex items-center">
                    <input 
                        type="range" 
                        min="1" 
                        max="6"
                        step="1" 
                        bind:value={futureAwardedPRVs} 
                        class="flex-grow"
                    />
                    <span class="ml-2 text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                        {futureAwardedPRVs} PRVs/year
                    </span>
                </div>
                <span class="text-xs text-gray-500 mt-1">
                    Expected annual new PRVs. Higher rates → lower future value.
                </span>
            </label>
        </div>
    </div>
    
    <!-- Market Relevance -->
    <div class="mb-4">
        <label class="flex flex-col">
            <div class="flex justify-between">
                <span class="mb-1 font-medium">Market Trend Relevance</span>
                <span class="text-xs px-2 py-0.5 rounded {marketRelevanceImpact === 'low' ? 'bg-green-100 text-green-800' : marketRelevanceImpact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                    {marketRelevanceImpact === 'low' ? 'Focus on history' : marketRelevanceImpact === 'medium' ? 'Balanced' : 'Focus on recent'}
                </span>
            </div>
            <div class="flex items-center">
                <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1"
                    bind:value={marketRelevance} 
                    class="flex-grow"
                />
                <span class="ml-2 text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                    {marketRelevance}/5
                </span>
            </div>
            <span class="text-xs text-gray-600 mt-1">
                {relevanceDescriptions[marketRelevance-1]}
            </span>
        </label>
    </div>
    
    <!-- Price Floor -->
    <div class="mb-4">
        <label class="flex items-start">
            <input 
                type="checkbox" 
                bind:checked={useHistoricalMinimum} 
                class="mt-1 mr-2"
            />
            <div class="flex flex-col">
                <span class="font-medium">Use Historical Price Floor</span>
                <span class="text-xs text-gray-600">
                    Enforce a minimum price of {formatCurrency(minPriceFloor)} based on recent transactions
                </span>
            </div>
        </label>
    </div>
    
    <!-- Risk Tolerance -->
    <div class="mb-4">
        <label class="flex flex-col">
            <span class="mb-1 font-medium">Price Range Confidence</span>
            <div class="flex items-center justify-between">
                <button 
                    class="px-3 py-1 rounded border {riskTolerance === 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}"
                    on:click={() => riskTolerance = 1}
                >
                    Conservative
                </button>
                <button 
                    class="px-3 py-1 rounded border {riskTolerance === 2 ? 'bg-blue-500 text-white' : 'bg-gray-100'}"
                    on:click={() => riskTolerance = 2}
                >
                    Balanced
                </button>
                <button 
                    class="px-3 py-1 rounded border {riskTolerance === 3 ? 'bg-blue-500 text-white' : 'bg-gray-100'}"
                    on:click={() => riskTolerance = 3}
                >
                    Aggressive
                </button>
            </div>
            <span class="text-xs text-gray-600 mt-1">
                {riskToleranceDescriptions[riskTolerance-1]}
            </span>
        </label>
    </div>

    <!-- Advanced metrics display -->
    <div class="mt-6 p-3 bg-gray-50 rounded-md border border-gray-200">
        <div class="flex justify-between items-center mb-2">
            <h4 class="text-sm font-medium">Model Parameters</h4>
            <span class="text-xs text-gray-500">(Used in statistical model)</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div class="flex justify-between">
                <span class="text-gray-600">Recency Decay (λ):</span>
                <span class="font-mono">{lambdaRec.toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Supply Elasticity (α):</span>
                <span class="font-mono">{alphaSupply.toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Confidence:</span>
                <span class="font-mono">{(confidence * 100).toFixed(0)}%</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Supply Factor:</span>
                <span class="font-mono">{supplyFactor.toFixed(3)}</span>
            </div>
            {#if useHistoricalMinimum}
            <div class="md:col-span-2 flex justify-between">
                <span class="text-gray-600">Minimum Price:</span>
                <span class="font-mono">{formatCurrency(minPriceFloor)}</span>
            </div>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Any additional styling if needed */
</style> 
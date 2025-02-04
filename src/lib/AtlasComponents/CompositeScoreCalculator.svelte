<script lang="ts">
    import { onMount } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { countryStore, updateCountryData } from './stores/countryStore';
    import { createEventDispatcher } from 'svelte';
    import { metricConfig } from './metricConfig';

    const dispatch = createEventDispatcher();
    
    let selectedCountry;
    let metrics;
    let isDirty = false;

    // Initialize tweened store
    const localCompositeScore = tweened(0, {
        duration: 400,
        easing: cubicOut
    });

    // Subscribe to country store
    $: countries = $countryStore;
    $: if (!selectedCountry && countries.length) {
        selectedCountry = countries[0];
        metrics = structuredClone(selectedCountry.calculatedMetrics);
        localCompositeScore.set(calculateLocalScore(metrics));
    }

    // Make score reactive to metric changes
    $: if (metrics) {
        localCompositeScore.set(calculateLocalScore(metrics));
    }

    function handleCountryChange(event) {
        selectedCountry = countries.find(c => c.id === event.target.value) || countries[0];
        metrics = structuredClone(selectedCountry.calculatedMetrics);
        isDirty = false;
    }

    function handleMetricChange() {
        isDirty = true;
    }

    function calculateLocalScore(metrics) {
        const baseScore = 10;
        let score = baseScore;
        
        Object.entries(metrics).forEach(([key, metricGroup]) => {
            let metricScore = 0;
            Object.entries(metricGroup.subMetrics).forEach(([subKey, subMetric]) => {
                const normalizedValue = (subMetric.value - subMetric.min) / (subMetric.max - subMetric.min);
                const adjustedValue = metricGroup.isInverse ? 1 - normalizedValue : normalizedValue;
                metricScore += adjustedValue * subMetric.weight;
            });
            metricGroup.score = metricScore;
            score += metricScore * metricGroup.weight;
        });
        
        return score;
    }

    function handleCalculate() {
        const newScore = calculateLocalScore(metrics);
        
        // Update the store
        updateCountryData(selectedCountry.id, newScore);
        
        // Dispatch event for parent components
        dispatch('scoreUpdated', {
            countryId: selectedCountry.id,
            newScore
        });
        
        isDirty = false;
    }

    $: formattedScore = $localCompositeScore.toFixed(2);
    </script>
<div class="h-full">
    <!-- Header Section -->
    <div class="calc-header bg-slate-50 pt-4 sticky top-6">
        <div class="flex flex-col space-y-4">
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Select Region</label>
                <select 
                    value={selectedCountry?.id}
                    on:change={handleCountryChange}
                    class="w-full p-2 border rounded-lg  hover:border-blue-500 transition-colors"
                >
                    {#each countries as country}
                        <option value={country.id}>{country.name}</option>
                    {/each}
                </select>
            </div>
            
            <!-- Score display and update button -->
            <div class="flex justify-between items-center">
                <div class="text-center bg-slate-50 px-6 py-3 rounded-lg">
                    <div class="text-sm text-slate-500 mb-1">Composite Score</div>
                    <div class="text-2xl font-bold text-blue-600">{formattedScore}</div>
                </div>
                
                <button
                    class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium 
                           disabled:bg-gray-400 disabled:cursor-not-allowed
                           hover:bg-blue-700 transition-colors"
                    disabled={!isDirty}
                    on:click={handleCalculate}
                >
                    Update Score
                </button>
            </div>
        </div>
    </div>

    <!-- Metrics Grid -->
    <div class="p-4">
        <div class="grid grid-cols-1 gap-6">
            {#each Object.entries(metrics || {}) as [metricKey, metricGroup]}
                <div class="">
                    <div class="p-4 border-b">
                        <h3 class="text-lg font-semibold text-slate-600">
                            {metricConfig[metricKey]?.label || metricKey.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                    </div>

                    <div class="p-4 space-y-4">
                        {#each Object.entries(metricGroup.subMetrics) as [subMetricKey, subMetric]}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                    {subMetricKey.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                
                                {#if metricConfig[metricKey]}
                                    <select
                                        bind:value={subMetric.value}
                                        on:change={handleMetricChange}
                                        class="w-full p-2 border rounded-full hover:border-blue-500 transition-colors"
                                    >
                                        {#each metricConfig[metricKey].options as option}
                                            <option value={option.value}>
                                                {option.label}
                                            </option>
                                        {/each}
                                    </select>
                                {:else}
                                    <input
                                        type="number"
                                        bind:value={subMetric.value}
                                        min={subMetric.min}
                                        max={subMetric.max}
                                        step={subMetric.max < 1 ? 0.01 : 1}
                                        on:input={handleMetricChange}
                                        class="w-full p-2 border roupnded-lg hover:border-blue-500 transition-colors"
                                    />
                                {/if}

                                <div class="flex justify-between mt-1">
                                    <span class="text-xs text-gray-500">
                                        Range: {subMetric.min} - {subMetric.max}
                                    </span>
                                    <span class="text-xs text-gray-500">
                                        Weight: {(subMetric.weight * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        {/each}

                        <div class="pt-3 mt-3 border-t">
                            <div class="flex justify-between text-sm">
                                <span class="font-medium text-gray-700">Category Score</span>
                                <span>
                                    <span class="font-mono">{metricGroup.score?.toFixed(3) || '0.000'}</span>
                                    <span class="text-gray-500 ml-2">
                                        (Weight: {(metricGroup.weight * 100).toFixed(1)}%)
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>
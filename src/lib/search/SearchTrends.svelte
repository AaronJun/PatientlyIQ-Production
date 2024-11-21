<script lang="ts">
    import { TrendingUp, Globe, Calendar, Monitor, Activity } from 'lucide-svelte';
    
    export let selectedDisease: string;
    export let data: any;
    $: {
    console.log('Trends Data:', {
        selectedDisease,
        trends
    });
}
    $: trends = data.searchTrends[selectedDisease] || {};
    </script>

<div class="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm">
    <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-6">Search Trends</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- YoY  Growth -->
        <div class="flex items-start gap-4">
            <div class="p-2 bg-red-50 dark:bg-neutral-800 rounded-lg">
                <TrendingUp class="w-5 h-5 text-[#ff5151]" />
            </div>
            <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Year over Year Growth</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">+{trends.yearOverYear}%</p>
            </div>
        </div>

        <!-- Peak Month -->
        <div class="flex items-start gap-4">
            <div class="p-2 bg-red-50 dark:bg-neutral-800 rounded-lg">
                <Calendar class="w-5 h-5 text-[#ff5151]" />
            </div>
            <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Peak Search Month</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{trends.peakSearchMonth}</p>
            </div>
        </div>

        <!-- Device Usage -->
        <div class="flex items-start gap-4">
            <div class="p-2 bg-red-50 dark:bg-neutral-800 rounded-lg">
                <Monitor class="w-5 h-5 text-[#ff5151]" />
            </div>
            <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Most Common Device</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">{trends.mostCommonDevice}</p>
            </div>
        </div>

        <!-- Related Conditions -->
        <div class="flex items-start gap-4">
            <div class="p-2 bg-red-50 dark:bg-neutral-800 rounded-lg">
                <Activity class="w-5 h-5 text-[#ff5151]" />
            </div>
            <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Top Related Condition</p>
                <p class="text-lg font-semibold text-gray-900 dark:text-gray-100">{trends.relatedConditions[0]}</p>
            </div>
        </div>
    </div>

    <!-- Geographic Distribution -->
    <div class="mt-8">
        <div class="flex items-center gap-2 mb-4">
            <Globe class="w-4 h-4 text-gray-400" />
            <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">Top Geographies</h4>
        </div>
        <div class="flex flex-wrap gap-2">
            {#each trends.topGeographies || [] as geography}
                <span class="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
                    {geography}
                </span>
            {/each}
        </div>
    </div>
</div>
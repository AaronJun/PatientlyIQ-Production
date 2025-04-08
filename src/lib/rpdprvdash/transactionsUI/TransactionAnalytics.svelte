<!-- TransactionAnalytics.svelte -->
<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import PRVValueTimeline from '../Overview/PRVValueTimeline.svelte';
    import PRVAwardCount from '../Overview/PRVAwardCount.svelte';
    import TherapeuticAreaDistribution from '../Overview/TherapeuticAreaDistribution.svelte';
    import CompanyLeaderboard from '../Overview/CompanyLeaderboard.svelte';
    import UnsoldVouchersTable from '../Overview/UnsoldVouchersTable.svelte';
    import { Money, CicsTransactionServerZos, Catalog } from 'carbon-icons-svelte';
    import { hasPRVAward } from '../utils/data-processing-utils';
    
    interface DataEntry {
        Company: string;
        Purchased?: string;
        "Sale Price (USD Millions)"?: string;
        "PRV Year"?: string;
        TherapeuticArea1?: string;
        Indication?: string;
        Candidate?: string;
        "Current Development Stage"?: string;
        "Purchase Year"?: string;
        Purchaser?: string;
        MarketCap?: string;
    }
    
    export let data: DataEntry[] = [];
    export let isAllYearView: boolean = true;
    export let onEntrySelect: (entry: DataEntry) => void;
    
    // Statistics
    let totalPRVs = 0;
    let totalSold = 0;
    let totalValue = 0;
    let avgSalePrice = 0;
    let yearlyPRVs: { year: string, count: number }[] = [];
    
    // Track the state of each collapsible section
    let expandedSections: Record<string, boolean> = {
        valueTrends: true,
        topPerformers: true,
        unsoldVouchers: true
    };

    // Create refs to track each chart component for direct redrawing
    let prvValueTimelineComponent: PRVValueTimeline;
    let prvAwardCountComponent: PRVAwardCount;
    let therapeuticAreaDistComponent: TherapeuticAreaDistribution;
    
    // Track if the component is active in the DOM
    let isComponentVisible = false;
    let redrawAttempts = 0;
    const MAX_REDRAW_ATTEMPTS = 3;
    
    function toggleSection(section: keyof typeof expandedSections) {
        expandedSections[section] = !expandedSections[section];
        
        // When expanding a section, ensure charts are redrawn
        if (expandedSections[section]) {
            setTimeout(forceRedrawCharts, 50);
        }
    }
    
    function calculateStats() {
        if (!data || data.length === 0) return;
        
        // Filter to just PRV data using PRV Year
        const prvData = data.filter(d => hasPRVAward(d) && d["PRV Year"]);
        totalPRVs = prvData.length;
        
        // Calculate sold vouchers
        const soldData = prvData.filter(d => d.Purchased === "Y");
        totalSold = soldData.length;
        
        // Calculate total and average value
        const valuedSales = soldData.filter(d => d["Sale Price (USD Millions)"] && d["Sale Price (USD Millions)"] !== "Undisclosed")
            .map(d => parseFloat(d["Sale Price (USD Millions)"] ?? '0'));
            
        totalValue = valuedSales.reduce((sum, val) => sum + val, 0);
        avgSalePrice = valuedSales.length > 0 ? totalValue / valuedSales.length : 0;
        
        // Calculate yearly PRV distribution using PRV Year
        const prvsGroupedByYear: Record<string, number> = {};
        prvData.forEach(d => {
            const year = d["PRV Year"];
            if (year) {
                prvsGroupedByYear[year] = (prvsGroupedByYear[year] || 0) + 1;
            }
        });
        
        yearlyPRVs = Object.entries(prvsGroupedByYear)
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => a.year.localeCompare(b.year));
    }
    
    // Export this function to allow external components to trigger redraw
    export function forceRedrawCharts() {
        if (redrawAttempts >= MAX_REDRAW_ATTEMPTS) return;
        
        redrawAttempts++;
        console.log(`Forcing chart redraw, attempt ${redrawAttempts}`);
        
        // Call each chart's createVisualization method if it exists
        if (prvValueTimelineComponent?.createVisualization) {
            try {
                prvValueTimelineComponent.createVisualization();
            } catch (e) {
                console.warn("Error redrawing PRV Value Timeline:", e);
            }
        }
        
        if (prvAwardCountComponent?.createVisualization) {
            try {
                prvAwardCountComponent.createVisualization();
            } catch (e) {
                console.warn("Error redrawing PRV Award Count:", e);
            }
        }
        
        if (therapeuticAreaDistComponent?.createVisualization) {
            try {
                therapeuticAreaDistComponent.createVisualization();
            } catch (e) {
                console.warn("Error redrawing Therapeutic Area Distribution:", e);
            }
        }
        
        // Schedule another redraw after a delay if we haven't reached max attempts
        if (redrawAttempts < MAX_REDRAW_ATTEMPTS) {
            setTimeout(forceRedrawCharts, 200 * redrawAttempts); // Increase delay with each attempt
        }
    }
    
    $: if (data) {
        calculateStats();
    }
    
    // Called when the component is mounted and visible
    onMount(() => {
        isComponentVisible = true;
        if (data) {
            calculateStats();
            
            // Initial redraw attempt
            setTimeout(() => {
                redrawAttempts = 0;
                forceRedrawCharts();
            }, 100); // Short delay to ensure DOM is ready
        }
    });
    
    // Also redraw on component update
    afterUpdate(() => {
        if (isComponentVisible) {
            redrawAttempts = 0;
            setTimeout(forceRedrawCharts, 100);
        }
    });

    // Extract owners of unsold vouchers
    $: unsoldVouchers = data.filter(d => d.Purchased !== "Y");
    $: unsoldVoucherOwners = new Set(unsoldVouchers.map(d => d.Company));

    // Calculate the number of unsold vouchers for each company
    $: unsoldVoucherCounts = Array.from(unsoldVoucherOwners).map(owner => {
        const count = unsoldVouchers.filter(v => v.Company === owner).length;
        return { owner, count };
    });
</script>

<div class="transaction-analytics-tab h-[calc(100vh-100px)] overflow-y-auto w-full">
    <!-- Section 1: PRV Value Trends -->
    <section class="mb-6 w-full">
        <button
            type="button"
            class="section-header w-full flex items-center justify-between bg-slate-50 p-3 border border-slate-200" 
            on:click={() => toggleSection('valueTrends')}
        >
            <div class="flex items-center gap-2">
                <Money size={20} class="text-green-500" />
                <h2 class="text-lg font-semibold text-slate-700">Value & Distribution Trends</h2>
            </div>
            <div class="text-slate-400">
                {expandedSections.valueTrends ? '−' : '+'}
            </div>
        </button>
        
        {#if expandedSections.valueTrends}
            <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- PRV Value Timeline -->
                    <div class="p-4 border border-slate-200 w-full">
                        <h3 class="text-base font-semibold text-slate-700 mb-3">PRV Value Timeline</h3>
                        <div class="chart-container min-w-full">
                            <PRVValueTimeline bind:this={prvValueTimelineComponent} {data} height={250} />
                        </div>
                        <p class="text-sm text-slate-500 mt-3">PRV values have ranged from $68M to $350M since program inception, with recent stabilization around $110M.</p>
                    </div>
                    
                    <!-- PRV Award Count by Year -->
                    <div class="p-4 border border-slate-200 w-full">
                        <h3 class="text-base font-semibold text-slate-700 mb-3">PRV Awards by Year</h3>
                        <div class="chart-container min-w-full">
                            <PRVAwardCount bind:this={prvAwardCountComponent} yearlyData={yearlyPRVs} height={250} />
                        </div>
                        <p class="text-sm text-slate-500 mt-3">The number of PRVs awarded has increased in recent years, with {yearlyPRVs[yearlyPRVs.length-1]?.count || 0} vouchers in {yearlyPRVs[yearlyPRVs.length-1]?.year || 'the latest year'}.</p>
                    </div>
                    
                    <!-- Total PRV Value -->
                    <div class="p-4 border border-slate-200 bg-gradient-to-br from-emerald-50 to-slate-50 w-full">
                        <h3 class="text-base font-semibold text-slate-700 mb-2">Total PRV Sales Value</h3>
                        <p class="text-5xl font-bold text-emerald-600 text-center my-4">${totalValue.toLocaleString()}M</p>
                        <p class="text-sm text-slate-500 text-center">Cumulative value of sold PRVs to date</p>
                    </div>
                    
                    <!-- Therapeutic Area Distribution -->
                    <div class="p-4 border border-slate-200 w-full">
                        <h3 class="text-base font-semibold text-slate-700 mb-3">Therapeutic Area Distribution</h3>
                        <div class="chart-container min-w-full">
                            <TherapeuticAreaDistribution bind:this={therapeuticAreaDistComponent} {data} height={250} />
                        </div>
                        <p class="text-sm text-slate-500 mt-3">Therapeutic areas with the most PRVs awarded include neuromuscular disorders, metabolic diseases, and rare cancers.</p>
                    </div>
                </div>
            </div>
        {/if}
    </section>
    
    <!-- Section 2: Top Performers -->
    <section class="mb-6">
        <button
            type="button"
            class="section-header w-full flex items-center justify-between bg-slate-50 p-3 border border-slate-200" 
            on:click={() => toggleSection('topPerformers')}
        >
            <div class="flex items-center gap-2">
                <CicsTransactionServerZos size={20} class="text-amber-500" />
                <h2 class="text-lg font-semibold text-slate-700">Program Leaders</h2>
            </div>
            <div class="text-slate-400">
                {expandedSections.topPerformers ? '−' : '+'}
            </div>
        </button>
        
        {#if expandedSections.topPerformers}
            <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
                <div class="chart-container min-w-full">
                    <CompanyLeaderboard {data} />
                </div>
            </div>
        {/if}
    </section>
    
    <!-- Section 3: Unsold Vouchers Table -->
    <section class="mb-6">
        <button
            type="button"
            class="section-header w-full flex items-center justify-between bg-slate-50 p-3 border border-slate-200" 
            on:click={() => toggleSection('unsoldVouchers')}
        >
            <div class="flex items-center gap-2">
                <Catalog size={20} class="text-emerald-500" />
                <h2 class="text-lg font-semibold text-slate-700">Unsold Vouchers</h2>
            </div>
            <div class="text-slate-400">
                {expandedSections.unsoldVouchers ? '−' : '+'}
            </div>
        </button>
        
        {#if expandedSections.unsoldVouchers}
            <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
                <p class="text-sm text-slate-600 mb-4">
                    The following table shows all PRV vouchers that have been awarded but not yet sold or transacted.
                    Click on any row to view detailed information about the drug candidate.
                </p>
                
                <div class="min-w-full">
                    <UnsoldVouchersTable 
                        data={data} 
                        year={isAllYearView ? "" : data[0]?.["PRV Year"] || ""}
                        {onEntrySelect}
                    />
                </div>
            </div>
        {/if}
    </section>
</div>

<style>
    .section-content {
        max-height: 2000px;
        overflow: hidden;
    }
    
    .section-header {
        transition: background-color 0.2s ease;
    }
    
    .section-header:hover {
        background-color: #f1f5f9;
    }
    
    .chart-container {
        display: block;
        width: 100%;
    }
</style> 
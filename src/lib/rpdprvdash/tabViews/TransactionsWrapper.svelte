<!-- TransactionsWrapper.svelte -->
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import PRVValueTimeline from '../Overview/PRVValueTimeline.svelte';
    import PRVAwardCount from '../Overview/PRVAwardCount.svelte';
    import TherapeuticAreaDistribution from '../Overview/TherapeuticAreaDistribution.svelte';
    import CompanyLeaderboard from '../Overview/CompanyLeaderboard.svelte';
    import UnsoldVouchersTable from '../Overview/UnsoldVouchersTable.svelte';
    import { Money, CicsTransactionServerZos, Catalog, ChartParallel } from 'carbon-icons-svelte';
    import { hasPRVAward } from '../utils/data-processing-utils';
    import SellerBuyerChord from '../TransactionChord.svelte';
    import VoucherBeeswarmPlot from '../VoucherBeeswarmPlot.svelte';
    import RPDTransactionSummaryView from '../sidebarComponents/RPDTransactionsSummary.svelte';
    import MobileTransactionSidebar from '../sidebarComponents/MobileTransactionSidebar.svelte';
    import RpdprvSearch from '../RPDPRVSearch.svelte';
    import { Separator } from 'bits-ui';
    import { fade, fly, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
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
    export let onEntrySelect = (entry: DataEntry) => {};
    export let stockData: any[] = [];
    export let selectedTransactionYear: string = "All";
    
    const dispatch = createEventDispatcher();
    
    // Add internal tab state
    let activeTransactionTab: string = 'transaction-flow';
    let previousTab: string = activeTransactionTab;
    
    // Animation direction (1 for left-to-right, -1 for right-to-left)
    let animationDirection = 1;
    
    // Transaction data
    let highlightedTransaction: { seller: string, buyer: string } | null = null;
    
    // UI state
    let isRightSidebarCollapsed = false;
    let isMobileView = false;
    let isMobileSidebarExpanded = false;
    
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
    
    function toggleSection(section: keyof typeof expandedSections) {
        expandedSections[section] = !expandedSections[section];
    }
    
    function setActiveTransactionTab(tab: string) {
        if (tab === activeTransactionTab) return;
        
        // Determine animation direction based on tab order
        const tabOrder = ['transaction-flow', 'transaction-analytics'];
        const currentIndex = tabOrder.indexOf(activeTransactionTab);
        const newIndex = tabOrder.indexOf(tab);
        
        animationDirection = newIndex > currentIndex ? 1 : -1;
        previousTab = activeTransactionTab;
        activeTransactionTab = tab;
    }
    
    function toggleRightSidebar() {
        isRightSidebarCollapsed = !isRightSidebarCollapsed;
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
    
    $: if (data) {
        calculateStats();
    }
    
    onMount(() => {
        if (data) {
            calculateStats();
        }
        
        // Check if we're in mobile view
        const checkMobileView = () => {
            isMobileView = window.innerWidth < 768; // 768px is the md breakpoint in Tailwind
        };
        
        // Initial check
        checkMobileView();
        
        // Add resize listener
        window.addEventListener('resize', checkMobileView);
        
        // Clean up on component destruction
        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    });

    // Extract owners of unsold vouchers
    $: unsoldVouchers = data.filter(d => d.Purchased !== "Y");
    $: unsoldVoucherOwners = new Set(unsoldVouchers.map(d => d.Company));

    // Calculate the number of unsold vouchers for each company
    $: unsoldVoucherCounts = Array.from(unsoldVoucherOwners).map(owner => {
        const count = unsoldVouchers.filter(v => v.Company === owner).length;
        return { owner, count };
    });
    
    // Handle transaction hover events
    function handleTransactionHover(event: CustomEvent) {
        highlightedTransaction = event.detail;
    }
    
    function handleTransactionLeave() {
        highlightedTransaction = null;
    }
    
    // This function is already passed from the parent
    function handlePointClick(entry: DataEntry) {
        onEntrySelect(entry);
    }
    
    function handleShowCompanyDetail(detail: any) {
        // Pass it up to the parent component
        // In a real implementation, this would be properly handled
        console.log("Show company detail:", detail);
    }

    // Update this to dispatch events when year changes
    function handleYearChange(year: string) {
        dispatch('yearSelect', year);
    }
</script>

<div class="transactions-wrapper pl-4 pr-2 pt-2 md:px-8 md:pt-8 h-full overflow-y-auto">
    <div class="intro-section mb-6">
        <h2 class="text-2xl font-bold text-slate-800 mb-2">PRV Transactions</h2>
        <p class="text-slate-600 mb-4">
            Explore the transaction history, value trends, and market activity of Priority Review Vouchers.
            This view focuses on the monetary aspects and market dynamics of the PRV program.
        </p>
        
        <!-- Transaction Tab Navigation -->
        <div class="transaction-tabs flex mb-6 border-b border-slate-200">
            <button 
                class="tab-button px-4 py-2 mr-2 {activeTransactionTab === 'transaction-flow' ? 'bg-slate-100 border-b-2 border-blue-500 font-medium' : 'hover:bg-slate-50'}"
                on:click={() => setActiveTransactionTab('transaction-flow')}
            >
                <div class="flex items-center">
                    <ChartParallel size={16} class="mr-2 text-blue-500" />
                    <span>Transaction Flow</span>
                </div>
            </button>
            <button 
                class="tab-button px-4 py-2 mr-2 {activeTransactionTab === 'transaction-analytics' ? 'bg-slate-100 border-b-2 border-green-500 font-medium' : 'hover:bg-slate-50'}"
                on:click={() => setActiveTransactionTab('transaction-analytics')}
            >
                <div class="flex items-center">
                    <Money size={16} class="mr-2 text-green-500" />
                    <span>Transaction Analytics</span>
                </div>
            </button>
        </div>
    </div>

    <div class="transaction-content relative h-[calc(100%-140px)]">
        <!-- Transaction Flow Tab (Chord Diagram and Sidebar) -->
        {#if activeTransactionTab === 'transaction-flow'}
            <div 
                class="transaction-flow-tab relative h-full"
                in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
                out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
            >
                <!-- Chord diagram section with original sidebar layout -->
                <div class="flex-1 relative h-full {!isMobileView ? (isRightSidebarCollapsed ? 'pr-16' : 'pr-[30%]') : ''} transition-all duration-300 ease-in-out">
                    <SellerBuyerChord 
                        data={data}
                        {stockData}
                        selectedYear={selectedTransactionYear}
                        {highlightedTransaction}
                        onShowDrugDetail={onEntrySelect}
                        on:transactionHover={handleTransactionHover}
                        on:transactionLeave={handleTransactionLeave}
                        on:yearSelect={(e) => handleYearChange(e.detail)}
                    />
                </div>
                
                <!-- Desktop sidebar - only show on non-mobile -->
                {#if !isMobileView}
                    <div class="absolute right-2 top-4 {isRightSidebarCollapsed ? 'w-2' : 'w-2/6'} h-full transition-all duration-300">
                        <button
                            class="rounded-btn absolute -left-4 top-4 z-50 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full shadow-md transition-colors duration-200"
                            on:click={toggleRightSidebar}
                            title={isRightSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <svg
                                class="w-4 h-4 transform transition-transform duration-200 {isRightSidebarCollapsed ? 'rotate-180' : ''}"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>

                        <div class="{isRightSidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'} transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg rounded-l-lg p-6 flex flex-col h-full max-h-[calc(100vh-10rem)]">
                            <!-- Transaction content -->
                            <div class="flex-1 flex flex-col gap-4 overflow-y-auto">
                                <p class="text-xs text-slate-500 mt-4 text-left">
                                    Select transactions in the chord diagram to see details
                                </p>
                                <div class="rounded-lg shadow-sm p-4">
                                    <div class="h-[20vh]">
                                        <VoucherBeeswarmPlot 
                                            data={data}
                                            {highlightedTransaction}
                                            selectedYear={selectedTransactionYear}
                                            onPointClick={handlePointClick}
                                            on:transactionHover={handleTransactionHover}
                                            on:transactionLeave={handleTransactionLeave}
                                            on:yearSelect={(e) => handleYearChange(e.detail)}
                                        />
                                    </div>
                                </div>
                                <div class="pt-4">
                                    <RPDTransactionSummaryView 
                                        data={data}
                                        year={selectedTransactionYear}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
                
                <!-- Mobile bottom sidebar -->
                {#if isMobileView}
                    <MobileTransactionSidebar
                        data={data}
                        selectedYear={selectedTransactionYear}
                        {highlightedTransaction}
                        onPointClick={handlePointClick}
                        isExpanded={isMobileSidebarExpanded}
                        on:click={() => isMobileSidebarExpanded = !isMobileSidebarExpanded}
                        on:transactionHover={handleTransactionHover}
                        on:transactionLeave={handleTransactionLeave}
                        on:yearSelect={(e) => handleYearChange(e.detail)}
                    >
                        {#if isMobileSidebarExpanded}
                            <div class="mb-4 px-4 pt-4">
                                <RpdprvSearch
                                    data={data}
                                    onShowDrugDetail={onEntrySelect}
                                    onShowCompanyDetail={handleShowCompanyDetail}
                                />
                            </div>
                        {/if}
                    </MobileTransactionSidebar>
                {/if}
            </div>
        
        <!-- Transaction Analytics Tab (Value Trends, Top Performers, Unsold Vouchers) -->
        {:else if activeTransactionTab === 'transaction-analytics'}
            <div 
                class="transaction-analytics-tab h-full overflow-y-auto"
                in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
                out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
            >
                <!-- Section 1: PRV Value Trends -->
                <section class="mb-6">
                    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border border-slate-200" 
                         on:click={() => toggleSection('valueTrends')}>
                        <div class="flex items-center gap-2">
                            <Money size={20} class="text-green-500" />
                            <h2 class="text-lg font-semibold text-slate-700">Value & Distribution Trends</h2>
                        </div>
                        <div class="text-slate-400">
                            {expandedSections.valueTrends ? '−' : '+'}
                        </div>
                    </div>
                    
                    {#if expandedSections.valueTrends}
                        <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- PRV Value Timeline -->
                                <div class="p-4 border border-slate-200">
                                    <h3 class="text-base font-semibold text-slate-700 mb-3">PRV Value Timeline</h3>
                                    <PRVValueTimeline {data} />
                                    <p class="text-sm text-slate-500 mt-3">PRV values have ranged from $68M to $350M since program inception, with recent stabilization around $110M.</p>
                                </div>
                                
                                <!-- PRV Award Count by Year -->
                                <div class="p-4 border border-slate-200">
                                    <h3 class="text-base font-semibold text-slate-700 mb-3">PRV Awards by Year</h3>
                                    <PRVAwardCount yearlyData={yearlyPRVs} />
                                    <p class="text-sm text-slate-500 mt-3">The number of PRVs awarded has increased in recent years, with {yearlyPRVs[yearlyPRVs.length-1]?.count || 0} vouchers in {yearlyPRVs[yearlyPRVs.length-1]?.year || 'the latest year'}.</p>
                                </div>
                                
                                <!-- Total PRV Value -->
                                <div class="p-4 border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50">
                                    <h3 class="text-base font-semibold text-slate-700 mb-2">Total PRV Sales Value</h3>
                                    <p class="text-5xl font-bold text-blue-600 text-center my-4">${totalValue.toLocaleString()}M</p>
                                    <p class="text-sm text-slate-500 text-center">Cumulative value of sold PRVs to date</p>
                                </div>
                                
                                <!-- Therapeutic Area Distribution -->
                                <div class="p-4 border border-slate-200">
                                    <h3 class="text-base font-semibold text-slate-700 mb-3">Therapeutic Area Distribution</h3>
                                    <TherapeuticAreaDistribution {data} />
                                    <p class="text-sm text-slate-500 mt-3">Therapeutic areas with the most PRVs awarded include neuromuscular disorders, metabolic diseases, and rare cancers.</p>
                                </div>
                            </div>
                        </div>
                    {/if}
                </section>
                
                <!-- Section 2: Top Performers -->
                <section class="mb-6">
                    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border border-slate-200" 
                         on:click={() => toggleSection('topPerformers')}>
                        <div class="flex items-center gap-2">
                            <CicsTransactionServerZos size={20} class="text-amber-500" />
                            <h2 class="text-lg font-semibold text-slate-700">Program Leaders</h2>
                        </div>
                        <div class="text-slate-400">
                            {expandedSections.topPerformers ? '−' : '+'}
                        </div>
                    </div>
                    
                    {#if expandedSections.topPerformers}
                        <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
                            <div class="mb-4">
                                <CompanyLeaderboard {data} />
                            </div>
                        </div>
                    {/if}
                </section>
                
                <!-- Section 3: Unsold Vouchers Table -->
                <section class="mb-6">
                    <div class="section-header flex items-center justify-between cursor-pointer bg-slate-50 p-3 border border-slate-200" 
                         on:click={() => toggleSection('unsoldVouchers')}>
                        <div class="flex items-center gap-2">
                            <Catalog size={20} class="text-emerald-500" />
                            <h2 class="text-lg font-semibold text-slate-700">Unsold Vouchers</h2>
                        </div>
                        <div class="text-slate-400">
                            {expandedSections.unsoldVouchers ? '−' : '+'}
                        </div>
                    </div>
                    
                    {#if expandedSections.unsoldVouchers}
                        <div class="section-content bg-white p-4 shadow-sm border-x border-b border-slate-200 transition-all duration-300">
                            <p class="text-sm text-slate-600 mb-4">
                                The following table shows all PRV vouchers that have been awarded but not yet sold or transacted.
                                Click on any row to view detailed information about the drug candidate.
                            </p>
                            
                            <UnsoldVouchersTable 
                                data={data} 
                                year={isAllYearView ? "" : data[0]?.["PRV Year"] || ""}
                                {onEntrySelect}
                            />
                        </div>
                    {/if}
                </section>
            </div>
        {/if}
    </div>

    <Separator.Root
        class="bg-slate-500 mt-10 mb-2 shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-[1px]"
    />
    <footer class="flex flex-row justify-between gap-2 py-2">
        <p class="text-2xs font-mono">Priority Review Voucher Transaction Analysis</p>
        <p class="text-2xs font-mono">Data updated through {new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long'})}</p>
    </footer>
</div>

<style>
    .transactions-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
    
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
    
    .tab-button {
        transition: all 0.2s ease;
    }
    
    .rounded-btn {
        border: 1px solid #549E7D;
    }
    
    .transaction-content {
        position: relative;
        min-height: 500px;
    }
    
    /* Ensure tab content fills the container */
    .transaction-flow-tab,
    .transaction-analytics-tab {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }
    
    /* Mobile styles */
    @media (max-width: 768px) {
        .transaction-flow-tab {
            height: calc(100vh - 200px);
        }
    }
</style> 
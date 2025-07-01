<!-- TransactionsWrapper.svelte -->
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    
    import TransactionAnalytics from '../transactionsUI/TransactionAnalytics.svelte';
    import SareptaCaseStudyHtml from '../transactionsUI/SareptaCaseStudyHtml.svelte';
    import { Money, CicsTransactionServerZos, Catalog, ChevronRight, TextLinkAnalysis, Table, Calculator } from 'carbon-icons-svelte';
    import { hasPRVAward } from '../utils/data-processing-utils';
    import SellerBuyerChord from '../TransactionChord.svelte';
    import VoucherBeeswarmPlot from '../VoucherBeeswarmPlot.svelte';
    import RPDTransactionSummaryView from '../sidebarComponents/RPDTransactionsSummary.svelte';
    import MobileTransactionSidebar from '../sidebarComponents/MobileTransactionSidebar.svelte';
    import RpdprvSearch from '../RPDPRVSearch.svelte';
    import RPDDTableWrapper from './RPDDTableWrapper.svelte';
    import PRVCalculatorWrapper from '../calculatorcomponents/PRVCalculatorWrapper.svelte';
    import { fade, fly, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { Tabs } from 'bits-ui';
    
    // Combined DataEntry interface that covers all component needs
    interface DataEntry {
        Company: string;
        Candidate?: string;
        TherapeuticArea1?: string;
        Indication?: string;
        "Current Development Stage"?: string;
        "PRV Year"?: string;
        "Purchase Year"?: string;
        Purchased?: string;
        Purchaser?: string;
        "Sale Price (USD Millions)"?: string;
        MarketCap?: string;
        effectiveStage?: string;
        "RPDD Year"?: string;
        "RPDD Date"?: string;
        "PRV Date"?: string;
        "Commercial stage"?: string;
        "PRV Status"?: string;
        "Approved Drug"?: string;
        "COUNTRY"?: string;
        "Current Study"?: string;
        "CurrentStudyStatus"?: string;
        "EstimatedStudyCompletion"?: string;
        LastFundraise?: string;
        FundraiseDate?: string;
        LastStatusUpdate?: string;
        [key: string]: any; // Allow for any additional properties
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
    
    // Filter state for RPDDFilteredTable
    let filterYear = "2020";
    let filterPRVStatus = "non-awarded";
    
    // Add reference to TransactionAnalytics component
    let transactionAnalyticsComponent: TransactionAnalytics;
    
    // Function signature matches the bits-ui Tabs expected type
    function handleTabChange(value: string | undefined) {
        if (!value || value === activeTransactionTab) return;
        
        // Determine animation direction based on tab order
        const tabOrder = ['transaction-flow', 'transaction-analytics', 'case-studies', 'rpdd-table', 'prv-calculator'];
        const currentIndex = tabOrder.indexOf(activeTransactionTab);
        const newIndex = tabOrder.indexOf(value);
        
        animationDirection = newIndex > currentIndex ? 1 : -1;
        previousTab = activeTransactionTab;
        activeTransactionTab = value;
        
        // If switching to the analytics tab, force redraw charts after transition
        if (value === 'transaction-analytics') {
            setTimeout(() => {
                if (transactionAnalyticsComponent && transactionAnalyticsComponent.forceRedrawCharts) {
                    transactionAnalyticsComponent.forceRedrawCharts();
                }
            }, 500); // Wait for transition to complete
        }
    }
    
    function toggleRightSidebar() {
        isRightSidebarCollapsed = !isRightSidebarCollapsed;
    }
    
    onMount(() => {
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

<div class="transactions-wrapper grid grid-cols-1 md:grid-cols-2 h-full overflow-y-auto pt-8 md:pt-20">
    <!-- <TransactionsIntroduction /> -->
    
    <!-- Transaction Tab Navigation using bits-ui -->

    <Tabs.Root 
        value={activeTransactionTab}
        onValueChange={handleTabChange}
        class="shadow-mini-inset dark:bg-background w-full flex flex-col gap-1 justify-evenly place-content-center p-1 text-sm font-medium dark:border dark:border-neutral-600/30"
    >
        <Tabs.List
            class="flex rounded-md shadow-mini-inset dark:bg-background flex-row place-content-start mx-8 mb-8 w-fit gap-1 p-1 text-sm font-medium leading-5 bg-slate-200"
        >
            <Tabs.Trigger
                value="transaction-flow"
                class="data-[state=active]:shadow-sm flex flex-row dark:data-[state=active]:bg-muted h-8 rounded-sm hover:bg-slate-100  data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 align-middle justify-center place-content-center px-4 place-items-center"
            >
                <CicsTransactionServerZos class="mr-2 md:mr-4 w-3 h-3 md:w-4 md:h-4 align" />
                <span class="text-2xs md:text-xs lg:text-sm font-medium">Transaction Network</span>
            </Tabs.Trigger>
            
            <Tabs.Trigger
                value="transaction-analytics"
                class="data-[state=active]:shadow-mini flex flex-row dark:data-[state=active]:bg-muted h-8 rounded-sm hover:bg-slate-100  data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 align-middle justify-center place-content-center px-4 place-items-center"
            >
                <Money class="mr-2 md:mr-4 w-3 h-3 md:w-4 md:h-4 align" />
                <span class="text-2xs md:text-xs lg:text-sm">Transaction Analytics</span>
            </Tabs.Trigger>
            
            <Tabs.Trigger
                value="rpdd-table"
                class="data-[state=active]:shadow-mini flex flex-row dark:data-[state=active]:bg-muted h-8 rounded-sm hover:bg-slate-100  data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 align-middle justify-center place-content-center px-4 place-items-center"
            >
                <Table class="mr-2 md:mr-4 w-3 h-3 md:w-4 md:h-4 align" />
                <span class="text-2xs md:text-xs lg:text-sm">Company Navigator</span>
            </Tabs.Trigger>
            
            <Tabs.Trigger
                value="case-studies"
                class="data-[state=active]:shadow-mini flex flex-row dark:data-[state=active]:bg-muted h-8 rounded-sm hover:bg-slate-100  data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 align-middle justify-center place-content-center px-4 place-items-center"
            >
                <TextLinkAnalysis class="mr-2 md:mr-4 w-3 h-3 md:w-4 md:h-4 align" />
                <span class="text-2xs md:text-xs lg:text-sm font-medium">Case Studies</span>
            </Tabs.Trigger>

            <Tabs.Trigger
                value="prv-calculator"
                class="data-[state=active]:shadow-mini flex flex-row dark:data-[state=active]:bg-muted h-8 rounded-sm hover:bg-slate-100  data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50 align-middle justify-center place-content-center px-4 place-items-center"
            >
                <Calculator class="mr-2 md:mr-4 w-3 h-3 md:w-4 md:h-4 align" />
                <span class="text-2xs md:text-xs lg:text-sm font-medium">PRV Calculator</span>
            </Tabs.Trigger>
        </Tabs.List>

        <div class="transaction-content flex flex-col relative h-full">
            <!-- Transaction Flow Tab (Chord Diagram and Sidebar) -->
            <Tabs.Content value="transaction-flow" class="select-none bg-stone-100">
                <div 
                    class="transaction-flow-tab relative h-full md:h-[calc(100vh-140px)]"
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
                        <div 
                            class="absolute top-0 right-0 h-full bg-white border-l border-slate-200 transition-all duration-300 ease-in-out {isRightSidebarCollapsed ? 'w-16 opacity-70 hover:opacity-100' : 'w-[30%]'}"
                        >
                            <!-- Toggle button -->
                            <button 
                                class="absolute top-4 left-2 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full p-1"
                                on:click={toggleRightSidebar}
                                title={isRightSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                <ChevronRight size={16} class="transform {isRightSidebarCollapsed ? '' : 'rotate-180'}" />
                            </button>
                            
                            {#if !isRightSidebarCollapsed}
                                <!-- Search component -->
                                <div class="p-4 pt-12">
                                    <RpdprvSearch
                                        data={data}
                                        onShowDrugDetail={onEntrySelect}
                                        onShowCompanyDetail={handleShowCompanyDetail}
                                    />
                                </div>
                                
                                <!-- Transaction Summary -->
                                <div class="px-4 pb-4">
                                    <RPDTransactionSummaryView
                                        {data}
                                        year={selectedTransactionYear}
                                        on:transactionHover={handleTransactionHover}
                                        on:transactionLeave={handleTransactionLeave}
                                        on:yearSelect={(e) => handleYearChange(e.detail)}
                                    />
                                </div>
                            {/if}
                        </div>
                    {/if}
                    
                    <!-- Mobile sidebar - only show on mobile -->
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
            </Tabs.Content>
        
            <!-- Transaction Analytics Tab -->
            <Tabs.Content value="transaction-analytics" class="select-none justify-stretch">
                <div 
                    in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
                    out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
                >
                    <TransactionAnalytics 
                        bind:this={transactionAnalyticsComponent}
                        {data} 
                        {isAllYearView} 
                        {onEntrySelect} 
                    />
                </div>
            </Tabs.Content>
            
            <!-- RPDD Filtered Table Tab -->
            <Tabs.Content value="rpdd-table" class="select-none">
                <div 
                    in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
                    out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
                    class="px-4 py-6"
                >
                    <RPDDTableWrapper 
                        {data}
                        {filterYear}
                        {filterPRVStatus}
                        title="Target Company Navigator"
                        {onEntrySelect}
                        {stockData}
                    />
                </div>
            </Tabs.Content>
            
            <!-- Case Studies Tab -->
            <Tabs.Content value="case-studies" class="select-none">
                <div 
                    in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
                    out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
                >
                    <SareptaCaseStudyHtml />
                </div>
            </Tabs.Content>

            <!-- PRV Calculator Tab -->
            <Tabs.Content value="prv-calculator" class="select-none">
                <div 
                    in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
                    out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
                    class="relative h-[calc(100vh-200px)] overflow-y-auto"
                >
                    <PRVCalculatorWrapper />
                </div>
            </Tabs.Content>
        </div>
    </Tabs.Root>
</div>


<style>
    .transactions-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
    
    .rounded-btn {
        border: 1px solid #549E7D;
    }
    
    .transaction-content {
        position: relative;
        min-height: 500px;
    }
    
    /* Ensure tab content fills the container */
    .transaction-flow-tab {
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
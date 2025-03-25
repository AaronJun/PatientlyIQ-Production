<!-- TransactionsWrapper.svelte -->
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import TransactionsIntroduction from '../transactionsUI/TransactionsIntroduction.svelte';
    import TransactionAnalytics from '../transactionsUI/TransactionAnalytics.svelte';
    import SareptaCaseStudyHtml from '../transactionsUI/SareptaCaseStudyHtml.svelte';
    import { Money, CicsTransactionServerZos, Catalog, ChevronRight, TextLinkAnalysis } from 'carbon-icons-svelte';
    import { hasPRVAward } from '../utils/data-processing-utils';
    import SellerBuyerChord from '../TransactionChord.svelte';
    import VoucherBeeswarmPlot from '../VoucherBeeswarmPlot.svelte';
    import RPDTransactionSummaryView from '../sidebarComponents/RPDTransactionsSummary.svelte';
    import MobileTransactionSidebar from '../sidebarComponents/MobileTransactionSidebar.svelte';
    import RpdprvSearch from '../RPDPRVSearch.svelte';
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
    
    function setActiveTransactionTab(tab: string) {
        if (tab === activeTransactionTab) return;
        
        // Determine animation direction based on tab order
        const tabOrder = ['transaction-flow', 'transaction-analytics', 'case-studies'];
        const currentIndex = tabOrder.indexOf(activeTransactionTab);
        const newIndex = tabOrder.indexOf(tab);
        
        animationDirection = newIndex > currentIndex ? 1 : -1;
        previousTab = activeTransactionTab;
        activeTransactionTab = tab;
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

<div class="transactions-wrapper h-full overflow-y-auto">
    <TransactionsIntroduction />
        <!-- Transaction Tab Navigation -->
        <div class="transaction-tabs bg-slate-800 flex flex-row w-full justify-start text-left">
            <button 
                class="tab-button border-l-6 border-slate-400 px-2 py-1 md:py-4 w-1/3 hover:bg-slate-300 hover:text-slate-500 {activeTransactionTab === 'transaction-flow' ? 'w-4/5   bg-slate-600 border-l-8 border-emerald-400 font-semibold text-slate-50  shadow-sm' : 'text-slate-400 bg-slate-200 shadow-sm'}"
                on:click={() => setActiveTransactionTab('transaction-flow')}
            >   

            <div class="flex flex-row items-start align-middle gap-2">
                <CicsTransactionServerZos class="md:mr-4 w-4 h-4 md:w-6 md:h-6" />
                    <span class="text-2xs md:text-xs lg:text-sm align-middle font-semibold">Transaction Network</span>   
            </div>
            </button>
            <button 
                class="tab-button border-l-6 border-slate-400 px-4 py-1 md:py-4 w-2/5 hover:bg-slate-300 hover:text-slate-500 {activeTransactionTab === 'transaction-analytics' ? 'bg-slate-600 border-l-8 border-emerald-400 font-medium text-slate-50 w-4/5 shadow-sm' : 'text-slate-400 bg-slate-200 shadow-sm'}"  
                on:click={() => setActiveTransactionTab('transaction-analytics')}
            >
                <div class="flex flex-row items-start align-middle gap-1">
                    <Money class="mr-2 w-4 h-4 md:w-6 md:h-6" />
                    <span class="text-2xs md:text-xs lg:text-sm">Transaction Analytics</span>
                </div>
            </button>
            <button 
            class="tab-button border-l-6 border-slate-400 px-4 py-1 md:py-4 w-2/5 hover:bg-slate-300 hover:text-slate-500 {activeTransactionTab === 'case-studies' ? 'bg-slate-600 border-l-8 border-emerald-400 font-semibold text-slate-50 w-4/5 shadow-sm' : 'text-slate-400 bg-slate-200 shadow-sm'}"  
            on:click={() => setActiveTransactionTab('case-studies')}
        >
            <div class="flex flex-row items-start align-middle gap-1">
                <TextLinkAnalysis class="mr-2 w-4 h-4 md:w-6 md:h-6" />
                <span class="text-2xs md:text-xs lg:text-sm font-semibold">Case Studies</span>
            </div>
        </button>
            </div>
            
    <div class="transaction-content relative h-full">
        <!-- Transaction Flow Tab (Chord Diagram and Sidebar) -->
        {#if activeTransactionTab === 'transaction-flow'}
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
                    <div class="absolute right-2 top-24 {isRightSidebarCollapsed ? 'w-2' : 'w-2/6'} h-[calc(74vh-2rem)] transition-all duration-300">
                        <button
                            class="nav-button absolute -left-4 top-4 z-50 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full shadow-md transition-colors duration-200"
                            on:click={toggleRightSidebar}
                            title={isRightSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                        <ChevronRight class="w-4 h-4 transform transition-transform duration-200 {isRightSidebarCollapsed ? 'rotate-180' : ''}" />
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
        
        <!-- Transaction Analytics Tab -->
        {:else if activeTransactionTab === 'transaction-analytics'}
            <div 
                in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
                out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
            >
                <TransactionAnalytics 
                    {data} 
                    {isAllYearView} 
                    {onEntrySelect} 
                />
            </div>
        <!-- Case Studies Tab -->
        {:else if activeTransactionTab === 'case-studies'}
            <div 
                in:fly={{ x: animationDirection * 300, duration: 400, opacity: 0.1, easing: quintOut }}
                out:fly={{ x: -1 * animationDirection * 300, duration: 400, opacity: 0, easing: quintOut }}
            >
                <SareptaCaseStudyHtml />
            </div>
        {/if}
    </div>
</div>

<style>
    .transactions-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
    
    .tab-button {
        transition: all 0.2s ease;
        text-align: left;
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
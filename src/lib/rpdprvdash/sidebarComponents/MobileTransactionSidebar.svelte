<!-- MobileTransactionSidebar.svelte -->
<script lang="ts">
    import RPDTransactionSummaryView from './RPDTransactionsSummary.svelte';
    import VoucherBeeswarmPlot from '../VoucherBeeswarmPlot.svelte';
    import { ChevronUp } from 'carbon-icons-svelte';
    
    export let data: any[] = [];
    export let selectedYear: string = "";
    export let highlightedTransaction: { seller: string, buyer: string } | null = null;
    export let onPointClick = (details: any) => {};
    export let isExpanded: boolean = false;
    
    // Event handlers for transaction hover/leave
    function handleTransactionHover(event: CustomEvent) {
      const detail = event.detail;
      dispatch('transactionHover', detail);
    }
    
    function handleTransactionLeave() {
      dispatch('transactionLeave');
    }
    
    // Create a dispatcher for events
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

<div class="mobile-sidebar fixed bottom-12 left-0 right-0 bg-slate-100 border-t-2 border-slate-800 shadow-lg transition-transform duration-300 transform {isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'}">
  <!-- Handle to expand/collapse -->
  <div 
    class="handle flex justify-center items-center h-14 cursor-pointer border-t-2 border-slate-800 bg-slate-100"
    on:click={() => isExpanded = !isExpanded}
  >
  
    <div class="absolute right-4 bg-emerald-400 rounded-full p-1 ring-2 ring-emerald-400 ring-offset-2">
      <ChevronUp 
        size={20} 
        class="text-slate-500 transform transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}"
      />
    </div>
    <div class="absolute left-4 text-sm font-base text-slate-600">
      {highlightedTransaction ? 'Transaction Details' : 'View Details'}
    
    </div>
  </div>
  
  <!-- Content area -->
  <div class="content overflow-y-auto">
    <div>
      <!-- Slot for additional content like search -->
      <slot></slot>
      <div class="flex flex-col gap-4">
        <div class="rounded-lg shadow-sm p-4 mt-2 h-[14.25vh]">
          <VoucherBeeswarmPlot 
            data={data}
            {highlightedTransaction}
            selectedYear={selectedYear}
            onPointClick={onPointClick}
            on:transactionHover={handleTransactionHover}
            on:transactionLeave={handleTransactionLeave}
          />
        </div>
        <div class="rounded-lg shadow-sm p-4">
          <RPDTransactionSummaryView 
            data={data}
            year={selectedYear}
          />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Tablet-specific styles */
  @media (max-width: 768px) {
    .mobile-sidebar {
      border-radius: 1rem;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      max-height: 70vh;
      z-index: 1200;
    }
    
    .content {
      max-height: 70vh;
      overflow-y: scroll;
    }
  }
  
  .handle {
    position: relative;
  }
  
  .content {
    scrollbar-color: #e5e7eb #f9fafb;
    scrollbar-width: thin;
  }
  
  .content::-webkit-scrollbar {
    width: 4px;
  }
  
  .content::-webkit-scrollbar-track {
    background: #f9fafb;
  }
  
  .content::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 4px;
  }
</style> 
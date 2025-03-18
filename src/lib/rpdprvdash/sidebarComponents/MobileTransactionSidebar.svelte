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

<div class="mobile-sidebar fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl transition-transform duration-300 transform {isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'}">
  <!-- Handle to expand/collapse -->
  <div 
    class="handle flex justify-center items-center h-14 cursor-pointer bg-white rounded-t-xl border-t border-x border-slate-200"
    on:click={() => isExpanded = !isExpanded}
  >
    <div class="w-16 h-1 bg-slate-300 rounded-full mb-2"></div>
    <div class="absolute right-4">
      <ChevronUp 
        size={20} 
        class="text-slate-500 transform transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}"
      />
    </div>
    <div class="absolute left-4 text-sm font-medium text-slate-700">
      {highlightedTransaction ? 'Transaction Details' : 'Transaction Overview'}
    </div>
  </div>
  
  <!-- Content area -->
  <div class="content overflow-y-auto bg-slate-50">
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
        <div class="bg-white rounded-lg shadow-sm p-4">
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
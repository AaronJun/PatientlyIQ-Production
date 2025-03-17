<!-- PRVTransactionsView.svelte -->
<script lang="ts">
  import PRVTransactionsChord from './TransactionChord.svelte';
</script>

<div class="transactions-container">
  <h2 class="text-2xl font-light text-slate-800 mb-4">PRV Market Transactions</h2>
  <p class="text-slate-600 mb-8 max-w-2xl">
      This chord diagram visualizes the network of Priority Review Voucher (PRV) transactions in the market. 
      The ribbons connect sellers to buyers, with the width and color intensity indicating the transaction value. 
      Hover over connections to see detailed transaction information.
  </p>
  
  <PRVTransactionsChord />
</div>

<style>
  .transactions-container {
      padding: 2rem;
  }
</style>
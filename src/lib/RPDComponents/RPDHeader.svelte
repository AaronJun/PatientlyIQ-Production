<script lang="ts">
  import 'carbon-components-svelte/css/all.css';
  import { Link } from "carbon-components-svelte";
  import { ChevronRight, ChevronLeft, ArrowUp, ArrowUpRight, ArrowDown, ArrowLeft, ArrowRight, Help} from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let activeView = 'year';

  function handleReadMore(event: MouseEvent) {
  event.preventDefault();
  console.log('Dispatching readMoreClick event');
  dispatch('readMoreClick');
}

</script>

<div class="flex flex-col justify-start pl-12 py-8 mt-8">
  <h1 class="capitalize font-light text-3xl mb-4 text-slate-600">Planting the seeds of rare disease research</h1>
  <p class="font-base">Measuring the impact of the <span class="font-base text-orange-600 font-medium">FDA's Rare Pediatric Disease Priority Review Voucher Program</span></p>
  <button 
    class="w-fit flex gap-8 pr-3 pl-4 py-3 mt-12 items-start align-middle justify-start rounded-full text-xs font-semibold text-gray-100 relative overflow-hidden group" 
    on:click={handleReadMore}
  >
    <div class="absolute inset-0 bg-[#ff1515] z-0"></div>
    <div class="absolute inset-0 bg-sky-800 -translate-x-full group-hover:translate-x-0 transition-transform duration-400 circ-in-out z-0"></div>
    <span class="relative z-10 flex items-center gap-4">
      Get the Details 
      <ArrowUpRight size={16} />
    </span>
  </button>
</div>

<style>
.rpd-header {
  border-bottom: 1px solid #e5e7eb;
  width: 100%;
}

.header-content {
  display: flex;
  padding: 2.25rem 0 1.25rem 0.25rem;
  align-items: left;
  justify-content: left;
}

.header-left {
  display: flex;
  align-items: left;
}

.title-section h1 {
  font-size: 1.25rem;
  font-weight: 400;
  color: #0c0c0c;
}

.title-section p {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}
</style>
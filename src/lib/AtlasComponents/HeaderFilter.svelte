<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import * as d3 from 'd3';
	import "carbon-components-svelte/css/all.css";

	export let selectedMetric: string;
	export let metrics: Array<{ value: string; label: string; higherIsBetter: boolean }>;
  
	const dispatch = createEventDispatcher();
  
	let buttonContainer: HTMLElement;
  
	function handleMetricClick(metric: { value: string; label: string }) {
	  selectedMetric = metric.value;
	  dispatch('change', { selectedMetric: metric.value });
	}
  
	onMount(() => {
	  if (metrics.length > 0) {
		const randomIndex = Math.floor(Math.random() * metrics.length);
		selectedMetric = metrics[randomIndex].value;
		dispatch('change', { selectedMetric: metrics[randomIndex].value });
	  }
  
	  // D3 selection for button hover effects
	  d3.selectAll('.metric-button')
		.on('mouseenter', function() {
		  d3.select(this)
			.transition()
			.duration(200)
		})
		.on('mouseleave', function() {
		  d3.select(this)
			.transition()
			.duration(200)
			.style('saturation', '.2')
		});
	});
  </script>
  
  <div class="filters-container bg-slate-50 bg-opacity-60">
	<div class="filter-row" bind:this={buttonContainer}>
	  <span class="filter-label">Compare by</span>
	  <div class="button-group">
		{#each metrics as metric}
		  <button
			class="metric-button"
			class:selected={selectedMetric === metric.value}
			on:click={() => handleMetricClick(metric)}
		  >
			{metric.label}
		  </button>
		{/each}
	  </div>
	</div>
  </div>
  
  <style>
	.filters-container {
	  @apply py-2 text-gray-900 font-extrabold flex justify-center;
	}
  
	.filter-row {
	  @apply flex items-center gap-4 flex-wrap justify-center;
	}
  
	.filter-label {
	  @apply text-sm font-normal;
	}
  
	.button-group {
	  @apply flex gap-1 flex-wrap justify-center;
	}
  
	.metric-button {
	  @apply px-4 py-2 text-xs font-medium rounded-full bg-slate-50 bg-opacity-35 border border-gray-900
		transition-colors duration-200 hover:bg-gray-200;
	}
  
	.metric-button.selected {
	  @apply bg-[#ff4a4a] text-white hover:bg-orange-500;
	}
  </style>
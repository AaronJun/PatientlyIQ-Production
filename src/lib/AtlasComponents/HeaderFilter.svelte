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
  
  <div class="filters-container flex-col items-center">
	<p class="filter-label mb-2 pl-2 pt-2">Compare by</p>
	<div class="filter-row" bind:this={buttonContainer}>
	  <div class="button-group w-full">
		{#each metrics as metric}
		  <button
			class="metric-button text-xs cursor-point shadow-sm shadow-border bg-slate-200 hover:bg-orange-500 duration-200"
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
  
	.filter-label {
	  @apply text-xs text-slate-500 font-normal;
	}
  
	.button-group {
	  @apply flex flex-wrap justify-start w-full;
	}
  
	.metric-button {
		border-top-right-radius: 7.25px;
		border-top-left-radius: 7.25px;
		padding: 0.525rem 1.125rem .625rem 1.125rem;
		font-size: 0.675rem;
		font-weight: 400;
		border: .25px solid #D6D3CF;
		border-bottom: 0px;
	}
  
	.metric-button.selected {
		border-top-left-radius: 8.25px;
		border-top-right-radius: 8.25px;
		padding: 0.625rem 1.25rem .75rem 1.25rem;
		background-color: #ff4a4a;
		color: white;
		font-size: 0.825rem;
		font-weight: 600;
		}
  </style>
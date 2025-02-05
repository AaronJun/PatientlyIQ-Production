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
  
  <div class="filters-container flex-col w-full items-stretch">
	<p class="filter-label font-mono tracking-wide uppercase text-[9.725px] leading-normal mb-2 pl-4">Compare by:</p>
	<div class="filter-row" bind:this={buttonContainer}>
	  <div class="button-group">
		{#each metrics as metric}
		  <button
			class="metric-button font-mono text-sm uppercase tracking-wide text-slate-500 cursor-point hover:bg-orange-100 duration-200"
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
	border-left: 1px solid #666666;
	margin-left: 0.5rem;
	flex-direction: row;
	height: 100%;
	align-content: middle;
	justify-content: center
	}
  
	.button-group {
	  @apply flex flex-wrap justify-start w-[100vw];
	}
  
	.metric-button {
		padding: 0.125rem .7125rem .2725rem .7125rem;
		font-size: 0.675rem;
		font-weight: 400;
	}
  
	.metric-button.selected {
		padding: 0.625rem 1.25rem .75rem 1.25rem;
		background-color: #ffcbAA;
		border: .25px dotted #666666;
		color: #565656;	
		font-weight: 600;
		}

	.metric-button:hover {
		background-color: #fff;
		border: .25px dotted #666666;
		color: #666666;
		font-weight: 600;
	}
  </style>
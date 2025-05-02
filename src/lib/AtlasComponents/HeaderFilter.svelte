<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import * as d3 from 'd3';
	import "carbon-components-svelte/css/all.css";

	export let selectedMetric: string;
	export let metrics: Array<{ value: string; label: string; higherIsBetter: boolean }>;
  
	const dispatch = createEventDispatcher();
  
	let buttonContainer: HTMLElement;
	let scrollContainer: HTMLElement;
	let showLeftScroll = false;
	let showRightScroll = false;
  
	function handleMetricClick(metric: { value: string; label: string }) {
		selectedMetric = metric.value;
		dispatch('change', { selectedMetric: metric.value });
	}
  
	function scroll(direction: 'left' | 'right') {
		if (!scrollContainer) return;
		const scrollAmount = direction === 'left' ? -200 : 200;
		scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
	}

	function updateScrollButtons() {
		if (!scrollContainer) return;
		
		showLeftScroll = scrollContainer.scrollLeft > 10;
		showRightScroll = scrollContainer.scrollLeft < (scrollContainer.scrollWidth - scrollContainer.clientWidth - 10);
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
			
		// Check if scroll buttons should be shown
		if (scrollContainer) {
			updateScrollButtons();
			scrollContainer.addEventListener('scroll', updateScrollButtons);
			window.addEventListener('resize', updateScrollButtons);
		}
		
		return () => {
			if (scrollContainer) {
				scrollContainer.removeEventListener('scroll', updateScrollButtons);
				window.removeEventListener('resize', updateScrollButtons);
			}
		};
	});
</script>
  
<div class="filters-container">
	<div class="filter-row relative" bind:this={buttonContainer}>
		<p class="filter-label font-mono uppercase text-2xs text-slate-500 font-medium">Compare by:</p>
		{#if showLeftScroll}
			<button 
				class="scroll-button scroll-left" 
				on:click={() => scroll('left')}
				aria-label="Scroll left"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>
		{/if}
		
		<div class="scroll-container" bind:this={scrollContainer}>
			<div class="button-group">
				{#each metrics as metric}
					<button
						class="metric-button font-mono text-xs uppercase tracking-wide text-slate-500 cursor-pointer hover:bg-orange-50 duration-200 whitespace-nowrap"
						class:selected={selectedMetric === metric.value}
						on:click={() => handleMetricClick(metric)}
					>
						{metric.label}
					</button>
				{/each}
			</div>
		</div>
		
		{#if showRightScroll}
			<button 
				class="scroll-button scroll-right" 
				on:click={() => scroll('right')}
				aria-label="Scroll right"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		{/if}
	</div>
</div>
  
<style>
	.filters-container {
		width: 100%;
		padding: 0 0.5rem;
	}
	
	.filter-header {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
		border-left: 2px solid #e5e5e5;
		padding-left: 0.75rem;
	}
	
	.filter-label {
		letter-spacing: 0.05em;
	}
	
	.filter-row {
		position: relative;
		display: flex;
		align-items: center;
	}
	
	.scroll-container {
		flex: 1;
		overflow-x: auto;
		-ms-overflow-style: none;  /* IE and Edge */
		scrollbar-width: none;  /* Firefox */
		padding: 0.25rem 0;
	}
	
	/* Hide scrollbar for Chrome, Safari and Opera */
	.scroll-container::-webkit-scrollbar {
		display: none;
	}
  
	.button-group {
		display: flex;
		gap: 0.25rem;
		padding: 0 0.25rem;
		min-width: min-content;
	}
  
	.metric-button {
		padding: 0.4rem 0.6rem;
		font-size: 0.6rem;
		font-weight: 400;
		border: 0.5px solid #e5e5e5;
		border-radius: 0.25rem;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}
  
	.metric-button.selected {
		background-color: #ffcbAA;
		border: 0.5px solid #D99774;
		color: #804833;	
		font-weight: 600;
	}

	.metric-button:hover {
		background-color: #fff;
		border: 0.5px solid #D99774;
		color: #804833;
	}
	
	.scroll-button {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background-color: rgba(255, 255, 255, 0.9);
		border: 1px solid #e5e5e5;
		border-radius: 50%;
		color: #666;
		z-index: 5;
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}
	
	.scroll-button:hover {
		background-color: #f9f9f9;
		color: #333;
	}
	
	.scroll-left {
		left: 0;
	}
	
	.scroll-right {
		right: 0;
	}
	
	@media (min-width: 768px) {
		.scroll-container {
			overflow-x: visible;
		}
		
		.button-group {
			flex-wrap: wrap;
		}
	}
</style>
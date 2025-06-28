<script lang="ts">
	import { slide } from 'svelte/transition';

	export let items: Array<{
		id: string;
		title: string;
		content: any;
		color?: string;
		backgroundColor?: string;
		count?: number;
	}> = [];

	// Simple state management for open/closed items - using a Set for better performance
	let openItems = new Set<string>();

	function toggleItem(id: string, event: Event) {
		event.stopPropagation();
		event.preventDefault();
		
		console.log('Toggle clicked for ID:', id);
		console.log('Current open items:', Array.from(openItems));
		
		// Toggle the state
		if (openItems.has(id)) {
			openItems.delete(id);
		} else {	
			openItems.add(id);
		}
		
		console.log('New open items:', Array.from(openItems));
		
		// Force reactivity by reassigning the Set
		openItems = new Set(openItems);
	}

	function isOpen(id: string): boolean {
		const isOpenState = openItems.has(id);
		console.log(`Checking if ${id} is open:`, isOpenState);
		return isOpenState;
	}

	// Debug logging
	$: console.log('Accordion items received:', items);
	$: console.log('Open items state:', Array.from(openItems));
</script>

<div class="accordion-wrapper">
	{#each items as accordionItem}
		<div class="accordion-item">
			<button 
				class="accordion-trigger" 
				style="border-left-color: {accordionItem.color || '#d1d5db'};"
				on:click={(e) => toggleItem(accordionItem.id, e)}
			>
				<div class="trigger-content">
					<h5 class="category-header" style="color: {accordionItem.color || '#374151'};">
						{accordionItem.title}
						{#if accordionItem.count !== undefined}
							({accordionItem.count})
						{/if}
						<!-- Debug indicator -->
						<span style="font-size: 0.6rem; margin-left: 0.5rem;">
							{isOpen(accordionItem.id) ? '[OPEN]' : '[CLOSED]'}
						</span>
					</h5>
					<svg 
						class="accordion-chevron" 
						class:rotated={isOpen(accordionItem.id)}
						width="16" 
						height="16" 
						viewBox="0 0 24 24" 
						fill="none" 
						stroke="currentColor" 
						stroke-width="2"
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</div>
			</button>
			
			{#if isOpen(accordionItem.id)}
				<div 
					class="accordion-content" 
					transition:slide={{ duration: 200 }}
					style="background-color: {accordionItem.backgroundColor || '#f9fafb'};"
				>
					<slot name="content" item={accordionItem}>
						{accordionItem.content}
					</slot>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.accordion-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.accordion-item {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		background: #ffffff;
	}

	.accordion-trigger {
		width: 100%;
		background: transparent;
		border: none;
		border-left: 4px solid;
		padding: 0.75rem 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		text-align: left;
	}

	.accordion-trigger:hover {
		background: #f9fafb;
	}

	.accordion-trigger:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}

	.trigger-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.category-header {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0;
	}

	.accordion-chevron {
		transition: transform 0.2s;
		color: #6b7280;
		flex-shrink: 0;
	}

	.accordion-chevron.rotated {
		transform: rotate(180deg);
	}

	.accordion-content {
		border-top: 1px solid #e5e7eb;
		padding: 1rem;
	}
</style> 
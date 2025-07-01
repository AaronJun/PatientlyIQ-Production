<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let isOpen: boolean = false;
	export let title: string = '';
	export let width: string = '800px';
	export let showBackdrop: boolean = true;
	export let closeOnBackdropClick: boolean = true;
	export let closeOnEsc: boolean = true;

	const dispatch = createEventDispatcher();

	function closeDrawer() {
		dispatch('close');
	}

	function handleBackdropClick() {
		if (closeOnBackdropClick) {
			closeDrawer();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (closeOnEsc && event.key === 'Escape' && isOpen) {
			closeDrawer();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen || showBackdrop}
	<!-- Backdrop -->
	<div 
		class="drawer-backdrop" 
		class:visible={isOpen}
		on:click={handleBackdropClick}
		on:keydown={(e) => e.key === 'Enter' && handleBackdropClick()}
		role="button"
		tabindex="-1"
	></div>

	<!-- Drawer -->
	<div 
		class="drawer" 
		class:open={isOpen}
		style="width: {width};"
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'drawer-title' : undefined}
	>
		<!-- Header -->
		{#if title || $$slots.header}
			<div class="drawer-header">
				{#if $$slots.header}
					<slot name="header" />
				{:else if title}
					<h2 id="drawer-title" class="drawer-title">{title}</h2>
				{/if}
				<button 
					class="close-button" 
					on:click={closeDrawer}
					aria-label="Close drawer"
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
		{:else}
			<!-- Close button only -->
			<div class="drawer-close-only">
				<button 
					class="close-button" 
					on:click={closeDrawer}
					aria-label="Close drawer"
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
		{/if}

		<!-- Content -->
		<div class="drawer-content">
			<slot />
		</div>

		<!-- Footer -->
		{#if $$slots.footer}
			<div class="drawer-footer">
				<slot name="footer" />
			</div>
		{/if}
	</div>
{/if}

<style>
	.drawer-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.3s ease, visibility 0.3s ease;
		z-index: 998;
		cursor: pointer;
	}

	.drawer-backdrop.visible {
		opacity: 1;
		visibility: visible;
	}

	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		height: 100vh;
		background: white;
		min-width: 800px;
		box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
		transform: translateX(100%);
		transition: transform 0.3s ease;
		z-index: 999;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.drawer.open {
		transform: translateX(0);
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		flex-shrink: 0;
		background: #f9fafb;
	}

	.drawer-close-only {
		display: flex;
		justify-content: flex-end;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		flex-shrink: 0;
		background: #f9fafb;
	}

	.drawer-title {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
	}

	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		border-radius: 6px;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.close-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.drawer-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.drawer-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
		flex-shrink: 0;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.drawer {
			width: 100vw !important;
			max-width: none;
		}
		
		.drawer-content {
			padding: 1rem;
		}
		
		.drawer-header,
		.drawer-close-only,
		.drawer-footer {
			padding: 1rem;
		}
	}

	/* Smooth scrolling for content */
	.drawer-content {
		scroll-behavior: smooth;
	}

	/* Focus trap styles */
	.drawer:focus {
		outline: none;
	}
</style> 
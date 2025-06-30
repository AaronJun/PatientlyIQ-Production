<script lang="ts">
	import { X, Quotes } from 'phosphor-svelte';
	import { createEventDispatcher } from 'svelte';

	export let isOpen = false;
	export let selectedHurdle = '';
	export let quotes: Array<{quote: string, persona_descriptor: string}> = [];

	const dispatch = createEventDispatcher();

	function closeDrawer() {
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeDrawer();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closeDrawer();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div 
		class="drawer-overlay" 
		on:click={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="drawer-title"
	>
		<div class="drawer-content">
			<div class="drawer-header">
				<div class="header-content">
					<Quote size={24} class="header-icon" />
					<div class="header-text">
						<h3 id="drawer-title" class="drawer-title">Participant Voices</h3>
						<p class="drawer-subtitle">Real experiences with: <strong>{selectedHurdle}</strong></p>
					</div>
				</div>
				<button 
					class="close-button" 
					on:click={closeDrawer}
					aria-label="Close quotes drawer"
				>
					<X size={20} />
				</button>
			</div>

			<div class="drawer-body">
				{#if quotes.length > 0}
					<div class="quotes-container">
						{#each quotes as quoteData, index}
							<div class="quote-card">
								<div class="quote-content">
									<Quote size={16} class="quote-icon" />
									<blockquote class="quote-text">
										"{quoteData.quote}"
									</blockquote>
								</div>
								<div class="persona-info">
									<span class="persona-descriptor">{quoteData.persona_descriptor}</span>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<Quote size={48} class="empty-icon" />
						<p class="empty-text">No quotes available for this hurdle.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.drawer-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.drawer-content {
		background: white;
		border-radius: 12px;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		max-width: 800px;
		width: 100%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		background: #f8fafc;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.header-icon {
		color: #3b82f6;
		flex-shrink: 0;
	}

	.header-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.drawer-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.drawer-subtitle {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0;
	}

	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		background: #f1f5f9;
		border-radius: 6px;
		color: #64748b;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.close-button:hover {
		background: #e2e8f0;
		color: #1e293b;
	}

	.drawer-body {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.quotes-container {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.quote-card {
		background: #fefefe;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 1.5rem;
		transition: all 0.2s ease;
	}

	.quote-card:hover {
		border-color: #cbd5e1;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.quote-content {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.quote-icon {
		color: #3b82f6;
		flex-shrink: 0;
		margin-top: 0.25rem;
	}

	.quote-text {
		font-size: 1rem;
		line-height: 1.6;
		color: #1e293b;
		margin: 0;
		font-style: italic;
		flex: 1;
	}

	.persona-info {
		padding-left: 2rem;
	}

	.persona-descriptor {
		font-size: 0.875rem;
		color: #64748b;
		background: #f1f5f9;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		display: inline-block;
		font-weight: 500;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		text-align: center;
	}

	.empty-icon {
		color: #cbd5e1;
		margin-bottom: 1rem;
	}

	.empty-text {
		color: #64748b;
		font-size: 1rem;
		margin: 0;
	}

	@media (max-width: 768px) {
		.drawer-overlay {
			padding: 0.5rem;
		}

		.drawer-content {
			max-height: 95vh;
		}

		.drawer-header {
			padding: 1rem;
		}

		.drawer-body {
			padding: 1rem;
		}

		.header-content {
			gap: 0.75rem;
		}

		.drawer-title {
			font-size: 1.125rem;
		}

		.drawer-subtitle {
			font-size: 0.8125rem;
		}

		.quote-card {
			padding: 1rem;
		}

		.quote-content {
			gap: 0.75rem;
		}

		.persona-info {
			padding-left: 1.5rem;
		}

		.persona-descriptor {
			font-size: 0.8125rem;
			padding: 0.375rem 0.75rem;
		}
	}
</style> 
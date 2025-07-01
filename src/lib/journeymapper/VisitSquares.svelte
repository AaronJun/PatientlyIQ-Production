<script lang="ts">
	export let label: string;
	export let count: number;
	export let color: string = '#3b82f6'; // Default blue color
	export let size: string = '8px';
</script>

<div class="visit-squares">
	<div class="squares-label flex flex-row justify-between align-baseline">
		<span class="label-text text-xs font-bold text-slate-500">{label}</span>
		<span class="font-bold text-slate-500">{count}</span>
	</div>
	<div class="squares-container">
		{#each Array(count) as _, i}
			<div 	
				class="square" 
				style="background-color: {color}; width: {size}; height: {size};"
			></div>
		{/each}
	</div>
</div>

<style>
	.visit-squares {
		margin-bottom: 1.5rem;
	}

	.squares-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.label-text {
		font-weight: 600;
		color: #374151;
	}

	.count-badge {
		color: #1f2937;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 600;
		min-width: 1.5rem;
		text-align: center;
	}

	.squares-container {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		max-width: 300px;
	}

	.square {
		border-radius: 2px;
		transition: opacity 0.2s ease;
	}

	.square:hover {
		opacity: 0.8;
	}
</style> 
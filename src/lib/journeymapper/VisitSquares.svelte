<script lang="ts">
	export let label: string;
	export let count: number;
	export let color: string = '#3b82f6'; // Default blue color
	export let size: string = '6px';
</script>

<div class="visit-squares md:max-w-44">
	<div class="squares-label flex flex-row justify-between align-baseline">
		<span class="label-text text-xs font-bold text-slate-500">{label}</span>
		<span class="font-semibold text-sm text-slate-800">{count}</span>
	</div>
	<div class="squares-container">
		{#each Array(count) as _, i}
			<div 	
				class="square w-3 h-3" 
				style="background-color: {color}"
			></div>
		{/each}
	</div>
</div>

<style>
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


	.squares-container {
		display: flex;
		align-items: center;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 2px;
	}

	.square {
		border-radius: 2px;
		transition: opacity 0.2s ease;
	}

	.square:hover {
		opacity: 0.8;
	}
</style> 
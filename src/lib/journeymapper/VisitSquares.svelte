<script lang="ts">
	export let label: string;
	export let count: number;
	export let totalCount: number = count; // Total number of squares to show
	export let color: string = '#3b82f6'; // Default blue color
	export let size: string = '6px';
</script>

<div class="visit-squares flex flex-row w-full justify-between items-center">
	<div class="flex flex-row justify-start align-center gap-2 w-1/3">
		<span class="font-semibold text-xs text-slate-100 bg-[#EB4E27] rounded-full w-8 h-4 flex items-center align-center justify-center">{count}</span>
		<span class="text-xs font-medium text-slate-700 ml-2 align-center">{label}</span>
	</div>
	<div class="squares-container w-2/3">
		{#each Array(totalCount) as _, i}
			<div 	
				class="square w-4 h-4" 
				class:filled={i < count}
				class:empty={i >= count}
				style="background-color: {i < count ? color : 'transparent'}; border-color: {color}"
			></div>
		{/each}
	</div>
</div>

<style>

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
		border: .525px solid;
	}

	.square.empty {
		/* Empty squares are transparent with just border */
		background-color: transparent !important;
	}

	.square:hover {
		opacity: 0.8;
	}
</style> 
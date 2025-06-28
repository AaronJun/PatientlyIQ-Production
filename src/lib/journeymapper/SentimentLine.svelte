<script lang="ts">
	export let points: Array<{x: number, y: number}> = [];
	export let color: string = '#6b7280';
	export let strokeWidth: number = 2;
	export let opacity: number = 0.7;

	// Generate SVG path from points
	$: pathData = points.length > 1 
		? `M ${points[0].x} ${points[0].y} ` + 
		  points.slice(1).map(point => `L ${point.x} ${point.y}`).join(' ')
		: '';
</script>

{#if points.length > 1}
	<svg class="sentiment-line-svg transition-all duration-500 delay-100" style="pointer-events: none;">
		<path 
			d={pathData}
			stroke={color}
			stroke-width={strokeWidth}
			fill="none"
			opacity={opacity}
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{/if}

<style>
	.sentiment-line-svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 5;
	}
</style> 
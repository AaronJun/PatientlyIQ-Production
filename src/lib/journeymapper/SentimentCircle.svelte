<script lang="ts">
	export let sentiment: number = 5; // 1-10 scale (default neutral)
	export let size: number = 12; // Circle size in pixels
	export let x: number = 0; // Position X
	export let y: number = 0; // Position Y
	export let showTooltip: boolean = true;
	export let tooltipText: string = '';
	export let personaColor: string = ''; // Persona color for collapsed state
	export let isExpanded: boolean = false; // Whether the persona row is expanded

	// Get sentiment color based on 1-10 score
	function getSentimentColor(sentiment: number): string {
		if (sentiment >= 8) return '#22c55e';      // High positive (8-10) - green
		if (sentiment >= 6) return '#84cc16';      // Moderate positive (6-7) - lime
		if (sentiment >= 5) return '#eab308';      // Neutral (5) - yellow
		if (sentiment >= 3) return '#f97316';      // Moderate negative (3-4) - orange
		return '#ef4444';                          // High negative (1-2) - red
	}

	$: sentimentColor = getSentimentColor(sentiment);
	$: circleColor = isExpanded ? sentimentColor : (personaColor || sentimentColor);
</script>

<div 
	class="sentiment-circle" 
	style="
		left: {x}px; 
		top: {y}px; 
		width: {size}px; 
		height: {size}px; 
		background-color: {circleColor};
	"
	title={showTooltip ? (tooltipText || `Sentiment: ${sentiment}/10`) : ''}
>
</div>

<style>
	.sentiment-circle {
		position: absolute;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		transition: all 0.2s ease;
		z-index: 10;
		transform: translate(-50%, -50%);
	}

	.sentiment-circle:hover {
		transform: translate(-50%, -50%) scale(1.2);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
</style> 
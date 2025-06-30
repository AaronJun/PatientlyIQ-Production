<script lang="ts">
	export let sentiment: number = 3; // 1-5 scale
	export let size: number = 12; // Circle size in pixels
	export let x: number = 0; // Position X
	export let y: number = 0; // Position Y
	export let showTooltip: boolean = true;
	export let tooltipText: string = '';
	export let personaColor: string = ''; // Persona color for collapsed state
	export let isExpanded: boolean = false; // Whether the persona row is expanded

	// Color mapping for sentiment scores
	const sentimentColors: Record<number, string> = {
		1: '#7f1d1d', // dark red (Very Negative)
		2: '#dc2626', // moderate red (Negative)
		3: '#ea580c', // orange (Neutral)
		4: '#16a34a', // moderate green (Positive)
		5: '#15803d'  // dark green (Very Positive)
	};

	$: sentimentColor = sentimentColors[Math.round(sentiment)] || sentimentColors[3];
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
	title={showTooltip ? (tooltipText || `Sentiment: ${sentiment}/5`) : ''}
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
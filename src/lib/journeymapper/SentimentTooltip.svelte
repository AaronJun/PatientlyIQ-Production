<script lang="ts">
	interface SentimentData {
		"Entirely Negative": number;
		"Mostly Negative": number;
		"Somewhat Negative": number;
		"Neutral": number;
		"Somewhat Positive": number;
		"Mostly Positive": number;
		"Entirely Positive": number;
	}

	export let visible: boolean = false;
	export let x: number = 0;
	export let y: number = 0;
	export let personaType: string = 'Patient'; // 'Patient' or 'Caregiver'
	export let weekNumber: number = 1;
	export let visitName: string = '';
	export let studyPhase: string = '';
	export let sentiment: SentimentData;
	
	// Calculate tooltip position to avoid going off-screen
	let tooltipElement: HTMLElement;
	let adjustedX: number = x;
	let adjustedY: number = y;
	
	// Smooth position updates with animation-friendly transitions
	$: {
		adjustedX = x;
		adjustedY = y - 10; // Default offset above cursor
		
		if (tooltipElement && visible) {
			const rect = tooltipElement.getBoundingClientRect();
			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight;
			
			// Adjust horizontal position
			if (x + rect.width > windowWidth - 20) {
				adjustedX = x - rect.width - 10;
			}
			
			// Adjust vertical position
			if (y + rect.height > windowHeight - 20) {
				adjustedY = y - rect.height + 200;
			}
		}
	}

	// Calculate sentiment metrics
	$: totalResponses = Object.values(sentiment).reduce((sum, count) => sum + count, 0);
	$: positiveResponses = sentiment["Somewhat Positive"] + sentiment["Mostly Positive"] + sentiment["Entirely Positive"];
	$: negativeResponses = sentiment["Entirely Negative"] + sentiment["Mostly Negative"] + sentiment["Somewhat Negative"];
	$: neutralResponses = sentiment["Neutral"];
	
	$: positivePercentage = totalResponses > 0 ? Math.round((positiveResponses / totalResponses) * 100) : 0;
	$: negativePercentage = totalResponses > 0 ? Math.round((negativeResponses / totalResponses) * 100) : 0;
	$: neutralPercentage = totalResponses > 0 ? Math.round((neutralResponses / totalResponses) * 100) : 0;

	// Calculate overall sentiment score
	$: overallSentiment = calculateOverallSentiment();
	
	function calculateOverallSentiment(): { label: string, color: string, score: number } {
		if (totalResponses === 0) return { label: 'No Data', color: '#6b7280', score: 0 };
		
		const weights = {
			"Entirely Negative": -1,
			"Mostly Negative": -0.66,
			"Somewhat Negative": -0.33,
			"Neutral": 0,
			"Somewhat Positive": 0.33,
			"Mostly Positive": 0.66,
			"Entirely Positive": 1
		};

		let weightedSum = 0;
		for (const [key, count] of Object.entries(sentiment)) {
			weightedSum += weights[key as keyof SentimentData] * count;
		}

		const score = weightedSum / totalResponses;
		
		if (score >= 0.5) return { label: 'Very Positive', color: '#15803d', score };
		if (score >= 0.2) return { label: 'Positive', color: '#22c55e', score };
		if (score >= -0.2) return { label: 'Neutral', color: '#6b7280', score };
		if (score >= -0.5) return { label: 'Negative', color: '#f97316', score };
		return { label: 'Very Negative', color: '#ef4444', score };
	}

	// Get persona color
	$: personaColor = personaType === 'Patient' ? '#3b82f6' : '#8b5cf6';
	
	// Get sentiment breakdown for display
	$: sentimentBreakdown = Object.entries(sentiment)
		.filter(([_, count]) => count > 0)
		.map(([key, count]) => ({
			label: key,
			count,
			percentage: Math.round((count / totalResponses) * 100)
		}));
</script>

{#if visible}
	<div 
		bind:this={tooltipElement}
		class="sentiment-tooltip"
		class:visible
		style="
			left: {adjustedX + 50}px; 
			top: {adjustedY + 100}px;
			border-top: 3px solid {personaColor};
			transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		"
	>
		<!-- Header -->
		<div class="tooltip-header">
			<div class="persona-info">
				<h4 class="persona-name" style="color: {personaColor};">{personaType} Sentiment</h4>
				<p class="visit-info">Week {weekNumber} - {visitName}</p>
			</div>
			<div class="phase-badge" style="background-color: {personaColor}20; color: {personaColor};">
				{studyPhase}
			</div>
		</div>
		
		<!-- Overall Sentiment -->
		<div class="metrics-section">
			<div class="metric">
				<span class="metric-label">Overall Sentiment:</span>
				<span class="metric-value" style="color: {overallSentiment.color};">
					{overallSentiment.label}
				</span>
			</div>
			<div class="metric">
				<span class="metric-label">Total Responses:</span>
				<span class="metric-value">{totalResponses}</span>
			</div>
		</div>
		
		<!-- Sentiment Distribution -->
		<div class="distribution-section">
			<h5 class="section-title">Sentiment Distribution:</h5>
			<div class="distribution-bars">
				<div class="distribution-bar">
					<span class="bar-label">Positive</span>
					<div class="bar-container">
						<div class="bar positive" style="width: {positivePercentage}%"></div>
						<span class="bar-value">{positivePercentage}%</span>
					</div>
				</div>
				<div class="distribution-bar">
					<span class="bar-label">Neutral</span>
					<div class="bar-container">
						<div class="bar neutral" style="width: {neutralPercentage}%"></div>
						<span class="bar-value">{neutralPercentage}%</span>
					</div>
				</div>
				<div class="distribution-bar">
					<span class="bar-label">Negative</span>
					<div class="bar-container">
						<div class="bar negative" style="width: {negativePercentage}%"></div>
						<span class="bar-value">{negativePercentage}%</span>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Detailed Breakdown -->
		<div class="breakdown-section">
			<h5 class="section-title">Detailed Breakdown:</h5>
			<div class="breakdown-list">
				{#each sentimentBreakdown as item}
					<div class="breakdown-item">
						<span class="breakdown-label">{item.label}:</span>
						<span class="breakdown-value">{item.count} ({item.percentage}%)</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.sentiment-tooltip {
		position: fixed;
		background: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		padding: 0;
		min-width: 320px;
		max-width: 400px;
		z-index: 1000;
		font-family: system-ui, -apple-system, sans-serif;
		border: 1px solid #e5e7eb;
		overflow: hidden;
		backdrop-filter: blur(8px);
		
		/* Animation properties */
		opacity: 0;
		transform: translateY(10px) scale(0.95);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
		
		/* Prevent tooltip from interfering with hover detection */
		will-change: transform, opacity;
	}
	
	.sentiment-tooltip.visible {
		opacity: 1;
		transform: translateY(0) scale(1);
		pointer-events: auto;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
	}
	
	/* Smooth transitions for all internal elements */
	.sentiment-tooltip * {
		transition: inherit;
	}
	
	.tooltip-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 1rem;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		gap: 1rem;
	}
	
	.persona-info {
		flex: 1;
	}
	
	.persona-name {
		margin: 0 0 0.25rem 0;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.2;
	}
	
	.visit-info {
		margin: 0;
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}
	
	.phase-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}
	
	.metrics-section {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.metric {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.metric-label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}
	
	.metric-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1f2937;
	}
	
	.distribution-section, .breakdown-section {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}
	
	.section-title {
		margin: 0 0 0.75rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.distribution-bars {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.distribution-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	
	.bar-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #6b7280;
		min-width: 60px;
	}
	
	.bar-container {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.bar {
		height: 12px;
		border-radius: 6px;
		min-width: 2px;
		transition: width 0.3s ease;
	}
	
	.bar.positive {
		background: linear-gradient(90deg, #22c55e, #15803d);
	}
	
	.bar.neutral {
		background: #6b7280;
	}
	
	.bar.negative {
		background: linear-gradient(90deg, #f97316, #ef4444);
	}
	
	.bar-value {
		font-size: 0.75rem;
		font-weight: 600;
		color: #374151;
		min-width: 35px;
	}
	
	.breakdown-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	
	.breakdown-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8125rem;
	}
	
	.breakdown-label {
		color: #6b7280;
		font-weight: 500;
	}
	
	.breakdown-value {
		color: #374151;
		font-weight: 600;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.sentiment-tooltip {
			min-width: 280px;
			max-width: 320px;
		}
		
		.tooltip-header {
			flex-direction: column;
			gap: 0.5rem;
		}
		
		.phase-badge {
			align-self: flex-start;
		}
	}
</style> 
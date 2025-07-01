<script lang="ts">
	export let visible: boolean = false;
	export let x: number = 0;
	export let y: number = 0;
	export let personaName: string = '';
	export let personaColor: string = '#059669';
	export let visitName: string = '';
	export let visitNumber: number = 1;
	export let quotes: string[] = [];
	export let dropoutRisk: number = 0;
	export let primaryDrivers: string[] = [];
	export let procedureDiscomfort: number = 0;
	export let burdenScore: number = 0;
	export let studyPhase: string = '';
	
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
	
	// Convert numerical scores to descriptive categories
	function getDropoutRiskCategory(risk: number): { label: string, color: string } {
		if (risk < 0.15) return { label: 'Very Low', color: '#10b981' };
		if (risk < 0.3) return { label: 'Low', color: '#22c55e' };
		if (risk < 0.45) return { label: 'Moderate', color: '#f59e0b' };
		if (risk < 0.6) return { label: 'High', color: '#f97316' };
		return { label: 'Very High', color: '#ef4444' };
	}
	
	function getBurdenCategory(score: number): { label: string, color: string } {
		if (score < 20) return { label: 'Very Low', color: '#10b981' };
		if (score < 40) return { label: 'Low', color: '#22c55e' };
		if (score < 60) return { label: 'Moderate', color: '#f59e0b' };
		if (score < 80) return { label: 'High', color: '#f97316' };
		return { label: 'Very High', color: '#ef4444' };
	}
	
	function getDiscomfortCategory(score: number): { label: string, color: string } {
		if (score < 2) return { label: 'Very Low', color: '#10b981' };
		if (score < 4) return { label: 'Low', color: '#22c55e' };
		if (score < 6) return { label: 'Moderate', color: '#f59e0b' };
		if (score < 8) return { label: 'High', color: '#f97316' };
		return { label: 'Very High', color: '#ef4444' };
	}
	
	// Get categorized values
	$: dropoutRiskCategory = getDropoutRiskCategory(dropoutRisk);
	$: burdenCategory = getBurdenCategory(burdenScore);
	$: discomfortCategory = getDiscomfortCategory(procedureDiscomfort);
</script>

{#if visible}
	<div 
		bind:this={tooltipElement}
		class="persona-tooltip"
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
				<h4 class="persona-name" style="color: {personaColor};">{personaName}</h4>
				<p class="visit-info">{visitName} (Visit {visitNumber})</p>
			</div>
			<div class="phase-badge" style="background-color: {personaColor}20; color: {personaColor};">
				{studyPhase}
			</div>
		</div>
		
		<!-- Risk and Burden Metrics -->
		<div class="metrics-section">
			<div class="metric">
				<span class="metric-label">Dropout Risk:</span>
				<span class="metric-value risk-value" style="color: {dropoutRiskCategory.color};">
					{dropoutRiskCategory.label}
				</span>
			</div>
			<div class="metric">
				<span class="metric-label">Burden Level:</span>
				<span class="metric-value" style="color: {burdenCategory.color};">
					{burdenCategory.label}
				</span>
			</div>
			{#if procedureDiscomfort > 0}
				<div class="metric">
					<span class="metric-label">Procedure Discomfort:</span>
					<span class="metric-value" style="color: {discomfortCategory.color};">
						{discomfortCategory.label}
					</span>
				</div>
			{/if}
		</div>
		
		<!-- Primary Risk Drivers -->
		{#if primaryDrivers.length > 0}
			<div class="drivers-section">
				<h5 class="section-title">Primary Risk Drivers:</h5>
				<div class="drivers-list">
					{#each primaryDrivers as driver}
						<span class="driver-tag">{driver}</span>
					{/each}
				</div>
			</div>
		{/if}
		
		<!-- Quotes -->
		{#if quotes.length > 0}
			<div class="quotes-section">
				<h5 class="section-title">Patient Voice:</h5>
				{#each quotes as quote}
					<blockquote class="quote">
						"{quote}"
					</blockquote>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.persona-tooltip {
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
	
	.persona-tooltip.visible {
		opacity: 1;
		transform: translateY(0) scale(1);
		pointer-events: auto;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
	}
	
	/* Smooth transitions for all internal elements */
	.persona-tooltip * {
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
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}
	
	.risk-value {
		font-weight: 700;
	}
	
	.drivers-section {
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
	
	.drivers-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	
	.driver-tag {
		background: #fef3c7;
		color: #92400e;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		border: 1px solid #fde68a;
	}
	
	.quotes-section {
		padding: 1rem;
	}
	
	.quote {
		margin: 0 0 0.75rem 0;
		padding: 0.75rem;
		background: #f8fafc;
		border-left: 3px solid #e2e8f0;
		font-style: italic;
		color: #475569;
		font-size: 0.875rem;
		line-height: 1.5;
		border-radius: 0 4px 4px 0;
	}
	
	.quote:last-child {
		margin-bottom: 0;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.persona-tooltip {
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
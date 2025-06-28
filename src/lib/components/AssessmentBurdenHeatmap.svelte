<script lang="ts">
	import personaBurdenData from '../../data/journeymap/persona_burden_heatmap.json';

	// Type definitions
	interface PersonaBurden {
		persona: string;
		burden_scores: Record<string, number | undefined>;
		assessment_burden: Record<string, number | undefined>;
	}

	export let showBurdenScores: boolean = false; // Toggle between burden_scores and assessment_burden
	export let maxSquares: number = 10; // Maximum number of squares to show
	export let squareSize: string = '12px';

	// Get color based on burden level (1-10 scale)
	function getBurdenColor(score: number): string {
		if (score <= 3) return '#22c55e'; // green - low burden
		if (score <= 6) return '#f59e0b'; // amber - medium burden
		return '#ef4444'; // red - high burden
	}

	// Get persona color for styling
	function getPersonaColor(persona: string): string {
		switch (persona) {
			case 'Caregiver (Parent)': return '#0369a1'; // blue
			case 'Teen Patient': return '#7c3aed'; // purple
			case 'Rural Working Mother': return '#dc2626'; // red
			default: return '#374151'; // gray
		}
	}

	// Get the data to display based on the toggle
	function getDisplayData(personaData: PersonaBurden) {
		return showBurdenScores ? personaData.burden_scores : personaData.assessment_burden;
	}
</script>

<div class="heatmap-container">
	<div class="heatmap-header">
		<h3>Assessment Burden by Persona</h3>
		<div class="toggle-controls">
			<button 
				class="toggle-btn" 
				class:active={!showBurdenScores}
				on:click={() => showBurdenScores = false}
			>
				Assessment Burden
			</button>
			<button 
				class="toggle-btn" 
				class:active={showBurdenScores}
				on:click={() => showBurdenScores = true}
			>
				General Burden
			</button>
		</div>
	</div>

	<div class="personas-grid">
		{#each personaBurdenData as personaData}
			<div class="persona-section">
				<div class="persona-header" style="border-color: {getPersonaColor(personaData.persona)};">
					<h4 style="color: {getPersonaColor(personaData.persona)};">
						{personaData.persona}
					</h4>
				</div>
				
				<div class="assessments-grid">
					{#each Object.entries(getDisplayData(personaData)).filter(([_, score]) => score !== undefined) as [assessment, score]}
						<div class="assessment-item">
							<div class="assessment-label">
								<span class="label-text">{assessment}</span>
								<span class="score-badge" style="background-color: {getBurdenColor(score ?? 0)};">
									{score ?? 0}
								</span>
							</div>
							<div class="squares-container">
								{#each Array(maxSquares) as _, i}
									<div 
										class="burden-square" 
										class:filled={i < (score ?? 0)}
										style="
											width: {squareSize}; 
											height: {squareSize};
											background-color: {i < (score ?? 0) ? getBurdenColor(score ?? 0) : 'transparent'};
											border-color: {getBurdenColor(score ?? 0)};
										"
									></div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div class="legend">
		<div class="legend-item">
			<div class="legend-square" style="background-color: #22c55e;"></div>
			<span>Low Burden (1-3)</span>
		</div>
		<div class="legend-item">
			<div class="legend-square" style="background-color: #f59e0b;"></div>
			<span>Medium Burden (4-6)</span>
		</div>
		<div class="legend-item">
			<div class="legend-square" style="background-color: #ef4444;"></div>
			<span>High Burden (7-10)</span>
		</div>
	</div>
</div>

<style>
	.heatmap-container {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
		border: 1px solid #e5e7eb;
	}

	.heatmap-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #f3f4f6;
	}

	.heatmap-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #1f2937;
		font-weight: 600;
	}

	.toggle-controls {
		display: flex;
		gap: 0.5rem;
	}

	.toggle-btn {
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		background: white;
		color: #6b7280;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.toggle-btn:hover {
		background: #f9fafb;
	}

	.toggle-btn.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.personas-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.persona-section {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
	}

	.persona-header {
		padding: 1rem;
		background: #f9fafb;
		border-bottom: 2px solid;
	}

	.persona-header h4 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.assessments-grid {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.assessment-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.assessment-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.label-text {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	.score-badge {
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		min-width: 1.5rem;
		text-align: center;
	}

	.squares-container {
		display: flex;
		gap: 3px;
		flex-wrap: wrap;
	}

	.burden-square {
		border: 1px solid;
		border-radius: 2px;
		transition: all 0.2s ease;
	}

	.burden-square.filled {
		opacity: 1;
	}

	.burden-square:not(.filled) {
		opacity: 0.3;
	}

	.burden-square:hover {
		transform: scale(1.1);
	}

	.legend {
		display: flex;
		justify-content: center;
		gap: 2rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #374151;
	}

	.legend-square {
		width: 16px;
		height: 16px;
		border-radius: 2px;
	}

	@media (max-width: 768px) {
		.heatmap-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.personas-grid {
			grid-template-columns: 1fr;
		}

		.legend {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style> 
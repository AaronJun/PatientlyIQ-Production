<script lang="ts">
	import personaBurdenData from '../../data/journeymap/persona_burden_heatmap.json';
	import assessmentQuotes from '../../data/journeymap/assessment_burden_quotes.json';
	import HurdleQuotesDrawer from '$lib/journeymapper/HurdleQuotesDrawer.svelte';

	// Type definitions
	interface PersonaBurden {
		persona: string;
		burden_scores: Record<string, number | undefined>;
		assessment_burden: Record<string, number | undefined>;
	}

	export let showBurdenScores: boolean = false; // Toggle between burden_scores and assessment_burden
	export let maxSquares: number = 10; // Maximum number of squares to show
	export let squareSize: string = '12px';

	// Drawer state
	let drawerOpen: boolean = false;
	let selectedAssessment: string = '';
	let selectedPersona: string = '';
	let formattedQuotes: Array<{quote: string, persona_descriptor: string}> = [];

	// Get color based on burden level (1-10 scale)
	function getBurdenColor(score: number): string {
		if (score <= 2) return '#10b981'; // emerald - very low burden
		if (score <= 4) return '#22c55e'; // green - low burden
		if (score <= 6) return '#f59e0b'; // amber - moderate burden
		if (score <= 8) return '#f97316'; // orange - high burden
		return '#ef4444'; // red - very high burden
	}

	// Convert numerical score to categorical label
	function getBurdenCategory(score: number): string {
		if (score <= 2) return 'Very Low';
		if (score <= 4) return 'Low';
		if (score <= 6) return 'Moderate';
		if (score <= 8) return 'High';
		return 'Very High';
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
		if (showBurdenScores) {
			// Use burden scores from the original persona data
			return personaData.burden_scores || {};
		} else {
			// Use assessment burden from original data
			return personaData.assessment_burden;
		}
	}

	// Get persona short name for display
	function getPersonaShortName(persona: string): string {
		switch (persona) {
			case 'Caregiver (Parent)': return 'Caregiver (Parent)';
			case 'Teen Patient': return 'Teen Patient';
			case 'Rural Working Mother': return 'Caregiver (Rural Working Mother)';
			default: return persona;
		}
	}

	// Get all unique assessments across all personas
	$: allAssessments = (() => {
		const assessmentSet = new Set<string>();
		personaBurdenData.forEach(persona => {
			const displayData = getDisplayData(persona);
			Object.keys(displayData).forEach(assessment => {
				if (displayData[assessment] !== undefined) {
					assessmentSet.add(assessment);
				}
			});
		});
		return Array.from(assessmentSet).sort();
	})();

	// Handle grid cell click
	function handleCellClick(assessment: string, persona: string) {
		if (!showBurdenScores) { // Only show quotes for assessment burden, not general burden
			selectedAssessment = assessment;
			selectedPersona = persona;
			formattedQuotes = getFormattedQuotes(assessment, persona);
			drawerOpen = true;
		}
	}

	// Close drawer
	function closeDrawer() {
		drawerOpen = false;
		selectedAssessment = '';
		selectedPersona = '';
		formattedQuotes = [];
	}

	// Get quotes formatted for HurdleQuotesDrawer
	function getFormattedQuotes(assessment: string, persona: string): Array<{quote: string, persona_descriptor: string}> {
		const personaQuotes = assessmentQuotes.find(p => p.persona === persona);
		if (personaQuotes && personaQuotes.assessment_quotes) {
			const quotes = personaQuotes.assessment_quotes[assessment as keyof typeof personaQuotes.assessment_quotes];
			if (quotes) {
				return quotes.map(quote => ({
					quote: quote,
					persona_descriptor: persona
				}));
			}
		}
		return [];
	}

	// Get burden score for a specific assessment and persona
	function getBurdenScore(assessment: string, persona: string): number | undefined {
		const personaData = personaBurdenData.find(p => p.persona === persona);
		if (!personaData) return undefined;
		
		const displayData = getDisplayData(personaData);
		return displayData[assessment];
	}
</script>

<div class="heatmap-container">
	<div class="heatmap-header">
		<h3>{showBurdenScores ? 'General Burden by Persona' : 'Assessment Burden by Persona'}</h3>
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

	<div class="grid-container">
		<!-- Grid Header -->
		<div class="grid-header">
			<div class="corner-cell"></div>
			{#each personaBurdenData as personaData}
				<div class="persona-header-cell" style="border-color: {getPersonaColor(personaData.persona)};">
					<span class="persona-name" style="color: {getPersonaColor(personaData.persona)};">
						{getPersonaShortName(personaData.persona)}
					</span>
				</div>
			{/each}
		</div>

		<!-- Grid Body -->
		<div class="grid-body">
			{#each allAssessments as assessment}
				<div class="grid-row">
					<div class="assessment-header-cell">
						<span class="assessment-name">{assessment}</span>
					</div>
					{#each personaBurdenData as personaData}
						{@const score = getBurdenScore(assessment, personaData.persona)}
						<div 
							class="burden-cell" 
							class:clickable={!showBurdenScores && score !== undefined}
							class:has-data={score !== undefined}
							style="background-color: {score !== undefined ? `${getBurdenColor(score)}15` : 'transparent'}; border-color: {score !== undefined ? getBurdenColor(score) : '#e5e7eb'};"
							on:click={() => score !== undefined && handleCellClick(assessment, personaData.persona)}
							on:keydown={(e) => e.key === 'Enter' && score !== undefined && handleCellClick(assessment, personaData.persona)}
							tabindex={!showBurdenScores && score !== undefined ? 0 : -1}
							role={!showBurdenScores && score !== undefined ? 'button' : 'cell'}
						>
							{#if score !== undefined}
								<div class="cell-content">
									<span class="score-value">{score}</span>
									<span class="score-category" style="background-color: {getBurdenColor(score)};">
										{getBurdenCategory(score)}
									</span>
								</div>
							{:else}
								<span class="no-data">—</span>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>

	<!-- Legend -->
	<div class="legend">
		<div class="legend-item">
			<div class="legend-square" style="background-color: #10b981;"></div>
			<span>Very Low (1-2)</span>
		</div>
		<div class="legend-item">
			<div class="legend-square" style="background-color: #22c55e;"></div>
			<span>Low (3-4)</span>
		</div>
		<div class="legend-item">
			<div class="legend-square" style="background-color: #f59e0b;"></div>
			<span>Moderate (5-6)</span>
		</div>
		<div class="legend-item">
			<div class="legend-square" style="background-color: #f97316;"></div>
			<span>High (7-8)</span>
		</div>
		<div class="legend-item">
			<div class="legend-square" style="background-color: #ef4444;"></div>
			<span>Very High (9-10)</span>
		</div>
	</div>

	<!-- Quotes Drawer -->
	<HurdleQuotesDrawer 
		isOpen={drawerOpen}
		selectedHurdle={selectedAssessment}
		quotes={formattedQuotes}
		on:close={closeDrawer}
	/>
</div>

<style>
	.heatmap-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
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

	.grid-container {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.grid-header {
		display: grid;
		grid-template-columns: 300px repeat(auto-fit, 200px);
		border-bottom: 2px solid #d1d5db;
		background: #f9fafb;
	}

	.corner-cell {
		border-right: 1px solid #d1d5db;
		background: #f3f4f6;
	}

	.persona-header-cell {
		padding: 1rem;
		text-align: center;
		border-right: 1px solid #d1d5db;
		border-bottom: 1px solid;
		font-weight: 600;
		background: white;
	}

	.persona-header-cell:last-child {
		border-right: none;
	}

	.persona-name {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.grid-body {
		display: flex;
		flex-direction: column;
	}

	.grid-row {
		display: grid;
		grid-template-columns: 300px repeat(auto-fit, 200px);
		border-bottom: 1px solid #e5e7eb;
	}

	.grid-row:last-child {
		border-bottom: none;
	}

	.assessment-header-cell {
		padding: 1rem;
		border-right: 1px solid #d1d5db;
		background: #f9fafb;
		display: flex;
		align-items: center;
		font-weight: 500;
		color: #374151;
	}

	.assessment-name {
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.burden-cell {
		padding: 0.75rem;
		border-right: 1px solid #e5e7eb;
		border-bottom: 1px solid;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 80px;
		position: relative;
		transition: all 0.2s ease;
	}

	.burden-cell:last-child {
		border-right: none;
	}

	.burden-cell.clickable {
		cursor: pointer;
	}

	.burden-cell.clickable:hover {
		background-color: rgba(59, 130, 246, 0.1) !important;
		border-color: #3b82f6 !important;
		transform: scale(1.02);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
		z-index: 10;
	}

	.burden-cell.clickable::after {
		content: "Click for quotes";
		position: absolute;
		top: -0.5rem;
		right: -0.5rem;
		background: #3b82f6;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.6rem;
		font-weight: 600;
		opacity: 0;
		transform: scale(0.8);
		transition: all 0.2s ease;
		pointer-events: none;
		white-space: nowrap;
	}

	.burden-cell.clickable:hover::after {
		opacity: 1;
		transform: scale(1);
	}

	.cell-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.score-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
	}

	.score-category {
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.7rem;
		font-weight: 600;
		text-align: center;
		white-space: nowrap;
	}

	.no-data {
		color: #9ca3af;
		font-size: 1.25rem;
		font-weight: 300;
	}

	.legend {
		display: flex;
		justify-content: center;
		gap: 2rem;
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
		margin-top: 2rem;
		flex-wrap: wrap;
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
		border-radius: 3px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 1024px) {
		.grid-header,
		.grid-row {
			grid-template-columns: 200px repeat(auto-fit, 150px);
		}

		.assessment-header-cell {
			padding: 0.75rem;
		}

		.burden-cell {
			padding: 0.5rem;
			min-height: 60px;
		}

		.persona-header-cell {
			padding: 0.75rem;
		}

		.persona-name {
			font-size: 0.75rem;
		}

		.assessment-name {
			font-size: 0.75rem;
		}

		.score-value {
			font-size: 1.25rem;
		}

		.score-category {
			font-size: 0.6rem;
			padding: 0.2rem 0.4rem;
		}
	}

	@media (max-width: 768px) {
		.heatmap-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.legend {
			gap: 1rem;
		}

		.grid-container {
			overflow-x: auto;
		}

		.grid-header,
		.grid-row {
			min-width: 800px;
		}
	}
</style> 
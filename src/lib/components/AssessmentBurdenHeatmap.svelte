<script lang="ts">
	import personaBurdenData from '../../data/journeymap/persona_burden_heatmap.json';
	import assessmentQuotes from '../../data/journeymap/assessment_burden_quotes.json';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/ui/tabs';
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

	// Set the first persona as default
	let activePersona: string = personaBurdenData.length > 0 ? personaBurdenData[0].persona : 'Caregiver (Parent)';

	// Drawer state
	let drawerOpen: boolean = false;
	let selectedAssessment: string = '';
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

	// Create reactive data for each persona
	$: personaDisplayData = personaBurdenData.map((persona: PersonaBurden) => ({
		...persona,
		displayData: getDisplayData(persona)
	}));

	// Get persona short name for tab display
	function getPersonaShortName(persona: string): string {
		switch (persona) {
			case 'Caregiver (Parent)': return 'Caregiver (Parent)';
			case 'Teen Patient': return 'Teen Patient';
			case 'Rural Working Mother': return 'Caregiver (Rural Working Mother)';
			default: return persona;
		}
	}

	// Handle assessment item click
	function handleAssessmentClick(assessment: string, persona: string) {
		if (!showBurdenScores) { // Only show quotes for assessment burden, not general burden
			selectedAssessment = assessment;
			formattedQuotes = getFormattedQuotes(assessment, persona);
			drawerOpen = true;
		}
	}

	// Close drawer
	function closeDrawer() {
		drawerOpen = false;
		selectedAssessment = '';
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

	<Tabs value={activePersona} onValueChange={(value) => { if (value) activePersona = value; }}>
		<TabsList class="persona-tabs">
			{#each personaBurdenData as personaData}
				<TabsTrigger 
					value={personaData.persona}
					class="persona-tab"
				>
					<span>
						{getPersonaShortName(personaData.persona)}
					</span>
				</TabsTrigger>
			{/each}
		</TabsList>

		{#each personaDisplayData as personaData}
			<TabsContent value={personaData.persona} class="persona-content">
				<div class="persona-section">
					<div class="persona-header" style="border-color: {getPersonaColor(personaData.persona)};">
						<h4 style="color: {getPersonaColor(personaData.persona)};">
							{personaData.persona}
						</h4>
					</div>
					
					<div class="assessments-grid">
						{#each Object.entries(personaData.displayData).filter(([_, score]) => score !== undefined) as [assessment, score]}
							<div class="assessment-item" class:clickable={!showBurdenScores} on:click={() => handleAssessmentClick(assessment, personaData.persona)}>
								<div class="assessment-label">
									<span class="label-text">{assessment}</span>
									<span class="score-badge" style="background-color: {getBurdenColor(score ?? 0)};">
										{getBurdenCategory(score ?? 0)}
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
			</TabsContent>
		{/each}
	</Tabs>

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
		width: 90%;
		justify-content: space-evenly;
		align-items: left;
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

	:global(.persona-tabs) {
		margin-bottom: 2rem;
		justify-content: center;
		background: #f9fafb;
		border-radius: 12px;		padding: 0.5rem;
	}

	:global(.persona-tab) {
		font-weight: 600;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	:global(.persona-tab:hover) {
		background: rgba(255, 255, 255, 0.8);
	}

	:global(.persona-tab[data-state="active"]) {
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	:global(.persona-content) {
		margin-top: 0;
	}

	.persona-section {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		min-width: 100%;
		margin: 0 auto;
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
		transition: all 0.2s ease;
	}

	.assessment-item.clickable {
		cursor: pointer;
		border-radius: 8px;
		padding: 0.75rem;
		margin: -0.75rem;
		border: 2px solid transparent;
		position: relative;
	}

	.assessment-item.clickable:hover {
		background: #f0f9ff;
		border-color: #3b82f6;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
	}

	.assessment-item.clickable::after {
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
	}

	.assessment-item.clickable:hover::after {
		opacity: 1;
		transform: scale(1);
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
		margin-top: 2rem;
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

		:global(.persona-tabs) {
			flex-direction: column;
		}
	}
</style> 
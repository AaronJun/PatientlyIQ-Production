<script lang="ts">
	import personaBurdenData from '../../data/journeymap/persona_burden_heatmap.json';
	import consolidatedBurdenData from '../../data/journeymap/consolidated_assessment_burden.json';
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

	// Define assessment categories
	const assessmentCategories = {
		'Clinical Assessments (Invasive)': [
			'PK Blood Samples',
			'Pregnancy Test', 
			'Clinical Laboratory Tests',
			'ECG',
			'Physical and Neurologic Exam'
		],
		'Patient-Reported Outcomes': [
			'C-SSRS',
			'QOLIE-31',
			'QOLIE-AD-48'
		],
		'Logistical & Administrative': [
			'Diary Training',
			'Travel Time',
			'Lost Wages',
			'Childcare Arrangements',
			'Transport Costs',
			'Scheduling Flexibility',
			'Appointment Rescheduling',
			'Visit Frequency'
		],
		'Patient Experience & Burden': [
			'Procedure Discomfort',
			'Follow-up Complexity',
			'Time Away from Family',
			'Anxiety Level',
			'Emotional Burden'
		]
	};

	// Transform consolidated data to match persona format
	function transformConsolidatedData(): PersonaBurden[] {
		const consolidatedPersonas = ['all_personas', 'patients_overall', 'caregivers_overall'];
		
		return consolidatedPersonas.map(personaKey => {
			const assessmentBurden: Record<string, number> = {};
			
			// Transform the data structure
			Object.entries(consolidatedBurdenData).forEach(([assessment, scores]) => {
				if (scores[personaKey as keyof typeof scores] !== undefined) {
					assessmentBurden[assessment] = scores[personaKey as keyof typeof scores] as number;
				}
			});
			
			return {
				persona: personaKey,
				burden_scores: {}, // Not used for consolidated data
				assessment_burden: assessmentBurden
			};
		});
	}

	// Combine original persona data with consolidated data
	$: allPersonaData = [...personaBurdenData, ...transformConsolidatedData()];

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
			case 'patients_overall': return '#059669'; // emerald
			case 'caregivers_overall': return '#d97706'; // amber
			case 'all_personas': return '#7c2d12'; // brown
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
			case 'patients_overall': return 'Patients Overall';
			case 'caregivers_overall': return 'Caregivers Overall';
			case 'all_personas': return 'All Personas';
			default: return persona;
		}
	}

	// Get category for an assessment
	function getAssessmentCategory(assessment: string): string {
		for (const [category, assessments] of Object.entries(assessmentCategories)) {
			if (assessments.includes(assessment)) {
				return category;
			}
		}
		return 'Other';
	}

	// Get category color
	function getCategoryColor(category: string): string {
		switch (category) {
			case 'Clinical Assessments (Invasive)': return '#dc2626'; // red
			case 'Patient-Reported Outcomes': return '#7c3aed'; // purple  
			case 'Logistical & Administrative': return '#059669'; // emerald
			case 'Patient Experience & Burden': return '#d97706'; // amber
			default: return '#6b7280'; // gray
		}
	}

	// Get all unique assessments organized by category
	$: organizedAssessments = (() => {
		const assessmentSet = new Set<string>();
		allPersonaData.forEach(persona => {
			const displayData = getDisplayData(persona);
			Object.keys(displayData).forEach(assessment => {
				if (displayData[assessment] !== undefined) {
					assessmentSet.add(assessment);
				}
			});
		});
		
		const result: Array<{type: 'category' | 'assessment', name: string, category?: string}> = [];
		
		Object.entries(assessmentCategories).forEach(([category, assessments]) => {
			const categoryAssessments = assessments.filter(assessment => assessmentSet.has(assessment));
			if (categoryAssessments.length > 0) {
				// Add category header
				result.push({type: 'category', name: category});
				// Add assessments in this category
				categoryAssessments.forEach(assessment => {
					result.push({type: 'assessment', name: assessment, category});
				});
			}
		});
		
		return result;
	})();

	// Get all unique assessments across all personas (keep for backward compatibility)
	$: allAssessments = (() => {
		const assessmentSet = new Set<string>();
		allPersonaData.forEach(persona => {
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
			// Only show quotes for original personas, not consolidated data
			if (!persona.includes('_overall') && persona !== 'all_personas') {
				selectedAssessment = assessment;
				selectedPersona = persona;
				formattedQuotes = getFormattedQuotes(assessment, persona);
				drawerOpen = true;
			}
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
		const personaData = allPersonaData.find(p => p.persona === persona);
		if (!personaData) return undefined;
		
		const displayData = getDisplayData(personaData);
		return displayData[assessment];
	}

	// Check if persona has quotes available
	function hasQuotes(persona: string): boolean {
		return !persona.includes('_overall') && persona !== 'all_personas';
	}
</script>

<div class="heatmap-container">
	<div class="heatmap-header">
	
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
			{#each allPersonaData as personaData}
				<div class="persona-header-cell" class:consolidated={personaData.persona.includes('_overall') || personaData.persona === 'all_personas'} style="border-color: {getPersonaColor(personaData.persona)};">
					<span class="persona-name" style="color: {getPersonaColor(personaData.persona)};">
						{getPersonaShortName(personaData.persona)}
					</span>
					{#if personaData.persona.includes('_overall') || personaData.persona === 'all_personas'}
						<span class="consolidated-badge">Consolidated</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Grid Body -->
		<div class="grid-body">
			{#each organizedAssessments as item}
				{#if item.type === 'category'}
					<div class="category-header-row">
						<div class="category-header-cell" style="background-color: {getCategoryColor(item.name)}15">
							<span class="category-name" style="color: {getCategoryColor(item.name)};">{item.name}</span>
						</div>
					</div>
				{:else}
					<div class="grid-row">
						<div class="assessment-header-cell">
							<span class="assessment-name">{item.name}</span>
						</div>
						{#each allPersonaData as personaData}
							{@const score = getBurdenScore(item.name, personaData.persona)}
							<div 
								class="burden-cell" 
								class:clickable={!showBurdenScores && score !== undefined && hasQuotes(personaData.persona)}
								class:has-data={score !== undefined}
								class:consolidated={personaData.persona.includes('_overall') || personaData.persona === 'all_personas'}
								on:click={() => score !== undefined && handleCellClick(item.name, personaData.persona)}
								on:keydown={(e) => e.key === 'Enter' && score !== undefined && handleCellClick(item.name, personaData.persona)}
								tabindex={!showBurdenScores && score !== undefined && hasQuotes(personaData.persona) ? 0 : -1}
								role={!showBurdenScores && score !== undefined && hasQuotes(personaData.persona) ? 'button' : 'cell'}
							>
								{#if score !== undefined}
									<div class="cell-content">
									
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
				{/if}
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
		margin: 0 auto;
	}

	.heatmap-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #f3f4f6;
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
		font-size: 0.725rem;
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
	}

	.grid-header {
		display: grid;
		grid-template-columns: 115px repeat(auto-fit, 115px);
		border-bottom: 1px solid #d1d5db;
		background: #f9fafb;
	}

	.corner-cell {
		border-right: 1px solid #d1d5db;
		background: #f3f4f6;
	}

	.persona-header-cell {
		padding: 0.5rem;
		border-right: 1px solid #d1d5db;
		text-align: center;
		font-weight: 600;
		background: white;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: center;
		justify-content: center;
	}

	.persona-header-cell.consolidated {
		background: #fefce8;
		border-bottom: 1px solid #d1d5db;
	}

	.persona-header-cell:last-child {
		border-right: none;
	}

	.persona-name {
		font-size: 0.725rem;
		font-weight: 600;
		text-align: center;
		line-height: 1.2;
	}

	.consolidated-badge {
		background: #fbbf24;
		color: #92400e;
		padding: 0.115rem 0.375rem;
		border-radius: 8px;
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.grid-body {
		display: flex;
		flex-direction: column;
	}

	.grid-row {
		display: grid;
		grid-template-columns: 115px repeat(auto-fit, 115px);
		border-bottom: 1px solid #e5e7eb;
	}

	.grid-row:last-child {
		border-bottom: none;
	}

	.assessment-header-cell {
		padding: 0.5rem;
		border-right: 1px solid #d1d5db;
		background: #f9fafb;
		display: flex;
		align-items: center;
		font-weight: 600;
		color: #374151;
		position: relative;
	}

	.assessment-name {
		font-size: 0.5625rem;
		line-height: 1.4;
		padding-left: 0.5rem;
	}

	.category-header-row {
		display: grid;
		grid-template-columns: 1fr;
	}

	.category-header-cell {
		grid-column: 1 / -1;
		font-weight: 600;
		font-size: 0.625rem;
		height:100%;
		display: flex;
		align-items: center;
		justify-content: left;
		padding: 0.5rem;
		text-transform: uppercase;
	}

	.category-name {
		font-weight: 600;
		font-size: 0.625rem;
	}

	.burden-cell {
		padding: 0.75rem;
		border-right: 1px solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 80px;
		position: relative;
		transition: all 0.2s ease;
	}

	.burden-cell.consolidated {
		border-left: 3px solid #fbbf24;
	}

	.burden-cell:last-child {
		border-right: none;
	}

	.burden-cell.clickable {
		cursor: pointer;
	}

	.burden-cell.clickable:hover {
		z-index: 10;
	}

	.burden-cell.clickable::after {
		content: "Click for quotes";
		position: absolute;
		top: -0.5rem;
		right: -0.5rem;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.5rem;
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


	.score-category {
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.6rem;
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
		border-radius: 8px;
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
		width: 12px;
		height: 12px;
		border-radius: 3px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 1200px) {
		.grid-header,
		.grid-row {
			grid-template-columns: 115px repeat(auto-fit, 115px);
		}

		.assessment-header-cell {
			padding: 0.75rem;
		}

		.burden-cell {
			padding: 0.5rem;
			min-height: 70px;
		}

		.persona-header-cell {
			padding: 0.75rem;
		}

		.persona-name {
			font-size: 0.6725rem;
		}

		.assessment-name {
			font-size: 0.75rem;
			padding-left: 0.25rem;
		}

		.category-header-cell {
			padding: 0.5rem 0.75rem;
			font-size: 0.75rem;
			margin: 0 0.25rem;
		}

		.category-name {
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
			min-width: 1200px;
		}
	}
</style> 
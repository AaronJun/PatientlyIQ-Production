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
	export let selectedStudyId: string = 'STUDY-302'; // Default to STUDY-302

	// Drawer state
	let drawerOpen: boolean = false;
	let selectedAssessment: string = '';
	let selectedPersona: string = '';
	let formattedQuotes: Array<{quote: string, persona_descriptor: string}> = [];

	// Define assessment categories
	const assessmentCategories = {
		'Clinical Assessments (Invasive)': [
			'PK Blood Samples',
			'PK Blood Sampling',
			'Pregnancy Test', 
			'Clinical Laboratory Tests',
			'Chemistry Panel (Fasting)',
			'Hematology',
			'Urinalysis',
			'Iron Metabolism Panel',
			'ECG',
			'ECG (12-Lead)',
			'Physical and Neurologic Exam',
			'Physical Examination',
			'HIV, Hepatitis B & C',
			'Alcohol Screen',
			'FSH',
			'TSAT',
			'Ferritin',
			'Coagulation Panel',
			'Endocrine Panel'
		],
		'Patient-Reported Outcomes': [
			'C-SSRS',
			'QOLIE-31',
			'QOLIE-AD-48',
			'NTDT-PRO',
			'SF-36',
			'PGIC',
			'ISGA',
			'FACIT-Fatigue'
		],
		'Specialized Biomarkers & Testing': [
			'ADA',
			'Antiplatelet Antibodies',
			'Platelet Function Testing',
			'Genotypic analysis of globin genes',
			'EPO',
			'sTfR',
			'GDF15',
			'Erythroferrone',
			'Haptoglobin',
			'Protoporphyrin-IX',
			'Bone markers',
			'6MWT with pulse oximetry'
		],
		'Imaging & Diagnostic Studies': [
			'MRI; liver, spleen, and bone marrow',
			'Ultrasound; liver and spleen',
			'Echocardiogram',
			'DEXA scan',
			'Archived Serum Sample'
		],
		'Administrative & Baseline': [
			'Diary Training',
			'Vital Signs',
			'Body Weight',
			'Height',
			'Medical History',
			'Informed Consent',
			'Inclusion/Exclusion',
			'Adverse Events',
			'Concomitant Medications'
		],
		'Logistical & Administrative': [
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

	// Map study IDs to the correct keys in the consolidated data
	function getStudyDataKey(studyId: string): string {
		if (studyId === 'DECIPHERA-PV-3' || studyId === '2') {
			return 'DECIPHERA-PV-3';
		}
		return 'STUDY-302';
	}

	// Transform consolidated data to match persona format
	function transformConsolidatedData(): PersonaBurden[] {
		const consolidatedPersonas = ['all_personas', 'patients_overall', 'caregivers_overall'];
		const studyDataKey = getStudyDataKey(selectedStudyId);
		const studyData = consolidatedBurdenData[studyDataKey as keyof typeof consolidatedBurdenData];
		
		if (!studyData) {
			return [];
		}
		
		return consolidatedPersonas.map(personaKey => {
			const assessmentBurden: Record<string, number> = {};
			
			// Transform the data structure
			Object.entries(studyData).forEach(([assessment, scores]) => {
				const score = scores[personaKey as keyof typeof scores];
				if (score !== undefined) {
					assessmentBurden[assessment] = score as number;
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
	
	// Separate individual and consolidated personas
	$: individualPersonas = personaBurdenData;
	$: consolidatedPersonas = transformConsolidatedData();

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
			case 'Specialized Biomarkers & Testing': return '#0369a1'; // blue
			case 'Imaging & Diagnostic Studies': return '#7c2d12'; // brown
			case 'Administrative & Baseline': return '#059669'; // emerald
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
	<div class="grid-container">
		<!-- Grid Header -->
		<div class="grid-header">
			<div class="corner-cell"></div>
			{#each individualPersonas as personaData}
				<div class="persona-header-cell">
					<span class="text-2xs font-medium text-slate-800">
						{getPersonaShortName(personaData.persona)}
					</span>
				</div>
			{/each}
			<div class="divider-cell"></div>
			{#each consolidatedPersonas as personaData}
				<div class="persona-header-cell consolidated">
					<span class="persona-name" style="color: {getPersonaColor(personaData.persona)};">
						{getPersonaShortName(personaData.persona)}
					</span>
				</div>
			{/each}
		</div>

		<!-- Grid Body -->
		<div class="grid-body">
			{#each organizedAssessments as item}
				{#if item.type === 'category'}
					<div class="category-header-row">
						<div class="category-header-cell" style="background-color: {getCategoryColor(item.name)}10">
							<span class="text-2xs font-medium text-slate-800">
								{item.name}</span>
						</div>
					</div>
				{:else}
					<div class="grid-row">
						<div class="assessment-header-cell">
							<span class="assessment-name">{item.name}</span>
						</div>
						{#each individualPersonas as personaData}
							{@const score = getBurdenScore(item.name, personaData.persona)}
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<div 
								class="burden-cell" 
								class:clickable={!showBurdenScores && score !== undefined && hasQuotes(personaData.persona)}
								class:has-data={score !== undefined}
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
						<div class="divider-cell"></div>
						{#each consolidatedPersonas as personaData}
							{@const score = getBurdenScore(item.name, personaData.persona)}
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<div 
								class="burden-cell consolidated" 
								class:clickable={!showBurdenScores && score !== undefined && hasQuotes(personaData.persona)}
								class:has-data={score !== undefined}
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
		min-width: 80vw;
		align-items: center;
		margin: 0;
		flex: 2;
		max-width: 100%; /* Added max-width */
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
		width: 100%;
		max-width: none;
		border: 1px solid #d1d5db;
		overflow: visible;
	}

	.grid-header {
		display: grid;
		grid-template-columns: 5rem repeat(3, 1fr) 10px repeat(3, 1fr);
		border-bottom: 1px solid #d1d5db;
		background: #f9fafb;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.corner-cell {
		border-right: 1px solid #d1d5db;
		background: #f3f4f6;
	}

	.persona-header-cell {
		border-right: 1px solid #d1d5db;
		text-align: center;
		font-weight: 600;
		background: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 40px;
		min-width: 0;
	}

	.persona-header-cell.consolidated {
		background: #fefce8;
		border-bottom: 1px solid #d1d5db;
	}

	.persona-header-cell:last-child {
		border-right: none;
	}

	.divider-cell {
		background: linear-gradient(to bottom, #e5e7eb 0%, #e5e7eb 100%);
		border-left: 1px solid #9ca3af;
		border-right: 1px solid #9ca3af;
		position: relative;
		min-height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.divider-cell::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 1px;
		height: 60%;
		background: #9ca3af;
	}

	.persona-name {
		font-size: 0.6725rem;
		font-weight: 600;
		text-align: center;
		line-height: 1.2;
	}

	.grid-body {
		display: flex;
		flex-direction: column;
	}

	.grid-row {
		display: grid;
		grid-template-columns: 5rem repeat(3, 5fr) 10px repeat(3, 5fr);
		border-bottom: 1px solid #d1d5db;
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
		padding: 1rem;
		border-right: 1px solid #d1d5db;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 40px;
		min-width: 0;
		position: relative;
		transition: all 0.2s ease;
	}

	.burden-cell.consolidated {
		background-color: #fefce8;
		font-weight: 600;
	}

	.burden-cell:last-child {
		border-right: none;
	}

	.burden-cell.clickable {
		cursor: pointer;
		background-color: #f9fafb;
	}

	.burden-cell.clickable:hover {
		z-index: 10;
		background-color: #144D91;
	}

	.burden-cell.clickable::after {
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
		border: 1px solid #d1d5db;
	}

	@media (max-width: 1200px) {
		.grid-header,
		.grid-row {
			grid-template-columns: 4rem repeat(3, 1fr) 10px repeat(3, 1fr);
		}

		.assessment-header-cell {
			padding: 1rem;
		}

		.burden-cell {
			padding: 1rem;
			min-height: 70px;
		}

		.persona-header-cell {
			padding: 1rem;
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
		.legend {
			gap: 1rem;
		}

		.grid-container {
			overflow-x: auto;
		}

		.grid-header,
		.grid-row {
			grid-template-columns: 3rem repeat(3, minmax(80px, 1fr)) 8px repeat(3, minmax(80px, 1fr));
			min-width: 600px;
		}
	}
</style> 
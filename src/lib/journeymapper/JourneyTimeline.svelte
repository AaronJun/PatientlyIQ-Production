<script lang="ts">
	import { onMount } from 'svelte';
	import Drawer from './Drawer.svelte';
	import assessmentClassification from '../../data/journeymap/assessment_classification.json';
	import consolidatedAssessmentBurden from '../../data/journeymap/consolidated_assessment_burden.json';

	// Type definitions
	interface Visit {
		visit_number: number;
		name: string;
		study_day?: string;
		study_day_range?: string;
		study_week?: string;
		assessments: string[];
		travel_required?: boolean;
	}

	interface ProcessedVisit extends Visit {
		burdenScore: number;
		timelinePosition: number;
		studyDay: number;
	}

	interface AssessmentClassification {
		assessment: string;
		category: 'Invasive' | 'Observational' | 'Patient-Reported' | 'Surgical';
	}

	interface GroupedAssessment {
		name: string;
		category: 'Invasive' | 'Observational' | 'Patient-Reported' | 'Surgical';
		color: string;
	}

	interface AssessmentBurdenData {
		patients_overall: number;
		caregivers_overall: number;
		all_personas: number;
	}

	// Props
	export let visits: Visit[] = [];
	export let timelineWidth: number = 1000;
	export let hideHeader: boolean = false;
	export let dynamicCellWidth: number = 80;

	// Constants
	const LEFT_PANEL_WIDTH = 250;

	// State
	let selectedVisit: ProcessedVisit | null = null;
	let hoveredVisit: ProcessedVisit | null = null;
	let mounted = false;
	let drawerOpen = false;

	// Get burden color based on score (needed for tooltip)
	function getBurdenColor(score: number): string {
		if (score < 30) return '#22c55e'; // green
		if (score < 60) return '#f59e0b'; // amber
		return '#ef4444'; // red
	}

	// Get burden level text (needed for tooltip)
	function getBurdenLevel(score: number): string {
		if (score < 30) return 'Low';
		if (score < 60) return 'Medium';
		return 'High';
	}

	// Get assessment burden score from consolidated data
	function getAssessmentBurdenScore(assessmentName: string): number | null {
		const burdenData = consolidatedAssessmentBurden[assessmentName as keyof typeof consolidatedAssessmentBurden] as AssessmentBurdenData;
		return burdenData ? burdenData.all_personas : null;
	}

	// Get burden color for assessment score (scale of 1-10)
	function getAssessmentBurdenColor(score: number): string {
		if (score < 4) return '#22c55e'; // green
		if (score < 7) return '#f59e0b'; // amber
		return '#ef4444'; // red
	}

	// Create assessment classification lookup
	const assessmentClassificationMap = new Map<string, string>();
	assessmentClassification.forEach((item: any) => {
		assessmentClassificationMap.set(item.assessment, item.category);
	});

	// Get assessment category
	function getAssessmentCategory(assessment: string): 'Invasive' | 'Observational' | 'Patient-Reported' | 'Unknown' {
		return assessmentClassificationMap.get(assessment) as 'Invasive' | 'Observational' | 'Patient-Reported' || 'Unknown';
	}

	// Get category color
	function getCategoryColor(category: string): string {
		switch (category) {
			case 'Invasive':
				return '#ef4444'; // red
			case 'Observational':
				return '#3b82f6'; // blue
			case 'Patient-Reported':
				return '#10b981'; // green
			default:
				return '#6b7280'; // gray
		}
	}

	// Get category background color (lighter version)
	function getCategoryBgColor(category: string): string {
		switch (category) {
			case 'Invasive':
				return '#fef2f2'; // light red
			case 'Observational':
				return '#eff6ff'; // light blue
			case 'Patient-Reported':
				return '#f0fdf4'; // light green
			default:
				return '#f9fafb'; // light gray
		}
	}

	// Group assessments by category
	function groupAssessmentsByCategory(assessments: string[]): Record<string, GroupedAssessment[]> {
		const grouped: Record<string, GroupedAssessment[]> = {
			'Invasive': [],
			'Observational': [],
			'Patient-Reported': [],
			'Surgical': [],
			'Unknown': []
		};

		assessments.forEach(assessment => {
			const category = getAssessmentCategory(assessment);
			grouped[category].push({
				name: assessment,
				category: category as 'Invasive' | 'Observational' | 'Patient-Reported' | 'Surgical',
				color: getCategoryColor(category)
			});
		});

		// Remove empty categories
		Object.keys(grouped).forEach(key => {
			if (grouped[key].length === 0) {
				delete grouped[key];
			}
		});

		return grouped;
	}

	// Check if visit has invasive assessments
	function hasInvasiveAssessments(visit: Visit): boolean {
		return visit.assessments.some(assessment => 
			getAssessmentCategory(assessment) === 'Invasive'
		);
	}

	// Check if visit has surgical assessments
	function hasSurgicalAssessments(visit: Visit): boolean {
		return visit.assessments.some(assessment => 
			assessment.toLowerCase().includes('surgical') || 
			assessment.toLowerCase().includes('biopsy') ||
			assessment.toLowerCase().includes('procedure')
		);
	}

	// Calculate burden score for each visit based on number and type of assessments
	function calculateBurdenScore(assessments: string[]): number {
		// Base score from number of assessments
		let score = assessments.length * 2;
		
		// Add weighted scores for specific high-burden assessments
		const highBurdenAssessments: Record<string, number> = {
			'Physical and Neurologic Exam': 5,
			'Ophthalmologic Exam': 12,
			'Clinical Laboratory Tests': 10,
			'ECG': 8,
			'PK Blood Samples': 12,
			'Medical and Psychiatric History': 10,
			'Diary Training': 8
		};

		assessments.forEach((assessment: string) => {
			if (highBurdenAssessments[assessment]) {
				score += highBurdenAssessments[assessment];
			}
		});

		// Normalize to 0-100 scale
		return Math.min(Math.round(score), 100);
	}

	// Parse study day from various formats
	function parseStudyDay(visit: Visit): number {
		if (visit.study_day) {
			// Handle formats like "14 ±3" or "0"
			const match = visit.study_day.match(/^(-?\d+)/);
			return match ? parseInt(match[1]) : 0;
		} else if (visit.study_day_range) {
			// Handle formats like "-66 to -56"
			const match = visit.study_day_range.match(/^(-?\d+)/);
			return match ? parseInt(match[1]) : 0;
		}
		return 0;
	}

	// Calculate position along timeline (same logic as PersonaGrid)
	function getTimelinePosition(visit: Visit): number {
		const studyDay = parseStudyDay(visit);
		const minDay = Math.min(...visits.map(parseStudyDay));
		const maxDay = Math.max(...visits.map(parseStudyDay));
		const range = maxDay - minDay;
		
		// Position as percentage of timeline width, with padding
		const padding = 0.1; // 10% padding on each side
		const position = ((studyDay - minDay) / range) * (1 - 2 * padding) + padding;
		
		return position;
	}

	// Process visits with calculated data
	$: processedVisits = visits.map((visit): ProcessedVisit => ({
		...visit,
		burdenScore: calculateBurdenScore(visit.assessments),
		timelinePosition: getTimelinePosition(visit),
		studyDay: parseStudyDay(visit)
	})).sort((a, b) => a.studyDay - b.studyDay);

	onMount(() => {
		mounted = true;
	});

	function handleVisitClick(visit: ProcessedVisit): void {
		selectedVisit = selectedVisit?.visit_number === visit.visit_number ? null : visit;
		drawerOpen = selectedVisit !== null;
	}

	function handleVisitHover(visit: ProcessedVisit): void {
		hoveredVisit = visit;
	}

	function handleVisitLeave(): void {
		hoveredVisit = null;
	}

	function closeDrawer(): void {
		selectedVisit = null;
		drawerOpen = false;
	}
</script>

{#if mounted}
	<div class="timeline-grid-container" class:no-header={hideHeader}>
		{#if !hideHeader}
			<!-- Visit headers and phases -->
			<div class="timeline-header-section">
				<!-- Visit numbers row -->
				<div class="visit-numbers-row">
					<div class="left-spacer"></div>
					<div class="visit-numbers-container" style="width: {timelineWidth}px;">
						{#each processedVisits as visit}
							<div 
								class="visit-number-cell"
								style="
									left: {visit.timelinePosition * timelineWidth - (dynamicCellWidth / 2)}px;
									width: {dynamicCellWidth}px;
								"
							>
								<span class="visit-number">V{visit.visit_number}</span>
							</div>
						{/each}
					</div>
				</div>
				
				<!-- Phase information row -->
				<div class="phase-info-row">
					<div class="left-spacer phase-label">
						<span>Study Phase</span>
					</div>
					<div class="phase-info-container" style="width: {timelineWidth}px;">
						{#each processedVisits as visit}
							<div 
								class="phase-cell"
								style="
									left: {visit.timelinePosition * timelineWidth - (dynamicCellWidth / 2)}px;
									width: {dynamicCellWidth}px;
								"
							>
								<span class="phase-text">{visit.study_week || 'Week ' + Math.abs(Math.floor(visit.studyDay / 7))}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Visit details grid -->
		<div class="visit-details-grid" class:no-header={hideHeader}>
			<div class="visit-details-label">
				<span>Visit Details</span>
			</div>
			<div class="visit-details-container" style="width: {timelineWidth}px;">
				{#each processedVisits as visit}
					<div 
						class="visit-detail-cell" 
						class:selected={selectedVisit?.visit_number === visit.visit_number}
						class:hovered={hoveredVisit?.visit_number === visit.visit_number}
						style="
							left: {visit.timelinePosition * timelineWidth - (dynamicCellWidth / 2)}px;
							width: {dynamicCellWidth}px;
						"
						on:click={() => handleVisitClick(visit)}
						on:mouseenter={() => handleVisitHover(visit)}
						on:mouseleave={handleVisitLeave}
						role="button"
						tabindex="0"
						on:keydown={(e) => e.key === 'Enter' && handleVisitClick(visit)}
					>
						<!-- Burden score -->
						<div class="burden-score-badge" style="background-color: {getBurdenColor(visit.burdenScore)};">
							{visit.burdenScore}
						</div>
						
						<!-- Icon indicators -->
						<div class="icon-indicators-grid">
							{#if visit.travel_required}
								<div class="icon-indicator travel" title="Travel Required">✈</div>
							{/if}
							{#if hasInvasiveAssessments(visit)}
								<div class="icon-indicator invasive" title="Invasive Procedures">💉</div>
							{/if}
							{#if hasSurgicalAssessments(visit)}
								<div class="icon-indicator surgical" title="Surgical Procedures">🔪</div>
							{/if}
						</div>
						
						<!-- Assessment count -->
						<div class="assessment-count">
							{visit.assessments.length} items
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Hover tooltip -->
	{#if hoveredVisit}
		<div class="tooltip">
			<h3>{hoveredVisit.name}</h3>
			<p><strong>Study Day:</strong> {hoveredVisit.study_day || hoveredVisit.study_day_range}</p>
			<p><strong>Burden Level:</strong> 
				<span style="color: {getBurdenColor(hoveredVisit.burdenScore)};">
					{getBurdenLevel(hoveredVisit.burdenScore)} ({hoveredVisit.burdenScore})
				</span>
			</p>
			<p><strong>Assessments:</strong> {hoveredVisit.assessments.length} items</p>
			
			<!-- Visit indicators -->
			<div class="tooltip-indicators">
				{#if hoveredVisit.travel_required}
					<div class="tooltip-indicator">
						<span class="indicator-icon travel">✈</span>
						<span>Travel Required</span>
					</div>
				{/if}
				{#if groupAssessmentsByCategory(hoveredVisit.assessments)['Invasive']?.length > 0}
					<div class="tooltip-indicator">
						<span class="indicator-icon invasive">💉</span>
						<span>Invasive Procedures</span>
					</div>
				{/if}
				{#if hoveredVisit.assessments.some(assessment => 
					assessment.toLowerCase().includes('surgical') || 
					assessment.toLowerCase().includes('biopsy') ||
					assessment.toLowerCase().includes('procedure')
				)}
					<div class="tooltip-indicator">
						<span class="indicator-icon surgical">🔪</span>
						<span>Surgical Procedures</span>
					</div>
				{/if}
			</div>
			
			<!-- Assessment breakdown by category -->
			{#each Object.entries(groupAssessmentsByCategory(hoveredVisit.assessments)) as [category, assessments]}
				<div class="tooltip-category">
					<span class="tooltip-category-dot" style="background-color: {getCategoryColor(category)};"></span>
					<span class="tooltip-category-text">{category}: {assessments.length}</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Selected visit details -->
	{#if selectedVisit}
		<Drawer 
			bind:isOpen={drawerOpen}
			title="{selectedVisit.name} - Visit {selectedVisit.visit_number}"
			width="600px"
			on:close={closeDrawer}
		>
			<div class="visit-details-content">
				<div class="visit-info">
					<div class="info-item">
						<strong>Study Day:</strong> {selectedVisit.study_day || selectedVisit.study_day_range}
					</div>
					<div class="info-item">
						<strong>Study Week:</strong> {selectedVisit.study_week}
					</div>
					<div class="info-item">
						<strong>Burden Score:</strong> 
						<span class="burden-badge" style="background-color: {getBurdenColor(selectedVisit.burdenScore)};">
							{getBurdenLevel(selectedVisit.burdenScore)} ({selectedVisit.burdenScore})
						</span>
					</div>
				</div>

				<div class="assessments-section">
					<div class="assessments-header">
						<h3>Assessments ({selectedVisit.assessments.length})</h3>
						<div class="category-legend">
							{#each Object.entries(groupAssessmentsByCategory(selectedVisit.assessments)) as [category, assessments]}
								<div class="legend-item">
									<span class="legend-dot" style="background-color: {getCategoryColor(category)};"></span>
									<span class="legend-text">{category} ({assessments.length})</span>
								</div>
							{/each}
						</div>
					</div>
					{#each Object.entries(groupAssessmentsByCategory(selectedVisit.assessments)) as [category, assessments]}
						<div class="assessment-category">
							<h4 class="category-header" style="color: {getCategoryColor(category)};">
								{category} ({assessments.length})
							</h4>
							<div class="assessments-grid">
								{#each assessments as assessment}
									{@const burdenScore = getAssessmentBurdenScore(assessment.name)}
									<div 
										class="assessment-item categorized" 
										style="background-color: {getCategoryBgColor(assessment.category)};">
										<div class="assessment-content">
											<span class="assessment-name">{assessment.name}</span>
											{#if burdenScore !== null}
												<span 
													class="burden-score-indicator"
													style="background-color: {getAssessmentBurdenColor(burdenScore)};"
													title="Burden Score: {burdenScore.toFixed(1)}/10"
												>
													{burdenScore.toFixed(1)}
												</span>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</Drawer>
	{/if}
{/if}

<style>
	.timeline-grid-container {
		position: relative;
		margin-bottom: 1rem;
		overflow: hidden;
		height: auto;
		width: 100%;
	}

	.timeline-grid-container.no-header {
		margin-bottom: 0;
		border-radius: 0;
	}

	.timeline-header-section {
		background: #f8fafc;
		border-bottom: 1px solid #e5e7eb;
	}

	.visit-numbers-row,
	.phase-info-row {
		display: flex;
		border-bottom: 1px solid #e5e7eb;
	}

	.phase-info-row {
		border-bottom: none;
	}

	.visit-numbers-container,
	.phase-info-container,
	.visit-details-container {
		position: relative;
		height: 100%;
		flex: 1;
	}

	.left-spacer {
		width: 250px;
		padding: 0 1rem;
		background: #f1f5f9;
		border-right: 2px solid #e5e7eb;
		display: flex;
		align-items: center;
		font-weight: 600;
		color: #374151;
		font-size: 0.9rem;
		flex-shrink: 0;
	}

	.visit-number-cell,
	.phase-cell {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		height: 100%;
		box-sizing: border-box;
	}

	.visit-number {
		font-weight: 600;
		color: #1f2937;
		font-size: 0.9rem;
	}

	.phase-text {
		font-size: 0.8rem;
		color: #6b7280;
		font-weight: 500;
	}

	.visit-details-grid {
		display: flex;
		align-items: stretch;
		min-height: 80px;
	}

	.visit-details-grid.no-header {
		border-top: none;
		margin-top: 0;
	}

	.visit-details-label {
		width: 250px;
		padding: 1rem;
		background: #f8fafc;
		border-right: 2px solid #e5e7eb;
		display: flex;
		align-items: center;
		font-weight: 600;
		color: #374151;
		font-size: 0.9rem;
	}

	.visit-detail-cell {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.75rem;
		cursor: pointer;
		transition: all 0.2s ease;
		height: 100%;
		gap: 0.5rem;
		box-sizing: border-box;
	}

	.visit-detail-cell:hover {
		background-color: #f8fafc;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.visit-detail-cell.selected {
		background-color: #3b82f6;
	}

	.visit-detail-cell.hovered {
		background-color: #f0f9ff;
	}

	.burden-score-badge {
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		text-align: center;
		min-width: 32px;
	}

	.icon-indicators-grid {
		display: flex;
		gap: 0.25rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.icon-indicator {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
	}

	.icon-indicator.travel {
		background-color: #dc2626;
	}

	.icon-indicator.invasive {
		background-color: #ea580c;
	}

	.icon-indicator.surgical {
		background-color: #7c2d12;
	}

	.assessment-count {
		font-size: 0.65rem;
	}

	.tooltip {
		position: fixed;
		top: 20px;
		right: 20px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		z-index: 20;
		min-width: 250px;
	}

	.tooltip h3 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
	}

	.tooltip p {
		margin: 0.25rem 0;
		color: #4b5563;
		font-size: 0.9rem;
	}

	.tooltip-category {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0.25rem 0;
		font-size: 0.85rem;
	}

	.tooltip-category-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.tooltip-category-text {
		color: #6b7280;
		font-weight: 500;
	}

	.tooltip-indicators {
		margin: 0.75rem 0;
		padding: 0.5rem 0;
		border-top: 1px solid #e5e7eb;
		border-bottom: 1px solid #e5e7eb;
	}

	.tooltip-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0.25rem 0;
		font-size: 0.85rem;
		color: #374151;
	}

	.indicator-icon {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		color: white;
	}

	.indicator-icon.travel {
		background-color: #dc2626;
	}

	.indicator-icon.invasive {
		background-color: #ea580c;
	}

	.indicator-icon.surgical {
		background-color: #7c2d12;
	}

	.visit-details-content {
		padding: 0;
	}

	.visit-info {
		display: flex;
		gap: 2rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.info-item {
		color: #4b5563;
	}

	.info-item strong {
		color: #1f2937;
	}

	.burden-badge {
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 10px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.assessments-header {
		margin-bottom: 1.5rem;
	}

	.assessments-section h3 {
		color: #1f2937;
		margin-bottom: 0.75rem;
	}

	.category-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: #6b7280;
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-text {
		font-weight: 500;
	}

	.assessment-category {
		margin-bottom: 1.5rem;
	}

	.category-header {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.category-header::before {
		content: '';
		width: 12px;
		height: 12px;
		border-radius: 2px;
		background-color: currentColor;
		opacity: 0.8;
	}

	.assessments-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 0.5rem;
	}

	.assessment-item {
		background: #f9fafb;
		padding: 0.75rem;
		font-size: 0.9rem;
		color: #374151;
		transition: all 0.2s ease;
	}

	.assessment-item.categorized {
		font-weight: 500;
	}

	.assessment-item.categorized:hover {
		transform: translateX(2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.assessment-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.assessment-name {
		flex: 1;
	}

	.burden-score-indicator {
		color: white;
		padding: 0.2rem 0.4rem;
		border-radius: 12px;
		font-size: 0.7rem;
		font-weight: 600;
		min-width: 32px;
		text-align: center;
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.timeline-grid-container {
			height: auto;
		}
		
		.visit-numbers-container,
		.phase-info-container,
		.visit-details-container {
			overflow-x: auto;
		}
		
		.tooltip {
			position: static;
			margin: 1rem 0;
		}
		
		.visit-info {
			flex-direction: column;
			gap: 1rem;
		}
		
		.assessments-grid {
			grid-template-columns: 1fr;
		}

		.category-legend {
			flex-direction: column;
			gap: 0.5rem;
		}

		.legend-item {
			font-size: 0.8rem;
		}

		.left-spacer,
		.visit-details-label {
			width: 200px;
			padding: 0.5rem;
			font-size: 0.8rem;
		}

		.visit-number-cell,
		.phase-cell,
		.visit-detail-cell {
			padding: 0.5rem 0.25rem;
		}

		.visit-number,
		.phase-text {
			font-size: 0.75rem;
		}

		.burden-score-badge {
			font-size: 0.7rem;
			padding: 0.2rem 0.4rem;
		}

		.icon-indicator {
			width: 16px;
			height: 16px;
			font-size: 10px;
		}

		.assessment-count {
			font-size: 0.65rem;
		}

		.assessment-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
		}

		.burden-score-indicator {
			font-size: 0.65rem;
			padding: 0.15rem 0.3rem;
			min-width: 28px;
			align-self: flex-end;
		}
	}
</style> 
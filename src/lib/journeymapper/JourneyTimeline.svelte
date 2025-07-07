<script lang="ts">
	import { onMount } from 'svelte';
	import Drawer from './Drawer.svelte';
	import assessmentClassification from '../../data/journeymap/assessment_classification.json';
	import consolidatedAssessmentBurden from '../../data/journeymap/consolidated_assessment_burden.json';
	import { TIMELINE_DESIGN_SYSTEM, timelineStyles } from './timeline-design-system.js';

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

	// Constants
	const LEFT_PANEL_WIDTH = 250;

	// State
	let selectedVisit: ProcessedVisit | null = null;
	let hoveredVisit: ProcessedVisit | null = null;
	let mounted = false;
	let drawerOpen = false;

	// Dynamic cell sizing configuration
	$: cellSizingConfig = {
		minCellWidth: 80,
		maxCellWidth: 200,
		preferredCellWidth: 120,
		adaptToContent: true,
		responsiveBreakpoints: {
			mobile: 480,
			tablet: 768
		}
	};

	// Calculate dynamic cell dimensions based on visits and available space
	$: dynamicCellDimensions = (() => {
		if (processedVisits.length <= 1) {
			return {
				cellWidth: cellSizingConfig.preferredCellWidth,
				totalWidth: timelineWidth,
				cellPositions: [0.5] // Single cell centered
			};
		}

		// Calculate available space for cells
		const availableWidth = timelineWidth;
		const totalCells = processedVisits.length;
		
		// Calculate ideal cell width based on available space
		const idealCellWidth = Math.floor(availableWidth / totalCells);
		
		// Apply constraints
		const constrainedCellWidth = Math.max(
			cellSizingConfig.minCellWidth,
			Math.min(cellSizingConfig.maxCellWidth, idealCellWidth)
		);

		// Calculate positions for each cell
		const cellPositions = processedVisits.map(visit => visit.timelinePosition);
		
		// Calculate spacing between cells
		const cellSpacings = [];
		for (let i = 1; i < cellPositions.length; i++) {
			cellSpacings.push(cellPositions[i] - cellPositions[i - 1]);
		}
		
		// Use minimum spacing as basis for dynamic width
		const minSpacing = cellSpacings.length > 0 ? Math.min(...cellSpacings) : 1;
		const spacingBasedWidth = Math.max(
			cellSizingConfig.minCellWidth,
			Math.min(cellSizingConfig.maxCellWidth, minSpacing * timelineWidth * 0.8)
		);

		// Choose between ideal and spacing-based width
		const finalCellWidth = cellSizingConfig.adaptToContent 
			? Math.min(constrainedCellWidth, spacingBasedWidth)
			: constrainedCellWidth;

		return {
			cellWidth: finalCellWidth,
			totalWidth: timelineWidth,
			cellPositions: cellPositions,
			spacingBasedWidth: spacingBasedWidth,
			idealCellWidth: idealCellWidth
		};
	})();

	// Legacy support - maintaining backward compatibility
	$: calculatedCellWidth = dynamicCellDimensions.cellWidth;

	// Get burden color based on score (needed for tooltip)
	function getBurdenColor(score: number): string {
		return timelineStyles.getBurdenColor(score);
	}

	// Get burden level text (needed for tooltip)
	function getBurdenLevel(score: number): string {
		if (score <= 20) return 'Very Low';
		if (score <= 40) return 'Low';
		if (score <= 60) return 'Moderate';
		if (score <= 80) return 'High';
		return 'Very High';
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
		return timelineStyles.getCategoryColor(category);
	}

	// Get category background color (lighter version)
	function getCategoryBgColor(category: string): string {
		return timelineStyles.getCategoryBgColor(category);
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
					<div class="visit-numbers-container" style="
						--timeline-width: {timelineWidth}px;
						--cell-min-width: {cellSizingConfig.minCellWidth}px;
						--cell-max-width: {cellSizingConfig.maxCellWidth}px;
						--cell-count: {processedVisits.length};
						--dynamic-cell-width: {dynamicCellDimensions.cellWidth}px;
					">
						{#each processedVisits as visit, index}
							<div 
								class="visit-number-cell dynamic-cell"
								style="
									--visit-position: {visit.timelinePosition};
									--cell-index: {index};
									left: {visit.timelinePosition * timelineWidth - (dynamicCellDimensions.cellWidth / 2)}px;
									width: {dynamicCellDimensions.cellWidth}px;
								"
								on:mouseenter={() => handleVisitHover(visit)}
								on:mouseleave={handleVisitLeave}
								on:click={() => handleVisitClick(visit)}
								on:keydown={(e) => e.key === 'Enter' && handleVisitClick(visit)}
								role="button"
								tabindex="0"
							>
								<span class="visit-number">V{visit.visit_number}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

	
	</div>

	<!-- Hover tooltip -->
	{#if hoveredVisit}
		<div class="tooltip">
			<h3>{hoveredVisit.name}</h3>
			<p><strong>Study Day:</strong> {hoveredVisit.study_day || hoveredVisit.study_day_range}</p>
			<p><strong>Study Week:</strong> {hoveredVisit.study_week || 'Week ' + Math.abs(Math.floor(hoveredVisit.studyDay / 7))}</p>
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
	/* CSS Custom Properties from Design System */
	:root {
		--timeline-color-primary: #ffffff;
		--timeline-color-secondary: #f8fafc;
		--timeline-color-tertiary: #f1f5f9;
		--timeline-color-textPrimary: #1e293b;
		--timeline-color-textSecondary: #475569;
		--timeline-color-textTertiary: #64748b;
		--timeline-color-borderLight: #e2e8f0;
		--timeline-color-hoverPrimary: #f0f9ff;
		--timeline-spacing-xs: 0.25rem;
		--timeline-spacing-sm: 0.5rem;
		--timeline-spacing-md: 0.75rem;
		--timeline-spacing-lg: 1rem;
		--timeline-spacing-xl: 1.25rem;
		--timeline-spacing-2xl: 1.5rem;
		--timeline-font-xs: 0.75rem;
		--timeline-font-sm: 0.875rem;
		--timeline-font-base: 1rem;
		--timeline-font-semibold: 600;
		--timeline-dim-borderThin: 1px;
		--timeline-dim-borderMedium: 2px;
		--timeline-dim-radiusSmall: 4px;
		--timeline-dim-radiusMedium: 8px;
		--timeline-shadow-hover: 0 4px 16px rgba(59, 130, 246, 0.15);
		--timeline-shadow-medium: 0 4px 12px rgba(0, 0, 0, 0.1);
		--timeline-shadow-large: 0 8px 24px rgba(0, 0, 0, 0.1);
		--timeline-transition-normal: all 0.2s ease;
	}

	.timeline-grid-container {
		position: relative;
		margin-bottom: var(--timeline-spacing-lg);
		overflow: hidden;
		height: auto;
		width: 100%;
	}

	.timeline-grid-container.no-header {
		margin-bottom: 0;
		border-radius: 0;
	}

	.timeline-header-section {
		background: var(--timeline-color-secondary);
		border-bottom: var(--timeline-dim-borderThin) solid var(--timeline-color-borderLight);
		overflow: hidden;
	}

	.visit-numbers-row,
	.phase-info-row {
		display: flex;
		border-bottom: var(--timeline-dim-borderThin) solid var(--timeline-color-borderLight);
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
		overflow-x: auto;
		overflow-y: hidden;
		/* Support for dynamic cell sizing */
		--cell-spacing: calc(var(--timeline-width) / var(--cell-count));
		--adaptive-cell-width: clamp(
			var(--cell-min-width),
			var(--cell-spacing),
			var(--cell-max-width)
		);
	}

	.left-spacer {
		width: 250px;
		padding: 0 var(--timeline-spacing-lg);
		background: var(--timeline-color-tertiary);
		border-right: var(--timeline-dim-borderMedium) solid var(--timeline-color-borderLight);
		display: flex;
		align-items: center;
		font-weight: var(--timeline-font-semibold);
		color: var(--timeline-color-textSecondary);
		font-size: var(--timeline-font-sm);
		flex-shrink: 0;
		position: sticky;
		left: 0;
		z-index: 10;
	}

	.visit-number-cell {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--timeline-spacing-sm);
		height: 100%;
		box-sizing: border-box;
		cursor: pointer;
		transition: var(--timeline-transition-normal);
		border-radius: var(--timeline-dim-radiusSmall);
	}

	/* Dynamic cell sizing support */
	.dynamic-cell {
		/* Use CSS custom properties for responsive sizing */
		min-width: var(--cell-min-width, 80px);
		max-width: var(--cell-max-width, 200px);
		width: var(--dynamic-cell-width, var(--adaptive-cell-width, 120px));
		
		/* Enable smooth transitions when cell dimensions change */
		transition: var(--timeline-transition-normal), width 0.3s ease;
		
		/* Ensure content remains centered */
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Responsive behavior for dynamic cells */
	@container (max-width: 768px) {
		.dynamic-cell {
			min-width: 60px;
			max-width: 120px;
			font-size: 0.8rem;
		}
	}

	@container (max-width: 480px) {
		.dynamic-cell {
			min-width: 50px;
			max-width: 100px;
			font-size: 0.75rem;
		}
	}

	.phase-cell {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--timeline-spacing-sm);
		height: 100%;
		box-sizing: border-box;
	}

	.visit-number-cell:hover {
		background-color: var(--timeline-color-hoverPrimary);
		transform: translateY(-1px);
		box-shadow: var(--timeline-shadow-hover);
	}

	.visit-number-cell:focus-visible {
		outline: var(--timeline-dim-borderMedium) solid #3b82f6;
		outline-offset: 2px;
	}

	.visit-number {
		font-weight: var(--timeline-font-semibold);
		color: var(--timeline-color-textPrimary);
		font-size: var(--timeline-font-sm);
	}

	.phase-text {
		font-size: var(--timeline-font-xs);
		color: var(--timeline-color-textTertiary);
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
		padding: var(--timeline-spacing-lg);
		background: var(--timeline-color-secondary);
		border-right: var(--timeline-dim-borderMedium) solid var(--timeline-color-borderLight);
		display: flex;
		align-items: center;
		font-weight: var(--timeline-font-semibold);
		color: var(--timeline-color-textSecondary);
		font-size: var(--timeline-font-sm);
	}

	.visit-detail-cell {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--timeline-spacing-md);
		cursor: pointer;
		transition: var(--timeline-transition-normal);
		height: 100%;
		gap: var(--timeline-spacing-sm);
		box-sizing: border-box;
	}

	.visit-detail-cell:hover {
		background-color: var(--timeline-color-secondary);
		transform: translateY(-1px);
		box-shadow: var(--timeline-shadow-medium);
	}

	.visit-detail-cell.selected {
		background-color: #3b82f6;
	}

	.visit-detail-cell.hovered {
		background-color: var(--timeline-color-hoverPrimary);
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
		background: var(--timeline-color-primary);
		border: var(--timeline-dim-borderThin) solid var(--timeline-color-borderLight);
		border-radius: var(--timeline-dim-radiusMedium);
		padding: var(--timeline-spacing-lg);
		box-shadow: var(--timeline-shadow-large);
		z-index: 20;
		min-width: 250px;
	}

	.tooltip h3 {
		margin: 0 0 var(--timeline-spacing-sm) 0;
		color: var(--timeline-color-textPrimary);
	}

	.tooltip p {
		margin: var(--timeline-spacing-xs) 0;
		color: var(--timeline-color-textSecondary);
		font-size: var(--timeline-font-sm);
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
		color: var(--timeline-color-textSecondary);
	}

	.info-item strong {
		color: var(--timeline-color-textPrimary);
	}

	.burden-badge {
		color: white;
		padding: var(--timeline-spacing-xs) var(--timeline-spacing-sm);
		border-radius: 10px;
		font-size: var(--timeline-font-sm);
		font-weight: 500;
	}

	.assessments-header {
		margin-bottom: var(--timeline-spacing-2xl);
	}

	.assessments-section h3 {
		color: var(--timeline-color-textPrimary);
		margin-bottom: var(--timeline-spacing-md);
	}

	.category-legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--timeline-spacing-lg);
		margin-bottom: var(--timeline-spacing-sm);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--timeline-spacing-sm);
		font-size: var(--timeline-font-sm);
		color: var(--timeline-color-textTertiary);
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
		background: var(--timeline-color-secondary);
		padding: var(--timeline-spacing-md);
		font-size: var(--timeline-font-sm);
		color: var(--timeline-color-textSecondary);
		transition: var(--timeline-transition-normal);
	}

	.assessment-item.categorized {
		font-weight: 500;
	}

	.assessment-item.categorized:hover {
		transform: translateX(2px);
		box-shadow: var(--timeline-shadow-medium);
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
			/* Adjust cell spacing for mobile */
			--cell-min-width: 60px;
			--cell-max-width: 120px;
		}
		
		.tooltip {
			position: static;
			margin: var(--timeline-spacing-lg) 0;
		}
		
		.visit-info {
			flex-direction: column;
			gap: var(--timeline-spacing-lg);
		}
		
		.assessments-grid {
			grid-template-columns: 1fr;
		}

		.category-legend {
			flex-direction: column;
			gap: var(--timeline-spacing-sm);
		}

		.legend-item {
			font-size: var(--timeline-font-xs);
		}

		.left-spacer,
		.visit-details-label {
			padding: var(--timeline-spacing-sm);
			font-size: var(--timeline-font-xs);
		}

		.visit-number-cell,
		.phase-cell,
		.visit-detail-cell {
			padding: var(--timeline-spacing-sm) var(--timeline-spacing-xs);
		}

		/* Dynamic cell responsive adjustments */
		.dynamic-cell {
			padding: var(--timeline-spacing-sm) var(--timeline-spacing-xs);
		}

		.visit-number,
		.phase-text {
			font-size: var(--timeline-font-xs);
		}

		.burden-score-badge {
			font-size: var(--timeline-font-xs);
			padding: var(--timeline-spacing-xs) var(--timeline-spacing-sm);
		}

		.icon-indicator {
			width: 16px;
			height: 16px;
			font-size: 10px;
		}

		.assessment-count {
			font-size: var(--timeline-font-xs);
		}

		.assessment-content {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--timeline-spacing-xs);
		}

		.burden-score-indicator {
			font-size: var(--timeline-font-xs);
			padding: var(--timeline-spacing-xs) var(--timeline-spacing-sm);
			min-width: 28px;
			align-self: flex-end;
		}
	}
</style> 
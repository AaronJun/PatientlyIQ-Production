<script lang="ts">
	import { onMount } from 'svelte';
	import Drawer from './Drawer.svelte';

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

	// Props
	export let visits: Visit[] = [];
	export let timelineWidth: number = 1000;
	export let hideHeader: boolean = false;

	// State
	let mounted = false;
	let selectedVisit: ProcessedVisit | null = null;
	let hoveredVisit: ProcessedVisit | null = null;
	let drawerOpen = false;

	// Dynamic cell sizing configuration
	$: cellSizingConfig = {
		minCellWidth: 100,
		maxCellWidth: 500,
		preferredCellWidth: 500,
		adaptToContent: true
	};

	// Calculate dynamic cell dimensions
	$: dynamicCellDimensions = (() => {
		if (processedVisits.length <= 1) {
			return {
				cellWidth: cellSizingConfig.preferredCellWidth,
				totalWidth: timelineWidth
			};
		}

		const availableWidth = timelineWidth;
		const totalCells = processedVisits.length;
		const idealCellWidth = Math.floor(availableWidth / totalCells);
		
		const constrainedCellWidth = Math.max(
			cellSizingConfig.minCellWidth,
			Math.min(cellSizingConfig.maxCellWidth, idealCellWidth)
		);

		const cellPositions = processedVisits.map(visit => visit.timelinePosition);
		const cellSpacings = [];
		for (let i = 1; i < cellPositions.length; i++) {
			cellSpacings.push(cellPositions[i] - cellPositions[i - 1]);
		}
		
		const minSpacing = cellSpacings.length > 0 ? Math.min(...cellSpacings) : 1;
		const spacingBasedWidth = Math.max(
			cellSizingConfig.minCellWidth,
			Math.min(cellSizingConfig.maxCellWidth, minSpacing * timelineWidth * 0.8)
		);

		const finalCellWidth = cellSizingConfig.adaptToContent 
			? Math.min(constrainedCellWidth, spacingBasedWidth)
			: constrainedCellWidth;

		return {
			cellWidth: finalCellWidth,
			totalWidth: timelineWidth
		};
	})();

	// Parse study day from visit data
	function parseStudyDay(visit: Visit): number {
		if (visit.study_day) {
			const match = visit.study_day.match(/^(-?\d+)/);
			return match ? parseInt(match[1]) : 0;
		} else if (visit.study_day_range) {
			const match = visit.study_day_range.match(/^(-?\d+)/);
			return match ? parseInt(match[1]) : 0;
		}
		return 0;
	}

	// Calculate timeline position for visit
	function getTimelinePosition(visit: Visit): number {
		const studyDay = parseStudyDay(visit);
		const minDay = Math.min(...visits.map(parseStudyDay));
		const maxDay = Math.max(...visits.map(parseStudyDay));
		const range = maxDay - minDay;
		
		const padding = 0.1;
		const position = ((studyDay - minDay) / range) * (1 - 2 * padding) + padding;
		
		return position;
	}

	// Calculate burden score for visit
	function calculateBurdenScore(assessments: string[]): number {
		let score = assessments.length * 3;
		
		const highBurdenAssessments: Record<string, number> = {
			'Physical and Neurologic Exam': 15,
			'Ophthalmologic Exam': 20,
			'Clinical Laboratory Tests': 12,
			'ECG': 10,
			'PK Blood Samples': 18,
			'Medical and Psychiatric History': 12,
			'Diary Training': 8
		};

		assessments.forEach(assessment => {
			if (highBurdenAssessments[assessment]) {
				score += highBurdenAssessments[assessment];
			}
		});

		return Math.min(Math.round(score), 100);
	}

	// Get burden color based on score
	function getBurdenColor(score: number): string {
		if (score <= 20) return '#22c55e';
		if (score <= 40) return '#84cc16';
		if (score <= 60) return '#eab308';
		if (score <= 80) return '#f97316';
		return '#ef4444';
	}

	// Get burden level text
	function getBurdenLevel(score: number): string {
		if (score <= 20) return 'Very Low';
		if (score <= 40) return 'Low';
		if (score <= 60) return 'Moderate';
		if (score <= 80) return 'High';
		return 'Very High';
	}

	// Process visits with calculated data
	$: processedVisits = visits.map((visit): ProcessedVisit => ({
		...visit,
		burdenScore: calculateBurdenScore(visit.assessments),
		timelinePosition: getTimelinePosition(visit),
		studyDay: parseStudyDay(visit)
	})).sort((a, b) => a.studyDay - b.studyDay);

	// Event handlers
	function handleVisitClick(visit: ProcessedVisit) {
		selectedVisit = selectedVisit?.visit_number === visit.visit_number ? null : visit;
		drawerOpen = selectedVisit !== null;
	}

	function handleVisitHover(visit: ProcessedVisit) {
		hoveredVisit = visit;
	}

	function handleVisitLeave() {
		hoveredVisit = null;
	}

	function closeDrawer() {
		selectedVisit = null;
		drawerOpen = false;
	}

	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted}
	<div class="timeline-container">
		{#if !hideHeader}
			<!-- Timeline Header -->
			<div class="timeline-header" style="
				width: {timelineWidth}px;
				--timeline-width: {timelineWidth}px;
				--cell-count: {processedVisits.length};
				--dynamic-cell-width: {dynamicCellDimensions.cellWidth}px;
			">
				<div class="header-spacer">Visit Details</div>
				<div class="header-content">
					{#each processedVisits as visit, index}
						<div 
							class="header-cell"
							style="
								left: {visit.timelinePosition * timelineWidth - (dynamicCellDimensions.cellWidth / 2)}px;
								width: {dynamicCellDimensions.cellWidth}px;
							"
						>
							<div class="visit-number">V{visit.visit_number}</div>
							<div class="visit-name">{visit.name}</div>
							<div class="study-info">
								{visit.study_day || visit.study_day_range || 'Day ' + visit.studyDay}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Timeline Content -->
		<div class="timeline-content" style="
			width: {timelineWidth}px;
			--timeline-width: {timelineWidth}px;
			--cell-count: {processedVisits.length};
			--dynamic-cell-width: {dynamicCellDimensions.cellWidth}px;
		">
			<div class="content-spacer">Burden Analysis</div>
			<div class="content-area">
				{#each processedVisits as visit, index}
					<div 
						class="visit-cell"
						style="
							left: {visit.timelinePosition * timelineWidth - (dynamicCellDimensions.cellWidth / 2)}px;
							width: {dynamicCellDimensions.cellWidth}px;
						"
						on:click={() => handleVisitClick(visit)}
						on:mouseenter={() => handleVisitHover(visit)}
						on:mouseleave={handleVisitLeave}
						on:keydown={(e) => e.key === 'Enter' && handleVisitClick(visit)}
						role="button"
						tabindex="0"
					>
						<!-- Burden Score Badge -->
						<div class="burden-badge" style="background-color: {getBurdenColor(visit.burdenScore)};">
							{visit.burdenScore}
						</div>

						<!-- Visit Indicators -->
						<div class="visit-indicators">
							{#if visit.travel_required}
								<div class="indicator travel" title="Travel Required">✈</div>
							{/if}
							{#if visit.assessments.some(a => a.toLowerCase().includes('exam'))}
								<div class="indicator exam" title="Physical Exam">👩‍⚕️</div>
							{/if}
							{#if visit.assessments.some(a => a.toLowerCase().includes('blood') || a.toLowerCase().includes('pk'))}
								<div class="indicator blood" title="Blood Work">💉</div>
							{/if}
						</div>

						<!-- Assessment Count -->
						<div class="assessment-count">
							{visit.assessments.length} assessments
						</div>

						<!-- Burden Level -->
						<div class="burden-level">
							{getBurdenLevel(visit.burdenScore)}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Hover Tooltip -->
	{#if hoveredVisit}
		<div class="tooltip">
			<h3>{hoveredVisit.name}</h3>
			<p><strong>Visit:</strong> {hoveredVisit.visit_number}</p>
			<p><strong>Study Day:</strong> {hoveredVisit.study_day || hoveredVisit.study_day_range}</p>
			<p><strong>Burden Score:</strong> 
				<span style="color: {getBurdenColor(hoveredVisit.burdenScore)};">
					{hoveredVisit.burdenScore}/100 ({getBurdenLevel(hoveredVisit.burdenScore)})
				</span>
			</p>
			<p><strong>Assessments:</strong> {hoveredVisit.assessments.length} items</p>
			
			{#if hoveredVisit.travel_required}
				<p><strong>⚠️ Travel Required</strong></p>
			{/if}
			
			<div class="tooltip-assessments">
				<strong>Key Assessments:</strong>
				<ul>
					{#each hoveredVisit.assessments.slice(0, 3) as assessment}
						<li>{assessment}</li>
					{/each}
					{#if hoveredVisit.assessments.length > 3}
						<li>... and {hoveredVisit.assessments.length - 3} more</li>
					{/if}
				</ul>
			</div>
		</div>
	{/if}

	<!-- Visit Details Drawer -->
	{#if selectedVisit}
		<Drawer 
			bind:isOpen={drawerOpen}
			title="Visit {selectedVisit.visit_number}: {selectedVisit.name}"
			width="600px"
			on:close={closeDrawer}
		>
			<div class="drawer-content">
				<!-- Visit Overview -->
				<div class="visit-overview">
					<div class="overview-item">
						<strong>Study Day:</strong>
						<span>{selectedVisit.study_day || selectedVisit.study_day_range}</span>
					</div>
					<div class="overview-item">
						<strong>Study Week:</strong>
						<span>{selectedVisit.study_week || 'Week ' + Math.abs(Math.floor(selectedVisit.studyDay / 7))}</span>
					</div>
					<div class="overview-item">
						<strong>Burden Score:</strong>
						<div class="burden-display" style="background-color: {getBurdenColor(selectedVisit.burdenScore)};">
							{selectedVisit.burdenScore}/100 - {getBurdenLevel(selectedVisit.burdenScore)}
						</div>
					</div>
				</div>

				<!-- Visit Characteristics -->
				<div class="visit-characteristics">
					<h4>Visit Characteristics</h4>
					<div class="characteristics-grid">
						{#if selectedVisit.travel_required}
							<div class="characteristic">
								<span class="char-icon">✈️</span>
								<span>Travel Required</span>
							</div>
						{/if}
						<div class="characteristic">
							<span class="char-icon">📋</span>
							<span>{selectedVisit.assessments.length} Assessments</span>
						</div>
						<div class="characteristic">
							<span class="char-icon">⏱️</span>
							<span>Day {selectedVisit.studyDay}</span>
						</div>
					</div>
				</div>

				<!-- Assessment List -->
				<div class="assessment-list">
					<h4>Assessments ({selectedVisit.assessments.length})</h4>
					<div class="assessments-grid">
						{#each selectedVisit.assessments as assessment}
							<div class="assessment-item">
								<span class="assessment-name">{assessment}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</Drawer>
	{/if}
{/if}

<style>
	.timeline-container {
		position: relative;
		width: 100%;
		background: #f9fafb;
		border-radius: 8px;
		overflow: hidden;
	}

	/* Timeline Header */
	.timeline-header {
		position: relative;
		height: 100px;
		background: white;
		border-bottom: 2px solid #e5e7eb;
		display: flex;
	}

	.header-spacer {
		width: 250px;
		background: #f1f5f9;
		border-right: 2px solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #374151;
		text-transform: uppercase;
		font-size: 0.875rem;
		letter-spacing: 0.05em;
	}

	.header-content {
		position: relative;
		flex: 1;
		height: 100%;
	}

	.header-cell {
		position: absolute;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		text-align: center;
		border-radius: 4px;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.header-cell:hover {
		background: rgba(59, 130, 246, 0.1);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
	}

	.visit-number {
		font-weight: 700;
		font-size: 1rem;
		color: #1f2937;
		margin-bottom: 0.25rem;
	}

	.visit-name {
		font-size: 0.75rem;
		color: #7c3aed;
		font-weight: 500;
		margin-bottom: 0.25rem;
		line-height: 1.2;
	}

	.study-info {
		font-size: 0.7rem;
		color: #6b7280;
		font-weight: 400;
	}

	/* Timeline Content */
	.timeline-content {
		position: relative;
		height: 120px;
		background: white;
		display: flex;
	}

	.content-spacer {
		width: 250px;
		background: #f8fafc;
		border-right: 2px solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #374151;
		text-transform: uppercase;
		font-size: 0.875rem;
		letter-spacing: 0.05em;
	}

	.content-area {
		position: relative;
		flex: 1;
		height: 100%;
	}

	.visit-cell {
		position: absolute;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		text-align: center;
		border-radius: 8px;
		transition: all 0.2s ease;
		cursor: pointer;
		gap: 0.25rem;
	}

	.visit-cell:hover {
		background: rgba(59, 130, 246, 0.05);
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
	}

	.visit-cell:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.burden-badge {
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 700;
		min-width: 2rem;
		text-align: center;
	}

	.visit-indicators {
		display: flex;
		gap: 0.25rem;
		margin: 0.25rem 0;
	}

	.indicator {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		background: #f3f4f6;
		border: 1px solid #d1d5db;
	}

	.indicator.travel {
		background: #fef3c7;
		border-color: #f59e0b;
	}

	.indicator.exam {
		background: #dbeafe;
		border-color: #3b82f6;
	}

	.indicator.blood {
		background: #fecaca;
		border-color: #ef4444;
	}

	.assessment-count {
		font-size: 0.7rem;
		color: #6b7280;
		font-weight: 500;
	}

	.burden-level {
		font-size: 0.65rem;
		color: #374151;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Tooltip */
	.tooltip {
		position: fixed;
		top: 20px;
		right: 20px;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		z-index: 50;
		min-width: 280px;
		max-width: 320px;
	}

	.tooltip h3 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
		font-size: 1.1rem;
	}

	.tooltip p {
		margin: 0.25rem 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.tooltip-assessments {
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid #e5e7eb;
	}

	.tooltip-assessments ul {
		margin: 0.5rem 0 0 0;
		padding-left: 1.25rem;
	}

	.tooltip-assessments li {
		margin: 0.25rem 0;
		font-size: 0.8rem;
		color: #6b7280;
	}

	/* Drawer Content */
	.drawer-content {
		padding: 0;
	}

	.visit-overview {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 8px;
	}

	.overview-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.overview-item strong {
		color: #374151;
	}

	.burden-display {
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.visit-characteristics {
		margin-bottom: 2rem;
	}

	.visit-characteristics h4 {
		margin: 0 0 1rem 0;
		color: #1f2937;
		font-size: 1.1rem;
	}

	.characteristics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.characteristic {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #f3f4f6;
		border-radius: 6px;
	}

	.char-icon {
		font-size: 1.25rem;
	}

	.assessment-list h4 {
		margin: 0 0 1rem 0;
		color: #1f2937;
		font-size: 1.1rem;
	}

	.assessments-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.5rem;
	}

	.assessment-item {
		padding: 0.75rem;
		background: #f8fafc;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		transition: all 0.2s ease;
	}

	.assessment-item:hover {
		background: #f1f5f9;
		border-color: #d1d5db;
		transform: translateY(-1px);
	}

	.assessment-name {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.timeline-header {
			height: 80px;
		}

		.timeline-content {
			height: 100px;
		}

		.header-spacer,
		.content-spacer {
			width: 200px;
			font-size: 0.75rem;
		}

		.visit-number {
			font-size: 0.875rem;
		}

		.visit-name {
			font-size: 0.7rem;
		}

		.study-info {
			font-size: 0.65rem;
		}

		.tooltip {
			position: static;
			margin: 1rem 0;
			max-width: 100%;
		}

		.visit-overview {
			padding: 1rem;
		}

		.characteristics-grid {
			grid-template-columns: 1fr;
		}

		.assessments-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 480px) {
		.header-spacer,
		.content-spacer {
			width: 150px;
			font-size: 0.7rem;
		}

		.visit-cell {
			padding: 0.25rem;
		}

		.burden-badge {
			font-size: 0.7rem;
			padding: 0.2rem 0.4rem;
		}

		.assessment-count,
		.burden-level {
			font-size: 0.6rem;
		}
	}
</style> 
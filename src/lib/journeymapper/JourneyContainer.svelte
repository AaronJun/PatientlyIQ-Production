<script lang="ts">
	import { onMount } from 'svelte';
	import PersonaGrid from './PersonaGrid.svelte';
	import JourneyTimeline from './JourneyTimeline.svelte';

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
	export let timelineWidth: number = 2200;

	// Constants
	const LEFT_PANEL_WIDTH = 250;
	const TIMELINE_HEADER_HEIGHT = 120; // Increased to accommodate multiple rows

	let mounted = false;

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

	// Timeline positioning logic (shared between components)
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

	function getTimelinePosition(visit: Visit): number {
		const studyDay = parseStudyDay(visit);
		const minDay = Math.min(...visits.map(parseStudyDay));
		const maxDay = Math.max(...visits.map(parseStudyDay));
		const range = maxDay - minDay;
		
		const padding = 0.1;
		const position = ((studyDay - minDay) / range) * (1 - 2 * padding) + padding;
		
		return position;
	}

	// Process visits with calculated data
	$: processedVisits = visits.map((visit): ProcessedVisit => ({
		...visit,
		burdenScore: 0, // Will be calculated in child components
		timelinePosition: getTimelinePosition(visit),
		studyDay: parseStudyDay(visit)
	})).sort((a, b) => a.studyDay - b.studyDay);

	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted}
	<div class="journey-container">
		<!-- Unified Timeline Header -->
		<div class="unified-timeline-header" style="width: {timelineWidth + LEFT_PANEL_WIDTH}px; height: {TIMELINE_HEADER_HEIGHT}px;">
			<!-- Left panel spacer -->
			<div class="header-left-spacer" style="width: {LEFT_PANEL_WIDTH}px;"></div>
			
			<!-- Timeline content area -->
			<div class="timeline-content-area" style="
				width: {timelineWidth}px;
				--timeline-width: {timelineWidth}px;
				--cell-min-width: {cellSizingConfig.minCellWidth}px;
				--cell-max-width: {cellSizingConfig.maxCellWidth}px;
				--cell-count: {processedVisits.length};
				--dynamic-cell-width: {dynamicCellDimensions.cellWidth}px;
			">
				<!-- Visit numbers row -->
				<div class="header-row visit-numbers-row">
					{#each processedVisits as visit, index}
						<div 
							class="header-cell visit-number-cell dynamic-cell"
							style="
								--visit-position: {visit.timelinePosition};
								--cell-index: {index};
								left: {visit.timelinePosition * timelineWidth - (dynamicCellDimensions.cellWidth / 1.25)}px;
								width: {dynamicCellDimensions.cellWidth}px;
							"
						>
							<span class="visit-number">V{visit.visit_number}</span>
						</div>
					{/each}
				</div>

				<!-- Study weeks row -->
				<div class="header-row study-weeks-row">
					{#each processedVisits as visit, index}
						<div 
							class="header-cell study-week-cell dynamic-cell w-full"
							style="
								--visit-position: {visit.timelinePosition};
								--cell-index: {index};
								left: {visit.timelinePosition * timelineWidth - (dynamicCellDimensions.cellWidth / 1.25)}px;
								width: {dynamicCellDimensions.cellWidth * 2}px;
							"
						>
							<span class="study-week">
								{visit.study_week || 'Week ' + Math.abs(Math.floor(visit.studyDay / 7))}
							</span>
						</div>
					{/each}
				</div>

			</div>
		</div>

		<!-- Journey Timeline (Visit Details) -->
		<div class="timeline-section">
			<JourneyTimeline {visits} {timelineWidth} hideHeader={true} />
		</div>

		<!-- Persona Grid -->
		<div class="persona-section">
			<PersonaGrid {visits} {timelineWidth} hideHeader={true}  />
		</div>
	</div>
{/if}

<style>
	.journey-container {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #f9fafb;
		border-radius: 8px;
	}

	/* === UNIFIED TIMELINE HEADER === */
	.unified-timeline-header {
		position: relative;
		background: white;
		border-bottom: 2px solid #e5e7eb;
		z-index: 20;
		display: flex;
		overflow: hidden;
	}

	.header-left-spacer {
		background: #f1f5f9;
		border-right: 2px solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #374151;
		font-size: 0.9rem;
		position: sticky;
		left: 0;
		z-index: 25;
		flex-shrink: 0;
	}

	.header-left-spacer::after {
		content: 'Timeline';
	}

	.timeline-content-area {
		position: relative;
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

	.header-row {
		position: absolute;
		width: 100%;
		height: 30px;
		display: flex;
		align-items: center;
	}

	.visit-numbers-row {
		top: 0;
		background: rgba(59, 130, 246, 0.05);
	}

	.study-days-row {
		top: 30px;
		background: rgba(16, 185, 129, 0.05);
	}

	.study-weeks-row {
		top: 60px;
		background: rgba(245, 158, 11, 0.05);
	}

	.visit-names-row {
		top: 90px;
		background: rgba(139, 92, 246, 0.05);
	}

	.header-cell {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		padding: 0.25rem;
		box-sizing: border-box;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 4px;
	}

	.header-cell:hover {
		background: rgba(59, 130, 246, 0.1);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
	}

	/* Dynamic cell sizing support */
	.dynamic-cell {
		/* Use CSS custom properties for responsive sizing */
		min-width: var(--cell-min-width, 80px);
		max-width: var(--cell-max-width, 200px);
		width: var(--dynamic-cell-width, var(--adaptive-cell-width, 120px));
		
		/* Enable smooth transitions when cell dimensions change */
		transition: all 0.2s ease, width 0.3s ease;
		
		/* Ensure content remains centered */
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.visit-number {
		font-weight: 700;
		font-size: 0.9rem;
		color: #1f2937;
	}

	.study-week {
		font-size: 0.75rem;
		color: #d97706;
		font-weight: 500;
	}

	.visit-name {
		font-size: 0.65rem;
		color: #7c3aed;
		font-weight: 500;
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* === SECTION STYLING === */
	.timeline-section {
		position: relative;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		overflow: hidden;
	}

	.persona-section {
		position: relative;
		background: #f9fafb;
		min-height: 300px; /* Ensure minimum height */
		overflow: hidden;
	}

	/* === RESPONSIVE DESIGN === */
	@media (max-width: 768px) {
		.unified-timeline-header {
			flex-direction: column;
			height: auto !important;
		}

		.header-left-spacer {
			width: 100% !important;
			min-height: 40px;
			height: 40px;
			border-right: none;
			border-bottom: 2px solid #e5e7eb;
		}

		.timeline-content-area {
			width: 100% !important;
			overflow-x: auto;
			padding: 0 1rem;
		}

		.header-row {
			position: static;
			height: 35px;
			border-bottom: 1px solid #e5e7eb;
		}

		.header-cell {
			position: relative;
			min-width: 60px;
			padding: 0.5rem 0.25rem;
		}

		.visit-number,
		.study-week {
			font-size: 0.7rem;
		}

		.visit-name {
			font-size: 0.6rem;
		}
	}

	@media (max-width: 480px) {
		.timeline-content-area {
			padding: 0 0.5rem;
		}

		.header-cell {
			min-width: 100px;
			padding: 0.25rem 0.125rem;
		}

		.visit-number,
		.study-week {
			font-size: 0.65rem;
		}

		.visit-name {
			font-size: 0.55rem;
		}
	}
</style> 
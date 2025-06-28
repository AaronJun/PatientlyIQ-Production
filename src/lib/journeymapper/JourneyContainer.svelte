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
	export let timelineWidth: number = 1500;

	// Constants
	const LEFT_PANEL_WIDTH = 250;
	const TIMELINE_HEADER_HEIGHT = 150; // Increased to accommodate multiple rows

	let mounted = false;

	// Dynamic cell dimensions based on timeline width and number of visits
	$: dynamicCellWidth = visits.length > 0 
		? Math.max(60, Math.min(120, timelineWidth / (visits.length * 1.2))) 
		: 80;
	$: cellPadding = Math.max(4, dynamicCellWidth * 0.1);

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
			<div class="timeline-content-area" style="width: {timelineWidth}px;">
				<!-- Visit numbers row -->
				<div class="header-row visit-numbers-row">
					{#each processedVisits as visit}
						<div 
							class="header-cell visit-number-cell"
							style="
								left: {visit.timelinePosition * timelineWidth - (dynamicCellWidth / 2)}px;
								width: {dynamicCellWidth}px;
							"
						>
							<span class="visit-number">V{visit.visit_number}</span>
						</div>
					{/each}
				</div>

				<!-- Study days row -->
				<div class="header-row study-days-row">
					{#each processedVisits as visit}
						<div 
							class="header-cell study-day-cell"
							style="
								left: {visit.timelinePosition * timelineWidth - (dynamicCellWidth * 0.8 / 2)}px;
								width: {dynamicCellWidth * 0.8}px;
							"
						>
							<span class="study-day text-2xs font-semibold text-slate-500">
								{#if visit.study_day}
									Day {visit.study_day}
								{:else if visit.study_day_range}
									{visit.study_day_range}
								{:else}
									Day {visit.studyDay}
								{/if}
							</span>
						</div>
					{/each}
				</div>

				<!-- Study weeks row -->
				<div class="header-row study-weeks-row">
					{#each processedVisits as visit}
						<div 
							class="header-cell study-week-cell"
							style="
								left: {visit.timelinePosition * timelineWidth - (dynamicCellWidth * 0.8 / 2)}px;
								width: {dynamicCellWidth * 0.8}px;
							"
						>
							<span class="study-week">
								{visit.study_week || 'Week ' + Math.abs(Math.floor(visit.studyDay / 7))}
							</span>
						</div>
					{/each}
				</div>

				<!-- Visit names row -->
				<div class="header-row visit-names-row">
					{#each processedVisits as visit}
						<div 
							class="header-cell visit-name-cell"
							style="
								left: {visit.timelinePosition * timelineWidth - (dynamicCellWidth * 0.8 / 2)}px;
								width: {dynamicCellWidth * 0.8}px;
							"
							title="{visit.name} - Study Day {visit.studyDay}"
						>
							<span class="visit-name">{visit.name}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Journey Timeline (Visit Details) -->
		<div class="timeline-section">
			<JourneyTimeline {visits} {timelineWidth} hideHeader={true} {dynamicCellWidth} />
		</div>

		<!-- Persona Grid -->
		<div class="persona-section">
			<PersonaGrid {visits} {timelineWidth} hideHeader={true} headerHeight={TIMELINE_HEADER_HEIGHT} {dynamicCellWidth} />
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
		overflow: hidden;
	}

	/* === UNIFIED TIMELINE HEADER === */
	.unified-timeline-header {
		position: relative;
		background: white;
		border-bottom: 2px solid #e5e7eb;
		z-index: 20;
		display: flex;
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
	}

	.header-left-spacer::after {
		content: 'Timeline';
	}

	.timeline-content-area {
		position: relative;
		flex: 1;
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
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	/* === SECTION STYLING === */
	.timeline-section {
		position: relative;
		background: white;
		border-bottom: 1px solid #e5e7eb;
	}

	.persona-section {
		position: relative;
		background: #f9fafb;
		min-height: 300px; /* Ensure minimum height */
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
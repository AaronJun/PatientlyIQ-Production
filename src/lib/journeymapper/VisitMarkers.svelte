<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Plane, Syringe, Slice } from 'lucide-svelte';
	import assessmentClassification from '../../data/journeymap/assessment_classification.json';

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
	export let selectedVisit: ProcessedVisit | null = null;
	export let hoveredVisit: ProcessedVisit | null = null;

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		visitClick: ProcessedVisit;
		visitHover: ProcessedVisit;
		visitLeave: void;
	}>();

	// Create assessment classification lookup
	const assessmentClassificationMap = new Map<string, string>();
	assessmentClassification.forEach((item: any) => {
		assessmentClassificationMap.set(item.assessment, item.category);
	});

	// Get assessment category
	function getAssessmentCategory(assessment: string): string {
		return assessmentClassificationMap.get(assessment) || 'Unknown';
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
			'Physical and Neurologic Exam': 15,
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

	// Calculate position along timeline
	function getTimelinePosition(visit: Visit): number {
		const studyDay = parseStudyDay(visit);
		const minDay = Math.min(...visits.map(parseStudyDay));
		const maxDay = Math.max(...visits.map(parseStudyDay));
		const range = maxDay - minDay;
		
		// Position as percentage of timeline width, with padding
		const padding = 0.1; // 10% padding on each side
		const position = ((studyDay - minDay) / range) * (1 - 2 * padding) + padding;
		
		return position * timelineWidth;
	}

	// Get burden color based on score
	function getBurdenColor(score: number): string {
		if (score < 30) return '#22c55e'; // green
		if (score < 60) return '#f59e0b'; // amber
		return '#ef4444'; // red
	}

	// Process visits with calculated data
	$: processedVisits = visits.map((visit): ProcessedVisit => ({
		...visit,
		burdenScore: calculateBurdenScore(visit.assessments),
		timelinePosition: getTimelinePosition(visit),
		studyDay: parseStudyDay(visit)
	})).sort((a, b) => a.studyDay - b.studyDay);

	function handleVisitClick(visit: ProcessedVisit): void {
		dispatch('visitClick', visit);
	}

	function handleVisitHover(visit: ProcessedVisit): void {
		dispatch('visitHover', visit);
	}

	function handleVisitLeave(): void {
		dispatch('visitLeave');
	}

	function handleKeydown(event: KeyboardEvent, visit: ProcessedVisit): void {
		if (event.key === 'Enter') {
			handleVisitClick(visit);
		}
	}
</script>

<!-- Timeline axis -->
<div class="timeline-axis-visits" style="width: {timelineWidth}px;">
	<div class="timeline-line"></div>
	
	<!-- Visit markers -->
	{#each processedVisits as visit}
		<div 
			class="visit-marker" 
			class:selected={selectedVisit?.visit_number === visit.visit_number}
			class:hovered={hoveredVisit?.visit_number === visit.visit_number}
			style="left: {visit.timelinePosition}px; border-color: {getBurdenColor(visit.burdenScore)};"
			on:click={() => handleVisitClick(visit)}
			on:mouseenter={() => handleVisitHover(visit)}
			on:mouseleave={handleVisitLeave}
			role="button"
			tabindex="0"
			on:keydown={(e) => handleKeydown(e, visit)}
		>
			<div class="visit-number">{visit.visit_number}</div>
			{#if selectedVisit?.visit_number === visit.visit_number}
				<div class="visit-name">{visit.name}</div>
				<div class="study-day">Day {visit.studyDay}</div>
			{/if}
			
			<!-- Burden indicator -->
			<div class="burden-indicator" style="background-color: {getBurdenColor(visit.burdenScore)};">
				<span class="burden-score">{visit.burdenScore}</span>
			</div>

			<!-- Icon indicators -->
			<div class="icon-indicators">
				{#if visit.travel_required}
					<div class="icon-circle travel" title="Travel Required">
						<Plane size={12} />
					</div>
				{/if}
				{#if hasInvasiveAssessments(visit)}
					<div class="icon-circle invasive" title="Invasive Procedures">
						<Syringe size={12} />
					</div>
				{/if}
				{#if hasSurgicalAssessments(visit)}
					<div class="icon-circle surgical" title="Surgical Procedures">
						<Slice size={12} />
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.timeline-axis-visits {
		position: relative;
		height: 120px;
		margin: 0 auto;
	}

	.timeline-line {
		position: absolute;
		top: 60px;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(to right, #e5e7eb, #9ca3af, #e5e7eb);
	}

	.visit-marker {
		position: absolute;
		transform: translateX(-50%);
		cursor: pointer;
		padding: 0.5rem 0.75rem;
		background: white;
		border: 1px solid;
		border-radius: 100px;
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
		min-width: 2.725rem;
		text-align: center;
		top: 15px;
	}

	.burden-score {
		font-size: 0.625rem;
		color: #fff;
		font-weight: 500;
		padding: 0.25rem 0.5rem;
		border-radius: 100px;
	}

	.visit-marker:hover {
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
	}

	.visit-marker.selected {
		transform: translateX(-50%) scale(1.3);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
		z-index: 15;
		min-width: 140px;
	}

	.visit-number {
		font-weight: bold;
		font-size: 1rem;
		color: #1f2937;
	}

	.visit-name {
		font-size: 0.85rem;
		color: #4b5563;
		margin: 0.25rem 0;
		font-weight: 500;
	}

	.study-day {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.burden-indicator {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.65rem;
		font-weight: bold;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
	}

	.icon-indicators {
		position: absolute;
		bottom: -8px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 2px;
	}

	.icon-circle {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: all 0.2s ease;
	}

	.icon-circle:hover {
		transform: scale(1.1);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	}

	.icon-circle.travel {
		background-color: #1622ff; /* blue */
	}

	.icon-circle.invasive {
		background-color: #ea580c; /* orange */
	}

	.icon-circle.surgical {
		background-color: #7c2d12; /* dark brown */
	}

	@media (max-width: 768px) {
		.visit-marker {
			min-width: 70px;
		}

		.visit-marker.selected {
			min-width: 120px;
		}

		.icon-circle {
			width: 16px;
			height: 16px;
		}

		.icon-indicators {
			bottom: -6px;
		}
	}
</style> 
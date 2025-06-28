<script lang="ts">
	import { onMount } from 'svelte';

	// Type definitions
	interface Visit {
		visit_number: number;
		name: string;
		study_day?: string;
		study_day_range?: string;
		study_week?: string;
		assessments: string[];
	}

	interface ProcessedVisit extends Visit {
		burdenScore: number;
		timelinePosition: number;
		studyDay: number;
	}

	// Props
	export let visits: Visit[] = [];
	export let timelineWidth: number = 1000;

	// State
	let selectedVisit: ProcessedVisit | null = null;
	let hoveredVisit: ProcessedVisit | null = null;
	let mounted = false;
	let mouseX = 0;
	let mouseY = 0;

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

	// Get burden level text
	function getBurdenLevel(score: number): string {
		if (score < 30) return 'Low';
		if (score < 60) return 'Medium';
		return 'High';
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
	}

	function handleVisitHover(visit: ProcessedVisit): void {
		hoveredVisit = visit;
	}

	function handleVisitLeave(): void {
		hoveredVisit = null;
	}

	function handleKeydown(event: KeyboardEvent, visit: ProcessedVisit): void {
		if (event.key === 'Enter') {
			handleVisitClick(visit);
		}
	}

	function handleMouseMove(event: MouseEvent): void {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
</script>

{#if mounted}
	<div class="timeline-container" on:mousemove={handleMouseMove}>
		<!-- Timeline axis -->
		<div class="timeline-axis" style="width: {timelineWidth}px;">
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
					<div class="visit-name">{visit.name}</div>
					<div class="study-day">Day {visit.studyDay}</div>
					
					<!-- Burden indicator -->
					<div class="burden-indicator" style="background-color: {getBurdenColor(visit.burdenScore)};">
						<span class="burden-score">{visit.burdenScore}</span>
					</div>
				</div>
			{/each}
		</div>

		<!-- Timeline labels -->
		<div class="timeline-labels" style="width: {timelineWidth}px;">
			{#each processedVisits as visit}
				<div class="timeline-label" style="left: {visit.timelinePosition}px;">
					<div class="study-week">{visit.study_week || visit.study_day_range}</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Hover tooltip -->
	{#if hoveredVisit}
		<div 
			class="tooltip"
		>
			<h3>{hoveredVisit.name}</h3>
			<p><strong>Study Day:</strong> {hoveredVisit.study_day || hoveredVisit.study_day_range}</p>
			<p><strong>Burden Level:</strong> 
				<span style="color: {getBurdenColor(hoveredVisit.burdenScore)};">
					{getBurdenLevel(hoveredVisit.burdenScore)} ({hoveredVisit.burdenScore})
				</span>
			</p>
			<p><strong>Assessments:</strong> {hoveredVisit.assessments.length} items</p>
		</div>
	{/if}

	<!-- Selected visit details -->
	{#if selectedVisit}
		<div class="visit-details">
			<div class="details-header">
				<h2>{selectedVisit.name} - Visit {selectedVisit.visit_number}</h2>
				<button class="close-btn" on:click={() => selectedVisit = null}>×</button>
			</div>
			
			<div class="details-content">
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
					<h3>Assessments ({selectedVisit.assessments.length})</h3>
					<div class="assessments-grid">
						{#each selectedVisit.assessments as assessment}
							<div class="assessment-item">
								{assessment}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.timeline-container {
		position: relative;
		padding: 2rem 0;
		margin: 2rem 0;
	}

	.timeline-axis {
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
		border-radius: 1px;
	}

	.visit-marker {
		position: absolute;
		transform: translateX(-50%);
		cursor: pointer;
		padding: 0.5rem;
		background: white;
		border: 3px solid;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
		min-width: 120px;
		text-align: center;
		top: 10px;
	}

	.visit-marker:hover, .visit-marker.hovered {
		transform: translateX(-50%) scale(1.05);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
		z-index: 10;
	}

	.visit-marker.selected {
		transform: translateX(-50%) scale(1.1);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
		z-index: 15;
	}

	.visit-number {
		font-weight: bold;
		font-size: 1.2rem;
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
		top: -8px;
		right: -8px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.7rem;
		font-weight: bold;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.timeline-labels {
		position: relative;
		margin-top: 1rem;
		height: 30px;
	}

	.timeline-label {
		position: absolute;
		transform: translateX(-50%);
		font-size: 0.8rem;
		color: #6b7280;
		text-align: center;
	}

	.tooltip {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		z-index: 20;
		min-width: 250px;
		pointer-events: none;
		position: relative;
		top: 20px;
		right: 20px;
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

	.visit-details {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		margin-top: 2rem;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.details-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.details-header h2 {
		margin: 0;
		color: #1f2937;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0.5rem;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.close-btn:hover {
		background-color: #f3f4f6;
	}

	.details-content {
		padding: 1.5rem;
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
		border-radius: 4px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.assessments-section h3 {
		color: #1f2937;
		margin-bottom: 1rem;
	}

	.assessments-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 0.5rem;
	}

	.assessment-item {
		background: #f9fafb;
		padding: 0.75rem;
		border-radius: 6px;
		border-left: 3px solid #3b82f6;
		font-size: 0.9rem;
		color: #374151;
	}

	@media (max-width: 768px) {
		.timeline-container {
			overflow-x: auto;
		}
		
		.visit-marker {
			min-width: 100px;
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
	}
</style> 
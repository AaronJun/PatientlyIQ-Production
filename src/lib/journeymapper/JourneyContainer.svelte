<script lang="ts">
	import { onMount } from 'svelte';
	import PersonaGrid from './PersonaGrid.svelte';

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

	let mounted = false;

	// Timeline positioning logic
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
		burdenScore: 0,
		timelinePosition: getTimelinePosition(visit),
		studyDay: parseStudyDay(visit)
	})).sort((a, b) => a.studyDay - b.studyDay);

	onMount(() => {
		mounted = true;
	});
</script>

{#if mounted}
	<div class="journey-container">
		<!-- Persona Grid -->
		<div class="persona-section">
			<PersonaGrid {visits} {timelineWidth} />
		</div>
	</div>
{/if}

<style>
	.journey-container {
		position: relative;
		width: 100%;
		overflow-x: auto;
		overflow-y: hidden;
	}

	.persona-section {
		position: relative;
		width: 100%;
	}
</style> 
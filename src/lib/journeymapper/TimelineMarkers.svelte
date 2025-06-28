<script lang="ts">
	// Type definitions
	interface Visit {
		visit_number: number;
		name: string;
		study_day?: string;
		study_day_range?: string;
		study_week?: string;
		assessments: string[];
	}

	interface TimeMarker {
		position: number;
		label: string;
		type: 'week' | 'month' | 'year';
		day: number;
	}

	// Props
	export let visits: Visit[] = [];
	export let timelineWidth: number = 1000;

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

	// Calculate time range for markers
	$: minDay = Math.min(...visits.map(parseStudyDay));
	$: maxDay = Math.max(...visits.map(parseStudyDay));
	$: totalDays = maxDay - minDay;

	// Generate time markers based on the study duration
	function generateTimeMarkers(): TimeMarker[] {
		const markers: TimeMarker[] = [];
		const padding = 0.1; // Same padding as timeline
		
		// Determine appropriate interval based on study duration
		let interval: number;
		let intervalType: 'week' | 'month' | 'year';
		
		if (totalDays <= 70) { // ~10 weeks - show weekly
			interval = 7; // days
			intervalType = 'week';
		} else if (totalDays <= 365) { // ~1 year - show monthly
			interval = 30; // days (approximate month)
			intervalType = 'month';
		} else { // > 1 year - show yearly
			interval = 365; // days
			intervalType = 'year';
		}

		// Generate markers starting from a clean boundary
		let currentDay = minDay;
		
		// Adjust start to clean boundary
		if (intervalType === 'week') {
			currentDay = Math.floor(minDay / 7) * 7;
		} else if (intervalType === 'month') {
			currentDay = Math.floor(minDay / 30) * 30;
		} else {
			currentDay = Math.floor(minDay / 365) * 365;
		}

		while (currentDay <= maxDay + interval) {
			if (currentDay >= minDay - interval && currentDay <= maxDay + interval) {
				const position = ((currentDay - minDay) / (maxDay - minDay)) * (1 - 2 * padding) + padding;
				const positionPx = position * timelineWidth;

				let label: string;
				if (intervalType === 'week') {
					const weekNum = Math.floor(currentDay / 7);
					if (currentDay === 0) {
						label = 'Randomization';
					} else if (currentDay > 0) {
						label = `Week ${Math.ceil(currentDay / 7)}`;
					} else {
						label = `Week ${weekNum}`;
					}
				} else if (intervalType === 'month') {
					const monthNum = Math.floor(Math.abs(currentDay) / 30);
					if (currentDay === 0) {
						label = 'Randomization';
					} else if (currentDay > 0) {
						label = `Month ${Math.ceil(currentDay / 30)}`;
					} else {
						label = `Month -${monthNum}`;
					}
				} else {
					const yearNum = Math.floor(Math.abs(currentDay) / 365);
					if (currentDay === 0) {
						label = 'Randomization';
					} else if (currentDay > 0) {
						label = `Year ${Math.ceil(currentDay / 365)}`;
					} else {
						label = `Year -${yearNum}`;
					}
				}

				markers.push({
					position: positionPx,
					label,
					type: intervalType,
					day: currentDay
				});
			}
			currentDay += interval;
		}

		return markers;
	}

	$: timeMarkers = generateTimeMarkers();
</script>

<!-- Time scale markers -->
<div class="time-scale" style="width: {timelineWidth}px;">
	<div class="time-axis">
		<div class="axis-line"></div>
		
		<!-- Time markers -->
		{#each timeMarkers as marker}
			<div 
				class="time-marker {marker.type}" 
				style="left: {marker.position}px;"
			>
				<div class="marker-tick"></div>
				<div class="marker-label">{marker.label}</div>
				<div class="marker-day">Day {marker.day}</div>
			</div>
		{/each}
	</div>

	<!-- Phase indicators -->
	<div class="phase-indicators">
		{#if minDay <= 0}
			<div class="phase-indicator screening" style="left: {0.1 * timelineWidth}px; width: {((Math.min(0, maxDay) - minDay + 1) / (maxDay - minDay)) * (1 - 0.2) * timelineWidth}px;">
				<span class="phase-label">Screening & Randomization</span>
			</div>
		{/if}
		
		{#if maxDay > 0}
			<div class="phase-indicator baseline" style="left: {((Math.max(1, minDay) - minDay) / (maxDay - minDay)) * (1 - 0.2) * timelineWidth + 0.1 * timelineWidth}px; width: {(Math.min(56, maxDay) - Math.max(1, minDay) + 1) / (maxDay - minDay) * (1 - 0.2) * timelineWidth}px;">
				<span class="phase-label">Treatment</span>
			</div>
		{/if}
		
		{#if maxDay > 56}
			<div class="phase-indicator followup" style="left: {((57 - minDay) / (maxDay - minDay)) * (1 - 0.2) * timelineWidth + 0.1 * timelineWidth}px; width: {((maxDay - 56) / (maxDay - minDay)) * (1 - 0.2) * timelineWidth}px;">
				<span class="phase-label">Follow-up</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.time-scale {
		position: relative;
		margin: 0 auto 1rem auto;
		height: 80px;
	}

	.time-axis {
		position: relative;
		height: 40px;
		margin-bottom: 1rem;
	}

	.axis-line {
		position: absolute;
		top: 20px;
		left: 0;
		right: 0;
		height: 1px;
		background: #d1d5db;
	}

	.time-marker {
		position: absolute;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.marker-tick {
		width: 1px;
		height: 12px;
		background: #6b7280;
		margin-bottom: 0.25rem;
	}

	.time-marker.month .marker-tick {
		height: 10px;
		width: 2px;
		background: #374151;
	}

	.time-marker.year .marker-tick {
		height: 10px;
		width: 3px;
		background: #1f2937;
	}

	.marker-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #374151;
		white-space: nowrap;
		margin-bottom: 0.125rem;
	}

	.time-marker.month .marker-label {
		font-weight: 600;
		color: #1f2937;
	}

	.time-marker.year .marker-label {
		font-weight: 700;
		color: #111827;
	}

	.marker-day {
		font-size: 0.625rem;
		color: #9ca3af;
		white-space: nowrap;
	}

	.phase-indicators {
		position: relative;
		height: 24px;
		margin-top: 0.5rem;
	}

	.phase-indicator {
		position: absolute;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.7;
	}

	.phase-indicator.screening {
		background: #ff9428;
	}

	.phase-indicator.baseline {
		background: #28adff;
	}

	.phase-indicator.followup {
		background: #0f9c3c;
	}

	.phase-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.time-scale {
			height: 70px;
		}

		.marker-label {
			font-size: 0.7rem;
		}

		.marker-day {
			font-size: 0.6rem;
		}

		.phase-label {
			font-size: 0.7rem;
		}

		.phase-indicators {
			height: 20px;
		}
	}

	@media (max-width: 480px) {
		.marker-label {
			font-size: 0.65rem;
		}

		.marker-day {
			display: none; /* Hide day numbers on very small screens */
		}
	}
</style> 
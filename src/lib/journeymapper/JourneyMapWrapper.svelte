<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import { scaleLinear } from 'd3-scale';
	import WeekGrid from './WeekGrid.svelte';
	import { onMount } from 'svelte';

	
	// Import the study data
	import pvVisitSchedule from '../../data/journeymap/sapablursen_pv_visit_schedule.json';
    
	interface SentimentData {
		"Entirely Negative": number;
		"Mostly Negative": number;
		"Somewhat Negative": number;
		"Neutral": number;
		"Somewhat Positive": number;
		"Mostly Positive": number;
		"Entirely Positive": number;
	}

	let mounted = false;
	
	// Calculate total height needed (30px per week * 152 weeks + padding)
	const WEEK_HEIGHT = 30;
	const TOTAL_WEEKS = 156;
	const TOTAL_HEIGHT = WEEK_HEIGHT * TOTAL_WEEKS;
	
	// Tooltip state
	let tooltipVisible: boolean = false;
	let tooltipX: number = 0;
	let tooltipY: number = 0;
	let tooltipSentiment: SentimentData | null = null;
	let tooltipPersonaType: string = '';
	let tooltipWeekNumber: number = 0;
	let tooltipVisitName: string = '';
	let tooltipStudyPhase: string = '';

	// Tooltip event handlers
	function handleShowTooltip(event: CustomEvent<any>) {
		const { x, y, sentiment, personaType, weekNumber, visitName, studyPhase } = event.detail;
		tooltipVisible = true;
		tooltipX = x;
		tooltipY = y;
		tooltipSentiment = sentiment;
		tooltipPersonaType = personaType;
		tooltipWeekNumber = weekNumber;
		tooltipVisitName = visitName;
		tooltipStudyPhase = studyPhase;
	}
	function handleMoveTooltip(event: CustomEvent<any>) {
		const { x, y } = event.detail;
		tooltipX = x;
		tooltipY = y;
	}
	function handleHideTooltip(_event?: CustomEvent<any>) {
		tooltipVisible = false;
	}

	// Process the DECIPHERA-PV-3 study data
	$: processedData = processStudyData(pvVisitSchedule);
	
	// Debug logging
	$: {
		console.log('Raw data length:', pvVisitSchedule.length);
		console.log('Processed data length:', processedData.length);
		console.log('First few processed items:', processedData.slice(0, 3));
	}
	
	function processStudyData(data: any[]) {
		console.log('Processing study data, input length:', data.length);
		
		// Log first few entries to see structure
		if (data.length > 0) {
			console.log('First entry structure:', data[0]);
		}
		
		// Filter for DECIPHERA-PV-3 study
		const studyData = data.filter(entry => entry["Study Name"] === "DECIPHERA-PV-3");
		console.log('Filtered study data length:', studyData.length);
		
		if (studyData.length === 0) {
			console.log('No data found for DECIPHERA-PV-3');
			// Let's see what study names are available
			const uniqueStudyNames = [...new Set(data.map(entry => entry["Study Name"]))];
			console.log('Available study names:', uniqueStudyNames);
			return [];
		}
		
		// Extract week numbers from the data, handling potential string values
		const visitWeeks = studyData.map(entry => {
			const weekValue = entry.Week;
			return typeof weekValue === 'string' ? parseInt(weekValue) : weekValue;
		}).filter(week => !isNaN(week));
		
		console.log('Visit weeks:', visitWeeks);
		
		if (visitWeeks.length === 0) {
			console.log('No valid week values found');
			return [];
		}
		
		const minWeek = Math.min(...visitWeeks);
		const maxWeek = Math.max(...visitWeeks);
		
		console.log('Week range:', minWeek, 'to', maxWeek);
		
		// Create continuous timeline including gaps
		const continuousWeeks = [];
		for (let week = minWeek; week <= maxWeek; week++) {
			const visitEntry = studyData.find(entry => {
				const entryWeek = typeof entry.Week === 'string' ? parseInt(entry.Week) : entry.Week;
				return entryWeek === week;
			});
			
			continuousWeeks.push({
				week: week,
				x: 1, // Single line on x-axis
				y: (153 - week) * WEEK_HEIGHT, // Weeks along y-axis, reversed to show week 1 at top
				hasVisit: !!visitEntry,
				visit: visitEntry ? visitEntry.Visit : null,
				stage: visitEntry ? visitEntry.Stage : null,
				visitType: visitEntry ? visitEntry["Visit Type"] : null
			});
		}
		
		console.log('Generated continuous weeks:', continuousWeeks.length);
		return continuousWeeks;
	}
	
	onMount(() => {
		mounted = true;
	});
</script>

<div class="wrapper">
	{#if mounted}
		{#if processedData.length > 0}
			<div class="chart-container">
				<LayerCake
					data={processedData}
					x="x"
					y="y"
					xScale={scaleLinear()}
					yScale={scaleLinear()}
					xDomain={[0, 2]}
					yDomain={[0, TOTAL_HEIGHT]} 
					padding={{ top: 10, right: 40, bottom: 60, left: 40 }}
				>
					<Svg>
						<WeekGrid 
							data={processedData} 
							visitSchedule={pvVisitSchedule}
							on:showTooltip={handleShowTooltip}
							on:moveTooltip={handleMoveTooltip}
							on:hideTooltip={handleHideTooltip}
						/>
					</Svg>
				</LayerCake>
			</div>
		{:else}
			<div class="no-data">
				<p>No data available. Raw data length: {pvVisitSchedule.length}</p>
				<p>Check console for debugging information.</p>
			</div>
		{/if}
	{:else}
		<div class="loading">Loading...</div>
	{/if}

</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.chart-container {
		width: 100%;
		height: 2400px;
		overflow-y: auto;
		overflow-x: hidden;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
	}

	.no-data, .loading {
		padding: 2rem;
		text-align: center;
		color: #666;
	}
</style>
    
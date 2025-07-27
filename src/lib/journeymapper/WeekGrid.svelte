<script lang="ts">
	import { getContext } from 'svelte';
	import pvVisitSentiment from '../../data/journeymap/pv_visit_sentiment_simulation.json';
	import SentimentCircle from './SentimentCircle.svelte';
	
	interface SentimentData {
		patient: {
			"Entirely Negative": number;
			"Mostly Negative": number;
			"Somewhat Negative": number;
			"Neutral": number;
			"Somewhat Positive": number;
			"Mostly Positive": number;
			"Entirely Positive": number;
		};
		caregiver: {
			"Entirely Negative": number;
			"Mostly Negative": number;
			"Somewhat Negative": number;
			"Neutral": number;
			"Somewhat Positive": number;
			"Mostly Positive": number;
			"Entirely Positive": number;
		};
	}
	
	interface WeekData {
		week: number;
		x: number;
		y: number;
		hasVisit: boolean;
		visit: string | null;
		stage: string | null;
		visitType: string | null;
		patientBurden?: number;
		caregiverBurden?: number;
		overallBurden?: number;
		sentiment?: SentimentData;
	}
	
	export let data: WeekData[] = [];
	export let visitSchedule: any[] = []; // Raw visit schedule data
	
	const { xScale, yScale, width, height } = getContext('LayerCake') as {
		xScale: any;
		yScale: any; 
		width: any;
		height: any;
	};
	
	// Generate comprehensive week data for all 152 weeks
	function generateWeekData(): WeekData[] {
		const weekData: WeekData[] = [];
		
		// Create a map of weeks to visit data for quick lookup
		const visitMap = new Map();
		visitSchedule.forEach(visit => {
			const week = parseInt(visit.Week);
			visitMap.set(week, {
				visit: visit.Visit,
				stage: visit.Stage,
				visitType: visit['Visit Type'],
				patientBurden: visit['Patient Burden'] || 0,
				caregiverBurden: visit['Caregiver Burden'] || 0,
				overallBurden: visit['Overall Burden'] || 0
			});
		});
		
		// Create a map for sentiment data
		const sentimentMap = new Map();
		pvVisitSentiment.forEach(visit => {
			const week = parseInt(visit.Week);
			sentimentMap.set(week, {
				patient: visit.Sentiment.Patient,
				caregiver: visit.Sentiment.Caregiver
			});
		});
		
		// Generate data for all 152 weeks
		for (let week = 1; week <= 152; week++) {
			const visitData = visitMap.get(week);
			const sentimentData = sentimentMap.get(week);
			const hasVisit = visitData !== undefined;
			
			weekData.push({
				week: week,
				x: 1, // Fixed x position for now
				y: (153 - week) * 30, // Multiply by 30 to increase spacing between weeks
				hasVisit: hasVisit,
				visit: hasVisit ? visitData.visit : null,
				stage: hasVisit ? visitData.stage : null,
				visitType: hasVisit ? visitData.visitType : null,
				patientBurden: hasVisit ? visitData.patientBurden : null,
				caregiverBurden: hasVisit ? visitData.caregiverBurden : null,
				overallBurden: hasVisit ? visitData.overallBurden : null,
				sentiment: sentimentData
			});
		}
		
		return weekData;
	}
	
	// Use generated data if visitSchedule is provided, otherwise use passed data
	$: weekData = visitSchedule.length > 0 ? generateWeekData() : data;
	
	// Calculate dimensions for each week cell
	$: cellHeight = 30; // Fixed cell height of 30px
	$: cellWidth = $xScale(1.5) - $xScale(0.5);

	// Calculate text label width for offset
	const labelWidth = 50; // Width reserved for the "W123" text label
	const columnWidth = 100; // Width for each burden column
	const circleRadius = 5; // Radius for visit indicators
</script>

<g class="week-grid">
	{#if weekData.length > 0}
		<!-- Column Headers - Positioned above grid -->
		<g class="column-headers" transform="translate(0, -0)">
			<text
				x={$xScale(0) + labelWidth}
				y={20}
				fill="#374151"
				font-size="10"
				text-anchor="start"
				font-weight="bold"
				class="header-text"
			>
				Patient
			</text>
			<text
				x={$xScale(0) + labelWidth + columnWidth}
				y={20}
				fill="#374151"
				font-size="10"
				text-anchor="start"
				font-weight="bold"
				class="header-text"
			>
				Caregiver
			</text>
			<text
				x={$xScale(0) + labelWidth + (columnWidth * 2)}
				y={20}
				fill="#374151"
				font-size="10"
				text-anchor="start"
				font-weight="bold"
				class="header-text"
			>
				Overall
			</text>
			
			<!-- Header underline -->
			<line
				x1={$xScale(0) + labelWidth}
				x2={$width}
				y1={30}
				y2={30}
				stroke="#374151"
				stroke-width="1"
				stroke-opacity="0.5"
			/>
		</g>

		<!-- Week grid cells for all 152 weeks -->
		{#each weekData as dataPoint}
			<!-- Horizontal line for each week -->
			<line
				x1={$xScale(0) + labelWidth}
				x2={$width}
				y1={$yScale(dataPoint.y)}
				y2={$yScale(dataPoint.y)}
				stroke="#e5e7eb"
				stroke-width="1"
				stroke-opacity="0.5"
			/>
			
			<!-- Week number label (show every 4th week to avoid clutter) -->
			{#if dataPoint.week % 4 === 0 || dataPoint.hasVisit}
				<text
					x={$xScale(0)}
					y={$yScale(dataPoint.y)}
					fill="#374151"
					font-size="9.25"
					text-anchor="start"
					dominant-baseline="middle"
				>
					W{dataPoint.week}
				</text>
			{/if}

			<!-- Visit indicators -->
			{#if dataPoint.sentiment}
				<!-- Patient visit indicator -->
				<SentimentCircle
					sentiment={dataPoint.sentiment.patient}
					cx={$xScale(0) + labelWidth + columnWidth/2}
					cy={$yScale(dataPoint.y)}
					personaType="Patient"
					weekNumber={dataPoint.week}
					visitName={dataPoint.visit || `Visit ${dataPoint.week}`}
					studyPhase={dataPoint.stage || 'Unknown'}
				/>
				
				<!-- Caregiver visit indicator -->
				<SentimentCircle
					sentiment={dataPoint.sentiment.caregiver}
					cx={$xScale(0) + labelWidth + columnWidth + columnWidth/2}
					cy={$yScale(dataPoint.y)}
					personaType="Caregiver"
					weekNumber={dataPoint.week}
					visitName={dataPoint.visit || `Visit ${dataPoint.week}`}
					studyPhase={dataPoint.stage || 'Unknown'}
				/>
			{/if}

		{/each}
		
	{:else}
		<!-- Debug text when no data -->
		<text x="10" y="20" fill="#ff0000" font-family="monospace" font-size="12">
			No data in WeekGrid component - Total study duration: 152 weeks
		</text>
	{/if}
</g>

<style>
	:global(.header-text) {
		font-family: 'IBM Plex Mono', monospace;
		letter-spacing: 0.05em;
	}
</style> 
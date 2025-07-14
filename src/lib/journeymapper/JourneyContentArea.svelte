<script lang="ts">
	import { fade, draw } from 'svelte/transition';
	import SentimentCircle from './SentimentCircle.svelte';
	import SentimentLine from './SentimentLine.svelte';
	import Drawer from './Drawer.svelte';
	import VisitDetails from './VisitDetails.svelte';
	import PersonaTooltip from './PersonaTooltip.svelte';

	// Props
	export let personas: any[] = [];
	export let processedVisits: any[] = [];
	export let timelineWidth: number;
	export let gridHeight: number;
	export let gridPositions: any;
	export let dynamicCellDimensions: any;
	export let mounted: boolean;

	// Constants
	const EXPANDED_HEIGHT = 150;
	const PERSONA_HEIGHT = 100;

	// Visit Details Drawer state
	let drawerOpen = false;
	let selectedVisit: any = null;
	let selectedPersona: any = null;
	let selectedSentimentData: any = null;
	let selectedDropoutData: any = null;

	// Tooltip state
	let tooltipVisible = false;
	let tooltipX = 0;
	let tooltipY = 0;
	let tooltipPersona: any = null;
	let tooltipVisit: any = null;
	let tooltipQuotes: string[] = [];
	let tooltipDropoutRisk = 0;
	let tooltipPrimaryDrivers: string[] = [];
	let tooltipBurdenScore = 0;
	let tooltipStudyPhase = '';
	let tooltipProcedureDiscomfort = 0;
	
	let hoverTimeout: ReturnType<typeof setTimeout>;

	// Function to get sentiment color based on 1-10 score
	function getSentimentColor(sentiment: number): string {
		if (sentiment >= 8) return '#22c55e';      // High positive (8-10) - green
		if (sentiment >= 6) return '#84cc16';      // Moderate positive (6-7) - lime
		if (sentiment >= 5) return '#eab308';      // Neutral (5) - yellow
		if (sentiment >= 3) return '#f97316';      // Moderate negative (3-4) - orange
		return '#ef4444';                          // High negative (1-2) - red
	}

	// Function to calculate weighted sentiment
	function calculateWeightedSentiment(sentimentData: any, visitNumber?: number): number {
		if (!sentimentData) return 5;
		
		const overall = sentimentData.overall_score || 3;
		const anxiety = sentimentData.anxiety_level || 3;
		const hope = sentimentData.hope_level || 3;
		const burden = sentimentData.burden_perception || 3;
		
		const weights = {
			overall: 0.35,
			anxiety: 0.30,
			hope: 0.25,
			burden: 0.10
		};
		
		const scaleConversion = (value: number, invert: boolean = false) => {
			const normalizedValue = invert ? (6 - value) : value;
			const scaledValue = Math.pow((normalizedValue - 1) / 4, 0.8) * 9 + 1;
			return scaledValue;
		};
		
		let weightedScore = 
			scaleConversion(overall) * weights.overall +
			scaleConversion(anxiety, true) * weights.anxiety +
			scaleConversion(hope) * weights.hope +
			scaleConversion(burden, true) * weights.burden;
		
		if (visitNumber) {
			let stageModifier = 1.0;
			if (visitNumber <= 2) stageModifier = weightedScore > 6 ? 1.2 : 1.1;
			else if (visitNumber <= 6) stageModifier = 1.05;
			else if (visitNumber <= 12) stageModifier = weightedScore > 5 ? 0.95 : 0.9;
			else stageModifier = weightedScore > 5 ? 0.85 : 0.8;
			
			weightedScore *= stageModifier;
			
			if (visitNumber > 10) {
				weightedScore -= (visitNumber - 10) * 0.3;
			}
		}
		
		if (weightedScore > 7) weightedScore = 7 + (weightedScore - 7) * 1.3;
		else if (weightedScore < 4) weightedScore = 4 - (4 - weightedScore) * 1.3;
		
		return Math.max(1, Math.min(10, Math.round(weightedScore * 10) / 10));
	}

	// Function to get sentiment score
	function getSentimentScore(persona: any, visitNumber: number): number {
		// This is a simplified version - you'll need to implement the full logic
		return calculateWeightedSentiment({ overall_score: 5 }, visitNumber);
	}

	// Handle tooltip show/hide
	function showTooltip(event: MouseEvent, persona: any, visit: any) {
		clearTimeout(hoverTimeout);
		
		tooltipX = event.clientX;
		tooltipY = event.clientY;
		tooltipPersona = persona;
		tooltipVisit = visit;
		tooltipQuotes = [];  // You'll need to implement getVisitQuotes
		tooltipDropoutRisk = 0;  // You'll need to implement getDropoutRisk
		tooltipPrimaryDrivers = [];
		tooltipBurdenScore = visit.burdenScore;
		tooltipProcedureDiscomfort = 0;  // You'll need to implement getProcedureDiscomfort
		tooltipStudyPhase = '';  // You'll need to implement getStudyPhase
		
		hoverTimeout = setTimeout(() => {
			tooltipVisible = true;
		}, 200);
	}

	function hideTooltip() {
		clearTimeout(hoverTimeout);
		hoverTimeout = setTimeout(() => {
			tooltipVisible = false;
		}, 50);
	}

	// Open visit details
	function openVisitDetails(visit: any, persona: any) {
		selectedVisit = visit;
		selectedPersona = persona;
		selectedSentimentData = null;  // You'll need to implement this
		selectedDropoutData = null;  // You'll need to implement this
		drawerOpen = true;
	}

	// Close visit details drawer
	function closeDrawer() {
		drawerOpen = false;
		selectedVisit = null;
		selectedPersona = null;
		selectedSentimentData = null;
		selectedDropoutData = null;
	}
</script>

<!-- Journey content area -->
<div class="journey-content-area">
	<!-- Grid area with visit lines and sentiment visualization -->
	<div 
		class="grid-area" 
		style="width: {timelineWidth}px; height: {gridHeight}px;"
	>
		<!-- Horizontal grid lines between personas -->
		{#each personas as persona, index}
			{#if index < personas.length - 1}
				<div 
					class="horizontal-grid-line" 
					style="top: {gridPositions.personaTops[index + 1]}px; width: {timelineWidth}px;"
				></div>
			{/if}
		{/each}

		<!-- Vertical grid lines for each visit -->
		{#each processedVisits as visit, index}
			<div 
				class="vertical-grid-line visit-line" 
				style="left: {(visit.timelinePosition - (dynamicCellDimensions.cellWidth / 2 / timelineWidth)) * timelineWidth}px; height: {gridPositions.totalHeight}px;"
				title="Visit {visit.visit_number}: {visit.name}"
			></div>
		{/each}

		<!-- Sentiment connecting lines -->
		{#if mounted}
			{#each personas as persona, personaIndex}
				{@const points = processedVisits.map((visit, visitIndex) => {
					const sentiment = getSentimentScore(persona, visit.visit_number);
					const cellHeight = persona.expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT;
					const padding = 16;
					const availableHeight = cellHeight - (padding * 2);
					const sentimentY = padding + (availableHeight * (1 - (sentiment / 10)));
					
					return {
						x: (visit.timelinePosition - (dynamicCellDimensions.cellWidth / 2 / timelineWidth)) * timelineWidth,
						y: gridPositions.personaTops[personaIndex] + sentimentY
					};
				})}
				
				<svg 
					class="sentiment-line-container"
					width={timelineWidth} 
					height={gridHeight}
					style="position: absolute; top: 0; left: 0; pointer-events: none;"
				>
					<path
						in:draw={{ duration: 1000, delay: 300 }}
						d={`M ${points.map((p, i) => `${i === 0 ? '' : 'L '}${p.x} ${p.y}`).join(' ')}`}
						fill="none"
						stroke={persona.expanded ? persona.color : '#94a3b8'}
						stroke-width={persona.expanded ? 2 : 1.5}
						stroke-opacity={persona.expanded ? 0.6 : 0.3}
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-dasharray={persona.expanded ? 'none' : '4,4'}
					/>
				</svg>
			{/each}
		{/if}

		<!-- Grid cells and sentiment circles -->
		{#each personas as persona, personaIndex}
			{#each processedVisits as visit, visitIndex}
				{@const sentiment = getSentimentScore(persona, visit.visit_number)}
				{@const cellHeight = persona.expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT}
				{@const padding = 16}
				{@const availableHeight = cellHeight - (padding * 2)}
				{@const sentimentY = padding + (availableHeight * (1 - (sentiment / 10)))}
				
				<div 
					class="grid-cell dynamic-cell"
					style="
						--visit-position: {visit.timelinePosition};
						--cell-index: {visitIndex};
						left: {(visit.timelinePosition - (dynamicCellDimensions.cellWidth / 2 / timelineWidth)) * timelineWidth}px;
						top: {gridPositions.personaTops[personaIndex]}px;
						width: {dynamicCellDimensions.cellWidth}px;
						height: {cellHeight}px;
					"
					on:click={() => openVisitDetails(visit, persona)}
					on:keydown={(e) => e.key === 'Enter' && openVisitDetails(visit, persona)}
					on:mouseenter={(e) => showTooltip(e, persona, visit)}
					on:mouseleave={hideTooltip}
					role="button"
					tabindex="0"
				>
					<!-- Sentiment Circle -->
					<SentimentCircle 
						sentiment={sentiment}
						size={persona.expanded ? 16 : 12}
						x={dynamicCellDimensions.cellWidth / 2}
						y={sentimentY}
						personaColor={getSentimentColor(sentiment)}
						isExpanded={persona.expanded}
						tooltipText="{persona.name} - {visit.name}: Sentiment {sentiment}/10, Burden {visit.burdenScore}/100 (Click for details)"
					/>
				</div>
			{/each}
		{/each}
	</div>
</div>

<!-- Visit Details Drawer -->
<Drawer 
	bind:isOpen={drawerOpen}
	title={selectedVisit && selectedPersona ? `${selectedPersona.name} - ${selectedVisit.name}` : 'Visit Details'}
	width="500px"
	on:close={closeDrawer}
>
	<VisitDetails 
		visit={selectedVisit}
		sentimentData={selectedSentimentData}
		dropoutData={selectedDropoutData}
		personaName={selectedPersona?.name || ''}
		personaType={selectedPersona?.type || 'Patient'}
		personaColor={selectedPersona?.color || '#059669'}
	/>
</Drawer>

<!-- Persona Tooltip -->
<PersonaTooltip 
	visible={tooltipVisible}
	x={tooltipX}
	y={tooltipY}
	personaName={tooltipPersona?.name || ''}
	personaColor={tooltipPersona?.color || '#059669'}
	visitName={tooltipVisit?.name || ''}
	visitNumber={tooltipVisit?.visit_number || 1}
	quotes={tooltipQuotes}
	dropoutRisk={tooltipDropoutRisk}
	primaryDrivers={tooltipPrimaryDrivers}
	procedureDiscomfort={tooltipProcedureDiscomfort}
	burdenScore={tooltipBurdenScore}
	studyPhase={tooltipStudyPhase}
/>

<style>
	/* === JOURNEY CONTENT AREA === */
	.journey-content-area {
		flex: 1;
		overflow-x: auto;
		overflow-y: hidden;
		background: white;
	}

	/* === GRID AREA === */
	.grid-area {
		position: relative;
		background: white;
		min-width: fit-content;
	}

	/* === GRID LINES === */
	.horizontal-grid-line {
		position: absolute;
		height: 1px;
		background: #e5e7eb;
		z-index: 1;
		transition: top 0.3s ease-in-out;
	}

	.vertical-grid-line {
		position: absolute;
		width: 1px;
		background: #d1d5db;
		z-index: 1;
		transition: height 0.3s ease-in-out;
	}

	.vertical-grid-line.visit-line {
		background: #9ca3af;
		width: 2px;
		opacity: 0.6;
		transition: all 0.2s ease;
	}

	.vertical-grid-line.visit-line:hover {
		opacity: 1;
		background: #6b7280;
		width: 3px;
	}

	/* === GRID CELLS === */
	.grid-cell {
		position: absolute;
		border: 1px solid transparent;
		width: 100%;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 4px;
	}

	.grid-cell:hover {
		background: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.4);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
		transform: translateY(-1px);
	}

	.grid-cell:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* === RESPONSIVE DESIGN === */
	@media (max-width: 768px) {
		.journey-content-area {
			width: 100%;
		}
	}
</style> 
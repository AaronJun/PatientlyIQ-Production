<script lang="ts">
	import { onMount } from 'svelte';
	import SentimentCircle from './SentimentCircle.svelte';
	import SentimentLine from './SentimentLine.svelte';
	import Drawer from './Drawer.svelte';
	import VisitDetails from './VisitDetails.svelte';
	import AssessmentBurdenHeatmap from '../components/AssessmentBurdenHeatmap.svelte';
	import PersonaTooltip from './PersonaTooltip.svelte';

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

	interface Persona {
		id: string;
		name: string;
		type: 'Patient' | 'Caregiver';
		category?: string;
		color: string;
		avatar: string;
		age?: number;
		location?: string;
		background?: string;
		key_challenges?: string[];
		quotes_by_phase?: {
			pre_study_screening: string[];
			early_visits: string[];
			mid_study: string[];
			late_study: string[];
			post_study_reflection: string[];
		};
		expanded: boolean;
	}

	interface SentimentData {
		overall_score: number;
		anxiety_level: number;
		hope_level: number;
		burden_perception: number;
		reasoning: string;
	}

	interface VisitSentiment {
		visit_number: number;
		visit_name: string;
		patient_sentiment: SentimentData;
		caregiver_sentiment: SentimentData;
	}

	// Props
	export let visits: Visit[] = [];
	export let timelineWidth: number = 1000;
	export let hideHeader: boolean = false;
	export let headerHeight: number = 80;
	export let dynamicCellWidth: number = 80;

	// Personas data with expanded state - will be loaded from JSON
	let personas: Persona[] = [];

	// Constants
	const PERSONA_HEIGHT = 100;
	const EXPANDED_HEIGHT = 250;
	const LEFT_PANEL_WIDTH = 250;
	const SENTIMENT_SCALE_HEIGHT = 100; // Height for sentiment scale when expanded
	const TIMELINE_HEADER_HEIGHT = 80; // Height for the timeline header

	let mounted = false;
	let sentimentData: VisitSentiment[] = [];
	let dropoutData: any[] = [];
	let personasData: Persona[] = [];
	
	// Visit Details Drawer state
	let drawerOpen = false;
	let selectedVisit: Visit | null = null;
	let selectedPersona: Persona | null = null;
	let selectedSentimentData: VisitSentiment | null = null;
	let selectedDropoutData: any = null;

	// Persona Details Drawer state
	let personaDrawerOpen = false;
	let selectedPersonaForDrawer: Persona | null = null;

	// Tooltip state
	let tooltipVisible = false;
	let tooltipX = 0;
	let tooltipY = 0;
	let tooltipPersona: Persona | null = null;
	let tooltipVisit: ProcessedVisit | null = null;
	let tooltipQuotes: string[] = [];
	let tooltipDropoutRisk = 0;
	let tooltipPrimaryDrivers: string[] = [];
	let tooltipBurdenScore = 0;
	let tooltipStudyPhase = '';
	let tooltipProcedureDiscomfort = 0;
	
	let hoverTimeout: ReturnType<typeof setTimeout>;

	// Calculate dynamic grid height based on expanded states
	$: gridHeight = personas.reduce((total, persona) => {
		return total + (persona.expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT);
	}, 0);

	// Calculate total container height including header
	$: totalHeight = hideHeader ? gridHeight : gridHeight + headerHeight;

	// Adjust positioning based on header visibility
	$: panelTop = hideHeader ? 0 : headerHeight;

	// Ensure minimum height for container
	$: containerHeight = Math.max(totalHeight, hideHeader ? gridHeight : 300);

	onMount(async () => {
		mounted = true;
		
		try {
			// Load personas data
			const personasResponse = await fetch('/data/journeymap/personas_with_quotes.json');
			if (personasResponse.ok) {
				personasData = await personasResponse.json();
				personas = personasData.map(p => ({ ...p, expanded: false }));
			} else {
				// Fallback to original personas if file not found
				personas = [
					{
						id: 'patient-1',
						name: 'Emma Johnson',
						type: 'Patient',
						color: '#059669',
						avatar: '👩‍🦱',
						expanded: false
					},
					{
						id: 'caregiver-1',
						name: 'Michael Johnson',
						type: 'Caregiver',
						color: '#0369a1',
						avatar: '👨‍🦰',
						expanded: false
					}
				];
			}
		} catch (error) {
			console.error('Failed to load personas data:', error);
			// Use fallback personas
			personas = [
				{
					id: 'patient-1',
					name: 'Emma Johnson',
					type: 'Patient',
					color: '#059669',
					avatar: '👩‍🦱',
					expanded: false
				},
				{
					id: 'caregiver-1',
					name: 'Michael Johnson',
					type: 'Caregiver',
					color: '#0369a1',
					avatar: '👨‍🦰',
					expanded: false
				}
			];
		}

		// Load sentiment data from static directory
		try {
			const response = await fetch('/data/patient_caregiver_sentiment.json');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			sentimentData = data.visit_sentiments || [];
		} catch (error) {
			console.error('Failed to load sentiment data:', error);
			sentimentData = [
				{
					visit_number: 1,
					visit_name: "Screening",
					patient_sentiment: { overall_score: 3, anxiety_level: 4, hope_level: 4, burden_perception: 3, reasoning: "" },
					caregiver_sentiment: { overall_score: 3, anxiety_level: 4, hope_level: 4, burden_perception: 4, reasoning: "" }
				}
			];
		}

		// Load dropout data
		try {
			const dropoutResponse = await fetch('/data/journeymap/persona_burden_with_dropout.json');
			if (!dropoutResponse.ok) {
				throw new Error(`HTTP error! status: ${dropoutResponse.status}`);
			}
			dropoutData = await dropoutResponse.json();
		} catch (error) {
			console.error('Failed to load dropout data:', error);
			dropoutData = [];
		}
	});

	// Toggle persona expansion - ensures all row elements expand together
	function togglePersonaExpansion(personaId: string) {
		// Update persona expansion state - this will trigger all reactive updates
		personas = personas.map(persona => 
			persona.id === personaId 
				? { ...persona, expanded: !persona.expanded }
				: persona
		);
	}

	// Open drawer with visit details
	function openVisitDetails(visit: ProcessedVisit, persona: Persona) {
		selectedVisit = visit;
		selectedPersona = persona;
		selectedSentimentData = sentimentData.find(s => s.visit_number === visit.visit_number) || null;
		
		// Find matching dropout data based on persona type
		const personaTypeMap: Record<string, string> = {
			'Patient': 'Teen Patient',
			'Caregiver': 'Caregiver (Parent)'
		};
		const dropoutPersonaType = personaTypeMap[persona.type] || persona.type;
		selectedDropoutData = dropoutData.find(d => d.persona === dropoutPersonaType) || null;
		
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

	// Open persona details drawer
	function openPersonaDrawer(persona: Persona) {
		selectedPersonaForDrawer = persona;
		personaDrawerOpen = true;
	}

	// Close persona details drawer
	function closePersonaDrawer() {
		personaDrawerOpen = false;
		selectedPersonaForDrawer = null;
	}

	// Handle persona row click
	function handlePersonaClick(persona: Persona, event: MouseEvent | KeyboardEvent) {
		// Prevent opening drawer if clicking on expand button
		if ((event.target as HTMLElement).closest('.expand-button')) {
			return;
		}
		openPersonaDrawer(persona);
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
		
		return position;
	}

	// Process visits with calculated data
	$: processedVisits = visits.map((visit): ProcessedVisit => ({
		...visit,
		burdenScore: calculateBurdenScore(visit.assessments),
		timelinePosition: getTimelinePosition(visit),
		studyDay: parseStudyDay(visit)
	})).sort((a, b) => a.studyDay - b.studyDay);

	// Calculate visit positions for grid lines
	function getVisitPositions(): number[] {
		if (!processedVisits.length) return [];
		return processedVisits.map(visit => visit.timelinePosition * timelineWidth);
	}

	// Get sentiment score for a specific persona type and visit
	function getSentimentScore(personaType: string, visitNumber: number): number {
		const visitSentiment = sentimentData.find(v => v.visit_number === visitNumber);
		if (!visitSentiment) return 3;

		if (personaType === 'Patient') {
			return visitSentiment.patient_sentiment.overall_score;
		} else {
			return visitSentiment.caregiver_sentiment.overall_score;
		}
	}

	// Calculate sentiment circle position relative to its grid cell (reactive function)
	function getSentimentCircleY(sentiment: number, personaIndex: number): number {
		const persona = personas[personaIndex];
		if (!persona || !persona.expanded) {
			// When collapsed, center the circle in the persona row
			return PERSONA_HEIGHT / 2;
		}
		
		// When expanded, position based on sentiment scale
		// The sentiment area starts after the persona content (PERSONA_HEIGHT)
		// and has SENTIMENT_SCALE_HEIGHT for the scale
		const sentimentAreaStart = PERSONA_HEIGHT;
		const sentimentAreaHeight = SENTIMENT_SCALE_HEIGHT;
		
		// Map sentiment (1-5) to position within sentiment area (higher sentiment = higher on scale)
		const sentimentPosition = ((5 - sentiment) / 4) * sentimentAreaHeight;
		
		return sentimentAreaStart + sentimentPosition;
	}

	// Calculate persona top positions reactively - triggers on any expansion change
	$: personaTopPositions = personas.map((_, index) => {
		let top = 0;
		for (let i = 0; i < index; i++) {
			top += personas[i].expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT;
		}
		return top;
	});

	// Get the top position of a persona row
	function getPersonaTop(personaIndex: number): number {
		return personaTopPositions[personaIndex] || 0;
	}

	// Calculate all grid positions reactively to ensure synchronized updates
	$: gridPositions = {
		personaTops: personaTopPositions,
		totalHeight: gridHeight,
		visitPositions: getVisitPositions()
	};

	// Get sentiment line points for a persona (reactive) - updates when personas or grid positions change
	$: sentimentLinePoints = personas.map((persona, personaIndex) => {
		if (!persona.expanded) return [];
		
		return processedVisits.map(visit => {
			const sentiment = getSentimentScore(persona.type, visit.visit_number);
			const yPosition = getSentimentCircleY(sentiment, personaIndex);
			return {
				x: visit.timelinePosition * timelineWidth,
				y: gridPositions.personaTops[personaIndex] + yPosition
			};
		});
	});

	// Get sentiment line points for a persona (function for backward compatibility)
	function getSentimentLinePoints(personaIndex: number): Array<{x: number, y: number}> {
		return sentimentLinePoints[personaIndex] || [];
	}

	// Reactive calculation of all sentiment circle positions to ensure they update when personas expand/collapse
	$: sentimentCirclePositions = personas.map((persona, personaIndex) => {
		return processedVisits.map((visit, visitIndex) => {
			const sentiment = getSentimentScore(persona.type, visit.visit_number);
			return {
				personaIndex,
				visitIndex,
				sentiment,
				y: getSentimentCircleY(sentiment, personaIndex)
			};
		});
	});

	// Determine study phase based on visit number
	function getStudyPhase(visitNumber: number): string {
		if (visitNumber <= 2) return 'early_visits';
		if (visitNumber <= 6) return 'mid_study';
		if (visitNumber <= 10) return 'late_study';
		return 'post_study_reflection';
	}

	// Get quotes for a specific persona and phase
	function getQuotesForPhase(persona: Persona, phase: string): string[] {
		if (!persona.quotes_by_phase) return [];
		return persona.quotes_by_phase[phase as keyof typeof persona.quotes_by_phase] || [];
	}

	// Get dropout risk for a specific persona and visit
	function getDropoutRisk(persona: Persona, visitNumber: number): { risk: number, drivers: string[] } {
		const personaTypeMap: Record<string, string> = {
			'Patient': persona.category || 'Teen Patient',
			'Caregiver': persona.category || 'Caregiver (Parent)'
		};
		
		const dropoutPersonaType = personaTypeMap[persona.type] || persona.category || persona.type;
		const personaDropoutData = dropoutData.find(d => d.persona === dropoutPersonaType);
		
		if (!personaDropoutData) return { risk: 0, drivers: [] };
		
		// Find the closest visit in dropout data
		const visitKey = `Visit ${visitNumber}`;
		const dropoutVisit = personaDropoutData.dropout_risk_by_visit[visitKey];
		
		if (dropoutVisit) {
			return {
				risk: dropoutVisit.likelihood || 0,
				drivers: dropoutVisit.primary_drivers || []
			};
		}
		
		// If exact visit not found, estimate based on nearby visits
		const allVisits = Object.keys(personaDropoutData.dropout_risk_by_visit);
		const visitNumbers = allVisits.map(v => parseInt(v.replace('Visit ', '')));
		const closestVisit = visitNumbers.reduce((prev, curr) => 
			Math.abs(curr - visitNumber) < Math.abs(prev - visitNumber) ? curr : prev
		);
		
		const closestVisitData = personaDropoutData.dropout_risk_by_visit[`Visit ${closestVisit}`];
		return {
			risk: closestVisitData?.likelihood || 0,
			drivers: closestVisitData?.primary_drivers || []
		};
	}

	// Calculate procedure discomfort based on assessments and persona type
	function getProcedureDiscomfort(persona: Persona, visit: ProcessedVisit): number {
		const personaTypeMap: Record<string, string> = {
			'Patient': persona.category || 'Teen Patient',
			'Caregiver': persona.category || 'Caregiver (Parent)'
		};
		
		const dropoutPersonaType = personaTypeMap[persona.type] || persona.category || persona.type;
		const personaDropoutData = dropoutData.find(d => d.persona === dropoutPersonaType);
		
		if (!personaDropoutData || !personaDropoutData.assessment_burden) return 0;
		
		// Calculate average discomfort based on assessments in the visit
		let totalDiscomfort = 0;
		let assessmentCount = 0;
		
		visit.assessments.forEach(assessment => {
			if (personaDropoutData.assessment_burden[assessment]) {
				totalDiscomfort += personaDropoutData.assessment_burden[assessment];
				assessmentCount++;
			}
		});
		
		return assessmentCount > 0 ? Math.round(totalDiscomfort / assessmentCount) : 0;
	}

	// Handle tooltip show
	function showTooltip(event: MouseEvent, persona: Persona, visit: ProcessedVisit) {
		clearTimeout(hoverTimeout);
		
		const studyPhase = getStudyPhase(visit.visit_number);
		const quotes = getQuotesForPhase(persona, studyPhase);
		const dropoutInfo = getDropoutRisk(persona, visit.visit_number);
		const procedureDiscomfort = getProcedureDiscomfort(persona, visit);
		
		tooltipX = event.clientX;
		tooltipY = event.clientY;
		tooltipPersona = persona;
		tooltipVisit = visit;
		tooltipQuotes = quotes.slice(0, 2); // Limit to 2 quotes for tooltip
		tooltipDropoutRisk = dropoutInfo.risk;
		tooltipPrimaryDrivers = dropoutInfo.drivers;
		tooltipBurdenScore = visit.burdenScore;
		tooltipProcedureDiscomfort = procedureDiscomfort;
		tooltipStudyPhase = studyPhase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
		
		// Show tooltip with slight delay for smoother UX
		hoverTimeout = setTimeout(() => {
			tooltipVisible = true;
		}, 200);
	}

	// Handle tooltip hide
	function hideTooltip() {
		clearTimeout(hoverTimeout);
		// Hide tooltip with minimal delay to allow for mouse movement between elements
		hoverTimeout = setTimeout(() => {
			tooltipVisible = false;
		}, 50);
	}
</script>

{#if mounted}
	<div class="persona-grid-container" style="width: {timelineWidth + LEFT_PANEL_WIDTH}px; height: {containerHeight}px; overflow: hidden;">
		<!-- Timeline Header -->
		{#if !hideHeader}
			<div class="timeline-header" style="width: {timelineWidth + LEFT_PANEL_WIDTH}px; height: {headerHeight}px;">
				<!-- Left panel spacer -->
				<div class="timeline-header-spacer" style="width: {LEFT_PANEL_WIDTH}px;"></div>
				
				<!-- Timeline labels -->
				<div class="timeline-labels" style="width: {timelineWidth}px; height: {headerHeight}px;">
					{#each processedVisits as visit, index}
						<div 
							class="visit-label"
							style="
								left: {visit.timelinePosition * timelineWidth - (dynamicCellWidth / 2)}px;
								width: {dynamicCellWidth}px;
							"
							title="{visit.name} - Study Day {visit.studyDay}"
						>
							<div class="visit-number">V{visit.visit_number}</div>
							<div class="study-day">
								{#if visit.study_day}
									Day {visit.study_day}
								{:else if visit.study_day_range}
									{visit.study_day_range}
								{:else}
									Day {visit.studyDay}
								{/if}
							</div>
							<div class="visit-name">{visit.name}</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Left panel with personas -->
		<div class="personas-panel" style="width: {LEFT_PANEL_WIDTH}px; height: {gridHeight}px; top: {panelTop}px;">
			{#each personas as persona, index}
				<div 
					class="persona-row" 
					class:expanded={persona.expanded}
					style="
						position: absolute;
						top: {gridPositions.personaTops[index]}px;
						width: 100%;
						height: {persona.expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT}px; 
					"
					on:click={(e) => handlePersonaClick(persona, e)}
					on:keydown={(e) => e.key === 'Enter' && handlePersonaClick(persona, e)}
					role="button"
					tabindex="0"
				>
					<div class="persona-content">
						<div class="persona-avatar" style="background-color: {persona.color}20;">
							<span class="avatar-emoji">{persona.avatar}</span>
						</div>
						<div class="persona-info">
							<div class="persona-name" style="color: {persona.color};">
								{persona.name}
							</div>
							<div class="persona-type" style="color: {persona.color}80;">
								{persona.type}
							</div>
						</div>
						<button 
							class="expand-button"
							on:click={() => togglePersonaExpansion(persona.id)}
							style="color: {persona.color};"
						>
							{persona.expanded ? '−' : '+'}
						</button>
					</div>
					
					{#if persona.expanded}
						<div class="sentiment-scale">
							
						</div>
					{/if}
				</div>
				
				<!-- Add separator line between persona rows -->
				{#if index < personas.length - 1}
					<div 
						class="persona-separator" 
						style="
							position: absolute;
							top: {gridPositions.personaTops[index + 1]}px;
							width: 100%;
							height: 1px;
							background: #e5e7eb;
							z-index: 5;
						"
					></div>
				{/if}
			{/each}
		</div>

		<!-- Grid area with visit lines and sentiment visualization -->
		<div 
			class="grid-area" 
			style="width: {timelineWidth}px; height: {gridHeight}px; margin-left: {LEFT_PANEL_WIDTH}px; top: {panelTop}px;"
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
			{#each gridPositions.visitPositions as position, index}
				<div 
					class="vertical-grid-line visit-line" 
					style="left: {position}px; height: {gridPositions.totalHeight}px;"
					title="Visit {processedVisits[index]?.visit_number}: {processedVisits[index]?.name}"
				></div>
			{/each}

			<!-- Sentiment lines (when expanded) -->
			{#each personas as persona, personaIndex}
				{#if persona.expanded}
					<SentimentLine 
						points={getSentimentLinePoints(personaIndex)}
						color={persona.color}
						strokeWidth={2}
						opacity={0.6}
					/>
				{/if}
			{/each}

			<!-- Grid cells and sentiment circles -->
			{#each personas as persona, personaIndex}
				{#each processedVisits as visit, visitIndex}
					{@const circleData = sentimentCirclePositions[personaIndex]?.[visitIndex]}
					{@const sentiment = circleData?.sentiment || getSentimentScore(persona.type, visit.visit_number)}
					{@const sentimentY = circleData?.y || getSentimentCircleY(sentiment, personaIndex)}
					
					<div 
						class="grid-cell"
						style="
							left: {visit.timelinePosition * timelineWidth - (dynamicCellWidth / 2)}px;
							top: {gridPositions.personaTops[personaIndex]}px;
							width: {dynamicCellWidth}px;
							height: {persona.expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT}px;
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
							x={dynamicCellWidth / 2}
							y={sentimentY}
							personaColor={persona.color}
							isExpanded={persona.expanded}
							tooltipText="{persona.name} - {visit.name}: Sentiment {sentiment}/5 (Click for details)"
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

	<!-- Persona Details Drawer -->
	<Drawer 
		bind:isOpen={personaDrawerOpen}
		title={selectedPersonaForDrawer ? `${selectedPersonaForDrawer.name} Details` : 'Persona Details'}
		width="600px"
		on:close={closePersonaDrawer}
	>
		{#if selectedPersonaForDrawer}
			<div class="persona-drawer-content">
				<!-- Persona Header -->
				<div class="persona-drawer-header" style="border-color: {selectedPersonaForDrawer.color};">
					<div class="persona-drawer-avatar" style="background-color: {selectedPersonaForDrawer.color}20;">
						<span class="avatar-emoji-large">{selectedPersonaForDrawer.avatar}</span>
					</div>
					<div class="persona-drawer-info">
						<h3 class="persona-drawer-name" style="color: {selectedPersonaForDrawer.color};">
							{selectedPersonaForDrawer.name}
						</h3>
						<p class="persona-drawer-type" style="color: {selectedPersonaForDrawer.color}80;">
							{selectedPersonaForDrawer.type}
						</p>
					</div>
				</div>

				<!-- Assessment Burden Heatmap -->
				<div class="heatmap-section">
					<h4 class="section-title">Assessment Burden Analysis</h4>
					<AssessmentBurdenHeatmap 
						showBurdenScores={false}
						maxSquares={10}
						squareSize="10px"
					/>
				</div>
			</div>
		{/if}
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
{/if}

<style>
	/* === MAIN CONTAINER === */
	.persona-grid-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		margin: 0;
		height: 100%;
		width: 100%;
		border-radius: 8px;
		overflow: hidden;
		background: #f9fafb;
		min-height: 200px; /* Ensure minimum height */
	}

	/* === TIMELINE HEADER === */
	.timeline-header {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		background: white;
		border-bottom: 2px solid #e5e7eb;
		z-index: 15;
	}

	.timeline-header-spacer {
		background: #f9fafb;
		border-right: 2px solid #e5e7eb;
	}

	.timeline-labels {
		position: relative;
		background: white;
	}

	.visit-label {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.5rem 0.25rem;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 4px;
	}

	.visit-label:hover {
		background: rgba(59, 130, 246, 0.1);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
	}

	.visit-number {
		font-weight: 700;
		font-size: 0.9rem;
		color: #1f2937;
		margin-bottom: 0.25rem;
	}

	.study-day {
		font-size: 0.7rem;
		color: #6b7280;
		font-weight: 500;
		margin-bottom: 0.25rem;
	}

	.visit-name {
		font-size: 0.65rem;
		color: #9ca3af;
		font-weight: 400;
		line-height: 1.2;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	/* === LEFT PANEL === */
	.personas-panel {
		position: absolute;
		left: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		background: #f9fafb;
		border-right: 2px solid #e5e7eb;
		z-index: 10;
		min-height: 200px; /* Ensure minimum height for visibility */
	}

	/* === PERSONA ROWS === */
	.persona-row {
		display: flex;
		flex-direction: column;
		padding: 0;
		margin: 0;
		transition: all 0.3s ease-in-out;
		cursor: pointer;
		background: #f9fafb;
	}

	.persona-row:hover {
		background: #f1f5f9;
	}

	.persona-row.expanded {
		background: #f8fafc;
	}

	.persona-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.75rem;
		height: 100px;
		margin: 0;
		border: none;
		border-radius: 0;
		transition: all 0.2s ease;
		box-sizing: border-box;
		flex-shrink: 0;
	}

	.persona-content:hover {
		background: #f1f5f9;
	}

	/* === PERSONA ELEMENTS === */
	.persona-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid currentColor;
		flex-shrink: 0;
	}

	.avatar-emoji {
		font-size: 1rem;
	}

	.persona-info {
		flex: 1;
		min-width: 0;
	}

	.persona-name {
		font-weight: 600;
		font-size: 0.9rem;
		line-height: 1.3;
		margin-bottom: 0.25rem;
	}

	.persona-type {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
		opacity: 0.8;
	}

	.expand-button {
		background: none;
		border: 1px solid currentColor;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 1rem;
		font-weight: bold;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.expand-button:hover {
		background: currentColor;
		color: white;
		transform: scale(1.05);
	}

	/* === SENTIMENT SCALE === */
	.sentiment-scale {
		padding: 1rem;
		background: rgba(0, 0, 0, 0.02);
		border-top: 1px solid #e5e7eb;
		transition: all 0.3s ease-in-out;
		height: 150px;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	.scale-labels {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-size: 0.7rem;
	}

	.scale-label {
		font-weight: 500;
		padding: 0.25rem 0;
	}

	/* === GRID AREA === */
	.grid-area {
		position: relative;
		background: white;
		border-radius: 0 8px 8px 0;
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

	/* === PERSONA DRAWER === */
	.persona-drawer-content {
		padding: 0;
	}

	.persona-drawer-header {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 2rem;
		border-bottom: 2px solid;
		margin-bottom: 2rem;
		background: rgba(0, 0, 0, 0.02);
	}

	.persona-drawer-avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 3px solid currentColor;
		flex-shrink: 0;
	}

	.avatar-emoji-large {
		font-size: 2.25rem;
	}

	.persona-drawer-info {
		flex: 1;
	}

	.persona-drawer-name {
		margin: 0 0 0.5rem 0;
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.persona-drawer-type {
		margin: 0;
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-weight: 600;
		opacity: 0.8;
	}

	.heatmap-section {
		padding: 0 2rem 2rem 2rem;
	}

	.section-title {
		margin: 0 0 1.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
	}

	/* === RESPONSIVE DESIGN === */
	@media (max-width: 768px) {
		.persona-grid-container {
			flex-direction: column;
			width: 100% !important;
		}

		.timeline-header {
			position: static;
			width: 100% !important;
		}

		.timeline-header-spacer {
			display: none;
		}

		.timeline-labels {
			width: 100% !important;
			overflow-x: auto;
			padding: 0 1rem;
		}

		.visit-label {
			padding: 0.375rem 0.25rem;
		}

		.visit-number {
			font-size: 0.8rem;
		}

		.study-day {
			font-size: 0.65rem;
		}

		.visit-name {
			font-size: 0.6rem;
		}

		.personas-panel {
			position: static;
			width: 100% !important;
			border-right: none;
			border-bottom: 2px solid #e5e7eb;
			top: 0 !important;
		}

		.grid-area {
			margin-left: 0 !important;
			top: 0 !important;
			overflow-x: auto;
			border-radius: 0 0 8px 8px;
		}

		.persona-content {
			padding: 0.5rem;
			gap: 0.5rem;
			height: 80px;
		}

		.persona-avatar {
			width: 28px;
			height: 28px;
		}

		.persona-name {
			font-size: 0.8rem;
		}

		.persona-type {
			font-size: 0.65rem;
		}

		.expand-button {
			width: 20px;
			height: 20px;
			font-size: 0.9rem;
		}

		.sentiment-scale {
			height: 120px;
			padding: 0.75rem;
		}

		.persona-drawer-header {
			padding: 1.5rem;
			gap: 1rem;
		}

		.persona-drawer-avatar {
			width: 48px;
			height: 48px;
		}

		.avatar-emoji-large {
			font-size: 1.75rem;
		}

		.persona-drawer-name {
			font-size: 1.5rem;
		}

		.heatmap-section {
			padding: 0 1.5rem 1.5rem 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.timeline-labels {
			padding: 0 0.5rem;
		}

		.visit-label {
			padding: 0.25rem 0.125rem;
		}

		.visit-number {
			font-size: 0.75rem;
		}

		.study-day {
			font-size: 0.6rem;
		}

		.visit-name {
			font-size: 0.55rem;
		}

		.persona-content {
			padding: 0.375rem;
			gap: 0.375rem;
			height: 70px;
		}

		.persona-name {
			font-size: 0.75rem;
		}

		.sentiment-scale {
			padding: 0.5rem;
			height: 100px;
		}

		.scale-labels {
			gap: 0.375rem;
		}

		.scale-label {
			font-size: 0.65rem;
		}
	}
</style> 
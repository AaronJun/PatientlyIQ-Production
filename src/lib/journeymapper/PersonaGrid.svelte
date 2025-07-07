<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, draw } from 'svelte/transition';
	import SentimentCircle from './SentimentCircle.svelte';
	import SentimentLine from './SentimentLine.svelte';
	import Drawer from './Drawer.svelte';
	import VisitDetails from './VisitDetails.svelte';
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
	export let timelineWidth: number = 2400;
	export let hideHeader: boolean = false;
	export let headerHeight: number = 80;

	// Personas data with expanded state - will be loaded from JSON
	let personas: Persona[] = [];

	// Constants
	const PERSONA_HEIGHT = 100;
	const EXPANDED_HEIGHT = 150; // Reduced since we removed sentiment scale
	const LEFT_PANEL_WIDTH = 250;
	const TIMELINE_HEADER_HEIGHT = 120; // Height for the timeline header (increased for multi-row header)

	let mounted = false;
	let sentimentData: VisitSentiment[] = [];
	let dropoutData: any[] = [];
	let personasData: Persona[] = [];
	let individualPersonaData: any = null;
	let personaBurdenData: any[] = [];
	
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
				personas = personasData.map((p, index) => ({ ...p, expanded: index < 2 })); // Expand first two personas
			} else {
				// Fallback to original personas if file not found
				personas = [
					{
						id: 'patient-1',
						name: 'Emma Johnson',
						type: 'Patient',
						color: '#059669',
						avatar: '/assets/TEENPATIENT.svg',
						expanded: true // First persona expanded
					},
					{
						id: 'caregiver-1',
						name: 'Michele Johnson',
						type: 'Caregiver',
						color: '#0369a1',
						avatar: '/assets/RURALMOTHER.svg',
						expanded: true // Second persona expanded
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
					avatar: '/assets/TEENPATIENT.svg',
					expanded: true // First persona expanded
				},
				{
					id: 'caregiver-1',
					name: 'Michael Johnson',
					type: 'Caregiver',
					color: '#0369a1',
					avatar: '👨‍🦰',
					expanded: true // Second persona expanded
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

		// Load individual persona visit data for Emma and Michael
		try {
			const individualResponse = await fetch('/data/journeymap/emma_michael_visit_data.json');
			if (individualResponse.ok) {
				individualPersonaData = await individualResponse.json();
			}
		} catch (error) {
			console.error('Failed to load individual persona data:', error);
		}

		// Load persona burden data
		try {
			const burdenResponse = await fetch('/data/journeymap/persona_burden_heatmap.json');
			if (burdenResponse.ok) {
				personaBurdenData = await burdenResponse.json();
			}
		} catch (error) {
			console.error('Failed to load persona burden data:', error);
			personaBurdenData = [];
		}

		// Force recalculation of sentiment after all data is loaded
		personas = [...personas]; // Trigger reactivity
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
		
		// Check if we have individual persona data first
		if (individualPersonaData?.personas) {
			const individualPersona = individualPersonaData.personas.find((p: any) => p.name === persona.name);
			if (individualPersona?.visit_data) {
				const visitData = individualPersona.visit_data.find((v: any) => v.visit_number === visit.visit_number);
				if (visitData) {
					// Create synthetic sentiment data from individual persona data
					const defaultSentiment = { overall_score: 3, anxiety_level: 3, hope_level: 3, burden_perception: 3, reasoning: "" };
					selectedSentimentData = {
						visit_number: visit.visit_number,
						visit_name: visit.name,
						patient_sentiment: visitData.sentiment || defaultSentiment,
						caregiver_sentiment: visitData.sentiment || defaultSentiment
					};
					
					// Create synthetic dropout data from individual persona data
					selectedDropoutData = {
						persona: persona.name,
						dropout_risk_by_visit: {
							[`Visit ${visit.visit_number}`]: {
								likelihood: visitData.dropout_risk || 0,
								primary_drivers: visitData.primary_drivers || []
							}
						}
					};
					
					drawerOpen = true;
					return;
				}
			}
		}
		
		// Fall back to generic data
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
		
		// Debug logging to verify data loading
		const burdenData = getPersonaBurdenData(persona);
		console.log('Opening drawer for persona:', persona.name, persona.type, persona.category);
		console.log('Found burden data:', burdenData);
		console.log('Available personas in burden data:', personaBurdenData.map(p => p.persona));
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

	// Get burden color based on score
	function getBurdenColor(score: number): string {
		if (score < 30) return '#22c55e'; // green - low burden
		if (score < 50) return '#84cc16'; // lime - moderate-low burden  
		if (score < 70) return '#eab308'; // yellow - moderate burden
		if (score < 85) return '#f97316'; // orange - high burden
		return '#ef4444'; // red - very high burden
	}

	// Get sentiment color based on 1-10 score
	function getSentimentColor(sentiment: number): string {
		if (sentiment >= 8) return '#22c55e';      // High positive (8-10) - green
		if (sentiment >= 6) return '#84cc16';      // Moderate positive (6-7) - lime
		if (sentiment >= 5) return '#eab308';      // Neutral (5) - yellow
		if (sentiment >= 3) return '#f97316';      // Moderate negative (3-4) - orange
		return '#ef4444';                          // High negative (1-2) - red
	}

	// Calculate weighted sentiment score (1-10 scale) based on multiple factors
	function calculateWeightedSentiment(sentimentData: any, visitNumber?: number): number {
		if (!sentimentData) return 5; // Default neutral score
		
		// Extract individual scores (assuming 1-5 scale from source data)
		const overall = sentimentData.overall_score || 3;
		const anxiety = sentimentData.anxiety_level || 3;
		const hope = sentimentData.hope_level || 3;
		const burden = sentimentData.burden_perception || 3;
		
		// Define weights for each factor with enhanced variance
		const weights = {
			overall: 0.35,   // 35% weight to overall sentiment
			anxiety: 0.30,   // 30% weight to anxiety (inverted - lower anxiety = better sentiment)
			hope: 0.25,      // 25% weight to hope level
			burden: 0.10     // 10% weight to burden perception (inverted - lower burden = better sentiment)
		};
		
		// Convert 1-5 scale to 1-10 scale with enhanced variance
		// Apply exponential scaling to create more dramatic differences
		const scaleConversion = (value: number, invert: boolean = false) => {
			const normalizedValue = invert ? (6 - value) : value;
			// Use exponential scaling to enhance variance: 1->1, 2->3, 3->5, 4->7, 5->10
			const scaledValue = Math.pow((normalizedValue - 1) / 4, 0.8) * 9 + 1;
			return scaledValue;
		};
		
		// Calculate component scores with enhanced variance
		const overallScore = scaleConversion(overall) * weights.overall;
		const anxietyScore = scaleConversion(anxiety, true) * weights.anxiety; // Inverted
		const hopeScore = scaleConversion(hope) * weights.hope;
		const burdenScore = scaleConversion(burden, true) * weights.burden; // Inverted
		
		let weightedScore = overallScore + anxietyScore + hopeScore + burdenScore;
		
		// Apply stage-based variance modifiers if visit number is available
		if (visitNumber) {
			let stageModifier = 1.0;
			if (visitNumber <= 2) {
				// Early visits: Amplify positive sentiment more
				stageModifier = weightedScore > 6 ? 1.2 : 1.1;
			} else if (visitNumber <= 6) {
				// Mid-early: Slight amplification
				stageModifier = 1.05;
			} else if (visitNumber <= 12) {
				// Mid-late: Begin dampening positive sentiment
				stageModifier = weightedScore > 5 ? 0.95 : 0.9;
			} else {
				// Late stage: Significant dampening and amplification of negative sentiment
				stageModifier = weightedScore > 5 ? 0.85 : 0.8;
			}
			
			weightedScore *= stageModifier;
			
			// Additional late-stage sentiment decline
			if (visitNumber > 10) {
				const lateStageDecline = (visitNumber - 10) * 0.3;
				weightedScore -= lateStageDecline;
			}
		}
		
		// Apply variance enhancement based on sentiment extremes
		if (weightedScore > 7) {
			// Amplify high positive sentiment
			weightedScore = 7 + (weightedScore - 7) * 1.3;
		} else if (weightedScore < 4) {
			// Amplify low negative sentiment
			weightedScore = 4 - (4 - weightedScore) * 1.3;
		}
		
		// Ensure the result is within 1-10 range
		return Math.max(1, Math.min(10, Math.round(weightedScore * 10) / 10));
	}

	// Get sentiment score for a specific persona and visit (1-10 scale)
	function getSentimentScore(persona: Persona, visitNumber: number): number {
		// First, check if we have individual data for this specific persona
		if (individualPersonaData?.personas) {
			const individualPersona = individualPersonaData.personas.find((p: any) => p.name === persona.name);
			if (individualPersona?.visit_data) {
				const visitData = individualPersona.visit_data.find((v: any) => v.visit_number === visitNumber);
				if (visitData?.sentiment) {
					return calculateWeightedSentiment(visitData.sentiment, visitNumber);
				}
			}
		}

		// Fall back to generic sentiment data
		const visitSentiment = sentimentData.find(v => v.visit_number === visitNumber);
		if (visitSentiment) {
			if (persona.type === 'Patient') {
				return calculateWeightedSentiment(visitSentiment.patient_sentiment, visitNumber);
			} else {
				return calculateWeightedSentiment(visitSentiment.caregiver_sentiment, visitNumber);
			}
		}

		// If no sentiment data available, create realistic sentiment based on journey progression
		return calculateRealisticSentiment(persona, visitNumber);
	}

	// Calculate realistic sentiment variation based on persona and visit characteristics
	function calculateRealisticSentiment(persona: Persona, visitNumber: number): number {
		// Get dropout risk to inform sentiment calculation
		const dropoutInfo = getDropoutRisk(persona, visitNumber);
		const dropoutRisk = dropoutInfo.risk;
		
		// Base sentiment calculation using dropout risk as primary driver
		// Higher dropout risk should correlate with lower sentiment
		// Transform dropout risk (0-1) to sentiment impact (10-1)
		let baseSentiment = 10 - (dropoutRisk * 9); // 0% risk = 10, 100% risk = 1
		
		// Create more dramatic stage-based variance
		let stageMultiplier = 1.0;
		if (visitNumber <= 2) {
			// Early stage: Higher baseline optimism but still affected by dropout risk
			stageMultiplier = 1.3;
			baseSentiment = Math.min(10, baseSentiment + 2);
		} else if (visitNumber <= 6) {
			// Mid-early stage: Reality setting in, moderate decline
			stageMultiplier = 1.1;
			baseSentiment = baseSentiment + 0.5;
		} else if (visitNumber <= 12) {
			// Mid-late stage: Significant burden accumulation
			stageMultiplier = 0.9;
			baseSentiment = baseSentiment - 0.5;
		} else {
			// Late stage: Severe sentiment decline, dropout risk dominates
			stageMultiplier = 0.7;
			baseSentiment = baseSentiment - 2;
		}
		
		// Apply stage multiplier to enhance variance
		baseSentiment = baseSentiment * stageMultiplier;

		// Persona-specific adjustments for different sentiment patterns
		if (persona.type === 'Patient') {
			// Patients have more volatile sentiment - higher highs and lower lows
			if (visitNumber <= 3) {
				baseSentiment += 1.5; // More optimistic early
			} else if (visitNumber > 10) {
				baseSentiment -= 2.5; // More dramatic decline later
			}
			
			// Teen patients are especially volatile
			if (persona.category === 'Teen Patient' || persona.name.toLowerCase().includes('teen')) {

				if (visitNumber <= 2) {
					baseSentiment += 1; // Extra optimism early
				} else if (visitNumber >= 14 && visitNumber <= 18) {
					// Teen recovery - dramatic improvement with completion hope
					const recoveryBoost = (visitNumber - 13) * 1.2; // Stronger boost for teens 14-18

					baseSentiment += recoveryBoost;
					// Additional boost for school/social life anticipation
					baseSentiment += 0.5;
				} else if (visitNumber > 8) {
					baseSentiment -= 3; // Dramatic frustration later
				}
			}
		} else {
			// Caregivers have more sustained stress patterns
			if (visitNumber <= 2) {
				baseSentiment += 0.5; // Cautious optimism
			} else if (visitNumber > 6) {
				baseSentiment -= 1.5; // Steady decline with accumulated stress
			}
			
			// Rural caregivers face additional logistical challenges
			if (persona.category === 'Rural Working Mother' || persona.name.toLowerCase().includes('rural')) {

				baseSentiment -= 1.5; // Consistent logistical burden
				if (visitNumber >= 14 && visitNumber <= 18) {
					// Gradual relief as end approaches - logistics become more manageable
					const reliefBoost = (visitNumber - 13) * 0.9; // Different slope than teens

					baseSentiment += reliefBoost;
					// Additional relief from reduced travel anticipation
					if (visitNumber >= 16) {
						baseSentiment += 0.8; // Extra boost for later visits
					}
				} else if (visitNumber > 8) {
					baseSentiment -= 2; // Compounding challenges in later stages
				}
			}
		}

		// Add variation based on visit characteristics with enhanced impact
		const visit = processedVisits.find(v => v.visit_number === visitNumber);
		if (visit) {
			// High burden visits have more dramatic impact
			if (visit.burdenScore > 80) baseSentiment -= 2.5;
			else if (visit.burdenScore > 60) baseSentiment -= 1.5;
			else if (visit.burdenScore > 40) baseSentiment -= 0.5;
			
			// Travel required has cumulative impact (worse in later visits)
			if (visit.travel_required) {
				const travelImpact = visitNumber <= 6 ? -0.5 : -1.5;
				baseSentiment += travelImpact;
			}
			
			// Assessment burden has increasing impact over time
			const assessmentImpact = visit.assessments.length > 8 ? -2 : 
			                       visit.assessments.length > 5 ? -1 : 0;
			const fatigueMultiplier = visitNumber <= 6 ? 1 : 1.5;
			baseSentiment += assessmentImpact * fatigueMultiplier;
		}

		// Add controlled variation based on dropout risk drivers
		if (dropoutInfo.drivers.length > 0) {
			// More drivers = more sentiment impact
			const driverImpact = -0.3 * dropoutInfo.drivers.length;
			baseSentiment += driverImpact;
			
			// Specific high-impact drivers
			const highImpactDrivers = [
				'Hope Level', 'Emotional Burden', 'Emotional Fatigue', 
				'Anxiety Level', 'Multiple Children at Home', 'Financial Challenges'
			];
			const highImpactCount = dropoutInfo.drivers.filter(d => 
				highImpactDrivers.includes(d)).length;
			if (highImpactCount > 0) {
				baseSentiment -= highImpactCount * 0.8;
			}
		}

		// Create more dramatic sentiment swings for key transition points
		if (dropoutRisk > 0.4 && dropoutRisk <= 0.5) {
			// Critical transition point - sentiment drops more dramatically
			baseSentiment -= 1.5;
		} else if (dropoutRisk > 0.6) {
			// High risk zone - severe sentiment decline
			baseSentiment -= 2.5;
		}

		// Ensure result is within 1-10 range but allow for more extreme values
		const finalSentiment = Math.max(1, Math.min(10, Math.round(baseSentiment * 10) / 10));
		

		
		return finalSentiment;
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
		totalHeight: gridHeight
	};

	// Force sentiment recalculation when data is loaded
	$: if (personas.length > 0 && processedVisits.length > 0 && mounted) {
		// This reactive block ensures sentiment calculations update when both data sources are available
	}





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

	// Get visit-specific quotes for a persona
	function getVisitQuotes(persona: Persona, visitNumber: number): string[] {
		// First, check if we have individual visit data for this specific persona
		if (individualPersonaData?.personas) {
			const individualPersona = individualPersonaData.personas.find((p: any) => p.name === persona.name);
			if (individualPersona?.visit_data) {
				const visitData = individualPersona.visit_data.find((v: any) => v.visit_number === visitNumber);
				if (visitData?.quotes) {
					return visitData.quotes;
				}
			}
		}

		// Fall back to phase-based quotes
		const studyPhase = getStudyPhase(visitNumber);
		return getQuotesForPhase(persona, studyPhase);
	}

	// Get dropout risk for a specific persona and visit
	function getDropoutRisk(persona: Persona, visitNumber: number): { risk: number, drivers: string[] } {
		// First, check if we have individual data for this specific persona
		if (individualPersonaData?.personas) {
			const individualPersona = individualPersonaData.personas.find((p: any) => p.name === persona.name);
			if (individualPersona?.visit_data) {
				const visitData = individualPersona.visit_data.find((v: any) => v.visit_number === visitNumber);
				if (visitData) {
					return {
						risk: visitData.dropout_risk || 0,
						drivers: visitData.primary_drivers || []
					};
				}
			}
		}

		// Fall back to generic dropout data
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
		const quotes = getVisitQuotes(persona, visit.visit_number);
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

	// Get persona burden data for the selected persona
	function getPersonaBurdenData(persona: Persona) {
		// Map persona types and names to burden data personas
		const personaTypeMap: Record<string, string> = {
			'Patient': 'Teen Patient',
			'Caregiver': 'Caregiver (Parent)'
		};
		
		// Check for specific persona mappings first
		const personaNameMap: Record<string, string> = {
			'Emma Johnson': 'Teen Patient',
			'Michele Johnson': 'Caregiver (Parent)',
			'Michael Johnson': 'Caregiver (Parent)',
			'Rural Working Mother': 'Rural Working Mother'
		};
		
		// Try to find exact match by persona name first
		if (personaNameMap[persona.name]) {
			const exactMatch = personaBurdenData.find(p => p.persona === personaNameMap[persona.name]);
			if (exactMatch) return exactMatch;
		}
		
		// Fall back to category or type mapping
		const burdenPersonaType = persona.category || personaTypeMap[persona.type] || persona.type;
		const fallbackMatch = personaBurdenData.find(p => p.persona === burdenPersonaType);
		
		// If still no match, try to find by similar persona type
		if (!fallbackMatch && persona.type === 'Caregiver') {
			// For caregivers, try to find any caregiver data
			return personaBurdenData.find(p => 
				p.persona.toLowerCase().includes('caregiver') || 
				p.persona.toLowerCase().includes('parent') ||
				p.persona.toLowerCase().includes('mother')
			) || null;
		}
		
		return fallbackMatch || null;
	}

	// Convert numerical score to categorical label
	function getBurdenCategory(score: number): string {
		if (score <= 2) return 'Very Low';
		if (score <= 4) return 'Low';
		if (score <= 6) return 'Moderate';
		if (score <= 8) return 'High';
		return 'Very High';
	}
</script>

	{#if mounted}
	<div class="persona-grid-container" style="height: {containerHeight}px;">
		<!-- Main content area with fixed left panel and scrollable content -->
		<div class="main-content-area" style="height: {hideHeader ? gridHeight : containerHeight}px;">
			<!-- Fixed left panel with personas -->
			<div class="personas-panel" style="width: {LEFT_PANEL_WIDTH}px; height: {hideHeader ? gridHeight : containerHeight}px;">
				<!-- Persona header spacer (if timeline header is shown) -->
				{#if !hideHeader}
					<div class="persona-header-spacer" style="height: {headerHeight}px; background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
						<div class="persona-header-title">Personas</div>
					</div>
				{/if}
				
				<!-- Personas content -->
				<div class="personas-content" style="height: {gridHeight}px; position: relative;">
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
							<div class="persona-content" style="height: {persona.expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT}px;">
								<div class="persona-avatar" style="background-color: {persona.color}20;">
									{#if persona.avatar.startsWith('/') || persona.avatar.includes('.svg')}
										<img src={persona.avatar} alt="{persona.name} avatar" class="avatar-svg" />
									{:else}
										<span class="avatar-emoji">{persona.avatar}</span>
									{/if}
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
			</div>

			<!-- Scrollable content area (timeline + grid) -->
			<div class="scrollable-content-area">
				<!-- Combined timeline header and grid in one scrollable container -->
				<div class="timeline-and-grid-container" style="width: {timelineWidth}px; height: {(hideHeader ? 0 : headerHeight) + gridHeight}px;">
					<!-- Unified Timeline Header -->
					{#if !hideHeader}
						<div class="unified-timeline-header-fixed" style="
							height: {headerHeight}px; 
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
											left: {visit.timelinePosition * timelineWidth - (dynamicCellDimensions.cellWidth / 2)}px;
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
										class="header-cell study-week-cell dynamic-cell"
										style="
											--visit-position: {visit.timelinePosition};
											--cell-index: {index};
											left: {visit.timelinePosition * timelineWidth - (dynamicCellDimensions.cellWidth / 2)}px;
											width: {dynamicCellDimensions.cellWidth}px;
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
								{#each processedVisits as visit, index}
									<div 
										class="header-cell visit-name-cell dynamic-cell"
										style="
											--visit-position: {visit.timelinePosition};
											--cell-index: {index};
											left: {visit.timelinePosition * timelineWidth - (dynamicCellDimensions.cellWidth / 2)}px;
											width: {dynamicCellDimensions.cellWidth}px;
										"
										title="{visit.name}"
									>
										<span class="visit-name">{visit.name}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Grid area with visit lines and sentiment visualization -->
					<div 
						class="grid-area" 
						style="width: {timelineWidth}px; height: {gridHeight}px; top: {hideHeader ? 0 : headerHeight}px;"
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
					style="left: {visit.timelinePosition * timelineWidth}px; height: {gridPositions.totalHeight}px;"
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
							x: visit.timelinePosition * timelineWidth,
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
					{@const padding = 16} <!-- Consistent padding from top/bottom -->
					{@const availableHeight = cellHeight - (padding * 2)}
					{@const sentimentY = padding + (availableHeight * (1 - (sentiment / 10)))} <!-- Invert scale: 10 at top, 1 at bottom -->
					
					<div 
						class="grid-cell dynamic-cell"
						style="
							--visit-position: {visit.timelinePosition};
							--cell-index: {visitIndex};
							left: {visit.timelinePosition * timelineWidth - (dynamicCellDimensions.cellWidth / 2)}px;
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
			</div>
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
						{#if selectedPersonaForDrawer.avatar.startsWith('/') || selectedPersonaForDrawer.avatar.includes('.svg')}
							<img src={selectedPersonaForDrawer.avatar} alt="{selectedPersonaForDrawer.name} avatar" class="avatar-svg-large" />
						{:else}
							<span class="avatar-emoji-large">{selectedPersonaForDrawer.avatar}</span>
						{/if}
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

				<!-- Assessment Burden Analysis -->
				<div class="burden-analysis-section">
					<h4 class="section-title">Assessment Burden Analysis</h4>
										{#if selectedPersonaForDrawer}
						{@const personaBurden = getPersonaBurdenData(selectedPersonaForDrawer)}
						{#if personaBurden}
							<div class="persona-burden-content">
								<!-- Debug Info -->
								<div class="debug-info">
									<p><strong>Persona:</strong> {selectedPersonaForDrawer.name} ({selectedPersonaForDrawer.type})</p>
									<p><strong>Mapped to:</strong> {personaBurden.persona}</p>
									<p><strong>Data Source:</strong> persona_burden_heatmap.json</p>
								</div>

								<!-- Assessment Burden -->
								{#if personaBurden.assessment_burden && Object.keys(personaBurden.assessment_burden).length > 0}
									<div class="burden-category">
										<h5 class="category-title">Assessment-Specific Burden</h5>
										<div class="assessments-grid">
											{#each Object.entries(personaBurden.assessment_burden).filter(([_, score]) => score !== undefined && score !== null) as [assessment, score]}
												{@const scoreValue = Number(score) || 0}
												<div class="assessment-item">
													<div class="assessment-label">
														<span class="label-text">{assessment}</span>
														<span class="score-badge" style="background-color: {getBurdenColor(scoreValue)};">
															{scoreValue}/10 - {getBurdenCategory(scoreValue)}
														</span>
													</div>
													<div class="squares-container">
														{#each Array(10) as _, i}
															<div 
																class="burden-square" 
																class:filled={i < scoreValue}
																style="
																	width: 12px; 
																	height: 12px;
																	background-color: {i < scoreValue ? getBurdenColor(scoreValue) : 'transparent'};
																	border-color: {getBurdenColor(scoreValue)};
																"
															></div>
														{/each}
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- General Burden Scores -->
								{#if personaBurden.burden_scores && Object.keys(personaBurden.burden_scores).length > 0}
									<div class="burden-category">
										<h5 class="category-title">General Burden Areas</h5>
										<div class="assessments-grid">
											{#each Object.entries(personaBurden.burden_scores).filter(([_, score]) => score !== undefined && score !== null) as [area, score]}
												{@const scoreValue = Number(score) || 0}
												<div class="assessment-item">
													<div class="assessment-label">
														<span class="label-text">{area}</span>
														<span class="score-badge" style="background-color: {getBurdenColor(scoreValue)};">
															{scoreValue}/10 - {getBurdenCategory(scoreValue)}
														</span>
													</div>
													<div class="squares-container">
														{#each Array(10) as _, i}
															<div 
																class="burden-square" 
																class:filled={i < scoreValue}
																style="
																	width: 12px; 
																	height: 12px;
																	background-color: {i < scoreValue ? getBurdenColor(scoreValue) : 'transparent'};
																	border-color: {getBurdenColor(scoreValue)};
																"
															></div>
														{/each}
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="no-data">
								<p>No burden data available for this persona.</p>
								<p><strong>Persona:</strong> {selectedPersonaForDrawer.name} ({selectedPersonaForDrawer.type})</p>
								<p><strong>Category:</strong> {selectedPersonaForDrawer.category || 'None'}</p>
								<p><strong>Available personas in data:</strong></p>
								<ul>
									{#each personaBurdenData as item}
										<li>{item.persona}</li>
									{/each}
								</ul>
							</div>
						{/if}
					{/if}
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
		overflow: hidden; /* No scrolling at main container level */
		background: #f9fafb;
		min-height: 200px; /* Ensure minimum height */
	}

	/* === PERSONA HEADER === */
	.persona-header-spacer {
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: #374151;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.875rem;
	}

	.persona-header-title {
		opacity: 0.8;
	}

	.personas-content {
		overflow: hidden;
	}

	/* === SCROLLABLE CONTENT AREA === */
	.scrollable-content-area {
		flex: 1;
		overflow-x: auto;
		overflow-y: hidden;
		display: flex;
		flex-direction: column;
	}

	/* === TIMELINE AND GRID CONTAINER === */
	.timeline-and-grid-container {
		position: relative;
		min-width: fit-content;
	}

	/* === UNIFIED TIMELINE HEADER (FIXED) === */
	.unified-timeline-header-fixed {
		position: absolute;
		top: 0;
		left: 0;
		background: white;
		border-bottom: 2px solid #e5e7eb;
		z-index: 10;
	}

	.header-row {
		position: absolute;
		width: 100%;
		height: 40px;
		display: flex;
		align-items: center;
	}

	.visit-numbers-row {
		top: 0;
		background: rgba(59, 130, 246, 0.05);
	}

	.study-weeks-row {
		top: 40px;
		background: rgba(245, 158, 11, 0.05);
	}

	.visit-names-row {
		top: 80px;
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

	/* Dynamic cell sizing support */
	.dynamic-cell {
		/* Use CSS custom properties for responsive sizing */
		min-width: var(--cell-min-width, 80px);
		max-width: var(--cell-max-width, 200px);
		width: var(--dynamic-cell-width, 120px);
		
		/* Enable smooth transitions when cell dimensions change */
		transition: all 0.2s ease, width 0.3s ease;
		
		/* Ensure content remains centered */
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Container support for dynamic cells */
	.unified-timeline-header-fixed {
		/* Support for dynamic cell sizing */
		--cell-spacing: calc(var(--timeline-width) / var(--cell-count));
		--adaptive-cell-width: clamp(
			var(--cell-min-width),
			var(--cell-spacing),
			var(--cell-max-width)
		);
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
		white-space: nowrap;
	}

	/* === MAIN CONTENT AREA === */
	.main-content-area {
		position: relative;
		display: flex;
		width: 100%;
		overflow: hidden;
	}

	/* === LEFT PANEL === */
	.personas-panel {
		position: sticky;
		left: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		background: #f9fafb;
		border-right: 2px solid #e5e7eb;
		z-index: 10;
		min-height: 200px; /* Ensure minimum height for visibility */
		flex-shrink: 0; /* Prevent the panel from shrinking */
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
		margin: 0;
		border: none;
		border-radius: 0;
		transition: all 0.3s ease;
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

	.avatar-svg {
		width: 28px;
		height: 28px;
		object-fit: contain;
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



	/* === GRID AREA === */
	.grid-area {
		position: absolute;
		left: 0;
		background: white;
		border-radius: 0 8px 8px 0;
		min-width: fit-content; /* Ensure grid area doesn't shrink */
	}

	/* === SCROLLBAR STYLING === */
	.scrollable-content-area::-webkit-scrollbar {
		height: 8px;
	}

	.scrollable-content-area::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 4px;
	}

	.scrollable-content-area::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 4px;
	}

	.scrollable-content-area::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
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

	.avatar-svg-large {
		width: 56px;
		height: 56px;
		object-fit: contain;
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

	.burden-analysis-section {
		padding: 0 2rem 2rem 2rem;
	}

	.section-title {
		margin: 0 0 1.5rem 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
	}

	.persona-burden-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.debug-info {
		background: #f0f9ff;
		border: 1px solid #0ea5e9;
		border-radius: 6px;
		padding: 1rem;
		font-size: 0.875rem;
		color: #0c4a6e;
	}

	.debug-info p {
		margin: 0.25rem 0;
	}

	.burden-category {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
	}

	.category-title {
		margin: 0;
		padding: 1rem;
		background: #374151;
		color: white;
		font-size: 1rem;
		font-weight: 600;
		border-bottom: 2px solid #6b7280;
	}

	.assessments-grid {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.assessment-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		background: white;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		transition: all 0.2s ease;
	}

	.assessment-item:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border-color: #d1d5db;
	}

	.assessment-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.label-text {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	.score-badge {
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		min-width: 1.5rem;
		text-align: center;
	}

	.squares-container {
		display: flex;
		gap: 3px;
		flex-wrap: wrap;
	}

	.burden-square {
		border: 1px solid;
		border-radius: 2px;
		transition: all 0.2s ease;
	}

	.burden-square.filled {
		opacity: 1;
	}

	.burden-square:not(.filled) {
		opacity: 0.3;
	}

	.burden-square:hover {
		transform: scale(1.1);
	}

	.no-data {
		text-align: left;
		color: #6b7280;
		font-style: italic;
		padding: 2rem;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 6px;
	}

	.no-data p {
		margin: 0.5rem 0;
	}

	.no-data ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
	}

	.no-data li {
		margin: 0.25rem 0;
	}

	/* === RESPONSIVE DESIGN === */
	@media (max-width: 768px) {
		.main-content-area {
			flex-direction: column;
		}

		.scrollable-content-area {
			width: 100%;
		}

		.unified-timeline-header-fixed {
			padding: 0 1rem;
			/* Adjust cell spacing for tablet */
			--cell-min-width: 60px;
			--cell-max-width: 150px;
		}

		.header-cell {
			padding: 0.375rem 0.25rem;
		}

		/* Dynamic cell responsive adjustments */
		.dynamic-cell {
			padding: 0.375rem 0.25rem;
		}

		.visit-number {
			font-size: 0.8rem;
		}

		.study-week {
			font-size: 0.65rem;
		}

		.visit-name {
			font-size: 0.6rem;
		}

		.unified-timeline-header-fixed {
			height: auto !important;
			position: static;
		}

		.timeline-and-grid-container {
			height: auto !important;
		}

		.grid-area {
			position: static;
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

		.personas-panel {
			position: static;
			width: 100%;
			border-right: none;
			border-bottom: 2px solid #e5e7eb;
		}

		.grid-area-container {
			width: 100%;
		}

		.grid-area {
			border-radius: 0 0 8px 8px;
		}

		.persona-content {
			padding: 0.5rem;
			gap: 0.5rem;
		}

		.persona-avatar {
			width: 28px;
			height: 28px;
		}

		.avatar-svg {
			width: 24px;
			height: 24px;
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

		.avatar-svg-large {
			width: 44px;
			height: 44px;
		}

		.persona-drawer-name {
			font-size: 1.5rem;
		}

		.burden-analysis-section {
			padding: 0 1.5rem 1.5rem 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.unified-timeline-header-fixed {
			padding: 0 0.5rem;
			/* Adjust cell spacing for mobile */
			--cell-min-width: 50px;
			--cell-max-width: 100px;
		}

		.header-cell {
			padding: 0.25rem 0.125rem;
		}

		/* Dynamic cell responsive adjustments */
		.dynamic-cell {
			padding: 0.25rem 0.125rem;
		}

		.visit-number {
			font-size: 0.75rem;
		}

		.study-week {
			font-size: 0.6rem;
		}

		.visit-name {
			font-size: 0.55rem;
		}

		.header-cell {
			min-width: 100px;
			padding: 0.25rem 0.125rem;
		}

		.persona-content {
			padding: 0.375rem;
			gap: 0.375rem;
		}

		.persona-name {
			font-size: 0.75rem;
		}


	}
</style> 
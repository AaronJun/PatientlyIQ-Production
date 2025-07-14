<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, draw } from 'svelte/transition';
	import SentimentCircle from './SentimentCircle.svelte';
	import SentimentLine from './SentimentLine.svelte';
	import Drawer from './Drawer.svelte';
	import VisitDetails from './VisitDetails.svelte';
	import PersonaTooltip from './PersonaTooltip.svelte';
	import TimelineHeader from './TimelineHeader.svelte';
	import PersonaSidebar from './PersonaSidebar.svelte';
	import JourneyContentArea from './JourneyContentArea.svelte';
	import study_schedule from '../../data/journeymap/study_schedule.json';

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
		stage: string;
	}

	interface ScheduleVisit {
		stage: string;
		visit: string;
		week: string;
		assessments: string[];
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
	export let headerHeight: number = 120; // Increased for 3 rows

	// Personas data with expanded state - will be loaded from JSON
	let personas: Persona[] = [];

	// Constants
	const PERSONA_HEIGHT = 100;
	const EXPANDED_HEIGHT = 150;
	const LEFT_PANEL_WIDTH = 250;
	const HEADER_ROW_HEIGHT = 40; // Height for each header row

	let mounted = false;
	let sentimentData: VisitSentiment[] = [];
	let dropoutData: any[] = [];
	let personasData: Persona[] = [];
	let individualPersonaData: any = null;
	let personaBurdenData: any[] = [];
	
	// Visit Details Drawer state
	let drawerOpen = false;
	let selectedVisit: ProcessedVisit | null = null;
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

	// Function to determine visit stage based on visit number
	function getVisitStage(visitNumber: number): string {
		if (visitNumber <= 2) return 'Screening';
		if (visitNumber <= 6) return 'Early';
		if (visitNumber <= 12) return 'Mid';
		if (visitNumber <= 18) return 'Late';
		return 'Follow-up';
	}

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
	$: processedVisits = visits.map((visit): ProcessedVisit => {
		// Extract visit number from name if it's in format "Visit X"
		const visitMatch = visit.name.match(/Visit (\d+)/);
		const visitNumber = visitMatch ? parseInt(visitMatch[1]) : visit.visit_number;

		// Find corresponding visit in study_schedule.json
		const scheduleVisit = study_schedule.study_schedule.find((sv: ScheduleVisit) => {
			const svMatch = sv.visit.match(/Visit (\d+)/);
			const svNumber = svMatch ? parseInt(svMatch[1]) : null;
			return svNumber === visitNumber;
		});

		return {
			...visit,
			burdenScore: calculateBurdenScore(visit.assessments),
			timelinePosition: getTimelinePosition(visit),
			studyDay: parseStudyDay(visit),
			stage: scheduleVisit?.stage || 'Unknown'
		};
	}).sort((a, b) => a.studyDay - b.studyDay);

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
	<div class="persona-grid-container">
		<!-- Timeline header at the top -->
		<TimelineHeader 
			visits={processedVisits}
			{timelineWidth}
			{hideHeader}
			{dynamicCellDimensions}
			leftPanelWidth={LEFT_PANEL_WIDTH}
		/>

		<!-- Main content area with sidebar and journey content -->
		<div class="main-content-area">
			<!-- Sidebar -->
			<PersonaSidebar
				{personas}
				{gridHeight}
				{containerHeight}
				{hideHeader}
				leftPanelWidth={LEFT_PANEL_WIDTH}
				on:personaClick={({ detail }) => handlePersonaClick(detail.persona, detail.event)}
			/>

			<!-- Journey content area -->
			<JourneyContentArea
				{personas}
				{processedVisits}
				{timelineWidth}
				{gridHeight}
				{gridPositions}
				{dynamicCellDimensions}
				{mounted}
			/>
		</div>
	</div>

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
{/if}

<style>
	/* === MAIN CONTAINER === */
	.persona-grid-container {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		border-radius: 8px;
		overflow: auto;
		background: #f9fafb;
		min-height: 75vh;
	}

	/* === MAIN CONTENT AREA === */
	.main-content-area {
		position: relative;
		display: flex;
		flex-direction: row;
		width: 100%;
		height: calc(100% - var(--header-height, 120px));
		overflow: auto;
	}

	/* === RESPONSIVE DESIGN === */
	@media (max-width: 768px) {
		.main-content-area {
			flex-direction: column;
		}
	}

	@media (max-width: 480px) {
		.unified-timeline-header-fixed {
			padding: 0 0.5rem;
			/* Adjust cell spacing for mobile */
			--cell-min-width: 50px;
			--cell-max-width: 100px;
		}
	}
</style> 
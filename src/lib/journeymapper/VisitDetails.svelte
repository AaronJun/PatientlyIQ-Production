<script lang="ts">
	import SentimentCircle from './SentimentCircle.svelte';
	import Accordion from './Accordion.svelte';
	import Drawer from './Drawer.svelte';
	import assessmentClassification from '../../data/journeymap/assessment_classification.json';
	import personaMotivatorsConcerns from '../../data/journeymap/persona_motivators_and_concerns.json';

	import { Person, Users } from 'phosphor-svelte';

	interface Visit {
		visit_number: number;
		name: string;
		study_day?: string;
		study_day_range?: string;
		study_week?: string;
		assessments: string[];
		travel_required?: boolean;
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
		study_day_range?: string;
		study_week?: string;
		patient_sentiment: SentimentData;
		caregiver_sentiment: SentimentData;
	}

	interface GroupedAssessment {
		name: string;
		category: 'Invasive' | 'Observational' | 'Patient-Reported' | 'Surgical';
		color: string;
	}

	export let visit: Visit | null = null;
	export let sentimentData: VisitSentiment | null = null;
	export let dropoutData: any = null;
	export let personaName: string = '';
	export let personaType: 'Patient' | 'Caregiver' = 'Patient';
	export let personaColor: string = '#059669';

	// Second drawer state for concern quotes
	let quotesDrawerOpen = false;
	let selectedConcernName = '';
	let selectedConcernQuotes: string[] = [];
	let selectedConcernPersonaType: 'Patient' | 'Caregiver' = 'Patient';

	// Create assessment classification lookup
	const assessmentClassificationMap = new Map<string, string>();
	assessmentClassification.forEach((item: any) => {
		assessmentClassificationMap.set(item.assessment, item.category);
	});

	$: selectedSentiment = sentimentData 
		? (personaType === 'Patient' ? sentimentData.patient_sentiment : sentimentData.caregiver_sentiment)
		: null;

	function formatStudyDay(visit: Visit): string {
		if (visit.study_day) return `Day ${visit.study_day}`;
		if (visit.study_day_range) return `Days ${visit.study_day_range}`;
		return 'Study day not specified';
	}

	function formatStudyWeek(visit: Visit): string {
		if (visit.study_week) return `Week ${visit.study_week}`;
		return '';
	}

	function getSentimentLabel(score: number): string {
		const labels = {
			1: 'Very Negative',
			2: 'Negative',
			3: 'Neutral', 
			4: 'Positive',
			5: 'Very Positive'
		};
		return labels[score as keyof typeof labels] || 'Unknown';
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

	// Get burden color based on score
	function getBurdenColor(score: number): string {
		if (score < 30) return '#22c55e'; // green
		if (score < 60) return '#f59e0b'; // amber
		return '#ef4444'; // red
	}

	// Get burden level text
	function getBurdenLevel(score: number): string {
		if (score <= 20) return 'Very Low';
		if (score <= 40) return 'Low';
		if (score <= 60) return 'Moderate';
		if (score <= 80) return 'High';
		return 'Very High';
	}

	// Get assessment category
	function getAssessmentCategory(assessment: string): 'Invasive' | 'Observational' | 'Patient-Reported' | 'Unknown' {
		return assessmentClassificationMap.get(assessment) as 'Invasive' | 'Observational' | 'Patient-Reported' || 'Unknown';
	}

	// Get category color
	function getCategoryColor(category: string): string {
		switch (category) {
			case 'Invasive':
				return '#ef4444'; // red
			case 'Observational':
				return '#3b82f6'; // blue
			case 'Patient-Reported':
				return '#10b981'; // green
			default:
				return '#6b7280'; // gray
		}
	}

	// Get category background color (lighter version)
	function getCategoryBgColor(category: string): string {
		switch (category) {
			case 'Invasive':
				return '#fef2f2'; // light red
			case 'Observational':
				return '#eff6ff'; // light blue
			case 'Patient-Reported':
				return '#f0fdf4'; // light green
			default:
				return '#f9fafb'; // light gray
		}
	}

	// Group assessments by category
	function groupAssessmentsByCategory(assessments: string[]): Record<string, GroupedAssessment[]> {
		const grouped: Record<string, GroupedAssessment[]> = {
			'Invasive': [],
			'Observational': [],
			'Patient-Reported': [],
			'Unknown': []
		};

		assessments.forEach(assessment => {
			const category = getAssessmentCategory(assessment);
			grouped[category].push({
				name: assessment,
				category: category as 'Invasive' | 'Observational' | 'Patient-Reported',
				color: getCategoryColor(category)
			});
		});

		// Remove empty categories
		Object.keys(grouped).forEach(key => {
			if (grouped[key].length === 0) {
				delete grouped[key];
			}
		});

		return grouped;
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

	// Get dropout likelihood for current visit
	function getDropoutLikelihood(visit: Visit): number {
		if (!dropoutData || !visit) return 0;
		
		const visitKey = `Visit ${visit.visit_number}`;
		const dropoutRisk = dropoutData.dropout_risk_by_visit?.[visitKey];
		
		return dropoutRisk ? dropoutRisk.likelihood : 0;
	}

	// Get primary dropout drivers for current visit
	function getDropoutDrivers(visit: Visit): string[] {
		if (!dropoutData || !visit) return [];
		
		const visitKey = `Visit ${visit.visit_number}`;
		const dropoutRisk = dropoutData.dropout_risk_by_visit?.[visitKey];
		
		return dropoutRisk ? dropoutRisk.primary_drivers : [];
	}

	// Get dropout risk level text
	function getDropoutRiskLevel(likelihood: number): string {
		if (likelihood <= 0.2) return 'Low';
		if (likelihood <= 0.4) return 'Medium';
		return 'High';
	}

	// Get dropout risk color
	function getDropoutRiskColor(likelihood: number): string {
		if (likelihood <= 0.2) return '#22c55e'; // green
		if (likelihood <= 0.4) return '#f59e0b'; // amber
		return '#ef4444'; // red
	}

	// Get burden score for a specific driver
	function getDriverBurdenScore(driver: string): number {
		if (!dropoutData) return 0;
		return dropoutData.burden_scores?.[driver] || 0;
	}

	// Get burden score for a specific metric
	function getBurdenMetricScore(metric: string): number {
		if (!dropoutData) return 0;
		return dropoutData.burden_scores?.[metric] || 0;
	}

	// Convert burden score (1-10) to sentiment-like score (1-5) for display consistency
	function convertBurdenToSentiment(burdenScore: number): number {
		// Map 1-10 scale to 1-5 scale
		return Math.max(1, Math.min(5, Math.round(burdenScore / 2)));
	}

	// Get burden metric color (inverted from sentiment - higher burden = more red)
	function getBurdenMetricColor(score: number): string {
		if (score <= 2) return '#22c55e'; // green (very low burden)
		if (score <= 4) return '#84cc16'; // light green (low burden)
		if (score <= 6) return '#f59e0b'; // amber (medium burden)
		if (score <= 8) return '#f97316'; // orange (high burden)
		return '#ef4444'; // red (very high burden)
	}

	// Get burden level label based on score (1-10 scale)
	function getBurdenLabel(score: number): string {
		if (score <= 2) return 'Very Low';
		if (score <= 4) return 'Low';
		if (score <= 6) return 'Moderate';
		if (score <= 8) return 'High';
		return 'Very High';
	}

	// Calculate burden score for current visit
	$: burdenScore = visit ? calculateBurdenScore(visit.assessments) : 0;
	$: groupedAssessments = visit ? groupAssessmentsByCategory(visit.assessments) : {};

	// Calculate dropout analysis for current visit
	$: dropoutLikelihood = visit ? getDropoutLikelihood(visit) : 0;
	$: dropoutDrivers = visit ? getDropoutDrivers(visit) : [];
	$: dropoutRiskLevel = getDropoutRiskLevel(dropoutLikelihood);
	$: dropoutRiskColor = getDropoutRiskColor(dropoutLikelihood);

	// Prepare accordion data
	$: accordionItems = Object.entries(groupedAssessments).map(([category, assessments]) => ({
		id: category.toLowerCase().replace(/\s+/g, '-'),
		title: category,
		content: assessments,
		color: getCategoryColor(category),
		backgroundColor: getCategoryBgColor(category),
		count: assessments.length
	}));

	// Handle concern/motivator click to open quotes drawer
	function handleItemClick(itemName: string, personaType: 'Patient' | 'Caregiver', itemType: 'motivator' | 'concern'): void {
		selectedConcernName = itemName;
		selectedConcernPersonaType = personaType;
		
		if (itemType === 'motivator') {
			selectedConcernQuotes = (personaMotivatorsConcerns[personaType].motivators as any)[itemName] || [];
		} else {
			selectedConcernQuotes = (personaMotivatorsConcerns[personaType].concerns as any)[itemName] || [];
		}
		
		quotesDrawerOpen = true;
	}

	// Close quotes drawer
	function closeQuotesDrawer(): void {
		quotesDrawerOpen = false;
		selectedConcernName = '';
		selectedConcernQuotes = [];
	}

	// Debug logging
	$: {
		if (visit) {
			console.log('Visit assessments:', visit.assessments);
			console.log('Assessment classification map:', assessmentClassificationMap);
			
			// Test category detection
			visit.assessments.forEach(assessment => {
				const category = getAssessmentCategory(assessment);
				console.log(`Assessment: "${assessment}" -> Category: "${category}"`);
			});
			
			console.log('Grouped assessments:', groupedAssessments);
			console.log('Accordion items:', accordionItems);
		}
	}
</script>

{#if visit}
	<div class="visit-details">
		<!-- Visit Header -->
		<div class="visit-header">
			<div class="visit-number" style="background-color: {personaColor}20; color: {personaColor};">
				Visit {visit.visit_number}
			</div>
			<h3 class="visit-name">{visit.name}</h3>
			<div class="visit-timing">
				<span class="study-day">{formatStudyDay(visit)}</span>
				{#if formatStudyWeek(visit)}
					<span class="study-week">• {formatStudyWeek(visit)}</span>
				{/if}
			</div>
		</div>

		<!-- Visit Overview Stats -->
		<div class="visit-stats">
			<div class="visit-info-item">
				<span class="info-label">Overall Burden</span>
				<span class="info-value" style="background-color: {getBurdenColor(burdenScore)}; color: white; padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 0.25rem;">
					{getBurdenLevel(burdenScore)}
				</span>
			</div>
			<div class="visit-info-item">
				<span class="info-label">Dropout Likelihood</span>
				<span class="info-value" style="background-color: {getDropoutRiskColor(dropoutLikelihood)}; color: white; padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 0.25rem;">
					{getDropoutRiskLevel(dropoutLikelihood)}
				</span>
			</div>
		</div>


		<!-- Sentiment Data -->
		{#if selectedSentiment && personaName}
			<div class="sentiment-section">
				
				<h5 class="subsection-title">Participant Burden</h5>
				<!-- Additional Burden Metrics -->
				{#if dropoutData}
					{@const procedureDiscomfort = getBurdenMetricScore('Procedure Discomfort')}
					{@const emotionalBurden = getBurdenMetricScore('Emotional Burden')}
					{@const logisticalChallenges = getBurdenMetricScore('Logistical Challenges')}
					{@const financialChallenges = getBurdenMetricScore('Financial Challenges')}
					{@const disruptionsToDailyLife = getBurdenMetricScore('Disruptions to Daily Life')}
					{@const informationOverload = getBurdenMetricScore('Information Overload')}

						<div class="burden-metrics-grid">
							
							<div class="burden-metric">
								<span class="metric-label">Procedure Discomfort:</span>
								<div class="metric-value burden">
									<div class="burden-category-indicator" style="background-color: {getBurdenMetricColor(procedureDiscomfort)};">
										{getBurdenLabel(procedureDiscomfort)}
									</div>
								</div>
							</div>
							
							<div class="burden-metric">
								<span class="metric-label">Emotional Burden:</span>
								<div class="metric-value burden">
									<div class="burden-category-indicator" style="background-color: {getBurdenMetricColor(emotionalBurden)};">
										{getBurdenLabel(emotionalBurden)}
									</div>
								</div>
							</div>
							
							<div class="burden-metric">
								<span class="metric-label">Logistical Challenges:</span>
								<div class="metric-value burden">
									<div class="burden-category-indicator" style="background-color: {getBurdenMetricColor(logisticalChallenges)};">
										{getBurdenLabel(logisticalChallenges)}
									</div>
								</div>
							</div>
							
							<div class="burden-metric">
								<span class="metric-label">Financial Challenges:</span>
								<div class="metric-value burden">
									<div class="burden-category-indicator" style="background-color: {getBurdenMetricColor(financialChallenges)};">
										{getBurdenLabel(financialChallenges)}
									</div>
								</div>
							</div>
							
							<div class="burden-metric">
								<span class="metric-label">Disruptions to Daily Life:</span>
								<div class="metric-value burden">
									<div class="burden-category-indicator" style="background-color: {getBurdenMetricColor(disruptionsToDailyLife)};">
										{getBurdenLabel(disruptionsToDailyLife)}
									</div>
								</div>
							</div>
							
							<div class="burden-metric">
								<span class="metric-label">Information Overload:</span>
								<div class="metric-value burden">
									<div class="burden-category-indicator" style="background-color: {getBurdenMetricColor(informationOverload)};">
										{getBurdenLabel(informationOverload)}
									</div>
								</div>
							</div>
						</div>
				{/if}

				{#if selectedSentiment.reasoning}
					<div class="sentiment-reasoning">
						<h5 class="reasoning-title">Analysis:</h5>
						<p class="reasoning-text">{selectedSentiment.reasoning}</p>
					</div>
				{/if}
			</div>
		{/if}

		<!-- V1 Participant Motivators and Concerns -->
		{#if visit.visit_number === 1}
			<div class="v1-motivators-concerns-section">
				<h4 class="section-title">Motivators and Concerns</h4>
			
				<div class="persona-insights">
					<!-- Patient Insights -->
					<div class="persona-insight-card patient">
						<div class="persona-header">
							<Person size={24} />
							<h5 class="persona-title">Patient Perspective</h5>
						</div>
						
						<div class="motivators-section">
							<h6 class="subsection-header motivators">✨ Key Motivators</h6>
							<div class="clickable-items-list">
								{#each Object.keys(personaMotivatorsConcerns.Patient.motivators) as motivatorName}
									<button 
										class="item-button motivator patient"
										on:click={() => handleItemClick(motivatorName, 'Patient', 'motivator')}
									>
										<span class="item-name">{motivatorName}</span>
										<span class="item-count">({(personaMotivatorsConcerns.Patient.motivators as any)[motivatorName].length} quotes)</span>
									</button>
								{/each}
							</div>
						</div>

						<div class="concerns-section">
							<h6 class="subsection-header concerns">⚠️ Key Concerns</h6>
							<div class="clickable-items-list">
								{#each Object.keys(personaMotivatorsConcerns.Patient.concerns) as concernName}
									<button 
										class="item-button concern patient"
										on:click={() => handleItemClick(concernName, 'Patient', 'concern')}
									>
										<span class="item-name">{concernName}</span>
										<span class="item-count">({(personaMotivatorsConcerns.Patient.concerns as any)[concernName].length} quotes)</span>
									</button>
								{/each}
							</div>
						</div>
					</div>	

					<!-- Caregiver Insights -->
					<div class="persona-insight-card caregiver">
						<div class="persona-header">
							<Users size={24} />
							<h5 class="persona-title">Caregiver Perspective</h5>
						</div>
						
						<div class="motivators-section">
							<h6 class="subsection-header motivators">✨ Key Motivators</h6>
							<div class="clickable-items-list">
								{#each Object.keys(personaMotivatorsConcerns.Caregiver.motivators) as motivatorName}
									<button 
										class="item-button motivator caregiver"
										on:click={() => handleItemClick(motivatorName, 'Caregiver', 'motivator')}
									>
										<span class="item-name">{motivatorName}</span>
										<span class="item-count">({(personaMotivatorsConcerns.Caregiver.motivators as any)[motivatorName].length} quotes)</span>
									</button>
								{/each}
							</div>
						</div>

						<div class="concerns-section">
							<h6 class="subsection-header concerns">⚠️ Key Concerns</h6>
							<div class="clickable-items-list">
								{#each Object.keys(personaMotivatorsConcerns.Caregiver.concerns) as concernName}
									<button 
										class="item-button concern caregiver"
										on:click={() => handleItemClick(concernName, 'Caregiver', 'concern')}
									>
										<span class="item-name">{concernName}</span>
										<span class="item-count">({(personaMotivatorsConcerns.Caregiver.concerns as any)[concernName].length} quotes)</span>
									</button>
								{/each}
							</div>
						</div>
					</div>

					<!-- Clickable Items Section -->
					<div class="concerns-quick-access">
						<h4 class="section-title">Explore Motivators & Concerns</h4>
						<p class="section-description">Click on any motivator or concern to see related participant quotes</p>
						
						<div class="concerns-grid">
							<!-- Patient Items -->
							<div class="concern-category-section">
								<h5 class="concern-category-title patient">👤 Patient</h5>
								
								<!-- Patient Motivators -->
								<div class="item-subsection">
									<h6 class="item-subsection-title motivators">✨ Motivators</h6>
									<div class="concern-buttons">
										{#each Object.keys(personaMotivatorsConcerns.Patient.motivators) as motivatorName}
											<button 
												class="concern-button patient motivator"
												on:click={() => handleItemClick(motivatorName, 'Patient', 'motivator')}
											>
												<span class="concern-name">{motivatorName}</span>
												<span class="concern-count">({(personaMotivatorsConcerns.Patient.motivators as any)[motivatorName].length} quotes)</span>
											</button>
										{/each}
									</div>
								</div>

								<!-- Patient Concerns -->
								<div class="item-subsection">
									<h6 class="item-subsection-title concerns">⚠️ Concerns</h6>
									<div class="concern-buttons">
										{#each Object.keys(personaMotivatorsConcerns.Patient.concerns) as concernName}
											<button 
												class="concern-button patient concern"
												on:click={() => handleItemClick(concernName, 'Patient', 'concern')}
											>
												<span class="concern-name">{concernName}</span>
												<span class="concern-count">({(personaMotivatorsConcerns.Patient.concerns as any)[concernName].length} quotes)</span>
											</button>
										{/each}
									</div>
								</div>
							</div>

							<!-- Caregiver Items -->
							<div class="concern-category-section">
								<h5 class="concern-category-title caregiver">👥 Caregiver</h5>
								
								<!-- Caregiver Motivators -->
								<div class="item-subsection">
									<h6 class="item-subsection-title motivators">✨ Motivators</h6>
									<div class="concern-buttons">
										{#each Object.keys(personaMotivatorsConcerns.Caregiver.motivators) as motivatorName}
											<button 
												class="concern-button caregiver motivator"
												on:click={() => handleItemClick(motivatorName, 'Caregiver', 'motivator')}
											>
												<span class="concern-name">{motivatorName}</span>
												<span class="concern-count">({(personaMotivatorsConcerns.Caregiver.motivators as any)[motivatorName].length} quotes)</span>
											</button>
										{/each}
									</div>
								</div>

								<!-- Caregiver Concerns -->
								<div class="item-subsection">
									<h6 class="item-subsection-title concerns">⚠️ Concerns</h6>
									<div class="concern-buttons">
										{#each Object.keys(personaMotivatorsConcerns.Caregiver.concerns) as concernName}
											<button 
												class="concern-button caregiver concern"
												on:click={() => handleItemClick(concernName, 'Caregiver', 'concern')}
											>
												<span class="concern-name">{concernName}</span>
												<span class="concern-count">({(personaMotivatorsConcerns.Caregiver.concerns as any)[concernName].length} quotes)</span>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Dropout Risk Analysis -->
		{#if dropoutData && dropoutLikelihood > 0}
			<div class="dropout-section">
				<h4 class="section-title">Dropout Risk Analysis</h4>
				
				<div class="dropout-overview">
						<div class="risk-text">
							<div class="risk-level" style="color: {dropoutRiskColor};">
								{dropoutRiskLevel} Risk
							</div>
					</div>
				</div>

				{#if dropoutDrivers.length > 0}
					<div class="dropout-drivers">
						<h5 class="drivers-title">Primary Dropout Drivers</h5>
						<div class="drivers-grid">
							{#each dropoutDrivers as driver}
								{@const driverScore = getDriverBurdenScore(driver)}
								<div class="driver-item">
									<div class="driver-content">
										<span class="driver-name">{driver}</span>
										
									</div>
									<div class="driver-impact">
										{#if driverScore >= 8}
											<span class="impact-high">High Impact</span>
										{:else if driverScore >= 6}
											<span class="impact-medium">Medium Impact</span>
										{:else if driverScore > 0}
											<span class="impact-low">Low Impact</span>
										{:else}
											<span class="impact-unknown">Impact Unknown</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<div class="dropout-insights">
					<h5 class="insights-title">Risk Mitigation Insights</h5>
					<div class="insights-content">
						{#if dropoutRiskLevel === 'High'}
							<p class="insight-text high-risk">
								⚠️ <strong>High dropout risk detected.</strong> Consider implementing targeted interventions 
								to address the primary drivers identified above. Additional support may be needed for this visit.
							</p>
						{:else if dropoutRiskLevel === 'Medium'}
							<p class="insight-text medium-risk">
								⚡ <strong>Moderate dropout risk.</strong> Monitor the primary drivers and consider 
								proactive measures to reduce burden and improve participant experience.
							</p>
						{:else}
							<p class="insight-text low-risk">
								✅ <strong>Low dropout risk.</strong> Current visit design appears well-tolerated 
								by this persona type. Continue monitoring for any emerging concerns.
							</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="no-visit">
		<p>No visit selected</p>
	</div>
{/if}

<!-- Second Drawer for Item Quotes -->
<Drawer 
	bind:isOpen={quotesDrawerOpen}
	title="{selectedConcernPersonaType} Quotes: {selectedConcernName}"
	width="540px"
	on:close={closeQuotesDrawer}
>
	<div class="quotes-drawer-content">
		<div class="quotes-header">
			<h4 class="quotes-title">Participant Quotes</h4>
					<p class="quotes-description">
			Real feedback from {selectedConcernPersonaType.toLowerCase()}s about "{selectedConcernName}"
		</p>
		</div>
		
		<div class="quotes-list">
			{#each selectedConcernQuotes as quote, index}
				<div class="quote-item" class:patient={selectedConcernPersonaType === 'Patient'} class:caregiver={selectedConcernPersonaType === 'Caregiver'}>
					<div class="quote-indicator">
						<span class="quote-number">{index + 1}</span>
					</div>
					<div class="quote-content">
						<p class="quote-text">"{quote}"</p>
						<span class="quote-attribution">— {selectedConcernPersonaType}</span>
					</div>
				</div>
			{/each}
		</div>

		{#if selectedConcernQuotes.length === 0}
			<div class="no-quotes">
				<p>No quotes available for this concern.</p>
			</div>
		{/if}
	</div>
</Drawer>

<style>
	.visit-details {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.visit-header {
		text-align: center;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.visit-number {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.visit-name {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem 0;
	}

	.visit-timing {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.study-day {
		font-weight: 500;
	}

	.study-week {
		font-weight: 400;
	}

	.visit-stats {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.visit-info-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #f9fafb;
	}

	.info-label {
		font-weight: 500;
		color: #374151;
	}

	.info-value {
		font-weight: 600;
	}

	.travel-required {
		color: #dc2626;
	}

	.no-travel {
		color: #059669;
	}

	.visit-indicators {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.indicator-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.indicator-item.travel {
		background: #fef3c7;
		color: #d97706;
	}

	.indicator-item.invasive {
		background: #fef2f2;
		color: #dc2626;
	}

	.indicator-item.surgical {
		background: #f3f4f6;
		color: #374151;
	}

	.assessments-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}

	.assessments-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.category-legend {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: #6b7280;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
	}

	.assessments-grid {
		display: grid;
		gap: 0.5rem;
	}

	.assessment-item {
		padding: 0.5rem 0.75rem;
		background: #f3f4f6;
		font-size: 0.875rem;
		color: #374151;
		border-left: 3px solid #d1d5db;
	}

	.sentiment-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
	}

	.sentiment-overview {
		display: flex;
		justify-content: center;
	}

	.sentiment-score-display {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		position: relative;
	}

	.sentiment-score-text {
		display: flex;
		flex-direction: column;
	}

	.score-number {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
	}

	.score-label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.sentiment-breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.sentiment-metric {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: white;
	}

	.metric-label {
		font-size: 0.875rem;
		color: #374151;
		font-weight: 500;
	}

	.metric-value {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		font-size: 0.875rem;
		font-weight: 600;
		color: #111827;
	}

	.sentiment-reasoning {
		margin-top: 0.5rem;
	}

	.reasoning-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.5rem 0;
	}

	.reasoning-text {
		font-size: 0.875rem;
		line-height: 1.5;
		color: #4b5563;
		margin: 0;
	}

	/* === DROPOUT ANALYSIS SECTION === */
	.dropout-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: #fef7f7;
		border: 1px solid #fecaca;
	}


	.dropout-risk-display {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.risk-indicator {
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.risk-percentage {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.risk-text {
		display: flex;
		flex-direction: column;
	}

	.risk-level {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.risk-description {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.dropout-drivers {
		margin-top: 1rem;
	}

	.drivers-title, .insights-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.75rem 0;
	}

	.drivers-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.driver-item {
		background: white;
		border: 1px solid #e5e7eb;
		padding: 0.75rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.driver-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.driver-name {
		font-size: 0.875rem;
		color: #374151;
		font-weight: 500;
	}

	.driver-score {
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
		min-width: 24px;
		text-align: center;
	}

	.driver-impact {
		font-size: 0.75rem;
		font-weight: 500;
	}

	.impact-high {
		color: #dc2626;
		background: #fef2f2;
		padding: 0.25rem 0.5rem;
	}

	.impact-medium {
		color: #d97706;
		background: #fef3c7;
		padding: 0.25rem 0.5rem;
	}

	.impact-low {
		color: #059669;
		background: #f0fdf4;
		padding: 0.25rem 0.5rem;
	}

	.impact-unknown {
		color: #6b7280;
		background: #f9fafb;
		padding: 0.25rem 0.5rem;
	}

	.dropout-insights {
		margin-top: 1rem;
		padding: 1rem;
		background: white;
		border: 1px solid #e5e7eb;
	}

	.insights-content {
		margin: 0;
	}

	.insight-text {
		margin: 0;
		font-size: 0.875rem;
		line-height: 1.5;
		padding: 0.75rem;
	}

	.insight-text.high-risk {
		background: #fef2f2;
		color: #7f1d1d;
		border-left: 4px solid #dc2626;
	}

	.insight-text.medium-risk {
		background: #fef3c7;
		color: #92400e;
		border-left: 4px solid #d97706;
	}

	.insight-text.low-risk {
		background: #f0fdf4;
		color: #14532d;
		border-left: 4px solid #059669;
	}

	.no-visit {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		color: #6b7280;
		font-style: italic;
	}

	/* === BURDEN METRICS SECTION === */
	.burden-metrics-section {
		margin-top: 1rem;
		padding: 1rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
	}

	.subsection-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 1rem 0;
	}

	.burden-metrics-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.burden-metric {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.75rem;
		background: white;
		border: 1px solid #e5e7eb;
	}

	.metric-value.burden {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.burden-indicator {
		width: 32px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.75rem;
	font-weight: 600;	
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.burden-category-indicator {
		padding: 0.25rem 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		white-space: nowrap;
		min-width: fit-content;
	}

	.burden-scale {
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: 500;
	}

	.burden-score {
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: 500;
		margin-left: 0.5rem;
	}

	/* Responsive grid for smaller screens */
	@media (max-width: 640px) {
		.burden-metrics-grid {
			grid-template-columns: 1fr;
		}
	}

	/* === V1 MOTIVATORS AND CONCERNS SECTION === */

	.section-description {
		font-size: 0.875rem;
		color: #64748b;
		margin-bottom: 1.5rem;
		text-align: center;
		font-style: italic;
	}


	.persona-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #f1f5f9;
	}

	.persona-icon {
		font-size: 1.5rem;
		width: 2.5rem;
		height: 2.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8fafc;
		border: 2px solid #e2e8f0;
	}

	.persona-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.motivators-section,
	.concerns-section {
		margin-bottom: 1.25rem;
	}

	.motivators-section:last-child,
	.concerns-section:last-child {
		margin-bottom: 0;
	}

	.subsection-header {
		font-size: 0.95rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.subsection-header.motivators {
		color: #059669;
	}

	.subsection-header.concerns {
		color: #dc2626;
	}

	.insights-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.insight-item {
		padding: 0.75rem;
		border-left: 3px solid;
		font-size: 0.875rem;
		line-height: 1.4;
		transition: all 0.2s ease;
	}

	.insight-item:hover {
		transform: translateX(2px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.insight-item.motivator {
		background: #f0fdf4;
		border-left-color: #059669;
		color: #14532d;
	}

	.insight-item.concern {
		background: #fef2f2;
		border-left-color: #dc2626;
		color: #7f1d1d;
	}

	.insight-text {
		font-style: italic;
		font-weight: 500;
	}

	/* Responsive design for smaller screens */
	@media (max-width: 768px) {
		.persona-insights {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		
		.v1-motivators-concerns-section {
			padding: 1rem;
		}
		
		.persona-insight-card {
			padding: 1rem;
		}
	}

	/* === CLICKABLE CONCERNS SECTION === */
	.concerns-quick-access {
		margin-top: 2rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #fef7f0 0%, #fef3c7 100%);
		border: 2px solid #f59e0b;
		box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.1);
	}
	
	.concerns-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.concern-category-section {
		background: white;
		padding: 1.25rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid #e5e7eb;
	}

	.concern-category-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 1rem 0;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid #f1f5f9;
	}

	.concern-category-title.patient {
		color: #3b82f6;
	}

	.concern-category-title.caregiver {
		color: #8b5cf6;
	}

	.concern-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.concern-button {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		padding: 1rem;
		border: 2px solid transparent;
		background: #f8fafc;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		width: 100%;
	}

	.concern-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.concern-button.patient {
		border-left: 4px solid #3b82f6;
	}

	.concern-button.patient:hover {
		background: #eff6ff;
		border-color: #3b82f6;
	}

	.concern-button.caregiver {
		border-left: 4px solid #8b5cf6;
	}

	.concern-button.caregiver:hover {
		background: #f5f3ff;
		border-color: #8b5cf6;
	}

	.concern-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: #1e293b;
		line-height: 1.3;
	}

	.concern-count {
		font-size: 0.8rem;
		color: #64748b;
		font-weight: 500;
		font-style: italic;
	}

	/* === QUOTES DRAWER === */
	.quotes-drawer-content {
		padding: 0;
	}

	.quotes-header {
		padding: 1.5rem 1.5rem 1rem 1.5rem;
		border-bottom: 2px solid #f1f5f9;
		margin-bottom: 1rem;
	}

	.quotes-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}

	.quotes-description {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0;
		font-style: italic;
	}

	.quotes-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0 1.5rem 1.5rem 1.5rem;
	}

	.quote-item {
		display: flex;
		gap: 1rem;
		padding: 1.25rem;
		border-left: 4px solid;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease;
	}

	.quote-item:hover {
		transform: translateX(4px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.quote-item.patient {
		border-left-color: #3b82f6;
		background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
	}

	.quote-item.caregiver {
		border-left-color: #8b5cf6;
		background: linear-gradient(135deg, #f5f3ff 0%, #f8fafc 100%);
	}

	.quote-indicator {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		background: #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.8rem;
		color: #475569;
	}

	.quote-item.patient .quote-indicator {
		background: #3b82f6;
		color: white;
	}

	.quote-item.caregiver .quote-indicator {
		background: #8b5cf6;
		color: white;
	}

	.quote-content {
		flex: 1;
	}

	.quote-text {
		font-size: 0.95rem;
		line-height: 1.6;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
		font-style: italic;
		font-weight: 500;
	}

	.quote-attribution {
		font-size: 0.8rem;
		color: #64748b;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.no-quotes {
		text-align: center;
		padding: 2rem;
		color: #6b7280;
		font-style: italic;
	}

	/* Responsive design for concerns section */
	@media (max-width: 768px) {
		.concerns-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		
		.concerns-quick-access {
			padding: 1rem;
		}
		
		.concern-category-section {
			padding: 1rem;
		}
		
		.concern-button {
			padding: 0.75rem;
		}
		
		.quotes-list {
			padding: 0 1rem 1rem 1rem;
		}
		
		.quote-item {
			padding: 1rem;
		}
	}

	/* === CLICKABLE ITEMS IN MAIN PERSONA CARDS === */
	.clickable-items-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.item-button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border: 2px solid transparent;
		background: #f8fafc;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		width: 100%;
		font-size: 0.875rem;
	}

	.item-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.item-button.motivator.patient {
		border-left: 3px solid #059669;
		background: #f0fdf4;
	}

	.item-button.motivator.patient:hover {
		background: #dcfce7;
		border-color: #059669;
	}

	.item-button.motivator.caregiver {
		border-left: 3px solid #059669;
		background: #f0fdf4;
	}

	.item-button.motivator.caregiver:hover {
		background: #dcfce7;
		border-color: #059669;
	}

	.item-button.concern.patient {
		border-left: 3px solid #dc2626;
		background: #fef2f2;
	}

	.item-button.concern.patient:hover {
		background: #fee2e2;
		border-color: #dc2626;
	}

	.item-button.concern.caregiver {
		border-left: 3px solid #dc2626;
		background: #fef2f2;
	}

	.item-button.concern.caregiver:hover {
		background: #fee2e2;
		border-color: #dc2626;
	}

	.item-name {
		font-weight: 600;
		color: #1e293b;
		line-height: 1.3;
	}

	.item-count {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 500;
		font-style: italic;
	}

	/* === EXPLORE SECTION SUBSECTIONS === */
	.item-subsection {
		margin-bottom: 1rem;
	}

	.item-subsection:last-child {
		margin-bottom: 0;
	}

	.item-subsection-title {
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #f1f5f9;
	}

	.item-subsection-title.motivators {
		color: #059669;
	}

	.item-subsection-title.concerns {
		color: #dc2626;
	}

	/* === ENHANCED CONCERN BUTTON STYLES === */
	.concern-button.motivator.patient {
		background: #f0fdf4;
		border-left: 4px solid #059669;
	}

	.concern-button.motivator.patient:hover {
		background: #dcfce7;
		border-color: #059669;
	}

	.concern-button.motivator.caregiver {
		background: #f0fdf4;
		border-left: 4px solid #059669;
	}

	.concern-button.motivator.caregiver:hover {
		background: #dcfce7;
		border-color: #059669;
	}

	.concern-button.concern.patient {
		background: #fef2f2;
		border-left: 4px solid #dc2626;
	}

	.concern-button.concern.patient:hover {
		background: #fee2e2;
		border-color: #dc2626;
	}

	.concern-button.concern.caregiver {
		background: #fef2f2;
		border-left: 4px solid #dc2626;
	}

	.concern-button.concern.caregiver:hover {
		background: #fee2e2;
		border-color: #dc2626;
	}

	/* Responsive design for new structure */
	@media (max-width: 768px) {
		.item-button {
			padding: 0.5rem;
			font-size: 0.8rem;
		}
		
		.item-name {
			font-size: 0.85rem;
		}
		
		.item-count {
			font-size: 0.7rem;
		}
	}
</style> 
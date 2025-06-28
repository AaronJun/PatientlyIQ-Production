<script lang="ts">
	import JourneyContainer from '$lib/journeymapper/JourneyContainer.svelte';
	import StudyMetadataDrawer from '$lib/components/StudyMetadataDrawer.svelte';
	import VisitSquares from '$lib/journeymapper/VisitSquares.svelte';
	import AssessmentBurdenHeatmap from '$lib/components/AssessmentBurdenHeatmap.svelte';
	import SentimentNetworkGraph from '$lib/components/SentimentNetworkGraph.svelte';
	import * as Tabs from "$lib/ui/tabs";
	import { Calendar, Document, IdManagement } from 'carbon-icons-svelte';
	
	import visitScheduleData from '../../data/journeymap/patient_burden_mapper_visit_schedule.json';
	import studyMetadata from '../../data/journeymap/study_metadata_xackt.json';

	
	let isDrawerOpen = false;
	const timelineWidth = 1000;

	function handleDrawerToggle(event: CustomEvent) {
		isDrawerOpen = event.detail.isOpen;
	}

	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	// Calculate visit statistics
	$: totalVisits = visitScheduleData.visits.length;
	$: travelVisits = visitScheduleData.visits.filter(visit => visit.travel_required).length;
	$: invasiveVisits = visitScheduleData.visits.filter(visit => 
		visit.assessments.some(assessment => 
			assessment.includes('Blood') || 
			assessment.includes('Laboratory') || 
			assessment.includes('ECG') ||
			assessment.includes('Pregnancy Test')
		)
	).length;
	$: surgicalVisits = visitScheduleData.visits.filter(visit => 
		visit.assessments.some(assessment => 
			assessment.toLowerCase().includes('surgical') || 
			assessment.toLowerCase().includes('biopsy') ||
			assessment.toLowerCase().includes('procedure')
		)
	).length;
	
	// Calculate overall burden score (based on total assessments and travel requirements)
	$: overallScore = Math.round(
		(visitScheduleData.visits.reduce((total, visit) => 
			total + visit.assessments.length + (visit.travel_required ? 5 : 0), 0
		) / visitScheduleData.visits.length)
	);
</script>

<main class="patient-burden-mapper min-h-screen">
	<header class="mapper-header">
		<h1 class="text-lg font-bold">Patiently | Study Participant Journey Mapper</h1>
		<div class="flex flex-col justify-evenly w-full">
		<div class="study-overview">
			<div class="study-info">
				<div class="info-item">
					<span class="info-label">Study
					<span class="info-value">{studyMetadata.study_name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Phase
					<span class="info-value">{studyMetadata.phase}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Overall Score
					<span class="info-value">{overallScore}</span>
				</div>
				<button class="more-info-btn" on:click={toggleDrawer} aria-label="View study details">
					i
				</button>
			</div>
		</div>
			
			<div class="visit-statistics bg-slate-100 py-2 px-4 align-middle  rounded-lg flex flex-row justify-between">
				<VisitSquares 
					label="Total Visits" 
					count={totalVisits} 
					color="#1f2937" 
					size="20px"
				/>
				<VisitSquares 
					label="Travel Required" 
					count={travelVisits} 
					color="#dc2626" 
					size="18px"
				/>
				<VisitSquares 
					label="Invasive Procedures" 
					count={invasiveVisits} 
					color="#ea580c" 
					size="18px"
				/>
				<VisitSquares 
					label="Surgical Procedures" 
					count={surgicalVisits} 
					color="#7c2d12" 
					size="18px"
				/>
			</div>
		</div>
	</header>

	<!-- Tab Implementation -->
	<div class="tabs-container">
		<Tabs.Root value="schedule" class="w-full">
			<Tabs.List class="tabs-list">
				<Tabs.Trigger value="schedule" class="tab-trigger">
					<Calendar size={20} class="mr-2" />
					Schedule
				</Tabs.Trigger>
				<Tabs.Trigger value="assessments" class="tab-trigger">
					<Document size={20} class="mr-2" />
					Assessments
				</Tabs.Trigger>
				<Tabs.Trigger value="cards" class="tab-trigger">
					<IdManagement size={20} class="mr-2" />
					Patient Cards
				</Tabs.Trigger>
			</Tabs.List>
			
			<Tabs.Content value="schedule" class="tab-content">
				<div class="content-wrapper">
					<JourneyContainer visits={visitScheduleData.visits} {timelineWidth} />
				</div>
			</Tabs.Content>
			
			<Tabs.Content value="assessments" class="tab-content">
				<div class="content-wrapper">
					<div class="assessments-header">
						<h2 class="section-title">Assessment Burden Analysis</h2>
						<p class="section-description">
							This analysis shows the relative burden of different assessments across various participant personas, 
							helping to identify which procedures may be most challenging for different types of study participants.
						</p>
					</div>
					<div class="assessment-content">
						<!-- Assessment Burden Heatmap -->
						<div class="assessment-section">
							<AssessmentBurdenHeatmap 
								showBurdenScores={false}
								maxSquares={10}
								squareSize="12px"
							/>
						</div>
						
						<!-- Sentiment Network Graph -->
						<div class="assessment-section">
							<h3 class="section-subtitle">Sentiment Analysis Network</h3>
							<p class="section-description">
								Explore how participants feel about different assessments. 
								Hover or click on assessment names to see related sentiment terms.
							</p>
							<SentimentNetworkGraph 
								width={800}
								height={800}
							/>
						</div>
					</div>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</main>

<StudyMetadataDrawer 
	bind:isOpen={isDrawerOpen}
	studyData={studyMetadata}
	on:toggle={handleDrawerToggle}
/>

<style>
	.patient-burden-mapper {
		margin: 0 auto;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.mapper-header {
		text-align: left;
		margin-bottom: 2rem;
		width: 100%;
		height: 100%;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		align-items: flex-start;
	}

	.mapper-header h1 {     
        font-size: 1.25rem;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #6b7280;
		font-size: 1.1rem;
	}

	.study-overview {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		margin-top: 1rem;
		padding: 0.5rem;
		justify-content: space-evenly;
	}

	.study-info {
		display: flex;
		flex-direction: row;
        width: 100%;
		justify-content: space-evenly;
		gap: 1rem;
	}

	.info-item {
		display: flex;
        flex-direction: column;
		align-items: start;
        justify-content: space-around;
		gap: 0.5rem;
		min-width: 0;
	}

	.info-label {
		font-weight: 600;
		color: #374151;
		font-size: 0.8275rem;
		white-space: nowrap;
	}

	.info-value {
		color: #1f2937;
		font-weight: 800;
		font-size: 1.25rem;
	}

	.more-info-btn {
		display: flex;
		align-items: center;
		border: 1px solid #2563eb;
		color: #2563eb;
		width: 1.5rem;
		height: 1.5rem;
		justify-content: center;
		border-radius: 1000px;
		font-size: 0.625rem;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.more-info-btn:hover {
		background: #2563eb;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
		color: white;
	}

	.more-info-btn svg {
		flex-shrink: 0;
	}

	.visit-statistics {
		display: flex;
        flex-direction: row;
		flex-wrap: wrap;
		gap: 2.25rem;
	}

	.content-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
	}

	.assessments-header {
		padding: 2rem 2rem 1rem 2rem;
		border-bottom: 1px solid #e2e8f0;
		background: #fafbfc;
	}

	.section-title {
		margin: 0 0 0.75rem 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: #1e293b;
	}

	.section-description {
		margin: 0;
		color: #64748b;
		font-size: 0.95rem;
		line-height: 1.6;
	}

	.assessment-content {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		width: 100%;
		padding: 2rem;
	}

	.assessment-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.section-subtitle {
		margin: 0;
		color: #1f2937;
		font-size: 1.5rem;
		font-weight: 600;
		text-align: center;
	}

	@media (max-width: 768px) {
		.patient-burden-mapper {
			padding: 1rem;
		}

		.mapper-header h1 {
			font-size: .825rem;
		}

		.study-overview {
			display: flex;
            flex-direction: row;
		}

		.visit-statistics {
			gap: 0.75rem;
		}

		:global(.tab-trigger) {
			padding: 0.5rem 1rem;
			font-size: 0.875rem;
		}

		:global(.tab-trigger svg) {
			width: 16px;
			height: 16px;
		}

		.assessments-header {
			padding: 1.5rem 1.5rem 1rem 1.5rem;
		}

		.section-title {
			font-size: 1.25rem;
		}

		.section-description {
			font-size: 0.875rem;
		}

		.assessment-content {
			padding: 1rem;
			gap: 2rem;
		}

		.section-subtitle {
			font-size: 1.25rem;
		}
	}
</style>

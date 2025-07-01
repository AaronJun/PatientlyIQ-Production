<script lang="ts">
	// Component imports
	import JourneyContainer from '$lib/journeymapper/JourneyContainer.svelte';
	import StudyMetadataDrawer from '$lib/components/StudyMetadataDrawer.svelte';
	import FileUpload from '$lib/components/ui/file-upload/FileUpload.svelte';
	import AssessmentBurdenHeatmap from '$lib/components/AssessmentBurdenHeatmap.svelte';
	import SentimentNetworkGraph from '$lib/components/SentimentNetworkGraph.svelte';
	import JourneyAnalysisSummary from '$lib/journeymapper/JourneyAnalysisSummary.svelte';
	import * as Tabs from "$lib/ui/tabs";
	import DemoPDFUpload from "$lib/components/PDFUploadDemo.svelte";
	// Icon imports
	import { Calendar, ClipboardText, IdentificationCard, ChartLine, List, X, FolderOpen } from 'phosphor-svelte';
	
	// Load data from page load function
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	$: visitScheduleData = data.visitScheduleData;
	$: studyMetadata = data.studyMetadata;

	// State variables
	let isDrawerOpen = false;
	let isSidebarCollapsed = true;
	
	// Constants
	const timelineWidth = 1200;

	// Placeholder analyzed studies data
	let analyzedStudies = [
		{ name: 'GXF-203-E', indication: 'Amyotrophic Lateral Sclerosis', phase: 'Phase II', status: 'active' },
		{ name: 'BNX-451-A', indication: 'Major Depressive Disorder', phase: 'Phase III', status: 'completed' },
		{ name: 'PFZ-738-D', indication: 'Parkinson\'s Disease', phase: 'Phase III', status: 'active' }
	];

	// Function to add a new study to the analyzed studies list
	function addStudy(study: { name: string; indication: string; phase: string; status: string }) {
		// Check if study already exists to avoid duplicates
		const exists = analyzedStudies.find(s => s.name === study.name);
		if (!exists) {
			analyzedStudies = [...analyzedStudies, study];
		}
	}

	// Event handlers
	function handleDrawerToggle(event: CustomEvent) {
		isDrawerOpen = event.detail.isOpen;
	}

	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	function toggleSidebar() {
		isSidebarCollapsed = !isSidebarCollapsed;
	}

	// Reactive calculations for visit statistics
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
	
	// Calculate overall burden score based on total assessments and travel requirements
	$: overallScore = Math.round(
		(visitScheduleData.visits.reduce((total, visit) => 
			total + visit.assessments.length + (visit.travel_required ? 5 : 0), 0
		) / visitScheduleData.visits.length)
	);
</script>

<main class="patient-burden-mapper min-h-screen">
	<!-- Sidebar -->
	<aside class="sidebar {isSidebarCollapsed ? 'collapsed' : ''}">
		<div class="sidebar-header">
			<div class="sidebar-title">
				
				{#if !isSidebarCollapsed}
					<h1>Patiently | Journey Mapper</h1>
				{/if}
				<button class="sidebar-toggle" on:click={toggleSidebar} aria-label="Toggle sidebar">
					{#if isSidebarCollapsed}
						<List size={20} />
					{:else}
						<X size={20} />
					{/if}
				</button>
			</div>
		</div>

		{#if !isSidebarCollapsed}
			<div class="sidebar-content">
				<!-- File Upload Section -->
				<div class="sidebar-section">
					<DemoPDFUpload {addStudy} />
				</div>

				<!-- Analyzed Studies Section -->
				<div class="sidebar-section">
					<h3 class="sidebar-section-title">
						<FolderOpen size={12} class="inline mr-2" />
						Analyzed Studies
					</h3>
					<div class="studies-list">
						{#each analyzedStudies as study}
							<div class="study-item">
								<div class="study-name">{study.name}</div>
								<div class="study-details">
									<span class="study-indication">{study.indication}</span>
									<span class="study-phase">{study.phase}</span>
									<span class="study-status status-{study.status}">{study.status}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</aside>

	<!-- Main Content -->
	<div class="main-content">
		<!-- Study Header -->
		<header class="study-header">
			<div class="study-info-container">
				<div class="study-info">
					<div class="info-item">
						<span class="info-label">Study</span>
					<span class="info-value">{studyMetadata.study_name}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Indication</span>
						<span class="info-value">{studyMetadata.indication}</span>
						<span class="info-subvalue">{studyMetadata.indication_level_quotes} posts</span>
					</div>
					<div class="info-item">
						<span class="info-label">Therapeutic Area</span>
						<span class="info-value">{studyMetadata.therapeutic_area}</span>
						<span class="info-subvalue">{studyMetadata.therapeutic_area_quotes} posts</span>
					</div>
					<div class="info-item">
						<span class="info-label">Phase</span>
						<span class="info-value">{studyMetadata.phase}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Study length</span>
						<span class="info-value">{studyMetadata.total_visits} visits</span>
					</div>
					<button class="more-info-btn" on:click={toggleDrawer} aria-label="View study details">
						i
					</button>
				</div>
			</div>
			

		</header>

		<!-- Navigation Tabs -->
		<div class="tabs-container">
			<Tabs.Root value="summary" class="w-full">
				<Tabs.List class="tabs-list">
					<Tabs.Trigger value="summary" class="tab-trigger">
						<ChartLine size={18} class="mr-2" />
						Summary
					</Tabs.Trigger>
					<Tabs.Trigger value="schedule" class="tab-trigger">
						<Calendar size={18} class="mr-2" />
						Schedule
					</Tabs.Trigger>	
					<Tabs.Trigger value="assessments" class="tab-trigger">
						<ClipboardText size={18} class="mr-2" />
						Assessments
					</Tabs.Trigger>
					<Tabs.Trigger value="cards" class="tab-trigger">
						<IdentificationCard size={18} class="mr-2" />
						Patient Cards
					</Tabs.Trigger>
				</Tabs.List>
				
				<!-- Tab Content -->
				<Tabs.Content value="summary" class="tab-content">
					<JourneyAnalysisSummary 
						{totalVisits}
						{travelVisits}
						{invasiveVisits}
						{surgicalVisits}
					/>
				</Tabs.Content>

				<Tabs.Content value="schedule" class="tab-content">
					<div class="content-wrapper">
						<JourneyContainer visits={visitScheduleData.visits} {timelineWidth} />
					</div>
				</Tabs.Content>
				
				<Tabs.Content value="assessments" class="tab-content">
					<div class="content-wrapper">
						<div class="assessment-content">
							<div class="assessment-section">
								<AssessmentBurdenHeatmap 
									showBurdenScores={false}
									maxSquares={10}
									squareSize="12px"
								/>
							</div>
							
							<div class="assessment-section">
								<h3 class="section-subtitle">Sentiment Analysis Network</h3>
								<p class="section-description">
									Explore how participants feel about different assessments. 
									Hover or click on assessment names to see related sentiment terms.
								</p>
								<SentimentNetworkGraph 
									width={1200}
									height={1200}
								/>
							</div>
						</div>
					</div>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
</main>

<StudyMetadataDrawer 
	bind:isOpen={isDrawerOpen}
	studyData={studyMetadata}
	on:toggle={handleDrawerToggle}
/>

<style>
	/* ===== BASE STYLES ===== */
	.patient-burden-mapper {
		display: flex;
		min-height: 100vh;
		max-width: 100%;
		overflow-x: auto;
		margin: 0 auto;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	/* ===== SIDEBAR STYLES ===== */
	.sidebar {
		position: fixed;
		left: 0;
		top: 0;
		height: 100vh;
		background-color: #ffffff;
		border-right: 1px solid #d1d5db;
		color: white;
		display: flex;
		flex-direction: column;
		z-index: 1000;
		transition: width 0.3s ease;
		overflow: hidden;
	}

	.sidebar.collapsed {
		width: 60px;
	}

	.sidebar-header {
		padding: 1rem;
		border-bottom: 1px solid #374151;
		background-color: #ffffff;
	}

	.sidebar-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sidebar-title h1 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: #161616;
		white-space: nowrap;
	}

	.sidebar-toggle {
		background: none;
		border: none;
		color: #161616;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		background-color: #e2e2e2;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s ease;
	}

	.sidebar-toggle:hover {
		background-color: #374151;
	}

	.sidebar-content {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
	}

	.sidebar-section {
		margin-bottom: 2rem;
	}

	.sidebar-section-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #161616;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
	}

	.studies-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.study-item {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0 0 1.25rem 0;
		transition: background-color 0.2s ease;
	}

	.study-item:hover {
		border-bottom: 1px solid #001f60;
	}

	.study-name {
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
		color: #001f60;
	}

	.study-details {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.study-indication,
	.study-phase {
		font-size: 0.75rem;
		color: #161616;
	}

	.study-status {
		font-size: 0.7rem;
		padding: 0.125rem 0.5rem;
		border-radius: 12px;
		text-transform: uppercase;
		font-weight: 600;
		width: fit-content;
		margin-top: 0.25rem;
	}

	.status-active {
		color: #065f46;
	}

	.status-completed {
		background-color: #1e40af;
		color: #60a5fa;
	}

	.status-recruiting {
		background-color: #7c2d12;
		color: #fb7185;
	}

	/* ===== MAIN CONTENT STYLES ===== */
	.main-content {
		flex: 1;
		margin-left: 60px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		width: 100%;
		overflow: hidden;
	}

	/* ===== STUDY HEADER STYLES ===== */
	.study-header {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		align-items: flex-start;
		align-content: top;
		flex-shrink: 0;
		background-color: #EEEAE3;
		z-index: 10;
	}

	.study-info-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		align-content: top;
		gap: 1rem;
		width: 100%;
		padding: 0.5rem;
	}

	.study-info {
		display: flex;
		flex-direction: row;
		width: 100%;
		gap: 1rem;
		justify-content: space-between;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-around;
		gap: 0.5rem;
		min-width: 0;
	}

	.info-label {
		font-weight: 600;
		color: #64748b;
		font-size: 0.725rem;
		white-space: nowrap;
	}

	.info-value {
		color: #1f2937;
		font-weight: 800;
		font-size: 0.925rem;
	}

	.info-subvalue {
		color: #6b7280;
		font-weight: 500;
		font-size: 0.75rem;
		margin-top: 0.125rem;
	}

	.more-info-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: 1px solid #2563eb;
		border-radius: 50%;
		color: #2563eb;
		font-size: 0.625rem;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.more-info-btn:hover {
		color: #2563eb;
		transform: translateY(-1px);
	}

	/* ===== TABS CONTAINER STYLES ===== */
	.tabs-container {
		flex: 1;
		padding-left: 1rem;
		padding-right: 1rem;
		overflow-x: auto;
		overflow-y: hidden;
		display: flex;
		flex-direction: column;
		background-color: #ffffff;
		margin-top: 1rem;
		min-height: 0;
	}

	:global(.tabs-container [data-tabs-root]) {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	:global(.tabs-list) {
		background-color: #EEEAE3;
		margin-bottom: 1rem;
		padding: 0.5rem;
		border-radius: 100px;
		justify-content: left;
		align-items: left;
		display: flex;
		flex-direction: row;
	}

	:global(.tab-content) {
		flex: 1;
		overflow-x: auto;
		overflow-y: auto;
		min-height: 0;
	}

	/* ===== CONTENT AREA STYLES ===== */
	.content-wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-width: fit-content;
		overflow-x: auto;
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

	/* ===== RESPONSIVE DESIGN ===== */
	@media (max-width: 768px) {
		.patient-burden-mapper {
			padding: 0;
		}

		.sidebar {
			width: 100%;
			transform: translateX(-100%);
		}

		.sidebar:not(.collapsed) {
			transform: translateX(0);
		}

		.sidebar.collapsed {
			width: 60px;
			transform: translateX(0);
		}

		.main-content {
			margin-left: 0;
		}

		.main-content.sidebar-collapsed {
			margin-left: 60px;
		}

		.study-header {
			width: 100%;
		}

		.study-info-container {
			display: flex;
			flex-direction: row;
		}

		.study-info {
			display: flex;
			flex-direction: column;
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
			padding: 1.5rem;
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

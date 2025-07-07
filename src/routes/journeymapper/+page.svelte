<script lang="ts">
	// Component imports
	import JourneyContainer from '$lib/journeymapper/JourneyContainer.svelte';
	import StudyMetadataDrawer from '$lib/components/StudyMetadataDrawer.svelte';
	import PIQLogo from '$lib/assets/imgs/PIQLogo_Orange.svg';
	import AssessmentBurdenHeatmap from '$lib/components/AssessmentBurdenHeatmap.svelte';
	import SentimentNetworkGraph from '$lib/components/SentimentNetworkGraph.svelte';
	import JourneyAnalysisSummary from '$lib/journeymapper/JourneyAnalysisSummary.svelte';
	import * as Tabs from "$lib/ui/tabs";
	import DemoPDFUpload from "$lib/components/PDFUploadDemo.svelte";
	// Icon imports
	import { Calendar, ClipboardText, IdentificationCard, ChartLine, List, X, FolderOpen, ArrowRight, Path, ArrowLeft } from 'phosphor-svelte';
	
	// Load data from page load function
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	$: visitScheduleData = data.visitScheduleData;
	$: studyMetadata = data.studyMetadata;

	// State variables
	let isDrawerOpen = false;
	let isSidebarCollapsed = true;
	let selectedStudyId = 'STUDY-302'; // Default to current study
	let currentVisitScheduleData = data.visitScheduleData;
	let currentStudyMetadata = data.studyMetadata;
	
	// Initialize current data when the original data changes
	$: if (visitScheduleData && studyMetadata && selectedStudyId === 'STUDY-302') {
		currentVisitScheduleData = visitScheduleData;
		currentStudyMetadata = studyMetadata;
	}
	
	// Constants
	const timelineWidth = 1200;

	// Analyzed studies data with study IDs
	let analyzedStudies = [
		{ id: 'STUDY-302', name: 'STUDY-302', indication: 'Focal Onset Seizures (Epilepsy)', phase: 'Phase 3', status: 'active' },
		{ id: 'GXF-203-E', name: 'GXF-203-E', indication: 'Amyotrophic Lateral Sclerosis', phase: 'Phase 2', status: 'active' },
		{ id: 'BNX-451-A', name: 'BNX-451-A', indication: 'Major Depressive Disorder', phase: 'Phase 3', status: 'completed' },
		{ id: 'PFZ-738-D', name: 'PFZ-738-D', indication: 'Parkinson\'s Disease', phase: 'Phase 3', status: 'active' }
	];

	// Function to load study data
	async function loadStudyData(studyId: string) {
		try {
			if (studyId === 'STUDY-302') {
				// Default to original study data
				currentVisitScheduleData = visitScheduleData;
				currentStudyMetadata = studyMetadata;
				return;
			}
			
			const [visitScheduleResponse, metadataResponse] = await Promise.all([
				fetch(`/api/journeymapper/visit-schedule/${studyId}`),
				fetch(`/api/journeymapper/study-metadata/${studyId}`)
			]);
			
			if (!visitScheduleResponse.ok || !metadataResponse.ok) {
				throw new Error(`Failed to fetch data for study ${studyId}`);
			}
			
			const newVisitScheduleData = await visitScheduleResponse.json();
			const newMetadata = await metadataResponse.json();
			
			currentVisitScheduleData = newVisitScheduleData;
			currentStudyMetadata = newMetadata;
		} catch (error) {
			console.error('Error loading study data:', error);
			// Fallback to original data
			currentVisitScheduleData = visitScheduleData;
			currentStudyMetadata = studyMetadata;
		}
	}

	// Function to handle study selection
	async function selectStudy(studyId: string) {
		selectedStudyId = studyId;
		await loadStudyData(studyId);
	}

	// Function to add a new study to the analyzed studies list
	function addStudy(study: { name: string; indication: string; phase: string; status: string }) {
		// Check if study already exists to avoid duplicates
		const exists = analyzedStudies.find(s => s.name === study.name);
		if (!exists) {
			analyzedStudies = [...analyzedStudies, { ...study, id: study.name }];
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
	$: totalVisits = currentVisitScheduleData?.visits?.length || 0;
	$: travelVisits = currentVisitScheduleData?.visits?.filter(visit => visit.travel_required).length || 0;
	$: invasiveVisits = currentVisitScheduleData?.visits?.filter(visit => 
		visit.assessments?.some(assessment => 
			assessment.includes('Blood') || 
			assessment.includes('Laboratory') || 
			assessment.includes('ECG') ||
			assessment.includes('Pregnancy Test')
		)
	).length || 0;
	$: surgicalVisits = currentVisitScheduleData?.visits?.filter(visit => 
		visit.assessments?.some(assessment => 
			assessment.toLowerCase().includes('surgical') || 
			assessment.toLowerCase().includes('biopsy') ||
			assessment.toLowerCase().includes('procedure')
		)
	).length || 0;
	
	// Calculate overall burden score based on total assessments and travel requirements
	$: overallScore = currentVisitScheduleData?.visits?.length > 0 ? Math.round(
		(currentVisitScheduleData.visits.reduce((total, visit) => 
			total + (visit.assessments?.length || 0) + (visit.travel_required ? 5 : 0), 0
		) / currentVisitScheduleData.visits.length)
	) : 0;
</script>

<main class="patient-burden-mapper min-h-screen {isSidebarCollapsed ? 'sidebar-collapsed' : ''}">
	<!-- Sidebar -->
	<aside class="sidebar {isSidebarCollapsed ? 'collapsed' : ''}">
		<div class="sidebar-header">
			<div class="sidebar-title">
				{#if !isSidebarCollapsed}
				{/if}
				<button class="sidebar-toggle h-12 w-12	" on:click={toggleSidebar} aria-label="Toggle sidebar">
					{#if isSidebarCollapsed}
						<ArrowRight size={16} />
					{:else}
						<ArrowLeft size={16} />
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
				<div class="sidebar-section px-2">
					<h3 class="sidebar-section-title">
						<ClipboardText size={16} class="inline mr-2" />
						Analyzed Studies
					</h3>
					<div class="studies-list">
						{#each analyzedStudies as study}
							<div class="study-item {selectedStudyId === study.id ? 'selected' : ''}" 
								 on:click={() => selectStudy(study.id)}
								 on:keydown={(e) => e.key === 'Enter' && selectStudy(study.id)}
								 tabindex="0"
								 role="button">
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
		<div class="study-header-container flex flex-row align-middle items-center px-8 py-1 h-12 justify-between bg-indigo-900">
			<div class="flex flex-row align-middle items-center gap-2">
				<Path size={16} class="text-[#F1D5D3]" />
				<h3 class="text-pink-100 text-xs font-semibold">PIQ Journey Mapper</h3>
			</div>
			<img src={PIQLogo} alt="PIQ Logo" class="w-8 h-8 m-1 mix-blend-screen" />
		</div>
		<header class="study-header">
		<!-- Study Header -->
			<div class="study-info-container flex flex-row justify-between w-full align-top">
				<div class="flex flex-col gap-1 w-1/3 justify-start items-start">
					<span class="text-pink-50 font-mono italic">Study Name</span>
					<span class="font-semibold text-lg text-pink-100">{currentStudyMetadata?.study_name || 'Loading...'}</span>
				</div>
				<div class="study-info flex flex-row justify-between w-1/2">
					<div class="info-item">
						<span class="info-label">Indication</span>
						<span class="info-value">{currentStudyMetadata?.indication || 'Loading...'}</span>
						<span class="info-subvalue">{currentStudyMetadata?.indication_level_quotes || 0} posts</span>
					</div>
					<div class="info-item">
						<span class="info-label">Therapeutic Area</span>
						<span class="info-value">{currentStudyMetadata?.therapeutic_area || 'Loading...'}</span>
						<span class="info-subvalue">{currentStudyMetadata?.therapeutic_area_quotes || 0} posts</span>
					</div>
					<div class="info-item">
						<span class="info-label">Phase</span>
						<span class="info-value">{currentStudyMetadata?.phase || 'Loading...'}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Study length</span>
						<span class="info-value">{currentStudyMetadata?.total_visits || 0} visits</span>
					</div>
				</div>
			</div>
		</header>

		<!-- Navigation Tabs -->
		<div class="tabs-container w-full">
			<Tabs.Root value="summary" class="w-full">
				<Tabs.List class="flex flex-row align-middle w-full justify-between">
					<div class="flex flex-row align-middle justify-start w-full gap-4">
					<Tabs.Trigger value="summary" class="tab-trigger flex flex-row align-middle gap-2">
						<ChartLine size={16} class="mr-2" />
						<p class="text-xs">Summary</p>
					</Tabs.Trigger>
					<Tabs.Trigger value="schedule" class="tab-trigger flex flex-row align-middle gap-2">
						<Calendar size={16} class="mr-2" />
					<p class="text-xs">Schedule</p>
					</Tabs.Trigger>	
					<Tabs.Trigger value="assessments" class="tab-trigger flex flex-row align-middle gap-2">
						<ClipboardText size={16} class="mr-2" />
						<p class="text-xs">Assessments</p>
					</Tabs.Trigger>
					<Tabs.Trigger value="cards" class="tab-trigger flex flex-row align-middle gap-2">
						<IdentificationCard size={16} class="mr-2" />
						<p class="text-xs">Patient Cards</p>
					</Tabs.Trigger>
					</div>
					<div class="more-info-btn-container w-fit justify-end">
						<button on:click={toggleDrawer} aria-label="View study details" class="flex flex-row gap-2 w-full min-w-36 bg-indigo-950 text-[#F1D5D3] rounded-full items-center justify-evenly px-1 py-2 hover:bg-indigo-800">
							<p class="text-xs">Study Details</p><ArrowRight size={18} class="bg-indigo-50 text-indigo-950 rounded-full p-1" /> 
						</button>
					</div>
		
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
						{#if currentVisitScheduleData?.visits?.length > 0}
							<JourneyContainer visits={currentVisitScheduleData.visits} />
						{:else}
							<div class="loading-state">Loading study data...</div>
						{/if}
					</div>
				</Tabs.Content>
				
				<Tabs.Content value="assessments" class="tab-content">
					<div class="content-wrapper">
						<div class="assessment-content">
							<div class="assessment-section">
								<AssessmentBurdenHeatmap 
									showBurdenScores={false}
									maxSquares={8}
									squareSize="10px"
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

{#if currentStudyMetadata}
	<StudyMetadataDrawer 
		bind:isOpen={isDrawerOpen}
		studyData={currentStudyMetadata}
		on:toggle={handleDrawerToggle}
	/>
{/if}

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
		width: 320px;
		background-color: #ffffff;
		border-right: .5px solid #161616;
		color: white;
		display: flex;
		flex-direction: column;
		z-index: 1000;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.sidebar.collapsed {
		width: 60px;
	}

	.sidebar-header {
		background-color: #001f60;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.sidebar-title {
		display: flex;
		align-items: center;
	}

	.sidebar-toggle {
		background: none;
		border: none;
		color: #F1D5D3;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform: translateX(0);
	}

	.sidebar-toggle:hover {
		color: #374151;
		background-color: rgba(55, 65, 81, 0.1);
		transform: translateX(3.25px);
	}

	.logo-title-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.sidebar-logo {
		height: 24px;
		width: auto;
		object-fit: contain;
	}

	.sidebar-logo-collapsed {
		height: 20px;
		width: auto;
		object-fit: contain;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		opacity: 1;
		transform: translateX(0);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.sidebar.collapsed .sidebar-content {
		opacity: 0;
		transform: translateX(-20px);
		pointer-events: none;
	}

	.sidebar-section {
		margin-bottom: 2rem;
		opacity: 1;
		transform: translateY(0);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.sidebar.collapsed .sidebar-section {
		opacity: 0;
		transform: translateY(10px);
	}

	.sidebar-section:nth-child(2) {
		transition-delay: 0.1s;
	}

	.sidebar-section:nth-child(3) {
		transition-delay: 0.2s;
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
		border-bottom: 1px solid #001f60;
		cursor: pointer;
		padding: 1rem;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		transform: translateY(0);
	}

	.study-item:hover {
		border-bottom: 1px solid #ff1515;
		background-color: rgba(0, 31, 96, 0.05);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 31, 96, 0.1);
	}

	.study-item.selected {
		border-bottom: 2px solid #2563eb;
		background-color: rgba(37, 99, 235, 0.05);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
	}

	.study-item.selected .study-name {
		color: #2563eb;
		font-weight: 800;
	}

	.study-name {
		font-weight: 600;
		font-size: 0.875rem;
		margin-bottom: 0.25rem;
		color: #001f60;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
		color: #f;
		background-color: #065f46;
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
		margin-left: 320px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		width: calc(100% - 320px);
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.patient-burden-mapper.sidebar-collapsed .main-content {
		margin-left: 60px;
		width: calc(100% - 60px);
	}

	/* ===== STUDY HEADER STYLES ===== */
	.study-header {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		background-color: #29293C;
		color: #161616;
		border-bottom: .5px solid #161616;
		z-index: 10;
	}

	.study-info-container {
		width: 100%;
		padding: 1rem;
		flex-direction: row;
		justify-content: left;
		gap: 1rem;
		align-items: center;
		gap: 1rem;
	}

	.study-info {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: top;
		gap: 0.525rem;
		max-width: 10vw;
	}

	.info-label {
		font-weight: 400;
		font-family: 'IBM Plex Mono', monospace;
		font-style: italic;
		font-size: 0.5725rem;
		color: #F1D5D3;
		white-space: nowrap;
	}

	.info-value {
		color: #F1D5D3;
		font-weight: 600;
		font-size: 0.725rem;
		line-height: 1.2;
	}

	.info-subvalue {
		color: #F1D5DD;
		font-weight: 400;
		font-family: 'IBM Plex Mono', monospace;
		font-style: italic;
		font-size: 0.6725rem;
	}

	.more-info-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: row;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.more-info-btn:hover {
		color: #F1D5D3;
		transform: translateY(-1px);
	}

	/* ===== TABS CONTAINER STYLES ===== */
	



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
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		gap: 1rem;
		align-items: top;
		justify-content: center;
		width: 100%;
	}

	.section-subtitle {
		margin: 0;
		color: #1f2937;
		font-size: 1.5rem;
		font-weight: 600;
		text-align: center;
	}

	.loading-state {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
		color: #64748b;
		font-size: 1.1rem;
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
			padding: 0.5rem;
			gap: 1rem;
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

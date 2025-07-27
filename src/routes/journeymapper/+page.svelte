<script lang="ts">
	// Component imports
	import JourneyMapWrapper from '$lib/journeymapper/JourneyMapWrapper.svelte';
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
	// Import metadata file
	import studyMetadataFile from '../../data/journeymap/study_metadata_xackt.json';
	// Import PV study data files
	import pvStudyMetadata from '../../data/journeymap/study_metadata_sapablursen_pv.json';
	import pvVisitSchedule from '../../data/journeymap/sapablursen_pv_visit_schedule.json';

	interface Visit {
		visit_number: number;
		name: string;
		study_day?: string;
		study_day_range?: string;
		study_week?: string;
		assessments: string[];
		travel_required?: boolean;
	}
	
	export let data: PageData;
	
	$: visitScheduleData = data.visitScheduleData;
	$: studyMetadata = data.studyMetadata;

	// State variables
	let isDrawerOpen = false;
	let isSidebarCollapsed = true;
	let selectedStudyId = '2'; // Default to DECIPHERA-PV-3 study (study_id: "2")
	let currentVisitScheduleData = data.visitScheduleData;
	let currentStudyMetadata = data.studyMetadata;
	
	// Initialize current data when the original data changes
	$: if (visitScheduleData && studyMetadata) {
		loadStudyData(selectedStudyId);
	}
	
	// Constants
	const timelineWidth = 1200;

	// Analyzed studies data derived from metadata file
	let analyzedStudies = studyMetadataFile.map(study => ({
		id: study.study_id,
		name: study.study_name,
		indication: study.indication,
		phase: `Phase ${study.phase}`,
		status: 'active' // Default to active, could be derived from other fields if needed
	}));

	// Function to load study data
	function loadStudyData(studyId: string) {
		try {
			if (studyId === 'STU-D-302') {
				// Load original study data
				currentVisitScheduleData = visitScheduleData;
				currentStudyMetadata = studyMetadata;
				return;
			}
			
			if (studyId === 'DECIPHERA-PV-3' || studyId === '2') {
				// Load PV study data
				currentStudyMetadata = pvStudyMetadata;
				
				// Transform PV visit schedule to match expected structure
				const transformedVisitSchedule = {
					disease_name: pvStudyMetadata.indication,
					study_name: pvStudyMetadata.study_name,
					visits: pvVisitSchedule.map((visit: any, index: number) => ({
						visit_number: index + 1,
						name: `Visit ${visit.Visit}`,
						study_week: visit.Week,
						study_day: `Week ${visit.Week}`,
						travel_required: visit["Travel Req"] === "Y",
						invasive_procedures: visit["Invasive Procedures"] === "Y",
						surgical_procedures: visit["Surgical Procedures"] === "Y",
						visit_type: visit["Visit Type"],
						stage: visit["Stage"],
						assessments: [] // PV data doesn't have assessments - could be populated later
					}))
				};
				
				currentVisitScheduleData = transformedVisitSchedule;
				return;
			}
			
			// Fallback to original data for any other study
			currentVisitScheduleData = visitScheduleData;
			currentStudyMetadata = studyMetadata;
		} catch (error) {
			console.error('Error loading study data:', error);
			// Fallback to original data
			currentVisitScheduleData = visitScheduleData;
			currentStudyMetadata = studyMetadata;
		}
	}

	// Function to handle study selection
	function selectStudy(studyId: string) {
		selectedStudyId = studyId;
		loadStudyData(studyId);
	}

	// Function to add a new study to the analyzed studies list
	function addStudy(study: { name: string; indication: string; phase: string; status: string }) {
		// Check if study already exists to avoid duplicates
		const exists = analyzedStudies.find(s => s.name === study.name);
		if (!exists) {
			analyzedStudies = [...analyzedStudies, { ...study, id: study.name }];
		}
	}

	// Helper function to detect if data uses new visit schedule format
	// New format has fields: "Travel Req", "Invasive Procedures", "Surgical Procedures" with "Y"/"N" values
	function isNewVisitScheduleFormat(data: any): boolean {
		return data && Array.isArray(data) && data.length > 0 && 
			   data[0].hasOwnProperty('Travel Req') && 
			   data[0].hasOwnProperty('Invasive Procedures') && 
			   data[0].hasOwnProperty('Surgical Procedures');
	}

	// Generic function to calculate visit statistics for any study
	// Handles both old format (with visits.assessments) and new format (with "Y"/"N" flags)
	function calculateVisitStatistics(studyId: string, visitData: any) {
		if (studyId === 'DECIPHERA-PV-3' || studyId === '2' || isNewVisitScheduleFormat(visitData)) {
			// Use new format
			const data = studyId === 'DECIPHERA-PV-3' || studyId === '2' ? pvVisitSchedule : visitData;
			return {
				total: data.length || 0,
				travel: data.filter((visit: any) => visit["Travel Req"] === "Y").length || 0,
				invasive: data.filter((visit: any) => visit["Invasive Procedures"] === "Y").length || 0,
				surgical: data.filter((visit: any) => visit["Surgical Procedures"] === "Y").length || 0
			};
		} else {
			// Use old format
			const visits = visitData?.visits || [];
			return {
				total: visits.length || 0,
				travel: visits.filter((visit: Visit) => visit.travel_required).length || 0,
				invasive: visits.filter((visit: Visit) => 
					visit.assessments?.some((assessment: string) => 
						assessment.includes('Blood') || 
						assessment.includes('Laboratory') || 
						assessment.includes('ECG') ||
						assessment.includes('Pregnancy Test') ||
						assessment.includes('Hematocrit') ||
						assessment.includes('CBC')
					)
				).length || 0,
				surgical: visits.filter((visit: Visit) => 
					visit.assessments?.some((assessment: string) => 
						assessment.toLowerCase().includes('surgical') || 
						assessment.toLowerCase().includes('biopsy') ||
						assessment.toLowerCase().includes('procedure') ||
						assessment.toLowerCase().includes('injection')
					)
				).length || 0
			};
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

	// Reactive calculations for visit statistics using generic helper function
	$: visitStats = calculateVisitStatistics(selectedStudyId, currentVisitScheduleData);
	$: totalVisits = visitStats.total;
	$: travelVisits = visitStats.travel;
	$: invasiveVisits = visitStats.invasive;
	$: surgicalVisits = visitStats.surgical;
	
	// Calculate overall burden score based on total assessments and travel requirements
	$: overallScore = (() => {
		if (selectedStudyId === 'DECIPHERA-PV-3' || selectedStudyId === '2' || isNewVisitScheduleFormat(currentVisitScheduleData)) {
			const data = selectedStudyId === 'DECIPHERA-PV-3' || selectedStudyId === '2' ? pvVisitSchedule : currentVisitScheduleData;
			if (data && data.length > 0) {
				return Math.round(
					(
						data.reduce(
							(total: number, visit: any) =>
								total +
								(visit["Travel Req"] === "Y" ? 5 : 0) +
								(visit["Invasive Procedures"] === "Y" ? 3 : 0) +
								(visit["Surgical Procedures"] === "Y" ? 7 : 0),
							0
						) / data.length
					)
				);
			}
			return 0;
		}
		
		return currentVisitScheduleData?.visits?.length > 0
			? Math.round(
				(
					currentVisitScheduleData.visits.reduce(
						(total: number, visit: Visit) =>
							total +
							(visit.assessments?.length || 0) +
							(visit.travel_required ? 5 : 0),
						0
					) / currentVisitScheduleData.visits.length
				)
			)
			: 0;
	})();
</script>

<main class="patient-burden-mapper min-h-screen {isSidebarCollapsed ? 'sidebar-collapsed' : ''}">
	<!-- Sidebar -->
	<aside class="sidebar {isSidebarCollapsed ? 'collapsed' : ''}">
		<div class="sidebar-header">
			<div class="sidebar-title">
				{#if !isSidebarCollapsed}
				{/if}
				<button class="sidebar-toggle w-full h-12" on:click={toggleSidebar} aria-label="Toggle sidebar">
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
					<div class="flex flex-row align-middle items-center gap-2 mb-4">
					<h3 class="text-sm font-medium text-slate-800">
						<ClipboardText size={16} class="inline text-[#EB4E27]" /> Analyzed Studies
					</h3>
					</div>
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
		<div class="study-header-container flex flex-row align-middle items-center px-8 py-1 h-12 justify-between bg-[#EB4E27] sticky top-0 z-30">
			<div class="flex flex-row align-middle items-center gap-2">
				<Path size={16} class="text-white" />
				<h3 class="text-white text-xs font-medium">PIQ Journey Mapper</h3>
			</div>
			<img src={PIQLogo} alt="PIQ Logo" class="w-8 h-8 invert mix-blend-color-dodge" />
		</div>
		<header class="study-header">
		<!-- Study Header -->
			<div class="study-info-container flex flex-row items-center w-full h-full px-4 py-2">
				<div class="flex flex-col gap-1 w-1/3 justify-start items-start">
					<span class="text-slate-800 font-mono text-2xs ">Study Name</span>
					<span class="font-semibold text-sm text-slate-800">{currentStudyMetadata?.study_name || 'Loading...'}</span>
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
				</div>
			</div>
		</header>

		<!-- Navigation Tabs -->
		<div class="tabs-container w-full px-4">
			<Tabs.Root value="summary" class="w-full">
				<div class="flex flex-row align-middle w-full h-full">
					<div class="flex flex-row align-middle justify-start w-full">
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
						<button on:click={toggleDrawer} 
						aria-label="View study details" class="flex flex-row gap-2 w-full min-w-36 bg-[#EB4E27] rounded-full items-center justify-evenly px-1 py-2 hover:bg-slate-600">
							<p class="text-xs font-medium text-white">
								Study Details</p>
								<ArrowRight size={18} class="bg-orange-50 text-orange-950 rounded-full p-1" /> 
						</button>
					</div>
				</div>
				
				<!-- Tab Content -->
				<Tabs.Content value="summary" class="tab-content">
					<JourneyAnalysisSummary 
						{totalVisits}
						{travelVisits}
						{invasiveVisits}
						{surgicalVisits}
						{selectedStudyId}
					/>
				</Tabs.Content>

				<Tabs.Content value="schedule" class="tab-content">
					<div class="content-wrapper">
						{#if currentVisitScheduleData?.visits?.length > 0}
							<JourneyMapWrapper />
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
									selectedStudyId={selectedStudyId}
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
	/* ===== SIDEBAR STYLES ===== */
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		width: 400px;
		height: 100vh;
		background-color: #F8F8F8;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 20;
		display: flex;
		flex-direction: column;
	}

	.sidebar.collapsed {
		width: 60px;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		flex-shrink: 0;
	}

	.sidebar-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #161616;
		font-size: 0.875rem;
		font-weight: 600;
		width: 100%;
	}

	.sidebar-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #E7FFA0;
		background-color: #ff1616;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.sidebar-toggle:hover {
		color: #ff1616;
		background-color: #f6e3e1;
	}

	.sidebar-content {
		padding: 1rem;
		border-bottom: .5px solid #e5e7eb;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		min-height: 0; /* Important for Firefox */
	}

	.sidebar-section {
		margin-bottom: 1.5rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.sidebar-section-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #F1D5D3;
		font-size: 0.875rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
		width: 100%;
	}

	/* ===== STUDIES LIST STYLES ===== */
	.studies-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
		overflow-y: auto;
		min-height: 0; /* Important for Firefox */
	}	

	.study-item {
		padding: 1rem;
		background-color: #fff;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.study-item:hover {
		background-color: #fff;
		border: 1px solid #ff1616;
	}

	.study-item.selected {
		background-color: #fff;
		border: 1px solid #ff1616;
	}

	.study-name {
		color: #161616;
		font-size: 0.875rem;
		font-weight: 600;
		width: 100%;
	}

	.study-details {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		gap: 0.5rem;
		width: 100%;
	}

	.study-indication,
	.study-phase {
		font-size: 0.75rem;
		color: #161616;
		opacity: 0.8;
	}

	.study-status {
		font-size: 0.625rem;
		padding: 0.125rem 0.5rem;
		border-radius: 12px;
		text-transform: uppercase;
		font-weight: 600;
		width: fit-content;
		margin-top: 0.125rem;
	}

	.status-active {
		color: #fff;
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
		margin-left: 400px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		width: calc(100% - 400px);
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.patient-burden-mapper.sidebar-collapsed .main-content {
		margin-left: 60px;
		width: calc(100% - 60px);
	}

	/* ===== STUDY HEADER STYLES ===== */
	.study-header-container {
		position: sticky;
		top: 0;
		z-index: 30;
		background-color: #EB4E27;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.study-header {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		background-color: #f8f8f8;
		border-bottom: .5px solid #e5e7eb;
		z-index: 10;
	}

	.study-info-container {
		width: 100%;
		flex-direction: row;
		justify-content: left;
		align-items: center;
	}

	.study-info {
		display: flex;
		flex-direction: row;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: top;
		gap: 0.25rem;

	}

	.info-label {
		font-weight: 400;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.5725rem;
		color: #161616;
		white-space: nowrap;
	}

	.info-value {
		color: #161616;
		font-weight: 600;
		font-size: 0.725rem;
		line-height: 1.2;
	}

	.info-subvalue {
			color: #161616;
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
	.tabs-container {
		padding: 1rem;
		background-color: white;
	}

	:global(.tab-trigger) {
		padding: 0.25rem 0.725rem;
		margin-right: 0.5rem;
		color: #161616;
		font-weight: 500;
		transition: all 0.2s ease;
		border-bottom: 1px solid transparent;
	}

	:global(.tab-trigger[data-state="active"]) {
		color: #f6e3e1;
		background-color: #EB4E27;
	}

	:global(.tab-trigger[data-state="active"]:hover) {
		color: #f6e3e1;
		background-color: #EB4E27;
	}

	:global(.tab-trigger:hover) {
		color: #EB4E27;
		background-color: #f6e3e1;
	}

	:global(.tab-content) {
		padding-top: 2rem;
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
			flex-direction: column;
		}

		.sidebar {
			width: 100%;
			height: auto;
			position: relative;
		}

		.main-content {
			margin-left: 0;
			width: 100%;
		}
	}
</style>

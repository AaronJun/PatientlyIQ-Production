<script lang="ts">
	import * as Tabs from "$lib/ui/tabs";
	import { Path } from 'phosphor-svelte';
</script>

<main class="container">
	<!-- Header Section -->
	<div class="header-section px-4 py-6 rounded-xl gap-4">
		<Path size={48} class="bg-slate-50 border-1 border-[#ff1616] rounded-full text-[#ff1616] p-2" weight="fill" />
		<h2 class="text-slate-500 text-center text-sm md:text-base font-mono uppercase mt-2">Demo</h2>
		<h1 class="text-slate-800 text-center text-3xl md:text-5xl mb-4">PIQ Journey Mapper</h1>
		<p class="text-slate-800 text-center text-base max-w-prose text-pretty">
			PatientlyIQ's Journey Mapper brings the patient and caregiver voice to clinical trial design.
			<br><br>
			Using an AI-powered engine, Journey Mapper builds datasets from online activity, quantifies patient burden, models patient journeys, and provides actionable insights to improve study design and participant experience.
		</p>
	</div>

	<!-- Demo Videos -->
	<div class="demo-tabs rounded-xl flex flex-col w-full justify-center align-middle items-center pt-4 pb-32">
		<Tabs.Root value="burden-assessment" class="w-full justify-center align-middle items-center">
			<Tabs.List class="w-full mx-auto px-4">
				<Tabs.Trigger value="burden-assessment">Burden Assessment</Tabs.Trigger>
				<Tabs.Trigger value="journey-schedule">Journey Schedule</Tabs.Trigger>
				<Tabs.Trigger value="journey-summary">Journey Summary</Tabs.Trigger>
			</Tabs.List>
			
			<Tabs.Content value="burden-assessment" class="mt-4 ring-1 ring-slate-200 bg-slate-50/60 rounded-xl">
				<div class="tab-content-wrapper">
					<div class="flex flex-col gap-8 align-middle items-center w-full border-2 border-slate-500 px-4 py-6">
						<h2 class="text-slate-500 text-center text-sm md:text-base font-mono uppercase mt-2">Patient Burden Assessment</h2>
						<p class="text-slate-800 text-center text-sm md:text-base max-w-prose text-pretty">	
							Journey Mapper pairs protocol details to PIQ's database of patient and caregiver sentiment data. This video shows how the platform automatically scores burden for each assessment and the quotes that support the score.
						</p>
						<div class="key-features my-2 text-2xs md:text-xs overflow-x-auto">							
							<span class="feature-tag">Interactive Heatmaps</span>
							<span class="feature-tag">Burden Scoring</span>
							<span class="feature-tag">Visit Analysis</span>
						</div>
					</div>
					<div class="video-container">
						<video
							controls
							preload="metadata"
							class="demo-video"
						>
							<source src="/PIQBurdenAssessmentDemo.mp4" type="video/mp4" />
							<p>Your browser doesn't support HTML video. Here is a <a href="/PIQBurdenAssessmentDemo.mp4">link to the video</a> instead.</p>
						</video>
					</div>
				
				</div>
			</Tabs.Content>
			
			<Tabs.Content value="journey-schedule" class="mt-4 ring-1 ring-slate-200 bg-slate-50/60">
				<div class="tab-content-wrapper">
					<div class="flex flex-col gap-8 align-middle items-center w-full border-2 border-slate-500 px-4 py-6">
						<h2 class="text-slate-500 text-center text-sm md:text-base font-mono uppercase mt-2">Journey Schedule Optimization</h2>
						<p class="text-slate-800 text-center text-sm md:text-base max-w-prose text-pretty">
							Journey Mapper visualizes the complete patient journey through interactive timeline views. 
							This demo highlights visit scheduling optimization, assessment distribution analysis, and tools for reducing protocol complexity while maintaining scientific rigor.
						</p>
						<div class="key-features my-2 text-2xs md:text-xs overflow-x-auto">
							<span class="feature-tag">Timeline Visualization</span>
							<span class="feature-tag">Visit Optimization</span>
							<span class="feature-tag">Assessment Mapping</span>
						</div>
					</div>
					<div class="video-container">
						<video
							controls
							preload="metadata"
							class="demo-video"
						>
							<source src="/PIQJourneyScheduleDemo.mp4" type="video/mp4" />
							<p>Your browser doesn't support HTML video. Here is a <a href="/PIQJourneyScheduleDemo.mp4">link to the video</a> instead.</p>
						</video>
					</div>
				</div>
			</Tabs.Content>
			
			<Tabs.Content value="journey-summary" class="mt-4 ring-1 ring-slate-200 bg-slate-50/60">
				<div class="tab-content-wrapper">
					<div class="flex flex-col gap-8 align-middle items-center w-full border-2 border-slate-500 px-4 py-6">
						<h2 class="text-slate-500 text-center text-sm md:text-base font-mono uppercase mt-2">Journey Analysis & Insights</h2>
						<p class="text-slate-800 text-center text-sm md:text-base max-w-prose text-pretty">
							Explore comprehensive journey analytics that provide actionable insights for protocol optimization. 
							This demo shows how our platform generates detailed reports, identifies improvement opportunities, 
							and provides data-driven recommendations for enhancing patient experience.
						</p>
						<div class="key-features my-2 text-2xs md:text-xs overflow-x-auto">				
							<span class="feature-tag">Analytics Dashboard</span>
							<span class="feature-tag">Insight Generation</span>
							<span class="feature-tag">Protocol Recommendations</span>
						</div>
					</div>
					<div class="video-container">
						<video
							controls
							preload="metadata"
							class="demo-video"
						>
							<source src="/PIQJourneySummaryDemo.mp4" type="video/mp4" />
							<p>Your browser doesn't support HTML video. Here is a <a href="/PIQJourneySummaryDemo.mp4">link to the video</a> instead.</p>
						</video>
					</div>
				</div>
			</Tabs.Content>
			
		</Tabs.Root>
	</div>

</main>

<style>

	.header-section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		margin-bottom: 3rem;
		padding-bottom: 2rem;

	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.feature-item {
		padding: 1.5rem;
		background: #f8fafc;
		text-align: left;
	}

	.feature-item h3 {
		font-size: 1.1rem;
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 0.5rem;
	}

	.feature-item p {
		font-size: 0.9rem;
		color: #64748b;
		margin: 0;
	}

	.tab-content-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.tab-description p {
		color: #64748b;
		line-height: 1.525;
		margin-bottom: 1rem;
		text-align: center;
	}

	.feature-tag {
		background: #dbeafe;
		color: #1d4ed8;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		font-size: 0.625rem;
		font-weight: 400;
	}

	.video-container {
		width: 100%;
		display: flex;
		justify-content: center;
		padding-top: 2.25rem;
		padding-bottom: 5rem;
		border-top: .525px solid #161616;
	}

	.demo-video {
		width: 100%;
		max-width: 1080px;
		height: auto;
		border-radius: 15px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.key-features {
		display: flex;
		gap: 0.25rem;
		justify-content: center;
		align-items: center;
		overflow-x: auto;
		white-space: nowrap;
		padding: 0.5rem 0;
		width: 100%;
		scroll-snap-type: x mandatory;
		scroll-snap-align: start;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.cta-section {
		text-align: center;
		padding: 3rem 2rem;
		background-color: #667eea;
		border-radius: 12px;
		color: white;
		margin-top: 2rem;
	}

	.cta-section h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.cta-section p {
		font-size: 1.1rem;
		opacity: 0.9;
		margin-bottom: 2rem;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.cta-button {
		padding: 0.75rem 2rem;
		border-radius: 6px;
		font-weight: 600;
		text-decoration: none;
		transition: all 0.2s ease;
		display: inline-block;
	}

	.cta-button.primary {
		background: white;
		color: #667eea;
	}

	.cta-button.primary:hover {
		background: #f8fafc;
		transform: translateY(-1px);
	}

	.cta-button.secondary {
		background: transparent;
		color: white;
		border: 2px solid white;
	}

	.cta-button.secondary:hover {
		background: white;
		color: #667eea;
		transform: translateY(-1px);
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		.main-title {
			font-size: 2rem;
		}

		.main-description {
			font-size: 1rem;
		}

		.tab-content-wrapper {
			gap: 1rem;
		}

		.tab-description {
			padding: 1rem;
		}

		.cta-section {
			padding: 2rem 1rem;
		}

		.cta-buttons {
			flex-direction: column;
			align-items: center;
		}

		.cta-button {
			width: 100%;
			max-width: 250px;
		}
	}
</style>


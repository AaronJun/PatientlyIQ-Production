<script lang="ts">
	import * as Tabs from "$lib/ui/tabs";
</script>

<main class="container">
	<!-- Header Section -->
	<div class="header-section">
		<h1 class="main-title">PIQ Journey Mapper Demo</h1>
		<p class="main-description">
			Explore how PatientlyIQ's Journey Mapper transforms clinical trial design by visualizing patient burden, 
			optimizing visit schedules, and providing actionable insights to improve participant experience and retention.
		</p>
		<div class="features-grid">
			<div class="feature-item">
				<h3>📊 Burden Assessment</h3>
				<p>Quantify and visualize patient burden across study visits</p>
			</div>
			<div class="feature-item">
				<h3>📅 Schedule Optimization</h3>
				<p>Optimize visit timing and reduce participant dropout</p>
			</div>
			<div class="feature-item">
				<h3>📈 Journey Analysis</h3>
				<p>Generate comprehensive insights and recommendations</p>
			</div>
		</div>
	</div>

	<!-- Demo Videos -->
	<div class="demo-tabs">
		<Tabs.Root value="burden-assessment" class="w-full">
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="burden-assessment">Burden Assessment</Tabs.Trigger>
				<Tabs.Trigger value="journey-schedule">Journey Schedule</Tabs.Trigger>
				<Tabs.Trigger value="journey-summary">Journey Summary</Tabs.Trigger>
			</Tabs.List>
			
			<Tabs.Content value="burden-assessment" class="mt-6">
				<div class="tab-content-wrapper">
					<div class="tab-description">
						<h2>Patient Burden Assessment</h2>
						<p>
							Discover how our platform quantifies patient burden across clinical trial visits. This demo showcases 
							the interactive heatmap visualization that helps researchers identify high-burden timepoints and 
							optimize study protocols to improve patient experience and retention rates.
						</p>
						<div class="key-features">
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
			
			<Tabs.Content value="journey-schedule" class="mt-6">
				<div class="tab-content-wrapper">
					<div class="tab-description">
						<h2>Journey Schedule Optimization</h2>
						<p>
							See how Journey Mapper visualizes the complete patient journey through interactive timeline views. 
							This demo highlights visit scheduling optimization, assessment distribution analysis, and tools for 
							reducing protocol complexity while maintaining scientific rigor.
						</p>
						<div class="key-features">
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
			
			<Tabs.Content value="journey-summary" class="mt-6">
				<div class="tab-content-wrapper">
					<div class="tab-description">
						<h2>Journey Analysis & Insights</h2>
						<p>
							Explore comprehensive journey analytics that provide actionable insights for protocol optimization. 
							This demo shows how our platform generates detailed reports, identifies improvement opportunities, 
							and provides data-driven recommendations for enhancing patient experience.
						</p>
						<div class="key-features">
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

	<!-- Call to Action -->
	<div class="cta-section">
		<h3>Ready to Transform Your Clinical Trials?</h3>
		<p>Contact our team to learn how PIQ Journey Mapper can optimize your study design and improve patient outcomes.</p>
		<div class="cta-buttons">
			<a href="/contact" class="cta-button primary">Get Started</a>
			<a href="/journeymapper" class="cta-button secondary">Try Interactive Demo</a>
		</div>
	</div>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.header-section {
		text-align: center;
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.main-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #1e293b;
		margin-bottom: 1rem;
	}

	.main-description {
		font-size: 1.125rem;
		color: #64748b;
		max-width: 800px;
		margin: 0 auto 2rem;
		line-height: 1.6;
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
		border-radius: 8px;
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

	.demo-tabs {
		width: 100%;
		margin-bottom: 3rem;
	}

	.tab-content-wrapper {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.tab-description {
		background: #f8fafc;
		padding: 1.5rem;
		border-radius: 8px;
		border-left: 4px solid #3b82f6;
	}

	.tab-description h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 1rem;
	}

	.tab-description p {
		color: #64748b;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.key-features {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.feature-tag {
		background: #dbeafe;
		color: #1d4ed8;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.video-container {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.demo-video {
		width: 100%;
		max-width: 1080px;
		height: auto;
		border-radius: 8px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.cta-section {
		text-align: center;
		padding: 3rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 12px;
		color: white;
		margin-top: 2rem;
	}

	.cta-section h3 {
		font-size: 1.8rem;
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


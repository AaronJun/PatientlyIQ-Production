<script lang="ts">
	import * as Tabs from "$lib/ui/tabs";
</script>

<main class="container">
	<div class="demo-tabs">
		<Tabs.Root value="burden-assessment" class="w-full">
			<Tabs.List class="grid w-full grid-cols-3">
				<Tabs.Trigger value="burden-assessment">Burden Assessment</Tabs.Trigger>
				<Tabs.Trigger value="journey-schedule">Journey Schedule</Tabs.Trigger>
				<Tabs.Trigger value="journey-summary">Journey Summary</Tabs.Trigger>
			</Tabs.List>
			
			<Tabs.Content value="burden-assessment" class="mt-6">
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
			</Tabs.Content>
			
			<Tabs.Content value="journey-schedule" class="mt-6">
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
			</Tabs.Content>
			
			<Tabs.Content value="journey-summary" class="mt-6">
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
			</Tabs.Content>
		</Tabs.Root>
	</div>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.demo-tabs {
		width: 100%;
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

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}
	}
</style>


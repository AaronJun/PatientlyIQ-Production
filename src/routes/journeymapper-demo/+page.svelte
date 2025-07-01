<script lang="ts">

</script>

<main class="container">
	<div class="video-container">
		<video
			controls
			preload="metadata"
			class="demo-video"
			poster="/PIQDemoHero1080p.mp4#t=0.5"
		>
			<source src="/PIQDemoHero1080p.mp4" type="video/mp4" />
			<p>Your browser doesn't support HTML video. Here is a <a href="/PIQDemoHero1080p.mp4">link to the video</a> instead.</p>
		</video>
	</div>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
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


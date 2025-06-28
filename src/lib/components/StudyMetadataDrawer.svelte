<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Type definitions
	interface StudyMetadata {
		study_id: string;
		study_name: string;
		sponsor: string;
		title: string;
		phase: string;
		indication: string;
		population: {
			age_range: string;
			condition: string;
			inclusion_highlights: string[];
		};
		design: {
			randomization: string;
			control: string;
			blinding: string;
			arms: number;
			multicenter: boolean;
		};
		total_visits: number;
		visit_schedule_json: string;
	}

	// Props
	export let isOpen: boolean = false;
	export let studyData: StudyMetadata;

	const dispatch = createEventDispatcher();

	function toggleDrawer() {
		isOpen = !isOpen;
		dispatch('toggle', { isOpen });
	}

	function closeDrawer() {
		isOpen = false;
		dispatch('toggle', { isOpen });
	}
</script>

<!-- Backdrop -->
{#if isOpen}
	<div class="backdrop" on:click={closeDrawer} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && closeDrawer()}></div>
{/if}

<!-- Drawer -->
<div class="drawer" class:open={isOpen}>
	<div class="drawer-header">
		<div class="drawer-title">
			<h2>Study Information</h2>
			<div class="study-id">{studyData.study_id}</div>
		</div>
		<button class="close-btn" on:click={toggleDrawer} aria-label="Close drawer">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M18 6L6 18M6 6l12 12"/>
			</svg>
		</button>
	</div>

	<div class="drawer-content">
		<div class="study-overview">
			<h3>{studyData.study_name}</h3>
			<p class="study-title">{studyData.title}</p>
			
			<div class="metadata-grid">
				<div class="metadata-item">
					<span class="label">Sponsor:</span>
					<span class="value">{studyData.sponsor}</span>
				</div>
				<div class="metadata-item">
					<span class="label">Phase:</span>
					<span class="value phase-badge">{studyData.phase}</span>
				</div>
				<div class="metadata-item">
					<span class="label">Indication:</span>
					<span class="value">{studyData.indication}</span>
				</div>
				<div class="metadata-item">
					<span class="label">Total Visits:</span>
					<span class="value">{studyData.total_visits}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h4>Population</h4>
			<div class="population-info">
				<div class="metadata-item">
					<span class="label">Age Range:</span>
					<span class="value">{studyData.population.age_range}</span>
				</div>
				<div class="metadata-item">
					<span class="label">Condition:</span>
					<span class="value">{studyData.population.condition}</span>
				</div>
				<div class="inclusion-criteria">
					<span class="label">Key Inclusion Criteria:</span>
					<ul>
						{#each studyData.population.inclusion_highlights as criterion}
							<li>{criterion}</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>

		<div class="section">
			<h4>Study Design</h4>
			<div class="design-grid">
				<div class="design-item">
					<span class="label">Randomization:</span>
					<span class="value">{studyData.design.randomization}</span>
				</div>
				<div class="design-item">
					<span class="label">Control:</span>
					<span class="value">{studyData.design.control}</span>
				</div>
				<div class="design-item">
					<span class="label">Blinding:</span>
					<span class="value">{studyData.design.blinding}</span>
				</div>
				<div class="design-item">
					<span class="label">Arms:</span>
					<span class="value">{studyData.design.arms}</span>
				</div>
				<div class="design-item">
					<span class="label">Multicenter:</span>
					<span class="value">{studyData.design.multicenter ? 'Yes' : 'No'}</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 40;
	}

	.drawer {
		position: fixed;
		background: white;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
		z-index: 50;
		transition: transform 0.3s ease;
		
		/* Mobile: bottom drawer */
		bottom: 0;
		left: 0;
		right: 0;
		height: 60vh;
		max-height: 600px;
		border-radius: 16px 16px 0 0;
		transform: translateY(100%);
	}

	.drawer.open {
		transform: translateY(0);
	}



	.drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
		border-radius: 16px 16px 0 0;
	}

	.drawer-title h2 {
		margin: 0;
		font-size: 1.25rem;
		color: #1f2937;
	}

	.study-id {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		color: #6b7280;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: #e5e7eb;
		color: #374151;
	}

	.drawer-content {
		padding: 1.5rem;
		height: calc(100% - 80px);
		overflow-y: auto;
	}

	.study-overview h3 {
		margin: 0 0 1rem 0;
		font-size: 1.125rem;
		color: #1f2937;
		font-weight: 600;
	}

	.study-title {
		color: #4b5563;
		line-height: 1.5;
		margin-bottom: 1.5rem;
		font-size: 0.9rem;
	}

	.metadata-grid {
		display: grid;
		gap: 0.75rem;
		margin-bottom: 2rem;
	}

	.metadata-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.label {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
	}

	.value {
		color: #1f2937;
		font-size: 0.875rem;
		text-align: right;
		flex: 1;
		margin-left: 1rem;
	}

	.phase-badge {
		background: #dbeafe;
		color: #1e40af;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.section {
		margin-bottom: 2rem;
	}

	.section h4 {
		margin: 0 0 1rem 0;
		font-size: 1rem;
		color: #1f2937;
		font-weight: 600;
	}

	.population-info {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.inclusion-criteria {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.inclusion-criteria ul {
		margin: 0;
		padding-left: 1rem;
		color: #4b5563;
		font-size: 0.875rem;
	}

	.inclusion-criteria li {
		margin-bottom: 0.25rem;
		line-height: 1.4;
	}

	.design-grid {
		display: grid;
		gap: 0.75rem;
	}

	.design-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #f3f4f6;
	}

	/* Desktop and tablet: right drawer */
	@media (min-width: 768px) {
		.drawer {
			top: 0;
			bottom: 0;
			right: 0;
			left: auto;
			width: 350px;
			height: 100vh;
			max-height: none;
			border-radius: 16px 0 0 16px;
			transform: translateX(100%);
			box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
		}

		.drawer.open {
			transform: translateX(0);
		}



		.drawer-header {
			border-radius: 16px 0 0 0;
		}



		.metadata-grid {
			grid-template-columns: 1fr;
		}

		.design-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (min-width: 1024px) {
		.drawer {
			width: 400px;
		}
	}

	/* Scrollbar styling */
	.drawer-content::-webkit-scrollbar {
		width: 6px;
	}

	.drawer-content::-webkit-scrollbar-track {
		background: #f1f5f9;
	}

	.drawer-content::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}

	.drawer-content::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
</style> 
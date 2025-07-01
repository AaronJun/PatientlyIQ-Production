<script lang="ts">
	import { ArrowDown, ArrowRight, WaveTriangle, Users, Target, TrendUp } from 'phosphor-svelte';
	import analysisData from '../../data/journeymap/journey_mapper_analysis_summary.json';
	import VisitSquares from './VisitSquares.svelte';
	import FileUpload from '$lib/components/ui/file-upload/FileUpload.svelte';
	import hurdleQuotesData from '../../data/journeymap/hurdle_quotes.json';
	import HurdleQuotesDrawer from './HurdleQuotesDrawer.svelte';

	// Props for visit statistics
	export let totalVisits: number = 0;
	export let travelVisits: number = 0;
	export let invasiveVisits: number = 0;
	export let surgicalVisits: number = 0;

	const analysis = analysisData.journey_mapper_analysis;
	const hurdleQuotes = hurdleQuotesData.hurdle_quotes;

	// State for expandable sections
	let expandedSections = {
		hurdles: false,
		dropoutRisks: false,
		interventions: false,
		priorities: false
	};

	// State for quotes drawer
	let isQuotesDrawerOpen = false;
	let selectedHurdle = '';
	let selectedQuotes: Array<{quote: string, persona_descriptor: string}> = [];

	function toggleSection(section: keyof typeof expandedSections) {
		expandedSections[section] = !expandedSections[section];
	}

	function handleHurdleClick(hurdleName: string) {
		selectedHurdle = hurdleName;
		selectedQuotes = (hurdleQuotes as any)[hurdleName] || [];
		isQuotesDrawerOpen = true;
	}

	function closeQuotesDrawer() {
		isQuotesDrawerOpen = false;
		selectedHurdle = '';
		selectedQuotes = [];
	}

	// Get risk level styling
	function getRiskStyling(risk: number) {
		if (risk >= 0.45) return 'bg-red-100 text-red-800 border-red-200';
		if (risk >= 0.35) return 'bg-orange-100 text-orange-800 border-orange-200';
		if (risk >= 0.25) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
		if (risk >= 0.15) return 'bg-blue-100 text-blue-800 border-blue-200';
		return 'bg-green-100 text-green-800 border-green-200';
	}

		

	// Get risk level text
	function getRiskLevel(risk: number) {
		if (risk >= 0.45) return 'Very High';
		if (risk >= 0.35) return 'High';
		if (risk >= 0.25) return 'Moderate';
		if (risk >= 0.15) return 'Low';
		return 'Very Low';
	}

	// Get burden level styling
	function getBurdenStyling(score: number) {
		if (score >= 9) return 'bg-red-500';
		if (score >= 7) return 'bg-orange-500';
		if (score >= 5) return 'bg-yellow-500';
		return 'bg-green-500';
	}

	// Get impact level styling
	function getImpactStyling(level: string) {
		switch (level.toLowerCase()) {
			case 'critical': return 'bg-red-100 text-red-800 border-red-300';
			case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
			case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
			default: return 'bg-gray-100 text-gray-800 border-gray-300';
		}
	}
</script>

<div class="analysis-summary">
	<div class="flex flex-col w-full gap-2 mb-4">
		<h2 class="text-lg font-bold">Participant Journey Summary</h2>
	</div>

	<!-- Visit Statistics -->
	<div class="visit-statistics mb-6">
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

	<div class="summary-sections">
		<!-- Key Hurdles Section -->
		<div class="summary-section">
			<button 
				class="section-header"
				on:click={() => toggleSection('hurdles')}
				aria-expanded={expandedSections.hurdles}
			>
				<div class="section-header-content">
					<Users size={20} class="section-icon text-blue-600" />
					<h3 class="section-title">Key Hurdles by Persona</h3>
					<span class="section-count">{Object.keys(analysis.key_hurdles_by_persona).length} personas</span>
				</div>
				{#if expandedSections.hurdles}
					<ArrowDown size={16} class="chevron" />
				{:else}
					<ArrowRight size={16} class="chevron" />
				{/if}
			</button>

			{#if expandedSections.hurdles}
				<div class="section-content">
					{#each Object.entries(analysis.key_hurdles_by_persona) as [personaKey, persona]}
						<div class="persona-card">
							<h4 class="persona-name">{persona.persona_name}</h4>
							<div class="burden-grid">
								{#each persona.top_burden_areas.slice(0, 3) as hurdle}
									<div class="burden-item clickable-hurdle" on:click={() => handleHurdleClick(hurdle.hurdle)} on:keydown={(e) => e.key === 'Enter' && handleHurdleClick(hurdle.hurdle)} role="button" tabindex="0">
										<div class="burden-header">
											<span class="burden-name">{hurdle.hurdle}</span>
											<div class="burden-score {getBurdenStyling(hurdle.burden_score)}">
												{hurdle.burden_score}
											</div>
										</div>
										<p class="burden-description">{hurdle.description}</p>
										<div class="click-hint">Click to see participant quotes</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Dropout Risks Section -->
		<div class="summary-section">
			<button 
				class="section-header"
				on:click={() => toggleSection('dropoutRisks')}
				aria-expanded={expandedSections.dropoutRisks}
			>
				<div class="section-header-content">
					<WaveTriangle size={20} class="section-icon text-red-600" />
					<h3 class="section-title">Highest Dropout Risk Visits</h3>
					<span class="section-count">{analysis.highest_dropout_risk_visits.length} critical visits</span>
				</div>
				{#if expandedSections.dropoutRisks}
					<ArrowDown size={16} class="chevron" />
				{:else}
					<ArrowRight size={16} class="chevron" />
				{/if}
			</button>

			{#if expandedSections.dropoutRisks}
				<div class="section-content">
					{#each analysis.highest_dropout_risk_visits as visit}
						<div class="risk-card">
							<div class="risk-header">
								<div class="risk-info">
									<span class="visit-number">Visit {visit.visit_number}</span>
									<span class="persona-tag">{visit.persona}</span>
								</div>
								<div class="risk-badge {getRiskStyling(visit.dropout_likelihood)}">
									{getRiskLevel(visit.dropout_likelihood)}
								</div>
							</div>
							<div class="risk-drivers">
								<span class="drivers-label">Primary drivers:</span>
								{#each visit.primary_drivers as driver}
									<span class="driver-tag">{driver}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Key Interventions Section -->
		<div class="summary-section">
			<button 
				class="section-header"
				on:click={() => toggleSection('interventions')}
				aria-expanded={expandedSections.interventions}
			>
				<div class="section-header-content">
					<Target size={20} class="section-icon text-green-600" />
					<h3 class="section-title">Key Interventions</h3>
					<span class="section-count">{Object.keys(analysis.key_interventions_by_category).length} categories</span>
				</div>
				{#if expandedSections.interventions}
					<ArrowDown size={16} class="chevron" />
				{:else}
					<ArrowRight size={16} class="chevron" />
				{/if}
			</button>

			{#if expandedSections.interventions}
				<div class="section-content">
					{#each Object.entries(analysis.key_interventions_by_category) as [categoryKey, category]}
						<div class="intervention-category">
							<h4 class="category-name">{category.category_name}</h4>
							<div class="interventions-grid">
								{#each category.interventions.slice(0, 2) as intervention}
									<div class="intervention-card">
										<div class="intervention-header">
											<span class="intervention-name">{intervention.intervention}</span>
											<span class="impact-badge {getImpactStyling(intervention.impact_level)}">
												{intervention.impact_level}
											</span>
										</div>
										<p class="intervention-description">{intervention.description}</p>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Priority Areas Section -->
		<div class="summary-section">
			<button 
				class="section-header"
				on:click={() => toggleSection('priorities')}
				aria-expanded={expandedSections.priorities}
			>
				<div class="section-header-content">
					<TrendUp size={20} class="section-icon text-purple-600" />
					<h3 class="section-title">Priority Intervention Areas</h3>
					<span class="section-count">Top {analysis.priority_intervention_areas.length} priorities</span>
				</div>
				{#if expandedSections.priorities}
					<ArrowDown size={16} class="chevron" />
				{:else}
					<ArrowRight size={16} class="chevron" />
				{/if}
			</button>

			{#if expandedSections.priorities}
				<div class="section-content">
					{#each analysis.priority_intervention_areas as priority}
						<div class="priority-card">
							<div class="priority-header">
								<div class="priority-rank">#{priority.priority_rank}</div>
								<div class="priority-info">
									<h4 class="priority-name">{priority.intervention_area}</h4>
									<p class="priority-rationale">{priority.rationale}</p>
								</div>
							</div>
							<div class="immediate-actions">
								<span class="actions-label">Immediate actions:</span>
								<ul class="actions-list">
									{#each priority.immediate_actions.slice(0, 2) as action}
										<li class="action-item">{action}</li>
									{/each}
								</ul>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Quotes Drawer -->
<HurdleQuotesDrawer 
	bind:isOpen={isQuotesDrawerOpen}
	{selectedHurdle}
	quotes={selectedQuotes}
	on:close={closeQuotesDrawer}
/>

<style>
	.analysis-summary {
		width: 100%;
		padding-top: 1rem;
	}

	/* Visit Statistics */
	.visit-statistics {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		padding: 1rem;
		background: white;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.summary-header {
		margin-bottom: 1.5rem;
	}

	.summary-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}

	.summary-description {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0;
	}

	.summary-sections {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.summary-section {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		overflow: hidden;
	}

	.section-header {
		width: 100%;
		padding: 0.875rem 1rem;
		background: none;
		border: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.section-header:hover {
		background: #f8fafc;
	}

	.section-header-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.section-icon {
		flex-shrink: 0;
	}

	.section-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.section-count {
		font-size: 0.75rem;
		color: #64748b;
		background: #f1f5f9;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
	}

	.chevron {
		color: #64748b;
		flex-shrink: 0;
	}

	.section-content {
		padding: 0 1rem 1rem 1rem;
		border-top: 1px solid #f1f5f9;
	}

	/* Persona Cards */
	.persona-card {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 6px;
	}

	.persona-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.75rem 0;
	}

	.burden-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.burden-item {
		padding: 0.75rem;
		background: white;
		border-radius: 4px;
		border: 1px solid #e2e8f0;
	}

	.burden-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.burden-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: #1e293b;
		transition: color 0.2s ease;
	}

	.burden-score {
		font-size: 0.75rem;
		font-weight: 700;
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		min-width: 1.5rem;
		text-align: center;
	}

	.burden-description {
		font-size: 0.75rem;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	/* Risk Cards */
	.risk-card {
		margin-bottom: 1rem;
		padding: 1rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 6px;
	}

	.risk-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.risk-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.visit-number {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1e293b;
	}

	.persona-tag {
		font-size: 0.75rem;
		color: #64748b;
		background: white;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
	}

	.risk-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		border: 1px solid;
	}

	.risk-drivers {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.drivers-label {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 500;
	}

	.driver-tag {
		font-size: 0.7rem;
		background: white;
		color: #dc2626;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		border: 1px solid #fecaca;
	}

	/* Intervention Cards */
	.intervention-category {
		margin-bottom: 1.5rem;
	}

	.category-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.75rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.interventions-grid {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.intervention-card {
		padding: 0.75rem;
		background: #f0fdf4;
		border: 1px solid #bbf7d0;
		border-radius: 4px;
	}

	.intervention-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.intervention-name {
		font-size: 0.8rem;
		font-weight: 600;
		color: #1e293b;
	}

	.impact-badge {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		border: 1px solid;
	}

	.intervention-description {
		font-size: 0.75rem;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	/* Priority Cards */
	.priority-card {
		margin-bottom: 1rem;
		padding: 1rem;
		background: #faf5ff;
		border: 1px solid #e9d5ff;
		border-radius: 6px;
	}

	.priority-header {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.priority-rank {
		font-size: 1rem;
		font-weight: 700;
		color: #7c3aed;
		background: white;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.priority-info {
		flex: 1;
	}

	.priority-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.25rem 0;
	}

	.priority-rationale {
		font-size: 0.75rem;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	.immediate-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.actions-label {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 500;
	}

	.actions-list {
		margin: 0;
		padding-left: 1rem;
	}

	.action-item {
		font-size: 0.75rem;
		color: #1e293b;
		line-height: 1.4;
		margin-bottom: 0.25rem;
	}

	@media (max-width: 768px) {
		.analysis-summary {
			padding: 0.75rem;
		}

		.section-header {
			padding: 0.75rem;
		}

		.section-title {
			font-size: 0.875rem;
		}

		.burden-grid,
		.interventions-grid {
			gap: 0.5rem;
		}

		.risk-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}

	.clickable-hurdle {
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		border: 2px solid #e2e8f0;
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
	}

	.clickable-hurdle:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
		border-color: #3b82f6;
		background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%);
	}

	.clickable-hurdle:focus {
		outline: 3px solid #3b82f6;
		outline-offset: 2px;
	}

	.clickable-hurdle:active {
		transform: translateY(0px);
	}

	.click-hint {
		font-size: 0.75rem;
		color: #3b82f6;
		margin-top: 0.75rem;
		font-weight: 600;
		opacity: 0;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.click-hint::before {
		content: "👆";
		font-size: 0.875rem;
	}

	.clickable-hurdle:hover .click-hint {
		opacity: 1;
		transform: translateY(-2px);
	}

	.clickable-hurdle:hover .burden-name {
		color: #3b82f6;
	}
</style> 
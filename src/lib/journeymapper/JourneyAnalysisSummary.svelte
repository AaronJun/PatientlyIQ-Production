<script lang="ts">
	import { ArrowDown, ArrowRight, ArrowUpRight, WaveTriangle, Users, Target, TrendUp } from 'phosphor-svelte';
	import analysisData from '../../data/journeymap/journey_mapper_analysis_summary.json';
	import VisitSquares from './VisitSquares.svelte';
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
	<div class="section-header-lined flex flex-col gap-4 w-full">
		<h2 class="text-lg font-bold">Participant Journey Summary</h2>
	</div>
<div class="flex flex-col md:flex-row gap-16">
	<!-- Visit Statistics -->
	<div class="visit-statistics flex flex-col">
		<VisitSquares 
			label="Total Visits" 
			count={totalVisits} 
			color="#1f2937" 
			size="20px"
		/>
		<VisitSquares 
			label="Travel Required" 
			count={travelVisits} 
			totalCount={totalVisits}
			color="#dc2626" 
			size="18px"
		/>
		<VisitSquares 
			label="Invasive Procedures" 
			count={invasiveVisits} 
			totalCount={totalVisits}
			color="#ea580c" 
			size="18px"
		/>
		<VisitSquares 
			label="Surgical Procedures" 
			count={surgicalVisits} 
			totalCount={totalVisits}
			color="#7c2d12" 
			size="18px"
		/>
	</div>

	<div class="flex flex-col w-full">
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
				</div>
				<div class="section-count-container flex flex-row justify-end gap-16 w-1/5">
					<span class="section-count">{analysis.priority_intervention_areas.length} priorities</span>
				{#if expandedSections.priorities}
					<ArrowDown size={16} class="chevron" />
				{:else}
					<ArrowRight size={16} class="chevron" />
				{/if}
				</div>
			</button>

			{#if expandedSections.priorities}
				<div class="section-content">
					{#each analysis.priority_intervention_areas as priority}
							<div class="card-container flex flex-col w-full justify-between">
							<div class="flex flex-col gap-1 w-2/5">
							<h4 class="priority-name">{priority.intervention_area}</h4>
							<p class="priority-rationale">{priority.rationale}</p>
							</div>
							<div class="flex flex-col gap-1 w-3/5">
								<span class="actions-label text-semibold">Recommended Action</span>
								<ul class="actions-list flex flex-col gap-1">
									{#each priority.immediate_actions.slice(0, 2) as action}
										<li class="action-item flex flex-row gap-1 align-center"><ArrowRight size={16} class="text-green-600" />{action}</li>
									{/each}
								</ul>
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
				</div>
				<div class="section-count-container flex flex-row justify-end gap-16 w-1/5">
					<span class="section-count">{Object.keys(analysis.key_interventions_by_category).length} categories</span>
				{#if expandedSections.interventions}
					<ArrowDown size={16} class="chevron" />
				{:else}
					<ArrowRight size={16} class="chevron" />
				{/if}
				</div>
			</button>

			{#if expandedSections.interventions}
				<div class="section-content">
					{#each Object.entries(analysis.key_interventions_by_category) as [categoryKey, category]}
						<div class="intervention-category">
							<h4 class="category-name">{category.category_name}</h4>
							<div class="interventions-grid">
								{#each category.interventions.slice(0, 2) as intervention}
									<div class="card-container flex flex-col">
										<span class="intervention-name">{intervention.intervention}</span>
										<span class="intervention-impact">{intervention.impact_level}</span>
										<p class="intervention-description">{intervention.description}</p>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>


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
				</div>
				<div class="section-count-container flex flex-row justify-end gap-16 w-1/5">
				<span class="section-count">{Object.keys(analysis.key_hurdles_by_persona).length} personas</span>
				{#if expandedSections.hurdles}
					<ArrowDown size={16} class="chevron" />
				{:else}
					<ArrowRight size={16} class="chevron" />
				{/if}
				</div>
			</button>

			{#if expandedSections.hurdles}
				<div class="flex flex-row gap-4 w-full p-4">
					{#each Object.entries(analysis.key_hurdles_by_persona) as [personaKey, persona]}
						<div class="persona-card ring-1 ring-indigo-500 rounded-sm p-4">
							<h4 class="persona-name">{persona.persona_name}</h4>
							<div class="burden-grid">
								{#each persona.top_burden_areas.slice(0, 3) as hurdle}
									<div class="burden-item clickable-hurdle" on:click={() => handleHurdleClick(hurdle.hurdle)} on:keydown={(e) => e.key === 'Enter' && handleHurdleClick(hurdle.hurdle)} role="button" tabindex="0">
										<div class="burden-header">
											<span class="burden-name">{hurdle.hurdle}</span>
											<div class="burden-score {getBurdenStyling(hurdle.burden_score)}">
												{hurdle.burden_score}
											</div>
											<ArrowUpRight size={16} class="chevron" />
										</div>
										<p class="burden-description">{hurdle.description}</p>
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
				</div>
				<div class="section-count-container flex flex-row justify-end gap-16 w-1/5">
					<span class="section-count">{analysis.highest_dropout_risk_visits.length} critical visits</span>
					{#if expandedSections.dropoutRisks}
					<ArrowDown size={16} class="chevron" />
				{:else}
					<ArrowRight size={16} class="chevron" />
				{/if}
				</div>
			</button>

			{#if expandedSections.dropoutRisks}
				<div class="section-content">
					{#each analysis.highest_dropout_risk_visits as visit}
						<div class="card-container flex flex-col md:flex-row">
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
		padding: 1rem 2.25rem 1rem 1.725rem;
	}

	/* Visit Statistics */
	.visit-statistics {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
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
	}

	.summary-sections {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.summary-section {
		border-top: 0.725px solid #29293C;
		border-bottom: 0.725px solid #29293C;
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
		border-bottom: 1px solid #29293C;
		border-top: 1px solid #29293C;
		font-weight: 600;
	}

	.section-header-content {
		display: flex;
		flex-direction: row;
		justify-content: start;
		align-items: center;
		gap: 2rem;
	}

	.section-icon {
		flex-shrink: 0;
	}

	.section-title {
		font-size: 0.925rem;
		font-weight: 600;
		color: #1e293b;
	}

	.section-count {
		font-size: 0.8725rem;
		color: #1e293b;
		font-weight: 400;
	}

	.chevron {
		color: #64748b;
		flex-shrink: 0;
	}

	.section-content {
		padding: 2rem 1rem 1rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: top;
		gap: 1rem;
	}

	/* Persona Cards */
	.card-container {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
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

	.category-name {
		font-size: .925rem;
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
		font-size: 0.875rem;
		font-weight: 600;
		color: #1e293b;
	}


	.intervention-description {
		font-size: 0.7925rem;
		color: #29293C;
		margin: 0;
		line-height: 1.4;
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
		font-size: 0.925rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.25rem 0;
	}

	.priority-rationale {
		font-size: 0.875rem;
		color: #29293C;
		margin: 0;
		line-height: 1.4;
	}


	.actions-label {
		font-size: 0.875rem;
		color: #29293C;
		font-weight: 500;
	}

	.actions-list {
		margin: 0;
	}

	.action-item {
		font-size: 0.875rem;
		color: #1e293b;
		font-weight: 400;
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
		border: .5px solid #1e293b;
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
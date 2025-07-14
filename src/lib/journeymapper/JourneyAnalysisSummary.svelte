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

	<!-- Visit Statistics -->
	<div class="visit-statistics mb-8">
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

	<!-- Main Analysis Sections -->
	<div class="analysis-sections">
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
					<div class="cards-grid">
						{#each analysis.priority_intervention_areas as priority}
							<div class="analysis-card">
								<div class="card-header">
									<h4 class="card-title">{priority.intervention_area}</h4>
								</div>
								<div class="card-content">
									<div class="priority-info">
										<p class="priority-rationale">{priority.rationale}</p>
									</div>
									<div class="priority-actions">
										<span class="actions-label">Recommended Action</span>
										<ul class="actions-list">
											{#each priority.immediate_actions.slice(0, 2) as action}
												<li class="action-item"><ArrowRight size={16} class="text-green-600" />{action}</li>
											{/each}
										</ul>
									</div>
								</div>
							</div>
						{/each}
					</div>
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
					<div class="cards-grid">
						{#each Object.entries(analysis.key_interventions_by_category) as [categoryKey, category]}
							<div class="analysis-card">
								<div class="card-header">
									<h4 class="card-title">{category.category_name}</h4>
								</div>
								<div class="card-content">
									<div class="interventions-list">
										{#each category.interventions.slice(0, 2) as intervention}
											<div class="intervention-item">
												<span class="intervention-name">{intervention.intervention}</span>
												<span class="intervention-impact">{intervention.impact_level}</span>
												<p class="intervention-description">{intervention.description}</p>
											</div>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>
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
				<div class="section-content">
					<div class="cards-grid">
						{#each Object.entries(analysis.key_hurdles_by_persona) as [personaKey, persona]}
							<div class="analysis-card">
								<div class="card-header">
									<h4 class="card-title">{persona.persona_name}</h4>
								</div>
								<div class="card-content">
									<div class="hurdles-list">
										{#each persona.top_burden_areas.slice(0, 3) as hurdle}
											<div 
												class="hurdle-item clickable-hurdle" 
												on:click={() => handleHurdleClick(hurdle.hurdle)} 
												on:keydown={(e) => e.key === 'Enter' && handleHurdleClick(hurdle.hurdle)} 
												role="button" 
												tabindex="0"
											>
												<div class="hurdle-header">
													<span class="hurdle-name">{hurdle.hurdle}</span>
													<div class="hurdle-score {getBurdenStyling(hurdle.burden_score)}">
														{hurdle.burden_score}
													</div>
													<ArrowUpRight size={16} class="chevron" />
												</div>
												<p class="hurdle-description">{hurdle.description}</p>
											</div>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>
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
					<div class="cards-grid">
						<div class="analysis-card">
							<div class="card-header">
								<h4 class="card-title">High Risk Visits</h4>
							</div>
							<div class="card-content">
								<div class="risks-list">
									{#each analysis.highest_dropout_risk_visits as visit}
										<div class="risk-item">
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
							</div>
						</div>
					</div>
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
	}

	.visit-statistics {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	/* Analysis Sections */
	.analysis-sections {
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
		padding: 1.5rem 1rem;
	}

	/* Cards Grid Layout */
	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		width: 100%;
	}

	/* Card Styling */
	.analysis-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.analysis-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transform: translateY(-2px);
	}

	.card-header {
		padding: 1rem;
		background: #f8fafc;
		border-bottom: 1px solid #e2e8f0;
	}

	.card-title {
		font-size: 0.925rem;
		font-weight: 600;
		color: #1e293b;
	}

	.card-content {
		padding: 1rem;
	}

	/* Priority Items */
	.priority-info {
		margin-bottom: 1rem;
	}

	.priority-rationale {
		font-size: 0.8125rem;
		color: #64748b;
		line-height: 1.4;
	}

	.actions-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #1e293b;
		display: block;
		margin-bottom: 0.5rem;
	}

	.actions-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: #64748b;
	}

	/* Intervention Items */
	.interventions-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.intervention-item {
		padding: 0.875rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
	}

	.intervention-name {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #1e293b;
		display: block;
		margin-bottom: 0.25rem;
	}

	.intervention-impact {
		font-size: 0.75rem;
		color: #64748b;
		background: white;
		padding: 0.25rem 0.5rem;
		border-radius: 1rem;
		border: 1px solid #e2e8f0;
	}

	.intervention-description {
		font-size: 0.75rem;
		color: #64748b;
		line-height: 1.4;
		margin-top: 0.5rem;
	}

	/* Hurdle Items */
	.hurdles-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.hurdle-item {
		padding: 0.875rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		transition: all 0.2s ease;
	}

	.hurdle-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.hurdle-name {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #1e293b;
		flex: 1;
	}

	.hurdle-description {
		font-size: 0.75rem;
		color: #64748b;
		line-height: 1.4;
	}

	/* Risk Items */
	.risks-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.risk-item {
		padding: 0.875rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
	}

	.risk-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.risk-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.visit-number {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #1e293b;
	}

	.persona-tag {
		font-size: 0.75rem;
		color: #64748b;
		background: white;
		padding: 0.25rem 0.5rem;
		border-radius: 1rem;
		border: 1px solid #e2e8f0;
	}

	.risk-badge {
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 1rem;
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
		font-size: 0.75rem;
		background: white;
		padding: 0.25rem 0.5rem;
		border-radius: 1rem;
		border: 1px solid #fecaca;
		color: #dc2626;
	}

	/* Clickable Elements */
	.clickable-hurdle {
		cursor: pointer;
	}

	.clickable-hurdle:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	/* Responsive Adjustments */
	@media (max-width: 768px) {
		.cards-grid {
			grid-template-columns: 1fr;
		}

		.section-content {
			padding: 1rem 0.75rem;
		}
	}
</style> 
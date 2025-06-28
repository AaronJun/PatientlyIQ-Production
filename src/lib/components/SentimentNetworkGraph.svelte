<script lang="ts">
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import AssessmentNodes from './AssessmentNodes.svelte';
	import TermNodes from './TermNodes.svelte';
	import ConnectionLines from './ConnectionLines.svelte';
	import sentimentData from '../../data/journeymap/assessment_sentiment_terms.json';

	// Type definitions
	interface Term {
		term: string;
		frequency: number;
		assessment: string;
		angle: number;
		x: number;
		y: number;
	}

	interface Assessment {
		name: string;
		angle: number;
		x: number;
		y: number;
		terms: Term[];
	}

	interface Connection {
		assessment: Assessment;
		term: Term;
	}

	// Props
	export let width = 800;
	export let height = 800;

	// State
	let hoveredAssessment: string | null = null;
	let selectedAssessment: string | null = null;

	// Layout constants
	const centerX = width / 2;
	const centerY = height / 2;
	const innerRadius = 120; // Assessment circle radius
	const outerRadius = 300; // Terms circle radius
	const padding = 40;

	// Process data
	let assessments: Assessment[] = [];
	let terms: Term[] = [];
	let connections: Connection[] = [];
	let frequencyScale: (value: number) => number;

	$: {
		// Extract all unique terms and calculate positions
		const allTerms: Term[] = [];
		const assessmentList: Assessment[] = [];
		const connectionList: Connection[] = [];

		// Collect all terms
		Object.entries(sentimentData as Record<string, Array<{term: string, frequency: number}>>).forEach(([assessmentName, termData]) => {
			termData.forEach(({ term, frequency }) => {
				if (!allTerms.find(t => t.term === term)) {
					allTerms.push({
						term,
						frequency,
						assessment: assessmentName,
						angle: 0,
						x: 0,
						y: 0
					});
				}
			});
		});

		// Create frequency scale for term sizes
		const maxFreq = Math.max(...allTerms.map(t => t.frequency));
		const minFreq = Math.min(...allTerms.map(t => t.frequency));
		frequencyScale = scaleLinear()
			.domain([minFreq, maxFreq])
			.range([8, 25]); // Min and max circle radius

		// Position terms in outer circle
		allTerms.forEach((term, i) => {
			const angle = (i / allTerms.length) * 2 * Math.PI;
			term.angle = angle;
			term.x = centerX + Math.cos(angle) * outerRadius;
			term.y = centerY + Math.sin(angle) * outerRadius;
		});

		// Position assessments in inner circle
		Object.keys(sentimentData).forEach((assessmentName, i) => {
			const angle = (i / Object.keys(sentimentData).length) * 2 * Math.PI;
			const assessment: Assessment = {
				name: assessmentName,
				angle,
				x: centerX + Math.cos(angle) * innerRadius,
				y: centerY + Math.sin(angle) * innerRadius,
				terms: []
			};

			// Find related terms
			(sentimentData as Record<string, Array<{term: string, frequency: number}>>)[assessmentName].forEach(({ term, frequency }) => {
				const termNode = allTerms.find(t => t.term === term);
				if (termNode) {
					assessment.terms.push(termNode);
					connectionList.push({
						assessment,
						term: termNode
					});
				}
			});

			assessmentList.push(assessment);
		});

		assessments = assessmentList;
		terms = allTerms;
		connections = connectionList;
	}

	// Event handlers  
	function handleAssessmentHover(event: any) {
		hoveredAssessment = event.detail;
	}

	function handleAssessmentClick(event: any) {
		const assessmentName = event.detail;
		selectedAssessment = selectedAssessment === assessmentName ? null : assessmentName;
	}

	function handleBackgroundClick(event: MouseEvent) {
		// Only reset if clicking on the SVG background, not on any child elements
		if (event.target === event.currentTarget) {
			selectedAssessment = null;
			hoveredAssessment = null;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Reset on Escape key
		if (event.key === 'Escape') {
			selectedAssessment = null;
			hoveredAssessment = null;
		}
	}

	// Get filtered connections based on hover/selection
	$: activeConnections = connections.filter(conn => {
		const targetAssessment = hoveredAssessment || selectedAssessment;
		return targetAssessment ? conn.assessment.name === targetAssessment : false;
	});

	// Check if a term should be highlighted
	function isTermHighlighted(term: Term): boolean {
		const targetAssessment = hoveredAssessment || selectedAssessment;
		if (!targetAssessment) return false;
		return connections.some(conn => 
			conn.assessment.name === targetAssessment && conn.term.term === term.term
		);
	}
</script>

<div class="sentiment-network">
	<svg 
		{width} 
		{height} 
		class="network-svg"
		on:click={handleBackgroundClick}
		on:keydown={handleKeydown}
		tabindex="0"
		role="img"
		aria-label="Sentiment network graph showing relationships between assessments and sentiment terms"
	>
		<!-- Background circle indicators -->
		<circle 
			cx={centerX} 
			cy={centerY} 
			r={innerRadius} 
			fill="none" 
			stroke="#e5e7eb" 
			stroke-width="1"
			stroke-dasharray="1,5"
		/>
		<circle 
			cx={centerX} 
			cy={centerY} 
			r={outerRadius} 
			fill="none" 
			stroke="#e5e7eb" 
			stroke-width="1"
			stroke-dasharray="5,5"
		/>

		<!-- Connection lines -->
		<ConnectionLines 
			{connections}
			{activeConnections}
			{centerX}
			{centerY}
		/>

		<!-- Term nodes (outer circle) -->
		<TermNodes 
			{terms}
			{frequencyScale}
			{isTermHighlighted}
		/>

		<!-- Assessment nodes (inner circle) -->
		<AssessmentNodes 
			{assessments}
			{hoveredAssessment}
			{selectedAssessment}
			on:hover={handleAssessmentHover}
			on:click={handleAssessmentClick}
		/>

	</svg>

	<!-- Legend -->
	<div class="legend">
		<div class="legend-section">
			<h4>Assessment Types</h4>
			<div class="legend-item">
				<div class="legend-circle assessment-circle"></div>
				<span>Clinical Assessments</span>
			</div>
		</div>
		<div class="legend-section">
			<h4>Sentiment Terms</h4>
			<div class="legend-item">
				<div class="legend-circle term-circle-small"></div>
				<span>Low Frequency</span>
			</div>
			<div class="legend-item">
				<div class="legend-circle term-circle-large"></div>
				<span>High Frequency</span>
			</div>
		</div>
		<div class="legend-section">
			<p class="instruction">Hover or click on assessments to see related sentiment terms</p>
		</div>
	</div>
</div>

<style>
	.sentiment-network {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
		background: white;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
	}

	.network-svg {
		background: #fafbfc;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.center-label {
		font-size: 16px;
		font-weight: 600;
		fill: #374151;
		letter-spacing: 2px;
	}

	.center-sublabel {
		font-size: 11px;
		font-weight: 500;
		fill: #6b7280;
		letter-spacing: 1px;
	}

	.legend {
		display: flex;
		gap: 3rem;
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.legend-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.legend-section h4 {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: #6b7280;
	}

	.legend-circle {
		border-radius: 50%;
		flex-shrink: 0;
	}

	.assessment-circle {
		width: 16px;
		height: 16px;
		background: #3b82f6;
	}

	.term-circle-small {
		width: 8px;
		height: 8px;
		background: #ef4444;
	}

	.term-circle-large {
		width: 16px;
		height: 16px;
		background: #ef4444;
	}

	.instruction {
		margin: 0;
		font-size: 0.75rem;
		color: #9ca3af;
		font-style: italic;
		max-width: 200px;
	}

	.instruction-sub {
		margin: 0.25rem 0 0 0;
		font-size: 0.7rem;
		color: #d1d5db;
		font-style: italic;
		max-width: 200px;
	}

	@media (max-width: 768px) {
		.sentiment-network {
			padding: 1rem;
		}

		.legend {
			flex-direction: column;
			gap: 1rem;
		}
	}
</style> 
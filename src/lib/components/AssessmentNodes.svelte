<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Types
	interface Assessment {
		name: string;
		angle: number;
		x: number;
		y: number;
		terms: any[];
	}

	// Props
	export let assessments: Assessment[];
	export let hoveredAssessment: string | null;
	export let selectedAssessment: string | null;

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Constants
	const assessmentRadius = 25;

	// Utility functions
	function shortenAssessmentName(name: string): string {
		const maxLength = 12;
		if (name.length <= maxLength) return name;
		
		// Common abbreviations for clinical assessments
		const abbreviations: Record<string, string> = {
			'Physical and Neurologic Exam': 'Physical Exam',
			'Clinical Laboratory Tests': 'Lab Tests',
			'PK Blood Samples': 'PK Blood',
			'Pregnancy Test': 'Pregnancy',
			'Diary Training': 'Diary',
		};

		return abbreviations[name] || (name.length > maxLength ? name.substring(0, maxLength) + '...' : name);
	}

	function getAssessmentColor(assessmentName: string): string {
		if (!hoveredAssessment && !selectedAssessment) return '#3b82f6'; // Normal color when nothing selected
		const isActive = hoveredAssessment === assessmentName || selectedAssessment === assessmentName;
		return isActive ? '#1d4ed8' : '#94a3b8'; // Desaturated gray-blue for non-active
	}

	function getAssessmentStroke(assessmentName: string): string {
		const isActive = hoveredAssessment === assessmentName || selectedAssessment === assessmentName;
		return isActive ? '#1e40af' : 'white'; // darker stroke when active
	}

	function getAssessmentStrokeWidth(assessmentName: string): number {
		const isActive = hoveredAssessment === assessmentName || selectedAssessment === assessmentName;
		return isActive ? 3 : 2; // thicker stroke when active
	}

	function getAssessmentRadius(assessmentName: string): number {
		if (!hoveredAssessment && !selectedAssessment) return assessmentRadius; // Normal size when nothing selected
		const isActive = hoveredAssessment === assessmentName || selectedAssessment === assessmentName;
		return isActive ? assessmentRadius : assessmentRadius * 0.7; // Smaller when not active
	}

	function getAssessmentOpacity(assessmentName: string): number {
		if (!hoveredAssessment && !selectedAssessment) return 0.9; // Slightly dimmed when nothing selected
		const isActive = hoveredAssessment === assessmentName || selectedAssessment === assessmentName;
		return isActive ? 1 : 0.08; // Very dramatic dimming for non-active circles
	}

	// Event handlers
	function handleMouseEnter(assessmentName: string) {
		dispatch('hover', assessmentName);
	}

	function handleMouseLeave() {
		dispatch('hover', null);
	}

	function handleClick(assessmentName: string) {
		dispatch('click', assessmentName);
	}
</script>

{#each assessments as assessment}
	<g class="assessment-node" transform="translate({assessment.x}, {assessment.y})">
		<!-- Assessment circle -->
		<circle
			r={getAssessmentRadius(assessment.name)}
			fill={getAssessmentColor(assessment.name)}
			opacity={getAssessmentOpacity(assessment.name)}
			stroke={getAssessmentStroke(assessment.name)}
			stroke-width={getAssessmentStrokeWidth(assessment.name)}
			class="assessment-circle"
			class:active={hoveredAssessment === assessment.name || selectedAssessment === assessment.name}
			class:dimmed={(hoveredAssessment || selectedAssessment) && hoveredAssessment !== assessment.name && selectedAssessment !== assessment.name}
			on:mouseenter={() => handleMouseEnter(assessment.name)}
			on:mouseleave={handleMouseLeave}
			on:click={() => handleClick(assessment.name)}
			role="button"
			tabindex="0"
		/>

		<!-- Assessment label -->
		<text
			text-anchor="middle"
			dominant-baseline="middle"
			class="assessment-label"
			fill="white"
			font-size="9"
			font-weight="600"
			opacity={getAssessmentOpacity(assessment.name)}
			pointer-events="none"
		>
			{shortenAssessmentName(assessment.name)}
		</text>

		<!-- Hover tooltip -->
		{#if hoveredAssessment === assessment.name}
			<g class="tooltip" transform="translate(0, -{assessmentRadius + 10})">
				<rect
					x={-assessment.name.length * 2.5}
					y="-10"
					width={assessment.name.length * 5}
					height="20"
					fill="rgba(0,0,0,0.8)"
					rx="4"
				/>
				<text
					text-anchor="middle"
					dominant-baseline="middle"
					fill="white"
					font-size="10"
					font-weight="500"
				>
					{assessment.name}
				</text>
			</g>
		{/if}
	</g>
{/each}

<style>
	.assessment-circle {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.assessment-circle:hover {
		transform: scale(1.1);
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
	}

	.assessment-circle.active {
		transform: scale(1.15);
		filter: drop-shadow(0 6px 12px rgba(29, 78, 216, 0.4)) drop-shadow(0 0 20px rgba(29, 78, 216, 0.2));
		animation: glow 2s ease-in-out infinite alternate;
	}

	.assessment-circle.dimmed {
		transform: scale(0.85);
		filter: grayscale(0.7) brightness(0.8);
	}

	@keyframes glow {
		from {
			filter: drop-shadow(0 6px 12px rgba(29, 78, 216, 0.4)) drop-shadow(0 0 20px rgba(29, 78, 216, 0.2));
		}
		to {
			filter: drop-shadow(0 8px 16px rgba(29, 78, 216, 0.6)) drop-shadow(0 0 30px rgba(29, 78, 216, 0.3));
		}
	}

	.assessment-label {
		pointer-events: none;
		user-select: none;
	}

	.tooltip {
		pointer-events: none;
	}
</style> 
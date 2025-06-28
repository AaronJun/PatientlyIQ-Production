<script lang="ts">
	// Types
	interface Term {
		term: string;
		frequency: number;
		assessment: string;
		angle: number;
		x: number;
		y: number;
	}

	// Props
	export let terms: Term[];
	export let frequencyScale: (value: number) => number;
	export let isTermHighlighted: (term: Term) => boolean;

	// Utility functions
	function getTermColor(term: Term): string {
		// Color based on sentiment polarity (simplified for demo)
		const negativeTerms = ['painful', 'anxious', 'uncomfortable', 'embarrassing', 'invasive', 'triggering', 'confusing', 'overwhelming', 'exhausting', 'annoying'];
		const positiveTerms = ['necessary', 'thoughtful', 'reassuring', 'routine', 'standard', 'fast'];
		
		const highlighted = isTermHighlighted(term);
		const anyHighlighted = terms.some(t => isTermHighlighted(t));
		
		// Use desaturated colors when not highlighted but others are
		if (anyHighlighted && !highlighted) {
			return '#9ca3af'; // Desaturated gray for non-highlighted terms
		}
		
		if (negativeTerms.includes(term.term.toLowerCase())) {
			return '#ef4444'; // red for negative
		} else if (positiveTerms.includes(term.term.toLowerCase())) {
			return '#22c55e'; // green for positive
		} else {
			return '#f59e0b'; // amber for neutral
		}
	}

	function getTermOpacity(term: Term): number {
		const highlighted = isTermHighlighted(term);
		if (highlighted) return 1;
		
		// Check if any term is highlighted
		const anyHighlighted = terms.some(t => isTermHighlighted(t));
		return anyHighlighted ? 0.06 : 0.75; // Very dramatic dimming for non-highlighted circles
	}

	function getTermStroke(term: Term): string {
		return isTermHighlighted(term) ? '#1f2937' : 'white';
	}

	function getTermStrokeWidth(term: Term): number {
		return isTermHighlighted(term) ? 3 : 1;
	}

	function shouldShowLabel(term: Term): boolean {
		// Only show labels for highlighted terms or when nothing is highlighted
		const anyHighlighted = terms.some(t => isTermHighlighted(t));
		return !anyHighlighted || isTermHighlighted(term);
	}

	function getLabelOpacity(term: Term): number {
		const highlighted = isTermHighlighted(term);
		if (highlighted) return 1;
		
		const anyHighlighted = terms.some(t => isTermHighlighted(t));
		return anyHighlighted ? 0.05 : 0.7; // Much dimmer labels for non-highlighted terms
	}

	function getTextPosition(term: Term): { x: number, y: number } {
		const radius = frequencyScale(term.frequency) + 15;
		const labelX = term.x + Math.cos(term.angle) * radius;
		const labelY = term.y + Math.sin(term.angle) * radius;
		return { x: labelX, y: labelY };
	}

	function getTextAnchor(term: Term): string {
		const angle = term.angle;
		// Normalize angle to 0-2π
		const normalizedAngle = ((angle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
		
		if (normalizedAngle > Math.PI * 0.25 && normalizedAngle < Math.PI * 0.75) {
			return 'start'; // right side
		} else if (normalizedAngle > Math.PI * 1.25 && normalizedAngle < Math.PI * 1.75) {
			return 'end'; // left side
		} else {
			return 'middle'; // top/bottom
		}
	}

	function getTermRadius(term: Term): number {
		const baseRadius = frequencyScale(term.frequency);
		const highlighted = isTermHighlighted(term);
		const anyHighlighted = terms.some(t => isTermHighlighted(t));
		
		if (anyHighlighted && !highlighted) {
			return baseRadius * 0.6; // Much smaller when not highlighted
		}
		return baseRadius;
	}
</script>

{#each terms as term}
	<g class="term-node">
		<!-- Term circle -->
		<circle
			cx={term.x}
			cy={term.y}
			r={getTermRadius(term)}
			fill={getTermColor(term)}
			opacity={getTermOpacity(term)}
			stroke={getTermStroke(term)}
			stroke-width={getTermStrokeWidth(term)}
			class="term-circle"
			class:highlighted={isTermHighlighted(term)}
			class:dimmed={terms.some(t => isTermHighlighted(t)) && !isTermHighlighted(term)}
		/>

		<!-- Term label -->
		{#if shouldShowLabel(term)}
			{@const textPos = getTextPosition(term)}
			<text
				x={textPos.x}
				y={textPos.y}
				text-anchor={getTextAnchor(term)}
				dominant-baseline="middle"
				class="term-label"
				class:highlighted={isTermHighlighted(term)}
				fill={isTermHighlighted(term) ? '#1f2937' : '#6b7280'}
				font-size={isTermHighlighted(term) ? '12' : '9'}
				font-weight={isTermHighlighted(term) ? '700' : '500'}
				opacity={getLabelOpacity(term)}
			>
				{term.term}
			</text>
		{/if}

		<!-- Frequency indicator for highlighted terms -->
		{#if isTermHighlighted(term)}
			<text
				x={term.x}
				y={term.y}
				text-anchor="middle"
				dominant-baseline="middle"
				class="frequency-label"
				fill="white"
				font-size="8"
				font-weight="700"
			>
				{term.frequency}
			</text>
		{/if}
	</g>
{/each}

<style>
	.term-circle {
		transition: all 0.3s ease;
	}

	.term-circle.highlighted {
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 15px rgba(239, 68, 68, 0.4));
		animation: pulse 2.5s ease-in-out infinite;
		transform: scale(1.2);
	}

	.term-circle.dimmed {
		transform: scale(0.8);
		filter: grayscale(0.8) brightness(0.7);
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1.2);
			filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 15px rgba(239, 68, 68, 0.4));
		}
		50% {
			transform: scale(1.35);
			filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 25px rgba(239, 68, 68, 0.6));
		}
	}

	.term-label {
		pointer-events: none;
		user-select: none;
		transition: all 0.3s ease;
	}

	.term-label.highlighted {
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
	}

	.frequency-label {
		pointer-events: none;
		user-select: none;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
	}
</style> 
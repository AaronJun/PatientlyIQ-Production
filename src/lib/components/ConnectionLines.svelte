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
	export let connections: Connection[];
	export let activeConnections: Connection[];
	export let centerX: number;
	export let centerY: number;

	// Constants
	const assessmentRadius = 25;

	// Utility functions
	function getConnectionPath(connection: Connection): string {
		const { assessment, term } = connection;
		
		// Calculate the start point (edge of assessment circle)
		const assessmentAngle = Math.atan2(term.y - assessment.y, term.x - assessment.x);
		const startX = assessment.x + Math.cos(assessmentAngle) * assessmentRadius;
		const startY = assessment.y + Math.sin(assessmentAngle) * assessmentRadius;
		
		// End point is the term position
		const endX = term.x;
		const endY = term.y;
		
		// Create a curved path for better visual appeal
		const midX = (startX + endX) / 2;
		const midY = (startY + endY) / 2;
		
		// Add some curvature towards the center
		const centerVectorX = (centerX - midX) * 0.2;
		const centerVectorY = (centerY - midY) * 0.2;
		const controlX = midX + centerVectorX;
		const controlY = midY + centerVectorY;
		
		return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
	}

	function getConnectionColor(connection: Connection): string {
		// Color based on term sentiment
		const negativeTerms = ['painful', 'anxious', 'uncomfortable', 'embarrassing', 'invasive', 'triggering', 'confusing', 'overwhelming', 'exhausting', 'annoying'];
		const positiveTerms = ['necessary', 'thoughtful', 'reassuring', 'routine', 'standard', 'fast'];
		
		if (negativeTerms.includes(connection.term.term.toLowerCase())) {
			return '#ef4444'; // red for negative
		} else if (positiveTerms.includes(connection.term.term.toLowerCase())) {
			return '#22c55e'; // green for positive
		} else {
			return '#f59e0b'; // amber for neutral
		}
	}

	function getConnectionOpacity(connection: Connection): number {
		const isActive = activeConnections.includes(connection);
		if (activeConnections.length === 0) return 0.1; // Very faint when nothing is selected
		return isActive ? 0.9 : 0.02; // More dramatic contrast: highlight active, heavily dim others
	}

	function getConnectionWidth(connection: Connection): number {
		const isActive = activeConnections.includes(connection);
		const baseWidth = Math.max(1, connection.term.frequency / 2);
		return isActive ? Math.max(3, baseWidth * 2) : Math.max(1, baseWidth * 0.8); // Thicker when active, thinner when dimmed
	}

	function shouldShowConnection(connection: Connection): boolean {
		// Always show connections, but with varying opacity
		return true;
	}
</script>

<!-- All connection lines -->
<g class="connection-lines">
	{#each connections as connection}
		{#if shouldShowConnection(connection)}
			<path
				d={getConnectionPath(connection)}
				stroke={getConnectionColor(connection)}
				stroke-width={getConnectionWidth(connection)}
				stroke-opacity={getConnectionOpacity(connection)}
				fill="none"
				class="connection-line"
				class:active={activeConnections.includes(connection)}
			/>
		{/if}
	{/each}
</g>

<!-- Active connections overlay (drawn on top for better visibility) -->
{#if activeConnections.length > 0}
	<g class="active-connections">
		{#each activeConnections as connection}
			<path
				d={getConnectionPath(connection)}
				stroke={getConnectionColor(connection)}
				stroke-width={getConnectionWidth(connection)}
				stroke-opacity="0.9"
				fill="none"
				class="active-connection-line"
				stroke-dasharray="none"
			/>
		{/each}
	</g>
{/if}

<style>
	.connection-line {
		transition: all 0.3s ease;
		pointer-events: none;
	}

	.connection-line.active {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	.active-connection-line {
		pointer-events: none;
		animation: flow 3s linear infinite, glow-line 2s ease-in-out infinite alternate;
		filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
	}

	@keyframes flow {
		0% {
			stroke-dasharray: 0 10;
		}
		100% {
			stroke-dasharray: 10 0;
		}
	}

	@keyframes glow-line {
		from {
			filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
		}
		to {
			filter: drop-shadow(0 0 16px rgba(59, 130, 246, 0.8));
		}
	}

	.connection-lines {
		pointer-events: none;
	}

	.active-connections {
		pointer-events: none;
	}
</style> 
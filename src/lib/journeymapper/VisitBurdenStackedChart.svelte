<script lang="ts">
	import { Chart, Svg, Bars, Axis, Grid, Tooltip } from 'layerchart';
	import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
	import { stack, stackOrderNone, stackOffsetNone } from 'd3-shape';
	import * as d3 from 'd3';

	// Props for the chart
	export let totalVisits: number = 0;
	export let travelVisits: number = 0;
	export let invasiveVisits: number = 0;
	export let surgicalVisits: number = 0;
	export let selectedStudyId: string = 'STU-D-302';
	export let height: number = 300;
	export let width: number = 800;

	// Color scheme for different visit types
	const visitColors = {
		'Regular Visits': '#e5e7eb',
		'Travel Required': '#dc2626',
		'Invasive Procedures': '#ea580c',
		'Surgical Procedures': '#7c2d12'
	};

	// Process data for stacked bar chart
	$: chartData = processVisitData();

	function processVisitData() {
		const regularVisits = totalVisits - travelVisits - invasiveVisits - surgicalVisits;
		
		return [
			{
				'Regular Visits': Math.max(0, regularVisits),
				'Travel Required': travelVisits,
				'Invasive Procedures': invasiveVisits,
				'Surgical Procedures': surgicalVisits
			}
		];
	}

	// Create stacked data
	$: stackedData = stack()
		.keys(['Regular Visits', 'Travel Required', 'Invasive Procedures', 'Surgical Procedures'])
		.value((d: any, key) => d[key] || 0)
		.order(stackOrderNone)
		.offset(stackOffsetNone)(chartData);

	// Color scale
	$: colorScale = scaleOrdinal()
		.domain(['Regular Visits', 'Travel Required', 'Invasive Procedures', 'Surgical Procedures'])
		.range(['#e5e7eb', '#dc2626', '#ea580c', '#7c2d12']);

	// Y scale for horizontal layout
	$: yScale = scaleBand()
		.domain(['Visit Burden'])
		.range([0, height - 100])
		.padding(0.3);

	// X scale for values
	$: xScale = scaleLinear()
		.domain([0, totalVisits])
		.range([0, width - 120]);

	// Tooltip state
	let tooltipVisible = false;
	let tooltipContent = '';
	let tooltipX = 0;
	let tooltipY = 0;

	function showTooltip(event: MouseEvent, d: any) {
		const visitType = d.key;
		const value = d[1] - d[0];
		const percentage = totalVisits > 0 ? ((value / totalVisits) * 100).toFixed(1) : '0';
		
		tooltipContent = `
			<div class="font-medium text-sm">${visitType}</div>
			<div class="text-xs text-gray-600">${value} visits (${percentage}%)</div>
		`;
		
		tooltipVisible = true;
		tooltipX = event.clientX + 10;
		tooltipY = event.clientY - 10;
	}

	function hideTooltip() {
		tooltipVisible = false;
	}

	// Calculate burden score
	$: burdenScore = (() => {
		if (totalVisits === 0) return 0;
		
		const travelWeight = 5;
		const invasiveWeight = 3;
		const surgicalWeight = 7;
		
		const weightedSum = (travelVisits * travelWeight) + 
						   (invasiveVisits * invasiveWeight) + 
						   (surgicalVisits * surgicalWeight);
		
		return Math.round(weightedSum / totalVisits);
	})();

	// Get burden level styling
	function getBurdenLevel(score: number): { level: string; color: string; bgColor: string } {
		if (score >= 9) return { level: 'Very High', color: '#dc2626', bgColor: '#fef2f2' };
		if (score >= 7) return { level: 'High', color: '#ea580c', bgColor: '#fff7ed' };
		if (score >= 5) return { level: 'Moderate', color: '#d97706', bgColor: '#fffbeb' };
		return { level: 'Low', color: '#16a34a', bgColor: '#f0fdf4' };
	}

	$: burdenInfo = getBurdenLevel(burdenScore);
</script>

<div class="visit-burden-chart">
	<div class="chart-header">
		<h3 class="chart-title">Visit Burden Analysis</h3>
		<div class="burden-score">
			<span class="score-label">Overall Burden Score:</span>
			<span class="score-value" style="color: {burdenInfo.color}; background-color: {burdenInfo.bgColor}">
				{burdenScore} ({burdenInfo.level})
			</span>
		</div>
	</div>

	<div class="chart-container" style="width: {width}px; height: {height}px;">
		<Chart
			data={chartData}
			x="visitType"
			y="value"
			xScale={xScale}
			yScale={yScale}
			padding={{ top: 20, right: 40, bottom: 60, left: 120 }}
		>
			<Svg>
				<Grid 
					x 
					strokeDasharray="4,4" 
					stroke="#e5e7eb" 
					strokeOpacity={0.5}
				/>
				
				<!-- Stacked bars -->
				{#each stackedData as layer, layerIndex}
					{#each layer as segment, segmentIndex}
						<rect
							x={segment[0]}
							y={yScale('Visit Burden')}
							width={segment[1] - segment[0]}
							height={yScale.bandwidth()}
							fill={colorScale(layer.key as string) || '#6b7280'}
							stroke="#ffffff"
							stroke-width="1"
							cursor="pointer"
							on:mouseover={(e) => showTooltip(e, segment)}
							on:mouseout={hideTooltip}
						/>
					{/each}
				{/each}

				<!-- X-axis -->
				<Axis 
					x 
					placement="bottom"
					stroke="#6b7280" 
					strokeWidth={1}
					tickFormat={(d: any) => d}
				/>

				<!-- Y-axis -->
				<Axis 
					y 
					placement="left"
					stroke="#6b7280" 
					strokeWidth={1}
					tickFormat={() => ''}
				/>
			</Svg>
		</Chart>
	</div>

	<!-- Legend -->
	<div class="chart-legend">
		{#each Object.entries(visitColors) as [visitType, color]}
			<div class="legend-item">
				<div class="legend-color" style="background-color: {color}"></div>
				<span class="legend-label">{visitType}</span>
			</div>
		{/each}
	</div>

	<!-- Tooltip -->
	{#if tooltipVisible}
		<div 
			class="chart-tooltip"
			style="left: {tooltipX}px; top: {tooltipY}px"
		>
			{@html tooltipContent}
		</div>
	{/if}
</div>

<style>
	.visit-burden-chart {
		width: 100%;
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.chart-title {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
	}

	.burden-score {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.score-label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.score-value {
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		border: 1px solid;
	}

	.chart-container {
		position: relative;
		margin: 0 auto;
	}

	.chart-legend {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		border: 1px solid #e5e7eb;
	}

	.legend-label {
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: 500;
	}

	.chart-tooltip {
		position: fixed;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 0.75rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 1000;
		pointer-events: none;
		max-width: 200px;
	}

	@media (max-width: 768px) {
		.chart-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.chart-legend {
			gap: 1rem;
		}
	}
</style> 
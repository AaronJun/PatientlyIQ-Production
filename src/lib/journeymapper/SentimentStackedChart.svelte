<script lang="ts">
	import { Chart, Svg, Axis, Bars, Tooltip, Highlight } from 'layerchart';
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import { sum } from 'd3-array';

	// Props for the chart
	export let data: Array<{
		Topic: string;
		N: string;
		Per: string;
	}> = [];
	export let title: string = "CLINICAL TRIAL SENTIMENT";
	export let height: number = 300;

	// Sentiment mapping
	const sentimentMap = {
		'EN': 'Extremely Negative',
		'SN': 'Somewhat Negative', 
		'NEU': 'Neutral',
		'SP': 'Somewhat Positive',
		'EP': 'Extremely Positive'
	};

	// Color scheme matching the image
	const sentimentColors = {
		'EN': '#dc2626', // Dark red
		'SN': '#f87171', // Light red
		'NEU': '#93c5fd', // Light blue
		'SP': '#86efac', // Light green
		'EP': '#16a34a'  // Dark green
	};

	// Process data for LayerChart stacked format
	$: chartData = processSentimentData();
	$: colorKeys = data.map(d => d.Topic);
	$: keyColors = data.map(d => sentimentColors[d.Topic as keyof typeof sentimentColors] || '#6b7280');

	function processSentimentData() {
		if (!data || data.length === 0) return [];

		// Transform data into LayerChart format for stacked bars
		const transformedData = data.map(item => ({
			category: 'Clinical Trial Sentiment',
			sentiment: item.Topic,
			value: parseFloat(item.Per.replace('%', '')),
			percentage: item.Per
		}));

		return transformedData;
	}

	// Calculate total percentage
	$: totalPercentage = data.reduce((sum, item) => sum + parseFloat(item.Per.replace('%', '')), 0);

	// Custom tooltip format function
	function formatTooltipValue(value: number): string {
		return `${value.toFixed(1)}%`;
	}
</script>

<div class="sentiment-chart">
	<div class="chart-header">
		<h3 class="chart-title">{title}</h3>
		<div class="total-count">
			<span class="count-label">Total: {totalPercentage.toFixed(1)}%</span>
		</div>
	</div>

	<div class="chart-container" style="height: {height}px; width: 800px;">
		<Chart
			data={chartData}
			x="value"
			xNice
			y="category"
			yScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
			c="sentiment"
			cScale={scaleOrdinal()}
			cDomain={colorKeys}
			cRange={keyColors}
			padding={{ left: 120, bottom: 60, top: 20, right: 40 }}
			tooltip={{ mode: 'band' }}
			let:cScale
		>
			<Svg>
				<Axis placement="bottom" grid rule format="integer" />
				<Axis placement="left" rule />
				<Bars strokeWidth={2} stroke="#ffffff" />
			</Svg>

			<Tooltip.Root let:data>
				<Tooltip.List>
					{#each data.data as d}
						<Tooltip.Item
							label={sentimentMap[d.sentiment as keyof typeof sentimentMap] || d.sentiment}
							value={formatTooltipValue(d.value)}
							color={cScale?.(d.sentiment)}
							valueAlign="right"
						/>
					{/each}

					<Tooltip.Separator />

					<Tooltip.Item
						label="Total"
						value={sum([...data.data], (d) => d.value)}
						format="integer"
						valueAlign="right"
					/>
				</Tooltip.List>
			</Tooltip.Root>
		</Chart>
	</div>

	<!-- Legend -->
	<div class="chart-legend">
		{#each data as item}
			<div class="legend-item">
				<div class="legend-color" style="background-color: {sentimentColors[item.Topic as keyof typeof sentimentColors]}"></div>
				<span class="legend-label">{sentimentMap[item.Topic as keyof typeof sentimentMap]}</span>
				<span class="legend-percentage">{item.Per}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.sentiment-chart {
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
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.total-count {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.count-label {
		font-size: 0.875rem;
		color: #6b7280;
		font-weight: 500;
	}

	.chart-container {
		position: relative;
		width: 100%;
		margin: 0;
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
		border-radius: 50%;
		border: 1px solid #e5e7eb;
	}

	.legend-label {
		font-size: 0.75rem;
		color: #6b7280;
		font-weight: 500;
	}

	.legend-percentage {
		font-size: 0.75rem;
		color: #9ca3af;
		font-weight: 400;
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
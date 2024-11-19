<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import type { DiseaseSentimentStats } from '$lib/data/diseaseSentimentStats';

    export let data: DiseaseSentimentStats;
    
    let timeSeriesContainer: HTMLDivElement;
    let distributionContainer: HTMLDivElement;

    onMount(() => {
        createTimeSeries();
        createDistributionGraphs();
    });

    function createTimeSeries() {
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = timeSeriesContainer.clientWidth - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        const svg = d3.select(timeSeriesContainer)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales
        const x = d3.scaleTime()
            .domain([new Date(data.metrics.symptomBurden.timeRange.start, 0, 1), 
                    new Date(data.metrics.symptomBurden.timeRange.end, 0, 1)])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // Create lines
        const specificLine = d3.line()
            .x(d => x(new Date(d.year, 0, 1)))
            .y(d => y(d.value));

        const baselineLine = d3.line()
            .x(d => x(new Date(d.year, 0, 1)))
            .y(d => y(d.value));

        // Add lines
        svg.append('path')
            .datum(data.historicalData.symptomBurden.specific)
            .attr('fill', 'none')
            .attr('stroke', '#ff5151')
            .attr('stroke-width', 2)
            .attr('d', specificLine);

        svg.append('path')
            .datum(data.historicalData.symptomBurden.baseline)
            .attr('fill', 'none')
            .attr('stroke', '#666')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '4,4')
            .attr('d', baselineLine);

        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5));

        svg.append('g')
            .call(d3.axisLeft(y).ticks(5));
    }

    function createDistributionGraphs() {
        const margin = { top: 10, right: 10, bottom: 20, left: 10 };
        const width = distributionContainer.clientWidth - margin.left - margin.right;
        const height = 60 - margin.top - margin.bottom;

        const svg = d3.select(distributionContainer)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales for the distribution
        const x = d3.scaleLinear()
            .domain([0, data.metrics.symptomBurden.distribution.length - 1])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);

        // Create area generator
        const area = d3.area()
            .x((d, i) => x(i))
            .y0(height)
            .y1(d => y(d))
            .curve(d3.curveBasis);

        // Add distribution area
        svg.append('path')
            .datum(data.metrics.symptomBurden.distribution)
            .attr('fill', 'rgba(255, 81, 81, 0.2)')
            .attr('d', area);

        // Add marker line for current value
        svg.append('line')
            .attr('x1', x(data.metrics.symptomBurden.distribution.length * 0.8))
            .attr('x2', x(data.metrics.symptomBurden.distribution.length * 0.8))
            .attr('y1', 0)
            .attr('y2', height)
            .attr('stroke', '#ff5151')
            .attr('stroke-width', 2);
    }
</script>

<div class="comparison-container">
    <!-- Summary Stats -->
    <div class="metric-row">
        <div class="metric-card">
            <span class="metric-label">Symptom Burden Change</span>
            <span class="metric-value" class:negative={data.metrics.symptomBurden.specific.percentChange > 0}>
                {data.metrics.symptomBurden.specific.percentChange}%
            </span>
            <span class="comparison-text">vs {data.metrics.symptomBurden.baseline.percentChange}% baseline</span>
        </div>
        <div class="distribution-graph" bind:this={distributionContainer}>
            <span class="context-text">{data.metrics.symptomBurden.comparisonText}</span>
        </div>
    </div>

    <!-- Time Series -->
    <div class="time-series" bind:this={timeSeriesContainer}>
        <div class="legend">
            <div class="legend-item">
                <span class="legend-color specific"></span>
                <span>{data.specificDisease}</span>
            </div>
            <div class="legend-item">
                <span class="legend-color baseline"></span>
                <span>{data.categoryBaseline}</span>
            </div>
        </div>
    </div>
</div>

<style>
    .comparison-container {
        width: 100%;
        padding: 1rem;
    }

    .metric-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .metric-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .metric-label {
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.75rem;
        color: #666;
    }

    .metric-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #22c55e;
    }

    .metric-value.negative {
        color: #ff5151;
    }

    .comparison-text {
        font-size: 0.75rem;
        color: #666;
    }

    .distribution-graph {
        width: 200px;
        height: 60px;
    }

    .context-text {
        font-size: 0.75rem;
        color: #666;
    }

    .time-series {
        width: 100%;
        height: 200px;
        margin-top: 1rem;
    }

    .legend {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
    }

    .legend-color {
        width: 12px;
        height: 2px;
    }

    .legend-color.specific {
        background-color: #ff5151;
    }

    .legend-color.baseline {
        background-color: #666;
        border-top: 2px dashed #666;
    }
</style>

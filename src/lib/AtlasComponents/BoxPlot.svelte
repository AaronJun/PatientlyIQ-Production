<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let metricValues: number[];
    export let countryValue: number;
    export let countryName: string;

    let svg: SVGSVGElement;
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = 300 - margin.left - margin.right;
    const height = 80 - margin.top - margin.bottom;

    onMount(() => {
        drawBoxPlot();
    });

    function drawBoxPlot() {
        const data = metricValues.sort(d3.ascending);
        const q1 = d3.quantile(data, 0.25) || 0;
        const median = d3.quantile(data, 0.5) || 0;
        const q3 = d3.quantile(data, 0.75) || 0;
        const interQuantileRange = q3 - q1;
        const min = Math.max(q1 - 1.5 * interQuantileRange, d3.min(data) || 0);
        const max = Math.min(q3 + 1.5 * interQuantileRange, d3.max(data) || 0);

        const xScale = d3.scaleLinear()
            .domain([min, max])
            .range([0, width]);

        const boxPlot = d3.select(svg)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Draw the box
        boxPlot.append('rect')
            .attr('x', xScale(q1))
            .attr('width', xScale(q3) - xScale(q1))
            .attr('y', height / 4)
            .attr('height', height / 2)
            .attr('stroke', 'black')
            .attr('fill', '#69b3a2');

        // Draw the median line
        boxPlot.append('line')
            .attr('x1', xScale(median))
            .attr('x2', xScale(median))
            .attr('y1', height / 4)
            .attr('y2', 3 * height / 4)
            .attr('stroke', 'black')
            .attr('stroke-width', 2);

        // Draw the whiskers
        boxPlot.append('line')
            .attr('x1', xScale(min))
            .attr('x2', xScale(q1))
            .attr('y1', height / 2)
            .attr('y2', height / 2)
            .attr('stroke', 'black');

        boxPlot.append('line')
            .attr('x1', xScale(q3))
            .attr('x2', xScale(max))
            .attr('y1', height / 2)
            .attr('y2', height / 2)
            .attr('stroke', 'black');

        // Draw the country's value as a dot
        boxPlot.append('circle')
            .attr('cx', xScale(countryValue))
            .attr('cy', height / 2)
            .attr('r', 4)
            .attr('fill', 'red');

        // Add country name label
        boxPlot.append('text')
            .attr('x', xScale(countryValue))
            .attr('y', height + 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .text(countryName);

        // Draw the x-axis
        const xAxis = d3.axisBottom(xScale).ticks(5);
        boxPlot.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);
    }
</script>

<svg bind:this={svg} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}></svg>

<style>
    svg {
        display: block;
        margin: auto;
    }
</style>
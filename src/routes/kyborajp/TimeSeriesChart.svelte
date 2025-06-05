<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data: Array<{ date: string; value: number }>;
    
    let svg: SVGElement;
    
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    onMount(() => {
        createChart();
    });

    function createChart() {
        // Clear existing content
        d3.select(svg).selectAll("*").remove();

        const svgEl = d3.select(svg)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Parse dates
        const parseDate = d3.timeParse("%Y-%m");
        const dates = data.map(d => parseDate(d.date));

        // Scales
        const x = d3.scaleTime()
            .domain(d3.extent(dates))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // Line generator
        const line = d3.line()
            .x((d, i) => x(dates[i]))
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        // Add the line path
        g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#ff5151")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add dots
        g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d, i) => x(dates[i]))
            .attr("cy", d => y(d.value))
            .attr("r", 4)
            .attr("fill", "#ff5151")
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        // Add axes
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(3).tickFormat(d3.timeFormat("%b %Y")));

        g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"));
    }
</script>

<div class="timeseries-chart">
    <svg bind:this={svg}></svg>
</div>


<style>
    :global(.timeseries-chart text) {
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.65rem;
        fill: #7c7c7c;
    }

    :global(.timeseries-chart .line) {
        stroke: #ff5151;
    }

    :global(.timeseries-chart circle) {
        fill: #ff5151;
        stroke: white;
    }

    :global(.timeseries-chart .domain) {
        stroke: #e5e7eb;
    }

    :global(.timeseries-chart .tick line) {
        stroke: #e5e7eb;
    }
</style>
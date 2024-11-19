<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let width: number;
    export let height: number;
    export let margin: { top: number; right: number; bottom: number; left: number };
    export let xScale: d3.ScaleLinear<number, number>;
    export let yScale: d3.ScaleLinear<number, number>;
    
    let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    let container: d3.Selection<SVGGElement, unknown, null, undefined>;
    
    onMount(() => {
        const fullTimelineWidth = xScale.range()[1];
        
        svg = d3.select('#axes-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        container = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create a clip path
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom);
    
        // Y-axis (fixed)
        const yAxis = container.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale));
    
        // X-axis (scrollable)
        const xAxis = container.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format('d')));

        // Add dashed lines every 5 units on the y-axis up to 20
        const dashedLines = container.append('g')
            .attr('class', 'dashed-lines')
            .attr('clip-path', 'url(#clip)');

        const yTicks = yScale.ticks().filter(tick => tick % 1 === 0 && tick <= 20);

        dashedLines.selectAll('.dashed-line')
            .data(yTicks)
            .enter()
            .append('line')
            .attr('class', 'dashed-line')
            .attr('x1', 0)
            .attr('x2', fullTimelineWidth)
            .attr('y1', d => yScale(d))
            .attr('y2', d => yScale(d))
            .attr('stroke-dasharray', '1,4,1,2');
    });
</script>

<div id="axes-container"></div>

<style>
    #axes-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow-x: auto;
        overflow-y: hidden;
    }

    :global(.y-axis) {
        position: sticky;
        left: 0;
        z-index: 1;
    }

    :global(.x-axis) {
        position: relative;
    }

    :global(.dashed-line) {
        pointer-events: none;
    }

    :global(svg) {
        display: block;
    }
</style>
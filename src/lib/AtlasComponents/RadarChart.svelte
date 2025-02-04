<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data: number[];
    export let labels: string[];
    export let color: string = '#FF7F00';
    export let size: number = 100;

    let svg: SVGSVGElement;

    $: if (svg && data && labels) {
        drawChart();
    }

    function drawChart() {
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const width = size - margin.left - margin.right;
        const height = size - margin.top - margin.bottom;
        const radius = Math.min(width, height) / 2;

        // Clear previous content
        d3.select(svg).selectAll('*').remove();

        const svgEl = d3.select(svg)
            .attr('width', size)
            .attr('height', size);

        const g = svgEl.append('g')
            .attr('transform', `translate(${size/2},${size/2})`);

        // Scale for radius
        const rScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, radius]);

        // Scale for angles
        const aScale = d3.scalePoint()
            .domain(labels)
            .range([0, 2 * Math.PI]);

        // Create web lines
        const webLines = [20, 40, 60, 80, 100];
        webLines.forEach(level => {
            const r = rScale(level);
            const points = labels.map((_, i) => {
                const angle = (i * 2 * Math.PI) / labels.length;
                return [r * Math.sin(angle), r * Math.cos(angle)];
            });

            g.append('polygon')
                .attr('points', points.map(p => p.join(',')).join(' '))
                .attr('fill', 'none')
                .attr('stroke', '#ddd')
                .attr('stroke-width', 0.5);
        });

        // Create axis lines
        labels.forEach((_, i) => {
            const angle = (i * 2 * Math.PI) / labels.length;
            const lineEnd = [radius * Math.sin(angle), radius * Math.cos(angle)];
            
            g.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', lineEnd[0])
                .attr('y2', lineEnd[1])
                .attr('stroke', '#ddd')
                .attr('stroke-width', 0.5);
        });

        // Create the data path
        const points = data.map((d, i) => {
            const r = rScale(d);
            const angle = (i * 2 * Math.PI) / data.length;
            return [r * Math.sin(angle), r * Math.cos(angle)];
        });

        // Draw data polygon
        g.append('polygon')
            .attr('points', points.map(p => p.join(',')).join(' '))
            .attr('fill', color)
            .attr('fill-opacity', 0.2)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);

        // Add data points
        points.forEach(([x, y], i) => {
            g.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 2)
                .attr('fill', color);
        });

        // Add labels
        labels.forEach((label, i) => {
            const angle = (i * 2 * Math.PI) / labels.length;
            const x = (radius + 10) * Math.sin(angle);
            const y = (radius + 10) * Math.cos(angle);
            
            g.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '8px')
                .attr('fill', '#666')
                .text(label);
        });
    }
</script>

<div class="radar-chart">
    <svg 
        bind:this={svg}
        viewBox="0 0 {size} {size}"
        preserveAspectRatio="xMidYMid meet"
    ></svg>
</div>

<style>
    .radar-chart {
        width: 100%;
        height: 100%;
    }

    svg {
        width: 100%;
        height: 100%;
    }
</style>
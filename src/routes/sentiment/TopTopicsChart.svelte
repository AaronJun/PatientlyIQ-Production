<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data: Array<{topic: string, score: number}>;
    
    let svg: SVGElement;
    let container: HTMLDivElement;
    let width: number;
    const height = 200;
    const margin = { top: 20, right: 90, bottom: 20, left: 20 };

    onMount(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                width = entry.contentRect.width;
                if (width && height) createChart();
            }
        });
        
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    });

    function createChart() {
        d3.select(svg).selectAll("*").remove();

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const scoreExtent = d3.extent(data, d => d.score) as [number, number];
        const radiusScale = d3.scaleLinear()
            .domain(scoreExtent)
            .range([30, 50]);

        const colorScale = d3.scaleLinear<string>()
            .domain(scoreExtent)
            .range(['#98FB98', '#2E7D32']);

        const simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(chartWidth / 2).strength(0.05))
            .force('y', d3.forceY(chartHeight / 2).strength(0.05))
            .force('collide', d3.forceCollide().radius(d => radiusScale(d.score)))
            .stop();

        for (let i = 0; i < 200; i++) simulation.tick();

        const svgEl = d3.select(svg)
            .attr("width", width)
            .attr("height", height);

        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const bubbles = g.selectAll("g.bubble")
            .data(data)
            .join("g")
            .attr("class", "bubble")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        bubbles.append("circle")
            .attr("r", d => radiusScale(d.score))
            .attr("fill", d => colorScale(d.score))
            .attr("opacity", 0.8);

        // Add connecting lines and labels
        bubbles.each(function(d) {
            const bubble = d3.select(this);
            const radius = radiusScale(d.score);
            const angle = d.x > chartWidth / 2 ? 0 : Math.PI;
            
            const startX = radius * Math.cos(angle);
            const startY = radius * Math.sin(angle);
            
            const endX = d.x > chartWidth / 2 ? 60 : -60;
            const midX = (startX + endX) / 2;
            
            // Line
            bubble.append("path")
                .attr("d", `M${startX},${startY} Q${midX},${startY} ${endX},${startY}`)
                .attr("fill", "none")
                .attr("stroke", "#666")
                .attr("stroke-width", 0.5)
                .attr("class", "dark:stroke-gray-400");

            // Label group
            const label = bubble.append("g")
                .attr("transform", `translate(${endX + (d.x > chartWidth / 2 ? 5 : -5)},${startY})`);

            // Topic text
            label.append("text")
                .attr("text-anchor", d.x > chartWidth / 2 ? "start" : "end")
                .attr("dy", "-.625em")
                .attr("fill", "#666")
                .attr("class", "dark:fill-gray-300")
                .style("font-size", ".825rem")
                .style("font-family", "IBM Plex Mono")
                .text(d.topic);

            // Score text
            label.append("text")
                .attr("text-anchor", d.x > chartWidth / 2 ? "start" : "end")
                .attr("dy", "-1.45em")
                .attr("fill", "#4CAF50")
                .style("font-size", "1.25rem")
                .style("font-weight", "bold")
                .text(`${d.score}%`);
        });
    }

    $: {
        if (data && width && height) {
            createChart();
        }
    }
</script>

<div class="chart-container" bind:this={container}>
    <svg bind:this={svg}></svg>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 200px;
        position: relative;
    }
</style>
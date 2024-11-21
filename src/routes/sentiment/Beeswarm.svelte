<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data: {
        positive: number;
        negative: number;
        neutral: number;
        mixed: number;
    };

    let svg: SVGElement;
    
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const height = 220;
    let width = 1500;

    // Transform the data into a format suitable for the beeswarm
    $: points = [
        ...Array(Math.round(data.positive)).fill({ sentiment: 'positive', value: Math.random() }),
        ...Array(Math.round(data.negative)).fill({ sentiment: 'negative', value: Math.random() }),
        ...Array(Math.round(data.neutral)).fill({ sentiment: 'neutral', value: Math.random() }),
        ...Array(Math.round(data.mixed)).fill({ sentiment: 'mixed', value: Math.random() })
    ].map((d, i) => ({
        ...d,
        id: i,
        value: d.value * 100 // Scale to percentage
    }));

    const colors = {
        positive: '#4CAF50',
        negative: '#ff5151',
        neutral: '#9E9E9E',
        mixed: '#FFC107'
    };

    $: if (svg && points) {
        createBeeswarm();
    }

    function createBeeswarm() {
        const svgEl = d3.select(svg);
        svgEl.selectAll("*").remove();

        width = svg.getBoundingClientRect().width;

        const x = d3.scaleLinear()
            .domain([0, 100])
            .range([margin.left, width - margin.right]);

        // Create simulation
        const simulation = d3.forceSimulation(points)
            .force("x", d3.forceX(d => x(d.value)).strength(1))
            .force("y", d3.forceY(height / 2).strength(0.1))
            .force("collide", d3.forceCollide(4))
            .stop();

        // Run simulation
        for (let i = 0; i < 120; ++i) simulation.tick();

        // Draw points
        const g = svgEl.append("g");

        // Add axis
        const xAxis = d3.axisBottom(x)
            .ticks(5)
            .tickFormat(d => d + "%");

        g.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(xAxis)
            .style("font-family", "IBM Plex Mono")
            .style("font-size", "10px");

        // Add grid lines
        g.append("g")
            .attr("class", "grid")
            .selectAll("line")
            .data(x.ticks(5))
            .enter()
            .append("line")
            .attr("x1", d => x(d))
            .attr("x2", d => x(d))
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom)
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "2,2");

        // Add points
        g.selectAll("circle")
            .data(points)
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 3)
            .attr("fill", d => colors[d.sentiment])
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        // Add labels
        const sentiments = ['negative', 'neutral', 'positive', 'mixed'];
        const labelG = svgEl.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        sentiments.forEach((sentiment, i) => {
            const label = labelG.append("g")
                .attr("transform", `translate(${i * 120}, 0)`);

            label.append("circle")
                .attr("r", 3)
                .attr("fill", colors[sentiment]);

            label.append("text")
                .attr("x", 8)
                .attr("y", 4)
                .text(sentiment.charAt(0).toUpperCase() + sentiment.slice(1))
                .attr("font-family", "IBM Plex Mono")
                .attr("font-size", "10px")
                .attr("fill", "currentColor");
        });
    }
</script>

<div class="beeswarm-container">
    <svg bind:this={svg} {height}></svg>
</div>

<style>
    .beeswarm-container {
        width: 100%;
        margin: 1rem 0;
    }

    :global(.dark) .beeswarm-container :global(text) {
        fill: #e5e7eb;
    }
</style>
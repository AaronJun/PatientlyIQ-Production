<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import cloud from 'd3-cloud';

    export let data = [];
    export let width = 300;
    export let height = 200;

    const SENTIMENT_COLORS = {
        1: "#8B0000",  // Entirely Negative
        2: "#CD5C5C",  // Somewhat Negative
        3: "#FFB54F",  // Neutral
        4: "#90EE90",  // Somewhat Positive
        5: "#228B22"   // Entirely Positive
    };

    let svg;
    let container;

    $: if (container && data) {
        renderWordCloud();
    }

    function renderWordCloud() {
        // Clear existing content
        d3.select(svg).selectAll("*").remove();

        const layout = cloud()
            .size([width, height])
            .words(data.map(d => ({
                text: d.text,
                size: Math.sqrt(d.value) * 4 + 10,  // Scale the font size
                sentiment: d.sentiment || 3  // Default to neutral if not specified
            })))
            .padding(3)
            .rotate(() => 0)  // No rotation for better readability
            .fontSize(d => d.size)
            .on("end", draw);

        layout.start();
    }

    function draw(words) {
        const svg = d3.select(container)
            .selectAll("svg")
            .data([null])
            .join("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .style("font-family", "serif")
            .style("background", "transparent");

        const g = svg.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        g.selectAll("text")
            .data(words)
            .join("text")
            .style("fill", d => SENTIMENT_COLORS[d.sentiment])
            .attr("text-anchor", "middle")
            .attr("font-size", d => `${d.size}px`)
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .text(d => d.text)
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1);
    }
</script>

<div bind:this={container} class="word-cloud-container">
    <svg 
        bind:this={svg}
        width={width} 
        height={height}
        viewBox="0 0 {width} {height}"
    ></svg>
</div>

<style>
    .word-cloud-container {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    svg {
        max-width: 100%;
        height: auto;
    }
</style>
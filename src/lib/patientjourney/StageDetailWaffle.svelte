<!-- StageDetailWaffle.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let stageName: string;
    export let sentiments: {[key: string]: number};
    export let stageColor: string = "#4A5568";
    export let width = 450;

    let svg;
    let containerRef;
    let hasAnimated = false;
    let height: number;
    const cellSize = 5.25;
    const cellPadding = 1;
    const labelHeight = 30;
    const gridWidth = 50;
    const legendHeight = 30;
    const animationDuration = 800;

    const colors = {
        "Entirely Negative": "#8B0000",
        "Somewhat Negative": "#CD5C5C",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#90EE90",
        "Entirely Positive": "#228B22"
    };

    function getMaxSquares() {
        return Object.values(sentiments).reduce((sum, value) => sum + value, 0);
    }

    function calculateHeight() {
        const maxSquares = getMaxSquares();
        const rows = Math.ceil(maxSquares / gridWidth);
        return rows * (cellSize + cellPadding) + labelHeight + legendHeight + 20;
    }

    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasAnimated) {
                        hasAnimated = true;
                        height = calculateHeight();
                        createVisualization(true);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.2
            }
        );

        if (containerRef) {
            observer.observe(containerRef);
        }

        height = calculateHeight();
        createVisualization(false);

        return () => {
            if (containerRef) observer.unobserve(containerRef);
        };
    });

    function createVisualization(animate = false) {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [0, 0, width, height]);

        const stageWidth = gridWidth * (cellSize + cellPadding);
        const startX = (width - stageWidth) / 2;

        const stageGroup = svgElement.append("g")
            .attr("transform", `translate(${startX}, ${labelHeight})`);

        let squareCount = 0;
        const maxSquares = getMaxSquares();
        const totalRows = Math.ceil(maxSquares / gridWidth);

        Object.entries(sentiments).forEach(([sentiment, count]) => {
            for (let i = 0; i < count; i++) {
                const col = squareCount % gridWidth;
                const row = Math.floor(squareCount / gridWidth);
                const yPosition = (totalRows - 1 - row) * (cellSize + cellPadding);
                const finalX = col * (cellSize + cellPadding);
                const startY = animate ? -50 : yPosition;

                const square = stageGroup.append("rect")
                    .attr("x", finalX)
                    .attr("y", startY)
                    .attr("width", cellSize)
                    .attr("height", cellSize)
                    .attr("fill", colors[sentiment])
                    .style("opacity", animate ? 0 : 1);

                if (animate) {
                    square.transition()
                        .delay((col * 10) + ((totalRows - row) * 10))
                        .duration(animationDuration)
                        .ease(d3.easeBounceOut)
                        .attr("y", yPosition)
                        .style("opacity", 1);
                }

                square
                    .on("mouseenter", (event) => {
                        showTooltip(event, `${sentiment}: ${count}`);
                    })
                    .on("mouseleave", hideTooltip);

                squareCount++;
            }
        });

        // Add total count
        const total = Object.values(sentiments).reduce((a, b) => a + b, 0);
        stageGroup.append("text")
            .attr("x", stageWidth)
            .attr("y", totalRows * (cellSize + cellPadding)*1.525)
            .attr("text-anchor", "end")
            .attr("fill", '#fff')
            .attr("font-size", "7.625px")
            .text(total);
    }

    function showTooltip(event, content) {
        const tooltip = d3.select("body").selectAll(".stage-waffle-tooltip").data([null]);
        
        tooltip.enter()
            .append("div")
            .attr("class", "stage-waffle-tooltip")
            .merge(tooltip)
            .style("visibility", "visible")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .text(content);
    }

    function hideTooltip() {
        d3.selectAll(".stage-waffle-tooltip").style("visibility", "hidden");
    }
</script>

<div class="relative" bind:this={containerRef}>
    <div class="chart-container">
        <svg bind:this={svg}></svg>
    </div>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: start;
        justify-content: center;
    }
    
    svg {
        width: 100%;
        height: 100%;
        margin: 0 auto;
    }

    :global(.stage-waffle-tooltip) {
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 9999;
        visibility: hidden;
    }
</style>
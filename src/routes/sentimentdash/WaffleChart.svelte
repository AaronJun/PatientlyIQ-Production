<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data = [];
    export let stages = ["Initial Discovery", "Initial Planning", "Day-to-Day Management", "New Treatment", "Long-Term Planning"];
    export let categories = ["Entirely Negative", "Somewhat Negative", "Neutral", "Somewhat Positive", "Entirely Positive"];
    
    let svg;
    let width = 1250;
    let height = 1200;
    let cellSize = 16;
    let cellPadding = 2;
    let groupPadding = 120;
    let categoryPadding = 60;
    let labelHeight = 40;
    
    const gridWidth = 5;

    const categoryColors = {
        "Entirely Negative": "#AC0003",
        "Somewhat Negative": "#FF676A",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#59AA49",
        "Entirely Positive": "#083607"
    };

    onMount(() => {
        if (data.length > 0) {
            createVisualization();
        }
    });

    function createVisualization() {
        // Clear existing visualization
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [0, 0, width, height]);

        // Calculate heights for each stage
        const stageHeights = data.map(stageData => {
            const maxSquares = Math.max(...Object.values(stageData));
            return Math.ceil(maxSquares / gridWidth) * (cellSize + cellPadding);
        });

        stages.forEach((stage, stageIndex) => {
            const yOffset = stageIndex === 0 ? labelHeight : 
                labelHeight + stageHeights.slice(0, stageIndex).reduce((a, b) => a + b, 0) + (stageIndex * groupPadding);

            const stageGroup = svgElement.append("g")
                .attr("transform", `translate(0, ${yOffset})`);

            // Add stage label
            stageGroup.append("text")
                .attr("x", 0)
                .attr("y", -10)
                .attr("fill", "#6D635B")
                .attr("font-size", "14px")
                .attr("font-weight", "600")
                .text(stage);

            // Calculate this stage's max height
            const stageData = data[stageIndex];
            const maxSquares = Math.max(...Object.values(stageData));
            const maxRows = Math.ceil(maxSquares / gridWidth);

            // Create category columns
            categories.forEach((category, categoryIndex) => {
                const value = stageData[category];
                const xOffset = categoryIndex * (gridWidth * (cellSize + cellPadding) + categoryPadding);

                const categoryGroup = stageGroup.append("g")
                    .attr("transform", `translate(${xOffset}, 0)`);

                // Add category label (only for first stage)
                if (stageIndex === 0) {
                    categoryGroup.append("text")
                        .attr("x", (gridWidth * (cellSize + cellPadding)) / 2)
                        .attr("y", -25)
                        .attr("text-anchor", "middle")
                        .attr("fill", "#6D635B")
                        .attr("font-size", "12px")
                        .text(category);
                }

                // Create squares
                for (let i = 0; i < value; i++) {
                    const col = i % gridWidth;
                    const row = Math.floor(i / gridWidth);
                    const yPosition = (maxRows - 1 - row) * (cellSize + cellPadding);

                    categoryGroup.append("rect")
                        .attr("x", col * (cellSize + cellPadding))
                        .attr("y", yPosition)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", categoryColors[category])
                        .attr("rx", 2)
                        .attr("ry", 2)
                        .append("title")
                        .text(`${category}: ${value}`);
                }

                // Add value label
                categoryGroup.append("text")
                    .attr("x", (gridWidth * (cellSize + cellPadding)) / 2)
                    .attr("y", maxRows * (cellSize + cellPadding) + 15)
                    .attr("text-anchor", "middle")
                    .attr("fill", "#6D635B")
                    .attr("font-size", "12px")
                    .text(value);
            });
        });
    }
</script>

<div class="chart-container">
    <svg bind:this={svg}></svg>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 100%;
        min-height: 600px;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }
</style>
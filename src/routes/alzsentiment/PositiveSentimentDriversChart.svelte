<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { positiveSentimentData } from './positiveSentimentData';

    export let data = positiveSentimentData.data;
    export let stages = positiveSentimentData.stages;
    export let categories = positiveSentimentData.categories;
    
    let svg;
    let width = 1250; // Updated to match WaffleStages
    let height = 800;
    let cellSize = 24;
    let cellPadding = 2;
    let stageSpacing = 90; // Updated to match WaffleStages
    let labelHeight = 40;
    
    const gridWidth = 5;
    let hoveredCategory = null;
    let hoveredStage = null;
    let selectedStage = null;
    let selectedCategory = null;

    const categoryColors = {
        "Treatment Hope": "#4CAF50",
        "Support System": "#2196F3",
        "Care Access": "#A306C9",
        "Daily Coping": "#FA8E57",
        "Future Outlook": "#154D1F"
    };

    onMount(() => {
        if (data.length > 0) {
            createVisualization();
        }
    });

    function createVisualization() {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [-120, 0, width, height]);
            
        // Calculate heights and widths
        const stageHeights = data.map(stageData => {
            const totalSquares = Object.values(stageData).reduce((a, b) => a + b, 0);
            return Math.ceil(totalSquares / gridWidth);
        });
        const maxRows = Math.max(...stageHeights);
        const stageWidth = gridWidth * (cellSize + cellPadding);

        // Calculate total N across all stages
        const totalN = data.reduce((sum, stageData) => {
            return sum + Object.values(stageData).reduce((a, b) => a + b, 0);
        }, 0);

        // Add total N label at the top
        svgElement.append("text")
            .attr("x", width / 1.625)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#6D635B")
            .attr("font-family", "IBM Plex mono")
            .attr("font-size", "8px")
            .attr("font-weight", "600")
            .text(`Total = ${totalN}`);

        // Create legend with vertical arrangement
        const legendGroup = svgElement.append("g")
            .attr("transform", `translate(${width - 100}, 10)`);

        Object.entries(categoryColors).forEach(([category, color], i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(0, ${i * 20})`)
                .style("cursor", "pointer")
                .on("mouseenter", () => {
                    hoveredCategory = category;
                    updateHighlights();
                })
                .on("mouseleave", () => {
                    hoveredCategory = null;
                    updateHighlights();
                });

            legendItem.append("rect")
                .attr("width", 8)
                .attr("height", 8)
                .attr("rx", 2)
                .attr("fill", color);

            legendItem.append("text")
                .attr("x", 12)
                .attr("y", 14)
                .attr("fill", "#6D635B")
                .attr("font-size", "12px")
                .text(category);
        });

        // Create visualization groups for each stage
        stages.forEach((stage, stageIndex) => {
            const stageData = data[stageIndex];
            const xOffset = stageIndex * (stageWidth + stageSpacing);
            
            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

            let squareCount = 0;
            categories.forEach(category => {
                const value = stageData[category] || 0;
                
                for (let i = 0; i < value; i++) {
                    const col = squareCount % gridWidth;
                    const row = Math.floor(squareCount / gridWidth);
                    const yPosition = (maxRows - 1 - row) * (cellSize + cellPadding);
                    
                    stageGroup.append("rect")
                        .attr("class", `category-${category.replace(/\s+/g, '-')}`)
                        .attr("x", col * (cellSize + cellPadding))
                        .attr("y", yPosition)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", categoryColors[category])
                        .attr("rx", 2)
                        .attr("ry", 2)
                        .style("opacity", 0.9)
                        .on("mouseenter", () => {
                            const tooltip = d3.select("#tooltip");
                            tooltip
                                .style("visibility", "visible")
                                .style("top", (d3.event.pageY - 10) + "px")
                                .style("left", (d3.event.pageX + 10) + "px")
                                .text(`${stage}: ${category} (${value})`);
                        })
                        .on("mouseleave", () => {
                            d3.select("#tooltip").style("visibility", "hidden");
                        });
                    squareCount++;
                }
            });

            // Add stage label and count with updated positioning
            const totalStageCount = Object.values(stageData).reduce((a, b) => a + b, 0);
            
            // Stage count label
            stageGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", maxRows * (cellSize + cellPadding) + 20)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "12px")
                .attr("font-weight", "800")
                .text(totalStageCount);

            // Stage name label
            stageGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", maxRows * (cellSize + cellPadding) + 35)
                .attr("text-anchor", "middle")
                .attr("fill", "#828487")
                .attr("font-size", "12px")
                .attr("font-weight", "800")
                .text(stage);
        });
    }

    function updateHighlights() {
        const svgElement = d3.select(svg);
        svgElement.selectAll("rect")
            .style("opacity", function() {
                if (!hoveredCategory && !hoveredStage) return 0.9;
                const element = d3.select(this);
                if (hoveredCategory && element.classed(`category-${hoveredCategory.replace(/\s+/g, '-')}`)) return 1;
                if (hoveredStage && element.closest(`.stage-${stages.indexOf(hoveredStage)}`).size() > 0) return 1;
                return 0.2;
            });
    }
</script>

<div class="relative">
    <div id="tooltip" 
         class="absolute bg-gray-800 text-white px-2 py-1 rounded text-sm pointer-events-none" 
         style="visibility: hidden; z-index: 1000;">
    </div>
    <div class="chart-container">
        <svg bind:this={svg}></svg>
    </div>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 100%;
        min-height: 400px;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }
</style>
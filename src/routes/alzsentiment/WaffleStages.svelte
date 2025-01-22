<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data = [];
    export let stages = ["Initial Discovery", "Initial Planning", "Day-to-Day Management", "New Treatment", "Long-Term Planning"];
    export let categories = ["Entirely Negative", "Somewhat Negative", "Neutral", "Somewhat Positive", "Entirely Positive"];
    
    let svg;
    let width = 1250;
    let height = 800;
    let cellSize = 24;
    let cellPadding = 2;
    let stageSpacing = 90;
    let labelHeight = 40;
    
    const gridWidth = 5;

    const categoryColors = {
        "Entirely Negative": "#AC0003",
        "Somewhat Negative": "#FF676A",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#59AA49",
        "Entirely Positive": "#083607"
    };

    // State for hover effects
    let hoveredCategory = null;
    let hoveredStage = null;

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

        // Create legend
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

        // Create stage groups
        stages.forEach((stage, stageIndex) => {
            const stageData = data[stageIndex];
            const totalSquares = Object.values(stageData).reduce((a, b) => a + b, 0);
            const xOffset = stageIndex * (stageWidth + stageSpacing);

            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

            // Interactive stage label
            const labelGroup = stageGroup.append("g")
                .style("cursor", "pointer")
                .on("mouseenter", () => {
                    hoveredStage = stage;
                    updateHighlights();
                })
                .on("mouseleave", () => {
                    hoveredStage = null;
                    updateHighlights();
                });

            labelGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", maxRows * (cellSize + cellPadding) + 35)
                .attr("text-anchor", "middle")
                .attr("fill", "#828487")
                .attr("font-size", "12px")
                .attr("font-weight", "800")
                .text(stage);

            let squareCount = 0;
            let squareElements = [];

            categories.forEach(category => {
                const value = stageData[category];
                
                for (let i = 0; i < value; i++) {
                    const col = squareCount % gridWidth;
                    const row = Math.floor(squareCount / gridWidth);
                    const yPosition = (maxRows - 1 - row) * (cellSize + cellPadding);
                    
                    const square = stageGroup.append("rect")
                        .attr("class", `category-${category.replace(/\s+/g, '-')}`)
                        .attr("x", col * (cellSize + cellPadding))
                        .attr("y", yPosition)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", categoryColors[category])
                        .attr("rx", 2)
                        .attr("ry", 2)
                        .style("transition", "opacity 0.2s")
                        .on("mouseenter", () => {
                            const tooltip = d3.select("#tooltip");
                            tooltip
                                .style("visibility", "visible")
                                .style("top", (d3.event.pageY - 10) + "px")
                                .style("left", (d3.event.pageX + 10) + "px")
                                .text(`${stage}: ${category}`);
                        })
                        .on("mousemove", () => {
                            const tooltip = d3.select("#tooltip");
                            tooltip
                                .style("top", (d3.event.pageY - 10) + "px")
                                .style("left", (d3.event.pageX + 10) + "px");
                        })
                        .on("mouseleave", () => {
                            d3.select("#tooltip").style("visibility", "hidden");
                        });
                    
                    squareElements.push(square);
                    squareCount++;
                }
            });

            // Stage count label
            stageGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", maxRows * (cellSize + cellPadding) + 20)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "12px")
                .attr("font-weight", "800")
                .text(totalSquares);
        });
    }

    function updateHighlights() {
        const svg = d3.select(svg);
        
        svg.selectAll("rect")
            .style("opacity", rect => {
                if (!hoveredCategory && !hoveredStage) return 1;
                if (hoveredCategory && rect.classList.contains(`category-${hoveredCategory.replace(/\s+/g, '-')}`)) return 1;
                if (hoveredStage && rect.parentNode.classList.contains(`stage-${stages.indexOf(hoveredStage)}`)) return 1;
                return 0.2;
            });
    }
</script>

<div class="relative">
    <div id="tooltip" class="absolute bg-gray-800 text-white px-2 py-1 rounded text-sm pointer-events-none" 
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
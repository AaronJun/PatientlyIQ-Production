<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { negativeSentimentData } from './negativeSentimentData';

    export let data = negativeSentimentData.data;
    export let stages = negativeSentimentData.stages;
    export let categories = negativeSentimentData.categories;
    
    let svg;
    let width = 1250;  // Match WaffleStages width
    let height = 800;  // Match WaffleStages height
    let cellSize = 24; // Match WaffleStages cell size
    let cellPadding = 2;
    let categorySpacing = 90;
    let labelHeight = 40;
    
    const gridWidth = 5;
    let hoveredCategory = null;
    let hoveredStage = null;
    let selectedStage = null;
    let selectedCategory = null;

    // Enhanced color scheme for negative sentiment visualization
    const categoryColors = {
        "Treatment Burden": "#C62828",    // Deep red
        "Financial Stress": "#D32F2F",    // Red
        "Care Barriers": "#E53935",       // Lighter red
        "Daily Struggles": "#F44336",     // Even lighter red
        "Future Worries": "#EF5350"       // Lightest red
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
            
        // Calculate total N across all stages and categories
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

        // Create legend with consistent styling
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
            const xOffset = stageIndex * (cellSize * gridWidth + categorySpacing);
            
            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

            // Add stage label
            stageGroup.append("text")
                .attr("x", (cellSize * gridWidth) / 2)
                .attr("y", height - 60)
                .attr("text-anchor", "middle")
                .attr("fill", "#828487")
                .attr("font-size", "12px")
                .attr("font-weight", "800")
                .text(stage);

            // Calculate and display squares for each category
            let yOffset = 0;
            categories.forEach(category => {
                const value = stageData[category] || 0;
                const squaresNeeded = Math.ceil(value);
                
                for (let i = 0; i < squaresNeeded; i++) {
                    const row = Math.floor(i / gridWidth);
                    const col = i % gridWidth;
                    
                    stageGroup.append("rect")
                        .attr("class", `category-${category.replace(/\s+/g, '-')}`)
                        .attr("x", col * (cellSize + cellPadding))
                        .attr("y", yOffset + row * (cellSize + cellPadding))
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
                }
                yOffset += Math.ceil(squaresNeeded / gridWidth) * (cellSize + cellPadding) + 10;
            });

            // Add total count for stage
            const totalStageCount = Object.values(stageData).reduce((a, b) => a + b, 0);
            stageGroup.append("text")
                .attr("x", (cellSize * gridWidth) / 2)
                .attr("y", height - 40)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "12px")
                .text(totalStageCount);
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
        min-height: 800px;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }
</style>
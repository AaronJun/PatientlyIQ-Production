<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { negativeSentimentData } from './negativeSentimentData';

    export let data = negativeSentimentData.data;
    export let stages = negativeSentimentData.stages;
    export let categories = negativeSentimentData.categories;
    
    let svg;
    let width = 900;
    let height: number;
    let cellSize = 16;
    let cellPadding = 2;
    let stageSpacing = 60;
    let labelHeight = 40;
    let legendHeight = 50;
    
    const gridWidth = 5;
    let hoveredCategory: string | null = null;
    let hoveredStage: string | null = null;

 // Enhanced color scheme for negative sentiment visualization
 const categoryColors = {};
    categories.forEach((category, index) => {
        // Use interpolateGreens from 0.3 to 0.8 to avoid too light or too dark colors
        categoryColors[category] = d3.interpolateReds(0.125 + (index * 0.925 / (categories.length - 1)));
    });


    function getMaxSquaresPerStage() {
        return Math.max(...data.map(stageData => 
            Object.values(stageData).reduce((sum: number, value: number) => sum + value, 0)
        ));
    }

    function calculateHeight() {
        const maxSquares = getMaxSquaresPerStage();
        const rows = Math.ceil(maxSquares / gridWidth);
        return rows * (cellSize + cellPadding) + labelHeight + legendHeight + 60;
    }

    onMount(() => {
        if (data.length > 0) {
            height = calculateHeight();
            createVisualization();
        }
    });

    function createVisualization() {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [-(width * 0.1)/2, 0, width * 1.1, height]);
            
        // Process data by stage
        const stageData = stages.map((stage, stageIndex) => {
            const categoryValues = categories.map(category => ({
                category,
                value: data[stageIndex][category] || 0
            }));
            return {
                stage,
                categories: categoryValues,
                total: categoryValues.reduce((sum, { value }) => sum + value, 0)
            };
        });

        const maxSquaresPerStage = getMaxSquaresPerStage();
        const stageWidth = gridWidth * (cellSize + cellPadding);
        const chartHeight = height - legendHeight;

        // Calculate total width needed for all stages
        const totalWidth = stages.length * (stageWidth + stageSpacing) - stageSpacing;
        const startX = (width - totalWidth) / 2;

        // Create stage groups
        stageData.forEach((stageInfo, stageIndex) => {
            const xOffset = startX + stageIndex * (stageWidth + stageSpacing);
            
            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

            // Add stage label
            const labelGroup = stageGroup.append("g")
                .style("cursor", "pointer");

            labelGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "8px")
                .attr("font-weight", "800")
                .text(stageInfo.stage);

            // Add squares for each category
            let squareCount = 0;
            stageInfo.categories.forEach(({ category, value }) => {
                for (let i = 0; i < value; i++) {
                    const col = squareCount % gridWidth;
                    const row = Math.floor(squareCount / gridWidth);
                    const yPosition = (Math.ceil(maxSquaresPerStage / gridWidth) - 1 - row) * (cellSize + cellPadding);
                    
                    const square = stageGroup.append("rect")
                        .attr("class", `category-${category.replace(/\s+/g, '-')}`)
                        .attr("x", col * (cellSize + cellPadding))
                        .attr("y", yPosition)
                        .attr("width", cellSize)
                        .attr("height", cellSize)
                        .attr("fill", categoryColors[category])
                        .attr("rx", 2)
                        .attr("ry", 2)
                        .style("opacity", 0.8);

                    square
                        .on("mouseenter", (event) => {
                            const tooltip = d3.select("#negative-sentiment-tooltip");
                            const tooltipWidth = 200;
                            const windowWidth = window.innerWidth;
                            
                            let leftPos = event.clientX + 20;
                            if (leftPos + tooltipWidth > windowWidth) {
                                leftPos = event.clientX - tooltipWidth - 20;
                            }
                            
                            tooltip
                                .style("visibility", "visible")
                                .style("left", `${leftPos}px`)
                                .style("top", `${event.clientY}px`)
                                .text(`${stageInfo.stage}: ${category} (${value})`);

                            hoveredCategory = category;
                            updateHighlights();
                        })
                        .on("mouseleave", () => {
                            d3.select("#negative-sentiment-tooltip")
                                .style("visibility", "hidden");
                            hoveredCategory = null;
                            updateHighlights();
                        });
                    
                    squareCount++;
                }
            });

            // Add total count label
            stageGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", Math.ceil(maxSquaresPerStage / gridWidth) * (cellSize + cellPadding) + 15)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "8.25px")
                .text(stageInfo.total);
        });
// Create horizontal legend at the bottom
const legendY = chartHeight - 20;
        const maxLegendWidth = Math.min(width * 0.8, totalWidth); // Limit legend width
        const legendItemWidth = maxLegendWidth / categories.length;
        const legendStartX = startX + (totalWidth - maxLegendWidth) / 2; // Center legend

        const legendGroup = svgElement.append("g")
            .attr("transform", `translate(${legendStartX}, ${legendY})`);

        categories.forEach((category, i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(${i * legendItemWidth + legendItemWidth/2}, 0)`)
                .style("cursor", "pointer");

            legendItem.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("rx", 2)
                .attr("x", -5) // Center the rectangle
                .attr("fill", categoryColors[category]);

            // Add text with ellipsis if too long
            const text = legendItem.append("text")
                .attr("y", 24)
                .attr("fill", "#6D635B")
                .attr("font-size", "8.25px")
                .attr("text-anchor", "middle") // Center the text
                .text(category);

            // Truncate text if too long
            const maxTextWidth = legendItemWidth - 20;
            const textElement = text.node();
            if (textElement && textElement.getComputedTextLength() > maxTextWidth) {
                let textContent = category;
                while (textElement.getComputedTextLength() > maxTextWidth && textContent.length > 0) {
                    textContent = textContent.slice(0, -1);
                }
                text.text(textContent + '...');
            }

            legendItem
                .on("mouseenter", () => {
                    hoveredCategory = category;
                    updateHighlights();
                    // Show full category name in tooltip if truncated
                    if (text.text().endsWith('...')) {
                        showTooltip(event, category);
                    }
                })
                .on("mouseleave", () => {
                    hoveredCategory = null;
                    updateHighlights();
                    hideTooltip();
                });
        });

    }


    function updateHighlights() {
        const svgElement = d3.select(svg);
        
        svgElement.selectAll("rect")
            .style("opacity", function() {
                const element = d3.select(this);
                if (!hoveredCategory && !hoveredStage) {
                    return 0.8;
                }
                
                const isMatchingCategory = hoveredCategory && 
                    element.classed(`category-${hoveredCategory.replace(/\s+/g, '-')}`);
                const isMatchingStage = hoveredStage && 
                    element.closest(`.stage-${stages.indexOf(hoveredStage)}`).size() > 0;
                
                return (isMatchingCategory || isMatchingStage) ? 1 : 0.2;
            });
}
</script>

<div class="relative flex flex-col bg-slate-50 py-8 items-center justify-center w-full">
    
    <h3 class="text-xs font-mono text-slate-800 px-4 py-2 text-center mb-12 uppercase underline underline-offset-4">    
        1.2b: Main Drivers of Negative Sentiment, by Stage
    </h3>
    <div 
        id="negative-sentiment-tooltip" 
        class="fixed text-white bg-gray-800 px-2 py-1 rounded text-sm pointer-events-none transform -translate-x-1/2"
        style="visibility: hidden; z-index: 1000;">
    </div>
    <div class="chart-container flex items-center justify-center">
        <svg bind:this={svg}></svg>
    </div>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    svg {
        width: 100%;
        height: 100%;
        margin: 0 auto;
    }

    :global(.highlighted) {
        opacity: 1 !important;
    }

    :global(.dimmed) {
        opacity: 0.2;
    }
</style>
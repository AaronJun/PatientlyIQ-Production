<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { positiveSentimentData } from './positiveSentimentData';

    export let data = positiveSentimentData.data;
    export let stages = positiveSentimentData.stages;
    export let categories = positiveSentimentData.categories;
    
    let svg;
    let width = 1200;
    let height = 450;
    let cellSize = 12;
    let cellPadding = 2;
    let stageSpacing = 60;
    let labelHeight = 40;
    let legendHeight = 50;
    
    const gridWidth = 5;
    let hoveredCategory: string | null = null;
    let hoveredStage: string | null = null;
    let selectedStage: string | null = null;
    let selectedCategory: string | null = null;

    // Enhanced color scheme
    const categoryColors = {
        "Treatment Hope": "#4CAF50",      // Hopeful green
        "Support System": "#2196F3",      // Supportive blue
        "Care Access": "#A306C9",         // Purple for healthcare
        "Daily Coping": "#FA8E57",        // Gold for daily wins
        "Future Outlook": "#154D1F"       // Green for future
    };

    // Generate insights for the selected combination
    $: insight = generateInsight(selectedStage, selectedCategory);

    function generateInsight(stage: string | null, category: string | null) {
        if (!stage || !category) return null;
        
        const insights = {
            "Initial Discovery": {
                "Treatment Hope": "Early research reveals promising treatment options and clinical trials.",
                "Support System": "Family and friends rally to provide emotional and practical support.",
                "Care Access": "Successfully connecting with knowledgeable specialists and care teams.",
                "Daily Coping": "Finding effective initial coping strategies and routines.",
                "Future Outlook": "Discovering encouraging long-term outcomes and success stories."
            },
            "Psychological Processing": {
                "Treatment Hope": "Growing understanding of available treatment options brings comfort.",
                "Support System": "Developing stronger bonds with family through shared experiences.",
                "Care Access": "Building positive relationships with healthcare providers.",
                "Daily Coping": "Learning and implementing effective stress management techniques.",
                "Future Outlook": "Finding peace and acceptance while maintaining optimism."
            },
            "Initial Planning": {
                "Treatment Hope": "Developing clear and promising treatment strategies.",
                "Support System": "Creating strong support networks with family, friends, and community.",
                "Care Access": "Establishing reliable access to necessary care services.",
                "Daily Coping": "Successfully adapting daily routines and activities.",
                "Future Outlook": "Setting achievable goals and milestones for the future."
            },
            "Treatment Consideration": {
                "Treatment Hope": "Positive response to treatment options and approaches.",
                "Support System": "Strong backing from care team and support network.",
                "Care Access": "Good coordination between various healthcare providers.",
                "Daily Coping": "Maintaining quality of life through effective management strategies.",
                "Future Outlook": "Confidence in treatment path and future outcomes."
            },
            "Long-Term Planning": {
                "Treatment Hope": "Sustained treatment success and management.",
                "Support System": "Well-established and reliable support network.",
                "Care Access": "Smooth, ongoing access to necessary care services.",
                "Daily Coping": "Mastery of daily management and coping strategies.",
                "Future Outlook": "Positive long-term outlook with clear plans and goals."
            }
        };

        return insights[stage]?.[category] || null;
    }

    onMount(() => {
        if (data.length > 0) {
            createVisualization();
        }
    });

    function createVisualization() {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [-25, 0, width, height]);
            
        // Process data by stage
        const stageData = stages.map((stage, stageIndex) => {
            const categoryValues = categories.map(category => ({
                category,
                value: data[stageIndex][category]
            }));
            return {
                stage,
                categories: categoryValues,
                total: categoryValues.reduce((sum, { value }) => sum + value, 0)
            };
        });

        const maxSquaresPerStage = Math.max(...stageData.map(d => d.total));
        const stageWidth = gridWidth * (cellSize + cellPadding);
        const chartHeight = height - legendHeight;

        // Create stage groups
        stageData.forEach((stageInfo, stageIndex) => {
            const xOffset = stageIndex * (stageWidth + stageSpacing);
            
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
                .attr("font-weight", "400")
                .text(stageInfo.stage);

            labelGroup
                .on("mouseenter", () => {
                    hoveredStage = stageInfo.stage;
                    updateHighlights();
                })
                .on("mouseleave", () => {
                    hoveredStage = null;
                    updateHighlights();
                })
                .on("click", () => {
                    selectedStage = stageInfo.stage;
                });

            // Add squares for each category within the stage
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
                        .style("transition", "opacity 0.2s ease")
                        .style("opacity", 0.8);

                    square
                        .on("mouseenter", (event) => {
                            const squareRect = event.target.getBoundingClientRect();
                            const tooltip = d3.select("#sentiment-tooltip");
                            
                            tooltip
                                .style("visibility", "visible")
                                .style("left", `${squareRect.left}px`)
                                .style("top", `${squareRect.top - 25}px`)
                                .text(`${stageInfo.stage}: ${category} (${value})`);
                        })
                        .on("mouseleave", () => {
                            d3.select("#sentiment-tooltip").style("visibility", "hidden");
                        })
                        .on("click", () => {
                            selectedStage = stageInfo.stage;
                            selectedCategory = category;
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
                .attr("font-size", "10px")
                .text(stageInfo.total);
        });

        // Create horizontal legend for categories at the bottom
        const legendY = chartHeight - 20;
        const legendItemWidth = width / categories.length;
        const legendGroup = svgElement.append("g")
            .attr("transform", `translate(0, ${legendY})`);

        categories.forEach((category, i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(${i * legendItemWidth + legendItemWidth/4}, 0)`)
                .style("cursor", "pointer");

            legendItem.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("rx", 2)
                .attr("y", 2)
                .attr("fill", categoryColors[category]);

            legendItem.append("text")
                .attr("x", 20)
                .attr("y", 10)
                .attr("fill", "#6D635B")
                .attr("font-size", "10px")
                .attr("text-anchor", "start")
                .style("max-width", `${legendItemWidth - 40}px`)
                .text(category);

            legendItem
                .on("mouseenter", () => {
                    hoveredCategory = category;
                    updateHighlights();
                })
                .on("mouseleave", () => {
                    hoveredCategory = null;
                    updateHighlights();
                })
                .on("click", () => {
                    selectedCategory = category;
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

<div class="relative">
    <div 
        id="sentiment-tooltip" 
        class="absolute bg-gray-800 text-white px-2 py-1 rounded text-sm pointer-events-none transform -translate-x-1/2"
        style="visibility: hidden; z-index: 1000;">
    </div>
    <div class="chart-container">
        <svg bind:this={svg}></svg>
    </div>
    {#if insight}
        <div class="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Key Insight</h3>
            <p class="text-gray-600">{insight}</p>
        </div>
    {/if}
</div>

<style>
    .chart-container {
        width: 100%;
        height: 100%;
        min-height: 450px;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }

    :global(.highlighted) {
        opacity: 1 !important;
    }

    :global(.dimmed) {
        opacity: 0.2;
    }
</style>
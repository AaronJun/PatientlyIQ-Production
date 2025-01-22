<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { schemeYlOrRd } from 'd3';
    import { negativeSentimentData } from './negativeSentimentData';

    const colors = schemeYlOrRd[5];

const categoryColors = {
    "Clinical Uncertainty": colors[4],    // Darkest red
    "Emotional Burden": colors[3],        // Red
    "Access Barriers": colors[2],         // Orange
    "Social Impact": colors[1],           // Light orange
    "Financial Concerns": colors[0]       // Yellow
};

    export let data = negativeSentimentData.data;
    export let stages = negativeSentimentData.stages;
    export let categories = negativeSentimentData.categories;
    
    let svg;
    let width = 1200;
    let height = 800;
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

    // Generate insights for the selected combination
    $: insight = generateInsight(selectedStage, selectedCategory);

    function generateInsight(stage: string | null, category: string | null) {
        if (!stage || !category) return null;
        
        const insights = {
            "Disease Understanding": {
                "Clinical Uncertainty": "Patients express significant anxiety about the unpredictable nature of disease progression.",
                "Emotional Burden": "The emotional weight of understanding diagnosis creates substantial stress for both patients and families.",
                "Access Barriers": "Limited access to specialists is a major concern.",
                "Social Impact": "Many struggle with decisions about sharing diagnosis with family members.",
                "Financial Concerns": "The costs associated with testing and specialized assessments create financial strain."
            },
            "Emotional Impact": {
                "Clinical Uncertainty": "Uncertainty about timing and rate of decline significantly impacts emotional well-being.",
                "Emotional Burden": "High levels of anxiety and depression are reported.",
                "Access Barriers": "Finding mental health professionals familiar with rare diseases is challenging.",
                "Social Impact": "Family relationships are strained by the emotional weight of diagnosis.",
                "Financial Concerns": "Worry about future care costs affects current emotional state."
            },
            "Healthcare Navigation": {
                "Clinical Uncertainty": "Lack of clear treatment pathways creates frustration.",
                "Emotional Burden": "Coordinating care across multiple specialists causes significant stress.",
                "Access Barriers": "Finding knowledgeable healthcare providers is difficult.",
                "Social Impact": "Communication challenges with healthcare providers impact care quality.",
                "Financial Concerns": "Insurance coverage for treatments and monitoring is often limited."
            },
            "Daily Management": {
                "Clinical Uncertainty": "Day-to-day symptom variability makes planning difficult.",
                "Emotional Burden": "Caregivers report high levels of stress managing daily care needs.",
                "Access Barriers": "Limited availability of support services.",
                "Social Impact": "Progressive withdrawal from social activities affects quality of life.",
                "Financial Concerns": "Ongoing costs of care and support services create financial pressure."
            },
            "Future Planning": {
                "Clinical Uncertainty": "Uncertainty about disease progression complicates long-term planning.",
                "Emotional Burden": "Anxiety about future care needs affects current decision-making.",
                "Access Barriers": "Limited options for long-term care.",
                "Social Impact": "Concerns about impact on family planning and next generation.",
                "Financial Concerns": "Significant worry about long-term care costs and estate planning."
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
            .attr("viewBox", [0, 0, width, height]);
            
        const stageHeights = data.map(stageData => {
            const totalSquares = Object.values(stageData).reduce((a, b) => a + b, 0);
            return Math.ceil(totalSquares / gridWidth);
        });
        const maxRows = Math.max(...stageHeights);
        const stageWidth = gridWidth * (cellSize + cellPadding);
        
        // Create legend
        const legendGroup = svgElement.append("g")
            .attr("transform", `translate(${width - 200}, 10)`);

        Object.entries(categoryColors).forEach(([category, color], i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(0, ${i * 20})`)
                .style("cursor", "pointer");

            legendItem.append("rect")
                .attr("width", 6)
                .attr("height", 6)
                .attr("transform", `translate(0, 4.5)`)
                .attr("rx", 1)
                .attr("stroke", .5)
                .attr("stroke", "#161616")
                .attr("fill", color);

            legendItem.append("text")
                .attr("x", 15)
                .attr("y", 10)
                .attr("fill", "#6D635B")
                .attr("font-size", "8px")
                .attr("font-family", "IBM Plex Sans Condensed")
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

        // Create stage groups
        stages.forEach((stage, stageIndex) => {
            const stageData = data[stageIndex];
            const totalSquares = Object.values(stageData).reduce((a, b) => a + b, 0);
            const xOffset = stageIndex * (stageWidth + stageSpacing);

            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

            // Add stage label
            const labelGroup = stageGroup.append("g")
                .style("cursor", "pointer");

            labelGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", maxRows * (cellSize + cellPadding) + 30)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "8px")
                .attr("font-weight", "400")
                .attr("font-family", "IBM Plex Sans Condensed")
                .text(stage);

            labelGroup
                .on("mouseenter", () => {
                    hoveredStage = stage;
                    updateHighlights();
                })
                .on("mouseleave", () => {
                    hoveredStage = null;
                    updateHighlights();
                })
                .on("click", () => {
                    selectedStage = stage;
                });

            let squareCount = 0;
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
                        .attr("stroke", .5)
                        .attr("stroke", "#161616")
                        .attr("rx", 2)
                        .attr("ry", 2)
                        .style("transition", "opacity 0.2s ease");

                    square
                        .on("mouseenter", (event) => {
                            const squareRect = event.target.getBoundingClientRect();
                            const tooltip = d3.select("#sentiment-tooltip");
                            
                            tooltip
                                .style("visibility", "visible")
                                .style("left", `${squareRect.left}px`)
                                .style("top", `${squareRect.top - 25}px`)
                                .text(`${stage}: ${category} (${value})`);
                        })
                        .on("mouseleave", () => {
                            d3.select("#sentiment-tooltip").style("visibility", "hidden");
                        })
                        .on("click", () => {
                            selectedStage = stage;
                            selectedCategory = category;
                        });
                    
                    squareCount++;
                }
            });

            // Add total count label
            stageGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", maxRows * (cellSize + cellPadding) + 15)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "10px")
                .attr("font-family", "IBM Plex Mono")
                .text(totalSquares);
        });
    }

    function updateHighlights() {
        const svgElement = d3.select(svg);
        
        svgElement.selectAll("rect")
            .style("opacity", function() {
                const element = d3.select(this);
                if (!hoveredCategory && !hoveredStage) return 1;
                
                const isMatchingCategory = hoveredCategory && 
                    element.classed(`category-${hoveredCategory.replace(/\s+/g, '-')}`);
                const isMatchingStage = hoveredStage && 
                    element.closest(".stage-" + stages.indexOf(hoveredStage));
                
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
        min-height: 400px;
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
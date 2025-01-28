<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { positiveSentimentData } from './ctpositiveSentimentData';
    import AlzheonQuoteCards from '$lib/patientcards/AlzheonQuoteCards.svelte';

    export let data = positiveSentimentData.data;
    export let stages = positiveSentimentData.stages;
    export let categories = positiveSentimentData.categories;
    
    let svg;
    let width = 300;
    let height: number;
    let cellSize = 20;
    let cellPadding = 2;
    let stageSpacing = 0;
    let labelHeight = 40;
    let legendHeight = 0;
    
    const gridWidth = 5;
    let hoveredCategory: string | null = null;
    let hoveredStage: string | null = null;
    let selectedStage: string | null = null;
    let selectedCategory: string | null = null;

    const categoryColors = {};
    categories.forEach((category, index) => {
        categoryColors[category] = d3.interpolateGreens(0.1825 + (index * 0.925 / (categories.length - 1)));
    });

    function getMaxSquaresPerStage() {
        return Math.max(...data.map(stageData => 
            Object.values(stageData).reduce((sum: number, value: number) => sum + value, 0)
        ));
    }

    function calculateHeight() {
        const maxSquares = getMaxSquaresPerStage();
        const rows = Math.ceil(maxSquares / gridWidth);
        return rows * (cellSize + cellPadding) + labelHeight + legendHeight + 0;
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
            .attr("viewBox", [0, 0, width, height]);
            
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
        const chartWidth = width * 0.5;
        const chartHeight = height - legendHeight;

        const totalWidth = stages.length * (stageWidth + stageSpacing) - stageSpacing;
        const startX = (chartWidth - totalWidth) / 2;

        stageData.forEach((stageInfo, stageIndex) => {
            const xOffset = startX + stageIndex * (stageWidth + stageSpacing);
            
            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

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
                            const tooltip = d3.select("#positive-sentiment-tooltip");
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
                            d3.select("#positive-sentiment-tooltip")
                                .style("visibility", "hidden");
                            hoveredCategory = null;
                            updateHighlights();
                        })
                        .on("click", () => {
                            selectedStage = stageInfo.stage;
                            selectedCategory = category;
                        });
                    
                    squareCount++;
                }
            });

            stageGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", Math.ceil(maxSquaresPerStage / gridWidth) * (cellSize + cellPadding) + 15)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "8.25px")
                .text(stageInfo.total);
        });

        const legendX = chartWidth + 20;
        const legendItemHeight = 10;
        const legendY = height / 2 - (categories.length * legendItemHeight) / 2;

        const legendGroup = svgElement.append("g")
            .attr("transform", `translate(${legendX}, ${legendY})`);

        categories.forEach((category, i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(0, ${i * legendItemHeight})`)
                .style("cursor", "pointer");

            legendItem.append("rect")
                .attr("width", 5)
                .attr("height", 5)
                .attr("rx", 0)
                .attr("fill", categoryColors[category]);

            const legendFontSize = Math.min(11, width / 30);
            legendItem.append("text")
                .attr("x", 10)
                .attr("y", 4)
                .attr("fill", "#6D635B")
                .attr("font-size", `${legendFontSize/2}px`)
                .attr("font-family", "IBM Plex Mono")
                .text(category);

            legendItem
                .on("mouseenter", () => {
                    hoveredCategory = category;
                    updateHighlights();
                })
                .on("mouseleave", () => {
                    hoveredCategory = null;
                    updateHighlights();
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
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12">
    <h3 class="text-xs font-mono bg-orange-50 text-slate-800 px-4 py-2 rounded-sm outline-dashed text-center mb-8 lg:mb-12 uppercase">
        3.1B: Main Drivers of Positive Sentiment, Alzheon Studies
    </h3>
    
    <div id="positive-sentiment-tooltip" 
        class="fixed bg-gray-800 text-white px-2 py-1 rounded text-sm pointer-events-none transform -translate-x-1/2"
        style="visibility: hidden; z-index: 1000;">
    </div>

    <div class="w-full max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-7">
                <div class="chart-container">
                    <svg bind:this={svg}></svg>
                </div>
            </div>
            
            <div class="lg:col-span-3">
                <AlzheonQuoteCards />
            </div>
        </div>

        {#if insight}
            <div class="mt-8 p-4 bg-white rounded-lg shadow-md border border-gray-200 max-w-3xl mx-auto">
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Key Insight</h3>
                <p class="text-gray-600">{insight}</p>
            </div>
        {/if}

        <p class="caption prose text-left text-base text-slate-600 font-serif mt-8 mb-12 max-w-3xl mx-auto">
            Alzheon's focus on the APOE4 genotype sets it apart from other companies in the eyes of the audience. Carriers and caregivers are encouraged by the company's commitment to developing treatments for this high-risk group, especially in the face of treatment options which are specifically riskier (e.g. lecanemab) for the cohort. 
        </p>
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
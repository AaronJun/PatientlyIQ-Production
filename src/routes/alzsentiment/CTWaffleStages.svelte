<script lang="ts">
    import { onMount } from 'svelte';
    import "carbon-components-svelte/css/all.css";
    import * as d3 from 'd3';

    export let data = {
        stages: []
    };

    let svg;
    let containerRef;
    let hasAnimated = false;
    const width = 600;
    let height: number;
    const cellSize = 16;
    const cellPadding = 2;
    const stageSpacing = 40;
    const labelHeight = 30;
    const gridWidth = 5;
    const legendHeight = 0;
    const animationDuration = 800;

    const colors = {
        "Entirely Negative": "#8B0000",
        "Somewhat Negative": "#CD5C5C",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#90EE90",
        "Entirely Positive": "#228B22"
    };

    const stageDescriptions = {
        "Clinical Trials": "Sentiment expressed by APOE4 carriers and caregivers about clinical trials, excluding specific mentions of Alzheon's programs.",
        "Alzheon Clinical Trials": "Sentiment expressed by APOE4 carriers and caregivers specifically about Alzheon's research and clinical trials."
    };

    const quotes = {
        "Clinical Trials": {
            sentiment: "Entirely Negative",
            persona: "Carrier, APOE4/4",
            index: 5,
            text: "My reaction is no way am I going to be a guinea pig for this snake oil. There is no cure, only the ability to possibly prolong the misery."
        }, 
        "Alzheon Clinical Trials": {
            sentiment: "Somewhat Positive",
            persona: "Carrier, APOE4/4",
            index: 10,
            text: "I'm a 4/4 and I feel that the risks are too high. I'm afraid of dementia but Im also afraid of having a stroke or worse. I'm hopeful that ALZ-801 proves to be a safe and effective treatment for us."
        },
        };

    function getMaxSquaresPerStage() {
        return Math.max(...data.stages.map(stage => 
            Object.values(stage.sentiments).reduce((sum, value) => sum + value, 0)
        ));
    }

    function calculateHeight() {
        const maxSquares = getMaxSquaresPerStage();
        const rows = Math.ceil(maxSquares / gridWidth);
        return rows * (cellSize + cellPadding) + labelHeight + legendHeight + 60;
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

        if (data.stages.length > 0) {
            height = calculateHeight();
            createVisualization(false);
        }

        return () => {
            if (containerRef) {
                observer.unobserve(containerRef);
            }
        };
    });

    function createSquare(
        stageGroup,
        col,
        row,
        sentiment,
        stageName,
        countBySentiment,
        yPosition,
        animate = false,
        totalRows
    ) {
        const finalX = col * (cellSize + cellPadding);
        const startY = animate ? -50 : yPosition;
        const stageQuote = quotes[stageName];
        const isHighlighted = stageQuote && 
                            sentiment === stageQuote.sentiment && 
                            countBySentiment[sentiment] === stageQuote.index;

        if (isHighlighted) {
            const filterId = `glow-${stageName}-${col}-${row}`.replace(/\s+/g, '-');
            const defs = d3.select(svg).select("defs");
            
            if (defs.empty()) {
                d3.select(svg).append("defs");
            }

            const filter = d3.select(svg).select("defs")
                .append("filter")
                .attr("id", filterId)
                .attr("x", "-50%")
                .attr("y", "-50%")
                .attr("width", "200%")
                .attr("height", "200%");

            filter.append("feGaussianBlur")
                .attr("in", "SourceAlpha")
                .attr("stdDeviation", "2")
                .attr("result", "blur");

            filter.append("feFlood")
                .attr("flood-color", "#161616")
                .attr("flood-opacity", "0.6")
                .attr("result", "color");

            filter.append("feComposite")
                .attr("in", "color")
                .attr("in2", "blur")
                .attr("operator", "in")
                .attr("result", "shadow");

            filter.append("feComposite")
                .attr("in", "SourceGraphic")
                .attr("in2", "shadow")
                .attr("operator", "over");


            if (animate) {
                stageGroup.select(`rect[filter="url(#${filterId})"]`)
                    .transition()
                    .delay((col * 50) + ((totalRows - row) * 50))
                    .duration(animationDuration)
                    .ease(d3.easeBounceOut)
                    .attr("y", yPosition - 2);
            }
        }

        const square = stageGroup.append("rect")
            .attr("x", finalX)
            .attr("y", startY)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", colors[sentiment])
            .attr("rx", 2)
            .style("opacity", animate ? 0 : 1);

        if (isHighlighted) {
            square.style("stroke", "#161616")
                .style("stroke-width", "1px")
                .style("stroke-dasharray", "3,2")
                .style("filter","brightness(1.5)")
                .style("filter","saturate(2)")
        }

        if (animate) {
            square.transition()
                .delay((col * 50) + ((totalRows - row) * 50))
                .duration(animationDuration)
                .ease(d3.easeBounceOut)
                .attr("y", yPosition)
                .style("opacity", 1);
        }

        square
            .style("cursor", isHighlighted ? "pointer" : "default")
            .on("mouseenter", (event) => {
                if (isHighlighted) {
                    showTooltip(event, `
                        <div class="font-medium mb-2">${stageName} - ${sentiment}</div>
                        <div>${stageQuote.text}</div>
                        <div class="mt-2 text-gray-300">${stageQuote.persona}</div>
                    `);
                    square.transition()
                        .duration(200)
                        .style("stroke-width", "2px")
                        .style("filter", "brightness(2)");
                } else {
                    showTooltip(event, `${stageName}: ${sentiment}`);
                }
            })
            .on("mouseleave", () => {
                hideTooltip();
                if (isHighlighted) {
                    square.transition()
                        .duration(200)
                        .style("stroke-width", "1.5px")
                        .style("filter","brightness(1.5)")
                        .style("filter","saturate(2)")
                    }
            });

        return countBySentiment[sentiment]++;
    }

   
function createVisualization(animate = false) {
    d3.select(svg).selectAll("*").remove();

    const svgElement = d3.select(svg)
        .attr("viewBox", [-(width * 0.1)/2, 0, width * 1.1, height]);

    const stageWidth = gridWidth * (cellSize + cellPadding);
    const totalWidth = data.stages.length * (stageWidth + stageSpacing) - stageSpacing;
    const startX = (width - totalWidth) / 2;

    // Modified legend positioning
    const legendWidth = 120; // Fixed width for right-side legend
    const legendItemHeight = 15; // Height for each legend item
    const legendStartY = labelHeight + 20; // Align with the chart start
    const legendStartX = startX + totalWidth + 30; // Position to the right of the chart

    const legendGroup = svgElement.append("g")
        .attr("transform", `translate(${legendStartX}, ${legendStartY})`)
        .style("opacity", animate ? 0 : 1);

    if (animate) {
        legendGroup.transition()
            .duration(animationDuration / 2)
            .style("opacity", 1);
    }

    Object.entries(colors).forEach(([sentiment, color], i) => {
        const legendItem = legendGroup.append("g")
            .attr("transform", `translate(0, ${i * legendItemHeight})`);

        legendItem.append("rect")
            .attr("width", 7.25)
            .attr("height", 7.25)
            .attr("rx", 1)
            .attr("y", -5)
            .attr("fill", color);

        legendItem.append("text")
            .attr("x", 12)
            .attr("y", 0)
            .attr("fill", "#6D635B")
            .attr("font-size", "5px")
            .attr("font-family", "IBM Plex Mono")
            .attr("alignment-baseline", "middle")
            .text(sentiment);
    });


        data.stages.forEach((stage, stageIndex) => {
            const xOffset = startX + stageIndex * (stageWidth + stageSpacing);
            
            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

            // Add stage label
            const labelGroup = stageGroup.append("g")
                .style("cursor", "help");

            labelGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", -15) // Changed from 10 to -15 to move it up
                .attr("text-anchor", "middle")
                .attr("fill", "#828487")
                .attr("font-size", "7.25px")
                .attr("font-weight", "800")
                .attr("font-family", "IBM Plex Sans Condensed")
                .text(stage.name)
                .style("opacity", animate ? 0 : 1);

            // Track sentiment counts for quote identification
            let countBySentiment = {};
            Object.keys(stage.sentiments).forEach(sentiment => {
                countBySentiment[sentiment] = 0;
            });

            let squareCount = 0;
            const maxSquares = getMaxSquaresPerStage();
            const totalRows = Math.ceil(maxSquares / gridWidth);

            Object.entries(stage.sentiments).forEach(([sentiment, count]) => {
                for (let i = 0; i < count; i++) {
                    const col = squareCount % gridWidth;
                    const row = Math.floor(squareCount / gridWidth);
                    const yPosition = (totalRows - 1 - row) * (cellSize + cellPadding);

            createSquare(
                        stageGroup,
                        col,
                        row,
                        sentiment,
                        stage.name,
                        countBySentiment,
                        yPosition,
                        animate,
                        totalRows
                    );

                    squareCount++;
                }
            });

            const total = Object.values(stage.sentiments).reduce((a, b) => a + b, 0);
            stageGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", totalRows * (cellSize + cellPadding)+20)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "10px")
                .text(total)
                .style("opacity", animate ? 0 : 1);

            if (animate) {
                stageGroup.selectAll("text")
                    .transition()
                    .duration(animationDuration / 2)
                    .style("opacity", 1);
            }

            labelGroup
                .on("mouseenter", (event) => {
                    showStageDescription(event, stage.name);
                })
                .on("mousemove", (event) => {
                    showStageDescription(event, stage.name);
                })
                .on("mouseleave", () => {
                    hideTooltip();
                });
        });
    }

    function showTooltip(event, content) {
        const tooltip = d3.select("#tooltip");
        const tooltipWidth = 300;
        const windowWidth = window.innerWidth;
        
        let leftPos = event.clientX + 20;
        if (leftPos + tooltipWidth > windowWidth) {
            leftPos = event.clientX - tooltipWidth - 20;
}

        tooltip
            .style("visibility", "visible")
            .style("left", leftPos + "px")
            .style("top", event.clientY + "px")
            .html(content);
    }

    function hideTooltip() {
        d3.select("#tooltip").style("visibility", "hidden");
    }

    function showStageDescription(event, stageName) {
        const description = stageDescriptions[stageName];
        if (!description) return;

        showTooltip(event, `
            <div class="font-medium mb-2 text-base">${stageName}</div>
            <div class="text-gray-200 leading-relaxed">${description}</div>
        `);
    }
</script>

<div class="relative flex flex-col bg-slate-50 items-center justify-center w-full mt-12" bind:this={containerRef}>
    <h3 class="text-xs font-mono bg-orange-50 text-slate-800 px-4 py-2 rounded-sm outline-dashed text-center mb-12 uppercase">
        3.1a: Expressed Sentiment, Clinical Trials
    </h3>

    <div id="tooltip" 
         class="fixed bg-gray-800 text-white px-4 py-3 rounded text-sm pointer-events-none max-w-md" 
         style="visibility: hidden; z-index: 9999; transform: translateY(-50%);">
    </div>
    <div class="chart-container flex items-center justify-center">
        <svg bind:this={svg}></svg>
    </div>
    <p class="caption prose w-2/5 text-left place-content-center text-base text-slate-600 font-serif mt-8 mb-12">
    The community's overall perception of clinical trials is largely negative, colored by cancelled programs and negative news cycles. Alzheon's clinical trials, by comparison, provoke a more positive community response.
     </p>
    
</div>

<style>
    .chart-container {
        width: 100%;
        height: 100%;
        min-height: 400px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    svg {
        width: 100%;
        height: 100%;
        margin: 0 auto;
    }

    :global(.tooltip-title) {
        font-weight: 500;
        margin-bottom: 0.5rem;
    }

    :global(.caption) {
        border-top: 1px solid #E5E7EB;
        padding-top: 1rem;
        padding-bottom: 2rem;
    }
</style>
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";
    import GeneticPatientQuoteCards from '$lib/patientcards/GeneticPatientQuoteCards.svelte';

    // Use the provided data structure
    export let data = {
        stages: [{
            name: "Genetic Counseling",
            sentiments: {
                "Entirely Negative": 4,
                "Somewhat Negative": 12,
                "Neutral": 16,
                "Somewhat Positive": 4,
                "Entirely Positive": 2
            }
        }]
    };

    let svg;
    let containerRef;
    let hasAnimated = false;
    const width = 250;
    let height: number;
    const cellSize = 20;
    const cellPadding = 2;
    const stageSpacing = 0;
    const labelHeight = 40;
    const gridWidth = 5;
    const legendHeight = 40;
    const animationDuration = 800;

    const colors = {
        "Entirely Negative": "#8B0000",
        "Somewhat Negative": "#CD5C5C",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#90EE90",
        "Entirely Positive": "#228B22"
    };

    const stageDescriptions = {
        "Genetic Counseling": "Conversation sentiments from discussions surrounding or mentioning genetic counseling."
    };

    const quotes = {
        "Genetic Counseling": {
            sentiment: "Entirely Positive",
            persona: "Carrier",
            index: 0,
            text: "I'd recommend seeing a genetic counselor. I met with one after my mom was diagnosed with Alzheimer’s. They explained that in my case (no other family history of AD) genetic testing wouldn’t likely provide any definitive answers."
        }
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
                .style("stroke-width", "1.5px")
                .style("stroke-dasharray", "3,2")
                .style("filter", "brightness(1.5)")
                .style("filter","saturation(2)")
                ;
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
                        .style("filter", "brightness(1.5)");
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

        const maxLegendWidth = Math.min(width * 0.8, totalWidth);
        const legendItemWidth = maxLegendWidth / Object.keys(colors).length;
        const legendStartX = startX + (totalWidth - maxLegendWidth) / 2;

        const legendGroup = svgElement.append("g")
            .attr("transform", `translate(${legendStartX}, ${height - legendHeight})`)
            .style("opacity", animate ? 0 : 1);

        if (animate) {
            legendGroup.transition()
                .duration(animationDuration / 2)
                .style("opacity", 1);
        }

        Object.entries(colors).forEach(([sentiment, color], i) => {
            const legendItem = legendGroup.append("g")
                .attr("transform", `translate(${i * legendItemWidth + legendItemWidth/2}, 0)`);

            legendItem.append("rect")
                .attr("width", 7.25)
                .attr("height", 7.25)
                .attr("rx", 0.5)
                .attr("x", -3.625)
                .attr("y", -12)
                .attr("fill", color);

            const text = legendItem.append("text")
                .attr("y", 8)
                .attr("fill", "#6D635B")
                .attr("font-size", "8px")
                .attr("font-family", "IBM Plex Sans Condensed")
                .attr("text-anchor", "middle")
                .text(sentiment);

            const maxTextWidth = legendItemWidth;
            const textElement = text.node();
            if (textElement && textElement.getComputedTextLength() > maxTextWidth) {
                let textContent = sentiment;
                while (textElement.getComputedTextLength() > maxTextWidth && textContent.length > 0) {
                    textContent = textContent.slice(0, -1);
                }
                text.text(textContent + '...');
            }

            if (text.text().endsWith('...')) {
                legendItem
                    .on("mouseenter", (event) => {
                        showTooltip(event, sentiment);
                    })
                    .on("mouseleave", () => {
                        hideTooltip();
                    });
            }
        });

        data.stages.forEach((stage, stageIndex) => {
            const xOffset = startX + stageIndex * (stageWidth + stageSpacing);
            
            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

            const labelGroup = stageGroup.append("g")
                .style("cursor", "help");

            labelGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", -20)
                .attr("text-anchor", "middle")
                .attr("fill", "#828487")
                .attr("font-size", "7.25px")
                .attr("font-weight", "800")
                .attr("font-family", "IBM Plex Sans Condensed")
                .text(stage.name)
                .style("opacity", animate ? 0 : 1);

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
                .attr("y", totalRows * (cellSize + cellPadding) + 15)
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

<div class="relative flex flex-col bg-slate-50 py-8 place-content-center items-center mx-auto justify-center w-full mt-12" bind:this={containerRef}>
    
    <h3 class="text-xs font-mono text-slate-800 px-4 py-2 text-center mb-12 uppercase underline underline-offset-4">
        2.2A: Genetic Counseling Sentiment Analysis
    </h3>

    <div id="tooltip" 
         class="fixed bg-gray-800 text-white px-4 py-3 rounded text-sm pointer-events-none max-w-md" 
         style="visibility: hidden; z-index: 9999; transform: translateY(-50%);">
    </div>
    <div class="w-full max-w-6xl mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div class="lg:col-span-7">
                <div class="chart-container">
                    <svg bind:this={svg}></svg>
                </div>
            </div>
            
            <div class="mt-8 lg:col-span-3">
                <GeneticPatientQuoteCards />    
            </div>
        </div>
        <p class="caption text-sm max-w-96 font-serif text-left mx-auto">
            Community conversations suggest a lack of clarity around the beneficial role genetic counseling plays in genetic testing and follow-on support.
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

    :global(.tooltip-title) {
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
</style>
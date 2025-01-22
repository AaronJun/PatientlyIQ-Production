<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data = {
        stages: []
    };

    let svg;
    let containerRef;
    let hasAnimated = false;
    const width = 925;
    const height = 400;
    const cellSize = 12;
    const cellPadding = 1;
    const stageSpacing = 80;
    const labelHeight = 50;
    const gridWidth = 5;
    const animationDuration = 800;

    const colors = {
        "Entirely Negative": "#8B0000",
        "Somewhat Negative": "#CD5C5C",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#90EE90",
        "Entirely Positive": "#228B22"
    };

    const stageDescriptions = {
        "Initial Discovery": "The moment of first learning about APOE4 status and beginning to understand its implications. This stage often involves genetic testing results, initial research, and processing the emotional impact of this health information.",
        "Initial Planning": "The early phase of developing a strategy to address APOE4 status. This includes first medical consultations, lifestyle research, and creating initial action plans for health management.",
        "Day-to-Day Management": "The ongoing process of implementing and maintaining lifestyle changes, managing health routines, and balancing APOE4 considerations with daily life.",
        "New Treatment Consideration": "Periods of adapting to or trying new medical treatments, supplements, or health protocols. This includes evaluating effectiveness and adjusting approaches based on new research or medical advice.",
        "Long-Term Planning": "Making decisions and preparations for the future, including financial planning, care arrangements, and family discussions about long-term health management strategies."
    };


    const quotes = {
        "Initial Discovery": {
            sentiment: "Entirely Negative",
            persona: "Carrier, APOE4/4",
            index: 2,
            text: "And I know that I can't let my stress about this get me sick. But right now, I'm in a pretty bad mental place about it. This is all very new."
        },
        "Initial Planning": {
            sentiment: "Somewhat Negative",
            persona: "Carrier, APOE4/4",
            index: 15,
            text: "My doctor means well but admits she doesn't have enough APOE4 patients to really understand our unique needs. I feel like I'm teaching her sometimes."
        },
        "Day-to-Day Management": {
            sentiment: "Neutral",
            index: 12,
            persona: "Carrier, APOE4",
            text: "I joined an online support group because nobody in my real life understands. When I try to explain my preventative measures, people tell me I'm being paranoid."
        },
        "New Treatment Consideration": {
            sentiment: "Somewhat Positive",
            index: 5,
            persona: "Carrier, APOE4/4",
            text: "When I learned about the role of insulin resistance and metabolic health in cognitive decline, it felt like finding a key. Now I have specific markers I can track and improve."
        },
        "Long-Term Planning": {
            sentiment: "Entirely Positive",
            index: 3,
            persona: "Carrier, APOE4/4",
            text: "My husband has become my biggest advocate. He learned everything about APOE4, changed his diet with me, and reminds me to stay positive when I get discouraged. Having a partner in this journey makes all the difference."
        }
    };

    onMount(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasAnimated) {
                        hasAnimated = true;
                        createVisualization();
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
            createStaticVisualization();
        }

        return () => {
            if (containerRef) {
                observer.unobserve(containerRef);
            }
        };
    });

    function createStaticVisualization() {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [-120, 0, width, height]);

        const legendGroup = svgElement.append("g")
            .attr("transform", `translate(0, ${height - 40})`);

        Object.entries(colors).forEach(([sentiment, color], i) => {
            createLegendItem(legendGroup, sentiment, color, i * 120);
        });

        data.stages.forEach((stage, stageIndex) => {
            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${stageIndex * (gridWidth * (cellSize + cellPadding) + stageSpacing)}, ${labelHeight})`);
            
            createStageContent(stageGroup, stage, stageIndex, false);
        });
    }

    function createVisualization() {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [-120, 0, width, height]);

        const legendGroup = svgElement.append("g")
            .attr("transform", `translate(0, ${height - 40})`)
            .style("opacity", 0);

        legendGroup.transition()
            .duration(animationDuration / 2)
            .style("opacity", 1);

        Object.entries(colors).forEach(([sentiment, color], i) => {
            createLegendItem(legendGroup, sentiment, color, i * 120);
        });

        data.stages.forEach((stage, stageIndex) => {
            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${stageIndex * (gridWidth * (cellSize + cellPadding) + stageSpacing)}, ${labelHeight})`);
            
            createStageContent(stageGroup, stage, stageIndex, true);
        });
    }

    function createStageContent(stageGroup, stage, stageIndex, animate) {
        let squareCount = 0;
        let countBySentiment = {};
        
        Object.keys(stage.sentiments).forEach(sentiment => {
            countBySentiment[sentiment] = 0;
        });

        const totalSquares = Object.values(stage.sentiments).reduce((a, b) => a + b, 0);
        const totalRows = Math.ceil(totalSquares / gridWidth);
        
        addStageLabels(stageGroup, stage, gridWidth * (cellSize + cellPadding), animate);
        
        Object.entries(stage.sentiments).forEach(([sentiment, count]) => {
            for (let i = 0; i < count; i++) {
                const col = squareCount % gridWidth;
                const row = totalRows - 1 - Math.floor(squareCount / gridWidth);
                
                const stageQuote = quotes[stage.name];
                const isHighlighted = stageQuote && 
                                    sentiment === stageQuote.sentiment && 
                                    countBySentiment[sentiment] === stageQuote.index;
                
                if (animate) {
                    createAnimatedSquare(
                        stageGroup,
                        col,
                        row,
                        sentiment,
                        stage.name,
                        isHighlighted,
                        isHighlighted ? stageQuote.text : null,
                        totalRows,
                        stageIndex
                    );
                } else {
                    createStaticSquare(
                        stageGroup,
                        col,
                        row,
                        sentiment,
                        stage.name,
                        isHighlighted,
                        isHighlighted ? stageQuote.text : null
                    );
                }
                
                countBySentiment[sentiment]++;
                squareCount++;
            }
        });
    }

    function createLegendItem(legendGroup, sentiment, color, position) {
        const item = legendGroup.append("g")
            .attr("transform", `translate(${position}, 0)`);

        item.append("rect")
            .attr("width", 7.25)
            .attr("height", 7.25)
            .attr("rx", 0.5)
            .attr("fill", color);

        item.append("text")
            .attr("x", 14)
            .attr("y", 8)
            .attr("fill", "#6D635B")
            .attr("font-size", "8px")
            .attr("font-family", "IBM Plex Sans Condensed")
            .text(sentiment);
    }

    function createAnimatedSquare(
        stageGroup,
        col,
        row,
        sentiment,
        stageName,
        isHighlighted,
        quote,
        totalRows,
        stageIndex
    ) {
        const startY = -50;
        const finalY = row * (cellSize + cellPadding);
        const finalX = col * (cellSize + cellPadding);
        const baseDelay = (stageIndex * 100) + (col * 50) + (totalRows - row) * 50;
        
        if (isHighlighted) {
            const filterId = `glow-${stageIndex}-${col}-${row}`;
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

            stageGroup.append("rect")
                .attr("x", finalX - 2)
                .attr("y", startY - 2)
                .attr("width", cellSize + 4)
                .attr("height", cellSize + 4)
                .attr("rx", 3)
                .attr("fill", "#FFFFFF")
                .attr("opacity", 0.2)
                .style("filter", `url(#${filterId})`)
                .transition()
                .delay(baseDelay)
                .duration(animationDuration)
                .ease(d3.easeBounceOut)
                .attr("y", finalY - 2);
        }

        const square = stageGroup.append("rect")
            .attr("x", finalX)
            .attr("y", startY)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", colors[sentiment])
            .attr("rx", 2)
            .style("opacity", 0);

        if (isHighlighted) {
            square.style("stroke", "#161616")
                .style("stroke-width", "1.5px")
                .attr("fill-opacity", 0.4)
                .style("stroke-dasharray", "3,2");
        }

        square.transition()
            .delay(baseDelay)
            .duration(animationDuration)
            .ease(d3.easeBounceOut)
            .attr("y", finalY)
            .style("opacity", 1);

        square
            .style("cursor", isHighlighted ? "pointer" : "default")
            .on("mouseenter", (event) => {
                if (isHighlighted) {
                    showTooltip(event, `<div class="font-medium mb-2">${stageName} - ${sentiment}</div><div>${quote}</div>${persona}`);
                    square.transition()
                        .duration(200)
                        .style("stroke-width", "2px")
                        .style("filter", "brightness(1.2)");
                } else {
                    showTooltip(event, `${stageName}: ${sentiment}`);
                }
            })
            .on("mousemove", (event) => {
                if (isHighlighted) {
                    showTooltip(event, `<div class="font-medium mb-2">${stageName} - ${sentiment}</div><div>${quote}</div>`);
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
                        .style("filter", "none");
                }
            });
    }

    function createStaticSquare(
        stageGroup,
        col,
        row,
        sentiment,
        stageName,
        isHighlighted,
        quote
    ) {
        const finalY = row * (cellSize + cellPadding);
        const finalX = col * (cellSize + cellPadding);

        if (isHighlighted) {
            const filterId = `glow-static-${col}-${row}`;
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
                .attr("flood-color", "#FFF")
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

            stageGroup.append("rect")
                .attr("x", finalX - 2)
                .attr("y", finalY - 2)
                .attr("width", cellSize + 4)
                .attr("height", cellSize + 4)
                .attr("rx", 3)
                .attr("fill", "#FFFFFF")
                .attr("opacity", 0.2)
                .style("filter", `url(#${filterId})`);
        }

        const square = stageGroup.append("rect")
            .attr("x", finalX)
            .attr("y", finalY)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", colors[sentiment])
            .attr("rx", 2);

        if (isHighlighted) {
            square.style("stroke", "#161616")
                .style("stroke-width", "1.5px")
                .style("stroke-dasharray", "3,2")
                .style("filter", "saturate(2)");
        }

        square
            .style("cursor", isHighlighted ? "pointer" : "default")
            .on("mouseenter", (event) => {
                if (isHighlighted) {
                    showTooltip(event, `<div class="font-medium mb-2">${stageName} - ${sentiment}</div><div>${quote}</div>`);
                    square.transition()
                        .duration(200)
                        .style("stroke-width", "2px")
                        .style("filter", "saturate(2)")
                        .style("filter", "brightness(1.2)");
                } else {
                    showTooltip(event, `${stageName}: ${sentiment}`);
                }
            })
            .on("mousemove", (event) => {
                if (isHighlighted) {
                    showTooltip(event, `<div class="font-medium mb-2">${stageName} - ${sentiment}</div><div>${quote}</div>`);
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
                        .style("filter", "saturate(2)");
                }
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

    function addStageLabels(stageGroup, stage, width, animate) {
        const total = Object.values(stage.sentiments).reduce((a, b) => a + b, 0);
        
        const labelGroup = stageGroup.append("g")
            .style("cursor", "help");
        
        const titleText = labelGroup.append("text")
            .attr("x", width / 2)
            .attr("y", -30)
            .attr("text-anchor", "middle")
            .attr("fill", "#828487")
            .attr("font-size", "7.25px")
            .attr("font-weight", "800")
            .attr("font-family", "IBM Plex Sans Condensed")
            .text(stage.name)
            .style("opacity", animate ? 0 : 1);

        const countText = labelGroup.append("text")
            .attr("x", width / 2)
            .attr("y", -15)
            .attr("text-anchor", "middle")
            .attr("fill", "#6D635B")
            .attr("font-size", "8.25px")
            .attr("font-family", "IBM Plex Sans Condensed")
            .text(total)
            .style("opacity", animate ? 0 : 1);

        // Add hover effects for the entire label group
        labelGroup
            .on("mouseenter", (event) => {
                showStageDescription(event, stage.name);
                titleText.transition()
                    .duration(200)
                    .attr("fill", "#4A5568");
            })
            .on("mousemove", (event) => {
                showStageDescription(event, stage.name);
            })
            .on("mouseleave", () => {
                hideTooltip();
                titleText.transition()
                    .duration(200)
                    .attr("fill", "#828487");
            });

        if (animate) {
            titleText.transition()
                .duration(animationDuration / 2)
                .style("opacity", 1);

            countText.transition()
                .duration(animationDuration / 2)
                .style("opacity", 1);
        }
    }

    function showStageDescription(event, stageName) {
        const description = stageDescriptions[stageName];
        if (!description) return;

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
            .html(`
                <div class="font-medium mb-2 text-base">${stageName}</div>
                <div class="text-gray-200 leading-relaxed">${description}</div>
            `);
    }
</script>


<div class="relative place-content-center mt-12 justify-center" bind:this={containerRef}>
    <h3 class="text-sm text-slate-500 text-center font-bold underline underline-offset-4 mb-12 uppercase">
        Expressed Sentiment, Major Journey Stages
    </h3>

    <div id="tooltip" class="fixed bg-gray-800 text-white px-4 py-3 rounded text-sm pointer-events-none max-w-md" 
         style="visibility: hidden; z-index: 9999; transform: translateY(-50%);">
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
        align-items: center;
        justify-content: center;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }

    :global(.tooltip-title) {
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
</style>
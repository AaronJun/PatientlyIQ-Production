<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data = {
        stages: []
    };

    let svg;
    let containerRef;
    let hasAnimated = false;
    const width = 925;
    let height = width;
    const cellSize = 14;
    const cellPadding = 2;  
    const stageSpacing = 50;
    const labelHeight = 40;
    const gridWidth = 5;
    const legendHeight = 30;
    const animationDuration = 800;

    const colors = {
        "Entirely Negative": "#8B0000",
        "Somewhat Negative": "#CD5C5C",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#90EE90",
        "Entirely Positive": "#228B22"
    };

    const stageDescriptions = {
        "Symptom Onset": "Initial experience of weakness, numbness, or tingling symptoms, often accompanied by uncertainty and concern about the changes in physical capabilities.",
        "Diagnosis Pathway": "The journey through multiple healthcare providers, diagnostic tests, and specialist referrals before receiving a definitive CIDP diagnosis.",
        "Newly Diagnosed": "Period of processing the CIDP diagnosis, learning about the condition, and beginning to understand treatment options and lifestyle implications.",
        "Treatment Initiation": "Starting IVIg or other treatments, adapting to treatment schedules, and monitoring initial response to therapy.",
        "Long-term Management": "Ongoing balance of treatment maintenance, symptom management, and adaptation to living with CIDP.",
        "Clinical Trial Consideration": "Evaluating participation in research studies, weighing potential benefits against risks, and contributing to CIDP treatment advances."
    };

    const quotes = {
        "Symptom Onset": {
            "Entirely Negative": [{
                persona: "Patient, Early Symptoms",
                index: 2,
                text: "The weakness kept getting worse and nobody could tell me why. I went from being active to struggling with basic tasks. The uncertainty was terrifying."
            }],
            "Somewhat Negative": [{
                persona: "Patient, Progressive Symptoms",
                index: 8,
                text: "My fingers started feeling numb while typing. Then my feet. I kept telling myself it was just stress, but deep down I knew something wasn't right."
            }],
            "Neutral": [{
                persona: "Patient, Initial Signs",
                index: 12,
                text: "When the symptoms started, I focused on documenting everything. The more information I could give doctors, the better chance of figuring this out."
            }]
        },
        "Diagnosis Pathway": {
            "Entirely Negative": [{
                persona: "Patient, Delayed Diagnosis",
                index: 4,
                text: "A year of my life lost to misdiagnoses. Every wrong guess meant more nerve damage, more disability that could have been prevented."
            }],
            "Somewhat Negative": [{
                persona: "Patient, Multiple Referrals",
                index: 15,
                text: "15 different doctors over 9 months. Each one had a different theory. When the neurologist finally mentioned CIDP, I didn't know whether to be relieved or scared."
            }],
            "Neutral": [{
                persona: "Patient, Testing Phase",
                index: 7,
                text: "The EMG test was uncomfortable, but watching the neurologist's face, I could tell she finally saw what was wrong. That's when things started moving forward."
            }]
        },
        "Newly Diagnosed": {
            "Entirely Negative": [{
                persona: "Recently Diagnosed Patient",
                index: 3,
                text: "Reading about CIDP online was overwhelming. Chronic condition? Lifelong treatment? I couldn't stop crying for days."
            }],
            "Somewhat Negative": [{
                persona: "New Patient, Processing",
                index: 11,
                text: "The hardest part was telling my kids. How do you explain to children that mom might not be able to play with them like before?"
            }],
            "Neutral": [{
                persona: "Recently Diagnosed Patient",
                index: 12,
                text: "There's so much information to process. Learning about CIDP is like drinking from a firehose. I'm grateful to have answers but overwhelmed by what comes next."
            }]
        },
        "Treatment Initiation": {
            "Somewhat Negative": [{
                persona: "Patient, Starting Treatment",
                index: 8,
                text: "The time commitment for IVIg treatments is brutal. Five hours, every three weeks. It's like having a part-time job I never wanted."
            }],
            "Somewhat Positive": [{
                persona: "Patient, Treatment Response",
                index: 5,
                text: "After my first round of IVIg, I could feel strength returning to my legs. It's a demanding treatment schedule, but seeing improvement makes it worth it."
            }],
            "Entirely Positive": [{
                persona: "Patient, Treatment Success",
                index: 4,
                text: "Six months into treatment and I just went on a bike ride with my kids. A few months ago, I couldn't even walk to the mailbox. These moments make me cry happy tears."
            }]
        },
        "Long-term Management": {
            "Somewhat Negative": [{
                persona: "Long-term Patient",
                index: 7,
                text: "Some days are still hard. Fatigue hits without warning, and I have to cancel plans. But I'm better at listening to my body now."
            }],
            "Somewhat Positive": [{
                persona: "Stable Patient",
                index: 12,
                text: "Found a great balance with home infusions. It gives me more control over my schedule, and I can actually work full-time again."
            }],
            "Entirely Positive": [{
                persona: "Long-term CIDP Patient",
                index: 3,
                text: "Five years in, and I've learned to navigate this condition. My medical team understands my needs, my family knows how to support me, and I've found ways to still do most things I love."
            }]
        },
        "Clinical Trial Consideration": {
            "Somewhat Negative": [{
                persona: "Patient, Trial Hesitant",
                index: 6,
                text: "The idea of changing treatments when my current one works feels risky. But what if the trial medication could reduce my infusion frequency?"
            }],
            "Neutral": [{
                persona: "Patient, Trial Participant",
                index: 8,
                text: "The trial offers hope for better treatment options, but there's uncertainty too. I keep reminding myself that even if it doesn't help me directly, it might help future CIDP patients."
            }],
            "Entirely Positive": [{
                persona: "Patient, Trial Success",
                index: 4,
                text: "Three months into the trial and my strength scores are better than ever. Plus, the subcutaneous administration saves me hours compared to IVIg."
            }]
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
        
        const relevantQuotes = quotes[stageName]?.[sentiment] || [];
        const isHighlighted = relevantQuotes.some(quote => 
            countBySentiment[sentiment] === quote.index
        );

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
                .style("stroke-width", "1.5px")
                .style("stroke-dasharray", "3,2")
                .style("filter", "brightness(1.5)");
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
                    const relevantQuote = relevantQuotes.find(q => countBySentiment[sentiment] === q.index);
                    showTooltip(event, `
                        <div class="font-medium mb-2">${stageName} - ${sentiment}</div>
                        <div>${relevantQuote.text}</div>
                        <div class="mt-2 text-gray-300">${relevantQuote.persona}</div>
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
                .attr("font-size", "7.25px")
                .attr('letter-spacing', '.2px')
                .attr("font-family", "IBM Plex Mono")
                .attr("text-anchor", "middle")
                .text(sentiment);

            const maxTextWidth = legendItemWidth - 20;
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
                .attr("y", -25)
                .attr("text-anchor", "middle")
                .attr("fill", "#565656")
                .attr("font-size", "6.725px")
                .attr("font-weight", "500")
                .style("text-transform", "uppercase")
                .attr("font-family", "IBM Plex Mono")
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
                .attr("fill", "#565656")
                .attr("font-size", "9.25px")
                .attr("font-weight", "500")
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

<div class="relative flex flex-col items-center bg-slate-100/70 justify-center w-full mt-10" bind:this={containerRef}>
    <div class="heading-container flex flex-col bg-sky-100/20 min-w-full p-6">
    <h3 class="text-xs font-mono font-medium text-slate-800 text-left mb-4 uppercase">
    Post Sentiment at Key Journey Stages
    </h3>
    <p class="text-sm text-slate-600 text-left text-pretty max-w-prose">
        Explore the sentiment distribution at each stage of the CIDP patient journey. Hover over each stage to learn more about the experience.
    </p>
    </div>

    <div id="tooltip" 
         class="fixed bg-gray-800 text-white px-4 py-3 rounded text-sm pointer-events-none max-w-md" 
         style="visibility: hidden; z-index: 9999; transform: translateY(-50%);">
    </div>
    <div class="chart-container flex items-center justify-center pt-12 px-4">
        <svg bind:this={svg}></svg>
    </div>
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

    .heading-container {
        border-bottom: 1px dotted #565656;
    }

    @media (min-width: 768px) {
        .heading-container {
            border-bottom: 1px dotted #565656;
            max-width: 600px;
        }

        .chart-container {
         width: 100%; 
         overflow-x: auto;
        }
    }
</style>
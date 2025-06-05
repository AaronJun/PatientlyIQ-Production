<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    // Transform the original data for waffle chart representation
    const data = {
        stages: [
            {
                name: "2020",
                value: 34,
                label: '$34B',
                description: 'Actual',
                color: '#94a3b8',
                opacity: 0.7,
                // Create squares proportional to value - using 34 squares for $34B
                squares: 34
            },
            {
                name: "2024",
                value: 88,
                label: '$88B', 
                description: 'Current',
                color: '#ff1515',
                opacity: 0.625,
                // 88 squares for $88B
                squares: 88
            },
            {
                name: "2030",
                value: 100,
                label: '$100B',
                description: 'Projected',
                color: '#ff1515',
                opacity: 1,
                // 100 squares for $100B
                squares: 100
            }
        ]
    };

    let svg: SVGElement;
    let containerRef: HTMLElement;
    let hasAnimated = false;
    const width = 600;
    let height: number;
    const cellSize = 12;
    const cellPadding = 1;
    const stageSpacing = 100;
    const labelHeight = 80;
    const gridWidth = 10; // 10 squares per row
    const animationDuration = 800;

    function getMaxSquares() {
        return Math.max(...data.stages.map(stage => stage.squares));
    }

    function calculateHeight() {
        const maxSquares = getMaxSquares();
        const rows = Math.ceil(maxSquares / gridWidth);
        return rows * (cellSize + cellPadding) + labelHeight + 100; // Reduced back to original height
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
        stageGroup: any,
        col: number,
        row: number,
        stage: any,
        yPosition: number,
        animate = false,
        totalRows: number,
        squareIndex: number
    ) {
        const finalX = col * (cellSize + cellPadding);
        const startY = animate ? -50 : yPosition;

        const square = stageGroup.append("rect")
            .attr("x", finalX)
            .attr("y", startY)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", stage.color)
            .attr("rx", 1)
            .style("opacity", animate ? 0 : stage.opacity);

        if (animate) {
            square.transition()
                .delay((col * 20) + ((totalRows - row) * 30))
                .duration(animationDuration)
                .ease(d3.easeBounceOut)
                .attr("y", yPosition)
                .style("opacity", stage.opacity);
        }
    }

    function createVisualization(animate = false) {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [0, 0, width, height]); // Removed legendWidth

        const stageWidth = gridWidth * (cellSize + cellPadding);
        const totalWidth = data.stages.length * (stageWidth + stageSpacing) - stageSpacing;
        const startX = (width - totalWidth) / 2;

        // Create stages
        data.stages.forEach((stage, stageIndex) => {
            const xOffset = startX + stageIndex * (stageWidth + stageSpacing);
            
            const stageGroup = svgElement.append("g")
                .attr("class", `stage-${stageIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

            // Stage title
            const labelGroup = stageGroup.append("g");

            labelGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .attr("class", "stage-name")
                .text(stage.name)
                .style("opacity", animate ? 0 : 1);

            labelGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", -30)
                .attr("text-anchor", "middle")
                .attr("class", "stage-label")
                .style("fill", stage.color)
                .text(stage.label)
                .style("opacity", animate ? 0 : 1);

            labelGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .attr("class", "stage-description")
                .text(stage.description)
                .style("opacity", animate ? 0 : 1);

            // Create squares
            const maxSquares = getMaxSquares();
            const totalRows = Math.ceil(maxSquares / gridWidth);

            for (let i = 0; i < stage.squares; i++) {
                const col = i % gridWidth;
                const row = Math.floor(i / gridWidth);
                const yPosition = (totalRows - 1 - row) * (cellSize + cellPadding);

                createSquare(
                    stageGroup,
                    col,
                    row,
                    stage,
                    yPosition,
                    animate,
                    totalRows,
                    i
                );
            }

            // Total count below
            stageGroup.append("text")
                .attr("x", stageWidth / 2)
                .attr("y", totalRows * (cellSize + cellPadding) + 20)
                .attr("text-anchor", "middle")
                .attr("class", "total-count")
                .text(`${stage.squares} billion`)
                .style("opacity", animate ? 0 : 1);

            if (animate) {
                stageGroup.selectAll("text")
                    .transition()
                    .duration(animationDuration / 2)
                    .style("opacity", 1);
            }
        });
    }

</script>

<div class="chart-container flex flex-col md:flex-row md:align-start md:justify-center p-8 bg-slate-50 outline outline-1 outline-dashed outline-slate-200" bind:this={containerRef}>

    <div class="flex flex-col md:w-1/6 w-full">
    <h5 class="text-md font-semibold text-slate-700 text-left mb-2">
        Japan's Biotech Market Growth
    </h5>
    <p class="text-sm text-slate-600 text-left">
    The Japanese biotech market is projected to grow from $34 billion in 2020 to $100 billion by 2030.    
</p>
    </div>
    
    <div class="svg-container">
        <svg bind:this={svg}></svg>
    </div>
    
</div>

<style>

    .svg-container {
        width: 100%;
        height: 100%;
        align-items: start;
        max-width: 725px;
        margin: 0 auto;
    }

    svg {
        width: 100%;
        height: auto;
    }

    /* Text styling classes */
    :global(.stage-name) {
        fill: #6b7280;
        font-size: 9.725px;
        font-weight: 700;
        font-family: IBM Plex Mono, monospace;
    }

    :global(.stage-label) {
        font-size: 20px;
        font-weight: 800;
        font-family: Inter, sans-serif;
        /* fill color is set dynamically via style attribute */
    }

    :global(.stage-description) {
        fill: #6b7280;
        font-size: 12px;
        font-family: Inter, sans-serif;
    }

    :global(.total-count) {
        fill: #6b7280;
        font-size: 14px;
        font-weight: 600;
        font-family: Inter, sans-serif;
    }
</style> 
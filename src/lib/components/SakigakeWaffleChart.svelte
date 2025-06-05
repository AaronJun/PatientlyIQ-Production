<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import sakigakeData from '../../routes/KYBORAdemo/sakigake.json';
    import SakigakeListDrawer from './SakigakeListDrawer.svelte';

    // Transform the data for waffle chart representation
    const data = {
        years: sakigakeData.map(item => ({
            year: item.year,
            designated: item.products_designated,
            approved: item.products_approved,
            designatedLabel: `${item.products_designated} designated`,
            approvedLabel: `${item.products_approved} approved`,
            designatedColor: '#0ea5e9', // sky-500
            approvedColor: '#10b981', // emerald-500
            // Use the designated count for total squares since it's always >= approved
            totalSquares: item.products_designated
        }))
    };

    let svg: SVGElement;
    let containerRef: HTMLElement;
    let hasAnimated = false;
    const width = 685;
    let height: number;
    const cellSize = 14;
    const cellPadding = 2;
    const yearSpacing = 70;
    const labelHeight = 100;
    const gridWidth = 3; // 3 squares per row for better layout with smaller numbers
    const animationDuration = 600;

    // Drawer state
    let isSakigakeListDrawerOpen = false;

    function openSakigakeListDrawer() {
        isSakigakeListDrawerOpen = true;
    }

    function closeSakigakeListDrawer() {
        isSakigakeListDrawerOpen = false;
    }

    function getMaxSquares() {
        return Math.max(...data.years.map(year => year.totalSquares));
    }

    function calculateHeight() {
        const maxSquares = getMaxSquares();
        const rows = Math.ceil(maxSquares / gridWidth);
        return rows * (cellSize + cellPadding) + labelHeight + 180; // Increased height for labels below
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

        if (data.years.length > 0) {
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
        yearGroup: any,
        col: number,
        row: number,
        isApproved: boolean,
        year: any,
        yPosition: number,
        animate = false,
        totalRows: number,
        squareIndex: number
    ) {
        const finalX = col * (cellSize + cellPadding);
        const startY = animate ? -50 : yPosition;
        const color = isApproved ? year.approvedColor : year.designatedColor;
        const opacity = isApproved ? 0.9 : 0.4;

        const square = yearGroup.append("rect")
            .attr("x", finalX)
            .attr("y", startY)
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("fill", color)
            .attr("rx", 2)
            .style("opacity", animate ? 0 : opacity)
            .style("stroke", isApproved ? year.approvedColor : "none")
            .style("stroke-width", isApproved ? 1 : 0);

        if (animate) {
            square.transition()
                .delay((col * 40) + ((totalRows - row) * 60))
                .duration(animationDuration)
                .ease(d3.easeBounceOut)
                .attr("y", yPosition)
                .style("opacity", opacity);
        }
    }

    function createVisualization(animate = false) {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [0, 0, width, height]);

        const yearWidth = gridWidth * (cellSize + cellPadding);
        const startX = 25;


        // Create years
        data.years.forEach((year, yearIndex) => {
            const xOffset = startX + yearIndex * (yearWidth + yearSpacing);
            
            const yearGroup = svgElement.append("g")
                .attr("class", `year-${yearIndex}`)
                .attr("transform", `translate(${xOffset}, ${labelHeight})`);

            // Create squares first
            const maxSquares = getMaxSquares();
            const totalRows = Math.ceil(maxSquares / gridWidth);

            // First, create all designated squares (lighter)
            for (let i = 0; i < year.designated; i++) {
                const col = i % gridWidth;
                const row = Math.floor(i / gridWidth);
                const yPosition = (totalRows - 1 - row) * (cellSize + cellPadding);

                createSquare(
                    yearGroup,
                    col,
                    row,
                    false, // not approved
                    year,
                    yPosition,
                    animate,
                    totalRows,
                    i
                );
            }

            // Then, overlay approved squares (darker) on top of the first N designated squares
            for (let i = 0; i < year.approved; i++) {
                const col = i % gridWidth;
                const row = Math.floor(i / gridWidth);
                const yPosition = (totalRows - 1 - row) * (cellSize + cellPadding);

                createSquare(
                    yearGroup,
                    col,
                    row,
                    true, // approved
                    year,
                    yPosition,
                    animate,
                    totalRows,
                    i
                );
            }

            // Year labels - positioned BELOW the waffle squares
            const labelGroup = yearGroup.append("g");
            const labelsStartY = totalRows * (cellSize + cellPadding) + 20;

            labelGroup.append("text")
                .attr("x", yearWidth / 2)
                .attr("y", labelsStartY)
                .attr("text-anchor", "middle")
                .attr("class", "year-title")
                .text(year.year.toString())
                .style("opacity", animate ? 0 : 1);

            labelGroup.append("text")
                .attr("x", yearWidth / 2)
                .attr("y", labelsStartY + 20)
                .attr("text-anchor", "middle")
                .attr("class", "designated-label")
                .style("fill", year.designatedColor)
                .text(year.designatedLabel)
                .style("opacity", animate ? 0 : 1);

            labelGroup.append("text")
                .attr("x", yearWidth / 2)
                .attr("y", labelsStartY + 34)
                .attr("text-anchor", "middle")
                .attr("class", "approved-label")
                .style("fill", year.approvedColor)
                .text(year.approvedLabel)
                .style("opacity", animate ? 0 : 1);

            if (animate) {
                yearGroup.selectAll("text")
                    .transition()
                    .duration(animationDuration / 2)
                    .style("opacity", 1);
            }
        });
    }

</script>

<div class="chart-container flex flex-col md:flex-row align-start  justify-center bg-slate-50 outline-1 outline-dashed outline-slate-200" bind:this={containerRef}>
    <div class="flex flex-col w-full md:min-h-full justify-around bg-slate-200 p-2 md:px-4 gap-2 align-start md:w-1/5">
        <div class="flex flex-col gap-2 align-start">
        <h5 class="text-md font-semibold text-slate-700 text-left">
            Sakigake Designations + Approvals
        </h5>
        <p class="text-sm text-slate-600 text-left">
            Annual count of products receiving Sakigake designation and subsequent approvals from 2016-2020. Each square represents one product.
        </p>
        </div>
        <div class="flex flex-row gap-2 align-start justify-start mt-4">
            <button 
            on:click={openSakigakeListDrawer}
            class="bg-sky-900 text-white px-4 py-2 text-sm hover:bg-sky-600 transition-colors text-left"
        >
            Sakigake Designations →
        </button>
        </div>
    </div>
    
    <div class="svg-container">
        <svg bind:this={svg}></svg>
    </div>
    

</div>

<!-- Sakigake List Drawer -->
<SakigakeListDrawer 
    isOpen={isSakigakeListDrawerOpen}
    onClose={closeSakigakeListDrawer}
/>

<style>
    .svg-container {
        width: 100%;
        height: 100%;
        align-items: start;
    }


    /* Text styling classes */
    :global(.year-title) {
        fill: #374151;
        font-size: 8.725px;
        font-weight: 700;
        font-family: IBM Plex Mono, monospace;
    }

    :global(.designated-label) {
        font-size: 8.725px;
        font-weight: 600;
    }

    :global(.approved-label) {
        font-size: 8.725px;
        font-weight: 600;
    }

</style> 
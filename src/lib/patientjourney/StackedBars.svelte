<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";

    interface RelatedSearch {
        term: string;
        volume: number;
    }

    interface SearchTerm {
        term: string;
        volume: number;
        relatedSearches: RelatedSearch[];
    }

    function getBrighterColor(baseColor: string, index: number): string {
        const color = d3.color(baseColor);
        if (!color) return baseColor;
        return color.brighter(index * 2.725).toString();
    }

    export let searchTerms: SearchTerm[] = [];
    export let stageColor: string = "#4A90E2";

    let svg: SVGSVGElement;
    let container: HTMLDivElement;
    let chartData: SearchTerm[];
    let width = 0;
    let height = 450;

    $: {
        // Transform and sort data
        chartData = searchTerms
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 3);
    }

    function createChart() {
        if (!svg || !chartData?.length || !width) return;

        // Clear previous content
        d3.select(svg).selectAll("*").remove();

        const margin = { top: 20, right: 15, bottom: 75, left: 45 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svgEl = d3.select(svg)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create scales
        const x = d3.scaleBand()
            .domain(chartData.map(d => d.term))
            .range([0, innerWidth])
            .padding(0.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => 
                d.relatedSearches.reduce((sum, rs) => sum + rs.volume, 0)
            ) || 0])
            .nice()
            .range([innerHeight, 0]);

        // Add axes
        svgEl.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "middle")
            .attr("max-width", "100px")
            .attr("font-size", "10.25px")
            .attr("dx", "0em")
            .attr("dy", "1.25em");

        svgEl.append("g")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d3.format(",.0f")));

        // Y-axis label
        svgEl.append("text")
            .attr("transform", "rotate(0)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (innerHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "10.25px")
            .style("fill", "#666")
            .text("Monthly Search Volume");

        // Create stacks
        const stack = d3.stack()
            .keys(chartData[0].relatedSearches.map((_, i) => i.toString()))
            .value((d, key) => d.relatedSearches[parseInt(key)]?.volume || 0);

        const stackedData = stack(chartData);

        // Create color scale
        const colorScale = d3.scaleSequential()
            .domain([0, chartData[0].relatedSearches.length - 1])
            .interpolator(t => getBrighterColor(stageColor, t));

        // Add bars
        const barGroups = svgEl.selectAll(".bar-group")
            .data(stackedData)
            .join("g")
            .attr("fill", (d, i) => colorScale(i));

        barGroups.selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => x(d.data.term)!)
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .on("mouseover", (event, d) => {
                const segment = d.data.relatedSearches[d.index];
                const tooltip = d3.select("#chart-tooltip");
                const rect = (event.target as SVGRectElement).getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                
                tooltip
                    .style("visibility", "visible")
                    .style("opacity", "1")
                    .html(`
                        <div class="font-medium">${segment.term}</div>
                        <div class="mt-1">${segment.volume.toLocaleString()} searches</div>
                    `);

                const tooltipNode = tooltip.node() as HTMLDivElement;
                const tooltipRect = tooltipNode.getBoundingClientRect();
                
                // Position tooltip relative to bar segment
                let left = rect.left - containerRect.left + (rect.width / 2);
                let top = rect.top - containerRect.top - tooltipRect.height - 8;

                // Ensure tooltip stays within container bounds
                left = Math.min(Math.max(tooltipRect.width / 2, left), 
                              containerRect.width - tooltipRect.width / 2);

                tooltip
                    .style("left", `${left}px`)
                    .style("top", `${top}px`);
            })
            .on("mouseout", () => {
                d3.select("#chart-tooltip")
                    .style("visibility", "hidden")
                    .style("opacity", "0");
            })
            .on("mousemove", (event) => {
                // Optional: Update tooltip position on mouse move if desired
            });

        // Add total labels
        svgEl.selectAll(".total-label")
            .data(chartData)
            .join("text")
            .attr("class", "total-label")
            .attr("x", d => x(d.term)! + x.bandwidth() / 2)
            .attr("y", d => y(d.relatedSearches.reduce((sum, rs) => sum + rs.volume, 0)) - 8)
            .attr("text-anchor", "middle")
            .attr("fill", "#565656")
            .attr("font-size", "11.25px")
            .attr("font-weight", "600")
            .text(d => d.relatedSearches.reduce((sum, rs) => sum + rs.volume, 0).toLocaleString());
    }

    function updateDimensions() {
        if (container) {
            width = container.clientWidth;
            createChart();
        }
    }

    onMount(() => {
        const resizeObserver = new ResizeObserver(updateDimensions);
        if (container) {
            resizeObserver.observe(container);
        }

        return () => {
            resizeObserver.disconnect();
        };
    });

    $: if (chartData && svg && width) {
        createChart();
    }
</script>

<div class="bar-chart-container relative flex w-full p-6">
    
    <div bind:this={container} class="bar-chart w-3/5 h-fit relative">
        <h3 class="text-sm font-medium mb-4">Search Volume Distribution</h3>
        <svg bind:this={svg} class="w-full h-full"></svg>
        
        <div id="chart-tooltip" 
        class="fixed bg-gray-800 text-white px-4 py-3 rounded text-sm pointer-events-none max-w-md" 
        style="visibility: hidden; z-index: 9999; transform: translateY(-50%);"></div>
    </div>

    <!-- Legend -->
    <div class="legend space-y-4 w-2/5">
        {#each chartData as term}
            <div class="p-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-sm capital">{term.term}</span>
                    <span 
                        class="text-sm px-2 py-1"
                        style="background-color: {stageColor}25; color: {stageColor}"
                    >
                        {term.relatedSearches.reduce((sum, rs) => sum + rs.volume, 0).toLocaleString()} searches
                    </span>
                </div>
                <div class="mt-2 space-y-1">
                    {#each term.relatedSearches as search, i}
                        <div class="flex justify-between items-center text-sm text-gray-600 pl-4">
                            <div class="flex items-center gap-2">
                                <div 
                                    class="w-3 h-3"
                                    style="background-color: {getBrighterColor(stageColor, i)}"
                                ></div>
                                <span class="text-xs capitalize">{search.term}</span>
                            </div>
                            <span class="text-xs">{search.volume.toLocaleString()}</span>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    :global(.tick text) {
        fill: #666;
    }

    :global(.tick line) {
        stroke: #ddd;
    }

    :global(.domain) {
        stroke: #ddd;
    }

    #chart-tooltip {
        transform: translateX(-50%);
        pointer-events: none;
    }

    #chart-tooltip::before {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        width: 8px;
        height: 8px;
        background-color: rgb(17, 24, 39);
    }

    .bar-chart-container {
        max-height: 100%;
    }

    @media (max-width: 768px) {
        .bar-chart-container {
            margin: 0 0 1.25rem 0;
            flex-direction: column;
        }
    }

    @media (max-width: 768px) {
        .bar-chart {
            width: 100%;
        }
    }
    
    @media (max-width: 768px) {
        .legend {
            width: 100%;
        }
    }
</style>
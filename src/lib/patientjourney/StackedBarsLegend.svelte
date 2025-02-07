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

    export let searchTerms: SearchTerm[] = [];
    export let stageColor: string = "#4A90E2";

    let svg: SVGSVGElement;
    let container: HTMLDivElement;
    let tooltipDiv: HTMLDivElement;
    let chartData: SearchTerm[];
    let width = 0;
    let height = 450;

    function getBrighterColor(baseColor: string, index: number): string {
        const color = d3.color(baseColor);
        if (!color) return baseColor;
        return color.brighter(index * 1.725).toString();
    }

    $: {
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
            .style("text-anchor", "start")
            .style("align-items", "top")
            .attr("font-size", "10.25px")
            .attr("font-weight", "600")
            .attr("transform", "rotate(-90)")
            .attr("dx", "1em")
            .attr("dy", "-9.25em");

        svgEl.append("g")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d3.format(",.0f")));

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
            .attr("x", d => x(d.data.term))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .attr("class", "cursor-pointer")
            .on("click", (event, d) => {
                const segment = d.data.relatedSearches[d.index];
                alert(`Clicked: ${segment.term}\nVolume: ${segment.volume}`);
            })
            .on("mouseenter", (event, d) => {
                if (!tooltipDiv) return;
                const segment = d.data.relatedSearches[d.index];
                
                tooltipDiv.innerHTML = `
                    <div class="font-medium mb-2">${segment.term}</div>
                    <div class="mt-1">${segment.volume.toLocaleString()} searches</div>
                `;
                tooltipDiv.style.visibility = "visible";
                tooltipDiv.style.left = `${event.pageX + 10}px`;
                tooltipDiv.style.top = `${event.pageY - 10}px`;
            })
            .on("mousemove", (event, d) => {
                if (!tooltipDiv) return;
                tooltipDiv.style.left = `${event.pageX + 10}px`;
                tooltipDiv.style.top = `${event.pageY - 10}px`;
            })
            .on("mouseleave", () => {
                if (!tooltipDiv) return;
                tooltipDiv.style.visibility = "hidden";
            });

        // Add total labels
        svgEl.selectAll(".total-label")
            .data(chartData)
            .join("text")
            .attr("class", "total-label")
            .attr("x", d => x(d.term) + x.bandwidth() / 2)
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
    </div>

    <div bind:this={tooltipDiv}
         class="fixed bg-gray-800 text-white px-4 py-3 rounded text-sm pointer-events-none max-w-md" 
         style="visibility: hidden; z-index: 9999; transform: translateY(-50%);">
    </div>

    <!-- Legend -->
    <div class="legend space-y-4 w-2/5">
        {#each chartData as term}
            <div class="p-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-sm capitalize">{term.term}</span>
                    <span 
                        class="text-sm px-2 py-1 rounded"
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
                                    class="w-3 h-3 rounded"
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

    @media (max-width: 768px) {
        .bar-chart-container {
            flex-direction: column;
        }

        .bar-chart,
        .legend {
            width: 100%;
        }
    }
</style>
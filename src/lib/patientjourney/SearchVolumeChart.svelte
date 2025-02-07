<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, Svg, Axis, Bar, Tooltip } from 'layerchart';
    import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
    import { max } from 'd3-array';
    import { cubicInOut } from 'svelte/easing';

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

    let chartData = [];
    let colorScale;

    $: {
        // Transform the data into a flat structure
        chartData = searchTerms
            .sort((a, b) => b.volume - a.volume)
            .slice(0, 3)
            .flatMap(term => 
                term.relatedSearches.map(related => ({
                    mainTerm: term.term,
                    term: related.term,
                    value: related.volume,
                    total: term.volume
                }))
            );

        const uniqueTerms = [...new Set(chartData.map(d => d.term))];
        colorScale = scaleOrdinal()
            .domain(uniqueTerms)
            .range(generateColorRange(stageColor, uniqueTerms.length));
    }

    function generateColorRange(baseColor: string, count: number): string[] {
        return Array.from({ length: count }, (_, i) => {
            const opacity = 1 - (i * 0.5 / count);
            return `${baseColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        });
    }

    function handleBarClick(bar) {
        alert(`Clicked bar:\nTerm: ${bar.term}\nValue: ${bar.value}`);
    }
</script>

<div class="relative w-full bg-white rounded-lg shadow-sm p-6">
    <h3 class="text-sm font-medium mb-4">Search Volume Distribution</h3>
    
    <div class="h-[400px]">
        <Chart
            {data}
            x="mainTerm"
            xScale={scaleBand().paddingInner(0.4).paddingOuter(0.1)}
            y="value"
            yScale={scaleLinear()}
            yNice={4}
            c="term"
            cScale={colorScale}
            padding={{ left: 60, bottom: 80, right: 20, top: 20 }}
        >
            <Svg let:data let:width let:height let:xScale let:yScale let:cScale>
                <Axis placement="left" grid rule />
                <Axis 
                    placement="bottom" 
                    rule
                    transform={({ text }) => {
                        text.attr('transform', 'rotate(-45)')
                            .attr('text-anchor', 'end')
                            .attr('dy', '0.5em')
                            .attr('dx', '-0.5em');
                    }}
                />
                {#each chartData as d}
                    <rect
                        x={xScale(d.mainTerm)}
                        y={yScale(d.value)}
                        width={xScale.bandwidth()}
                        height={height - yScale(d.value)}
                        fill={cScale(d.term)}
                        stroke="white"
                        stroke-width="1"
                        class="cursor-pointer hover:opacity-80 transition-opacity"
                        on:click={() => handleBarClick(d)}
                        on:mouseenter={(e) => {
                            const tooltip = document.getElementById('tooltip');
                            if (tooltip) {
                                tooltip.style.visibility = 'visible';
                                tooltip.style.left = `${e.pageX + 10}px`;
                                tooltip.style.top = `${e.pageY - 10}px`;
                                tooltip.innerHTML = `
                                    <div class="font-medium">${d.mainTerm}</div>
                                    <div>${d.term}: ${d.value.toLocaleString()}</div>
                                `;
                            }
                        }}
                        on:mouseleave={() => {
                            const tooltip = document.getElementById('tooltip');
                            if (tooltip) {
                                tooltip.style.visibility = 'hidden';
                            }
                        }}
                    />
                {/each}
            </Svg>
        </Chart>
    </div>

    <!-- Tooltip -->
    <div 
        id="tooltip"
        class="fixed z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
        style="visibility: hidden;"
    ></div>

    <!-- Legend -->
    <div class="mt-8 space-y-4">
        {#each [...new Set(chartData.map(d => d.mainTerm))] as mainTerm}
            <div class="p-4 bg-gray-50 rounded-lg">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{mainTerm}</span>
                    <span 
                        class="text-sm px-2 py-1 rounded"
                        style="background-color: {stageColor}25; color: {stageColor}"
                    >
                        {chartData
                            .filter(d => d.mainTerm === mainTerm)
                            .reduce((sum, d) => sum + d.value, 0)
                            .toLocaleString()} total searches
                    </span>
                </div>
                <div class="mt-2 space-y-1">
                    {#each chartData.filter(d => d.mainTerm === mainTerm) as item}
                        <div class="flex justify-between items-center text-sm text-gray-600 pl-4">
                            <div class="flex items-center gap-2">
                                <div 
                                    class="w-3 h-3 rounded"
                                    style:background-color={colorScale(item.term)}
                                ></div>
                                <span>{item.term}</span>
                            </div>
                            <span>{item.value.toLocaleString()}</span>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    :global(.tick text) {
        font-size: 12px;
        fill: #666;
    }

    :global(.tick line) {
        stroke: #ddd;
    }

    :global(.domain) {
        stroke: #ddd;
    }
</style>
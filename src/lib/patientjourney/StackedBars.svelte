<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, Svg, Bars, Grid, Axis } from 'layerchart';
    import { scaleBand, scaleLinear, scaleOrdinal } from 'd3-scale';
    import { stack } from 'd3-shape';
    import * as d3 from 'd3';

    export let treatmentData = [];
    export let stageColor = "#4A90E2";
    
    let width;
    let height = 450;
    let container;

    $: stackedData = processData(treatmentData);
    $: colorScale = scaleOrdinal()
        .domain(['Complete Response', 'Partial Response', 'No Response'])
        .range(generateColorRange(stageColor, 3));

    function generateColorRange(baseColor, count) {
        return Array.from({ length: count }, (_, i) => {
            const color = d3.color(baseColor);
            return color.brighter(i * 0.5).toString();
        });
    }

    function processData(rawData) {
        if (!rawData?.length) return [];

        // Transform data for stacking
        const processedData = rawData.map(item => ({
            term: item.term,
            volume: item.volume,
            'Complete Response': item.relatedSearches.find(rs => rs.term === 'Complete Response')?.volume || 0,
            'Partial Response': item.relatedSearches.find(rs => rs.term === 'Partial Response')?.volume || 0,
            'No Response': item.relatedSearches.find(rs => rs.term === 'No Response')?.volume || 0
        }));

        const stackData = stack()
            .keys(['Complete Response', 'Partial Response', 'No Response'])
            .value((d, key) => d[key] || 0);

        return stackData(processedData);
    }

    let tooltipContent = '';
    let tooltipVisible = false;
    let tooltipX = 0;
    let tooltipY = 0;

    function showTooltip(event, d) {
        const treatment = d.data.term;
        const responseType = Object.keys(d.data).find(key => d.data[key] === d[1] - d[0]);
        const value = d[1] - d[0];

        tooltipContent = `
            <div class="font-medium mb-1">${treatment}</div>
            <div>${responseType}: ${value}%</div>
        `;
        tooltipVisible = true;
        tooltipX = event.clientX + 10;
        tooltipY = event.clientY - 10;
    }
</script>

<div class="relative w-full p-6" bind:clientWidth={width}>
    <h3 class="text-sm font-medium mb-4">Treatment Response Distribution</h3>
    
    <div bind:this={container} class="w-full">
        <Chart
            data={treatmentData}
            x={d => d.term}
            y={d => d.volume}
            xScale={scaleBand().padding(0.3)}
            yScale={scaleLinear()}
            padding={{ top: 20, right: 15, bottom: 40, left: 45 }}
        >
            <Svg>
                <Grid y />
                <Axis placement="bottom" />
                <Axis placement="left" />
                
                <Bars
                    data={stackedData}
                    fill={colorScale}
                    on:pointerenter={showTooltip}
                    on:pointermove={(e) => {
                        tooltipX = e.clientX + 10;
                        tooltipY = e.clientY - 10;
                    }}
                    on:pointerleave={() => tooltipVisible = false}
                />
            </Svg>
        </Chart>
    </div>

    {#if tooltipVisible}
        <div 
            class="fixed z-50 bg-gray-800 text-white px-4 py-3 rounded text-sm pointer-events-none"
            style="left: {tooltipX}px; top: {tooltipY}px;"
        >
            {@html tooltipContent}
        </div>
    {/if}
</div>

<style>
    :global(.tick text) {
        fill: #666;
        font-size: 12px;
    }

    :global(.tick line) {
        stroke: #ddd;
    }

    :global(.domain) {
        stroke: #ddd;
    }
</style>
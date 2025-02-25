<!-- AxisX.svelte -->
<script>
    import { getContext } from 'svelte';
    
    const { width, height, xScale, padding } = getContext('LayerCake');
    
    export let ticks = undefined;
    export let tickCount = 5;
    export let formatTick = d => d;
    export let gridlines = false;
    export let baseline = true;
    export let snapTicks = false;
    export let tickMarks = true;
    export let tickLength = 6;
    export let tickColor = '#999';
    export let gridColor = '#ddd';
    export let gridDasharray = '2,2';
    export let baselineColor = '#999';
    export let fontFamily = 'sans-serif';
    export let fontSize = 10;
    export let fontColor = '#666';
    export let label = undefined;
    export let labelOffset = 30;

    let calculatedTicks = [];
    
    $: {
        if (ticks === undefined) {
            if (typeof $xScale.ticks === 'function') {
                calculatedTicks = $xScale.ticks(tickCount);
            } else {
                calculatedTicks = $xScale.domain();
            }
        } else {
            calculatedTicks = ticks;
        }
    }
</script>

<g class="axis x-axis">
    <!-- Baseline -->
    {#if baseline === true}
        <line
            class="baseline"
            y1={$height}
            y2={$height}
            x1={0}
            x2={$width}
            stroke={baselineColor}
        />
    {/if}
    
    <!-- Tick marks and labels -->
    {#each calculatedTicks as tick}
        <g class="tick" transform="translate({$xScale(tick)},{$height})">
            {#if tickMarks === true}
                <line y1={0} y2={tickLength} stroke={tickColor} />
            {/if}
            <text
                y={tickLength + fontSize}
                text-anchor="middle"
                dominant-baseline="hanging"
                font-family={fontFamily}
                font-size={fontSize}
                fill={fontColor}
            >{formatTick(tick)}</text>
        </g>
        
        <!-- Grid lines -->
        {#if gridlines === true}
            <line
                class="gridline"
                y1={0}
                y2={$height}
                x1={$xScale(tick)}
                x2={$xScale(tick)}
                stroke={gridColor}
                stroke-dasharray={gridDasharray}
            />
        {/if}
    {/each}
    
    <!-- Axis label -->
    {#if label}
        <text
            class="axis-label"
            x={$width / 2}
            y={$height + labelOffset}
            text-anchor="middle"
            font-family={fontFamily}
            font-size={fontSize + 2}
            fill={fontColor}
        >{label}</text>
    {/if}
</g>

<style>
    .tick text {
        user-select: none;
    }
</style>
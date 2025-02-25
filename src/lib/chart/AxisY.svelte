<!-- AxisY.svelte -->
<script>
    import { getContext } from 'svelte';
    
    const { height, yScale, padding } = getContext('LayerCake');
    
    export let ticks = undefined;
    export let tickCount = 5;
    export let formatTick = d => d;
    export let gridlines = false;
    export let baseline = false;
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
    export let labelOffset = 35;

    let calculatedTicks = [];
    
    $: {
        if (ticks === undefined) {
            if (typeof $yScale.ticks === 'function') {
                calculatedTicks = $yScale.ticks(tickCount);
            } else {
                calculatedTicks = $yScale.domain();
            }
        } else {
            calculatedTicks = ticks;
        }
    }
</script>

<g class="axis y-axis">
    <!-- Baseline -->
    {#if baseline === true}
        <line
            class="baseline"
            y1={0}
            y2={$height}
            x1={0}
            x2={0}
            stroke={baselineColor}
        />
    {/if}
    
    <!-- Tick marks and labels -->
    {#each calculatedTicks as tick}
        <g class="tick" transform="translate(0, {$yScale(tick)})">
            {#if tickMarks === true}
                <line x1={-tickLength} x2={0} stroke={tickColor} />
            {/if}
            <text
                x={-tickLength - 3}
                dy=".32em"
                text-anchor="end"
                font-family={fontFamily}
                font-size={fontSize}
                fill={fontColor}
            >{formatTick(tick)}</text>
        </g>
        
        <!-- Grid lines -->
        {#if gridlines === true}
            <line
                class="gridline"
                y1={$yScale(tick)}
                y2={$yScale(tick)}
                x1={0}
                x2="100%"
                stroke={gridColor}
                stroke-dasharray={gridDasharray}
            />
        {/if}
    {/each}
    
    <!-- Axis label -->
    {#if label}
        <text
            class="axis-label"
            transform="rotate(-90)"
            x={-$height / 2}
            y={-labelOffset}
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
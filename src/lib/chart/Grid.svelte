<!-- Grid.svelte -->
<script>
    import { getContext } from 'svelte';
    
    const { width, height, xScale, yScale } = getContext('LayerCake');
    
    export let horizontal = true;
    export let vertical = false;
    export let count = 5;
    export let strokeWidth = 1;
    export let strokeDasharray = '2,2';
    export let color = '#ddd';
    
    // Calculate tick positions
    $: xTicks = vertical && typeof $xScale.ticks === 'function' 
        ? $xScale.ticks(count) 
        : [];
    
    $: yTicks = horizontal && typeof $yScale.ticks === 'function' 
        ? $yScale.ticks(count) 
        : [];
</script>

<g class="grid-lines">
    <!-- Horizontal grid lines -->
    {#if horizontal}
        {#each yTicks as tick}
            <line
                class="grid-line horizontal"
                y1={$yScale(tick)}
                y2={$yScale(tick)}
                x1={0}
                x2={$width}
                stroke={color}
                stroke-width={strokeWidth}
                stroke-dasharray={strokeDasharray}
            />
        {/each}
    {/if}
    
    <!-- Vertical grid lines -->
    {#if vertical}
        {#each xTicks as tick}
            <line
                class="grid-line vertical"
                y1={0}
                y2={$height}
                x1={$xScale(tick)}
                x2={$xScale(tick)}
                stroke={color}
                stroke-width={strokeWidth}
                stroke-dasharray={strokeDasharray}
            />
        {/each}
    {/if}
</g>

<style>
    .grid-line {
        vector-effect: non-scaling-stroke;
    }
</style>
<!-- Line.svelte -->
<script>
    import { getContext } from 'svelte';
    import { line } from 'd3-shape';

    const { data, xGet, yGet, width, height } = getContext('LayerCake');

    export let color = '#000';
    export let width$ = 1;
    export let highlightedPoints = [];

    $: path = line()
        .x(d => $xGet(d))
        .y(d => $yGet(d));

    $: d = path($data);
</script>

<!-- Line path -->
<path class="line-path" d={d} stroke={color} stroke-width={width$} fill="none"></path>

<!-- Highlight dots for milestone points -->
{#if highlightedPoints && highlightedPoints.length > 0}
    {#each highlightedPoints as point}
        <circle 
            cx={$xGet(point)} 
            cy={$yGet(point)} 
            r={6} 
            fill="#fff" 
            stroke={color} 
            stroke-width={2} 
        />
    {/each}
{/if}

<style>
    .line-path {
        pointer-events: none;
    }
</style>
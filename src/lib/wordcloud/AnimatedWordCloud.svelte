<!-- AnimatedWordCloud.svelte -->
<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import * as d3 from 'd3';
    import WordCloudLayout from './WordCloudLayout.svelte';

    export let data = [];
    export let width = 200;
    export let height = 200;
    export let padding = 2;
    export let rotate = 0;
    export let fontSize = 10;
    
    let mounted = false;
    
    onMount(() => {
        mounted = true;
    });

    const colorScale = d3.scaleOrdinal()
        .range(d3.schemeSet3);
</script>

<div class="word-cloud-container" style="width: {width}px; height: {height}px;">
    <WordCloudLayout
        words={data}
        {width}
        {height}
        {padding}
        {rotate}
        {fontSize}
        let:transformedWords
    >
        <svg 
            width={width} 
            height={height}
            viewBox="0 0 {width} {height}"
        >
            <g transform="translate({width/2}, {height/2})">
                {#each transformedWords as word, i (word.text)}
                    {#if mounted}
                        <text
                            in:fly={{
                                y: 50,
                                duration: 600,
                                delay: i * 50
                            }}
                            style="fill: {colorScale(i)}"
                            font-size="{word.size}px"
                            transform="translate({word.x},{word.y}) rotate({word.rotate})"
                            text-anchor="middle"
                            dominant-baseline="middle"
                        >
                            {word.text}
                        </text>
                    {/if}
                {/each}
            </g>
        </svg>
    </WordCloudLayout>
</div>

<style>
    .word-cloud-container {
        position: relative;
    }

    svg {
        width: 100%;
        height: 100%;
    }

    text {
        font-family: system-ui, -apple-system, sans-serif;
        cursor: default;
        user-select: none;
    }

    text:hover {
        filter: brightness(0.8);
    }
</style>
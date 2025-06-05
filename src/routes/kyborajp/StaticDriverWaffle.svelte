<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { categoryColors } from './negativeSentimentData';

    export let data = null;
    export let stage = "";
    export let sentiment = "";
    
    let svg;
    const width = 1200;
    const height = 300;
    const cellSize = 50;
    const cellPadding = 2;
    const gridWidth = 20;  // 10x10 grid for 100 blocks
    const gridHeight = 5;
    const defaultColor = "#E5E7EB";  // Default gray color

    onMount(() => {
        createGrid();
    });

    $: if (data && sentiment) {
        console.log('Updating waffle with data:', data);
        console.log('Current sentiment:', sentiment);
        updateColors();
    }

    function createGrid() {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [0, 0, width, height]);

        // Create 100 squares in a 10x10 grid
        for (let row = 0; row < gridHeight; row++) {
            for (let col = 0; col < gridWidth; col++) {
                svgElement.append("rect")
                    .attr("class", "waffle-square")
                    .attr("x", col * (cellSize + cellPadding))
                    .attr("y", row * (cellSize + cellPadding))
                    .attr("width", cellSize)
                    .attr("height", cellSize)
                    .attr("fill", defaultColor)
                    .attr("rx", 2)
                    .attr("ry", 2)
                    .style("transition", "fill 0.3s ease");
            }
        }
    }

    function updateColors() {
        if (!data) {
            // Reset all squares to default color
            d3.select(svg).selectAll(".waffle-square")
                .transition()
                .duration(300)
                .attr("fill", defaultColor);
            return;
        }

        let squareCount = 0;
        const total = Object.values(data).reduce((a: number, b: number) => a + b, 0);
        
        // Calculate proportions for 100 squares
        const scaledData = {};
        Object.entries(data).forEach(([category, value]) => {
            scaledData[category] = Math.round((value as number / total) * 100);
        });

        console.log('Scaled data:', scaledData);

        const squares = d3.select(svg).selectAll(".waffle-square");
        
        squares.each(function(d, i) {
            let color = defaultColor;
            let title = "";
            
            // Find which category this square belongs to
            for (const [category, count] of Object.entries(scaledData)) {
                if (squareCount < count) {
                    color = categoryColors[category]; // Use colors from negativeSentimentData
                    title = `${category}: ${data[category]}`;
                    break;
                }
                squareCount += count;
            }

            // Update square color with transition
            d3.select(this)
                .transition()
                .duration(300)
                .attr("fill", color);

            // Update tooltip
            d3.select(this)
                .select("title")
                .text(title || "");
        });
    }
</script>

<div class="waffle-container">
    {#if !data}
        <div class="flex items-center justify-center h-full text-gray-500">
            Hover over negative sentiment segments to see driver breakdown
        </div>
    {/if}
    <svg bind:this={svg}></svg>
</div>

<style>
    .waffle-container {
        width: 100%;
        height: 100%;
        min-height: 300px;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }
</style>
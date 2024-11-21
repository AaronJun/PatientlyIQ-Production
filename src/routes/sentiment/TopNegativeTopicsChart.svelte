<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data: Array<{topic: string, score: number}>;
    
    let svg: SVGElement;
    let container: HTMLDivElement;
    let width: number;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 120 };

    onMount(() => {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                width = entry.contentRect.width;
                if (width && height) createChart();
            }
        });
        
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    });

    function createChart() {
        d3.select(svg).selectAll("*").remove();

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, chartWidth]);

        const y = d3.scaleBand()
            .domain(data.map(d => d.topic))
            .range([0, chartHeight])
            .padding(0.2);

        const svgEl = d3.select(svg)
            .attr("width", width)
            .attr("height", height);

        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add bars
        g.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", 0)
            .attr("y", d => y(d.topic) || 0)
            .attr("width", d => x(d.score))
            .attr("height", y.bandwidth())
            .attr("fill", "#FF5151");

        // Add score labels
        g.selectAll(".score")
            .data(data)
            .join("text")
            .attr("class", "score")
            .attr("x", d => x(d.score) + 5)
            .attr("y", d => (y(d.topic) || 0) + y.bandwidth() / 2)
            .attr("dy", "0.35em")
            .text(d => `${d.score}%`)
            .attr("fill", "#666")
            .style("font-size", "12px");

        // Add y axis
        g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "12px");
    }

    $: {
        if (data && width && height) {
            createChart();
        }
    }
</script>

<div class="chart-container" bind:this={container}>
    <svg bind:this={svg}></svg>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 200px;
        position: relative;
    }
</style>
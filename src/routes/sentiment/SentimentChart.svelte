
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    
    import { fade } from 'svelte/transition';

    export let data: any[];
    
    const dispatch = createEventDispatcher();
    let svg: SVGElement;
    
    const margin = { top: 50, right: 20, bottom: 100, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const colors = {
        positive: '#4CAF50',
        neutral: '#9E9E9E',
        negative: '#ff5151',
        mixed: '#FFC107'
    };

    onMount(() => {
        createChart();
    });

    function createChart() {
        // Clear existing content
        d3.select(svg).selectAll("*").remove();

        const svgEl = d3.select(svg)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        const g = svgEl.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X scale
        const x = d3.scaleBand()
            .domain(data.map(d => d.category))
            .range([0, width])
            .padding(0.1);

        // Y scale
        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // Stack the data
        const stack = d3.stack()
            .keys(["positive", "neutral", "negative", "mixed"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(data);

        // Create groups for each series
        const groups = g.selectAll("g.series")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "series")
            .style("fill", (d) => colors[d.key]);

        // Create rectangles for each segment
        groups.selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => x(d.data.category))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .attr("cursor", "pointer")
            .on("mouseover", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.8);
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
            })
            .on("click", (event, d) => {
                dispatch('barClick', d.data);
            });

        // Add axes
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "middle");

        g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"));

        // Add legend
        const legend = svgEl.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(Object.entries(colors))
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${margin.left + i * 100},${height + margin.top + 30})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", d => d[1]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d[0].charAt(0).toUpperCase() + d[0].slice(1));
    }
</script>

<div class="sentiment-chart font-mono">
    <svg bind:this={svg}></svg>
</div>

<style>
    .sentiment-chart :global(text) {
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.65rem;
        fill: #7c7c7c;
    }

    .sentiment-chart :global(.domain) {
        stroke: #e5e7eb;
    }

    .sentiment-chart :global(.tick line) {
        stroke: #e5e7eb;
    }
</style>

<!-- PRVLayerChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    interface SaleDataPoint {
        year: number;
        available: number;
        price: number;
    }

    // Historical secondary‑market sales with confirmed prices
    export let salesData: SaleDataPoint[] = [
        { year: 2014, available: 4,  price:  96250000 },
        { year: 2015, available: 9,  price: 198333333 },
        { year: 2016, available: 10, price: 290000000 },
        { year: 2019, available: 21, price:  95000000 },
        { year: 2020, available: 24, price:  99000000 },
        { year: 2022, available: 28, price: 100000000 },
        { year: 2024, available: 30, price: 103000000 }
    ];

    // Format as USD with no decimals
    const fmtUSD = (v: number): string => new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(v);

    // Format millions
    const fmtMillions = (v: number): string => `$${Math.round(v / 1000000)}M`;

    let chart: HTMLDivElement;
    let width = 800;
    let height = 400;
    let margin = { top: 20, right: 60, bottom: 40, left: 60 };

    function createChart() {
        // Clear any existing chart
        d3.select(chart).selectAll("*").remove();

        // Create SVG
        const svg = d3.select(chart)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Calculate inner dimensions
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(salesData, d => d.year) as [number, number])
            .range([0, innerWidth])
            .nice();

        const yPriceScale = d3.scaleLinear()
            .domain([0, d3.max(salesData, d => d.price) as number])
            .range([innerHeight, 0])
            .nice();

        const yAvailableScale = d3.scaleLinear()
            .domain([0, d3.max(salesData, d => d.available) as number])
            .range([innerHeight, 0])
            .nice();

        // Create line generator
        const line = d3.line<SaleDataPoint>()
            .x(d => xScale(d.year))
            .y(d => yPriceScale(d.price));

        // Add grid lines
        svg.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(yPriceScale)
                .tickSize(-innerWidth)
                .tickFormat(() => ""))
            .style("stroke-dasharray", "2,2")
            .style("stroke-opacity", 0.2);

        // Add bars for availability
        const barWidth = Math.min(40, innerWidth / salesData.length - 10);
        svg.selectAll(".bar")
            .data(salesData)
            .join("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.year) - barWidth/2)
            .attr("y", d => yAvailableScale(d.available))
            .attr("width", barWidth)
            .attr("height", d => innerHeight - yAvailableScale(d.available))
            .attr("fill", "#82C3EC")
            .attr("opacity", 0.5);

        // Add price line
        svg.append("path")
            .datum(salesData)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#4A90E2")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add price points
        svg.selectAll(".point")
            .data(salesData)
            .join("circle")
            .attr("class", "point")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yPriceScale(d.price))
            .attr("r", 4)
            .attr("fill", "#4A90E2");

        // Add axes
        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale)
                .tickFormat(d => d.toString())
                .ticks(salesData.length));

        const yPriceAxis = svg.append("g")
            .call(d3.axisLeft(yPriceScale)
                .tickFormat(d => fmtMillions(d as number)));

        const yAvailableAxis = svg.append("g")
            .attr("transform", `translate(${innerWidth},0)`)
            .call(d3.axisRight(yAvailableScale)
                .tickFormat(d => d.toString()));

        // Add axis labels
        svg.append("text")
            .attr("transform", `translate(${-margin.left + 10},${innerHeight/2}) rotate(-90)`)
            .style("text-anchor", "middle")
            .text("Price (USD)");

        svg.append("text")
            .attr("transform", `translate(${innerWidth + margin.right - 10},${innerHeight/2}) rotate(90)`)
            .style("text-anchor", "middle")
            .text("PRVs Available");

        svg.append("text")
            .attr("transform", `translate(${innerWidth/2},${innerHeight + margin.bottom - 5})`)
            .style("text-anchor", "middle")
            .text("Year");

        // Add tooltips
        const tooltip = d3.select(chart)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.selectAll(".point, .bar")
            .on("mouseover", (event, d: SaleDataPoint) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Year: ${d.year}<br/>Price: ${fmtUSD(d.price)}<br/>Available: ${d.available}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    onMount(() => {
        createChart();
    });
</script>

<div class="chart-container" bind:this={chart}></div>

<style>
    .chart-container {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        position: relative;
    }

    :global(.tooltip) {
        position: absolute;
        padding: 8px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 100;
    }

    :global(.line) {
        transition: stroke-width 0.2s;
    }

    :global(.point) {
        transition: r 0.2s;
    }

    :global(.point:hover) {
        r: 6;
    }

    :global(.bar) {
        transition: opacity 0.2s;
    }

    :global(.bar:hover) {
        opacity: 0.8;
    }
</style> 
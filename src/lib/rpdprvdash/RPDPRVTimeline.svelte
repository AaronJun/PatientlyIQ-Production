<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data: any[] = [];
    export let onYearSelect: (year: string) => void;
    
    let svg: SVGElement;
    let selectedYear: string | null = null;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const height = 100;
    const width = 800;
    
    // Process data to get counts by year
    $: yearData = Object.entries(
        data.reduce((acc, entry) => {
            const year = entry["RPDD Year"];
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    )
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year));

    function createVisualization() {
        if (!svg || !yearData.length) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const xScale = d3.scalePoint()
            .domain(yearData.map(d => d.year))
            .range([0, innerWidth])
            .padding(0.5);

        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(yearData, d => d.count) || 0])
            .range([5, 25]);

        const g = svgElement.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add connecting line
        g.append("line")
            .attr("x1", 0)
            .attr("x2", innerWidth)
            .attr("y1", innerHeight / 2)
            .attr("y2", innerHeight / 2)
            .attr("stroke", "#E2E8F0")
            .attr("stroke-width", 2);

        // Create year groups
        const yearGroups = g.selectAll(".year-group")
            .data(yearData)
            .join("g")
            .attr("class", "year-group")
            .attr("transform", d => `translate(${xScale(d.year)},${innerHeight/2})`)
            .style("cursor", "pointer");

        // Add circles
        yearGroups.append("circle")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => d.year === selectedYear ? "#FF4A4A" : "#A598D9")
            .attr("stroke", "#37587e")
            .attr("stroke-width", 1)
            .attr("class", "year-circle")
            .on("mouseenter", function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", "#FF4A4A");
            })
            .on("mouseleave", function(event, d) {
                if (d.year !== selectedYear) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("fill", "#A598D9");
                }
            })
            .on("click", (event, d) => {
                selectedYear = d.year;
                onYearSelect(d.year);
                updateSelection();
            });

        // Add year labels
        yearGroups.append("text")
            .attr("y", d => radiusScale(d.count) + 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#4A5568")
            .attr("font-size", "12px")
            .text(d => d.year);

        // Add count labels
        yearGroups.append("text")
            .attr("y", 5)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .text(d => d.count);
    }

    function updateSelection() {
        if (!svg) return;

        d3.select(svg)
            .selectAll(".year-circle")
            .attr("fill", d => d.year === selectedYear ? "#FF4A4A" : "#A598D9");
    }

    $: if (data.length > 0 && svg) {
        createVisualization();
    }
</script>

<div class="timeline-container">
    <svg
        bind:this={svg}
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        class="w-full h-auto"
    />
</div>

<style>
    .timeline-container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        position: relative;
    }
</style>
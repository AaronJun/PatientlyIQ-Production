<!-- RPDTimeline.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data: any[] = [];
    export let onYearSelect: (year: string) => void;
    export let selectedYear: string | null = null;
    
    let svg: SVGElement;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    const height = 120;
    const width = 1000;

    const therapeuticAreaColors = {
        'Neurology': '#FF6B6B',
        'Oncology': '#4ECDC4',
        'Metabolic': '#45B7D1',
        'Ophthalmology': '#96CEB4',
        'Cardiovascular': '#FFEEAD',
        'Pulmonology': '#D4A5A5',
        'Hematology': '#9DE0AD',
        'Endocrinology': '#FF9F1C',
        'Genetic': '#2EC4B6',
        'Orthopedics': '#FF4A4A',
        'Immunology': '#E71D36',
        'Gastroenterology': '#FDFFB6',
        'Hepatology': '#CBE896',
        'Dermatology': '#FFA07A',
        'Neonatology': '#98D8C8',
        'Urology': '#B8B8D1'
    };
    
    $: yearData = Object.entries(
        data.reduce((acc, entry) => {
            const year = entry["PRV Issue Year"] || entry["RPDD Year"];
            if (!year) return acc;
            
            if (!acc[year]) {
                acc[year] = {
                    count: 0,
                    areas: {}
                };
            }
            acc[year].count += 1;
            const area = entry.TherapeuticArea1;
            acc[year].areas[area] = (acc[year].areas[area] || 0) + 1;
            return acc;
        }, {} as Record<string, { count: number; areas: Record<string, number> }>)
    )
    .map(([year, data]) => ({
        year,
        count: data.count,
        areas: Object.entries(data.areas)
            .map(([area, count]) => ({
                area,
                count,
                percentage: count / data.count
            }))
            .sort((a, b) => b.percentage - a.percentage)
    }))
    .sort((a, b) => a.year.localeCompare(b.year));

    function createGradientId(year: string): string {
        return `gradient-${year}`;
    }

    function createVisualization() {
        if (!svg || !yearData.length) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const xScale = d3.scalePoint()
            .domain(yearData.map(d => d.year))
            .range([0, innerWidth])
            .padding(0);

        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(yearData, d => d.count) || 0])
            .range([4, 24]);

        const g = svgElement.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create gradients
        const defs = svgElement.append("defs");
        yearData.forEach(yearEntry => {
            const gradient = defs.append("linearGradient")
                .attr("id", createGradientId(yearEntry.year))
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "100%");

            let currentPosition = 0;
            yearEntry.areas.forEach(area => {
                gradient.append("stop")
                    .attr("offset", `${currentPosition * 100}%`)
                    .attr("stop-color", therapeuticAreaColors[area.area]);

                currentPosition += area.percentage;

                gradient.append("stop")
                    .attr("offset", `${currentPosition * 100}%`)
                    .attr("stop-color", therapeuticAreaColors[area.area]);
            });
        });

        // Create glow filter
        const filter = defs.append("filter")
            .attr("id", "glow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "400%")
            .attr("height", "400%");

        filter.append("feGaussianBlur")
            .attr("stdDeviation", "2")
            .attr("result", "coloredBlur");

        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode")
            .attr("in", "coloredBlur");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

        // Add connecting line
        g.append("line")
            .attr("x1", 0)
            .attr("x2", innerWidth)
            .attr("y1", innerHeight / 2)
            .attr("y2", innerHeight / 2)
            .attr("stroke", "#666666")
            .attr("stroke-width", .325);

        // Create year groups
        const yearGroups = g.selectAll(".year-group")
            .data(yearData)
            .join("g")
            .attr("class", "year-group")
            .attr("transform", d => `translate(${xScale(d.year)},${innerHeight / 2})`);

        // Add highlight circles
        yearGroups.append("circle")
            .attr("class", "highlight-circle")
            .attr("r", d => radiusScale(d.count) + 4)
            .attr("fill", "none")
            .attr("stroke", "#4fd1c5")
            .attr("stroke-width", 3)
            .attr("opacity", 0);

        // Add main circles
        yearGroups.append("circle")
            .attr("class", "year-circle")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => `url(#${createGradientId(d.year)})`)
            .attr("stroke", "#37587e")
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                selectedYear = d.year;
                onYearSelect(d.year);
                updateSelection();
            })
            .on("mouseenter", function(event, d) {
                if (d.year !== selectedYear) {
                    d3.select(this.parentNode)
                        .select(".highlight-circle")
                        .transition()
                        .duration(200)
                        .attr("opacity", 0.325);

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 2)
                        .style("filter", "url(#glow)");

                    d3.select(this.parentNode)
                        .select(".year-label")
                        .transition()
                        .duration(200)
                        .attr("font-weight", "600")
                        .attr("fill", "#FF1515");
                }
            })
            .on("mouseleave", function(event, d) {
                if (d.year !== selectedYear) {
                    d3.select(this.parentNode)
                        .select(".highlight-circle")
                        .transition()
                        .duration(200)
                        .attr("opacity", 0);

                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 1.5)
                        .style("filter", "none");

                    d3.select(this.parentNode)
                        .select(".year-label")
                        .transition()
                        .duration(200)
                        .attr("font-weight", "400")
                        .attr("fill", "#718096");
                }
            });

        // Add year labels
        yearGroups.append("text")
            .attr("class", "year-label")
            .attr("y", d => radiusScale(d.count) + 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#718096")
            .attr("font-size", "12px")
            .style("font-family", "'IBM Plex Mono', monospace")
            .text(d => d.year);

        // Add count labels
        yearGroups.append("text")
            .attr("class", "count-label")
            .attr("y", d => -radiusScale(d.count) - 10)
            .attr("text-anchor", "middle")
            .attr("fill", "#4a5568")
            .attr("font-size", "10px")
            .style("font-family", "'IBM Plex Mono', monospace")
            .text(d => d.count);

        updateSelection();
    }

    function updateSelection() {
        if (!svg) return;

        d3.select(svg)
            .selectAll(".year-group")
            .each(function(d: any) {
                const group = d3.select(this);
                const isSelected = d.year === selectedYear;

                group.select(".highlight-circle")
                    .transition()
                    .duration(300)
                    .attr("opacity", isSelected ? 0.5 : 0);

                group.select(".year-circle")
                    .transition()
                    .duration(300)
                    .attr("stroke-width", isSelected ? 3 : 1.5)
                    .style("filter", isSelected ? "url(#glow)" : "none");

                group.select(".year-label")
                    .transition()
                    .duration(300)
                    .attr("font-weight", isSelected ? "600" : "400")
                    .attr("fill", isSelected ? "#FF1515" : "#718096");

                group.select(".count-label")
                    .transition()
                    .duration(300)
                    .attr("fill", isSelected ? "#FF1010" : "#4a5568");
            });
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
        max-width: 1000px;
        margin: 0 auto;
        position: relative;
    }

    :global(.year-group) {
        transition: all 0.3s ease;
    }
</style>
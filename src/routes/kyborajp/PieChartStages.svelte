<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data = [];
    export let stages = ["Initial Discovery", "Initial Planning", "Day-to-Day Management", "New Treatment", "Long-Term Planning"];
    export let categories = ["Entirely Negative", "Somewhat Negative", "Neutral", "Somewhat Positive", "Entirely Positive"];
    
    const colors = {
        "Entirely Negative": "#AC0003",
        "Somewhat Negative": "#FF676A",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#59AA49",
        "Entirely Positive": "#083607"
    };

    let svg;
    let width = 1250;
    let height = 400;
    let maxRadius = 50;
    let minRadius = 0;
    let categoryPadding = 255;  // Increased spacing between pies
    let labelHeight = 40;

    onMount(() => {
        if (data.length > 0) {
            createVisualization();
        }
    });

    function createVisualization() {
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("viewBox", [0, 0, width, height]);

        // Calculate totals for scaling
        const stageTotals = data.map(stage => 
            Object.values(stage).reduce((a, b) => a + b, 0)
        );
        const maxTotal = Math.max(...stageTotals);

        // Create pie layout
        const pie = d3.pie()
            .value(d => d[1])
            .sort(null);

        // Scale for pie sizes - using pow scale for more exaggerated differences
        const radiusScale = d3.scalePow()
            .exponent(0.5)  // Square root scale for more pronounced size differences
            .domain([0, maxTotal])
            .range([minRadius, maxRadius]);

        // Create stage labels first
        stages.forEach((stage, i) => {
            const xPos = i * categoryPadding + 100;  // Added offset for left margin
            
            // Add stage label
            svgElement.append("text")
                .attr("x", xPos)
                .attr("y", height - 37.5)  // Position near bottom
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "8px")
                .attr("font-weight", "800")
                .text(stage);
        });

        // Create and position pie charts
        data.forEach((stageData, i) => {
            const total = stageTotals[i];
            const radius = radiusScale(total);
            const xPos = i * categoryPadding + 100;  // Keep consistent with labels
            const yPos = height - radius - 90;  // Position from bottom, with space for label

            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

            const pieData = pie(Object.entries(stageData));

            const pieGroup = svgElement.append("g")
                .attr("transform", `translate(${xPos},${yPos})`);

            pieGroup.selectAll("path")
                .data(pieData)
                .join("path")
                .attr("d", arc)
                .attr("fill", d => colors[d.data[0]])
                .attr("stroke", "#fff")
                .attr("stroke-width", .5)
                .on("mouseenter", (event, d) => {
                    const percentage = ((d.data[1] / total) * 100).toFixed(1);
                    const tooltip = d3.select("#tooltip");
                    tooltip
                        .style("visibility", "visible")
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px")
                        .text(`${d.data[0]}: ${d.data[1]} (${percentage}%)`);
                })
                .on("mousemove", (event) => {
                    d3.select("#tooltip")
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseleave", () => {
                    d3.select("#tooltip").style("visibility", "hidden");
                });

            // Add total count above each pie
            pieGroup.append("text")
                .attr("x", 0)
                .attr("y", radius + 37.5)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "10px")
                .attr("font-weight", "800")
                .text(total);
        });
    }
</script>

<div class="relative">
    <div id="tooltip" class="absolute bg-gray-800 text-white px-2 py-1 rounded text-sm pointer-events-none" 
         style="visibility: hidden; z-index: 1000;">
    </div>
    <div class="chart-container">
        <svg bind:this={svg}></svg>
    </div>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 100%;
        min-height: 400px;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }
</style>
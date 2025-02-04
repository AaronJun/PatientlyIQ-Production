<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data = [];
    export let currentStageId = null;
    let previousStageId = null;
    
    let svg;
    const margin = { top: 20, right: 20, bottom: 90, left: 20 }; // Adjusted margins
    const width = 400;
    const height = 900;
    
    $: visibleData = data.filter(d => d.id <= currentStageId);
    
    const xScale = d3.scaleLinear()
        .domain([1, 1])
        .range([margin.left, width - margin.right]);
    
    const radiusScale = d3.scaleLinear()
        .domain([1, 5])
        .range([4, 12]);
        
    const ySpacingScale = d3.scaleLinear()
        .domain([1, 5])
        .range([1, 100]);

    let yPositions = [];
    
    $: {
        yPositions = [];
        let currentY = margin.top; // Start 50px below top margin
        data.forEach((d, i) => {
            yPositions.push(currentY);
            if (i < data.length - 1) {
                currentY += ySpacingScale(d.Duration);
            }
        });
    }

    // Add virtual start/end points
    $: extendedData = visibleData.length ? [
        { ...visibleData[0], Stage: "Start", "Sentiment ": 0, "Complexity ": 0, y: yPositions[0] - 50 },
        ...visibleData,
        visibleData.length === data.length ? 
            { ...visibleData[visibleData.length-1], Stage: "End", "Sentiment ": 0, "Complexity ": 0, y: yPositions[visibleData.length-1] + 50 } : 
            null
    ].filter(Boolean) : [];

    const pathGenerator = d3.line()
        .x(d => d.Stage === "Start" || d.Stage === "End" ? xScale(0) : xScale(d["Sentiment "]))
        .y(d => d.Stage === "Start" ? d.y : d.Stage === "End" ? d.y : yPositions[data.findIndex(item => item.id === d.id)])
        .curve(d3.curveNatural);

    function drawPath(data) {
        return pathGenerator(data);
    }

    function updateVisualization() {
    if (!svg) return;
    
    const svgElement = d3.select(svg);
    
    if (previousStageId === null) {
        svgElement.selectAll("*").remove();
    }

    let path = svgElement.select(".journey-line");
    if (path.empty()) {
        path = svgElement.append("path")
            .attr("class", "journey-line")
            .attr("fill", "grey") // Set fill to grey initially
            .attr("stroke", "#FF4A4A")
            .attr("stroke-width", "2.25px");
    }

    const pathD = drawPath(extendedData);
    path.attr("d", pathD);
    
    if (path.node()) {
        const length = path.node().getTotalLength();
        
        function animatePath() {
            path.attr("stroke-dasharray", length + " ")
                .attr("stroke-dashoffset", length)
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(1200);
        }
        
        animatePath();
    }

    // Handle circles (excluding virtual start/end points)
    const circles = svgElement.selectAll("circle")
        .data(visibleData, d => d.id);

    circles.exit()
        .transition()
        .duration(400)
        .attr("r", 0)
        .remove();

    const circlesEnter = circles.enter()
        .append("circle")
        .attr("cx", d => xScale(d["Sentiment "]))
        .attr("cy", (d, i) => yPositions[i])
        .attr("r", 0)
        .attr("fill", "#FF4A4A")
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    circles.merge(circlesEnter)
        .transition()
        .duration(400)
        .attr("cx", d => xScale(d["Sentiment "]))
        .attr("cy", (d, i) => yPositions[i])
        .attr("r", d => radiusScale(d["Complexity "]));

    // Handle labels (excluding virtual start/end points)
    const labels = svgElement.selectAll("text.stage-label")
        .data(visibleData, d => d.id);

    labels.exit()
        .transition()
        .duration(400)
        .style("opacity", 0)
        .remove();

    const labelsEnter = labels.enter()
        .append("text")
        .attr("class", "stage-label")
        .attr("x", margin.left - 10)
        .attr("y", (d, i) => yPositions[i] + 4)
        .attr("text-anchor", "end")
        .attr("fill", "#4B5563")
        .attr("font-size", "10px")
        .attr("font-family", "IBM Plex Sans")
        .style("opacity", 0)
        .text(d => d.Stage);

    labels.merge(labelsEnter)
        .transition()
        .duration(400)
        .style("opacity", 1);

    previousStageId = currentStageId;
}
    $: {
        if (currentStageId !== null) {
            updateVisualization();
        }
    }
</script>

<div class="journey-map pt-12">
    <svg 
        bind:this={svg}
        {width}
        {height}
        class="w-full h-full"
    ></svg>
</div>

<style>
    .journey-map {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
    }

    svg {
        display: block;
    }

    :global(.journey-line) {
        fill: none !important;
        stroke: #FF4A4A !important;
        stroke-width: 2.25px !important;
    }
</style>
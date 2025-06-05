<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let data;
    
    let svg;
    let breadcrumbGroup;
    let centerLabel;
    let width = 925;
    let height = width;
    let radius = width / 6;
    let currentSequence = [];
    let currentPercentage = 0;
    let totalValue = 0;
    
    const categoryColors = {
        "Entirely Negative": "#AC0003",
        "Somewhat Negative": "#FF676A",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#59AA49",
        "Entirely Positive": "#083607"
    };

    const b = {
        h: 30,           // Height of each breadcrumb segment
        s: 3,            // Spacing between segments
        t: 0,            // Top margin
        p: 10           // Horizontal padding within segments
    };
    
    $: if (svg && data) {
        createVisualization();
    }

    function createVisualization() {
        d3.select(svg).selectAll("*").remove();

        const getColor = (d) => {
            if (d.depth === 1) {
                return categoryColors[d.data.name] || "#999999";
            }
            if (d.depth > 1) {
                const parentColor = d3.color(getColor(d.parent));
                return parentColor.brighter(0.3);
            }
            return "#999999";
        };

        const hierarchy = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
            
        const root = d3.partition()
            .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);
            
        root.each(d => d.current = d);

        totalValue = root.value;

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
            .padRadius(radius * 0.5)
            .innerRadius(d => d.y0 * radius)
            .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - .5));

        const svgElement = d3.select(svg)
            .attr("viewBox", [-width / 2, -height / 2, width, width])
            .style("font", "10px sans-serif");

        breadcrumbGroup = svgElement.append("g")
            .attr("class", "breadcrumbs")
            .attr("transform", `translate(${-width/2},${-height/2 - b.h - b.t})`);

        centerLabel = svgElement
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "#888");

        centerLabel
            .append("tspan")
            .attr("class", "percentage")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "-1em")
            .attr("font-size", "3em")
            .attr("fill", "#333")
            .attr("font-weight", "bold")

            .text(totalValue.toLocaleString());

        centerLabel
            .append("tspan")
            .attr("class", "count")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "2.5em")
            .attr("font-size", "2em")
            .attr("font-weight", "bold")
            .attr("fill", "#6D635B")
            .text("100%");

        centerLabel
            .append("tspan")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "-1.425em")
            .style("text-transform", "uppercase")
            .attr("font-size", "1em")
            .text("total responses");
            
        centerLabel
            .append("tspan")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "6.25em")
            .style("text-transform", "uppercase");
            
        const path = svgElement.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => getColor(d))
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
            .attr("d", d => arc(d.current));

        const format = d3.format(",d");
        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

        const label = svgElement.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);

        path.on("mouseenter", (event, d) => {
            const sequence = d.ancestors().reverse().slice(1);
            currentSequence = sequence;
            currentPercentage = ((100 * d.value) / root.value).toPrecision(3);
            
            centerLabel.select(".percentage")
                .text(d.value.toLocaleString());
            
            centerLabel.select(".count")
                .text(currentPercentage + "%");

            centerLabel.select("tspan:last-child")
                .text("of total responses");
            
            path.attr("fill-opacity", node => {
                const isAncestor = sequence.indexOf(node) >= 0;
                const isVisible = arcVisible(node.current);
                return isVisible ? (isAncestor ? 1.0 : 0.3) : 0;
            });
            
            updateBreadcrumbs(sequence, currentPercentage);
        })
        .on("mouseleave", () => {
            path.attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0);
            currentSequence = [];
            currentPercentage = 0;
            updateBreadcrumbs([], 0);
            
            centerLabel.select(".percentage")
                .text(totalValue.toLocaleString());
            centerLabel.select(".count")
                .text("100%");
            centerLabel.select("tspan:last-child")
                .text("total responses");
        });

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);

        const parent = svgElement.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);

        function clicked(event, p) {
            parent.datum(p.parent || root);

            root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });

            const t = svgElement.transition().duration(event.altKey ? 7500 : 750);

            path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .filter(function(d) {
                    return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
                .attrTween("d", d => () => arc(d.current));

            label.filter(function(d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
        }
    }

    function updateBreadcrumbs(sequence, percentage) {
        breadcrumbGroup.selectAll("*").remove();

        let x = 0;
        sequence.forEach((d, i) => {
            const breadcrumb = breadcrumbGroup.append("g")
                .attr("transform", `translate(${x},0)`);

            // Add a temporary text element to measure width
            const tempText = breadcrumb.append("text")
                .attr("visibility", "hidden")
                .text(d.data.name);
            const textWidth = tempText.node().getBBox().width;
            tempText.remove();

            // Calculate polygon width based on text width
            const width = textWidth + (2 * b.p);

            // Create arrow-shaped polygon points
            const points = [
                `0,0`,
                `${width},0`,
                `${width + 10},${b.h/2}`,
                `${width},${b.h}`,
                `0,${b.h}`,
                `0,${b.h/2}`
            ].join(" ");

            breadcrumb.append("polygon")
                .attr("points", points)
                .attr("fill", getColor(d))
                .attr("stroke", "white")
                .attr("stroke-width", "1");

            breadcrumb.append("text")
                .attr("x", width/2)
                .attr("y", b.h/2)
                .attr("dy", "0.65em")
                .attr("font-size", "1.125em")
                .attr("horizontal-align", "middle")
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .text(d.data.name);

            x += width + b.s;
        });

        if (sequence.length > 0) {
            breadcrumbGroup.append("text")
                .attr("x", x + 10)
                .attr("y", b.h / 2)
                .attr("dy", ".6em")
                .attr("font-size", "1em")
                .attr("font-weight", "bold")
                .text(percentage + "%");
        }
    }

    function getColor(d) {
        if (d.depth === 1) {
            return categoryColors[d.data.name] || "#999999";
        }
        if (d.depth > 1) {
            const parentColor = d3.color(getColor(d.parent));
            return parentColor.brighter(0.3);
        }
        return "#999999";
    }

    function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
</script>

<div class="chart-container">
    <svg bind:this={svg}></svg>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 100%;
        min-height: 500px;
        margin-top: 40px;
        padding-bottom: 120px;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }
</style>
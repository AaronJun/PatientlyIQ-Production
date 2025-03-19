<!-- RPDPRVBubbleChart.svelte -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data = [];
    export let width = 800;
    export let height = 600;
    
    let svg;
    let tooltipVisible = false;
    let tooltipContent = {};
    let tooltipX = 0;
    let tooltipY = 0;
    
    // Therapeutic area color map
    const therapeuticAreaColors = {
        'Neurology': '#FF6B6B',
        'Neuromuscular': '#E63946',
        'Oncology': '#38B2AC',
        'Metabolic': '#667EEA',
        'Ophthalmology': '#68D391',
        'Cardiovascular': '#F6AD55',
        'Pulmonology': '#B794F4',
        'Hematology': '#48BB78',
        'Endocrinology': '#F59E0B',
        'Genetic': '#0BC5EA',
        'Immunology': '#E53E3E',
        'Gastroenterology': '#ECC94B',
        'Hepatology': '#9AE6B4', 
        'Dermatology': '#FC8181',
        'Neonatology': '#76E4F7',
        'Urology': '#9F7AEA',
        'Orthopedics': '#FBD38D',
        'Nephrology': '#90CDF4',
        'Rheumatology': '#F687B3'
    };
    
    const defaultColor = '#CBD5E0';
    
    // Get therapeutic area color with fallback
    function getColor(area) {
        return therapeuticAreaColors[area] || defaultColor;
    }
    
    function processData(data) {
        // Filter to just entries with PRV sales and known prices
        const saleData = data
            .filter(d => d.Purchased === "Y" && d["Sale Price (USD Millions)"] && d["Sale Price (USD Millions)"] !== "Undisclosed")
            .map(d => {
                // Parse sale year and price
                const saleYear = d["Purchase Year"] || d["PRV Year"];
                const salePrice = parseFloat(d["Sale Price (USD Millions)"]);
                
                return {
                    ...d,
                    saleYear: saleYear,
                    salePrice: salePrice
                };
            })
            .sort((a, b) => a.saleYear - b.saleYear);
            
        return saleData;
    }
    
    function createBubbleChart() {
        if (!svg || !data.length) return;
        
        // Clear existing content
        d3.select(svg).selectAll("*").remove();
        
        // Process data
        const saleData = processData(data);
        
        if (saleData.length === 0) {
            // No sales data available
            d3.select(svg)
                .append("text")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .attr("font-size", "16px")
                .text("No PRV sales data available");
            return;
        }
        
        // Create SVG container
        const svgContainer = d3.select(svg)
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto;");
            
        // Set up margins
        const margin = { top: 50, right: 20, bottom: 60, left: 80 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Create main group
        const g = svgContainer.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
            
        // Find min/max years and prices
        const yearExtent = d3.extent(saleData, d => +d.saleYear);
        const priceExtent = d3.extent(saleData, d => d.salePrice);
        
        // Create scales
        const xScale = d3.scaleLinear()
            .domain([yearExtent[0] - 0.5, yearExtent[1] + 0.5])
            .range([0, innerWidth]);
            
        const yScale = d3.scaleLinear()
            .domain([0, priceExtent[1] * 1.1]) // Add 10% padding at top
            .range([innerHeight, 0]);
            
        const radiusScale = d3.scaleSqrt()
            .domain(priceExtent)
            .range([5, 25]);
            
        // Create axes
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format("d")); // Format as integers
            
        const yAxis = d3.axisLeft(yScale)
            .tickFormat(d => `$${d}M`);
            
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .attr("font-size", "12px");
            
        g.append("g")
            .call(yAxis)
            .attr("font-size", "12px");
            
        // Add axis labels
        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + 40)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text("Sale Year");
            
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .text("Sale Price (USD Millions)");
            
        // Add grid lines
        g.append("g")
            .attr("class", "grid")
            .selectAll("line")
            .data(yScale.ticks())
            .join("line")
            .attr("x1", 0)
            .attr("x2", innerWidth)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .attr("stroke", "#e2e8f0")
            .attr("stroke-dasharray", "2,2");
            
        // Create a force simulation to prevent overlap
        const simulation = d3.forceSimulation(saleData)
            .force("x", d3.forceX(d => xScale(+d.saleYear)).strength(0.8))
            .force("y", d3.forceY(d => yScale(d.salePrice)).strength(0.8))
            .force("collide", d3.forceCollide(d => radiusScale(d.salePrice) + 1).iterations(3))
            .stop();
            
        // Run the simulation
        for (let i = 0; i < 100; ++i) {
            simulation.tick();
        }
            
        // Create bubbles
        g.selectAll(".bubble")
            .data(saleData)
            .join("circle")
            .attr("class", "bubble")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => radiusScale(d.salePrice))
            .attr("fill", d => d3.color(getColor(d.TherapeuticArea1)).copy({opacity: 0.7}))
            .attr("stroke", d => d3.color(getColor(d.TherapeuticArea1)).darker())
            .attr("stroke-width", 1.5)
            .on("mouseenter", (event, d) => {
                // Show tooltip
                tooltipVisible = true;
                tooltipContent = d;
                
                const rect = svg.getBoundingClientRect();
                tooltipX = event.clientX - rect.left;
                tooltipY = event.clientY - rect.top;
            })
            .on("mousemove", (event) => {
                const rect = svg.getBoundingClientRect();
                tooltipX = event.clientX - rect.left;
                tooltipY = event.clientY - rect.top;
            })
            .on("mouseleave", () => {
                tooltipVisible = false;
            });
            
        // Add title
        svgContainer.append("text")
            .attr("x", width / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .text("PRV Sales Value Over Time");
            
        // Add trend line showing average price evolution
        const yearGroups = d3.group(saleData, d => d.saleYear);
        const trendData = Array.from(yearGroups, ([year, values]) => {
            const avgPrice = d3.mean(values, d => d.salePrice);
            return { year: +year, avgPrice };
        }).sort((a, b) => a.year - b.year);
        
        if (trendData.length > 1) {
            const line = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.avgPrice))
                .curve(d3.curveMonotoneX);
                
            g.append("path")
                .datum(trendData)
                .attr("fill", "none")
                .attr("stroke", "#4A5568")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5")
                .attr("d", line);
                
            // Add average price labels
            g.selectAll(".avg-label")
                .data(trendData)
                .join("text")
                .attr("class", "avg-label")
                .attr("x", d => xScale(d.year))
                .attr("y", d => yScale(d.avgPrice) - 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "10px")
                .text(d => `${Math.round(d.avgPrice)}M`);
        }
        
        // Legend for therapeutic areas (top 5 by count in the sale data)
        const areaCounts = d3.rollup(
            saleData, 
            v => v.length, 
            d => d.TherapeuticArea1
        );
        
        const topAreas = Array.from(areaCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([area]) => area);
            
        const legendItemHeight = 20;
        const legendX = margin.left;
        const legendY = 10;
        
        const legend = svgContainer.append("g")
            .attr("transform", `translate(${legendX}, ${legendY})`);
            
        legend.selectAll(".legend-item")
            .data(topAreas)
            .join("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * legendItemHeight})`)
            .each(function(area) {
                const g = d3.select(this);
                
                g.append("circle")
                    .attr("cx", 8)
                    .attr("cy", 8)
                    .attr("r", 6)
                    .attr("fill", getColor(area))
                    .attr("stroke", d3.color(getColor(area)).darker())
                    .attr("stroke-width", 1);
                    
                g.append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .attr("font-size", "10px")
                    .text(area);
            });
    }
    
    $: if (data.length && svg) {
        createBubbleChart();
    }
    
    onMount(() => {
        if (data.length && svg) {
            createBubbleChart();
        }
    });
</script>

<div class="bubble-chart-container relative">
    <svg bind:this={svg} width={width} height={height}></svg>
    
    {#if tooltipVisible && tooltipContent}
        <div 
            class="tooltip absolute bg-white p-2 rounded shadow border border-gray-200 text-xs z-10"
            style="left: {tooltipX}px; top: {tooltipY}px; transform: translate(-50%, -100%);"
        >
            <div class="font-semibold">{tooltipContent.Candidate}</div>
            <div>Company: {tooltipContent.Company}</div>
            <div>Buyer: {tooltipContent.Purchaser}</div>
            <div>Sale Year: {tooltipContent.saleYear}</div>
            <div>Sale Price: ${tooltipContent.salePrice} million</div>
            <div>Area: {tooltipContent.TherapeuticArea1}</div>
        </div>
    {/if}
</div>

<style>
    .bubble-chart-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    
    .tooltip {
        pointer-events: none;
        max-width: 200px;
        background-color: white;
        padding: 8px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
</style>
<!-- RPDPRVTimeline.svelte -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data = [];
    export let width = 1000;
    export let height = 400;
    
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
    
    function createTimeline() {
        if (!svg || !data.length) return;
        
        // Clear existing content
        d3.select(svg).selectAll("*").remove();
        
        // Filter to just entries with PRV awards and create date objects
        const prvData = data
            .filter(d => d["PRV Year"])
            .map(d => {
                const prvYear = d["PRV Year"];
                const prvMonth = d["PRV Month"];
                const prvDate = d["Date"];
                
                let dateString;
                if (typeof prvMonth === 'string' && prvMonth.length > 2) {
                    // Handle text month names
                    const monthMap = {
                        "January": "01", "February": "02", "March": "03", "April": "04",
                        "May": "05", "June": "06", "July": "07", "August": "08",
                        "September": "09", "October": "10", "November": "11", "December": "12"
                    };
                    dateString = `${prvYear}-${monthMap[prvMonth] || "01"}-01`;
                } else {
                    // Handle numeric months
                    dateString = `${prvYear}-${String(prvMonth).padStart(2, '0')}-${String(prvDate || '01').padStart(2, '0')}`;
                }
                
                return {
                    ...d,
                    prvDate: new Date(dateString)
                };
            })
            .sort((a, b) => a.prvDate - b.prvDate);
        
        // Create SVG container
        const svgContainer = d3.select(svg)
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto;");
            
        // Set up margins
        const margin = { top: 40, right: 20, bottom: 60, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Create main group
        const g = svgContainer.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
            
        // Set up x-scale for timeline
        const xScale = d3.scaleTime()
            .domain(d3.extent(prvData, d => d.prvDate))
            .range([0, innerWidth])
            .nice();
            
        // Create x-axis
        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeYear.every(1))
            .tickFormat(d3.timeFormat("%Y"));
            
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .attr("font-size", "10px");
            
        // Add axis label
        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Year");
            
        // Group PRVs by company
        const prvsByCompany = d3.group(prvData, d => d.Company);
        
        // Set up y-scale for companies
        const companies = Array.from(prvsByCompany.keys());
        const yScale = d3.scaleBand()
            .domain(companies)
            .range([0, innerHeight])
            .padding(0.2);
            
        // Create y-axis
        const yAxis = d3.axisLeft(yScale);
        
        g.append("g")
            .call(yAxis)
            .selectAll("text")
            .attr("font-size", "9px");
            
        // Add gridlines
        g.append("g")
            .attr("class", "grid")
            .selectAll("line")
            .data(xScale.ticks())
            .join("line")
            .attr("x1", d => xScale(d))
            .attr("x2", d => xScale(d))
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", "#e2e8f0")
            .attr("stroke-dasharray", "2,2");
            
        // Add PRV dots
        g.selectAll(".prv-dot")
            .data(prvData)
            .join("circle")
            .attr("class", "prv-dot")
            .attr("cx", d => xScale(d.prvDate))
            .attr("cy", d => yScale(d.Company) + yScale.bandwidth() / 2)
            .attr("r", 6)
            .attr("fill", d => getColor(d.TherapeuticArea1))
            .attr("stroke", "#333")
            .attr("stroke-width", 1)
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
            
        // Add sold indicators (dollar sign for sold PRVs)
        g.selectAll(".sold-indicator")
            .data(prvData.filter(d => d.Purchased === "Y"))
            .join("text")
            .attr("class", "sold-indicator")
            .attr("x", d => xScale(d.prvDate))
            .attr("y", d => yScale(d.Company) + yScale.bandwidth() / 2 - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .text("$");
            
        // Add title
        svgContainer.append("text")
            .attr("x", width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .text("PRV Awards Timeline by Company");
            
        // Add legend for therapeutic areas
        const legendData = Object.entries(therapeuticAreaColors);
        const legendItemHeight = 20;
        const legendItemWidth = 150;
        const legendCols = 4;
        const legendRows = Math.ceil(legendData.length / legendCols);
        
        const legend = svgContainer.append("g")
            .attr("transform", `translate(${margin.left}, ${height - margin.bottom + 20})`);
            
        legend.selectAll(".legend-item")
            .data(legendData)
            .join("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => {
                const col = i % legendCols;
                const row = Math.floor(i / legendCols);
                return `translate(${col * legendItemWidth}, ${row * legendItemHeight})`;
            })
            .each(function(d) {
                const [area, color] = d;
                const g = d3.select(this);
                
                g.append("circle")
                    .attr("cx", 8)
                    .attr("cy", 8)
                    .attr("r", 6)
                    .attr("fill", color);
                    
                g.append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .attr("font-size", "9px")
                    .text(area);
            });
    }
    
    $: if (data.length && svg) {
        createTimeline();
    }
    
    onMount(() => {
        if (data.length && svg) {
            createTimeline();
        }
    });
</script>

<div class="timeline-container relative">
    <svg bind:this={svg} width={width} height={height}></svg>
    
    {#if tooltipVisible && tooltipContent}
        <div 
            class="tooltip absolute bg-white p-2 rounded shadow border border-gray-200 text-xs z-10"
            style="left: {tooltipX}px; top: {tooltipY}px; transform: translate(-50%, -100%);"
        >
            <div class="font-semibold">{tooltipContent.Candidate}</div>
            <div>Company: {tooltipContent.Company}</div>
            <div>Area: {tooltipContent.TherapeuticArea1}</div>
            <div>PRV Year: {tooltipContent["PRV Year"]}</div>
            {#if tooltipContent.Purchased === "Y"}
                <div>Purchased by: {tooltipContent.Purchaser || 'Unknown'}</div>
                <div>Sale price: ${tooltipContent["Sale Price (USD Millions)"] || 'Undisclosed'} million</div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .timeline-container {
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
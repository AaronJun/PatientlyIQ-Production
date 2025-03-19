<!-- EnhancedSankeyTimeline.svelte -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let data = [];
    export let redemptionData = [];
    export let width = 1000;
    export let height = 500; // Increased height to accommodate legend
    export let onEntrySelect = (entry) => {};
    
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
    const redemptionColor = '#4CAF50'; // Green color for redemption points
    
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
                    prvDate: new Date(dateString),
                    dataType: "prv"
                };
            })
            .sort((a, b) => a.prvDate - b.prvDate);
            
        // Process redemption data and format it to match prvData structure
        const processedRedemptionData = redemptionData
            .filter(d => d.drug && d.approval_date) // Filter out empty entries
            .map(d => {
                const [month, day, year] = d.approval_date.split('/');
                const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                
                return {
                    Company: d.sponsor,
                    Candidate: d.drug,
                    TherapeuticArea1: "Redemption", // Use a placeholder for now
                    "PRV Year": year,
                    prvDate: new Date(dateString),
                    dataType: "redemption",
                    redemptionDate: new Date(dateString),
                    approval_date: d.approval_date
                };
            })
            .sort((a, b) => a.prvDate - b.prvDate);
            
        // Combine both data sets
        const combinedData = [...prvData, ...processedRedemptionData];
        
        // Create SVG container
        const svgContainer = d3.select(svg)
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto;");
            
        // Set up margins
        const margin = { top: 40, right: 20, bottom: 100, left: 40 }; // Increased bottom margin for legend
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Create main group
        const g = svgContainer.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
            
        // Set up x-scale for timeline
        const xScale = d3.scaleTime()
            .domain(d3.extent(combinedData, d => d.prvDate))
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
            .attr("y", innerHeight + 30)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .text("Year");
            
        // Group data by company
        const companiesMap = new Map();
        combinedData.forEach(d => {
            companiesMap.set(d.Company, true);
        });
        
        // Set up y-scale for companies
        const companies = Array.from(companiesMap.keys());
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
                
                // Call the onEntrySelect function
                onEntrySelect(d);
            })
            .on("mousemove", (event) => {
                const rect = svg.getBoundingClientRect();
                tooltipX = event.clientX - rect.left;
                tooltipY = event.clientY - rect.top;
            })
            .on("mouseleave", () => {
                tooltipVisible = false;
            });
            
        // Add redemption points (diamond shapes)
        g.selectAll(".redemption-point")
            .data(processedRedemptionData)
            .join("path")
            .attr("class", "redemption-point")
            .attr("d", d3.symbol().type(d3.symbolDiamond).size(100))
            .attr("transform", d => `translate(${xScale(d.prvDate)}, ${yScale(d.Company) + yScale.bandwidth() / 2})`)
            .attr("fill", redemptionColor)
            .attr("stroke", "#333")
            .attr("stroke-width", 1)
            .on("mouseenter", (event, d) => {
                // Show tooltip
                tooltipVisible = true;
                tooltipContent = {
                    ...d,
                    isRedemption: true
                };
                
                const rect = svg.getBoundingClientRect();
                tooltipX = event.clientX - rect.left;
                tooltipY = event.clientY - rect.top;
                
                // Call the onEntrySelect function
                onEntrySelect(d);
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
            
        // Add connecting lines between PRVs and redemption points for the same company
        // Note: This assumes a company gets a PRV first, then redeems it
        companies.forEach(company => {
            const companyPRVs = prvData.filter(d => d.Company === company);
            const companyRedemptions = processedRedemptionData.filter(d => d.Company === company);
            
            if (companyPRVs.length > 0 && companyRedemptions.length > 0) {
                // For each redemption, find the closest PRV
                companyRedemptions.forEach(redemption => {
                    const closestPRV = companyPRVs
                        .filter(prv => prv.prvDate < redemption.prvDate) // PRV must come before redemption
                        .reduce((closest, current) => {
                            return !closest || 
                                Math.abs(current.prvDate - redemption.prvDate) < Math.abs(closest.prvDate - redemption.prvDate) 
                                ? current : closest;
                        }, null);
                    
                    if (closestPRV) {
                        g.append("path")
                            .attr("d", `M${xScale(closestPRV.prvDate)},${yScale(company) + yScale.bandwidth() / 2} 
                                        L${xScale(redemption.prvDate)},${yScale(company) + yScale.bandwidth() / 2}`)
                            .attr("stroke", "#aaa")
                            .attr("stroke-width", 1)
                            .attr("stroke-dasharray", "3,3")
                            .attr("fill", "none");
                    }
                });
            }
        });
            
        // Add title
        svgContainer.append("text")
            .attr("x", width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("font-family", "sans-serif")
            .text("PRV Awards and Redemptions Timeline");
            
        // Add legend for therapeutic areas
        const legendData = [
            ...Object.entries(therapeuticAreaColors),
            ["Redemption", redemptionColor]
        ];
        const legendItemHeight = 20;
        const legendItemWidth = 150;
        const legendCols = 4;
        const legendRows = Math.ceil(legendData.length / legendCols);
        
        const legend = svgContainer.append("g")
            .attr("transform", `translate(${margin.left}, ${height - margin.bottom + 40})`);
            
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
                
                // Use different symbols for PRV vs Redemption
                if (area === "Redemption") {
                    g.append("path")
                        .attr("d", d3.symbol().type(d3.symbolDiamond).size(60))
                        .attr("transform", "translate(8, 8)")
                        .attr("fill", color);
                } else {
                    g.append("circle")
                        .attr("cx", 8)
                        .attr("cy", 8)
                        .attr("r", 6)
                        .attr("fill", color);
                }
                    
                g.append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .attr("font-size", "9px")
                    .text(area);
            });
            
        // Add a special legend for the dotted line
        const lineLegend = svgContainer.append("g")
            .attr("transform", `translate(${margin.left}, ${height - margin.bottom + 40 + (legendRows * legendItemHeight)})`);
            
        lineLegend.append("line")
            .attr("x1", 0)
            .attr("y1", 8)
            .attr("x2", 16)
            .attr("y2", 8)
            .attr("stroke", "#aaa")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");
            
        lineLegend.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .attr("font-size", "9px")
            .text("PRV to Redemption Connection");
    }
    
    $: if (data.length && svg) {
        createTimeline();
    }
    
    $: if (redemptionData.length && svg && data.length) {
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
            {#if tooltipContent.isRedemption}
                <div>Type: Redemption</div>
                <div>Approval Date: {tooltipContent.approval_date || new Date(tooltipContent.prvDate).toLocaleDateString()}</div>
            {:else}
                <div>Area: {tooltipContent.TherapeuticArea1}</div>
                <div>PRV Year: {tooltipContent["PRV Year"]}</div>
                {#if tooltipContent.Purchased === "Y"}
                    <div>Purchased by: {tooltipContent.Purchaser || 'Unknown'}</div>
                    <div>Sale price: ${tooltipContent["Sale Price (USD Millions)"] || 'Undisclosed'} million</div>
                {/if}
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
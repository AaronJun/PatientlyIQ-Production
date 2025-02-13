<!-- RPDStageChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";
    
    export let data: any[] = [];
    export let onCompanyHover: (entries: any[]) => void;
    export let onStageHover: (entries: any[]) => void;
    export let onLeave: () => void;
    export let onShowDrugDetail: (detail: any) => void;
    export let onShowCompanyDetail: (detail: any) => void;
    
    let selectedCompany: string | null = null;
    let selectedStage: string | null = null;
    
    function handleCompanyClick(company: string) {
        const companyEntries = data.filter(entry => entry.Company === company);
        onShowCompanyDetail({
            Company: company,
            entries: companyEntries
        });
    }

    function handleCircleClick(event: MouseEvent, d: any) {
        event.stopPropagation();
        onShowDrugDetail({
            drugName: d.Candidate,
            year: d["RPDD Year"],
            Company: d.Company,
            therapeuticArea: d.TherapeuticArea1,
            entries: data.filter(entry => entry.TherapeuticArea1 === d.TherapeuticArea1),
            color: colorScale(d.TherapeuticArea1),
            currentStage: d["Current Development Stage"],
            indication: d.Indication,
            rpddAwardDate: d["RPDD Year"],
            voucherAwardDate: d["PRV Issue Year"],
            treatmentClass: d.Class1,
            mechanismOfAction: d.MOA,
            companyUrl: d["Link to CrunchBase"]
        });
    }

    let svg: SVGElement;
    let width = 1200;
    let height = 720;
    const margin = { top: 40, right: 40, bottom: 90, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const circleRadius = 8;

    const stages = [
        'RPDD Preclinical',
        'RPDD Phase 1',
        'RPDD Phase 1/2',
        'RPDD Phase 2',
        'RPDD Phase 3',
        'FDA Approved',
        'PRV Awarded'
    ];

    function getStage(entry: any) {
        if (entry["PRV Issue Year"]) return "PRV Awarded";
        if (entry["Approved"] === "Approved") return "FDA Approved";
        
        const stage = entry["Current Development Stage"];
        if (stage === "Preclinical") return "RPDD Preclinical";
        if (stage === "Phase 1") return "RPDD Phase 1";
        if (stage === "Phase 1/2") return "RPDD Phase 1/2";
        if (stage === "Phase 2" || stage === "Phase 2a" || stage === "Phase 2b") return "RPDD Phase 2";
        if (stage === "Phase 3") return "RPDD Phase 3";
        return "RPDD Preclinical";
    }

    $: processedData = data.map(entry => ({
        ...entry,
        developmentStage: getStage(entry)
    }));

    $: companies = [...new Set(processedData.map(d => d.Company))];

    $: xScale = d3.scaleBand()
        .domain(stages)
        .range([0, innerWidth])
        .padding(0.1);

    $: yScale = d3.scaleBand()
        .domain(companies)
        .range([0, innerHeight])
        .padding(0.1);

    const colorScale = d3.scaleOrdinal()
        .domain(['Neurology', 'Oncology', 'Metabolic', 'Ophthalmology', 'Cardiovascular', 'Pulmonology', 'Hematology'])
        .range(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9DE0AD']);

    function createCirclePositions(entries, cellWidth, cellHeight) {
        const positions = [];
        const count = entries.length;
        const spacing = Math.min(cellWidth / (count + 1), circleRadius * 3);
        
        for (let i = 0; i < count; i++) {
            positions.push([
                (i + 1) * spacing,
                cellHeight / 2
            ]);
        }
        
        return positions;
    }

    function highlightRow(company: string) {
        const g = d3.select(svg).select("g");
        
        g.insert("rect", ":first-child")
            .attr("class", "highlight-rect")
            .attr("x", 0)
            .attr("y", yScale(company))
            .attr("width", innerWidth)
            .attr("height", yScale.bandwidth())
            .attr("fill", "#84e1bc")
            .attr("opacity", 0)
            .transition()
            .duration(200)
            .attr("opacity", 0.3);

        g.selectAll(".y-axis text")
            .filter(d => d === company)
            .transition()
            .duration(200)
            .style("font-weight", "bold");

        g.selectAll("circle")
            .transition()
            .duration(200)
            .style("opacity", d => d.Company === company ? 1 : 0.2)
            .attr("r", d => d.Company === company ? circleRadius * 1.2 : circleRadius)
            .style("stroke", d => d.Company === company ? "#000" : "none")
            .style("stroke-width", d => d.Company === company ? 1 : 0);
    }

    function removeHighlight() {
        const g = d3.select(svg).select("g");
        
        g.selectAll(".highlight-rect")
            .transition()
            .duration(200)
            .attr("opacity", 0)
            .remove();

        g.selectAll(".y-axis text")
            .transition()
            .duration(200)
            .style("font-weight", "normal");

        g.selectAll("circle")
            .transition()
            .duration(200)
            .style("opacity", 0.7)
            .attr("r", circleRadius)
            .style("stroke", "none");
    }

    function createVisualization() {
        if (!svg) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        const g = svgElement.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add grid lines
        g.append("g")
            .attr("class", "grid-lines y-grid")
            .selectAll("line")
            .data(yScale.domain())
            .join("line")
            .attr("x1", 0)
            .attr("x2", innerWidth)
            .attr("y1", d => yScale(d)! + yScale.bandwidth() / 2)
            .attr("y2", d => yScale(d)! + yScale.bandwidth() / 2)
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "2,2");

        g.append("g")
            .attr("class", "grid-lines x-grid")
            .selectAll("line")
            .data(xScale.domain())
            .join("line")
            .attr("x1", d => xScale(d)! + xScale.bandwidth() / 2)
            .attr("x2", d => xScale(d)! + xScale.bandwidth() / 2)
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", "#e5e7eb")
            .attr("stroke-dasharray", "2,2");

        // Add X axis
        const xAxis = g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .attr("class", "x-axis")
            .call(d3.axisBottom(xScale));
            
        xAxis.selectAll(".tick")
            .style("cursor", "pointer")
            .on("mouseenter", (event, d) => {
                if (!selectedCompany && !selectedStage) {
                    onStageHover(data.filter(entry => getStage(entry) === d));
                }
            })
            .on("mouseleave", () => {
                if (!selectedCompany && !selectedStage) {
                    onLeave();
                }
            });
            
        xAxis.selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis with company name click handlers
        const yAxis = g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale));

        yAxis.selectAll(".tick")
            .style("cursor", "pointer")
            .on("mouseenter", (event, d) => {
                if (!selectedCompany && !selectedStage) {
                    highlightRow(d);
                    onCompanyHover(data.filter(entry => entry.Company === d));
                }
            })
            .on("mouseleave", () => {
                if (!selectedCompany && !selectedStage) {
                    removeHighlight();
                    onLeave();
                }
            })
            .on("click", (event, d) => handleCompanyClick(d));

        // Group data by company and stage
        const groupedData = d3.group(processedData, 
            d => d.Company,
            d => d.developmentStage
        );

        // Create circles for each entry
        companies.forEach(company => {
            stages.forEach(stage => {
                const entries = groupedData.get(company)?.get(stage) || [];
                if (entries.length === 0) return;

                const cellWidth = xScale.bandwidth();
                const cellHeight = yScale.bandwidth();
                const positions = createCirclePositions(entries, cellWidth, cellHeight);

                g.selectAll(null)
                    .data(entries)
                    .join("circle")
                    .attr("cx", (d, i) => xScale(stage)! + positions[i][0])
                    .attr("cy", (d, i) => yScale(company)! + positions[i][1])
                    .attr("r", circleRadius)
                    .style("fill", d => colorScale(d.TherapeuticArea1))
                    .style("opacity", 0.7)
                    .style("cursor", "pointer")
                    .on("mouseenter", function(event, d) {
                        if (!selectedCompany && !selectedStage) {
                            highlightRow(d.Company);
                            onCompanyHover(data.filter(entry => entry.Company === d.Company));
                        }
                        
                        tooltip
                            .style("opacity", 1)
                            .html(`
                                <strong>${d.Candidate}</strong><br/>
                                Company: ${d.Company}<br/>
                                Stage: ${d.developmentStage}<br/>
                                Area: ${d.TherapeuticArea1}<br/>
                                Indication: ${d.Indication}
                            `)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px");
                    })
                    .on("mouseleave", function(event, d) {
                        if (!selectedCompany && !selectedStage) {
                            removeHighlight();
                            onLeave();
                        }
                        tooltip.style("opacity", 0);
                    })
                    .on("click", (event, d) => handleCircleClick(event, d));
            });
        });

        // Add tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "8px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("z-index", "1000");
    }

    $: if (processedData.length > 0 && svg) {
        createVisualization();
    }
</script>

<div class="chart-container">
    <svg
        bind:this={svg}
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        class="w-full h-auto"
    />
</div>

<style>
    .chart-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
    }

    :global(.y-axis text), :global(.x-axis text) {
        transition: font-weight 0.2s ease;
    }
</style>
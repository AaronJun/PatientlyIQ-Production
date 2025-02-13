<!-- RPDStageChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDTooltip from './RPDTooltip.svelte';

    export let data: any[] = [];
    export let onCompanyHover: (entries: any[]) => void = () => {};
    export let onStageHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};

    let svg: SVGElement;
    const width = 1200;
    const height = 1200;
    const radius = Math.min(width, height) / 2 - 100;

    // Tooltip state
    let tooltipVisible = false;
    let tooltipContent = {
        sponsor: '',
        drugName: '',
        therapeuticArea: '',
        id: ''
    };
    let tooltipBorderColor = '';
    let tooltipX = 0;
    let tooltipY = 0;

    const stages = [
        'Preclinical',
        'Phase 1',
        'Phase 1/2',
        'Phase 2',
        'Phase 3',
        'FDA Approved',
        'PRV Awarded'
    ];

    function getStage(entry: any) {
        if (entry["PRV Issue Year"]) return "PRV Awarded";
        if (entry["Approved"] === "Approved") return "FDA Approved";
        
        const stage = entry["Current Development Stage"];
        if (stage === "Preclinical") return "Preclinical";
        if (stage === "Phase 1") return "Phase 1";
        if (stage === "Phase 1/2") return "Phase 1/2";
        if (stage === "Phase 2" || stage === "Phase 2a" || stage === "Phase 2b") return "Phase 2";
        if (stage === "Phase 3") return "Phase 3";
        return "Preclinical";
    }

    $: processedData = data.map(entry => ({
        ...entry,
        developmentStage: getStage(entry)
    }));

    $: companies = [...new Set(processedData.map(d => d.Company))];

    const colorScale = d3.scaleOrdinal()
        .domain([
            'Neurology', 'Oncology', 'Metabolic', 'Ophthalmology', 
            'Cardiovascular', 'Pulmonology', 'Hematology', 
            'Endocrinology', 'Genetic', 'Immunology', 
            'Gastroenterology', 'Hepatology', 'Dermatology', 
            'Neonatology', 'Urology'
        ])
        .range([
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEEAD', '#D4A5A5', '#9DE0AD', 
            '#FF9F1C', '#2EC4B6', '#E71D36', 
            '#FDFFB6', '#CBE896', '#FFA07A', 
            '#98D8C8', '#B8B8D1'
        ]);

    function handleCircleHover(event: MouseEvent, d: any) {
        const circle = d3.select(event.target as SVGCircleElement);
        
        circle
            .attr("r", 12)
            .style("stroke", "#000")
            .style("stroke-width", 2);
        
        onCompanyHover(data.filter(entry => entry.Company === d.Company));
        
        // Update tooltip
        tooltipContent = {
            sponsor: d.Company,
            drugName: d.Candidate,
            therapeuticArea: d.TherapeuticArea1,
            id: d["Current Development Stage"]
        };
        tooltipBorderColor = colorScale(d.TherapeuticArea1);
        
        const containerRect = svg.getBoundingClientRect();
        tooltipX = event.pageX - containerRect.left;
        tooltipY = event.pageY - containerRect.top;
        tooltipVisible = true;
    }

    function handleCircleLeave(event: MouseEvent) {
        const circle = d3.select(event.target as SVGCircleElement);
        circle
            .attr("r", 8)
            .style("stroke", "#565656")
            .style("stroke-width", 1);
        
        onLeave();
        tooltipVisible = false;
    }

    function createVisualization() {
        if (!svg) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        const g = svgElement.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        const companyScale = d3.scaleBand()
            .domain(companies)
            .range([0, 2 * Math.PI * 0.925])
            .align(0);

        const stageScale = d3.scaleBand()
            .domain(stages)
            .range([radius * 0.25, radius])
            .padding(0.125);

        // Add concentric circles for stages
        const strokeWidth = ['.025', '.0725', '.125', '.275', '.3425', '.525', '.6125'];

        g.append("g")
            .selectAll("circle")
            .data(stages)
            .join("circle")
            .attr("r", d => stageScale(d))
            .attr("fill", "none")
            .style("stroke", "#565656")
            .attr("stroke-width", (d, i) => strokeWidth[i]);

        // Add stage labels
        stages.forEach((stage, i) => {
            const yPos = -stageScale(stage)! - 5;
            
            g.append("text")
                .attr("x", radius * 0.0725)
                .attr("y", yPos)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "start")
                .attr("transform", `rotate(345)`)
                .attr("dy", "0.35em")
                .attr("font-size", "14px")
                .attr("fill", "#3E577B")
                .text(stage);
        });

        // Group data by company and stage
        const groupedData = d3.group(processedData, 
            d => d.Company,
            d => d.developmentStage
        );

        // Create radial lines
        g.append("g")
            .selectAll("line")
            .data(companies)
            .join("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", d => {
                const angle = companyScale(d)! + companyScale.bandwidth();
                return Math.cos(angle - Math.PI/2) * radius;
            })
            .attr("y2", d => {
                const angle = companyScale(d)! + companyScale.bandwidth();
                return Math.sin(angle - Math.PI/2) * radius;
            })
            .attr("stroke", "#3E577B")
            .attr("stroke-dasharray", "1,7.25");

        // Add interactive company labels
        const companyLabels = g.append("g")
            .selectAll("text")
            .data(companies)
            .join("text")
            .attr("x", d => {
                const angle = companyScale(d)! + companyScale.bandwidth() / 2;
                return Math.cos(angle - Math.PI/2) * (radius + 30);
            })
            .attr("y", d => {
                const angle = companyScale(d)! + companyScale.bandwidth() / 2;
                return Math.sin(angle - Math.PI/2) * (radius + 30);
            })
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(d => d)
            .attr("transform", d => {
                const angle = companyScale(d)! + companyScale.bandwidth() / 2;
                const degrees = (angle * 180 / Math.PI) - 90;
                const x = Math.cos(angle - Math.PI/2) * (radius + 30);
                const y = Math.sin(angle - Math.PI/2) * (radius + 30);
                return `rotate(${degrees}, ${x}, ${y})`;
            })
            .attr("font-size", "17.25px")
            .attr("font-weight", "500")
            .attr("fill", "#3E577B")
            .attr("cursor", "pointer")
            .on("mouseenter", (event, d) => {
                d3.select(event.target)
                    .attr("fill", "#FF4A4A")
                    .style("font-weight", "800");
                onCompanyHover(data.filter(entry => entry.Company === d));
            })
            .on("mouseleave", (event) => {
                d3.select(event.target)
                    .attr("fill", "#3E577B")
                    .style("font-weight", "800");
                onLeave();
            })
            .on("click", (event, d) => {
                const companyData = data.filter(entry => entry.Company === d);
                onShowCompanyDetail({
                    Company: d,
                    entries: companyData,
                    color: '#37587e',
                    companyUrl: companyData[0]?.["Link to CrunchBase"] || ""
                });
            });

        // Create drug circles
        companies.forEach(company => {
            stages.forEach(stage => {
                const entries = groupedData.get(company)?.get(stage) || [];
                if (entries.length === 0) return;

                const companyAngle = companyScale(company)! + companyScale.bandwidth() / 2;
                const stageRadius = stageScale(stage)!;

                const sortedEntries = entries.sort((a, b) => 
                    (a.Candidate || '').localeCompare(b.Candidate || '')
                );

                const circleSpacing = 14;
                const totalHeight = (sortedEntries.length - 1) * circleSpacing;
                const startOffset = -totalHeight / 2;

                g.selectAll(null)
                    .data(sortedEntries)
                    .join("circle")
                    .attr("cx", (d, i) => {
                        const verticalOffset = startOffset + i * circleSpacing;
                        return Math.cos(companyAngle - Math.PI/2) * (stageRadius + verticalOffset);
                    })
                    .attr("cy", (d, i) => {
                        const verticalOffset = startOffset + i * circleSpacing;
                        return Math.sin(companyAngle - Math.PI/2) * (stageRadius + verticalOffset);
                    })
                    .attr("r", 8)
                    .style("stroke", "#565656")
                    .style("fill", d => colorScale(d.TherapeuticArea1))
                    .style("opacity", 0.9)
                    .style("cursor", "pointer")
                    .on("mouseenter", function(event, d) {
                        handleCircleHover(event, d);
                    })
                    .on("mouseleave", handleCircleLeave)
                    .on("click", (event, d) => {
                        onShowDrugDetail({
                            drugName: d.Candidate,
                            year: d["RPDD Year"],
                            Company: d.Company,
                            therapeuticArea: d.TherapeuticArea1,
                            entries: data.filter(entry => entry.TherapeuticArea1 === d.TherapeuticArea1),
                            color: colorScale(d.TherapeuticArea1),
                            currentStage: d["Current Development Stage"] || "TBD",
                            indication: d.Indication || "",
                            rpddAwardDate: d["RPDD Year"],
                            voucherAwardDate: d["PRV Issue Year"] || "",
                            treatmentClass: d.Class1 || "TBD",
                            mechanismOfAction: d.MOA || "TBD",
                            companyUrl: d["Link to CrunchBase"] || ""
                        });
                        tooltipVisible = false;
                    });
            });
        });
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

    {#if tooltipVisible}
        <RPDTooltip
            visible={tooltipVisible}
            content={tooltipContent}
            borderColor={tooltipBorderColor}
        />
    {/if}
</div>

<style>
    .chart-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
    }

    :global(.bx--data-table-container) {
        width: 100%;
        height: 100%;
    }

    :global(.bx--data-table th, .bx--data-table td) {
        font-weight: 500;
        text-transform: capitalize;
        color: #292F58;
        font-size: 11.25px;
    }

    :global(.bx--toolbar-content) {
        margin-bottom: 0.725rem;
    }

    :global(.bx--data-table tbody tr:hover) {
        background-color: #f5f9ff;
    }
</style>
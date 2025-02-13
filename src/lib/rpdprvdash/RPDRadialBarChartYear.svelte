<!-- RPDRadialBarChart.svelte -->
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    import RPDDashBreadcrumb from './RPDDashBreadcrumb.svelte';
    import RPDTooltip from './RPDTooltip.svelte';

    interface RPDDEntry {
        Company: string;
        TherapeuticArea1: string;
        Candidate: string;
        "RPDD Year": string;
        "Current Development Stage": string;
        Indication: string;
        Class1: string;
        MOA: string;
        "PRV Issue Year": string;
        "Link to CrunchBase": string;
        [key: string]: string;
    }

    interface ProcessedData {
        area: string;
        count: number;
        entries: RPDDEntry[];
    }

    export interface AreaHoverEvent {
        area: string;
        entries: RPDDEntry[];
    }

    export interface DrugDetailEvent {
        drugName: string;
        year: string;
        Company: string;
        therapeuticArea: string;
        entries: RPDDEntry[];
        color: string;
        currentStage: string;
        indication: string;
        rpddAwardDate: string;
        voucherAwardDate: string;
        treatmentClass: string;
        mechanismOfAction: string;
        companyUrl: string;
    }

    export let data: RPDDEntry[] = [];
    export let year = "2023";
    
    const dispatch = createEventDispatcher<{
        areaHover: AreaHoverEvent;
        areaLeave: void;
        showDrugDetail: DrugDetailEvent;
    }>();

    let svg: SVGSVGElement;
    let width = 850;
    let height = 850;
    let selectedArea: string | null = null;

    // Constants
    const margin = { top: 40, right: 20, bottom: 10, left: 20 };
    const innerRadius = 20;
    const outerRadius = Math.min(width, height) / 2.5 - margin.top;

    // Tooltip state
    let tooltipVisible = false;
    let tooltipContent = {
        sponsor: '',
        drugName: '',
        therapeuticArea: '',
        id: ''
    };
    let tooltipBorderColor = '';

    // Process data to get counts and entries by therapeutic area
    let processedData: ProcessedData[] = [];
    $: {
        const groupedData = d3.group(data, d => d.TherapeuticArea1);
        processedData = Array.from(groupedData, ([area, entries]) => ({
            area,
            count: entries.length,
            entries
        })).sort((a, b) => b.count - a.count)
        .filter(d => d.area); // Filter out empty areas
    }

    // Custom color scale
    const colorScale = d3.scaleOrdinal<string>()
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

    function handleAreaHover(area: string, entries: RPDDEntry[]) {
        if (!selectedArea) {
            dispatch("areaHover", { area, entries });
        }
    }

    function handleAreaLeave() {
        if (!selectedArea) {
            dispatch("areaLeave");
            tooltipVisible = false;
        }
    }

    function handleDrugClick(entry: RPDDEntry) {
        dispatch('showDrugDetail', {
            drugName: entry.Candidate,
            year: entry["RPDD Year"],
            Company: entry.Company,
            therapeuticArea: entry.TherapeuticArea1,
            entries: processedData.find(d => d.area === entry.TherapeuticArea1)?.entries || [],
            color: colorScale(entry.TherapeuticArea1),
            currentStage: entry["Current Development Stage"] || "TBD",
            indication: entry.Indication || "",
            rpddAwardDate: entry["RPDD Year"],
            voucherAwardDate: entry["PRV Issue Year"] || "",
            treatmentClass: entry.Class1 || "TBD",
            mechanismOfAction: entry.MOA || "TBD",
            companyUrl: entry["Link to CrunchBase"] || ""
        });
        tooltipVisible = false;
    }

    function createVisualization(): void {
        if (!svg || !processedData.length) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        const g = svgElement.append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        // Create scales
        const x = d3.scaleBand()
            .domain(processedData.map(d => d.area))
            .range([0, 1 * Math.PI])
            .padding(0.725);

        const maxEntries = d3.max(processedData, d => d.entries.length) || 0;
        const segmentHeight = (outerRadius - innerRadius) / maxEntries;

        // Create arc generator for segments
        const individualArc = d3.arc()
            .innerRadius((d, i) => innerRadius + i * segmentHeight)
            .outerRadius((d, i) => innerRadius + (i + 1) * segmentHeight)
            .startAngle(d => x(d.TherapeuticArea1)!)
            .endAngle(d => x(d.TherapeuticArea1)! + x.bandwidth())
            .padRadius(innerRadius);

        // Create groups for each area
        const areaGroups = g.selectAll(".area-group")
            .data(processedData)
            .join("g")
            .attr("class", "area-group");

        // Add segments for each entry
        areaGroups.each((areaData, areaIndex, groups) => {
            const areaGroup = d3.select(groups[areaIndex]);
            
            areaGroup.selectAll("path")
                .data(areaData.entries)
                .join("path")
                .attr("fill", d => colorScale(d.TherapeuticArea1))
                .attr("d", (d, i) => individualArc(d, i))
                .attr("opacity", 0.825)
                .attr("stroke", "#565656")
                .attr("stroke-width", 0.5)
                .attr("cursor", "pointer")
                .on("mouseenter", (event, d) => {
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(200)
                        .attr("opacity", 1)
                        .style("scale", 1.25)
                        .attr("stroke-width", 2);
                    
                    tooltipContent = {
                        sponsor: d.Company,
                        drugName: d.Candidate,
                        therapeuticArea: d.TherapeuticArea1,
                        id: d["Current Development Stage"]
                    };
                    tooltipBorderColor = colorScale(d.TherapeuticArea1);
                    tooltipVisible = true;

                    handleAreaHover(d.TherapeuticArea1, areaData.entries);
                })
                .on("mouseleave", (event) => {
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(200)
                        .attr("opacity", 0.825)
                        .attr("stroke-width", 0.25);
                    handleAreaLeave();
                })
                .on("click", (event, d) => handleDrugClick(d));
        });

        // Add area labels
        g.selectAll(".area-label")
            .data(processedData)
            .join("text")
            .attr("class", "area-label")
            .attr("transform", d => {
                const angle = x(d.area)! + x.bandwidth() / 2;
                const labelRadius = outerRadius ; // Increased radius for labels
                const xPos = Math.cos(angle - Math.PI / 2) * labelRadius;
                const yPos = Math.sin(angle - Math.PI / 2) * labelRadius;
                
                // Calculate rotation based on angle
                let rotation = (angle * 180 / Math.PI) - 90;
                
                // Adjust rotation for readability
                if (rotation > 90) rotation += 180;
                if (rotation < -90) rotation += 180;
                
                return `translate(${xPos},${yPos}) rotate(${rotation})`;
            })
            .attr("text-anchor", d => {
                const angle = x(d.area)! + x.bandwidth() / 2;
                const angleDeg = (angle * 180 / Math.PI) % 360;
                return (angleDeg >= 180 && angleDeg <= 360) ? "end" : "start";
            })
            .attr("alignment-baseline", "middle")
            .attr("fill", "#2D3748")
            .attr("font-size", "10.25px")
            .text(d => `${d.area} (${d.entries.length})`);

        // Add radial guidelines for labels
        g.selectAll(".label-line")
            .data(processedData)
            .join("line")
            .attr("class", "label-line")
            .attr("x1", d => {
                const angle = x(d.area)! + x.bandwidth() / 2;
                return Math.cos(angle - Math.PI / 2) * outerRadius;
            })
            .attr("y1", d => {
                const angle = x(d.area)! + x.bandwidth() / 2;
                return Math.sin(angle - Math.PI / 2) * outerRadius;
            })
            .attr("x2", d => {
                const angle = x(d.area)! + x.bandwidth() / 2;
                return Math.cos(angle - Math.PI / 2) * (outerRadius + 30);
            })
            .attr("y2", d => {
                const angle = x(d.area)! + x.bandwidth() / 2;
                return Math.sin(angle - Math.PI / 2) * (outerRadius + 30);
            })
            .attr("stroke", "#94A3B8")
            .attr("stroke-width", 0.5)
            .attr("stroke-dasharray", "2,2");
    }

    $: if (processedData.length > 0 && svg) {
        createVisualization();
    }

    onMount(() => {
        if (processedData.length > 0) {
            createVisualization();
        }
    });
</script>

<div class="relative w-full max-w-3xl mx-4">
    <RPDDashBreadcrumb 
        {year}
        {selectedArea}
        on:clear={() => {
            selectedArea = null;
            dispatch("areaLeave");
            createVisualization();
        }}
    />
    
    <svg 
        bind:this={svg}
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        class="w-full h-auto"
    />

    {#if tooltipVisible}
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <RPDTooltip
                visible={tooltipVisible}
                content={tooltipContent}
                borderColor={tooltipBorderColor}
            />
        </div>
    {/if}
</div>

<style>
    :global(.area-label) {
        font-family: 'IBM Plex Mono', monospace;
    }
    
    :global(.label-line) {
        pointer-events: none;
    }
</style>
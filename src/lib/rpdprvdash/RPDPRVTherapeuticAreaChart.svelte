<!-- RPDPRVTherapeuticAreaTree.svelte -->
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
    const radius = Math.min(width, height) / 2 - 60;

    // Stage-specific radii (from outer to inner)
    const stageRadii = {
        'PRE': radius * 0.925,
        'P1': radius * 0.825,
        'P1/2': radius * 0.725,
        'P2': radius * 0.625,
        'P3': radius * 0.525,
        'FILED': radius * 0.4125,
        'APRV': radius * 0.285,
        'PRV': radius * 0.15
    };

    // Stage labels configuration
    const stageLabelConfig = {
        padding: { x: 6, y: 4 },
        height: 18,
        cornerRadius: 10
    };

    // Area-specific angles
    const labelRadius = radius * .9725;
    const maxLabelWidth = 85;
    const ANGLE_BUFFER = Math.PI / 24;

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

    // Stage color scale
    const stageColorScale = d3.scaleOrdinal()
        .domain(['PRE', 'P1', 'P1/2', 'P2', 'P3', 'APRV', 'PRV'])
        .range([
            '#4A5568', // Preclinical - slate
            '#60ACA9', // Phase 1 - blue
            '#2B6CB0', // Phase 1/2 - darker blue
            '#2C5282', // Phase 2 - even darker blue
            '#1A365D', // Phase 3 - darkest blue
            '#48BB78', // FDA Approved - green
            '#2F855A'  // PRV Awarded - darker green
        ]);

    // Therapeutic area color scale
    const therapeuticAreaColorScale = d3.scaleOrdinal()
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

        function getStage(entry: any) {
        // Check for PRV status first
        if (entry["PRV Year"]) {
            return "PRV";
        }
        
        // Get current development stage
        const stage = entry["Current Development Stage"];
        
        // Map development stages
        switch(stage) {
            case "PRV Awarded":
                return "PRV";
            case "Preclinical":
                return "PRE";
            case "Phase 1":
                return "P1";
            case "Phase 1/2":
                return "P1/2";
            case "Phase 2":
            case "Phase 2a":
            case "Phase 2b":
                return "P2";
            case "Phase 3":
                return "P3";
            case "Filed":
                return "FILED";
            case "Approved":
                return "APRV";
            default:
                return "PRE";
        }
    }

    function showTooltip(event: MouseEvent, d: any) {
        const containerRect = svg.getBoundingClientRect();
        tooltipX = event.pageX - containerRect.left;
        tooltipY = event.pageY - containerRect.top;
        
        tooltipContent = {
            sponsor: d.Company || "Overview",
            drugName: d.Candidate || `${d.count} drugs`,
            therapeuticArea: d.TherapeuticArea1 || d.area,
            id: d["Current Development Stage"] || "Various Stages"
        };
        tooltipBorderColor = d.Company ? 
            stageColorScale(getStage(d)) : 
            therapeuticAreaColorScale(d.area || d.TherapeuticArea1);
        
        tooltipVisible = true;
    }

    function hideTooltip() {
        tooltipVisible = false;
    }

    function truncateText(text: string, maxWidth: number) {
        if (text.length <= maxWidth / 8) return text;
        return text.slice(0, Math.floor(maxWidth / 8) - 3) + '...';
    }

    function processDataForLayout(data: any[]) {
        const areasMap = new Map();
        
        data.forEach(entry => {
            const stage = getStage(entry);
            const area = entry.TherapeuticArea1;
            
            if (!areasMap.has(area)) {
                areasMap.set(area, {
                    area,
                    stages: new Map(),
                    totalDrugs: 0
                });
            }
            
            const areaData = areasMap.get(area);
            if (!areaData.stages.has(stage)) {
                areaData.stages.set(stage, []);
            }
            
            areaData.stages.get(stage).push(entry);
            areaData.totalDrugs++;
        });

        return Array.from(areasMap.values());
    }

    function calculateAreaAngles(areas: any[]) {
        const totalDrugs = areas.reduce((sum, area) => sum + area.totalDrugs, 0);
        let currentAngle = 0;
        const angles = new Map();

        areas.forEach(area => {
            const proportion = area.totalDrugs / totalDrugs;
            const angle = proportion * (2 * Math.PI - (areas.length * ANGLE_BUFFER));
            angles.set(area.area, {
                start: currentAngle,
                end: currentAngle + angle,
                center: currentAngle + angle/2
            });
            currentAngle += angle + ANGLE_BUFFER;
        });

        return angles;
    }

    function createVisualization() {
        if (!svg) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        const mainGroup = svgElement.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        // Create containers for different layers
        const linesGroup = mainGroup.append("g").attr("class", "connecting-lines");
        const stagesGroup = mainGroup.append("g").attr("class", "stage-circles");
        const areaLabelsGroup = mainGroup.append("g").attr("class", "area-labels");

        // Create stage circles with rectangular labels
        Object.entries(stageRadii).forEach(([stage, radius]) => {
            stagesGroup.append("circle")
                .attr("r", radius)
                .attr("fill", "none")
                .attr("stroke", stageColorScale(stage))
                .attr("stroke-width", .5)
                .attr("stroke-dasharray", "1,4")
                .attr("stroke-opacity", 1);

            // Stage label with background
            const labelAngle = -Math.PI / 10;
            const labelX = radius * Math.cos(labelAngle) - 15;
            const labelY = radius * Math.sin(labelAngle) + 25;

            const labelGroup = stagesGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer")
                .attr("class", "stage-label")
                .on("click", () => {
                    onStageHover(data.filter(entry => getStage(entry) === stage));
                });

            // Calculate text width for background
            const tempText = labelGroup.append("text")
                .attr("opacity", 0)
                .text(stage);
            const textWidth = tempText.node().getBBox().width;
            tempText.remove();

            // Background rectangle
            labelGroup.append("rect")
                .attr("x", -stageLabelConfig.padding.x)
                .attr("y", -stageLabelConfig.height/2)
                .attr("width", textWidth + stageLabelConfig.padding.x)
                .attr("height", stageLabelConfig.height)
                .attr("rx", stageLabelConfig.cornerRadius)
                .attr("fill", '#F8FAFC')
                .attr("opacity", 1);

            // Label text
            labelGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .attr("fill", stageColorScale(stage))
                .attr("font-size", "10.25px")
                .attr("font-weight", "400")
                .text(stage);
        });

        const areas = processDataForLayout(data);
        const areaAngles = calculateAreaAngles(areas);

        // Draw therapeutic area sections
        areas.forEach(area => {
            const angle = areaAngles.get(area.area);
            const areaGroup = mainGroup.append("g");

            // Calculate area label position
            const labelAngle = angle.center;
            const labelX = labelRadius * Math.cos(labelAngle - Math.PI/2);
            const labelY = labelRadius * Math.sin(labelAngle - Math.PI/2);

            // Draw connecting lines to drugs
            area.stages.forEach((drugs, stage) => {
                const stageRadius = stageRadii[stage];
                const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);

                drugs.forEach((drug, i) => {
                    const drugAngle = angle.start + drugSpacing * (i + 1);
                    const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                    const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);

                    linesGroup.append("path")
                        .attr("d", `M${labelX},${labelY}L${drugX},${drugY}`)
                        .attr("stroke", "#37587e")
                        .attr("stroke-width", .425)
                        .attr("stroke-opacity", 0.525)
                        .attr("fill", "none");
                });
        });

            // Area label group
            const labelGroup = areaLabelsGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer")
                .on("click", () => {
                    onCompanyHover(data.filter(entry => entry.TherapeuticArea1 === area.area));
                })
                .on("mouseenter", (event) => {
                    labelGroup.select("rect")
                        .transition()
                        .duration(200)
                        .attr("height", 12)
                        .attr("width", 12)
                        .attr("stroke-width", 2.725);

                    labelGroup.select("text")
                        .transition()
                        .duration(500)
                        .attr("font-weight", "800")
                        .attr("font-size", "12px")
                        .attr("fill", therapeuticAreaColorScale(area.area));

                    onCompanyHover(data.filter(entry => entry.TherapeuticArea1 === area.area));
                    showTooltip(event, { area: area.area, count: area.totalDrugs });
                })
                .on("mouseleave", () => {
                    labelGroup.select("rect")
                        .transition()
                        .attr("height", 10.25)
                        .attr("width", 10.25)
                        .attr("stroke-width", 1.25)
                        .attr("fill", therapeuticAreaColorScale(area.area));

                    labelGroup.select("text")
                        .transition()
                        .duration(500)
                        .attr("fill", "#666666")
                        .attr("font-size", "11.25px")
                        .attr("font-weight", "500");

                    onLeave();
                    hideTooltip();
                });

            // Area node rectangle
            labelGroup.append("rect")
                .attr("width", 10.25)
                .attr("height", 10.25)
                .attr("transform", "translate(-3.625, -3.625)")
                .attr("stroke", "#565656")
                .attr("fill", therapeuticAreaColorScale(area.area))
                .attr("stroke-width", 1.25);

            // Area text label
            const textAngle = labelAngle > Math.PI ? "end" : "start";
            const dx = labelAngle > Math.PI ? -8 : 8;
            
            labelGroup.append("text")
                .attr("text-anchor", textAngle)
                .attr("dx", dx)
                .attr("dy", "-1em")
                .text(truncateText(area.area, maxLabelWidth+12))
                .attr("fill", "#666666")
                .attr("font-size", "11.25px")
                .attr("font-weight", "500");

            // Draw drugs for each stage
            area.stages.forEach((drugs, stage) => {
                const stageRadius = stageRadii[stage];
                const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);

                drugs.forEach((drug, i) => {
                    const drugAngle = angle.start + drugSpacing * (i + 1);
                    const x = stageRadius * Math.cos(drugAngle - Math.PI/2);
                    const y = stageRadius * Math.sin(drugAngle - Math.PI/2);

                    const drugGroup = areaGroup.append("g")
                        .attr("transform", `translate(${x},${y})`)
                        .attr("cursor", "pointer");

                    // Drug circle
                    drugGroup.append("circle")
                        .attr("r", 10.25)
                        .attr("fill", therapeuticAreaColorScale(drug.TherapeuticArea1))
                        .attr("stroke", "#565656")
                        .attr("stroke-width", "1.725px")
                        .on("mouseenter", (event) => {
                            drugGroup.select("circle")
                                .transition()
                                .duration(200)
                                .attr("r", 15.25)
                                .attr("stroke-width", 4.25)
                                .attr("stroke", "#375810")
                                .style("filter", "drop-shadow(0 2px 2px rgba(0,0,0,0.1))");
                            showTooltip(event, drug);
                        })
                        .on("mouseleave", () => {
                            drugGroup.select("circle")
                                .transition()
                                .attr("r", 10.25)
                                .attr("fill", therapeuticAreaColorScale(drug.TherapeuticArea1))
                                .attr("stroke", "#565656")
                                .attr("stroke-width", "1.725px")
                                .duration(200);
                            hideTooltip();
                        })
                        .on("click", (event) => {
                            // Stop event propagation to prevent it from triggering parent handlers
                            event.stopPropagation();
                            
                            // Show drug detail drawer
                            onShowDrugDetail({
                                drugName: drug.Candidate,
                                year: drug["RPDD Year"],
                                Company: drug.Company,
                                therapeuticArea: drug.TherapeuticArea1,
                                entries: data.filter(entry => entry.TherapeuticArea1 === drug.TherapeuticArea1),
                                color: therapeuticAreaColorScale(drug.TherapeuticArea1),
                                currentStage: drug["Current Development Stage"] || "TBD",
                                indication: drug.Indication || "",
                                rpddAwardDate: drug["RPDD Year"],
                                voucherAwardDate: drug["PRV Issue Year"] || "",
                                treatmentClass: drug.Class1 || "TBD",
                                mechanismOfAction: drug.MOA || "TBD",
                                companyUrl: drug["Link to CrunchBase"] || ""
                            });
                        });

                    // Hidden label group (shown on hover)
                    const labelGroup = drugGroup.append("g")
                        .attr("opacity", 0)
                        .attr("class", "drug-label");

                    const labelX = drugAngle < Math.PI ? 12 : -12;
                    
                    labelGroup.append("text")
                        .attr("x", labelX)
                        .attr("y", 0)
                        .attr("text-anchor", drugAngle < Math.PI ? "start" : "end")
                        .attr("z-index", 999)
                        .attr("dy", "1.425em")
                        .attr("dx", "-.825em")
                        .text(truncateText(drug.Candidate, maxLabelWidth))
                        .attr("fill", "#565656")
                        .attr("font-size", "11.25px")
                        .style("text-transform", "uppercase");

                    // Drug hover interactions
                    drugGroup
                        .on("mouseenter", (event) => {
                            drugGroup.select(".drug-label")
                                .transition()
                                .duration(200)
                                .attr("font-weight", "600")
                                .attr("font-size", "11.25px")
                                .attr("opacity", 1);
                            showTooltip(event, drug);
                        })
                        .on("mouseleave", () => {
                            drugGroup.select(".drug-label")
                                .transition()
                                .duration(200)
                                .attr("opacity", 0);
                            hideTooltip();
                        });
                });
            });
        });
    }

    $: if (data.length > 0 && svg) {
        createVisualization();
    }
</script>

<div class="chart-container">
    <svg
        bind:this={svg}
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        class="w-full h-auto my-auto"
    />

    {#if tooltipVisible}
        <RPDTooltip
            visible={tooltipVisible}
            content={tooltipContent}
            borderColor={tooltipBorderColor}
            x={tooltipX}
            y={tooltipY}
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
</style>
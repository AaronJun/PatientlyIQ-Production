<!-- Enhanced RPDPRVTherapeuticAreaChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDTooltip from './RPDTooltip.svelte';
    
    // Import color definitions from the centralized file
    import { 
        therapeuticAreaColors, 
        stageColors, 
        getTherapeuticAreaColor, 
        getStageColor,
        getTherapeuticAreaFill,
        getTherapeuticAreaStroke,
        getStageFill,
        getStageStroke
    } from './utils/colorDefinitions';

    export let data: any[] = [];
    export let onCompanyHover: (entries: any[]) => void = () => {};
    export let onStageHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};

    let svg: SVGElement;
    const width = 920;
    const height = 920;
    const radius = Math.min(width, height) / 2 - 60;

    // Improved label positioning configuration
    const labelConfig = {
        minRadius: radius * .9825,
        maxRadius: radius * 1,
        padding: 8.25,
        minAngleDiff: Math.PI / 32, // Minimum angle between labels
        textHeight: 12,
        dotRowHeight: 5,
        maxDotsPerRow: 12
    };

    // Stage-specific radii (from outer to inner)
    const stageRadii = {
        'PRE': radius * 0.8925,
        'P1': radius * 0.7825,
        'P1/2': radius * 0.6725,
        'P2': radius * 0.5425,
        'P3': radius * 0.4325,
        'FILED': radius * 0.3125,
        'PRV': radius * 0.18725
    };

    // UI Configuration
    const stageLabelConfig = {
        padding: { x: 0, y: 1 },
        height: 10,
        cornerRadius: 10
    };
    
    const maxLabelWidth = 85;
    const ANGLE_BUFFER = Math.PI / 24;

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
    // Tooltip offset from cursor
    const tooltipOffset = { x: 15, y: 15 };
    
    // Track active selections
    let activeArea = null;
    let activeStage = null;

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

    function calculateOptimalLabelPlacements(areas: any[], areaAngles: Map<string, any>) {
        const labels: any[] = [];
        const labelHeight = labelConfig.textHeight + 
                          Math.ceil(areas[0].totalDrugs / labelConfig.maxDotsPerRow) * labelConfig.dotRowHeight;

        areas.forEach(area => {
            const angle = areaAngles.get(area.area);
            const centerAngle = angle.center;
            
            // Determine if label should be on left or right side
            const isRightSide = Math.cos(centerAngle - Math.PI/2) > 0;
            
            // Calculate initial radius based on angle
            let baseRadius = labelConfig.minRadius;
            const labelAngle = centerAngle;

            // Find a position that doesn't overlap with existing labels
            let currentRadius = baseRadius;
            let overlap = true;
            
            while (overlap && currentRadius <= labelConfig.maxRadius) {
                const x = currentRadius * Math.cos(labelAngle - Math.PI/2);
                const y = currentRadius * Math.sin(labelAngle - Math.PI/2);
                
                overlap = labels.some(label => {
                    const dx = x - label.x;
                    const dy = y - label.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < labelHeight * 2;
                });
                
                if (!overlap) {
                    labels.push({
                        area: area.area,
                        x,
                        y,
                        angle: labelAngle,
                        isRightSide
                    });
                    break;
                }
                
                currentRadius += labelConfig.padding;
            }
        });

        return labels;
    }

    // Update the createLabelGroup function to properly anchor the labels
    function createLabelGroup(group: d3.Selection<SVGGElement, unknown, null, undefined>, 
                           area: any,
                           labelPlacement: any) {
        const textAnchor = labelPlacement.isRightSide ? "start" : "end";
        const xOffset = labelPlacement.isRightSide ? 15 : -15;
        
        // Create text element
        const textElement = group.append("text")
            .attr("text-anchor", textAnchor)
            .attr("dx", xOffset)
            .attr("dy", "0.35em")
            .text(truncateText(area.area, maxLabelWidth))
            .attr("fill", "#4A5568")
            .attr("font-size", "9.25px")
            .attr("font-weight", "500")
            // Add dominant-baseline for consistent vertical positioning
            .attr("dominant-baseline", "middle");

        // Create dots group for drug counts (similar to company tree)
        const dotsGroup = group.append("g")
            .attr("class", "area-drugs")
            .attr("transform", `translate(${xOffset}, ${labelConfig.textHeight})`);

        const numDrugs = Math.min(area.totalDrugs, 20); // Limit to 20 dots max for visual clarity
        const dotsPerRow = Math.min(labelConfig.maxDotsPerRow, numDrugs);
        const numRows = Math.ceil(numDrugs / dotsPerRow);

        for (let i = 0; i < numDrugs; i++) {
            const row = Math.floor(i / dotsPerRow);
            const col = i % dotsPerRow;
            const x = textAnchor === "start" ? 
                col * 6 : 
                -(col * 6);
            
            dotsGroup.append("circle")
                .attr("r", 0)
                .attr("stroke", "#161616")
                .attr("stroke-width", 0.5)
                .attr("cx", x + (textAnchor === "start" ? 3 : -3))
                .attr("cy", row * labelConfig.dotRowHeight)
                .attr("fill", getTherapeuticAreaFill(area.area))
                .attr("stroke", getTherapeuticAreaStroke(area.area))
                .attr("stroke-width", 1)
                .style("filter", "url(#dropshadow)")
                .attr("opacity", 0.8);
        }

        return { textElement, dotsGroup };
    }

    function showTooltip(event: MouseEvent, d: any, isCompany: boolean = false) {
        const containerRect = svg.getBoundingClientRect();
        
        // Position the tooltip next to the cursor with offsets
        tooltipX = event.clientX - containerRect.left + tooltipOffset.x;
        tooltipY = event.clientY - containerRect.top + tooltipOffset.y;
        
        // Check if tooltip would go outside right edge of container
        const tooltipWidth = 200; // Approximate width of tooltip
        if (tooltipX + tooltipWidth > containerRect.width) {
            // Position tooltip to the left of cursor instead
            tooltipX = event.clientX - containerRect.left - tooltipWidth - tooltipOffset.x;
        }
        
        tooltipContent = {
            sponsor: d.Company ||  d.TherapeuticArea1 || d.area,
            drugName: d.Candidate || `${d.count} drugs`,
            therapeuticArea: d.TherapeuticArea1 || d.area,
            id: d["Current Development Stage"] || "Various Stages"
        };
        tooltipBorderColor = d.Company ? 
            getStageStroke(getStage(d)) : 
            getTherapeuticAreaStroke(d.area || d.TherapeuticArea1);
        
        tooltipVisible = true;
    }

    function hideTooltip() {
        tooltipVisible = false;
    }
    
    function setActiveArea(area, entries) {
        // Set active area and clear active stage
        activeArea = area;
        activeStage = null;
        
        // Reset all area nodes to inactive state
        d3.selectAll(".area-node")
            .transition()
            .duration(200)
            .attr("r", 2.725);
            
        d3.selectAll(".area-label text")
            .transition()
            .duration(500)
            .attr("fill", "#4A5568")
            .attr("font-size", "9.25px")
            .attr("font-weight", "500");
            
        d3.selectAll(".area-drugs circle")
            .transition()
            .duration(200)
            .attr("r", 0)
            .attr("opacity", 0.8);
            
        // Highlight the active area
        if (area) {
            const areaId = area.replace(/\s+/g, '-').toLowerCase();
            
            // Update node size but maintain center position with adjusted transform
            d3.select(`#area-node-${areaId}`)
                .transition()
                .duration(200)
                .attr("r", 4);
                
            d3.select(`#area-label-${areaId} text`)
                .transition()
                .duration(500)
                .attr("fill", "#FF4A4A")
                .attr("font-size", "11px")
                .attr("font-weight", "800");
                
            d3.select(`#area-label-${areaId} .area-drugs`)
                .selectAll("circle")
                .transition()
                .duration(200)
                .attr("r", 0)
                .attr("opacity", 1);
                
            onCompanyHover(entries);
        }
    }
    
    function setActiveStage(stage, entries) {
        // Set active stage and clear active area
        activeStage = stage;
        activeArea = null;
        
        // Reset all stage labels to inactive state
        d3.selectAll(".stage-label rect")
            .transition()
            .duration(200)
            .attr("fill", "#F8FAFC");
            
        d3.selectAll(".stage-label text")
            .transition()
            .duration(200)
            .attr("font-weight", "400");
            
        // Highlight the active stage
        if (stage) {
            d3.select(`#stage-label-${stage} rect`)
                .transition()
                .duration(200)
                .attr("fill", "#F1F5F9");
                
            d3.select(`#stage-label-${stage} text`)
                .transition()
                .duration(200)
                .attr("font-weight", "700");
                
            onStageHover(entries);
        }
    }

    function truncateText(text: string, maxWidth: number) {
        if (text.length <= maxWidth / 4) return text;
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
                    totalDrugs: 0,
                    uniqueCompanies: new Set(),
                    uniqueCandidates: new Set()
                });
            }
            
            const areaData = areasMap.get(area);
            if (!areaData.stages.has(stage)) {
                areaData.stages.set(stage, []);
            }
            
            areaData.stages.get(stage).push(entry);
            areaData.totalDrugs++;
            
            // Track unique companies and candidates
            if (entry.Company) {
                areaData.uniqueCompanies.add(entry.Company);
            }
            if (entry.Candidate) {
                areaData.uniqueCandidates.add(entry.Candidate);
            }
        });

        // Sort by total drugs count (descending) for better visualization
        return Array.from(areasMap.values()).sort((a, b) => b.totalDrugs - a.totalDrugs);
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

        // Create drop shadow filter
        const defs = svgElement.append("defs");
        
        // Create drop shadow filter with proper rounded edges
        const dropShadow = defs.append("filter")
            .attr("id", "dropshadow")
            .attr("width", "300%")
            .attr("height", "300%")
            .attr("x", "-100%")
            .attr("y", "-100%")
            .attr("filterUnits", "userSpaceOnUse");
        
        // Create a shadow using blur and offset
        dropShadow.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2.5)
            .attr("result", "blur");
            
        dropShadow.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 0.5)
            .attr("dy", 1.5)
            .attr("result", "offsetBlur");
            
        // Apply color to the shadow
        dropShadow.append("feColorMatrix")
            .attr("in", "offsetBlur")
            .attr("type", "matrix")
            .attr("values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0")
            .attr("result", "shadowMatrixOut");
        
        // Create a composite of the original shape for proper rounded edges
        const feMerge = dropShadow.append("feMerge");
        feMerge.append("feMergeNode")
            .attr("in", "shadowMatrixOut");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

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
                .attr("stroke", getStageStroke(stage))
                .attr("stroke-width", 1.425)
                .attr("stroke-dasharray", "1,5")
                .attr("stroke-opacity", 1);

            // Stage label with background
            const labelAngle = -Math.PI / 10;
            const labelX = radius * Math.cos(labelAngle) - 15;
            const labelY = radius * Math.sin(labelAngle) + 25;

            const labelGroup = stagesGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer")
                .attr("class", "stage-label")
                .attr("id", `stage-label-${stage}`);

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
                .attr("width", textWidth + stageLabelConfig.padding.x * 2)
                .attr("height", stageLabelConfig.height)
                .attr("rx", stageLabelConfig.cornerRadius)
                .attr("fill", '#F8FAFC')
                .attr("opacity", 1);

            // Label text
            labelGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .attr("fill", getStageStroke(stage))
                .attr("font-size", "9.425px")
                .attr("font-weight", "400")
                .text(stage);
                
            // Add click event to stage label
            labelGroup.on("click", (event) => {
                event.stopPropagation();
                const stageEntries = data.filter(entry => getStage(entry) === stage);
                setActiveStage(stage, stageEntries);
            });
        });

        const areas = processDataForLayout(data);
        const areaAngles = calculateAreaAngles(areas);
        const labelPlacements = calculateOptimalLabelPlacements(areas, areaAngles);

        // Draw therapeutic area sections
        areas.forEach(area => {
            const angle = areaAngles.get(area.area);
            const areaGroup = mainGroup.append("g");
            
            // Create sanitized ID for the area
            const areaId = area.area.replace(/\s+/g, '-').toLowerCase();
            
            // Find label placement for this area
            const labelPlacement = labelPlacements.find(p => p.area === area.area);
            
            if (!labelPlacement) return; // Skip if no placement found
            
            const { x: labelX, y: labelY } = labelPlacement;

            // Create area node
            const nodeGroup = areaLabelsGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer")
                .attr("class", "area-label")
                .attr("id", `area-label-${areaId}`);

            // Area node rectangle at label position
            nodeGroup.append("circle")
                .attr("class", "area-node")
                .attr("id", `area-node-${areaId}`)
                .attr("r", 2.725)
                .attr("stroke", "#565656")
                .attr("fill", getTherapeuticAreaFill(area.area))
                .attr("stroke", getTherapeuticAreaStroke(area.area))
                .attr("stroke-width", 1);

            // Create the label group with text and dots
            createLabelGroup(nodeGroup, area, labelPlacement);

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
                        .attr("stroke-opacity", 0.825)
                        .attr("fill", "none");
                        
                    // Add drug circles
                    const drugGroup = areaGroup.append("g")
                        .attr("transform", `translate(${drugX},${drugY})`)
                        .attr("cursor", "pointer")
                        .attr("class", "drug-node");

                    // Drug circle
                    drugGroup.append("circle")
                        .attr("r", 7.725)
                        .attr("fill", getTherapeuticAreaFill(drug.TherapeuticArea1))
                        .attr("stroke", getTherapeuticAreaStroke(drug.TherapeuticArea1))
                        .attr("stroke-width", 3.125)
                        .style("filter", "url(#dropshadow)"); // Apply drop shadow to all drug circles
                        
                    // Add PRV indicator for PRV awarded drugs
                    if (drug["PRV Issue Year"]) {
                        drugGroup.append("circle")
                            .attr("r", 10.25)
                            .attr("fill", "none")
                            .attr("stroke", "#976201")
                            .attr("stroke-width", "2")
                            .attr("stroke-dasharray", "2,2");
                    }
                    
                    // Drug interactions
                    drugGroup
                    .on("mouseenter", (event) => {
                        drugGroup.select("circle")
                            .transition()
                            .duration(200)
                            .attr("r", 10.25)
                            .attr("stroke-width", 2.5);

                        if (drug["PRV Issue Year"]) {
                            drugGroup.select("circle:last-child")
                                .transition()
                                .duration(200)
                                .attr("r", 12.5)
                                .attr("stroke-width", 2.5);
                        }
                        showTooltip(event, drug);
                    })

                    .on("mousemove", (event) => {
                        // Update tooltip position when mouse moves
                        showTooltip(event, drug);
                    })
                    .on("mouseleave", () => {
                        drugGroup.select("circle")
                            .transition()
                            .duration(200)
                            .attr("r", 7.725)
                            .attr("stroke-width", 3.125)                            
                            .attr("stroke", getTherapeuticAreaStroke(drug.TherapeuticArea1));

                        if (drug["PRV Issue Year"]) {
                            drugGroup.select("circle:last-child")
                                .transition()
                                .duration(200)
                                .attr("r", 10.25)
                                .attr("stroke-width", "2");
                        }
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
                                color: getTherapeuticAreaStroke(drug.TherapeuticArea1),
                                currentStage: drug["Current Development Stage"] || "TBD",
                                indication: drug.Indication || "",
                                rpddAwardDate: drug["RPDD Year"],
                                voucherAwardDate: drug["PRV Issue Year"] || "",
                                treatmentClass: drug.Class1 || "TBD",
                                mechanismOfAction: drug.MOA || "TBD",
                                companyUrl: drug["Link to CrunchBase"] || ""
                            });
                        });
                });
            });
            
            // Event handlers for area label
            const handleMouseEnter = (event) => {
                // Update area details for the sidebar display
                const entries = data.filter(entry => entry.TherapeuticArea1 === area.area);
                
                // Set this area as active
                setActiveArea(area.area, {
                    entries: entries,
                    areaName: area.area,
                    totalDrugs: area.totalDrugs,
                    uniqueCompanies: area.uniqueCompanies.size,
                    uniqueCandidates: area.uniqueCandidates.size
                });
                
                showTooltip(event, { area: area.area, count: area.totalDrugs });
            };
                
            const handleClick = () => {
                // Set this area as active when clicked
                const entries = data.filter(entry => entry.TherapeuticArea1 === area.area);
                
                setActiveArea(area.area, {
                    entries: entries,
                    areaName: area.area,
                    totalDrugs: area.totalDrugs,
                    uniqueCompanies: area.uniqueCompanies.size,
                    uniqueCandidates: area.uniqueCandidates.size
                });
            };
                
            // Add event handlers to area label group
            nodeGroup
                .on("mouseenter", handleMouseEnter)
                .on("mouseleave", hideTooltip)
                .on("click", handleClick);
        });
        
        // Add click handler to SVG background to clear selections
        svgElement.on("click", (event) => {
            // Check if click was directly on the SVG background
            if (event.target === svg) {
                activeArea = null;
                activeStage = null;
                onLeave();
            }
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
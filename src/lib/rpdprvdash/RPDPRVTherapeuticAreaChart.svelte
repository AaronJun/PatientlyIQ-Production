<!-- Enhanced RPDPRVTherapeuticAreaChart.svelte -->
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
    const width = 850;
    const height = 850;
    const radius = Math.min(width, height) / 2 - 60;

    // Improved label positioning configuration (matching company tree style)
    const labelConfig = {
        minRadius: radius * .9825,
        maxRadius: radius * 1.025,
        padding: 8.25,
        minAngleDiff: Math.PI / 32, // Minimum angle between labels
        textHeight: 12,
        dotRowHeight: 5,
        maxDotsPerRow: 12
    };

    // Stage-specific radii (from outer to inner)
    const stageRadii = {
        'PRE': radius * 0.925,
        'P1': radius * 0.8725,
        'P1/2': radius * 0.7625,
        'P2': radius * 0.6425,
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
    
    // Track active selections
    let activeArea = null;
    let activeStage = null;

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

    function createLabelGroup(group: d3.Selection<SVGGElement, unknown, null, undefined>, 
                           area: any,
                           labelPlacement: any) {
        const { x, y, textAnchor, dx } = labelPlacement;
        
        // Create text element
        const textElement = group.append("text")
            .attr("text-anchor", textAnchor)
            .attr("dx", dx)
            .attr("dy", "0.35em")
            .text(truncateText(area.area, maxLabelWidth))
            .attr("fill", "#4A5568")
            .attr("font-size", "10.25px")
            .attr("font-weight", "500");

        // Create dots group for drug counts (similar to company tree)
        const dotsGroup = group.append("g")
            .attr("class", "area-drugs")
            .attr("transform", `translate(${dx}, ${labelConfig.textHeight})`);

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
                .attr("r", 2)
                .attr("stroke", "#161616")
                .attr("stroke-width", 0.5)
                .attr("cx", x + (textAnchor === "start" ? 3 : -3))
                .attr("cy", row * labelConfig.dotRowHeight)
                .attr("fill", therapeuticAreaColorScale(area.area))
                .attr("opacity", 0.8);
        }

        return { textElement, dotsGroup };
    }

    function getLabelPosition(angle: number) {
        // Calculate optimal position for labels based on their angle
        const normalizedAngle = ((angle + Math.PI/2) * 180 / Math.PI) % 360;
        
        // Determine text-anchor based on angle
        const textAnchor = (normalizedAngle > 90 && normalizedAngle < 270) ? "end" : "start";
        
        // Determine label offset direction
        const dx = (normalizedAngle > 90 && normalizedAngle < 270) ? -15 : 15;
        
        // Calculate position on the circle
        const labelRadius = radius * 0.9825;
        const x = labelRadius * Math.cos(angle - Math.PI/2);
        const y = labelRadius * Math.sin(angle - Math.PI/2);
        
        return { x, y, textAnchor, dx };
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
    
    function setActiveArea(area, entries) {
        // Set active area and clear active stage
        activeArea = area;
        activeStage = null;
        
        // Reset all area nodes to inactive state
        d3.selectAll(".area-node")
            .transition()
            .duration(200)
            .attr("width", 7.725)
            .attr("height", 7.725)
            .attr("transform", "translate(-5.125, -5.125)");
            
        d3.selectAll(".area-label text")
            .transition()
            .duration(500)
            .attr("fill", "#4A5568")
            .attr("font-size", "10.25px")
            .attr("font-weight", "500");
            
        d3.selectAll(".area-drugs circle")
            .transition()
            .duration(200)
            .attr("r", 2)
            .attr("opacity", 0.8);
            
        // Highlight the active area
        if (area) {
            const areaId = area.replace(/\s+/g, '-').toLowerCase();
            
            d3.select(`#area-node-${areaId}`)
                .transition()
                .duration(200)
                .attr("width", 10.25)
                .attr("height", 10.25)
                .attr("transform", "translate(-7, -7)");
                
            d3.select(`#area-label-${areaId} text`)
                .transition()
                .duration(500)
                .attr("fill", "#FF4A4A")
                .attr("font-size", "12px")
                .attr("font-weight", "800");
                
            d3.select(`#area-label-${areaId} .area-drugs`)
                .selectAll("circle")
                .transition()
                .duration(200)
                .attr("r", 3)
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

    function calculateOptimalLabelPlacements(areas: any[], areaAngles: Map<string, any>) {
        const labels = [];
        
        areas.forEach(area => {
            const angle = areaAngles.get(area.area);
            const centerAngle = angle.center;
            
            // Get label positioning
            const { x, y, textAnchor, dx } = getLabelPosition(centerAngle);
            
            labels.push({
                area: area.area,
                x,
                y,
                textAnchor,
                dx,
                angle: centerAngle
            });
        });
        
        // Detect and resolve overlaps
        const labelHeight = labelConfig.textHeight + 
            Math.ceil(Math.min(20, areas[0].totalDrugs) / labelConfig.maxDotsPerRow) * labelConfig.dotRowHeight;
            
        resolveOverlaps(labels, labelHeight);
        
        return labels;
    }
    
    function resolveOverlaps(placements, labelHeight) {
        // Sort by angle for easier adjacent label detection
        const sortedPlacements = [...placements].sort((a, b) => a.angle - b.angle);
        
        for (let i = 0; i < sortedPlacements.length; i++) {
            const current = sortedPlacements[i];
            const next = sortedPlacements[(i + 1) % sortedPlacements.length];
            
            // Check if labels are too close
            const angleDiff = Math.abs(current.angle - next.angle);
            if (angleDiff < labelConfig.minAngleDiff || (2 * Math.PI - angleDiff) < labelConfig.minAngleDiff) {
                // Find the original indices
                const currentIndex = placements.findIndex(p => p.area === current.area);
                const nextIndex = placements.findIndex(p => p.area === next.area);
                
                // Adjust position outward
                const currentRadius = Math.sqrt(current.x * current.x + current.y * current.y);
                const nextRadius = Math.sqrt(next.x * next.x + next.y * next.y);
                
                // Move the label with smaller radius outward
                if (currentRadius <= nextRadius) {
                    const newRadius = currentRadius * 1.08;
                    placements[currentIndex].x = (current.x / currentRadius) * newRadius;
                    placements[currentIndex].y = (current.y / currentRadius) * newRadius;
                } else {
                    const newRadius = nextRadius * 1.08;
                    placements[nextIndex].x = (next.x / nextRadius) * newRadius;
                    placements[nextIndex].y = (next.y / nextRadius) * newRadius;
                }
            }
        }
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
                .attr("fill", stageColorScale(stage))
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
            nodeGroup.append("rect")
                .attr("class", "area-node")
                .attr("id", `area-node-${areaId}`)
                .attr("width", 7.725)
                .attr("height", 7.725)
                .attr("transform", "translate(-5.125, -5.125)")
                .attr("stroke", "#565656")
                .attr("fill", therapeuticAreaColorScale(area.area))
                .attr("stroke-width", 1.25);

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
                        .attr("stroke-width", .725)
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
                        .attr("fill", therapeuticAreaColorScale(drug.TherapeuticArea1))
                        .attr("stroke", "#565656")
                        .attr("stroke-width", "1.725px");
                        
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
                                .duration(350)
                                .attr("r", 10.25)
                                .attr("stroke-width", 5.25)
                                .attr("stroke", "#375810")
                                .style("filter", "drop-shadow(0 2px 2px rgba(0,0,0,0.1))");
                                
                            if (drug["PRV Issue Year"]) {
                                drugGroup.select("circle:nth-child(2)")
                                    .transition()
                                    .duration(200)
                                    .attr("r", 10.25)
                                    .attr("stroke-width", 3);
                            };
                                
                            showTooltip(event, drug);
                        })
                        .on("mouseleave", () => {
                            drugGroup.select("circle")
                                .transition()
                                .duration(200)
                                .attr("r", 7.725)
                                .attr("fill", therapeuticAreaColorScale(drug.TherapeuticArea1))
                                .attr("stroke", "#565656")
                                .attr("stroke-width", "1.725px")
                                .style("filter", "none");
                                
                            if (drug["PRV Issue Year"]) {
                                drugGroup.select("circle:nth-child(2)")
                                    .transition()
                                    .duration(200)
                                    .attr("r", 11.25)
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
        max-width: 925px;
        margin: 0 auto;
        position: relative;
    }
</style>
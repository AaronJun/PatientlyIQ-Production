<!-- Enhanced RPDPRVTherapeuticAreaChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    // Import color definitions from the centralized file
    import { 
        getTherapeuticAreaColor, 
        getStageColor,
        getCompanyStatusColor
    } from './utils/colorDefinitions';

    // Import data processing utilities
    import {
        getStage,
        getStageFullName,
        formatCompanyName,
        calculateCompanyAngles,
        calculateOptimalLabelPlacement,
        getSizeConfig,
        getLabelConfig,
        getStageRadii,
        getStageLabelConfig
    } from './utils/data-processing-utils';
    
    // Remove the import for TherapeuticAreaDetailDrawer as we'll use the parent's drawer
    // import TherapeuticAreaDetailDrawer from './components/TherapeuticAreaDetailDrawer.svelte';

    export let data: any[] = [];
    export let onCompanyHover: (entries: any[]) => void = () => {};
    export let onStageHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};
    // Add a new prop for showing therapeutic area detail
    export let onShowTherapeuticAreaDetail: (detail: any) => void = () => {};
    export let isAllYearView: boolean = false; // New prop to check if "all" year view is selected
    // Add props for InfiniteCanvasWrapper integration
    export let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
    export let showTooltip: (event: MouseEvent, data: any, isCompany?: boolean) => void = () => {};
    export let hideTooltip: () => void = () => {};

    // Remove the SVG element binding as we'll use mainGroup instead
    // let svg: SVGElement;
    const width = 920;
    const height = width;
    const radius = Math.min(width, height) / 2 - 60;
    const maxLabelWidth = 85;
    const ANGLE_BUFFER = isAllYearView ? Math.PI / 32 : Math.PI / 24;

    // Get configuration from utility functions
    $: sizeConfig = getSizeConfig(isAllYearView);
    // Adjust label config for therapeutic area chart to position labels closer to the radial
    $: labelConfig = {
        ...getLabelConfig(radius, isAllYearView),
        minRadius: radius * 1, // Reduced from 1.15 to bring labels closer
        maxRadius: radius * 1.05, // Reduced from 1.25 to bring labels closer
        padding: 6.5 // Reduced padding between labels
    };
    $: stageRadii = getStageRadii(radius);
    const stageLabelConfig = getStageLabelConfig();

    // Connection highlight color
    const highlightColor = "#FFD700"; // Gold color for highlighted connections
    const highlightWidth = isAllYearView ? 1.75 : 2.25; // Width for highlighted connections

    // Remove local tooltip state since we'll use the parent's tooltip
    // Track active selections
    let activeArea: string | null = null;
    let activeStage: string | null = null;
    let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    let focusableElements: any[] = [];

    // Replace the openAreaDetailDrawer function to use the parent's drawer
    function openAreaDetailDrawer(area: any, entries: any): void {
        // Call the parent's function instead of managing state locally
        onShowTherapeuticAreaDetail(entries);
    }

    /**
     * Process data into a format suitable for therapeutic area visualization
     * (following the same structure as processDataForLayout but with area focus)
     */
    function processDataForTherapeuticAreas(data: any[]) {
        const areasMap = new Map();
        
        data.forEach(entry => {
            const stage = getStage(entry);
            const area = entry.TherapeuticArea1;
            
            if (!areasMap.has(area)) {
                areasMap.set(area, {
                    company: area, // Use 'company' key for compatibility with calculateCompanyAngles
                    area,
                    stages: new Map(),
                    totalDrugs: 0,
                    entries: [],
                    uniqueCompanies: new Set(),
                    uniqueCandidates: new Set(),
                    clinicalTrials: 0,
                    vouchersAwarded: 0,
                    indications: new Set()
                });
            }
            
            const areaData = areasMap.get(area);
            if (!areaData.stages.has(stage)) {
                areaData.stages.set(stage, []);
            }
            
            areaData.stages.get(stage).push(entry);
            areaData.entries.push(entry);
            areaData.totalDrugs++;
            
            // Track unique companies and candidates
            if (entry.Company) {
                areaData.uniqueCompanies.add(entry.Company);
            }
            if (entry.Candidate) {
                areaData.uniqueCandidates.add(entry.Candidate);
            }
            if (entry.Indication) {
                areaData.indications.add(entry.Indication);
            }
            
            // Count clinical trials (Phase 1-3)
            const clinicalStages = ["P1", "P1/2", "P2", "P3"];
            if (clinicalStages.includes(stage)) {
                areaData.clinicalTrials++;
            }
            
            // Count vouchers awarded
            if (stage === "PRV" || entry["PRV Issue Year"]) {
                areaData.vouchersAwarded++;
            }
        });

        // Sort by total drugs count (descending) for better visualization
        return Array.from(areasMap.values()).sort((a, b) => b.totalDrugs - a.totalDrugs);
    }

    /**
     * Calculate angles for each therapeutic area based on their proportion of total drugs
     */
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

    /**
     * Calculate optimal label placement for areas to avoid overlaps
     */
    /**
     * Calculate optimal label placement for areas to avoid overlaps
     * and align labels with their connecting lines
     */
    function calculateOptimalAreaLabelPlacement(areas: any[], areaAngles: Map<string, any>) {
        const labels: any[] = [];
        const labelHeight = labelConfig.textHeight;
        const minDistanceBetweenLabels = labelHeight * 1.2; // Slightly reduced minimum spacing
        
        // First, place labels at optimal angles
        areas.forEach(area => {
            const angle = areaAngles.get(area.area);
            if (!angle) return;
            
            // Use the center angle of the area's arc for label placement
            const centerAngle = angle.center - Math.PI/2; // Adjust for SVG coordinate system
            
            // Determine if label should be on left or right side based on angle
            const isRightSide = Math.cos(centerAngle) > 0;
            
            // Start at minimum radius
            const baseRadius = labelConfig.minRadius;
            
            // Calculate initial position
            const x = baseRadius * Math.cos(centerAngle);
            const y = baseRadius * Math.sin(centerAngle);
            
            // Add the label at this position
            labels.push({
                area: area.area,
                x,
                y,
                angle: centerAngle,
                isRightSide,
                baseRadius
            });
        });
        
        // Now resolve overlaps by adjusting radii
        let hasOverlap = true;
        const maxIterations = 20;
        let iterations = 0;
        
        while (hasOverlap && iterations < maxIterations) {
            hasOverlap = false;
            iterations++;
            
            // Check each pair of labels for overlap
            for (let i = 0; i < labels.length; i++) {
                for (let j = i + 1; j < labels.length; j++) {
                    const label1 = labels[i];
                    const label2 = labels[j];
                    
                    // Calculate current distance between labels
                    const dx = label1.x - label2.x;
                    const dy = label1.y - label2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < minDistanceBetweenLabels) {
                        hasOverlap = true;
                        
                        // Adjust the radius of the label with the smaller angle segment
                        // This gives more space to labels with more drugs
                        const angle1 = areaAngles.get(label1.area);
                        const angle2 = areaAngles.get(label2.area);
                        
                        if (!angle1 || !angle2) continue;
                        
                        const span1 = angle1.end - angle1.start;
                        const span2 = angle2.end - angle2.start;
                        
                        const labelToAdjust = span1 < span2 ? label1 : label2;
                        
                        // Increase radius of the label to move
                        labelToAdjust.baseRadius += labelConfig.padding;
                        if (labelToAdjust.baseRadius > labelConfig.maxRadius) {
                            labelToAdjust.baseRadius = labelConfig.maxRadius;
                        }
                        
                        // Recalculate position
                        labelToAdjust.x = labelToAdjust.baseRadius * Math.cos(labelToAdjust.angle);
                        labelToAdjust.y = labelToAdjust.baseRadius * Math.sin(labelToAdjust.angle);
                    }
                }
            }
        }
        
        return labels;
    }

    /**
     * Create label group with text and dots representing drugs
     * Adapted from the company tree component with modifications for area labels
     */
    function createAreaLabelGroup(
        group: d3.Selection<SVGGElement, unknown, null, undefined>, 
        area: any, 
        labelPlacement: any
    ) {
        // Determine if label is on right or left side
        const isRightSide = labelPlacement.isRightSide;
        
        // Create a rotated group to align with connecting line
        const labelGroup = group.append("g")
            .attr("class", "area-label-text");
        
        // Calculate text anchor and offset based on side
        const textAnchor = isRightSide ? "start" : "end";
        const xOffset = isRightSide ? 10 : -10; // Reduced offset to bring labels closer
        
        // Create text element with area name
        const textElement = labelGroup.append("text")
            .attr("text-anchor", textAnchor)
            .attr("dx", xOffset)
            .attr("dy", "0.35em")
            .text(truncateText(area.area, maxLabelWidth))
            .attr("fill", "#4A5568")
            .attr("font-size", sizeConfig.labelFontSize)
            .attr("font-weight", sizeConfig.labelFontWeight);
        
        // Get therapeutic area color
        const areaColors = getTherapeuticAreaColor(area.area);
                
        return { labelGroup, textElement };
    }

    /**
     * Truncates text to fit within maximum width
     * Reuses formatCompanyName where possible for consistency
     */
    function truncateText(text: string, maxWidth: number) {
        if (!text) return '';
        
        // Try to use the company name formatter first (as areas may have similar naming patterns)
        const formatted = formatCompanyName(text);
        
        // If the result is still too long, truncate it
        if (formatted.length <= maxWidth / 4) return formatted;
        return formatted.slice(0, Math.floor(maxWidth / 8) - 3) + '...';
    }

    /**
     * Sets the active area and updates visual state
     */
    function setActiveArea(area: any, entries: any): void {
        // Reset state
        activeArea = area.area || area;
        activeStage = null;
        
        // Reset all visual elements
        d3.selectAll(".area-node")
            .transition()
            .duration(200)
            .attr("r", 2.725);
            
        d3.selectAll(".area-label-text text")
            .transition()
            .duration(500)
            .attr("fill", "#4A5568")
            .attr("font-size", sizeConfig.labelFontSize)
            .attr("font-weight", sizeConfig.labelFontWeight);
            
        d3.selectAll(".area-drugs circle")
            .transition()
            .duration(200)
            .attr("r", 0)
            .attr("opacity", 0.8);
            
        // Highlight active area if selected
        if (area) {
            const areaId = (area.area || area).replace(/\s+/g, '-').toLowerCase();
                
            d3.select(`#area-node-${areaId}`)
                .transition()
                .duration(200)
                .attr("r", 4);
                
            d3.select(`#area-label-${areaId} .area-label-text text`)
                .transition()
                .duration(500)
                .attr("fill", "#2D3748")
                .attr("font-size", "11px")
                .attr("font-weight", "800");
                
            d3.select(`#area-label-${areaId} .area-drugs`)
                .selectAll("circle")
                .transition()
                .duration(200)
                .attr("r", 2)
                .attr("opacity", 1);
                
            // Call the callback with area entries
            onCompanyHover(entries);
        }
    }
    
    /**
     * Sets the active stage and updates visual state
     */
    function setActiveStage(stage: string, entries: any[]): void {
        // Reset state
        activeStage = stage;
        activeArea = null;
        
        // Reset visual elements
        d3.selectAll(".stage-label rect")
            .transition()
            .duration(200)
            .attr("fill", "#F8FAFC");
            
        d3.selectAll(".stage-label text")
            .transition()
            .duration(200)
            .attr("font-weight", "400");
            
        // Highlight active stage
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

    /**
     * Highlighting and connection management functions
     * Uses the same approach as the company tree for consistency
     */
    function highlightAreaConnections(areaName: string): void {
        resetConnectionHighlights();
        
        // Use company data attribute for consistency with the company tree component
        d3.selectAll(`path.area-path[data-company="${areaName}"], path.drug-path[data-company="${areaName}"]`)
            .transition()
            .duration(300)
            .attr("stroke", highlightColor)
            .attr("stroke-width", highlightWidth)
            .attr("stroke-opacity", 1);
    }
    
    function highlightDrugConnections(drugId: string): void {
        resetConnectionHighlights();
            
        d3.select(`path.drug-path[data-drug="${drugId}"]`)
            .transition()
            .duration(300)
            .attr("stroke", highlightColor)
            .attr("stroke-width", highlightWidth)
            .attr("stroke-opacity", 1);
    }
    
    function resetConnectionHighlights() {
        d3.selectAll("path.area-path, path.drug-path")
            .transition()
            .duration(300)
            .attr("stroke", "#37587e")
            .attr("stroke-width", sizeConfig.connectionStrokeWidth)
            .attr("stroke-opacity", sizeConfig.connectionOpacity);
    }

    /**
     * Create the visualization with all components
     */
    function createVisualization() {
        if (!mainGroup) {
            console.error("mainGroup is not available");
            return;
        }

        console.log("Creating therapeutic area visualization with mainGroup:", mainGroup);

        // Clear any existing elements
        focusableElements = [];
        mainGroup.selectAll("*").remove();

        // Add a background rect to capture events
        mainGroup.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", -width/2)
            .attr("y", -height/2)
            .attr("fill", "transparent")
            .attr("class", "background-rect");

        // Center the visualization in the mainGroup
        contentGroup = mainGroup.append("g");

        // Create drop shadow filter
        const defs = contentGroup.append("defs");
        
        // Create drop shadow filter with proper rounded edges
        const dropShadow = defs.append("filter")
            .attr("id", "dropshadow")
            .attr("width", "200%")
            .attr("height", "200%")
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
            .attr("dx", 1.25)
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

        // Create containers for different layers
        const linesGroup = contentGroup.append("g").attr("class", "connecting-lines");
        const stagesGroup = contentGroup.append("g").attr("class", "stage-circles");
        const areaLabelsGroup = contentGroup.append("g").attr("class", "area-labels");

        // Create stage circles and labels
        Object.entries(stageRadii).forEach(([stage, radius]) => {
            // Get the stage color from our color definitions
            const stageFullName = getStageFullName(stage);
            const stageColor = getStageColor(stageFullName);
            
            stagesGroup.append("circle")
                .attr("r", radius)
                .attr("fill", "none")
                .attr("stroke", stageColor.stroke)
                .attr("stroke-width", 1.425)
                .attr("stroke-dasharray", "1,5")
                .attr("stroke-opacity", 1);

            const labelAngle = -Math.PI / 15;
            const labelX = radius * Math.cos(labelAngle) - 15;
            const labelY = radius * Math.sin(labelAngle) + 25;

            const labelGroup = stagesGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("class", "stage-label")
                .attr("id", `stage-label-${stage}`)
                .attr("cursor", "pointer");

            const tempText = labelGroup.append("text")
                .attr("opacity", 0)
                .text(stage);
            const textWidth = tempText.node()?.getBBox().width ?? 0;
            tempText.remove();

            labelGroup.append("rect")
                .attr("x", -stageLabelConfig.padding.x)
                .attr("y", -stageLabelConfig.height/2)
                .attr("width", textWidth + stageLabelConfig.padding.x * 2)
                .attr("height", stageLabelConfig.height)
                .attr("rx", stageLabelConfig.cornerRadius)
                .attr("fill", '#F8FAFC')
                .attr("opacity", 1);

            labelGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .attr("fill", stageColor.stroke)
                .attr("font-size", isAllYearView ? "8px" : "9.25px")
                .attr("font-weight", "400")
                .text(stage);
                
            // Add click handler for stage label
            labelGroup.on("click", (event) => {
                event.stopPropagation();
                
                // Hide tooltip immediately
                hideTooltip();
                
                const stageEntries = data.filter(entry => getStage(entry) === stage);
                setActiveStage(stage, stageEntries);
            });
        });

        const areas = processDataForTherapeuticAreas(data);
        // Use calculateCompanyAngles function from the utilities with 'company' key mapped to 'area'
        const areaAngles = calculateCompanyAngles(areas, ANGLE_BUFFER);
        // Use calculateOptimalLabelPlacement from utilities to position the labels
        const labelPlacements = calculateOptimalLabelPlacement(areas, areaAngles, labelConfig);

        // Create area nodes, labels, and drugs
        areas.forEach(area => {
            const angle = areaAngles.get(area.company); // Use company key (mapped to area) for consistency
            if (!angle) return;
            
            const labelPlacement = labelPlacements.find(l => l.company === area.company);
            if (!labelPlacement) return;

            const areaGroup = contentGroup.append("g");

            // Create sanitized ID for the area
            const areaId = area.area.replace(/\s+/g, '-').toLowerCase();

            // Calculate node position (where lines connect)
            const nodeRadius = radius * .9725;
            const nodeAngle = angle.center;
            const nodeX = nodeRadius * Math.cos(nodeAngle - Math.PI/2);
            const nodeY = nodeRadius * Math.sin(nodeAngle - Math.PI/2);

            // Get therapeutic area color
            const areaColor = getTherapeuticAreaColor(area.area);

            // Create area node at label position
            const nodeGroup = areaLabelsGroup.append("g")
                .attr("transform", `translate(${labelPlacement.x},${labelPlacement.y})`)
                .attr("cursor", "pointer")
                .attr("class", "area-label")
                .attr("id", `area-label-${areaId}`);

            nodeGroup.append("circle")
                .attr("class", "area-node")
                .attr("id", `area-node-${areaId}`)
                .attr("r", 2.725)
                .attr("fill", areaColor.fill)
                .attr("stroke", areaColor.stroke)
                .attr("stroke-width", 1);

            // Create label with text and dots
            createAreaLabelGroup(nodeGroup, area, labelPlacement);

            // Add connecting line from label to area center with data attribute
            linesGroup.append("path")
                .attr("class", "area-path")
                .attr("data-company", area.company) // Use company key for consistency with company tree
                .attr("data-area", area.area)
                .attr("d", `M${labelPlacement.x},${labelPlacement.y}L${nodeX},${nodeY}`)
                .attr("stroke", "#37587e")
                .attr("stroke-width", sizeConfig.connectionStrokeWidth)
                .attr("stroke-opacity", sizeConfig.connectionOpacity)
                .attr("fill", "none");

            // Connect drugs to area
            area.stages.forEach((drugs: any[], stage: string) => {
                const stageRadius = stageRadii[stage as keyof typeof stageRadii];
                const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);

                drugs.forEach((drug: any, i: number) => {
                    const drugAngle = angle.start + drugSpacing * (i + 1);
                    const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                    const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);

                    // Create unique ID for drug
                    const drugId = `${area.area}-${drug.Candidate}-${i}`.replace(/\s+/g, '-').toLowerCase();

                    // Add connecting line from node to drug with data attributes
                    linesGroup.append("path")
                        .attr("class", "drug-path")
                        .attr("data-company", area.company) // Use company key for consistency
                        .attr("data-area", area.area)
                        .attr("data-drug", drugId)
                        .attr("d", `M${nodeX},${nodeY}L${drugX},${drugY}`)
                        .attr("stroke", "#37587e")
                        .attr("stroke-width", sizeConfig.connectionStrokeWidth)
                        .attr("stroke-opacity", sizeConfig.connectionOpacity)
                        .attr("fill", "none");

                    // Drug node
                    const drugGroup = areaGroup.append("g")
                        .attr("transform", `translate(${drugX},${drugY})`)
                        .attr("cursor", "pointer")
                        .attr("class", "drug-node")
                        .attr("id", drugId);

                    // Get therapeutic area color for the drug
                    const drugAreaColors = getTherapeuticAreaColor(drug.TherapeuticArea1);

                    // Drug circle
                    drugGroup.append("circle")
                        .attr("r", sizeConfig.drugNodeRadius)
                        .attr("fill", drugAreaColors.fill)
                        .attr("stroke", drugAreaColors.stroke)
                        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                        .style("filter", "url(#dropshadow)");

                    // Add PRV indicator for PRV awarded drugs
                    if (drug["PRV Issue Year"]) {
                        drugGroup.append("circle")
                            .attr("r", sizeConfig.prvIndicatorRadius)
                            .attr("fill", "none")
                            .attr("stroke", "#976201")
                            .attr("stroke-width", isAllYearView ? "1.5" : "2")
                            .attr("stroke-dasharray", "2,2");
                    }

                    // Drug interactions
                    drugGroup
                        .on("mouseenter", (event) => {
                            // Highlight the drug node
                            drugGroup.select("circle")
                                .transition()
                                .duration(200)
                                .attr("r", sizeConfig.highlightedNodeRadius)
                                .attr("transform", "translate(8,)")
                                .style("filter", "url(#dropshadow)");

                            // Highlight PRV indicator if present
                            if (drug["PRV Issue Year"]) {
                                drugGroup.select("circle:last-child")
                                    .transition()
                                    .duration(200)
                                    .attr("r", sizeConfig.prvIndicatorRadius * 1.2)
                                    .attr("stroke-width", isAllYearView ? 3.5 : 4.725);
                            }
                            
                            // Highlight the connection line for this drug
                            highlightDrugConnections(drugId);
                            
                            // Use the parent's showTooltip function
                            showTooltip(event, drug);
                        })
                        .on("mousemove", (event) => {
                            // Update tooltip position when mouse moves
                            showTooltip(event, drug);
                        })
                        .on("mouseleave", () => {
                            // Reset drug node appearance
                            drugGroup.select("circle")
                                .transition()
                                .duration(200)
                                .attr("r", sizeConfig.drugNodeRadius)
                                .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                                .attr("stroke", drugAreaColors.stroke)
                                .attr("transform", "translate(0,0)")
                                .style("filter", "url(#dropshadow)");

                            // Reset PRV indicator if present
                            if (drug["PRV Issue Year"]) {
                                drugGroup.select("circle:last-child")
                                    .transition()
                                    .duration(200)
                                    .attr("r", sizeConfig.prvIndicatorRadius)
                                    .attr("stroke-width", isAllYearView ? "1.5" : "2");
                            }
                            
                            // Reset connection highlights
                            resetConnectionHighlights();
                            
                            // Use the parent's hideTooltip function
                            hideTooltip();
                        })
                        .on("click", (event) => {
                            event.stopPropagation();
                            
                            // Force immediate tooltip hiding without delay
                            hideTooltip();
                            
                            onShowDrugDetail({
                                drugName: drug.Candidate,
                                year: drug["PRV Year"] || drug["RPDD Year"],
                                Company: drug.Company,
                                therapeuticArea: drug.TherapeuticArea1,
                                entries: data.filter(d => d.TherapeuticArea1 === drug.TherapeuticArea1),
                                color: drugAreaColors.fill,
                                strokeColor: drugAreaColors.stroke,
                                currentStage: drug["Current Development Stage"],
                                indication: drug.Indication || "",
                                rpddAwardDate: drug["RPDD Year"],
                                voucherAwardDate: drug["PRV Year"] || "",
                                treatmentClass: drug.Class1 || "TBD",
                                mechanismOfAction: drug.MOA || "TBD",
                                companyUrl: drug["Link to CrunchBase"] || ""
                            });
                        });
                });
            });

            // Add interaction handlers for both node and label
            const handleMouseEnter = (event: MouseEvent) => {
                // Set this area as active
                setActiveArea(area, {
                    entries: area.entries,
                    areaName: area.area,
                    totalDrugs: area.totalDrugs,
                    uniqueCompanies: area.uniqueCompanies.size,
                    uniqueCandidates: area.uniqueCandidates.size,
                    clinicalTrials: area.clinicalTrials,
                    vouchersAwarded: area.vouchersAwarded
                });
                
                // Highlight all connections for this area
                highlightAreaConnections(area.area);
                
                // Use the parent's showTooltip function
                showTooltip(event, area, true);
            };

            const handleMouseMove = (event: MouseEvent) => {
                // Update tooltip position when mouse moves
                showTooltip(event, area, true);
            };
            
            const handleMouseLeave = () => {
                // Reset connection highlights
                resetConnectionHighlights();
                
                // Use the parent's hideTooltip function
                hideTooltip();
            };

            const handleClick = (event: MouseEvent) => {
                // Stop event propagation to prevent background click handler from firing
                event.stopPropagation();
                
                // Force immediate tooltip hiding without delay
                hideTooltip();
                
                // Keep area active after click and notify callback
                setActiveArea(area, {
                    entries: area.entries,
                    areaName: area.area,
                    totalDrugs: area.totalDrugs,
                    uniqueCompanies: area.uniqueCompanies.size,
                    uniqueCandidates: area.uniqueCandidates.size,
                    clinicalTrials: area.clinicalTrials,
                    vouchersAwarded: area.vouchersAwarded,
                    indications: area.indications
                });
                
                // Open the therapeutic area detail drawer
                openAreaDetailDrawer(area, {
                    entries: area.entries,
                    areaName: area.area,
                    totalDrugs: area.totalDrugs,
                    uniqueCompanies: area.uniqueCompanies.size,
                    uniqueCandidates: area.uniqueCandidates.size,
                    clinicalTrials: area.clinicalTrials,
                    vouchersAwarded: area.vouchersAwarded,
                    indications: area.indications
                });
            };

            // Apply handlers to the node group
            nodeGroup
                .on("mouseenter", handleMouseEnter)
                .on("mousemove", handleMouseMove)
                .on("mouseleave", handleMouseLeave)
                .on("click", handleClick);
        });

        // Add click handler to background to clear selections
        mainGroup.select(".background-rect").on("click", () => {
            activeArea = null;
            activeStage = null;
            resetConnectionHighlights();
            hideTooltip(); // Ensure tooltip is hidden when clicking on background
            onLeave();
        });
    }

    // React to changes in isAllYearView or mainGroup
    $: if (mainGroup && data.length > 0) {
        // Recreate visualization when view mode changes or mainGroup is available
        createVisualization();
    }
    
    // Initialize visualization on mount
    onMount(() => {
        if (mainGroup && data.length > 0) {
            createVisualization();
        }
    });
</script>

<!-- Remove the chart-container div and SVG element since we're using the parent's SVG -->
<!-- Remove the RPDTooltip component since we're using the parent's tooltip -->

<!-- Remove the TherapeuticAreaDetailDrawer component -->
<!-- <TherapeuticAreaDetailDrawer 
    isOpen={isAreaDetailDrawerOpen}
    areaDetail={selectedAreaDetail}
    onClose={closeAreaDetailDrawer}
/> -->
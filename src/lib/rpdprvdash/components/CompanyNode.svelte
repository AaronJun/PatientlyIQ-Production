<!-- CompanyNode.svelte -->
<script lang="ts">
    import * as d3 from 'd3';
    import { getTherapeuticAreaColor, getCompanyStatusColor } from '../utils/colorDefinitions';
    import { 
        getStage, 
        formatCompanyName
    } from '../utils/data-processing-utils';
    
    // Component props
    export let company: any;
    export let companyAngles: any;
    export let labelPlacement: any;
    export let stageRadii: any;
    export let sizeConfig: any;
    export let labelConfig: any;
    export let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let linesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let companyLabelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let highlightColor: string;
    export let highlightWidth: number;
    export let data: any[];
    export let tabIndex: number = 0; // Changed default to 0 so elements are in the natural tab order
    export let indexOffset: number = 0; // Used to control tab order across multiple companies
    
    // Callback functions
    export let onShowTooltip: (event: MouseEvent, data: any, isCompany?: boolean) => void;
    export let onHideTooltip: () => void;
    export let onShowCompanyDetail: (detail: any) => void;
    export let onShowDrugDetail: (detail: any) => void;
    export let onHighlightCompanyConnections: (companyName: string) => void;
    export let onHighlightDrugConnections: (drugId: string) => void;
    export let onResetConnectionHighlights: () => void;
    
    // Local variables
    let companyGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    let nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    let nodeRect: d3.Selection<SVGRectElement, unknown, null, undefined>;
    let labelGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    let labelText: d3.Selection<SVGTextElement, unknown, null, undefined>;
    let drugGroups: d3.Selection<SVGGElement, unknown, null, undefined>[] = [];
    let isCompanySelected: boolean = false;
    
    // Create sanitized ID for the company
    const companyId = company.company.replace(/\s+/g, '-').toLowerCase();
    
    // Get angle for this company
    const angle = companyAngles.get(company.company);
    
    // Calculate node position (where lines connect)
    const nodeRadius = labelConfig.radius * .9725;
    const nodeAngle = angle.center;
    const nodeX = nodeRadius * Math.cos(nodeAngle - Math.PI/2);
    const nodeY = nodeRadius * Math.sin(nodeAngle - Math.PI/2);
    
    // Get company status color
    const statusColor = getCompanyStatusColor(company.status);
    
    // Calculate actual tabindex for this company node
    const actualTabIndex = tabIndex + indexOffset;
    
    /**
     * Initialize the company node, connections, and drug nodes
     */
    export function initialize() {
        // Create company group
        companyGroup = mainGroup.append("g");
        
        // Add connecting line from node to label
        linesGroup.append("path")
            .attr("class", "company-path")
            .attr("data-company", company.company)
            .attr("d", `M${nodeX},${nodeY}L${labelPlacement.x},${labelPlacement.y}`)
            .attr("stroke", "#37587e")
            .attr("stroke-width", sizeConfig.connectionStrokeWidth)
            .attr("stroke-opacity", sizeConfig.connectionOpacity)
            .attr("fill", "none");
        
        // Create node
        createNode();
        
        // Create label
        createLabel();
        
        // Create drug nodes
        createDrugNodes();
    }
    
    /**
     * Create the company node
     */
    function createNode() {
        nodeGroup = companyLabelsGroup.append("g")
            .attr("transform", `translate(${nodeX},${nodeY})`)
            .attr("cursor", "pointer")
            .attr("class", "company-node")
            .attr("id", `company-node-${companyId}`)
            .attr("tabindex", actualTabIndex) // Use calculated tabIndex to ensure proper tab order
            .attr("role", "button")
            .attr("aria-label", `Company ${company.company} with ${company.totalDrugs} drugs`);
        
        // Ensure the SVG element can receive focus
        nodeGroup.node().setAttribute("focusable", "true");
        
        nodeRect = nodeGroup.append("rect")
            .attr("width", sizeConfig.companyNodeWidth)
            .attr("height", sizeConfig.companyNodeHeight)
            .attr("fill", statusColor.fill)
            .attr("stroke", statusColor.stroke)
            .attr("transform", `translate(${-sizeConfig.companyNodeWidth/2}, ${-sizeConfig.companyNodeHeight/2})`)
            .attr("stroke-width", 0.725)
            .attr("rx", 2);
        
        // Add explicit click handler to node
        nodeGroup.on("click", function(event) {
            event.stopPropagation();
            console.log("Node clicked for company:", company.company);
            onShowCompanyDetail({
                Company: company.company,
                entries: company.entries,
                color: statusColor.fill,
                strokeColor: statusColor.stroke
            });
        });
        
        // Add keyboard event handler for accessibility
        nodeGroup.on("keydown", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                
                console.log("Company keydown event triggered:", company.company);
                
                // Toggle company selection state
                isCompanySelected = !isCompanySelected;
                
                if (isCompanySelected) {
                    // Make drug nodes focusable when company is selected
                    drugGroups.forEach((drugGroup, i) => {
                        const drugTabIndex = actualTabIndex + i + 1;
                        drugGroup.attr("tabindex", drugTabIndex);
                        drugGroup.node().setAttribute("focusable", "true");
                    });
                    
                    // Apply selected styling
                    nodeRect
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 2)
                        .attr("stroke", highlightColor);
                        
                    // Show company detail
                    onShowCompanyDetail({
                        Company: company.company,
                        entries: company.entries,
                        color: statusColor.fill,
                        strokeColor: statusColor.stroke
                    });
                } else {
                    // Make drug nodes not focusable when company is deselected
                    drugGroups.forEach(drugGroup => {
                        drugGroup.attr("tabindex", -1);
                    });
                    
                    // Remove selected styling
                    nodeRect
                        .transition()
                        .duration(200)
                        .attr("stroke-width", 0.725)
                        .attr("stroke", statusColor.stroke);
                }
            }
        });
        
        // Add focus handlers for keyboard navigation
        nodeGroup.on("focus", function(event) {
            console.log("Company node focused:", company.company);
            
            // Highlight connections
            onHighlightCompanyConnections(company.company);
            
            // Enhance visual feedback for the node
            nodeRect
                .transition()
                .duration(200)
                .attr("width", sizeConfig.companyNodeWidth * 1.15)
                .attr("height", sizeConfig.companyNodeHeight * 1.15)
                .attr("transform", `translate(${-(sizeConfig.companyNodeWidth * 1.15)/2}, ${-(sizeConfig.companyNodeHeight * 1.15)/2})`)
                .attr("stroke-width", 1.25);
            
            if (labelText) {
                labelText
                    .transition()
                    .duration(200)
                    .attr("font-weight", "800")
                    .attr("fill", "#2B6CB0");
            }
            
            // Show tooltip near the node
            const rect = (event.target as SVGGElement).getBoundingClientRect();
            const fakeEvent = {
                clientX: rect.left + rect.width/2,
                clientY: rect.top + rect.height/2
            } as MouseEvent;
            
            onShowTooltip(fakeEvent, {
                company: company.company,
                totalDrugs: company.totalDrugs,
                status: company.status
            }, true);
        });
        
        nodeGroup.on("blur", function() {
            if (!isCompanySelected) {
                // Reset node appearance if not selected
                nodeRect
                    .transition()
                    .duration(200)
                    .attr("width", sizeConfig.companyNodeWidth)
                    .attr("height", sizeConfig.companyNodeHeight)
                    .attr("transform", `translate(${-sizeConfig.companyNodeWidth/2}, ${-sizeConfig.companyNodeHeight/2})`)
                    .attr("stroke-width", 0.725);
                
                if (labelText) {
                    labelText
                        .transition()
                        .duration(200)
                        .attr("font-weight", sizeConfig.labelFontWeight)
                        .attr("fill", "#4A5568");
                }
                
                onResetConnectionHighlights();
                onHideTooltip();
            }
        });
        
        // Add hover handlers
        nodeGroup.on("mouseenter", function(event) {
            onHighlightCompanyConnections(company.company);
            
            nodeRect
                .transition()
                .duration(200)
                .attr("width", sizeConfig.companyNodeWidth * 1.15)
                .attr("height", sizeConfig.companyNodeHeight * 1.15)
                .attr("transform", `translate(${-(sizeConfig.companyNodeWidth * 1.15)/2}, ${-(sizeConfig.companyNodeHeight * 1.15)/2})`)
                .attr("stroke-width", 1.25);
            
            if (labelText) {
                labelText
                    .transition()
                    .duration(200)
                    .attr("font-weight", "800")
                    .attr("fill", "#2B6CB0");
            }
            
            onShowTooltip(event, {
                company: company.company,
                totalDrugs: company.totalDrugs,
                status: company.status
            }, true);
        });
        
        nodeGroup.on("mousemove", function(event) {
            onShowTooltip(event, {
                company: company.company,
                totalDrugs: company.totalDrugs,
                status: company.status
            }, true);
        });
        
        nodeGroup.on("mouseleave", function() {
            if (!isCompanySelected) {
                nodeRect
                    .transition()
                    .duration(200)
                    .attr("width", sizeConfig.companyNodeWidth)
                    .attr("height", sizeConfig.companyNodeHeight)
                    .attr("transform", `translate(${-sizeConfig.companyNodeWidth/2}, ${-sizeConfig.companyNodeHeight/2})`)
                    .attr("stroke-width", 0.725);
                
                if (labelText) {
                    labelText
                        .transition()
                        .duration(200)
                        .attr("font-weight", sizeConfig.labelFontWeight)
                        .attr("fill", "#4A5568");
                }
                
                onResetConnectionHighlights();
                onHideTooltip();
            }
        });
    }
    
    /**
     * Create the company label
     */
    function createLabel() {
        labelGroup = companyLabelsGroup.append("g")
            .attr("transform", `translate(${labelPlacement.x},${labelPlacement.y})`)
            .attr("cursor", "pointer")
            .attr("class", "company-label")
            .attr("id", `company-label-${companyId}`);
        
        const textContainer = labelGroup.append("g");
        
        const textRotation = labelPlacement.isRightSide 
            ? (nodeAngle * 180 / Math.PI)
            : (nodeAngle * 180 / Math.PI) + 180;
        
        textContainer.attr("transform", `rotate(${textRotation})`);
        
        labelText = textContainer.append("text")
            .attr("text-anchor", labelPlacement.isRightSide ? "start" : "end")
            .attr("dx", labelPlacement.isRightSide ? 0 : 0)
            .attr("dy", "0.35em")
            .text(formatCompanyName(company.company))
            .attr("fill", "#4A5568")
            .attr("font-size", sizeConfig.labelFontSize)
            .attr("font-weight", sizeConfig.labelFontWeight);
        
        // Add explicit click handler to label
        labelGroup.on("click", function(event) {
            event.stopPropagation();
            console.log("Label clicked for company:", company.company);
            onShowCompanyDetail({
                Company: company.company,
                entries: company.entries,
                color: statusColor.fill,
                strokeColor: statusColor.stroke
            });
        });
        
        // Add hover handlers
        labelGroup.on("mouseenter", function(event) {
            onHighlightCompanyConnections(company.company);
            
            nodeRect
                .transition()
                .duration(200)
                .attr("width", sizeConfig.companyNodeWidth * 1.15)
                .attr("height", sizeConfig.companyNodeHeight * 1.15)
                .attr("transform", `translate(${-(sizeConfig.companyNodeWidth * 1.15)/2}, ${-(sizeConfig.companyNodeHeight * 1.15)/2})`)
                .attr("stroke-width", 1.25);
            
            labelText
                .transition()
                .duration(200)
                .attr("font-weight", "800")
                .attr("fill", "#2B6CB0");
            
            onShowTooltip(event, {
                company: company.company,
                totalDrugs: company.totalDrugs,
                status: company.status
            }, true);
        });
        
        labelGroup.on("mousemove", function(event) {
            onShowTooltip(event, {
                company: company.company,
                totalDrugs: company.totalDrugs,
                status: company.status
            }, true);
        });
        
        labelGroup.on("mouseleave", function() {
            if (!isCompanySelected) {
                nodeRect
                    .transition()
                    .duration(200)
                    .attr("width", sizeConfig.companyNodeWidth)
                    .attr("height", sizeConfig.companyNodeHeight)
                    .attr("transform", `translate(${-sizeConfig.companyNodeWidth/2}, ${-sizeConfig.companyNodeHeight/2})`)
                    .attr("stroke-width", 0.725);
                
                labelText
                    .transition()
                    .duration(200)
                    .attr("font-weight", sizeConfig.labelFontWeight)
                    .attr("fill", "#4A5568");
                
                onResetConnectionHighlights();
                onHideTooltip();
            }
        });
    }
    
    /**
     * Set this company as active or inactive
     * @param isActive Whether this company should be active
     */
    export function setActive(isActive: boolean) {
        isCompanySelected = isActive;
        
        if (isActive) {
            // Highlight the company
            labelText
                .transition()
                .duration(500)
                .attr("font-weight", "800")
                .attr("fill", "#2B6CB0");
                
            // Highlight connections
            onHighlightCompanyConnections(company.company);
            
            // Make drug nodes focusable
            drugGroups.forEach((drugGroup, i) => {
                const drugTabIndex = actualTabIndex + i + 1;
                drugGroup.attr("tabindex", drugTabIndex);
                drugGroup.node().setAttribute("focusable", "true");
            });
        } else {
            // Reset to inactive state
            labelText
                .transition()
                .duration(500)
                .attr("font-weight", sizeConfig.labelFontWeight)
                .attr("fill", "#4A5568");
                
            // Make drug nodes not focusable
            drugGroups.forEach(drugGroup => {
                drugGroup.attr("tabindex", -1);
            });
        }
    }
    
    /**
     * Manually focus this company node
     */
    export function focus() {
        nodeGroup.node()?.focus();
    }
    
    /**
     * Creates drug nodes for each stage and connects them to the company node
     */
    function createDrugNodes() {
        let drugIndex = 0;
        
        company.stages.forEach((drugs: any[], stage: string) => {
            const stageRadius = stageRadii[stage];
            const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);
            
            drugs.forEach((drug: any, i: number) => {
                const drugAngle = angle.start + drugSpacing * (i + 1);
                const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);
                
                // Create unique ID for drug
                const drugId = `${company.company}-${drug.Candidate}-${i}`.replace(/\s+/g, '-').toLowerCase();
                
                // Add connecting line from node to drug
                linesGroup.append("path")
                    .attr("class", "drug-path")
                    .attr("data-company", company.company)
                    .attr("data-drug", drugId)
                    .attr("d", `M${nodeX},${nodeY}L${drugX},${drugY}`)
                    .attr("stroke", "#37587e")
                    .attr("stroke-width", sizeConfig.connectionStrokeWidth)
                    .attr("stroke-opacity", sizeConfig.connectionOpacity)
                    .attr("fill", "none");
                
                const drugGroup = companyGroup.append("g")
                    .attr("transform", `translate(${drugX},${drugY})`)
                    .attr("cursor", "pointer")
                    .attr("class", "drug-node")
                    .attr("id", drugId)
                    .attr("tabindex", -1) // Initially not focusable until company is selected
                    .attr("role", "button")
                    .attr("aria-label", `Drug ${drug.Candidate} for ${drug.Indication || 'unknown indication'}, stage: ${drug["Current Development Stage"] || 'unknown stage'}`);
                
                // Ensure the SVG element can receive focus
                drugGroup.node().setAttribute("focusable", "true");
                
                // Store reference to drug group for keyboard navigation
                drugGroups.push(drugGroup);
                drugIndex++;
                
                // Get therapeutic area color
                const areaColors = getTherapeuticAreaColor(drug.TherapeuticArea1);
                
                // Drug circle
                drugGroup.append("circle")
                    .attr("r", sizeConfig.drugNodeRadius)
                    .attr("fill", areaColors.fill)
                    .attr("stroke", areaColors.stroke)
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                    .style("filter", "url(#dropshadow)"); // Apply drop shadow
                
                // Add PRV indicator for PRV awarded drugs
                if (drug["PRV Issue Year"]) {
                    drugGroup.append("circle")
                        .attr("r", sizeConfig.prvIndicatorRadius)
                        .attr("fill", "none")
                        .attr("stroke", "#976201")
                        .attr("stroke-width", sizeConfig.isAllYearView ? "1.125" : "2")
                        .attr("stroke-dasharray", "2,2");
                }
                
                // Add keyboard event handler for accessibility
                drugGroup.on("keydown", function(event) {
                    console.log("Drug keydown event:", drug.Candidate);
                    
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        
                        onShowDrugDetail({
                            drugName: drug.Candidate,
                            year: drug["PRV Year"] || drug["RPDD Year"],
                            Company: drug.Company,
                            therapeuticArea: drug.TherapeuticArea1,
                            entries: data.filter(d => d.TherapeuticArea1 === drug.TherapeuticArea1),
                            color: areaColors.fill,
                            strokeColor: areaColors.stroke,
                            currentStage: drug["Current Development Stage"],
                            indication: drug.Indication || "",
                            rpddAwardDate: drug["RPDD Year"],
                            voucherAwardDate: drug["PRV Year"] || "",
                            treatmentClass: drug.Class1 || "TBD",
                            mechanismOfAction: drug.MOA || "TBD",
                            companyUrl: drug["Link to CrunchBase"] || ""
                        });
                    } else if (event.key === "Escape") {
                        // Return focus to company node when Escape is pressed
                        event.preventDefault();
                        nodeGroup.node()?.focus();
                    }
                });
                
                // Add focus handlers for keyboard navigation
                drugGroup.on("focus", function(event) {
                    console.log("Drug node focused:", drug.Candidate);
                    
                    // Highlight the drug node
                    drugGroup.select("circle")
                        .transition()
                        .duration(200)
                        .attr("r", sizeConfig.highlightedNodeRadius)
                        .style("filter", "url(#dropshadow)");
                    
                    // Highlight PRV indicator if present
                    if (drug["PRV Issue Year"]) {
                        drugGroup.select("circle:last-child")
                            .transition()
                            .duration(200)
                            .attr("r", sizeConfig.highlightedNodeRadius)
                            .attr("stroke-width", sizeConfig.isAllYearView ? 3.5 : 4.725);
                    }
                    
                    // Highlight the connection line for this drug
                    onHighlightDrugConnections(drugId);
                    
                    // Show tooltip near the node
                    const rect = (event.target as SVGGElement).getBoundingClientRect();
                    const fakeEvent = {
                        clientX: rect.left + rect.width/2,
                        clientY: rect.top + rect.height/2
                    } as MouseEvent;
                    
                    onShowTooltip(fakeEvent, drug);
                });
                
                drugGroup.on("blur", function() {
                    // Reset drug node appearance
                    drugGroup.select("circle")
                        .transition()
                        .duration(200)
                        .attr("r", sizeConfig.drugNodeRadius)
                        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                        .attr("stroke", areaColors.stroke)
                        .style("filter", "url(#dropshadow)");
                    
                    // Reset PRV indicator if present
                    if (drug["PRV Issue Year"]) {
                        drugGroup.select("circle:last-child")
                            .transition()
                            .duration(200)
                            .attr("r", sizeConfig.prvIndicatorRadius)
                            .attr("stroke-width", sizeConfig.isAllYearView ? "1.5" : "2");
                    }
                    
                    // Reset connection highlights
                    onResetConnectionHighlights();
                    
                    onHideTooltip();
                });
                
                // Drug interactions
                drugGroup
                    .on("mouseenter", (event) => {
                        // Highlight the drug node
                        drugGroup.select("circle")
                            .transition()
                            .duration(200)
                            .attr("r", sizeConfig.highlightedNodeRadius)
                            .style("filter", "url(#dropshadow)");
                        
                        // Highlight PRV indicator if present
                        if (drug["PRV Issue Year"]) {
                            drugGroup.select("circle:last-child")
                                .transition()
                                .duration(200)
                                .attr("r", sizeConfig.highlightedNodeRadius)
                                .attr("stroke-width", sizeConfig.isAllYearView ? 3.5 : 4.725);
                        }
                        
                        // Highlight the connection line for this drug
                        onHighlightDrugConnections(drugId);
                        
                        onShowTooltip(event, drug);
                    })
                    .on("mousemove", (event) => {
                        // Update tooltip position when mouse moves
                        onShowTooltip(event, drug);
                    })
                    .on("mouseleave", () => {
                        // Reset drug node appearance
                        drugGroup.select("circle")
                            .transition()
                            .duration(200)
                            .attr("r", sizeConfig.drugNodeRadius)
                            .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                            .attr("stroke", areaColors.stroke)
                            .style("filter", "url(#dropshadow)");
                        
                        // Reset PRV indicator if present
                        if (drug["PRV Issue Year"]) {
                            drugGroup.select("circle:last-child")
                                .transition()
                                .duration(200)
                                .attr("r", sizeConfig.prvIndicatorRadius)
                                .attr("stroke-width", sizeConfig.isAllYearView ? "1.5" : "2");
                        }
                        
                        // Reset connection highlights
                        onResetConnectionHighlights();
                        
                        onHideTooltip();
                    })
                    .on("click", (event) => {
                        event.stopPropagation();
                        
                        onShowDrugDetail({
                            drugName: drug.Candidate,
                            year: drug["PRV Year"] || drug["RPDD Year"],
                            Company: drug.Company,
                            therapeuticArea: drug.TherapeuticArea1,
                            entries: data.filter(d => d.TherapeuticArea1 === drug.TherapeuticArea1),
                            color: areaColors.fill,
                            strokeColor: areaColors.stroke,
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
    }
</script>
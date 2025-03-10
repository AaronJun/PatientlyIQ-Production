<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDTooltip from '../RPDTooltip.svelte';
    
    // Import the color definitions
    import { 
        getTherapeuticAreaColor, 
        getStageColor, 
        getCompanyStatusColor
    } from '../utils/colorDefinitions';
    
    // Import our utility functions
    import {
        getStage,
        getStageFullName,
        formatCompanyName,
        calculateCompanyAngles,
        calculateOptimalLabelPlacement,
        processDataForLayout,
        getSizeConfig,
        getLabelConfig,
        getStageRadii,
        getStageLabelConfig,
        hasPRVAward
    } from '../utils/data-processing-utils';


    // Component props
    export let data: any[] = [];
    export let onCompanyHover: (entries: any[]) => void = () => {};
    export let onStageHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};
    export let isAllYearView: boolean = false;


    // SVG and dimension configuration
    let svg: SVGElement;
    const width = 920;
    const height = width;
    const radius = Math.min(width, height) / 2 - 60;
    const ANGLE_BUFFER = isAllYearView ? Math.PI / 32 : Math.PI / 64;

    // Get configuration from utility functions
    $: sizeConfig = getSizeConfig(isAllYearView);
    $: labelConfig = getLabelConfig(radius, isAllYearView);
    $: stageRadii = getStageRadii(radius);
    const stageLabelConfig = getStageLabelConfig();

    // Connection highlight color
    const highlightColor = "#FFD700"; // Gold color for highlighted connections
    const highlightWidth = isAllYearView ? 1.75 : 2.25; // Width for highlighted connections

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
    const tooltipOffset = { x: 15, y: 15 };
    let tooltipTimeout: any = null;

    // Active selection tracking
    let activeCompany: any = null;
    let activeStage: any = null;
    
    // Track elements that can be keyboard-focused
    let focusableElements: { 
        element: Element, 
        type: string, 
        company?: string, 
        isSelected?: boolean, 
        drugNodes?: Array<{ element: Element, drug: any }>,
        index?: number
    }[] = [];

    
    
    function createVisualization() {
        if (!svg) return;

        // Clear any existing elements
        focusableElements = [];

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        // Create drop shadow filter
        const defs = svgElement.append("defs");
        
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
            
        // Create green glow filter for purchased vouchers
        const greenGlow = defs.append("filter")
            .attr("id", "greenGlow")
            .attr("width", "200%")
            .attr("height", "200%")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("filterUnits", "userSpaceOnUse");
            
        greenGlow.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3)
            .attr("result", "blur");
            
        greenGlow.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("result", "offsetBlur");
            
        // Apply green color to the shadow
        greenGlow.append("feColorMatrix")
            .attr("in", "offsetBlur")
            .attr("type", "matrix")
            .attr("values", "0 0 0 0 0.2 0 0 0 0 0.8 0 0 0 0 0.2 0 0 0 1 0")
            .attr("result", "coloredBlur");
            
        // Create a composite of the original shape with the green glow
        const greenMerge = greenGlow.append("feMerge");
        greenMerge.append("feMergeNode")
            .attr("in", "coloredBlur");
        greenMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
            
        // Create yellow glow filter for filed PRV status
        const yellowGlow = defs.append("filter")
            .attr("id", "yellowGlow")
            .attr("width", "200%")
            .attr("height", "200%")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("filterUnits", "userSpaceOnUse");
            
        yellowGlow.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3)
            .attr("result", "blur");
            
        yellowGlow.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("result", "offsetBlur");
            
        // Apply yellow color to the shadow
        yellowGlow.append("feColorMatrix")
            .attr("in", "offsetBlur")
            .attr("type", "matrix")
            .attr("values", "0 0 0 0 0.9 0 0 0 0 0.8 0 0 0 0 0.2 0 0 0 1 0")
            .attr("result", "coloredBlur");
            
        // Create a composite of the original shape with the yellow glow
        const yellowMerge = yellowGlow.append("feMerge");
        yellowMerge.append("feMergeNode")
            .attr("in", "coloredBlur");
        yellowMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");

        const mainGroup = svgElement.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        const linesGroup = mainGroup.append("g").attr("class", "connecting-lines");
        const stagesGroup = mainGroup.append("g").attr("class", "stage-circles");
        const companyLabelsGroup = mainGroup.append("g").attr("class", "company-labels");



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
                .attr("font-size", isAllYearView ? "8px" : "11.25px")
                .attr("font-weight", "400")
                .text(stage);
                
            // Add click handler for stage label
            labelGroup.on("click", (event) => {
                event.stopPropagation();
                
                // Hide tooltip immediately
                if (tooltipTimeout) {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = null;
                }
                tooltipVisible = false;
                
                const stageEntries = data.filter(entry => getStage(entry) === stage);
                setActiveStage(stage, stageEntries);
            });
        });

        const companies = processDataForLayout(data);
        const companyAngles = calculateCompanyAngles(companies, ANGLE_BUFFER);
        const labelPlacements = calculateOptimalLabelPlacement(companies, companyAngles, labelConfig);

        // Create company nodes directly with D3 but add keyboard accessibility
        companies.forEach((company, index) => {
            const angle = companyAngles.get(company.company);
            if (!angle) return;
            
            const companyGroup = mainGroup.append("g");

            // Create sanitized ID for the company
            const companyId = company.company.replace(/\s+/g, '-').toLowerCase();

            // Calculate node position (where lines connect)
            const nodeRadius = radius * 1;
            const nodeAngle = angle.center - Math.PI/2; // Adjust for SVG coordinates
            const nodeX = nodeRadius * Math.cos(nodeAngle);
            const nodeY = nodeRadius * Math.sin(nodeAngle);

            // Get company status color
            const statusColor = getCompanyStatusColor(company.status);

            // Create company node with keyboard accessibility support
            const nodeGroup = companyLabelsGroup.append("g")
                .attr("transform", `translate(${nodeX},${nodeY})`)
                .attr("cursor", "pointer")
                .attr("class", "company-node")
                .attr("id", `company-node-${companyId}`)
                .attr("tabindex", index + 1) // Sequential tabindex starting from 1 for proper tab order
                .attr("role", "button")
                .attr("aria-label", `Company ${company.company} with ${company.totalDrugs} drugs`);

            // Ensure SVG element can receive focus
            const nodeElement = nodeGroup.node();
            if (nodeElement) {
                nodeElement.setAttribute("focusable", "true");
                // Store reference for keyboard navigation
                focusableElements.push({
                    element: nodeElement,
                    type: 'company',
                    company: company.company,
                    isSelected: false,
                    index: index,
                    drugNodes: []
                });
            }

            nodeGroup.append("rect")
                .attr("width", sizeConfig.companyNodeWidth)
                .attr("height", sizeConfig.companyNodeHeight)
                .attr("fill", statusColor.fill)
                .attr("stroke", statusColor.stroke)
                .attr("transform", `translate(${-sizeConfig.companyNodeWidth/2}, ${-sizeConfig.companyNodeHeight/2})`)
                .attr("stroke-width", 0.725)
                .attr("rx", 2);

            // Calculate label position aligned with node angle
            // Use outer position from node (not the center of the chart)
            const labelDistance = radius * 1.05; // Position labels outside the outermost stage circle
            const labelX = nodeX + (labelDistance - nodeRadius) * Math.cos(nodeAngle);
            const labelY = nodeY + (labelDistance - nodeRadius) * Math.sin(nodeAngle);

            // Determine if label should be on left or right side based on position in circle
            const isRightSide = Math.cos(nodeAngle) > 0;
            
            // Create label with alignment to connecting line
            const labelGroup = companyLabelsGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer")
                .attr("class", "company-label")
                .attr("id", `company-label-${companyId}`);

            // Create rotated text container for better alignment
            const textContainer = labelGroup.append("g");
            
            const textRotation = isRightSide 
                ? (nodeAngle * 180 / Math.PI)
                : (nodeAngle * 180 / Math.PI) + 180;
            
            // Apply rotation transform
            textContainer.attr("transform", `rotate(${textRotation})`);
            
            // Add the text with appropriate anchor
            const labelText = textContainer.append("text")
                .attr("text-anchor", isRightSide ? "start" : "end")
                .attr("dx", isRightSide ? 0 : 0) // Small offset from connection point
                .attr("dy", "0.35em")
                .text(formatCompanyName(company.company))
                .attr("fill", "#4A5568")
                .attr("font-size", sizeConfig.labelFontSize)
                .attr("font-weight", sizeConfig.labelFontWeight);

            // Connect node to label with a direct line
            linesGroup.append("path")
                .attr("class", "company-path")
                .attr("data-company", company.company)
                .attr("d", `M${nodeX},${nodeY}L${labelX},${labelY}`)
                .attr("stroke", "#37587e")
                .attr("stroke-width", sizeConfig.connectionStrokeWidth)
                .attr("stroke-opacity", sizeConfig.connectionOpacity)
                .attr("fill", "none");

            // Connect drugs to node
            company.stages.forEach((drugs: any[], stage: string) => {
                const stageRadius = stageRadii[stage as keyof typeof stageRadii];
                const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);

                drugs.forEach((drug: any, i: number) => {
                    const drugAngle = angle.start + drugSpacing * (i + 1);
                    const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                    const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);

                    // Create unique ID for drug
                    const drugId = `${company.company}-${drug.Candidate}-${i}`.replace(/\s+/g, '-').toLowerCase();

                    // Add connecting line from node to drug with data attributes for company and drug
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
                    const drugElement = drugGroup.node();
                    if (drugElement && nodeElement) {
                        drugElement.setAttribute("focusable", "true");
                        
                        // Store drug node reference in the company's drugNodes array
                        const companyRef = focusableElements.find(item => item.element === nodeElement);
                        if (companyRef && companyRef.drugNodes) {
                            companyRef.drugNodes.push({
                                element: drugElement,
                                drug: drug
                            });
                        }
                    }

                    // Get therapeutic area color
                    const areaColors = getTherapeuticAreaColor(drug.TherapeuticArea1);

                    // Determine which filter to use based on drug status
                    let filterUrl = "url(#dropshadow)";
                    if (drug.Purchased === "Y") {
                        filterUrl = "url(#greenGlow)";
                    } else if (drug["PRV Status"] === "Filed") {
                        filterUrl = "url(#yellowGlow)";
                    }

                    // Determine stroke color - use gold for transacted PRVs
                    const strokeColor = drug["Purchase Year"] ? "#FFD700" : areaColors.stroke;

                    // Drug circle
                    drugGroup.append("circle")
                        .attr("r", sizeConfig.drugNodeRadius)
                        .attr("fill", areaColors.fill)
                        .attr("stroke", strokeColor)
                        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                        .style("filter", filterUrl); // Apply appropriate filter

                    // Add keyboard event handler for accessibility
                    drugGroup.on("keydown", function(event: KeyboardEvent) {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            
                            // Show drug details
                            onShowDrugDetail({
                                drugName: drug.Candidate,
                                year: drug["PRV Year"] || drug["RPDD Year"],
                                Company: drug.Company,
                                therapeuticArea: drug.TherapeuticArea1,
                                entries: data.filter(d => d.TherapeuticArea1 === drug.TherapeuticArea1),
                                color: areaColors.fill,
                                strokeColor: strokeColor,
                                currentStage: drug["Current Development Stage"],
                                indication: drug.Indication || "",
                                rpddAwardDate: drug["RPDD Year"],
                                voucherAwardDate: drug["PRV Year"] || "",
                                treatmentClass: drug.Class1 || "TBD",
                                mechanismOfAction: drug.MOA || "TBD",
                                companyUrl: drug["Link to CrunchBase"] || ""
                            });
                        } else if (event.key === "Escape") {
                            // Return focus to company node
                            event.preventDefault();
                            nodeElement?.focus();
                        }
                    });

                    // Add focus handlers for keyboard navigation
                    drugGroup.on("focus", function(event: FocusEvent) {
                        // Highlight the drug node
                        drugGroup.select("circle")
                            .transition()
                            .duration(200)
                            .attr("r", sizeConfig.highlightedNodeRadius)
                            .style("filter", filterUrl);
                        
                        // Highlight the connection line for this drug
                        highlightDrugConnections(drugId);
                        
                        showTooltip(event as unknown as MouseEvent, drug);
                    });
                    
                    drugGroup.on("blur", function() {
                        // Reset drug node appearance
                        drugGroup.select("circle")
                            .transition()
                            .duration(200)
                            .attr("r", sizeConfig.drugNodeRadius)
                            .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                            .attr("stroke", strokeColor)
                            .style("filter", filterUrl);
                        
                        // Reset connection highlights
                        resetConnectionHighlights();
                        
                        hideTooltip();
                    });
                    
                    // Drug mouse interactions
                    drugGroup
                        .on("mouseenter", (event: MouseEvent) => {
                            // Highlight the drug node
                            drugGroup.select("circle")
                                .transition()
                                .duration(200)
                                .attr("r", sizeConfig.highlightedNodeRadius)
                                .style("filter", filterUrl);
                            
                            // Highlight the connection line for this drug
                            highlightDrugConnections(drugId);
                            
                            showTooltip(event, drug);
                        })
                        .on("mousemove", (event: MouseEvent) => {
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
                                .attr("stroke", strokeColor)
                                .style("filter", filterUrl);
                            
                            // Reset connection highlights
                            resetConnectionHighlights();
                            
                            hideTooltip();
                        })
                        .on("click", (event: MouseEvent) => {
                            event.stopPropagation();
                            
                            // Force immediate tooltip hiding without delay
                            if (tooltipTimeout) {
                                clearTimeout(tooltipTimeout);
                                tooltipTimeout = null;
                            }
                            tooltipVisible = false;
                            
                            // Add Purchase information to detail view if available
                            onShowDrugDetail({
                                drugName: drug.Candidate,
                                year: drug["Purchase Year"] || drug["PRV Year"] || drug["RPDD Year"],
                                Company: drug.Company,
                                therapeuticArea: drug.TherapeuticArea1,
                                entries: data.filter(d => d.TherapeuticArea1 === drug.TherapeuticArea1),
                                color: areaColors.fill,
                                strokeColor: strokeColor,
                                currentStage: drug["Current Development Stage"],
                                indication: drug.Indication || "",
                                rpddAwardDate: drug["RPDD Year"],
                                voucherAwardDate: drug["PRV Year"] || "",
                                prvStatus: drug["PRV Status"] || "",
                                transactionDate: drug["Purchase Year"] || "",
                                purchaser: drug["Purchaser"] || "",
                                salePrice: drug["Sale Price (USD Millions)"] || "",
                                treatmentClass: drug.Class1 || "TBD",
                                mechanismOfAction: drug.MOA || "TBD",
                                companyUrl: drug["Link to CrunchBase"] || ""
                            });
                        });
                });
            });

            // Add keyboard event handler for accessibility
            nodeGroup.on("keydown", function(event: KeyboardEvent) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // Toggle selection state
                    const companyRef = focusableElements.find(item => item.element === nodeElement);
                    if (companyRef) {
                        companyRef.isSelected = !companyRef.isSelected;
                        
                        // Make drug nodes focusable when company is selected
                        if (companyRef.drugNodes) {
                            companyRef.drugNodes.forEach((drugRef, i) => {
                                // Use sequential tabindex values for drug nodes
                                // When company is selected, drug nodes get tabindex values that come right after this company
                                // When company is deselected, drug nodes are removed from tab order
                                const companyIndex = companyRef.index || index;
                                const drugTabIndex = companyRef.isSelected ? (companyIndex + 1 + 0.1 + i/100) : -1;
                                drugRef.element.setAttribute("tabindex", String(drugTabIndex));
                            });
                        }
                    }
                    
                    // Trigger the same action as clicking
                    onShowCompanyDetail({
                        Company: company.company,
                        entries: company.entries,
                        color: statusColor.fill,
                        strokeColor: statusColor.stroke
                    });
                }
            });

            // Add focus/blur handlers
            nodeGroup.on("focus", function(event) {
                // Highlight connections
                highlightCompanyConnections(company.company);
                
                // Enhance visual feedback
                nodeGroup.select("rect")
                    .transition()
                    .duration(200)
                    .attr("width", sizeConfig.companyNodeWidth * 1.15)
                    .attr("height", sizeConfig.companyNodeHeight * 1.15)
                    .attr("transform", `translate(${-(sizeConfig.companyNodeWidth * 1.15)/2}, ${-(sizeConfig.companyNodeHeight * 1.15)/2})`)
                    .attr("stroke-width", 1.25);
                
                // Show tooltip near the focused node
                const rect = (event.target as Element).getBoundingClientRect();
                const fakeEvent = {
                    clientX: rect.left + rect.width/2,
                    clientY: rect.top + rect.height/2
                } as MouseEvent;
                
                showTooltip(fakeEvent, {
                    company: company.company,
                    totalDrugs: company.totalDrugs,
                    status: company.status
                }, true);
            });
            
            nodeGroup.on("blur", function() {
                // Only reset if not the active company
                if (activeCompany !== company.company) {
                    nodeGroup.select("rect")
                        .transition()
                        .duration(200)
                        .attr("width", sizeConfig.companyNodeWidth)
                        .attr("height", sizeConfig.companyNodeHeight)
                        .attr("transform", `translate(${-sizeConfig.companyNodeWidth/2}, ${-sizeConfig.companyNodeHeight/2})`)
                        .attr("stroke-width", 0.725);
                }
                
                // Reset connections and hide tooltip
                resetConnectionHighlights();
                hideTooltip();
            });

            // Add interaction handlers for both node and label
            const handleMouseEnter = (event: MouseEvent) => {
                // Set this company as active
                setActiveCompany(company.company, company.entries);
                
                // Highlight all connections for this company
                highlightCompanyConnections(company.company);
                
                // Enhance visual feedback
                nodeGroup.select("rect")
                    .transition()
                    .duration(200)
                    .attr("width", sizeConfig.companyNodeWidth * 1.15)
                    .attr("height", sizeConfig.companyNodeHeight * 1.15)
                    .attr("transform", `translate(${-(sizeConfig.companyNodeWidth * 1.15)/2}, ${-(sizeConfig.companyNodeHeight * 1.15)/2})`)
                    .attr("stroke-width", 1.25);
                    
                // Enhance node label text
                labelText
                    .transition()
                    .duration(200)
                    .attr("font-weight", "800")
                    .attr("font-size", "10.25px")
                    .attr("fill", "#2B6CB0"); // Highlight color
                
                showTooltip(event, {
                    company: company.company,
                    totalDrugs: company.totalDrugs,
                    status: company.status
                }, true);
            };

            const handleMouseMove = (event: MouseEvent) => {
                // Update tooltip position when mouse moves
                showTooltip(event, {
                    company: company.company,
                    totalDrugs: company.totalDrugs,
                    status: company.status
                }, true);
            };
            
            const handleMouseLeave = () => {
                // Reset node appearance if not active company
                if (activeCompany !== company.company) {
                    nodeGroup.select("rect")
                        .transition()
                        .duration(200)
                        .attr("width", sizeConfig.companyNodeWidth)
                        .attr("height", sizeConfig.companyNodeHeight)
                        .attr("transform", `translate(${-sizeConfig.companyNodeWidth/2}, ${-sizeConfig.companyNodeHeight/2})`)
                        .attr("stroke-width", 0.725);
                    
                    // Reset the label text
                    labelText
                        .transition()
                        .duration(200)
                        .attr("font-weight", sizeConfig.labelFontWeight)
                        .attr("fill", "#4A5568");
                }
                
                // Reset connection highlights
                resetConnectionHighlights();
                
                hideTooltip();
            };

            const handleClick = (event: MouseEvent) => {
                // Stop event propagation to prevent background click handler from firing
                event.stopPropagation();
                
                // Force immediate tooltip hiding without delay
                if (tooltipTimeout) {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = null;
                }
                tooltipVisible = false;
                
                // Add transacted vouchers to company detail
                onShowCompanyDetail({
                    Company: company.company,
                    entries: company.entries,
                    color: statusColor.fill,
                    strokeColor: statusColor.stroke,
                    transactedVouchers: company.transactedVouchers || 0
                });
            };

            // Apply handlers to the node group
            nodeGroup
                .on("mouseenter", handleMouseEnter)
                .on("mousemove", handleMouseMove)
                .on("mouseleave", handleMouseLeave)
                .on("click", handleClick);
                
            // Apply the same handlers to the label group
            labelGroup
                .on("mouseenter", handleMouseEnter)
                .on("mousemove", handleMouseMove)
                .on("mouseleave", handleMouseLeave)
                .on("click", handleClick);
        });

        // Add click handler to SVG background to clear selections
        svgElement.on("click", (event) => {
            // Check if click was directly on the SVG background
            if (event.target === svg) {
                activeCompany = null;
                activeStage = null;
                resetConnectionHighlights();
                hideTooltip(); // Ensure tooltip is hidden when clicking on background
                onLeave();
            }
        });
        
        // Add keyboard handler for SVG container for accessibility
        svgElement.attr("tabindex", "0")
            .attr("role", "application")
            .attr("aria-label", "Company and drug visualization")
            .on("keydown", (event) => {
                // When Tab is pressed in the SVG container, focus the first company node
                if (event.key === "Tab" && !event.shiftKey && focusableElements.length > 0) {
                    event.preventDefault();
                    // Use HTMLElement focus method on the element
                    (focusableElements[0].element as HTMLElement).focus();
                }
            });
        
        // Add event listeners to handle tooltip when mouse leaves SVG
        svgElement.on("mouseleave", () => {
            resetConnectionHighlights();
            hideTooltip();
        });
    }

// Helper function to safely clear tooltip timeout
function clearTooltipTimeout() {
    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
    }
}

    function showTooltip(event: MouseEvent, d: any, isCompany = false) {
    // Clear existing tooltip timeout
    clearTooltipTimeout();
    
    if (!svg) return;
    
    const containerRect = svg.getBoundingClientRect();
    
    // Position tooltip with safety bounds
    tooltipX = Math.min(
        containerRect.width - 200 - tooltipOffset.x,
        event.clientX - containerRect.left + tooltipOffset.x
    );
    
    tooltipY = Math.min(
        containerRect.height - 100 - tooltipOffset.y,
        event.clientY - containerRect.top + tooltipOffset.y
    );
    
    // Ensure tooltip doesn't go off the left or top edges
    tooltipX = Math.max(tooltipOffset.x, tooltipX);
    tooltipY = Math.max(tooltipOffset.y, tooltipY);
    
    // Set tooltip content
    if (isCompany) {
        tooltipContent = {
            sponsor: d.company,
            drugName: '',
            therapeuticArea: '',
            id: `${d.totalDrugs} drugs in pipeline`
        };
        const statusColor = getCompanyStatusColor(d.status);
        tooltipBorderColor = statusColor.stroke;
    } else {
        tooltipContent = {
            sponsor: d.Company || '',
            drugName: d.Candidate || '',
            therapeuticArea: d.TherapeuticArea1 || '',
            id: d["Current Development Stage"] || (hasPRVAward(d) ? "PRV" : "")
        };
        const stageCode = getStage(d);
        const stageFullName = getStageFullName(stageCode);
        const stageColor = getStageColor(stageFullName);
        tooltipBorderColor = stageColor.stroke;
    }
    
    tooltipVisible = true;
}


    /**
     * Hides tooltip with a small delay
     */
    
function hideTooltip() {
    clearTooltipTimeout();
    
    tooltipTimeout = setTimeout(() => {
        tooltipVisible = false;
        tooltipTimeout = null;
    }, 100);
}
    
    /**
     * Sets the active company and updates visual state
     */
    function setActiveCompany(company: any, entries: any[]) {
        // Reset state
        activeCompany = company;
        activeStage = null;
        
        // Reset all visual elements
        d3.selectAll(".company-node rect:first-child") // Select the first rect (node background)
            .transition()
            .duration(200)
            .attr("width", sizeConfig.companyNodeWidth)
            .attr("height", sizeConfig.companyNodeHeight)
            .attr("transform", `translate(${-sizeConfig.companyNodeWidth/2}, ${-sizeConfig.companyNodeHeight/2})`);
            
        // Reset all node label styles
        d3.selectAll(".label-group rect")
            .transition()
            .duration(300)
            .attr("fill", "white")
            .attr("stroke", "#E2E8F0")
            .attr("stroke-width", 0.5);
            
        // Reset node label text styles
        d3.selectAll(".company-node-label")
            .transition()
            .duration(300)
            .attr("fill", "#1A202C")
            .attr("font-weight", "600");
            
        // Reset company outer label styles
        d3.selectAll(".company-label text")
            .transition()
            .duration(500)
            .attr("fill", "#4A5568")
            .attr("font-size", sizeConfig.labelFontSize)
            .attr("font-weight", sizeConfig.labelFontWeight);
            
        // Reset pipeline dots
        d3.selectAll(".pipeline-dots circle")
            .transition()
            .duration(200)
            .attr("r", 0)
            .attr("opacity", 0.7);
            
        // Highlight active company if selected
        if (company) {
            const companyId = company.replace(/\s+/g, '-').toLowerCase();
            
            // Highlight company node
            d3.select(`#company-node-${companyId} rect:first-child`)
                .transition()
                .duration(300)
                .attr("stroke-width", 1.5);
            
            // Highlight node label if present
            d3.select(`#company-node-${companyId} .label-group rect`)
                .transition()
                .duration(300)
                .attr("fill", "#EBF8FF") // Light blue background
                .attr("stroke", "#90CDF4")
                .attr("stroke-width", 1.5);
                
            // Highlight node label text if present
            d3.select(`#company-node-${companyId} .company-node-label`)
                .transition()
                .duration(300)
                .attr("fill", "#2B6CB0") // Blue text
                .attr("font-weight", "800");
                
            // Highlight company text label in outer ring
            d3.select(`#company-label-${companyId} text`)
                .transition()
                .duration(500)
                .attr("fill", "#2B6CB0")
                .attr("font-size", sizeConfig.labelFontSize)
                .attr("font-weight", sizeConfig.labelFontWeight);
                
            // Get company data to pass to callback
            const companyData = processDataForLayout(data).find(c => c.company === company);
            if (companyData) {
                onCompanyHover({
                    entries: companyData.entries,
                    companyName: companyData.company, 
                    totalDrugs: companyData.totalDrugs,
                    clinicalTrials: companyData.clinicalTrials,
                    vouchersAwarded: companyData.vouchersAwarded,
                    transactedVouchers: companyData.transactedVouchers || 0, // Add transacted vouchers to callback
                    uniqueIndications: companyData.uniqueIndications.size,
                    uniqueAreas: companyData.uniqueAreas.size
                });
            } else {
                onCompanyHover(entries);
            }
        }
    }
    
    /**
     * Sets the active stage and updates visual state
     */
    function setActiveStage(stage: any, entries: any[]) {
        // Reset state
        activeStage = stage;
        activeCompany = null;
        
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
                .attr("font-weight", "800");
                
            onStageHover(entries);
        }
    }

    /**
     * Highlighting and connection management functions
     */
    function highlightCompanyConnections(companyName) {
        resetConnectionHighlights();
        
        d3.selectAll(`path.company-path[data-company="${companyName}"], path.drug-path[data-company="${companyName}"]`)
            .transition()
            .duration(300)
            .attr("stroke", highlightColor)
            .attr("stroke-width", highlightWidth)
            .attr("stroke-opacity", 1);
    }
    
    function highlightDrugConnections(drugId) {
        resetConnectionHighlights();
            
        d3.select(`path.drug-path[data-drug="${drugId}"]`)
            .transition()
            .duration(300)
            .attr("stroke", highlightColor)
            .attr("stroke-width", highlightWidth)
            .attr("stroke-opacity", 1);
    }
    
    function resetConnectionHighlights() {
        d3.selectAll("path.company-path, path.drug-path")
            .transition()
            .duration(300)
            .attr("stroke", "#37587e")
            .attr("stroke-width", sizeConfig.connectionStrokeWidth)
            .attr("stroke-opacity", sizeConfig.connectionOpacity);
    }

    // React to changes in isAllYearView
    $: if (isAllYearView !== undefined && svg && data.length > 0) {
        // Recreate visualization when view mode changes
        createVisualization();
    }
    
    // Initialize visualization on mount
    onMount(() => {
        if (data.length > 0) {
            createVisualization();
        }
        
        // Clean up tooltip when component is destroyed
        return () => {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
        };
    });
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
    

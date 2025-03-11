<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
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
    export let onCompanyHover: (data: CompanyMetrics | any[]) => void = () => {};
    export let onStageHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};
    export let isAllYearView: boolean = false;
    export let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    // Import tooltip functions from parent
    export let showTooltip: (event: MouseEvent, data: any, isCompany?: boolean) => void;
    export let hideTooltip: () => void;


    // SVG and dimension configuration
    const width = 1050;
    const height = width;
    const radius = Math.min(width, height) / 2 - 60;
    const ANGLE_BUFFER = isAllYearView ? Math.PI / 32 : Math.PI / 64;

    // Store reference to the content group
    let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    // Get configuration from utility functions
    $: sizeConfig = getSizeConfig(isAllYearView);
    $: labelConfig = getLabelConfig(radius, isAllYearView);
    $: stageRadii = getStageRadii(radius);
    const stageLabelConfig = getStageLabelConfig();

    // Connection highlight color
    const highlightColor = "#FFD700"; // Gold color for highlighted connections
    const highlightWidth = isAllYearView ? 1.75 : 2.25; // Width for highlighted connections

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
    
    // Track current focused element index for keyboard navigation
    let currentFocusIndex = -1;

    // Add type definitions
    interface CompanyMetrics {
        entries: any[];
        companyName: string;
        totalDrugs: number;
        clinicalTrials: number;
        vouchersAwarded: number;
        transactedVouchers: number;
        uniqueIndications: number;
        uniqueAreas: number;
    }

    function createVisualization() {
        if (!mainGroup) {
            console.error("mainGroup is not available");
            return;
        }

        console.log("Creating visualization with mainGroup:", mainGroup);

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

        const linesGroup = contentGroup.append("g").attr("class", "connecting-lines");
        const stagesGroup = contentGroup.append("g").attr("class", "stage-circles");
        const companyLabelsGroup = contentGroup.append("g").attr("class", "company-labels");



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
                hideTooltip();
                
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
            
            const companyGroup = contentGroup.append("g");

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
                .attr("tabindex", "0") // Use tabindex="0" for all company nodes to include them in natural tab order
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
                        .attr("tabindex", "-1") // Initially not focusable until company is selected
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
                            
                            // Open the drawer with drug details on Enter/Space
                            console.log("Opening drug drawer via keyboard:", drug.Candidate);
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
                        } else if (event.key === "Escape") {
                            // Return focus to company node
                            event.preventDefault();
                            nodeElement?.focus();
                        } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                            // Navigate to next drug in the same company
                            event.preventDefault();
                            navigateToNextDrug(company.company, drugId);
                        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                            // Navigate to previous drug in the same company
                            event.preventDefault();
                            navigateToPreviousDrug(company.company, drugId);
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
                        
                        // Show tooltip on focus
                        showTooltip(event, drug);
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
                            
                            // Show tooltip on hover
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
                            hideTooltip();
                            
                            // Open the drawer with drug details
                            console.log("Opening drug drawer:", drug.Candidate);
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
                                // When company is selected, drug nodes get tabindex="0" to make them focusable
                                // When company is deselected, drug nodes are removed from tab order
                                const drugTabIndex = companyRef.isSelected ? "0" : "-1";
                                drugRef.element.setAttribute("tabindex", drugTabIndex);
                                
                                // Ensure the drug node is focusable
                                drugRef.element.setAttribute("focusable", "true");
                            });
                            
                            // If company is selected and has drug nodes, focus the first drug node
                            if (companyRef.isSelected && companyRef.drugNodes && companyRef.drugNodes.length > 0) {
                                setTimeout(() => {
                                    (companyRef.drugNodes![0].element as HTMLElement).focus();
                                }, 50);
                            }
                        }
                    }
                    
                    // Set this company as active
                    setActiveCompany(company.company, company.entries);
                    
                    // Open the drawer with company details
                    console.log("Opening company drawer via keyboard:", company.company);
                    onShowCompanyDetail({
                        Company: company.company,
                        entries: company.entries,
                        color: statusColor.fill,
                        strokeColor: statusColor.stroke,
                        transactedVouchers: company.transactedVouchers || 0
                    });
                } else if (event.key === "Tab" && !event.shiftKey) {
                    // When Tab is pressed on a company node, check if it's selected
                    const companyRef = focusableElements.find(item => item.element === nodeElement);
                    if (companyRef && companyRef.isSelected && companyRef.drugNodes && companyRef.drugNodes.length > 0) {
                        // If company is selected and has drug nodes, focus the first drug node
                        event.preventDefault();
                        (companyRef.drugNodes[0].element as HTMLElement).focus();
                    }
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
                showTooltip(event, {
                    company: company.company,
                    totalDrugs: company.totalDrugs,
                    status: company.status
                }, true);
                
                // Update sidebar data by setting this company as active
                setActiveCompany(company.company, company.entries);
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
                
                // Show tooltip on hover
                showTooltip(event, {
                    company: company.company,
                    totalDrugs: company.totalDrugs,
                    status: company.status
                }, true);
                
                // Update sidebar data on hover (this is separate from the drawer)
                onCompanyHover({
                    entries: company.entries,
                    companyName: company.company,
                    totalDrugs: company.totalDrugs,
                    clinicalTrials: company.clinicalTrials || 0,
                    vouchersAwarded: company.vouchersAwarded || 0,
                    transactedVouchers: company.transactedVouchers || 0,
                    uniqueIndications: company.uniqueIndications?.size || 0,
                    uniqueAreas: company.uniqueAreas?.size || 0
                });
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
                hideTooltip();
                
                // Toggle selection state for keyboard navigation
                const companyRef = focusableElements.find(item => item.element === nodeElement);
                if (companyRef) {
                    companyRef.isSelected = !companyRef.isSelected;
                    
                    // Make drug nodes focusable when company is selected
                    if (companyRef.drugNodes) {
                        companyRef.drugNodes.forEach((drugRef) => {
                            // When company is selected, drug nodes get tabindex="0" to make them focusable
                            // When company is deselected, drug nodes are removed from tab order
                            const drugTabIndex = companyRef.isSelected ? "0" : "-1";
                            drugRef.element.setAttribute("tabindex", drugTabIndex);
                            
                            // Ensure the drug node is focusable
                            drugRef.element.setAttribute("focusable", "true");
                        });
                    }
                }
                
                // Set this company as active
                setActiveCompany(company.company, company.entries);
                
                // Open the drawer with company details
                console.log("Opening company drawer:", company.company);
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
        contentGroup.on("click", (event) => {
            // Check if click was directly on the SVG background
            if (event.target === contentGroup) {
                activeCompany = null;
                activeStage = null;
                resetConnectionHighlights();
                hideTooltip(); // Ensure tooltip is hidden when clicking on background
                onLeave();
            }
        });
        
        // Add keyboard handler for SVG container for accessibility
        contentGroup.attr("tabindex", "0")
            .attr("role", "application")
            .attr("aria-label", "Company and drug visualization")
            .on("keydown", (event) => {
                // When Tab is pressed in the SVG container, focus the first company node
                if (event.key === "Tab" && !event.shiftKey && focusableElements.length > 0) {
                    event.preventDefault();
                    // Use HTMLElement focus method on the element
                    (focusableElements[0].element as HTMLElement).focus();
                    currentFocusIndex = 0;
                }
                
                // Add arrow key navigation between company nodes
                if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    event.preventDefault();
                    navigateToNextCompany();
                } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    event.preventDefault();
                    navigateToPreviousCompany();
                }
            });
        
        // Add event listeners to handle tooltip when mouse leaves SVG
        contentGroup.on("mouseleave", () => {
            resetConnectionHighlights();
            hideTooltip();
        });
        
        // Add global keyboard event listener for arrow navigation between companies
        document.addEventListener('keydown', handleGlobalKeydown);
    }
    
    // Function to handle global keyboard navigation
    function handleGlobalKeydown(event: KeyboardEvent) {
        // Only handle arrow keys when a company node is focused
        if (currentFocusIndex >= 0 && (
            event.key === "ArrowRight" || 
            event.key === "ArrowDown" || 
            event.key === "ArrowLeft" || 
            event.key === "ArrowUp"
        )) {
            event.preventDefault();
            
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                navigateToNextCompany();
            } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                navigateToPreviousCompany();
            }
        }
    }
    
    // Function to navigate to the next company
    function navigateToNextCompany() {
        if (focusableElements.length === 0) return;
        
        // Find companies (not drugs)
        const companyElements = focusableElements.filter(el => el.type === 'company');
        if (companyElements.length === 0) return;
        
        // Find current index or start at beginning
        let currentIndex = companyElements.findIndex(el => 
            document.activeElement === el.element
        );
        
        // Move to next company or wrap around
        currentIndex = (currentIndex < 0) ? 0 : (currentIndex + 1) % companyElements.length;
        
        // Focus the next company
        (companyElements[currentIndex].element as HTMLElement).focus();
        currentFocusIndex = focusableElements.indexOf(companyElements[currentIndex]);
        
        // Also update the active company to ensure sidebar data is updated
        const company = companyElements[currentIndex].company;
        if (company) {
            const companyData = processDataForLayout(data).find(c => c.company === company);
            if (companyData) {
                setActiveCompany(company, companyData.entries);
            }
        }
    }
    
    // Function to navigate to the previous company
    function navigateToPreviousCompany() {
        if (focusableElements.length === 0) return;
        
        // Find companies (not drugs)
        const companyElements = focusableElements.filter(el => el.type === 'company');
        if (companyElements.length === 0) return;
        
        // Find current index or start at end
        let currentIndex = companyElements.findIndex(el => 
            document.activeElement === el.element
        );
        
        // Move to previous company or wrap around
        currentIndex = (currentIndex < 0) ? companyElements.length - 1 : 
                      (currentIndex - 1 + companyElements.length) % companyElements.length;
        
        // Focus the previous company
        (companyElements[currentIndex].element as HTMLElement).focus();
        currentFocusIndex = focusableElements.indexOf(companyElements[currentIndex]);
        
        // Also update the active company to ensure sidebar data is updated
        const company = companyElements[currentIndex].company;
        if (company) {
            const companyData = processDataForLayout(data).find(c => c.company === company);
            if (companyData) {
                setActiveCompany(company, companyData.entries);
            }
        }
    }
    
    // Clean up event listeners when component is destroyed
    onMount(() => {
        return () => {
            document.removeEventListener('keydown', handleGlobalKeydown);
        };
    });

    // Remove the clearTooltipTimeout function
    function clearTooltipTimeout() {
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
        }
    }

    // Remove the showTooltip function
    function showTooltip(event: MouseEvent, d: any, isCompany = false) {
        clearTooltipTimeout();
        
        // Get the event coordinates in page space
        let pageX = event.pageX || event.clientX;
        let pageY = event.pageY || event.clientY;
        
        // If this is a synthetic event (from focus), use the target's position
        if ((!pageX || !pageY) && event.target) {
            const targetRect = (event.target as Element).getBoundingClientRect();
            pageX = targetRect.left + window.scrollX + targetRect.width/2;
            pageY = targetRect.top + window.scrollY + targetRect.height/2;
        }
        
        // Position tooltip with a small offset from the cursor
        tooltipX = pageX + tooltipOffset.x;
        tooltipY = pageY + tooltipOffset.y;
        
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
        
        // Force tooltip to be visible
        tooltipVisible = true;
        
        // Log tooltip state for debugging
        console.log("Tooltip shown:", {
            visible: tooltipVisible,
            x: tooltipX,
            y: tooltipY,
            content: tooltipContent
        });
    }

    // Remove the hideTooltip function
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
                const metrics: CompanyMetrics = {
                    entries: companyData.entries,
                    companyName: companyData.company,
                    totalDrugs: companyData.totalDrugs,
                    clinicalTrials: companyData.clinicalTrials,
                    vouchersAwarded: companyData.vouchersAwarded,
                    transactedVouchers: companyData.transactedVouchers || 0,
                    uniqueIndications: companyData.uniqueIndications.size,
                    uniqueAreas: companyData.uniqueAreas.size
                };
                
                // Call the callback to update the sidebar
                console.log("Updating sidebar with company data:", metrics);
                onCompanyHover(metrics);
            } else {
                console.log("Updating sidebar with company entries:", entries);
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
    function highlightCompanyConnections(companyName: string) {
        resetConnectionHighlights();
        
        d3.selectAll(`path.company-path[data-company="${companyName}"], path.drug-path[data-company="${companyName}"]`)
            .transition()
            .duration(300)
            .attr("stroke", highlightColor)
            .attr("stroke-width", highlightWidth)
            .attr("stroke-opacity", 1);
    }
    
    function highlightDrugConnections(drugId: string) {
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

    // Function to navigate to the next drug within the same company
    function navigateToNextDrug(companyName: string, currentDrugId: string) {
        // Find the company reference
        const companyRef = focusableElements.find(item => 
            item.type === 'company' && item.company === companyName
        );
        
        if (!companyRef || !companyRef.drugNodes || companyRef.drugNodes.length === 0) return;
        
        // Find the current drug index
        const currentIndex = companyRef.drugNodes.findIndex(drugRef => 
            drugRef.element.id === currentDrugId
        );
        
        if (currentIndex < 0) return;
        
        // Calculate next index with wrap-around
        const nextIndex = (currentIndex + 1) % companyRef.drugNodes.length;
        
        // Focus the next drug
        (companyRef.drugNodes[nextIndex].element as HTMLElement).focus();
        
        // The focus event handler will update the sidebar data
    }
    
    // Function to navigate to the previous drug within the same company
    function navigateToPreviousDrug(companyName: string, currentDrugId: string) {
        // Find the company reference
        const companyRef = focusableElements.find(item => 
            item.type === 'company' && item.company === companyName
        );
        
        if (!companyRef || !companyRef.drugNodes || companyRef.drugNodes.length === 0) return;
        
        // Find the current drug index
        const currentIndex = companyRef.drugNodes.findIndex(drugRef => 
            drugRef.element.id === currentDrugId
        );
        
        if (currentIndex < 0) return;
        
        // Calculate previous index with wrap-around
        const prevIndex = (currentIndex - 1 + companyRef.drugNodes.length) % companyRef.drugNodes.length;
        
        // Focus the previous drug
        (companyRef.drugNodes[prevIndex].element as HTMLElement).focus();
        
        // The focus event handler will update the sidebar data
    }

    // React to changes in mainGroup
    $: if (mainGroup && data.length > 0) {
        console.log("mainGroup or data changed, recreating visualization");
        createVisualization();
    }
</script>

<style>
    .chart-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
    }
    
    .fixed-tooltip {
        display: none;
    }
    
    .company-label {
        font-size: 12px;
        font-weight: 500;
        fill: #333;
        text-anchor: middle;
        pointer-events: none;
    }
    
    .stage-label {
        font-size: 10px;
        font-weight: 500;
        fill: #666;
        text-anchor: middle;
        pointer-events: none;
    }
    
    .drug-label {
        font-size: 9px;
        fill: #333;
        text-anchor: start;
        pointer-events: none;
    }
    
    .company-node {
        cursor: pointer;
    }
    
    .drug-node {
        cursor: pointer;
    }
</style>
    

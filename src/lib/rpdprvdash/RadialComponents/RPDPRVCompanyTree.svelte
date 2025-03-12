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
        hasPRVAward,
        isPRVTerminatedOrLiquidated
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
    export let showTooltip: (event: MouseEvent | FocusEvent, data: any, isCompany?: boolean) => void;
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
    const highlightColor = "#2B6CB0"; // Blue color for highlighted connections
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

            // Calculate position for connecting lines (where the PRE stage is)
            const preStageRadius = stageRadii['PRE'];
            const nodeAngle = angle.center - Math.PI/2; // Adjust for SVG coordinates
            const nodeX = preStageRadius * Math.cos(nodeAngle);
            const nodeY = preStageRadius * Math.sin(nodeAngle);

            // Get company status color
            const statusColor = getCompanyStatusColor(company.status);

            // Get the label placement from our calculated positions
            const labelPlacement = labelPlacements.find(lp => lp.company === company.company);
            
            // If we have a calculated placement, use it; otherwise calculate directly
            const labelX = labelPlacement ? labelPlacement.x : (radius * 1.05) * Math.cos(nodeAngle);
            const labelY = labelPlacement ? labelPlacement.y : (radius * 1.05) * Math.sin(nodeAngle);
            const isRightSide = labelPlacement ? labelPlacement.isRightSide : Math.cos(nodeAngle) > 0;
            const isCloserPosition = labelPlacement ? labelPlacement.isCloserPosition : false;

            // Create label with alignment to connecting line
            const labelGroup = companyLabelsGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("cursor", "pointer")
                .attr("class", "company-label")
                .attr("id", `company-label-${companyId}`)
                .attr("tabindex", "0") // Make label focusable for keyboard accessibility
                .attr("role", "button")
                .attr("aria-label", `Company ${company.company} with ${company.totalDrugs} drugs`);

            // Ensure SVG element can receive focus
            const labelElement = labelGroup.node();
            if (labelElement) {
                labelElement.setAttribute("focusable", "true");
                // Store reference for keyboard navigation
                focusableElements.push({
                    element: labelElement,
                    type: 'company',
                    company: company.company,
                    isSelected: false,
                    index: index,
                    drugNodes: []
                });
            }

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
                .attr("font-size", isCloserPosition ? sizeConfig.labelFontSize : (parseFloat(sizeConfig.labelFontSize) * 1.1) + "px")
                .attr("font-weight", sizeConfig.labelFontWeight);

            // Connect drugs directly to the label position (no company node)
            company.stages.forEach((drugs: any[], stage: string) => {
                if (drugs.length === 0) return;
                
                // Get the appropriate radius for this stage - calculate midpoint on the fly
                let stageRadius = stageRadii[stage as keyof typeof stageRadii];
                
                // Calculate midpoint radius for drug placement
                if (stage === 'PRE' && stageRadii['P1']) {
                    stageRadius = (stageRadii['PRE'] + stageRadii['P1']) / 2;
                } else if (stage === 'P1' && stageRadii['P2']) {
                    stageRadius = (stageRadii['P1'] + stageRadii['P2']) / 2;
                } else if (stage === 'P2' && stageRadii['P3']) {
                    stageRadius = (stageRadii['P2'] + stageRadii['P3']) / 2;
                } else if (stage === 'P3' && stageRadii['FILED']) {
                    stageRadius = (stageRadii['P3'] + stageRadii['FILED']) / 2;
                } else if (stage === 'FILED' && stageRadii['PRV']) {
                    stageRadius = (stageRadii['FILED'] + stageRadii['PRV']) / 2;
                } else if (stage === 'PRV') {
                    stageRadius = stageRadii['PRV'] * 0.6;
                }
                
                // Calculate the angular spacing for drugs
                const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);
                
                // Calculate the bracket point - a point closer to the drugs where connections branch
                // Position it at a distance that creates a visually pleasing connection
                const firstDrugAngle = angle.start + drugSpacing;
                const lastDrugAngle = angle.start + drugSpacing * drugs.length;
                const bracketAngle = (firstDrugAngle + lastDrugAngle) / 2;

                // Calculate the bracket radius - position it at 75% of the way from the stage radius to the label
                const distanceToLabel = labelConfig.minRadius - stageRadius;
                const bracketRadius = stageRadius + (distanceToLabel * 0.75);
                const bracketX = bracketRadius * Math.cos(bracketAngle - Math.PI/2);
                const bracketY = bracketRadius * Math.sin(bracketAngle - Math.PI/2);
                
                // Draw the main connection line from label to bracket point
                if (drugs.length > 1) {
                    linesGroup.append("path")
                        .attr("class", "main-connection")
                        .attr("data-company", company.company)
                        .attr("d", `M${labelX},${labelY}L${bracketX},${bracketY}`)
                        .attr("stroke", "#37587e")
                        .attr("stroke-width", sizeConfig.connectionStrokeWidth * 1) // Slightly thicker
                        .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2) // Slightly more opaque
                        .attr("stroke-dasharray", "none")
                        .attr("fill", "none");
                }
                
                // Create drug nodes with connections from the bracket point
                drugs.forEach((drug: any, i: number) => {
                    const drugAngle = angle.start + drugSpacing * (i + 1);
                    const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                    const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);

                    // Create unique ID for drug
                    const drugId = `${company.company}-${drug.Candidate}-${i}`.replace(/\s+/g, '-').toLowerCase();

                    // Add connecting line - either from bracket point (if multiple drugs) or directly from label (if single drug)
                    const startX = drugs.length > 1 ? bracketX : labelX;
                    const startY = drugs.length > 1 ? bracketY : labelY;
                    
                    linesGroup.append("path")
                        .attr("class", "drug-path")
                        .attr("data-company", company.company)
                        .attr("data-drug", drugId)
                        .attr("d", `M${startX},${startY}L${drugX},${drugY}`)
                        .attr("stroke", "#37587e")
                        .attr("stroke-width", sizeConfig.connectionStrokeWidth)
                        .attr("stroke-opacity", sizeConfig.connectionOpacity)
                        .attr("stroke-dasharray", "none")
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
                    if (drugElement && labelElement) {
                        drugElement.setAttribute("focusable", "true");
                        
                        // Store drug node reference in the company's drugNodes array
                        const companyRef = focusableElements.find(item => item.element === labelElement);
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
                    
                    // Check if PRV is terminated or liquidated
                    const isTerminatedOrLiquidated = isPRVTerminatedOrLiquidated(drug);
                    
                    // Use greyed out colors for terminated or liquidated PRVs
                    const fillColor = isTerminatedOrLiquidated ? "#CCCCCC" : areaColors.fill;
                    const finalStrokeColor = isTerminatedOrLiquidated ? "#999999" : strokeColor;
                    const opacity = isTerminatedOrLiquidated ? 0.7 : 1;

                    // Drug circle
                    drugGroup.append("circle")
                        .attr("r", sizeConfig.drugNodeRadius)
                        .attr("fill", fillColor)
                        .attr("stroke", finalStrokeColor)
                        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                        .attr("opacity", opacity)
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
                            // Return focus to company label
                            event.preventDefault();
                            labelElement?.focus();
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
            labelGroup.on("keydown", function(event: KeyboardEvent) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // Toggle selection state
                    const companyRef = focusableElements.find(item => item.element === labelElement);
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
                    // When Tab is pressed on a company label, check if it's selected
                    const companyRef = focusableElements.find(item => item.element === labelElement);
                    if (companyRef && companyRef.isSelected && companyRef.drugNodes && companyRef.drugNodes.length > 0) {
                        // If company is selected and has drug nodes, focus the first drug node
                        event.preventDefault();
                        (companyRef.drugNodes[0].element as HTMLElement).focus();
                    }
                }
            });

            // Add focus/blur handlers
            labelGroup.on("focus", function(event) {
                // Highlight connections
                highlightCompanyConnections(company.company);
                
                // Enhance visual feedback for the label
                labelText
                    .transition()
                    .duration(200)
                    .attr("font-weight", "800")
                    .attr("font-size", "10.25px")
                    .attr("fill", "#2B6CB0"); // Highlight color
                
                // Show tooltip near the focused label
                showTooltip(event, {
                    company: company.company,
                    totalDrugs: company.totalDrugs,
                    status: company.status
                }, true);
                
                // Update sidebar data by setting this company as active
                setActiveCompany(company.company, company.entries);
            });
            
            labelGroup.on("blur", function() {
                // Only reset if not the active company
                if (activeCompany !== company.company) {
                    labelText
                        .transition()
                        .duration(200)
                        .attr("font-weight", sizeConfig.labelFontWeight)
                        .attr("font-size", isCloserPosition ? sizeConfig.labelFontSize : (parseFloat(sizeConfig.labelFontSize) * 1.1) + "px")
                        .attr("fill", "#4A5568");
                }
                
                // Reset connections and hide tooltip
                resetConnectionHighlights();
                hideTooltip();
            });

            // Add interaction handlers for the label
            const handleMouseEnter = (event: MouseEvent) => {
                // Highlight all connections for this company
                highlightCompanyConnections(company.company);
                
                // Enhance label text
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
                // Reset label appearance if not active company
                if (activeCompany !== company.company) {
                    labelText
                        .transition()
                        .duration(200)
                        .attr("font-weight", sizeConfig.labelFontWeight)
                        .attr("font-size", isCloserPosition ? sizeConfig.labelFontSize : (parseFloat(sizeConfig.labelFontSize) * 1.1) + "px")
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
                const companyRef = focusableElements.find(item => item.element === labelElement);
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

            // Apply handlers to the label group
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
                // When Tab is pressed in the SVG container, focus the first company label
                if (event.key === "Tab" && !event.shiftKey && focusableElements.length > 0) {
                    event.preventDefault();
                    // Use HTMLElement focus method on the element
                    (focusableElements[0].element as HTMLElement).focus();
                    currentFocusIndex = 0;
                }
                
                // Add arrow key navigation between company labels
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
        // Only handle arrow keys when a company label is focused
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

    /**
     * Sets the active company and updates visual state
     */
    function setActiveCompany(company: any, entries: any[]) {
        // Reset state
        activeCompany = company;
        activeStage = null;
        
        // Reset all visual elements
        // Reset all company label text styles
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
            
            // Highlight company text label
            d3.select(`#company-label-${companyId} text`)
                .transition()
                .duration(500)
                .attr("fill", "#2B6CB0")
                .attr("font-size", "10.25px")
                .attr("font-weight", "800");
            
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
        
        // Highlight both main connections and drug paths
        d3.selectAll(`path.main-connection[data-company="${companyName}"], path.drug-path[data-company="${companyName}"]`)
            .transition()
            .duration(300)
            .attr("stroke", highlightColor)
            .attr("stroke-width", highlightWidth)
            .attr("stroke-opacity", 1);
    }
    
    function highlightDrugConnections(drugId: string) {
        resetConnectionHighlights();
        
        // Get the drug path
        const drugPath = d3.select(`path.drug-path[data-drug="${drugId}"]`);
        if (!drugPath.empty()) {
            // Highlight the drug path
            drugPath
                .transition()
                .duration(300)
                .attr("stroke", highlightColor)
                .attr("stroke-width", highlightWidth)
                .attr("stroke-opacity", 1);
            
            // Get the company name to highlight the main connection if needed
            const companyName = drugPath.attr("data-company");
            if (companyName) {
                // Find all drug paths for this company to determine if we need to highlight the main connection
                const drugPaths = d3.selectAll(`path.drug-path[data-company="${companyName}"]`);
                if (drugPaths.size() > 1) {
                    // If there are multiple drugs, also highlight the main connection
                    d3.selectAll(`path.main-connection[data-company="${companyName}"]`)
                        .transition()
                        .duration(300)
                        .attr("stroke", highlightColor)
                        .attr("stroke-width", highlightWidth)
                        .attr("stroke-opacity", 1);
                }
            }
        }
    }
    
    function resetConnectionHighlights() {
        // Reset both main connections and drug paths
        d3.selectAll("path.main-connection")
            .transition()
            .duration(300)
            .attr("stroke", "#37587e")
            .attr("stroke-width", sizeConfig.connectionStrokeWidth * 1.2)
            .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
        
        d3.selectAll("path.drug-path")
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
    

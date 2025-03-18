<script lang="ts">
    import * as d3 from 'd3';
    import { getTherapeuticAreaColor } from '../../utils/colorDefinitions';
    import { hasPRVAward, isPRVTerminatedOrLiquidated } from '../../utils/data-processing-utils';
    import { createStarShape } from '../../utils/svg-utils';

    // Props
    export let drug: any;
    export let x: number;
    export let y: number;
    export let drugId: string;
    export let companyName: string;
    export let sizeConfig: any;
    export let showTooltip: (event: MouseEvent | FocusEvent, data: any) => void;
    export let hideTooltip: () => void;
    export let onShowDrugDetail: (detail: any) => void;
    export let highlightDrugConnections: (drugId: string) => void;
    export let resetConnectionHighlights: () => void;
    export let parentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let focusableElements: any[];
    export let companyRef: any;
    export let setActiveCompany: (company: string, entries: any[]) => void = () => {};

    // Local state
    let drugGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    
    /**
     * Creates the drug node
     */
    export function createDrugNode() {
        if (!parentGroup) return;
        
        // Create the drug group
        drugGroup = parentGroup.append("g")
            .attr("transform", `translate(${x},${y})`)
            .attr("cursor", "pointer")
            .attr("class", "drug-node")
            .attr("id", drugId)
            .attr("tabindex", "-1") // Initially not focusable until company is selected
            .attr("role", "button")
            .attr("aria-label", `Drug ${drug.Candidate} for ${drug.Indication || 'unknown indication'}, stage: ${drug["Current Development Stage"] || 'unknown stage'}`);

        // Ensure the SVG element can receive focus
        const drugElement = drugGroup.node();
        if (drugElement && companyRef) {
            drugElement.setAttribute("focusable", "true");
            
            // Store drug node reference in the company's drugNodes array
            if (companyRef.drugNodes) {
                companyRef.drugNodes.push({
                    element: drugElement,
                    drug: drug
                });
            }
        }

        // Get therapeutic area color
        const areaColors = getTherapeuticAreaColor(drug.TherapeuticArea1);

        // Determine stroke color - use gold for transacted PRVs
        const isTransacted = drug["Purchase Year"] && drug["Purchase Year"].trim() !== "";
        const strokeColor = areaColors.stroke;
        
        // Check if PRV is terminated or liquidated
        const isTerminatedOrLiquidated = isPRVTerminatedOrLiquidated(drug);
        
        // Use greyed out colors for terminated or liquidated PRVs
        const fillColor = isTerminatedOrLiquidated ? "#CCCCCC" : areaColors.fill;
        const finalStrokeColor = isTerminatedOrLiquidated ? "#999999" : strokeColor;
        const opacity = isTerminatedOrLiquidated ? 0.7 : 1;

        // Create star shape instead of circle
        const star = createStarShape(
            drugGroup,
            sizeConfig.drugNodeRadius,
            fillColor,
            finalStrokeColor,
            sizeConfig.drugNodeStrokeWidth,
            opacity
        );
        
        // Store the initial opacity as a data attribute for later reference
        star.attr("data-initial-opacity", opacity);
            
        // Add keyboard event handler for accessibility
        drugGroup.on("keydown", function(event: KeyboardEvent) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                
                // Open the drawer with drug details on Enter/Space
                console.log("Opening drug drawer via keyboard:", drug.Candidate);
                showDrugDetail();
            } else if (event.key === "Escape") {
                // Return focus to company label
                event.preventDefault();
                if (companyRef && companyRef.element) {
                    (companyRef.element as HTMLElement).focus();
                }
            }
        });

        // Add focus handlers for keyboard navigation
        drugGroup.on("focus", function(event: FocusEvent) {
            // Highlight the drug node
            const star = drugGroup.select("path");
            
            // FORCE full opacity for all nodes on focus
            star.attr("opacity", 1);
            
            // Bring the node to the front by moving it to the end of parent
            drugGroup.raise();
            
            // Highlight the company label text FIRST
            highlightCompanyLabel();
            
            // Apply visual changes - scale the star to highlight it
            if (sizeConfig.useAnimations) {
                star.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("transform", `scale(${sizeConfig.highlightedNodeRadius * 1.2 / sizeConfig.drugNodeRadius})`)
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth * 1.5);
            } else {
                // Immediate update without transition
                star.attr("transform", `scale(${sizeConfig.highlightedNodeRadius * 1.2 / sizeConfig.drugNodeRadius})`)
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth * 1.5);
            }
            
            // Highlight the connection line for this drug - with a slight delay to ensure our changes take precedence
            setTimeout(() => {
                highlightDrugConnections(drugId);
            }, 10);
            
            // Show tooltip on focus
            showTooltip(event, drug);
        });
        
        drugGroup.on("blur", function() {
            // Reset drug node appearance
            const star = drugGroup.select("path");
            
            // Get the initial opacity from the data attribute
            const initialOpacity = star.attr("data-initial-opacity") || "1";
            
            // FORCE immediate opacity reset before any transitions
            star.attr("opacity", initialOpacity);
            
            // Reset the scale
            if (sizeConfig.useAnimations) {
                star.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("transform", "scale(1)")
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                    .attr("stroke", strokeColor);
            } else {
                // Immediate update without transition
                star.attr("transform", "scale(1)")
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                    .attr("stroke", strokeColor);
            }
            
            // Reset connection highlights
            resetConnectionHighlights();
            
            hideTooltip();
        });
        
        // Drug mouse interactions
        drugGroup
            .on("mouseenter", (event: MouseEvent) => {
                // Highlight the drug node
                const star = drugGroup.select("path");
                
                // FORCE full opacity for all nodes on hover
                star.attr("opacity", 1);
                
                // Bring the node to the front by moving it to the end of parent
                drugGroup.raise();
                
                // Highlight the company label text FIRST
                highlightCompanyLabel();
                
                // Apply visual changes - scale the star
                if (sizeConfig.useAnimations) {
                    star.transition()
                        .duration(sizeConfig.transitionDuration)
                        .attr("transform", `scale(${sizeConfig.highlightedNodeRadius * 1.2 / sizeConfig.drugNodeRadius})`)
                        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth * 1.5);
                } else {
                    // Immediate update without transition
                    star.attr("transform", `scale(${sizeConfig.highlightedNodeRadius * 1.2 / sizeConfig.drugNodeRadius})`)
                        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth * 1.5);
                }
                
                // Highlight the connection line for this drug - with a slight delay to ensure our changes take precedence
                setTimeout(() => {
                    highlightDrugConnections(drugId);
                }, 10);
                
                // Show tooltip on hover
                showTooltip(event, drug);
            })
            .on("mousemove", (event: MouseEvent) => {
                // Update tooltip position when mouse moves
                showTooltip(event, drug);
            })
            .on("mouseleave", () => {
                // Reset drug node appearance
                const star = drugGroup.select("path");
                
                // Get the initial opacity from the data attribute
                const initialOpacity = star.attr("data-initial-opacity") || "1";
                
                // FORCE immediate opacity reset before any transitions
                star.attr("opacity", initialOpacity);
                
                // Reset the scale
                if (sizeConfig.useAnimations) {
                    star.transition()
                        .duration(sizeConfig.transitionDuration)
                        .attr("transform", "scale(1)")
                        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                        .attr("stroke", strokeColor);
                } else {
                    // Immediate update without transition
                    star.attr("transform", "scale(1)")
                        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                        .attr("stroke", strokeColor);
                }
                
                // Reset connection highlights
                resetConnectionHighlights();
                
                hideTooltip();
            })
            .on("click", (event: MouseEvent) => {
                event.stopPropagation();
                
                // Force immediate tooltip hiding without delay
                hideTooltip();
                
                // Open the drawer with drug details
                showDrugDetail();
            });
            
        return drugGroup;
    }
    
    /**
     * Highlights the company label text when a drug is hovered or focused
     */
    function highlightCompanyLabel() {
        if (companyName) {
            // Get the company ID for the selector
            const companyId = companyName.replace(/\s+/g, '-').toLowerCase();
            
            // FORCE direct highlighting of company label without transitions
            // This ensures it happens immediately and isn't overridden
            try {
                // First try the ID-based selector
                const companyLabel = d3.select(`#company-label-${companyId} text`);
                
                if (!companyLabel.empty()) {
                    // Apply styles directly without transition first
                    companyLabel
                        .attr("fill", "#2B6CB0")
                        .attr("font-size", "10.25px")
                        .attr("font-weight", "800");
                } else {
                    // If ID-based selector fails, try finding by text content
                    console.warn(`Company label not found by ID for: ${companyName} (ID: ${companyId})`);
                    const allCompanyLabels = d3.selectAll(".company-label text");
                    let found = false;
                    
                    allCompanyLabels.each(function() {
                        const label = d3.select(this);
                        const text = label.text();
                        if (text.includes(companyName)) {
                            label
                                .attr("fill", "#2B6CB0")
                                .attr("font-size", "10.25px")
                                .attr("font-weight", "800");
                            found = true;
                        }
                    });
                    
                    if (!found) {
                        console.warn(`Company label not found by text content for: ${companyName}`);
                    }
                }
                
                // Call setActiveCompany to update sidebar if needed
                if (companyRef && companyRef.element) {
                    // Use the company's entries if available
                    const entries = companyRef.entries || [];
                    setActiveCompany(companyName, entries);
                } else {
                    // If companyRef is missing, still try to update the sidebar
                    // with minimal information
                    setActiveCompany(companyName, [drug]);
                }
            } catch (error) {
                console.error(`Error highlighting company label for ${companyName}:`, error);
            }
        }
    }
    
    /**
     * Shows the drug detail drawer
     */
    function showDrugDetail() {
        const areaColors = getTherapeuticAreaColor(drug.TherapeuticArea1);
        const strokeColor = drug["Purchase Year"] ? "#FFD700" : areaColors.stroke;
        
        onShowDrugDetail({
            drugName: drug.Candidate,
            year: drug["Purchase Year"] || drug["PRV Year"] || drug["RPDD Year"],
            Company: drug.Company,
            therapeuticArea: drug.TherapeuticArea1,
            entries: [], // This would need to be passed from parent
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
    }
    
    /**
     * Updates the drug node's appearance
     */
    export function updateDrugNode(isHighlighted: boolean) {
        if (!drugGroup) return;
        
        const areaColors = getTherapeuticAreaColor(drug.TherapeuticArea1);
        const strokeColor = drug["Purchase Year"] ? "#FFD700" : areaColors.stroke;
        
        // Check if PRV is terminated or liquidated
        const isTerminatedOrLiquidated = isPRVTerminatedOrLiquidated(drug);
        
        // Use greyed out colors for terminated or liquidated PRVs
        const fillColor = isTerminatedOrLiquidated ? "#CCCCCC" : areaColors.fill;
        const finalStrokeColor = isTerminatedOrLiquidated ? "#999999" : strokeColor;
        
        const star = drugGroup.select("path");
        const initialOpacity = star.attr("data-initial-opacity") || (isTerminatedOrLiquidated ? "0.7" : "1");
        
        if (isHighlighted) {
            // FORCE full opacity when highlighted
            star.attr("opacity", 1);
            
            // Bring the node to the front
            drugGroup.raise();
            
            // Highlight the company label text FIRST
            highlightCompanyLabel();
            
            // Apply visual changes - scale the star
            if (sizeConfig.useAnimations) {
                star.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("transform", `scale(${sizeConfig.highlightedNodeRadius * 1.2 / sizeConfig.drugNodeRadius})`)
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth * 1.5);
            } else {
                // Immediate update without transition
                star.attr("transform", `scale(${sizeConfig.highlightedNodeRadius * 1.2 / sizeConfig.drugNodeRadius})`)
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth * 1.5);
            }
        } else {
            // Use transitions only if animations are enabled
            if (sizeConfig.useAnimations) {
                star.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("transform", "scale(1)")
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                    .attr("stroke", finalStrokeColor)
                    .attr("opacity", initialOpacity); // Restore original opacity
            } else {
                // Immediate update without transition
                star.attr("transform", "scale(1)")
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                    .attr("stroke", finalStrokeColor)
                    .attr("opacity", initialOpacity); // Restore original opacity
            }
        }
    }
</script>

<style>
    .drug-node {
        cursor: pointer;
    }
</style> 
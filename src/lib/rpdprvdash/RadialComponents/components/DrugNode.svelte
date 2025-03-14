<script lang="ts">
    import * as d3 from 'd3';
    import { getTherapeuticAreaColor } from '../../utils/colorDefinitions';
    import { hasPRVAward, isPRVTerminatedOrLiquidated } from '../../utils/data-processing-utils';

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

        // Determine which filter to use based on drug status and shadow settings
        let filterUrl = "";
        
        // Only apply filters if shadow effects are enabled
        if (sizeConfig.useShadowEffects) {
            filterUrl = "url(#dropshadow)";
            if (drug.Purchased === "Y") {
                filterUrl = "url(#greenGlow)";
            } else if (drug["PRV Status"] === "Filed") {
                filterUrl = "url(#yellowGlow)";
            } else if (drug["Purchase Year"]) {
                filterUrl = "url(#goldGlow)"; // Special glow for transacted vouchers
            }
        }

        // Determine stroke color - use gold for transacted PRVs
        const isTransacted = drug["Purchase Year"] && drug["Purchase Year"].trim() !== "";
        const strokeColor = isTransacted ? "#FFD700" : areaColors.stroke;
        
        // Check if PRV is terminated or liquidated
        const isTerminatedOrLiquidated = isPRVTerminatedOrLiquidated(drug);
        
        // Use greyed out colors for terminated or liquidated PRVs
        const fillColor = isTerminatedOrLiquidated ? "#CCCCCC" : areaColors.fill;
        const finalStrokeColor = isTerminatedOrLiquidated ? "#999999" : strokeColor;
        const opacity = isTerminatedOrLiquidated ? 0.7 : 1;

        // Determine stroke dash array for transacted vouchers
        const strokeDashArray = isTransacted ? "3,2" : "none";

        // Drug circle
        const circle = drugGroup.append("circle")
            .attr("r", sizeConfig.drugNodeRadius)
            .attr("fill", fillColor)
            .attr("stroke", finalStrokeColor)
            .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
            .attr("stroke-dasharray", strokeDashArray)
            .attr("opacity", opacity);
            
        // Only apply filter if shadow effects are enabled
        if (sizeConfig.useShadowEffects && filterUrl) {
            circle.style("filter", filterUrl);
        }

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
            const circle = drugGroup.select("circle");
            
            // Use transitions only if animations are enabled
            if (sizeConfig.useAnimations) {
                circle.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("r", sizeConfig.highlightedNodeRadius);
                
                // Apply filter only if shadow effects are enabled
                if (sizeConfig.useShadowEffects && filterUrl) {
                    circle.style("filter", filterUrl);
                }
            } else {
                // Immediate update without transition
                circle.attr("r", sizeConfig.highlightedNodeRadius);
            }
            
            // Highlight the connection line for this drug
            highlightDrugConnections(drugId);
            
            // Show tooltip on focus
            showTooltip(event, drug);
        });
        
        drugGroup.on("blur", function() {
            // Reset drug node appearance
            const circle = drugGroup.select("circle");
            
            // Use transitions only if animations are enabled
            if (sizeConfig.useAnimations) {
                circle.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("r", sizeConfig.drugNodeRadius)
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                    .attr("stroke", strokeColor);
                
                // Apply filter only if shadow effects are enabled
                if (sizeConfig.useShadowEffects && filterUrl) {
                    circle.style("filter", filterUrl);
                }
            } else {
                // Immediate update without transition
                circle.attr("r", sizeConfig.drugNodeRadius)
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
                const circle = drugGroup.select("circle");
                
                // Use transitions only if animations are enabled
                if (sizeConfig.useAnimations) {
                    circle.transition()
                        .duration(sizeConfig.transitionDuration)
                        .attr("r", sizeConfig.highlightedNodeRadius);
                    
                    // Apply filter only if shadow effects are enabled
                    if (sizeConfig.useShadowEffects && filterUrl) {
                        circle.style("filter", filterUrl);
                    }
                } else {
                    // Immediate update without transition
                    circle.attr("r", sizeConfig.highlightedNodeRadius);
                }
                
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
                const circle = drugGroup.select("circle");
                
                // Use transitions only if animations are enabled
                if (sizeConfig.useAnimations) {
                    circle.transition()
                        .duration(sizeConfig.transitionDuration)
                        .attr("r", sizeConfig.drugNodeRadius)
                        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                        .attr("stroke", strokeColor);
                    
                    // Apply filter only if shadow effects are enabled
                    if (sizeConfig.useShadowEffects && filterUrl) {
                        circle.style("filter", filterUrl);
                    }
                } else {
                    // Immediate update without transition
                    circle.attr("r", sizeConfig.drugNodeRadius)
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
        
        // Determine which filter to use based on drug status and shadow settings
        let filterUrl = "";
        
        // Only apply filters if shadow effects are enabled
        if (sizeConfig.useShadowEffects) {
            filterUrl = "url(#dropshadow)";
            if (drug.Purchased === "Y") {
                filterUrl = "url(#greenGlow)";
            } else if (drug["PRV Status"] === "Filed") {
                filterUrl = "url(#yellowGlow)";
            } else if (drug["Purchase Year"]) {
                filterUrl = "url(#goldGlow)"; // Special glow for transacted vouchers
            }
        }
        
        // Check if PRV is terminated or liquidated
        const isTerminatedOrLiquidated = isPRVTerminatedOrLiquidated(drug);
        
        // Use greyed out colors for terminated or liquidated PRVs
        const fillColor = isTerminatedOrLiquidated ? "#CCCCCC" : areaColors.fill;
        const finalStrokeColor = isTerminatedOrLiquidated ? "#999999" : strokeColor;
        
        const circle = drugGroup.select("circle");
        
        if (isHighlighted) {
            // Use transitions only if animations are enabled
            if (sizeConfig.useAnimations) {
                circle.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("r", sizeConfig.highlightedNodeRadius);
                
                // Apply filter only if shadow effects are enabled
                if (sizeConfig.useShadowEffects && filterUrl) {
                    circle.style("filter", filterUrl);
                }
            } else {
                // Immediate update without transition
                circle.attr("r", sizeConfig.highlightedNodeRadius);
            }
        } else {
            // Use transitions only if animations are enabled
            if (sizeConfig.useAnimations) {
                circle.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("r", sizeConfig.drugNodeRadius)
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                    .attr("stroke", finalStrokeColor);
                
                // Apply filter only if shadow effects are enabled
                if (sizeConfig.useShadowEffects && filterUrl) {
                    circle.style("filter", filterUrl);
                }
            } else {
                // Immediate update without transition
                circle.attr("r", sizeConfig.drugNodeRadius)
                    .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
                    .attr("stroke", finalStrokeColor);
            }
        }
    }
</script>

<style>
    .drug-node {
        cursor: pointer;
    }
</style> 
<script lang="ts">
    import * as d3 from 'd3';
    import { getTherapeuticAreaColor } from '../../utils/colorDefinitions';

    // Props
    export let drug: any;
    export let x: number;
    export let y: number;
    export let drugId: string;
    export let areaName: string;
    export let sizeConfig: any;
    export let showTooltip: (event: MouseEvent | FocusEvent, data: any) => void;
    export let hideTooltip: () => void;
    export let onShowDrugDetail: (detail: any) => void;
    export let highlightDrugConnections: (drugId: string) => void;
    export let resetConnectionHighlights: () => void;
    export let parentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let focusableElements: any[];
    export let areaRef: any;

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
            .attr("tabindex", "-1") // Initially not focusable until area is selected
            .attr("role", "button")
            .attr("aria-label", `Drug ${drug["Drug Name"]} for ${drug.name || 'unknown therapeutic area'}, type: ${drug["Treatment Type"] || 'unknown type'}`);

        // Ensure the SVG element can receive focus
        const drugElement = drugGroup.node();
        if (drugElement && areaRef) {
            drugElement.setAttribute("focusable", "true");
            
            // Store drug node reference in the area's drugNodes array
            if (areaRef.drugNodes) {
                areaRef.drugNodes.push({
                    element: drugElement,
                    drug: drug
                });
            }
        }

        // Get therapeutic area color
        const areaColors = getTherapeuticAreaColor(drug.name);

        // We're not using shadow effects to match companytree styling
        const filterUrl = "";

        // Determine stroke color - use gold for purchased vouchers
        const isPurchased = drug.Purchased === "Y";
        const strokeColor = isPurchased ? "#FFD700" : areaColors.stroke;
        
        // Drug circle
        const circle = drugGroup.append("circle")
            .attr("r", sizeConfig.drugNodeRadius)
            .attr("fill", areaColors.fill)
            .attr("stroke", strokeColor)
            .attr("stroke-width", sizeConfig.drugNodeStrokeWidth);
            
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
                showDrugDetail();
            } else if (event.key === "Escape") {
                // Return focus to area label
                event.preventDefault();
                if (areaRef && areaRef.element) {
                    (areaRef.element as HTMLElement).focus();
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
        onShowDrugDetail(drug);
    }
</script>

<style>
    /* No specific styles needed for this component */
</style> 
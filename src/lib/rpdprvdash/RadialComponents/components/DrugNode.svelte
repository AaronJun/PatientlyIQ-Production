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

        // Drug circle
        const circle = drugGroup.append("circle")
            .attr("r", sizeConfig.drugNodeRadius)
            .attr("fill", fillColor)
            .attr("stroke", finalStrokeColor)
            .attr("stroke-width", sizeConfig.drugNodeStrokeWidth)
            .attr("opacity", opacity)
            // Store the initial opacity as a data attribute for later reference
            .attr("data-initial-opacity", opacity);
            
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
            
            // FORCE full opacity for all nodes on focus
            circle.attr("opacity", 1);
            
            // Highlight the company label text FIRST
            highlightCompanyLabel();
            
            // Then apply other visual changes
            if (sizeConfig.useAnimations) {
                circle.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("r", sizeConfig.highlightedNodeRadius);
            } else {
                // Immediate update without transition
                circle.attr("r", sizeConfig.highlightedNodeRadius);
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
            const circle = drugGroup.select("circle");
            
            // Get the initial opacity from the data attribute
            const initialOpacity = circle.attr("data-initial-opacity") || "1";
            
            // FORCE immediate opacity reset before any transitions
            circle.attr("opacity", initialOpacity);
            
            // Then apply other visual changes
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
                
                // FORCE full opacity for all nodes on hover
                circle.attr("opacity", 1);
                
                // Highlight the company label text FIRST
                highlightCompanyLabel();
                
                // Then apply other visual changes
                if (sizeConfig.useAnimations) {
                    circle.transition()
                        .duration(sizeConfig.transitionDuration)
                        .attr("r", sizeConfig.highlightedNodeRadius);
                } else {
                    // Immediate update without transition
                    circle.attr("r", sizeConfig.highlightedNodeRadius);
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
                const circle = drugGroup.select("circle");
                
                // Get the initial opacity from the data attribute
                const initialOpacity = circle.attr("data-initial-opacity") || "1";
                
                // FORCE immediate opacity reset before any transitions
                circle.attr("opacity", initialOpacity);
                
                // Then apply other visual changes
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
        
        const circle = drugGroup.select("circle");
        const initialOpacity = circle.attr("data-initial-opacity") || (isTerminatedOrLiquidated ? "0.7" : "1");
        
        if (isHighlighted) {
            // FORCE full opacity when highlighted
            circle.attr("opacity", 1);
            
            // Highlight the company label text FIRST
            highlightCompanyLabel();
            
            // Then apply other visual changes
            if (sizeConfig.useAnimations) {
                circle.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("r", sizeConfig.highlightedNodeRadius);
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
                    .attr("stroke", finalStrokeColor)
                    .attr("opacity", initialOpacity); // Restore original opacity
            } else {
                // Immediate update without transition
                circle.attr("r", sizeConfig.drugNodeRadius)
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
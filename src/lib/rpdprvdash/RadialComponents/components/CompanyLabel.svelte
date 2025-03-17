<script lang="ts">
    import * as d3 from 'd3';
    import { getCompanyStatusColor } from '../../utils/colorDefinitions';
    import { formatCompanyName } from '../../utils/data-processing-utils';

    // Props
    export let company: any;
    export let labelX: number;
    export let labelY: number;
    export let nodeAngle: number;
    export let isRightSide: boolean;
    export let isCloserPosition: boolean;
    export let sizeConfig: any;
    export let showTooltip: (event: MouseEvent | FocusEvent, data: any, isCompany?: boolean) => void;
    export let hideTooltip: () => void;
    export let onCompanyHover: (data: any) => void;
    export let onShowCompanyDetail: (detail: any) => void;
    export let highlightCompanyConnections: (companyName: string) => void;
    export let resetConnectionHighlights: () => void;
    export let setActiveCompany: (company: string, entries: any[]) => void;
    export let parentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let focusableElements: any[];
    export let index: number;
    export let activeCompany: string | null;

    // Local state
    let labelGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    let labelText: d3.Selection<SVGTextElement, unknown, null, undefined>;
    
    /**
     * Creates the company label
     */
    export function createCompanyLabel() {
        if (!parentGroup) return;
        
        // Create sanitized ID for the company
        const companyId = company.company.replace(/\s+/g, '-').toLowerCase();
        
        // Get company status color
        const statusColor = getCompanyStatusColor(company.status);
        
        // Create the label group
        labelGroup = parentGroup.append("g")
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
        labelText = textContainer.append("text")
            .attr("text-anchor", isRightSide ? "start" : "end")
            .attr("dx", isRightSide ? 0 : 0) // Small offset from connection point
            .attr("dy", "0.35em")
            .text(formatCompanyName(company.company))
            .attr("fill", "#4A5568")
            .attr("font-size", isCloserPosition ? sizeConfig.labelFontSize : (parseFloat(sizeConfig.labelFontSize) * 1.1) + "px")
            .attr("font-weight", sizeConfig.labelFontWeight);

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
                        companyRef.drugNodes.forEach((drugRef: any, i: number) => {
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
                                (companyRef.drugNodes[0].element as HTMLElement).focus();
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
                .attr("fill", "#2B6CB0") // Highlight color
                .attr("opacity", 1); // Ensure full opacity for the focused label
            
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
                .attr("fill", "#2B6CB0") // Highlight color
                .attr("opacity", 1); // Ensure full opacity for the hovered label
            
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
                    companyRef.drugNodes.forEach((drugRef: any) => {
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
            
        return { labelGroup, labelElement };
    }
    
    /**
     * Updates the company label's appearance
     */
    export function updateCompanyLabel(isActive: boolean) {
        if (!labelText) return;
        
        if (isActive) {
            labelText
                .transition()
                .duration(500)
                .attr("fill", "#2B6CB0")
                .attr("font-size", "10.25px")
                .attr("font-weight", "800");
        } else {
            labelText
                .transition()
                .duration(500)
                .attr("fill", "#4A5568")
                .attr("font-size", isCloserPosition ? sizeConfig.labelFontSize : (parseFloat(sizeConfig.labelFontSize) * 1.1) + "px")
                .attr("font-weight", sizeConfig.labelFontWeight);
        }
    }
</script>

<style>
    .company-label {
        font-size: 12px;
        font-weight: 500;
        fill: #333;
        text-anchor: middle;
        pointer-events: none;
    }
</style> 
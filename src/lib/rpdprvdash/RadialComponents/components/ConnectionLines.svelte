<script lang="ts">
    import * as d3 from 'd3';

    // Props
    export let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let sizeConfig: any;
    
    // Local state
    let linesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    
    // Connection highlight color
    const highlightColor = "#2B6CB0"; // Blue color for highlighted connections
    const highlightWidth = sizeConfig.connectionStrokeWidth * 3; // Width for highlighted connections
    
    /**
     * Creates the lines group
     */
    export function createLinesGroup() {
        if (!contentGroup) return;
        
        linesGroup = contentGroup.append("g").attr("class", "connecting-lines");
        return linesGroup;
    }
    
    /**
     * Creates a main connection line from label to bracket point
     */
    export function createMainConnection(labelX: number, labelY: number, bracketX: number, bracketY: number, companyName: string) {
        if (!linesGroup) return;
        
        // Use simplified connections in all year view
        const strokeDasharray = sizeConfig.simplifiedConnections ? "1,2" : "none";
        
        return linesGroup.append("path")
            .attr("class", "main-connection")
            .attr("data-company", companyName)
            .attr("d", `M${labelX},${labelY}L${bracketX},${bracketY}`)
            .attr("stroke", "#37587e")
            .attr("stroke-width", sizeConfig.connectionStrokeWidth * 1) // Slightly thicker
            .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2) // Slightly more opaque
            .attr("stroke-dasharray", strokeDasharray)
            .attr("fill", "none");
    }
    
    /**
     * Creates a drug connection line from bracket/label point to drug
     */
    export function createDrugConnection(startX: number, startY: number, drugX: number, drugY: number, companyName: string, drugId: string) {
        if (!linesGroup) return;
        
        // Use simplified connections in all year view
        const strokeDasharray = sizeConfig.simplifiedConnections ? "1,2" : "none";
        
        return linesGroup.append("path")
            .attr("class", "drug-path")
            .attr("data-company", companyName)
            .attr("data-drug", drugId)
            .attr("d", `M${startX},${startY}L${drugX},${drugY}`)
            .attr("stroke", "#37587e")
            .attr("stroke-width", sizeConfig.connectionStrokeWidth)
            .attr("stroke-opacity", sizeConfig.connectionOpacity)
            .attr("stroke-dasharray", strokeDasharray)
            .attr("fill", "none");
    }
    
    /**
     * Desaturates all elements except those related to the specified company or drug
     */
    function desaturateOtherElements(activeCompany: string | null = null, activeDrug: string | null = null) {
        // Apply low opacity to all connections
        const allConnections = d3.selectAll("path.main-connection, path.drug-path");
        
        if (sizeConfig.useAnimations) {
            allConnections.transition()
                .duration(sizeConfig.transitionDuration)
                .attr("stroke-opacity", 0.15);
        } else {
            allConnections.attr("stroke-opacity", 0.15);
        }
        
        // Apply low opacity to all company labels
        const allLabels = d3.selectAll(".company-label text");
        
        if (sizeConfig.useAnimations) {
            allLabels.transition()
                .duration(sizeConfig.transitionDuration)
                .attr("opacity", 0.3);
        } else {
            allLabels.attr("opacity", 0.3);
        }
        
        // Apply low opacity to all drug nodes
        const allDrugNodes = d3.selectAll(".drug-node circle");
        
        if (sizeConfig.useAnimations) {
            allDrugNodes.transition()
                .duration(sizeConfig.transitionDuration)
                .attr("opacity", 0.3);
        } else {
            allDrugNodes.attr("opacity", 0.3);
        }
        
        // If we have an active company, restore its elements
        if (activeCompany) {
            // Restore company connections
            const companyConnections = d3.selectAll(`path.main-connection[data-company="${activeCompany}"], path.drug-path[data-company="${activeCompany}"]`);
            
            if (sizeConfig.useAnimations) {
                companyConnections.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
            } else {
                companyConnections.attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
            }
            
            // Restore company label
            const companyId = activeCompany.replace(/\s+/g, '-').toLowerCase();
            const companyLabel = d3.select(`#company-label-${companyId} text`);
            
            if (sizeConfig.useAnimations) {
                companyLabel.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("opacity", 1);
            } else {
                companyLabel.attr("opacity", 1);
            }
            
            // Restore drug nodes for this company
            const companyDrugNodes = d3.selectAll(`.drug-node[id*="${activeCompany.toLowerCase().replace(/\s+/g, '-')}"] circle`);
            
            if (sizeConfig.useAnimations) {
                companyDrugNodes.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("opacity", 1);
            } else {
                companyDrugNodes.attr("opacity", 1);
            }
        }
        
        // If we have an active drug, restore its elements
        if (activeDrug) {
            // Get the drug path
            const drugPath = d3.select(`path.drug-path[data-drug="${activeDrug}"]`);
            
            if (!drugPath.empty()) {
                // Restore drug path opacity
                if (sizeConfig.useAnimations) {
                    drugPath.transition()
                        .duration(sizeConfig.transitionDuration)
                        .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
                } else {
                    drugPath.attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
                }
                
                // Restore drug node opacity
                const drugNode = d3.select(`#${activeDrug} circle`);
                
                if (sizeConfig.useAnimations) {
                    drugNode.transition()
                        .duration(sizeConfig.transitionDuration)
                        .attr("opacity", 1);
                } else {
                    drugNode.attr("opacity", 1);
                }
                
                // Get the company name to restore its elements too
                const companyName = drugPath.attr("data-company");
                if (companyName) {
                    // Restore company label
                    const companyId = companyName.replace(/\s+/g, '-').toLowerCase();
                    const companyLabel = d3.select(`#company-label-${companyId} text`);
                    
                    if (sizeConfig.useAnimations) {
                        companyLabel.transition()
                            .duration(sizeConfig.transitionDuration)
                            .attr("opacity", 1);
                    } else {
                        companyLabel.attr("opacity", 1);
                    }
                    
                    // If there are multiple drugs, also restore the main connection
                    const mainConnection = d3.selectAll(`path.main-connection[data-company="${companyName}"]`);
                    
                    if (sizeConfig.useAnimations) {
                        mainConnection.transition()
                            .duration(sizeConfig.transitionDuration)
                            .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
                    } else {
                        mainConnection.attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
                    }
                }
            }
        }
    }
    
    /**
     * Highlights all connections for a company
     */
    export function highlightCompanyConnections(companyName: string) {
        resetConnectionHighlights();
        
        // Desaturate all other elements
        desaturateOtherElements(companyName, null);
        
        // Get all connections for this company
        const connections = d3.selectAll(`path.main-connection[data-company="${companyName}"], path.drug-path[data-company="${companyName}"]`);
        
        // Apply highlight with or without animation based on settings
        if (sizeConfig.useAnimations) {
            connections.transition()
                .duration(sizeConfig.transitionDuration)
                .attr("stroke", highlightColor)
                .attr("stroke-width", highlightWidth)
                .attr("stroke-opacity", 1);
        } else {
            connections
                .attr("stroke", highlightColor)
                .attr("stroke-width", highlightWidth)
                .attr("stroke-opacity", 1);
        }
    }
    
    /**
     * Highlights connections for a specific drug
     */
    export function highlightDrugConnections(drugId: string) {
        resetConnectionHighlights();
        
        // Desaturate all other elements
        desaturateOtherElements(null, drugId);
        
        // Get the drug path
        const drugPath = d3.select(`path.drug-path[data-drug="${drugId}"]`);
        if (!drugPath.empty()) {
            // Highlight the drug path with or without animation
            if (sizeConfig.useAnimations) {
                drugPath.transition()
                    .duration(sizeConfig.transitionDuration)
                    .attr("stroke", highlightColor)
                    .attr("stroke-width", highlightWidth)
                    .attr("stroke-opacity", 1);
            } else {
                drugPath
                    .attr("stroke", highlightColor)
                    .attr("stroke-width", highlightWidth)
                    .attr("stroke-opacity", 1);
            }
            
            // Get the company name to highlight the main connection if needed
            const companyName = drugPath.attr("data-company");
            if (companyName) {
                // Find all drug paths for this company to determine if we need to highlight the main connection
                const drugPaths = d3.selectAll(`path.drug-path[data-company="${companyName}"]`);
                if (drugPaths.size() > 1) {
                    // If there are multiple drugs, also highlight the main connection
                    const mainConnection = d3.selectAll(`path.main-connection[data-company="${companyName}"]`);
                    
                    if (sizeConfig.useAnimations) {
                        mainConnection.transition()
                            .duration(sizeConfig.transitionDuration)
                            .attr("stroke", highlightColor)
                            .attr("stroke-width", highlightWidth)
                            .attr("stroke-opacity", 1);
                    } else {
                        mainConnection
                            .attr("stroke", highlightColor)
                            .attr("stroke-width", highlightWidth)
                            .attr("stroke-opacity", 1);
                    }
                }
            }
        }
    }
    
    /**
     * Resets all connection highlights
     */
    export function resetConnectionHighlights() {
        // Reset main connections with or without animation
        const mainConnections = d3.selectAll("path.main-connection");
        const drugPaths = d3.selectAll("path.drug-path");
        
        if (sizeConfig.useAnimations) {
            mainConnections.transition()
                .duration(sizeConfig.transitionDuration)
                .attr("stroke", "#37587e")
                .attr("stroke-width", sizeConfig.connectionStrokeWidth * 1.2)
                .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
            
            drugPaths.transition()
                .duration(sizeConfig.transitionDuration)
                .attr("stroke", "#37587e")
                .attr("stroke-width", sizeConfig.connectionStrokeWidth)
                .attr("stroke-opacity", sizeConfig.connectionOpacity);
        } else {
            mainConnections
                .attr("stroke", "#37587e")
                .attr("stroke-width", sizeConfig.connectionStrokeWidth * 1.2)
                .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
            
            drugPaths
                .attr("stroke", "#37587e")
                .attr("stroke-width", sizeConfig.connectionStrokeWidth)
                .attr("stroke-opacity", sizeConfig.connectionOpacity);
        }
        
        // Reset all company labels
        const allLabels = d3.selectAll(".company-label text");
        
        if (sizeConfig.useAnimations) {
            allLabels.transition()
                .duration(sizeConfig.transitionDuration)
                .attr("opacity", 1)
                .attr("fill", "#4A5568")
                .attr("font-weight", sizeConfig.labelFontWeight);
        } else {
            allLabels
                .attr("opacity", 1)
                .attr("fill", "#4A5568")
                .attr("font-weight", sizeConfig.labelFontWeight);
        }
        
        // Reset all drug nodes
        const allDrugNodes = d3.selectAll(".drug-node circle");
        
        if (sizeConfig.useAnimations) {
            allDrugNodes.transition()
                .duration(sizeConfig.transitionDuration)
                .attr("opacity", 1);
        } else {
            allDrugNodes.attr("opacity", 1);
        }
    }
</script>

<style>
    /* No specific styles needed for this component */
</style> 
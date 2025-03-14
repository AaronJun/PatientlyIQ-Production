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
     * Highlights all connections for a company
     */
    export function highlightCompanyConnections(companyName: string) {
        resetConnectionHighlights();
        
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
    }
</script>

<style>
    /* No specific styles needed for this component */
</style> 
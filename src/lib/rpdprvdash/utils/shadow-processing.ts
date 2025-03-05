/**
 * Utility functions for SVG effects like shadows and filters
 */
import { Selection } from 'd3';

/**
 * Creates a drop shadow filter for SVG elements
 * @param defs - d3 selection of the SVG defs element
 * @param filterId - ID to use for the filter (e.g., "dropshadow")
 * @param options - Configuration options for the shadow
 */
export function createDropShadowFilter(
    defs: Selection<SVGDefsElement, unknown, null, undefined>,
    filterId: string = "dropshadow",
    options: {
        stdDeviation?: number;
        dx?: number;
        dy?: number;
        opacity?: number;
    } = {}
) {
    // Default options
    const {
        stdDeviation = 2.5,
        dx = 1.25,
        dy = 1.5,
        opacity = 0.3
    } = options;
    
    // Create drop shadow filter with proper rounded edges
    const dropShadow = defs.append("filter")
        .attr("id", filterId)
        .attr("width", "200%")
        .attr("height", "200%")
        .attr("x", "-100%")
        .attr("y", "-100%")
        .attr("filterUnits", "userSpaceOnUse");
    
    // Create a shadow using blur and offset
    dropShadow.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", stdDeviation)
        .attr("result", "blur");
        
    dropShadow.append("feOffset")
        .attr("in", "blur")
        .attr("dx", dx)
        .attr("dy", dy)
        .attr("result", "offsetBlur");
        
    // Apply color to the shadow
    dropShadow.append("feColorMatrix")
        .attr("in", "offsetBlur")
        .attr("type", "matrix")
        .attr("values", `0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${opacity} 0`)
        .attr("result", "shadowMatrixOut");
    
    // Create a composite of the original shape for proper rounded edges
    const feMerge = dropShadow.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "shadowMatrixOut");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
        
    return filterId;
}

/**
 * Creates a glow effect filter
 * @param defs - d3 selection of the SVG defs element
 * @param filterId - ID to use for the filter
 * @param options - Configuration options for the glow
 */
export function createGlowFilter(
    defs: Selection<SVGDefsElement, unknown, null, undefined>,
    filterId: string = "glow",
    options: {
        stdDeviation?: number;
        floodColor?: string;
        floodOpacity?: number;
    } = {}
) {
    // Default options
    const {
        stdDeviation = 3,
        floodColor = "#FFA500",
        floodOpacity = 0.7
    } = options;
    
    // Create the filter
    const glowFilter = defs.append("filter")
        .attr("id", filterId)
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
        
    // Create the glow effect
    const feColorMatrix = glowFilter.append("feColorMatrix")
        .attr("type", "matrix")
        .attr("values", "0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 1 0");
        
    // Add a Gaussian blur
    const feGaussianBlur = glowFilter.append("feGaussianBlur")
        .attr("stdDeviation", stdDeviation)
        .attr("result", "coloredBlur");
        
    // Add a flood fill for the color
    glowFilter.append("feFlood")
        .attr("flood-color", floodColor)
        .attr("flood-opacity", floodOpacity)
        .attr("result", "glowColor");
        
    // Composite the glow with the original
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
        
    return filterId;
}

/**
 * Create a highlight effect for selected elements
 * @param defs - d3 selection of the SVG defs element
 * @param filterId - ID to use for the filter
 * @param options - Configuration options for highlighting
 */
export function createHighlightFilter(
    defs: Selection<SVGDefsElement, unknown, null, undefined>,
    filterId: string = "highlight",
    options: {
        highlightColor?: string;
        strength?: number;
    } = {}
) {
    // Default options
    const {
        highlightColor = "#FFD700",
        strength = 1.5
    } = options;
    
    // Create the filter
    const highlightFilter = defs.append("filter")
        .attr("id", filterId)
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");
        
    // Add a color matrix to create the highlight
    highlightFilter.append("feColorMatrix")
        .attr("type", "matrix")
        .attr("values", `
            ${strength} 0 0 0 0
            0 ${strength} 0 0 0
            0 0 ${strength} 0 0
            0 0 0 1 0
        `);
        
    return filterId;
}
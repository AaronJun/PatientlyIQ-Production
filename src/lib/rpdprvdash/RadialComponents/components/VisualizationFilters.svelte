<script lang="ts">
    import * as d3 from 'd3';

    // Props
    export let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    
    /**
     * Creates SVG filters for the visualization
     */
    export function createFilters() {
        if (!contentGroup) return;
        
        // Create defs element for filters
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
            
        // Create gold glow filter for transacted vouchers
        const goldGlow = defs.append("filter")
            .attr("id", "goldGlow")
            .attr("width", "200%")
            .attr("height", "200%")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("filterUnits", "userSpaceOnUse");
            
        goldGlow.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3)
            .attr("result", "blur");
            
        goldGlow.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 0)
            .attr("dy", 0)
            .attr("result", "offsetBlur");
            
        // Apply gold color to the shadow
        goldGlow.append("feColorMatrix")
            .attr("in", "offsetBlur")
            .attr("type", "matrix")
            .attr("values", "0 0 0 0 1.0 0 0 0 0 0.84 0 0 0 0 0.0 0 0 0 1 0")
            .attr("result", "coloredBlur");
            
        // Create a composite of the original shape with the gold glow
        const goldMerge = goldGlow.append("feMerge");
        goldMerge.append("feMergeNode")
            .attr("in", "coloredBlur");
        goldMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
    }
</script> 
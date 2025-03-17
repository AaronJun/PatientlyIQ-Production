<script lang="ts">
    import * as d3 from 'd3';

    // Component props
    export let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let radiusScale: d3.ScaleLogarithmic<number, number>;
    export let innerRadius: number;
    export let outerRadius: number;
    export let isAllYearView: boolean = false;

    /**
     * Creates the concentric circles for RPD count visualization
     */
    export function createStageCircles() {
        // Create stage circles group
        const stageGroup = contentGroup.append("g").attr("class", "rpd-count-circles");
        
        // Generate logarithmic guide circles
        const guideValues = radiusScale.ticks(6);
        
        // Draw guide circles with companytree styling
        guideValues.forEach(value => {
            const radius = radiusScale(value);
            
            // Create the circle with companytree styling
            stageGroup.append("circle")
                .attr("class", `guide-circle guide-${value}`)
                .attr("r", radius)
                .attr("fill", "none")
                .attr("stroke", "#565656") // Darker color to match companytree
                .attr("stroke-width", isAllYearView ? 0.5 : 1)
                .attr("stroke-opacity", 0.7)
                .attr("stroke-dasharray", isAllYearView ? "1,5" : "2,5");
            
            // Add label for selected circles (every other one)
            if (value % 50 === 0 || value === guideValues[0] || value === guideValues[guideValues.length - 1]) {
                const labelAngle = -Math.PI / 15;
                const labelX = radius * Math.cos(labelAngle);
                const labelY = radius * Math.sin(labelAngle);
                
                const labelGroup = stageGroup.append("g")
                    .attr("transform", `translate(${labelX},${labelY})`);
                
                // Add background with companytree styling
                labelGroup.append("rect")
                    .attr("x", -20)
                    .attr("y", -10)
                    .attr("width", 40)
                    .attr("height", 20)
                    .attr("rx", 4)
                    .attr("fill", "#fff")
                    .attr("opacity", isAllYearView ? 0.9 : 0.8);
                
                // Add text with companytree styling
                labelGroup.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .attr("fill", "#565656") // Darker color to match companytree
                    .attr("font-size", isAllYearView ? "8.25px" : "10px")
                    .attr("font-weight", isAllYearView ? "400" : "normal")
                    .text(value);
            }
        });
        
        return stageGroup;
    }
    
    /**
     * Highlights a specific RPD count range
     */
    export function highlightRange(min: number, max: number) {
        // Reset all circles
        d3.selectAll(".guide-circle")
            .transition()
            .duration(isAllYearView ? 0 : 300)
            .attr("stroke-width", isAllYearView ? 0.5 : 1)
            .attr("stroke-opacity", 0.7)
            .attr("stroke", "#565656")
            .attr("stroke-dasharray", isAllYearView ? "1,5" : "2,5");
        
        // Highlight circles in the range
        guideValues.forEach(value => {
            if (value >= min && value <= max) {
                d3.select(`.guide-circle.guide-${value}`)
                    .transition()
                    .duration(isAllYearView ? 0 : 300)
                    .attr("stroke-width", isAllYearView ? 1 : 2)
                    .attr("stroke-opacity", 1)
                    .attr("stroke-dasharray", "none");
            }
        });
    }
    
    /**
     * Reset all highlights
     */
    export function resetHighlights() {
        d3.selectAll(".guide-circle")
            .transition()
            .duration(isAllYearView ? 0 : 300)
            .attr("stroke-width", isAllYearView ? 0.5 : 1)
            .attr("stroke-opacity", 0.7)
            .attr("stroke", "#565656")
            .attr("stroke-dasharray", isAllYearView ? "1,5" : "2,5");
    }
    
    // Generate logarithmic guide values
    const guideValues = radiusScale ? radiusScale.ticks(6) : [];
</script>

<style>
    /* No specific styles needed for this component */
</style> 
<script lang="ts">
    import * as d3 from 'd3';
    import { getStageDisplayName, getStage } from '../../utils/data-processing-utils';

    // Component props
    export let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    export let stageRadii: Record<string, number>;
    export let stageLabelConfig: any;
    export let isAllYearView: boolean = false;
    export let onStageHover: (entries: any[]) => void = () => {};
    export let data: any[] = [];
    export let hideTooltip: () => void = () => {};

    // Stage colors
    const stageColors = {
        'PRE': '#565656',
        'P1': '#464646',
        'P2': '#363636',
        'P3': '#262626',
        'FILED': '#4A5568',
        'PRV': '#4e044e',
        'TRANS': '#1A202C' // Darker color for transacted vouchers
    };

    // Active stage tracking
    let activeStage: string | null = null;

    /**
     * Creates the stage circles and labels
     */
    export function createStageCircles() {
        // Create stage circles group
        const stageGroup = contentGroup.append("g").attr("class", "stage-circles");
        
        // Create each stage circle
        Object.entries(stageRadii).forEach(([stage, radius]) => {
            // Create the stage circle
            stageGroup.append("circle")
                .attr("class", `stage-circle stage-${stage.toLowerCase()}`)
                .attr("r", radius)
                .attr("fill", "none")
                .attr("stroke", stageColors[stage as keyof typeof stageColors] || "#E2E8F0")
                .attr("stroke-width", isAllYearView ? 0.5 : 1)
                .attr("stroke-opacity", 0.7)
                .attr("stroke-dasharray", isAllYearView ? "1,5" : "2,5");
            
            // Add stage label
            const labelAngle = stageLabelConfig.angle;
            const labelX = radius * Math.cos(labelAngle - Math.PI/2);
            const labelY = radius * Math.sin(labelAngle - Math.PI/2);
            
            // Create a group for the label
            const labelGroup = stageGroup.append("g")
                .attr("class", `stage-label-group stage-label-${stage.toLowerCase()}`)
                .attr("transform", `translate(${labelX}, ${labelY})`)
                .style("cursor", "pointer")
                .attr("tabindex", "0")
                .attr("role", "button")
                .attr("aria-label", `${getStageDisplayName(stage)} stage`);
            
            // Add background for better readability
            labelGroup.append("rect")
                .attr("x", -20)
                .attr("y", -10)
                .attr("width", 45)
                .attr("height", 20)
                .attr("rx", 12)
                .attr("fill", "#fefefe")
                .attr("opacity", isAllYearView ? 1 : 1);
            
            // Add the text label
            labelGroup.append("text")
                .attr("class", "stage-label")
                .attr("text-anchor", "middle")
                .attr("dy", "0.35em")
                .attr("fill", stageColors[stage as keyof typeof stageColors] || "#718096")
                .attr("font-size", "8.25px")
                .attr("font-weight", isAllYearView ? "400" : "normal")
                .text(getStageDisplayName(stage));
            
            // Add event listeners for the stage label
            labelGroup
                .on("click", () => handleStageClick(stage))
                .on("mouseover", () => handleStageHover(stage))
                .on("mouseout", handleStageLeave)
                .on("focus", () => handleStageHover(stage))
                .on("blur", handleStageLeave)
                .on("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleStageClick(stage);
                    }
                });
        });
        return stageGroup;
    }
    
    /**
     * Highlights a stage and its associated data
     */
    export function highlightStage(stage: string | null) {
        // Reset all stages to default state
        d3.selectAll(".stage-circle")
            .transition()
            .duration(isAllYearView ? 0 : 300)
            .attr("stroke-width", isAllYearView ? 0.5 : .8)
            .attr("stroke-opacity", 0.7)
            .attr("stroke-dasharray", isAllYearView ? "1,5" : "2,5");
        
        // Reset all labels to default state
        d3.selectAll(".stage-label")
            .transition()
            .duration(isAllYearView ? 0 : 300)
            .attr("font-size", isAllYearView ? "8.425px" : "10px");
        
        // Set active stage
        activeStage = stage;
        
        // If a stage is selected, slightly increase opacity only
        if (stage) {
            d3.select(`.stage-circle.stage-${stage.toLowerCase()}`)
                .transition()
                .duration(isAllYearView ? 0 : 300)
                .attr("stroke-opacity", 0.9);
        }
    }
    
    /**
     * Handles click on a stage
     */
    function handleStageClick(stage: string) {
        // Toggle active stage
        if (activeStage === stage) {
            highlightStage(null);
            onStageHover([]);
        } else {
            highlightStage(stage);
            
            // Filter data for this stage
            const stageEntries = data.filter(entry => {
                // Use the getStage function to determine the stage of each entry
                const entryStage = getStage(entry);
                return entryStage === stage;
            });
            
            // Call the callback with filtered data
            onStageHover(stageEntries);
        }
    }
    
    /**
     * Handles hover on a stage
     */
    function handleStageHover(stage: string) {
        // Only highlight if not already active
        if (activeStage !== stage) {
            d3.select(`.stage-circle.stage-${stage.toLowerCase()}`)
                .transition()
                .duration(isAllYearView ? 0 : 150)
                .attr("stroke-opacity", 0.8);
        }
    }
    
    /**
     * Handles mouse leave from a stage
     */
    function handleStageLeave() {
        // Reset highlight for non-active stages
        Object.keys(stageRadii).forEach(stage => {
            if (stage !== activeStage) {
                d3.select(`.stage-circle.stage-${stage.toLowerCase()}`)
                    .transition()
                    .duration(isAllYearView ? 0 : 150)
                    .attr("stroke-opacity", 0.7);
            }
        });
    }
</script>

<style>
    .stage-label {
        text-anchor: middle;
        pointer-events: none;
    }
</style> 
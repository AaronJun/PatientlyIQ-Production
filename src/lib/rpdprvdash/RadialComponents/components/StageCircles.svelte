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
            // Skip PRV and TRANS stages for regular circle handling (they're handled differently)
            if (stage === 'PRV' || stage === 'TRANS') return;
            
            // Create the stage circle
            stageGroup.append("circle")
                .attr("class", `stage-circle stage-${stage.toLowerCase()}`)
                .attr("r", radius)
                .attr("fill", "none")
                .attr("stroke", stageColors[stage as keyof typeof stageColors] || "#E2E8F0")
                .attr("stroke-width", isAllYearView ? 0.5 : 1)
                .attr("stroke-opacity", 0.7)
                .attr("stroke-dasharray", isAllYearView ? "1,5" : "2,5");
            
            // Add stage label regardless of view mode, but with adjusted styling
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
                .attr("width", 40)
                .attr("height", 20)
                .attr("rx", 4)
                .attr("fill", "#fff")
                .attr("opacity", isAllYearView ? 0.9 : 0.8);
            
            // Add the text label with adjusted size for all year view
            labelGroup.append("text")
                .attr("class", "stage-label")
                .attr("text-anchor", "middle")
                .attr("dy", "0.35em")
                .attr("fill", stageColors[stage as keyof typeof stageColors] || "#718096")
                .attr("font-size", isAllYearView ? "8.25px" : "10px")
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
        
        // Handle PRV and TRANS stages specially
        // Add PRV stage circle with special styling
        if ('PRV' in stageRadii) {
            const prvRadius = stageRadii['PRV'];
            stageGroup.append("circle")
                .attr("class", "stage-circle stage-prv")
                .attr("r", prvRadius)
                .attr("fill", "none")
                .attr("stroke", stageColors['PRV'])
                .attr("stroke-width", isAllYearView ? 0.75 : 1.5)
                .attr("stroke-opacity", 0.9)
                .attr("stroke-dasharray", isAllYearView ? "1,3" : "1.25, 4");
                
            // Add PRV label if not in all year view    
            if (!isAllYearView) {
                addSpecialStageLabel(stageGroup, 'PRV', prvRadius, stageLabelConfig.angle);
            }
        }
        
        // Add TRANS stage circle with special styling
        if ('TRANS' in stageRadii) {
            const transRadius = stageRadii['TRANS'];
            stageGroup.append("circle")
                .attr("class", "stage-circle stage-trans")
                .attr("r", transRadius)
                .attr("fill", "none")
                .attr("stroke", stageColors['TRANS'])
                .attr("stroke-width", isAllYearView ? 0.75 : 1.5)
                .attr("stroke-dasharray", isAllYearView ? "2,1" : "1.25, 4")
                .attr("stroke-opacity", 0.9);
                
            // Add TRANS label if not in all year view
            if (!isAllYearView) {
                // Use a different angle for the TRANS label to avoid overlap with PRV
                const transLabelAngle = stageLabelConfig.angle + Math.PI/6;
                addSpecialStageLabel(stageGroup, 'TRANS', transRadius, transLabelAngle);
            }
        }
        
        return stageGroup;
    }
    
    /**
     * Helper function to add labels for special stages (PRV and TRANS)
     */
    function addSpecialStageLabel(
        stageGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
        stage: string,
        radius: number,
        angle: number
    ) {
        const labelX = radius * Math.cos(angle - Math.PI/2);
        const labelY = radius * Math.sin(angle - Math.PI/2);
        
        // Create a group for the label
        const labelGroup = stageGroup.append("g")
            .attr("class", `stage-label-group stage-label-${stage.toLowerCase()}`)
            .attr("transform", `translate(${labelX}, ${labelY})`)
            .style("cursor", "pointer")
            .attr("tabindex", "0")
            .attr("role", "button")
            .attr("aria-label", `${getStageDisplayName(stage)} stage`);
        
        // Add background with special styling
        labelGroup.append("rect")
            .attr("x", -25)
            .attr("y", -10)
            .attr("width", 50)
            .attr("height", 20)
            .attr("fill", "#fff")
            .attr("rx", 0)
            .attr("opacity", 0.9);
        
        // Add the text label with special styling
        labelGroup.append("text")
            .attr("class", "stage-label")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", stageColors[stage as keyof typeof stageColors])
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
    }
    
    /**
     * Highlights a stage and its associated data
     */
    export function highlightStage(stage: string | null) {
        // Reset previous highlight for regular stages
        d3.selectAll(".stage-circle:not(.stage-prv):not(.stage-trans)")
            .transition()
            .duration(isAllYearView ? 0 : 300)
            .attr("stroke-width", isAllYearView ? 0.5 : 1)
            .attr("stroke-opacity", 0.7)
            .attr("stroke-dasharray", isAllYearView ? "1,1" : "none");
        
        // Reset PRV stage
        d3.selectAll(".stage-circle.stage-prv")
            .transition()
            .duration(isAllYearView ? 0 : 300)
            .attr("stroke-width", isAllYearView ? 0.75 : 1.5)
            .attr("stroke-opacity", 0.9)
            .attr("stroke-dasharray", isAllYearView ? "2,1" : "none");
        
        // Reset TRANS stage
        d3.selectAll(".stage-circle.stage-trans")
            .transition()
            .duration(isAllYearView ? 0 : 300)
            .attr("stroke-width", isAllYearView ? 0.75 : 1.5)
            .attr("stroke-opacity", 0.9)
            .attr("stroke-dasharray", isAllYearView ? "3,1" : "4,2");
        
        // Reset all labels
        d3.selectAll(".stage-label")
            .transition()
            .duration(isAllYearView ? 0 : 300)
            .attr("font-weight", "normal")
            .attr("font-size", "10px");
        
        // Special handling for PRV and TRANS labels
        d3.selectAll(".stage-label-prv text, .stage-label-trans text")
            .transition()
            .duration(isAllYearView ? 0 : 300);
        
        // Set active stage
        activeStage = stage;
        
        // If a stage is selected, highlight it
        if (stage) {
            d3.select(`.stage-circle.stage-${stage.toLowerCase()}`)
                .transition()
                .duration(isAllYearView ? 0 : 300)
                .attr("stroke-width", isAllYearView ? 1 : 2)
                .attr("stroke-opacity", 1);
            
            d3.select(`.stage-label-${stage.toLowerCase()} text`)
                .transition()
                .duration(isAllYearView ? 0 : 300)
                .attr("font-weight", "bold")
                .attr("font-size", "11px");
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
                .attr("stroke-width", isAllYearView ? 1 : 1.5)
                .attr("stroke-opacity", 0.9);
            
            d3.select(`.stage-label-${stage.toLowerCase()} text`)
                .transition()
                .duration(isAllYearView ? 0 : 150)
                .attr("font-weight", "semibold");
        }
    }
    
    /**
     * Handles mouse leave from a stage
     */
    function handleStageLeave() {
        // Reset highlight for non-active stages
        Object.keys(stageRadii).forEach(stage => {
            if (stage !== activeStage && stage !== 'PRV' && stage !== 'TRANS') {
                d3.select(`.stage-circle.stage-${stage.toLowerCase()}`)
                    .transition()
                    .duration(isAllYearView ? 0 : 150)
                    .attr("stroke-width", isAllYearView ? 0.5 : 1)
                    .attr("stroke-opacity", 0.7);
                
                d3.select(`.stage-label-${stage.toLowerCase()} text`)
                    .transition()
                    .duration(isAllYearView ? 0 : 150)
                    .attr("font-weight", "normal");
            }
        });
    }
</script>

<style>
    .stage-label {
        font-size: 10px;
        font-weight: 500;
        fill: #666;
        text-anchor: middle;
        pointer-events: none;
    }
</style> 
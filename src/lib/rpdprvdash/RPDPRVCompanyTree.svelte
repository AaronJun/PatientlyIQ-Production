<!-- Modified RPDPRVCompanyTree.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import RPDTooltip from './RPDTooltip.svelte';
    import CompanyNode from './components/CompanyNode.svelte';
    
    // Import the color definitions
    import { 
        getTherapeuticAreaColor, 
        getStageColor, 
        getCompanyStatusColor
    } from './utils/colorDefinitions';
    
    // Import our new utility functions
    import {
        getStage,
        getStageFullName,
        formatCompanyName,
        calculateCompanyAngles,
        calculateOptimalLabelPlacement,
        processDataForLayout,
        getSizeConfig,
        getLabelConfig,
        getStageRadii,
        getStageLabelConfig
    } from './utils/data-processing-utils';

    // Component props
    export let data: any[] = [];
    export let onCompanyHover: (entries: any[]) => void = () => {};
    export let onStageHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};
    export let isAllYearView: boolean = false; // New prop to check if "all" year view is selected

    // SVG and dimension configuration
    let svg: SVGElement;
    const width = 920;
    const height = width;
    const radius = Math.min(width, height) / 2 - 60;
    const maxLabelWidth = 85;
    const ANGLE_BUFFER = isAllYearView ? Math.PI / 32 : Math.PI / 24;

    // Get configuration from utility functions
    $: sizeConfig = getSizeConfig(isAllYearView);
    $: labelConfig = getLabelConfig(radius, isAllYearView);
    $: stageRadii = getStageRadii(radius);
    const stageLabelConfig = getStageLabelConfig();

    // Connection highlight color
    const highlightColor = "#FFD700"; // Gold color for highlighted connections
    const highlightWidth = isAllYearView ? 1.75 : 2.25; // Width for highlighted connections

    // Tooltip state
    let tooltipVisible = false;
    let tooltipContent = {
        sponsor: '',
        drugName: '',
        therapeuticArea: '',
        id: ''
    };
    let tooltipBorderColor = '';
    let tooltipX = 0;
    let tooltipY = 0;
    const tooltipOffset = { x: 15, y: 15 };
    let tooltipTimeout: ReturnType<typeof setTimeout> | null = null;

    // Active selection tracking
    let activeCompany: string | null = null;
    let activeStage: string | null = null;

    // Stage radii type definition
    type StageRadii = {
        PRE: number;
        P1: number;
        P2: number;
        P3: number;
        FILED: number;
        PRV: number;
    };

    // Company type definition
    type Company = {
        company: string;
        status: string;
        stages: Map<string, Drug[]>;
        totalDrugs: number;
        entries: Drug[];
        clinicalTrials: number;
        vouchersAwarded: number;
        uniqueIndications: Set<string>;
        uniqueAreas: Set<string>;
    };

    // Drug type definition
    type Drug = {
        Company: string;
        Candidate: string;
        TherapeuticArea1: string;
        "Current Development Stage": string;
        "PRV Issue Year"?: string;
        "PRV Year"?: string;
        "RPDD Year"?: string;
        Indication?: string;
        Class1?: string;
        MOA?: string;
        "Link to CrunchBase"?: string;
    };

    // Store D3 selections for groups
    let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    let linesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    let stagesGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    let companyLabelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    /**
     * Creates the visualization with all components
     */
    function createVisualization() {
        if (!svg) return;

        const svgElement = d3.select(svg);
        svgElement.selectAll("*").remove();

        // Create drop shadow filter
        const defs = svgElement.append("defs");
        
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

        mainGroup = svgElement.append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        linesGroup = mainGroup.append("g").attr("class", "connecting-lines");
        stagesGroup = mainGroup.append("g").attr("class", "stage-circles");
        companyLabelsGroup = mainGroup.append("g").attr("class", "company-labels");

        // Create stage circles and labels
        Object.entries(stageRadii).forEach(([stage, radius]) => {
            // Get the stage color from our color definitions
            const stageFullName = getStageFullName(stage);
            const stageColor = getStageColor(stageFullName);
            
            stagesGroup.append("circle")
                .attr("r", radius)
                .attr("fill", "none")
                .attr("stroke", stageColor.stroke)
                .attr("stroke-width", 1.425)
                .attr("stroke-dasharray", "1,5")
                .attr("stroke-opacity", 1);

            const labelAngle = -Math.PI / 15;
            const labelX = radius * Math.cos(labelAngle) - 15;
            const labelY = radius * Math.sin(labelAngle) + 25;

            const labelGroup = stagesGroup.append("g")
                .attr("transform", `translate(${labelX},${labelY})`)
                .attr("class", "stage-label")
                .attr("id", `stage-label-${stage}`)
                .attr("cursor", "pointer");

            const tempText = labelGroup.append("text")
                .attr("opacity", 0)
                .text(stage);
            const textWidth = tempText.node()?.getBBox().width ?? 0;
            tempText.remove();

            labelGroup.append("rect")
                .attr("x", -stageLabelConfig.padding.x)
                .attr("y", -stageLabelConfig.height/2)
                .attr("width", textWidth + stageLabelConfig.padding.x * 2)
                .attr("height", stageLabelConfig.height)
                .attr("rx", stageLabelConfig.cornerRadius)
                .attr("fill", '#F8FAFC')
                .attr("opacity", 1);

            labelGroup.append("text")
                .attr("text-anchor", "middle")
                .attr("dy", "0.3em")
                .attr("fill", stageColor.stroke)
                .attr("font-size", isAllYearView ? "8px" : "9.25px")
                .attr("font-weight", "400")
                .text(stage);
                
            // Add click handler for stage label
            labelGroup.on("click", (event) => {
                event.stopPropagation();
                
                // Hide tooltip immediately
                if (tooltipTimeout) {
                    clearTimeout(tooltipTimeout);
                    tooltipTimeout = null;
                }
                tooltipVisible = false;
                
                const stageEntries = data.filter(entry => getStage(entry) === stage);
                setActiveStage(stage, stageEntries);
            });
        });

        const companies = processDataForLayout(data);
        const companyAngles = calculateCompanyAngles(companies, ANGLE_BUFFER);
        const labelPlacements = calculateOptimalLabelPlacement(companies, companyAngles, labelConfig);

        // Use our new CompanyNode component for each company
        companies.forEach(company => {
            const labelPlacement = labelPlacements.find(l => l.company === company.company);
            if (!labelPlacement) return;

            // Create a CompanyNode for each company
            const companyNode = {
                company,
                companyAngles,
                labelPlacement,
                stageRadii,
                sizeConfig,
                labelConfig: { ...labelConfig, radius },
                mainGroup,
                linesGroup,
                companyLabelsGroup,
                highlightColor,
                highlightWidth,
                data,
                onShowTooltip: showTooltip,
                onHideTooltip: hideTooltip,
                onShowCompanyDetail,
                onShowDrugDetail,
                onHighlightCompanyConnections: highlightCompanyConnections,
                onHighlightDrugConnections: highlightDrugConnections,
                onResetConnectionHighlights: resetConnectionHighlights
            };
            
            // Initialize the company node
            const companyNodeInstance = new CompanyNode({
                target: document.createElement('div'), // This is a dummy target, as we're using D3 for rendering
                props: companyNode
            });
            
            // Call the initialize method to render the company node
            companyNodeInstance.initialize();
        });

        // Add click handler to SVG background to clear selections
        svgElement.on("click", (event) => {
            // Check if click was directly on the SVG background
            if (event.target === svg) {
                activeCompany = null;
                activeStage = null;
                resetConnectionHighlights();
                hideTooltip(); // Ensure tooltip is hidden when clicking on background
                onLeave();
            }
        });
        
        // Add event listeners to handle tooltip when mouse leaves SVG
        svgElement.on("mouseleave", () => {
            resetConnectionHighlights();
            hideTooltip();
        });
    }

    /**
     * Shows tooltip at the given mouse event position for the provided data
     */
    function showTooltip(event: MouseEvent, d: any, isCompany: boolean = false) {
        // Clear existing tooltip timeout
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
        }
        
        if (!svg) return;
        
        const containerRect = svg.getBoundingClientRect();
        
        // Position tooltip
        tooltipX = event.clientX - containerRect.left + tooltipOffset.x;
        tooltipY = event.clientY - containerRect.top + tooltipOffset.y;
        
        // Ensure tooltip stays within container
        const tooltipWidth = 200;
        if (tooltipX + tooltipWidth > containerRect.width) {
            tooltipX = event.clientX - containerRect.left - tooltipWidth - tooltipOffset.x;
        }
        
        const tooltipHeight = 100;
        if (tooltipY + tooltipHeight > containerRect.height) {
            tooltipY = event.clientY - containerRect.top - tooltipHeight - tooltipOffset.y;
        }
        
        // Set tooltip content
        if (isCompany) {
            tooltipContent = {
                sponsor: d.company,
                drugName: '',
                therapeuticArea: '',
                id: `${d.totalDrugs} drugs in pipeline`
            };
            const statusColor = getCompanyStatusColor(d.status);
            tooltipBorderColor = statusColor.stroke;
        } else {
            tooltipContent = {
                sponsor: d.Company || '',
                drugName: d.Candidate || '',
                therapeuticArea: d.TherapeuticArea1 || '',
                id: d["Current Development Stage"] || (d["PRV Issue Year"] ? "PRV" : "")
            };
            const stageCode = getStage(d);
            const stageFullName = getStageFullName(stageCode);
            const stageColor = getStageColor(stageFullName);
            tooltipBorderColor = stageColor.stroke;
        }
        
        tooltipVisible = true;
    }

    /**
     * Hides tooltip with a small delay
     */
    function hideTooltip() {
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
        }
        
        tooltipTimeout = setTimeout(() => {
            tooltipVisible = false;
            tooltipTimeout = null;
        }, 100);
    }
    
    /**
     * Sets the active company and updates visual state
     */
    function setActiveCompany(company: string, entries: Drug[]) {
        // Reset state
        activeCompany = company;
        activeStage = null;
        
        // Reset all visual elements
        d3.selectAll(".company-node rect")
            .transition()
            .duration(200)
            .attr("width", sizeConfig.companyNodeWidth)
            .attr("height", sizeConfig.companyNodeHeight)
            .attr("transform", `translate(${-sizeConfig.companyNodeWidth/2}, ${-sizeConfig.companyNodeHeight/2})`);
            
        d3.selectAll(".company-label text")
            .transition()
            .duration(500)
            .attr("fill", "#4A5568")
            .attr("font-size", sizeConfig.labelFontSize)
            .attr("font-weight", sizeConfig.labelFontWeight);
            
        d3.selectAll(".pipeline-dots circle")
            .transition()
            .duration(200)
            .attr("r", 0)
            .attr("opacity", 0.7);
            
        // Highlight active company if selected
        if (company) {
            const companyId = company.replace(/\s+/g, '-').toLowerCase();
                
            d3.select(`#company-label-${companyId} text`)
                .transition()
                .duration(500)
                .attr("font-weight", "800");
                
            // Get company data to pass to callback
            const companyData = processDataForLayout(data).find(c => c.company === company);
            if (companyData) {
                onCompanyHover([{
                    entries: companyData.entries,
                    company: companyData.company, 
                    totalDrugs: companyData.totalDrugs,
                    clinicalTrials: companyData.clinicalTrials,
                    vouchersAwarded: companyData.vouchersAwarded,
                    uniqueIndications: companyData.uniqueIndications.size,
                    uniqueAreas: companyData.uniqueAreas.size
                }]);
            } else {
                onCompanyHover(entries);
            }
        }
    }
    
    /**
     * Sets the active stage and updates visual state
     */
    function setActiveStage(stage: string, entries: Drug[]) {
        // Reset state
        activeStage = stage;
        activeCompany = null;
        
        // Reset visual elements
        d3.selectAll(".stage-label rect")
            .transition()
            .duration(200)
            .attr("fill", "#F8FAFC");
            
        d3.selectAll(".stage-label text")
            .transition()
            .duration(200)
            .attr("font-weight", "400");
            
        // Highlight active stage
        if (stage) {
            d3.select(`#stage-label-${stage} rect`)
                .transition()
                .duration(200)
                .attr("fill", "#F1F5F9");
                
            d3.select(`#stage-label-${stage} text`)
                .transition()
                .duration(200)
                .attr("font-weight", "800");
                
            onStageHover(entries);
        }
    }

    /**
     * Highlighting and connection management functions
     */
    function highlightCompanyConnections(companyName: string) {
        resetConnectionHighlights();
        
        d3.selectAll(`path.company-path[data-company="${companyName}"], path.drug-path[data-company="${companyName}"]`)
            .transition()
            .duration(300)
            .attr("stroke", highlightColor)
            .attr("stroke-width", highlightWidth)
            .attr("stroke-opacity", 1);
    }
    
    function highlightDrugConnections(drugId: string) {
        resetConnectionHighlights();
            
        d3.select(`path.drug-path[data-drug="${drugId}"]`)
            .transition()
            .duration(300)
            .attr("stroke", highlightColor)
            .attr("stroke-width", highlightWidth)
            .attr("stroke-opacity", 1);
    }
    
    function resetConnectionHighlights() {
        d3.selectAll("path.company-path, path.drug-path")
            .transition()
            .duration(300)
            .attr("stroke", "#37587e")
            .attr("stroke-width", sizeConfig.connectionStrokeWidth)
            .attr("stroke-opacity", sizeConfig.connectionOpacity);
    }

    // React to changes in isAllYearView
    $: if (isAllYearView !== undefined && svg && data.length > 0) {
        // Recreate visualization when view mode changes
        createVisualization();
    }
    
    // Initialize visualization on mount
    onMount(() => {
        if (data.length > 0) {
            createVisualization();
        }
        
        // Clean up tooltip when component is destroyed
        return () => {
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout);
                tooltipTimeout = null;
            }
        };
    });
</script>

<div class="chart-container">
    <svg
        bind:this={svg}
        {width}
        {height}
        viewBox="0 0 {width} {height}"
        class="w-full h-auto"
    />

    {#if tooltipVisible}
        <RPDTooltip
            visible={tooltipVisible}
            content={tooltipContent}
            borderColor={tooltipBorderColor}
            x={tooltipX}
            y={tooltipY}
        />
    {/if}
</div>

<style>
    .chart-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
    }
</style>
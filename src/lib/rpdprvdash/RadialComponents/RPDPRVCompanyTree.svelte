<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    // Import the color definitions
    import { 
        getTherapeuticAreaColor, 
        getStageColor, 
        getCompanyStatusColor
    } from '../utils/colorDefinitions';
    
    // Import our utility functions
    import {
        getStage,
        getStageFullName,
        getStageDisplayName,
        formatCompanyName,
        calculateCompanyAngles,
        calculateOptimalLabelPlacement,
        processDataForLayout,
        getSizeConfig,
        getLabelConfig,
        getStageRadii,
        getStageLabelConfig,
        hasPRVAward,
        isPRVTerminatedOrLiquidated,
        sampleDataForAllYearView
    } from '../utils/data-processing-utils';

    // Import sub-components
    import StageCircles from './components/StageCircles.svelte';
    import CompanyLabel from './components/CompanyLabel.svelte';
    import DrugNode from './components/DrugNode.svelte';
    import ConnectionLines from './components/ConnectionLines.svelte';
    import VisualizationFilters from './components/VisualizationFilters.svelte';
    import KeyboardNavigation from './components/KeyboardNavigation.svelte';

    // Component props
    export let data: any[] = [];
    export let onCompanyHover: (data: CompanyMetrics | any[]) => void = () => {};
    export let onStageHover: (entries: any[]) => void = () => {};
    export let onLeave: () => void = () => {};
    export let onShowDrugDetail: (detail: any) => void = () => {};
    export let onShowCompanyDetail: (detail: any) => void = () => {};
    export let isAllYearView: boolean = false;
    export let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
    // Import tooltip functions from parent
    export let showTooltip: (event: MouseEvent | FocusEvent, data: any, isCompany?: boolean) => void;
    export let hideTooltip: () => void;

    // SVG and dimension configuration
    const width = 1050;
    const height = width;
    const radius = Math.min(width, height) / 2 - 60;
    const ANGLE_BUFFER = isAllYearView ? Math.PI / 32 : Math.PI / 64;

    // Store reference to the content group
    let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

    // Get configuration from utility functions
    $: sizeConfig = getSizeConfig(isAllYearView);
    $: labelConfig = getLabelConfig(radius, isAllYearView);
    $: stageRadii = getStageRadii(radius);
    const stageLabelConfig = getStageLabelConfig();

    // Connection highlight color
    const highlightColor = "#2B6CB0"; // Blue color for highlighted connections
    const highlightWidth = isAllYearView ? 1.75 : 2.25; // Width for highlighted connections

    // Active selection tracking
    let activeCompany: string | null = null;
    let activeStage: string | null = null;
    
    // Track elements that can be keyboard-focused
    let focusableElements: { 
        element: Element, 
        type: string, 
        company?: string, 
        isSelected?: boolean, 
        drugNodes?: Array<{ element: Element, drug: any }>,
        index?: number
    }[] = [];
    
    // Track current focused element index for keyboard navigation
    let currentFocusIndex = -1;

    // Component references
    let stageCirclesComponent: StageCircles;
    let connectionLinesComponent: ConnectionLines;
    let keyboardNavigationComponent: KeyboardNavigation;
    let visualizationFiltersComponent: VisualizationFilters;
    
    // Loading state
    let isLoading = false;
    let loadingProgress = 0;

    // Add type definitions
    interface CompanyMetrics {
        entries: any[];
        companyName: string;
        totalDrugs: number;
        clinicalTrials: number;
        vouchersAwarded: number;
        transactedVouchers: number;
        uniqueIndications: number;
        uniqueAreas: number;
    }

    function createVisualization() {
        if (!mainGroup) {
            console.error("mainGroup is not available");
            return;
        }

        console.log("Creating visualization with mainGroup:", mainGroup);
        console.time('createVisualization');
        
        // Set loading state
        isLoading = true;
        loadingProgress = 0;

        // Clear any existing elements
        focusableElements = [];
        mainGroup.selectAll("*").remove();

        // Add a background rect to capture events
        mainGroup.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", -width/2)
            .attr("y", -height/2)
            .attr("fill", "transparent")
            .attr("class", "background-rect");

        // Center the visualization in the mainGroup
        contentGroup = mainGroup.append("g");
        
        // Add loading indicator
        const loadingGroup = contentGroup.append("g")
            .attr("class", "loading-indicator");
            
        loadingGroup.append("rect")
            .attr("x", -100)
            .attr("y", -10)
            .attr("width", 200)
            .attr("height", 20)
            .attr("rx", 5)
            .attr("fill", "#f0f0f0");
            
        const progressBar = loadingGroup.append("rect")
            .attr("x", -100)
            .attr("y", -10)
            .attr("width", 0)
            .attr("height", 20)
            .attr("rx", 5)
            .attr("fill", "#4299e1");
            
        loadingGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#2d3748")
            .attr("font-size", "12px")
            .text("Preparing visualization...");

        // Create SVG filters - only if not in all year view
        if (!isAllYearView) {
            visualizationFiltersComponent = new VisualizationFilters({
                target: document.createElement('div'),
                props: { contentGroup }
            });
            visualizationFiltersComponent.createFilters();
        }

        // Create connection lines group
        connectionLinesComponent = new ConnectionLines({
            target: document.createElement('div'),
            props: { contentGroup, sizeConfig }
        });
        const linesGroup = connectionLinesComponent.createLinesGroup();

        // Create stage circles
        stageCirclesComponent = new StageCircles({
            target: document.createElement('div'),
            props: { 
                contentGroup, 
                stageRadii, 
                stageLabelConfig, 
                isAllYearView,
                onStageHover,
                data,
                hideTooltip
            }
        });
        stageCirclesComponent.createStageCircles();

        // Create company labels group
        const companyLabelsGroup = contentGroup.append("g").attr("class", "company-labels");
        
        // Update progress
        loadingProgress = 10;
        progressBar.attr("width", 20);

        // Process data for visualization
        // For All Years view, use sampling to reduce the dataset size
        const processedData = isAllYearView 
            ? sampleDataForAllYearView(data, sizeConfig.maxCompaniesForAllYears, sizeConfig.maxDrugsPerCompany)
            : data;
            
        // Update progress
        loadingProgress = 20;
        progressBar.attr("width", 40);
        
        // Process the data
        console.time('processDataForLayout');
        const companies = processDataForLayout(processedData);
        console.timeEnd('processDataForLayout');
        
        // Update progress
        loadingProgress = 30;
        progressBar.attr("width", 60);
        
        console.time('calculateAngles');
        const companyAngles = calculateCompanyAngles(companies, ANGLE_BUFFER);
        const labelPlacements = calculateOptimalLabelPlacement(companies, companyAngles, labelConfig);
        console.timeEnd('calculateAngles');
        
        // Update progress
        loadingProgress = 40;
        progressBar.attr("width", 80);

        // If using progressive loading, render companies in batches
        if (sizeConfig.useProgressiveLoading && companies.length > sizeConfig.batchSize) {
            renderCompaniesProgressively(companies, companyAngles, labelPlacements, companyLabelsGroup, progressBar);
        } else {
            // Render all companies at once
            renderCompanies(companies, companyAngles, labelPlacements, companyLabelsGroup);
            
            // Update progress and finish
            loadingProgress = 100;
            progressBar.attr("width", 200);
            
            // Remove loading indicator after a short delay
            setTimeout(() => {
                loadingGroup.remove();
                isLoading = false;
            }, 500);
            
            // Set up keyboard navigation
            setupKeyboardNavigation();
        }
        
        // Add click handler to SVG background to clear selections
        contentGroup.on("click", (event) => {
            // Check if click was directly on the SVG background
            if (event.target === contentGroup.node()) {
                activeCompany = null;
                activeStage = null;
                connectionLinesComponent.resetConnectionHighlights();
                hideTooltip(); // Ensure tooltip is hidden when clicking on background
                onLeave();
            }
        });
        
        // Add event listeners to handle tooltip when mouse leaves SVG
        contentGroup.on("mouseleave", () => {
            connectionLinesComponent.resetConnectionHighlights();
            hideTooltip();
        });
        
        console.timeEnd('createVisualization');
    }
    
    /**
     * Renders companies progressively in batches to avoid blocking the UI
     */
    function renderCompaniesProgressively(
        companies: any[], 
        companyAngles: Map<string, any>, 
        labelPlacements: any[], 
        companyLabelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
        progressBar: d3.Selection<SVGRectElement, unknown, null, undefined>
    ) {
        const totalCompanies = companies.length;
        const batchSize = sizeConfig.batchSize;
        const batchDelay = sizeConfig.batchDelay;
        let currentIndex = 0;
        
        // Function to render a batch of companies
        function renderBatch() {
            const endIndex = Math.min(currentIndex + batchSize, totalCompanies);
            const batch = companies.slice(currentIndex, endIndex);
            
            // Render this batch
            batch.forEach((company, index) => {
                const globalIndex = currentIndex + index;
                renderCompany(company, globalIndex, companyAngles, labelPlacements, companyLabelsGroup);
            });
            
            // Update progress
            currentIndex = endIndex;
            const progress = Math.floor((currentIndex / totalCompanies) * 60) + 40; // 40-100% range
            loadingProgress = progress;
            progressBar.attr("width", progress * 2);
            
            // Continue with next batch or finish
            if (currentIndex < totalCompanies) {
                setTimeout(renderBatch, batchDelay);
            } else {
                // All companies rendered, finish up
                const loadingGroup = contentGroup.select(".loading-indicator");
                
                // Remove loading indicator after a short delay
                setTimeout(() => {
                    loadingGroup.remove();
                    isLoading = false;
                }, 500);
                
                // Set up keyboard navigation
                setupKeyboardNavigation();
            }
        }
        
        // Start rendering batches
        renderBatch();
    }
    
    /**
     * Renders all companies at once
     */
    function renderCompanies(
        companies: any[], 
        companyAngles: Map<string, any>, 
        labelPlacements: any[], 
        companyLabelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
    ) {
        companies.forEach((company, index) => {
            renderCompany(company, index, companyAngles, labelPlacements, companyLabelsGroup);
        });
    }
    
    /**
     * Renders a single company with its drugs
     */
    function renderCompany(
        company: any, 
        index: number, 
        companyAngles: Map<string, any>, 
        labelPlacements: any[], 
        companyLabelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
    ) {
        const angle = companyAngles.get(company.company);
        if (!angle) return;
        
        const companyGroup = contentGroup.append("g");

        // Calculate position for connecting lines (where the PRE stage is)
        const preStageRadius = stageRadii['PRE'];
        const nodeAngle = angle.center - Math.PI/2; // Adjust for SVG coordinates

        // Get the label placement from our calculated positions
        const labelPlacement = labelPlacements.find(lp => lp.company === company.company);
        
        // If we have a calculated placement, use it; otherwise calculate directly
        const labelX = labelPlacement ? labelPlacement.x : (radius * 1.05) * Math.cos(nodeAngle);
        const labelY = labelPlacement ? labelPlacement.y : (radius * 1.05) * Math.sin(nodeAngle);
        const isRightSide = labelPlacement ? labelPlacement.isRightSide : Math.cos(nodeAngle) > 0;
        const isCloserPosition = labelPlacement ? labelPlacement.isCloserPosition : false;

        // Create company label
        const companyLabelComponent = new CompanyLabel({
            target: document.createElement('div'),
            props: {
                company,
                labelX,
                labelY,
                nodeAngle,
                isRightSide,
                isCloserPosition,
                sizeConfig,
                showTooltip,
                hideTooltip,
                onCompanyHover,
                onShowCompanyDetail,
                highlightCompanyConnections: connectionLinesComponent.highlightCompanyConnections,
                resetConnectionHighlights: connectionLinesComponent.resetConnectionHighlights,
                setActiveCompany,
                parentGroup: companyLabelsGroup,
                focusableElements,
                index,
                activeCompany
            }
        });
        const result = companyLabelComponent.createCompanyLabel();
        const labelElement = result?.labelElement || null;

        // Find the company reference for drug nodes
        const companyRef = focusableElements.find(item => 
            item.element === labelElement && item.company === company.company
        );
        
        // Create drug nodes for each stage
        company.stages.forEach((drugs: any[], stage: string) => {
            if (drugs.length === 0) return;
            
            // Get the appropriate radius for this stage - calculate midpoint on the fly
            let stageRadius = stageRadii[stage as keyof typeof stageRadii];
            
            // Calculate midpoint radius for drug placement
            if (stage === 'PRE' && stageRadii['P1']) {
                stageRadius = (stageRadii['PRE'] + stageRadii['P1']) / 2;
            } else if (stage === 'P1' && stageRadii['P2']) {
                stageRadius = (stageRadii['P1'] + stageRadii['P2']) / 2;
            } else if (stage === 'P2' && stageRadii['P3']) {
                stageRadius = (stageRadii['P2'] + stageRadii['P3']) / 2;
            } else if (stage === 'P3' && stageRadii['FILED']) {
                stageRadius = (stageRadii['P3'] + stageRadii['FILED']) / 2;
            } else if (stage === 'FILED' && stageRadii['PRV']) {
                stageRadius = (stageRadii['FILED'] + stageRadii['PRV']) / 2;
            } else if (stage === 'PRV') {
                stageRadius = stageRadii['PRV'] * 0.6;
            }
            
            // Calculate the angular spacing for drugs
            const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);
            
            // Calculate the bracket point - a point closer to the drugs where connections branch
            // Position it at a distance that creates a visually pleasing connection
            const firstDrugAngle = angle.start + drugSpacing;
            const lastDrugAngle = angle.start + drugSpacing * drugs.length;
            const bracketAngle = (firstDrugAngle + lastDrugAngle) / 2;

            // Calculate the bracket radius - position it at 75% of the way from the stage radius to the label
            const distanceToLabel = labelConfig.minRadius - stageRadius;
            const bracketRadius = stageRadius + (distanceToLabel * 0.75);
            const bracketX = bracketRadius * Math.cos(bracketAngle - Math.PI/2);
            const bracketY = bracketRadius * Math.sin(bracketAngle - Math.PI/2);
            
            // Draw the main connection line from label to bracket point
            if (drugs.length > 1) {
                connectionLinesComponent.createMainConnection(
                    labelX, labelY, bracketX, bracketY, company.company
                );
            }
            
            // Create drug nodes with connections from the bracket point
            drugs.forEach((drug: any, i: number) => {
                const drugAngle = angle.start + drugSpacing * (i + 1);
                const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);

                // Create unique ID for drug
                const drugId = `${company.company}-${drug.Candidate}-${i}`.replace(/\s+/g, '-').toLowerCase();

                // Add connecting line - either from bracket point (if multiple drugs) or directly from label (if single drug)
                const startX = drugs.length > 1 ? bracketX : labelX;
                const startY = drugs.length > 1 ? bracketY : labelY;
                
                connectionLinesComponent.createDrugConnection(
                    startX, startY, drugX, drugY, company.company, drugId
                );

                // Create drug node
                const drugNodeComponent = new DrugNode({
                    target: document.createElement('div'),
                    props: {
                        drug,
                        x: drugX,
                        y: drugY,
                        drugId,
                        companyName: company.company,
                        sizeConfig,
                        showTooltip,
                        hideTooltip,
                        onShowDrugDetail,
                        highlightDrugConnections: connectionLinesComponent.highlightDrugConnections,
                        resetConnectionHighlights: connectionLinesComponent.resetConnectionHighlights,
                        parentGroup: companyGroup,
                        focusableElements,
                        companyRef
                    }
                });
                drugNodeComponent.createDrugNode();
            });
        });
    }
    
    /**
     * Sets up keyboard navigation
     */
    function setupKeyboardNavigation() {
        keyboardNavigationComponent = new KeyboardNavigation({
            target: document.createElement('div'),
            props: {
                focusableElements,
                contentGroup,
                data,
                setActiveCompany
            }
        });
        keyboardNavigationComponent.setupKeyboardNavigation();
    }
    
    /**
     * Sets the active company and updates visual state
     */
    function setActiveCompany(company: string, entries: any[]) {
        // Reset state
        activeCompany = company;
        activeStage = null;
        
        // Reset all visual elements
        // Reset all company label text styles
        d3.selectAll(".company-label text")
            .transition()
            .duration(sizeConfig.useAnimations ? 500 : 0)
            .attr("fill", "#4A5568")
            .attr("font-size", sizeConfig.labelFontSize)
            .attr("font-weight", sizeConfig.labelFontWeight);
        
        // Reset pipeline dots
        d3.selectAll(".pipeline-dots circle")
            .transition()
            .duration(sizeConfig.useAnimations ? 200 : 0)
            .attr("r", 0)
            .attr("opacity", 0.7);
        
        // Highlight active company if selected
        if (company) {
            const companyId = company.replace(/\s+/g, '-').toLowerCase();
            
            // Highlight company text label
            d3.select(`#company-label-${companyId} text`)
                .transition()
                .duration(sizeConfig.useAnimations ? 500 : 0)
                .attr("fill", "#2B6CB0")
                .attr("font-size", "10.25px")
                .attr("font-weight", "800");
            
            // Get company data to pass to callback
            const companyData = processDataForLayout(data).find(c => c.company === company);
            if (companyData) {
                const metrics: CompanyMetrics = {
                    entries: companyData.entries,
                    companyName: companyData.company,
                    totalDrugs: companyData.totalDrugs,
                    clinicalTrials: companyData.clinicalTrials,
                    vouchersAwarded: companyData.vouchersAwarded,
                    transactedVouchers: companyData.transactedVouchers || 0,
                    uniqueIndications: companyData.uniqueIndications.size,
                    uniqueAreas: companyData.uniqueAreas.size
                };
                
                // Call the callback to update the sidebar
                console.log("Updating sidebar with company data:", metrics);
                onCompanyHover(metrics);
            } else {
                console.log("Updating sidebar with company entries:", entries);
                onCompanyHover(entries);
            }
        }
    }
    
    /**
     * Sets the active stage and updates visual state
     */
    function setActiveStage(stage: string, entries: any[]) {
        // Reset state
        activeStage = stage;
        activeCompany = null;
        
        // Reset visual elements using the StageCircles component
        if (stageCirclesComponent) {
            stageCirclesComponent.highlightStage(stage);
        }
        
        // Call the callback to update the sidebar
        if (stage) {
            onStageHover(entries);
        }
    }

    // React to changes in mainGroup
    $: if (mainGroup && data.length > 0) {
        console.log("mainGroup or data changed, recreating visualization");
        createVisualization();
    }
</script>

<style>
    .chart-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
    }
    
    .fixed-tooltip {
        display: none;
    }
    
    .company-label {
        font-size: 12px;
        font-weight: 500;
        fill: #333;
        text-anchor: middle;
        pointer-events: none;
    }
    
    .stage-label {
        font-size: 10px;
        font-weight: 500;
        fill: #666;
        text-anchor: middle;
        pointer-events: none;
    }
    
    .drug-label {
        font-size: 9px;
        fill: #333;
        text-anchor: start;
        pointer-events: none;
    }
    
    .company-node {
        cursor: pointer;
    }
    
    .drug-node {
        cursor: pointer;
    }
</style>
    
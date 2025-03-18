<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import * as d3 from 'd3';

// Import optimized data processor
import { 
    hasPRVAward, 
    isPRVTerminatedOrLiquidated,
    getStage,
    getStageFullName,
    getSizeConfig,
    getLabelConfig,
    getStageRadii,
    truncateText,
    createRenderingBatches,
    generateSampledData
} from './utils/data-processing-utils';

// Import color definitions
import { 
    getTherapeuticAreaColor, 
    getStageColor
} from './utils/colorDefinitions';

// Import SVG utilities for star shapes
import { createStarShape, createStarPath } from './utils/svg-utils';

// Component props
export let data: any[] = [];
export let onCompanyHover: (data: any) => void = () => {};
export let onStageHover: (entries: any[]) => void = () => {};
export let onLeave: () => void = () => {};
export let onShowDrugDetail: (detail: any) => void = () => {};
export let onShowCompanyDetail: (detail: any) => void = () => {};
export let onShowTherapeuticAreaDetail: (detail: any) => void = () => {};
export let isAllYearView: boolean = false;
export let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
export let showTooltip: (event: MouseEvent | FocusEvent, data: any, isCompany?: boolean) => void;
export let hideTooltip: () => void;
export let hoveredTherapeuticArea: string = "";

// SVG and dimension configuration
const width = 1020;
const height = width;
const radius = Math.min(width, height) / 2 - 60;
const ANGLE_BUFFER = isAllYearView ? Math.PI / 32 : Math.PI / 64;

// Workers and processing state
let worker: Worker | null = null;
let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
let isInitialRender = true;
let isInitializing = true;
let processedAreas: any[] = [];
let selectedArea: string | null = null;
let renderProgress = { completed: 0, total: 0 };

// Rendering optimization flags
let shouldRenderFullDetail = !isAllYearView;
let elementsRendered = 0;
let renderingStartTime = 0;

// Performance budget - adjust these values based on your requirements
const PERFORMANCE_BUDGET_MS = 1000;
const MAX_ELEMENTS_RENDER = isAllYearView ? 1000 : 3000;

// Get configuration from utility functions
$: sizeConfig = getSizeConfig(isAllYearView);
$: labelConfig = getLabelConfig(radius, isAllYearView);
$: stageRadii = getStageRadii(radius);

// Connection highlight color
const highlightColor = "#2B6CB0";
const highlightWidth = isAllYearView ? 1.75 : 2.25;

// Active selection tracking
let activeArea: any = null;
let activeStage: any = null;

// Track focused elements for keyboard navigation
let focusableElements: { 
    element: Element, 
    type: string, 
    area?: string, 
    isSelected?: boolean, 
    drugNodes?: Array<{ element: Element, drug: any }>,
    index?: number
}[] = [];

// Track current focused element index for keyboard navigation
let currentFocusIndex = -1;

// Progress indicators for loading state
let loadingProgress = 0;
let processingProgress = 0;
let renderingProgress = 0;

// References for caching and optimization
let previousDataLength = 0;
let previousSvgSize = 0;

// Initialize data structures for area-based visualization
const maxLabelWidth = 85; // Maximum width for area labels

// Watch for therapeutic area hover changes and update highlighting
$: if (hoveredTherapeuticArea && mainGroup && contentGroup) {
    highlightTherapeuticArea(hoveredTherapeuticArea);
} else if (!hoveredTherapeuticArea && mainGroup && contentGroup) {
    resetTherapeuticAreaHighlight();
}

/**
 * Process data optimized for therapeutic areas
 * This groups data by therapeutic area instead of by company
 */
async function processDataForTherapeuticAreas(): Promise<any[]> {
    isInitializing = true;
    loadingProgress = 10;
    
    // If data hasn't changed and we already have processed results, use cached data
    if (data.length === previousDataLength && processedAreas.length > 0) {
        loadingProgress = 100;
        isInitializing = false;
        return processedAreas;
    }
    
    // Apply data sampling if needed based on performance budget
    let dataToProcess = data;
    if (data.length > MAX_ELEMENTS_RENDER) {
        console.log(`Data exceeds performance budget (${data.length} > ${MAX_ELEMENTS_RENDER}), sampling...`);
        dataToProcess = generateSampledData(data, MAX_ELEMENTS_RENDER, true);
    }
    
    loadingProgress = 20;
    
    // Process the data to group by therapeutic area
    const areasMap = new Map();
    
    dataToProcess.forEach(entry => {
        loadingProgress = 20 + Math.ceil((dataToProcess.indexOf(entry) / dataToProcess.length) * 30);
        
        const stage = getStage(entry);
        const area = entry.TherapeuticArea1;
        
        if (!area) return; // Skip entries without therapeutic area
        
        if (!areasMap.has(area)) {
            areasMap.set(area, {
                area,
                stages: new Map(),
                totalDrugs: 0,
                entries: [],
                uniqueCompanies: new Set(),
                uniqueCandidates: new Set(),
                clinicalTrials: 0,
                vouchersAwarded: 0,
                transactedVouchers: 0,
                indications: new Set()
            });
        }
        
        const areaData = areasMap.get(area);
        if (!areaData.stages.has(stage)) {
            areaData.stages.set(stage, []);
        }
        
        areaData.stages.get(stage).push(entry);
        areaData.entries.push(entry);
        areaData.totalDrugs++;
        
        // Track unique companies and candidates
        if (entry.Company) {
            areaData.uniqueCompanies.add(entry.Company);
        }
        if (entry.Candidate) {
            areaData.uniqueCandidates.add(entry.Candidate);
        }
        if (entry.Indication) {
            areaData.indications.add(entry.Indication);
        }
        
        // Count clinical trials (Phase 1-3)
        const clinicalStages = ["P1", "P1/2", "P2", "P3"];
        if (clinicalStages.includes(stage)) {
            areaData.clinicalTrials++;
        }
        
        // Count vouchers awarded
        if (hasPRVAward(entry)) {
            areaData.vouchersAwarded++;
        }
        
        // Count transacted vouchers
        if (entry["Purchase Year"]) {
            areaData.transactedVouchers++;
        }
    });
    
    loadingProgress = 90;
    
    // Convert to array sorted by total drugs (descending)
    const result = Array.from(areasMap.values())
        .sort((a, b) => b.totalDrugs - a.totalDrugs);
    
    loadingProgress = 100;
    isInitializing = false;
    previousDataLength = data.length;
    
    return result;
}

/**
 * Calculate angles for areas based on their proportion of total drugs
 */
function calculateAreaAngles(areas: any[]) {
    const totalDrugs = areas.reduce((sum, area) => sum + area.totalDrugs, 0);
    let currentAngle = 0;
    const angles = new Map();

    areas.forEach(area => {
        const proportion = area.totalDrugs / totalDrugs;
        const angle = proportion * (2 * Math.PI - (areas.length * ANGLE_BUFFER));
        angles.set(area.area, {
            start: currentAngle,
            end: currentAngle + angle,
            center: currentAngle + angle/2
        });
        currentAngle += angle + ANGLE_BUFFER;
    });

    return angles;
}

/**
 * Calculate optimal label placement for areas to avoid overlaps
 */
function calculateOptimalLabelPlacement(areas: any[], areaAngles: Map<string, any>) {
    const labels: any[] = [];
    const labelHeight = labelConfig.textHeight;
    const minDistanceBetweenLabels = labelHeight * 2.5;
    
    // Use quadtree for efficient collision detection if d3 is available
    let quadtree;
    if (d3 && d3.quadtree) {
        quadtree = d3.quadtree()
            .x(d => d.x)
            .y(d => d.y)
            .extent([[-labelConfig.maxRadius, -labelConfig.maxRadius], [labelConfig.maxRadius, labelConfig.maxRadius]]);
    }

    areas.forEach((area, index) => {
        const angle = areaAngles.get(area.area);
        if (!angle) return;
        
        const centerAngle = angle.center - Math.PI/2;
        const isRightSide = Math.cos(centerAngle) > 0;
        
        // Alternate placement for better distribution
        const shouldPositionCloser = index % 2 === 0;
        let baseRadius = shouldPositionCloser ? labelConfig.minRadius : labelConfig.alternateRadius;
        
        let currentRadius = baseRadius;
        let overlap = true;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (overlap && attempts < maxAttempts) {
            const x = currentRadius * Math.cos(centerAngle);
            const y = currentRadius * Math.sin(centerAngle);
            
            // Check for overlaps using quadtree if available (more efficient)
            if (quadtree) {
                overlap = false;
                quadtree.visit((node, x1, y1, x2, y2) => {
                    if (node.data) {
                        const dx = x - node.data.x;
                        const dy = y - node.data.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < minDistanceBetweenLabels) {
                            overlap = true;
                            return true; // Stop traversing
                        }
                    }
                    // Continue traversing if node's bounding box could contain points within minDistance
                    return x1 > x + minDistanceBetweenLabels || 
                            x2 < x - minDistanceBetweenLabels || 
                            y1 > y + minDistanceBetweenLabels || 
                            y2 < y - minDistanceBetweenLabels;
                });
            } else {
                // Fallback to linear search if quadtree isn't available
                overlap = labels.some(label => {
                    const dx = x - label.x;
                    const dy = y - label.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < minDistanceBetweenLabels;
                });
            }
            
            if (!overlap) {
                const labelData = {
                    area: area.area,
                    x,
                    y,
                    angle: centerAngle,
                    isRightSide,
                    isCloserPosition: shouldPositionCloser
                };
                
                labels.push(labelData);
                
                // Add to quadtree if available
                if (quadtree) {
                    quadtree.add(labelData);
                }
                
                break;
            }
            
            currentRadius += labelConfig.padding;
            attempts++;
        }
        
        // If we couldn't find a non-overlapping position, add it anyway at the maximum radius
        if (overlap) {
            const x = labelConfig.maxRadius * Math.cos(centerAngle);
            const y = labelConfig.maxRadius * Math.sin(centerAngle);
            
            const labelData = {
                area: area.area,
                x,
                y,
                angle: centerAngle,
                isRightSide,
                isCloserPosition: shouldPositionCloser
            };
            
            labels.push(labelData);
            
            // Add to quadtree if available
            if (quadtree) {
                quadtree.add(labelData);
            }
        }
    });

    return labels;
}

/**
 * Main visualization creation function with progressive rendering
 */
async function createVisualization() {
    isInitialRender = true;
    renderingStartTime = performance.now();
    
    if (!mainGroup) {
        console.error("mainGroup is not available");
        return;
    }

    // Clear any existing elements
    focusableElements = [];
    mainGroup.selectAll("*").remove();
    
    // Process data efficiently
    processedAreas = await processDataForTherapeuticAreas();

    // Add a background rect to capture events
    mainGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", -width/2)
        .attr("y", -height/2)
        .attr("fill", "transparent")
        .attr("class", "background-rect");

    // Center the visualization
    contentGroup = mainGroup.append("g");
    
    // Create visual effects
    if (shouldRenderFullDetail) {
        createVisualEffects();
    }
    
    // Create stage circles
    createStageCircles();
    
    // Calculate angles and label positions
    const areaAngles = calculateAreaAngles(processedAreas);
    const labelPlacements = calculateOptimalLabelPlacement(processedAreas, areaAngles);
    
    // Create groups for different layers
    const linesGroup = contentGroup.append("g").attr("class", "connecting-lines");
    const areaLabelsGroup = contentGroup.append("g").attr("class", "area-labels");
    
    // Track rendering progress
    renderProgress = { completed: 0, total: processedAreas.length };
    
    // Create a function to render areas in batches
    const renderAreas = createRenderingBatches(
        processedAreas,
        (area, index) => {
            renderArea(area, index, areaAngles, labelPlacements, linesGroup, areaLabelsGroup);
        },
        isAllYearView ? 25 : 10, // Smaller batches in all-year view
        (completed, total) => {
            renderProgress.completed = completed;
            renderProgress.total = total;
            renderingProgress = Math.round((completed / total) * 100);
        }
    );
    
    // Execute rendering in batches
    await renderAreas();
    
    // Add click handler to SVG background to clear selections
    contentGroup.on("click", (event) => {
        // Check if click was directly on the SVG background
        if (event.target === contentGroup.node()) {
            activeArea = null;
            activeStage = null;
            resetConnectionHighlights();
            hideTooltip();
            onLeave();
        }
    });
    
    // Add keyboard handler for SVG container
    contentGroup.attr("tabindex", "0")
        .attr("role", "application")
        .attr("aria-label", "Therapeutic area visualization")
        .on("keydown", handleKeyboardNavigation);
    
    // Add event listener to handle tooltip when mouse leaves SVG
    contentGroup.on("mouseleave", () => {
        resetConnectionHighlights();
        hideTooltip();
    });
    
    isInitialRender = false;
    
    // Log performance statistics
    const renderTime = performance.now() - renderingStartTime;
    console.log(`Render complete in ${renderTime.toFixed(2)}ms - ${elementsRendered} elements rendered`);
    
    // Adjust detail level if rendering was too slow
    if (renderTime > PERFORMANCE_BUDGET_MS && shouldRenderFullDetail) {
        console.log(`Rendering took longer than budget (${renderTime.toFixed(2)}ms > ${PERFORMANCE_BUDGET_MS}ms)`);
        shouldRenderFullDetail = false;
    }
}

/**
 * Creates visual effects (filters) for the visualization
 */
function createVisualEffects() {
    // Create filters for visual effects
    const defs = contentGroup.append("defs");
}
    
function createStageCircles() {
    const stagesGroup = contentGroup.append("g").attr("class", "stage-circles");
    
    Object.entries(stageRadii).forEach(([stage, radius]) => {
        // Get stage color
        const stageFullName = getStageFullName(stage);
        const stageColor = getStageColor(stageFullName);
        
        // Create stage circle
        stagesGroup.append("circle")
            .attr("r", radius)
            .attr("fill", "none")
            .attr("stroke", stageColor.stroke)
            .attr("stroke-width", 1.425)
            .attr("stroke-dasharray", "1,5")
            .attr("stroke-opacity", 1);

        // Create stage label
        const labelAngle = -Math.PI / 15;
        const labelX = radius * Math.cos(labelAngle) - 15;
        const labelY = radius * Math.sin(labelAngle) + 25;

        const labelGroup = stagesGroup.append("g")
            .attr("transform", `translate(${labelX},${labelY})`)
            .attr("class", "stage-label")
            .attr("id", `stage-label-${stage}`)
            .attr("cursor", "pointer");

        // Calculate text width for background
        const tempText = labelGroup.append("text")
            .attr("opacity", 0)
            .text(stage);
        const textWidth = tempText.node()?.getBBox().width ?? 0;
        tempText.remove();

        // Create label background
        labelGroup.append("rect")
            .attr("x", -10)
            .attr("y", -5)
            .attr("width", textWidth + 20)
            .attr("height", 10)
            .attr("rx", 10)
            .attr("fill", '#F8FAFC')
            .attr("opacity", 1);

        // Create label text
        labelGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .attr("fill", stageColor.stroke)
            .attr("font-size", isAllYearView ? "8px" : "11.25px")
            .attr("font-weight", "400")
            .text(stage);
            
        // Add click handler for stage label
        labelGroup.on("click", (event) => {
            event.stopPropagation();
            hideTooltip();
            
            const stageEntries = data.filter(entry => getStage(entry) === stage);
            setActiveStage(stage, stageEntries);
        });
    });
}

/**
 * Render an area with its drugs and connections
 */
function renderArea(
    area: any,
    index: number,
    areaAngles: Map<string, any>,
    labelPlacements: any[],
    linesGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    areaLabelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>
) {
    elementsRendered++;
    const angle = areaAngles.get(area.area);
    if (!angle) return;
    
    const areaGroup = contentGroup.append("g");

    // Create sanitized ID for the area
    const areaId = area.area.replace(/\s+/g, '-').toLowerCase();

    // Find label placement
    const labelPlacement = labelPlacements.find(lp => lp.area === area.area);
    if (!labelPlacement) return;
    
    const labelX = labelPlacement.x;
    const labelY = labelPlacement.y;

    // Get therapeutic area color
    const areaColors = getTherapeuticAreaColor(area.area);

    // Create area node and label
    const nodeGroup = areaLabelsGroup.append("g")
        .attr("transform", `translate(${labelX},${labelY})`)
        .attr("cursor", "pointer")
        .attr("class", "area-label")
        .attr("id", `area-label-${areaId}`)
        .attr("tabindex", "0")
        .attr("role", "button")
        .attr("aria-label", `Therapeutic area ${area.area} with ${area.totalDrugs} drugs, ${area.uniqueCompanies.size} companies`);

    // Make element focusable
    const labelElement = nodeGroup.node();
    if (labelElement) {
        labelElement.setAttribute("focusable", "true");
        focusableElements.push({
            element: labelElement,
            type: 'area',
            area: area.area,
            isSelected: false,
            index: index,
            drugNodes: []
        });
    }

    // Create the label with text and optional counts
    createAreaLabel(nodeGroup, area, labelPlacement, areaColors);

    // Render drugs for each stage
    if (area.stages && area.stages instanceof Map) {
        // For Map objects, iterate with forEach
        area.stages.forEach((drugs: any[], stage: string) => {
            if (!drugs || drugs.length === 0) return;
            
            // Get stage radius
            const stageRadius = stageRadii[stage as keyof typeof stageRadii] || 0;
            if (stageRadius === 0) return;
            
            // Calculate drug spacing
            const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);
            
            // Calculate bracket point for connections with multiple drugs
            const firstDrugAngle = angle.start + drugSpacing;
            const lastDrugAngle = angle.start + drugSpacing * drugs.length;
            const bracketAngle = (firstDrugAngle + lastDrugAngle) / 2;
            const distanceToLabel = labelConfig.minRadius - stageRadius;
            const bracketRadius = stageRadius + (distanceToLabel * 0.75);
            const bracketX = bracketRadius * Math.cos(bracketAngle - Math.PI/2);
            const bracketY = bracketRadius * Math.sin(bracketAngle - Math.PI/2);
            
            // Draw main connection line for multiple drugs
            if (drugs.length > 1) {
                linesGroup.append("path")
                    .attr("class", "main-connection")
                    .attr("data-area", area.area)
                    .attr("d", `M${labelX},${labelY}L${bracketX},${bracketY}`)
                    .attr("stroke", "#37587e")
                    .attr("stroke-width", sizeConfig.connectionStrokeWidth * 1)
                    .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2)
                    .attr("stroke-dasharray", "none")
                    .attr("fill", "none");
            }
            
            // Render individual drugs with connections
            drugs.forEach((drug: any, i: number) => {
                // Calculate drug position
                const drugAngle = angle.start + drugSpacing * (i + 1);
                const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
                const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);

                // Create unique ID for drug
                const drugId = `${area.area}-${drug.Candidate}-${i}`.replace(/\s+/g, '-').toLowerCase();

                // Add connecting line - either from bracket point (multiple drugs) or directly from label (single drug)
                const startX = drugs.length > 1 ? bracketX : labelX;
                const startY = drugs.length > 1 ? bracketY : labelY;
                
                linesGroup.append("path")
                    .attr("class", "drug-path")
                    .attr("data-area", area.area)
                    .attr("data-drug", drugId)
                    .attr("d", `M${startX},${startY}L${drugX},${drugY}`)
                    .attr("stroke", "#37587e")
                    .attr("stroke-width", sizeConfig.connectionStrokeWidth)
                    .attr("stroke-opacity", sizeConfig.connectionOpacity)
                    .attr("stroke-dasharray", "none")
                    .attr("fill", "none");

                // Create drug node group
                const drugGroup = areaGroup.append("g")
                    .attr("transform", `translate(${drugX},${drugY})`)
                    .attr("cursor", "pointer")
                    .attr("class", "drug-node")
                    .attr("id", drugId)
                    .attr("tabindex", "-1") // Initially not focusable until area is selected
                    .attr("role", "button")
                    .attr("aria-label", `Drug ${drug.Candidate} from ${drug.Company || 'unknown company'}, ${getStageFullName(stage)}`);

                // Ensure the SVG element can receive focus
                const drugElement = drugGroup.node();
                if (drugElement && labelElement) {
                    drugElement.setAttribute("focusable", "true");
                    
                    // Store drug node reference
                    const areaRef = focusableElements.find(item => item.element === labelElement);
                    if (areaRef && areaRef.drugNodes) {
                        areaRef.drugNodes.push({
                            element: drugElement,
                            drug: drug
                        });
                    }
                }

                // Determine visual effects based on drug status
                let filterUrl = ""; // Remove dropshadow effects completely

                // Determine stroke color - use standard color
                const strokeColor = areaColors.stroke;
                
                // Check if PRV is terminated or liquidated
                const isTerminatedOrLiquidated = isPRVTerminatedOrLiquidated(drug);
                
                // Use greyed out colors for terminated or liquidated PRVs
                const fillColor = isTerminatedOrLiquidated ? "#CCCCCC" : areaColors.fill;
                const finalStrokeColor = isTerminatedOrLiquidated ? "#999999" : strokeColor;
                const opacity = isTerminatedOrLiquidated ? 0.7 : 1;

                // Draw drug node using star shape instead of circle
                const star = createStarShape(
                    drugGroup,
                    sizeConfig.drugNodeRadius,
                    fillColor,
                    finalStrokeColor,
                    sizeConfig.drugNodeStrokeWidth,
                    opacity
                );
                
                // Store initial opacity for reference in interactions
                star.attr("data-initial-opacity", opacity);

                // Add PRV indicator if needed and rendering full details
                if (shouldRenderFullDetail && hasPRVAward(drug)) {
                    // Add a small outer ring to indicate PRV
                    drugGroup.append("path")
                        .attr("d", createStarPath(sizeConfig.drugNodeRadius * 1.3)) // 30% larger path
                        .attr("fill", "none")
                        .attr("stroke", finalStrokeColor)
                        .attr("stroke-width", 1)
                        .attr("stroke-dasharray", "2,2")
                        .attr("opacity", 0.8);
                }

                // Add keyboard event handler
                drugGroup.on("keydown", (event: KeyboardEvent) => {
                    handleDrugKeydown(event, drug, area.area, drugId);
                });

                // Add focus/blur handlers
                drugGroup.on("focus", (event: FocusEvent) => {
                    handleDrugFocus(event, drug, drugGroup, drugId);
                });
                
                drugGroup.on("blur", () => {
                    handleDrugBlur(drug, drugGroup, strokeColor, filterUrl);
                });
                
                // Add mouse event handlers
                drugGroup
                    .on("mouseenter", (event: MouseEvent) => {
                        handleDrugMouseEnter(event, drug, drugGroup, drugId);
                    })
                    .on("mousemove", (event: MouseEvent) => {
                        showTooltip(event, drug);
                    })
                    .on("mouseleave", () => {
                        handleDrugMouseLeave(drug, drugGroup, strokeColor, filterUrl);
                    })
                    .on("click", (event: MouseEvent) => {
                        handleDrugClick(event, drug);
                    });
            });
        });
    }

    // Add keyboard event handler for the area label
    nodeGroup.on("keydown", (event: KeyboardEvent) => {
        handleAreaKeydown(event, area, labelElement);
    });

    // Add focus/blur handlers
    nodeGroup.on("focus", (event: FocusEvent) => {
        handleAreaFocus(event, area, nodeGroup);
    });
    
    nodeGroup.on("blur", () => {
        handleAreaBlur(area, nodeGroup);
    });

    // Add mouse handlers
    nodeGroup
        .on("mouseenter", (event: MouseEvent) => {
            handleAreaMouseEnter(event, area, nodeGroup);
        })
        .on("mousemove", (event: MouseEvent) => {
            showTooltip(event, 
                { 
                    area: area.area, 
                    totalDrugs: area.totalDrugs,
                    companies: area.uniqueCompanies.size
                }, 
                true
            );
        })
        .on("mouseleave", () => {
            handleAreaMouseLeave(area, nodeGroup);
        })
        .on("click", (event: MouseEvent) => {
            handleAreaClick(event, area, labelElement);
        });
}

/**
 * Create area label with text aligned to angle
 */
function createAreaLabel(
    group: d3.Selection<any, unknown, null, undefined>,
    area: any,
    labelPlacement: any,
    areaColors: any
) {
    // Determine if label is on right or left side
    const isRightSide = labelPlacement.isRightSide;
    
    // Create a rotated group to align with connecting line
    const labelGroup = group.append("g")
        .attr("class", "area-label-text");
        
    // Calculate rotation angle to align with connecting line
    // Convert radians to degrees and adjust for text orientation
    const rotationAngle = (labelPlacement.angle * 180 / Math.PI) + (isRightSide ? 0 : 180);
    
    // Apply rotation transform
    labelGroup.attr("transform", `rotate(${rotationAngle})`);
    
    // Determine text anchor and offset based on side
    const textAnchor = isRightSide ? "start" : "end";
    const xOffset = isRightSide ? 10 : -10;
    
    // Create text element with area name and counter-rotate to keep text horizontal
    const textElement = labelGroup.append("text")
        .attr("text-anchor", textAnchor)
        .attr("dx", xOffset)
        .attr("dy", "0.35em")
        // Counter-rotate to keep text horizontal
        .attr("transform", `rotate(${-rotationAngle})`)
        .text(truncateText(area.area, maxLabelWidth))
        .attr("fill", "#4A5568")
        .attr("font-size", sizeConfig.labelFontSize)
        .attr("font-weight", sizeConfig.labelFontWeight);
    
    // Create dots group with counter-rotation if showing detail
    if (shouldRenderFullDetail) {
        const dotsGroup = labelGroup.append("g")
            .attr("class", "area-drugs")
            .attr("transform", `rotate(${-rotationAngle}) translate(${xOffset}, ${labelConfig.textHeight})`);
        
        const numDots = Math.min(area.totalDrugs, 20); // Limit dots for visual clarity
        const dotsPerRow = Math.min(10, numDots);
        
        for (let i = 0; i < numDots; i++) {
            const row = Math.floor(i / dotsPerRow);
            const col = i % dotsPerRow;
            const x = textAnchor === "start" ? col * 6 : -(col * 6);
            
            dotsGroup.append("circle")
                .attr("r", 0) // Start at 0 for animation
                .attr("cx", x + (textAnchor === "start" ? 3 : -3))
                .attr("cy", row * 5)
                .attr("fill", areaColors.fill)
                .attr("stroke", areaColors.stroke)
                .attr("stroke-width", 0.5)
                .attr("opacity", 0.8);
        }
    }
    
    return labelGroup;
}

/**
 * Event Handlers for Drug Interactions
 */
function handleDrugKeydown(event: KeyboardEvent, drug: any, areaName: string, drugId: string) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        openDrugDetailDrawer(drug);
    } else if (event.key === "Escape") {
        // Return focus to area label
        event.preventDefault();
        const areaRef = focusableElements.find(item => item.area === areaName);
        if (areaRef) {
            (areaRef.element as HTMLElement).focus();
        }
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        // Navigate to next drug in the same area
        event.preventDefault();
        navigateToNextDrug(areaName, drugId);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        // Navigate to previous drug in the same area
        event.preventDefault();
        navigateToPreviousDrug(areaName, drugId);
    }
}

function handleDrugFocus(event: FocusEvent, drug: any, drugGroup: d3.Selection<any, unknown, null, undefined>, drugId: string) {
    // Highlight this drug node visually and in keyboard navigation
    const star = drugGroup.select("path");
    
    // Force full opacity on focus
    star.attr("opacity", 1);
    
    // Scale the star to highlight it
    star.transition()
        .duration(sizeConfig.transitionDuration)
        .attr("transform", `scale(${sizeConfig.highlightedNodeRadius / sizeConfig.drugNodeRadius})`)
        .attr("stroke", highlightColor);
    
    // Highlight related connections
    highlightDrugConnections(drugId);
    
    // Show tooltip
    showTooltip(event as unknown as MouseEvent, drug);
    
    // Track currently focused element for keyboard navigation
    const areaRef = focusableElements.find(item => item.element === drugGroup.node());
    if (areaRef) {
        areaRef.isSelected = true;
    }
}

function handleDrugBlur(drug: any, drugGroup: d3.Selection<any, unknown, null, undefined>, strokeColor: string, filterUrl: string) {
    // Reset drug appearance
    const star = drugGroup.select("path");
    
    // Get the initial opacity from the data attribute
    const initialOpacity = star.attr("data-initial-opacity") || "1";
    
    // Reset opacity first
    star.attr("opacity", initialOpacity);
    
    // Reset scale and other properties
    star.transition()
        .duration(sizeConfig.transitionDuration)
        .attr("transform", "scale(1)")
        .attr("stroke", strokeColor)
        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth);
    
    // Reset connections
    resetConnectionHighlights();
    
    // Hide tooltip
    hideTooltip();
}

function handleDrugMouseEnter(event: MouseEvent, drug: any, drugGroup: d3.Selection<any, unknown, null, undefined>, drugId: string) {
    // Highlight the drug node
    const star = drugGroup.select("path");
    
    // Force full opacity on hover
    star.attr("opacity", 1);
    
    // Scale the star to highlight it
    star.transition()
        .duration(sizeConfig.transitionDuration)
        .attr("transform", `scale(${sizeConfig.highlightedNodeRadius / sizeConfig.drugNodeRadius})`)
        .attr("stroke", highlightColor);
    
    // Highlight connections
    highlightDrugConnections(drugId);
    
    // Show tooltip
    showTooltip(event, drug);
}

function handleDrugMouseLeave(drug: any, drugGroup: d3.Selection<any, unknown, null, undefined>, strokeColor: string, filterUrl: string) {
    // Reset drug appearance
    const star = drugGroup.select("path");
    
    // Get the initial opacity from the data attribute
    const initialOpacity = star.attr("data-initial-opacity") || "1";
    
    // Reset opacity first
    star.attr("opacity", initialOpacity);
    
    // Reset scale and other properties
    star.transition()
        .duration(sizeConfig.transitionDuration)
        .attr("transform", "scale(1)")
        .attr("stroke", strokeColor)
        .attr("stroke-width", sizeConfig.drugNodeStrokeWidth);
    
    // Reset connections
    resetConnectionHighlights();
    
    // Hide tooltip
    hideTooltip();
}

function handleDrugClick(event: MouseEvent, drug: any) {
    event.stopPropagation();
    hideTooltip();
    openDrugDetailDrawer(drug);
}

/**
 * Event Handlers for Area Interactions
 */
function handleAreaKeydown(event: KeyboardEvent, area: any, labelElement: Element | null) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        
        // Toggle selection state
        const areaRef = focusableElements.find(item => item.element === labelElement);
        if (areaRef) {
            areaRef.isSelected = !areaRef.isSelected;
            
            // Make drug nodes focusable when area is selected
            if (areaRef.drugNodes) {
                areaRef.drugNodes.forEach(drugRef => {
                    const drugTabIndex = areaRef.isSelected ? "0" : "-1";
                    drugRef.element.setAttribute("tabindex", drugTabIndex);
                    drugRef.element.setAttribute("focusable", "true");
                });
                
                // Focus first drug if selected
                if (areaRef.isSelected && areaRef.drugNodes.length > 0) {
                    setTimeout(() => {
                        (areaRef.drugNodes[0].element as HTMLElement).focus();
                    }, 50);
                }
            }
        }
        
        // Set active area and open detail drawer
        setActiveArea(area.area, area);
        openAreaDetailDrawer(area);
    } else if (event.key === "Tab" && !event.shiftKey) {
        // Tab to first drug node if selected
        const areaRef = focusableElements.find(item => item.element === labelElement);
        if (areaRef && areaRef.isSelected && areaRef.drugNodes && areaRef.drugNodes.length > 0) {
            event.preventDefault();
            (areaRef.drugNodes[0].element as HTMLElement).focus();
        }
    }
}

function handleAreaFocus(event: FocusEvent, area: any, nodeGroup: d3.Selection<any, unknown, null, undefined>) {
    // Highlight connections
    highlightAreaConnections(area.area);
    
    // Enhance node appearance
    nodeGroup.select(".area-node")
        .transition()
        .duration(sizeConfig.transitionDuration)
        .attr("width", 10.25)
        .attr("height", 10.25);
    
    // Show tooltip
    showTooltip(event, {
        area: area.area,
        totalDrugs: area.totalDrugs,
        companies: area.uniqueCompanies.size
    }, true);
    
    // Update sidebar data
    setActiveArea(area.area, area);
}

function handleAreaBlur(area: any, nodeGroup: d3.Selection<any, unknown, null, undefined>) {
    // Reset only if not the active area
    if (activeArea !== area.area) {
        // Reset node appearance
        nodeGroup.select(".area-node")
            .transition()
            .duration(sizeConfig.transitionDuration)
            .attr("width", sizeConfig.companyNodeWidth)
            .attr("height", sizeConfig.companyNodeHeight);
        
        // Reset connections
        resetConnectionHighlights();
    }
    
    // Hide tooltip
    hideTooltip();
}

function handleAreaMouseEnter(event: MouseEvent, area: any, nodeGroup: d3.Selection<any, unknown, null, undefined>) {
    // Highlight connections
    highlightAreaConnections(area.area);
    
    // Enhance node appearance
    nodeGroup.select(".area-node")
        .transition()
        .duration(sizeConfig.transitionDuration)
        .attr("width", 10.25)
        .attr("height", 10.25);
    
    // Show tooltip
    showTooltip(event, {
        area: area.area,
        totalDrugs: area.totalDrugs,
        companies: area.uniqueCompanies.size
    }, true);
    
    // Update sidebar data
    onCompanyHover({
        entries: area.entries,
        areaName: area.area,
        totalDrugs: area.totalDrugs,
        uniqueCompanies: area.uniqueCompanies.size,
        uniqueCandidates: area.uniqueCandidates.size
    });
}

function handleAreaMouseLeave(area: any, nodeGroup: d3.Selection<any, unknown, null, undefined>) {
    // Reset only if not the active area
    if (activeArea !== area.area) {
        // Reset node appearance
        nodeGroup.select(".area-node")
            .transition()
            .duration(sizeConfig.transitionDuration)
            .attr("width", sizeConfig.companyNodeWidth)
            .attr("height", sizeConfig.companyNodeHeight);
        
        // Reset connections
        resetConnectionHighlights();
    }
    
    // Hide tooltip
    hideTooltip();
}

function handleAreaClick(event: MouseEvent, area: any, labelElement: Element | null) {
    event.stopPropagation();
    hideTooltip();
    
    // Toggle selection state for keyboard navigation
    const areaRef = focusableElements.find(item => item.element === labelElement);
    if (areaRef) {
        areaRef.isSelected = !areaRef.isSelected;
        
        // Make drug nodes focusable when area is selected
        if (areaRef.drugNodes) {
            areaRef.drugNodes.forEach(drugRef => {
                const drugTabIndex = areaRef.isSelected ? "0" : "-1";
                drugRef.element.setAttribute("tabindex", drugTabIndex);
                drugRef.element.setAttribute("focusable", "true");
            });
        }
    }
    
    // Set active area and open detail drawer
    setActiveArea(area.area, area);
    openAreaDetailDrawer(area);
}

/**
 * Navigation Functions
 */
function handleKeyboardNavigation(event: KeyboardEvent) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        navigateToNextArea();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        navigateToPreviousArea();
    } else if (event.key === "Home") {
        event.preventDefault();
        navigateToFirstArea();
    } else if (event.key === "End") {
        event.preventDefault();
        navigateToLastArea();
    }
}

function navigateToNextArea() {
    const areaElements = focusableElements.filter(el => el.type === 'area');
    if (areaElements.length === 0) return;
    
    let currentIndex = areaElements.findIndex(el => 
        document.activeElement === el.element
    );
    
    currentIndex = (currentIndex < 0) ? 0 : (currentIndex + 1) % areaElements.length;
    
    (areaElements[currentIndex].element as HTMLElement).focus();
    currentFocusIndex = focusableElements.indexOf(areaElements[currentIndex]);
}

function navigateToPreviousArea() {
    const areaElements = focusableElements.filter(el => el.type === 'area');
    if (areaElements.length === 0) return;
    
    let currentIndex = areaElements.findIndex(el => 
        document.activeElement === el.element
    );
    
    currentIndex = (currentIndex < 0) ? 
        areaElements.length - 1 : 
        (currentIndex - 1 + areaElements.length) % areaElements.length;
    
    (areaElements[currentIndex].element as HTMLElement).focus();
    currentFocusIndex = focusableElements.indexOf(areaElements[currentIndex]);
}

function navigateToFirstArea() {
    const areaElements = focusableElements.filter(el => el.type === 'area');
    if (areaElements.length === 0) return;
    
    (areaElements[0].element as HTMLElement).focus();
    currentFocusIndex = focusableElements.indexOf(areaElements[0]);
}

function navigateToLastArea() {
    const areaElements = focusableElements.filter(el => el.type === 'area');
    if (areaElements.length === 0) return;
    
    const lastIndex = areaElements.length - 1;
    (areaElements[lastIndex].element as HTMLElement).focus();
    currentFocusIndex = focusableElements.indexOf(areaElements[lastIndex]);
}

function navigateToNextDrug(areaName: string, currentDrugId: string) {
    const areaRef = focusableElements.find(item => 
        item.type === 'area' && item.area === areaName
    );
    
    if (!areaRef || !areaRef.drugNodes || areaRef.drugNodes.length === 0) return;
    
    const currentIndex = areaRef.drugNodes.findIndex(drugRef => 
        drugRef.element.id === currentDrugId
    );
    
    if (currentIndex < 0) return;
    
    const nextIndex = (currentIndex + 1) % areaRef.drugNodes.length;
    (areaRef.drugNodes[nextIndex].element as HTMLElement).focus();
}

function navigateToPreviousDrug(areaName: string, currentDrugId: string) {
    const areaRef = focusableElements.find(item => 
        item.type === 'area' && item.area === areaName
    );
    
    if (!areaRef || !areaRef.drugNodes || areaRef.drugNodes.length === 0) return;
    
    const currentIndex = areaRef.drugNodes.findIndex(drugRef => 
        drugRef.element.id === currentDrugId
    );
    
    if (currentIndex < 0) return;
    
    const prevIndex = (currentIndex - 1 + areaRef.drugNodes.length) % areaRef.drugNodes.length;
    (areaRef.drugNodes[prevIndex].element as HTMLElement).focus();
}

/**
 * Connection Highlight Functions
 */
function highlightAreaConnections(areaName: string) {
    resetConnectionHighlights();
    
    d3.selectAll(`path.main-connection[data-area="${areaName}"], path.drug-path[data-area="${areaName}"]`)
        .transition()
        .duration(300)
        .attr("stroke", highlightColor)
        .attr("stroke-width", highlightWidth)
        .attr("stroke-opacity", 1);
}

function highlightDrugConnections(drugId: string) {
    resetConnectionHighlights();
    
    const drugPath = d3.select(`path.drug-path[data-drug="${drugId}"]`);
    if (!drugPath.empty()) {
        drugPath
            .transition()
            .duration(300)
            .attr("stroke", highlightColor)
            .attr("stroke-width", highlightWidth)
            .attr("stroke-opacity", 1);
        
        const areaName = drugPath.attr("data-area");
        if (areaName) {
            const drugPaths = d3.selectAll(`path.drug-path[data-area="${areaName}"]`);
            if (drugPaths.size() > 1) {
                d3.selectAll(`path.main-connection[data-area="${areaName}"]`)
                    .transition()
                    .duration(300)
                    .attr("stroke", highlightColor)
                    .attr("stroke-width", highlightWidth)
                    .attr("stroke-opacity", 1);
            }
        }
    }
}

function resetConnectionHighlights() {
    d3.selectAll("path.main-connection")
        .transition()
        .duration(300)
        .attr("stroke", "#37587e")
        .attr("stroke-width", sizeConfig.connectionStrokeWidth * 1.2)
        .attr("stroke-opacity", sizeConfig.connectionOpacity * 1.2);
    
    d3.selectAll("path.drug-path")
        .transition()
        .duration(300)
        .attr("stroke", "#37587e")
        .attr("stroke-width", sizeConfig.connectionStrokeWidth)
        .attr("stroke-opacity", sizeConfig.connectionOpacity);
}

/**
 * State Management Functions
 */
function setActiveArea(area: string | null, areaData: any) {
    // Reset state
    activeArea = area;
    activeStage = null;
    
    // Reset all area node styles
    d3.selectAll(".area-node")
        .transition()
        .duration(500)
        .attr("width", sizeConfig.companyNodeWidth)
        .attr("height", sizeConfig.companyNodeHeight)
        .attr("transform", "translate(-5.125, -5.125)");
        
    d3.selectAll(".area-label text")
        .transition()
        .duration(500)
        .attr("fill", "#4A5568")
        .attr("font-size", sizeConfig.labelFontSize)
        .attr("font-weight", sizeConfig.labelFontWeight);
        
    d3.selectAll(".area-drugs circle")
        .transition()
        .duration(200)
        .attr("r", 0)
        .attr("opacity", 0.8);
        
    // Highlight active area if selected
    if (area) {
        const areaId = area.replace(/\s+/g, '-').toLowerCase();
        
        // Update node size
        d3.select(`#area-node-${areaId}`)
            .transition()
            .duration(200)
            .attr("width", 10.25)
            .attr("height", 10.25)
            .attr("transform", "translate(-5.125, -5.125)");
            
        d3.select(`#area-label-${areaId} text`)
            .transition()
            .duration(500)
            .attr("fill", "#FF4A4A")
            .attr("font-size", "11px")
            .attr("font-weight", "800");
            
        if (shouldRenderFullDetail) {
            d3.select(`#area-label-${areaId} .area-drugs`)
                .selectAll("circle")
                .transition()
                .duration(200)
                .attr("r", 2.5)
                .attr("opacity", 1);
        }
            
        // Update sidebar data if we have the full area data
        if (areaData && !Array.isArray(areaData)) {
            onCompanyHover({
                entries: areaData.entries,
                areaName: area,
                totalDrugs: areaData.totalDrugs,
                uniqueCompanies: areaData.uniqueCompanies.size,
                uniqueCandidates: areaData.uniqueCandidates.size
            });
        } else {
            // Fallback to just the entries if we don't have the full area data
            const areaEntries = Array.isArray(areaData) ? areaData : data.filter(entry => entry.TherapeuticArea1 === area);
            onCompanyHover({
                entries: areaEntries,
                areaName: area,
                totalDrugs: areaEntries.length,
                uniqueCompanies: new Set(areaEntries.map(e => e.Company)).size,
                uniqueCandidates: new Set(areaEntries.map(e => e.Candidate)).size
            });
        }
    }
}

function setActiveStage(stage: any, entries: any[]) {
    // Reset state
    activeStage = stage;
    activeArea = null;
    
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
 * Detail Drawer Functions
 */
function openDrugDetailDrawer(drug: any) {
    // Get the therapeutic area color
    const areaColors = getTherapeuticAreaColor(drug.TherapeuticArea1);
    
    // Create a detail object for the drawer
    onShowDrugDetail({
        drugName: drug.Candidate,
        year: drug["RPDD Year"],
        Company: drug.Company,
        therapeuticArea: drug.TherapeuticArea1,
        entries: data.filter(entry => entry.TherapeuticArea1 === drug.TherapeuticArea1),
        color: areaColors.fill,
        strokeColor: areaColors.stroke,
        currentStage: drug["Current Development Stage"] || "TBD",
        indication: drug.Indication || "",
        rpddAwardDate: drug["RPDD Year"],
        voucherAwardDate: drug["PRV Year"] || "",
        prvStatus: drug["PRV Status"] || "",
        transactionDate: drug["Purchase Year"] || "",
        purchaser: drug["Purchaser"] || "",
        salePrice: drug["Sale Price (USD Millions)"] || "",
        treatmentClass: drug.Class1 || "TBD",
        mechanismOfAction: drug.MOA || "TBD",
        companyUrl: drug["Link to CrunchBase"] || ""
    });
}

function openAreaDetailDrawer(area: any) {
    // Get the therapeutic area color
    const areaColors = getTherapeuticAreaColor(area.area);
    
    // Call the parent component's function to open the therapeutic area detail drawer
    onShowTherapeuticAreaDetail({
        name: area.area,
        entries: area.entries,
        totalDrugs: area.totalDrugs,
        companies: area.uniqueCompanies.size,
        candidates: area.uniqueCandidates.size,
        indications: area.indications.size,
        color: areaColors.fill,
        strokeColor: areaColors.stroke,
        clinicalTrials: area.clinicalTrials || 0,
        vouchersAwarded: area.vouchersAwarded || 0,
        transactedVouchers: area.transactedVouchers || 0
    });
}

/**
 * Highlights a specific therapeutic area
 */
function highlightTherapeuticArea(area: string) {
    if (!mainGroup || !contentGroup) return;
    
    // Reset any previous highlights first
    resetTherapeuticAreaHighlight();
    
    // Find and highlight the area node
    contentGroup.selectAll(".area-node-group")
        .each(function() {
            const nodeGroup = d3.select(this);
            const areaName = nodeGroup.attr("data-area");
            
            if (areaName && areaName.toLowerCase() === area.toLowerCase()) {
                // Highlight this area
                nodeGroup.selectAll(".area-node, .area-star")
                    .classed("highlighted-area", true)
                    .transition()
                    .duration(300)
                    .attr("transform", "scale(1.2)");
                    
                // Make label stand out
                nodeGroup.selectAll(".area-label")
                    .classed("highlighted-label", true)
                    .transition()
                    .duration(300)
                    .style("font-weight", "bold");
                    
                // Highlight connected drug nodes
                nodeGroup.selectAll(".drug-node")
                    .classed("highlighted-node", true)
                    .transition()
                    .duration(300)
                    .attr("r", (d: any) => (d.radius || 4) * 1.2);
            } else {
                // Dim other areas
                nodeGroup.selectAll(".area-node, .area-star, .drug-node")
                    .classed("dimmed-node", true)
                    .transition()
                    .duration(300)
                    .style("opacity", 0.35);
                    
                nodeGroup.selectAll(".area-label")
                    .classed("dimmed-label", true)
                    .transition()
                    .duration(300)
                    .style("opacity", 0.5);
            }
        });
}

/**
 * Resets the therapeutic area highlighting
 */
function resetTherapeuticAreaHighlight() {
    if (!mainGroup || !contentGroup) return;
    
    // Reset all highlighted area nodes
    contentGroup.selectAll(".highlighted-area")
        .classed("highlighted-area", false)
        .transition()
        .duration(300)
        .attr("transform", null);
        
    // Reset all highlighted labels
    contentGroup.selectAll(".highlighted-label")
        .classed("highlighted-label", false)
        .transition()
        .duration(300)
        .style("font-weight", null);
        
    // Reset all highlighted nodes
    contentGroup.selectAll(".highlighted-node")
        .classed("highlighted-node", false)
        .transition()
        .duration(300)
        .attr("r", function() {
            // Reset to original radius or default
            return d3.select(this).attr("data-original-radius") || 4;
        });
        
    // Reset all dimmed elements
    contentGroup.selectAll(".dimmed-node, .dimmed-label")
        .classed("dimmed-node", false)
        .classed("dimmed-label", false)
        .transition()
        .duration(300)
        .style("opacity", null);
}

// Lifecycle hooks
onMount(() => {
if (mainGroup) {
createVisualization();
}
});

// Reactive statements to handle changes
$: if (data && mainGroup) {
    // Always recreate visualization when data reference changes
    // This ensures proper updates when switching between years
    setTimeout(() => {
        console.log("Data changed, recreating visualization");
        createVisualization();
    }, 0);
}

// Clean up when component is destroyed
onDestroy(() => {
// Stop any ongoing animations or workers
if (worker) {
worker.terminate();
worker = null;
}
});
</script>

<style>
.chart-container {
width: 100%;
max-width: 1200px;
margin: 0 auto;
position: relative;
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

.drug-node {
cursor: pointer;
}

/* Loading indicator styles */
.loading-overlay {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(255, 255, 255, 0.8);
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
z-index: 10;
}

.loading-spinner {
width: 40px;
height: 40px;
border-radius: 50%;
border: 4px solid rgba(0, 0, 0, 0.1);
border-top-color: #3182ce;
animation: spin 1s ease-in-out infinite;
}

.progress-bar {
width: 200px;
height: 8px;
background-color: #e2e8f0;
border-radius: 4px;
margin-top: 16px;
overflow: hidden;
}

.progress-bar-fill {
height: 100%;
background-color: #3182ce;
transition: width 0.3s ease;
}

@keyframes spin {
to { transform: rotate(360deg); }
}
</style>

<div class="chart-container">
{#if isInitializing}
<div class="loading-overlay">
<div class="loading-spinner"></div>
<div class="progress-bar">
<div class="progress-bar-fill" style="width: {loadingProgress}%"></div>
</div>
<p class="mt-4 text-sm text-gray-600">Processing data... {loadingProgress}%</p>
</div>
{/if}

{#if isInitialRender && renderProgress.total > 0}
<div class="loading-overlay">
<div class="loading-spinner"></div>
<div class="progress-bar">
<div class="progress-bar-fill" style="width: {(renderProgress.completed / renderProgress.total) * 100}%"></div>
</div>
<p class="mt-4 text-sm text-gray-600">Rendering {renderProgress.completed} of {renderProgress.total} areas...</p>
</div>
{/if}
</div>
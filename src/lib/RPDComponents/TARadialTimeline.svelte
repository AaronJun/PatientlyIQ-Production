<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  
  // Import the color definitions
  import { 
    getTherapeuticAreaColor, 
    getStageColor
  } from '../rpdprvdash/utils/colorDefinitions';
  
  // Import utility functions
  import {
    calculateCompanyAngles,
    calculateOptimalLabelPlacement,
    getSizeConfig,
    getLabelConfig,
    getStageRadii
  } from '../rpdprvdash/utils/data-processing-utils';
  
  // Import sub-components
  import DrugNode from '../rpdprvdash/RadialComponents/components/DrugNode.svelte';
  import ConnectionLines from '../rpdprvdash/RadialComponents/components/ConnectionLines.svelte';
  import TAStageCircles from '../rpdprvdash/RadialComponents/components/TAStageCircles.svelte';
  import TADrugNode from '../rpdprvdash/RadialComponents/components/TADrugNode.svelte';
  import RPDTooltip from './RPDTooltip.svelte';
  import RPDDrawer from './RPDDrawer.svelte';
  
  interface ConstellationEntry {
    Year: string;
    id: string;
    name: string;
    Sponsor: string;
    "Drug Name": string;
    "Treatment Type"?: string;
    Purchased: string;
    Month: string;
    Date: string;
    Purchaser?: string;
    RPDdata?: RPDData[];
  }
  
  interface RPDData {
    "Therapeutic area": string;
    "Number of RPD designations": string;
  }
  
  export let constellationData: ConstellationEntry[];
  export let selectedArea: string | null = null;

  // Drawer state
  let isDrawerOpen = false;
  let selectedAreaData: any = null;
  let currentView: string | null = null;
  let drawerColor: string | null = null;
  
  // Ensure RPD data is available
  $: {
    const rpdData = JSON.parse(`[
      {
        "Therapeutic area": "Neurology",
        "Number of RPD designations": "149"
      },
      {
        "Therapeutic area": "Metabolism",
        "Number of RPD designations": "131"
      },
      {
        "Therapeutic area": "Oncology",
        "Number of RPD designations": "105"
      },
      {
        "Therapeutic area": "Hematology",
        "Number of RPD designations": "32"
      },
      {
        "Therapeutic area": "Immunology",
        "Number of RPD designations": "25"
      },
      {
        "Therapeutic area": "Ophthalmology",
        "Number of RPD designations": "22"
      },
      {
        "Therapeutic area": "Dermatology",
        "Number of RPD designations": "21"
      },
      {
        "Therapeutic area": "Pulmonary",
        "Number of RPD designations": "10"
      },
      {
        "Therapeutic area": "Orthopedics",
        "Number of RPD designations": "10"
      },
      {
        "Therapeutic area": "Endocrinology",
        "Number of RPD designations": "12"
      },
      {
        "Therapeutic area": "Gastroenterology",
        "Number of RPD designations": "12"
      },
      {
        "Therapeutic area": "Other",
        "Number of RPD designations": "30"
      }
    ]`);
    
    if (constellationData.length > 0 && !constellationData[0].RPDdata) {
      constellationData[0].RPDdata = rpdData;
    }
  }
  
  const dispatch = createEventDispatcher();
  
  let container: HTMLElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let mainGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let contentGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let containerWidth: number;
  let containerHeight: number;
  
  // Tooltip state
  let tooltipVisible = false;
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipContent = {
    sponsor: '',
    drugName: '',
    therapeuticArea: '',
    id: ''
  };
  let tooltipBorderColor = '';
  
  // Dimensions and configuration
  $: width = (containerWidth || 800);
  $: height = width;
  $: radius = Math.min(width, height) / 2.025;
  $: innerRadius = radius * 0.325;
  $: outerRadius = radius;
  
  // Create log scale for radius
  $: radiusScale = d3.scaleLog()
    .domain([10, 300])
    .range([innerRadius, outerRadius])
    .nice();
  
  // Configuration from utility functions
  $: sizeConfig = getSizeConfig(false);
  $: labelConfig = getLabelConfig(radius, false);
  $: stageRadii = getStageRadii(radius);
  
  // Angle buffer for spacing between areas
  const ANGLE_BUFFER = Math.PI / 64;
  
  // Group data by therapeutic area
  $: groupedData = d3.group(constellationData, d => d.name);
  
  // Sort therapeutic areas by RPD designation count
  $: therapeuticAreas = Array.from(groupedData.keys()).sort((a, b) => {
    const rpdData = constellationData[0]?.RPDdata || [];
    const getCount = (area: string) => {
      const match = rpdData.find(d => 
        d["Therapeutic area"].toLowerCase() === area.toLowerCase() ||
        (d["Therapeutic area"] === "Other" && !rpdData.some(rd => 
          rd["Therapeutic area"].toLowerCase() === area.toLowerCase()
        ))
      );
      return match ? parseInt(match["Number of RPD designations"]) : 0;
    };
    return getCount(a) - getCount(b); // Sort ascending (lowest to highest)
  });
  
  // Track active and hovered areas
  let hoveredArea: string | null = null;
  let activeArea: string | null = null;
  
  // Component references
  let taStageCirclesComponent: TAStageCircles;
  let connectionLinesComponent: ConnectionLines;
  
  // Track elements that can be keyboard-focused
  let focusableElements: any[] = [];
  
  // Process data for visualization
  function processDataForLayout() {
    const areas = therapeuticAreas.map(area => {
      const entries = groupedData.get(area) || [];
      const rpdData = constellationData[0]?.RPDdata || [];
      
      // Find RPD count for this area
      const areaRPDCount = rpdData.find(d => 
        d["Therapeutic area"].toLowerCase() === area.toLowerCase() ||
        (d["Therapeutic area"] === "Other" && !rpdData.some(rd => 
          rd["Therapeutic area"].toLowerCase() === area.toLowerCase()
        ))
      );
      
      const rpdCount = areaRPDCount ? parseInt(areaRPDCount["Number of RPD designations"]) : 0;
      
      // Group entries by stage/type
      const entriesByStage = d3.group(entries, d => d["Treatment Type"] || "Unknown");
      
      // Create a stages map with entries
      const stages = new Map();
      entriesByStage.forEach((stageEntries, stageName) => {
        stages.set(stageName, stageEntries);
      });
      
      return {
        area,
        totalDrugs: entries.length,
        rpdCount,
        entries,
        stages
      };
    });
    
    return areas;
  }
  
  // Show tooltip
  function showTooltip(event: MouseEvent | FocusEvent, data: any, isArea: boolean = false) {
    const containerRect = container.getBoundingClientRect();
    
    // Handle both mouse and focus events
    let clientX, clientY;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      // For focus events, get position from the target element
      const targetRect = (event.target as Element).getBoundingClientRect();
      clientX = targetRect.left + targetRect.width / 2;
      clientY = targetRect.top + targetRect.height / 2;
    }
    
    tooltipX = clientX - containerRect.left;
    tooltipY = clientY - containerRect.top;
    
    if (isArea) {
      // Area tooltip
      const rpdData = constellationData[0]?.RPDdata || [];
      const areaRPDCount = rpdData.find(d => 
        d["Therapeutic area"].toLowerCase() === data.area.toLowerCase() ||
        (d["Therapeutic area"] === "Other" && !rpdData.some(rd => 
          rd["Therapeutic area"].toLowerCase() === data.area.toLowerCase()
        ))
      );
      
      const rpdCount = areaRPDCount ? areaRPDCount["Number of RPD designations"] : "0";
      
      tooltipContent = {
        sponsor: '',
        drugName: '',
        therapeuticArea: data.area,
        id: `${rpdCount} RPD designations`
      };
      
      const areaColors = getTherapeuticAreaColor(data.area);
      tooltipBorderColor = areaColors.stroke;
    } else {
      // Drug tooltip
      tooltipContent = {
        sponsor: data.Sponsor || '',
        drugName: data["Drug Name"] || '',
        therapeuticArea: data.name || '',
        id: data.id || ''
      };
      
      const areaColors = getTherapeuticAreaColor(data.name);
      tooltipBorderColor = areaColors.stroke;
    }
    
    tooltipVisible = true;
  }
  
  // Hide tooltip
  function hideTooltip() {
    tooltipVisible = false;
  }
  
  // Handle area hover
  function handleAreaHover(area: string) {
    hoveredArea = area;
    
    // Highlight connections for this area
    if (connectionLinesComponent) {
      connectionLinesComponent.highlightCompanyConnections(area);
    }
    
    // Dispatch event for parent components
    dispatch('areaHover', { area, entries: groupedData.get(area) || [] });
  }
  
  // Handle area leave
  function handleAreaLeave() {
    hoveredArea = null;
    
    // Reset connection highlights
    if (connectionLinesComponent) {
      connectionLinesComponent.resetConnectionHighlights();
    }
    
    // Dispatch event for parent components
    dispatch('areaLeave');
  }
  
  // Handle area click
  function handleAreaClick(area: string) {
    const entries = groupedData.get(area) || [];
    const areaColors = getTherapeuticAreaColor(area);
    
    selectedAreaData = {
      area,
      entries,
      color: areaColors.stroke
    };
    
    currentView = 'area';
    isDrawerOpen = true;
    
    // Dispatch event for parent components
    dispatch('areaClick', { area, entries });
  }
  
  // Handle drug click
  function handleDrugClick(drug: any) {
    selectedAreaData = {
      drug,
      color: getTherapeuticAreaColor(drug.name).stroke
    };
    
    currentView = 'drug';
    isDrawerOpen = true;
    
    // Dispatch event for parent components
    dispatch('drugClick', { drug });
  }
  
  // Set active area
  function setActiveArea(area: string, entries: any[]) {
    activeArea = area;
    
    // Highlight connections for this area
    if (connectionLinesComponent) {
      connectionLinesComponent.highlightCompanyConnections(area);
    }
    
    // Dispatch event for parent components
    dispatch('areaSelect', { area, entries });
  }
  
  // Create the visualization
  function createVisualization() {
    if (!container) return;
    
    // Clear previous content
    d3.select(container).selectAll("svg").remove();
    
    // Create SVG
    svg = d3.select(container)
      .append("svg")
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", "100%")
      .attr("height", "100%");
    
    // Create main group
    mainGroup = svg.append("g");
    
    // Create content group and ensure it's not undefined
    contentGroup = mainGroup.append("g").attr("class", "content-group");
    
    // Ensure contentGroup exists before proceeding
    if (!contentGroup) {
      console.error("Failed to create content group");
      return;
    }
    
    // Create connection lines group with non-null assertion
    connectionLinesComponent = new ConnectionLines({
      target: document.createElement('div'),
      props: { 
        contentGroup: contentGroup!, // Use non-null assertion
        sizeConfig: {
          ...sizeConfig,
          connectionStrokeWidth: 0.75, // Thinner connections
          connectionOpacity: 0.6, // More transparent connections
        }
      }
    });
    const linesGroup = connectionLinesComponent.createLinesGroup();
    
    // Create concentric circles for RPD counts with non-null assertion
    taStageCirclesComponent = new TAStageCircles({
      target: document.createElement('div'),
      props: { 
        contentGroup: contentGroup!, // Use non-null assertion
        radiusScale,
        innerRadius,
        outerRadius,
        isAllYearView: false
      }
    });
    taStageCirclesComponent.createStageCircles();
    
    // Create area labels group
    const areaLabelsGroup = contentGroup.append("g").attr("class", "area-labels");
    
    // Process data for visualization
    const areas = processDataForLayout();
    
    // Calculate angles for areas based on RPD count
    const totalRPDCount = areas.reduce((sum, area) => sum + area.rpdCount, 0);
    const areaAngles = new Map();
    
    let currentAngle = 0;
    areas.forEach(area => {
      const proportion = area.rpdCount / totalRPDCount;
      const angle = proportion * (2 * Math.PI - (areas.length * ANGLE_BUFFER));
      
      areaAngles.set(area.area, {
        start: currentAngle,
        end: currentAngle + angle,
        center: currentAngle + angle/2
      });
      
      currentAngle += angle + ANGLE_BUFFER;
    });
    
    // Calculate optimal label placements
    const labelPlacements = calculateOptimalLabelPlacement(
      areas.map(a => ({ company: a.area, totalDrugs: a.rpdCount })), 
      areaAngles, 
      labelConfig
    );
    
    // Render areas
    areas.forEach((area, index) => {
      renderArea(area, index, areaAngles, labelPlacements, areaLabelsGroup, linesGroup);
    });
    
    // If a specific area was selected, highlight it
    if (selectedArea) {
      const areaData = areas.find(a => a.area === selectedArea);
      if (areaData) {
        setActiveArea(selectedArea, areaData.entries);
      }
    }
  }
  
  // Render a single area with its drugs
  function renderArea(
    area: any, 
    index: number, 
    areaAngles: Map<string, any>, 
    labelPlacements: any[], 
    areaLabelsGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    linesGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  ) {
    const angle = areaAngles.get(area.area);
    if (!angle) return;
    
    const areaGroup = contentGroup.append("g");
    
    // Calculate position for connecting lines
    const nodeAngle = angle.center - Math.PI/2; // Adjust for SVG coordinates
    
    // Get the label placement from our calculated positions
    const labelPlacement = labelPlacements.find(lp => lp.company === area.area);
    
    // If we have a calculated placement, use it; otherwise calculate directly
    const labelX = labelPlacement ? labelPlacement.x : (radius * 1.05) * Math.cos(nodeAngle);
    const labelY = labelPlacement ? labelPlacement.y : (radius * 1.05) * Math.sin(nodeAngle);
    const isRightSide = labelPlacement ? labelPlacement.isRightSide : Math.cos(nodeAngle) > 0;
    
    // Create area label with companytree styling
    const labelGroup = areaLabelsGroup.append("g")
      .attr("transform", `translate(${labelX},${labelY})`)
      .attr("class", `area-label area-${area.area.toLowerCase().replace(/\s+/g, '-')}`)
      .style("cursor", "pointer")
      .attr("tabindex", "0")
      .attr("role", "button")
      .attr("aria-label", `${area.area} therapeutic area with ${area.rpdCount} RPD designations`);
    
    // Determine text anchor based on side
    const textAnchor = isRightSide ? "start" : "end";
    const xOffset = isRightSide ? 10 : -10; // Smaller offset to match companytree
    
    // Create a background for the label to improve readability
    const areaColors = getTherapeuticAreaColor(area.area);
    const textWidth = area.area.length * 6.5; // Estimate text width
    const rectWidth = Math.max(textWidth, 60);
    const rectHeight = 20;
    
    // Add background rect
    labelGroup.append("rect")
      .attr("x", isRightSide ? 0 : -rectWidth)
      .attr("y", -10)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("rx", 3)
      .attr("fill", "#ffffff")
      .attr("stroke", areaColors.stroke)
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.6)
      .attr("fill-opacity", 0.8);
    
    // Add area name text with companytree styling
    const labelText = labelGroup.append("text")
      .attr("text-anchor", textAnchor)
      .attr("dx", xOffset)
      .attr("dy", "0.35em")
      .attr("fill", "#333333") // Darker text to match companytree
      .attr("font-size", "10px") // Smaller font to match companytree
      .attr("font-weight", "500")
      .text(area.area);
    
    // Add RPD count as a small badge
    const countBadge = labelGroup.append("g")
      .attr("transform", `translate(${isRightSide ? rectWidth + 5 : -rectWidth - 15}, 0)`);
    
    countBadge.append("circle")
      .attr("r", 8)
      .attr("fill", areaColors.stroke)
      .attr("fill-opacity", 0.8);
    
    countBadge.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#ffffff")
      .attr("font-size", "8px")
      .attr("font-weight", "bold")
      .text(area.rpdCount);
    
    // Add event listeners
    labelGroup
      .on("mouseenter", (event: MouseEvent) => {
        handleAreaHover(area.area);
        showTooltip(event, area, true);
      })
      .on("mouseleave", () => {
        handleAreaLeave();
        hideTooltip();
      })
      .on("click", () => handleAreaClick(area.area))
      .on("focus", (event) => {
        handleAreaHover(area.area);
        showTooltip(event, area, true);
      })
      .on("blur", () => {
        handleAreaLeave();
        hideTooltip();
      })
      .on("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleAreaClick(area.area);
        }
      });
    
    // Store reference for keyboard navigation
    focusableElements.push({
      element: labelGroup.node(),
      area: area.area,
      type: 'area',
      index
    });
    
    // Calculate line length using log scale based on RPD count
    const lineLength = radiusScale(Math.max(10, area.rpdCount));
    
    // Add connecting line from center to area label
    linesGroup.append("path")
      .attr("class", "main-connection")
      .attr("data-company", area.area)
      .attr("d", `M0,0L${labelX},${labelY}`)
      .attr("stroke", "#37587e")
      .attr("stroke-width", 0.75) // Thinner line to match companytree
      .attr("stroke-opacity", 0.6) // More transparent to match companytree
      .attr("fill", "none");
    
    // Render drugs for each stage
    area.stages.forEach((drugs: any[], stage: string) => {
      if (drugs.length === 0) return;
      
      // Calculate the angular spacing for drugs
      const drugSpacing = (angle.end - angle.start) / (drugs.length + 1);
      
      // Get the appropriate radii for this stage based on RPD count
      const baseRadius = radiusScale(Math.max(10, area.rpdCount));
      
      // Calculate midpoint radius for drug placement - place between concentric circles
      // Get the guide values from the radius scale
      const guideValues = radiusScale.ticks(6);
      
      // Find the appropriate radius based on the stage
      let stageRadius = baseRadius * 0.7; // Default fallback
      
      // For different treatment types, place at different radii
      if (stage === 'Y') { // Purchased vouchers
        stageRadius = baseRadius * 0.4; // Place closer to center
      } else if (stage === 'N') { // Non-purchased vouchers
        stageRadius = baseRadius * 0.6; // Place in middle
      } else {
        stageRadius = baseRadius * 0.8; // Place further out
      }
      
      // Calculate the bracket point for multiple drugs
      const firstDrugAngle = angle.start + drugSpacing;
      const lastDrugAngle = angle.start + drugSpacing * drugs.length;
      const bracketAngle = (firstDrugAngle + lastDrugAngle) / 2;
      
      // Calculate bracket point position - place at midpoint
      const bracketRadius = stageRadius * 0.5;
      const bracketX = bracketRadius * Math.cos(bracketAngle - Math.PI/2);
      const bracketY = bracketRadius * Math.sin(bracketAngle - Math.PI/2);
      
      // Draw main connection from label to bracket point for multiple drugs
      if (drugs.length > 1) {
        connectionLinesComponent.createMainConnection(
          labelX, labelY, bracketX, bracketY, area.area
        );
      }
      
      // Create drug nodes
      drugs.forEach((drug: any, i: number) => {
        const drugAngle = angle.start + drugSpacing * (i + 1);
        const drugX = stageRadius * Math.cos(drugAngle - Math.PI/2);
        const drugY = stageRadius * Math.sin(drugAngle - Math.PI/2);
        
        // Create unique ID for drug
        const drugId = `${area.area}-${drug["Drug Name"]}-${i}`.replace(/\s+/g, '-').toLowerCase();
        
        // Add connecting line
        const startX = drugs.length > 1 ? bracketX : labelX;
        const startY = drugs.length > 1 ? bracketY : labelY;
        
        connectionLinesComponent.createDrugConnection(
          startX, startY, drugX, drugY, area.area, drugId
        );
        
        // Create drug node with companytree styling
        const drugNodeComponent = new TADrugNode({
          target: document.createElement('div'),
          props: {
            drug,
            x: drugX,
            y: drugY,
            drugId,
            areaName: area.area,
            sizeConfig: {
              ...sizeConfig,
              drugNodeRadius: 5, // Match companytree size
              drugNodeStrokeWidth: 1.5, // Match companytree stroke width
              highlightedNodeRadius: 7, // Match companytree highlight size
              connectionStrokeWidth: 0.75, // Thinner connections
              connectionOpacity: 0.6, // More transparent connections
              useAnimations: true, // Enable animations
              transitionDuration: 200, // Fast transitions
              useShadowEffects: false // No shadow effects
            },
            showTooltip,
            hideTooltip,
            onShowDrugDetail: handleDrugClick,
            highlightDrugConnections: connectionLinesComponent.highlightDrugConnections,
            resetConnectionHighlights: connectionLinesComponent.resetConnectionHighlights,
            parentGroup: areaGroup,
            focusableElements,
            areaRef: focusableElements.find(item => 
              item.area === area.area && item.type === 'area'
            )
          }
        });
        
        drugNodeComponent.createDrugNode();
      });
    });
  }
  
  // Initialize on mount
  onMount(() => {
    createVisualization();
    
    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (container) {
        containerWidth = container.clientWidth;
        containerHeight = container.clientHeight;
        createVisualization();
      }
    });
    
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
  });
  
  // Update visualization when data changes
  $: if (constellationData && container) {
    createVisualization();
  }
  
  // Handle drawer close
  function handleDrawerClose() {
    isDrawerOpen = false;
    selectedAreaData = null;
    currentView = null;
  }
</script>

<div class="chart-container" bind:this={container} bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
  <!-- Loading indicator would go here if needed -->
  
  <!-- Tooltip -->
  {#if tooltipVisible}
    <RPDTooltip 
      visible={tooltipVisible}
      content={tooltipContent}
      borderColor={tooltipBorderColor}
    />
  {/if}
  
  <!-- Drawer -->
  {#if isDrawerOpen && selectedAreaData}
    <RPDDrawer 
      isOpen={isDrawerOpen}
      data={selectedAreaData}
      constellationData={constellationData}
      initialView={currentView}
      color={selectedAreaData.color || drawerColor || '#000000'}
      onClose={handleDrawerClose}
    />
  {/if}
</div>

<style>
  .chart-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
</style>
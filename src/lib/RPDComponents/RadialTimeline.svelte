<script lang="ts">

import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import type { Selection } from 'd3';
  import "carbon-components-svelte/css/all.css";
  import ZeroPetal from '../../assets/0PetalNew.svg?raw';
  import OnePetal from '../../assets/1PetalNew.svg?raw';
  import TwoPetal from '../../assets/2PetalNew.svg?raw';
  import ThreePetal from '../../assets/3PetalNew.svg?raw';
  import FourPetal from '../../assets/4PetalNew.svg?raw';
  import FivePetal from '../../assets/5PetalNew.svg?raw';
  import SixPetal from '../../assets/6PetalNew.svg?raw';
  import SevenPetal from '../../assets/7PetalNew.svg?raw';
  import EightPetal from '../../assets/8PetalNew.svg?raw';
  import NinePetal from '../../assets/9PetalNew.svg?raw';
  import TenPetal from '../../assets/10PetalNew.svg?raw';
  import ElevenPetal from '../../assets/11PetalNew.svg?raw';
  import TwelvePetal from '../../assets/12PetalNew.svg?raw';
  import RpdtaLegend from './RPDTALegend.svelte';
  import Tooltip from './RPDTooltip.svelte';
  import RPDDrawer from './RPDDrawer.svelte';
  
  interface RPDData {
    Year: string;
    RPD: string;
    "RPD PRV": string;
  }
  
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
  }
  
  export let data: RPDData[];
  export let constellationData: ConstellationEntry[];
  export let summaryDisplayComponent: any;
  export let isDrawerOpen: boolean;
  export let selectedData: any;
  
  const dispatch = createEventDispatcher();
  
  const MIN_FONT_SIZE = 10;
  const MAX_FONT_SIZE = 14;
  
  let container: HTMLElement;
  let svg: Selection<SVGGElement, unknown, HTMLElement, any>;
  let containerWidth: number;
  let containerHeight: number;

  let showDrawer = false;
  let drawerData = null;
  let drawerColor = '';
  let initialView = '';

  $: width = (containerWidth || 900) * 1.1;
  $: height = (containerHeight || 800);
  $: radius = Math.min(width, height) / 2.25;
  
  $: margin = {
    top: height * 0.15,
    right: width * 0.15,
    bottom: height * 0.15,
    left: width * 0.15
  };
  
  $: innerRadius = radius * 0.1;
  $: outerRadius = radius * 0.8925;
  
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
  
  const therapeuticAreaColors = {
    "Gastroenterology": "#a6cee3",
    "Neurology": "#1f78b4",
    "Ophthalmology": "#6C6C6C",
    "Immunology": "#33a02c",
    "Metabolic": "#fb9a99",
    "Dermatology": "#fdbf6f",
    "Hematology": "#e31a1c",
    "Orthopedics": "#ff7f00",
    "Pulmonology": "#cab2d6",
    "Nephrology": "#6a3d9a",
    "Oncology": "#ffff99",
    "Endocrinology": "#b15928",
    "Hepatology": "#8dd3c7",
  };

  const petalSVGs = {
    0: ZeroPetal,
    1: OnePetal,
    2: TwoPetal,
    3: ThreePetal,
    4: FourPetal,
    5: FivePetal,
    6: SixPetal,
    7: SevenPetal,
    8: EightPetal,
    9: NinePetal,
    10: TenPetal,
    11: ElevenPetal,
    12: TwelvePetal
  };
  
  const years = [...new Set(data.map(d => d.Year))].sort((a, b) => +a - +b);
  const maxRPD = Math.max(...data.map(d => +d.RPD));
  const groupedConstellationData = d3.group(constellationData, d => d.Year);
  
  let activeYearIndex = 0;
  $: activeYear = years[activeYearIndex];
  let hoveredYearIndex: number | null = null;
  $: hoveredYear = hoveredYearIndex !== null ? years[hoveredYearIndex] : null;
  
  $: angleScale = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .domain(years)
    .padding(0.02);
  
  $: radiusScale = d3.scaleLog()
    .range([innerRadius, outerRadius])
    .domain([0.1825, maxRPD]);

  let hoveredTherapeuticArea: string | null = null;

  function handleKeydown(event: KeyboardEvent) {
  // Allow keyboard navigation when the container or any year-segment is focused
  const isContainerFocused = document.activeElement === container;
  const isYearSegmentFocused = document.activeElement?.classList.contains('year-segment');
  
  if (!isContainerFocused && !isYearSegmentFocused) {
    return;
  }

  // Prevent event from bubbling to avoid double handling
  event.stopPropagation();

  let newIndex = activeYearIndex;
  
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      if (newIndex < years.length - 1) {
        newIndex++;
      }
      break;
      
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      if (newIndex > 0) {
        newIndex--;
      }
      break;
      
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
      
    case 'End':
      event.preventDefault();
      newIndex = years.length - 1;
      break;
      
    case ' ':
    case 'Enter':
      event.preventDefault();
      handleYearClick(event as unknown as MouseEvent, activeYear);
      return;
  }

  // Only update if the index actually changed
  if (newIndex !== activeYearIndex) {
    activeYearIndex = newIndex;
    navigateToYear(years[newIndex]);
  }
}

function handleLegendAreaClick(event: CustomEvent<{ area: string }>) {
  const area = event.detail.area;
  const areaData = constellationData.find(d => d.name === area);
  if (areaData) {
    drawerData = areaData;
    drawerColor = therapeuticAreaColors[area];
    showDrawer = true;
    // Pass initialView prop
    initialView = 'ta';
  }
}

function navigateToYear(year: string) {
  activeYearIndex = years.indexOf(year);
  activeYear = year;
  updateVisibility(year);
  dispatch('yearChange', { year });
  
  requestAnimationFrame(() => {
    const yearSegment = svg.select(`.year-${year}`).node();
    if (yearSegment instanceof SVGElement) {
      yearSegment.focus();
    }
  });
}
  
  function initializeChart() {
  d3.select(container).selectAll("*").remove();

  const svgElement = d3.select(container)
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("width", "100%")
    .attr("height", "100%");

  svg = svgElement.append("g");

  drawGuideCircles();
  drawYearArcs();
  drawDataLines();
  drawPetalClusters(); // Make sure this is called
}

// Add sorting function at the top level
function sortEntriesByTherapeuticArea(entries: ConstellationEntry[]): ConstellationEntry[] {
  // Create a map for consistent ordering of therapeutic areas
  const areaOrder = new Map([
    ["Neurology", 0],
    ["Oncology", 1],
    ["Hematology", 2],
    ["Immunology", 3],
    ["Metabolic", 4],
    ["Gastroenterology", 5],
    ["Hepatology", 6],
    ["Pulmonology", 7],
    ["Nephrology", 8],
    ["Dermatology", 9],
    ["Ophthalmology", 10],
    ["Orthopedics", 11],
    ["Endocrinology", 12]
  ]);

  return [...entries].sort((a, b) => {
    const orderA = areaOrder.get(a.name) ?? Number.MAX_VALUE;
    const orderB = areaOrder.get(b.name) ?? Number.MAX_VALUE;
    return orderA - orderB;
  });
}

function drawGuideCircles() {
  const logBase = 1.725;
  const guideValues = d3.range(Math.floor(Math.log(maxRPD) / Math.log(logBase)) + 1)
    .map(i => Math.pow(logBase, i));

  const guides = svg.append("g")
    .attr("class", "guide-circles");

  guides.selectAll("circle")
    .data(guideValues)
    .join("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", d => radiusScale(Math.max(0.1, d)))
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-dasharray", "2,4")
    .style("opacity", 0.5)
    .attr("class", "guide-circle")
    .style("pointer-events", "none");

  const calculatedFontSize = Math.min(
    Math.max(radius * 0.02, MIN_FONT_SIZE),
    MAX_FONT_SIZE
  );

  guides.selectAll("text")
    .data(guideValues)
    .join("text")
    .attr("x", 0)
    .attr("y", d => -radiusScale(Math.max(0.1, d)))
    .text(d => d3.format(".0s")(d))
    .attr("font-size", `${calculatedFontSize}px`)
    .attr("fill", "#666")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none");
}

function drawYearArcs() {
  const arcGenerator = d3.arc()
    .innerRadius(outerRadius * 1.1)
    .outerRadius(outerRadius * 1.12)
    .startAngle(d => angleScale(d)!)
    .endAngle(d => angleScale(d)! + angleScale.bandwidth());

  const yearGroup = svg.append("g")
    .attr("class", "year-arcs");

  yearGroup.selectAll("path")
    .data(years)
    .join("path")
    .attr("d", arcGenerator)
    .attr("fill", d => d === activeYear ? "#C9623F" : "#fff")
    .attr("stroke", "#ccc")
    .attr("stroke-width", .5)
    .attr("class", d => `year-segment year-${d}`)
    .attr("tabindex", 0)
    .attr("role", "button")
    .attr("aria-label", d => `View data for year ${d}`)
    .attr("aria-current", d => d === activeYear ? "true" : "false")
    .style("cursor", "pointer")
    .on("mouseover", handleYearHover)
    .on("mouseout", handleYearLeave)
    .on("click", handleYearClick)
    .on("focus", (event, d) => handleYearHover(event, d))
    .on("blur", () => handleYearLeave());

  const calculatedYearFontSize = Math.min(
    Math.max(radius * 0.025, MIN_FONT_SIZE),
    MAX_FONT_SIZE
  );

  yearGroup.selectAll("text")
    .data(years)
    .join("text")
    .attr("transform", d => {
      const angle = angleScale(d)! + angleScale.bandwidth() / 2;
      const radius = outerRadius * 1.2;
      return `
        translate(${Math.sin(angle) * radius},${-Math.cos(angle) * radius})
        rotate(${(angle * 180 / Math.PI) - 90})
      `;
    })
    .text(d => d)
    .attr("font-size", `${calculatedYearFontSize}px`)
    .attr("fill", d => d === activeYear ? "#C9623F" : "#666")
    .attr("font-weight", d => d === activeYear ? "bold" : "normal")
    .attr("text-anchor", "top")
    .attr("alignment-baseline", "top")
    .style("cursor", "pointer")
    .on("mouseover", handleYearHover)
    .on("mouseout", handleYearLeave)
    .on("click", handleYearClick);
}

function drawDataLines() {
  const lines = svg.append("g")
    .attr("class", "data-lines");

  data.forEach(d => {
    const angle = angleScale(d.Year)! + angleScale.bandwidth() / 2;
    const value = Math.max(0.1, +d.RPD);
    const radius = radiusScale(value);
    
    lines.append("line")
      .attr("class", `timeline-line year-${d.Year}`)
      .attr("x1", Math.sin(angle) * innerRadius)
      .attr("y1", -Math.cos(angle) * innerRadius)
      .attr("x2", Math.sin(angle) * radius)
      .attr("y2", -Math.cos(angle) * radius)
      .attr("stroke", "#063D37")
      .attr("stroke-width", radius * 0.005)
      .attr("stroke-dasharray", (+d.Year >= 2023) ? "2,8" : "none")  // Add dotted line for 2023 and 2024
      .style("opacity", d.Year === activeYear ? 1 : 0.2);
  });
}
  
// Modify the createPetalCluster function
function createPetalCluster(year: string, entries: ConstellationEntry[], position: { x: number, y: number, angle: number }) {
  // Sort entries by therapeutic area before creating the cluster
  const sortedEntries = sortEntriesByTherapeuticArea(entries);
  const petalCount = Math.min(sortedEntries.length, 12);
  const svgContent = petalSVGs[petalCount as keyof typeof petalSVGs];
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  
  // Use sortedEntries instead of entries
  sortedEntries.forEach((entry, index) => {
    const paths = doc.querySelectorAll('path');
    const petalPaths = Array.from(paths).filter(path => {
      const d = path.getAttribute('d');
      return d && d.includes('C');
    });
    
    const startIdx = index * 3;
    
    // Add data attributes and classes to each path
    if (petalPaths[startIdx]) {
      petalPaths[startIdx].setAttribute('class', 'petal-part background-petal');
      petalPaths[startIdx].setAttribute('data-therapeutic-area', entry.name);
      petalPaths[startIdx].setAttribute('data-petal-index', index.toString());
      petalPaths[startIdx].setAttribute('data-original-fill', '#231F20');
    }
    
    if (petalPaths[startIdx + 1]) {
      petalPaths[startIdx + 1].setAttribute('fill', therapeuticAreaColors[entry.name] || '#4D4DFF');
      petalPaths[startIdx + 1].setAttribute('class', 'petal-part outer-petal');
      petalPaths[startIdx + 1].setAttribute('data-therapeutic-area', entry.name);
      petalPaths[startIdx + 1].setAttribute('data-petal-index', index.toString());
    }
    
    if (petalPaths[startIdx + 2]) {
      const isPurchased = entry.Purchased?.toLowerCase() === 'y';
      const innerPetalColor = isPurchased ? '#E0FFF9' : '#32363A';
      petalPaths[startIdx + 2].setAttribute('fill', innerPetalColor);
      petalPaths[startIdx + 2].setAttribute('class', 'petal-part inner-petal');
      petalPaths[startIdx + 2].setAttribute('data-therapeutic-area', entry.name);
      petalPaths[startIdx + 2].setAttribute('data-petal-index', index.toString());
    }
  });

  const cluster = svg.append("g")
    .attr("class", `cluster year-${year}`)
    .attr("cursor", "pointer")
    .on("mouseover", () => handleClusterHover(year))
    .on("mouseout", handleClusterLeave)
    .html(doc.documentElement.outerHTML);

  // Position and scale the cluster
  const svgElement = cluster.select("svg").node();
  if (svgElement instanceof SVGElement) {
    const svgWidth = svgElement.getAttribute("width");
    const svgHeight = svgElement.getAttribute("height");
    
    if (svgWidth && svgHeight) {
      const scale = radius * 0.0008725;
      cluster.attr("transform", `
        translate(${position.x},${position.y})
        rotate(${position.angle * 180 / Math.PI})
        scale(${scale})
        translate(${-parseFloat(svgWidth)/2},${-parseFloat(svgHeight)/2})
      `);

      // Set up event handlers with proper class targeting
      cluster.selectAll("path")
        .each(function(_, i) {
          const element = d3.select(this);
          const entry = sortedEntries[Math.floor(i/3)]; // Use sortedEntries here
          if (entry) {
            const color = therapeuticAreaColors[entry.name];
            element
              .style("opacity", 1)
              .style("filter", year === activeYear ? "saturate(1)" : "saturate(0.1)")
              .style("transform-origin", "bottom center")
              .style("transition", "all 500ms circ-in-out")
              .on("mouseover", (event) => handlePetalHover(event, entry, color))
              .on("mouseout", () => handlePetalLeave(year))
              .on("click", (event) => handlePetalClick(event, entry, color));
          }
        });
    }
  }
  
  return cluster;
}

function drawPetalClusters() {
  years.forEach(year => {
    const entries = groupedConstellationData.get(year) || [];
    if (entries.length > 0) {
      const angle = angleScale(year)! + angleScale.bandwidth() / 2;
      const radius = radiusScale(Math.max(0.1, +data.find(d => d.Year === year)!.RPD));
      createPetalCluster(year, entries, {
        x: Math.sin(angle) * radius,
        y: -Math.cos(angle) * radius,
        angle
      });
    }
  });
}

function handleYearHover(event: MouseEvent, year: string) {
  if (year !== activeYear) {
    hoveredYearIndex = years.indexOf(year);
    updateVisibility(year, true); // Pass true to indicate hover state
    dispatch('yearChange', { year });

    // Update year segments
    svg.selectAll(".year-segment")
      .transition("ease-in-out")
      .duration(220)
      .attr("fill", d => d === year ? "#C9623F" : "#fff");

    // Update text
    svg.selectAll("text")
      .transition()
      .duration(300)
      .attr("fill", d => d === year ? "#C9623F" : "#666")
      .attr("font-weight", d => d === year ? "bold" : "normal");
  }
}

function handleYearLeave() {
  if (hoveredYear !== activeYear) {
    hoveredYearIndex = null;
    svg.selectAll(".value-label")
      .transition()
      .duration(805)
      .style("opacity", 0)
      .remove();
    
    updateVisibility(activeYear, false);
  }
}

function handleClusterHover(year: string) {
  if (year !== activeYear) {
    hoveredYearIndex = years.indexOf(year);
    updateVisibility(year, true);
    dispatch('yearChange', { year });
  }
  hoveredYearIndex = years.indexOf(year);
    updateVisibility(year, true); // Pass true to indicate hover state
    dispatch('yearChange', { year });

    // Update year segments
    svg.selectAll(".year-segment")
      .transition()
      .duration(120)
      .attr("fill", d => d === year ? "#C9623F" : "#fff");

    // Update text
    svg.selectAll("text")
      .transition()
      .duration(520)
      .attr("fill", d => d === year ? "#C9623F" : "#666")
      .attr("font-weight", d => d === year ? "bold" : "normal");
}

// Update the handleClusterLeave and handleYearLeave functions
function handleClusterLeave() {
  if (hoveredYear !== activeYear) {
    hoveredYearIndex = null;
    svg.selectAll(".value-label")
      .transition()
      .duration(800)
      .style("opacity", 0)
      .remove();
    
    updateVisibility(activeYear, false);
  }
}

function handlePetalLeave(year: string) {
    tooltipVisible = false;
    
    // Reset the specific petal
    svg.selectAll(`.cluster.year-${year} path`)
      .transition()
      .duration(620)
      .style("transform", "rotate(0deg)")
      .each(function() {
        const path = d3.select(this);
        const originalFill = path.property("_originalFill");
        if (originalFill) {
          path.style("fill", originalFill);
        }
      });

    // Maintain cluster saturation state
    const isClusterHovered = hoveredYear === year;
    if (isClusterHovered) {
      svg.selectAll(`.cluster.year-${year} path`)
        .style("filter", "saturate(.25)")
        .style("opacity", 1);
    } else {
      handleClusterLeave();
    }

    dispatch('petalLeave');
  }
  function handlePetalHover(event: MouseEvent, entry: ConstellationEntry, color: string) {
    const currentElement = event.currentTarget as SVGElement;
    const cluster = currentElement.closest(".cluster");
    const clusterYear = cluster?.classList[1].split("-")[1];
    
    const petalIndex = Math.floor(Array.from(currentElement.parentElement?.children || []).indexOf(currentElement) / 3);
    const petalGroup = d3.select(currentElement.parentElement)
      .selectAll("path")
      .filter((_, i) => Math.floor(i / 3) === petalIndex);

    // Store original fills
    petalGroup.each(function() {
      const path = d3.select(this);
      if (!path.property("_originalFill")) {
        path.property("_originalFill", path.style("fill"));
      }
    });

    // Apply hover effects
    petalGroup
      .transition()
      .duration(200)
      .style("filter", "saturate(1.25) brightness(1.1)")
      .each(function(_, i) {
        const path = d3.select(this);
        if (i % 3 === 0) {
          path.style("fill", "#ff1515");
        }
      });

    if (clusterYear) {
      handleClusterHover(clusterYear);
    }

    // Set tooltip content and position
    tooltipContent = {
      sponsor: entry.Sponsor,
      drugName: entry["Drug Name"],
      therapeuticArea: entry.name,
      id: entry.id
    };
    tooltipBorderColor = color;
    
    // Calculate position relative to viewport
    const containerRect = container.getBoundingClientRect();
    tooltipX = containerRect.left + (containerRect.width / 2.25);
    tooltipY = containerRect.top + (containerRect.height / 2.215);
    tooltipVisible = true;

    // Still dispatch the event for other listeners
    dispatch('petalHover', { 
      event: { 
        pageX: tooltipX,
        pageY: tooltipY
      }, 
      entry, 
      color 
    });
  }

function handlePetalClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
  event.stopPropagation();
  dispatch('clusterElementClick', { entry, color });
  activeYearIndex = years.indexOf(entry.Year);
  activeYear = entry.Year;
  updateVisibility(entry.Year, false);
}

  function handleYearClick(event: MouseEvent, year: string) {
    activeYearIndex = years.indexOf(year);
    activeYear = year;
    updateVisibility(year);
    dispatch('yearChange', { year });
  }

  function updatePetalHighlights() {
  svg.selectAll('.petal-part')
    .transition()
    .duration(200)
    .style("filter", function() {
      const petalElement = d3.select(this);
      const therapeuticArea = petalElement.attr('data-therapeutic-area');
      const parentCluster = d3.select(this.closest('.cluster'));
      
      if (!parentCluster.node()) return "saturate(0.2)";
      
      const year = parentCluster.attr('class').split(' ')[1].split('-')[1];
      
      if (!hoveredTherapeuticArea) {
        return year === activeYear ? "saturate(1)" : "saturate(0.2)";
      }
      
      return therapeuticArea === hoveredTherapeuticArea
        ? "saturate(1.2) brightness(1.1)"
        : "saturate(0) brightness(0.74)";
    })
    .style("opacity", function() {
      if (!hoveredTherapeuticArea) return 1;
      
      const petalElement = d3.select(this);
      const therapeuticArea = petalElement.attr('data-therapeutic-area');
      
      return therapeuticArea === hoveredTherapeuticArea ? 1 : 0.2;
    });

  // Specifically update background petals
  svg.selectAll('.background-petal')
    .transition()
    .duration(200)
    .style("fill", function() {
      const petalElement = d3.select(this);
      const therapeuticArea = petalElement.attr('data-therapeutic-area');
      
      if (!hoveredTherapeuticArea) {
        return petalElement.attr('data-original-fill');
      }
      
      return therapeuticArea === hoveredTherapeuticArea
        ? "#ff1515"
        : petalElement.attr('data-original-fill');
    });
}

// Update the updateVisibility function to include label handling
function updateVisibility(year: string, isHovered: boolean = false) {
  // Existing timeline line updates
  svg.selectAll(".timeline-line")
    .transition()
    .duration(400)
    .style("opacity", d => d === year ? 1 : 0.2)
    .style("saturate", d => d === year ? 1 : 0.2)
    .attr("stroke-dasharray", function() {
      const lineYear = this.classList[1].split('-')[1];
      return +lineYear >= 2023 ? "4,4" : "none";
    });

  // Update clusters and petals
  svg.selectAll(".cluster")
    .each(function() {
      const cluster = d3.select(this);
      const clusterYear = this.classList[1].split("-")[1];
      
      if (clusterYear === year) {
        cluster.selectAll("path")
          .transition()
          .duration(300)
          .style("filter", isHovered ? "saturate(1.2)" : "saturate(1)")
          .style("opacity", 1);
      } else {
        cluster.selectAll("path")
          .transition()
          .duration(500)
          .style("filter", "saturate(0.2)")
          .style("opacity", 0.5);
      }
    });

  // Update year segments
  svg.selectAll(".year-segment")
    .transition()
    .duration(300)
    .attr("fill", d => d === year ? "#C9623F" : "#fff");

  // Update text
  svg.selectAll("text")
    .transition()
    .duration(300)
    .attr("fill", d => d === year ? "#C9623F" : "#666")
    .attr("font-weight", d => d === year ? "bold" : "normal");

  // Show RPD label
  showRPDLabel(year);
}

function showRPDLabel(year: string) {

  const yearData = data.find(d => d.Year === year);
  if (yearData && +yearData.RPD > 0) {
    const angle = angleScale(year)! + angleScale.bandwidth() / 2;
    const value = Math.max(0.1, +yearData.RPD);
    const radius = radiusScale(value);

    // Position label at 24.5% of the distance from innerRadius to the point
    const labelRadius = innerRadius + (radius - innerRadius) * 0.245;
    const x = Math.sin(angle) * labelRadius;
    const y = -Math.cos(angle) * labelRadius;

    // Calculate rotation to keep text readable
    const rotationAngle = (angle * 180 / Math.PI) - 90;
    const finalRotation = rotationAngle > 90 && rotationAngle < 270 
      ? rotationAngle + 180 
      : rotationAngle;

    const labelGroup = svg.append("g")
      .attr("class", "value-label")
      .attr("transform", `translate(${x}, ${y}) rotate(${finalRotation})`);

    // Create a group for text elements
    const textGroup = labelGroup.append("g")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle");

    // Fade in the label
    labelGroup
      .style("opacity", 0)
      .transition()
      .duration(200)
      .style("opacity", 1);
  }
}

function handleLegendAreaHover(event: CustomEvent<{ area: string }>) {
    hoveredTherapeuticArea = event.detail.area;
    updatePetalHighlights();
  }
  function handleLegendAreaLeave() {
  hoveredTherapeuticArea = null;
  updatePetalHighlights();
  
  // Reset all background petals to their original fill
  svg.selectAll('.background-petal')
    .transition()
    .duration(200)
    .style("fill", function() {
      return d3.select(this).attr('data-original-fill');
    });
}

// Handle resize
function handleResize() {
  containerWidth = container.clientWidth;
  containerHeight = container.clientHeight;
  initializeChart();
  updateVisibility(activeYear);
}

// Initialize on mount
onMount(() => {
  activeYearIndex = years.indexOf(years[0]);
  
  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);
  
  window.addEventListener('keydown', handleKeydown);
  
  return () => {
    resizeObserver.disconnect();
    window.removeEventListener('keydown', handleKeydown);
  };
});
</script>
<RpdtaLegend 
  position="bottom-right"
  on:areaHover={handleLegendAreaHover}
  on:areaLeave={handleLegendAreaLeave}
  on:areaClick={handleLegendAreaClick}
/>

<div 
  class="radial-timeline" 
  bind:this={container} 
  tabindex="0" 
  role="region"
  aria-label="Timeline Navigation"
  on:keydown={handleKeydown}
>
  {#if tooltipVisible}
    <Tooltip
      x={tooltipX}
      y={tooltipY}
      visible={tooltipVisible}
      content={tooltipContent}
      borderColor={tooltipBorderColor}
    />
  {/if}

  {#if showDrawer}
    <RPDDrawer
      isOpen={showDrawer}
      onClose={() => showDrawer = false}
      data={drawerData}
      {constellationData}
      color={drawerColor}
      initialView={initialView} 
    />
  {/if}
</div>

<style>
  .radial-timeline {
    width: 100%;
    height: 100%;
    position: relative;
  }

  :global(.timeline-line) {
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  :global(.year-segment) {
    transition: fill 0.3s ease;
  }

  :global(.year-segment:focus) {
    fill: #4A7C80;
  }

  :global(.year-segment:focus:not(:focus-visible)) {
    outline: none;
  }

  :global(.cluster) {
    transition: opacity 0.3s ease;
  }

  :global(.cluster .petal) {
    transition: filter 0.3s ease, transform 0.3s ease;
    transform-origin: top center;
  }

  :global(.cluster .petal:hover) {
    transform: scale(1.025);
  }

  :global(.cluster path) {
  transition: all 200ms ease-in-out;
  transform-origin: top center;
}

:global(.cluster path:hover) {
  cursor: pointer;
}

/* Ensure smooth transitions for all properties */
:global(.cluster .petal) {
  transition: filter 200ms ease-in-out,
              transform 200ms ease-in-out,
              fill 200ms ease-in-out;
}

  :global(.center-circle) {
    transform: none !important;
    transition: none !important;
    pointer-events: none !important;
  }

  :global(.guide-circle) {
    pointer-events: none;
  }
  :global(.value-label) {
  pointer-events: none;
  text-shadow: 
    -1px -1px 0 #fff,  
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
}

:global(.value-label text) {
  user-select: none;
}

:global(.petal-part) {
    transition: filter 200ms ease-in-out,
                opacity 200ms ease-in-out,
                transform 200ms ease-in-out,
                fill 200ms ease-in-out;
  }

  :global(.petal-part:hover) {
    cursor: pointer;
  }

  :global(.radial-timeline:focus) {
  outline: 2px solid #4A7C80;
  outline-offset: 2px;
}

:global(.radial-timeline:focus:not(:focus-visible)) {
  outline: none;
}
</style>
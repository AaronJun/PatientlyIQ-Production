<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import type { Selection } from 'd3';
  import "carbon-components-svelte/css/all.css";
  import OnePetal from '../../assets/1Petal.svg?raw';
  import TwoPetal from '../../assets/2Petal.svg?raw';
  import ThreePetal from '../../assets/3Petal.svg?raw';
  import FourPetal from '../../assets/4Petal.svg?raw';
  import FivePetal from '../../assets/5Petal.svg?raw';
  import SixPetal from '../../assets/6Petal.svg?raw';
  import SevenPetal from '../../assets/7Petal.svg?raw';
  import EightPetal from '../../assets/8Petal.svg?raw';
  import NinePetal from '../../assets/9Petal.svg?raw';
  import TenPetal from '../../assets/10Petal.svg?raw';
  import ElevenPetal from '../../assets/11Petal.svg?raw';
  import TwelvePetal from '../../assets/12Petal.svg?raw';
  import Tooltip from './RPDTooltip.svelte';
  import RpdFlowerInfoPanel from './RPDFlowerInfoPanel.svelte';
  import RpdtaLegend from './RPDTALegend.svelte';
  
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
  
  const MIN_FONT_SIZE = 8;
  const MAX_FONT_SIZE = 10;
  
  let container: HTMLElement;
  let svg: Selection<SVGGElement, unknown, HTMLElement, any>;
  let containerWidth: number;
  let containerHeight: number;
  
  $: width = (containerWidth || 800) * 1.1;
  $: height = (containerHeight || 800) * 1.34;
  $: radius = Math.min(width, height) / 2.2725;
  
  $: margin = {
    top: height * 0.15,
    right: width * 0.15,
    bottom: height * 0.15,
    left: width * 0.15
  };
  
  $: innerRadius = radius * 0.1;
  $: outerRadius = radius * 0.7925;
  
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
    "Gastroenterology": "#39FF14",
    "Neurology": "#4D4DFF",
    "Ophthalmology": "#E79028",
    "Immunology": "#EA38A5",
    "Metabolic": "#133B11",
    "Dermatology": "#559368",
    "Hematology": "#CF3630",
    "Orthopedics": "#441780",
    "Pulmonology": "#CBC09F",
    "Nephrology": "#ACA3DB",
    "Oncology": "#FF84DE",
    "Hepatology": "#FF00D4",
  };
  
  const petalSVGs = {
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
  let hoveredTherapeuticArea: string | null = null;
  
  $: angleScale = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .domain(years)
    .padding(0.1);
  
  $: radiusScale = d3.scaleLog()
    .range([innerRadius, outerRadius])
    .domain([0.1, maxRPD]);

  function handleKeydown(event: KeyboardEvent) {
    if (!document.activeElement?.classList.contains('year-segment')) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        if (activeYearIndex < years.length - 1) {
          activeYearIndex++;
          const nextYear = years[activeYearIndex];
          navigateToYear(nextYear);
        }
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        if (activeYearIndex > 0) {
          activeYearIndex--;
          const prevYear = years[activeYearIndex];
          navigateToYear(prevYear);
        }
        break;
        
      case 'Home':
        event.preventDefault();
        activeYearIndex = 0;
        navigateToYear(years[0]);
        break;
        
      case 'End':
        event.preventDefault();
        activeYearIndex = years.length - 1;
        navigateToYear(years[years.length - 1]);
        break;
        
      case ' ':
      case 'Enter':
        event.preventDefault();
        handleYearClick(event as unknown as MouseEvent, activeYear);
        break;
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
    drawPetalClusters();
  }
  
  function drawGuideCircles() {
    const logBase = 1.8725;
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
      .attr("stroke-dasharray", "3,3")
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
      .attr("stroke-width", radius * 0.003)
      .attr("stroke-dasharray", (+d.Year >= 2023) ? "4,4" : "none")  // Add dotted line for 2023 and 2024
      .style("opacity", d.Year === activeYear ? 1 : 0.5);
  });
}
  
  function createPetalCluster(year: string, entries: ConstellationEntry[], position: { x: number, y: number, angle: number }) {
    const petalCount = Math.min(entries.length, 12);
    const svgContent = petalSVGs[petalCount as keyof typeof petalSVGs];
    
    const cluster = svg.append("g")
      .attr("class", `cluster year-${year}`)
      .attr("cursor", "pointer")
      .on("mouseover", () => handleClusterHover(year))
      .on("mouseout", handleClusterLeave)
      .html(svgContent);
  
    const svgElement = cluster.select("svg").node();
    if (svgElement instanceof SVGElement) {
      const svgWidth = svgElement.getAttribute("width");
      const svgHeight = svgElement.getAttribute("height");
      
      if (svgWidth && svgHeight) {
        const scale = radius * 0.001825;
        cluster.attr("transform", `
          translate(${position.x},${position.y})
          rotate(${position.angle * 180 / Math.PI})
          scale(${scale})
          translate(${-parseFloat(svgWidth)/2},${-parseFloat(svgHeight)/2})
        `);
  
        cluster.select("circle")
          .attr("class", "center-circle")
          .style("pointer-events", "none");
  
        cluster.selectAll("path:not(.center-circle)")
          .attr("class", (_, i) => `petal petal-${year}-${i}`)
          .each(function(_, i) {
            if (i < entries.length) {
              const entry = entries[i];
              const color = therapeuticAreaColors[entry.name as keyof typeof therapeuticAreaColors];
              
              d3.select(this)
                .attr("fill", color)
                .attr("stroke", "#fff")
                .style("opacity", 1)
                .style("filter", year === activeYear ? "saturate(1)" : "saturate(0.2)")
                .on("mouseover", (event) => handlePetalHover(event, entry, color))
                .on("mouseout", () => handlePetalLeave(year))
                .on("click", (event) => handlePetalClick(event, entry, color));
            }
          });
      }
    }
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
      updateVisibility(year);
      dispatch('yearChange', { year });
    }
  }

  function handleYearLeave() {
    if (hoveredYear !== activeYear) {
      hoveredYearIndex = null;
      updateVisibility(activeYear);
    }
  }

  function handleClusterHover(year: string) {
    if (year !== activeYear) {
      hoveredYearIndex = years.indexOf(year);
      updateVisibility(year);
      dispatch('yearChange', { year });
    }
  }

  function handleClusterLeave() {
    if (hoveredYear !== activeYear) {
      hoveredYearIndex = null;
      updateVisibility(activeYear);
    }
  }

  function handlePetalHover(event: MouseEvent, entry: ConstellationEntry, color: string) {
    tooltipContent = {
      sponsor: entry.Sponsor,
      drugName: entry["Drug Name"],
      therapeuticArea: entry.name,
      id: entry.id
    };
    tooltipBorderColor = color;
    tooltipX = event.pageX;
    tooltipY = event.pageY;
    tooltipVisible = true;

    dispatch('petalHover', { entry, color });
  }

  function handlePetalLeave(year: string) {
    tooltipVisible = false;
    dispatch('petalLeave');
  }

  function handlePetalClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
    event.stopPropagation();
    dispatch('clusterElementClick', { entry, color });
    activeYearIndex = years.indexOf(entry.Year);
    activeYear = entry.Year;
    updateVisibility(entry.Year);
  }

  function handleYearClick(event: MouseEvent, year: string) {
    activeYearIndex = years.indexOf(year);
    activeYear = year;
    updateVisibility(year);
    dispatch('yearChange', { year });
  }

  function updateVisibility(year: string) {
  svg.selectAll(".timeline-line")
    .transition()
    .duration(300)
    .style("opacity", d => d === year ? 1 : 0.5)
    .attr("stroke-dasharray", function() {
      // Get the year from the class name
      const lineYear = this.classList[1].split('-')[1];
      return +lineYear >= 2023 ? "4,4" : "none";
    });

    svg.selectAll(".cluster")
      .style("opacity", 1)
      .selectAll(".petal")
      .transition()
      .duration(300)
      .style("filter", function() {
        const clusterYear = this.closest(".cluster").classList[1].split("-")[1];
        return clusterYear === year ? "saturate(1)" : "saturate(0.2)";
      });

    svg.selectAll(".year-segment")
      .transition()
      .duration(300)
      .attr("fill", d => d === year ? "#C9623F" : "#fff");

    svg.selectAll("text")
      .transition()
      .duration(300)
      .attr("fill", d => d === year ? "#C9623F" : "#666")
      .attr("font-weight", d => d === activeYear ? "bold" : "normal");

    svg.selectAll(".center-circle")
      .style("transform", "none")
      .style("transition", "none")
      .style("pointer-events", "none");

      svg.selectAll(".value-label").remove();

if (year) {
  const yearData = data.find(d => d.Year === year);
  if (yearData && +yearData.RPD > 0) {
    const angle = angleScale(year)! + angleScale.bandwidth() / 2;
    const value = Math.max(0.1, +yearData.RPD);
    const radius = radiusScale(value);

    const labelRadius = innerRadius + (radius - innerRadius) * 0.245;
    const x = Math.sin(angle) * labelRadius;
    const y = -Math.cos(angle) * labelRadius;

    const rotationAngle = (angle * 180 / Math.PI) - 90;
    const finalRotation = rotationAngle > 90 && rotationAngle < 270 
      ? rotationAngle + 180 
      : rotationAngle;

    const labelGroup = svg.append("g")
      .attr("class", "value-label")
      .attr("transform", `translate(${x}, ${y}) rotate(${finalRotation})`);

    // Create a group for both text elements
    const textGroup = labelGroup.append("g")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle");

    // Main RPD value text
    const mainText = textGroup.append("text")
      .attr("fill", "#063D37")
      .attr("font-size", `${Math.min(Math.max(radius * 0.045, MIN_FONT_SIZE), MAX_FONT_SIZE)}px`)
      .attr("font-weight", "600")
      .attr("y", +2)
      .text(`${(+yearData.RPD).toLocaleString()} RPDs`);

    // Get combined bounding box for both texts
    const textBox = textGroup.node()?.getBBox();
  if (textBox) {
      // Add background rectangle
      labelGroup.insert("rect", "g")  // Insert before the text group
        .attr("x", textBox.x - 10)
        .attr("y", textBox.y - 5)
        .attr("width", textBox.width + 20)
        .attr("height", textBox.height + 10)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("stroke", "#063D37")
        .attr("fill", "white")
        .attr("opacity", 0.9);
    }

    labelGroup
      .style("opacity", 0)
      .transition()
      .duration(300)
      .style("opacity", 1);
  }
}
}


function handleLegendAreaHover(event: CustomEvent<{ area: string }>) {
    hoveredTherapeuticArea = event.detail.area;
    updatePetalHighlights();
  }

  function handleLegendAreaLeave() {
    hoveredTherapeuticArea = null;
    updatePetalHighlights();
  }

  function updatePetalHighlights() {
    svg.selectAll(".petal")
      .transition()
      .duration(200)
      .style("filter", function() {
        const petalElement = this as SVGElement;
        const cluster = petalElement.closest('.cluster');
        if (!cluster) return "saturate(0.2)";
        
        const year = cluster.classList[1].split('-')[1];
        const entries = groupedConstellationData.get(year) || [];
        const petalIndex = Array.from(cluster.querySelectorAll('.petal')).indexOf(petalElement);
        const entry = entries[petalIndex];
        
        if (!hoveredTherapeuticArea) {
          // No area hovered - normal state
          return year === activeYear ? "saturate(1)" : "saturate(0.2)";
        }
        
        // Area is hovered - highlight matching petals
        if (entry?.name === hoveredTherapeuticArea) {
          return "saturate(1.2) brightness(1.1)"; // Slightly enhance matched petals
        } else {
          return "saturate(0) brightness(0.9)"; // Fully desaturate and slightly dim others
        }
      })
      .style("opacity", function() {
        if (!hoveredTherapeuticArea) return 1;
        
        const petalElement = this as SVGElement;
        const cluster = petalElement.closest('.cluster');
        if (!cluster) return 1;
        
        const year = cluster.classList[1].split('-')[1];
        const entries = groupedConstellationData.get(year) || [];
        const petalIndex = Array.from(cluster.querySelectorAll('.petal')).indexOf(petalElement);
        const entry = entries[petalIndex];
        
        return entry?.name === hoveredTherapeuticArea ? 1 : 0.8; // Slight opacity reduction for non-matches
      });
  }

  function handleResize() {
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;
    initializeChart();
    updateVisibility(activeYear);
  }

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
  position="top-right"
  on:areaHover={handleLegendAreaHover}
  on:areaLeave={handleLegendAreaLeave}
/>

<div class="radial-timeline" bind:this={container}>
  {#if tooltipVisible}
    <Tooltip
      x={tooltipX}
      y={tooltipY}
      visible={tooltipVisible}
      content={tooltipContent}
      borderColor={tooltipBorderColor}
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
    transition: filter 0.3s ease, transform 0.3s ease, opacity 0.2s ease;
    transform-origin: bottom center;
  }

  :global(.cluster .petal:hover) {
    filter: saturate(1.2) brightness(1.1) !important;
    opacity: 1 !important;
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
    text-shadow: -1px -1px 0 #fff,  
            1px -1px 0 #fff,
           -1px  1px 0 #fff,
            1px  1px 0 #fff;
  }
</style>
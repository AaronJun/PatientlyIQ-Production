<script lang="ts">
import { onMount, createEventDispatcher } from 'svelte';
import * as d3 from 'd3';
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
import ThirteenPetal from '../../assets/13PetalNew.svg?raw';
import FourteenPetal from '../../assets/14PetalNew.svg?raw';
import FifteenPetal from '../../assets/15PetalNew.svg?raw';
import SixteenPetal from '../../assets/16PetalNew.svg?raw';
import SeventeenPetal from '../../assets/17PetalNew.svg?raw';
import EighteenPetal from '../../assets/18PetalNew.svg?raw';
import NineteenPetal from '../../assets/19PetalNew.svg?raw';
import TwentyPetal from '../../assets/20PetalNew.svg?raw';
import RPDTooltip from './RPDTooltip.svelte';

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

interface RPDData {
  "Therapeutic area": string;
  "Number of RPD designations": string;
}

export let constellationData: ConstellationEntry[];
export let selectedArea: string | null = null;

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
let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
let containerWidth: number;
let containerHeight: number;

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

const SATURATION = {
  DEFAULT: 0.025,
  HOVERED: 1.2,
  CLUSTER: 0.625
};

const OPACITY = {
  DEFAULT: 0.8,
  HOVERED: 1,
  DIMMED: 0.3
};

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 16;
const MAX_PETALS = 20;

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
  "Oncology": "#F7CE55",
  "Endocrinology": "#b15928",
  "Hepatology": "#8dd3c7"
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
  12: TwelvePetal,
  13: ThirteenPetal,
  14: FourteenPetal,
  15: FifteenPetal,
  16: SixteenPetal,
  17: SeventeenPetal,
  18: EighteenPetal,
  19: NineteenPetal,
  20: TwentyPetal
};

$: groupedData = d3.group(constellationData, d => d.name);

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

$: angleScale = d3.scaleBand()
  .range([0, 2 * Math.PI])
  .domain(therapeuticAreas)
  .padding(0.5);

let hoveredArea: string | null = null;
let activeArea: string | null = null;

function createColorScale(baseColor: string, count: number): d3.ScaleLinear<string, string> {
  return d3.scaleLinear<string>()
    .domain([0, count - 1])
    .range([baseColor, d3.color(baseColor)!.brighter(1.2).toString()])
    .interpolate(d3.interpolateHcl);
}

function getColorForId(area: string, id: string, allIds: string[]): string {
  const baseColor = therapeuticAreaColors[area as keyof typeof therapeuticAreaColors];
  if (!baseColor) return "#000000";
  const colorScale = createColorScale(baseColor, allIds.length);
  const idIndex = allIds.indexOf(id);
  return colorScale(idIndex);
}

function drawVisualization() {
  if (!svg) return;

  svg.selectAll("*").remove();

  d3.select(container)
    .select("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("width", "100%")
    .attr("height", "100%");

  // Calculate max radius based on data
  const maxRadius = Math.max(...Array.from(groupedData.values()).map(entries => {
    const area = entries[0]?.name;
    const rpdData = constellationData[0]?.RPDdata || [];
    const areaRPDCount = rpdData.find(d => 
      d["Therapeutic area"].toLowerCase() === area?.toLowerCase() ||
      (d["Therapeutic area"] === "Other" && !rpdData.some(rd => 
        rd["Therapeutic area"].toLowerCase() === area?.toLowerCase()
      ))
    );
    return areaRPDCount ? parseInt(areaRPDCount["Number of RPD designations"]) : 1;
  }));

  // Generate logarithmic guide circles with fewer ticks
  const allGuideValues = radiusScale.ticks(6);
  const guideValues = allGuideValues.filter(d => d <= maxRadius);
  
  // Draw all guide circles but only label alternate ones
  svg.selectAll(".guide-circle")
    .data(guideValues)
    .join("circle")
    .attr("class", "guide-circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", d => Math.min(radiusScale(d), outerRadius * 0.8))
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 0.5)
    .attr("stroke-dasharray", "2,4")
    .style("opacity", 0.3);

  // Add value labels to alternate guide circles
  svg.selectAll(".guide-label")
    .data(guideValues.filter((_, i) => i % 2 === 0))
    .join("text")
    .attr("class", "guide-label")
    .attr("y", d => -Math.min(radiusScale(d), outerRadius * 0.8))
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .attr("fill", "#666")
    .attr("font-size", `${Math.min(Math.max(radius * 0.02, MIN_FONT_SIZE), MAX_FONT_SIZE)}px`)
    .text(d => d);


  therapeuticAreas.forEach(area => {
    const angle = angleScale(area)! + angleScale.bandwidth() / 1.2;
    const entries = groupedData.get(area) || [];

    // Get RPD designation count
    const rpdData = constellationData[0]?.RPDdata || [];
    const areaRPDCount = rpdData.find(d => 
      d["Therapeutic area"].toLowerCase() === area.toLowerCase() ||
      (d["Therapeutic area"] === "Other" && !rpdData.some(rd => 
        rd["Therapeutic area"].toLowerCase() === area.toLowerCase()
      ))
    );

    // Calculate line length using log scale and limit to 80% of outer radius
    const rpdCount = areaRPDCount 
      ? parseInt(areaRPDCount["Number of RPD designations"])
      : 1;
    const lineLength = Math.min(radiusScale(Math.max(1, rpdCount)), outerRadius * 0.8);

    svg.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", Math.cos(angle - Math.PI / 2) * lineLength)
      .attr("y2", Math.sin(angle - Math.PI / 2) * lineLength)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.5);

    const labelRadius = outerRadius * 0.9275; // Reduced from 0.825 to 0.7
    const labelAngle = angle - Math.PI / 2;
    const labelX = Math.cos(labelAngle) * labelRadius;
    const labelY = Math.sin(labelAngle) * labelRadius;

    const textRotation = (angle * 180 / Math.PI);
    const finalRotation = textRotation > 90 && textRotation < 270 
      ? textRotation
      : textRotation;

    const labelGroup = svg.append("g")
      .attr("class", `area-label-group area-${area.toLowerCase().replace(/\s+/g, '-')}`)
      .style("cursor", "pointer")
      .on("mouseover", () => handleAreaHover(area))
      .on("mouseout", handleAreaLeave);

    labelGroup.append("text")
      .attr("class", "area-label")
      .attr("transform", `translate(${labelX},${labelY}) rotate(${finalRotation})`)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", `${Math.min(Math.max(radius * 0.025, MIN_FONT_SIZE), MAX_FONT_SIZE)}px`)
      .attr("fill", "#666666")
      .attr("font-weight", "400")
      .style("opacity", 0.7)
      .text(area);

    if (entries.length > 0) {
      createPetalCluster(entries, area, angle, rpdCount);
    }
  });
}

function createPetalCluster(entries: ConstellationEntry[], area: string, angle: number, rpdCount: number) {
  const clusters: ConstellationEntry[][] = [];
  for (let i = 0; i < entries.length; i += MAX_PETALS) {
    clusters.push(entries.slice(i, i + MAX_PETALS));
  }

  const clusterRadius = radiusScale(Math.max(1, rpdCount));
  const clusterPadding = 1.0725; // 5% padding

  clusters.forEach((clusterEntries, clusterIndex) => {
    const x = Math.cos(angle - Math.PI / 2) * clusterRadius;
    const y = Math.sin(angle - Math.PI / 2) * clusterRadius;

    const petalCount = Math.min(clusterEntries.length, MAX_PETALS);
    const svgContent = petalSVGs[petalCount as keyof typeof petalSVGs];
    const uniqueIds = [...new Set(clusterEntries.map(e => e.id))];

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');

    clusterEntries.forEach((entry, index) => {
      const petalPaths = Array.from(doc.querySelectorAll('path')).filter(path => {
        const d = path.getAttribute('d');
        return d && d.includes('C');
      });

      const startIdx = index * 3;
      const color = getColorForId(area, entry.id, uniqueIds);
      const isApproved = entry["Treatment Type"] && entry["Treatment Type"] !== "N";
      const isPurchased = entry.Purchased?.toLowerCase() === 'y';

      if (petalPaths[startIdx]) {
        petalPaths[startIdx].setAttribute('class', 'petal-part background-petal');
        petalPaths[startIdx].setAttribute('data-therapeutic-area', entry.name);
        petalPaths[startIdx].setAttribute('data-petal-index', index.toString());
        petalPaths[startIdx].setAttribute('fill', '#231F20');
        petalPaths[startIdx].setAttribute('opacity', '0');
        petalPaths[startIdx].setAttribute('style', `filter: saturate(0.25)`);
      }
      petalPaths[startIdx + 1].setAttribute('class', 'petal-part outer-petal');
        petalPaths[startIdx + 1].setAttribute('data-therapeutic-area', entry.name);
        petalPaths[startIdx + 1].setAttribute('data-petal-index', index.toString());
        petalPaths[startIdx + 1].setAttribute('fill', color);
        petalPaths[startIdx + 1].setAttribute('stroke', isApproved ? '#231F20' : '#F2F0E4');
        petalPaths[startIdx + 1].setAttribute('stroke-width', '4');
        petalPaths[startIdx + 1].setAttribute('style', `filter: saturate(0.1)`)

      if (petalPaths[startIdx + 2]) {
        petalPaths[startIdx + 2].setAttribute('class', 'petal-part inner-petal');
        petalPaths[startIdx + 2].setAttribute('data-therapeutic-area', entry.name);
        petalPaths[startIdx + 2].setAttribute('data-petal-index', index.toString());
        petalPaths[startIdx + 2].setAttribute('fill', isPurchased ? '#1e1e1e' : '#FFE7A0');
        petalPaths[startIdx + 2].setAttribute('style', `filter: saturate(0.1)`);
      }
    });

    const cluster = svg.append("g")
      .attr("class", `cluster area-${area.toLowerCase().replace(/\s+/g, '-')}`)
      .attr("cursor", "pointer")
      .on("mouseover", () => handleAreaHover(area))
      .on("mouseout", handleAreaLeave)
      .html(doc.documentElement.outerHTML);

    const scale = radius * 0.000725;
    cluster.attr("transform", `
      translate(${x * clusterPadding},${y * clusterPadding})
      rotate(${(angle * 180 / Math.PI)})
      scale(${scale})
      translate(-${parseFloat(doc.documentElement.getAttribute('width') || '0')/2},-${parseFloat(doc.documentElement.getAttribute('height') || '0')/2})
    `);

    cluster.selectAll("path")
      .each(function(_, i) {
        const element = d3.select(this);
        const entry = clusterEntries[Math.floor(i/3)];
        if (entry) {
          const color = getColorForId(area, entry.id, uniqueIds);
          element
            .style("filter", "saturate(0.1)")
            .style("opacity", 1)
            .on("mouseover", (event) => handlePetalHover(event, entry, color))
            .on("mouseout", () => handlePetalLeave(area))
            .on("click", (event) => handlePetalClick(event, entry, color));
        }
      });
  });
}

function updatePetalStyles() {
  svg.selectAll('.petal-part:not(.background-petal)')
    .transition()
    .duration(200)
    .style("filter", function() {
      const therapeuticArea = d3.select(this).attr('data-therapeutic-area');
      
      if (!hoveredArea) {
        return `saturate(${SATURATION.DEFAULT})`;
      }
      
      return therapeuticArea === hoveredArea
        ? `saturate(${SATURATION.HOVERED}) brightness(1)`
        : `saturate(${SATURATION.CLUSTER}) brightness(0.3)`;
    })
    .style("opacity", function() {
      const therapeuticArea = d3.select(this).attr('data-therapeutic-area');
      
      if (!hoveredArea) {
        return OPACITY.DEFAULT;
      }
      
      return therapeuticArea === hoveredArea ? OPACITY.HOVERED : OPACITY.DIMMED;
    });

  svg.selectAll('.background-petal')
    .transition()
    .duration(200)
    .style("opacity", function() {
      const therapeuticArea = d3.select(this).attr('data-therapeutic-area');
      return therapeuticArea === hoveredArea ? OPACITY.HOVERED : 0;
    })
    .style("fill", function() {
      return hoveredArea ? "#FF1515" : "#231F20";
    });
}

function updatePetalHighlights() {
  svg.selectAll('.petal-part')
    .transition()
    .duration(200)
    .style("filter", function() {
      const petalElement = d3.select(this);
      const therapeuticArea = petalElement.attr('data-therapeutic-area');
      
      if (!hoveredArea) {
        return "saturate(0.25)";
      }
      
      return therapeuticArea === hoveredArea
        ? "saturate(1) brightness(1)"
        : "saturate(0.1) brightness(0.3)";
    })
    .style("opacity", 1);

  svg.selectAll('.background-petal')
    .transition()
    .duration(200)
    .style("opacity", function() {
      const therapeuticArea = d3.select(this).attr('data-therapeutic-area');
      return therapeuticArea === hoveredArea ? 1 : 0;
    })
    .style("fill", function() {
      return hoveredArea ? "#ff1515" : "#231F20";
    });
}

function updateVisualState() {
  const currentArea = hoveredArea || activeArea;
  
  svg.selectAll('.area-label')
    .transition()
    .duration(200)
    .attr('fill', function() {
      const area = this.textContent;
      if (!area) return '#666666';
      return currentArea === area 
        ? therapeuticAreaColors[area as keyof typeof therapeuticAreaColors]
        : '#666666';
    })
    .attr('font-weight', function() {
      const area = this.textContent;
      return currentArea === area ? '800' : '400';
    })
    .style('opacity', function() {
      const area = this.textContent;
      return currentArea ? (currentArea === area ? 1 : 0.5) : 0.7;
    });

  svg.selectAll(".cluster")
    .transition()
    .duration(300)
    .style("opacity", function() {
      if (!currentArea) return 1;
      return this.classList.contains(`area-${currentArea.toLowerCase().replace(/\s+/g, '-')}`) ? 1 : 0.3;
    });

  svg.selectAll('.petal-part:not(.background-petal)')
    .transition()
    .duration(200)
    .style("filter", function() {
      const therapeuticArea = d3.select(this).attr('data-therapeutic-area');
      
      if (!currentArea) {
        return `saturate(${SATURATION.DEFAULT})`;
      }
      
      return therapeuticArea === currentArea
        ? `saturate(${SATURATION.HOVERED}) brightness(1.1)`
        : `saturate(${SATURATION.CLUSTER}) brightness(0.4)`;
    })
    .style("opacity", function() {
      const therapeuticArea = d3.select(this).attr('data-therapeutic-area');
      
      if (!currentArea) {
        return OPACITY.DEFAULT;
      }
      
      return therapeuticArea === currentArea ? OPACITY.HOVERED : OPACITY.DIMMED;
    });

  svg.selectAll('.background-petal')
    .transition()
    .duration(200)
    .style("opacity", 0)
    .style("fill", "#231F20");
}

function updateLabels() {
  svg.selectAll('.area-label')
    .transition()
    .duration(200)
    .attr('fill', function() {
      const area = this.textContent;
      return hoveredArea === area 
        ? therapeuticAreaColors[area as keyof typeof therapeuticAreaColors]
        : '#666666';
    })
    .attr('font-weight', function() {
      const area = this.textContent;
      return hoveredArea === area ? '600' : '400';
    })
    .style('opacity', function() {
      const area = this.textContent;
      return hoveredArea ? (hoveredArea === area ? 1 : 0.5) : 0.7;
    });
}

function handleAreaHover(area: string) {
  hoveredArea = area;
  const entries = groupedData.get(area) || [];
  
  const stats = {
    totalVouchers: entries.length,
    purchasedCount: entries.filter(d => d.Purchased?.toLowerCase() === 'y').length,
    uniqueSponsors: new Set(entries.map(d => d.Sponsor)).size,
    yearRange: {
      start: Math.min(...entries.map(d => parseInt(d.Year))).toString(),
      end: Math.max(...entries.map(d => parseInt(d.Year))).toString()
    }
  };

  const summaryText = `${area} has contributed ${stats.totalVouchers} priority review vouchers from ${
    stats.yearRange.start} to ${stats.yearRange.end}, involving ${stats.uniqueSponsors} sponsor${
    stats.uniqueSponsors !== 1 ? 's' : ''}${
    stats.purchasedCount > 0 ? `. ${stats.purchasedCount} voucher${
    stats.purchasedCount !== 1 ? 's were' : ' was'} sold` : ''
  }. Hover over petals to explore specific therapeutics.`;

  dispatch('areaSummary', { summaryText });
  dispatch('areaHover', { area });

  svg.selectAll(".cluster")
    .transition()
    .duration(300)
    .style("opacity", function() {
      return this.classList.contains(`area-${area.toLowerCase().replace(/\s+/g, '-')}`) ? 1 : 0.3;
    });

  updateLabels();
  updatePetalHighlights();
}

function handleAreaLeave() {
  hoveredArea = null;
  updateVisualState();
  
  if (!activeArea) {
    dispatch('areaSummary', { summaryText: '' });
    dispatch('areaLeave');
  }
}

function handlePetalHover(event: MouseEvent, entry: ConstellationEntry, color: string) {
  const currentElement = event.currentTarget as SVGElement;
  const petalIndex = d3.select(currentElement).attr('data-petal-index');
  
  const petalGroup = d3.select(currentElement.parentElement)
    .selectAll("path")
    .filter((_, i, nodes) => {
      const currentPetalIndex = d3.select(nodes[i]).attr('data-petal-index');
      return currentPetalIndex === petalIndex;
    });
  
  petalGroup
    .transition()
    .duration(200)
    .style("filter", "saturate(.125) brightness(1.1)")
    .style("opacity", 1);

  petalGroup.filter(".background-petal")
    .transition()
    .duration(200)
    .style("opacity", 1)
    .style("fill", "#ff1515");

  tooltipContent = {
    sponsor: entry.Sponsor,
    drugName: entry["Drug Name"],
    therapeuticArea: entry.name,
    id: entry.id
  };
  tooltipBorderColor = color;
  
  const containerRect = container.getBoundingClientRect();
  tooltipX = containerRect.left + (containerRect.width / 2.25);
  tooltipY = containerRect.top + (containerRect.height / 1.75);
  tooltipVisible = true;

  dispatch('petalHover', { event, entry, color });
}

function handlePetalLeave(area: string) {
  tooltipVisible = false;
  svg.selectAll(`.cluster.area-${area.toLowerCase().replace(/\s+/g, '-')} path`)
    .transition()
    .duration(799)
    .style("filter", hoveredArea === area ? "saturate(1.2)" : "saturate(0.125)")
    .style("opacity", hoveredArea === area ? 1 : 0.3);

  svg.selectAll('.background-petal')
    .style("opacity", 0)
    .style("fill", function() {
      return d3.select(this).attr('data-original-fill');
    });

  dispatch('petalLeave');
}

function handlePetalClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
  event.stopPropagation();
  dispatch('clusterElementClick', { entry, color });
}

function handleResize() {
  containerWidth = container.clientWidth;
  containerHeight = container.clientHeight;
  
  if (svg) {
    drawVisualization();
    updatePetalStyles();
  }
}

onMount(() => {
  containerWidth = container.clientWidth;
  containerHeight = container.clientHeight;

  const svgElement = d3.select(container)
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("width", "100%")
    .attr("height", "100%");

  svg = svgElement.append("g");

  drawVisualization();

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  return () => {
    resizeObserver.disconnect();
  };
});
</script>


<div class="therapeutic-area-radial" bind:this={container}>
</div>

{#if tooltipVisible}
  <RPDTooltip
    x={tooltipX}
    y={tooltipY}
    visible={tooltipVisible}
    content={tooltipContent}
    borderColor={tooltipBorderColor}
  />
{/if}

<style>
.therapeutic-area-radial {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

:global(.cluster) {
  transition: all 300ms ease-in-out;
}

:global(.background-petal) {
  transition: opacity 200ms ease-in-out;
}

:global(.outer-petal), :global(.inner-petal) {
  transition: all 200ms ease-in-out;
}

:global(.cluster path) {
  transition: all 300ms ease-in-out;
  transform-origin: center;
}

:global(.cluster path:hover) {
  filter: saturate(1.1) !important;
  opacity: 1 !important;
}

:global(.area-label-group) {
  transition: opacity 0.3s ease;
}

:global(.area-label-group:hover) {
  opacity: 0.8;
}

:global(.area-label) {
  font-family: 'IBM Plex Sans', sans-serif;
}
</style>
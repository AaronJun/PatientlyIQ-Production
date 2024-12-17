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

export let constellationData: ConstellationEntry[];
export let selectedType: string | null = null;

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
const MAX_FONT_SIZE = 18;
const MAX_PETALS = 20;

$: width = (containerWidth || 900) * .9;
$: height = (containerHeight || 800);
$: radius = Math.min(width, height) / 2.125;
$: innerRadius = radius * 0.25;
$: outerRadius = radius * 1.025;

// Treatment type colors - using a different color scheme from therapeutic areas
const treatmentTypeColors = {
  "Gene therapy": "#2ecc71",
  "Enzyme Replacement": "#3498db",
  "Immunotherapy": "#9b59b6",
  "Enzyme inhibitor": "#e74c3c",
  "Pharmacotherapies": "#f1c40f",
  "RNA interference": "#1abc9c",
  "Immunosuppresant": "#e67e22",
  "Analogs & derivatives": "#95a5a6",
  "Biologic": "#34495e",
  "Peptides": "#16a085",
  "Organic Chemicals": "#27ae60",
  "Hypoglycemic Agents": "#2980b9",
  "Other": "#7f8c8d"
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

// Process data by Treatment Type instead of therapeutic area
$: groupedData = d3.group(constellationData, d => d["Treatment Type"] || "Other");
$: treatmentTypes = Array.from(groupedData.keys());
$: angleScale = d3.scaleBand()
  .range([0, 2 * Math.PI])
  .domain(treatmentTypes)
  .padding(0.1);

let hoveredType: string | null = null;

function createColorScale(baseColor: string, count: number): d3.ScaleLinear<string, string> {
  return d3.scaleLinear<string>()
    .domain([0, count - 1])
    .range([baseColor, d3.color(baseColor)!.brighter(1.2).toString()])
    .interpolate(d3.interpolateHcl);
}

function getColorForId(type: string, id: string, allIds: string[]): string {
  const baseColor = treatmentTypeColors[type as keyof typeof treatmentTypeColors] || treatmentTypeColors["Other"];
  const colorScale = createColorScale(baseColor, allIds.length);
  const idIndex = allIds.indexOf(id);
  return colorScale(idIndex);
}

function updatePetalStyles() {
  svg.selectAll('.petal-part:not(.background-petal)')
    .transition()
    .duration(200)
    .style("filter", function() {
      const treatmentType = d3.select(this).attr('data-treatment-type');
      
      if (!hoveredType) {
        return `saturate(${SATURATION.DEFAULT})`;
      }
      
      return treatmentType === hoveredType
        ? `saturate(${SATURATION.HOVERED}) brightness(1)`
        : `saturate(${SATURATION.CLUSTER}) brightness(0.3)`;
    })
    .style("opacity", function() {
      const treatmentType = d3.select(this).attr('data-treatment-type');
      
      if (!hoveredType) {
        return OPACITY.DEFAULT;
      }
      
      return treatmentType === hoveredType ? OPACITY.HOVERED : OPACITY.DIMMED;
    });

  svg.selectAll('.background-petal')
    .transition()
    .duration(200)
    .style("opacity", function() {
      const treatmentType = d3.select(this).attr('data-treatment-type');
      return treatmentType === hoveredType ? OPACITY.HOVERED : 0;
    })
    .style("fill", function() {
      return hoveredType ? "#FF1515" : "#231F20";
    });
}

function createPetalCluster(entries: ConstellationEntry[], type: string, angle: number) {
  const clusters: ConstellationEntry[][] = [];
  for (let i = 0; i < entries.length; i += MAX_PETALS) {
    clusters.push(entries.slice(i, i + MAX_PETALS));
  }

  clusters.forEach((clusterEntries, clusterIndex) => {
    const clusterRadius = innerRadius + (outerRadius - innerRadius) * 
      ((clusterIndex + 1) / (clusters.length + 1));
    
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
      const color = getColorForId(type, entry.id, uniqueIds);
      const isApproved = entry["Treatment Type"] && entry["Treatment Type"] !== "N";
      const isPurchased = entry.Purchased?.toLowerCase() === 'y';

      // Background petal
      if (petalPaths[startIdx]) {
        petalPaths[startIdx].setAttribute('class', 'petal-part background-petal');
        petalPaths[startIdx].setAttribute('data-treatment-type', entry["Treatment Type"] || "Other");
        petalPaths[startIdx].setAttribute('data-petal-index', index.toString());
        petalPaths[startIdx].setAttribute('fill', '#231F20');
        petalPaths[startIdx].setAttribute('opacity', '0');
      }

      // Outer petal
      if (petalPaths[startIdx + 1]) {
        petalPaths[startIdx + 1].setAttribute('class', 'petal-part outer-petal');
        petalPaths[startIdx + 1].setAttribute('data-treatment-type', entry["Treatment Type"] || "Other");
        petalPaths[startIdx + 1].setAttribute('data-petal-index', index.toString());
        petalPaths[startIdx + 1].setAttribute('fill', color);
        petalPaths[startIdx + 1].setAttribute('stroke', isApproved ? '#231F20' : '#F2F0E4');
        petalPaths[startIdx + 1].setAttribute('stroke-width', '4');
      }

      // Inner petal
      if (petalPaths[startIdx + 2]) {
        petalPaths[startIdx + 2].setAttribute('class', 'petal-part inner-petal');
        petalPaths[startIdx + 2].setAttribute('data-treatment-type', entry["Treatment Type"] || "Other");
        petalPaths[startIdx + 2].setAttribute('data-petal-index', index.toString());
        petalPaths[startIdx + 2].setAttribute('fill', isPurchased ? '#1e1e1e' : '#FFE7A0');
      }
    });

    const cluster = svg.append("g")
      .attr("class", `cluster type-${type.toLowerCase().replace(/\s+/g, '-')}`)
      .attr("cursor", "pointer")
      .on("mouseover", () => handleTypeHover(type))
      .on("mouseout", handleTypeLeave)
      .html(doc.documentElement.outerHTML);

    const scale = radius * 0.000725;
    cluster.attr("transform", `
      translate(${x},${y})
      rotate(${(angle * 180 / Math.PI)})
      scale(${scale})
      translate(-${parseFloat(doc.documentElement.getAttribute('width') || '0')/2},-${parseFloat(doc.documentElement.getAttribute('height') || '0')/2})
    `);

    cluster.selectAll("path")
      .each(function(_, i) {
        const element = d3.select(this);
        const entry = clusterEntries[Math.floor(i/3)];
        if (entry) {
          const color = getColorForId(type, entry.id, uniqueIds);
          element
            .on("mouseover", (event) => handlePetalHover(event, entry, color))
            .on("mouseout", () => handlePetalLeave(type))
            .on("click", (event) => handlePetalClick(event, entry, color));
        }
      });
  });
}

function handleTypeHover(type: string) {
  hoveredType = type;
  const entries = groupedData.get(type) || [];
  
  const stats = {
    totalVouchers: entries.length,
    purchasedCount: entries.filter(d => d.Purchased?.toLowerCase() === 'y').length,
    uniqueSponsors: new Set(entries.map(d => d.Sponsor)).size,
    yearRange: {
      start: Math.min(...entries.map(d => parseInt(d.Year))).toString(),
      end: Math.max(...entries.map(d => parseInt(d.Year))).toString()
    }
  };

  const summaryText = `${type} treatment has generated ${stats.totalVouchers} priority review vouchers from ${
    stats.yearRange.start} to ${stats.yearRange.end}, involving ${stats.uniqueSponsors} sponsor${
    stats.uniqueSponsors !== 1 ? 's' : ''}${
    stats.purchasedCount > 0 ? `. ${stats.purchasedCount} voucher${
    stats.purchasedCount !== 1 ? 's were' : ' was'} sold` : ''
  }. Hover over petals to explore specific therapeutics.`;

  dispatch('typeSummary', { summaryText });
  dispatch('typeHover', { type });

  updatePetalStyles();
  updateLabels();
}

function handleTypeLeave() {
  hoveredType = null;
  updateVisualState();
  
  if (!selectedType) {
    dispatch('typeSummary', { summaryText: '' });
    dispatch('typeLeave');
  }
}

function handlePetalHover(event: MouseEvent, entry: ConstellationEntry, color: string) {
  const currentElement = event.currentTarget as SVGElement;
  const petalIndex = d3.select(currentElement).attr('data-petal-index');
  
  tooltipContent = {
    sponsor: entry.Sponsor,
    drugName: entry["Drug Name"],
    therapeuticArea: entry.name,
    id: entry.id
  };
  tooltipBorderColor = color;
  
  const containerRect = container.getBoundingClientRect();
  tooltipX = containerRect.left + (containerRect.width / 2.25);
  tooltipY = containerRect.top + (containerRect.height / 2.25);
  tooltipVisible = true;

  dispatch('petalHover', { event, entry, color });
}

function handlePetalLeave(type: string) {
  tooltipVisible = false;
  updatePetalStyles();
  dispatch('petalLeave');
}

function handlePetalClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
  event.stopPropagation();
  dispatch('clusterElementClick', { entry, color });
}

function updateLabels() {
  svg.selectAll('.type-label')
    .transition()
    .duration(200)
    .attr('fill', function() {
      const type = this.textContent;
      return hoveredType === type 
        ? treatmentTypeColors[type as keyof typeof treatmentTypeColors]
        : '#666666';
    })
    .attr('font-weight', function() {
      const type = this.textContent;
      return hoveredType === type ? '600' : '400';
    })
    .style('opacity', function() {
      const type = this.textContent;
      return hoveredType ? (hoveredType === type ? 1 : 0.5) : 0.7;
    });
}

function updateVisualState() {
  const currentType = hoveredType || selectedType;
  
  svg.selectAll('.type-label')
    .transition()
    .duration(200)
    .attr('fill', function() {
      const type = this.textContent;
      if (!type) return '#666666';
      return currentType === type 
        ? treatmentTypeColors[type as keyof typeof treatmentTypeColors]
        : '#666666';
    })
    .attr('font-weight', function() {
      const type = this.textContent;
      return currentType === type ? '800' : '400';
    })
    .style('opacity', function() {
      const type = this.textContent;
      return currentType ? (currentType === type ? 1 : 0.5) : 0.7;
    });

  svg.selectAll(".cluster")
    .transition()
    .duration(300)
    .style("opacity", function() {
      if (!currentType) return 1;
      return this.classList.contains(`type-${currentType.toLowerCase().replace(/\s+/g, '-')}`) ? 1 : 0.3;
    });

  svg.selectAll('.petal-part:not(.background-petal)')
    .transition()
    .duration(200)
    .style("filter", function() {
      const treatmentType = d3.select(this).attr('data-treatment-type');
      
      if (!currentType) {
        return `saturate(${SATURATION.DEFAULT})`;
      }
      
      return treatmentType === currentType
        ? `saturate(${SATURATION.HOVERED}) brightness(1.1)`
        : `saturate(${SATURATION.CLUSTER}) brightness(0.4)`;
    })
    .style("opacity", function() {
      const treatmentType = d3.select(this).attr('data-treatment-type');
      
      if (!currentType) {
        return OPACITY.DEFAULT;
      }
      
      return treatmentType === currentType ? OPACITY.HOVERED : OPACITY.DIMMED;
    });

  svg.selectAll('.background-petal')
    .transition()
    .duration(200)
    .style("opacity", 0)
    .style("fill", "#231F20");
}

function drawVisualization() {
  if (!svg) return;

  svg.selectAll("*").remove();

  d3.select(container)
    .select("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("width", "100%")
    .attr("height", "100%");

  // Draw guide circles
  const guideRadii = [innerRadius, (innerRadius + outerRadius) / 2, outerRadius];
  svg.selectAll(".guide-circle")
    .data(guideRadii)
    .join("circle")
    .attr("class", "guide-circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", d => d)
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 0.5)
    .attr("stroke-dasharray", "2,4")
    .style("opacity", 0.3);

  // Draw axis lines and labels for each treatment type
  treatmentTypes.forEach(type => {
    const angle = angleScale(type)! + angleScale.bandwidth() / 2;
    const entries = groupedData.get(type) || [];

    // Draw axis line
    svg.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", Math.cos(angle - Math.PI / 2) * outerRadius/2)
      .attr("y2", Math.sin(angle - Math.PI / 2) * outerRadius/2)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.5);

    // Add label
    const labelRadius = outerRadius * .825;
    const labelAngle = angle - Math.PI / 2;
    const labelX = Math.cos(labelAngle) * labelRadius;
    const labelY = Math.sin(labelAngle) * labelRadius;
    
    const textRotation = (angle * 180 / Math.PI);
    const finalRotation = textRotation > 90 && textRotation < 270 
      ? textRotation + 180
      : textRotation;

    const labelGroup = svg.append("g")
      .attr("class", `type-label-group type-${type.toLowerCase().replace(/\s+/g, '-')}`)
      .style("cursor", "pointer")
      .on("mouseover", () => handleTypeHover(type))
      .on("mouseout", handleTypeLeave);

    labelGroup.append("text")
      .attr("class", "type-label")
      .attr("transform", `translate(${labelX},${labelY}) rotate(${finalRotation})`)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", `${Math.min(Math.max(radius * 0.025, MIN_FONT_SIZE), MAX_FONT_SIZE)}px`)
      .attr("fill", "#666666")
      .attr("font-weight", "400")
      .style("opacity", 0.7)
      .text(type);

    // Create petal clusters for this treatment type
    if (entries.length > 0) {
      createPetalCluster(entries, type, angle);
    }
  });
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

<div class="treatment-type-radial" bind:this={container}>
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
.treatment-type-radial {
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

:global(.type-label-group) {
transition: opacity 0.3s ease;
}

:global(.type-label-group:hover) {
opacity: 0.8;
}

:global(.type-label) {
font-family: 'IBM Plex Sans', sans-serif;
}
</style>
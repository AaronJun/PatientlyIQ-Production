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
    "Sale  Price (USD, Millions)"?: string;
  }

  interface TASummaryStats {
    totalVouchers: number;
    purchasedCount: number;
    totalValue: number;
    uniqueSponsors: number;
    yearRange: { start: string; end: string };
  }

  export let constellationData: ConstellationEntry[];
  export let selectedArea: string | null = null;

  const dispatch = createEventDispatcher();

  let container: HTMLElement;
  let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  let containerWidth: number;
  let containerHeight: number;

  const MIN_FONT_SIZE = 8;
  const MAX_FONT_SIZE = 12;
  const MAX_PETALS = 10;
  const CLUSTER_SCALE = 0.0002025;
  const INNER_RADIUS_RATIO = 0.0625;
  const OUTER_RADIUS_RATIO = 1.625;
  const LABEL_RADIUS_OFFSET = 0.6725;
  // Add new constant for cluster spacing
  const CLUSTER_SPACING_RATIO = 0.7275; // Controls how spread out multiple clusters are

  $: width = (containerWidth || 900) * 1.5;
  $: height = (containerHeight || 900) * 1.25;
  $: maxRadius = Math.min(width, height) / 2.125;
  $: innerRadius = maxRadius * INNER_RADIUS_RATIO/2.725;
  $: outerRadius = maxRadius * OUTER_RADIUS_RATIO/1.725;

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

  $: groupedData = d3.group(constellationData, d => d.name);
  $: areaStats = Array.from(groupedData.entries()).map(([area, entries]) => {
    const clusters = [];
    for (let i = 0; i < entries.length; i += MAX_PETALS) {
      clusters.push(entries.slice(i, i + MAX_PETALS));
    }
    return {
      area,
      totalCount: entries.length,
      clusters,
      clusterCount: Math.ceil(entries.length / MAX_PETALS)
    };
  });

  $: summaryStats = (area: string | null): TASummaryStats => {
    const relevantData = area 
      ? constellationData.filter(d => d.name === area)
      : constellationData;

    const uniqueSponsors = new Set(relevantData.map(d => d.Sponsor)).size;
    const years = relevantData.map(d => parseInt(d.Year));
    const yearRange = {
      start: Math.min(...years).toString(),
      end: Math.max(...years).toString()
    };

    return {
      totalVouchers: relevantData.length,
      purchasedCount: relevantData.filter(d => d.Purchased?.toLowerCase() === 'y').length,
      totalValue: relevantData
        .filter(d => d.Purchased?.toLowerCase() === 'y' && d["Sale  Price (USD, Millions)"])
        .reduce((sum, d) => {
          const price = parseFloat(d["Sale  Price (USD, Millions)"] || "0");
          return !isNaN(price) ? sum + price : sum;
        }, 0),
      uniqueSponsors,
      yearRange
    };
  };

  let hoveredArea: string | null = null;

  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  function createColorScale(baseColor: string, count: number): d3.ScaleLinear<string, string> {
    return d3.scaleLinear<string>()
      .domain([0, count - 1])
      .range([baseColor, d3.color(baseColor)!.brighter(0.8).toString()])
      .interpolate(d3.interpolateHcl);
  }

  function getColorForId(area: string, id: string, allIds: string[]): string {
    const baseColor = therapeuticAreaColors[area as keyof typeof therapeuticAreaColors];
    if (!baseColor) return "#000000";
    const colorScale = createColorScale(baseColor, allIds.length);
    const idIndex = allIds.indexOf(id);
    return colorScale(idIndex);
  }

  function createPetalCluster(
    entries: ConstellationEntry[],
    position: { x: number; y: number; angle: number },
    area: string,
    clusterIndex: number,
    totalClusters: number
  ) {
    const petalCount = Math.min(entries.length, MAX_PETALS);
    const svgContent = petalSVGs[petalCount as keyof typeof petalSVGs];
    const uniqueIds = [...new Set(entries.map(e => e.id))];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    entries.forEach((entry, index) => {
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
        petalPaths[startIdx].setAttribute('data-original-fill', '#231F20');
        petalPaths[startIdx].setAttribute('fill', '#231F20');
        petalPaths[startIdx].setAttribute('opacity', '0');
      }
      
      if (petalPaths[startIdx + 1]) {
        petalPaths[startIdx + 1].setAttribute('class', 'petal-part outer-petal');
        petalPaths[startIdx + 1].setAttribute('data-therapeutic-area', entry.name);
        petalPaths[startIdx + 1].setAttribute('data-petal-index', index.toString());
        petalPaths[startIdx + 1].setAttribute('fill', color);
        petalPaths[startIdx + 1].setAttribute('stroke', isApproved ? '#231F20' : '#F2F0E4');
        petalPaths[startIdx + 1].setAttribute('stroke-width', '4');
      }
      
      if (petalPaths[startIdx + 2]) {
        petalPaths[startIdx + 2].setAttribute('class', 'petal-part inner-petal');
        petalPaths[startIdx + 2].setAttribute('data-therapeutic-area', entry.name);
        petalPaths[startIdx + 2].setAttribute('data-petal-index', index.toString());
        petalPaths[startIdx + 2].setAttribute('fill', isPurchased ? '#1e1e1e' : '#FFE7A0');
      }
    });

    const cluster = svg.append("g")
      .attr("class", `cluster area-${area.toLowerCase().replace(/\s+/g, '-')}`)
      .attr("cursor", "pointer")
      .on("mouseover", () => handleClusterHover(area))
      .on("mouseout", handleClusterLeave)
      .html(doc.documentElement.outerHTML);

    const svgElement = cluster.select("svg").node();
    if (svgElement instanceof SVGElement) {
    const svgWidth = svgElement.getAttribute("width");
    const svgHeight = svgElement.getAttribute("height");
      
    
      if (svgWidth && svgHeight) {
        const scale = width * CLUSTER_SCALE;
        cluster.attr("transform", `
          translate(${position.x},${position.y})
          rotate(${position.angle * 180 / Math.PI})
          scale(${scale/1.25})
          translate(${-parseFloat(svgWidth)/2},${-parseFloat(svgHeight)})        
        `);

        cluster.selectAll("path")
          .style("filter", "saturate(0.2)")
          .style("opacity", 0.7)
          .style("transition", "all 300ms ease-in-out")
          .each(function(_, i) {
            const path = d3.select(this);
            const petalIndex = Math.floor(i / 3);
            
            if (petalIndex < entries.length) {
              const entry = entries[petalIndex];
              const color = getColorForId(area, entry.id, uniqueIds);
              
              path
                .on("mouseover", function(event) {
                  handlePetalHover(event, entry, color, this);
                })
                .on("mouseout", function() {
                  handlePetalLeave(this, area);
                })
                .on("click", (event) => handlePetalClick(event, entry, color));
            }
          });
      }
    }
  }

  function handleClusterHover(area: string) {
    hoveredArea = area;
    const stats = summaryStats(area);
    
    const summaryText = `${area} has contributed ${formatNumber(stats.totalVouchers)} priority review vouchers from ${
      stats.yearRange.start} to ${stats.yearRange.end}, involving ${formatNumber(stats.uniqueSponsors)} sponsor${
      stats.uniqueSponsors !== 1 ? 's' : ''}` + 
      (stats.purchasedCount > 0 ? `. ${formatNumber(stats.purchasedCount)} voucher${
        stats.purchasedCount !== 1 ? 's were' : ' was'} sold for a total of $${formatNumber(stats.totalValue)} million` : '') +
      '. Hover over petals to explore specific therapeutics.';
    
    dispatch('areaSummary', { summaryText });
    dispatch('areaHover', { area });
    
    svg.selectAll(".cluster")
      .transition()
      .duration(300)
      .style("opacity", function() {
        return this.classList.contains(`area-${area.toLowerCase().replace(/\s+/g, '-')}`) ? 1 : 0.3;
      });
  
      svg.selectAll("path")
      .style("filter", function() {
        return this.closest(`.area-${area.toLowerCase().replace(/\s+/g, '-')}`) 
          ? "saturate(1.2)" 
          : "saturate(0.2)";
      });

    updatePetalHighlights();
  }

  function handleClusterLeave() {
    hoveredArea = null;
    dispatch('areaSummary', { summaryText: '' });
    dispatch('areaLeave');
    
    svg.selectAll(".cluster")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .selectAll("path")
      .style("filter", "saturate(0.2)");

    svg.selectAll('.background-petal')
      .transition()
      .duration(200)
      .style("fill", function() {
        return d3.select(this).attr('data-original-fill');
      });

    updatePetalHighlights();
  }

  function handlePetalHover(event: MouseEvent, entry: ConstellationEntry, color: string, element: SVGPathElement) {
    const petalGroup = d3.select(element.parentElement)
      .selectAll("path")
      .filter((_, i) => Math.floor(i / 3) === Math.floor(Array.from(element.parentElement?.children || []).indexOf(element) / 2));
    
    petalGroup
      .transition()
      .duration(100)
      .style("filter", "saturate(1.5) brightness(1.1)")
      .style("opacity", 1);

    petalGroup.each(function() {
      const path = d3.select(this);
      if (!path.property("_originalFill")) {
        path.property("_originalFill", path.style("fill"));
      }
    });

    // Set background petal to red for hovered petal
    petalGroup.filter(".background-petal")
      .style("opacity", 1);

    dispatch('petalHover', { event, entry, color });
  }

  function handlePetalLeave(element: SVGPathElement, area: string) {
    const petalGroup = d3.select(element.parentElement)
      .selectAll("path")
      .filter((_, i) => Math.floor(i / 3) === Math.floor(
        Array.from(element.parentElement?.children || []).indexOf(element) / 3));
    
    // Reset to area hover state if area is still hovered, otherwise to default state
    petalGroup
      .transition()
      .duration(200)
      .style("filter", hoveredArea === area ? "saturate(1.2)" : "saturate(0.2)")
      .each(function() {
        const path = d3.select(this);
        const originalFill = path.property("_originalFill");
        if (originalFill) {
          path.style("fill", originalFill);
        }
      });

    // Reset background petal
    petalGroup.filter(".background-petal")
      .style("fill", "#231F20")
      .style("opacity", 0);

    dispatch('petalLeave');
  }

  function handlePetalClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
    event.stopPropagation();
    dispatch('clusterElementClick', { entry, color });
  }

  function updatePetalHighlights() {
    svg.selectAll('.petal-part')
      .transition()
      .duration(200)
      .style("filter", function() {
        const petalElement = d3.select(this);
        const therapeuticArea = petalElement.attr('data-therapeutic-area');
        const cluster = this.closest('.cluster');
        if (!cluster) return "saturate(0.2)";
        
        if (!hoveredArea) {
          return "saturate(0.2)";
        }
        
        return therapeuticArea === hoveredArea
          ? "saturate(1.2) brightness(1.1)"
          : "saturate(0) brightness(0.9)";
      })
      .style("opacity", function() {
        if (!hoveredArea) return 0.7;
        
        const petalElement = d3.select(this);
        const therapeuticArea = petalElement.attr('data-therapeutic-area');
        
        return therapeuticArea === hoveredArea ? 1 : 0.3;
      });

    // Update background petals
    svg.selectAll('.background-petal')
      .transition()
      .duration(200)
      .style("fill", function() {
        const petalElement = d3.select(this);
        const therapeuticArea = petalElement.attr('data-therapeutic-area');
        
        if (!hoveredArea) {
          return petalElement.attr('data-original-fill');
        }
        
        return therapeuticArea === hoveredArea
          ? "#ff1515"
          : petalElement.attr('data-original-fill');
      })
      .style("opacity", function() {
        const petalElement = d3.select(this);
        const therapeuticArea = petalElement.attr('data-therapeutic-area');
        
        if (!hoveredArea) {
          return 0;
        }
        
        return therapeuticArea === hoveredArea ? 0.8 : 0;
      });
  }

  onMount(() => {
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;

    svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    drawVisualization();

    const resizeObserver = new ResizeObserver(() => {
      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;
      
      svg.select('svg')
        .attr("width", width)
        .attr("height", height);
      
      drawVisualization();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  });
  function drawVisualization() {
  if (!svg || !width || !height) return;

  svg.selectAll("*").remove();

  const angleScale = d3.scaleLinear()
    .domain([0, areaStats.length])
    .range([0, 2 * Math.PI]);

  areaStats.forEach((stat, i) => {
    const angle = angleScale(i);
    const mainX = Math.cos(angle - Math.PI / 2) * innerRadius;
    const mainY = Math.sin(angle - Math.PI / 2) * innerRadius;

    // Center circle
    svg.append("circle")
      .attr("cx", mainX)
      .attr("cy", mainY)
      .attr("r", 3)
      .attr("fill", therapeuticAreaColors[stat.area as keyof typeof therapeuticAreaColors])
      .attr("stroke", "#161616")
      .attr("stroke-width", .5);

    // Outer label
    const labelAngle = angle;
    const labelRadius = outerRadius * LABEL_RADIUS_OFFSET;
    const labelX = Math.cos(labelAngle - Math.PI / 2) * labelRadius;
    const labelY = Math.sin(labelAngle - Math.PI / 2) * labelRadius;
    
    const textRotation = (labelAngle / Math.PI) * 180;
    const finalRotation = textRotation > 90 && textRotation < 270 
      ? textRotation + 180 
      : textRotation;

    const labelGroup = svg.append("g")
      .attr("class", `area-label-group area-${stat.area.toLowerCase().replace(/\s+/g, '-')}`)
      .style("cursor", "pointer")
      .on("mouseover", () => handleClusterHover(stat.area))
      .on("mouseout", handleClusterLeave);

    labelGroup.append("text")
      .attr("class", "area-label")
      .attr("transform", `
        translate(${labelX},${labelY})
        rotate(${finalRotation})
      `)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .attr("background-color", "#fff")
      .attr("font-size", `${Math.min(Math.max(innerRadius * 1, 8), 12)}px`)
      .attr("fill", "#4a5568")
      .text(stat.area);

    // Calculate and draw clusters
    stat.clusters.forEach((clusterEntries, clusterIndex) => {
      // Calculate available space between inner and outer radius
      const availableSpace = outerRadius - innerRadius;
      
      // If there's only one cluster, place it in the middle
      // If there are multiple clusters, spread them out based on CLUSTER_SPACING_RATIO
      const t = stat.clusters.length === 1 
        ? 0.5 
        : CLUSTER_SPACING_RATIO * (clusterIndex + 1) / (stat.clusters.length + 1);
      
      const clusterRadius = innerRadius + (availableSpace * t);
      const lineAngle = angle - Math.PI / 2;
      const clusterX = Math.cos(lineAngle) * clusterRadius;
      const clusterY = Math.sin(lineAngle) * clusterRadius;

      // Draw line from center circle to cluster
      svg.append("line")
        .attr("x1", mainX)
        .attr("y1", mainY)
        .attr("x2", clusterX)
        .attr("y2", clusterY)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.5);

      // Create cluster of petals
      createPetalCluster(
        clusterEntries,
        { x: clusterX, y: clusterY, angle },
        stat.area,
        clusterIndex,
        stat.clusters.length
      );
    });
  });
}

</script>

<div class="therapeutic-area-radial py-24" bind:this={container}>
</div>

<style>
  .therapeutic-area-radial {
    width: 100%;
    height: 90%;
    position: relative;
    overflow: visible;
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

  :global(.area-label), :global(.area-count) {
    font-family: 'IBM Plex Sans', sans-serif;
  }

  :global(.label-hitbox) {
    opacity: 0;
  }
</style>
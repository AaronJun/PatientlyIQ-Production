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
    export let selectedArea: string | null = null;
  
    const dispatch = createEventDispatcher();
  
    let container: HTMLElement;
    let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    let containerWidth: number;
    let containerHeight: number;
  
    const MAX_PETALS = 20;
    
    $: CLUSTER_SCALE = Math.min(containerWidth, containerHeight) * 0.0000125;
    $: SATELLITE_SCALE = CLUSTER_SCALE * 0.025;
    $: LINE_LENGTH = Math.min(containerWidth, containerHeight) * 0.225;
    
    $: width = containerWidth || 900;
    $: height = containerHeight || 900;
    $: radius = Math.min(width, height) / 20;
  
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
  
    // Process data to group by therapeutic area
    $: groupedData = d3.group(constellationData, d => d.name);
    $: areaStats = Array.from(groupedData.entries()).map(([area, entries]) => {
      const uniqueIds = [...new Set(entries.map(e => e.id))];
      return {
        area,
        totalCount: entries.length,
        uniqueIds,
        entries: entries.sort((a, b) => a.id.localeCompare(b.id))
      };
    });
  
    $: maxIdsInAnyArea = Math.max(...Array.from(groupedData.values()).map(entries => 
      new Set(entries.map(e => e.id)).size
    ));
  
    function createColorScale(baseColor: string, count: number): d3.ScaleLinear<string, string> {
      return d3.scaleLinear<string>()
        .domain([0, Math.max(1, count - 1)])
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
    
    function createMainCluster(
    areaData: { area: string; entries: ConstellationEntry[]; uniqueIds: string[] },
    angle: number,
    index: number,
    total: number
  ) {
    const x = Math.cos(angle - Math.PI / 2) * radius;
    const y = Math.sin(angle - Math.PI / 2) * radius;

    const mainCircle = svg.append("g")
      .attr("class", `main-cluster area-${areaData.area.toLowerCase().replace(/\s+/g, '-')}`)
      .attr("cursor", "pointer");

    // Add the circle with hover interactions
    mainCircle.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 5)
      .attr("fill", therapeuticAreaColors[areaData.area as keyof typeof therapeuticAreaColors])
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("opacity", 0.9)
      .on("mouseover", () => {
        hoveredArea = areaData.area;
        updateLabels();
      })
      .on("mouseout", () => {
        hoveredArea = null;
        updateLabels();
      });

    // Add area label
    const labelRadius = radius + 12;
    const labelAngle = angle;
    const labelX = Math.cos(labelAngle - Math.PI / 2) * labelRadius;
    const labelY = Math.sin(labelAngle - Math.PI / 2) * labelRadius;

    svg.append("text")
      .attr("class", "area-label")
      .attr("transform", `
        translate(${labelX},${labelY})
        rotate(${(labelAngle * 180)})
        ${labelAngle > Math.PI ? 'rotate(180)' : ''}
      `)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#4a5568")
      .text(areaData.area);

    // Draw satellite clusters and hidden labels
    areaData.uniqueIds.forEach((id, idIndex) => {
      const entriesForId = areaData.entries.filter(e => e.id === id);
      const t = (idIndex + 1) / (areaData.uniqueIds.length + 1);
      
      const lineAngle = angle - Math.PI / 2;
      const satelliteX = x + Math.cos(lineAngle) * LINE_LENGTH * t;
      const satelliteY = y + Math.sin(lineAngle) * LINE_LENGTH * t;

      // Draw connecting line
      svg.append("line")
        .attr("x1", x)
        .attr("y1", y)
        .attr("x2", satelliteX)
        .attr("y2", satelliteY)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.5);
      
      // Create hidden label for ID
      svg.append("text")
        .attr("class", `id-label ${areaData.area}-${id}`.toLowerCase().replace(/\s+/g, '-'))
        .attr("x", satelliteX)
        .attr("y", satelliteY - SATELLITE_SCALE * 100)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", "#161616")
        .text(id)
        .style("opacity", 0)
        .style("pointer-events", "none");
      
      createSatelliteCluster(
        entriesForId,
        { x: satelliteX, y: satelliteY },
        areaData.area,
        id,
        areaData.uniqueIds
      );
    });
  }

  function createSatelliteCluster(
    entries: ConstellationEntry[],
    position: { x: number, y: number },
    area: string,
    id: string,
    allIds: string[]
  ) {
    const petalCount = Math.min(entries.length, MAX_PETALS);
    const svgContent = petalSVGs[petalCount as keyof typeof petalSVGs];
    
    const cluster = svg.append("g")
      .attr("class", `satellite-cluster area-${area.toLowerCase().replace(/\s+/g, '-')}`)
      .attr("cursor", "pointer")
      .html(svgContent);

    const svgElement = cluster.select("svg").node();
    if (svgElement instanceof SVGElement) {
      const svgWidth = parseFloat(svgElement.getAttribute("width") || "0");
      const svgHeight = parseFloat(svgElement.getAttribute("height") || "0");
      
      cluster.attr("transform", `
        translate(${position.x},${position.y})
        scale(${SATELLITE_SCALE})
        translate(${-svgWidth/2},${-svgHeight/2})
      `);

      cluster.selectAll("path:not(.center-circle)")
        .each(function(_, i) {
          if (i < entries.length) {
            const entry = entries[i];
            const color = getColorForId(area, id, allIds);
            const isApproved = entry["Treatment Type"] && entry["Treatment Type"] !== "N";
            
            d3.select(this)
              .attr("fill", color)
              .attr("stroke", isApproved ? "#ff1515" : "#fff")
              .attr("stroke-width", isApproved ? "2" : "1.5")
              .style("opacity", 0.9)
              .on("mouseover", (event) => {
                hoveredId = id;
                updateLabels();
                handlePetalHover(event, entry, color);
              })
              .on("mouseout", () => {
                hoveredId = null;
                updateLabels();
                handlePetalLeave();
              })
              .on("click", (event) => handlePetalClick(event, entry, color));
          }
        });
    }
  }

  function updateLabels() {
    // Hide all labels first
    svg.selectAll(".id-label")
      .style("opacity", 0);

    // Show labels based on hover state
    if (hoveredArea) {
      // Show all labels for the hovered area
      svg.selectAll(`.id-label[class*="${hoveredArea.toLowerCase()}"]`)
        .style("opacity", 1)
        .style("transition", "opacity 0.2s ease");
    } else if (hoveredId) {
      // Show only the label for the hovered petal
      svg.selectAll(`.id-label[class*="${hoveredId.toLowerCase()}"]`)
        .style("opacity", 1)
        .style("transition", "opacity 0.2s ease");
    }
  }

    function drawVisualization() {
      if (!svg || !width || !height) return;
  
      svg.selectAll("*").remove();
  
      // Debug circle for layout reference
      svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "#eee")
        .attr("stroke-width", 1);
  
      const angleScale = d3.scaleLinear()
        .domain([0, areaStats.length])
        .range([0, 2 * Math.PI]);
  
      areaStats.forEach((stat, i) => {
        const angle = angleScale(i);
        createMainCluster(stat, angle, i, areaStats.length);
      });
    }
  
    function handlePetalHover(event: MouseEvent, entry: ConstellationEntry, color: string) {
      dispatch('petalHover', { event, entry, color });
    }
  
    function handlePetalLeave() {
      dispatch('petalLeave');
    }
  
    function handlePetalClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
      event.stopPropagation();
      dispatch('clusterElementClick', { entry, color });
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
  </script>
  
  <div class="radial-timeline" bind:this={container}>
  </div>
  
  <style>
    .radial-timeline {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
  
    :global(.main-cluster), :global(.satellite-cluster) {
      transition: opacity 0.3s ease;
    }
  
    :global(.cluster path) {
      transition: filter 0.3s ease, transform 0.3s ease, opacity 0.2s ease;
      transform-origin: center;
    }
  
    :global(.cluster path:hover) {
      filter: brightness(1.1) !important;
      opacity: 1 !important;
      transform: scale(1.1);
    }
  
    :global(.area-label) {
      pointer-events: none;
    }

     
  :global(.id-label) {
    transition: opacity 0.2s ease;
  }
</style>
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
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
  
    const MAX_PETALS = 8;
    const CLUSTER_SCALE = 0.001015;
    const PADDING = 80;
    const SINGLE_CLUSTER_COLUMNS = 4;
    const CELL_SPACING = 22;
  
    const therapeuticAreaColors = {
      "Gastroenterology": "#39FF14",
      "Neurology": "#4D4DFF",
      "Ophthalmology": "#E79028",
      "Immunology": "#9C8E2C",
      "Metabolic": "#133B11",
      "Dermatology": "#FFEA01",
      "Hematology": "#943CFF",
      "Orthopedics": "#441780",
      "Pulmonology": "#CBC09F",
      "Nephrology": "#ACA3DB",
      "Oncology": "#FF84DE",
      "Hepatology": "#814C28",
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
  
    $: multiClusterAreas = areaStats.filter(stat => stat.clusterCount > 1);
    $: singleClusterAreas = areaStats.filter(stat => stat.clusterCount === 1);
  
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
    position: { x: number, y: number }, 
    area: string,
    clusterIndex: number,
    totalClusters: number
  ) {
    const petalCount = Math.min(entries.length, MAX_PETALS);
    const svgContent = petalSVGs[petalCount as keyof typeof petalSVGs];
    const uniqueIds = [...new Set(entries.map(e => e.id))];
    
    const cluster = svg.append("g")
      .attr("class", `cluster area-${area.toLowerCase().replace(/\s+/g, '-')}`)
      .attr("cursor", "pointer")
      .on("mouseover", () => handleClusterHover(area))
      .on("mouseout", handleClusterLeave)
      .html(svgContent);

    const svgElement = cluster.select("svg").node();
    if (svgElement instanceof SVGElement) {
      const svgWidth = svgElement.getAttribute("width");
      const svgHeight = svgElement.getAttribute("height");
      
      if (svgWidth && svgHeight) {
        const scale = containerWidth * CLUSTER_SCALE;
        cluster.attr("transform", `
          translate(${position.x},${position.y})
          scale(${scale})
          translate(${-parseFloat(svgWidth)/2},${-parseFloat(svgHeight)/2})
        `);

        cluster.select("circle")
          .attr("class", "center-circle")
          .style("pointer-events", "none");

        cluster.selectAll("path:not(.center-circle)")
          .attr("class", (_, i) => `petal petal-${area}-${clusterIndex}-${i}`)
          .each(function(_, i) {
            if (i < entries.length) {
              const entry = entries[i];
              const color = getColorForId(area, entry.id, uniqueIds);
              const isApproved = entry["Approved Drug"] && entry["Approved Drug"] !== "N";
              
              d3.select(this)
                .attr("fill", color)
                .attr("stroke", isApproved ? "#8CBB91" : "#F2F0E4")
                .attr("stroke-width", isApproved ? "4" : "4")
                .style("opacity", area === selectedArea ? 1 : 0.9725)
                .on("mouseover", (event) => handlePetalHover(event, entry, color))
                .on("mouseout", () => handlePetalLeave())
                .on("click", (event) => handlePetalClick(event, entry, color));
            }
          })
  
          // Area label for first cluster or single clusters
          if (clusterIndex === 0) {
            const labelY = parseFloat(svgHeight) + 20;
            cluster.append("text")
              .attr("x", parseFloat(svgWidth) / 2)
              .attr("y", labelY)
              .attr("text-anchor", "middle")
              .attr("font-size", "10px")
              .attr("fill", "#4a5568")
              .text(area);
  
            cluster.append("text")
              .attr("x", parseFloat(svgWidth) / 2)
              .attr("y", labelY + 15)
              .attr("text-anchor", "middle")
              .attr("font-size", "8.725px")
              .attr("fill", "#718096")
              .text(`${entries.length} vouchers`);
          }
  
          if (totalClusters > 1) {
            cluster.append("text")
              .attr("x", parseFloat(svgWidth) / 2)
              .attr("y", -10)
              .attr("text-anchor", "middle")
              .attr("font-size", "8px")
              .attr("fill", "#718096")
              .text(`${clusterIndex + 1}/${totalClusters}`);
          }
        }
      }
    }
  
    function drawClusters() {
      if (!svg || !containerWidth || !containerHeight) return;
  
      svg.selectAll("*").remove();
  
      let currentY = PADDING;
      
      // Handle multi-cluster areas first - each gets its own row
      multiClusterAreas.forEach(stat => {
        const rowWidth = containerWidth - (PADDING * 2);
        const clusterWidth = (rowWidth - (CELL_SPACING * (stat.clusterCount - 1))) / stat.clusterCount;
        
        stat.clusters.forEach((clusterEntries, clusterIndex) => {
          const x = PADDING + (clusterWidth * clusterIndex) + (clusterWidth / 2) + (CELL_SPACING * clusterIndex);
          createPetalCluster(
            clusterEntries,
            { x, y: currentY },
            stat.area,
            clusterIndex,
            stat.clusters.length
          );
        });
  
        currentY += 200; // Move to next row with spacing
      });
  
      // Handle single-cluster areas in a grid
      const remainingWidth = containerWidth - (PADDING * 2);
      const singleClusterWidth = (remainingWidth - (CELL_SPACING * (SINGLE_CLUSTER_COLUMNS - 1))) / SINGLE_CLUSTER_COLUMNS;
      
      singleClusterAreas.forEach((stat, index) => {
        const row = Math.floor(index / SINGLE_CLUSTER_COLUMNS);
        const col = index % SINGLE_CLUSTER_COLUMNS;
        
        const x = PADDING + (singleClusterWidth * col) + (singleClusterWidth / 2) + (CELL_SPACING * col);
        const y = currentY + (row * 200);
        
        createPetalCluster(
          stat.clusters[0],
          { x, y },
          stat.area,
          0,
          1
        );
      });
    }
  
    function handleClusterHover(area: string) {
      dispatch('areaHover', { area });
    }
  
    function handleClusterLeave() {
      dispatch('areaLeave');
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
  
    function handleResize() {
      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;
      
      if (svg) {
        svg.attr("width", containerWidth)
           .attr("height", containerHeight);
        drawClusters();
      }
    }
  
    onMount(() => {
      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;
  
      svg = d3.select(container)
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g");
  
      drawClusters();
  
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
  
      return () => {
        resizeObserver.disconnect();
      };
    });
  </script>
  
  <div class="therapeutic-area-grid" bind:this={container}>
  </div>
  
  <style>
    .therapeutic-area-grid {
      width: 100%;
      height: 100%;
      position: relative;
      background-color: #fff;
      padding: 1rem;
    }
  
    :global(.cluster) {
      transition: opacity 0.3s ease;
    }
  
    :global(.cluster .petal) {
      transition: filter 0.3s ease, transform 0.3s ease, opacity 0.2s ease;
      transform-origin: center;
    }
  
    :global(.cluster .petal:hover) {
      filter: brightness(1.5) !important;
      opacity: 1 !important;
      transform: scale(1.025) !important;
    }
  
    :global(.center-circle) {
      transform: none !important;
      transition: none !important;
      pointer-events: none !important;
    }
  </style>
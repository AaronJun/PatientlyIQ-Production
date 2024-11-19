<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    import type { Selection } from 'd3';
    import "carbon-components-svelte/css/all.css";
    import OnePetal from '../../assets/1Petal.svg?raw';
    import TwoPetal from '../../assets//2Petal.svg?raw';
    import ThreePetal from '../../assets//3Petal.svg?raw';
    import FourPetal from '../../assets//4Petal.svg?raw';
    import FivePetal from '../../assets//5Petal.svg?raw';
    import SixPetal from '../../assets//6Petal.svg?raw';
    import SevenPetal from '../../assets//7Petal.svg?raw';
    import EightPetal from '../../assets//8Petal.svg?raw';
    import NinePetal from '../../assets//9Petal.svg?raw';
    import TenPetal from '../../assets//10Petal.svg?raw';
    import ElevenPetal from '../../assets//11Petal.svg?raw';
    import TwelvePetal from '../../assets//12Petal.svg?raw';
    import {YearlySummary} from '$lib/componentStores.ts';
    import Tooltip from '../RPDComponents/RPDTooltip.svelte';
  
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
  
    let containerWidth: number;
    let containerHeight: number;
    $: width = Math.max(containerWidth || 1200, 800);
    $: height = Math.max(containerHeight || 1200, 800);
  
    export let data: RPDData[];
    export let constellationData: ConstellationEntry[];
    export let summaryDisplayComponent: any;
    export let overviewYear: string = "Overview";
    export let isDrawerOpen: boolean;
    export let selectedData: any;
  
    export let transitionDuration: number = 400;
    export let transitionEase: (t: number) => number = d3.easeCircle;

        // Add this function to handle filter updates
        export function updateHighlightedEntries(entries: string[]) {
        highlightedEntries = entries;
        
        // Redraw all clusters with new highlighting
        allYears.forEach(year => {
            if (year !== overviewYear) {
                const yearData = data.find(d => d.Year === year);
                if (yearData) {
                    const entries = groupedConstellationData.get(year) || [];
                    if (entries.length > 0) {
                        const angle = xScale(year)! + xScale.bandwidth() / 2;
                        const radius = yScale(+yearData.RPD);
                        const x = Math.sin(angle) * radius;
                        const y = -Math.cos(angle) * radius;
                        
                        createPetalCluster(year, entries, { x, y, angle });
                    }
                }
            }
        });
    }
   
  let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  let currentYear: string = overviewYear;
  let highlightedEntries: string[] = [];
       
  let summaryInstance: any;
  
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
  
    const dispatch = createEventDispatcher();
  
    const therapeuticAreaColors: { [key: string]: string } = {
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
      "Genetic": "#4D4DFF",
      "Hepatology": "#FF00D4",
    };
  
    $: margin = { 
      top: height * .115, 
      right: width * 0.015, 
      bottom: height * 0.215, 
      left: width * 0.005 
    };
    $: innerRadius = Math.min(width, height) * 0.029;
    $: outerRadius = Math.min(width, height) / 1.6725 - Math.max(margin.top, margin.right, margin.bottom, margin.left);
  
    const years = [...new Set(data.map(d => d.Year))].sort((a, b) => +a - +b);
    const allYears = [overviewYear, ...years];
  
    const lineAnimationDuration = 1000;
    const clusterAnimationDuration = 500;
    const delayBetweenYears = 100;
  
    const maxRPD = Math.max(...data.map(d => +d.RPD));
    const rpdPrvCounts = constellationData.reduce((acc, entry) => {
      acc[entry.Year] = (acc[entry.Year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    data = data.map(item => ({
      ...item,
      "RPD PRV": rpdPrvCounts[item.Year]?.toString() || "0"
    }));
  
    currentYear = overviewYear;
      
    $: xScale = d3.scaleBand()
      .range([0, 2 * Math.PI])
      .align(0)
      .domain(allYears);
  
    $: yScale = d3.scaleLog()
      .range([innerRadius, outerRadius])
      .domain([1, maxRPD]);
  
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  
    const groupedConstellationData = d3.group(constellationData, d => d.Year);
  
    $: barWidth = Math.min(width, height) * 0.0025;
  
    let yearSegments: Selection<SVGPathElement, string, SVGGElement, unknown>;
    let yearLabels: Selection<SVGTextElement, string, SVGGElement, unknown>;
  
    let activeYear: string = overviewYear;
    let hoveredYear: string | null = null;
  
    let resizeTimer: ReturnType<typeof setTimeout>;
  
    let hoveredPetalData: {
      name: string;
      id: string;
      drugName: string;
    } | null = null;
  
    const petalSVGs: { [key: number]: string } = {
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
  
    onMount(() => {
      svg = d3.select("#radial-timeline")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);
  
      drawTimeline();
      placeSummaryDisplay();
  
      updateVisibility(overviewYear);
      dispatch('yearChange', { year: overviewYear });
  
      window.addEventListener("resize", handleResize);
  
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    });
  
    function getColor(name: string): string {
      return therapeuticAreaColors[name as keyof typeof therapeuticAreaColors] || "#000000";
    }
  
    function handleResize() {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
  
      resizeTimer = setTimeout(() => {
        width = Math.max(containerWidth || 1625, 800);
        height = Math.max(containerHeight || 1625, 800);
        
        svg.selectAll("*").remove();
        
        drawTimeline();
        updateVisibility(currentYear);
      }, 250);
    }
  
    function placeSummaryDisplay() {
      if (summaryDisplayComponent) {
        const summaryContainer = d3.select("#summary-display-container");
        
        summaryInstance = new summaryDisplayComponent({
          target: summaryContainer.node() as HTMLElement,
          props: {
            currentYear,
            constellationData,
            rpdPrvData: data
          }
        });
      }
    }
  
    function drawGuideLines() {
        const logBase = 1.5;
        const guideLines = d3.range(Math.floor(Math.log(maxRPD) / Math.log(logBase)) + 1)
            .map(i => Math.pow(logBase, i));

        svg.append("g")
            .selectAll("circle")
            .data(guideLines)
            .enter()
            .append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", d => yScale(d))
            .attr("fill", "none")
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "3,3")
            .style("opacity", 0.5);

        svg.append("g")
            .selectAll("text")
            .data(guideLines)
            .enter()
            .append("text")
            .attr("x", 0)
            .attr("y", d => -yScale(d))
            .text(d => d3.format(".0s")(d))
            .attr("font-size", "9px")
            .attr("fill", "#666")
            .attr("alignment-baseline", "middle");
    }

    function handleFilterUpdate(event: CustomEvent) {
    const { filteredEntries, filters } = event.detail;
    
    // Update petal visibility based on filtered entries
    svg.selectAll('path[class^="petal-"]')
        .style('opacity', function(d, i) {
            const petalId = this.classList[0].split('-')[2];
            return filteredEntries.includes(petalId) ? 1 : 0.2;
        });
}

    function drawYearLines() {
        svg.append("g")
            .selectAll("line")
            .data(data)
            .enter()
            .append("line")
            .attr("class", d => `year-${d.Year} timeline-line`)
            .attr("stroke", d => colorScale(d.Year))
            .attr("stroke-width", barWidth)
            .attr("x1", d => {
                const angle = xScale(d.Year)! + xScale.bandwidth() / 2;
                return Math.sin(angle) * innerRadius;
            })
            .attr("y1", d => {
                const angle = xScale(d.Year)! + xScale.bandwidth() / 2;
                return -Math.cos(angle) * innerRadius;
            })
            .attr("x2", d => {
                const angle = xScale(d.Year)! + xScale.bandwidth() / 2;
                return Math.sin(angle) * yScale(Math.max(1, +d.RPD));
            })
            .attr("y2", d => {
                const angle = xScale(d.Year)! + xScale.bandwidth() / 2;
                return -Math.cos(angle) * yScale(Math.max(1, +d.RPD));
            })
            .style("vector-effect", "non-scaling-stroke");

        svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", d => `year-${d.Year}`)
            .attr("cx", d => {
                const angle = xScale(d.Year) + xScale.bandwidth() / 2;
                return Math.sin(angle) * yScale(Math.max(1, +d.RPD));
            })
            .attr("cy", d => {
                const angle = xScale(d.Year) + xScale.bandwidth() / 2;
                return -Math.cos(angle) * yScale(Math.max(1, +d.RPD));
            })
            .attr("r", 5)
            .attr("fill", d => colorScale(d.Year));
    }

    function drawClusters() {
        allYears.forEach(year => {
            if (year !== overviewYear) {
                const yearData = data.find(d => d.Year === year);
                if (yearData) {
                    const entries = groupedConstellationData.get(year) || [];
                    if (entries.length > 0) {
                        const angle = xScale(year)! + xScale.bandwidth() / 2;
                        const radius = yScale(+yearData.RPD);
                        const x = Math.sin(angle) * radius;
                        const y = -Math.cos(angle) * radius;
                        
                        createPetalCluster(year, entries, { x, y, angle });
                    }
                }
            }
        });
    }
  
    function drawTimeline() {
      svg.selectAll("*").remove();
      drawGuideLines();
      drawYearLines();
      drawClusters();
      drawYearCircle();
    }
  
      // Modify the createPetalCluster function to handle saturation-based highlighting
      function createPetalCluster(year: string, entries: ConstellationEntry[], position: { x: number, y: number, angle: number }, animate: boolean = false) {
        try {
            const petalCount = Math.min(entries.length, 10);
            const svgContent = loadSVG(petalCount);
            
            svg.selectAll(`.cluster-${year}`).remove();

            const cluster = svg.append('g')
                .attr('class', `year-${year} cluster-${year}`)
                .attr('cursor', 'pointer')
                .on('click', (event) => handleClusterClick(event, year))
                .on('mouseover', (event) => handleClusterHover(event, year))
                .on('mouseleave', handleClusterLeave);

            cluster.html(svgContent);

        const svgElement = cluster.select('svg').node();
  
        if (svgElement instanceof SVGElement) {
          const svgWidth = svgElement.getAttribute('width');
          const svgHeight = svgElement.getAttribute('height');
          
          if (svgWidth && svgHeight) {
            const rotationAngle = (position.angle * 180 / Math.PI);
            const targetTransform = `
              translate(${position.x}, ${position.y}) 
              rotate(${rotationAngle}) 
              translate(${-parseFloat(svgWidth)/2}, ${-parseFloat(svgHeight)/2})
            `;
  
            if (animate) {
              cluster
                .attr('transform', `translate(${position.x}, ${position.y}) scale(0)`)
                .transition()
                .duration(clusterAnimationDuration)
                .attr('transform', targetTransform);
            } else {
              cluster.attr('transform', targetTransform);
            }
  
            addClusterCircle(year, { x: position.x, y: position.y }, Math.max(parseFloat(svgWidth), parseFloat(svgHeight)) / 2, animate);
          }
        }
       
     

        cluster.selectAll('path')
                .attr('class', (_, i) => `petal-${year} petal-${year}-${i}`)
                .each(function(_, i) {
                    if (i < entries.length) {
                        const entry = entries[i];
                        const color = getColor(entry.name);
                        const baseColor = d3.hsl(color);
                        
                        d3.select(this)
                            .attr('fill', color)
                            .attr('stroke', '#C2990D')
                            .style('filter', () => {
                                if (highlightedEntries.length === 0) return 'none';
                                return highlightedEntries.includes(entry.id) 
                                    ? 'saturate(2)' 
                                    : 'saturate(0.2)';
                            })
                            .on('mouseover', (event) => {
                                d3.select(this)
                                    .attr('opacity', 1)
                                    .attr('transform', 'rotate(1)');
                                updateTooltip(event, entry, color);
                                handlePetalHover(entry);
                            })
                            .on('mouseout', () => {
                                d3.select(this)
                                    .attr('opacity', 1)
                                    .attr('transform', 'rotate(0)');
                                hideTooltip();
                                handlePetalLeave();
                            })
                            .on('click', (event) => handleClusterElementClick(event, entry, color));
                    }
                });

        } catch (error) {
            console.error(`Error creating petal cluster for year ${year}:`, error);
        }
    }
  function addClusterCircle(year: string, position: { x: number, y: number }, clusterRadius: number, animate: boolean = false) {
        const padding = 10.25;
        const circleRadius = clusterRadius + padding;

        const circle = svg.append('circle')
            .attr('class', `cluster-circle-${year} year-${year}`)
            .attr('cx', position.x)
            .attr('cy', position.y)
            .attr('fill', 'none');

        if (animate) {
            circle
                .attr('r', 0)
                .transition()
                .duration(clusterAnimationDuration)
                .attr('r', circleRadius);
        } else {
            circle.attr('r', circleRadius);
        }
    }


    function drawYearCircle() {
        const yearCircleRadius = outerRadius + width * 0.0167;
        const segmentArc = d3.arc<string>()
            .innerRadius(yearCircleRadius)
            .outerRadius(yearCircleRadius + width * 0.0033)
            .startAngle((d, i) => xScale(d)!)
            .endAngle((d, i) => xScale(d)! + xScale.bandwidth());

        svg.selectAll(".year-segment").remove();
        svg.selectAll(".year-label").remove();

        yearSegments = svg.append("g")
            .selectAll("path")
            .data(allYears)
            .enter()
            .append("path")
            .attr("d", segmentArc)
            .attr("z-index", 1)
            .attr("fill", d => d === overviewYear ? "#fff" : "#fff")
            .attr("stroke", "#ccc")
            .attr("stroke-width", width * 0.0005)
            .attr("class", d => `year-segment year-segment-${d}`)
            .style("cursor", "pointer")
            .on("click", handleYearClick);

        yearLabels = svg.append("g")
            .selectAll("text")
            .data(allYears)
            .enter()
            .append("text")
            .attr("x", d => Math.sin(xScale(d)! + xScale.bandwidth() / 2) * (yearCircleRadius + width * 0.0417))
            .attr("y", d => -Math.cos(xScale(d)! + xScale.bandwidth() / 2) * (yearCircleRadius + width * 0.0167))
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text(d => d)
            .attr("font-size", `0.825rem`)
            .attr("fill", d => d === overviewYear ? "#C9623F" : "#666")
            .attr("font-weight", d => d === overviewYear ? "bold" : "normal")
            .attr("class", d => `year-label year-label-${d}`)
            .style("cursor", "pointer")
            .on("click", handleYearClick);
    }
 
    function updateVisibility(year: string) {
        allYears.forEach(y => {
            const isActiveYear = y === year;
            const saturation = isActiveYear ? 1 : 0.125;

            svg.selectAll(`.cluster-${y}`)
                .transition()
                .duration(transitionDuration)
                .ease(transitionEase)
                .style("filter", `saturate(${saturation})`)
                .style("opacity", 1);

            svg.selectAll(`.timeline-line.year-${y}`)
                .transition()
                .duration(transitionDuration)
                .ease(transitionEase)
                .style("opacity", isActiveYear ? 1 : 0.5);

            yearSegments.filter(d => d === y)
                .attr("stroke", isActiveYear ? "#C9623F": "#ccc")
                .attr("stroke-width", isActiveYear ? 1.2 : .5)
                .attr("fill", d => d === overviewYear ? "#C9623F" : (isActiveYear ? "#C9623F" : "none"));

            yearLabels.filter(d => d === y)
                .attr("fill", isActiveYear ? "#C9623F": "#666")
                .attr("font-weight", d => d === overviewYear ? "bold" : (isActiveYear ? "800" : "normal"));
        });
     
        if (summaryInstance) {
            summaryInstance.$set({ currentYear: year });
        }
    }


    function loadSVG(petalCount: number): string {
      return petalSVGs[petalCount as keyof typeof petalSVGs] || petalSVGs[1];
    }
    let timelineContainer: HTMLElement;
  let tooltipWidth = 300; // Approximate width of the tooltip
  let tooltipHeight = 150; // Approximate height of the tooltip

  function updateTooltipPosition(event: MouseEvent, entry: ConstellationEntry, color: string) {
    if (!timelineContainer) return;

    const rect = timelineContainer.getBoundingClientRect();
    let x = event.clientX - rect.left + 10; // 10px to the right of the cursor
    let y = event.clientY - rect.top;

    // Ensure the tooltip stays within the bounds of the container
    x = Math.min(x, rect.width - tooltipWidth);
    y = Math.min(y, rect.height - tooltipHeight);

    tooltipContent = {
      sponsor: entry.Sponsor,
      drugName: entry["Drug Name"],
      therapeuticArea: entry.name,
      id: entry.id
    };
    tooltipBorderColor = color;
    tooltipX = x;
    tooltipY = y;
    tooltipVisible = true;
  }

    function updateTooltip(event: MouseEvent, entry: ConstellationEntry, color: string) {
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
  }

    function hideTooltip() {
      tooltipVisible = false;
    }
  
    function handleClusterElementClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
      event.stopPropagation();
      if (entry.Year !== activeYear) {
        handleClusterClick(event, entry.Year);
      } else {
        dispatch('clusterElementClick', { entry, color });
      }
    }
  
    function handleYearClick(event: MouseEvent | null, year: string) {
      activeYear = year;
      updateVisibility(year);
      dispatch('yearChange', { year });
    }
  
    function handleClusterClick(event: MouseEvent, year: string) {
      if (year !== activeYear) {
        activeYear = year;
        updateVisibility(year);
        dispatch('yearChange', { year });
      }
    }
  
    function handleClusterHover(event: MouseEvent, year: string) {
      if (year !== activeYear) {
        hoveredYear = year;
        highlightYear(year);
      }
    }
  
    function handleClusterLeave(event: MouseEvent) {
      if (hoveredYear && hoveredYear !== activeYear) {
        hoveredYear = null;
        updateVisibility(activeYear);
      }
    }


    function highlightYear(year: string) {
        allYears.forEach(y => {
            const isHighlightedYear = y === year;
            const saturation = isHighlightedYear ? 1 : 0.125;

            svg.selectAll(`.cluster-${y}`)
                .transition()
                .duration(transitionDuration)
                .ease(transitionEase)
                .style("filter", `saturate(${saturation})`)
                .style("opacity", 1);

            svg.selectAll(`.timeline-line.year-${y}`)
                .transition()
                .duration(transitionDuration)
                .ease(transitionEase)
                .style("opacity", isHighlightedYear ? 1 : 0.5);

            yearSegments.filter(d => d === y)
                .attr("stroke", isHighlightedYear ? "#C9623F": "#ccc")
                .attr("stroke-width", isHighlightedYear ? 1.2 : .5)
                .attr("fill", d => d === overviewYear ? "#C9623F" : (isHighlightedYear ? "#C9623F" : "none"));

            yearLabels.filter(d => d === y)
                .attr("fill", isHighlightedYear ? "#C9623F": "#666")
                .attr("font-weight", d => d === overviewYear ? "bold" : (isHighlightedYear ? "800" : "normal"));
        });
    }

    export function navigate(direction: 'prev' | 'next') {
        const currentIndex = allYears.indexOf(currentYear);
        let newIndex;

        if (direction === 'next') {
            newIndex = (currentIndex + 1) % allYears.length;
        } else {
            newIndex = (currentIndex - 1 + allYears.length) % allYears.length;
        }

        currentYear = allYears[newIndex];
        updateVisibility(currentYear);
        dispatch('yearChange', { year: currentYear });
    }

    function handlePetalHover(entry: ConstellationEntry) {
      hoveredPetalData = {
        name: entry.name,
        id: entry.id,
        drugName: entry["Drug Name"]
      };
      dispatch('petalHover', entry);
      if (summaryDisplayComponent) {
        summaryDisplayComponent.updateHoveredData(hoveredPetalData);
      }
    }
     
    function handlePetalLeave() {
      hoveredPetalData = null;
      dispatch('petalLeave');
      if (summaryDisplayComponent) {
        summaryDisplayComponent.updateHoveredData(null);
      }
    }
  
    function handleSponsorClick(event: CustomEvent) {
      const { sponsor } = event.detail;
      const sponsorData = constellationData.filter(d => d.Sponsor === sponsor);
      const sponsorTransactions = constellationData.filter(d => 
        (d.Sponsor === sponsor && d.Purchased === "Y") || d.Purchaser === sponsor
      );
      dispatch('sponsorClick', { sponsor, sponsorData, sponsorTransactions });
    }
  
    function handleRowClick(event: CustomEvent) {
    // Implement row click logic
    console.log('Row clicked:', event.detail);
    // You might want to dispatch an event or update some state here
  }

  function handleRowHover(event: CustomEvent) {
    // Implement row hover logic
    console.log('Row hovered:', event.detail);
    // You might want to update some state or show a tooltip here
  }

  function handleRowLeave(event: CustomEvent) {
    // Implement row leave logic
    console.log('Row left:', event.detail);
    // You might want to hide a tooltip or reset some state here
  }
</script>

<div class="timeline-container" 
    bind:clientWidth={containerWidth} 
    bind:clientHeight={containerHeight}
    bind:this={timelineContainer}>
    <svg id="radial-timeline"></svg>
    <Tooltip
      x={tooltipX}
      y={tooltipY}
      visible={tooltipVisible}
      content={tooltipContent}
      borderColor={tooltipBorderColor}
    />
</div>

<style>
    .timeline-container {
    width: auto;
    height: 90vh;
    position: relative;
    overflow: hidden;
  }

  :global(.axis text) {
    font-size: 10px;
    fill: #666;
  }

  :global(.grid-lines circle) {
    opacity: 1;
    stroke: 2px solid #ccc;
    z-index: 1;
  }

  :global(.radial-lines line) {
    opacity: 1;
    z-index: 1;
  }

  :global(.year-segment) {
    transition: stroke 0.3s ease;
    z-index: 1;
  }

  :global(.year-label) {
    transition: fill 0.3s ease, font-weight 0.3s ease;
    z-index: 1;
  }

  :global(.petal-element, .cluster-circle, .cluster) {
    transition: filter 0.5s ease-out;
    cursor: pointer;
    z-index: 999;
  }

  :global(.year-segment, .year-label) {
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 1;
  }

  :global(.year-segment:hover, .year-label:hover) {
    fill: #C9623F;
    stroke: #C9623F;
  }

  :global(.timeline-line) {
    shape-rendering: geometricPrecision;
  }
</style>
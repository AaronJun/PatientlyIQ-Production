<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import type { Selection } from 'd3';
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

  let container: HTMLElement;
  let width: number;
  let height: number;
  let petalScale: number;
  let innerRadius: number;
  let outerRadius: number;

  export let data: RPDData[];
  export let constellationData: ConstellationEntry[];
  export let summaryDisplayComponent: any;
  export let overviewYear: string = "Overview";
  export let isDrawerOpen: boolean;
  export let selectedData: any;
  export let transitionDuration: number = 400;
  export let transitionEase: (t: number) => number = d3.easeCircle;

  let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  let currentYear: string = overviewYear;
  let highlightedEntries: string[] = [];
  let summaryInstance: any;
  let hoveredYear: string | null = null;
  let activeYear: string = overviewYear;
  let activeIndex = 0;
  
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
    "Hepatology": "#FF00D4"
  };

  const years = [...new Set(data.map(d => d.Year))].sort((a, b) => +a - +b);
  const allYears = years;
  const maxRPD = Math.max(...data.map(d => +d.RPD));

  const rpdPrvCounts = constellationData.reduce((acc, entry) => {
    acc[entry.Year] = (acc[entry.Year] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  data = data.map(item => ({
    ...item,
    "RPD PRV": rpdPrvCounts[item.Year]?.toString() || "0"
  }));

  let xScale: d3.ScaleBand<string>;
  let yScale: d3.ScaleLogarithmic<number, number>;

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const groupedConstellationData = d3.group(constellationData, d => d.Year);

  let yearSegments: Selection<SVGPathElement, string, SVGGElement, unknown>;
  let yearLabels: Selection<SVGTextElement, string, SVGGElement, unknown>;

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

  function handleKeydown(event: KeyboardEvent) {
    if (!isDrawerOpen) {
      if (event.key === 'ArrowLeft') {
        navigateYear(-1);
      } else if (event.key === 'ArrowRight') {
        navigateYear(1);
      }
    }
  }

  function navigateYear(direction: number) {
    activeIndex = years.indexOf(activeYear);
    const newIndex = Math.max(0, Math.min(years.length - 1, activeIndex + direction));
    const newYear = years[newIndex];
    
    if (newYear !== activeYear) {
      activeYear = newYear;
      updateVisibility(newYear);
      dispatch('yearChange', { year: newYear });
    }
  }

  function initializeDimensions() {
    if (!container) return;

    width = container.offsetWidth;
    height = container.offsetHeight;
    
    const rightPadding = width * 0.1;
    const adjustedWidth = width - rightPadding;
    
    innerRadius = Math.min(adjustedWidth, height) * 0.15;
    outerRadius = Math.min(adjustedWidth, height) * 0.3725;
    petalScale = Math.min(adjustedWidth, height) / 1600;

    xScale = d3.scaleBand()
      .range([0, Math.PI])
      .align(0)
      .domain(allYears);

    yScale = d3.scaleLog()
      .range([innerRadius, outerRadius])
      .domain([1, maxRPD]);
  }

  function resize() {
    if (!container) return;
    
    initializeDimensions();
    
    if (svg) {
      svg.attr("width", width)
         .attr("height", height)
         .select("g")
         .attr("transform", `translate(${width / 2},${height / 2})`);
         
      drawTimeline();
    }
  }

  onMount(() => {
    initializeDimensions();
    
    svg = d3.select("#radial-timeline")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 5},${height / 2.15})`);

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    
    resizeObserver.observe(container);
    window.addEventListener('keydown', handleKeydown);

    drawTimeline();
    placeSummaryDisplay();
    updateVisibility(overviewYear);
    dispatch('yearChange', { year: overviewYear });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  function getColor(name: string): string {
    return therapeuticAreaColors[name as keyof typeof therapeuticAreaColors] || "#000000";
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
    const logBase = 1.35;
    const guideLines = d3.range(Math.floor(Math.log(maxRPD) / Math.log(logBase)) + 1)
      .map(i => Math.pow(logBase, i));

    svg.append("g")
      .selectAll("path")
      .data(guideLines)
      .enter()
      .append("path")
      .attr("d", d => {
        const radius = yScale(d);
        return d3.arc()({
          innerRadius: radius,
          outerRadius: radius,
          startAngle: 0,
          endAngle: Math.PI
        });
      })
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "3,3")
      .style("opacity", 0.625);

    svg.append("g")
      .selectAll("text")
      .data(guideLines)
      .enter()
      .filter((_, i) => i % 3 === 0)
      .append("text")
      .attr("transform", d => {
        const radius = yScale(d);
        const angle = Math.PI / 2;
        const x = -radius * Math.cos(angle);
        const y = radius * Math.sin(angle) - 10;
        return `translate(${x}, ${y})`;
      })
      .text(d => d3.format(".0s")(d))
      .attr("font-size", "10px")
      .attr("fill", "#666")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "auto");
  }

  function drawYearLines() {
    svg.append("g")
      .selectAll("line")
      .data(data)
      .enter()
      .append("line")
      .attr("class", d => `year-${d.Year} timeline-line`)
      .attr("stroke", d => colorScale(d.Year))
      .attr("stroke-width", Math.min(width, height) * 0.0025)
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
        const angle = xScale(d.Year)! + xScale.bandwidth() / 2;
        return Math.sin(angle) * yScale(Math.max(1, +d.RPD));
      })
      .attr("cy", d => {
        const angle = xScale(d.Year)! + xScale.bandwidth() / 2;
        return -Math.cos(angle) * yScale(Math.max(1, +d.RPD));
      })
      .attr("r", 2.5)
      .attr("fill", d => colorScale(d.Year));
  }

  function createPetalCluster(year: string, entries: ConstellationEntry[], position: { x: number, y: number, angle: number }, animate: boolean = false) {
    try {
      const petalCount = Math.min(entries.length, 10);
      const svgContent = petalSVGs[petalCount as keyof typeof petalSVGs] || petalSVGs[1];
      
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
            scale(${petalScale})
            translate(${-parseFloat(svgWidth)/2}, ${-parseFloat(svgHeight)/2})
          `;

          if (animate) {
            cluster
              .attr('transform', `translate(${position.x}, ${position.y}) scale(0)`)
              .transition()
              .duration(500)
              .attr('transform', targetTransform);
          } else {
            cluster.attr('transform', targetTransform);
          }

          const scaledRadius = Math.max(parseFloat(svgWidth), parseFloat(svgHeight)) / 2 * petalScale;
          addClusterCircle(year, { x: position.x, y: position.y }, scaledRadius, animate);
        }
      }

      cluster.selectAll('path')
        .attr('class', (_, i) => `petal-${year} petal-${year}-${i}`)
        .each(function(_, i) {
          if (i < entries.length) {
            const entry = entries[i];
            const color = getColor(entry.name);
            
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
                handlePetalHover(event, entry, color);
              })
              .on('mouseout', () => {
                d3.select(this)
                  .attr('opacity', 1)
                  .attr('transform', 'rotate(0)');
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
    const padding = 10.25 * petalScale;
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
        .duration(500)
        .attr('r', circleRadius);
    } else {
      circle.attr('r', circleRadius);
    }
  }

  function drawYearCircle() {
    const yearCircleRadius = outerRadius + width * 0.01675;
    const labelRadius = yearCircleRadius + width * 0.025;
    
    const segmentArc = d3.arc<string>()
      .innerRadius(yearCircleRadius)
      .outerRadius(yearCircleRadius + width * 0.0025)
      .startAngle(d => xScale(d)!)
      .endAngle(d => xScale(d)! + xScale.bandwidth());

    svg.selectAll(".year-segment").remove();
    svg.selectAll(".year-label").remove();

    yearSegments = svg.append("g")
      .selectAll("path")
      .data(allYears)
      .enter()
      .append("path")
      .attr("d", segmentArc)
      .attr("fill", d => d === overviewYear ? "#fff" : "#fff")
      .attr("stroke", "#ccc")
      .attr("stroke-width", width * 0.00125)
      .attr("class", d => `year-segment year-segment-${d}`)
      .style("cursor", "pointer")
      .on("click", handleYearClick);

    yearLabels = svg.append("g")
      .selectAll("text")
      .data(allYears)
      .enter()
      .append("text")
      .attr("x", d => Math.sin(xScale(d)! + xScale.bandwidth() / 2) * labelRadius)
      .attr("y", d => -Math.cos(xScale(d)! + xScale.bandwidth() / 2) * labelRadius)
      .attr("transform", d => {
        const angle = (xScale(d)! + xScale.bandwidth() / 2) * 180 / Math.PI;
        const x = Math.sin(xScale(d)! + xScale.bandwidth() / 2) * labelRadius;
        const y = -Math.cos(xScale(d)! + xScale.bandwidth() / 2) * labelRadius;
        return `rotate(${angle - 90},${x},${y})`;
      })
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "top")
      .text(d => d)
      .attr("font-size", `${Math.min(width, height) * 0.0007}rem`)
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
        .attr("stroke-width", isActiveYear ? 1.2 : .725)
        .attr("fill", d => d === overviewYear ? "#C9623F" : (isActiveYear ? "#C9623F" : "none"));

      yearLabels.filter(d => d === y)
        .attr("fill", isActiveYear ? "#C9623F": "#666")
        .attr("font-weight", d => d === overviewYear ? "bold" : (isActiveYear ? "800" : "normal"));
    });
   
    if (summaryInstance) {
      summaryInstance.$set({ currentYear: year });
    }
  }

  function drawTimeline() {
    svg.selectAll("*").remove();
    drawGuideLines();
    drawYearLines();
    drawClusters();
    drawYearCircle();
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

  function handlePetalHover(event: MouseEvent, entry: ConstellationEntry, color: string) {
    dispatch('petalHover', { event, entry, color });
  }

  function handlePetalLeave() {
    dispatch('petalLeave');
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

  function handleClusterElementClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
    event.stopPropagation();
    if (entry.Year !== activeYear) {
      handleClusterClick(event, entry.Year);
    } else {
      dispatch('clusterElementClick', { entry, color });
    }
  }

  function handleClusterHover(event: MouseEvent, year: string) {
    if (year !== activeYear) {
      hoveredYear = year;
      highlightYear(year);
    }
  }

  function handleClusterLeave() {
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

  export function updateHighlightedEntries(entries: string[]) {
    highlightedEntries = entries;
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
</script>

<div class="timeline-container" bind:this={container}>
  <svg id="radial-timeline"></svg>
</div>

<style>
  .timeline-container {  
    width: 100%;
    height: 100%;
    padding: 0;
    overflow: visible;
  }
</style>
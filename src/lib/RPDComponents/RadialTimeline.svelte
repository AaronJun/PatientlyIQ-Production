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

// Add near the top of the script
let yearSummaryData: Record<string, { designations: number; awarded: number; sold: number }> = {};

  export let data: RPDData[];
  export let constellationData: ConstellationEntry[];
  export let selectedData: any;
  export let transitionDuration: number = 400;
  export let transitionEase: (t: number) => number = d3.easeCircle;

  let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  let hoveredYear: string | null = null;
  let activeYear: string;
  let highlightedEntries: string[] = [];
  
  const dispatch = createEventDispatcher();
  
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
    "Genetic": "#4D4DFF",
    "Hepatology": "#FF00D4"
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
  activeYear = years[0];
  
  function centerActiveYear(year: string) {
  const scrollContainer = container;
  const yearElement = svg.select(`.year-${year}`).node();
  
  if (scrollContainer && yearElement instanceof SVGElement) {
    const containerWidth = scrollContainer.clientWidth;
    const yearRect = yearElement.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollLeft = scrollContainer.scrollLeft;
    
    const targetScroll = scrollLeft + yearRect.left - containerRect.left - (containerWidth / 2) + (yearRect.width / 2);
    
    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }
}
function handleKeydown(event: KeyboardEvent) {
  const currentIndex = years.indexOf(activeYear);
  
  if (event.key === 'ArrowLeft' && currentIndex > 0) {
    const newYear = years[currentIndex - 1];
    activeYear = newYear;
    updateVisibility(newYear);
    centerActiveYear(newYear);
    dispatch('yearChange', { year: newYear });
  } else if (event.key === 'ArrowRight' && currentIndex < years.length - 1) {
    const newYear = years[currentIndex + 1];
    activeYear = newYear;
    updateVisibility(newYear);
    centerActiveYear(newYear);
    dispatch('yearChange', { year: newYear });
  }
}

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
  let yScale: d3.ScaleLinear<number, number>;

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const groupedConstellationData = d3.group(constellationData, d => d.Year);

  function initializeDimensions() {
  if (!container) return;

  width = container.clientWidth;
  height = container.clientHeight;
  
  const minWidth = Math.max(width, years.length * 215);
  petalScale = Math.min(width, height) / 1200;

  xScale = d3.scaleBand()
    .range([50, minWidth - 170]) // Changed from [100, minWidth - 200]
    .padding(0)
    .domain(years);

  yScale = d3.scaleLinear()
    .range([height * 0.7825, height * 0.1])
    .domain([0, maxRPD+50]);
    
  if (svg) {
    svg.select("svg")
       .attr("width", minWidth)
       .attr("height", height);
  }
}

  function createPetalCluster(year: string, entries: ConstellationEntry[], position: { x: number, y: number }) {
    try {
      const petalCount = Math.min(entries.length, 12);
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
          const targetTransform = `
            translate(${position.x}, ${position.y})
            scale(${petalScale})
            translate(${-parseFloat(svgWidth)/2}, ${-parseFloat(svgHeight)/2})
          `;

          cluster.attr('transform', targetTransform);

          cluster.selectAll('path')
            .attr('class', (_, i) => `petal-${year} petal-${year}-${i}`)
            .each(function(_, i) {
              if (i < entries.length) {
                const entry = entries[i];
                const color = therapeuticAreaColors[entry.name as keyof typeof therapeuticAreaColors] || "#000000";
                
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
        }
      }
    } catch (error) {
      console.error(`Error creating petal cluster for year ${year}:`, error);
    }
  }

  function drawTimeline() {
    svg.selectAll("*").remove();
    drawAxis();
    drawDataLines();
    drawClusters();
  }

  function drawAxis() {
    const fullWidth = Math.max(width, years.length * 200);

    svg.append("defs")
      .append("clipPath")
      .attr("id", "grid-clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", fullWidth)
      .attr("height", height);

    svg.append("g")
      .attr("class", "grid horizontal-grid")
      .attr("clip-path", "url(#grid-clip)")
      .call(d3.axisLeft(yScale)
        .tickSize(-fullWidth)
        .tickFormat(() => ""))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "2,2")
        .attr("x2", fullWidth));

    svg.append("g")
      .attr("class", "grid vertical-grid")
      .attr("transform", `translate(0,${height * 0.8})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height * 0.5925)
        .tickFormat(() => ""))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr("stroke", "#e0e0e0")
        .attr("stroke-dasharray", "2,2"));

    const yAxisGroup = svg.append("g")
      .attr("class", "y-axis-group")
      .attr("transform", "translate(69,0)");

    yAxisGroup.append("rect")
      .attr("class", "y-axis-background")
      .attr("x", -100)
      .attr("y", 0)
      .attr("width", 100)
      .attr("height", height)
      .attr("fill", "white")
      .attr("stroke-width", 0.5);

    yAxisGroup.append("g")
      .attr("class", "axis y-axis")
      .call(d3.axisLeft(yScale)
        .tickSize(0))
      .call(g => g.select(".domain").attr("stroke", "#999"))
      .call(g => g.selectAll(".tick text")
        .attr("fill", "#666")
        .attr("x", -10));

  
        const xAxis = svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height * 0.8})`);
    
  xAxis.call(d3.axisBottom(xScale).tickSize(0));

  xAxis.select(".domain")
    .attr("stroke", "#999")
    .attr("stroke-width", 0.5);
    
    xAxis.selectAll(".tick text")
      .attr("fill", d => d === activeYear ? "#ff1515" : "#666")
      .attr("font-weight", d => d === activeYear ? "bold" : "normal")
      .attr("y", 15);
      
      xAxis.selectAll(".tick text")
    .attr("cursor", "pointer")
    .attr("fill", d => d === activeYear ? "#ff1515" : "#666")
    .attr("font-weight", d => d === activeYear ? "bold" : "normal")
    .attr("y", 15)
    .on("click", (event, d) => {
      activeYear = d;
      updateVisibility(d);
      centerActiveYear(d);
      dispatch('yearChange', { year: d });
    });


    xAxis.selectAll(".year-indicator")
      .data(years)
      .join("circle")
      .attr("class", "year-indicator")
      .attr("cx", d => xScale(d)! + xScale.bandwidth() / 2)
      .attr("cy", 30)
      .attr("r", 4)
      .attr("fill", d => d === activeYear ? "#ff1515" : "transparent");
  }

  function drawDataLines() {
    svg.append("g")
      .selectAll("line")
      .data(data)
      .join("line")
      .attr("class", d => `year-${d.Year} timeline-line`)
      .attr("x1", d => xScale(d.Year)! + xScale.bandwidth() / 2)
      .attr("x2", d => xScale(d.Year)! + xScale.bandwidth() / 2)
      .attr("y1", height * 0.8)
      .attr("y2", d => yScale(+d.RPD))
      .attr("stroke", d => colorScale(d.Year))
      .attr("stroke-width", 2);
  }

  function drawClusters() {
    years.forEach(year => {
      const entries = groupedConstellationData.get(year) || [];
      if (entries.length > 0) {
        const x = xScale(year)! + xScale.bandwidth() / 2;
        const y = yScale(+data.find(d => d.Year === year)!.RPD);
        createPetalCluster(year, entries, { x, y });
      }
    });
  }

  function handlePetalHover(event: MouseEvent, entry: ConstellationEntry, color: string) {
    dispatch('petalHover', { event, entry, color });
    dispatch('yearChange', { year: entry.Year });
  }

  function handlePetalLeave() {
    dispatch('petalLeave');
  }

function handleClusterClick(event: MouseEvent, year: string) {
  activeYear = year;
  updateVisibility(year);
  centerActiveYear(year);
  dispatch('yearChange', { year });
}

  function handleClusterElementClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
    event.stopPropagation();
    dispatch('clusterElementClick', { entry, color });
  }

  function handleClusterHover(event: MouseEvent, year: string) {
    hoveredYear = year;
    highlightYear(year);
  }

  function handleClusterLeave() {
    hoveredYear = null;
    updateVisibility(activeYear);
  }

  function updateVisibility(year: string) {
    years.forEach(y => {
      const isActiveYear = y === year;
      const saturation = isActiveYear ? 1 : 0.125;

      svg.selectAll(`.cluster-${y}`)
        .transition()
        .duration(transitionDuration)
        .ease(transitionEase)
        .style("filter", `saturate(${saturation})`);

      svg.selectAll(`.timeline-line.year-${y}`)
        .transition()
        .duration(transitionDuration)
        .ease(transitionEase)
        .style("opacity", isActiveYear ? 1 : 0.5);

      svg.selectAll(".tick text")
        .transition()
        .duration(transitionDuration)
        .attr("fill", d => d === year ? "#ff1515" : "#666")
        .attr("font-weight", d => d === year ? "bold" : "normal");

      svg.selectAll(".year-indicator")
        .transition()
        .duration(transitionDuration)
        .attr("fill", d => d === year ? "#ff1515" : "transparent");
    });
  }

  function highlightYear(year: string) {
    updateVisibility(year);
  }

  onMount(() => {
    initializeDimensions();
    
    window.addEventListener('keydown', handleKeydown);
    
    const mainSvg = d3.select(container)
      .append("svg")
      .attr("class", "timeline-svg")
      .attr("width", Math.max(width, years.length * 200))
      .attr("height", height);

      svg = mainSvg.append("g")
      .attr("class", "scroll-content")
      .attr("transform", "translate(30,0)"); // Changed from translate(60,0)


    const resizeObserver = new ResizeObserver(() => {
      d3.select(container).selectAll("*").remove();
      initializeDimensions();
      
      const mainSvg = d3.select(container)
        .append("svg")
        .attr("class", "timeline-svg")
        .attr("width", Math.max(width, years.length * 200))
        .attr("height", height);

      svg = mainSvg.append("g")
        .attr("class", "scroll-content")
        .attr("transform", "translate(0,0)");
        
      drawTimeline();
    });
    
    resizeObserver.observe(container);
    drawTimeline();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="timeline-container" bind:this={container}>
</div>

<style>
  .timeline-container {
    width: 100%;
    height: 100%;
    padding: 0;
    overflow-x: auto;
    overflow-y: hidden;
    position: relative;
  }

  :global(.timeline-container svg.timeline-svg) {
    min-width: 100%;
    height: 100%;
  }

  :global(.fixed-y-axis) {
    position: sticky;
    left: 0;
    border-right: .5px solid #eee;
  }

  :global(.fixed-y-axis::after) {
    position: sticky;
    top: 0;
    right: -10px;
    width: 10px;
    height: 100%;
    background: linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0));
    pointer-events: none;
  }

  :global(.year-indicator) {
    transition: fill 0.3s ease;
  }
</style>
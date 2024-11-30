<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    import type { Selection } from 'd3';
    import "carbon-components-svelte/css/all.css";
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
      Month: string;
      Date: string;
    }
  
    let containerWidth: number;
    let containerHeight: number;
    $: width = Math.max(containerWidth || 2500, 1200);
    $: height = Math.max(containerHeight || 500, 400);
    $: petalScale = Math.min(width, height) / 2000;
  
    export let data: RPDData[];
    export let constellationData: ConstellationEntry[];
    export let overviewYear: string = "Overview";
    
    let svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    let currentYear: string = overviewYear;
    let highlightedEntries: string[] = [];
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
      "Hepatology": "#FF00D4",
    };
  
    const margin = { top: 40, right: 40, bottom: 40, left: 60 };
    const years = [...new Set(data.map(d => d.Year))].sort((a, b) => +a - +b);
    const allYears = [overviewYear, ...years];
    
    const maxRPD = Math.max(...data.map(d => +d.RPD));
    const rpdPrvCounts = constellationData.reduce((acc, entry) => {
      acc[entry.Year] = (acc[entry.Year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    data = data.map(item => ({
      ...item,
      "RPD PRV": rpdPrvCounts[item.Year]?.toString() || "0"
    }));
  
    $: xScale = d3.scaleBand()
      .range([margin.left, width - margin.right])
      .domain(allYears)
      .padding(0.1);
  
    $: yScale = d3.scaleLog()
      .range([height - margin.bottom, margin.top])
      .domain([1, maxRPD]);
  
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const groupedConstellationData = d3.group(constellationData, d => d.Year);
  
    onMount(() => {
      svg = d3.select("#horizontal-timeline")
        .attr("width", width)
        .attr("height", height)
        .append("g");
  
      drawTimeline();
      updateVisibility(overviewYear);
      dispatch('yearChange', { year: overviewYear });
  
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    });
  
    function getColor(name: string): string {
      return therapeuticAreaColors[name as keyof typeof therapeuticAreaColors] || "#000000";
    }
  
    function handleResize() {
      width = Math.max(containerWidth || 1200, 800);
      height = Math.max(containerHeight || 500, 400);
      
      svg.selectAll("*").remove();
      drawTimeline();
      updateVisibility(currentYear);
    }
  
    function drawTimeline() {
      svg.selectAll("*").remove();
      drawAxes();
      drawLines();
      drawClusters();
      drawYearLabels();
    }
  
    function drawAxes() {
      // X axis
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
  
      // Y axis
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
  
      // Grid lines
      svg.append("g")
        .selectAll("line")
        .data(yScale.ticks())
        .join("line")
          .attr("x1", margin.left)
          .attr("x2", width - margin.right)
          .attr("y1", d => yScale(d))
          .attr("y2", d => yScale(d))
          .attr("stroke", "#ccc")
          .attr("stroke-dasharray", "2,2")
          .style("opacity", 0.5);
    }
  
    function drawLines() {
      svg.append("g")
        .selectAll("line")
        .data(data)
        .join("line")
          .attr("class", d => `year-${d.Year} timeline-line`)
          .attr("stroke", d => colorScale(d.Year))
          .attr("stroke-width", 2)
          .attr("x1", d => xScale(d.Year)! + xScale.bandwidth() / 2)
          .attr("x2", d => xScale(d.Year)! + xScale.bandwidth() / 2)
          .attr("y1", height - margin.bottom)
          .attr("y2", d => yScale(Math.max(1, +d.RPD)))
          .style("vector-effect", "non-scaling-stroke");
  
      // Data points
      svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
          .attr("class", d => `year-${d.Year}`)
          .attr("cx", d => xScale(d.Year)! + xScale.bandwidth() / 2)
          .attr("cy", d => yScale(Math.max(1, +d.RPD)))
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
              const x = xScale(year)! + xScale.bandwidth() / 2;
              const y = yScale(+yearData.RPD);
              createCluster(year, entries, { x, y });
            }
          }
        }
      });
    }
  
    function createCluster(year: string, entries: ConstellationEntry[], position: { x: number, y: number }) {
      const cluster = svg.append("g")
        .attr("class", `year-${year} cluster-${year}`)
        .attr("transform", `translate(${position.x},${position.y})`);
  
      const radius = 20 * petalScale;
      
      entries.forEach((entry, i) => {
        const angle = (2 * Math.PI * i) / entries.length;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        cluster.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 5)
          .attr("fill", getColor(entry.name))
          .style("cursor", "pointer")
          .on("mouseover", (event) => handlePetalHover(event, entry))
          .on("mouseout", handlePetalLeave)
          .on("click", (event) => handleClusterElementClick(event, entry, getColor(entry.name)));
      });
    }
  
    function drawYearLabels() {
      svg.append("g")
        .selectAll("text")
        .data(allYears)
        .join("text")
          .attr("class", d => `year-label year-label-${d}`)
          .attr("x", d => xScale(d)! + xScale.bandwidth() / 2)
          .attr("y", height - margin.bottom + 30)
          .attr("text-anchor", "middle")
          .text(d => d)
          .attr("font-size", "12px")
          .attr("fill", d => d === currentYear ? "#C9623F" : "#666")
          .style("cursor", "pointer")
          .on("click", (_, d) => handleYearClick(null, d));
    }
  
    function updateVisibility(year: string) {
      allYears.forEach(y => {
        const isActiveYear = y === year;
        const saturation = isActiveYear ? 1 : 0.125;
  
        svg.selectAll(`.cluster-${y}`)
          .style("filter", `saturate(${saturation})`)
          .style("opacity", 1);
  
        svg.selectAll(`.timeline-line.year-${y}`)
          .style("opacity", isActiveYear ? 1 : 0.5);
  
        svg.selectAll(`.year-label-${y}`)
          .attr("fill", isActiveYear ? "#C9623F" : "#666")
          .attr("font-weight", isActiveYear ? "bold" : "normal");
      });
    }
  
    function handleYearClick(event: MouseEvent | null, year: string) {
      currentYear = year;
      updateVisibility(year);
      dispatch('yearChange', { year });
    }
  
    function handleClusterElementClick(event: MouseEvent, entry: ConstellationEntry, color: string) {
      event.stopPropagation();
      dispatch('clusterElementClick', { entry, color });
    }
  
    function handlePetalHover(event: MouseEvent, entry: ConstellationEntry) {
      const rect = (event.target as Element).getBoundingClientRect();
      tooltipX = rect.left;
      tooltipY = rect.top;
      tooltipContent = {
        sponsor: entry.Sponsor,
        drugName: entry["Drug Name"],
        therapeuticArea: entry.name,
        id: entry.id
      };
      tooltipBorderColor = getColor(entry.name);
      tooltipVisible = true;
      dispatch('petalHover', entry);
    }
  
    function handlePetalLeave() {
      tooltipVisible = false;
      dispatch('petalLeave');
    }
  </script>
  
  <div class="timeline-container" 
      bind:clientWidth={containerWidth} 
      bind:clientHeight={containerHeight}>
      <svg id="horizontal-timeline"></svg>
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
      width: 100%;
      height: 80vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      overflow: hidden;
      padding-top: 1rem;
    }
  
    :global(.timeline-line) {
      shape-rendering: geometricPrecision;
    }
  
    :global(.year-label) {
      transition: fill 0.3s ease, font-weight 0.3s ease;
    }
  
    :global(.year-label:hover) {
      fill: #C9623F;
    }
  </style>
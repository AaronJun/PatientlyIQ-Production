<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  interface SubMetric {
    value: number;
    weight: number;
    min: number;
    max: number;
  }

  interface MetricGroup {
    score: number;
    weight: number;
    isInverse: boolean;
    subMetrics: {
      [key: string]: SubMetric;
    };
  }

  interface CountryData {
    name: string;
    id: string;
    calculatedMetrics: {
      [key: string]: MetricGroup;
    };
  }

  export let allData: CountryData[];
  export let selectedMetric: string;
  export let hoveredData: CountryData | null = null;
  
  let svgElement: SVGSVGElement;
  const width = 900;
  const height = 400;
  const margin = { top: 40, right: 100, bottom: 40, left: 200 };

  let metrics: {[key: string]: SubMetric} | undefined;
  $: {
    if (allData?.[0]?.calculatedMetrics) {
      metrics = allData[0].calculatedMetrics[selectedMetric]?.subMetrics;
    }
  }

  function renderChart() {
    if (!svgElement || !allData || !metrics) return;

    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const subMetrics = Object.keys(metrics);
    const allValues = allData.flatMap(country => 
      Object.values(country.calculatedMetrics[selectedMetric].subMetrics)
        .map(m => m.value)
    );

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(allValues) || 0])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
      .domain(subMetrics)
      .range([margin.top, height - margin.bottom])
      .padding(0.5);

    svg.selectAll(".background-line")
      .data(subMetrics)
      .join("line")
      .attr("class", "background-line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", d => (yScale(d) || 0) + (yScale.bandwidth() / 2))
      .attr("y2", d => (yScale(d) || 0) + (yScale.bandwidth() / 2))
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 2);

    subMetrics.forEach(metric => {
      const points = allData.map(country => ({
        country: country.name,
        value: country.calculatedMetrics[selectedMetric].subMetrics[metric].value
      }));

      svg.selectAll(`.point-${metric.replace(/\s+/g, '-')}`)
        .data(points)
        .join("circle")
        .attr("class", `point-${metric.replace(/\s+/g, '-')}`)
        .attr("cx", d => xScale(d.value))
        .attr("cy", (yScale(metric) || 0) + (yScale.bandwidth() / 2))
        .attr("r", d => d.country === hoveredData?.name ? 6 : 4)
        .attr("fill", d => d.country === hoveredData?.name ? "#2563eb" : "#94a3b8")
        .attr("stroke", d => d.country === hoveredData?.name ? "#1e40af" : "none")
        .attr("stroke-width", 2);
    });

    svg.selectAll(".metric-label")
      .data(subMetrics)
      .join("text")
      .attr("class", "metric-label")
      .attr("x", margin.left - 10)
      .attr("y", d => (yScale(d) || 0) + (yScale.bandwidth() / 2))
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#4b5563")
      .text(d => d.replace(/([A-Z])/g, ' $1').trim());

    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(-height + margin.top + margin.bottom);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr("stroke", "#e5e7eb")
        .attr("stroke-dasharray", "2,2"));
  }

  $: if (allData && selectedMetric && metrics) {
    renderChart();
  }
</script>

<div class="relative">
  <svg bind:this={svgElement} {width} {height} class="w-full h-auto"></svg>
</div>

<style>
  svg {
    max-width: 100%;
    height: auto;
    z-index: 999;
  }
</style>
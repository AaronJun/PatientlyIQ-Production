<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import * as d3 from 'd3';

    export let allData: CountryData[];
    export let selectedMetric: string;
    export let colorGradient: string[];
    export let hoveredData: CountryData | null;
    export let getColorForRank: (rank: number) => string;
  
    interface CountryData {
      name: string;
      id: string;
      [key: string]: number | string | undefined;
    }
  
let svgElement: SVGSVGElement;
  let width = 350;
  let height = 350;
  let margin = { top: 0, right: 0, bottom: 0, left: 0 };

  $: innerWidth = width - margin.left - margin.right;
  $: innerHeight = height - margin.top - margin.bottom;

  let mean = tweened(0, { duration: 700, easing: cubicOut });
  let stdDev = tweened(1, { duration: 700, easing: cubicOut });
  let skewness = tweened(0, { duration: 1500, easing: cubicOut });
  let maxPdfValue = tweened(0.4, { duration: 700, easing: cubicOut });

  $: updateChart(allData, selectedMetric, hoveredData);

  function updateChart(data: CountryData[], metric: string, hovered: CountryData | null) {
    if (!svgElement) return;

    const values = data.map(d => Number(d[metric])).filter(v => !isNaN(v));
    
    const newMean = d3.mean(values) || 0;
    const newStdDev = d3.deviation(values) || 1;
    const newSkewness = calculateSkewness(values);

    // Calculate the maximum PDF value
    const newMaxPdfValue = calculateMaxPdfValue(values, newMean, newStdDev, newSkewness);

    mean.set(newMean);
    stdDev.set(newStdDev);
    skewness.set(newSkewness);
    maxPdfValue.set(newMaxPdfValue);

    renderChart(hovered);
  }

  function calculateMaxPdfValue(values: number[], mean: number, stdDev: number, skew: number): number {
    return Math.max(...values.map(v => skewedNormalPdf(v, mean, stdDev, skew)));
  }

  function renderChart(hovered: CountryData | null) {
    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();

    const minValue = d3.min(allData, d => Number(d[selectedMetric])) || 0;
    const maxValue = d3.max(allData, d => Number(d[selectedMetric])) || 1;

    const x = d3.scaleLinear()
      .domain([minValue, maxValue])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, $maxPdfValue * 1.1]) // Add 10% padding to the top
      .range([innerHeight, 0]);

    const line = d3.line<number>()
      .x(d => x(d))
      .y(d => y(skewedNormalPdf(d, $mean, $stdDev, $skewness)));

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw the bell curve
    const curve = g.append("path")
      .datum(d3.range(minValue, maxValue, (maxValue - minValue) / 100))
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("d", line);
  
      // Apply gradient to the curve
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", y(0))
        .attr("x2", innerWidth)
        .attr("y2", y(0));
  
      gradient.selectAll("stop")
        .data(colorGradient)
        .enter().append("stop")
        .attr("offset", (d, i) => `${(i / (colorGradient.length - 1)) * 100}%`)
        .attr("stop-color", d => d);
  
      curve.attr("stroke", "url(#line-gradient)");
  
    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5));

    g.append("g")
      .call(d3.axisLeft(y).ticks(5));

    // Add hovered data point and label
    if (hovered) {
      const hoveredValue = Number(hovered[selectedMetric]);
      if (!isNaN(hoveredValue)) {
        const cx = x(hoveredValue);
        const cy = y(skewedNormalPdf(hoveredValue, $mean, $stdDev, $skewness));
        
        g.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 5)
          .attr("fill", getColorForRank(allData.indexOf(hovered)));

        const label = g.append("text")
          .attr("x", cx + 20)
          .attr("y", cy - 20)
          .attr("text-anchor", "middle")
          .attr("fill", "#161616")
          .text(hovered.name);

        // Ensure label is within bounds
        const bbox = label.node();
        if (bbox) {
          const { x: labelX, width: labelWidth } = bbox.getBBox();
          if (labelX < 0) {
            label.attr("x", labelWidth / 2);
          } else if (labelX + labelWidth > innerWidth) {
            label.attr("x", innerWidth - labelWidth / 2);
          }
        }
      }
    }
  }

    function calculateSkewness(values: number[]): number {
      const n = values.length;
      const mean = d3.mean(values) || 0;
      const stdDev = d3.deviation(values) || 1;
      const skew = (1 / n) * d3.sum(values, v => Math.pow((v - mean) / stdDev, 3));
      return Math.max(-1, Math.min(1, skew)); // Clamp skewness between -1 and 1
    }
  
    function skewedNormalPdf(x: number, mean: number, stdDev: number, skew: number): number {
      const t = (x - mean) / stdDev;
      const normalPdf = Math.exp(-t * t / 2) / (Math.sqrt(2 * Math.PI) * stdDev);
      return 2 * normalPdf * (0.5 * (1 + erf(skew * t / Math.sqrt(2))));
    }
  
    // Error function (erf) implementation
    function erf(x: number): number {
      const sign = x >= 0 ? 1 : -1;
      x = Math.abs(x);
      const a1 =  0.254829592;
      const a2 = -0.284496736;
      const a3 =  1.421413741;
      const a4 = -1.453152027;
      const a5 =  1.061405429;
      const p  =  0.3275911;
      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      return sign * y;
    }

  onMount(() => {
    updateChart(allData, selectedMetric, hoveredData);
  });

  afterUpdate(() => {
    updateChart(allData, selectedMetric, hoveredData);
  });

  $: if ($mean !== undefined && $stdDev !== undefined && $skewness !== undefined && $maxPdfValue !== undefined) {
    renderChart(hoveredData);
  }
</script>

<svg bind:this={svgElement} {width} {height}></svg>

<style>
  svg {
    height: auto;
    max-width: 350px;
    padding-top: 2rem;
    padding-left: 2rem;
  }
</style>
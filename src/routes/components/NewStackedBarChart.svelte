<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";

  export let data = [];

  let sentimentCounts = {};
  let primaryDriverCounts = {};
  let secondaryDriverCounts = {};

  // Function to count occurrences
  function countOccurrences(data, key) {
    return data.reduce((acc, obj) => {
      acc[obj[key]] = (acc[obj[key]] || 0) + 1;
      return acc;
    }, {});
  }

  // Count occurrences
  $: sentimentCounts = countOccurrences(data, "Sentiment");
  $: primaryDriverCounts = countOccurrences(data, "Primary Driver");
  $: secondaryDriverCounts = countOccurrences(data, "Secondary Driver");

  onMount(() => {
    // Create visualizations with D3 after the component is mounted
    createBarChart(sentimentCounts, "#sentiment-chart", "Sentiment");
    createBarChart(primaryDriverCounts, "#primary-driver-chart", "Primary Driver");
    createBarChart(secondaryDriverCounts, "#secondary-driver-chart", "Secondary Driver");
  });

  // Function to create bar chart
  function createBarChart(data, selector, title) {
    const width = 500;
    const height = 300;
    const margin = { top: 40, right: 20, bottom: 60, left: 40 };

    const svg = d3
      .select(selector)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3
      .scaleBand()
      .domain(Object.keys(data))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(data))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(Object.entries(data))
      .join("rect")
      .attr("x", (d) => x(d[0]))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(0) - y(d[1]))
      .attr("width", x.bandwidth());

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(title);
  }
</script>

<style>
  .chart {
    display: inline-block;
    width: 100%;
  }

  svg {
    font: 10px sans-serif;
  }

  .axis path,
  .axis line {
    fill: none;
    shape-rendering: crispEdges;
  }

  .axis text {
    font-size: 12px;
  }
</style>

<div class="chart" id="sentiment-chart"></div>
<div class="chart" id="primary-driver-chart"></div>
<div class="chart" id="secondary-driver-chart"></div>
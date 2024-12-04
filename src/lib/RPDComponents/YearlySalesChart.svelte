<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let constellationData: any[];
  
    let svg;
    let chartWidth: number;
    let chartHeight: number;
    const margin = { top: 40, right: 180, bottom: 40, left: 60 };
    let width: number;
    let height: number;
  
    $: {
      width = chartWidth - margin.left - margin.right;
      height = chartHeight - margin.top - margin.bottom;
    }
  
    function createChart() {
      if (!width || !height) return;
  
      // Process the data
      const yearlyData = d3.rollups(
        constellationData.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]),
        group => ({
          year: group[0].Year,
          count: group.length,
          value: d3.sum(group, d => parseFloat(d["Sale  Price (USD, Millions)"]) || 0)
        }),
        d => d.Year
      ).map(([year, data]) => ({
        year: +year,
        count: data.count,
        value: Math.round(data.value)
      })).sort((a, b) => a.year - b.year);
  
      // Clear previous chart
      d3.select(svg).selectAll("*").remove();
  
      // Create scales
      const xScale = d3.scaleLinear()
        .domain(d3.extent(yearlyData, d => d.year))
        .range([0, width]);
  
      const yScaleCount = d3.scaleLinear()
        .domain([0, d3.max(yearlyData, d => d.count)])
        .range([height, 0])
        .nice();
  
      const yScaleValue = d3.scaleLinear()
        .domain([0, d3.max(yearlyData, d => d.value)])
        .range([height, 0])
        .nice();
  
      // Create SVG and append groups
      const svgElement = d3.select(svg)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
  
      const g = svgElement.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
  
      // Add grid lines
      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScaleCount)
          .tickSize(-width)
          .tickFormat("")
        )
        .style("stroke-dasharray", "2,3")
        .style("stroke-opacity", 0.2);
  
      // Create line generators
      const lineCount = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScaleCount(d.count))
        .curve(d3.curveMonotoneX);
  
      const lineValue = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScaleValue(d.value))
        .curve(d3.curveMonotoneX);
  
      // Add the lines
      g.append("path")
        .datum(yearlyData)
        .attr("class", "line-count")
        .attr("d", lineCount)
        .style("fill", "none")
        .style("stroke", "#C9623F")
        .style("stroke-width", 2);
  
      g.append("path")
        .datum(yearlyData)
        .attr("class", "line-value")
        .attr("d", lineValue)
        .style("fill", "none")
        .style("stroke", "#3B665D")
        .style("stroke-width", 2);
  
      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .tickFormat(d3.format("d")))
        .style("font-size", "12px");
  
      g.append("g")
        .call(d3.axisLeft(yScaleCount))
        .style("font-size", "12px");
  
      g.append("g")
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(yScaleValue))
        .style("font-size", "12px");
  
      // Add circles for data points
      g.selectAll(".dot-count")
        .data(yearlyData)
        .join("circle")
        .attr("class", "dot-count")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScaleCount(d.count))
        .attr("r", 4)
        .style("fill", "#C9623F");
  
      g.selectAll(".dot-value")
        .data(yearlyData)
        .join("circle")
        .attr("class", "dot-value")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScaleValue(d.value))
        .attr("r", 4)
        .style("fill", "#3B665D");
  
      // Add labels
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#C9623F")
        .style("font-size", "10px")
        .text("Number of Transactions");
  
      g.append("text")
        .attr("transform", "rotate(90)")
        .attr("y", -width - margin.right + 20)
        .attr("x", height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#3B665D")
        .style("font-size", "10px")
        .text("Total Value (USD Millions)");
  
      // Create styled tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "chart-tooltip")
        .style("opacity", 0)
        .style("position", "fixed")
        .style("pointer-events", "none")
        .style("z-index", "1000")
        .style("min-width", "300px")
        .style("max-width", "300px")
        .style("margin", "2rem 0 0 2rem")
        .style("background-color", "rgba(255, 255, 255, 0.962)")
        .style("border", "0.5px solid #373737")
        .style("padding", "1rem 0.5rem 0.5rem 0.5rem");

      // Add hover interaction
      const hoverGroup = g.append("g")
        .style("opacity", 0);

      hoverGroup.append("line")
        .attr("class", "hover-line")
        .attr("y1", 0)
        .attr("y2", height)
        .style("stroke", "#000")
        .style("stroke-width", "1px")
        .style("stroke-dasharray", "3,3");

      const mouseG = g.append("rect")
        .attr("class", "mouse-over")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousemove", function(event) {
          const [xPos] = d3.pointer(event);
          const xYear = Math.round(xScale.invert(xPos));
          const dataPoint = yearlyData.find(d => d.year === xYear);

          if (dataPoint) {
            hoverGroup.style("opacity", 1)
              .attr("transform", `translate(${xScale(dataPoint.year)},0)`);

            const tooltipContent = `
              <div class="tooltip-content">
                <div class="entry-title">
                  <p class="text-xs font-semibold mb-1"> 
                  ${dataPoint.year}</p>
                </div>
                <div class="entry-bottom">
                  <p class="text-base">
                  ${dataPoint.count} transactions </p>
                </div>
                  <div class="entry-bottom">
                  <p class="text-base">
                  $${dataPoint.value.toLocaleString()}M total value</p>
                </div>
              </div>
            `
            ;

            tooltip
              .style("opacity", 1)
              .style("left", (event.pageX) + "px")
              .style("top", (event.pageY) + "px")
              .html(tooltipContent)
              .style("border-top", "0.625rem solid #3B665D");
          }
        })
        .on("mouseout", function() {
          hoverGroup.style("opacity", 0);
          tooltip.style("opacity", 0);
        });
    }
  
    $: if (svg && width && height) {
      createChart();
    }
  
    onMount(() => {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          chartWidth = width;
          chartHeight = height;
        }
      });
  
      const container = svg.parentElement;
      resizeObserver.observe(container);
  
      return () => {
        resizeObserver.disconnect();
        // Clean up tooltip
        d3.select("body").selectAll(".chart-tooltip").remove();
      };
    });
</script>
  
<div class="chart-container">
  <h3>PRV Sales Over Time</h3>
  <div class="legend">
    <div class="legend-item">
      <span class="legend-color" style="background-color: #C9623F"></span>
      <span>Number of Transactions</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background-color: #3B665D"></span>
      <span>Total Value</span>
    </div>
  </div>
  <div class="chart">
    <svg bind:this={svg}></svg>
  </div>
</div>
  
<style>
  .chart-container {
    width: 100%;
    height: 550px;
    margin: 2rem 0;
  }

  h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }

  .legend {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .chart {
    width: 100%;
    height: calc(100% - 4rem);
  }

  :global(.grid line) {
    stroke: #e5e7eb;
  }

  :global(.grid path) {
    stroke-width: 0;
  }

  :global(.chart-tooltip .tooltip-content) {
    margin-top: 2px;
  }

  :global(.chart-tooltip .entry-title) {
    margin-bottom: 1rem;
  }

  :global(.chart-tooltip) {
    margin-bottom: 0.425rem;
  }
</style>
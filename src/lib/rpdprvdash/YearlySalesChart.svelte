<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  
  export let constellationData: any[];
  const dispatch = createEventDispatcher();

  let svg: SVGSVGElement;
  let chartWidth: number;
  let chartHeight: number;
  const margin = { top: 40, right: 85, bottom: 40, left: 60 };
  let width: number;
  let height: number;
  const TRANSITION_DURATION = 300;
  const FOCUSED_SCALE = 2.5; // How much wider the focused bar becomes
  const UNFOCUSED_SCALE = 0.5; // How much narrower the unfocused bars become

  // Same tooltip state as before...
  let tooltipVisible = false;
  let tooltipBorderColor: string = '';
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipContent = {
    drugName: '',
    therapeuticArea: '',
    indication: '',
    price: '',
    seller: '',
    buyer: '',
    purchaseDate: ''
  };

  $: {
    width = chartWidth - margin.left - margin.right;
    height = chartHeight - margin.top - margin.bottom;
  }

  function getColorForTherapeuticArea(ta: string): string {
    const colorMap: Record<string, string> = {
      "Gastroenterology": "#4CAE3B",
      "Neurology": "#4D4DFF",
      "Ophthalmology": "#E79028",
      "Immunology": "#EA38A5",
      "Metabolic": "#133B11",
      "Dermatology": "#559368",
      "Hematology": "#CF3630",
      "Orthopedics": "#441780",
      "Respiratory": "#CBC09F",
      "Nephrology": "#ACA3DB",
      "Oncology": "#FF84DE",
      "Hepatology": "#FF00D4",
    };
    return colorMap[ta] || "#000000";
  }

  function processTransactionData(salesData: any[]) {
    // Create array of all years from 2012 to 2025
    const allYears = Array.from({length: 14}, (_, i) => 2012 + i);
    
    // First, sort the data by year and price
    const sortedData = [...salesData].sort((a, b) => {
      if (a.purchaseYear !== b.purchaseYear) {
        return a.purchaseYear - b.purchaseYear;
      }
      if (a.price === null && b.price !== null) return -1;
      if (a.price !== null && b.price === null) return 1;
      return (b.price || 0) - (a.price || 0);
    });

    // Group data by purchase year
    const yearGroups = d3.group(sortedData, d => d.purchaseYear);
    
    // Process each year, including years with no transactions
    return allYears.map(year => {
      const transactions = yearGroups.get(year) || [];
      let cumHeight = 0;
      
      const processedTransactions = transactions.map(t => {
        const transaction = {
          ...t,
          y0: cumHeight,
          y1: t.price === null ? cumHeight + 85 : cumHeight + t.price,
          originalData: constellationData.find(d => 
            d["Drug Name"] === t.drugName && 
            d["Purchase Year"] === year.toString()
          )
        };
        cumHeight = transaction.y1;
        return transaction;
      });

      return {
        year,
        transactions: processedTransactions,
        totalValue: cumHeight || 0,
        totalSales: transactions.length,
        averageValue: transactions.length > 0 ? 
          (transactions.reduce((acc, t) => acc + (t.price || 0), 0) / transactions.length) : 0
      };
    });
  }

  function handleClick(transactionData: any) {
    if (transactionData.originalData) {
      // Make sure we're using the right property for color
      const colorKey = transactionData.originalData.name || 
                      transactionData.originalData["Therapeutic Area"] || 
                      transactionData.therapeuticArea || 
                      'Unknown';
      
      dispatch('clusterElementClick', {
        entry: transactionData.originalData,
        color: getColorForTherapeuticArea(colorKey)
      });
    }
  }

  function createChart() {
    if (!width || !height) return;

    const salesData = constellationData
      .filter(d => d.Purchased === "Y")
      .map(d => {
        let price = null;
        if (d["Sale Price"]) {
          const parsedPrice = parseFloat(d["Sale Price"]);
          if (!isNaN(parsedPrice)) {
            price = parsedPrice;
          }
        }

        // Parse the therapeutic area from the data correctly
        // Check for the field value in multiple possible locations
        const therapeuticArea = d.name || d["Therapeutic Area"] || d.therapeuticArea || 'Unknown';

        return {
          purchaseYear: +d["Purchase Year"],
          price: price,
          drugName: d["Drug Name"] || '',
          buyer: d.Purchaser || '',
          seller: d.Sponsor || '',
          therapeuticArea: therapeuticArea,
          indication: d.id || d.Indication || '',
          purchaseDate: d["Purchase Month"] && d["Purchase Date"] && d["Purchase Year"] ? 
            `${d["Purchase Month"]} ${d["Purchase Date"]}, ${d["Purchase Year"]}` : 'N/A'
        };
      });

    const stackedData = processTransactionData(salesData);

    d3.select(svg).selectAll("*").remove();

    const xScale = d3.scaleBand()
      .domain(stackedData.map(d => d.year.toString()))
      .range([0, width])
      .padding(0.1);

    const maxValue = d3.max(stackedData, d => d.totalValue) || 0; // Provide default in case of undefined
    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height, 0])
      .nice();

    const svgElement = d3.select(svg)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svgElement.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create separate groups for layers with specific drawing order
    const gridGroup = g.append("g").attr("class", "grid-layer");
    const barsGroup = g.append("g").attr("class", "bars-layer");
    const bracketsGroup = g.append("g").attr("class", "brackets-layer");
    const axesGroup = g.append("g").attr("class", "axes-layer");

    // Add grid lines to grid layer
    gridGroup.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(() => "")
      )
      .style("stroke-dasharray", "2,3")
      .style("stroke-opacity", 0.2);

    // Create the stacked bars in bars layer
    const yearGroups = barsGroup.selectAll(".year-group")
      .data(stackedData)
      .join("g")
      .attr("class", "year-group")
      .attr("transform", d => `translate(${xScale(d.year.toString())},0)`);

    yearGroups.selectAll("rect")
      .data(d => d.transactions)
      .join("rect")
      .attr("class", "transaction-rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.y1))
      .attr("width", xScale.bandwidth())
      .attr("height", d => yScale(d.y0) - yScale(d.y1))
      .attr("fill", d => {
        if (d.price === null) {
          return "#f5f5f5";
        }
        return getColorForTherapeuticArea(d.therapeuticArea);
      })
      .attr("stroke", d => {
        if (d.price === null) {
          return getColorForTherapeuticArea(d.therapeuticArea);
        }
        return "#fff";
      })
      .attr("stroke-width", d => d.price === null ? 2 : 1)
      .attr("stroke-dasharray", d => d.price === null ? "4,4" : "none")
      .attr("opacity", d => d.price === null ? 0.9 : 0.8)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => handleMouseOver(event, d))
      .on("mouseout", handleMouseOut)
      .on("click", (event, d) => {
        event.stopPropagation();
        handleClick(d);
      });

    // Add axes in axes layer
    axesGroup.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .style("font-size", "9px");

    axesGroup.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `${d}M`))
      .call(g => {
        g.selectAll(".tick text")
          .style("font-size", "8px")
          .style("font-weight", "medium");
        g.selectAll(".tick line")
          .style("stroke", "#666")
          .style("stroke-width", "0.25");
        g.select(".domain")
          .style("stroke", "#666")
          .style("stroke-width", "0.5");
      });

    // Add y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 10)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("fill", "#3B665D")
      .style("font-size", "9px")
      .attr("font-weight", "medium")
      .text("Transaction Value (USD Millions)");

    function handleMouseOver(event: any, d: any) {
      // Show tooltip
      tooltipContent = {
        drugName: d.drugName || 'Unknown',
        therapeuticArea: d.therapeuticArea || 'Unknown',
        indication: d.indication || '',
        price: d.price === null ? 'Undisclosed' : `$${d.price.toLocaleString()}M`,
        seller: d.seller || 'Unknown',
        buyer: d.buyer || 'Unknown',
        purchaseDate: d.purchaseDate || 'N/A'
      };
      tooltipX = event.pageX;
      tooltipY = event.pageY;
      tooltipBorderColor = getColorForTherapeuticArea(d.therapeuticArea || 'Unknown');
      tooltipVisible = true;

      // Get the current year group
      const currentYear = d.purchaseYear;
      const yearData = stackedData.find(y => y.year === currentYear);

      // Desaturate other years
      yearGroups.selectAll(".transaction-rect")
        .style("filter", function(d: any) {
          return d.purchaseYear === currentYear ? null : "saturate(0.3)";
        });

      // Remove any existing brackets
      bracketsGroup.selectAll("*").remove();

      if (yearData) {
        // Add bracket for the current year
        const yearX = xScale(currentYear.toString());
        if (yearX !== undefined) {
          const bracketWidth = 15;
          const textOffset = 25;

          // Create bracket
          bracketsGroup
            .append("path")
            .attr("d", `
              M${yearX + xScale.bandwidth()} ${yScale(yearData.totalValue)}
              h${bracketWidth}
              v${height - yScale(yearData.totalValue)}
              h-${bracketWidth}
            `)
            .attr("fill", "none")
            .attr("stroke", "#666")
            .attr("stroke-width", 1.5);

          // Add background rectangle for text
          const textY = yScale(yearData.totalValue / 2);
          bracketsGroup
            .append("rect")
            .attr("x", yearX + xScale.bandwidth() + textOffset - 4)
            .attr("y", textY - 15)
            .attr("width", 85)
            .attr("height", 52)
            .attr("fill", "white")
            .attr("stroke", "#e5e7eb")
            .attr("stroke-width", 1)
            .attr("rx", 4)
            .style("z-index", 999);

          // Add text
          bracketsGroup
            .append("text")
            .attr("x", yearX + xScale.bandwidth() + textOffset)
            .attr("y", textY)
            .attr("dy", "0.32em")
            .style("z-index", 1000)
            .attr("text-anchor", "start")
            .attr("font-size", "9px")
            .attr("font-weight", "medium")
            .attr("fill", "#666")
            .text(`${yearData.totalSales} sales`)
            .append("tspan")
            .attr("x", yearX + xScale.bandwidth() + textOffset)
            .attr("dy", "1.2em")
            .text(`$${yearData.totalValue.toFixed(1)}M total`)
            .append("tspan")
            .attr("x", yearX + xScale.bandwidth() + textOffset)
            .attr("dy", "1.2em")
            .text(`$${yearData.averageValue.toFixed(1)}M avg`);
        }
      }

      // Highlight the hovered rectangle
      d3.select(event.target)
        .attr("opacity", d.price === null ? 0.9 : 0.8)
        .attr("stroke-width", 2)
        .attr("stroke", "#ff1515")
        .attr("stroke-dasharray", d.price === null ? "1,2.5" : "none");
    }

    function handleMouseOut() {
      tooltipVisible = false;
      
      // Restore saturation to all bars
      yearGroups.selectAll(".transaction-rect")
        .style("filter", null);

      // Remove brackets
      bracketsGroup.selectAll("*").remove();

      // Restore original rectangle styles
      d3.selectAll(".transaction-rect")
        .attr("opacity", (d: any) => d.price === null ? 0.9 : 0.8)
        .attr("stroke-width", (d: any) => d.price === null ? 2 : 1)
        .attr("stroke", (d: any) => d.price === null ? 
          getColorForTherapeuticArea(d.therapeuticArea || 'Unknown') : "#fff")
        .attr("stroke-dasharray", (d: any) => d.price === null ? "2,2" : "none");
    }

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      g.selectAll(".tick text")
          .style("font-size", "8px")
          .style("font-weight", "medium");
      g.selectAll(".tick line")
          .style("stroke", "#666")
          .style("stroke-width", "0.5");

    g.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `${d}M`))
      .call(g => {
        g.selectAll(".tick text")
          .style("font-size", "8px")
          .style("font-weight", "medium");
        g.selectAll(".tick line")
          .style("stroke", "#666")
          .style("stroke-width", "0.5");
        g.select(".domain")
          .style("stroke", "#666")

      });

    // Add labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 10)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("fill", "#3B665D")
      .style("font-size", "9.25px")
      .attr("z-index", 100)
      .attr("font-weight", "medium")
      .attr("background-color", "#3B665D")
      .text("Transaction Value (USD Millions)");
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

    if (svg && svg.parentElement) {
      const container = svg.parentElement;
      resizeObserver.observe(container);
    }

    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="chart-container">
  <div class="chart">
    <svg bind:this={svg}></svg>
  </div>
</div>

{#if tooltipVisible}
  <div
    class="tooltip p-2 pt-1"
    style="left: {tooltipX - 100}px; top: {tooltipY - 490}px; border-top: 0.625rem solid {tooltipBorderColor};"
  >
    <div>
        <p class="text-lg font-medium">
          {tooltipContent.drugName}
        </p>
        <p class="text-xs uppercase mb-4 font-mono font-semibold text-gray-600">
          {tooltipContent.therapeuticArea}
        </p>
    </div>
    <p class="text-base font-medium">
      {tooltipContent.price}
    </p>
    <p class="text-xs font-semibold font-mono text-gray-400">Transaction Value</p>
    <div class="entry-bottom mt-4">
      <p class="text-xs font-semibold font-mono mt-2 text-gray-800">
        {tooltipContent.seller} → {tooltipContent.buyer}
      </p>
      <p class="text-xs font-semibold font-mono text-gray-400">
        {tooltipContent.purchaseDate}
      </p>
      <p class="text-xs font-semibold font-mono mt-6 text-green-600">
        Click to view more details →
      </p>
    </div>
  </div>
{/if}

<style>
  .chart-container {
    width: 97.25%;
    overflow: scroll;
    height: 650px;
    margin: 2rem 0;
  }

  .chart {
    width: 100%;
    height: calc(100% - 4rem);
    overflow: auto;
  }

  :global(.grid line) {
    stroke: #e5e7eb;
    stroke-width: .25px;
  }

  :global(.grid path) {
    stroke-width: 0;
  }

  .tooltip {
    position: fixed;
    background-color: rgba(255, 255, 255, 0.962);    
    border: .5px solid #373737;
    pointer-events: none;
    z-index: 1000;
    min-width: 300px;
    max-width: 300px;
  }
</style>
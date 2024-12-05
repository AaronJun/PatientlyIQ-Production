<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import { ArrowRight } from 'carbon-icons-svelte';

  export let constellationData: any[];
  const dispatch = createEventDispatcher();

  let svg;
  let chartWidth: number;
  let chartHeight: number;
  const margin = { top: 40, right: 180, bottom: 40, left: 60 };
  let width: number;
  let height: number;

  // Add tooltip state
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
    const colorMap = {
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

  function processTransactionData(salesData) {
    // Group data by year for stacking
    const groupedData = d3.group(salesData, d => d.year);
    
    // Calculate cumulative heights for each year
    return Array.from(groupedData, ([year, transactions]) => {
      let cumHeight = 0;
      return {
        year,
        transactions: transactions.map(t => {
          const transaction = {
            ...t,
            y0: cumHeight,
            y1: cumHeight + t.price,
            // Store original constellation data reference
            originalData: constellationData.find(d => 
              d["Drug Name"] === t.drugName && 
              d.Year === t.year.toString() &&
              d.Sponsor === t.seller &&
              (d.Purchaser === t.buyer || (t.buyer === "Undisclosed" && d.Purchaser === "Undisclosed"))
            )
          };
          cumHeight += t.price;
          return transaction;
        }),
        totalValue: cumHeight
      };
    });
  }

  function handleClick(transactionData) {
    console.log("Click data:", transactionData);
    
    if (transactionData.originalData) {
      dispatch('clusterElementClick', {
        entry: transactionData.originalData,
        color: getColorForTherapeuticArea(transactionData.originalData.name)
      });
    } else {
      console.warn("No original data found for transaction:", transactionData);
    }
  }

  function createChart() {
    if (!width || !height) return;

    // Process the data
    const salesData = constellationData
      .filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"])
      .map(d => ({
        year: +d.Year,
        price: parseFloat(d["Sale  Price (USD, Millions)"]),
        drugName: d["Drug Name"],
        buyer: d.Purchaser,
        seller: d.Sponsor,
        therapeuticArea: d.name,
        indication: d.id,
        purchaseDate: d["Purchase Month"] && d["Purchase Date"] && d["Purchase Year"] ? 
          `${d["Purchase Month"]} ${d["Purchase Date"]}, ${d["Purchase Year"]}` : 'N/A'
      }))
      .sort((a, b) => a.year - b.year);

    // Process into stacked data with original references
    const stackedData = processTransactionData(salesData);

    // Clear previous chart
    d3.select(svg).selectAll("*").remove();

    // Create scales
    const xScale = d3.scaleBand()
      .domain(stackedData.map(d => d.year.toString()))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d.totalValue)])
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
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "2,3")
      .style("stroke-opacity", 0.2);

    // Create the stacked bars
    const yearGroups = g.selectAll(".year-group")
      .data(stackedData)
      .join("g")
      .attr("class", "year-group")
      .attr("transform", d => `translate(${xScale(d.year.toString())},0)`);

    yearGroups.selectAll("rect")
      .data(d => d.transactions)
      .join("rect")
      .attr("x", 0)
      .attr("y", d => yScale(d.y1))
      .attr("width", xScale.bandwidth())
      .attr("height", d => yScale(d.y0) - yScale(d.y1))
      .attr("fill", d => getColorForTherapeuticArea(d.therapeuticArea))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        tooltipContent = {
          drugName: d.drugName,
          therapeuticArea: d.therapeuticArea,
          indication: d.indication,
          price: d.price.toLocaleString(),
          seller: d.seller,
          buyer: d.buyer,
          purchaseDate: d.purchaseDate
        };
        tooltipX = event.pageX;
        tooltipY = event.pageY;
        tooltipBorderColor = getColorForTherapeuticArea(d.therapeuticArea);
        tooltipVisible = true;

        d3.select(event.target)
          .attr("opacity", 1)
          .attr("stroke-width", 2)
          .attr("stroke", "#ff1515");
      })
      .on("mouseout", (event) => {
        tooltipVisible = false;
        d3.select(event.target)
          .attr("opacity", 0.8)
          .attr("stroke-width", 1)
          .attr("stroke", "#fff");
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        handleClick(d);
      });

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .style("font-size", "10px");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("font-size", "12px");

    // Add labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 10)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("fill", "#3B665D")
      .style("font-size", "10px")
      .attr("font-weight", "bold")
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

    const container = svg.parentElement;
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="chart-container">
  <h3>PRV Sales Over Time</h3>
  <div class="chart">
    <svg bind:this={svg}></svg>
  </div>
</div>
{#if tooltipVisible}
  <div
    class="tooltip p-2 pt-1"
    style="left: {tooltipX - 290}px; top: {tooltipY - 220}px; border-top: 0.625rem solid {tooltipBorderColor};"
  >
    <div>

        <p class="text-lg font-medium">
          {tooltipContent.drugName}
        <p class="text-xs uppercase mb-4 font-mono font-semibold text-gray-600">
            {tooltipContent.therapeuticArea}</p>
      </div>
        <p class="text-base font-medium">
          ${tooltipContent.price}M
        </p>
        <p class="text-xs font-semibold font-mono text-gray-400">Transaction Value</p>
      <div class="entry-bottom mt-4">
        <p class="text-xs font-semibold font-mono mt-2 text-gray-800">
          {tooltipContent.seller} → {tooltipContent.buyer}
        </p>
        <p class="text-xs font-semibold font-mono text-gray-400">
          {tooltipContent.purchaseDate}
        </p>

        <p class="text-xs font-semibold font-mono mt-6 text-orange-600">
          Click to view more details  →
        </p>

    </div>
  </div>
{/if}

<style>
  .chart-container {
    width: 100%;
    height: 550px;
    margin: 2rem 0;
  }

  TA {
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
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

  .tooltip {
    position: fixed;
    background-color: rgba(255, 255, 255, 0.962);    
    border: .5px solid #373737;
    pointer-events: none;
    z-index: 1000;
    min-width: 300px;
    max-width: 300px;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: .625rem;
  }


  .entry-title {
    margin-bottom: 1rem;
  }

  .entry-bottom {
    margin-bottom: 0.425rem;
  }
</style>
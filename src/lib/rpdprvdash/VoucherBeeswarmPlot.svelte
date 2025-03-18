<!-- VoucherBeeswarmPlot.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import { Medication, Money, CalendarHeatMap } from 'carbon-icons-svelte';
  import { getTherapeuticAreaColor, getTherapeuticAreaFill, getTherapeuticAreaStroke } from './utils/colorDefinitions';
  
  export let data: any[];
  export let onPointClick: (detail: any) => void;
  export let highlightedTransaction: { seller: string, buyer: string } | null = null;
  export let selectedYear: string | null = null;
  
  const dispatch = createEventDispatcher<{
    transactionHover: { seller: string, buyer: string };
    transactionLeave: void;
  }>();
  
  let svg;
  let container;
  let circles;
  let tooltipVisible = false;
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipContent = {
    buyer: '',
    seller: '',
    price: '',
    candidate: '',
    date: '',
    therapeuticArea: '',
    isUndisclosed: false
  };
  
  const margin = { top: 10, right: 10, bottom: 20, left: 10 };
  let width: number;
  let height: number;

  function getPrice(d: any): number {
    const price = d["Sale Price (USD Millions)"];
    return price === "Undisclosed" ? 0 : parseFloat(price);
  }

  function isUndisclosed(d: any): boolean {
    return d["Sale Price (USD Millions)"] === "Undisclosed";
  }

  function handlePointClick(event: MouseEvent, d: any) {
    event.stopPropagation();
    tooltipVisible = false;
    
    setTimeout(() => {
      onPointClick({
        drugName: d.Candidate,
        year: d["RPDD Year"],
        Company: d.Company,
        therapeuticArea: d.TherapeuticArea1,
        entries: data.filter(entry => entry.TherapeuticArea1 === d.TherapeuticArea1),
        color: getTherapeuticAreaStroke(d.TherapeuticArea1),
        currentStage: d["Current Development Stage"] || "TBD",
        indication: d.Indication || "",
        rpddAwardDate: d["RPDD Year"],
        voucherAwardDate: d["PRV Issue Year"] || "",
        treatmentClass: d.Class1 || "TBD",
        mechanismOfAction: d.MOA || "TBD",
        companyUrl: d["Link to CrunchBase"] || ""
      });
    }, 0);
  }

  // Watch for changes in the highlighted transaction or selected year
  $: if (circles) {
    if (highlightedTransaction) {
      highlightTransaction(highlightedTransaction);
    } else if (selectedYear) {
      if (selectedYear === "All") {
        resetHighlight();
      } else {
        highlightYear(selectedYear);
      }
    } else {
      resetHighlight();
    }
  }

  function highlightTransaction(transaction: { seller: string, buyer: string }) {
    circles
      .style("opacity", d => 
        (d.Company === transaction.seller && d.Purchaser === transaction.buyer) ? 1 : 0.2
      )
      .attr("r", d => 
        (d.Company === transaction.seller && d.Purchaser === transaction.buyer) ? 7 : 5
      )
      .style("filter", d => 
        (d.Company === transaction.seller && d.Purchaser === transaction.buyer) ? "drop-shadow(0 0 3px rgba(0,0,0,0.3))" : "none"
      );
  }

  function highlightYear(year: string) {
    if (year === "All") {
      resetHighlight();
      return;
    }
    
    circles
      .style("opacity", d => 
        d["Purchase Year"] === year ? 1 : 0.2
      )
      .attr("r", d => 
        d["Purchase Year"] === year ? 7 : 5
      )
      .style("filter", d => 
        d["Purchase Year"] === year ? "drop-shadow(0 0 3px rgba(0,0,0,0.3))" : "none"
      );
  }

  function resetHighlight() {
    if (!circles) return;
    circles
      .style("opacity", 1)
      .attr("r", 5)
      .style("filter", "none");
  }
  
  function updateDimensions() {
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    width = containerRect.width - margin.left - margin.right;
    height = containerRect.height - margin.top - margin.bottom;
    
    if (svg) {
      svg.attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom);
      
      createVisualization();
    }
  }
  
  function createGradientId(d: any): string {
    // Create a unique ID for each point's gradient based on its data
    return `beeswarm-gradient-${d.Company}-${d.Candidate}`.replace(/\s+/g, '-').toLowerCase();
  }
  
  function createVisualization() {
    // Filter and sort the data
    const purchasedVouchers = data
      .filter(d => d.Purchased === "Y")
      .sort((a, b) => d3.ascending(getPrice(a), getPrice(b)));
    
    const prices = purchasedVouchers.map(d => getPrice(d));
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    // Create defs for gradients
    const defs = svg.append("defs");
    
    // Create a gradient for each point
    purchasedVouchers.forEach(d => {
      const gradientId = createGradientId(d);
      const gradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
      
      // First half - fill color
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", getTherapeuticAreaFill(d.TherapeuticArea1));
      
      gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", getTherapeuticAreaFill(d.TherapeuticArea1));
      
      // Second half - stroke color
      gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", getTherapeuticAreaStroke(d.TherapeuticArea1));
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", getTherapeuticAreaStroke(d.TherapeuticArea1));
    });
    
    // Create drop shadow filter
    const filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");
    
    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
    
    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("result", "offsetBlur");
    
    const feComponentTransfer = filter.append("feComponentTransfer")
      .attr("in", "offsetBlur")
      .attr("result", "filteredBlur");
    
    feComponentTransfer.append("feFuncA")
      .attr("type", "linear")
      .attr("slope", 0.5);
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
      .attr("in", "filteredBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(prices)])
      .range([0, width])
      .nice();

    const y = d3.scaleLinear()
      .domain([-1, 1])
      .range([height, 0]);

    // Add x-axis with proper formatting
    const xAxis = d3.axisBottom(x)
      .tickFormat(d => `$${d}M`)
      .ticks(5);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    // Create simulation
    const simulation = d3.forceSimulation(purchasedVouchers)
      .force("x", d3.forceX(d => x(getPrice(d))).strength(1))
      .force("y", d3.forceY(height/2).strength(0.2))
      .force("collide", d3.forceCollide(6))
      .alphaDecay(0.1)
      .alpha(0.5)
      .stop();

    // Run simulation
    for (let i = 0; i < 300; ++i) simulation.tick();

    // Create circles with special styling for undisclosed prices
    circles = g.selectAll("circle")
      .data(purchasedVouchers)
      .join("circle")
      .attr("cx", d => Math.max(0, Math.min(width, d.x)))
      .attr("cy", d => Math.max(0, Math.min(height, d.y)))
      .attr("r", 5)
      .attr("fill", d => `url(#${createGradientId(d)})`)
      .attr("data-year", d => d["Purchase Year"])
      .style("opacity", 0.8)
      .attr("cursor", "pointer")
      .style("stroke", "#565656")
      .style("stroke-width", 1)
      .style("stroke-dasharray", d => isUndisclosed(d) ? "2,2" : "none")
      .style("transition", "opacity 0.3s ease, r 0.3s ease");

    // Add event listeners with debouncing
    let hoverTimeout: number;
    circles
      .on("mouseenter", (event, d) => {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
          dispatch('transactionHover', {
            seller: d.Company,
            buyer: d.Purchaser
          });

          tooltipContent = {
            candidate: d.Candidate || 'N/A',
            seller: d.Company || 'N/A',
            buyer: d.Purchaser || 'N/A',
            price: isUndisclosed(d) ? 'Undisclosed' : `$${d["Sale Price (USD Millions)"]}M`,
            date: `${d["Purchase Month"]} ${d["Purchase Date"]}, ${d["Purchase Year"]}`,
            therapeuticArea: d.TherapeuticArea1,
            isUndisclosed: isUndisclosed(d)
          };

          const rect = container.getBoundingClientRect();
          tooltipX = event.clientX - rect.left;
          tooltipY = event.clientY - rect.top;
          tooltipVisible = true;
        }, 50);
      })
      .on("mouseleave", () => {
        clearTimeout(hoverTimeout);
        dispatch('transactionLeave');
        tooltipVisible = false;
      })
      .on("click", handlePointClick);
      
    // If we have an active filter (selected year or transaction), apply it
    if (highlightedTransaction) {
      highlightTransaction(highlightedTransaction);
    } else if (selectedYear) {
      highlightYear(selectedYear);
    }
  }

  onMount(() => {
    svg = d3.select("#beeswarm-plot")
      .append("svg")
      .attr("class", "overflow-visible");
      
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateDimensions);
    });
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div 
  class="beeswarm-wrapper h-full"
  bind:this={container}
>
  <div id="beeswarm-plot" class="h-full relative"></div>

  {#if tooltipVisible}
    <div
      class="absolute z-10 bg-white p-4 rounded shadow-lg text-sm border border-slate-200 min-w-fit"
      style="left: {tooltipX}px; top: {tooltipY}px; transform: translate(-50%, -100%)"
    >
      <div class="font-semibold text-base text-slate-800 mb-4">{tooltipContent.seller} → {tooltipContent.buyer}</div>
      
      <div class="flex gap-4 text-slate-600 items-baseline">
        <Medication size="14" class="text-slate-600" />
        <p class="font-semibold text-sm">
          {tooltipContent.candidate}
        </p>
      </div>

      <div class="flex gap-4 items-baseline">
        <Money size="14" class="text-gray-800" />
        <p class="text-sm {tooltipContent.isUndisclosed ? 'italic' : ''}">
          {tooltipContent.price}        
        </p>
      </div>
    
      <div class="flex gap-4 items-baseline">
        <CalendarHeatMap size="14" class="text-gray-800" />
        <p class="text-sm">
          {tooltipContent.date}
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  #beeswarm-plot {
    width: 100%;
    min-height: 100%;
  }

  :global(.x-axis path) {
    stroke: #e2e8f0;
  }

  :global(.x-axis line) {
    stroke: #e2e8f0;
  }

  :global(.x-axis text) {
    fill: #4a5568;
    font-size: 10px;
  }
</style>
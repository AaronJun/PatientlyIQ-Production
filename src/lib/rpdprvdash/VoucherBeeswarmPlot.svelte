<!-- VoucherBeeswarmPlot.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import { Medication } from 'carbon-icons-svelte';

  export let data: any[];
  export let onPointClick: (data: any) => void = () => {};
  export let highlightedTransaction: { seller: string, buyer: string } | null = null;
  
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
    drugName: '',
    date: '',
    therapeuticArea: ''
  };
  
  const margin = { top: 10, right: 0, bottom: 40, left: 10 };
  let width: number;
  let height: number;

  const therapeuticAreaColorScale = d3.scaleOrdinal()
    .domain([
        'Neurology', 'Oncology', 'Metabolic', 'Ophthalmology',
        'Cardiovascular', 'Pulmonology', 'Hematology',
        'Endocrinology', 'Genetic', 'Immunology',
        'Gastroenterology', 'Hepatology', 'Dermatology',
        'Neonatology', 'Urology'
    ])
    .range([
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
        '#FFEEAD', '#D4A5A5', '#9DE0AD',
        '#FF9F1C', '#2EC4B6', '#E71D36',
        '#FDFFB6', '#CBE896', '#FFA07A',
        '#98D8C8', '#B8B8D1'
    ]);

  $: if (highlightedTransaction && circles) {
    highlightPoints(highlightedTransaction);
  } else if (circles) {
    resetHighlight();
  }

  function highlightPoints(transaction: { seller: string, buyer: string }) {
    circles
      .style("opacity", d => 
        (d.Company === transaction.seller && d.Purchaser === transaction.buyer) ? 1 : 0.2
      )
      .attr("r", d => 
        (d.Company === transaction.seller && d.Purchaser === transaction.buyer) ? 8 : 5
      )
      .attr("stroke-width", d => 
        (d.Company === transaction.seller && d.Purchaser === transaction.buyer) ? 2 : 1
      );
  }

  function resetHighlight() {
    if (!circles) return;
    circles
      .style("opacity", 1)
      .attr("r", 5)
      .attr("stroke-width", 1);
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
  
  function createVisualization() {
    const purchasedVouchers = data.filter(d => 
      d.Purchased === "Y" && d["Sale Price (USD Millions)"]
    );
    
    const prices = purchasedVouchers.map(d => parseFloat(d["Sale Price (USD Millions)"]));
    
    // Clear previous content
    svg.selectAll("*").remove();
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const y = d3.scaleLinear()
      .domain([0, d3.max(prices)])
      .range([height, 0])
      .nice();

    // Create simulation
    const simulation = d3.forceSimulation(purchasedVouchers)
      .force("y", d3.forceY(d => y(parseFloat(d["Sale Price (USD Millions)"]))).strength(1))
      .force("x", d3.forceX(width/2))
      .force("collide", d3.forceCollide(6))
      .stop();

    // Run simulation
    for (let i = 0; i < 120; ++i) simulation.tick();

    // Add y-axis
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y)
        .tickFormat(d => `$${d}M`)
        .ticks(5));

    // Add points
    circles = g.selectAll("circle")
      .data(purchasedVouchers)
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 6)
      .attr("fill", d => therapeuticAreaColorScale(d.TherapeuticArea1))
      .attr("stroke", "#565656")
      .attr("stroke-width", 1)
      .attr("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        dispatch('transactionHover', {
          seller: d.Company,
          buyer: d.Purchaser
        });

        tooltipContent = {
          drugName: d.Candidate || 'N/A',
          seller: d.Company || 'N/A',
          buyer: d.Purchaser || 'N/A',
          price: `$${d["Sale Price (USD Millions)"]}M`,
          date: `${d["Purchase Month"]} ${d["Purchase Date"]}, ${d["Purchase Year"]}`,
          therapeuticArea: d.TherapeuticArea1
        };

        const rect = container.getBoundingClientRect();
        tooltipX = event.pageX - rect.left;
        tooltipY = event.pageY - rect.top;
        tooltipVisible = true;
      })
      .on("mouseleave", () => {
        dispatch('transactionLeave');
        tooltipVisible = false;
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        onPointClick(d);
      });
  }
  
  onMount(() => {
    svg = d3.select("#beeswarm-plot").append("svg");
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
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
  <div id="beeswarm-plot" class="h-full"></div>

  {#if tooltipVisible}
    <div
      class="tooltip"
      style="left: {tooltipX}px; top: {tooltipY}px;"
    >
      <div class="tooltip-content">
        <div class="font-semibold text-slate-800 border-b pb-2 mb-2">
          {tooltipContent.seller} → {tooltipContent.buyer}
        </div>
        <div class="flex gap-2 items-baseline align-middle mb-2">
          <Medication size={16}/>
          <span class="text-sm">{tooltipContent.drugName}</span>
        </div>
        <div class="text-slate-600">Transaction Value: {tooltipContent.price}</div>
        <div class="text-slate-600">Date: {tooltipContent.date}</div>
        <div class="text-slate-600">Area: {tooltipContent.therapeuticArea}</div>
      </div>
    </div>
  {/if}
</div>

<style>

  #beeswarm-plot {
    width: 100%;
    height: 100%;
  }

  .tooltip {
    position: absolute;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    padding: 0.75rem;
    pointer-events: none;
    z-index: 1000;
    min-width: 200px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translate(-50%, -100%);
  }

  :global(.y-axis path) {
    stroke: #e2e8f0;
  }

  :global(.y-axis line) {
    stroke: #e2e8f0;
  }

  :global(.y-axis text) {
    fill: #4a5568;
    font-size: 8.25px;
    transform: rotate(-90deg);
  }
</style>
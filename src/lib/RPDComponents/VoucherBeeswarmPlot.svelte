<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  
  export let data: any[];
  export let onPointClick: (data: any) => void;
  
  const dispatch = createEventDispatcher();
  
  let svg;
  let g;
  let simulation;
  let tooltipVisible = false;
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipContent = {
    buyer: '',
    seller: '',
    price: '',
    drugName: ''
  };
  let tooltipBorderColor = '';
  
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  let width: number;
  let height: number;
  
  function updateDimensions() {
    const container = d3.select("#beeswarm-container").node();
    if (!container) return;
    
    width = container.getBoundingClientRect().width - margin.left - margin.right - 100;
    height = 420 - margin.top - margin.bottom;
    
    if (svg) {
      svg.attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom);
      
            const purchasedVouchers = data.filter(d => d.Purchased === "Y" && d["Sale Price"]);
      const prices = purchasedVouchers.map(d => parseFloat(d["Sale Price"]));
      
      const x = d3.scaleLinear()
        .domain([0, d3.max(prices)])
        .range([0, width]);

      g.select(".axis")
        .call(d3.axisBottom(x))
        .call(g => {
          const ticks = g.selectAll(".tick");
          ticks.each(function(d, i) {
            if (i === 0 || i === ticks.size() - 1) {
              d3.select(this).select("line").remove();
            }
          });
          g.select(".domain").attr("stroke", "#161616").attr("stroke-width", "0.5px");
        });

      if (simulation) {
        simulation
          .force("x", d3.forceX(d => x(parseFloat(d["Sale Price"]))).strength(1))
          .force("y", d3.forceY(height));
        
        simulation.alpha(1).restart();
      }
    }
  }
  
  onMount(() => {
        const purchasedVouchers = data.filter(d => d.Purchased === "Y" && d["Sale Price"]);
    const prices = purchasedVouchers.map(d => parseFloat(d["Sale Price"]));
    
    svg = d3.select("#beeswarm-plot")
      .append("svg");
    
    g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    updateDimensions();
    
    const x = d3.scaleLinear()
      .domain([0, d3.max(prices)])
      .range([0, width]);

    simulation = d3.forceSimulation(purchasedVouchers)
      .force("x", d3.forceX(d => x(parseFloat(d["Sale Price"]))).strength(1))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(10.25))
      .stop();
  
    for (let i = 0; i < 120; ++i) simulation.tick();
  
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height-12})`)
      .call(d3.axisBottom(x))
      .call(g => {
        const ticks = g.selectAll(".tick");
        ticks.each(function(d, i) {
          if (i === 0 || i === ticks.size() - 1) {
            d3.select(this).select("line").remove();
          }
        });
        g.select(".domain").attr("stroke", "#161616").attr("stroke-width", "0.5px");
      });
  
    const minPrice = d3.min(prices);
    const maxPrice = d3.max(prices);
  
    g.selectAll("circle")
      .data(purchasedVouchers)
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 9.25)
      .attr("fill", d => {
        const price = parseFloat(d["Sale Price (USD"]);
        if (isNaN(price)) return "#EAE1CD";
        if (d.Purchaser.toLowerCase() === 'undisclosed' || d.Sponsor.toLowerCase() === 'undisclosed') {
          return "#BFD3CF";
        }
        if (price === minPrice) return "#E59F64";
        if (price === maxPrice) return "#00EDC6";
        return "#00A887";
      })
      .attr("stroke", d => {
        if (d.Purchaser.toLowerCase() === 'undisclosed' || d.Sponsor.toLowerCase() === 'undisclosed') {
          return "#a8a8a8";
        }
        return "#a8a8a8";
      })
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", d => {
        const price = parseFloat(d["Sale  Price (USD, Millions)"]);
        return isNaN(price) ? "2,2" : "none";
      })
      .attr("cursor", "pointer")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "#ff1515")
          .attr("stroke-width", 2.25)
          .attr("stroke-dasharray", "none");

        const price = parseFloat(d["Sale  Price (USD, Millions)"]);
        tooltipContent = {
          drugName: d["Drug Name"] || 'N/A',
          seller: d.Sponsor || 'N/A',
          buyer: d.Purchaser || 'N/A',
          price: price ? `$${price.toFixed(1)}M` : 'Undisclosed'
        };
        tooltipBorderColor = price === maxPrice ? "#0D312B" : 
                            price === minPrice ? "#00EDC6" : 
                            "#00A887";
                    tooltipX = event.pageX - 320; 
                    tooltipY = event.pageY - 225;
        tooltipVisible = true;
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "#a8a8a8")
          .attr("stroke-width", 0.5)
          .attr("stroke-dasharray", d => {
            const price = parseFloat(d["Sale  Price (USD, Millions)"]);
            return isNaN(price) ? "2,2" : "none";
          });
        tooltipVisible = false;
      })
      .on("click", (event, d) => {
        if (onPointClick) {
          event.stopPropagation();
          onPointClick(d);
        }
      });
  
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(d3.select("#beeswarm-container").node());
    
    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="beeswarm-wrapper">
  <div id="beeswarm-container">
    <div id="beeswarm-plot"></div>
  </div>
</div>

{#if tooltipVisible}
  <div
    class="tooltip"
    style="left: {tooltipX}px; top: {tooltipY}px; --border-color: {tooltipBorderColor};"
  >
    <div class="tooltip-content">
      <div class="entry-title">
        <p class="text-base font-semibold mb-1">
          {tooltipContent.drugName}
        </p>    
      </div>
      <div class="entry-bottom">
        <p class="text-sm font-semibold text-gray-500 mb-4">
          {tooltipContent.seller} → {tooltipContent.buyer}
        </p>
      </div>
      <div class="entry-bottom">
        <p class="text-xs font-semibold font-mono text-gray-500 mt-2 "> Reported Price</p>
        <p class="text-sm/2 font-bold">
          {tooltipContent.price}
        </p>
        <p class="text-xs font-semibold font-mono mt-6 text-green-600">
          Click to view more details  →
        </p>      </div>
    </div>
  </div>
{/if}

<style>
  .beeswarm-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  #beeswarm-container {
    width: 100%;
    position: relative;
  }

  #beeswarm-plot {
    width: 100%;
  }

  .tooltip {
    position: fixed;
    margin: 2rem 0 0 2rem;
    background-color: rgba(255, 255, 255, 0.962);    
    border: .5px solid #373737;
    padding: 1rem .5rem .5rem .5rem;
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
    background-color: var(--border-color);
  }

  .tooltip-content {
    margin-top: 4px;
  }

  .entry-bottom {
    margin-bottom: 0.425rem;
  }
</style>
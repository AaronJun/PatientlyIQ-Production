<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { PortOutput, PortInput, Money, Medication } from 'carbon-icons-svelte';

  export let data: any[];
  export let onDrugClick: (drug: any) => void = undefined;

  let svg, g, simulation;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  let width, height;
  
  let selectedPoint = {
    buyer: 'Hover over a point to see details',
    seller: 'Hover over a point to see details',
    price: 'Hover over a point to see details',
    drugName: 'Hover over a point to see details'
  };

  function updateDimensions() {
    const container = d3.select("#beeswarm-container").node();
    if (!container) return;
    
    width = container.getBoundingClientRect().width - margin.left - margin.right;
    height = 225 - margin.top - margin.bottom;
    
    if (svg) {
      svg.attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom);
      
      const purchasedVouchers = data.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]);
      const prices = purchasedVouchers.map(d => parseFloat(d["Sale  Price (USD, Millions)"]));
      
      const x = d3.scaleLinear()
        .domain([0, d3.max(prices)])
        .range([0, width]);
  
      g.select(".axis")
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
  
      if (simulation) {
        simulation
          .force("x", d3.forceX(d => x(parseFloat(d["Sale  Price (USD, Millions)"]))).strength(1))
          .force("y", d3.forceY(height));
        
        simulation.alpha(1).restart();
      }
    }
  }
  
  onMount(() => {
    const purchasedVouchers = data.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]);
    const prices = purchasedVouchers.map(d => parseFloat(d["Sale  Price (USD, Millions)"]));
    
    svg = d3.select("#beeswarm-plot")
      .append("svg");
    
    g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    updateDimensions();
    
    const x = d3.scaleLinear()
      .domain([0, d3.max(prices)])
      .range([0, width]);
  
    simulation = d3.forceSimulation(purchasedVouchers)
      .force("x", d3.forceX(d => x(parseFloat(d["Sale  Price (USD, Millions)"]))).strength(1))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(5))
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
      .attr("r", 6.25)
      .attr("fill", d => {
        const price = parseFloat(d["Sale  Price (USD, Millions)"]);
        if (isNaN(price)) return "none";
        if (d.Purchaser.toLowerCase() === 'undisclosed' || d.Sponsor.toLowerCase() === 'undisclosed') {
          return "#e5e5e5";
        }
        if (price === minPrice) return "#E59F64";
        if (price === maxPrice) return "#3B665D";
        return "#BFD3CF";
      })
      .attr("stroke", d => {
        if (d.Purchaser.toLowerCase() === 'undisclosed' || d.Sponsor.toLowerCase() === 'undisclosed') {
          return "#a8a8a8";
        }
        return "#161616";
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
        
        selectedPoint = {
          buyer: d.Purchaser || 'N/A',
          seller: d.Sponsor || 'N/A',
          price: d["Sale  Price (USD, Millions)"] ? 
            `$${d["Sale  Price (USD, Millions)"]} million` : 'N/A',
          drugName: d["Drug Name"] || 'N/A'
        };
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "#161616")
          .attr("stroke-width", 0.5)
          .attr("stroke-dasharray", d => {
            const price = parseFloat(d["Sale  Price (USD, Millions)"]);
            return isNaN(price) ? "2,2" : "none";
          });
      })
      .on("click", (event, d) => {
        if (onDrugClick) {
          event.stopPropagation();
          onDrugClick(d);
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
  <div class="transaction-details-grid">
    <div class="detail-item">
      <span class="detail-label"><PortOutput class="mb-1" />Seller</span>
      <span class="text-gray-800 font-semibold">{selectedPoint.seller}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label"><PortInput class="mb-1" />Buyer</span>
      <span class="text-gray-800 font-semibold">{selectedPoint.buyer}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label"><Money class="mb-1" />Price</span>
      <span class="text-gray-800 font-semibold">{selectedPoint.price}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label"><Medication class="mb-1" />Associated Drug</span>
      <span class="text-gray-800 font-semibold">{selectedPoint.drugName}</span>
    </div>
  </div>
  <div id="beeswarm-container">
    <div id="beeswarm-plot"></div>
  </div>
</div>

<style>
.beeswarm-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.transaction-details-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  border-bottom: .25px solid #161616;
}

.detail-item {
  display: flex;
  align-items: left;
  color: #ff1515;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.725rem;
  display: flex; 
  align-items: center;
  flex-direction: row;
  gap: 0.7245rem;
  text-transform: uppercase;
  color: #de3333;
}

#beeswarm-container {
  width: 100%;
  position: relative;
}

#beeswarm-plot {
  width: 100%;
}
</style>
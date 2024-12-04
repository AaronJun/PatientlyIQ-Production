<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import VoucherBeeswarmPlot from './VoucherBeeswarmPlot.svelte';
  import YearlySalesChart from './YearlySalesChart.svelte';
  import SellerBuyerChord from './SellerBuyerChord.svelte';
  import { Money, PortInput, PortOutput, Medication } from 'carbon-icons-svelte';
  import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
  
  export let constellationData: any[];
  export let onDrugClick: (data: any) => void = undefined;
  export let onCompanySelect: (data: any, color: string) => void;

  // Tooltip state
  let tooltipVisible = false;
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipContent = {
    sponsor: '',
    drugName: '',
    therapeuticArea: '',
    id: ''
  };
  let tooltipBorderColor = '';

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

  let currentTab = "overview";
  let averageSale = { price: 0, buyer: '', seller: '', drugName: '' };
  let medianSale = { price: 0, buyer: '', seller: '', drugName: '' };
  let minSale = { price: Infinity, buyer: '', seller: '', drugName: '' };
  let maxSale = { price: 0, buyer: '', seller: '', drugName: '' };
  let topBuyers = [];
  let topSellers = [];
  let allBuyers = [];
  let allSellers = [];
  let expandedBuyers = false;
  let expandedSellers = false;
  let searchTermBuyers = "";
  let searchTermSellers = "";
  let svg;
  let g;
  let simulation;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  let width: number;
  let height: number;
  
  let selectedPoint = {
    buyer: '',
    seller: '',
    price: '',
    drugName: ''
  };
  
  function calculateBenchmarks() {
    const sales = constellationData.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]);
    const prices = sales
      .map(s => parseFloat(s["Sale  Price (USD, Millions)"]))
      .filter(price => !isNaN(price));
  
    const sum = prices.reduce((a, b) => a + b, 0);
    averageSale.price = sum / prices.length;
    const avgIndex = sales.findIndex(s => 
      parseFloat(s["Sale  Price (USD, Millions)"]) === averageSale.price
    );
    if (avgIndex !== -1) {
      averageSale.buyer = sales[avgIndex].Purchaser;
      averageSale.seller = sales[avgIndex].Sponsor;
      averageSale.drugName = sales[avgIndex]["Drug Name"];
    }
  
    prices.sort((a, b) => a - b);
    const midIndex = Math.floor(prices.length / 2);
    medianSale.price = prices.length % 2 !== 0 
      ? prices[midIndex] 
      : (prices[midIndex - 1] + prices[midIndex]) / 2;
    const medIndex = sales.findIndex(s => 
      parseFloat(s["Sale  Price (USD, Millions)"]) === medianSale.price
    );
    if (medIndex !== -1) {
      medianSale.buyer = sales[medIndex].Purchaser;
      medianSale.seller = sales[medIndex].Sponsor;
      medianSale.drugName = sales[medIndex]["Drug Name"];
    }
  
    minSale = sales.reduce((min, s) => {
      const price = parseFloat(s["Sale  Price (USD, Millions)"]);
      return !isNaN(price) && price < min.price 
        ? { price, buyer: s.Purchaser, seller: s.Sponsor, drugName: s["Drug Name"] } 
        : min;
    }, minSale);
  
    maxSale = sales.reduce((max, s) => {
      const price = parseFloat(s["Sale  Price (USD, Millions)"]);
      return !isNaN(price) && price > max.price 
        ? { price, buyer: s.Purchaser, seller: s.Sponsor, drugName: s["Drug Name"] } 
        : max;
    }, maxSale);
  
    // Calculate top buyers and sellers
    const buyerMap = new Map();
    const sellerMap = new Map();
  
    sales.forEach(s => {
      const price = parseFloat(s["Sale  Price (USD, Millions)"]);
      if (isNaN(price)) return;
  
      if (s.Purchaser.toLowerCase() !== 'undisclosed') {
        if (buyerMap.has(s.Purchaser)) {
          const buyer = buyerMap.get(s.Purchaser);
          buyer.count++;
          buyer.totalPrice += price;
        } else {
          buyerMap.set(s.Purchaser, { count: 1, totalPrice: price });
        }
      }
  
      if (s.Sponsor.toLowerCase() !== 'undisclosed') {
        if (sellerMap.has(s.Sponsor)) {
          const seller = sellerMap.get(s.Sponsor);
          seller.count++;
          seller.totalPrice += price;
        } else {
          sellerMap.set(s.Sponsor, { count: 1, totalPrice: price });
        }
      }
    });
  
    allBuyers = Array.from(buyerMap, ([name, data]) => ({ 
      name, 
      count: data.count, 
      totalPrice: data.totalPrice,
      avgPrice: data.totalPrice / data.count 
    }))
      .sort((a, b) => b.count - a.count || b.totalPrice - a.totalPrice);
  
    allSellers = Array.from(sellerMap, ([name, data]) => ({ 
      name, 
      count: data.count, 
      totalPrice: data.totalPrice,
      avgPrice: data.totalPrice / data.count 
    }))
      .sort((a, b) => b.count - a.count || b.totalPrice - a.totalPrice);
  
    topBuyers = allBuyers.slice(0, 3);
    topSellers = allSellers.slice(0, 3);
  }
  
  function formatPrice(price: number): string {
    return `$${price.toFixed(2)} million`;
  }
  
  function filterData(data, searchTerm) {
    if (!searchTerm) return data;
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }
  
  function updateDimensions() {
    const container = d3.select("#beeswarm-container").node();
    if (!container) return;
    
    width = container.getBoundingClientRect().width - margin.left - margin.right;
    height = 225 - margin.top - margin.bottom;
    
    if (svg) {
      svg.attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom);
      
      const purchasedVouchers = constellationData.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]);
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
    calculateBenchmarks();
    
    const purchasedVouchers = constellationData.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]);
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
          onCompanySelect(d, getColorForTherapeuticArea(d.name));
        }
      });
  
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(d3.select("#beeswarm-container").node());
    
    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="sale-benchmarks">
<div class="sale-container flex flex-col">
  <div class="flex col-span-1">
  <YearlySalesChart {constellationData} />
  </div>

    <div class="visualization-container">
      <div class="beeswarm-wrapper">
        <div class="grid grid-col-4 transaction-details-grid">
          <div class="detail-item">
            <span class="text-gray-800 font-semibold">{selectedPoint.seller}</span>
            <span class="detail-label"><PortOutput class="mb-1" />Seller</span>
          </div>

          <div class="detail-item">
            <span class="text-gray-800 font-semibold">{selectedPoint.buyer}</span>
            <span class="detail-label"><PortInput class="mb-1" />Buyer</span>
          </div>
          
          <div class="detail-item">
            <span class="text-gray-800 font-semibold">{selectedPoint.price}</span>
            <span class="detail-label"><Money class="mb-1" />Price</span>
          </div>
          <div class="detail-item">
            <span class="text-gray-800 font-semibold">{selectedPoint.drugName}</span>
            <span class="detail-label"><Medication class="mb-1" />Associated  Drug</span>
          </div>
          </div>
          
        
      
          </div>
        <div id="beeswarm-container">
        <div id="beeswarm-plot"></div>
      </div>

 <div class="flex col-span-1">
</div>
</div>
<SellerBuyerChord 
{constellationData}
onCompanyClick={(companyData) => {
onCompanySelect(companyData, getColorForTherapeuticArea(companyData.name));
}}
onChordClick={(transactionData) => {
onCompanySelect(transactionData, getColorForTherapeuticArea(transactionData.name));
}}
/>
</div>


<div class="tabs-container">
<div class="tab-buttons">
<button 
class="tab-button {currentTab === 'overview' ? 'active' : ''}"
on:click={() => currentTab = 'overview'}
>
Overview
</button>
<button 
class="tab-button {currentTab === 'buyers' ? 'active' : ''}"
on:click={() => currentTab = 'buyers'}
>
Most Active Buyers
</button>
<button 
class="tab-button {currentTab === 'sellers' ? 'active' : ''}"
on:click={() => currentTab = 'sellers'}
>
Most Active Sellers
</button>
</div>

<div class="tab-content">
{#if currentTab === 'overview'}
<table>
<thead>
  <tr>
    <th>Metric</th>
    <th>Price</th>
    <th>Buyer</th>
    <th>Seller</th>
    <th>Associated Drug</th>
</tr>
</thead>
<tbody>
<tr>
  <td class="label">Average Sale Price</td>
  <td>{formatPrice(averageSale.price)}</td>
  <td>{averageSale.buyer}</td>
  <td>{averageSale.seller}</td>
  <td>{averageSale.drugName}</td>
</tr>
<tr>
  <td class="label">Median Sale Price</td>
  <td>{formatPrice(medianSale.price)}</td>
  <td></td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td class="label">Lowest Sale Price</td>
  <td>{formatPrice(minSale.price)}</td>
  <td>{minSale.buyer}</td>
  <td>{minSale.seller}</td>
  <td>{minSale.drugName}</td>
</tr>
<tr>
  <td class="label">Highest Sale Price</td>
  <td>{formatPrice(maxSale.price)}</td>
  <td>{maxSale.buyer}</td>
  <td>{maxSale.seller}</td>
  <td>{maxSale.drugName}</td>
</tr>
</tbody>
</table>
{:else if currentTab === 'buyers'}
<div class="buyers-section">
<div class="section-header">
<button 
  class="expand-button" 
  on:click={() => expandedBuyers = !expandedBuyers}
>
  {expandedBuyers ? "Show Top 3" : "Show All"}
</button>
</div>

<Toolbar size="sm">
<ToolbarContent>
  <ToolbarSearch bind:value={searchTermBuyers} />
</ToolbarContent>
</Toolbar>

<DataTable
headers={[
  { key: 'name', value: 'Buyer' },
  { key: 'count', value: 'Number of Vouchers Purchased' },
  { key: 'totalPrice', value: 'Total Purchase Amount' },
  { key: 'avgPrice', value: 'Average Price of Purchase' }
]}
rows={filterData((expandedBuyers ? allBuyers : topBuyers).map(buyer => ({
  id: buyer.name,
  name: buyer.name,
  count: buyer.count,
  totalPrice: formatPrice(buyer.totalPrice),
  avgPrice: formatPrice(buyer.avgPrice)
})), searchTermBuyers)}
sortable
zebra
/>
</div>
{:else}
<div class="sellers-section">
<div class="section-header">
<button 
  class="expand-button" 
  on:click={() => expandedSellers = !expandedSellers}
>
  {expandedSellers ? "Show Top 3" : "Show All"}
</button>
</div>

<Toolbar size="sm">
<ToolbarContent>
  <ToolbarSearch bind:value={searchTermSellers} />
</ToolbarContent>
</Toolbar>

<DataTable
headers={[
  { key: 'name', value: 'Seller' },
  { key: 'count', value: 'Number of Vouchers Sold' },
  { key: 'totalPrice', value: 'Total Sale Amount' },
  { key: 'avgPrice', value: 'Average Price of Sale' }
]}
rows={filterData((expandedSellers ? allSellers : topSellers).map(seller => ({
  id: seller.name,
  name: seller.name,
  count: seller.count,
  totalPrice: formatPrice(seller.totalPrice),
  avgPrice: formatPrice(seller.avgPrice)
})), searchTermSellers)}
sortable
zebra
/>
</div>
{/if}
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
{tooltipContent.sponsor}
</p>    
</div>
<div class="entry-bottom">
<p class="text-sm mb-2">
{tooltipContent.id}
</p>
</div>
<div class="entry-bottom">
<p class="text-xs font-semibold text-gray-500">
{tooltipContent.drugName}
</p>
</div>
<div class="entry-bottom">
<p class="text-sm font-bold text-gray-500">
{tooltipContent.therapeuticArea}
</p>
</div>
</div>
</div>
{/if}
</div>

<style>
.sale-benchmarks {
  display: grid;
  grid-template-columns: repeat(3);
  padding: 0 4.25rem 0 0;

}

.sales-container {
  display: flex;
  flex-direction: column;
  width: 90vw;
  gap: 1.5rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.visualization-container {
  width: 100%;
  margin: 2.25rem 0;
}

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

.text-gray-800 {
 min-height: 1rem;
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

.tabs-container {
  border: .5px solid #b4b4b4;
  padding: 2.25rem;
  overflow: hidden;
}

.tab-buttons {
  display: flex;
  color: #797979;
  gap: 1.725rem;
}

.tab-button {
  padding: 0.525rem .925rem;
  font-size: 0.725rem;
  padding-top: 2.25rem;
  text-transform: uppercase;
  letter-spacing: .325px;
  color: #797979;
  border-bottom: 1.25px solid #acacac;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #C9623F;
  border-bottom: 1.25px solid #C9623F;
}

.tab-button.active {
  color: #C9623F;
  border-bottom: 2px solid #C9623F;
  font-weight: 800;
}

.tab-content {
  padding: 2.425rem 0 0 0;
}

.sale-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 85vw;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding-top: 1rem;
  padding-bottom: 1rem;
  text-transform: capitalize;
  padding-right: .25rem;
  font-size: .75rem;
  line-height: 1rem;
  text-align: left;
}

th {
  position: sticky;
  font-size: .65rem;
  font-family: "IBM Plex Mono", monospace;
  top: 0;
  spacing: 1rem;
  font-weight: 600;
}

tr {
  border-bottom: .5px #292F58;
  border-style: dotted;
}

tr:hover {
  background-color: #f1f1f1;
  font-weight: 800;
  color: #ff1515;
  border: 1px dotted #737dc0;
}

.expand-button {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
  border: 1px solid #292F58;
  border-radius: 4px;
  background: transparent;
  color: #292F58;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-button:hover {
  background: #292F58;
  color: white;
}

.label {
  display: flex;
  gap: 0.525rem;
  font-size: .65rem;
  color: #292F58;
  font-family: "IBM Plex Mono", monospace;
  font-weight: 400;
}

:global(.bx--data-table-container) {
  width: 100%;
}

:global(.bx--toolbar-content) {
  margin-bottom: 1rem;
}
</style>
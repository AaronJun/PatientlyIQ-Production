<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

  export let constellationData: any[];

  let averageSale = { price: 0, buyer: '', seller: '' };
  let medianSale = { price: 0, buyer: '', seller: '' };
  let minSale = { price: Infinity, buyer: '', seller: '' };
  let maxSale = { price: 0, buyer: '', seller: '' };
  let topBuyers = [];
  let topSellers = [];
  let allBuyers = [];
  let allSellers = [];
  let expandedBuyers = false;
  let expandedSellers = false;
  let undisclosedBuyers = { count: 0, totalPrice: 0 };
  let undisclosedSellers = { count: 0, totalPrice: 0 };
  let searchTermBuyers = "";
  let searchTermSellers = "";

  let selectedPoint = {
    buyer: 'Hover over a point to see details',
    seller: 'Hover over a point to see details',
    price: 'Hover over a point to see details'
  };

  onMount(() => {
    calculateBenchmarks();
  });

  function calculateBenchmarks() {
    const sales = constellationData.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]);
    const prices = sales
      .map(s => parseFloat(s["Sale  Price (USD, Millions)"]))
      .filter(price => !isNaN(price));
  
    // Calculate average
    const sum = prices.reduce((a, b) => a + b, 0);
    averageSale.price = sum / prices.length;
    const avgIndex = prices.findIndex(p => p === averageSale.price);
    averageSale.buyer = sales[avgIndex]?.Purchaser || '';
    averageSale.seller = sales[avgIndex]?.Sponsor || '';
  
    // Calculate median
    prices.sort((a, b) => a - b);
    const midIndex = Math.floor(prices.length / 2);
    medianSale.price = prices.length % 2 !== 0 ? prices[midIndex] : (prices[midIndex - 1] + prices[midIndex]) / 2;
    const medIndex = sales.findIndex(s => parseFloat(s["Sale  Price (USD, Millions)"]) === medianSale.price);
    medianSale.buyer = sales[medIndex]?.Purchaser || '';
    medianSale.seller = sales[medIndex]?.Sponsor || '';
  
    // Find min and max
    minSale = sales.reduce((min, s) => {
      const price = parseFloat(s["Sale  Price (USD, Millions)"]);
      return !isNaN(price) && price < min.price ? { price, buyer: s.Purchaser, seller: s.Sponsor } : min;
    }, minSale);
  
    maxSale = sales.reduce((max, s) => {
      const price = parseFloat(s["Sale  Price (USD, Millions)"]);
      return !isNaN(price) && price > max.price ? { price, buyer: s.Purchaser, seller: s.Sponsor } : max;
    }, maxSale);
  
    // Calculate all buyers and sellers
    const buyerMap = new Map();
    const sellerMap = new Map();

    sales.forEach(s => {
      const price = parseFloat(s["Sale  Price (USD, Millions)"]);
      if (isNaN(price)) return;

      // Only map non-undisclosed buyers
      if (s.Purchaser.toLowerCase() !== 'undisclosed') {
        if (buyerMap.has(s.Purchaser)) {
          const buyer = buyerMap.get(s.Purchaser);
          buyer.count++;
          buyer.totalPrice += price;
        } else {
          buyerMap.set(s.Purchaser, { count: 1, totalPrice: price });
        }
      }

      // Only map non-undisclosed sellers
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

    // Process all buyers and sellers
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

    // Set top 3
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

  function toggleBuyersTable() {
    expandedBuyers = !expandedBuyers;
  }

  function toggleSellersTable() {
    expandedSellers = !expandedSellers;
  }

  let svg, g, simulation;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  let width, height;

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
      
      // Update scale
      const x = d3.scaleLinear()
        .domain([0, d3.max(prices)])
        .range([0, width]);
      
g.select(".axis")
  .attr("transform", `translate(0,${height-12})`)
  .call(d3.axisBottom(x))
  .call(g => {
    // Remove first and last tick lines only
    const ticks = g.selectAll(".tick");
    ticks.each(function(d, i) {
      if (i === 0 || i === ticks.size() - 1) {
        d3.select(this).select("line").remove();
      }
    });
    g.select(".domain").attr("stroke", "#161616").attr("stroke-width", "0.5px");
  });

      // Update simulation and circle positions
      if (simulation) {
        simulation.force("x", d3.forceX(d => x(parseFloat(d["Sale  Price (USD, Millions)"]))).strength(1))
                 .force("y", d3.forceY(height / 2));
        
        simulation.alpha(1).restart();
        
        g.selectAll("circle")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      }
    }
  }

  onMount(() => {
    const purchasedVouchers = constellationData.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]);
    const prices = purchasedVouchers.map(d => parseFloat(d["Sale  Price (USD, Millions)"]));
    
    svg = d3.select("#beeswarm-plot")
      .append("svg");
    
    g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Initial render
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
    // Remove first and last tick lines only
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
        if (isNaN(price)) {
          return "none";
        }
        if (price === minPrice) return "#FFCC33";
        if (price === maxPrice) return "#00B8A6";
        return "#ACA3DB";
      })
      .attr("stroke", "#161616")
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", d => {
        const price = parseFloat(d["Sale  Price (USD, Millions)"]);
        return isNaN(price) ? "2,2" : "none";
      })
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "orange")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "none")
          .attr("cursor", "pointer");
        
        selectedPoint = {
          buyer: d.Purchaser,
          seller: d.Sponsor,
          price: `$${d["Sale  Price (USD, Millions)"]} million`
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
      });

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(d3.select("#beeswarm-container").node());
    
    return () => {
      resizeObserver.disconnect();
    };
  });
</script>
<div class="sale-benchmarks">
  <h3>Transfer Activity 2012-2024</h3>

  <div class="visualization-container">
    <h4>Voucher Sale Prices Distribution</h4>
    <div class="beeswarm-wrapper">
      <div class="transaction-details-grid">
        <div class="detail-item">
          <span class="detail-label">Buyer</span>
          <span class="detail-value">{selectedPoint.buyer}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Seller</span>
          <span class="detail-value">{selectedPoint.seller}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Price</span>
          <span class="detail-value">{selectedPoint.price}</span>
        </div>
      </div>
      <div id="beeswarm-container">
        <div id="beeswarm-plot"></div>
      </div>
    </div>
  </div>

  <div class="table-container">
    <h4>Overview</h4>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Price</th>
          <th>Buyer</th>
          <th>Seller</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="label">Average Sale Price</td>
          <td>{formatPrice(averageSale.price)}</td>
          <td>{averageSale.buyer}</td>
          <td>{averageSale.seller}</td>
        </tr>
        <tr>
          <td class="label">Median Sale Price</td>
          <td>{formatPrice(medianSale.price)}</td>
        </tr>
        <tr>
          <td class="label">Lowest Sale Price</td>
          <td>{formatPrice(minSale.price)}</td>
          <td>{minSale.buyer}</td>
          <td>{minSale.seller}</td>
        </tr>
        <tr>
          <td class="label">Highest Sale Price</td>
          <td>{formatPrice(maxSale.price)}</td>
          <td>{maxSale.buyer}</td>
          <td>{maxSale.seller}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="table-container">
    <h4>Index</h4>
    
    <div class="index-section">
      <div class="section-header">
        <h5>Most Active Buyers</h5>
        <button 
          class="expand-button" 
          on:click={toggleBuyersTable}
          aria-label={expandedBuyers ? "Show top 3 buyers" : "Show all buyers"}
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
        size="medium"
        stickyHeader
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

    <div class="index-section">
      <div class="section-header">
        <h5>Most Active Sellers</h5>
        <button 
          class="expand-button" 
          on:click={toggleSellersTable}
          aria-label={expandedSellers ? "Show top 3 sellers" : "Show all sellers"}
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
        size="medium"
        stickyHeader      
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
  </div>
</div>

<style>
  .sale-benchmarks {
    padding: 0;
    width: 100%;
  }

  h2 {
    font-size: 1.525rem;
    font-weight: 800;
    color: #292F58;
    margin-top: 0;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  h3 {
    font-weight: 800;
    font-family: "IBM Plex Mono", monospace;
    font-size: .725rem;
    color: #7c7c7c;
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  h4 {
    font-weight: 800;
    font-size: .75rem;
    text-transform: capitalize;
    color: #292F58;
    margin-bottom: 12px;
  }

  h5 {
    font-size: .6725rem;
    font-weight: 800;
    color: #292F58;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  .visualization-container {
    margin: 2.25rem 0;
    width: 100%;
  }

  .beeswarm-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .transaction-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    border-radius: 4px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-label {
    font-size: 0.625rem;
    font-weight: 800;
    text-transform: uppercase;
    color: #ff1515;
  }

  .detail-value {
    font-size: 1rem;
    color: #161616;
    font-weight: 500;
  }

  #beeswarm-container {
    width: 100%;
    position: relative;
  }

  #beeswarm-plot {
    width: 100%;
  }

  .table-container {
    min-height: 250px;
    overflow-y: auto;
    width: 100%;
    margin: 2.25rem 0;
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
    background-color: #b7e0fe;
    cursor: pointer;
    border: 1px dotted #737dc0;
  }

  svg {
    max-width: 100%;
    height: auto;
  }

  .index-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.expand-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(41, 47, 88, 0.2);
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
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
  let undisclosedBuyers = { count: 0, totalPrice: 0 };
  let undisclosedSellers = { count: 0, totalPrice: 0 };
  let searchTermBuyers = "";
  let searchTermSellers = "";

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
  
      // Calculate top buyers and sellers
      const buyerMap = new Map();
      const sellerMap = new Map();
  
      sales.forEach(s => {
        const price = parseFloat(s["Sale  Price (USD, Millions)"]);
        if (isNaN(price)) return;
  
        if (s.Purchaser.toLowerCase() === 'undisclosed') {
          undisclosedBuyers.count++;
          undisclosedBuyers.totalPrice += price;
        } else if (buyerMap.has(s.Purchaser)) {
          const buyer = buyerMap.get(s.Purchaser);
          buyer.count++;
          buyer.totalPrice += price;
        } else {
          buyerMap.set(s.Purchaser, { count: 1, totalPrice: price });
        }
  
        if (s.Sponsor.toLowerCase() === 'undisclosed') {
          undisclosedSellers.count++;
          undisclosedSellers.totalPrice += price;
        } else if (sellerMap.has(s.Sponsor)) {
          const seller = sellerMap.get(s.Sponsor);
          seller.count++;
          seller.totalPrice += price;
        } else {
          sellerMap.set(s.Sponsor, { count: 1, totalPrice: price });
        }
      });
  
      topBuyers = Array.from(buyerMap, ([name, data]) => ({ 
        name, 
        count: data.count, 
        totalPrice: data.totalPrice,
        avgPrice: data.totalPrice / data.count 
      }))
        .sort((a, b) => b.count - a.count || b.totalPrice - a.totalPrice)
        .slice(0, 3);
  
      topSellers = Array.from(sellerMap, ([name, data]) => ({ 
        name, 
        count: data.count, 
        totalPrice: data.totalPrice,
        avgPrice: data.totalPrice / data.count 
      }))
        .sort((a, b) => b.count - a.count || b.totalPrice - a.totalPrice)
        .slice(0, 3);
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
  
    // BeeswarmPlot component
  
    let svg;
  const margin = { top: 20, right: 20, bottom: 30, left: 12 };
  const width = 750 - margin.left - margin.right;
  const height = 150 - margin.top - margin.bottom;

  onMount(() => {
    const purchasedVouchers = constellationData.filter(d => d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]);
    const prices = purchasedVouchers.map(d => parseFloat(d["Sale  Price (USD, Millions)"]));
    
    const x = d3.scaleLinear()
      .domain([0, d3.max(prices)])
      .range([0, width]);

    const simulation = d3.forceSimulation(purchasedVouchers)
      .force("x", d3.forceX(d => x(parseFloat(d["Sale  Price (USD, Millions)"]))).strength(1))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(5))
      .stop();

    for (let i = 0; i < 120; ++i) simulation.tick();

    const svg = d3.select("#beeswarm-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    const minPrice = d3.min(prices);
    const maxPrice = d3.max(prices);

    // Create a tooltip div
    const tooltip = d3.select("#beeswarm-plot")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

   
  g.selectAll("circle")
    .data(purchasedVouchers)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 7.5)
    .attr("stroke", "#161616")
    .attr("stroke-width", 1)
    .attr("fill", d => {
      const price = parseFloat(d["Sale  Price (USD, Millions)"]);
      if (price === minPrice) return "#FFCC33";
      if (price === maxPrice) return "#00B8A6";
      return "#ACA3DB";
    })
      .attr("stroke", "#161616")
      .attr("stroke-width", .5)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke", "orange")
          .attr("stroke-width", 2)
          .attr("cursor", "pointer");
        
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`Buyer: ${d.Purchaser}<br/>Seller: ${d.Sponsor}<br/>Price: $${d["Sale  Price (USD, Millions)"]} million`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
        .attr("stroke", "#161616")
        .attr("stroke-width", .5)
          ;
        
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  });
</script>

<div class="sale-benchmarks">
  <h3>Transfer Activity 2012-2024</h3>

  <div class="visualization-container">
    <h4>Voucher Sale Prices Distribution</h4>
    <div id="beeswarm-plot"></div>
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
          <td>Average Sale Price</td>
          <td>{formatPrice(averageSale.price)}</td>
          <td>{averageSale.buyer}</td>
          <td>{averageSale.seller}</td>
        </tr>
        <tr>
          <td>Median Sale Price</td>
          <td>{formatPrice(medianSale.price)}</td>
          <td>{medianSale.buyer}</td>
          <td>{medianSale.seller}</td>
        </tr>
        <tr>
          <td>Minimum Sale Price</td>
          <td>{formatPrice(minSale.price)}</td>
          <td>{minSale.buyer}</td>
          <td>{minSale.seller}</td>
        </tr>
        <tr>
          <td>Maximum Sale Price</td>
          <td>{formatPrice(maxSale.price)}</td>
          <td>{maxSale.buyer}</td>
          <td>{maxSale.seller}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="table-container">
    <h4>Index</h4>
    <h5>Most Active Buyers</h5>
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
      rows={filterData([...topBuyers, {
        name: 'Undisclosed',
        count: undisclosedBuyers.count,
        totalPrice: undisclosedBuyers.totalPrice,
        avgPrice: undisclosedBuyers.totalPrice / undisclosedBuyers.count
      }].map(buyer => ({
        id: buyer.name,
        name: buyer.name,
        count: buyer.count,
        totalPrice: formatPrice(buyer.totalPrice),
        avgPrice: formatPrice(buyer.avgPrice)
      })), searchTermBuyers)}
      sortable
      zebra
    />

    <h5>Most Active Sellers</h5>
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
      rows={filterData([...topSellers, {
        name: 'Undisclosed',
        count: undisclosedSellers.count,
        totalPrice: undisclosedSellers.totalPrice,
        avgPrice: undisclosedSellers.totalPrice / undisclosedSellers.count
      }].map(seller => ({
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

<style>
  .sale-benchmarks {
    padding: 0;
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
    font-size: .75rem;
    font-weight: 800;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    color: #292F58;
  }

  .visualization-container {
    margin: 2.25rem 0;
    max-width: 95%;
  }

  .table-container {
    min-height: 250px;
    overflow-y: auto;
    max-width: 95%;
    margin: 2.25rem 0 2.25rem 0;
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

  #beeswarm-plot {
    position: relative;
  }

  .tooltip {
    position: absolute;
    top: 10px;
    text-align: left; 
    padding: 8px;
    font: 1rem;
    background: white;
    z-index: 999;
    border: 1px solid #ddd;
    border-radius: 8px;
    pointer-events: none;
  }

  :global(.bx--data-table-container) {
    width: 100%;
  }

  :global(.bx--toolbar-content) {
    margin-bottom: 1rem;
  }
</style>
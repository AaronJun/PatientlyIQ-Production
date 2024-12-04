<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import YearlySalesChart from './YearlySalesChart.svelte';
  import SellerBuyerChord from './SellerBuyerChord.svelte';
  import VoucherBeeswarmPlot from './VoucherBeeswarmPlot.svelte';
  import { Money, PortInput, PortOutput, Medication } from 'carbon-icons-svelte';
  import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";

  interface ConstellationData extends SimulationNodeDatum {
    Purchased: string;
    "Sale  Price (USD, Millions)": string;
    Purchaser: string;
    Sponsor: string;
    "Drug Name": string;
    Year: string;
    id: string;
    name: string;
    x?: number;
    y?: number;
  }

  interface SalePoint {
    price: number;
    buyer: string;
    seller: string;
    drugName: string;
  }

  interface CompanyStats {
    name: string;
    count: number;
    totalPrice: number;
    avgPrice: number;
  }

  export let constellationData: ConstellationData[];
  export let onDrugClick: ((data: ConstellationData) => void) | undefined = undefined;
  export let onCompanySelect: (data: ConstellationData, color: string) => void;

  // State management

  // State management
  let currentTab = "overview";
  let activeVisualization = 'network';
  
  let averageSale: SalePoint = { price: 0, buyer: '', seller: '', drugName: '' };
  let medianSale: SalePoint = { price: 0, buyer: '', seller: '', drugName: '' };
  let minSale: SalePoint = { price: Infinity, buyer: '', seller: '', drugName: '' };
  let maxSale: SalePoint = { price: 0, buyer: '', seller: '', drugName: '' };
  let topBuyers: CompanyStats[] = [];
  let topSellers: CompanyStats[] = [];
  let allBuyers: CompanyStats[] = [];
  let allSellers: CompanyStats[] = [];
  let expandedBuyers = false;
  let expandedSellers = false;
  let searchTermBuyers = "";
  let searchTermSellers = "";

  // D3 related variables
  let svg: Selection<SVGSVGElement, unknown, null, undefined>;
  let g: Selection<SVGGElement, unknown, null, undefined>;
  let simulation: d3.Simulation<ConstellationData, undefined>;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  let width = 0;
  let height = 0;

  let selectedPoint = {
    buyer: '',
    seller: '',
    price: '',
    drugName: ''
  };

  const therapeuticAreaColors: Record<string, string> = {
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

  function getColorForTherapeuticArea(ta: string): string {
    return therapeuticAreaColors[ta as keyof typeof therapeuticAreaColors] || "#000000";
  }

  function calculateBenchmarks(): void {
    const sales = constellationData.filter(d => 
      d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]
    );
    
    const prices = sales
      .map(s => parseFloat(s["Sale  Price (USD, Millions)"]))
      .filter((price): price is number => !isNaN(price));

    if (prices.length === 0) return;

    // Calculate average sale
    const sum = prices.reduce((a, b) => a + b, 0);
    averageSale.price = sum / prices.length;
    const avgSale = sales.find(s => 
      parseFloat(s["Sale  Price (USD, Millions)"]) === averageSale.price
    );
    if (avgSale) {
      averageSale.buyer = avgSale.Purchaser;
      averageSale.seller = avgSale.Sponsor;
      averageSale.drugName = avgSale["Drug Name"];
    }

    // Calculate median sale
    prices.sort((a, b) => a - b);
    const midIndex = Math.floor(prices.length / 2);
    medianSale.price = prices.length % 2 !== 0 
      ? prices[midIndex] 
      : (prices[midIndex - 1] + prices[midIndex]) / 2;
    const medSale = sales.find(s => 
      parseFloat(s["Sale  Price (USD, Millions)"]) === medianSale.price
    );
    if (medSale) {
      medianSale.buyer = medSale.Purchaser;
      medianSale.seller = medSale.Sponsor;
      medianSale.drugName = medSale["Drug Name"];
    }

    // Find min and max sales
    sales.forEach(s => {
      const price = parseFloat(s["Sale  Price (USD, Millions)"]);
      if (isNaN(price)) return;

      if (price < minSale.price) {
        minSale = {
          price,
          buyer: s.Purchaser,
          seller: s.Sponsor,
          drugName: s["Drug Name"]
        };
      }
      if (price > maxSale.price) {
        maxSale = {
          price,
          buyer: s.Purchaser,
          seller: s.Sponsor,
          drugName: s["Drug Name"]
        };
      }
    });

    // Calculate company statistics
    const buyerMap = new Map<string, { count: number; totalPrice: number }>();
    const sellerMap = new Map<string, { count: number; totalPrice: number }>();

    sales.forEach(s => {
      const price = parseFloat(s["Sale  Price (USD, Millions)"]);
      if (isNaN(price)) return;

      if (s.Purchaser.toLowerCase() !== 'undisclosed') {
        const buyer = buyerMap.get(s.Purchaser) || { count: 0, totalPrice: 0 };
        buyer.count++;
        buyer.totalPrice += price;
        buyerMap.set(s.Purchaser, buyer);
      }

      if (s.Sponsor.toLowerCase() !== 'undisclosed') {
        const seller = sellerMap.get(s.Sponsor) || { count: 0, totalPrice: 0 };
        seller.count++;
        seller.totalPrice += price;
        sellerMap.set(s.Sponsor, seller);
      }
    });

    // Process buyer and seller statistics
    allBuyers = Array.from(buyerMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      totalPrice: data.totalPrice,
      avgPrice: data.totalPrice / data.count
    })).sort((a, b) => b.count - a.count || b.totalPrice - a.totalPrice);

    allSellers = Array.from(sellerMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      totalPrice: data.totalPrice,
      avgPrice: data.totalPrice / data.count
    })).sort((a, b) => b.count - a.count || b.totalPrice - a.totalPrice);

    topBuyers = allBuyers.slice(0, 3);
    topSellers = allSellers.slice(0, 3);
  }

  function filterData(data: CompanyStats[], searchTerm: string): CompanyStats[] {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(term)
      )
    );
  }

  function formatPrice(price: number): string {
    return `$${price.toFixed(2)} million`;
  }

  function initializeVisualization(): void {
    const container = document.getElementById("beeswarm-container");
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    width = rect.width - margin.left - margin.right;
    height = 225 - margin.top - margin.bottom;

    svg = d3.select("#beeswarm-plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    updateVisualization();
  }

  function updateVisualization(): void {
    if (!svg || !g) return;

    const purchasedVouchers = constellationData.filter(d => 
      d.Purchased === "Y" && d["Sale  Price (USD, Millions)"]
    );

    const prices = purchasedVouchers
      .map(d => parseFloat(d["Sale  Price (USD, Millions)"]))
      .filter((price): price is number => !isNaN(price));

    const x = d3.scaleLinear()
      .domain([0, d3.max(prices) || 0])
      .range([0, width]);

    simulation = d3.forceSimulation(purchasedVouchers)
      .force("x", d3.forceX(d => {
        const price = parseFloat(d["Sale  Price (USD, Millions)"]);
        return x(isNaN(price) ? 0 : price);
      }).strength(1))
      .force("y", d3.forceY(height / 2))
      .force("collide", d3.forceCollide(5))
      .stop();

    for (let i = 0; i < 120; ++i) simulation.tick();

    g.selectAll("*").remove();

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height-12})`)
      .call(d3.axisBottom(x))
      .call(g => {
        g.selectAll(".tick").each(function(d: any, i: number) {
          if (i === 0 || i === g.selectAll(".tick").size() - 1) {
            d3.select(this).select("line").remove();
          }
        });
        g.select(".domain").attr("stroke", "#161616").attr("stroke-width", "0.5px");
      });

    const circles = g.selectAll("circle")
      .data(purchasedVouchers)
      .enter()
      .append("circle")
      .attr("cx", d => (d as any).x)
      .attr("cy", d => (d as any).y)
      .attr("r", 6.25)
      .attr("fill", d => {
        const price = parseFloat(d["Sale  Price (USD, Millions)"]);
        if (isNaN(price)) return "none";
        if (d.Purchaser.toLowerCase() === 'undisclosed' || 
            d.Sponsor.toLowerCase() === 'undisclosed') {
          return "#e5e5e5";
        }
        if (price === minSale.price) return "#E59F64";
        if (price === maxSale.price) return "#3B665D";
        return "#BFD3CF";
      })
      .attr("stroke", d => {
        if (d.Purchaser.toLowerCase() === 'undisclosed' || 
            d.Sponsor.toLowerCase() === 'undisclosed') {
          return "#a8a8a8";
        }
        return "#161616";
      })
      .attr("stroke-width", 0.5)
      .attr("cursor", "pointer");

    circles
      .on("mouseover", (event: MouseEvent, d: ConstellationData) => {
        d3.select(event.target as Element)
          .attr("stroke", "#ff1515")
          .attr("stroke-width", 2.25);

        selectedPoint = {
          buyer: d.Purchaser || 'N/A',
          seller: d.Sponsor || 'N/A',
          price: d["Sale  Price (USD, Millions)"] ? 
            `$${d["Sale  Price (USD, Millions)"]} million` : 'N/A',
          drugName: d["Drug Name"] || 'N/A'
        };
      })
      .on("mouseout", (event: MouseEvent) => {
        d3.select(event.target as Element)
          .attr("stroke", "#161616")
          .attr("stroke-width", 0.5);
      })
      .on("click", (event: MouseEvent, d: ConstellationData) => {
        if (onDrugClick) {
          event.stopPropagation();
          onCompanySelect(d, getColorForTherapeuticArea(d.name));
        }
      });
  }

  function handlePointClick(data: ConstellationData) {
    if (onDrugClick) {
      onDrugClick(data);
    }
    onCompanySelect(data, getColorForTherapeuticArea(data.name));
  }

  function handlePointUpdate(event: CustomEvent) {
    selectedPoint = event.detail;
  }

  function handleResize(): void {
    const container = document.getElementById("beeswarm-container");
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    width = rect.width - margin.left - margin.right;
    height = 225 - margin.top - margin.bottom;

    if (svg) {
      svg.attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom);
      updateVisualization();
    }
  }

  onMount(() => {
    calculateBenchmarks();
    initializeVisualization();
    
    const resizeObserver = new ResizeObserver(handleResize);
    const container = document.getElementById("beeswarm-container");
    if (container) {
      resizeObserver.observe(container);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  });
</script>

<div class="sale-benchmarks">
  <!-- Visualization Tabs -->
  <div class="visualization-tabs">
    <button 
    class="viz-tab-button {activeVisualization === 'network' ? 'active' : ''}"
    on:click={() => activeVisualization = 'network'}
  >
    Transaction Network
  </button>
    <button 
      class="viz-tab-button {activeVisualization === 'yearly' ? 'active' : ''}"
      on:click={() => activeVisualization = 'yearly'}
    >
      Yearly Trends
    </button>
    <button 
      class="viz-tab-button {activeVisualization === 'distribution' ? 'active' : ''}"
      on:click={() => activeVisualization = 'distribution'}
    >
      Price Distribution
    </button>
  </div>

  <!-- Visualization Content -->
  <div class="visualization-content">
    {#if activeVisualization === 'yearly'}
      <div class="viz-container">
        <YearlySalesChart {constellationData} />
      </div>
    {:else if activeVisualization === 'distribution'}
      <div class="viz-container">
        <div class="beeswarm-wrapper">
          <div class="transaction-details-grid">
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
              <span class="detail-label"><Medication class="mb-1" />Associated Drug</span>
            </div>
          </div>
          <VoucherBeeswarmPlot 
            data={constellationData}
            onPointClick={handlePointClick}
            on:pointUpdate={handlePointUpdate}
          />
        </div>
      </div>
    {:else if activeVisualization === 'network'}
      <div class="viz-container">
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
    {/if}
  </div>

  <!-- Statistics Tabs -->
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
              <td>{medianSale.buyer}</td>
              <td>{medianSale.seller}</td>
              <td>{medianSale.drugName}</td>
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
</div>

<style>
  .sale-benchmarks {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 2rem;
    padding: 2rem;
  }

  .visualization-tabs {
    display: flex;
    gap: 1rem;
    border-bottom: 1px solid #e5e7eb;
    padding: 0 2rem 0 0;
  }

  .viz-tab-button {
    padding: 1rem .525rem .525rem .525rem;
    font-size: 0.725rem;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .viz-tab-button:hover {
    color: #C9623F;
    border-bottom: 2px solid #C9623F;
  }

  .viz-tab-button.active {
    color: #C9623F;
    border-bottom: 2px solid #C9623F;
    font-weight: 600;
  }

  .visualization-content {
    padding: 2rem;
    min-height: 400px;
  }

  .viz-container {
    width: 100%;
    height: 100%;
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
    border-bottom: 0.25px solid #161616;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: #ff1515;
  }

  .detail-label {
    display: flex;
    align-items: center;
    gap: 0.7245rem;
    font-size: 0.725rem;
    text-transform: uppercase;
    color: #de3333;
  }

  .text-gray-800 {
    min-height: 1rem;
  }

  #beeswarm-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
  }

  .tabs-container {
    border: 0.5px solid #b4b4b4;
    padding: 2.25rem;
  }

  .tab-buttons {
    display: flex;
    gap: 1.725rem;
    border-bottom: 1px solid #e5e7eb;

    color: #797979;
  }

  .tab-button {
    padding: 0.525rem 0.925rem;
    font-size: 0.725rem;
    padding-top: 2.25rem;
    text-transform: uppercase;
    letter-spacing: 0.325px;
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

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 1rem 0.25rem;
    text-transform: capitalize;
    font-size: 0.75rem;
    line-height: 1rem;
    text-align: left;
  }

  th {
    position: sticky;
    font-size: 0.65rem;
    font-family: "IBM Plex Mono", monospace;
    top: 0;
    font-weight: 600;
  }

  tr {
    border-bottom: 0.5px dotted #292F58;
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
    font-size: 0.65rem;
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
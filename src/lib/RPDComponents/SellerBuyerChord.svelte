<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    export let constellationData: any[];
    export let onCompanyClick = undefined;
    export let onChordClick = undefined;
    
    let svg;
    let width = 800;
    let height = 800;
    let innerRadius = Math.min(width, height) * 0.35;
    let outerRadius = innerRadius + 10;
  
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
  
    function getCompanySummary(transactions, company) {
      const sales = transactions.filter(t => t.Sponsor === company);
      const purchases = transactions.filter(t => t.Purchaser === company);
      
      const totalSalesValue = sales.reduce((sum, t) => 
        sum + (parseFloat(t["Sale  Price (USD, Millions)"]) || 0), 0);
      const totalPurchaseValue = purchases.reduce((sum, t) => 
        sum + (parseFloat(t["Sale  Price (USD, Millions)"]) || 0), 0);
        
      const uniqueBuyers = Array.from(new Set(sales.map(t => t.Purchaser)));
      const uniqueSellers = Array.from(new Set(purchases.map(t => t.Sponsor)));
  
      return {
        salesCount: sales.length,
        purchaseCount: purchases.length,
        totalSalesValue,
        totalPurchaseValue,
        buyers: uniqueBuyers,
        sellers: uniqueSellers
      };
    }
  
    onMount(() => {
      const transactions = constellationData.filter(
        d => d.Purchased === "Y" && d.Purchaser && d.Sponsor &&
             d.Purchaser !== "NA" && d.Sponsor !== "NA" &&
             d.Purchaser !== "Undisclosed"
      );
  
      const companies = Array.from(new Set([
        ...transactions.map(d => d.Sponsor),
        ...transactions.map(d => d.Purchaser)
      ]));
  
      const matrix = Array(companies.length).fill(0).map(() => 
        Array(companies.length).fill(0)
      );
  
      const transactionDetails = new Map();
      
      transactions.forEach(t => {
        const sourceIndex = companies.indexOf(t.Sponsor);
        const targetIndex = companies.indexOf(t.Purchaser);
        matrix[sourceIndex][targetIndex]++;
        
        const key = `${sourceIndex}-${targetIndex}`;
        if (!transactionDetails.has(key)) {
          transactionDetails.set(key, []);
        }
        transactionDetails.get(key).push({
          drugName: t["Drug Name"],
          therapeuticArea: t.name,
          indication: t.id,
          price: t["Sale  Price (USD, Millions)"]
        });
      });
  
      const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);
  
      const chords = chord(matrix);
  
      const color = d3.scaleOrdinal()
        .domain(companies)
        .range(d3.quantize(t => d3.interpolatePuOr(t * 1 + 0.325), companies.length));
  
      const svgElement = d3.select(svg)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);
  
      const group = svgElement.append("g")
        .selectAll("g")
        .data(chords.groups)
        .join("g");
  
      group.append("path")
        .attr("class", "group-arc")
        .attr("fill", d => color(companies[d.index]))
        .attr("d", d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius))
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
          highlightCompany(d.index);
          
          const company = companies[d.index];
          const summary = getCompanySummary(transactions, company);
          
          tooltipContent = {
            sponsor: company,
            drugName: `Total Transactions: ${summary.salesCount + summary.purchaseCount}`,
            therapeuticArea: `Sales: $${summary.totalSalesValue.toFixed(1)}M | Purchases: $${summary.totalPurchaseValue.toFixed(1)}M`,
            id: `Partners: ${[...summary.buyers, ...summary.sellers]
              .filter(p => p !== company && p !== "Undisclosed")
              .join(", ")}`
          };
          tooltipBorderColor = color(company);
          tooltipX = event.pageX;
          tooltipY = event.pageY;
          tooltipVisible = true;
        })
        .on("mouseout", () => {
          resetHighlight();
          tooltipVisible = false;
        })
        .on("click", (event, d) => {
          if (onCompanyClick) {
            const company = companies[d.index];
            const companyTransactions = transactions.filter(t => 
              t.Sponsor === company || t.Purchaser === company
            );
            const firstTransaction = companyTransactions[0];
            onCompanyClick({
              ...firstTransaction,
              Sponsor: company
            });
          }
        });
  
      const labels = group.append("text")
        .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", "0.35em")
        .attr("class", "group-label")
        .attr("transform", d => `
          rotate(${(d.angle * 180 / Math.PI - 90)})
          translate(${outerRadius + 5})
          ${d.angle > Math.PI ? "rotate(180)" : ""}
        `)
        .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .text(d => companies[d.index])
        .style("font-size", "8px")
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
          highlightCompany(d.index);
          
          const company = companies[d.index];
          const summary = getCompanySummary(transactions, company);
          
          tooltipContent = {
            sponsor: company,
            drugName: `Partners: ${[...summary.buyers, ...summary.sellers]
              .filter(p => p !== company && p !== "Undisclosed")
              .join(", ")}`,
            therapeuticArea: `Total Transactions: ${summary.salesCount + summary.purchaseCount}`,
            id: `Sales: $${summary.totalSalesValue.toFixed(1)}M | Purchases: $${summary.totalPurchaseValue.toFixed(1)}M`
          };
          tooltipBorderColor = color(company);
          tooltipX = event.pageX;
          tooltipY = event.pageY;
          tooltipVisible = true;
        })
        .on("mouseout", () => {
          resetHighlight();
          tooltipVisible = false;
        })
        .on("click", (event, d) => {
          if (onCompanyClick) {
            const company = companies[d.index];
            const companyTransactions = transactions.filter(t => 
              t.Sponsor === company || t.Purchaser === company
            );
            const firstTransaction = companyTransactions[0];
            onCompanyClick({
              ...firstTransaction,
              Sponsor: company
            });
          }
        });
  
      const paths = svgElement.append("g")
        .attr("fill-opacity", 0.75)
        .selectAll("path")
        .data(chords)
        .join("path")
        .attr("class", "chord")
        .attr("d", d3.ribbon().radius(innerRadius))
        .attr("fill", d => color(companies[d.source.index]))
        .attr("stroke", d => d3.rgb(color(companies[d.source.index])).darker())
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
          highlightChord(d);
          
          const key = `${d.source.index}-${d.target.index}`;
          const details = transactionDetails.get(key);
          tooltipContent = {
            sponsor: `${companies[d.source.index]} → ${companies[d.target.index]}`,
            drugName: details.map(t => t.drugName).join(", "),
            therapeuticArea: `${details.length} transaction${details.length > 1 ? 's' : ''}`,
            id: `Reported Price: $${details[details.length-1].price}M`
          };
          tooltipBorderColor = color(companies[d.source.index]);
          tooltipX = event.pageX;
          tooltipY = event.pageY;
          tooltipVisible = true;
        })
        .on("mouseout", () => {
          resetHighlight();
          tooltipVisible = false;
        })
        .on("click", (event, d) => {
          if (onChordClick) {
            const key = `${d.source.index}-${d.target.index}`;
            const details = transactionDetails.get(key);
            const lastTransaction = details[details.length - 1];
            
            onChordClick({
              ...transactions.find(t => 
                t["Drug Name"] === lastTransaction.drugName &&
                t.Sponsor === companies[d.source.index] &&
                t.Purchaser === companies[d.target.index]
              ),
              name: lastTransaction.therapeuticArea
            });
          }
        });
  
      function highlightCompany(index) {
        paths.style("opacity", d => 
          d.source.index === index || d.target.index === index ? 1 : 0.1
        );
        
        group.selectAll(".group-arc")
          .style("opacity", d => 
            d.index === index ? 1 : 0.1
          );
          
        labels
          .style("font-weight", d => 
            d.index === index ? "bold" : "normal"
          )
          .style("font-size", d => 
            d.index === index ? "10px" : "8px"
          );
      }
  
      function highlightChord(chord) {
        paths.style("opacity", d => 
          d === chord ? 1 : 0.1
        );
        
        group.selectAll(".group-arc")
          .style("opacity", d => 
            d.index === chord.source.index || d.index === chord.target.index ? 1 : 0.1
          );
          
        labels
          .style("font-weight", d => 
            d.index === chord.source.index || d.index === chord.target.index ? "bold" : "normal"
          )
          .style("font-size", d => 
            d.index === chord.source.index || d.index === chord.target.index ? "10px" : "8px"
          );
      }
  
      function resetHighlight() {
        paths.style("opacity", 0.75);
        group.selectAll(".group-arc").style("opacity", 1);
        labels
          .style("font-weight", "normal")
          .style("font-size", "8px");
      }
    });
  </script>
  
  <div class="chord-container">
    <svg bind:this={svg}></svg>
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
  
  <style>
    .chord-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    svg {
      width: 100%;
      height: 100%;
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
  
    :global(.chord) {
      transition: opacity 0.2s ease;
    }
    
    :global(.group-arc) {
      transition: opacity 0.2s ease;
    }
    
    :global(.group-label) {
      transition: all 0.2s ease;
    }
  </style>
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import * as d3 from 'd3';
    import { ArrowUpRight } from 'carbon-icons-svelte';
  
    interface ConstellationData {
      Sponsor: string;
      Purchaser: string;
      "Drug Name": string;
      name: string;
      id: string;
      "Sale Price": string;
      Purchased: string;
    }

    interface CompanySummary {
      salesCount: number;
      purchaseCount: number;
      totalSalesValue: number;
      totalPurchaseValue: number;
      buyers: string[];
      sellers: string[];
    }

    interface TooltipContent {
      sponsor: string;
      drugName: string;
      therapeuticArea: string;
      id: string;
    }

    export let constellationData: ConstellationData[];
    export let onCompanyClick: ((data: any) => void) | undefined = undefined;
    export let onChordClick: ((data: any) => void) | undefined = undefined;
    
    const dispatch = createEventDispatcher();
    
    let svg: SVGSVGElement;
    let width = 800;
    let height = width;
    let innerRadius = Math.min(width, height) * 0.45 * 0.7;
    let outerRadius = innerRadius + 10;
  
    let tooltipVisible = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipContent: TooltipContent = {
      sponsor: '',
      drugName: '',
      therapeuticArea: '',
      id: ''
    };
    let tooltipBorderColor = '';

    // Constants for handling undisclosed transactions
    const UNDISCLOSED_GROUP = "Undisclosed Buyer";
    const UNDISCLOSED_COLOR = "#e5e5e5";

    function getCompanySummary(transactions: ConstellationData[], company: string): CompanySummary {
      const sales = transactions.filter(t => t.Sponsor === company);
      const purchases = transactions.filter(t => t.Purchaser === company);
      
      const totalSalesValue = sales.reduce((sum: number, t: ConstellationData) => 
        sum + (parseFloat(t["Sale Price"]) || 0), 0);
      const totalPurchaseValue = purchases.reduce((sum: number, t: ConstellationData) => 
        sum + (parseFloat(t["Sale Price"]) || 0), 0);
        
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

    function handleMouseOver(event: MouseEvent, data: any, color: string, content: TooltipContent) {
      tooltipContent = content;
      tooltipBorderColor = color;
      tooltipX = event.pageX - 320;
      tooltipY = event.pageY - 505;
      tooltipVisible = true;
      dispatch('tooltipShow', { x: tooltipX, y: tooltipY, content, color });
    }

    function handleMouseOut() {
      tooltipVisible = false;
      dispatch('tooltipHide');
    }

    onMount(() => {
      const transactions = constellationData.filter(
        d => d.Purchased === "Y" && d["Sale Price"] &&
             d.Purchaser !== "NA" && d.Sponsor !== "NA"
      );

      const companies = Array.from(new Set([
        ...transactions.map(d => d.Sponsor === "Undisclosed" ? UNDISCLOSED_GROUP : d.Sponsor),
        ...transactions.map(d => d.Purchaser === "Undisclosed" ? UNDISCLOSED_GROUP : d.Purchaser)
      ])).filter(c => c !== UNDISCLOSED_GROUP);
      
      companies.push(UNDISCLOSED_GROUP);

      const matrix = Array(companies.length).fill(0).map(() => 
        Array(companies.length).fill(0)
      );

      const transactionDetails = new Map<string, any[]>();
      const transactionValues = new Map<string, number>();
      
      transactions.forEach(t => {
        const sourceCompany = t.Sponsor === "Undisclosed" ? UNDISCLOSED_GROUP : t.Sponsor;
        const targetCompany = t.Purchaser === "Undisclosed" ? UNDISCLOSED_GROUP : t.Purchaser;
        
        const sourceIndex = companies.indexOf(sourceCompany);
        const targetIndex = companies.indexOf(targetCompany);
        
        matrix[sourceIndex][targetIndex]++;
        
        const key = `${sourceIndex}-${targetIndex}`;
        if (!transactionDetails.has(key)) {
          transactionDetails.set(key, []);
          transactionValues.set(key, 0);
        }
        transactionDetails.get(key)!.push({
          drugName: t["Drug Name"],
          therapeuticArea: t.name,
          indication: t.id,
          price: parseFloat(t["Sale Price"]) || 0
        });
        
        transactionValues.set(
          key, 
          transactionValues.get(key)! + (parseFloat(t["Sale Price"]) || 0)
        );
      });

      const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

      const chords = chord(matrix);

      const companyColor = d3.scaleOrdinal()
        .domain(companies)
        .range(companies.map(company => 
          company === UNDISCLOSED_GROUP ? UNDISCLOSED_COLOR :
          d3.quantize(t => d3.interpolatePuOr(t * 1 + 0.325), companies.length)[companies.indexOf(company)]
        ));

      const values = Array.from(transactionValues.values());
      const maxValue = d3.max(values) || 0;
      const valueColor = d3.scaleSequential()
        .domain([0, maxValue])
        .interpolator(d3.interpolateBlues);

      const svgElement = d3.select(svg)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

      // Add legend
      const legendWidth = 200;
      const legendHeight = 15;
      const legendPosition = {
        x: -width/2 + 40,
        y: height/2 - 60
      };

      // Create gradient for legend
      const defs = svgElement.append("defs");
      const linearGradient = defs.append("linearGradient")
        .attr("id", "value-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      // Add color stops to gradient
      const numStops = 10;
      for (let i = 0; i <= numStops; i++) {
        const offset = (i / numStops) * 100;
        const value = (maxValue * i) / numStops;
        linearGradient.append("stop")
          .attr("offset", `${offset}%`)
          .attr("stop-color", valueColor(value));
      }

      // Add legend group
      const legend = svgElement.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`);

      // Add gradient rectangle
      legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#value-gradient)");

      // Add border to rectangle
      legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "none")
        .style("stroke", "#666")
        .style("stroke-width", "0.5px");

      // Add legend title
      legend.append("text")
        .attr("x", 0)
        .attr("y", -5)
        .style("font-size", "8px")
        .style("font-weight", "bold")
        .style("fill", "#666")
        .text("Reported Transaction Value (USD Millions)");

      // Add legend ticks and labels
      const tickValues = [0, maxValue/2, maxValue];
      const tickScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, legendWidth]);

      const legendTicks = legend.selectAll(".tick")
        .data(tickValues)
        .enter()
        .append("g")
        .attr("class", "tick")
        .attr("transform", d => `translate(${tickScale(d)}, ${legendHeight})`);

      // Add tick labels
      legendTicks.append("text")
        .attr("y", 12)
        .style("font-size", "8px")
        .style("fill", "#666")
        .style("text-anchor", (d, i) => i === 0 ? "start" : i === tickValues.length - 1 ? "end" : "middle")
        .text(d => `$${d.toFixed(0)}M`);

      // Add note about undisclosed transactions
      legend.append("g")
        .attr("transform", `translate(0, ${legendHeight + 30})`)
        .call(g => {
          g.append("rect")
            .attr("width", 5)
            .attr("height", 5)
            .style("fill", UNDISCLOSED_COLOR)
            .style("stroke", "#666")
            .style("stroke-width", "0.5px");
          g.append("text")
            .attr("x", 10)
            .attr("y", 5)
            .style("font-size", "8px")
            .style("fill", "#666")
            .text("Undisclosed Value");
        });

      const group = svgElement.append("g")
        .selectAll("g")
        .data(chords.groups)
        .join("g");

      group.append("path")
        .attr("class", "group-arc")
        .attr("fill", (d: any) => companyColor(companies[d.index]))
        .attr("d", (d: any) => {
          const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);
          const result = arc(d as any);
          return result || "";
        })
        .style("cursor", "pointer")
        .on("mouseover", function(event: MouseEvent, d: any) {
          highlightCompany(d.index);
          
          const company = companies[d.index];
          const summary = getCompanySummary(transactions, company);
          
          handleMouseOver(event, d, companyColor(company), {
            sponsor: company,
            drugName: `Total Transactions: ${summary.salesCount + summary.purchaseCount}`,
            therapeuticArea: `Sales: $${summary.totalSalesValue.toFixed(1)}M | Purchases: $${summary.totalPurchaseValue.toFixed(1)}M`,
            id: `Partners: ${[...summary.buyers, ...summary.sellers]
              .filter(p => p !== company && p !== "Undisclosed")
              .join(", ")}`
          });
        })
        .on("mouseout", function() {
          resetHighlight();
          handleMouseOut();
        })
        .on("click", function(event: MouseEvent, d: any) {
          if (onCompanyClick) {
            const company = companies[d.index];
            onCompanyClick({
              ...transactions.find(t => t.Sponsor === company || t.Purchaser === company),
              Sponsor: company
            });
          }
        });

      const labels = group.append("text")
        .each((d: any) => { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", "0.35em")
        .attr("class", "group-label")
        .attr("transform", (d: any) => `
          rotate(${(d.angle * 180 / Math.PI - 90)})
          translate(${outerRadius + 5})
          ${d.angle > Math.PI ? "rotate(180)" : ""}
        `)
        .attr("text-anchor", (d: any) => d.angle > Math.PI ? "end" : null)
        .text((d: any) => companies[d.index])
        .style("font-size", "8px")
        .style("cursor", "pointer")
        .on("mouseover", (event: MouseEvent, d: any) => {
          highlightCompany(d.index);
          
          const company = companies[d.index];
          const summary = getCompanySummary(transactions, company);
          
          let tooltipContent: TooltipContent;
          if (company === UNDISCLOSED_GROUP) {
            tooltipContent = {
              sponsor: "Undisclosed Buyers",
              drugName: `Total Transactions: ${summary.purchaseCount}`,
              therapeuticArea: `Total Purchase Value: $${summary.totalPurchaseValue.toFixed(1)}M`,
              id: `Sellers to Undisclosed Buyers: ${summary.sellers.join(", ")}`
            };
          } else {
            tooltipContent = {
              sponsor: company,
              drugName: `Partners: ${[...summary.buyers, ...summary.sellers]
                .filter(p => p !== company && p !== "Undisclosed")
                .join(", ")}`,
              therapeuticArea: `Total Transactions: ${summary.salesCount + summary.purchaseCount}`,
              id: `Sales: $${summary.totalSalesValue.toFixed(1)}M | Purchases: $${summary.totalPurchaseValue.toFixed(1)}M`
            };
          }
          
          handleMouseOver(event, d, companyColor(company), tooltipContent);
        })
        .on("mouseout", () => {
          resetHighlight();
          handleMouseOut();
        })
        .on("click", (event: MouseEvent, d: any) => {
          if (onCompanyClick) {
            const company = companies[d.index];
            onCompanyClick({
              ...transactions.find(t => t.Sponsor === company || t.Purchaser === company),
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
        .attr("d", (d: any) => d3.ribbon().radius(innerRadius)(d))
        .attr("fill", (d: any) => {
          const key = `${d.source.index}-${d.target.index}`;
          const value = transactionValues.get(key);
          return value ? valueColor(value) : UNDISCLOSED_COLOR;
        })
        .attr("stroke", (d: any) => {
          const key = `${d.source.index}-${d.target.index}`;
          const value = transactionValues.get(key);
          return value ? d3.rgb(valueColor(value)).darker().toString() : d3.rgb(UNDISCLOSED_COLOR).darker().toString();
        })
        .attr("stroke-width", .25)
        .style("cursor", "pointer")
        .on("mouseover", (event: MouseEvent, d: any) => {
          highlightChord(d);
          
          const key = `${d.source.index}-${d.target.index}`;
          const details = transactionDetails.get(key);
          const totalValue = transactionValues.get(key) || 0;
          
          handleMouseOver(event, d, valueColor(totalValue), {
            sponsor: `${companies[d.source.index]} → ${companies[d.target.index]}`,
            drugName: details?.map((t: any) => t.drugName).join(", ") || "",
            therapeuticArea: `${details?.length || 0} transaction${(details?.length || 0) > 1 ? 's' : ''}`,
            id: `$${totalValue.toFixed(1)}M`
          });
        })
        .on("mouseout", () => {
          resetHighlight();
          handleMouseOut();
        })
        .on("click", (event: MouseEvent, d: any) => {
          if (onChordClick) {
            const key = `${d.source.index}-${d.target.index}`;
            const details = transactionDetails.get(key);
            if (details && details.length > 0) {
              // Find the matching transaction in the original data
              const sourceCompany = companies[d.source.index];
              const targetCompany = companies[d.target.index];
              const matchingTransaction = transactions.find(t => 
                (t.Sponsor === sourceCompany || t.Sponsor === "Undisclosed") && 
                (t.Purchaser === targetCompany || t.Purchaser === "Undisclosed") &&
                t["Drug Name"] === details[0].drugName
              );
              
              if (matchingTransaction) {
                onChordClick({
                  ...matchingTransaction,
                  name: details[0].therapeuticArea
                });
              }
            }
          }
        });

      function highlightCompany(index: number) {
        paths.style("opacity", (d: any) => 
          d.source.index === index || d.target.index === index ? 1 : 0.1
        );
        
        group.selectAll(".group-arc")
          .style("opacity", (d: any) => 
            d.index === index ? 1 : 0.1
          );
          
        labels
          .style("font-weight", (d: any) => 
            d.index === index ? "bold" : "normal"
          )
          .style("font-size", (d: any) => 
            d.index === index ? "10px" : "8px"
          );
      }

      function highlightChord(chord: any) {
        paths.style("opacity", (d: any) => 
          d === chord ? 1 : 0.1
        );
        
        group.selectAll(".group-arc")
          .style("opacity", (d: any) => 
            d.index === chord.source.index || d.index === chord.target.index ? 1 : 0.1
          );
          
        labels
          .style("font-weight", (d: any) => 
            d.index === chord.source.index || d.index === chord.target.index ? "bold" : "normal"
          )
          .style("font-size", (d: any) => 
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

      // Add explanatory note
      svgElement.append("text")
        .attr("class", "undisclosed-note")
        .attr("x", -width/2 + 20)
        .attr("y", height/2 - 20)
        .attr("text-anchor", "start")
        .attr("font-size", "10px")
        .attr("fill", "#666");
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
        <p class="text-base font-semibold">
          {tooltipContent.sponsor}
        </p>    
        <div class="entry-bottom">
          <p class="text-sm mb-3 font-semibold text-gray-500">
            {tooltipContent.drugName}
          </p>
        </div>
      </div>
      <div class="entry-bottom">
        <p class="text-xs font-semibold font-mono text-gray-500 mt-2">Reported Price</p>
        <p class="text-sm font-semibold">
          {tooltipContent.id}
        </p>
      </div>
      <div class="entry-bottom">
        <p class="text-xs font-semibold font-mono mt-2 text-gray-500">
          {tooltipContent.therapeuticArea}
        </p>
    
            <p class="text-xs font-semibold font-mono mt-6 text-green-600">
                Click to view more details  →
              </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .chord-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  svg {
    width: 100%;
    height: 100%;
  }

  .tooltip {
    position: absolute;
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
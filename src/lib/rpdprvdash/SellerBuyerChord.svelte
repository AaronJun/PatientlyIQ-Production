<!-- SellerBuyerChord.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import { CalendarHeatMap, Medication, Money } from 'carbon-icons-svelte';

  export let data: any[] = [];
  let svg;
  let tooltipVisible = false;
  let tooltipContent = {
      seller: '',
      buyer: '',
      Candidate: '',
      amount: '',
      date: ''
  };
  let tooltipX = 0;
  let tooltipY = 0;

  const width = 982;
  const height = 982;
  const labelConfig = {
      radius: Math.min(width, height) * 0.40,
      padding: 15,
      minAngleDiff: Math.PI / 32
  };

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

  function getLabelPosition(angle: number) {
      const labelRadius = labelConfig.radius+20;
      const x = Math.cos(angle - Math.PI / 2) * labelRadius;
      const y = Math.sin(angle - Math.PI / 2) * labelRadius;
      const rotate = (angle * 180 / Math.PI - 90) + (angle > Math.PI ? 180 : 0);
      return { x, y, rotate };
  }

  function highlightConnections(company: string, companies: string[], ribbonElements: d3.Selection<any, any, any, any>) {
      ribbonElements
          .style("opacity", d => {
              const sourceCompany = companies[d.source.index];
              const targetCompany = companies[d.target.index];
              return (sourceCompany === company || targetCompany === company) ? 1 : 0.2;
          })
          .attr("stroke", d => {
              const sourceCompany = companies[d.source.index];
              const targetCompany = companies[d.target.index];
              return (sourceCompany === company || targetCompany === company) ? therapeuticAreaColorScale(companyData.get(sourceCompany).therapeuticArea) : "#565656";
          })
          .attr("stroke-width", d => {
              const sourceCompany = companies[d.source.index];
              const targetCompany = companies[d.target.index];
              return (sourceCompany === company || targetCompany === company) ? 3 : 0.5;
          });
  }

  function resetHighlight(ribbonElements: d3.Selection<any, any, any, any>) {
      ribbonElements
          .style("opacity", 0.6)
          .attr("stroke-width", 0.5);
  }

  async function createVisualization() {
      // Filter only purchased vouchers with known purchasers
      const transactions = data.filter(d => d.Purchased === "Y" && d.Purchaser && d.Purchaser !== "NA");
      
      // Get unique companies
      const companies = [...new Set([
          ...transactions.map(d => d.Company),
          ...transactions.map(d => d.Purchaser)
      ])];

      // Get company therapeutic areas and transaction counts
      const companyData = new Map();
      companies.forEach(company => {
          const companyTransactions = transactions.filter(d => d.Company === company);
          const areas = data.filter(d => d.Company === company).map(d => d.TherapeuticArea1);
          const primaryArea = areas.length > 0 ? 
              areas.reduce((a, b) => 
                  areas.filter(v => v === a).length >= areas.filter(v => v === b).length ? a : b
              ) : 'Uncategorized';
          
          companyData.set(company, {
              therapeuticArea: primaryArea,
              transactions: companyTransactions,
              totalValue: companyTransactions.reduce((sum, t) => 
                  sum + parseFloat(t["Sale Price (USD Millions)"]), 0)
          });
      });

      // Create matrix of transaction values
      const matrix = companies.map(source => 
          companies.map(target => {
              const transaction = transactions.find(t => 
                  t.Company === source && t.Purchaser === target
              );
              return transaction ? parseFloat(transaction["Sale Price (USD Millions)"]) || 0 : 0;
          })
      );

      // Clear previous
      d3.select(svg).selectAll("*").remove();

      // Create chord layout
      const chord = d3.chord()
          .padAngle(0.05)
          .sortSubgroups(d3.descending);

      const chords = chord(matrix);

      const innerRadius = Math.min(width, height) * 0.35;
      const outerRadius = innerRadius + 20;
      const nodeRadius = 8;

      // Create SVG
      const svgElem = d3.select(svg)
          .attr("viewBox", [-width / 2, -height / 2, width, height]);

      // Add ribbons first
      const ribbons = svgElem.append("g")
          .selectAll("path")
          .data(chords)
          .join("path")
          .attr("d", d3.ribbon().radius(innerRadius))
          .style("fill", d => therapeuticAreaColorScale(companyData.get(companies[d.source.index]).therapeuticArea))
          .style("mix-blend-mode", "multiply")
          .style("opacity", 0.6)
          .attr("stroke", d => d3.color(therapeuticAreaColorScale(companyData.get(companies[d.source.index]).therapeuticArea))?.darker(0.5))
          .attr("stroke-width", .5);

      // Create groups
      const group = svgElem.append("g")
          .selectAll("g")
          .data(chords.groups)
          .join("g");

      // Add background arcs
      group.append("path")
          .attr("fill", d => therapeuticAreaColorScale(companyData.get(companies[d.index]).therapeuticArea))
          .attr("d", d3.arc()
              .innerRadius(innerRadius)
              .outerRadius(outerRadius)
          )
          .attr("opacity", 0.2);

      // Add voucher nodes
      group.each((d, i) => {
          const company = companies[d.index];
          const companyTrans = companyData.get(company).transactions;
          const angle = (d.startAngle + d.endAngle) / 2;
          const spacing = (d.endAngle - d.startAngle) / (companyTrans.length + 1);

          companyTrans.forEach((transaction, idx) => {
              const nodeAngle = d.startAngle + spacing * (idx + 1);
              const x = Math.cos(nodeAngle - Math.PI / 2) * outerRadius;
              const y = Math.sin(nodeAngle - Math.PI / 2) * outerRadius;

              svgElem.append("circle")
                  .attr("r", nodeRadius)
                  .attr("transform", `translate(${x},${y})`)
                  .attr("fill", therapeuticAreaColorScale(transaction.TherapeuticArea1))
                  .attr("stroke", "#565656")
                  .attr("stroke-width", 1.5)
                  .attr("cursor", "pointer")
                  .on("mouseenter", (event) => {
                      d3.select(event.target)
                          .transition()
                          .duration(200)
                          .attr("r", nodeRadius * 1.5)
                          .attr("stroke-width", 2);

                      tooltipContent = {
                          seller: transaction.Company,
                          buyer: transaction.Purchaser,
                          Candidate: transaction.Candidate,
                          amount: transaction["Sale Price (USD Millions)"],
                          date: `${transaction["Purchase Month"]} ${transaction["Purchase Date"]}, ${transaction["Purchase Year"]}`
                      };

                      const rect = svg.getBoundingClientRect();
                      tooltipX = event.clientX - rect.left;
                      tooltipY = event.clientY - rect.top;
                      tooltipVisible = true;
                  })
                  .on("mouseleave", (event) => {
                      d3.select(event.target)
                          .transition()
                          .duration(200)
                          .attr("r", nodeRadius)
                          .attr("stroke-width", 1.5);
                      
                      tooltipVisible = false;
                  });
          });
      });

      // Add labels with connecting lines
      group.each((d, i) => {
          const company = companies[d.index];
          const angle = (d.startAngle + d.endAngle) / 2;
            const { x: labelX, y: labelY, rotate } = getLabelPosition(angle);
            const nodeX = Math.cos(angle - Math.PI / 2) * outerRadius;
            const nodeY = Math.sin(angle - Math.PI / 2) * outerRadius;


          // Add interactive label group
          const labelGroup = svgElem.append("g")
              .attr("class", "label-group")
              .attr("cursor", "pointer")
              .on("mouseenter", () => {
                  highlightConnections(company, companies, ribbons);
                  const companyInfo = companyData.get(company);
                  if (companyInfo.transactions.length > 0) {
                      tooltipContent = {
                          seller: company,
                          buyer: `${companyInfo.transactions.length} vouchers`,
                          amount: companyInfo.totalValue.toString(),
                          date: `Total value: $${companyInfo.totalValue}M`
                      };

                      const rect = svg.getBoundingClientRect();
                      const labelRect = labelGroup.node().getBoundingClientRect();
                      tooltipX = labelRect.left - rect.left + labelRect.width/2;
                      tooltipY = labelRect.top - rect.top;
                      tooltipVisible = true;
                  }
              })
              .on("mouseleave", () => {
                  resetHighlight(ribbons);
                  tooltipVisible = false;
              });

          // Add label text
          labelGroup.append("text")
              .attr("class", "company-label")
              .attr("x", labelX)
              .attr("y", labelY)
              .attr("text-anchor", "middle")
              .attr("transform", `rotate(${rotate}, ${labelX}, ${labelY})`)
              .style("font-size", "8.725px")
              .style("fill", "#4a5568")
              .text(company);
      });

      // Add hover interactions for ribbons
      ribbons.on("mouseenter", (event, d) => {
          const transaction = transactions.find(t => 
              t.Company === companies[d.source.index] && 
              t.Purchaser === companies[d.target.index]
          );

          if (transaction) {
              tooltipContent = {
                  seller: transaction.Company,
                  buyer: transaction.Purchaser,
                  Candidate: transaction.Candidate,
                  amount: transaction["Sale Price (USD Millions)"],
                  date: `${transaction["Purchase Month"]} ${transaction["Purchase Date"]}, ${transaction["Purchase Year"]}`
              };

              const rect = svg.getBoundingClientRect();
              tooltipX = event.clientX - rect.left;
              tooltipY = event.clientY - rect.top;
              tooltipVisible = true;
          }

          d3.select(event.target)
              .style("opacity", 1)
              .attr("stroke-width", 2);
      })
      .on("mouseleave", (event) => {
          tooltipVisible = false;
          d3.select(event.target)
              .style("opacity", 0.6)
              .attr("stroke-width", 0.5);
      });
  }

  onMount(() => {
      createVisualization();
  });
</script>

<div class="chord-container relative bg-slate-50 mt-4 rounded-lg p-8">
  <svg
      bind:this={svg}
      {width}
      {height}
      viewBox="0 0 {width} {height}"
      class="w-full h-auto"
  />

  {#if tooltipVisible}
      <div
          class="absolute z-10 bg-white p-4 rounded shadow-lg text-sm border border-slate-200"
          style="left: {tooltipX}px; top: {tooltipY}px; transform: translate(-50%, -100%)"
      >
      <div class="font-semibold text-base text-slate-800 mb-4">{tooltipContent.seller} → {tooltipContent.buyer}</div>
      
      <div class="flex gap-4 text-slate-600 items-baseline">
        <Medication size="14" class="text-slate-600" />
        <p class="font-semibold text-sm">
          {tooltipContent.Candidate}
        </p>
      </div>

      <div class="flex gap-4 items-baseline">
        <Money size="14" class="text-gray-800" />
        <p class="text-sm">
          ${tooltipContent.amount}M        
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
  .chord-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
  }
</style>
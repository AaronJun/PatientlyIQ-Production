<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import * as d3 from 'd3';
  import { CalendarHeatMap, Medication, Money, Catalog } from 'carbon-icons-svelte';
  import RpdCompanyDetailDrawer from './RPDCompanyDetailDrawer.svelte';

  export let data: any[] = [];
  export let stockData: any[] = [];
  export let highlightedTransaction: { seller: string, buyer: string } | null = null;
  export let onShowDrugDetail: (detail: any) => void;

  const dispatch = createEventDispatcher<{
    transactionHover: { seller: string, buyer: string };
    transactionLeave: void;
  }>();

  let svg;
  let ribbons;
  let companies: string[] = [];
  let companyData: Map<string, any>;
  let transactions: any[];
  let tooltipVisible = false;
  let tooltipContent: {
    type: 'transaction' | 'company';
    seller?: string;
    buyer?: string;
    Candidate?: string;
    amount?: string;
    date?: string;
    companyName?: string;
    transactionCount?: number;
    totalValue?: number;
    candidates?: string[];
    isUndisclosed?: boolean;
  } = {
    type: 'transaction'
  };
  let tooltipX = 0;
  let tooltipY = 0;

  // Company drawer state
  let isCompanyDrawerOpen = false;
  let selectedCompany = "";

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

  $: if (highlightedTransaction && ribbons) {
    highlightRibbon(highlightedTransaction);
  } else if (ribbons) {
    resetHighlight();
  }

  function handleNodeClick(event: MouseEvent, d: any) {
    event.stopPropagation();
    const entries = data.filter(entry => entry.TherapeuticArea1 === d.TherapeuticArea1);
    onShowDrugDetail({
      drugName: d.Candidate,
      year: d["RPDD Year"],
      Company: d.Company,
      therapeuticArea: d.TherapeuticArea1,
      entries,
      color: therapeuticAreaColorScale(d.TherapeuticArea1),
      currentStage: d["Current Development Stage"] || "TBD",
      indication: d.Indication || "",
      rpddAwardDate: d["RPDD Year"],
      voucherAwardDate: d["PRV Year"] || "",
      voucherTransactionDate: d["Purchase Year"] || "",
      treatmentClass: d.Class1 || "TBD",
      mechanismOfAction: d.MOA || "TBD",
      companyUrl: d["Company URL"] || ""
    });
  }

  function handleCompanyHover(event: MouseEvent, company: string) {
    const companyTransactions = transactions.filter(t => 
      t.Company === company || t.Purchaser === company
    );
    
    const totalValue = companyTransactions.reduce((sum, t) => {
      const price = t["Sale Price (USD Millions)"];
      return sum + (price === "Undisclosed" ? 0 : parseFloat(price));
    }, 0);

    const candidates = [...new Set(companyTransactions.map(t => t.Candidate))];

    tooltipContent = {
      type: 'company',
      companyName: company,
      transactionCount: companyTransactions.length,
      totalValue,
      candidates
    };

    // Highlight all ribbons involving this company
    ribbons
      .style("opacity", d => {
        const sourceCompany = companies[d.source.index];
        const targetCompany = companies[d.target.index];
        return (sourceCompany === company || targetCompany === company) ? 1 : 0.2;
      })
      .attr("stroke-width", d => {
        const sourceCompany = companies[d.source.index];
        const targetCompany = companies[d.target.index];
        return (sourceCompany === company || targetCompany === company) ? 2 : 0.25;
      });

    // Highlight nodes for this company as well
    d3.selectAll("circle.voucher-node")
      .style("opacity", d => 
        (d.Company === company || d.Purchaser === company) ? 1 : 0.2
      )
      .attr("r", d => 
        (d.Company === company || d.Purchaser === company) ? 12 : 8
      );
      
    // Get all connected companies
    const connectedCompanies = new Set();
    transactions.forEach(t => {
      if (t.Company === company) connectedCompanies.add(t.Purchaser);
      if (t.Purchaser === company) connectedCompanies.add(t.Company);
    });
    connectedCompanies.add(company);
    
    // Bold the company name and all connected company names
    d3.selectAll(".company-label")
      .style("font-weight", function() {
        const companyName = d3.select(this).text();
        return connectedCompanies.has(companyName) ? "bold" : "normal";
      });

    const rect = svg.getBoundingClientRect();
    tooltipX = event.clientX - rect.left;
    tooltipY = event.clientY - rect.top;
    tooltipVisible = true;
  }

  function handleCompanyClick(company: string) {
    selectedCompany = company;
    isCompanyDrawerOpen = true;
    tooltipVisible = false;
  }

  function handleCloseCompanyDrawer() {
    isCompanyDrawerOpen = false;
  }

  function highlightRibbon(transaction: { seller: string, buyer: string }) {
    ribbons
      .style("opacity", d => {
        const sourceCompany = companies[d.source.index];
        const targetCompany = companies[d.target.index];
        return (sourceCompany === transaction.seller && targetCompany === transaction.buyer) ? 1 : 0.2;
      })
      .attr("stroke-width", d => {
        const sourceCompany = companies[d.source.index];
        const targetCompany = companies[d.target.index];
        return (sourceCompany === transaction.seller && targetCompany === transaction.buyer) ? 2 : 0.25;
      });

    // Also highlight relevant nodes
    d3.selectAll("circle.voucher-node")
      .style("opacity", d => 
        (d.Company === transaction.seller && d.Purchaser === transaction.buyer) ? 1 : 0.2
      )
      .attr("r", d => 
        (d.Company === transaction.seller && d.Purchaser === transaction.buyer) ? 12 : 8
      );
      
    // Bold the relevant company labels
    d3.selectAll(".company-label")
      .style("font-weight", d => {
        const company = d3.select(this).attr("data-company");
        return (company === transaction.seller || company === transaction.buyer) ? "bold" : "normal";
      });

  }

  function resetHighlight() {
    if (!ribbons) return;
    ribbons
      .style("opacity", 0.6)
      .attr("stroke-width", 0.5);

    d3.selectAll("circle.voucher-node")
      .style("opacity", 0.9)
      .attr("r", 8);
      
    // Reset all company labels to normal font weight
    d3.selectAll(".company-label")
      .style("font-weight", "normal");
  }

  function getLabelPosition(angle: number) {
    const labelRadius = labelConfig.radius + 20;
    const x = Math.cos(angle - Math.PI / 2) * labelRadius;
    const y = Math.sin(angle - Math.PI / 2) * labelRadius;
    const rotate = (angle * 180 / Math.PI - 90) + (angle > Math.PI ? 180 : 0);
    return { x, y, rotate };
  }

  function isUndisclosed(value: any): boolean {
    return value === "Undisclosed";
  }

  function getTransactionValue(transaction: any): number {
    const price = transaction["Sale Price (USD Millions)"];
    return isUndisclosed(price) ? 0 : parseFloat(price);
  }

  async function createVisualization() {
    // Filter only purchased vouchers with known purchasers
    transactions = data.filter(d => d.Purchased === "Y" && d.Purchaser && d.Purchaser !== "NA");
    
    // Get unique companies
    companies = [...new Set([
      ...transactions.map(d => d.Company),
      ...transactions.map(d => d.Purchaser)
    ])];

    // Get company therapeutic areas and transaction counts
    companyData = new Map();
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
        totalValue: companyTransactions.reduce((sum, t) => sum + getTransactionValue(t), 0)
      });
    });

    // Create matrix of transaction values
    const matrix = companies.map(source => 
      companies.map(target => {
        const transaction = transactions.find(t => 
          t.Company === source && t.Purchaser === target
        );
        return transaction ? getTransactionValue(transaction) : 0;
      })
    );

    // Clear previous
    d3.select(svg).selectAll("*").remove();

    // Create chord layout
    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const chords = chord(matrix);

    const innerRadius = Math.min(width, height) * 0.3725;
    const outerRadius = innerRadius;
    const nodeRadius = 8;

    // Create SVG
    const svgElem = d3.select(svg)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

    // Add ribbons first
    ribbons = svgElem.append("g")
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("d", d3.ribbon().radius(innerRadius))
      .style("fill", d => therapeuticAreaColorScale(companyData.get(companies[d.source.index]).therapeuticArea))
      .style("mix-blend-mode", "multiply")
      .style("opacity", 0.6)
      .attr("stroke", d => d3.color(therapeuticAreaColorScale(companyData.get(companies[d.source.index]).therapeuticArea))?.darker(0.5))
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", d => {
        const transaction = transactions.find(t => 
          t.Company === companies[d.source.index] && 
          t.Purchaser === companies[d.target.index]
        );
        return isUndisclosed(transaction?.["Sale Price (USD Millions)"]) ? "4,4" : null;
      })
      .on("mouseenter", (event, d) => {
        const transaction = transactions.find(t => 
          t.Company === companies[d.source.index] && 
          t.Purchaser === companies[d.target.index]
        );

        if (transaction) {
          dispatch('transactionHover', {
            seller: transaction.Company,
            buyer: transaction.Purchaser
          });

          tooltipContent = {
            type: 'transaction',
            seller: transaction.Company,
            buyer: transaction.Purchaser,
            Candidate: transaction.Candidate,
            amount: transaction["Sale Price (USD Millions)"],
            date: `${transaction["Purchase Month"]} ${transaction["Purchase Date"]}, ${transaction["Purchase Year"]}`,
            isUndisclosed: isUndisclosed(transaction["Sale Price (USD Millions)"])
          };
          
          // Bold the company labels involved in this transaction
          d3.selectAll(".company-label")
            .style("font-weight", function() {
              const companyName = d3.select(this).text();
              return (companyName === transaction.Company || companyName === transaction.Purchaser) ? "bold" : "normal";
            });

          const rect = svg.getBoundingClientRect();
          tooltipX = event.clientX - rect.left;
          tooltipY = event.clientY - rect.top;
          tooltipVisible = true;
        }
      })
      .on("mouseleave", () => {
        dispatch('transactionLeave');
        tooltipVisible = false;
      });

    // Create groups for labels and arcs
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
      
    // Store all company label text elements for later use
    let companyLabels = new Map();

    // Add voucher nodes
    group.each((d, i) => {
      const company = companies[i];
      const companyTrans = companyData.get(company).transactions;
      const spacing = (d.endAngle - d.startAngle) / (companyTrans.length + 1);

      companyTrans.forEach((transaction, idx) => {
        const nodeAngle = d.startAngle + spacing * (idx + 1);
        const x = Math.cos(nodeAngle - Math.PI / 2) * outerRadius;
        const y = Math.sin(nodeAngle - Math.PI / 2) * outerRadius;

        svgElem.append("circle")
          .attr("class", "voucher-node")
          .datum(transaction)
          .attr("r", nodeRadius)
          .attr("transform", `translate(${x},${y})`)
          .attr("fill", therapeuticAreaColorScale(transaction.TherapeuticArea1))
          .attr("stroke", "#565656")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", isUndisclosed(transaction["Sale Price (USD Millions)"]) ? "2,2" : null)
          .attr("cursor", "pointer")
          .style("opacity", 0.9)
          .on("mouseenter", (event, d) => {
            dispatch('transactionHover', {
              seller: d.Company,
              buyer: d.Purchaser
            });

            tooltipContent = {
              type: 'transaction',
              seller: d.Company,
              buyer: d.Purchaser,
              Candidate: d.Candidate,
              amount: d["Sale Price (USD Millions)"],
              date: `${d["Purchase Month"]} ${d["Purchase Date"]}, ${d["Purchase Year"]}`,
              isUndisclosed: isUndisclosed(d["Sale Price (USD Millions)"])
            };

            const rect = svg.getBoundingClientRect();
            tooltipX = event.clientX - rect.left;
            tooltipY = event.clientY - rect.top;
            tooltipVisible = true;
          })
          .on("mouseleave", () => {
            dispatch('transactionLeave');
            tooltipVisible = false;
          })
          .on("click", handleNodeClick);
      });
    });

    // Add company labels
    group.each((d, i) => {
      const company = companies[i];
      const angle = (d.startAngle + d.endAngle) / 2;
      const { x: labelX, y: labelY, rotate } = getLabelPosition(angle);

      const labelGroup = svgElem.append("g")
        .attr("class", "label-group")
        .attr("cursor", "pointer");

      const textLabel = labelGroup.append("text")
        .attr("class", "company-label")
        .attr("data-company", company)
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("transform", `rotate(${rotate}, ${labelX}, ${labelY})`)
        .attr("text-anchor", "middle")
        .style("font-size", "8.725px")
        .style("fill", "#4a5568")
        .style("font-weight", "normal")
        .text(company)
        .on("mouseenter", (event) => handleCompanyHover(event, company))
        .on("mouseleave", () => {
          tooltipVisible = false;
          resetHighlight();
        })
        .on("click", () => handleCompanyClick(company));
        
      // Store reference to this text element
      companyLabels.set(company, textLabel);
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
      {#if tooltipContent.type === 'transaction'}
        <div class="font-semibold text-base text-slate-800 mb-4">
          <span class="font-bold">{tooltipContent.seller}</span> → <span class="font-bold">{tooltipContent.buyer}</span>
        </div>
        
        <div class="flex gap-4 text-slate-600 items-baseline">
          <Medication size="14" class="text-slate-600" />
          <p class="font-semibold text-sm">
            {tooltipContent.Candidate}
          </p>
        </div>

        <div class="flex gap-4 items-baseline">
          <Money size="14" class="text-gray-800" />
          <p class="text-sm">
            {#if tooltipContent.isUndisclosed}
              <span class="italic">Undisclosed</span>
            {:else}
              ${tooltipContent.amount}M
            {/if}
          </p>
        </div>
      
        <div class="flex gap-4 items-baseline">
          <CalendarHeatMap size="14" class="text-gray-800" />
          <p class="text-sm">
            {tooltipContent.date}
          </p>
        </div>
      {:else}
        <div class="font-semibold text-base text-slate-800 mb-4">
          {tooltipContent.companyName}
        </div>

        <div class="flex gap-4 items-baseline mb-2">
          <Money size="14" class="text-gray-800" />
          <p class="text-sm">
            Total Value: ${tooltipContent.totalValue?.toFixed(1)}M
          </p>
        </div>

        <div class="flex gap-4 items-baseline mb-2">
          <Catalog size="14" class="text-gray-800" />
          <p class="text-sm">
            {tooltipContent.transactionCount} Transactions
          </p>
        </div>

        <div class="text-xs text-slate-600 mt-2">
          <p class="italic">Click for full details</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if isCompanyDrawerOpen}
  <RpdCompanyDetailDrawer
    isOpen={isCompanyDrawerOpen}
    companyName={selectedCompany}
    allData={data}
    stockData={stockData}
    onClose={handleCloseCompanyDrawer}
    onShowDrugDetail={onShowDrugDetail}
    color="#37587e"
  />
{/if}

<style>
  .chord-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }
</style>
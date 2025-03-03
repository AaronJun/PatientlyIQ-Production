<!-- SellerBuyerChord.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
  import * as d3 from 'd3';

  import RpdCompanyDetailDrawer from './RPDCompanyDetailDrawer.svelte';
  import RPDTooltip from './RPDTooltip.svelte';

  export let data: any[] = [];
  export let stockData: any[] = [];
  export let highlightedTransaction: { seller: string, buyer: string } | null = null;
  export let selectedYear: string = ""; // Add the selectedYear prop
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
  let yearFilteredTransactions: any[] = []; // Add filtered transactions
  
  // RPDTooltip state
  let tooltipVisible = false;
  let tooltipContent = {
    sponsor: '',
    drugName: '',
    therapeuticArea: '',
    id: ''
  };
  let tooltipBorderColor = '';
  let tooltipX = 0;
  let tooltipY = 0;

  // Company drawer state
  let isCompanyDrawerOpen = false;
  let selectedCompany = "";

  const width = 920;
  const height = 920;
  const labelConfig = {
    radius: Math.min(width, height) * 0.40,
    padding: 12,
    minAngleDiff: Math.PI / 32
  };

  const therapeuticAreaColorScale = d3.scaleOrdinal()
    .domain([
      'Neurology', 'Neuromuscular', 'Oncology', 'Metabolic', 'Ophthalmology',
      'Cardiovascular', 'Pulmonology', 'Hematology',
      'Endocrinology', 'Genetic', 'Immunology',
      'Gastroenterology', 'Hepatology', 'Dermatology',
      'Neonatology', 'Urology'
    ])
    .range([
      '#FF6B6B', '#FF1515', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEEAD', '#D4A5A5', '#9DE0AD',
      '#FF9F1C', '#2EC4B6', '#E71D36',
      '#FDFFB6', '#CBE896', '#FFA07A',
      '#98D8C8', '#B8B8D1'
    ]);

  // Update visualizations when the selected year changes
  $: if (selectedYear && transactions) {
    yearFilteredTransactions = transactions.filter(t => t["Purchase Year"] === selectedYear);
    highlightTransactionsForYear();
  }
  
  // Watch selectedYear with an explicit statement to trigger the highlight
  $: selectedYear, selectedYear && transactions && highlightTransactionsForYear();

  $: if (highlightedTransaction && ribbons) {
    highlightRibbon(highlightedTransaction);
  } else if (ribbons && !selectedYear) {
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
    
    // Get primary therapeutic area for this company
    const primaryArea = companyData.get(company)?.therapeuticArea || "";

    // Update tooltip with company information
    tooltipContent = {
      sponsor: company,
      drugName: `$${totalValue.toFixed(1)}M total value`,
      therapeuticArea: primaryArea,
      id: `${companyTransactions.length} transactions`
    };
    tooltipBorderColor = therapeuticAreaColorScale(primaryArea);

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
  }

  // New function to highlight transactions for the selected year
  function highlightTransactionsForYear() {
    if (!ribbons || !selectedYear) return;
    
    // Create a map of relevant transactions for faster lookup
    const relevantTransactions = new Map();
    
    // Filter transactions for the selected year
    const relevantYearTransactions = transactions.filter(t => t["Purchase Year"] === selectedYear);
    
    // If no transactions for this year, don't highlight anything special
    if (relevantYearTransactions.length === 0) {
      resetHighlight();
      return;
    }
    
    // Map transactions for quick lookup
    relevantYearTransactions.forEach(t => {
      const key = `${t.Company}-${t.Purchaser}`;
      relevantTransactions.set(key, true);
    });
    
    // Highlight the relevant ribbons
    ribbons
      .style("opacity", d => {
        const sourceCompany = companies[d.source.index];
        const targetCompany = companies[d.target.index];
        const key = `${sourceCompany}-${targetCompany}`;
        return relevantTransactions.has(key) ? 1 : 0.15;
      })
      .attr("stroke-width", d => {
        const sourceCompany = companies[d.source.index];
        const targetCompany = companies[d.target.index];
        const key = `${sourceCompany}-${targetCompany}`;
        return relevantTransactions.has(key) ? 2.5 : 0.25;
      });
      
    // Highlight relevant nodes
    d3.selectAll("circle.voucher-node")
      .style("opacity", d => {
        const key = `${d.Company}-${d.Purchaser}`;
        return relevantTransactions.has(key) ? 1 : 0.15;
      })
      .attr("r", d => {
        const key = `${d.Company}-${d.Purchaser}`;
        return relevantTransactions.has(key) ? 12 : 8;
      });
      
    // Add a pulsating effect to the highlighted nodes
    d3.selectAll("circle.voucher-node")
      .filter(d => {
        const key = `${d.Company}-${d.Purchaser}`;
        return relevantTransactions.has(key);
      })
      .transition()
      .duration(800)
      .attr("stroke-width", 3)
      .attr("stroke", "#FF9F1C")
      .transition()
      .duration(800)
      .attr("stroke-width", 1.5)
      .attr("stroke", "#565656")
      .on("end", function() {
        // Only continue animation if still filtered by year
        if (selectedYear) {
          d3.select(this)
            .transition()
            .duration(800)
            .attr("stroke-width", 3)
            .attr("stroke", "#FF9F1C")
            .transition()
            .duration(800)
            .attr("stroke-width", 1.5)
            .attr("stroke", "#565656");
        }
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

  // Get transaction for a chord
  function getTransaction(source: number, target: number) {
    return transactions.find(t => 
      t.Company === companies[source] && 
      t.Purchaser === companies[target]
    );
  }
  
  // Get therapeutic area color for a transaction
  function getTransactionColor(source: number, target: number) {
    const transaction = getTransaction(source, target);
    if (transaction) {
      return therapeuticAreaColorScale(transaction.TherapeuticArea1);
    }
    return "#cccccc"; // Default gray if no transaction found
  }

  function hideTooltip() {
    tooltipVisible = false;
  }

  async function createVisualization() {
    // Filter only purchased vouchers with known purchasers
    transactions = data.filter(d => d.Purchased === "Y" && d.Purchaser && d.Purchaser !== "NA");
    
    // Initialize year filtered transactions
    if (selectedYear) {
      yearFilteredTransactions = transactions.filter(t => t["Purchase Year"] === selectedYear);
    }
    
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
      .style("fill", d => {
        // Color based on the therapeutic area of the actual transaction
        const transaction = getTransaction(d.source.index, d.target.index);
        return transaction ? therapeuticAreaColorScale(transaction.TherapeuticArea1) : "#cccccc";
      })
      .style("mix-blend-mode", "multiply")
      .style("opacity", 0.6)
      .attr("stroke", d => {
        // Darker stroke of the same therapeutic area color
        const transaction = getTransaction(d.source.index, d.target.index);
        const color = transaction ? therapeuticAreaColorScale(transaction.TherapeuticArea1) : "#cccccc";
        return d3.color(color)?.darker(0.5);
      })
      .attr("stroke-width", 0.5)
      .attr("stroke-dasharray", d => {
        const transaction = getTransaction(d.source.index, d.target.index);
        return transaction && isUndisclosed(transaction["Sale Price (USD Millions)"]) ? "4,4" : null;
      })
      .on("mouseenter", (event, d) => {
        const transaction = getTransaction(d.source.index, d.target.index);

        if (transaction) {
          dispatch('transactionHover', {
            seller: transaction.Company,
            buyer: transaction.Purchaser
          });

          // Format price display
          const priceDisplay = isUndisclosed(transaction["Sale Price (USD Millions)"]) 
            ? "Undisclosed" 
            : `$${transaction["Sale Price (USD Millions)"]}M`;

          // Update tooltip with transaction information
          tooltipContent = {
            sponsor: `${transaction.Company} → ${transaction.Purchaser}`,
            drugName: `${priceDisplay}`,
            therapeuticArea: transaction.Candidate,
            id: `${transaction["Purchase Month"]}-${transaction["Purchase Date"]}-${transaction["Purchase Year"]}`
          };
          tooltipBorderColor = therapeuticAreaColorScale(transaction.TherapeuticArea1);

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
      .attr("fill", d => {
        // Get company's primary therapeutic area color
        const company = companies[d.index];
        const companyInfo = companyData.get(company);
        return therapeuticAreaColorScale(companyInfo.therapeuticArea);
      })
      .attr("d", d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
      )
      .attr("opacity", 0.2);

    // Add voucher nodes
    group.each((d, i) => {
      const company = companies[i];
      const companyTrans = companyData.get(company)?.transactions || [];
      
      if (companyTrans.length === 0) return;
      
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

            // Format price display
            const priceDisplay = isUndisclosed(d["Sale Price (USD Millions)"]) 
              ? "Undisclosed" 
              : `$${d["Sale Price (USD Millions)"]}M`;

             // Update tooltip with transaction information
             tooltipContent = {
            sponsor: `${transaction.Company} → ${transaction.Purchaser}`,
            drugName: `${priceDisplay}`,
            therapeuticArea: transaction.Candidate,
            id: `${transaction["Purchase Month"]}-${transaction["Purchase Date"]}-${transaction["Purchase Year"]}`
          };
            tooltipBorderColor = therapeuticAreaColorScale(d.TherapeuticArea1);

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

      labelGroup.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("transform", `rotate(${rotate}, ${labelX}, ${labelY})`)
        .attr("text-anchor", "middle")
        .style("font-size", "10.725px")
        .style("fill", "#4a5568")
        .text(company)
        .on("mouseenter", (event) => handleCompanyHover(event, company))
        .on("mouseleave", () => {
          tooltipVisible = false;
          // Only reset highlight if we're not filtering by year
          if (!selectedYear) {
            resetHighlight();
          } else {
            highlightTransactionsForYear();
          }
        })
        .on("click", () => handleCompanyClick(company));
    });
    
    // Apply year filtering if a year is selected
    if (selectedYear) {
      highlightTransactionsForYear();
    }
  }

  onMount(() => {
    createVisualization();
  });
  
  // Re-render visualization when selectedYear changes
  afterUpdate(() => {
    if (selectedYear) {
      highlightTransactionsForYear();
    }
  });
</script>

<div class="chord-container relative">
  <div class="py-2 px-4 flex justify-end items-center">
    {#if selectedYear}
    <div class="text-xs font-medium text-slate-800 flex items-left">
      <span>Showing transactions for</span>
      <span class="ml-1 text-red-500 font-semibold">{selectedYear}</span>
    </div>
    {/if}
  </div>

  <div class="bg-slate-50 rounded-lg shadow-sm p-2">
    <svg
      bind:this={svg}
      {width}
      {height}
      viewBox="0 0 {width} {height}"
      class="w-full h-auto"
    />
  </div>

  <RPDTooltip
    visible={tooltipVisible}
    content={tooltipContent}
    borderColor={tooltipBorderColor}
    x={tooltipX}
    y={tooltipY}
  />
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
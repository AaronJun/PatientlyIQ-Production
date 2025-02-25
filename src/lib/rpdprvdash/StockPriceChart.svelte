<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { format as formatDate } from 'date-fns';

  export let companyName: string = '';
  export let stockData: any[] = [];
  export let allData: any[] = [];
  export let color: string = '#37587e';

  let svgElement: SVGElement;
  let chart: d3.Selection<SVGElement, unknown, null, undefined>;
  let chartData: { date: Date, price: number }[] = [];
  let milestones: {
    date: Date,
    price: number,
    type: 'RPDD' | 'PRV' | 'SALE',
    details: string,
    color: string,
    candidate: string,
    id: string
  }[] = [];
  let noDataFound = false;
  let selectedMilestone: any = null;
  let tooltipVisible = false;
  let tooltipData = { x: 0, y: 0, date: new Date(), price: 0, details: '' };
  let dimensions = { width: 0, height: 0, margin: { top: 30, right: 30, bottom: 50, left: 60 } };
  let impactAnalysis: {
    beforeAvg: number,
    afterAvg: number,
    percentChange: number,
    beforeData: { date: Date, price: number }[],
    afterData: { date: Date, price: number }[]
  } | null = null;
  
  // Find the closest stock price to a given date
  function findClosestStockPrice(stockData: any[], targetDate: Date) {
    if (!stockData || stockData.length === 0) return null;
    
    const sortedByDateDiff = [...stockData].sort((a, b) => {
      const diffA = Math.abs(a.date.getTime() - targetDate.getTime());
      const diffB = Math.abs(b.date.getTime() - targetDate.getTime());
      return diffA - diffB;
    });
    
    return sortedByDateDiff[0];
  }

  // Calculate impact of milestone on stock price (3-month before/after average)
  function calculateImpact(milestone: any) {
    // Sort data by date
    const sortedData = [...chartData].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Get milestone date
    const milestoneDate = milestone.date;
    
    // Find data points within 3 months before the milestone
    const beforeData = sortedData.filter(d => {
      const diffMonths = (milestoneDate.getTime() - d.date.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return diffMonths >= 0 && diffMonths <= 3;
    });
    
    // Find data points within 3 months after the milestone
    const afterData = sortedData.filter(d => {
      const diffMonths = (d.date.getTime() - milestoneDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return diffMonths > 0 && diffMonths <= 3;
    });
    
    // Calculate average prices
    const beforeAvg = beforeData.length > 0 
      ? beforeData.reduce((sum, d) => sum + d.price, 0) / beforeData.length
      : 0;
    
    const afterAvg = afterData.length > 0 
      ? afterData.reduce((sum, d) => sum + d.price, 0) / afterData.length
      : 0;
    
    // Calculate percent change
    const percentChange = beforeAvg > 0 
      ? ((afterAvg - beforeAvg) / beforeAvg) * 100
      : 0;
    
    return {
      beforeAvg,
      afterAvg,
      percentChange,
      beforeData,
      afterData
    };
  }

  function processData() {
    if (stockData && stockData.length > 0) {
      // Format stock data
      chartData = stockData
        .filter(d => d.Company === companyName)
        .map(d => {
          const month = parseInt(d.StockPriceMonth) - 1;
          const year = parseInt(d.StockPriceYear);
          const price = parseFloat(d["Close/Price"]);
          return {
            date: new Date(year, month, 1),
            price: price
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      noDataFound = chartData.length === 0;
      
      // Extract milestones from allData
      if (allData && allData.length > 0 && chartData.length > 0) {
        const companyEvents = allData.filter(d => d.Company === companyName);
        const extractedMilestones = [];
        
        // Process RPDD grants
        companyEvents.forEach((event, idx) => {
          // RPDD grant milestone
          if (event["RPDD Month"] && event["RPDD Year"]) {
            const month = parseInt(event["RPDD Month"]) - 1;
            const year = parseInt(event["RPDD Year"]);
            const date = new Date(year, month, 1);
            
            const closestStockData = findClosestStockPrice(chartData, date);
            
            if (closestStockData) {
              extractedMilestones.push({
                date: date,
                price: closestStockData.price,
                type: 'RPDD',
                details: `RPDD granted for ${event.Candidate || 'Unknown'} (${event.Indication || 'Unknown'})`,
                color: '#4CAF50',
                candidate: event.Candidate || '',
                id: `rpdd-${idx}`
              });
            }
          }
          
          // PRV award milestone
          if (event["PRV Month"] && event["PRV Year"]) {
            const month = parseInt(event["PRV Month"]) - 1;
            const year = parseInt(event["PRV Year"]);
            const date = new Date(year, month, 1);
            
            const closestStockData = findClosestStockPrice(chartData, date);
            
            if (closestStockData) {
              extractedMilestones.push({
                date: date,
                price: closestStockData.price,
                type: 'PRV',
                details: `PRV awarded for ${event.Candidate || 'Unknown'} (${event.Indication || 'Unknown'})`,
                color: '#FF9800',
                candidate: event.Candidate || '',
                id: `prv-${idx}`
              });
            }
          }
          
          // PRV sale milestone
          if (event["Purchase Month"] && event["Purchase Year"] && event["Purchased"] === "Y") {
            const month = parseInt(event["Purchase Month"]) - 1;
            const year = parseInt(event["Purchase Year"]);
            const date = new Date(year, month, 1);
            
            const closestStockData = findClosestStockPrice(chartData, date);
            
            if (closestStockData) {
              extractedMilestones.push({
                date: date,
                price: closestStockData.price,
                type: 'SALE',
                details: `PRV for ${event.Candidate || 'Unknown'} sold to ${event.Purchaser || 'Undisclosed'} for $${event["Sale Price (USD Millions)"] || 'undisclosed'} million`,
                color: '#9C27B0',
                candidate: event.Candidate || '',
                id: `sale-${idx}`
              });
            }
          }
        });
        
        milestones = extractedMilestones;
      } else {
        milestones = [];
      }
      
      return true;
    } else {
      noDataFound = true;
      chartData = [];
      milestones = [];
      return false;
    }
  }

  function drawChart() {
    if (!svgElement || noDataFound || chartData.length === 0) return;
    
    // Clear previous chart if any
    d3.select(svgElement).selectAll("*").remove();
    
    // Get dimensions
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    dimensions = { 
      width, 
      height, 
      margin: { top: 30, right: 30, bottom: 50, left: 60 } 
    };
    
    // Create the SVG container
    chart = d3.select(svgElement)
      .attr("width", width)
      .attr("height", height);
    
    // Calculate inner dimensions
    const innerWidth = width - dimensions.margin.left - dimensions.margin.right;
    const innerHeight = height - dimensions.margin.top - dimensions.margin.bottom;
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.price) as number * 1.1])
      .range([innerHeight, 0]);
    
    // Create the line generator
    const line = d3.line<{date: Date, price: number}>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.price))
      .curve(d3.curveMonotoneX);
    
    // Create the main group element
    const g = chart.append("g")
      .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);
    
    // Add x-axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(6)
        .tickFormat(d => formatDate(d as Date, 'MMM yyyy')))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");
    
    // Add y-axis
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `$${d}`));
    
    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(yScale.ticks())
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#e2e8f0")
      .attr("stroke-dasharray", "2,2");
    
    // Add the line path
    g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Draw impact analysis if we have a selected milestone
    if (selectedMilestone && impactAnalysis) {
      // Draw average line for before period
      if (impactAnalysis.beforeData.length > 0) {
        g.append("line")
          .attr("class", "impact-line before")
          .attr("x1", xScale(impactAnalysis.beforeData[0].date))
          .attr("x2", xScale(selectedMilestone.date))
          .attr("y1", yScale(impactAnalysis.beforeAvg))
          .attr("y2", yScale(impactAnalysis.beforeAvg))
          .attr("stroke", "#4CAF50")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      }
      
      // Draw average line for after period
      if (impactAnalysis.afterData.length > 0) {
        g.append("line")
          .attr("class", "impact-line after")
          .attr("x1", xScale(selectedMilestone.date))
          .attr("x2", xScale(impactAnalysis.afterData[impactAnalysis.afterData.length - 1].date))
          .attr("y1", yScale(impactAnalysis.afterAvg))
          .attr("y2", yScale(impactAnalysis.afterAvg))
          .attr("stroke", "#FF5722")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
      }
      
      // Add shaded area for before period
      if (impactAnalysis.beforeData.length > 0) {
        g.append("rect")
          .attr("class", "impact-area before")
          .attr("x", xScale(impactAnalysis.beforeData[0].date))
          .attr("width", xScale(selectedMilestone.date) - xScale(impactAnalysis.beforeData[0].date))
          .attr("y", yScale(Math.max(...impactAnalysis.beforeData.map(d => d.price))))
          .attr("height", yScale(Math.min(...impactAnalysis.beforeData.map(d => d.price))) - yScale(Math.max(...impactAnalysis.beforeData.map(d => d.price))))
          .attr("fill", "#4CAF50")
          .attr("opacity", 0.1);
      }
      
      // Add shaded area for after period
      if (impactAnalysis.afterData.length > 0) {
        g.append("rect")
          .attr("class", "impact-area after")
          .attr("x", xScale(selectedMilestone.date))
          .attr("width", xScale(impactAnalysis.afterData[impactAnalysis.afterData.length - 1].date) - xScale(selectedMilestone.date))
          .attr("y", yScale(Math.max(...impactAnalysis.afterData.map(d => d.price))))
          .attr("height", yScale(Math.min(...impactAnalysis.afterData.map(d => d.price))) - yScale(Math.max(...impactAnalysis.afterData.map(d => d.price))))
          .attr("fill", "#FF5722")
          .attr("opacity", 0.1);
      }
    }
    
    // Add milestone markers
    const milestoneGroup = g.append("g")
      .attr("class", "milestones");
    
    milestoneGroup.selectAll(".milestone")
      .data(milestones)
      .enter()
      .append("circle")
      .attr("class", "milestone")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.price))
      .attr("r", d => (selectedMilestone && selectedMilestone.id === d.id) ? 8 : 6)
      .attr("fill", d => d.color)
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("opacity", d => (selectedMilestone && selectedMilestone.id === d.id) ? 1 : 0.8)
      .attr("cursor", "pointer")
      .attr("id", d => d.id)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("opacity", 1)
          .attr("r", 8);
        
        // Show tooltip
        tooltipData = {
          x: xScale(d.date) + dimensions.margin.left,
          y: yScale(d.price) + dimensions.margin.top - 10,
          date: d.date,
          price: d.price,
          details: d.details
        };
        tooltipVisible = true;
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("opacity", d => selectedMilestone && selectedMilestone.id === d.id ? 1 : 0.8)
          .attr("r", d => selectedMilestone && selectedMilestone.id === d.id ? 8 : 6);
        
        // Hide tooltip if not selected
        if (!selectedMilestone || selectedMilestone.id !== d3.select(this).datum().id) {
          tooltipVisible = false;
        }
      })
      .on("click", function(event, d) {
        // Toggle selection
        if (selectedMilestone && selectedMilestone.id === d.id) {
          selectedMilestone = null;
          impactAnalysis = null;
          tooltipVisible = false;
          
          // Reset all milestones
          milestoneGroup.selectAll(".milestone")
            .attr("opacity", 0.8)
            .attr("r", 6);
            
          // Redraw the chart without impact analysis
          drawChart();
        } else {
          selectedMilestone = d;
          
          // Calculate impact
          impactAnalysis = calculateImpact(d);
          
          tooltipVisible = true;
          tooltipData = {
            x: xScale(d.date) + dimensions.margin.left,
            y: yScale(d.price) + dimensions.margin.top - 10,
            date: d.date,
            price: d.price,
            details: d.details
          };
          
          // Reset all milestones
          milestoneGroup.selectAll(".milestone")
            .attr("opacity", 0.8)
            .attr("r", 6);
          
          // Highlight selected milestone
          d3.select(this)
            .attr("opacity", 1)
            .attr("r", 8);
            
          // Redraw the chart with impact analysis
          drawChart();
        }
      });
    
    // Add vertical line for selected milestone
    if (selectedMilestone) {
      g.append("line")
        .attr("class", "milestone-line")
        .attr("x1", xScale(selectedMilestone.date))
        .attr("x2", xScale(selectedMilestone.date))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", selectedMilestone.color)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,5");
    }
  }

  function resizeChart() {
    if (svgElement) {
      drawChart();
    }
  }

  $: if (companyName || stockData || allData) {
    const hasData = processData();
    if (hasData) {
      setTimeout(() => drawChart(), 0);
    }
  }

  onMount(() => {
    const hasData = processData();
    if (hasData) {
      drawChart();
    }
    
    // Add resize listener
    window.addEventListener('resize', resizeChart);
  });

  onDestroy(() => {
    window.removeEventListener('resize', resizeChart);
  });
</script>

<div class="stock-chart-container">
  <div class="chart-header">
    <h3 class="text-sm font-semibold text-slate-800 mb-4">{companyName} Stock Price History</h3>
  </div>
  
  {#if noDataFound}
    <div class="no-data-message">
      <p>No stock price data found for {companyName}</p>
    </div>
  {:else if chartData.length > 0}
    <div class="chart-area">
      <svg bind:this={svgElement}></svg>
      
      <!-- SVG Tooltip -->
      {#if tooltipVisible}
        <div 
          class="tooltip" 
          style="left: {tooltipData.x}px; top: {tooltipData.y}px;"
        >
          <div class="tooltip-date">{formatDate(tooltipData.date, 'MMM yyyy')}</div>
          <div class="tooltip-price">${tooltipData.price.toFixed(2)}</div>
          {#if tooltipData.details}
            <div class="tooltip-details">{tooltipData.details}</div>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- Milestone Legend -->
    {#if milestones.length > 0}
      <div class="milestone-legend">
        <h4 class="text-xs font-semibold mb-2">Event Milestones (Click for impact analysis)</h4>
        <div class="legend-items">
          {#if milestones.some(m => m.type === 'RPDD')}
            <div class="legend-item">
              <span class="legend-dot" style="background-color: #4CAF50;"></span>
              <span class="legend-label">RPDD Grant ({milestones.filter(m => m.type === 'RPDD').length})</span>
            </div>
          {/if}
          
          {#if milestones.some(m => m.type === 'PRV')}
            <div class="legend-item">
              <span class="legend-dot" style="background-color: #FF9800;"></span>
              <span class="legend-label">PRV Award ({milestones.filter(m => m.type === 'PRV').length})</span>
            </div>
          {/if}
          
          {#if milestones.some(m => m.type === 'SALE')}
            <div class="legend-item">
              <span class="legend-dot" style="background-color: #9C27B0;"></span>
              <span class="legend-label">PRV Sale ({milestones.filter(m => m.type === 'SALE').length})</span>
            </div>
          {/if}
        </div>
      </div>
    {/if}
    
    <!-- Impact Analysis Details -->
    {#if selectedMilestone && impactAnalysis}
      <div class="impact-analysis">
        <h4 class="analysis-title">3-Month Impact Analysis: {selectedMilestone.type}</h4>
        <div class="analysis-content">
          <div class="analysis-period before">
            <h5>Before Event</h5>
            <div class="analysis-value">${impactAnalysis.beforeAvg.toFixed(2)}</div>
            <div class="analysis-label">3-month Avg</div>
            <div class="analysis-range">
              {impactAnalysis.beforeData.length > 0 ? formatDate(impactAnalysis.beforeData[0].date, 'MMM yyyy') : ''} - 
              {formatDate(selectedMilestone.date, 'MMM yyyy')}
            </div>
          </div>
          
          <div class="analysis-change">
            <div class="change-arrow {impactAnalysis.percentChange >= 0 ? 'positive' : 'negative'}">
              {impactAnalysis.percentChange >= 0 ? '↑' : '↓'}
            </div>
            <div class="change-value {impactAnalysis.percentChange >= 0 ? 'positive' : 'negative'}">
              {Math.abs(impactAnalysis.percentChange).toFixed(2)}%
            </div>
          </div>
          
          <div class="analysis-period after">
            <h5>After Event</h5>
            <div class="analysis-value">${impactAnalysis.afterAvg.toFixed(2)}</div>
            <div class="analysis-label">3-month Avg</div>
            <div class="analysis-range">
              {formatDate(selectedMilestone.date, 'MMM yyyy')} - 
              {impactAnalysis.afterData.length > 0 ? formatDate(impactAnalysis.afterData[impactAnalysis.afterData.length - 1].date, 'MMM yyyy') : ''}
            </div>
          </div>
        </div>
        <div class="analysis-legend">
          <div class="legend-item">
            <span class="legend-line" style="background-color: #4CAF50;"></span>
            <span class="legend-label">Before Avg</span>
          </div>
          <div class="legend-item">
            <span class="legend-line" style="background-color: #FF5722;"></span>
            <span class="legend-label">After Avg</span>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Selected Milestone Details -->
    {#if selectedMilestone && !impactAnalysis}
      <div class="milestone-details" style="border-left-color: {selectedMilestone.color}">
        <p>{formatDate(selectedMilestone.date, 'MMM yyyy')}: {selectedMilestone.details}</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .stock-chart-container {
    width: 100%;
    background-color: white;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .chart-area {
    height: 300px;
    width: 100%;
    position: relative;
  }
  
  .chart-area svg {
    width: 100%;
    height: 100%;
  }
  
  .no-data-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 250px;
    width: 100%;
    color: #64748b;
    font-style: italic;
    background-color: #f8fafc;
    border-radius: 0.25rem;
    border: 1px dashed #cbd5e1;
  }
  
  .tooltip {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.95);
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    padding: 0.5rem;
    font-size: 0.75rem;
    pointer-events: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translate(-50%, -100%);
    z-index: 10;
    min-width: 120px;
  }
  
  .tooltip-date {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .tooltip-price {
    color: #4b5563;
  }
  
  .tooltip-details {
    margin-top: 0.25rem;
    padding-top: 0.25rem;
    border-top: 1px dashed #e2e8f0;
    white-space: normal;
    max-width: 200px;
  }
  
  .milestone-legend {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e2e8f0;
  }
  
  .legend-items {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
  }
  
  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  
  .legend-line {
    width: 16px;
    height: 2px;
    display: inline-block;
  }
  
  .legend-label {
    color: #4b5563;
  }
  
  .milestone-details {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: #f8fafc;
    border-radius: 0.25rem;
    border-left: 3px solid #4b5563;
    font-size: 0.75rem;
  }
  
  .impact-analysis {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }
  
  .analysis-title {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #4b5563;
    text-align: center;
  }
  
  .analysis-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .analysis-period {
    text-align: center;
    flex: 1;
  }
  
  .analysis-period h5 {
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #4b5563;
  }
  
  .analysis-value {
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
  }
  
  .analysis-label {
    font-size: 0.625rem;
    color: #6b7280;
  }
  
  .analysis-range {
    font-size: 0.625rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
  
  .analysis-change {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 1rem;
  }
  
  .change-arrow {
    font-size: 1.25rem;
    font-weight: 700;
  }
  
  .change-value {
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .positive {
    color: #4CAF50;
  }
  
  .negative {
    color: #F44336;
  }
  
  .analysis-legend {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px dashed #e2e8f0;
  }
  
  .before h5 {
    color: #388E3C;
  }
  
  .after h5 {
    color: #E64A19;
  }

</style>
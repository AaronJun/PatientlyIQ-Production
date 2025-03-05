<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { format } from 'date-fns';

  export let companyName: string = '';
  export let stockData: any[] = [];
  export let allData: any[] = [];
  export let color: string = '#37587e';

  let svgElement: SVGElement;
  let brushSvgElement: SVGElement;
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
  let brushDimensions = { width: 0, height: 60, margin: { top: 5, right: 30, bottom: 20, left: 60 } };
  
  // Added periods for impact analysis
  let impactPeriod: '3' | '7' | '14' | '30' = '14';
  
  let impactAnalysis: {
    beforeAvg: number,
    afterAvg: number,
    percentChange: number,
    beforeData: { date: Date, price: number }[],
    afterData: { date: Date, price: number }[]
  } | null = null;
  
  // Date range state for brush
  let dateRange: [Date, Date] | null = null;
  let brushStats: {
    startDate: Date;
    endDate: Date;
    startPrice: number;
    endPrice: number;
    change: number;
    percentChange: number;
    timespan: { years: number; months: number; days: number; };
  } | null = null;
  
  // Format date using date-fns
  function formatDateStr(date: Date, formatStr: string): string {
    return format(date, formatStr);
  }

  // Parse date from MM/DD/YYYY format
  function parseDate(dateStr: string): Date {
    const [month, day, year] = dateStr.split('/').map(part => parseInt(part));
    return new Date(year, month - 1, day);
  }

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

  // Calculate impact of milestone on stock price (with variable day periods)
  function calculateImpact(milestone: any, days: number) {
    // Sort data by date
    const sortedData = [...chartData].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Get milestone date
    const milestoneDate = milestone.date;
    
    // Find data points within specified days before the milestone
    const beforeData = sortedData.filter(d => {
      const diffDays = (milestoneDate.getTime() - d.date.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= days;
    });
    
    // Find data points within specified days after the milestone
    const afterData = sortedData.filter(d => {
      const diffDays = (d.date.getTime() - milestoneDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= days;
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
          const date = parseDate(d.Date);
          const price = parseFloat(d["Close/Price"]);
          return {
            date,
            price
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      noDataFound = chartData.length === 0;
      
      // Set initial date range to show all data
      if (chartData.length > 0) {
        dateRange = [
          chartData[0].date,
          chartData[chartData.length - 1].date
        ];
      }
      
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
                color: '#FF5E23',
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
    
    // Get dimensions from parent container instead of SVG itself
    const svgContainer = svgElement.parentElement;
    const width = svgContainer.clientWidth || 920;
    const height = svgContainer.clientHeight || 400;
    
    dimensions = { 
      width, 
      height, 
      margin: { top: 30, right: 30, bottom: 50, left: 60 } 
    };
    
    // Set SVG dimensions to match container
    d3.select(svgElement)
      .attr("width", width)
      .attr("height", height);
    
    // Create the SVG container
    const chart = d3.select(svgElement);
    
    // Calculate inner dimensions
    const innerWidth = width - dimensions.margin.left - dimensions.margin.right;
    const innerHeight = height - dimensions.margin.top - dimensions.margin.bottom;
    
    // Filter data based on date range if set
    const filteredData = dateRange 
      ? chartData.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1])
      : chartData;
    
    if (filteredData.length === 0) return;
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(dateRange || d3.extent(chartData, d => d.date) as [Date, Date])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.price) as number * 1.1])
      .range([innerHeight, 0]);
    
    // Create the line generator
    const line = d3.line<{date: Date, price: number}>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.price))
      .curve(d3.curveMonotoneX);
    
    // Create area generator for shaded area
    const area = d3.area<{date: Date, price: number}>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.price))
      .curve(d3.curveMonotoneX);
    
    // Create the main group element
    const g = chart.append("g")
      .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);
    
    // Add gradient definition
    const gradient = chart.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.725);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.4725);
    
    // Add x-axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(6)
        .tickFormat(d => formatDateStr(d as Date, 'MMM yyyy')))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "0em")
        .attr("dy", ".715em")
        .attr("transform", "rotate(0)");
    
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
    
    // Add the area path
    g.append("path")
      .datum(filteredData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);
    
    // Add the line path
    g.append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.25)
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
    
    // Filter milestones based on date range
    const visibleMilestones = dateRange 
      ? milestones.filter(m => m.date >= dateRange[0] && m.date <= dateRange[1])
      : milestones;
    
    // Add milestone markers
    const milestoneGroup = g.append("g")
      .attr("class", "milestones");
    
    milestoneGroup.selectAll(".milestone")
      .data(visibleMilestones)
      .enter()
      .append("circle")
      .attr("class", "milestone")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.price))
      .attr("r", d => (selectedMilestone && selectedMilestone.id === d.id) ? 8 : 6)
      .attr("fill", d => d.color)
      .attr("stroke", "FFA527")
      .attr("stroke-width", 1.5)
      .attr("cursor", "pointer")
      .attr("id", d => d.id)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("opacity", 1)
          .attr("r", 10);
        
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
          .attr("r", d => selectedMilestone && selectedMilestone.id === d.id ? 12 : 6);
        
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
            .attr("r", 10);
            
          // Redraw the chart without impact analysis
          drawChart();
        } else {
          selectedMilestone = d;
          
          // Calculate impact using the selected period
          const days = parseInt(impactPeriod);
          impactAnalysis = calculateImpact(d, days);
          
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
            .attr("r", 10);
          
          // Highlight selected milestone
          d3.select(this)
            .attr("opacity", 1)
            .attr("r", 12);
            
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

  function drawBrushChart() {
    if (!brushSvgElement || noDataFound || chartData.length === 0) return;
    
    // Clear previous chart if any
    d3.select(brushSvgElement).selectAll("*").remove();
    
    // Get dimensions from parent container
    const brushContainer = brushSvgElement.parentElement;
    const width = brushContainer.clientWidth || 920;
    const height = brushContainer.clientHeight || 60;
    
    brushDimensions = { 
      width, 
      height, 
      margin: { top: 5, right: 30, bottom: 20, left: 60 } 
    };
    
    // Set SVG dimensions to match container
    d3.select(brushSvgElement)
      .attr("width", width)
      .attr("height", height);
    
    // Create the SVG container
    const brushChart = d3.select(brushSvgElement);
    
    // Calculate inner dimensions
    const innerWidth = width - brushDimensions.margin.left - brushDimensions.margin.right;
    const innerHeight = height - brushDimensions.margin.top - brushDimensions.margin.bottom;
    
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
    
    // Create area generator for shaded area
    const area = d3.area<{date: Date, price: number}>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.price))
      .curve(d3.curveMonotoneX);
    
    // Create the main group element
    const g = brushChart.append("g")
      .attr("transform", `translate(${brushDimensions.margin.left},${brushDimensions.margin.top})`);
    
    // Add the area path
    g.append("path")
      .datum(chartData)
      .attr("fill", `${color}33`) // Add transparency
      .attr("d", area);
    
    // Add the line path
    g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 1.5)
      .attr("d", line);
    
    // Add x-axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(4)
        .tickFormat(d => formatDateStr(d as Date, 'MMM yyyy')));
    
    // Add brush
    const brush = d3.brushX()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("end", brushed);
    
    g.append("g")
      .attr("class", "brush")
      .call(brush);
    
    // Set initial brush position if date range is set
    if (dateRange) {
      g.select(".brush")
        .call(brush.move, [
          xScale(dateRange[0]),
          xScale(dateRange[1])
        ]);
    }
    
    // Add milestone markers to brush chart
    g.selectAll(".brush-milestone")
      .data(milestones)
      .enter()
      .append("circle")
      .attr("class", "brush-milestone")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.price))
      .attr("r", 3)
      .attr("fill", d => d.color)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8);
    
    function brushed(event) {
      if (!event.selection) return;
      
      const [x0, x1] = event.selection.map(xScale.invert);
      dateRange = [x0, x1];
      
      // Calculate stats for the brushed area
      calculateBrushStats(x0, x1);
      
      // Redraw the main chart with the new date range
      drawChart();
    }
  }
  
  function calculateBrushStats(startDate: Date, endDate: Date) {
    // Find closest data points to start and end dates
    const filteredData = chartData.filter(d => d.date >= startDate && d.date <= endDate);
    
    if (filteredData.length < 2) {
      brushStats = null;
      return;
    }
    
    // Sort by date to ensure correct order
    filteredData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const firstPoint = filteredData[0];
    const lastPoint = filteredData[filteredData.length - 1];
    
    // Calculate price change
    const priceChange = lastPoint.price - firstPoint.price;
    const percentChange = (priceChange / firstPoint.price) * 100;
    
    // Calculate timespan
    const diffTime = Math.abs(lastPoint.date.getTime() - firstPoint.date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    const months = Math.floor(remainingDays / 30);
    const days = remainingDays % 30;
    
    brushStats = {
      startDate: firstPoint.date,
      endDate: lastPoint.date,
      startPrice: firstPoint.price,
      endPrice: lastPoint.price,
      change: priceChange,
      percentChange: percentChange,
      timespan: { years, months, days }
    };
  }

  // Function to change the impact period and recalculate
  function changeImpactPeriod(period: '3' | '7' | '14' | '30') {
    impactPeriod = period;
    
    if (selectedMilestone) {
      // Recalculate impact analysis with new period
      const days = parseInt(period);
      impactAnalysis = calculateImpact(selectedMilestone, days);
      
      // Redraw chart with new analysis
      drawChart();
    }
  }

  function resizeCharts() {
    if (svgElement) {
      // Force recalculation of dimensions
      const svgContainer = svgElement.parentElement;
      dimensions.width = svgContainer.clientWidth;
      dimensions.height = svgContainer.clientHeight;
      drawChart();
    }
    if (brushSvgElement) {
      const brushContainer = brushSvgElement.parentElement;
      brushDimensions.width = brushContainer.clientWidth;
      brushDimensions.height = brushContainer.clientHeight;
      drawBrushChart();
    }
  }

  $: if (companyName || stockData || allData) {
    const hasData = processData();
    if (hasData && chartData.length >= 2) {
      // Initialize brush stats with full date range
      calculateBrushStats(chartData[0].date, chartData[chartData.length - 1].date);
      
      setTimeout(() => {
        drawChart();
        drawBrushChart();
      }, 0);
    }
  }

  onMount(() => {
    const hasData = processData();
    if (hasData && chartData.length >= 2) {
      // Initialize brush stats with full date range
      calculateBrushStats(chartData[0].date, chartData[chartData.length - 1].date);
      
      // Draw charts
      drawChart();
      drawBrushChart();
      
      // Create ResizeObserver for more reliable size detection
      if (typeof ResizeObserver !== 'undefined') {
        const chartObserver = new ResizeObserver(() => {
          resizeCharts();
        });
        
        if (svgElement && svgElement.parentElement) {
          chartObserver.observe(svgElement.parentElement);
        }
        
        if (brushSvgElement && brushSvgElement.parentElement) {
          chartObserver.observe(brushSvgElement.parentElement);
        }
        
        // Return cleanup function
        return () => {
          chartObserver.disconnect();
          window.removeEventListener('resize', resizeCharts);
        };
      }
    }
    
    // Add resize listener as backup
    window.addEventListener('resize', resizeCharts);
    
    return () => {
      window.removeEventListener('resize', resizeCharts);
    };
  });

  onDestroy(() => {
    window.removeEventListener('resize', resizeCharts);
  });
</script>

{#if noDataFound}
<div class="no-data-message">
  <p>No stock price data found for {companyName}</p>
</div>
{:else if chartData.length > 0}
<div class="chart-area">
  <svg bind:this={svgElement} width="100%" height="100%"></svg>
  
  <!-- SVG Tooltip -->
  {#if tooltipVisible}
    <div 
      class="tooltip" 
      style="left: {tooltipData.x}px; top: {tooltipData.y}px;"
    >
      <div class="tooltip-date">{formatDateStr(tooltipData.date, 'MMM d, yyyy')}</div>
      <div class="tooltip-price">${tooltipData.price.toFixed(2)}</div>
      {#if tooltipData.details}
        <div class="tooltip-details">{tooltipData.details}</div>
      {/if}
    </div>
  {/if}
</div>

<!-- Brush chart for date range selection -->
<div class="brush-area mt-1">
  <svg bind:this={brushSvgElement} width="100%" height="100%"></svg>
</div>

<!-- Brush statistics display -->
{#if brushStats}
  <div class="brush-stats">
    <div class="stats-header">
      <h3 class="text-xs mb-1 text-slate-500">Selected Period</h3>
        <h4>
          <div class="flex w-full justify-between">
            <span class="date-range">
              {formatDateStr(brushStats.startDate, 'MMM d, yyyy')} - {formatDateStr(brushStats.endDate, 'MMM d, yyyy')}
            </span>
            <span class="timespan">
              ({brushStats.timespan.years > 0 ? `${brushStats.timespan.years}YR ` : ''}
              {brushStats.timespan.months > 0 ? `${brushStats.timespan.months}MO ` : ''}
              {brushStats.timespan.days > 0 ? `${brushStats.timespan.days}D` : ''})
            </span>
          </div>
        </h4>
    </div>
    <div class="stats-content">
      <div class="stat-item">
        <span class="stat-label">Start Price</span>
        <span class="stat-value">${brushStats.startPrice.toFixed(2)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">End Price</span>
        <span class="stat-value">${brushStats.endPrice.toFixed(2)}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Change</span>
        <span class="stat-value ${brushStats.change >= 0 ? 'positive' : 'negative'}">
          {brushStats.change >= 0 ? '+' : ''}${brushStats.change.toFixed(2)}
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">% Change</span>
        <span class="stat-value ${brushStats.percentChange >= 0 ? 'positive' : 'negative'}">
          {brushStats.percentChange >= 0 ? '+' : ''}${brushStats.percentChange.toFixed(2)}%
        </span>
      </div>
    </div>
  </div>
{/if}

<!-- Milestone Legend -->
{#if milestones.length > 0}
  <div class="milestone-legend">
    <h4 class="text-xs font-semibold mb-2">Event Milestones (Click for impact analysis)</h4>
    <div class="legend-items">
      {#if milestones.some(m => m.type === 'RPDD')}
        <div class="legend-item">
          <span class="legend-dot" style="background-color: #FF5E23;"></span>
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
    <div class="analysis-header">
      <h4 class="analysis-title">{selectedMilestone.type} Impact Analysis</h4>
      <div class="period-selector">
        <button 
          class="period-button {impactPeriod === '3' ? 'active' : ''}" 
          on:click={() => changeImpactPeriod('3')}
        >
          3d
        </button>
        <button 
          class="period-button {impactPeriod === '7' ? 'active' : ''}" 
          on:click={() => changeImpactPeriod('7')}
        >
          7d
        </button>
        <button 
          class="period-button {impactPeriod === '14' ? 'active' : ''}" 
          on:click={() => changeImpactPeriod('14')}
        >
          14d
        </button>
        <button 
          class="period-button {impactPeriod === '30' ? 'active' : ''}" 
          on:click={() => changeImpactPeriod('30')}
        >
          30d
        </button>
      </div>
    </div>
    <div class="analysis-content">
      <div class="analysis-period before">
        <h5>Before Event</h5>
        <div class="analysis-value">${impactAnalysis.beforeAvg.toFixed(2)}</div>
        <div class="analysis-label">{impactPeriod}-day Avg</div>
        <div class="analysis-range">
          {impactAnalysis.beforeData.length > 0 ? formatDateStr(impactAnalysis.beforeData[0].date, 'MMM d, yyyy') : ''} - 
          {formatDateStr(selectedMilestone.date, 'MMM d, yyyy')}
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
        <div class="analysis-label">{impactPeriod}-day Avg</div>
        <div class="analysis-range">
          {formatDateStr(selectedMilestone.date, 'MMM d, yyyy')} - 
          {impactAnalysis.afterData.length > 0 ? formatDateStr(impactAnalysis.afterData[impactAnalysis.afterData.length - 1].date, 'MMM d, yyyy') : ''}
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
    <p>{formatDateStr(selectedMilestone.date, 'MMM d, yyyy')}: {selectedMilestone.details}</p>
  </div>
{/if}
{/if}

<style>
.stock-chart-container {
  width: 100%;
}

.chart-area {
  height: 400px;
  width: 100%;
  position: relative;
}

.brush-area {
  height: 60px;
  width: 100%;
  position: relative;
  border-top: 1px solid #e2e8f0;
}

.brush-area svg {
  width: 100%;
  height: 100%;
}

/* Style the brush */
:global(.brush rect.selection) {
  fill: #37587e;
  fill-opacity: 0.3;
  stroke: #37587e;
  stroke-width: 1px;
}

:global(.brush rect.handle) {
  fill: #37587e;
  width: 5px;
}

:global(.brush .overlay) {
  cursor: crosshair;
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

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.analysis-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #4b5563;
  text-align: center;
}

.period-selector {
  display: flex;
  gap: 0.5rem;
}

.period-button {
  background-color: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-button:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

.period-button.active {
  background-color: #37587e;
  color: white;
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
  font-weight: 800;
}

.change-value {
  font-size: 0.875rem;
  font-weight: 500;
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

/* Brush stats styles */
.brush-stats {
  margin-top: 0.75rem;
  padding: 0.75rem;
}

.stats-header {
  margin-bottom: 0.5rem;
}

.stats-header h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.date-range {
  font-weight: 700;
  color: #0f172a;
}

.timespan {
  font-weight: 400;
  font-size: 0.75rem;
  color: #64748b;
  margin-left: 0.25rem;
}

.stats-content {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 80px;
  padding: 0.5rem;
  border-top: .425px solid #37587e;
}

.stat-label {
  font-size: 0.625rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}
</style>
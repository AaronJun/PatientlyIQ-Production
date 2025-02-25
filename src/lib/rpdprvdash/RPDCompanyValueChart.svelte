<script lang="ts">
  import { Chart, Svg, Spline, Axis, Highlight, Tooltip, Annotation } from 'layerchart';
  import { scaleTime, scaleLinear } from 'd3-scale';
  import { format } from 'date-fns';

  export let companyName: string = '';
  export let stockData: any[] = [];
  export let allData: any[] = []; // Add this to receive the full dataset
  export let color: string = '#37587e';

  let chartData: {date: Date, price: number}[] = [];
  let noDataFound = false;
  let companyEvents: {date: Date, type: string, description: string, color: string}[] = [];
  
  // Event type colors
  const eventColors = {
    rpdd: '#4C9F70', // Green for RPDD designations
    prv: '#E17C05',  // Orange for PRV awards
    sale: '#8A4FFF'  // Purple for PRV sales
  };
  
  $: {
    if (stockData && stockData.length > 0) {
      // Process and format data for the chart
      chartData = stockData
        .filter(d => d.Company === companyName)
        .map(d => {
          const month = parseInt(d.StockPriceMonth) - 1; // JS months are 0-indexed
          const year = parseInt(d.StockPriceYear);
          const price = parseFloat(d["Close/Price"]);
          return {
            date: new Date(year, month, 1),
            price: price
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      noDataFound = chartData.length === 0;
    } else {
      noDataFound = true;
      chartData = [];
    }

    // Extract company events if we have the full dataset
    if (allData && allData.length > 0) {
      const companyData = allData.filter(d => d.Company === companyName);
      companyEvents = [];

      // Add RPDD events
      companyData.forEach(d => {
        // RPDD events
        if (d["RPDD Month"] && d["RPDD Year"]) {
          const month = parseInt(d["RPDD Month"]) - 1;
          const year = parseInt(d["RPDD Year"]);
          companyEvents.push({
            date: new Date(year, month, 15), // Middle of month
            type: 'rpdd',
            description: `RPDD Designation for ${d.Candidate}`,
            color: eventColors.rpdd
          });
        }
        
        // PRV award events
        if (d["PRV Month"] && d["PRV Year"]) {
          const month = parseInt(d["PRV Month"]) - 1;
          const year = parseInt(d["PRV Year"]);
          companyEvents.push({
            date: new Date(year, month, 15), // Middle of month
            type: 'prv',
            description: `PRV Award for ${d.Candidate}`,
            color: eventColors.prv
          });
        }
        
        // PRV sale events
        if (d["Purchase Month"] && d["Purchase Year"]) {
          const month = typeof d["Purchase Month"] === 'string' && d["Purchase Month"].length > 2 
            ? getMonthNumber(d["Purchase Month"]) 
            : parseInt(d["Purchase Month"]) - 1;
          const year = parseInt(d["Purchase Year"]);
          
          const salePrice = d["Sale Price (USD Millions)"] === "Undisclosed" 
            ? "Undisclosed" 
            : `$${d["Sale Price (USD Millions)"]}M`;
            
          companyEvents.push({
            date: new Date(year, month, 15), // Middle of month
            type: 'sale',
            description: `PRV Sale to ${d.Purchaser}: ${salePrice}`,
            color: eventColors.sale
          });
        }
      });

      // Sort events by date
      companyEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
  }

  // Helper function to convert month names to numbers
  function getMonthNumber(monthName: string): number {
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return months[monthName.substring(0, 3)] || 0;
  }
</script>

<div class="stock-chart-container">
  <div class="chart-header">
    <h3 class="text-sm font-semibold text-slate-800 mb-2">{companyName} Stock Price History</h3>
    
    <!-- Legend for event types -->
    {#if companyEvents.length > 0}
      <div class="flex items-center text-xs gap-4 mb-2">
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 inline-block rounded-full" style="background-color: {eventColors.rpdd}"></span>
          <span>RPDD</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 inline-block rounded-full" style="background-color: {eventColors.prv}"></span>
          <span>PRV Award</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="w-3 h-3 inline-block rounded-full" style="background-color: {eventColors.sale}"></span>
          <span>PRV Sale</span>
        </div>
      </div>
    {/if}
  </div>
  
  {#if noDataFound}
    <div class="no-data-message">
      <p>No stock price data found for {companyName}</p>
    </div>
  {:else if chartData.length > 0}
    <div class="chart-area">
      <Chart
        data={chartData}
        x="date"
        xScale={scaleTime()}
        y="price"
        yDomain={[0, null]}
        yNice
        padding={{ left: 60, bottom: 40, right: 20, top: 20 }}
        tooltip={{ mode: 'bisect-x' }}
      >
        <Svg>
          <Axis placement="left" grid rule format={(d) => `$${d}`} />
          <Axis 
            placement="bottom" 
            format={(d) => format(d, 'MMM yyyy')}
            rule 
          />
          <Spline class="stroke-2" stroke={color} />
          
          <!-- Event Markers -->
          {#each companyEvents as event}
            {#if event.date >= chartData[0].date && event.date <= chartData[chartData.length - 1].date}
              <Annotation 
                x={event.date} 
                placement="bottom"
              >
                <div 
                  class="event-marker" 
                  title={event.description}
                  style="background-color: {event.color};"
                />
              </Annotation>
            {/if}
          {/each}
          
          <Highlight points lines />
        </Svg>
        
        <Tooltip.Root let:data>
          <Tooltip.Header>{format(data.date, 'MMMM yyyy')}</Tooltip.Header>
          <Tooltip.List>
            <Tooltip.Item label="Price" value={`$${data.price.toFixed(2)}`} />
          </Tooltip.List>
          
          <!-- Show events that occurred in this month -->
          {#each companyEvents.filter(e => 
            e.date.getMonth() === data.date.getMonth() && 
            e.date.getFullYear() === data.date.getFullYear()
          ) as event}
            <div class="event-tooltip">
              <div class="flex items-center gap-2 mt-2 text-xs">
                <span class="w-2 h-2 rounded-full" style="background-color: {event.color}"></span>
                <span>{event.description}</span>
              </div>
            </div>
          {/each}
        </Tooltip.Root>
      </Chart>
    </div>
  {/if}
</div>

<style>
  .stock-chart-container {
    width: 100%;
    height: 300px;
    background-color: white;
    border-radius: 0.5rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .chart-area {
    height: 250px;
    width: 100%;
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
  
  .event-marker {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    cursor: pointer;
  }
  
  .event-tooltip {
    border-top: 1px solid #e2e8f0;
    padding-top: 4px;
  }
</style>
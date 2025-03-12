<!-- RegulatoryTimeline.svelte -->
<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import * as d3 from 'd3';
    
    // Props
    export let drugData: any;
    export let width = 580;
    export let height = 200; // Increased height for better spacing
    export let margin = { top: 40, right: 40, bottom: 40, left: 40 }; // Increased bottom margin
  
    // DOM node references
    let timelineContainer: HTMLElement;
    let events: Array<any> = [];
    
    // Event colors based on app's color theme
    const eventColors: {[key: string]: string} = {
      "ODD granted": "#4285F4",      // Blue
      "IND submission": "#34A853",   // Green
      "FTD granted": "#FBBC05",      // Yellow
      "RPDD granted": "#EA4335",     // Red
      "RPDD Date": "#EA4335",        // Red
      "PRV Date": "#9C27B0",         // Purple
      "PRV Awarded": "#9C27B0",      // Purple
      "BLA submission": "#FF6D00",   // Orange
      "PRV Transaction": "#1CD819"   // Green
    };
  
    $: if (drugData) {
      processTimelineData(drugData);
    }
  
    onMount(() => {
      if (drugData) {
        processTimelineData(drugData);
      }
    });
  
    // Handle window resize to make timeline responsive
    let resizeObserver: ResizeObserver | null = null;
    
    afterUpdate(() => {
      if (drugData && timelineContainer) {
        drawTimeline();
        
        // Set up resize observer if not already created
        if (!resizeObserver) {
          resizeObserver = new ResizeObserver(entries => {
            // Redraw timeline when container size changes
            drawTimeline();
          });
          resizeObserver.observe(timelineContainer);
        }
      }
    });
    
    onMount(() => {
      // Cleanup function to disconnect observer when component unmounts
      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    });
  
    function processTimelineData(data: any) {
      events = [];
      
      // Add regulatory milestone events
      const milestones: {[key: string]: string} = {
        "ODD granted": data["ODD granted"],
        "IND submission": data["IND submission "],
        "FTD granted": data["FTD granted"],
        "RPDD granted": data["RPDD granted"],
        "BLA submission": data["BLA submission"]
      };
  
      // Add all milestone events that have dates
      Object.entries(milestones).forEach(([label, date]) => {
        if (date && date.trim() !== "" && date !== "#N/A") {
          // Get color for the event
          const color = eventColors[label] || "#37587e";
          
          // Parse different date formats
          let formattedDate = date;
          if (date.includes('/')) {
            // Handle formats like "9/5/08"
            let [month, day, year] = date.split('/');
            
            // Add century prefix to 2-digit year if needed
            if (year && year.length === 2) {
              year = year < '50' ? `20${year}` : `19${year}`;
            }
            
            formattedDate = `${month}-${day}-${year}`;
          }
          
          events.push({
            label,
            date: formattedDate,
            color
          });
        }
      });
  
      // Add RPDD Month-Date-Year if provided
      if (data["RPDD Month"] && data["RPDD Year"]) {
        const rpddDate = `${data["RPDD Month"]}-${data["RPDD Date"] || "1"}-${data["RPDD Year"]}`;
        events.push({
          label: "RPDD Date",
          date: rpddDate,
          color: eventColors["RPDD Date"]
        });
      }
  
      // Add PRV Month-Date-Year if provided
      if (data["PRV Month"] && data["PRV Year"]) {
        const prvDate = `${data["PRV Month"]}-${data["Date"] || "1"}-${data["PRV Year"]}`;
        events.push({
          label: "PRV Awarded",
          date: prvDate,
          color: eventColors["PRV Date"]
        });
      }
  
      // Add PRV Transaction if available
      if (data["Purchase Month"] && data["Purchase Year"]) {
        const transactionDate = `${data["Purchase Month"]}-${data["Purchase Date"] || "1"}-${data["Purchase Year"]}`;
        events.push({
          label: "PRV Transaction",
          date: transactionDate,
          color: eventColors["PRV Transaction"]
        });
      }
  
      // Format dates and sort chronologically
      events = events
        .filter(event => event.date && event.date.trim() !== "" && event.date !== "#N/A")
        .map(event => {
          try {
            const [month, day, year] = event.date.split("-").map((part: string) => part.trim());
            
            // Handle 2-digit years
            let fullYear = year;
            if (year && year.length === 2) {
              fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
            }
            
            const dateObj = new Date(`${month}/${day}/${fullYear}`);
            
            if (isNaN(dateObj.getTime())) {
              console.warn(`Invalid date for ${event.label}: ${event.date}`);
              return null;
            }
            
            return {
              ...event,
              dateObj,
              formattedDate: `${month}/${day}/${fullYear}`,
              rawDate: event.date
            };
          } catch (e) {
            console.warn(`Error parsing date for ${event.label}: ${event.date}`, e);
            return null;
          }
        })
        .filter(event => event !== null)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }
  
    function drawTimeline() {
      if (!events.length || !timelineContainer) return;
  
      // Clear any existing SVG
      d3.select(timelineContainer).selectAll("*").remove();
  
      // Get container width for responsive sizing
      const containerWidth = timelineContainer.clientWidth || width;
      
      // Create SVG with responsive width
      const svg = d3.select(timelineContainer)
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${containerWidth} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
        
      // Create defs for drop shadow
      const defs = svg.append("defs");
      
      // Create drop shadow filter
      const dropShadow = defs.append("filter")
        .attr("id", "event-shadow")
        .attr("width", "200%")
        .attr("height", "200%")
        .attr("x", "-50%")
        .attr("y", "-50%");
        
      dropShadow.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 1.5) // Increased blur for better shadow
        .attr("result", "blur");
        
      dropShadow.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 1)
        .attr("dy", 1)
        .attr("result", "offsetBlur");
        
      const feMerge = dropShadow.append("feMerge");
      feMerge.append("feMergeNode")
        .attr("in", "offsetBlur");
      feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
  
      // Define time scale using container width
      const firstDate = events[0].dateObj;
      const lastDate = events[events.length - 1].dateObj;
      
      // Add buffer to dates for better visualization
      const timeBuffer = Math.max((lastDate.getTime() - firstDate.getTime()) * 0.1, 7776000000); // 10% buffer or at least 90 days
      const timeScale = d3.scaleTime()
        .domain([
          new Date(firstDate.getTime() - timeBuffer),
          new Date(lastDate.getTime() + timeBuffer)
        ])
        .range([margin.left, containerWidth - margin.right]);
  
      // Draw timeline axis
      const timelineAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .attr("class", "timeline-axis");
  
      const timelineAxis = d3.axisBottom(timeScale)
        .ticks(d3.timeYear.every(1))
        .tickFormat(d3.timeFormat("%Y") as any)
        .tickSize(0);
  
      timelineAxisGroup.call(timelineAxis as any)
        .selectAll("text")
        .attr("font-size", "11px") // Increased font size
        .attr("font-weight", "600")
        .attr("fill", "#4A5568");
        
      // Style the axis
      timelineAxisGroup.select(".domain")
        .attr("stroke", "#CBD5E0")
        .attr("stroke-width", .4825);
        
      timelineAxisGroup.selectAll(".tick line")
        .attr("stroke", "#CBD5E0")
        .attr("stroke-width", 0.5);
  
      // Draw the main timeline line
      svg.append("line")
        .attr("x1", margin.left)
        .attr("y1", height - margin.bottom)
        .attr("x2", containerWidth - margin.right)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "#37587e")
        .attr("stroke-width", 0) // Thicker line
        .attr("stroke-opacity", 0.7);
  
      // Draw the events
      const eventGroup = svg.append("g").attr("class", "events");
      
      // Calculate vertical positions for staggered labels to prevent overlap
      const labelPositions = calculateLabelPositions(events, timeScale, containerWidth);
      
      events.forEach((event, i) => {
        const xPos = timeScale(event.dateObj);
        const yPos = height - margin.bottom;
        const textYOffset = labelPositions[i].yOffset;
        const lineYOffset = textYOffset + 20; // Connect line to the label
        
        // Event group
        const eventNode = eventGroup.append("g")
          .attr("class", `event-${event.label.replace(/\s+/g, '-').toLowerCase()}`)
          .attr("transform", `translate(${xPos}, ${yPos})`);
        
        // Event dot with shadow
        eventNode.append("circle")
          .attr("r", 10) // Larger dot
          .attr("fill", event.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2.5)
          .style("filter", "url(#event-shadow)");
        
        // Event vertical line
        eventNode.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", lineYOffset)
          .attr("stroke", "#666")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "2,1")
          .attr("z-index", 0);
        
        // Event text with background
        const labelNode = eventNode.append("g")
          .attr("transform", `translate(0, ${textYOffset})`)
          .attr("transform", 'rotate(-90)');
        
  
        // Event label
        labelNode.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -6)
          .attr("font-size", "11.245px") // Increased font size
          .attr("font-weight", "600")
          .attr("fill", "#333")
          .text(event.label);
        
        // Event date
        labelNode.append("text")
          .attr("text-anchor", "middle")
          .attr("y", 10) // Adjusted spacing
          .attr("font-size", "14.25px") // Increased font size
          .attr("fill", "#666")
          .text(event.formattedDate);
      });
    }
    
    // Helper function to calculate vertical positions for labels to prevent overlap
    function calculateLabelPositions(events: any[], timeScale: any, containerWidth: number) {
      const positions: {yOffset: number}[] = [];
      const minDistance = 80; // Minimum horizontal distance between labels
      const rows = [-40, -80, -120, -160]; // Possible vertical positions
      
      // Sort events by horizontal position
      const sortedEvents = [...events].map((event, index) => ({
        event,
        index,
        xPos: timeScale(event.dateObj)
      })).sort((a, b) => a.xPos - b.xPos);
      
      // Assign rows to prevent overlap
      sortedEvents.forEach((item, i) => {
        let rowIndex = 0;
        let placed = false;
        
        // Try to find a row where this label won't overlap with previous labels
        while (!placed && rowIndex < rows.length) {
          placed = true;
          
          // Check against all previously placed labels
          for (let j = 0; j < i; j++) {
            const prevItem = sortedEvents[j];
            const prevPos = positions[prevItem.index];
            
            // If previous label is in the same row and too close horizontally
            if (prevPos.yOffset === rows[rowIndex] && 
                Math.abs(item.xPos - prevItem.xPos) < minDistance) {
              placed = false;
              rowIndex++;
              break;
            }
          }
        }
        
        // If we couldn't find a non-overlapping row, use the last row
        if (!placed) rowIndex = rows.length - 1;
        
        // Store the position for this event
        positions[item.index] = { yOffset: rows[rowIndex] };
      });
      
      return positions;
    }
  </script>
  
  <div class="regulatory-timeline">
    <h3 class="section-title text-lg font-base text-slate-800 mt-6 mb-4">
      Regulatory Timeline
    </h3>
    
    {#if events.length > 0}
      <div bind:this={timelineContainer} class="timeline-container mb-4"></div>
      
      <!-- Legend -->
      <div class="legend">
        <div class="legend-items">
          {#each events.filter((e, i, arr) => 
            arr.findIndex(event => event.label === e.label) === i
          ) as event}
            <div class="legend-item">
              <span class="color-dot" style="background-color: {event.color};"></span>
              <span class="label">{event.label}</span>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="empty-timeline">
        <p class="text-sm text-slate-500 font-normal">No timeline data available</p>
      </div>
    {/if}
  </div>
  
  <style>
    .regulatory-timeline {
      margin-bottom: 2rem;
    }
    
    .timeline-container {
      width: 100%;
      min-height: 240px; /* Increased height */
      border-radius: 4px;
      padding: 0.5rem; /* Increased padding */
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .empty-timeline {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100px;
      background-color: #f8fafc;
      border-radius: 4px;
    }
    
    .legend {
      margin-top: 0.5rem;
    }
    
    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 12px; /* Increased gap */
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      font-size: 11px; /* Increased font size */
      color: #4A5568;
      padding: 4px 8px; /* Added padding */
    }
    
    .color-dot {
      display: inline-block;
      width: 8px; /* Larger dot */
      height: 8px; /* Larger dot */
      border-radius: 50%;
      margin-right: 6px; /* More spacing */
      border: 0.5px solid #565656;
    }
    
    :global(.timeline-axis path) {
      stroke: #4A5568;
      stroke-width: 1.5;
    }
    
    :global(.timeline-axis line) {
      stroke: #CBD5E0;
      stroke-width: 0.5;
    }
    
    :global(.timeline-axis text) {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .section-title {
      padding-bottom: .25rem;
      border-bottom: .525px dotted #666666;
    }
  </style>
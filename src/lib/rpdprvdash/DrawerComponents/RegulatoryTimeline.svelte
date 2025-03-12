<!-- RegulatoryTimeline.svelte -->
<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import * as d3 from 'd3';
    
    // Props
    export let drugData: any;
    export let width = 500;
    export let height = 300; // Increased height for better spacing
    export let margin = { top: 40, right: 40, bottom: 60, left: 40 }; // Increased bottom margin
  
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
        .attr("stdDeviation", .725) // Increased blur for better shadow
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
        
      // Create enhanced drop shadow filter for hover state
      const hoverShadow = defs.append("filter")
        .attr("id", "event-hover-shadow")
        .attr("width", "200%")
        .attr("height", "200%")
        .attr("x", "-20%")
        .attr("y", "-20%");
        
      hoverShadow.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3) // Larger blur for hover state
        .attr("result", "blur");
        
      hoverShadow.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 1)
        .attr("dy", 2)
        .attr("result", "offsetBlur");
        
      const hoverMerge = hoverShadow.append("feMerge");
      hoverMerge.append("feMergeNode")
        .attr("in", "offsetBlur");
      hoverMerge.append("feMergeNode")
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
        .attr("font-size", "12px") // Increased font size
        .attr("font-weight", "600")
        .attr("fill", "#4A5568");
        
      // Style the axis
      timelineAxisGroup.select(".domain")
        .attr("stroke", "#CBD5E0")
        .attr("stroke-width", 1);
        
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
        .attr("stroke-width", 2) // Thicker line
        .attr("stroke-opacity", 0.7);
  
      // Draw the events
      const eventGroup = svg.append("g").attr("class", "events");
      
      // Calculate vertical positions for staggered labels to prevent overlap
      const labelPositions = calculateLabelPositions(events, timeScale, containerWidth);
      
      events.forEach((event, i) => {
        const xPos = timeScale(event.dateObj);
        const yPos = height - margin.bottom;
        const textYOffset = labelPositions[i].yOffset;
        const lineYOffset = Math.abs(textYOffset); // Connect line to the label
        
        // Event group
        const eventNode = eventGroup.append("g")
          .attr("class", `event-${event.label.replace(/\s+/g, '-').toLowerCase()}`)
          .attr("transform", `translate(${xPos}, ${yPos})`);
        
        // Event dot with shadow
        eventNode.append("circle")
          .attr("r", 8) // Larger dot
          .attr("fill", event.color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2)
          .style("filter", "url(#event-shadow)");
        
        // Event vertical line
        eventNode.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", -lineYOffset)
          .attr("stroke", "#666")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "2,1");
        
        // Event text background for better readability
        const labelWidth = event.label.length * 7 + 30; // Estimate width based on text length
        const labelHeight = 48; // Height for two lines of text
        
        // Create label group
        const labelNode = eventNode.append("g")
          .attr("class", "event-label")
          .attr("transform", `translate(0, ${textYOffset})`)
          .style("transition", "all 0.2s ease-in-out")
          .style("cursor", "pointer");
        
        // Add background rectangle for label
        const labelRect = labelNode.append("rect")
          .attr("x", -labelWidth / 2)
          .attr("y", -24)
          .attr("width", labelWidth)
          .attr("height", labelHeight)
          .attr("fill", "#fff")
          .attr("stroke", event.color)
          .attr("stroke-width", 1)
          .attr("opacity", 0.9);
  
        // Event label
        const labelText = labelNode.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -5)
          .attr("font-size", "12px")
          .attr("font-weight", "600")
          .attr("fill", "#333")
          .text(event.label);
        
        // Event date
        const dateText = labelNode.append("text")
          .attr("text-anchor", "middle")
          .attr("y", 15) // Adjusted spacing
          .attr("font-size", "11px")
          .attr("fill", "#666")
          .text(event.formattedDate);
          
        // Add hover effects to bring label forward
        labelNode
          .on("mouseenter", function() {
            // Bring this element to front by moving it to the end of its parent's children
            const node = d3.select(this.parentNode);
            node.raise(); // Move to end of parent's children list
            
            // Apply enhanced styles
            d3.select(this)
              .style("z-index", 10)
              .transition()
              .duration(200)
              .attr("transform", `translate(0, ${textYOffset - 2})`) // Slight upward movement
              .select("rect")
                .attr("stroke-width", 2)
                .attr("opacity", 1);
          })
          .on("mouseleave", function() {
            // Restore original styles
            d3.select(this)
              .style("z-index", 1)
              .transition()
              .duration(200)
              .attr("transform", `translate(0, ${textYOffset})`)
              .select("rect")
                .attr("stroke-width", 1)
                .attr("opacity", 0.9);
          });
      });
    }
    
    // Enhanced function to calculate vertical positions for labels to prevent overlap
    function calculateLabelPositions(events: any[], timeScale: any, containerWidth: number) {
      const positions: {yOffset: number}[] = [];
      const minDistance = 100; // Minimum horizontal distance between labels (increased)
      
      // Create more rows for better vertical distribution
      // Negative values position labels above the timeline
      const rows = [-60, -100, -140, -180, -220, -260];
      
      // Sort events by horizontal position
      const sortedEvents = [...events].map((event, index) => ({
        event,
        index,
        xPos: timeScale(event.dateObj)
      })).sort((a, b) => a.xPos - b.xPos);
      
      // Assign rows to prevent overlap using an improved algorithm
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
        // and slightly adjust it to create more space
        if (!placed) {
          rowIndex = rows.length - 1;
          // Add a small random offset to prevent perfect alignment
          const randomOffset = Math.random() * 10 - 5;
          positions[item.index] = { yOffset: rows[rowIndex] + randomOffset };
        } else {
          positions[item.index] = { yOffset: rows[rowIndex] };
        }
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
    {/if}
  </div>
  
  <style>
    .regulatory-timeline {
      margin-bottom: 2rem;
    }
    
    .timeline-container {
      width: 100%;
      min-height: 300px; /* Increased height */
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
      margin-top: 1rem;
      padding: 0.5rem;
      border-top: 1px solid #edf2f7;
    }
    
    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 16px; /* Increased gap */
      justify-content: center;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      font-size: 12px; /* Increased font size */
      color: #4A5568;
      padding: 4px 8px; /* Added padding */
      background-color: #f8fafc;
    }
    
    .color-dot {
      display: inline-block;
      width: 10px; /* Larger dot */
      height: 10px; /* Larger dot */
      border-radius: 50%;
      margin-right: 8px; /* More spacing */
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
    
    /* Add styles for hover effects */
    :global(.event-label) {
      transition: transform 0.2s ease-in-out, filter 0.2s ease-in-out;
    }
    
    :global(.event-label:hover) {
      z-index: 100;
    }
  </style>
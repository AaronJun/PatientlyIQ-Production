<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    const data = [
      { date: 'Jan', Searches: 1500, Mentions: 1000 },
      { date: 'Feb', Searches: 2000, Mentions: 1200 },
      { date: 'Mar', Searches: 2200, Mentions: 1400 },
      { date: 'Apr', Searches: 2000, Mentions: 1300 },
      { date: 'May', Searches: 2500, Mentions: 1500 },
      { date: 'Jun', Searches: 3500, Mentions: 1800 },
      { date: 'Jul', Searches: 4000, Mentions: 2000 },
      { date: 'Aug', Searches: 3500, Mentions: 1700 },
      { date: 'Sep', Searches: 3800, Mentions: 1900 },
      { date: 'Oct', Searches: 4000, Mentions: 2400 },
      { date: 'Nov', Searches: 6000, Mentions: 3000 },
      { date: 'Dec', Searches: 6920, Mentions: 3423 }
    ];
  
    let chart;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 950 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
  
    onMount(() => {
      const svg = d3.select(chart)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
      // Scales
      const x = d3.scalePoint()
        .domain(data.map(d => d.date))
        .range([0, width])
        .padding(0.5);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.Searches, d.Mentions))])
        .range([height, 0]);
  
      // Line generators
      const SearchesLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.Searches))
        .curve(d3.curveMonotoneX);
  
      const MentionsLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.Mentions))
        .curve(d3.curveMonotoneX);
  
      // Add the lines
      svg.append('path')
        .datum(data)
        .attr('class', 'line Searches')
        .attr('d', SearchesLine)
        .style('fill', 'none')
        .style('stroke', '#ff1515')
        .style('stroke-width', 2);
  
      svg.append('path')
        .datum(data)
        .attr('class', 'line Mentions')
        .attr('d', MentionsLine)
        .style('fill', 'none')
        .style('stroke', '#34D399')
        .style('stroke-width', 2);
  
      // Add tooltip
      const tooltip = d3.select(chart)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
  
      // Add tracking dots
      const focus = svg.append('g')
        .style('display', 'none');
  
      focus.append('circle')
        .attr('class', 'Searches-point')
        .attr('r', 4)
        .style('fill', '#60A5FA')
        .style('stroke', '#fff')
        .style('stroke-width', 2);
  
      focus.append('circle')
        .attr('class', 'Mentions-point')
        .attr('r', 4)
        .style('fill', '#34D399')
        .style('stroke', '#fff')
        .style('stroke-width', 2);
  
      // Add vertical tracking line
      focus.append('line')
        .attr('class', 'tracking-line')
        .style('stroke', '#6B7280')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '3,3');
  
      // Add hover area with improved tracking
      const bisect = d3.bisector(d => d.date).left;
      
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseover', () => {
          focus.style('display', null);
          tooltip.style('opacity', 1);
        })
        .on('mouseout', () => {
          focus.style('display', 'none');
          tooltip.style('opacity', 0);
        })
        .on('mousemove', function(event) {
          const mouseX = d3.pointer(event)[0];
          const dates = data.map(d => d.date);
          const xDate = x.domain()[d3.bisector(d => x(d)).left(dates, mouseX)];
          const i = dates.indexOf(xDate);
          
          if (i >= 0 && i < data.length) {
            const d = data[i];
            
            // Update dots
            focus.select('.Searches-point')
              .attr('cx', x(d.date))
              .attr('cy', y(d.Searches));
  
            focus.select('.Mentions-point')
              .attr('cx', x(d.date))
              .attr('cy', y(d.Mentions));
  
            // Update tracking line
            focus.select('.tracking-line')
              .attr('x1', x(d.date))
              .attr('x2', x(d.date))
              .attr('y1', 0)
              .attr('y2', height);
  
            // Update tooltip
            tooltip
              .style('left', `${event.offsetX + 10}px`)
              .style('top', `${event.offsetY - 10}px`)
              .html(`
                <div class="card">
                  <div class="date">${d.date}</div>
                  <div class="metric Searches">
                    <span>Searches:</span> 
                    <span>${d.Searches.toLocaleString()}</span>
                  </div>
                  <div class="metric Mentions">
                    <span>Mentions:</span> 
                    <span>${d.Mentions.toLocaleString()}</span>
                  </div>
                </div>
              `);
          }
        });
  
      // Add axes
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .style('color', '#6B7280');
  
      svg.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .style('color', '#6B7280');
    });
  </script>
  
  <div bind:this={chart} class="w-full h-full relative" />
  
  <style>
    :global(.tooltip) {
      position: absolute;
      pointer-events: none;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10;
    }
  
    :global(.tooltip .card) {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  
    :global(.tooltip .date) {
      font-weight: bold;
      margin-bottom: 4px;
    }
  
    :global(.tooltip .metric) {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
  
    :global(.tooltip .Searches) {
      color: #ff7676;
    }
  
    :global(.tooltip .Mentions) {
      color: #34D399;
    }
  </style>
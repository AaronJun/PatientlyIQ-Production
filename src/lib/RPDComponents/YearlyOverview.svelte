<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";
    
    export let constellationData: any[];
    export let currentYear: string;
    
    let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    let width = 500;
    let height = 500;
    const margin = { top: 20, right: 10, bottom: 20, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    $: yearData = constellationData.filter(d => d.Year === currentYear);
    
    onMount(() => {
        svg = d3.select('#yearly-overview')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        drawBaseStructure();
        updateChart();
    });
    
    afterUpdate(() => {
        updateChart();
    });
    
    function drawBaseStructure() {
        const months = d3.range(12);
        const xScale = d3.scaleLinear()
            .domain([0, 11])
            .range([0, innerWidth]);
        
        // Draw the main horizontal line
        svg.append('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', 'black')
            .attr('stroke-width', .5);
        
        // Draw ticks for each month
        svg.selectAll('.tick')
            .data(months)
            .enter()
            .append('line')
            .attr('class', 'tick')
            .attr('x1', d => xScale(d))
            .attr('x2', d => xScale(d))
            .attr('y1', 0)
            .attr('y2', 3)
            .attr('stroke', '#161616')
            .attr('stroke-width', .5);
        
        // Add labels for all months
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        svg.selectAll('.month-label')
            .data(months)
            .enter()
            .append('text')
            .attr('font-size', '9px')
            .attr('class', 'month-label')
            .attr('x', d => xScale(d))
            .attr('y', -7.5)
            .attr('text-anchor', 'middle')
            .text(d => monthNames[d]);
    }
    
    function updateChart() {
        const months = d3.range(12);
        const xScale = d3.scaleLinear()
            .domain([0, 11])
            .range([0, innerWidth]);

        const monthlyData = months.map(month => {
            return yearData.filter(d => {
                const dataMonth = new Date(`${d.Year}-${d.Month}-01`).getMonth();
                return dataMonth === month;
            }).sort((a, b) => +a.Date - +b.Date);
        });
    
        const circleRadius = 5;
        const circleSpacing = 3.5;
        const rectangleWidth = 8;
        const rectangleHeight = 8;
        const elementSpacing = 3.5; // Space between circles and rectangles
    
        const monthGroups = svg.selectAll('.month-group')
            .data(monthlyData)
            .join('g')
            .attr('class', 'month-group')
            .attr('transform', (d, i) => `translate(${xScale(i)}, 0)`);
    
        monthGroups.each(function(monthData, monthIndex) {
            const group = d3.select(this);

            // Function to calculate vertical position
            const getVerticalPosition = (index, isPurchased) => {
                const basePosition = 10 + (index * (circleRadius * 2 + circleSpacing));
                return isPurchased ? 
                    basePosition + circleRadius + elementSpacing : 
                    basePosition;
            };

            // Add circles
            const circles = group.selectAll('circle').data(monthData);

            circles.enter()
                .append('circle')
                .attr('cx', 0)
                .attr('cy', innerHeight / 2)
                .attr('r', 0)
                .attr('fill', '#43887F')
                .attr('stroke', '#161616')
                .attr('stroke-width', 0.5)
                .merge(circles as any)
                .transition()
                .duration(500)
                .delay((d, i) => i * 50)
                .attr('cx', 0)
                .attr('cy', (d, i) => getVerticalPosition(i, false))
                .attr('r', circleRadius);

            circles.exit()
                .transition()
                .duration(300)
                .attr('r', 0)
                .remove();

            group.selectAll('circle')
                .select('title')
                .text(d => `${d.Month} ${d.Date}: ${d.id}`);

            // Add gold rectangles for purchased entries
            const purchasedData = monthData.filter(d => d.Purchased === "Y");
            const rectangles = group.selectAll('rect').data(purchasedData);

            rectangles.enter()
                .append('rect')
                .attr('x', -rectangleWidth / 2)
                .attr('y', innerHeight / 2)
                .attr('width', rectangleWidth)
                .attr('height', 0)
                .attr('fill', 'gold')
                .attr('stroke', '#161616')
                .attr('stroke-width', 0.5)
                .merge(rectangles as any)
                .transition()
                .duration(675)
                .delay((d, i) => i * 50)
                .attr('x', -rectangleWidth / 2)
                .attr('y', (d, i) => getVerticalPosition(monthData.indexOf(d), true))
                .attr('width', rectangleWidth)
                .attr('height', rectangleHeight);

            rectangles.exit()
                .transition()
                .duration(400)
                .attr('height', 0)
                .remove();

            group.selectAll('rect')
                .select('title')
                .text(d => `${d.Month} ${d.Date}: ${d.id} (Purchased)`);
        });
    
        console.log('Year Data:', yearData);
        console.log('Monthly Data:', monthlyData);
    }
</script>

<svg id="yearly-overview"></svg>

<style>
    :global(#yearly-overview) {
        max-width: 100%;
        height: auto;
    }
</style>
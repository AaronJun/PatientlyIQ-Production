<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    export let searchTerms: { 
        term: string; 
        volume: number;
        relatedSearches: Array<{term: string; volume: number}>;
    }[] = [];
    
    let svg: SVGSVGElement;
    let containerWidth: number;
    let isMobile = false;
    let tooltip;

    $: if (containerWidth) {
        isMobile = containerWidth < 768;
        createVisualization();
    }

    function createVisualization() {
        if (!searchTerms?.length || !svg) return;

        tooltip = tooltip || d3.select('body').append('div')
            .attr('class', 'search-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('background', '#4d4193')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('max-width', '280px')
            .style('z-index', '1000');

        d3.select(svg).selectAll('*').remove();

        const margin = { top: 10, right: 100, bottom: 60, left: 10 };
        const width = containerWidth - margin.right;
        const height = 160;
        const circleY = height / 2;

        const volumeExtent = d3.extent(searchTerms, d => d.volume);
        const radiusScale = d3.scaleSqrt()
            .domain(volumeExtent)
            .range([25, 75]);

        const colors = d3.quantize(d3.interpolateHcl("#60c96e", "#4d4193"), 10);
        const colorScale = d3.scaleQuantile()
            .domain(volumeExtent)
            .range(colors);

        const svgElement = d3.select(svg)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svgElement.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        if (isMobile) {
            const simulation = d3.forceSimulation(searchTerms)
                .force('x', d3.forceX(width / 2).strength(0.05))
                .force('y', d3.forceY(circleY).strength(0.05))
                .force('collide', d3.forceCollide().radius(d => radiusScale(d.volume) + 2))
                .stop();

            for (let i = 0; i < 300; ++i) simulation.tick();
        } else {
            let currentX = margin.left;
            searchTerms.forEach((term, i) => {
                const radius = radiusScale(term.volume);
                term.x = currentX + radius;
                term.y = circleY;
                currentX += (radius * 2) + 30;
            });

            const totalWidth = currentX;
            if (totalWidth > width) {
                const scale = width / totalWidth;
                searchTerms.forEach(term => {
                    term.x = term.x * scale;
                });
            }
        }

        const bubbles = g.selectAll('.bubble-group')
            .data(searchTerms)
            .join('g')
            .attr('class', 'bubble-group');

        bubbles.append('line')
            .attr('class', 'connector')
            .attr('x1', d => d.x)
            .attr('y1', d => d.y + radiusScale(d.volume))
            .attr('x2', d => d.x)
            .attr('y2', d => d.y + radiusScale(d.volume) + 5.25)
            .attr('stroke', d => colorScale(d.volume))
            .attr('stroke-opacity', 0.3)
            .attr('stroke-width', 1);

        bubbles.append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => radiusScale(d.volume))
            .attr('fill', d => colorScale(d.volume))
            .attr('fill-opacity', 0.8)
            .attr('stroke', d => colorScale(d.volume))
            .attr('stroke-opacity', 0.3)
            .attr('stroke-width', 1);

        const labels = bubbles.append('text')
            .attr('class', 'label')
            .attr('x', d => d.x)
            .attr('y', d => d.y + radiusScale(d.volume) + 25)
            .attr('text-anchor', 'middle')
            .attr('font-size', '9.725px')
            .attr('fill', '#4a4a4a')
            .attr('pointer-events', 'none');

        labels.each(function(d) {
            const label = d3.select(this);
            const words = d.term.split(/\s+/);
            let line = [];
            let lineNumber = 0;
            const lineHeight = 1.1;
            
            words.forEach(word => {
                line.push(word);
                label.append('tspan')
                    .attr('x', d.x)
                    .attr('dy', lineNumber === 0 ? 0 : `${lineHeight}em`)
                    .text(line.join(' '));
                line = [];
                lineNumber++;
            });
        });

        bubbles.on('mouseenter', function(event, d) {
            const tooltipContent = `
                <div class="font-medium mb-2">${d.term} (${d.volume.toLocaleString()})</div>
                <div class="text-sm">Related searches:</div>
                <ul class="list-none p-0 m-0 mt-1">
                    ${d.relatedSearches.map(search => 
                        `<li class="text-sm mt-1">• ${search.term} (${search.volume.toLocaleString()})</li>`
                    ).join('')}
                </ul>
            `;

            tooltip.html(tooltipContent)
                .style('opacity', 1)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 10}px`);

            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('fill-opacity', 1)
                .attr('stroke-opacity', 0.6);

            d3.select(this).select('.connector')
                .transition()
                .duration(200)
                .attr('stroke-opacity', 0.6);
        })
        .on('mousemove', function(event) {
            tooltip.style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseleave', function() {
            tooltip.style('opacity', 0);

            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('fill-opacity', 0.8)
                .attr('stroke-opacity', 0.3);

            d3.select(this).select('.connector')
                .transition()
                .duration(200)
                .attr('stroke-opacity', 0.3);
        });
    }

    onMount(() => {
        const resizeObserver = new ResizeObserver(entries => {
            containerWidth = entries[0].contentRect.width;
        });

        const container = svg.parentElement;
        if (container) {
            resizeObserver.observe(container);
        }

        return () => {
            resizeObserver.disconnect();
            if (tooltip) tooltip.remove();
        };
    });
</script>

<div class="w-full relative">
    <svg 
        bind:this={svg}
        class="w-full"
    ></svg>
</div>

<style>
    svg {
        overflow: visible;
    }

    :global(.search-tooltip) {
        transition: opacity 0.2s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        line-height: 1.4;
    }
</style>
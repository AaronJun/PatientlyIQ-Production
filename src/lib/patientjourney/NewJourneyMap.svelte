<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "carbon-components-svelte/css/all.css";

    export let data = [];
    export let isVisible = false;
    let containerRef;

    const sentimentColors = {
        "1": "#8B0000",
        "2": "#CD5C5C",
        "3": "#FFB54F",
        "4": "#90EE90",
        "5": "#228B22"
    };

    onMount(() => {
        if (!data.length) return;

        const container = d3.select(containerRef);
        const margin = { top: 20, right: 30, bottom: 10, left: 20 };
        const width = containerRef.clientWidth - margin.left - margin.right;
        const height = 35;

        // Create base SVG group for rectangles
        const svg = container.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create separate groups for layers
        const rectanglesGroup = svg.append('g').attr('class', 'rectangles');
        const linesGroup = svg.append('g').attr('class', 'connecting-lines');
        const labelsGroup = svg.append('g').attr('class', 'labels');
        const circleGroup = svg.append('g').attr('class', 'circle').style('z-index', 10);

        const totalDuration = d3.sum(data, d => d.Duration);
        const xScale = d3.scaleLinear()
            .domain([0, totalDuration])
            .range([0, width]);

        let currentX = 0;
        const staggerHeight = 10;
        const sectionMeta = [];

        // Create defs for gradient
        const defs = svg.append('defs');

        // Create stage rectangles
        data.forEach((stage, i) => {
            const stageWidth = xScale(stage.Duration);
            const yOffset = (i % 2) * staggerHeight;

            sectionMeta.push({
                startX: currentX,
                width: stageWidth,
                yOffset: yOffset
            });

            const stageGroup = rectanglesGroup.append('g')
                .attr('transform', `translate(${currentX},${yOffset})`);

            // Create gradient for each rectangle
            const gradientId = `gradient-${i}`;
            const gradient = defs.append('linearGradient')
                .attr('id', gradientId)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', sentimentColors[stage['Sentiment ']])
                .attr('stop-opacity', 1);

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', sentimentColors[stage['Sentiment ']])
                .attr('stop-opacity', 0.3);

            // Add stage rectangle
            stageGroup.append('rect')
                .attr('height', 9.25)
                .attr('width', stageWidth - 3.725)
                .attr('fill', `url(#${gradientId})`)
                .style('cursor', 'pointer')
                .style('opacity', 0.3)
                .style('transition', 'opacity 0.2s')
                .attr('data-index', i)
                .on('mouseover', function() {
                    tooltip
                        .style('opacity', 1)
                        .html(`
                            <div class="font-sans text-xs">
                                <div class="font-semibold">${stage.Stage}</div>
                                <div>Duration: ${stage.Duration}</div>
                                <div>Sentiment: ${stage['Sentiment ']}</div>
                            </div>
                        `);
                })
                .on('mouseout', () => tooltip.style('opacity', 0))
                .on('mousemove', (event) => {
                    tooltip
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY - 10}px`);
                });

            // Add stage label
            labelsGroup.append('text')
                .attr('x', currentX + stageWidth/4)
                .attr('y', yOffset + 22)
                .attr('text-anchor', 'start')
                .attr('font-size', '9.25px')
                .attr('fill', '#4a4a4a')
                .text(stage.Stage);

            currentX += stageWidth;
        });

        // Add progress circle (on top layer)
        const progressCircle = circleGroup.append('circle')
            .attr('r', 7.25)
            .attr('fill', '#ff4a4a')
            .attr('stroke', 'white')
            .attr('stroke-width', .525)
            .style('filter', 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))');

        const tooltip = d3.select('body').selectAll('.journey-tooltip').data([0])
            .join('div')
            .attr('class', 'journey-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('padding', '9.25px')
            .style('border-radius', '4px')
            .style('background-color', '#fff')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
            .style('pointer-events', 'none')
            .style('z-index', 1000);

        function updateProgressCircle() {
            const sections = document.querySelectorAll('section');
            let activeSection = 0;
            let progress = 0;

            sections.forEach((section, index) => {
                const rect = section.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                if (rect.top <= viewportHeight/2 && rect.bottom >= viewportHeight/2) {
                    activeSection = index;
                    const sectionProgress = (viewportHeight/2 - rect.top) / rect.height;
                    progress = Math.max(0, Math.min(1, sectionProgress));
                }
            });

            if (activeSection >= 0 && activeSection < sectionMeta.length) {
                const meta = sectionMeta[activeSection];
                const x = meta.startX + (meta.width * progress);
            const y = meta.yOffset + 4.625;

                progressCircle
                    .attr('cx', x)
                    .attr('cy', y);

                // Update gradients with delay
                setTimeout(() => {
                    data.forEach((_, i) => {
                        const gradient = d3.select(`#gradient-${i}`);
                        const gradientProgress = i < activeSection ? 1 : 
                                               i === activeSection ? progress : 0;
                        
                        gradient.select('stop:nth-child(2)')
                            .attr('offset', `${gradientProgress * 100}%`)
                            .transition()
                            .duration(300);
                    });

                    // Update rectangle opacities
                    rectanglesGroup.selectAll('rect')
                        .style('opacity', function() {
                            const index = +d3.select(this).attr('data-index');
                            return index <= activeSection ? 1 : 0.1;
                        })
                        .transition()
                        .duration(300);
                }, 200);
            }
        }

        window.addEventListener('scroll', updateProgressCircle);
        updateProgressCircle();

        const handleResize = () => {
            const newWidth = containerRef.clientWidth - margin.left - margin.right;
            svg.attr('width', newWidth + margin.left + margin.right);
            xScale.range([0, newWidth]);
            updateProgressCircle();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', updateProgressCircle);
        };
    });
</script>

<div 
    bind:this={containerRef} 
    class="w-full p-4 transition-opacity duration-300"
    class:opacity-0={!isVisible}
    class:opacity-100={isVisible}
>
    <!-- SVG will be inserted here -->
</div>
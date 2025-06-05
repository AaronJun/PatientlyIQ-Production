<!-- WordNetwork.svelte -->
<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
  
    // Props
    export let data;
    
    let svg;
    let width = 1060;
    let height = 1000;
    let container;
  
    // Add console logs to debug
    $: {
        console.log("Received data:", data);
    }

    // Process data to create nodes and links
    function processData(data) {
        if (!data) return { nodes: [], links: [] };

        console.log("Processing data...");
        let nodes = [];
        let links = [];
        let terms = new Set();
        
        // Create disease nodes
        Object.keys(data).forEach(disease => {
            console.log("Processing disease:", disease);
            nodes.push({
                id: disease,
                type: 'disease',
                radius: 20
            });
            
            // Add term nodes and links
            if (Array.isArray(data[disease])) {
                data[disease].forEach(term => {
                    if (term.value >= 90) { // Only show high-value terms
                        if (!terms.has(term.text)) {
                            terms.add(term.text);
                            nodes.push({
                                id: term.text,
                                type: 'term',
                                radius: term.value / 10
                            });
                        }
                        
                        links.push({
                            source: disease,
                            target: term.text,
                            value: term.value
                        });
                    }
                });
            }
        });
        
        console.log("Processed nodes:", nodes);
        console.log("Processed links:", links);
        return { nodes, links };
    }
  
    onMount(() => {
        if (!data) return;
        
        console.log("Mounting component...");
        const { nodes, links } = processData(data);
        
        if (nodes.length === 0 || links.length === 0) {
            console.log("No nodes or links to display");
            return;
        }

        // Set width and height based on container
        const containerRect = container.getBoundingClientRect();
        width = containerRect.width;
        height = containerRect.height || 1250;
        
        // Clear any existing SVG content
        d3.select(svg).selectAll("*").remove();
      
        // Create force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(d => d.radius + 5));
  
        // Create SVG elements
        const svgElement = d3.select(svg)
            .attr('viewBox', [0, 0, width, height]);
  
        // Create links
        const link = svgElement.append('g')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.value) / 10);
  
        // Create nodes
        const node = svgElement.append('g')
            .selectAll('circle')
            .data(nodes)
            .join('circle')
            .attr('r', d => d.radius)
            .attr('fill', d => d.type === 'disease' ? '#ff6b6b' : '#4ecdc4')
            .call(drag(simulation));
  
        // Add labels
        const label = svgElement.append('g')
            .selectAll('text')
            .data(nodes)
            .join('text')
            .text(d => d.id)
            .attr('font-size', d => d.type === 'disease' ? '14px' : '12px')
            .attr('dx', d => d.radius + 5)
            .attr('dy', 4);
  
        // Update positions on simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
  
            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
  
            label
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
  
        // Implement drag behavior
        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            
            return d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }
    });
</script>
  
<div bind:this={container} class="w-full h-[600px]">
    <svg bind:this={svg} width="100%" height="100%"></svg>
</div>
  
<style>
    div {
        width: 100%;
        height: 100%;
    }
    
    svg {
        width: 100%;
        height: 100%;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
    }
    
    :global(svg text) {
        user-select: none;
        pointer-events: none;
    }
</style>
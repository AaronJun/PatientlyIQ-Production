<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import FivePetal from '@assets/8Petal.svg?raw';
  import "carbon-components-svelte/css/all.css";

  export let activeSection = 0;
  
  let svg;
  let width = 900;
  let height = 900;
  const TOTAL_CIRCLES = 569;
  const CIRCLE_RADIUS = 4;
  const NAV_CIRCLE_RADIUS = 2;
  const NAV_CIRCLE_ACTIVE_RADIUS = 4;
  const NAV_CIRCLE_COLOR = '#64748b';
  const NAV_CIRCLE_ACTIVE_COLOR = '#3b82f6';
  const STROKE_WIDTH = 1;
  const DEFAULT_STROKE = '#ffffff';
  const GROUND_Y = height * 0.8;
  let simulation;
  let currentFlower = null;
  let currentLine = null;
  
  const COLORS = {
    grey: '#64748b',
    neurology: '#3b82f6',
    metabolism: '#f97316',
    oncology: '#22c55e',
    hematology: '#a855f7',
    immunology: '#ec4899',
    ophthalmology: '#0ea5e9',
    dermatology: '#14b8a6',
    other: '#8b5cf6'
  };

  const SEGMENTS = [
    { end: 149, color: COLORS.neurology, stroke: '#1d4ed8', cluster: 0, name: 'Neurology', count: 149 },
    { end: 280, color: COLORS.metabolism, stroke: '#c2410c', cluster: 1, name: 'Metabolism', count: 131 },
    { end: 385, color: COLORS.oncology, stroke: '#15803d', cluster: 2, name: 'Oncology', count: 105 },
    { end: 417, color: COLORS.hematology, stroke: '#7e22ce', cluster: 3, name: 'Hematology', count: 32 },
    { end: 442, color: COLORS.immunology, stroke: '#be185d', cluster: 4, name: 'Immunology', count: 25 },
    { end: 464, color: COLORS.ophthalmology, stroke: '#0369a1', cluster: 5, name: 'Ophthalmology', count: 22 },
    { end: 485, color: COLORS.dermatology, stroke: '#0f766e', cluster: 6, name: 'Dermatology', count: 21 },
    { end: TOTAL_CIRCLES, color: COLORS.other, stroke: '#6d28d9', cluster: 7, name: 'Other', count: 84 }
  ];

  const rpdIncentives = [
    {
      iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "The Golden Ticket",
      description: "Sponsors are encouraged apply for an RPD designation early in the research process, as a designation expedites the review of a future voucher request."
    },
    {
      iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      title: "Research Incentive",
      description: "The PRV fast-tracks the review process for another drug; this essentially allows a sponsor to leverage one major success to accelerate approvals for another potential breakthrough."
    },
    {
      iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "Financial Incentive",
      description: "PRVs are transferable, and are sold for an average of $110M."
    }
  ];

  function cleanupGrowthAnimation() {
    if (currentFlower) {
      currentFlower
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();
      currentFlower = null;
    }
    
    if (currentLine) {
      currentLine
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();
      currentLine = null;
    }
  }

  function createNavigationIndicators() {
    const navGroup = svg.append('g')
      .attr('class', 'navigation-indicators')
      .attr('transform', `translate(${width - 180}, 30)`);

    const sections = [0, 1, 2, 3, 4, 5, 6];
    
    sections.forEach((_, i) => {
      navGroup.append('circle')
        .attr('class', `nav-circle-${i}`)
        .attr('cx', i * 20)
        .attr('cy', 0)
        .attr('r', NAV_CIRCLE_RADIUS)
        .attr('fill', NAV_CIRCLE_COLOR)
        .attr('stroke', 'none');
    });

    return navGroup;
  }

  function updateNavigationIndicators() {
    const sections = [0, 1, 2, 3, 4, 5, 6];
    sections.forEach((_, i) => {
      svg.select(`.nav-circle-${i}`)
        .transition()
        .duration(500)
        .attr('r', i === activeSection ? NAV_CIRCLE_ACTIVE_RADIUS : NAV_CIRCLE_RADIUS)
        .attr('fill', i === activeSection ? NAV_CIRCLE_ACTIVE_COLOR : NAV_CIRCLE_COLOR);
    });
  }

  function getClusterCenter(cluster) {
    const centers = [
      { x: width * 0.2, y: height * 0.3 },
      { x: width * 0.8, y: height * 0.3 },
      { x: width * 0.5, y: height * 0.4 },
      { x: width * 0.2, y: height * 0.5 },
      { x: width * 0.8, y: height * 0.5 },
      { x: width * 0.3, y: height * 0.7 },
      { x: width * 0.7, y: height * 0.7 },
      { x: width * 0.5, y: height * 0.8 }
    ];
    return centers[cluster];
  }

  function getRandomDelay() {
    return Math.random() * 500;
  }

  function getCluster(index) {
    for (let i = 0; i < SEGMENTS.length; i++) {
      if (index < SEGMENTS[i].end) return SEGMENTS[i].cluster;
    }
    return SEGMENTS[SEGMENTS.length - 1].cluster;
  }

  function getColor(index) {
    for (let i = 0; i < SEGMENTS.length; i++) {
      if (index < SEGMENTS[i].end) return SEGMENTS[i].color;
    }
    return SEGMENTS[SEGMENTS.length - 1].color;
  }

  function getStroke(index) {
    for (let i = 0; i < SEGMENTS.length; i++) {
      if (index < SEGMENTS[i].end) return SEGMENTS[i].stroke;
    }
    return SEGMENTS[SEGMENTS.length - 1].stroke;
  }

  function createIncentivesPanel() {
    const centerX = width / 2;
    const centerY = height / 2;
    const BOX_WIDTH = 220;
    const BOX_PADDING = 8;
    const BOX_SPACING = 20;
    const START_X = centerX - 300;
    
    const panel = svg.append('g')
      .attr('class', 'incentives-panel')
      .style('opacity', 1);

    function createBox(incentive, index, yPosition) {
      const line = panel.append('line')
        .attr('class', 'connecting-line')
        .attr('x1', START_X + BOX_WIDTH)
        .attr('y1', yPosition + 40)
        .attr('x2', START_X + BOX_WIDTH)
        .attr('y2', yPosition + 40)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 1)
        .style('opacity', 0);

      line.transition()
        .delay(index * 600)
        .duration(400)
        .style('opacity', 0.6)
        .attr('x2', centerX);

      const group = panel.append('g')
        .attr('class', `incentive-box-${index}`)
        .attr('transform', `translate(${START_X}, ${yPosition})`)
        .style('opacity', 0);

      const contentGroup = group.append('g')
        .attr('class', 'content');

      const background = contentGroup.append('rect')
        .attr('width', BOX_WIDTH)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', 'rgba(255, 255, 255, 0.962)')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 0.5);

      contentGroup.append('rect')
        .attr('width', BOX_WIDTH)
        .attr('height', 6)
        .attr('fill', '#3b82f6')
        .attr('rx', 4)
        .attr('ry', 4);

      contentGroup.append('svg')
        .attr('width', 16)
        .attr('height', 16)
        .attr('viewBox', '0 0 24 24')
        .attr('x', 16)
        .attr('y', 20)
        .append('path')
        .attr('d', incentive.iconPath)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');

      contentGroup.append('text')
        .attr('class', 'title-text')
        .attr('x', 40)
        .attr('y', 32)
        .attr('fill', '#2e2e2e')
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text(incentive.title);

      const words = incentive.description.split(' ');
      let currentLine = '';
      let yOffset = 55;
      const lineHeight = 16;
      const maxWidth = BOX_WIDTH - 32;

      const descriptionGroup = contentGroup.append('g')
        .attr('class', 'description');
      
      words.forEach((word, i) => {
        const testText = currentLine + (currentLine ? ' ' : '') + word;
        const tempText = contentGroup.append('text')
          .attr('class', 'temp')
          .attr('font-size', '.725rem')
          .text(testText);
        
        const length = tempText.node().getComputedTextLength();
        tempText.remove();

        if (length > maxWidth && currentLine) {
          descriptionGroup.append('text')
            .attr('x', 16)
            .attr('y', yOffset)
            .attr('fill', '#6f6f6f')
            .attr('font-size', '.725rem')
            .text(currentLine);
          
          currentLine = word;
          yOffset += lineHeight;
        } else {
          currentLine = testText;
        }

        if (i === words.length - 1) {
          descriptionGroup.append('text')
            .attr('x', 16)
            .attr('y', yOffset)
            .attr('fill', '#6f6f6f')
            .attr('font-size', '.725rem')
            .text(currentLine);
        }
      });

      const contentHeight = yOffset + lineHeight + BOX_PADDING;
      background.attr('height', contentHeight);

      group.transition()
        .delay(index * 600 + 200)
        .duration(400)
        .style('opacity', 1);

      return contentHeight;
    }

    let currentY = centerY - 200;
    rpdIncentives.forEach((incentive, i) => {
      const boxHeight = createBox(incentive, i, currentY);
      currentY += boxHeight + BOX_SPACING;
    });

    return panel;
  }

  function generateRadialPositions(count, centerX, centerY) {
    const positions = [];
    const ringSpacing = 30;
    let currentRing = 1;
    let circlesInCurrentRing = 0;
    let maxCirclesInRing = 12;

    for (let i = 0; i < count; i++) {
      if (circlesInCurrentRing >= maxCirclesInRing) {
        currentRing++;
        circlesInCurrentRing = 0;
        maxCirclesInRing = Math.floor(12 * currentRing);
      }

      const radius = currentRing * ringSpacing;
      const angle = (circlesInCurrentRing * (2 * Math.PI)) / maxCirclesInRing;

      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        r: CIRCLE_RADIUS,
        index: i,
        cluster: getCluster(i)
      });

      circlesInCurrentRing++;
    }

    return positions;
  }

  function animateDropToGround(circles) {
    const pileWidth = 400;
    const centerX = width / 2;
    const maxDelay = 800; // Maximum delay for staggered drops
    
    circles.each(function(d, i) {
      const circle = d3.select(this);
      const targetX = centerX - (pileWidth/2) + (Math.random() * pileWidth);
      const targetY = GROUND_Y - (Math.random() * 10);
      const delay = Math.random() * maxDelay; // Random delay for each circle
      
      circle
        .transition()
        .delay(delay)
        .duration(800)
        .ease(d3.easeQuadInOut)
        .attr('cx', targetX)
        .transition()
        .duration(1200)
        .ease(d3.easeBounceOut)
        .attr('cy', targetY);
    });
  }
  function createVerticalLine(x, y, targetY) {
    const line = svg.append('line')
      .attr('x1', x)
      .attr('y1', y)
      .attr('x2', x)
      .attr('y2', y)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', '2.5')
      .style('opacity', 0);

    line.transition()
      .duration(1000)
      .style('opacity', 1)
      .attr('y2', targetY)
      .on('end', () => {
        const flower = createFlower(x, targetY, '#4D4DFF');
      });

    return line;
  }

  function createFlower(x, y) {
    const flowerGroup = svg.append('g')
      .attr('class', 'flower')
      .attr('transform', `translate(${x}, ${y})`)
      .style('opacity', 1);
    
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(FivePetal, 'image/svg+xml');
    const flowerElement = svgDoc.documentElement;
    
    const viewBox = flowerElement.getAttribute('viewBox');
    const containerSize = CIRCLE_RADIUS * 40;
    
    const flowerSvg = flowerGroup.append('svg')
      .attr('viewBox', viewBox)
      .attr('width', containerSize)
      .attr('height', containerSize)
      .attr('x', -containerSize/2)
      .attr('y', -containerSize/2)
      .html(flowerElement.innerHTML);
    
    // Single animation for the flower
    flowerSvg.selectAll('*')
      .style('transform-origin', 'center')
      .style('transform', 'scale(0)')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .ease(d3.easeBackOut)
      .style('transform', 'scale(1)')
      .style('opacity', 1);
    
    return flowerGroup;
  }


  function createClusterLabels() {
    const labelGroup = svg.append('g')
      .attr('class', 'cluster-labels')
      .style('opacity', 0);

    SEGMENTS.forEach(segment => {
      const center = getClusterCenter(segment.cluster);
      const labelOffset = 50;
      
      const group = labelGroup.append('g')
        .attr('transform', `translate(${center.x - 40}, ${center.y + labelOffset})`);

      const bbox = { width: 100, height: 40 };
      
      group.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', bbox.width)
        .attr('height', bbox.height)
        .attr('fill', 'white')
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('opacity', 0.9);

      group.append('text')
        .attr('x', 5)
        .attr('y', 15)
        .attr('fill', segment.color)
        .attr('font-weight', '500')
        .text(segment.name);

      group.append('text')
        .attr('x', 5)
        .attr('y', 32)
        .attr('fill', '#1f2937')
        .text(segment.count + ' designations');
    });

    return labelGroup;
  }

  onMount(() => {
    svg = d3.select('#single-circle')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    createNavigationIndicators();

    svg.append('circle')
      .attr('class', 'main-circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', 20)
      .attr('fill', '#64748b')
      .attr('stroke', DEFAULT_STROKE)
      .attr('stroke-width', STROKE_WIDTH);

    const label = svg.append('g')
      .attr('class', 'label')
      .style('opacity', 0)
      .attr('transform', `translate(${width / 2 + 30}, ${height / 2})`);


    svg.append('g')
      .attr('class', 'additional-circles');

    createClusterLabels();

    return () => {
      if (simulation) simulation.stop();
      if (svg) svg.remove();
    };
  });

  $: if (svg && typeof activeSection !== 'undefined') {
    updateNavigationIndicators();

    if (simulation) simulation.stop();

    svg.select('.label')
      .transition()
      .duration(1000)
      .style('opacity', activeSection === 1 ? 1 : 0);

    svg.select('.cluster-labels')
      .transition()
      .duration(1000)
      .style('opacity', activeSection === 4 ? 1 : 0);

    let incentivesPanel = svg.select('.incentives-panel');
    if (incentivesPanel.empty() && activeSection === 1) {
      incentivesPanel = createIncentivesPanel();
    }
    
    incentivesPanel
      .transition()
      .duration(1000)
      .style('opacity', activeSection === 1 ? 1 : 0)
      .on('end', function() {
        if (activeSection !== 1) {
          d3.select(this).remove();
        }
      });

    const mainCircle = svg.select('.main-circle');
    if (activeSection >= 2) {
      mainCircle.transition()
        .duration(1000)
        .attr('r', CIRCLE_RADIUS)
        .style('opacity', 0)
        .remove();
    } else {
      mainCircle.transition()
        .duration(1000)
        .attr('r', activeSection >= 2 ? CIRCLE_RADIUS : 20)
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('fill', activeSection >= 3 ? getColor(0) : COLORS.grey)
        .attr('stroke', activeSection >= 3 ? getStroke(0) : DEFAULT_STROKE)
        .style('opacity', 1);
    }

    const circlesGroup = svg.select('.additional-circles');
    
    if (activeSection === 2) {
      const additionalCircles = generateRadialPositions(TOTAL_CIRCLES, width / 2, height / 2);
      
      circlesGroup.selectAll('circle').interrupt();
      
      const circles = circlesGroup.selectAll('circle')
        .data(additionalCircles);

      circles.enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 0)
        .attr('fill', COLORS.grey)
        .attr('stroke', DEFAULT_STROKE)
        .attr('stroke-width', STROKE_WIDTH)
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .attr('r', CIRCLE_RADIUS)
        .style('opacity', 1);

      circles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('fill', COLORS.grey)
        .attr('stroke', DEFAULT_STROKE)
        .attr('stroke-width', STROKE_WIDTH)
        .attr('r', CIRCLE_RADIUS);

      circles.exit().remove();

    } else if (activeSection === 3) {
      const additionalCircles = generateRadialPositions(TOTAL_CIRCLES, width / 2, height / 2);
      
      const circles = circlesGroup.selectAll('circle')
        .data(additionalCircles);

      circles.enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', CIRCLE_RADIUS)
        .attr('fill', COLORS.grey)
        .attr('stroke', DEFAULT_STROKE)
        .attr('stroke-width', STROKE_WIDTH);

      circlesGroup.selectAll('circle')
        .transition()
        .duration(1000)
        .attr('fill', (_, i) => getColor(i))
        .attr('stroke', (_, i) => getStroke(i));

    } else if (activeSection === 4) {
      const additionalCircles = generateRadialPositions(TOTAL_CIRCLES, width / 2, height / 2);
      
      const circles = circlesGroup.selectAll('circle')
        .data(additionalCircles);

      circles.enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', CIRCLE_RADIUS)
        .attr('fill', (_, i) => getColor(i))
        .attr('stroke', (_, i) => getStroke(i))
        .attr('stroke-width', STROKE_WIDTH);
      
      const nodes = Array.from(circlesGroup.selectAll('circle').nodes()).map((node, i) => ({
        x: parseFloat(node.getAttribute('cx')),
        y: parseFloat(node.getAttribute('cy')),
        cluster: getCluster(i),
        index: i
      }));

      simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX().x(d => getClusterCenter(d.cluster).x).strength(0.4))
        .force('y', d3.forceY().y(d => getClusterCenter(d.cluster).y).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-20))
        .force('collide', d3.forceCollide().radius(CIRCLE_RADIUS + 1).strength(0.9));

      simulation.on('tick', () => {
        circlesGroup.selectAll('circle')
          .attr('cx', d => nodes[d.index].x)
          .attr('cy', d => nodes[d.index].y);
      });

    } else if (activeSection === 5) {
      if (simulation) simulation.stop();
      const circles = circlesGroup.selectAll('circle');
      animateDropToGround(circles);
      
    }  else if (activeSection === 6) {
    if (simulation) simulation.stop();
    
    const circles = circlesGroup.selectAll('circle');
    
    // Keep circles in place and visible
    circles.each(function() {
      const circle = d3.select(this);
      // Ensure circles stay at their ground position
      circle.interrupt(); // Stop any ongoing transitions
    });

    // Create the line and flower while keeping circles visible
    const centerX = width / 2;
    const startY = GROUND_Y;
    const targetY = height / 2;
    
    createVerticalLine(centerX, startY, targetY);
    
    // Only fade out circles once flower animation is complete
    setTimeout(() => {
      circles.transition()
        .duration(500)
        .style('opacity', 0)
        .remove();
    }, 2000); // Adjust timing based on line + flower animation duration
    
  } else {
    // Handle reverse transitions
    if (activeSection < 6) {
      // Quick removal of flower and line when scrolling back
      svg.selectAll('.flower')
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();
      
      svg.selectAll('line')
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();

      // Ensure circles are cleaned up
      circlesGroup.selectAll('circle')
        .transition()
        .duration(500)
        .attr('r', 0)
        .remove();
    }
  }
}
</script>

<div id="single-circle"></div>

<style>
  #single-circle {
    width: 100%;
    height: 100%;
    background: white;
    position: relative;
    overflow: hidden;
  }

  :global(.label text) {
    font-size: 1px;
    font-weight: 500;
    font-family: 'IBM Plex Sans', sans-serif;
  }

  :global(.cluster-labels text) {
    font-size: 14px;
    font-family: 'IBM Plex Sans', sans-serif;
  }

  :global(.navigation-indicators circle) {
    transition: fill 0.3s ease, r 0.3s ease;
  }

  :global(.navigation-indicators circle:hover) {
    cursor: pointer;
    filter: brightness(1.2);
  }

  :global(.main-circle) {
    transition: all 0.3s ease;
  }

  :global(.additional-circles circle) {
    transition: fill 0.3s ease, stroke 0.3s ease;
  }

  :global(.cluster-labels rect) {
    filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1));
  }

  :global(.cluster-labels text) {
    user-select: none;
  }

  :global(.flower) {
    pointer-events: none;
  }

  :global(.flower path:hover) {
    cursor: pointer;
    transform: rotate(1deg);
  }

  :global(.incentives-panel) {
    filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1));
  }

  :global(.incentive-box-0),
  :global(.incentive-box-1),
  :global(.incentive-box-2) {
    transition: transform 0.2s ease-in-out;
  }

  :global(.connecting-line) {
    pointer-events: none;
  }

  :global(.title-text, .description text) {
    font-family: 'IBM Plex Sans', sans-serif;
  }
</style>
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
import * as d3 from 'd3';
import { getSentimentColor } from '$lib/utils';

export let data: Array<{
  ID: string;
  Persona: string;
  Action: string;
  Stage: string;
  Sentiment: string;
  Quote: string;
}> = [];

export let activeSentiment: string | null = null;
export let activeRectangle: { Sentiment: string } | null = null;

const dispatch = createEventDispatcher();
let container: HTMLDivElement;

const rectWidth = 7.5;
const rectHeight = 55;
const rectSpacing = 16;
const stageHeight = 100;
const lineColor = '#e0e0e0';
const totalHeight = 500;
const animationDuration = 500;
const iconSize = 10; // Size of the persona icon
const iconPadding = 26; // Padding between rectangle and icon
const lineSpacing = 10; // New constant for the space between line and rectangle

$: stages = [...new Set(data.map(d => d.Stage))];
$: stageData = stages.map(stage => data.filter(d => d.Stage === stage));

let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let allGroups: d3.Selection<d3.BaseType, any, SVGGElement, unknown>;

function getYPosition(index: number, total: number, isDescending: boolean, startY: number): number {
  const spacing = 8;
  const midpoint = Math.floor(total / 2);
  let yPos;

  if (isDescending) {
    yPos = index <= midpoint ? index * spacing : (total - index - 1) * spacing + 10;
  } else {
    yPos = index <= midpoint ? (midpoint - index) * spacing : (index - midpoint) * spacing - 25;
  }

  return startY + yPos + lineSpacing; // Add lineSpacing to the y position
}

function increaseSaturation(color: string): string {
  return d3.color(color)!.brighter(0.65).toString();
}

function handleInteraction(d: any, isHovered: boolean) {
  dispatch('eventUpdate', { data: d, isHovered });
}

function handleClick(d: any) {
  dispatch('rectangleClick', { data: d });
}

function updateGroups() {
  if (allGroups) {
    allGroups.each(function(d: any) {
      const group = d3.select(this);
      const rect = group.select('rect');
      const icon = group.select('.persona-icon');

      const isActive = activeRectangle === d;
      const isActiveSentiment = activeSentiment === null || d.Sentiment === activeSentiment;

      rect.transition()
        .duration(animationDuration)
        .attr('width', isActive ? rectWidth * 2.5 : (isActiveSentiment ? rectWidth * 1.75 : rectWidth))
        .attr('height', rectHeight)
        .attr('fill', () => {
          const baseColor = getSentimentColor(d.Sentiment);
          if (isActive) return increaseSaturation(baseColor);
          if (isActiveSentiment) return baseColor;
          return d3.color(baseColor)!.darker(0.5).toString();
        });

      const newRectWidth = parseFloat(rect.attr('width'));

      icon.transition()
        .duration(animationDuration)
        .attr('transform', () => {
          const iconX = newRectWidth / 2;
          const iconY = rectHeight + iconPadding;
          return `translate(${iconX}, ${iconY})`;
        })
        .attr('r', d.Persona === 'Patient' ? (isActive ? iconSize * 2.25 : iconSize) / 2 : null)
        .attr('width', d.Persona === 'Patient' ? null : (isActive ? iconSize * 1.25 : iconSize))
        .attr('height', d.Persona === 'Patient' ? null : (isActive ? iconSize * 1.25 : iconSize));
    });
  }
}

$: if (activeSentiment !== undefined || activeRectangle !== undefined) {
  updateGroups();
}

onMount(() => {
  svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', totalHeight);

  const centerY = totalHeight / 2.25;
  let xOffset = 0;
  let lastYPosition = centerY - rectHeight / 1;  // Initialize with the center position

  stageData.forEach((stage, stageIndex) => {
    const g = svg.append('g')
      .attr('transform', `translate(${xOffset}, 0)`);

    const isDescending = stageIndex % 2 === 0;
    const isLabelAbove = isDescending;
    const labelY = isLabelAbove ? centerY - rectHeight / 1 - stageHeight / 2 : centerY + rectHeight / .5 + stageHeight / 1;

    g.append('text')
      .attr('x', (stage.length * (rectWidth + rectSpacing)) / 2)
      .attr('y', labelY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(stages[stageIndex]);

    g.selectAll('line')
      .data(stage)
      .enter()
      .append('line')
      .attr('x1', (d, i) => i * (rectWidth + rectSpacing) + rectWidth / 2)
      .attr('y1', isLabelAbove ? labelY + stageHeight / 2 : labelY - stageHeight / 2)
      .attr('x2', (d, i) => i * (rectWidth + rectSpacing) + rectWidth / 2)
      .attr('y2', (d, i) => getYPosition(i, stage.length, isDescending, lastYPosition) - lineSpacing) // Subtract lineSpacing here
      .attr('stroke', lineColor)
      .attr('stroke-width', 1);

    const groups = g.selectAll('.item-group')
      .data(stage)
      .enter()
      .append('g')
      .attr('class', 'item-group')
      .attr('transform', (d, i) => {
        const x = i * (rectWidth + rectSpacing);
        const y = getYPosition(i, stage.length, isDescending, lastYPosition);
        return `translate(${x}, ${y})`;
      });

      groups.append('rect')
    .attr('width', rectWidth)
    .attr('height', rectHeight)
    .attr('fill', d => getSentimentColor(d.Sentiment))
    .attr('stroke', 'blue')
    .attr('stroke-width', .25)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      handleInteraction(d, true);
    })
    .on('mouseout', function(d) {
      handleInteraction(d, false);
    })
    .on('click', (event, d) => {
      handleClick(d);
    });

    groups.append(d => d.Persona === 'Patient' ? 
      document.createElementNS('http://www.w3.org/2000/svg', 'circle') : 
      document.createElementNS('http://www.w3.org/2000/svg', 'rect'))
      .attr('class', 'persona-icon')
      .attr('fill', d => d.Persona === 'Patient' ? '#36466B' : '#F56900')
      .attr('r', d => d.Persona === 'Patient' ? iconSize / 2 : null)
      .attr('width', d => d.Persona === 'Patient' ? null : iconSize)
      .attr('height', d => d.Persona === 'Patient' ? null : iconSize)
      .attr('transform', () => {
        const iconX = rectWidth / 2;
        const iconY = rectHeight + iconPadding;
        return `translate(${iconX}, ${iconY})`;
      });

    // Update lastYPosition for the next stage
    lastYPosition = getYPosition(stage.length - 1, stage.length, isDescending, lastYPosition);

    xOffset += (stage.length * (rectWidth + rectSpacing)) + 10; // 10px gap between stages
  });

  allGroups = svg.selectAll('.item-group');

  svg.attr('width', xOffset);
  updateGroups();
});
</script>

<div bind:this={container} class="timeline"></div> 

<style>
.timeline {
  width: 100%;
  height: 500px;
  padding-left: 1rem;
  margin-left: 2.25rem;
  scrollbar-color: #f15515;
}
</style>
<script lang="ts">
    import * as Carousel from "$lib/components/ui/carousel";
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    
    export let patients = [];
    
    let currentPatient = 0;
    let currentCard = 0;
    
    $: patient = patients[currentPatient];
    $: card = patient?.cards[currentCard];
    
    function createSentimentGauge(node, value) {
      const width = 200;
      const height = 100;
      const radius = Math.min(width, height) / 2;
      
      const svg = d3.select(node)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
        
      const g = svg.append('g')
        .attr('transform', `translate(${width/2},${height})`);
      
      const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);
        
      const scale = d3.scaleLinear()
        .domain([0, 100])
        .range([-Math.PI / 2, Math.PI / 2]);
        
      g.append('path')
        .datum({endAngle: scale(value)})
        .style('fill', d3.interpolateRdYlBu(value/100))
        .attr('d', arc);
        
      return {
        update(newValue) {
          g.select('path')
            .datum({endAngle: scale(newValue)})
            .style('fill', d3.interpolateRdYlBu(newValue/100))
            .attr('d', arc);
        }
      };
    }
    
    function createTopicsChart(node, topics) {
      const margin = {top: 20, right: 20, bottom: 30, left: 90};
      const width = 400 - margin.left - margin.right;
      const height = 200 - margin.top - margin.bottom;
      
      const svg = d3.select(node)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
        
      const x = d3.scaleLinear()
        .range([0, width]);
        
      const y = d3.scaleBand()
        .range([height, 0])
        .padding(0.1);
        
      x.domain([0, d3.max(topics, d => d.value)]);
      y.domain(topics.map(d => d.topic));
      
      svg.selectAll('.bar')
        .data(topics)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('height', y.bandwidth())
        .attr('y', d => y(d.topic))
        .attr('width', d => x(d.value))
        .attr('fill', '#4F46E5');
        
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
        
      svg.append('g')
        .call(d3.axisLeft(y));
        
      return {
        update(newTopics) {
          x.domain([0, d3.max(newTopics, d => d.value)]);
          y.domain(newTopics.map(d => d.topic));
          
          const bars = svg.selectAll('.bar')
            .data(newTopics);
            
          bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .merge(bars)
            .transition()
            .duration(750)
            .attr('x', 0)
            .attr('width', d => x(d.value))
            .attr('y', d => y(d.topic))
            .attr('height', y.bandwidth());
            
          bars.exit().remove();
          
          svg.select('.x.axis')
            .transition()
            .duration(750)
            .call(d3.axisBottom(x));
            
          svg.select('.y.axis')
            .transition()
            .duration(750)
            .call(d3.axisLeft(y));
        }
      };
    }
  </script>
  
  <Carousel.Root>
    <Carousel.Content>
      {#each patients as patient, i}
        <Carousel.Item>
          <div class="p-6 bg-white rounded-lg shadow">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <img 
                  src={patient.img} 
                  alt={patient.name}
                  class="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div>
                <h2 class="text-2xl font-bold mb-2">{patient.name}</h2>
                <div class="flex gap-4 text-sm text-gray-600 mb-4">
                  <span>{patient.age}</span>
                  <span>{patient.disease}</span>
                  <span>{patient.persona}</span>
                </div>
                
                {#if patient.cards[currentCard]}
                  <div class="text-xl font-medium text-gray-800 mb-6">
                    "{patient.cards[currentCard].quote}"
                  </div>
                  
                  {#if patient.cards[currentCard].sentiment}
                    <div class="mb-6">
                      <div use:createSentimentGauge={patient.cards[currentCard].sentiment}></div>
                    </div>
                  {/if}
                  
                  {#if patient.cards[currentCard].topics}
                    <div use:createTopicsChart={patient.cards[currentCard].topics}></div>
                  {/if}
                {/if}
              </div>
            </div>
            
            <!-- Card Navigation -->
            <div class="flex justify-center gap-2 mt-6">
              {#each patient.cards as card, cardIndex}
                <button
                  class="px-3 py-1 rounded-full {cardIndex === currentCard ? 'bg-indigo-600 text-white' : 'bg-gray-200'}"
                  on:click={() => currentCard = cardIndex}
                >
                  {card.type}
                </button>
              {/each}
            </div>
          </div>
        </Carousel.Item>
      {/each}
    </Carousel.Content>
    <Carousel.Previous />
    <Carousel.Next />
  </Carousel.Root>
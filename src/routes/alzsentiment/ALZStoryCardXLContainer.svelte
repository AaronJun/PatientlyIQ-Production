<!-- ALZStoryCardXL.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let patient: {
        id: string;
        name: string;
        age: string;
        disease: string;
        persona: string;
        img: string;
        cards: {
            type: string;
            quote: string;
            context: string;
            sentiment: number;
            topics: { topic: string; value: number; }[];
        }[];
    };
    export let currentCard = 0;
    
    let sentimentGauge: HTMLDivElement;
    let topicsChart: HTMLDivElement;
    
    onMount(() => {
        if (patient?.cards[currentCard]) {
            updateVisualizations();
        }
    });
    
    $: if (patient?.cards[currentCard]) {
        updateVisualizations();
    }
    
    function updateVisualizations() {
        const card = patient.cards[currentCard];
        if (sentimentGauge && typeof card.sentiment === 'number') {
            createSentimentGauge(card.sentiment);
        }
        if (topicsChart && card.topics) {
            createTopicsChart(card.topics);
        }
    }
    
    function createSentimentGauge(value: number) {
        const width = 200;
        const height = 100;
        const radius = Math.min(width, height) / 2;
        
        d3.select(sentimentGauge).selectAll("*").remove();
        
        const svg = d3.select(sentimentGauge)
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
            .datum({endAngle: Math.PI / 2})
            .style('fill', '#f3f4f6')
            .attr('d', arc);
            
        g.append('path')
            .datum({endAngle: scale(value)})
            .style('fill', d3.interpolateRdYlBu(value/100))
            .attr('d', arc);
            
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-1em')
            .style('font-size', '24px')
            .text(`${value}%`);
    }
    
    function createTopicsChart(topics: { topic: string; value: number; }[]) {
        const margin = {top: 20, right: 20, bottom: 30, left: 120};
        const width = 400 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;
        
        d3.select(topicsChart).selectAll("*").remove();
        
        const svg = d3.select(topicsChart)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
            
        const x = d3.scaleLinear()
            .range([0, width])
            .domain([0, d3.max(topics, d => d.value) || 0]);
            
        const y = d3.scaleBand()
            .range([height, 0])
            .padding(0.1)
            .domain(topics.map(d => d.topic));
            
        svg.selectAll('.bar')
            .data(topics)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('height', y.bandwidth())
            .attr('y', d => y(d.topic) || 0)
            .attr('width', d => x(d.value))
            .attr('fill', '#4F46E5')
            .attr('opacity', 0.8);
            
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));
            
        svg.append('g')
            .call(d3.axisLeft(y));
    }
</script>

<div class="card">
    {#if patient}
    <div class="content-grid">
        <div class="profile-section">
            <img 
                src={patient.img} 
                alt={patient.name}
                class="profile-image"
            />
            <div class="profile-info">
                <h2>{patient.name}</h2>
                <p>{patient.age} • {patient.disease}</p>
                <p class="persona">{patient.persona}</p>
            </div>
        </div>
        
        <div class="card-navigation">
            {#each patient.cards as card, i}
                <button 
                    class="nav-button {currentCard === i ? 'active' : ''}"
                    on:click={() => currentCard = i}
                >
                    {card.type}
                </button>
            {/each}
        </div>
        
        {#if patient.cards[currentCard]}
            <div class="card-content">
                <div class="quote-section">
                    <blockquote>
                        {patient.cards[currentCard].quote}
                    </blockquote>
                    <p class="context">{patient.cards[currentCard].context}</p>
                </div>
                
                <div class="metrics-section">
                    <div class="sentiment-gauge" bind:this={sentimentGauge}></div>
                    <div class="topics-chart" bind:this={topicsChart}></div>
                </div>
            </div>
        {/if}
    </div>
    {/if}
</div>

<style>
    .card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }
    
    .content-grid {
        display: grid;
        gap: 2rem;
    }
    
    .profile-section {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
    
    .profile-image {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
    }
    
    .profile-info h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
    }
    
    .persona {
        color: #666;
        font-size: 0.875rem;
    }
    
    .card-navigation {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }
    
    .nav-button {
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        background: #f3f4f6;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .nav-button.active {
        background: #4F46E5;
        color: white;
    }
    
    .card-content {
        display: grid;
        gap: 2rem;
    }
    
    .quote-section blockquote {
        font-size: 1.25rem;
        color: #1a1a1a;
        font-style: italic;
        margin: 0 0 1rem 0;
        padding-left: 1rem;
        border-left: 4px solid #4F46E5;
    }
    
    .context {
        color: #666;
        font-size: 0.875rem;
    }
    
    .metrics-section {
        display: grid;
        gap: 2rem;
    }
    
    .sentiment-gauge, .topics-chart {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 0.5rem;
    }
</style>
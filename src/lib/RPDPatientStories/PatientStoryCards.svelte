<!-- PatientCard.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let name: string = "Timothy K.";
    export let age: string = "Mid-50s";
    export let disease: string = "APOE4/4 Carrier";
    export let persona: string = "Working professional";
    export let photoUrl: string =  '$lib/assets/profiles/timothyK.jpg';
    export let quote: string = "Managing my condition while balancing work and family life has been challenging.";
    export let metrics = {
        treatmentAdherence: 85,
        qualityOfLife: 75,
        symptomsControl: 80
    };

    let metricsContainer: HTMLElement;
    
    // D3 visualization setup
    onMount(() => {
        const width = 120;
        const height = 120;
        const radius = Math.min(width, height) / 2;
        
        // Create SVG
        const svg = d3.select(metricsContainer)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);
            
        // Create arc generator
        const arc = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius);
            
        // Create pie generator
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);
            
        // Prepare data
        const data = Object.entries(metrics).map(([key, value]) => ({
            key,
            value
        }));    
        
        // Add paths
        const paths = svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', (d, i) => d3.schemeCategory10[i])
            .attr('opacity', 0.8)
            .on('mouseover', function() {
                d3.select(this)
                    .attr('opacity', 1)
                    .attr('transform', 'scale(1.05)');
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('opacity', 0.8)
                    .attr('transform', 'scale(1)');
            });
    });

    function handleClick() {
        dispatch('click');
    }
</script>

<div 
    class="card"
    on:click={handleClick}
    transition:fade
>
    <div class="card-content">
        <!-- Photo Circle -->
        <div class="photo-container">
            <div class="photo-circle">
                <img
                    src={photoUrl}
                    alt={name}
                    class="profile-image"
                />
                <div class="hover-overlay"></div>
            </div>
        </div>

        <!-- Patient Information -->
        <div class="info-container">
            <div class="header">
                <h3>{name}</h3>
                <p class="subtitle">Age {age} • {disease}</p>
            </div>
            
            <p class="persona">{persona}</p>

            <!-- Quote -->
            <div class="quote">
                <svg class="quote-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path 
                        fill="currentColor" 
                        d="M10 11v6H6v-6h4zm8 0v6h-4v-6h4zm-8-8v6H6V3h4zm8 0v6h-4V3h4z"
                    />
                </svg>
                <p>{quote}</p>
            </div>

            <!-- D3 Metrics Visualization -->
            <div bind:this={metricsContainer} class="metrics-container"></div>
        </div>
    </div>
</div>

<style>
    .card {
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        max-width: 32rem;
        width: 100%;
        overflow: hidden;
    }

    .card:hover {
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        transform: translateY(-2px);
    }

    .card-content {
        padding: 1.5rem;
        display: flex;
        gap: 1rem;
        align-items: flex-start;
    }

    .photo-container {
        flex-shrink: 0;
    }

    .photo-circle {
        width: 4.5rem;
        height: 4.5rem;
        border-radius: 100%;
        border: 2.5px solid #ff5151;
        overflow: hidden;
        position: relative;
    }

    .profile-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s ease;
    }

    .hover-overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 81, 81, 0);
        transition: background-color 0.2s ease;
        border-radius: 50%;
    }

    .photo-circle:hover .hover-overlay {
        background: rgba(255, 81, 81, 0.3);
    }

    .photo-circle:hover .profile-image {
        transform: scale(1.1);
    }

    .info-container {
        flex: 1;
    }

    .header h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
    }

    .subtitle {
        font-size: 0.875rem;
        color: #666;
        margin-top: 0.25rem;
    }

    .persona {
        font-size: 0.875rem;
        color: #4b5563;
        margin-top: 0.5rem;
    }

    .quote {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
        color: #4b5563;
        font-style: italic;
        font-size: 0.875rem;
    }

    .quote-icon {
        flex-shrink: 0;
        color: #ff5151;
        margin-top: 0.25rem;
    }

    .metrics-container {
        margin-top: 1rem;
        display: flex;
        justify-content: center;
    }
</style>
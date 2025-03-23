<!-- ChartCard.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { ArrowUpRight } from 'carbon-icons-svelte';
    
    export let title: string = '';
    export let description: string = '';
    export let image: string = '';
    export let chartComponent: any = null;
    export let chartProps: any = {};
    export let actionButtonText: string = '';
    export let actionButtonDestination: string = '';
    
    const dispatch = createEventDispatcher();
    
    function handleCardClick() {
        // Dispatch event to parent
        dispatch('open', { 
            title, 
            description, 
            chartComponent, 
            chartProps, 
            actionButtonText, 
            actionButtonDestination 
        });
    }
</script>

<div class="card-container h-full" 
     role="button" 
     tabindex="0" 
     on:click={handleCardClick} 
     on:keydown={(e) => e.key === 'Enter' && handleCardClick()}
     aria-labelledby="card-title-{title.replace(/\s+/g, '-')}"
     aria-describedby="card-desc-{title.replace(/\s+/g, '-')}">
    <div class="card-content h-full flex flex-col justify-between">
        <h3 class="title" 
            id="card-title-{title.replace(/\s+/g, '-')}">{title}</h3>
        <div class="chart-container">
            {#if chartComponent}
                <div class="preview-chart">
                    <svelte:component this={chartComponent} {...chartProps} /> 
                </div>
            {:else if image}
                <img src={image} alt={title} />
            {/if}
        </div>
        <p id="card-desc-{title.replace(/\s+/g, '-')}" class="description">
            {description}
        </p>
        <div class="view-details">
            <span>Click to view details</span>
            <ArrowUpRight class="w-4 h-4" />
        </div>
    </div>
</div>

<style>
    :global(.card) {
        padding: 1.25rem;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.06);
        height: 100%;
        width: 100%;
        max-width:345px;

        transition: all 0.3s ease;
    }

    :global(.card:hover) {
        filter: brightness(1.05);
        transform: translateY(-5px);
    }

    :global(.card:focus) {
        outline: 2px solid #6EE999;
        outline-offset: 2px;
        transform: translateY(-5px);
    }
    
    .card-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 100%;
        cursor: pointer;
    }
    
    .title {
        font-size: 0.875rem;
        font-weight: 600;
        text-transform: capitalize;
        color: #1e293b;
        margin: 0;
    }
    
    .chart-container {
        aspect-ratio: 2 / 1;
        width: 100%;
        background-color: #f9fafb;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 12px;
        overflow: hidden;
    }
    
    .chart-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .preview-chart {
        width: 100%;
        height: 100%;
        background-color: #f8fafc;
        border-radius: 12px;
        overflow: hidden;
    }
    
    .description {
        font-size: 0.875rem;
        color: #475569;
        margin: 0;
    }

    .view-details {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #059669;
        margin-top: auto;
    }
    
    :global(.group:hover) .view-details {
        color: #f97316;
    }
</style> 
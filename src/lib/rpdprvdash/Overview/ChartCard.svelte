<!-- ChartCard.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { ArrowRight } from 'carbon-icons-svelte';
    
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

<div class="card" 
     role="button" 
     tabindex="0" 
     on:click={handleCardClick} 
     on:keydown={(e) => e.key === 'Enter' && handleCardClick()}
     aria-labelledby="card-title-{title.replace(/\s+/g, '-')}"
     aria-describedby="card-desc-{title.replace(/\s+/g, '-')}">
    <div class="card-content">
        <h3 class="text-sm font-semibold capitalize text-slate-800 mb-8" 
            id="card-title-{title.replace(/\s+/g, '-')}">{title}</h3>
        <div class="image-container">
            {#if chartComponent}
                <div class="preview-chart">
                    <svelte:component this={chartComponent} {...chartProps} width={320} height={150} />
                </div>
            {:else if image}
                <img src={image} alt={title} />
            {/if}
        </div>
        <p id="card-desc-{title.replace(/\s+/g, '-')}" class="text-left text-sm text-slate-600 font-normal">
            {description}
        </p>
        <div class="view-details flex flex-row gap-2 items-center text-sm font-medium text-emerald-600 hover:text-orange-500">
            <span>View Details</span>
            <ArrowRight class="w-4 h-4" />
        </div>
    </div>
</div>

<style>
    :global(.card) {
        border-radius: 18px;
        padding: 1rem 1rem 0 1rem;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.06);
        height: 100%;
        width: 360px;
        border: 1px solid rgba(229, 231, 235, 0.8); /* Subtle border for card edge definition */
    }
    
    :global(.card:hover) {
        filter: brightness(1.05);
        transition: filter 0.3s ease;
    }
    
    .card-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        cursor: pointer;
        position: relative;
        z-index: 1;
    }
    
    .image-container {
        height: 180px;
        width: 360px;
        overflow: hidden;
        background-color: #f9fafb;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }
    
    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        overflow: hidden;
        border-radius: 18px;
    }
    
    .preview-chart {
        width: 100%;
        height: 100%;
    }
    
    .card:hover .preview-chart {
        transform: scale(1);
    }

    .view-details {
        transition: transform 0.2s ease;
    }
</style> 
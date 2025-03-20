<!-- ChartCard.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
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

<div class="card">
    <div class="card-content" on:click={handleCardClick}>
        <div class="image-container">
            {#if chartComponent}
                <div class="preview-chart">
                    <svelte:component this={chartComponent} {...chartProps} width={280} height={150} />
                </div>
            {:else if image}
                <img src={image} alt={title} />
            {/if}
        </div>
        <div class="card-text">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
        <div class="view-details">
            <span>View Details</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
            </svg>
        </div>
    </div>
</div>

<style>
    .card {
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.06);
        height: 100%;
        transition: transform 0.3s, box-shadow 0.3s;
        overflow: hidden;
        position: relative; /* For 3D perspective effect */
        transform-style: preserve-3d;
        backface-visibility: hidden;
        border: 1px solid rgba(229, 231, 235, 0.8); /* Subtle border for card edge definition */
    }
    
    .card:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15), 0 6px 15px rgba(0, 0, 0, 0.1);
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
        height: 180px; /* Increased from 150px */
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
    }
    
    .preview-chart {
        transform: scale(0.95);
        transform-origin: center;
        width: 100%;
        height: 100%;
        transition: transform 0.3s ease;
    }
    
    .card:hover .preview-chart {
        transform: scale(1);
    }
    
    .card-text {
        padding: 20px 20px 12px; /* Increased padding */
        flex: 1;
    }
    
    .card-text h3 {
        margin: 0 0 10px;
        font-size: 18px; /* Increased from 16px */
        font-weight: 600;
        color: #111827;
    }
    
    .card-text p {
        margin: 0;
        font-size: 15px; /* Increased from 14px */
        color: #6b7280;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.4;
    }
    
    .view-details {
        display: flex;
        align-items: center;
        gap: 6px; /* Increased from 4px */
        padding: 0 20px 20px; /* Increased padding */
        font-size: 15px; /* Increased from 14px */
        font-weight: 500;
        color: #4f46e5;
        transition: transform 0.2s ease;
    }
    
    .card:hover .view-details {
        transform: translateX(5px);
    }
    
    @media (max-width: 768px) {
        .card-text h3 {
            font-size: 16px;
        }
        
        .card-text p {
            font-size: 14px;
        }
        
        .view-details {
            font-size: 14px;
        }
    }
</style> 
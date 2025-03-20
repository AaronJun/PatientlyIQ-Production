<!-- ChartCard.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { scale, fade } from 'svelte/transition';
    
    export let title: string = '';
    export let description: string = '';
    export let image: string = '';
    export let chartComponent: any = null;
    export let chartProps: any = {};
    export let actionButtonText: string = '';
    export let actionButtonDestination: string = '';
    
    let isModalOpen = false;
    let cardElement: HTMLElement;
    let modalContent: HTMLElement;
    
    const dispatch = createEventDispatcher();
    
    function openModal() {
        isModalOpen = true;
        dispatch('open', { title, description });
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    function closeModal() {
        isModalOpen = false;
        document.body.style.overflow = ''; // Restore scrolling
        dispatch('close');
    }
    
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    }
    
    function handleOutsideClick(e: MouseEvent) {
        if (isModalOpen && modalContent && !modalContent.contains(e.target as Node)) {
            closeModal();
        }
    }
    
    function handleActionButtonClick() {
        closeModal();
        dispatch('action', { destination: actionButtonDestination });
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="card" bind:this={cardElement}>
    <div class="card-content" on:click={openModal}>
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

{#if isModalOpen}
    <div 
        class="modal-overlay" 
        transition:fade={{ duration: 200 }}
        on:click={handleOutsideClick}
    >
        <div 
            class="modal-content" 
            bind:this={modalContent}
            transition:scale={{ duration: 300, start: 0.95 }}
        >
            <div class="modal-header">
                <h2>{title}</h2>
                <button class="close-button" on:click={closeModal} aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body">
                <p class="description">{description}</p>
                
                <div class="full-chart">
                    {#if chartComponent}
                        <svelte:component this={chartComponent} {...chartProps} width={800} height={500} />
                    {:else if image}
                        <img src={image} alt={title} class="full-image" />
                    {/if}
                </div>
                
                {#if actionButtonText && actionButtonDestination}
                    <div class="action-button-container">
                        <button 
                            class="action-button" 
                            on:click={handleActionButtonClick}
                        >
                            {actionButtonText}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 12h14"></path>
                                <path d="M12 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .card {
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.03);
        height: 100%;
        transition: transform 0.2s, box-shadow 0.2s;
        overflow: hidden;
    }
    
    .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08), 0 3px 8px rgba(0, 0, 0, 0.06);
    }
    
    .card-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        cursor: pointer;
    }
    
    .image-container {
        height: 150px;
        overflow: hidden;
        background-color: #f9fafb;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .preview-chart {
        transform: scale(0.9);
        transform-origin: center;
        width: 100%;
        height: 100%;
    }
    
    .card-text {
        padding: 16px 16px 8px;
        flex: 1;
    }
    
    .card-text h3 {
        margin: 0 0 8px;
        font-size: 16px;
        font-weight: 600;
        color: #111827;
    }
    
    .card-text p {
        margin: 0;
        font-size: 14px;
        color: #6b7280;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .view-details {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 0 16px 16px;
        font-size: 14px;
        font-weight: 500;
        color: #4f46e5;
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background-color: white;
        border-radius: 8px;
        width: 90%;
        max-width: 900px;
        max-height: 90vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
    }
    
    .close-button {
        background: none;
        border: none;
        cursor: pointer;
        color: #6b7280;
        transition: color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
    }
    
    .close-button:hover {
        color: #111827;
    }
    
    .modal-body {
        padding: 24px;
        overflow-y: auto;
    }
    
    .description {
        margin: 0 0 24px;
        color: #4b5563;
        line-height: 1.5;
    }
    
    .full-chart {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
    }
    
    .full-image {
        max-width: 100%;
        border-radius: 4px;
    }
    
    .action-button-container {
        display: flex;
        justify-content: center;
        margin-top: 16px;
    }
    
    .action-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background-color: #4f46e5;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 500;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .action-button:hover {
        background-color: #4338ca;
    }
    
    .action-button:active {
        background-color: #3730a3;
    }
    
    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
        }
        
        .full-chart :global(svg) {
            max-width: 100%;
            height: auto;
        }
        
        .action-button {
            padding: 8px 16px;
            font-size: 14px;
        }
    }
</style> 
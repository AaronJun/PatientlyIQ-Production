<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let tabs: {
        id: string;
        label: string;
        imageUrl: string;
    }[];
    export let activeTab: string;

    const dispatch = createEventDispatcher();

    function selectTab(tabId: string) {
        dispatch('select', tabId);
    }
</script>

<nav class="circle-nav">
    {#each tabs as tab}
        <button
            class="circle-button"
            class:active={activeTab === tab.id}
            on:click={() => selectTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
        >
            <img 
                src={tab.imageUrl} 
                alt={tab.label}
                class="circle-image"
            />
            <div class="button-overlay" />
            <span class="button-label">{tab.label}</span>
        </button>
    {/each}
</nav>

<style>
    .circle-nav {
        display: flex;
        gap: 2rem;
        justify-content: center;
        padding: 2rem;
    }

    .circle-button {
        position: relative;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 3px solid #ff5151;
        background: none;
        cursor: pointer;
        padding: 0;
        overflow: hidden;
        transition: transform 0.2s ease;
    }

    .circle-button:hover {
        transform: scale(1.05);
    }

    .circle-button.active {
        border-color: #ff2b2b;
        box-shadow: 0 0 15px rgba(255, 81, 81, 0.3);
    }

    .circle-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .button-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 81, 81, 0);
        transition: background-color 0.2s ease;
    }

    .circle-button:hover .button-overlay {
        background: rgba(255, 81, 81, 0.2);
    }

    .button-label {
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.875rem;
        color: #666;
        white-space: nowrap;
    }
</style>
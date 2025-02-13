<!-- RPDDBreadcrumb.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let year: string = "2023";
    export let selectedArea: string | null = null;
    
    const dispatch = createEventDispatcher<{
        clear: void;
        yearClick: string;
        areaClick: string;
    }>();

    function handleReset() {
        dispatch('clear');
    }

    function handleYearClick() {
        dispatch('yearClick', year);
    }

    function handleAreaClick() {
        if (selectedArea) {
            dispatch('areaClick', selectedArea);
        }
    }
</script>

<nav class="flex items-center space-x-2 font-mono text-sm text-slate-600 mb-6">
    <button
        class="hover:text-orange-500 transition-colors duration-200"
        on:click={handleReset}
    >
        RPDD Explorer
    </button>

    {#if year}
        <span class="text-slate-600">|</span>
        <button
            class="hover:text-orange-500 transition-colors duration-200"
            on:click={handleYearClick}
        >
            {year}
        </button>
    {/if}

    {#if selectedArea}
        <span class="text-slate-600">|</span>
        <button
            class="hover:text-orange-500 transition-colors duration-200"
            on:click={handleAreaClick}
        >
            {selectedArea}
        </button>
    {/if}
</nav>

<style>
    button {
        padding: 0;
        background: none;
        border: none;
        cursor: pointer;
        font-weight: 500;
    }

    button:focus {
        outline: none;
    }

    button:focus-visible {
        outline: 2px solid #FF6B6B;
        outline-offset: 2px;
    }
</style>
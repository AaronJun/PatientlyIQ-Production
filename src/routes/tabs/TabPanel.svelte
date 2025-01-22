<script lang="ts">
    import { fade } from 'svelte/transition';
    
    export let id: string;
    export let activeId: string;
</script>

{#if activeId === id}
    <div 
        class="tab-content"
        transition:fade={{duration: 150}}
        role="tabpanel"
    >
        <slot />
    </div>
{/if}

<style>
    .tab-content {
        background: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
</style>
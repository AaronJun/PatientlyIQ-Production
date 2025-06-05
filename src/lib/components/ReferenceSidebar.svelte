<script lang="ts">
    import { onMount } from 'svelte';

    export let references: Array<{
        id: string;
        text: string;
        url: string;
        date: string;
    }>;

    let isDrawerOpen = false;
    let hoverTimeout: NodeJS.Timeout;
    let drawerElement: HTMLElement;

    onMount(() => {
        const footnotes = document.querySelectorAll('.footnote');
        
        footnotes.forEach(footnote => {
            const refId = footnote.getAttribute('data-ref');
            if (refId) {
                const reference = document.getElementById(refId);
                
                if (reference) {
                    footnote.addEventListener('mouseenter', () => {
                        // Clear any existing timeout
                        if (hoverTimeout) {
                            clearTimeout(hoverTimeout);
                        }
                        
                        // Open drawer immediately
                        isDrawerOpen = true;
                        
                        // Highlight the reference
                        reference.classList.add('bg-slate-100');
                    });
                    
                    footnote.addEventListener('mouseleave', () => {
                        // Remove highlight immediately
                        reference.classList.remove('bg-slate-100');
                        
                        // Close drawer after a short delay
                        hoverTimeout = setTimeout(() => {
                            isDrawerOpen = false;
                        }, 300);
                    });
                }
            }
        });
    });

    function handleDrawerMouseEnter() {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        isDrawerOpen = true;
    }

    function handleDrawerMouseLeave() {
        hoverTimeout = setTimeout(() => {
            isDrawerOpen = false;
        }, 300);
    }
</script>

<div 
    bind:this={drawerElement}
    class="reference-drawer fixed top-0 right-0 h-100 bg-slate-100 shadow-sm border-l-2 border-emerald-800 transition-transform duration-300 ease-in-out z-50"
    class:drawer-open={isDrawerOpen}
    class:drawer-closed={!isDrawerOpen}
    on:mouseenter={handleDrawerMouseEnter}
    on:mouseleave={handleDrawerMouseLeave}
>
    <!-- Visible tab when drawer is closed -->
    <div class="drawer-tab absolute left-0 bottom-1/4 pr-4 pl-4 transform -translate-y-1/2 -translate-x-full">
        <div class="text-slate-800 text-xs font-semibold">
            References
        </div>
    </div>
    
    <!-- Drawer content -->
    <div class="drawer-content p-6 pt-12 h-full max-h-screen overflow-y-auto">
        <h3 class="font-semibold text-sm text-slate-500 mb-4">
            References
        </h3>
        <ol class="text-left text-slate-600 font-serif text-xs space-y-3 list-decimal pl-4">
            {#each references as ref}
                <li id={ref.id} class="mb-2 p-2 rounded transition-colors duration-200" data-ref={ref.id}>
                    <span class="line-clamp-2">{ref.text}</span> Available at: 
                    <span class="inline-block max-w-[200px] truncate">
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                            {ref.url}
                        </a>
                    </span>
                    <span class="font-mono text-2xs mr-1">{ref.id.replace('ref', '')}
                    (Accessed: {ref.date})
                    </span>
                </li>
            {/each}
        </ol>
    </div>
</div>

<style>
    .reference-drawer {
        width: 320px;
        height: 100vh;
        max-height: 100vh;
    }
    
    .drawer-closed {
        transform: translateX(calc(100% - 10px));
    }
    
    .drawer-open {
        transform: translateX(0);
    }
    
    .drawer-tab {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .drawer-content {
        width: 100%;
        height: calc(100vh - 0px);
        max-height: calc(100vh - 0px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 #f1f5f9;
    }

    /* Custom scrollbar for webkit browsers */
    .drawer-content::-webkit-scrollbar {
        width: 6px;
    }

    .drawer-content::-webkit-scrollbar-track {
        background: #f1f5f9;
    }

    .drawer-content::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
    }

    .drawer-content::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }

    [data-ref]:hover {
        background-color: #f1f5f9;
        color: #FF1010;
    }
</style> 
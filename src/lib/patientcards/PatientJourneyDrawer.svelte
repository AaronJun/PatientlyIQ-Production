<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';
    
    export let isOpen: boolean = false;
    export let onClose: () => void;
    export let patient: any;

    const ANIMATION_DURATION = 525;
</script>

<svelte:window on:keydown={event => event.key === 'Escape' && onClose()}/>

<div class="drawer-backdrop"
     on:click={onClose} 
     transition:fly={{duration: ANIMATION_DURATION}}>
    <div class="drawer" 
         on:click|stopPropagation
         transition:fly={{x: 200, duration: ANIMATION_DURATION, easing: circInOut}}>
        
        <button class="close-button" on:click={onClose}>&times;</button>

        <div class="drawer-content">
            <div class="view-header">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff5151] to-[#ff8151] flex items-center justify-center text-white">
                        <span class="text-lg font-serif">
                            {patient.name[0]}
                        </span>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                            {patient.name}'s Journey
                        </h2>
                        <p class="text-sm text-[#ff5151]">
                            {patient.persona} • {patient.age}
                        </p>
                    </div>
                </div>
                
                <div class="border-t pt-4 border-dotted border-[#ff5151]">
                    <p class="text-gray-600 dark:text-gray-300">
                        {patient.summary}
                    </p>
                </div>
            </div>

            <div class="mt-8">
                <p>Patient Journey Map</p>
            </div>
        </div>
    </div>
</div>

<style>
    .drawer-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 1000;
        display: flex;
        justify-content: flex-end;
    }

    .drawer {
        position: relative;
        width: 55vw;
        height: 100%;
        background-color: hsl(var(--background));
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        overflow-y: auto;
        border-left: 5px solid #ff5151;
        padding: 2rem;
    }

    .drawer-content {
        padding: 1rem 0 0 0;
    }

    .close-button {
        position: absolute;
        right: 1rem;
        top: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #878787;
        font-size: 1.35rem;
        font-weight: 400;
        font-family: "IBM Plex Mono", monospace;
    }

    @media (max-width: 768px) {
        .drawer {
            width: 100vw;
        }
    }
</style>
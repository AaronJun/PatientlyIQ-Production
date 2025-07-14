<script lang="ts">
    // Props
    export let personas: {
        id: string;
        name: string;
        type: 'Patient' | 'Caregiver';
        category?: string;
        color: string;
        avatar: string;
        age?: number;
        location?: string;
        background?: string;
        key_challenges?: string[];
        expanded: boolean;
    }[] = [];
    export let gridHeight: number;
    export let containerHeight: number;
    export let hideHeader: boolean;
    export let leftPanelWidth: number = 250;

    // Constants
    const PERSONA_HEIGHT = 100;
    const EXPANDED_HEIGHT = 150;

    // Calculate persona top positions reactively
    $: personaTopPositions = personas.map((_, index) => {
        let top = 0;
        for (let i = 0; i < index; i++) {
            top += personas[i].expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT;
        }
        return top;
    });

    // Event dispatchers
    import { createEventDispatcher } from 'svelte';
    type PersonaClickEvent = {
        persona: typeof personas[0];
        event: MouseEvent | KeyboardEvent;
    };
    const dispatch = createEventDispatcher<{
        personaClick: PersonaClickEvent;
    }>();

    // Handle persona click
    function handlePersonaClick(persona: typeof personas[0], event: MouseEvent | KeyboardEvent) {
        dispatch('personaClick', { persona, event });
    }
</script>

<!-- Fixed left panel with personas -->
<div class="personas-panel" style="width: {leftPanelWidth}px; height: {hideHeader ? gridHeight : containerHeight}px;">
    <!-- Personas content -->
    <div class="personas-content" style="height: {gridHeight}px; position: relative;">
        {#each personas as persona, index}
            <div 
                class="persona-row" 
                class:expanded={persona.expanded}
                style="
                    position: absolute;
                    top: {personaTopPositions[index]}px;
                    width: 100%;
                    height: {persona.expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT}px; 
                "
                on:click={(e) => handlePersonaClick(persona, e)}
                on:keydown={(e) => e.key === 'Enter' && handlePersonaClick(persona, e)}
                role="button"
                tabindex="0"
            >
                <div class="persona-sidebar flex flex-row align-center justify-center gap-2" 
                    style="height: {persona.expanded ? EXPANDED_HEIGHT : PERSONA_HEIGHT}px;">
                    <div class="flex w-1/3 py-2 items-center justify-center">
                        {#if persona.avatar.startsWith('/') || persona.avatar.includes('.svg')}
                            <img src={persona.avatar} alt="{persona.name} avatar" class="avatar-svg" />
                        {:else}
                            <span class="avatar-emoji">{persona.avatar}</span>
                        {/if}
                    </div>
                    <div class="persona-info flex flex-col w-2/3 justify-center items-center">
                        <div class="persona-name" style="color: {persona.color};">
                            {persona.name}
                        </div>
                        <div class="persona-type" style="color: {persona.color}80;">
                            {persona.type}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Add separator line between persona rows -->
            {#if index < personas.length - 1}
                <div 
                    class="persona-separator" 
                    style="
                        position: absolute;
                        top: {personaTopPositions[index + 1]}px;
                        width: 100%;
                        background: #e5e7eb;
                        z-index: 5;
                    "
                ></div>
            {/if}
        {/each}
    </div>
</div>

<style>
    /* === LEFT PANEL === */
    .personas-panel {
        position: sticky;
        left: 0;
        top: 0;
        display: flex;
        flex-direction: column;
        z-index: 10;
        flex-shrink: 0;
    }

    /* === PERSONA ROWS === */
    .persona-row {
        display: flex;
        flex-direction: column;
        padding: 0;
        margin: 0;
        transition: all 0.3s ease-in-out;
        cursor: pointer;
        background: #f9fafb;
    }

    .persona-row:hover {
        background: #f1f5f9;
    }

    .persona-row.expanded {
        background: #f8fafc;
    }

    .personas-content {
        overflow: hidden;
    }

    /* === PERSONA ELEMENTS === */
    .avatar-emoji {
        font-size: 0.75rem;
    }

    .avatar-svg {
        width: 3.5rem;
        height: 3.5rem;
        object-fit: contain;
    }

    .persona-info {
        flex: 1;
        min-width: 0;
    }

    .persona-name {
        font-weight: 600;
        font-size: 0.75rem;
        line-height: 1.1;
        margin-bottom: 0.25rem;
    }

    .persona-type {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
        opacity: 0.8;
    }

    /* === RESPONSIVE DESIGN === */
    @media (max-width: 768px) {
        .personas-panel {
            position: static;
            width: 100%;
            border-right: none;
            border-bottom: 2px solid #e5e7eb;
        }

        .persona-content {
            padding: 0.5rem;
            gap: 0.5rem;
        }

        .avatar-svg {
            width: 24px;
            height: 24px;
        }

        .persona-name {
            font-size: 0.8rem;
        }

        .persona-type {
            font-size: 0.65rem;
        }
    }
</style> 
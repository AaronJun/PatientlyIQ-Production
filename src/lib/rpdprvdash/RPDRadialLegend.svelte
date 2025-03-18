<!-- RPDRadialLegend.svelte -->
<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { getTherapeuticAreaColor, therapeuticAreaColors } from './utils/colorDefinitions';
    import { createSplitColorStarSVG } from './utils/svg-utils';
    
    // Set up event dispatcher
    const dispatch = createEventDispatcher<{
        areaHover: { area: string };
        areaLeave: void;
        areaClick: { area: string };
    }>();
    
    interface LegendItem {
        area: string;
        count: number;
        yearCount?: number; // Optional count for specific year
    }

    // Get all areas from the colorDefinitions file
    const allTherapeuticAreas = Object.keys(therapeuticAreaColors);
    
    // Allow external items but default to the complete list from colorDefinitions
    export let items: LegendItem[] = allTherapeuticAreas.map(area => ({ area, count: 0 }));
    
    // Optionally filter items to only show areas with counts > 0
    export let showOnlyWithCounts = false;
    
    // Selected year (if applicable)
    export let selectedYear: string = "";
    
    // Whether to show year-specific counts
    export let showYearCounts = false;
    
    // Currently hovered area from parent component
    export let hoveredArea: string = "";
    
    // colorScale is now optional since we'll use the imported color function by default
    export let colorScale: (area: string) => string = (area) => getTherapeuticAreaColor(area).fill;
    
    // Responsive layout variables
    let containerWidth = 0;
    let legendContainer: HTMLElement;
    let columns = 3;

    // Handle hovering over a legend item
    function handleAreaHover(area: string) {
        hoveredArea = area;
        dispatch('areaHover', { area });
    }
    
    // Handle leaving a legend item
    function handleAreaLeave() {
        hoveredArea = "";
        dispatch('areaLeave');
    }
    
    // Handle clicking on a legend item
    function handleAreaClick(area: string) {
        dispatch('areaClick', { area });
    }

    // Watch container size and update columns
    function updateColumns() {
        if (!legendContainer) return;
        
        const width = legendContainer.offsetWidth;
        
        if (width < 250) {
            columns = 1;
        } else if (width < 450) {
            columns = 2;
        } else {
            columns = 3;
        }
        
        containerWidth = width;
    }

    onMount(() => {
        updateColumns();
        
        // Set up resize observer to monitor container width changes
        const resizeObserver = new ResizeObserver(() => {
            updateColumns();
        });
        
        if (legendContainer) {
            resizeObserver.observe(legendContainer);
        }
        
        return () => {
            if (legendContainer) {
                resizeObserver.disconnect();
            }
        };
    });

    // Filter items based on whether they have counts
    $: filteredItems = showOnlyWithCounts ? items.filter(item => 
        showYearCounts 
            ? (item.yearCount && item.yearCount > 0) 
            : (item.count > 0)
    ) : items;
    
    // Sort items by the appropriate count in descending order
    $: sortedItems = filteredItems.sort((a, b) => {
        if (showYearCounts) {
            return (b.yearCount || 0) - (a.yearCount || 0);
        } else {
            return b.count - a.count;
        }
    });
    
    // The final items to display
    $: displayItems = sortedItems;
    
    // Generate star SVG for each area
    function getStarSVG(area: string): string {
        const areaColors = getTherapeuticAreaColor(area);
        return createSplitColorStarSVG(
            16, // Size in pixels, increased from 12px
            areaColors.fill,
            areaColors.stroke,
            "#161616", // Border color
            area.replace(/\s+/g, '-').toLowerCase() // Use sanitized area name as unique ID
        );
    }
</script>

<div 
    class="legend-container grid flex-wrap align-middle justify-left w-ful gap-x-4" 
    style="grid-template-columns: repeat({columns}, minmax(0, 1fr));"
    bind:this={legendContainer}
>
    <h3 class="text-xs font-semibold text-slate-800 capitalize mb-4" style="grid-column: span {columns};">
        Therapeutic Areas {selectedYear && showYearCounts ? `(${selectedYear})` : ''}
    </h3>
    {#each displayItems as d}
        <div 
            class="legend-row flex flex-row justify-start align-middle legend-item transition-all duration-200"
            class:highlighted={hoveredArea && hoveredArea === d.area}
            class:dimmed={hoveredArea && hoveredArea !== d.area}
            on:mouseenter={() => handleAreaHover(d.area)}
            on:mouseleave={handleAreaLeave}
            on:focus={() => handleAreaHover(d.area)}
            on:blur={handleAreaLeave}
            on:click={() => handleAreaClick(d.area)}
            tabindex="0"
        >
            <div class="legend-star w-4 h-4">
                {@html getStarSVG(d.area)}
            </div>
            <span class="text-xs text-slate-700 font-sans font-base">
                {d.area}{showYearCounts && d.yearCount !== undefined ? ` | ${d.yearCount}` : d.count > 0 ? ` | ${d.count}` : ''}
            </span>
        </div>
    {/each}
</div>

<style>
    .legend-row {
        margin-bottom: 0.425rem;
        padding-bottom: .25rem;
        cursor: pointer;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 0.52725rem;
    }

    .legend-star {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        top: .25px; /* Slight adjustment for vertical alignment */
        width: 14px;
        height: 14px;
        min-width: 14px;
    }
   
    .legend-container {
        border-top: .325px solid #161616;
        padding-top: .5625rem;
    }
    
    .highlighted {
        transform: scale(1.05);
        font-weight: 600;
        opacity: 1;
    }
    
    .dimmed {
        opacity: 0.45;
    }
</style>
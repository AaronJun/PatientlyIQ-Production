<script lang="ts">
    // ChartLegend.svelte - Reusable chart legend component
    
    // Legend data interface
    export interface LegendItem {
        category: string;
        label: string;
        color: string;
        count?: number;
    }
    
    // Component props
    export let legendItems: LegendItem[] = [];
    export let position: 'right' | 'bottom' = 'right';
    export let title: string | null = null;
    export let showCounts: boolean = true;
    export let width: number = 400; // Parent container width
</script>

<div class="chart-legend" class:right-position={position === 'right'} class:bottom-position={position === 'bottom'}>
    {#if title && position === 'right' && width > 450}
        <div class="legend-title">{title}</div>
    {/if}
    
    <div class="legend-items" class:grid={position === 'bottom'}>
        {#each legendItems as item}
            <div class="legend-item">
                <div class="color-box" style="background-color: {item.color};"></div>
                <div class="label">
                    {item.label}
                    {#if showCounts && item.count !== undefined}
                        <span class="count">({item.count})</span>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .chart-legend {
        font-size: 10px;
        color: #333;
    }
    
    .right-position {
        display: flex;
        flex-direction: column;
    }
    
    .bottom-position {
        width: 100%;
        margin-top: 8px;
    }
    
    .legend-title {
        font-weight: bold;
        margin-bottom: 10px;
    }
    
    .legend-items {
        display: flex;
        flex-direction: column;
    }
    
    .legend-items.grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        grid-gap: 6px;
        justify-content: center;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .color-box {
        width: 8px;
        height: 8px;
        border-radius: 2px;
        margin-right: 6px;
        flex-shrink: 0;
    }
    
    .label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .count {
        font-weight: normal;
        opacity: 0.8;
    }
    
    @media (max-width: 768px) {
        .chart-legend {
            font-size: 8px;
        }
        
        .legend-items.grid {
            grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
        }
        
        .color-box {
            width: 6px;
            height: 6px;
            margin-right: 4px;
        }
        
        .legend-item {
            margin-bottom: 6px;
        }
    }
</style> 
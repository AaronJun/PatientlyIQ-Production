<!-- Tooltip.svelte -->
<script>
    import { getContext } from 'svelte';
    
    const { data, xGet, yGet, width, height } = getContext('LayerCake');
    
    export let formatPrice = d => d;
    export let formatDate = d => d;
    
    let tooltipVisible = false;
    let tooltipX = 0;
    let tooltipY = 0;
    let tooltipData = null;
    let tooltipWidth = 200;
    let tooltipHeight = 100;
    let mouseX = 0;
    let mouseY = 0;
    
    // Handle mouse movement
    function handleMousemove(event) {
        const bounds = event.currentTarget.getBoundingClientRect();
        mouseX = event.clientX - bounds.left;
        mouseY = event.clientY - bounds.top;
        
        // Find the nearest data point
        if ($data.length > 0) {
            // Get x-coordinate in data space
            const invertedX = $xGet.invert(mouseX);
            
            // Find closest data point
            let closestPoint = $data[0];
            let closestDistance = Math.abs(closestPoint.date - invertedX);
            
            for (let i = 1; i < $data.length; i++) {
                const distance = Math.abs($data[i].date - invertedX);
                if (distance < closestDistance) {
                    closestPoint = $data[i];
                    closestDistance = distance;
                }
            }
            
            // Update tooltip position and data
            tooltipData = closestPoint;
            tooltipX = $xGet(closestPoint);
            tooltipY = $yGet(closestPoint);
            tooltipVisible = true;
        }
    }
    
    function handleMouseleave() {
        tooltipVisible = false;
    }
</script>

<div 
    class="tooltip-layer"
    on:mousemove={handleMousemove}
    on:mouseleave={handleMouseleave}
>
    {#if tooltipVisible && tooltipData}
        <!-- Highlight dot at the current point -->
        <div 
            class="tooltip-dot"
            style="left: {tooltipX}px; top: {tooltipY}px;"
        ></div>
        
        <!-- Vertical tracking line -->
        <div 
            class="tooltip-line"
            style="left: {tooltipX}px; top: 0; height: 100%;"
        ></div>
        
        <!-- Tooltip box -->
        <div 
            class="tooltip-box"
            style="
                left: {tooltipX + 10}px; 
                top: {tooltipY - 10}px;
                transform: translate(0, -100%);
                {tooltipX > $width - tooltipWidth ? 'transform: translate(-100%, -100%);' : ''}
            "
        >
            <div class="tooltip-date">{formatDate(tooltipData.date)}</div>
            <div class="tooltip-price">{formatPrice(tooltipData.price)}</div>
            
            {#if tooltipData.hasMilestone && tooltipData.milestones && tooltipData.milestones.length > 0}
                <div class="tooltip-milestones">
                    <div class="milestone-heading">Milestones:</div>
                    <ul class="milestone-list">
                        {#each tooltipData.milestones as milestone}
                            <li class="milestone-item" style="color: {milestone.color};">
                                {#if milestone.type === 'rpdd'}
                                    RPDD for {milestone.drug}
                                {:else if milestone.type === 'prv'}
                                    PRV Awarded for {milestone.drug}
                                {:else if milestone.type === 'sale'}
                                    PRV Sale for {milestone.drug}{#if milestone.salePrice} (${milestone.salePrice}M){/if}
                                {/if}
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .tooltip-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: all;
        z-index: 5;
    }
    
    .tooltip-dot {
        position: absolute;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: white;
        border: 2px solid #3182ce;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 10;
    }
    
    .tooltip-line {
        position: absolute;
        width: 1px;
        background: rgba(100, 100, 100, 0.2);
        pointer-events: none;
        z-index: 8;
    }
    
    .tooltip-box {
        position: absolute;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        pointer-events: none;
        z-index: 15;
        max-width: 220px;
        font-size: 12px;
    }
    
    .tooltip-date {
        font-weight: 500;
        margin-bottom: 2px;
    }
    
    .tooltip-price {
        color: #3182ce;
        font-weight: 600;
        margin-bottom: 8px;
    }
    
    .tooltip-milestones {
        border-top: 1px solid #e2e8f0;
        padding-top: 8px;
        margin-top: 4px;
    }
    
    .milestone-heading {
        font-weight: 500;
        font-size: 11px;
        color: #4a5568;
        margin-bottom: 4px;
    }
    
    .milestone-list {
        padding-left: 15px;
        margin: 0;
    }
    
    .milestone-item {
        font-size: 11px;
        margin-bottom: 2px;
    }
</style>
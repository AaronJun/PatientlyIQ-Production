<!-- MilestoneMarkers.svelte -->
<script>
    import { getContext } from 'svelte';
    
    const { width, height, xGet, yGet } = getContext('LayerCake');
    
    export let milestones = [];
    export let formatTooltip = (type, drug, date) => `${type}: ${date}`;
    export let lineWidth = 1;
    export let dashArray = '1,3';
    
    // Icons as simple SVG paths
    const icons = {
        document: 'M3,2 v10 h10 v-7 l-3,-3 z M10,2 v3 h3',
        certificate: 'M4,4 v8 h8 v-8 z M6,8 h4 M6,10 h4',
        money: 'M8,4 c2,0 3,1 3,2 c0,2 -4,1 -4,3 c0,1 1,2 3,2 M8,3 v1 M8,12 v1'
    };
</script>

<!-- Milestone markers -->
{#each milestones as milestone}
    <g class="milestone-marker" transform="translate({$xGet(milestone.date)},0)">
        <!-- Vertical line -->
        <line
            class="milestone-line"
            x1={0}
            y1={0}
            x2={0}
            y2={$height}
            stroke={milestone.color}
            stroke-width={lineWidth}
            stroke-dasharray={dashArray}
        />
        
        <!-- Icon at top -->
        <g class="milestone-icon" transform="translate(-8, 10)">
            <rect 
                width="16" 
                height="16" 
                rx="2" 
                ry="2" 
                fill="white" 
                stroke={milestone.color} 
                stroke-width="1.25" 
            />
            <path 
                d={icons[milestone.icon] || icons.document} 
                stroke={milestone.color} 
                stroke-width="1" 
                fill="none" 
                transform="translate(2, 2) scale(0.75)" 
            />
        </g>
        
        <!-- Label for type -->
        <text
            class="milestone-label"
            x={0}
            y={35}
            text-anchor="middle"
            font-family="sans-serif"
            font-size="9"
            fill={milestone.color}
        >
            {milestone.type.toUpperCase()}
        </text>
    </g>
{/each}

<style>
    .milestone-line {
        vector-effect: non-scaling-stroke;
    }
    
    .milestone-icon {
        cursor: pointer;
    }
    
    .milestone-label {
        font-weight: 600;
        pointer-events: none;
    }
</style>
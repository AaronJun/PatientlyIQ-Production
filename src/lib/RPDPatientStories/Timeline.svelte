<script lang="ts">
    import { LayerCake, Svg } from 'layercake';
    import Line from './Line.svelte';
    import AxisX from './AxisX.svelte';
    import AxisY from './AxisY.svelte';
    
    export let timelineData: Array<{ month: string; sentiment: number }>;
    export let context: string;

    const xKey = 'month';
    const yKey = 'sentiment';
</script>

<div class="timeline-container">
    <h3 class="context-title">{context}</h3>
    <div class="chart-container">
        <LayerCake
            data={timelineData}
            x={xKey}
            y={yKey}
            yDomain={[0, 100]}
            padding={{ top: 20, right: 20, bottom: 40, left: 40 }}
        >
            <Svg>
                <AxisX />
                <AxisY />
                <Line color="#ff5151" />
            </Svg>
        </LayerCake>
    </div>
</div>

<style>
    .timeline-container {
        padding: 1rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .context-title {
        font-size: 1.25rem;
        color: #ff5151;
        font-weight: 500;
        margin: 0;
    }

    .chart-container {
        background: rgba(255, 81, 81, 0.05);
        border-radius: 8px;
        padding: 1rem;
        height: 300px;
    }
</style>
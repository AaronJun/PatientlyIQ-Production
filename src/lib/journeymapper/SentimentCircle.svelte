<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    interface SentimentData {
        "Entirely Negative": number;
        "Mostly Negative": number;
        "Somewhat Negative": number;
        "Neutral": number;
        "Somewhat Positive": number;
        "Mostly Positive": number;
        "Entirely Positive": number;
    }

    export let sentiment: SentimentData;
    export let cx: number;
    export let cy: number;
    export let personaType: string = 'Patient';
    export let weekNumber: number = 1;
    export let visitName: string = '';
    export let studyPhase: string = '';

    const dispatch = createEventDispatcher();

    // Calculate total responses for sizing
    $: totalResponses = Object.values(sentiment).reduce((sum, count) => sum + count, 0);
    
    // Scale the circle radius based on total responses
    $: radius = Math.max(5, Math.min(20, 3 + (totalResponses / 5)));

    // Colors for each sentiment (ordered from negative to positive)
    const sentimentOrder = [
        "Entirely Negative",
        "Mostly Negative",
        "Somewhat Negative",
        "Neutral",
        "Somewhat Positive",
        "Mostly Positive",
        "Entirely Positive"
    ] as const;

    const sentimentColors = {
        "Entirely Negative": "#ef4444", // Red
        "Mostly Negative": "#f97316",   // Orange
        "Somewhat Negative": "#fb923c", // Light Orange
        "Neutral": "#6B7280",           // Gray
        "Somewhat Positive": "#84cc16", // Light Green
        "Mostly Positive": "#22c55e",   // Green
        "Entirely Positive": "#15803d"  // Dark Green
    };

    // Calculate stripe data
    $: stripes = calculateStripes(sentiment);

    function calculateStripes(sentiment: SentimentData) {
        const stripes = [];
        let currentY = -radius; // Start from top of circle

        for (const key of sentimentOrder) {
            const count = sentiment[key];
            if (count === 0) continue;

            const percentage = count / totalResponses;
            const stripeHeight = 2 * radius * percentage;

            stripes.push({
                y: currentY,
                height: stripeHeight,
                color: sentimentColors[key],
                sentiment: key,
                count,
                percentage: Math.round(percentage * 100)
            });

            currentY += stripeHeight;
        }

        return stripes;
    }

    // Create clipping path for circle
    $: clipPathId = `circle-clip-${cx}-${cy}`;

    // Mouse event handlers
    function handleMouseEnter(event: MouseEvent) {
        dispatch('showTooltip', {
            x: event.clientX,
            y: event.clientY,
            sentiment,
            personaType,
            weekNumber,
            visitName,
            studyPhase
        });
    }

    function handleMouseMove(event: MouseEvent) {
        dispatch('moveTooltip', {
            x: event.clientX,
            y: event.clientY
        });
    }

    function handleMouseLeave() {
        dispatch('hideTooltip');
    }
</script>

<g>
    <!-- Define clip path for circle shape -->
    <defs>
        <clipPath id={clipPathId}>
            <circle 
                cx={cx}
                cy={cy}
                r={radius}
            />
        </clipPath>
    </defs>

    <!-- Background circle (white with border) -->
    <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="white"
        stroke="#374151"
        stroke-width="0.5"
    />

    <!-- Stripes group -->
    <g clip-path="url(#{clipPathId})">
        {#each stripes as stripe}
            <rect
                x={cx - radius}
                y={cy + stripe.y}
                width={radius * 2}
                height={stripe.height}
                fill={stripe.color}
            />
        {/each}
    </g>

    <!-- Invisible overlay for mouse events -->
    <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="transparent"
        stroke="transparent"
        stroke-width="2"
        style="cursor: pointer;"
        on:mouseenter={handleMouseEnter}
        on:mousemove={handleMouseMove}
        on:mouseleave={handleMouseLeave}
    />
</g>

<style>
    rect {
        transition: y 0.2s ease-in-out, height 0.2s ease-in-out;
    }
</style> 
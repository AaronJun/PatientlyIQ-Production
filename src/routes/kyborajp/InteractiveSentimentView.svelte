<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import StaticDriverWaffle from './StaticDriverWaffle.svelte';
    import { negativeSentimentData } from './negativeSentimentData';

    // Static data for the visualization
    const defaultData = [
        // Initial Discovery
        {
            "Entirely Negative": 32,
            "Somewhat Negative": 34,
            "Neutral": 11,
            "Somewhat Positive": 9,
            "Entirely Positive": 0
        },
        // Psychological Processing
        {
            "Entirely Negative": 25,
            "Somewhat Negative": 22,
            "Neutral": 7,
            "Somewhat Positive": 2,
            "Entirely Positive": 0
        },
        // Initial Planning 
        {
            "Entirely Negative": 9,
            "Somewhat Negative": 16,
            "Neutral": 25,
            "Somewhat Positive": 12,
            "Entirely Positive": 5
        },
        // Treatment Consideration
        {
            "Entirely Negative": 10,
            "Somewhat Negative": 8,
            "Neutral": 21,
            "Somewhat Positive": 9,
            "Entirely Positive": 3  
        },
        // Long-Term Planning
        {
            "Entirely Negative": 7,
            "Somewhat Negative": 11,
            "Neutral": 4,
            "Somewhat Positive": 15,
            "Entirely Positive": 8
        }
    ];

    export let data = defaultData;
    export let stages = ["Initial Discovery", "Psychological Processing", "Initial Planning", "Treatment Consideration", "Long-Term Planning"];
    export let categories = ["Entirely Negative", "Somewhat Negative", "Neutral", "Somewhat Positive", "Entirely Positive"];
    
    const colors = {
        "Entirely Negative": "#AC0003",
        "Somewhat Negative": "#FF676A",
        "Neutral": "#FFB54F",
        "Somewhat Positive": "#59AA49",
        "Entirely Positive": "#083607"
    };

    let svg;
    let containerDiv;
    let width = 1200;
    let height = 500;
    let maxRadius = 80;
    let minRadius = 0;
    let margin = { top: 0, right: 0, bottom: 20, left: 0 };

    // State for waffle display
    let waffleData = null;
    let selectedStage = "";
    let selectedSentiment = "";

    // Debug logging
    $: console.log('Container width:', width);
    $: console.log('SVG element:', svg);
    $: console.log('Data:', data);

    function handleResize() {
        if (containerDiv) {
            width = containerDiv.offsetWidth;
            createVisualization();
        }
    }

    onMount(() => {
        console.log('Component mounted');
        if (containerDiv) {
            width = containerDiv.offsetWidth;
            console.log('Initial width:', width);
            createVisualization();
        }

        const resizeObserver = new ResizeObserver(handleResize);
        if (containerDiv) {
            resizeObserver.observe(containerDiv);
        }

        return () => {
            if (containerDiv) {
                resizeObserver.unobserve(containerDiv);
            }
        };
    });

    function handlePieSegmentHover(event, d, stage) {
        console.log('Hover event:', stage, d.data[0]);
        const sentiment = d.data[0];
        if (sentiment === "Entirely Negative" || sentiment === "Somewhat Negative") {
            selectedStage = stage;
            selectedSentiment = sentiment;
            waffleData = negativeSentimentData.data[stages.indexOf(stage)];
        }
    }

    function handlePieSegmentLeave() {
        waffleData = null;
        selectedStage = "";
        selectedSentiment = "";
    }

    function createVisualization() {
        if (!svg || !width) {
            console.log('Missing required elements:', { svg, width });
            return;
        }
        
        console.log('Creating visualization with width:', width);
        d3.select(svg).selectAll("*").remove();

        const svgElement = d3.select(svg)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);

        // Calculate totals for scaling
        const stageTotals = data.map(stage => 
            Object.values(stage).reduce((a: number, b: number) => a + b, 0)
        );
        const maxTotal = Math.max(...stageTotals);
        console.log('Stage totals:', stageTotals);

        const pie = d3.pie()
            .value(d => d[1])
            .sort(null);

        const radiusScale = d3.scaleSqrt()
            .domain([0, maxTotal])
            .range([minRadius, maxRadius]);

        const availableWidth = width - margin.left - margin.right;
        const chartSpacing = availableWidth / stages.length;

        // Create a group for the entire visualization
        const mainGroup = svgElement.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create stage labels and pie charts
        data.forEach((stageData, i) => {
            const total = stageTotals[i];
            const radius = radiusScale(total);
            const xPos = i * chartSpacing + chartSpacing/2;
            const yPos = height - margin.bottom;

            const chartGroup = mainGroup.append("g")
                .attr("transform", `translate(${xPos},${yPos - radius - 30})`);

            // Create pie segments
            const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

            const pieData = pie(Object.entries(stageData));
            console.log(`Creating pie for stage ${i}:`, pieData);

            chartGroup.selectAll("path")
                .data(pieData)
                .join("path")
                .attr("d", arc)
                .attr("fill", d => colors[d.data[0]])
                .attr("stroke", "#fff")
                .attr("stroke-width", 0.5)
                .on("mouseenter", (event, d) => handlePieSegmentHover(event, d, stages[i]))
                .on("mouseleave", handlePieSegmentLeave);

            // Add total count below pie
            chartGroup.append("text")
                .attr("x", 0)
                .attr("y", radius + 15)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "12px")
                .attr("font-weight", "600")
                .text(total);

            // Add stage label below total
            mainGroup.append("text")
                .attr("x", xPos)
                .attr("y", height - 15)
                .attr("text-anchor", "middle")
                .attr("fill", "#6D635B")
                .attr("font-size", "10px")
                .attr("font-weight", "600")
                .text(stages[i]);
        });
    }
</script>

<div class="flex flex-col space-y-8">
    <div class="waffle-container w-full h-64 flex justify-center items-center bg-gray-50 rounded-lg p-4">
        <div class="w-80">
            <StaticDriverWaffle 
                data={waffleData}
                stage={selectedStage}
                sentiment={selectedSentiment}
            />
        </div>
    </div>
    <div class="chart-container" bind:this={containerDiv}>
        <svg bind:this={svg}></svg>
    </div>
</div>

<style>
    .chart-container {
        width: 100%;
        height: 300px;
        position: relative;
    }
    
    svg {
        width: 100%;
        height: 100%;
    }

    .waffle-container {
        border-bottom: 1px solid #e5e7eb;
    }
</style>
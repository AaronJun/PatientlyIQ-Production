
<script lang="ts">
    import { onMount } from 'svelte';
    import { color, rgb } from 'd3-color';
    import MetricTile from './MetricTile.svelte';
    import SingleMetricDetail from './MetricDetail.svelte';
    import PatientCarousel from '../LayoutComponents/Carousel.svelte';
    import { patients } from './patientStore';

    interface CountryData {
        name: string;
        id: string;
        compositeScore: number;
        studyStartUpDays: number;
        studiesWithCountryExperience: number;
        experiencedSites: number;
        competingStudies: number;
        totalIPFCases: number;
        worldwideIPFExperience: number;
        medidataAggregateRecruitmentRate: number;
        [key: string]: any;
    }

    export let data: CountryData;
    export let circleColor: string;
    export let selectedMetric: string;
    export let rank: number | null;
    export let totalCountries: number;
    export let allData: CountryData[];
    export let headerHeight: number = 20;  // Default value
    export let fontSize: number = 3.75;    // Default value

    let headerColor: string;
    let bodyColor: string;
    let selectedDetailMetric: string | null = null;

    const metrics = [
        { key: 'compositeScore', label: 'Total Composite Score' },
        { key: 'studyStartUpDays', label: 'Study Start-Up Days' },
        { key: 'studiesWithCountryExperience', label: 'In-Country Experience' },
        { key: 'experiencedSites', label: 'Total Experienced Sites' },
        { key: 'competingStudies', label: 'Total Competing Studies' },
        { key: 'totalIPFCases', label: 'Total Incidence' },
        { key: 'worldwideIPFExperience', label: 'Disease Experience' },
        { key: 'medidataAggregateRecruitmentRate', label: 'Historic Recruitment Rate' }
    ];

    function generateColorPalette(baseColor: string): { header: string, body: string } {
        const c = color(baseColor);
        if (!c) return { header: baseColor, body: '#FFFFFF' };

        const rgbColor = rgb(c);
        
        const headerColor = rgbColor.formatHex();

        return { header: headerColor, body: bodyColor };
    }

    function updateColors() {
        const palette = generateColorPalette(circleColor);
        headerColor = palette.header;
        bodyColor = palette.body;
    }

    function calculateAverage(metric: keyof CountryData): number {
        const values = allData.map(country => country[metric]).filter((value): value is number => typeof value === 'number');
        return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    }

    function calculateRanking(metric: keyof CountryData): number {
        const sortedData = [...allData].sort((a, b) => b[metric] - a[metric]);
        return sortedData.findIndex(country => country.id === data.id) + 1;
    }

    $: {
        updateColors();
    }

    function handleTileClick(event: CustomEvent<{ metricName: string }>) {
        selectedDetailMetric = event.detail.metricName;
        scrollToMetricDetail(event.detail.metricName);
    }

    function scrollToMetricDetail(metricName: string) {
        const detailElement = document.getElementById(`metric-detail-${metricName}`);
        if (detailElement) {
            detailElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    onMount(updateColors);
</script>

<div class="atlas-info-content" style="background-color: {bodyColor}">
    <div class="header" style="background-color: {headerColor}; height: {headerHeight}vh;">
        <h2 style="font-size: {fontSize}rem;">{data.name}</h2>
        <h3>Composite Score Ranking: {rank !== null ? `${rank + 1} out of ${totalCountries}` : 'N/A'}</h3>
    </div>
    
    <div class="scrollable-content">
        <section class="summary-tiles">
            <h3>Key Metrics Overview</h3>
            <div class="metric-grid">
                {#each metrics as metric}
                    <MetricTile
                        metricName={metric.label}
                        countryValue={data[metric.key]}
                        averageValue={calculateAverage(metric.key)}
                        ranking={calculateRanking(metric.key)}
                        {totalCountries}
                        on:click={handleTileClick}
                    />
                {/each}
            </div>
        </section>

        <section class="patient-carousel">
            <h3>Patient Stories</h3>
            <PatientCarousel patients={$patients} />
        </section>

        <section class="detailed-metrics">
            <h3>Detailed Metric Information</h3>
            {#each metrics as metric}
                <div id="metric-detail-{metric.label}">
                    <SingleMetricDetail
                        metricName={metric.label}
                        countryName={data.name}
                        countryValue={data[metric.key]}
                        averageValue={calculateAverage(metric.key)}
                        ranking={calculateRanking(metric.key)}
                        {totalCountries}
                    />
                </div>
            {/each}
        </section>
    </div>
</div>

<style>
    .atlas-info-content {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .header {
        padding: 1.5rem;
        align-content: center;
        color: white;
        transition: height 0.3s ease-in-out;
    }

    .header h2 {
        font-weight: 400;
        margin-bottom: 0.5rem;
        transition: font-size 0.3s ease;
    }

    .scrollable-content {
        flex-grow: 1;
        overflow-y: auto;
        padding: 1.5rem;
    }

    .summary-tiles, .patient-carousel, .detailed-metrics {
        margin-bottom: 2rem;
    }

    h3 {
        font-size: 1.25rem;
        font-weight: 500;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .metric-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        max-width: 100%;
    }

    @media (min-width: 768px) {
        .metric-grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    :global(.atlas-info-content .bx--accordion) {
        margin-bottom: 1rem;
    }

    .patient-carousel {
        width: 100%;
    }
</style>
<script lang="ts">
    // Props
    export let visits: {
        visit_number: number;
        name: string;
        study_day?: string;
        study_day_range?: string;
        study_week?: string;
        timelinePosition: number;
        studyDay: number;
        stage?: string;
    }[] = [];
    export let timelineWidth: number = 2400;
    export let hideHeader: boolean = false;
    export let dynamicCellDimensions: {
        cellWidth: number;
        totalWidth: number;
        cellPositions: number[];
    };
    export let leftPanelWidth: number = 250;

    // Calculate total weeks based on study days including negative weeks
    $: {
        const minWeek = Math.floor(Math.min(...visits.map(v => v.studyDay)) / 7);
        const maxWeek = Math.ceil(Math.max(...visits.map(v => v.studyDay)) / 7);
        const weekRange = { start: minWeek, end: maxWeek };
        weekSquares = Array.from(
            { length: weekRange.end - weekRange.start + 1 },
            (_, i) => weekRange.start + i
        );
    }

    // Function to get position for week square
    function getWeekPosition(weekNum: number): number {
        const maxDay = Math.max(...visits.map(v => v.studyDay));
        const minDay = Math.min(...visits.map(v => v.studyDay));
        const totalDays = maxDay - minDay;
        const weekDay = weekNum * 7;
        const padding = 0.1;
        return ((weekDay - minDay) / totalDays) * (1 - 2 * padding) + padding;
    }

    // Calculate stage sections
    $: stageSections = visits.reduce((acc, visit) => {
        const stage = visit.stage || 'Unknown';
        if (!acc[stage]) {
            acc[stage] = {
                name: stage,
                start: visit.timelinePosition,
                end: visit.timelinePosition,
                color: getStageColor(stage)
            };
        } else {
            acc[stage].start = Math.min(acc[stage].start, visit.timelinePosition);
            acc[stage].end = Math.max(acc[stage].end, visit.timelinePosition);
        }
        return acc;
    }, {} as Record<string, { name: string; start: number; end: number; color: string }>);

    function getStageColor(stage: string): string {
        switch (stage.toLowerCase()) {
            case 'screening': return 'rgba(251, 146, 60, 0.2)'; // orange
            case 'early': return 'rgba(250, 204, 21, 0.2)'; // yellow
            case 'mid': return 'rgba(234, 179, 8, 0.2)'; // darker yellow
            case 'late': return 'rgba(202, 138, 4, 0.2)'; // even darker yellow
            case 'follow-up': return 'rgba(34, 197, 94, 0.2)'; // green
            default: return 'rgba(203, 213, 225, 0.2)'; // gray
        }
    }

    let weekSquares: number[] = [];
</script>

{#if !hideHeader}
    <div class="timeline-header-container">
        <!-- Left side labels -->
        <div class="labels-section" style="width: {leftPanelWidth}px;">
            <div class="header-row h-8">
                <div class="header-label">Weeks</div>
            </div>
            <div class="header-row h-8">
                <div class="header-label">Stage</div>
            </div>
        </div>

        <!-- Timeline header content -->
        <div class="timeline-content" style="width: calc(100% - {leftPanelWidth}px);">
            <!-- Week squares row -->
            <div class="header-row h-8">
                {#each weekSquares as weekNum}
                    <div 
                        class="week-square"
                        class:negative={weekNum < 0}
                        style="
                            left: {getWeekPosition(weekNum) * timelineWidth}px;
                        "
                        title="Week {weekNum}"
                    ></div>
                {/each}
            </div>

            <!-- Stage sections -->
            <div class="header-row h-8 stage-row">
                {#each Object.values(stageSections) as section}
                    <div 
                        class="stage-section"
                        style="
                            left: {(section.start - (dynamicCellDimensions.cellWidth / 2 / timelineWidth)) * timelineWidth}px;
                            width: {(section.end - section.start + (dynamicCellDimensions.cellWidth / timelineWidth)) * timelineWidth}px;
                            background-color: {section.color};
                        "
                    >
                        <span class="stage-label">{section.name}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}

<style>
    /* === TIMELINE HEADER === */
    .timeline-header-container {
        display: flex;
        width: 100%;
    }

    .labels-section {
        flex-shrink: 0;
        background: #f9fafb;
        border-right: 1px solid #e5e7eb;
        z-index: 2;
    }

    .timeline-content {
        position: relative;
        flex-grow: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .timeline-header {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: fit-content;
    }

    .header-row {
        position: relative;
        width: 100%;
        height: 2rem;
        display: flex;
        align-items: center;
        border-bottom: .5px solid #94a3b8;
        min-width: fit-content;
    }

    .header-label {
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        font-size: 0.725rem;
        opacity: 0.8;
        padding: 0 1rem;
    }

    .week-square {
        position: absolute;
        width: 8px;
        height: 8px;
        border: 1px solid #94a3b8;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .week-square.negative {
        background-color: #ef4444;
    }

    .stage-row {
        position: relative;
        overflow: visible;
    }

    .stage-section {
        position: absolute;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .stage-label {
        font-size: 0.725rem;
        font-weight: 600;
        color: #374151;
        white-space: nowrap;
        text-transform: capitalize;
    }

    /* === RESPONSIVE DESIGN === */
    @media (max-width: 768px) {
        .timeline-header-container {
            flex-direction: column;
        }

        .labels-section {
            width: 100% !important;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
        }

        .timeline-content {
            width: 100% !important;
        }

        .header-row {
            position: static;
        }
    }

    @media (max-width: 480px) {
        .unified-timeline-header-fixed {
            padding: 0 0.5rem;
            /* Adjust cell spacing for mobile */
            --cell-min-width: 50px;
            --cell-max-width: 100px;
        }
    }
</style> 
<script lang="ts">
    import { CirclePackChart } from '@carbon/charts-svelte'
    import '@carbon/charts-svelte/styles.css'
    import options from './SentimentCirclePackOptions.ts'
    import data from '../data/ConcernData.ts'
    </script>
    
    <CirclePackChart {data} {options} style="padding:1rem;" />
    
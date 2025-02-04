<script lang="ts">
    import { HistogramChart } from '@carbon/charts-svelte'
    import '@carbon/charts-svelte/styles.css'
    import options from './HistogramOptions.ts'
    import data from '../data/PatientHistogramData.ts'
    </script>
    
    <HistogramChart {data} {options} style="padding:2rem;" />
    
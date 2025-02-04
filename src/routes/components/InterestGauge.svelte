<script lang="ts">
    import { BoxplotChart } from '@carbon/charts-svelte'
    import '@carbon/charts-svelte/styles.css'
    import options from './InterestGaugeOptions'
    import data from './InterestGaugeData'
    </script>
    
    <BoxplotChart {data} {options} style="padding:2rem;" />
    
<script lang="ts">
    import { WordCloudChart } from '@carbon/charts-svelte'
    import '@carbon/charts-svelte/styles.css'
    import options from './wordcloudoptions'
    import data from './wordclouddata'
    </script>
    
    <WordCloudChart {data} {options} style="padding:1rem;" />

<script lang="ts">
    import { TreemapChart } from '@carbon/charts-svelte'
    import '@carbon/charts-svelte/styles.css'
    import options from './SentimentTreemapOptions.ts';
    import data from '../data/TreemapData.ts';
    </script>
    
    <TreemapChart {data} {options} style="padding:0rem;" />
    
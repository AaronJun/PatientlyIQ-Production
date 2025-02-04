<script lang="ts">
  import { BubbleChart } from '@carbon/charts-svelte';
  import '@carbon/charts-svelte/styles.css';
  import data from '../data/ShareOfVoiceData';
  import options from './ShareOfVoiceBubbleChartOptions.js';
  </script>
  
  <BubbleChart {data} {options} style="padding:0rem;" />
  
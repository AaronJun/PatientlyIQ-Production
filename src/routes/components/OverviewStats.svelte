<script lang="ts">
import { BarChartSimple } from "@carbon/charts-svelte";
import '@carbon/charts-svelte/styles.css';
import data from "../data/barChartData.ts";
import options from "../components/OverviewStatsOptions.ts";
</script>

<BarChartSimple {data} {options} style="padding:2rem;" />

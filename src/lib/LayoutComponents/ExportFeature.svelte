<script lang="ts">
  import { Button } from "carbon-components-svelte";
  import ExportPreviewPopup from './ExportPreviewPopup.svelte';
  import Download from "carbon-icons-svelte/lib/Download.svelte";
  import type BubbleMapper from '$lib/AtlasComponents/BubbleMapper.svelte';

  export let bubbleMapperComponent: BubbleMapper;
  export let countryData: any[];
  export let selectedMetric: string;
  
  let showPopup = false;
  
  function handleExportClick() {
    showPopup = true;
  }
  
  function handlePopupClose() {
    showPopup = false;
  }
</script>

<Button 
  kind="secondary" 
  icon={Download}
  on:click={handleExportClick}>Export</Button>

{#if showPopup}
  <ExportPreviewPopup
    {bubbleMapperComponent}
    {countryData}
    {selectedMetric}
    isOpen={showPopup}
    on:close={handlePopupClose}
  />
{/if}
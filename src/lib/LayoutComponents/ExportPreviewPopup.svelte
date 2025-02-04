<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import html2canvas from 'html2canvas';
  import { jsPDF } from 'jspdf';
  import type BubbleMapper from '$lib/AtlasComponents/BubbleMapper.svelte';
  import * as d3 from 'd3';
  import { 
    Modal, 
    Checkbox, 
    Select, 
    SelectItem, 
    TextInput, 
    Button,
    Tile,
    MultiSelect,
    ProgressBar
  } from "carbon-components-svelte";
  import { Download } from "carbon-icons-svelte";
  
  export let bubbleMapperComponent: BubbleMapper;
  export let countryData: any[];
  export let selectedMetric: string;
  export let isOpen = false;
  
  let previewCanvas: HTMLCanvasElement;
  let watermarkText = 'Your Company Name';
  let includeWatermark = true;
  let exportFormat = 'png';
  let isGeneratingPreview = false;
  let progress = 0;
  
  let exportOptions = [
    { id: 'map', text: 'Map View' },
    { id: 'data', text: 'Data Table' }
  ];
  let selectedExportOptions = ['map'];
  
  const dispatch = createEventDispatcher();
  
  $: if (isOpen) {
    generatePreview();
  }
  
  async function generatePreview() {
    if (!bubbleMapperComponent) return;
    isGeneratingPreview = true;
    progress = 0;
  
    const svgString = bubbleMapperComponent.getMapSvgString();
    const container = document.createElement('div');
    container.innerHTML = svgString;
    const svgElement = container.firstElementChild as SVGElement;
  
    if (includeWatermark && svgElement) {
      const watermark = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      watermark.textContent = watermarkText;
      watermark.setAttribute('x', '10');
      watermark.setAttribute('y', '20');
      watermark.setAttribute('font-size', '20');
      watermark.setAttribute('fill', 'rgba(0, 0, 0, 0.3)');
      svgElement.appendChild(watermark);
    }
  
    progress = 50;
    
    if (svgElement) {
      const canvas = await html2canvas(svgElement, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });
    
      progress = 90;
    
      previewCanvas.width = canvas.width;
      previewCanvas.height = canvas.height;
      const ctx = previewCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.drawImage(canvas, 0, 0);
      }
    }
  
    progress = 100;
    isGeneratingPreview = false;
  }
  
  function handleExport() {
    if (exportFormat === 'csv') {
      exportAsCSV();
    } else {
      exportAsImage();
    }
    close();
  }
  
  function exportAsImage() {
    if (exportFormat === 'pdf') {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [previewCanvas.width, previewCanvas.height]
      });
      pdf.addImage(previewCanvas.toDataURL('image/png'), 'PNG', 0, 0, previewCanvas.width, previewCanvas.height);
      
      if (selectedExportOptions.includes('data')) {
        pdf.addPage();
        const tableData = countryData.map(d => [d.name, d.id, d[selectedMetric]]);
        
        // If you want to use autoTable, you need to import the jspdf-autotable plugin
        // and add the following line at the top of your file:
        // import 'jspdf-autotable';
        
        // Then you can uncomment the following lines:
        // pdf.autoTable({
        //   head: [['Country', 'ID', selectedMetric]],
        //   body: tableData,
        // });
        
        // For now, we'll just add a simple text representation of the data
        pdf.text("Data Table", 14, 15);
        tableData.forEach((row, index) => {
          pdf.text(row.join(", "), 14, 25 + (index * 10));
        });
      }
      
      pdf.save('map_export.pdf');
    } else {
      const link = document.createElement('a');
      link.download = `map_export.${exportFormat}`;
      link.href = previewCanvas.toDataURL(`image/${exportFormat}`);
      link.click();
    }
  }
  
  function exportAsCSV() {
    const csvContent = d3.csvFormat(countryData.map(d => ({
      Country: d.name,
      ID: d.id,
      [selectedMetric]: d[selectedMetric]
    })));
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `country_data_${selectedMetric}.csv`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  }
  
  function close() {
    dispatch('close');
  }
  
  $: if (includeWatermark || watermarkText || selectedExportOptions) {
    generatePreview();
  }
  
  $: if (exportFormat === 'csv') {
    includeWatermark = false;
    selectedExportOptions = ['data'];
  }
</script>

<Modal
  bind:open={isOpen}
  modalHeading="Export Preview"
  primaryButtonText="Export"
  secondaryButtonText="Cancel"
  on:click:button--secondary={close}
  on:submit={handleExport}
  hasForm
>
  <div class="bx--grid">
    <div class="bx--row" style="margin-bottom: 1rem;">
      <div class="bx--col-lg-16">
        <Tile>
          {#if exportFormat !== 'csv'}
            {#if isGeneratingPreview}
              <div class="preview-loading">
                <ProgressBar helperText="Generating preview..." bind:value={progress} />
              </div>
            {:else}
              <canvas bind:this={previewCanvas}></canvas>
            {/if}
          {:else}
            <p class="csv-message">CSV export will contain data for {countryData.length} countries.</p>
          {/if}
        </Tile>
      </div>
    </div>
    <div class="bx--row">
      <div class="bx--col-lg-8">
        <Select labelText="Export Format" bind:selected={exportFormat}>
          <SelectItem value="png" text="PNG" />
          <SelectItem value="jpeg" text="JPEG" />
          <SelectItem value="pdf" text="PDF" />
          <SelectItem value="csv" text="CSV" />
        </Select>
      </div>
      <div class="bx--col-lg-8">
        <MultiSelect
          titleText="Export Options"
          label="Select items to export"
          items={exportOptions}
          bind:selectedIds={selectedExportOptions}
          disabled={exportFormat === 'csv'}
        />
      </div>
    </div>
    <div class="bx--row" style="margin-top: 1rem;">
      <div class="bx--col-lg-8">
        <Checkbox 
          labelText="Include Watermark" 
          bind:checked={includeWatermark} 
          disabled={exportFormat === 'csv'}
        />
      </div>
      {#if includeWatermark}
        <div class="bx--col-lg-8">
          <TextInput 
            labelText="Watermark Text" 
            placeholder="Your Company Name" 
            bind:value={watermarkText}
          />
        </div>
      {/if}
    </div>
  </div>
</Modal>

<style>
  canvas {
    max-width: 100%;
    height: auto;
  }

  .preview-loading, .csv-message {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  :global(.bx--modal-container) {
    width: 100%;
    max-width: 800px;
    padding-bottom: 1rem;
  }

  :global(.bx--modal-content) {
    margin-bottom: 3rem;
  }
</style>
<script>
    export let visible = false;
    export let content = {
      sponsor: '',
      drugName: '',
      therapeuticArea: '',
      id: ''
    };
    export let borderColor = '#000000';
    export let x = 0;
    export let y = 0;
  </script>
  
  {#if visible}
    <div 
      class="tooltip"
      style="left: {x}px; top: {y}px; border-color: {borderColor};"
    >
      <div class="tooltip-header">
        {content.sponsor}
      </div>
      
      {#if content.drugName}
        <div class="tooltip-drug">
          {content.drugName}
        </div>
      {/if}
      
      {#if content.therapeuticArea}
        <div class="tooltip-area">
          {content.therapeuticArea}
        </div>
      {/if}
      
      <div class="tooltip-stage">
        {content.id}
      </div>
    </div>
  {/if}
  
  <style>
    .tooltip {
      position: absolute;
      background: white;
      border: 2px solid;
      border-radius: 5px;
      padding: 10px;
      pointer-events: none;
      width: 200px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10;
      font-size: 12px;
      transition: opacity 0.1s;
    }
    
    .tooltip-header {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 14px;
    }
    
    .tooltip-drug {
      font-style: italic;
      margin-bottom: 3px;
    }
    
    .tooltip-area {
      color: #666;
      margin-bottom: 3px;
    }
    
    .tooltip-stage {
      font-weight: 500;
      color: #555;
    }
  </style>
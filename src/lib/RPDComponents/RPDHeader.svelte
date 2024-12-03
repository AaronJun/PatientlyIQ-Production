<script lang="ts">
    import 'carbon-components-svelte/css/all.css';
      let activeView = 'year';

  </script>

  <header class="rpd-header">
    <div class="header-content">
      <div class="header-left">
        <div class="title-section">
          <h1 class="capitalize mb-2">Planting the seeds of rare disease treatment
          </h1>
          <p class="font-bold">Measuring the impact of the FDA's rare pediatric disease priority review voucher program</p>
        </div>
      </div>
  </header>
  
  <style>
    .rpd-header {
      border-bottom: 1px solid #e5e7eb;
      width: 100%;
    }
  
    .header-content {
      display: flex;
      padding: 2.25rem 0 1.25rem 2.25rem;
      align-items: left;
      justify-content: left;
    }
  
    .header-left {
      display: flex;
      align-items: left;
    }
  
    .database-icon {
      color: #C9623F;
    }
  
    .title-section h1 {
      font-size: 1.25rem;
      font-weight: 400;
      color: #0c0c0c;
    }
  
    .title-section p {
      font-size: 0.875rem;
      color: #666;
      margin: 0;
    }
  
    .header-right {
      display: flex;
      align-items: center;
    }
  
    .view-controls {
      display: flex;
      gap: 0.5rem;
    }
  
    .view-button {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      background-color: white;
      color: #666;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }
  
    .view-button:hover {
      background-color: #f3f4f6;
    }
  
    .view-button.active {
      background-color: #C9623F;
      color: white;
      border-color: #C9623F;
    }
  
    .data-range {
      font-size: 0.875rem;
      color: #666;
      padding: 0.5rem 1rem;
      background-color: #f3f4f6;
      border-radius: 4px;
    }
  </style>
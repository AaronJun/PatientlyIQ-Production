<script lang="ts">
    import { onMount } from 'svelte';
    import RadialFlowDataDriven from './RadialFlowDataDriven.svelte';
    import RadialTooltip from './RadialTooltip.svelte';
    
    // Sample data - replace with your actual data
    let data = [
      {
        Company: "BioTech A",
        "Public/Private": "Public",
        Candidate: "Drug X-101",
        "Current Development Stage": "Phase 2",
        TherapeuticArea1: "Oncology",
        Indication: "Breast Cancer"
      },
      {
        Company: "BioTech A",
        "Public/Private": "Public",
        Candidate: "Drug X-102",
        "Current Development Stage": "Phase 1",
        TherapeuticArea1: "Oncology",
        Indication: "Lung Cancer"
      },
      {
        Company: "Pharma B",
        "Public/Private": "Public",
        Candidate: "Med-201",
        "Current Development Stage": "Phase 3",
        TherapeuticArea1: "Neurology",
        Indication: "Alzheimer's"
      },
      {
        Company: "Startup C",
        "Public/Private": "Private",
        Candidate: "SC-301",
        "Current Development Stage": "Preclinical",
        TherapeuticArea1: "Infectious Disease",
        Indication: "Viral Infection",
        "PRV Year": "2023"
      }
    ];
    
    // State for detail panels
    let selectedCompany = null;
    let selectedDrug = null;
    let filteredEntries = [];
    
    // Event handlers
    function handleCompanyHover(entries) {
      if (entries && entries.companyName) {
        selectedCompany = {
          name: entries.companyName,
          totalDrugs: entries.totalDrugs,
          clinicalTrials: entries.clinicalTrials,
          vouchersAwarded: entries.vouchersAwarded
        };
        filteredEntries = entries.entries || [];
      } else if (entries && entries.length > 0) {
        selectedCompany = {
          name: entries[0].Company,
          totalDrugs: entries.length
        };
        filteredEntries = entries;
      } else {
        selectedCompany = null;
        filteredEntries = [];
      }
      selectedDrug = null;
    }
    
    function handleStageHover(entries) {
      filteredEntries = entries;
      selectedCompany = null;
      selectedDrug = null;
    }
    
    function handleShowDrugDetail(detail) {
      selectedDrug = detail;
      selectedCompany = null;
    }
    
    function handleResetView() {
      selectedCompany = null;
      selectedDrug = null;
      filteredEntries = [];
    }
  </script>
  
  <div class="pipeline-visualization">
    <div class="visualization-header">
      <h1>Drug Pipeline Visualization</h1>
      <p>Interactive visualization of development stage by company</p>
    </div>
    
    <div class="main-content">
      <div class="visualization-container">
        <RadialFlowDataDriven 
          {data}
          onCompanyHover={handleCompanyHover}
          onStageHover={handleStageHover}
          onShowDrugDetail={handleShowDrugDetail}
          onLeave={handleResetView}
        />
      </div>
      
      <div class="details-panel">
        {#if selectedCompany}
          <div class="company-details">
            <h2>{selectedCompany.name}</h2>
            <div class="metrics">
              <div class="metric">
                <span class="metric-value">{selectedCompany.totalDrugs}</span>
                <span class="metric-label">Total Drugs</span>
              </div>
              
              {#if selectedCompany.clinicalTrials !== undefined}
                <div class="metric">
                  <span class="metric-value">{selectedCompany.clinicalTrials}</span>
                  <span class="metric-label">Clinical Trials</span>
                </div>
              {/if}
              
              {#if selectedCompany.vouchersAwarded !== undefined}
                <div class="metric">
                  <span class="metric-value">{selectedCompany.vouchersAwarded}</span>
                  <span class="metric-label">Vouchers Awarded</span>
                </div>
              {/if}
            </div>
            
            {#if filteredEntries.length > 0}
              <div class="entry-list">
                <h3>Pipeline</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Drug</th>
                      <th>Stage</th>
                      <th>Indication</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each filteredEntries as entry}
                      <tr>
                        <td>{entry.Candidate}</td>
                        <td>{entry["Current Development Stage"]}</td>
                        <td>{entry.Indication}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        {:else if selectedDrug}
          <div class="drug-details">
            <h2>{selectedDrug.drugName}</h2>
            <div class="drug-info">
              <p><strong>Company:</strong> {selectedDrug.Company}</p>
              <p><strong>Current Stage:</strong> {selectedDrug.currentStage}</p>
              <p><strong>Therapeutic Area:</strong> {selectedDrug.therapeuticArea}</p>
              <p><strong>Indication:</strong> {selectedDrug.indication}</p>
              
              {#if selectedDrug.year}
                <p><strong>PRV Year:</strong> {selectedDrug.year}</p>
              {/if}
            </div>
          </div>
        {:else if filteredEntries.length > 0}
          <div class="stage-details">
            <h2>Stage Overview</h2>
            <p>{filteredEntries.length} drugs in this stage</p>
            
            <div class="entry-list">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Drug</th>
                    <th>Indication</th>
                  </tr>
                </thead>
                <tbody>
                  {#each filteredEntries as entry}
                    <tr>
                      <td>{entry.Company}</td>
                      <td>{entry.Candidate}</td>
                      <td>{entry.Indication}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {:else}
          <div class="info-panel">
            <h2>Pipeline Explorer</h2>
            <p>Hover over or click on elements in the visualization to see details.</p>
            
            <div class="legend">
              <h3>Legend</h3>
              
              <div class="legend-section">
                <h4>Development Stages</h4>
                <div class="legend-items">
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #94A3B8;"></span>
                    <span>Preclinical</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #3B82F6;"></span>
                    <span>Phase 1</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #4F46E5;"></span>
                    <span>Phase 1/2</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #22C55E;"></span>
                    <span>Phase 2</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #EAB308;"></span>
                    <span>Phase 3</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #EF4444;"></span>
                    <span>Filed</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #E11D48;"></span>
                    <span>Approved</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #D97706;"></span>
                    <span>PRV Awarded</span>
                  </div>
                </div>
              </div>
              
              <div class="legend-section">
                <h4>Company Status</h4>
                <div class="legend-items">
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #0284C7;"></span>
                    <span>Public</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #9333EA;"></span>
                    <span>Private</span>
                  </div>
                </div>
              </div>
              
              <div class="legend-section">
                <h4>Therapeutic Areas</h4>
                <div class="legend-items">
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #FF6347;"></span>
                    <span>Oncology</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #4682B4;"></span>
                    <span>Neurology</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #2E8B57;"></span>
                    <span>Infectious Disease</span>
                  </div>
                  <div class="legend-item">
                    <span class="color-box" style="background-color: #CD5C5C;"></span>
                    <span>Cardiovascular</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <style>
    .pipeline-visualization {
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
      padding: 20px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    .visualization-header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .visualization-header h1 {
      font-size: 28px;
      margin-bottom: 5px;
      color: #1E293B;
    }
    
    .visualization-header p {
      font-size: 16px;
      color: #64748B;
    }
    
    .main-content {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .visualization-container {
      flex: 1;
      min-width: 300px;
      border-radius: 8px;
      overflow: hidden;
      background-color: #F8FAFC;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .details-panel {
      width: 350px;
      padding: 20px;
      border-radius: 8px;
      background-color: #F8FAFC;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    
    .details-panel h2 {
      font-size: 20px;
      color: #1E293B;
      margin-top: 0;
      margin-bottom: 15px;
    }
    
    .details-panel h3 {
      font-size: 16px;
      color: #334155;
      margin-top: 15px;
      margin-bottom: 10px;
    }
    
    .metrics {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #0F172A;
    }
    
    .metric-label {
      font-size: 12px;
      color: #64748B;
    }
    
    .entry-list {
      margin-top: 15px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    
    th {
      text-align: left;
      padding: 8px;
      background-color: #E2E8F0;
      color: #334155;
    }
    
    td {
      padding: 8px;
      border-bottom: 1px solid #E2E8F0;
    }
    
    .legend {
      margin-top: 20px;
    }
    
    .legend-section {
      margin-bottom: 15px;
    }
    
    .legend-section h4 {
      font-size: 14px;
      color: #334155;
      margin-bottom: 5px;
    }
    
    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
    }
    
    .color-box {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
    
    .drug-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    
    @media (max-width: 1200px) {
      .main-content {
        flex-direction: column;
      }
      
      .details-panel {
        width: 100%;
      }
    }
  </style>
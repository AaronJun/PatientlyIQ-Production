<script lang="ts">
    export let constellationData: any[];
    export let treatmentType: string;
  
    $: filteredData = constellationData.filter(entry => entry["Treatment Type"] === treatmentType);
  
    function formatField(value: string): string {
      return value || 'N/A';
    }
  </script>
  
  <div class="table-container">
    <h3>Entries for Treatment Type: {treatmentType}</h3>
    <table>
      <thead>
        <tr>
          <th>Sponsor</th>
          <th>Drug Name</th>
          <th>MOA</th>
          <th>Therapeutic Area</th>
          <th>Indication</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredData as entry (entry["Drug Name"])}
          <tr>
            <td>{formatField(entry.Sponsor)}</td>
            <td>{formatField(entry["Drug Name"])}</td>
            <td>{formatField(entry.MOA)}</td>
            <td>{formatField(entry.name)}</td>
            <td>{formatField(entry.id)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <style>
    .table-container {
      min-height: 250px;
      overflow-y: auto;
      max-width: 95%;
      margin: 2.25rem 0 2.25rem 0;
    }
  
    h3 {
      font-weight: 800;
      font-size: .75rem;
      text-transform: capitalize;
      color: #292F58;
      margin-bottom: 12px;
    }
  
    table {
      width: 100%;
      border-collapse: collapse;
    }
  
    th, td {
      padding-top: 1rem;
      padding-bottom: 1rem;
      text-align: left;
      font-size: .75rem;
      line-height: 1rem;
    }
  
    th {
      font-size: .65rem;
      font-family: "IBM Plex Mono", monospace;
      font-weight: 600;
    }
  
    tr {
      border-bottom: .5px #292F58;
      border-style: dotted;
    }
  
    tr:hover {
      background-color: #b7e0fe;
      cursor: pointer;
    }
  </style>
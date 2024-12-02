<script>
    export let displayData;
  
    $: description = generateDescription(displayData);
  
    function generateDescription(data) {
      const drugName = `<span class="highlight-bold">${data["Drug Name"]}</span>`;
      const sponsor = `<span class="highlight">${data.Sponsor}</span>`;
      const treatment = `<span class="highlight">${data["Treatment Type"].toLowerCase()}</span>`;
      const indication = `<span class="highlight">${data.id}</span>`;
      
      let text = `${drugName} is a ${treatment} for ${indication}, developed by ${sponsor}.`;
      
      if (data["Previously Approved Therapies"] === "NONE") {
        text += ` There were no FDA-approved treatments for ${indication} prior to the launch of the RPD Voucher Program.`;
      }
      
      return text;
    }
  </script>
  
  <p class="description">{@html description}</p>
  
  <style>
    .description {
      font-size: 1rem;
      color: #2b2b2b;
    }

  
    :global(.highlight) {
      color: #C9623F;
      font-family: 'IBM Plex Mono', monospace;
      font-weight: 800;
      text-decoration: underline dotted;
      padding: 0 0.15 0 0rem;
    }
  </style>
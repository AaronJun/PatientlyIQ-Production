<script lang="ts">
    interface RPDData {
      Year: string;
      RPD: string;
      "RPD PRV": string;
    }
  
    interface ConstellationEntry {
      Year: string;
      id: string;
      name: string;
      Sponsor: string;
      "Drug Name": string;
      "Treatment Type"?: string;
      Purchased: string;
      Month: string;
      Date: string;
      Purchaser?: string;
    }
  
    export let rpdPrvData: RPDData[] = [];
    export let constellationData: ConstellationEntry[] = [];
    export let currentYear: string;
  
    $: totalVouchers = constellationData.length;
    $: uniqueSponsors = new Set(constellationData.map(d => d.Sponsor)).size;
    $: uniqueAreas = new Set(constellationData.map(d => d.name)).size;
    $: vouchersSold = constellationData.filter(d => d.Purchased === "Y").length;
    $: averageVouchersPerArea = Math.round(totalVouchers / uniqueAreas);
  </script>
  
  <div class="summary-container">
    <h2 class="title">Therapeutic Area Overview</h2>
    
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-value">{totalVouchers}</span>
        <span class="stat-label">Total Vouchers</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-value">{uniqueAreas}</span>
        <span class="stat-label">Therapeutic Areas</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-value">{uniqueSponsors}</span>
        <span class="stat-label">Unique Sponsors</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-value">{vouchersSold}</span>
        <span class="stat-label">Vouchers Sold</span>
      </div>
    </div>
  
    <div class="text-summary">
      <p>
        Average of {averageVouchersPerArea} vouchers per therapeutic area. 
        {Math.round((vouchersSold / totalVouchers) * 100)}% of vouchers have been sold.
      </p>
    </div>
  </div>
  
  <style>
    .summary-container {
      padding: 1.5rem 1rem;
      background-color: white;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }
  
    .title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #C9623F;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
      letter-spacing: 0.025em;
    }
  
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }
  
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0.75rem;
      background-color: #f9fafb;
      border-radius: 0.5rem;
      transition: all 0.2s ease-in-out;
    }
  
    .stat-item:hover {
      background-color: #f3f4f6;
    }
  
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      line-height: 1;
      margin-bottom: 0.25rem;
    }
  
    .stat-label {
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 500;
    }
  
    .text-summary {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
  </style>
<script lang="ts">
    const companies = [
        {
            name: "Gossamer Bio",
            location: "San Diego, US",
            drug: "Seralutinib",
            indication: "Pulmonary arterial hypertension",
            strategy: "Global Phase 3 inclusion",
            benefit: "No bridging study required",
            study: "PROSPERA study",
            color: "#3b82f6",
            icon: "🫁"
        },
        {
            name: "Mannkind Corporation",
            location: "US",
            drug: "Clofazimine Inhalation Suspension",
            indication: "Nontuberculous mycobacteria (NTM) lung disease",
            strategy: "Global Phase 3 inclusion",
            benefit: "No previous Japanese data needed",
            study: "Global Phase 3 trial",
            color: "#10b981",
            icon: "🦠"
        },
        {
            name: "Belite Bio",
            location: "International",
            drug: "Tinlarebent",
            indication: "Vision loss",
            strategy: "Sakigake & Orphan designation",
            benefit: "Streamlined process + price premiums",
            study: "Regulatory pathway",
            color: "#f59e0b",
            icon: "👁️"
        },
        {
            name: "Calliditas",
            location: "Sweden",
            drug: "Nefecon",
            indication: "IgA nephropathy",
            strategy: "Partnership with Viatris Japan",
            benefit: "Acquired by Asahi Kasei for $1.1BN",
            study: "Phase 3 trials",
            color: "#ef4444",
            icon: "🫘"
        }
    ];

    const strategies = [
        { type: "Global Phase 3 Inclusion", count: 2, color: "#3b82f6" },
        { type: "Sakigake Designation", count: 1, color: "#f59e0b" },
        { type: "Strategic Partnership", count: 1, color: "#ef4444" }
    ];
</script>

<div class="success-stories-container my-8">
    <h5 class="text-lg font-semibold text-slate-700 mb-2">
        Company Success Stories in Japan
    </h5>
    <p class="text-sm text-slate-600 mb-6">
        Real examples of biotech companies capitalizing on Japan's regulatory reforms
    </p>

    <!-- Strategy Overview -->
    <div class="strategy-overview mb-6">
        <h6 class="text-md font-medium text-slate-600 mb-3">Market Entry Strategies</h6>
        <div class="flex flex-wrap gap-3">
            {#each strategies as strategy}
                <div class="strategy-badge" style="border-color: {strategy.color};">
                    <div class="strategy-dot" style="background-color: {strategy.color};"></div>
                    <span class="text-sm font-medium">{strategy.type}</span>
                    <span class="count-badge" style="background-color: {strategy.color};">{strategy.count}</span>
                </div>
            {/each}
        </div>
    </div>

    <!-- Company Cards -->
    <div class="companies-grid">
        {#each companies as company}
            <div class="company-card" style="border-left-color: {company.color};">
                <div class="company-header">
                    <div class="company-icon">{company.icon}</div>
                    <div class="company-info">
                        <h6 class="company-name">{company.name}</h6>
                        <p class="company-location">{company.location}</p>
                    </div>
                </div>
                
                <div class="drug-info">
                    <div class="drug-name">{company.drug}</div>
                    <div class="indication">{company.indication}</div>
                </div>
                
                <div class="strategy-info">
                    <div class="strategy-label">Strategy:</div>
                    <div class="strategy-text">{company.strategy}</div>
                </div>
                
                <div class="benefit-info">
                    <div class="benefit-label">Key Benefit:</div>
                    <div class="benefit-text">{company.benefit}</div>
                </div>
                
                <div class="study-status">
                    <div class="status-indicator" style="background-color: {company.color};"></div>
                    <span class="status-text">{company.study}</span>
                </div>
            </div>
        {/each}
    </div>

    <!-- Timeline visualization -->
    <div class="timeline-section mt-8">
        <h6 class="text-md font-medium text-slate-600 mb-4">2024 Success Timeline</h6>
        <div class="timeline">
            <div class="timeline-item">
                <div class="timeline-dot" style="background-color: #3b82f6;"></div>
                <div class="timeline-content">
                    <div class="timeline-title">Q1 2024</div>
                    <div class="timeline-desc">Gossamer Bio includes Japanese patients in PROSPERA study</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-dot" style="background-color: #f59e0b;"></div>
                <div class="timeline-content">
                    <div class="timeline-title">Early 2024</div>
                    <div class="timeline-desc">Belite Bio receives Sakigake designation for tinlarebent</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-dot" style="background-color: #ef4444;"></div>
                <div class="timeline-content">
                    <div class="timeline-title">June 2024</div>
                    <div class="timeline-desc">Asahi Kasei acquires Calliditas for $1.1BN</div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-dot" style="background-color: #10b981;"></div>
                <div class="timeline-content">
                    <div class="timeline-title">September 2024</div>
                    <div class="timeline-desc">Mannkind receives PMDA clearance for global Phase 3</div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .success-stories-container {
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        border-radius: 12px;
        padding: 2rem;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .strategy-overview {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .strategy-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: white;
        border: 2px solid;
        border-radius: 20px;
        font-size: 0.875rem;
    }

    .strategy-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .count-badge {
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.125rem 0.375rem;
        border-radius: 10px;
        min-width: 20px;
        text-align: center;
    }

    .companies-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
    }

    .company-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        border: 1px solid #e2e8f0;
        border-left: 4px solid;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .company-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .company-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .company-icon {
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border-radius: 8px;
    }

    .company-name {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
    }

    .company-location {
        font-size: 0.75rem;
        color: #6b7280;
        margin: 0;
    }

    .drug-info {
        margin-bottom: 0.75rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #f3f4f6;
    }

    .drug-name {
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.25rem;
    }

    .indication {
        font-size: 0.875rem;
        color: #6b7280;
        font-style: italic;
    }

    .strategy-info, .benefit-info {
        margin-bottom: 0.75rem;
    }

    .strategy-label, .benefit-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #374151;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
    }

    .strategy-text, .benefit-text {
        font-size: 0.875rem;
        color: #4b5563;
    }

    .study-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px solid #f3f4f6;
    }

    .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .status-text {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
    }

    .timeline-section {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .timeline {
        position: relative;
        padding-left: 1rem;
    }

    .timeline::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e5e7eb;
    }

    .timeline-item {
        position: relative;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
    }

    .timeline-item:last-child {
        margin-bottom: 0;
    }

    .timeline-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 1px #e5e7eb;
        flex-shrink: 0;
        margin-top: 0.125rem;
    }

    .timeline-title {
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.25rem;
    }

    .timeline-desc {
        font-size: 0.875rem;
        color: #6b7280;
    }
</style> 
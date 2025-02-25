<!-- RPDCompanyValueAnalysis.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import RPDCompanyStockChart from './RPDCompanyValueChart.svelte';
    import { DataTable, Toolbar, ToolbarContent, ToolbarSearch } from "carbon-components-svelte";
    import { Information, ChartColumnFloating, Warning } from 'carbon-icons-svelte';

    export let data: any[] = []; // This is the milestone data from mergeddata.json
    export let company: string = ""; // Company name
    export let color: string = "#37587e"; // Color for styling

    let stockPriceData: any[] = [];
    let isLoading = true;
    let error: string | null = null;
    let showRPDD = true;
    let showPRV = true;
    let showSales = true;
    let companyEvents: any[] = [];
    let searchTerm = "";
    let usingRealData = false;

    // Key milestone events for the selected company
    $: companyEvents = data.filter(d => d.Company === company);

    // Map company names to tickers (this would be replaced with real mapping in production)
    function getCompanyTicker(name: string): string | null {
        const tickerMap = {
            'Acadia': 'ACAD',
            'Albireo AB': 'ALBO',
            'Alexion': 'ALXN',
            'Alnylym': 'ALNY',
            'Amryt': 'AMYT',
            'AstraZeneca': 'AZN',
            'Biogen': 'BIIB',
            'BioMarin': 'BMRN',
            'bluebird Bio': 'BLUE',
            'Day One': 'DAWN',
            'Eiger': 'EIGR',
            'GW Research': 'GWPH',
            'Ipsen Bio': 'IPN.PA',
            'Krystal': 'KRYS',
            'Marinus': 'MRNS',
            'Mirum': 'MIRM',
            'Neurocrine': 'NBIX',
            'Novartis': 'NVS',
            'Pharming': 'PHAR',
            'PTC': 'PTCT',
            'Reata': 'RETA',
            'Regeneron': 'REGN',
            'Rhythm': 'RYTM',
            'Sanofi': 'SNY',
            'Sarepta': 'SRPT',
            'Ultragenyx': 'RARE',
            'United': 'UTHR',
            'Vertex': 'VRTX'
        };
        
        return tickerMap[name] || null;
    }

    // Generate mock stock data for development
    function generateMockStockData(ticker: string): any[] {
        const today = new Date();
        const mockData = [];
        
        // Generate a 5-year dataset (approximately 1825 days)
        const days = 1825;
        
        // Generate a base price that's somewhat unique to the ticker
        const tickerSum = ticker.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const basePrice = 20 + (tickerSum % 100); // Price between $20-$120
        
        // Add random but somewhat realistic price movement
        let currentPrice = basePrice;
        
        // Add the company events to use for significant price movements
        const eventDates = companyEvents
            .filter(e => e["RPDD Year"] || e["PRV Issue Year"] || (e.Purchased === "Y" && e["Purchase Year"]))
            .map(e => {
                const dates = [];
                if (e["RPDD Year"] && e["RPDD Month"]) {
                    dates.push(new Date(`${e["RPDD Year"]}-${e["RPDD Month"].padStart(2, '0')}-01`));
                }
                if (e["PRV Issue Year"] && e["PRV Issue Month"]) {
                    dates.push(new Date(`${e["PRV Issue Year"]}-${e["PRV Issue Month"].padStart(2, '0')}-01`));
                }
                if (e.Purchased === "Y" && e["Purchase Year"] && e["Purchase Month"]) {
                    dates.push(new Date(`${e["Purchase Year"]}-${e["Purchase Month"].padStart(2, '0')}-01`));
                }
                return dates;
            })
            .flat()
            .sort((a, b) => a.getTime() - b.getTime());
            
        // Create date points - generate MONTHLY data points
        const startYear = 2015;
        const endYear = today.getFullYear();
        
        for (let year = startYear; year <= endYear; year++) {
            for (let month = 1; month <= 12; month++) {
                // Stop if we're past the current month/year
                if (year === endYear && month > today.getMonth() + 1) {
                    break;
                }
                
                const date = new Date(year, month - 1, 1); // Month is 0-indexed in JavaScript
                
                // Check if this date is near an event
                const isNearEvent = eventDates.some(eventDate => {
                    const eventMonth = eventDate.getMonth();
                    const eventYear = eventDate.getFullYear();
                    return month === eventMonth + 1 && year === eventYear;
                });
                
                // Generate monthly change with potential jumps near events
                let monthlyChange;
                if (isNearEvent) {
                    // Bigger movement near events, more likely to be positive
                    const direction = Math.random() > 0.3 ? 1 : -1;
                    monthlyChange = direction * (Math.random() * 15 + 5); // 5-20% change
                } else {
                    // Normal monthly fluctuation
                    monthlyChange = (Math.random() - 0.48) * 8; // -3.84% to +4.16% change with slight upward bias
                }
                
                // Apply the change
                currentPrice = Math.max(1, currentPrice * (1 + monthlyChange/100));
                
                mockData.push({
                    Company: company,
                    StockPriceMonth: month.toString(),
                    StockPriceYear: year.toString(),
                    "Close/Price": currentPrice.toFixed(2)
                });
            }
        }
        
        return mockData;
    }
    
    // Load stock data when component mounts or company changes
    async function loadStockData() {
        isLoading = true;
        error = null;
        
        try {
            // For demo purposes, we'll check if we have JSON data for this company
            if (company === "Sarepta") {
                // For Sarepta, try to load the real data from the JSON file
                try {
                    // In a real implementation, we would use window.fs.readFile or fetch
                    // Since we're simulating for now, we'll just pretend we loaded it
                    usingRealData = true;
                    
                    // Try to load data from window.fs.readFile
                    try {
                        // First look for company-specific JSON file
                        const fileResponse = await window.fs.readFile('rpdCompanyValues.json', { encoding: 'utf8' });
                        if (fileResponse) {
                            const jsonData = JSON.parse(fileResponse);
                            if (Array.isArray(jsonData) && jsonData.length > 0) {
                                stockPriceData = jsonData.filter(item => item.Company === company);
                                usingRealData = true;
                                isLoading = false;
                                return;
                            }
                        }
                    } catch (readError) {
                        console.warn("Could not read real stock data:", readError);
                    }
                    
                    // Fall back to mock data
                    stockPriceData = [];
                    usingRealData = false;
                } catch (jsonError) {
                    console.warn("Error loading JSON stock data:", jsonError);
                    usingRealData = false;
                }
            }
            
            // For other companies or if real data loading failed, generate mock data
            if (!usingRealData || stockPriceData.length === 0) {
                const ticker = getCompanyTicker(company);
                if (ticker) {
                    stockPriceData = generateMockStockData(ticker);
                    usingRealData = false;
                } else {
                    // No ticker mapping found
                    throw new Error(`No ticker symbol found for ${company}`);
                }
            }
        } catch (e) {
            console.error("Error loading stock data:", e);
            error = e.message || "Failed to load stock data";
            stockPriceData = [];
        } finally {
            isLoading = false;
        }
    }

    function formatDate(year, month, day = ""): string {
        if (!year || !month) return "N/A";
        return `${month}/${day || ""}/${year}`;
    }
    
    onMount(() => {
        if (company) {
            loadStockData();
        }
    });
    
    // Watch for company changes
    $: if (company) {
        loadStockData();
    }
</script>

<div class="company-value-analysis bg-white rounded-lg shadow-sm p-1">
    <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-2">
            <ChartColumnFloating size={18} class="text-slate-600" />
            <h3 class="text-base font-medium text-slate-700">Stock Performance & Key Milestones</h3>
        </div>
        
        <div class="flex gap-2">
            <label class="flex items-center gap-1">
                <input type="checkbox" bind:checked={showRPDD} class="h-3 w-3 text-orange-500">
                <span class="text-xs">RPDD</span>
            </label>
            <label class="flex items-center gap-1">
                <input type="checkbox" bind:checked={showPRV} class="h-3 w-3 text-teal-500">
                <span class="text-xs">PRV</span>
            </label>
            <label class="flex items-center gap-1">
                <input type="checkbox" bind:checked={showSales} class="h-3 w-3 text-red-500">
                <span class="text-xs">Sales</span>
            </label>
        </div>
    </div>
    
    <div class="mb-6 relative">
        {#if isLoading}
            <div class="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
                <div class="text-center text-slate-500">
                    <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading stock data...</p>
                </div>
            </div>
        {:else if error}
            <div class="flex items-center justify-center h-64 bg-red-50 rounded-lg">
                <div class="text-center text-red-600 px-4">
                    <Warning size={32} class="mx-auto mb-2" />
                    <p class="font-medium">Unable to load stock data</p>
                    <p class="text-sm mt-2">This could be a private company or the data is temporarily unavailable.</p>
                    <p class="text-xs mt-4 text-red-500">{error}</p>
                </div>
            </div>
        {:else if stockPriceData.length > 0}
            <div class="h-64 rounded-lg overflow-hidden">
                {#if !usingRealData}
                    <div class="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded absolute right-2 top-2 z-10">
                        Demo Data
                    </div>
                {/if}
                <RPDCompanyStockChart
                    companyName={company}
                    rpddData={data}
                    stockData={stockPriceData}
                    bind:showRPDD
                    bind:showPRV
                    bind:showSales
                />
            </div>
        {:else}
            <div class="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
                <div class="text-center text-slate-500">
                    <Information size={32} class="mx-auto mb-2" />
                    <p>No stock data available for {company}</p>
                </div>
            </div>
        {/if}
    </div>
    
    <!-- Milestone Timeline -->
    <div class="milestone-timeline bg-slate-50 p-3 rounded-lg">
        <div class="flex justify-between items-center mb-3">
            <h4 class="text-sm font-medium text-slate-700">Key Milestone Timeline</h4>
            <div class="flex gap-2">
                <label class="flex items-center gap-1">
                    <input type="checkbox" bind:checked={showRPDD} class="h-3 w-3 text-orange-500">
                    <span class="text-xs">RPDD</span>
                </label>
                <label class="flex items-center gap-1">
                    <input type="checkbox" bind:checked={showPRV} class="h-3 w-3 text-teal-500">
                    <span class="text-xs">PRV</span>
                </label>
                <label class="flex items-center gap-1">
                    <input type="checkbox" bind:checked={showSales} class="h-3 w-3 text-red-500">
                    <span class="text-xs">Sales</span>
                </label>
            </div>
        </div>
        
        {#if companyEvents.length > 0}
            <div class="timeline-container overflow-x-auto">
                <div class="timeline min-w-full relative pb-1">
                    {#each companyEvents as event}
                        <!-- RPDD Events -->
                        {#if showRPDD && event["RPDD Year"]}
                            <div class="timeline-item mb-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-16 text-xs text-right text-slate-500">
                                        {formatDate(event["RPDD Year"], event["RPDD Month"], event["Date"])}
                                    </div>
                                    <div class="h-3 w-3 rounded-full bg-orange-500 flex-shrink-0"></div>
                                    <div class="px-2 py-1 bg-orange-50 rounded text-xs flex-grow">
                                        <span class="font-medium text-orange-700">RPDD:</span> {event.Candidate}
                                    </div>
                                </div>
                            </div>
                        {/if}
                        
                        <!-- PRV Award Events -->
                        {#if showPRV && event["PRV Issue Year"]}
                            <div class="timeline-item mb-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-16 text-xs text-right text-slate-500">
                                        {formatDate(event["PRV Issue Year"], event["PRV Issue Month"], event["Date"])}
                                    </div>
                                    <div class="h-3 w-3 rounded-full bg-teal-500 flex-shrink-0"></div>
                                    <div class="px-2 py-1 bg-teal-50 rounded text-xs flex-grow">
                                        <span class="font-medium text-teal-700">PRV Award:</span> {event.Candidate}
                                    </div>
                                </div>
                            </div>
                        {/if}
                        
                        <!-- PRV Sale Events -->
                        {#if showSales && event.Purchased === "Y" && event["Purchase Year"]}
                            <div class="timeline-item mb-2">
                                <div class="flex items-center gap-2">
                                    <div class="w-16 text-xs text-right text-slate-500">
                                        {formatDate(event["Purchase Year"], event["Purchase Month"], event["Purchase Date"])}
                                    </div>
                                    <div class="h-3 w-3 rounded-full bg-red-500 flex-shrink-0"></div>
                                    <div class="px-2 py-1 bg-red-50 rounded text-xs flex-grow">
                                        <span class="font-medium text-red-700">PRV Sale:</span> {event.Candidate} 
                                        {#if event["Sale Price (USD Millions)"] && event["Sale Price (USD Millions)"] !== "Undisclosed"}
                                            <span class="font-medium">(${event["Sale Price (USD Millions)"]}M)</span>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        {:else}
            <div class="text-center py-4 text-slate-500 text-sm">
                No milestone events found for this company
            </div>
        {/if}
    </div>
</div>

<style>
    .timeline-container {
        max-height: 200px;
        overflow-y: auto;
    }
    
    .timeline::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 18px;
        width: 1px;
        background-color: #e2e8f0;
    }
</style>
<script lang="ts">
    // Waffle chart data for drug lag comparison
    const prePMPData = {
        period: "Pre-PMP (2006-2009)",
        approvedWithin1Year: 18,
        approvedAfter1Year: 82,
        total: 100
    };
    
    const postPMPData = {
        period: "Post-PMP (2015-2019)",
        approvedWithin1Year: 71,
        approvedAfter1Year: 29,
        total: 100
    };

    // Generate waffle squares (10x10 grid = 100 squares)
    function generateWaffleSquares(approvedWithin1Year: number) {
        const squares = [];
        for (let i = 0; i < 100; i++) {
            squares.push({
                id: i,
                isApprovedWithin1Year: i < approvedWithin1Year
            });
        }
        return squares;
    }

    const prePMPSquares = generateWaffleSquares(prePMPData.approvedWithin1Year);
    const postPMPSquares = generateWaffleSquares(postPMPData.approvedWithin1Year);
</script>

<div class="chart-container flex flex-col md:flex-row align-start justify-center bg-slate-50 outline-1 outline-dashed outline-slate-200">
    <div class="flex flex-col w-full md:min-h-full justify-start bg-slate-200 py-12 md:px-6 gap-4 align-start md:w-1/6">
        <div class="flex flex-col gap-4 align-start">
            <h5 class="text-md font-semibold text-slate-700 text-left">
                Impact of <span class="font-mono text-sky-900">PMPs</span> on Drug Approval Timing
            </h5>
            <p class="text-sm text-slate-600 text-left">
                Percentage of drugs approved in Japan within 1 year of overseas approval. Each square represents 1% of domestically approved drugs.
            </p>
        </div>
    </div>
    
    <div class="visualization-container flex-1 p-6">
        <div class="flex flex-col lg:flex-row gap-16 md:gap-32 justify-center items-center md:ml-24">
            <!-- Pre-PMP Waffle Chart -->
            <div class="flex flex-col items-center">
                <h4 class="text-sm font-semibold text-slate-700 mb-4">
                    {prePMPData.period}
                </h4>
                <div class="grid grid-cols-10 gap-1 mb-4">
                    {#each prePMPSquares as square}
                        <div 
                            class="w-4 h-4 rounded-sm transition-all duration-200 hover:scale-110"
                            class:bg-red-400={square.isApprovedWithin1Year}
                            class:bg-slate-300={!square.isApprovedWithin1Year}
                            title={square.isApprovedWithin1Year ? "Approved within 1 year" : "Approved after 1 year"}
                        ></div>
                    {/each}
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-red-500 mb-1">
                        {prePMPData.approvedWithin1Year}%
                    </div>
                    <div class="text-sm text-slate-600">
                        approved within 1 year
                    </div>
                </div>
            </div>

            <!-- Post-PMP Waffle Chart -->
            <div class="flex flex-col items-center">
                <h4 class="text-sm font-semibold text-slate-700 mb-4">
                    {postPMPData.period}
                </h4>
                <div class="grid grid-cols-10 gap-1 mb-4">
                    {#each postPMPSquares as square}
                        <div 
                            class="w-4 h-4 rounded-sm transition-all duration-200 hover:scale-110"
                            class:bg-green-400={square.isApprovedWithin1Year}
                            class:bg-slate-300={!square.isApprovedWithin1Year}
                            title={square.isApprovedWithin1Year ? "Approved within 1 year" : "Approved after 1 year"}
                        ></div>
                    {/each}
                </div>
                <div class="text-center">
                    <div class="text-3xl font-bold text-green-500 mb-1">
                        {postPMPData.approvedWithin1Year}%
                    </div>
                    <div class="text-sm text-slate-600">
                        approved within 1 year
                    </div>
                </div>
            </div>
        </div>

    </div>
</div> 
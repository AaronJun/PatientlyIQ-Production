<!-- RPDDrugStatusBar.svelte -->
<script lang="ts">
    export let stage: string = "";
    export let hasVoucher: boolean = false;
    export let hasTransaction: boolean = false;

    function getStageAbbreviation(stage: string): string {
        const stageMap: { [key: string]: string } = {
            "Preclinical": "PRE",
            "Phase 1": "P1",
            "Phase 1/2": "P1/2",
            "Phase 2": "P2",
            "Phase 2a": "P2a",
            "Phase 2b": "P2b",
            "Phase 3": "P3",
            "FDA Approved": "APP",
            "Approved": "APP"
        };
        return stageMap[stage] || "TBD";
    }

    function getStageColor(stage: string): string {
        const colorMap: { [key: string]: string } = {
            "Preclinical": "bg-blue-100 text-blue-800",
            "Phase 1": "bg-indigo-100 text-indigo-800",
            "Phase 1/2": "bg-purple-100 text-purple-800",
            "Phase 2": "bg-fuchsia-100 text-fuchsia-800",
            "Phase 2a": "bg-fuchsia-100 text-fuchsia-800",
            "Phase 2b": "bg-fuchsia-100 text-fuchsia-800",
            "Phase 3": "bg-rose-100 text-rose-800",
            "FDA Approved": "bg-emerald-100 text-emerald-800",
            "Approved": "bg-emerald-100 text-emerald-800"
        };
        return colorMap[stage] || "bg-gray-100 text-gray-800";
    }
</script>

<div class="flex items-center gap-3 mt-2">
    <!-- Development Stage -->
    <div class="flex items-center">
        <div class={`w-6 h-6 rounded-full flex items-center justify-center text-[8.625px] font-bold ${getStageColor(stage)}`}>
            {getStageAbbreviation(stage)}
        </div>
    </div>

    <!-- Voucher Award Status -->
    <div class="flex items-center">
        <div class={`w-6 h-6 rounded-sm flex items-center justify-center text-[8.625px] font-bold ${hasVoucher ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-400'}`}>
            PRV
        </div>
    </div>

    <!-- Transaction Status -->
    <div class="flex items-center">
        <div class={`w-12 h-6 rounded-lg flex items-center justify-center text-[8.625px]  font-bold ${hasTransaction ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'}`}>
            SALE
        </div>
    </div>
</div>
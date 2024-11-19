<script lang="ts">
    import "carbon-components-svelte/css/all.css";
    export let year: string;
    export let rpdCount: string;
    export let rpdPrvCount: string;
</script>

<text class="summary-text">
    In {year}, there were {rpdCount} RPD designations and {rpdPrvCount} RPD PRV designations.
</text>

<style>
    .summary-text {
        font-size: 18px;
        fill: #333;
    }
</style>
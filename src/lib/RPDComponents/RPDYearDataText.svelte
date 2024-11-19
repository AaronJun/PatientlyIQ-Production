<script lang="ts">
    export let year: string;
    export let rpdCount: string;
    export let rpdPrvCount: string;
</script>

<g>
    <text class="year-text">{year}</text>
    <text class="rpd-value">RPD: {rpdCount}</text>
    <text class="rpd-prv-value">RPD PRV: {rpdPrvCount}</text>
</g>

<style>
    .year-text {
        font-size: 24px;
        font-weight: bold;
        fill: #333;
    }
    .rpd-value {
        font-size: 16px;
        fill: #1E90FF;
    }
    .rpd-prv-value {
        font-size: 16px;
        fill: #32CD32;
    }
</style>
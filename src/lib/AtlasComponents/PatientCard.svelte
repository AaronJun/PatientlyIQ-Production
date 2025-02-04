<script lang="ts">
    export let name: string;
    export let age: number;
    export let location: string;
    export let quote: string;
</script>

<div class="patient-card">
    <div class="patient-image">
    </div>
    <p class="patient-quote">"{quote}"</p>
    <h3 class="patient-name">{name}</h3>
    <p class="patient-details">{age} {location}</p>
</div>

<style>
    .patient-card {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        padding: 1rem;
        padding-bottom: 1.25rem;
        display: flex;
        flex-direction: column;
        align-items: left;
        text-align: left;
        margin: 1rem auto;
    }

    .patient-image {
        width: 120px;
        background-color: #005D5D;
        height: 120px;
        border-radius: 50%;
        overflow: hidden;
        margin-bottom: 1.5rem;
    }

    .patient-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .patient-quote {
        font-size: 1.2rem;
        margin-bottom: 1.5rem;
        line-height: 1.22;
        padding-bottom: 2rem;
        border-bottom: rgba(128, 128, 128, 0.5) 1px solid;

    }

    .patient-name {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .patient-details {
        font-size: .85rem;
        color: #666;
    }
</style>
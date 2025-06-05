<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    let chartContainer: HTMLCanvasElement;
    
    const data = {
        labels: ['2024', '2029'],
        datasets: [
            {
                label: 'Japan',
                data: [88, 92],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            },
            {
                label: 'US',
                data: [650, 750],
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1
            },
            {
                label: 'China',
                data: [450, 600],
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 1
            }
        ]
    };

    onMount(() => {
        const ctx = chartContainer.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Pharmaceutical Market Size (USD billions)',
                            font: {
                                family: 'IBM Plex Sans',
                                size: 16
                            }
                        },
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Market Size (USD billions)',
                                font: {
                                    family: 'IBM Plex Sans'
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Year',
                                font: {
                                    family: 'IBM Plex Sans'
                                }
                            }
                        }
                    }
                }
            });
        }
    });
</script>

<div class="mt-2 mb-4">
    <canvas bind:this={chartContainer} class="w-full mx-auto"></canvas>
</div>

<style>
    :global(.chart-container) {
        font-family: 'IBM Plex Sans', sans-serif;
    }
</style> 
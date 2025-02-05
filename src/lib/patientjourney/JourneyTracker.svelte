<script lang="ts">
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import "carbon-components-svelte/css/all.css";
    import journeyData from '$lib/data/testingJourneyMapInputs.json';

    export let id: string;
    
    // Find the corresponding data based on id
    $: stageData = journeyData.find(item => item.id.toString() === id) || {
        'Sentiment ': 0,
        'Complexity ': 0,
        'Duration': 0
    };

    let previewHeight = tweened(20, {
        duration: 400,
        easing: cubicOut
    });

    function getSquares(value: number, type: string) {
        const squares = [];
        previewHeight.set(100);
        for (let i = 1; i <= 5; i++) {
            squares.push({
                filled: i <= value,
                color: getColorForType(type)
            });
        }
        return squares;
    }

    function getColorForType(type: string) {
        switch(type) {
            case 'sentiment':
                return '#FF9AD1';
            case 'complexity':
                return '#9DBFF1';
            case 'duration':
                return '#DDDDDD';
            default:
                return '#432eaa';
        }
    }
</script>
<div class="sentiment-container">
    <div class="sentiment-row">
        <h3 class="sentiment-title uppercase text-xs text-slate-600">Journey sentiment</h3>
        <div class="squares">
            {#each getSquares(stageData['Sentiment '], 'sentiment') as square}
                <div class="square" 
                    style="background-color: {square.filled ? square.color : 'transparent'}; 
                           border-color: {square.color};">
                </div>
            {/each}
        </div>
    </div>

    <div class="sentiment-row">
        <h3 class="sentiment-title uppercase text-xs text-slate-600">Journey complexity</h3>
        <div class="squares">
            {#each getSquares(stageData['Complexity '], 'complexity') as square}
                <div class="square" 
                    style="background-color: {square.filled ? square.color : 'transparent'}; 
                           border-color: {square.color};">
                </div>
            {/each}
        </div>
    </div>

    <div class="sentiment-row">
        <h3 class="sentiment-title uppercase text-xs text-slate-600">Stage duration</h3>
        <div class="squares">
            {#each getSquares(stageData.Duration, 'duration') as square}
                <div class="square" 
                    style="background-color: {square.filled ? square.color : 'transparent'}; 
                           border-color: {square.color};">
                </div>
            {/each}
        </div>
    </div>
</div>

<style>

    h4 {
        font-size: 0.82rem;
        font-weight: 800;
        font-family: 'IBM Plex Sans', sans-serif;
        margin-bottom: 1.25rem;
        color: #03060B;
    }

    .sentiment-container {
        width: 100%;
    }

    .sentiment-row {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.625rem;
        border-bottom: 0.5px solid #DDDDDD;
    }
    .sentiment-row h3 {
        margin-right: 0.5rem;
        width: 100%;
        font-weight: 500;
        color: #fff;
    }

    .squares {
        display: flex;
        transition: 0.67s ease-in;
    }

    .square {
        width: 12px;
        height: 12px;
        border: .5px solid;
        margin-right: 4px;
        transition: 0.5s ease-in;
    }

    .sentiment-title {
        font-weight: 800;
        font-family: 'IBM Plex Sans';
    }
</style>
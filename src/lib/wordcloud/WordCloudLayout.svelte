<!-- WordCloudLayout.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    
    export let words = [];
    export let width = 300;
    export let height = 200;
    export let padding = 3;
    export let rotate = 0;
    export let fontSize = 10;
    
    let transformedWords = [];
    
    $: if (words) {
        calculateLayout();
    }
    
    function calculateLayout() {
        const minSize = Math.min(...words.map(w => w.value));
        const maxSize = Math.max(...words.map(w => w.value));
        
        const sizeScale = d3.scaleLinear()
            .domain([minSize, maxSize])
            .range([fontSize, fontSize * 2]);
            
        transformedWords = words.map(w => ({
            text: w.text,
            size: sizeScale(w.value),
            x: Math.random() * width - width/2,
            y: Math.random() * height - height/2,
            rotate: typeof rotate === 'function' ? rotate() : rotate
        }));
        
        // Basic collision detection
        for (let i = 0; i < transformedWords.length; i++) {
            let word1 = transformedWords[i];
            for (let j = i + 1; j < transformedWords.length; j++) {
                let word2 = transformedWords[j];
                let dx = word2.x - word1.x;
                let dy = word2.y - word1.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < (word1.size + word2.size)/2 + padding) {
                    let angle = Math.atan2(dy, dx);
                    let moveDistance = ((word1.size + word2.size)/2 + padding - distance)/2;
                    
                    word1.x -= Math.cos(angle) * moveDistance;
                    word1.y -= Math.sin(angle) * moveDistance;
                    word2.x += Math.cos(angle) * moveDistance;
                    word2.y += Math.sin(angle) * moveDistance;
                }
            }
        }
    }
</script>

<slot {transformedWords} />

<style>
    /* Add any necessary styles */
</style>
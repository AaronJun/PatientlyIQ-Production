<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import "carbon-components-svelte/css/all.css";
</script>

<div class="min-h-screen bg-cream">
    <main class="max-w-2xl mx-auto px-4 py-16">
        <section class="prose">
            <h3 class=" text-sm font-bold mb-6">Methodology</h3>
            
            <div class="space-y-1 text-slate-800 text-sm leading-normals">
                <p class="text-sm font-serif">Our analysis draws from a systematic review of online conversations about APOE4 experiences across multiple platforms from 2022-2024. We collected and analyzed:</p>
                
                <ul class="list-disc text-sm font-serif pl-5 mt-4 mb-6 space-y-1">
                    <li>350+ unique posts and comments from APOE4 carriers and caregivers</li>
                    <li>Content from specialized forums, social media, and support groups</li>
                    <li>Five distinct journey stages: Initial Discovery, Initial Planning, Day-to-Day Management, New Treatment Consideration, and Long-Term Planning</li>
                </ul>

                <div class="mt-8">
                <h3 class="text-sm font-bold mb-6 mt-4">Each post was coded for:</h3>
                <ul class="list-disc text-sm font-serif pl-5 mt-4 space-y-1">
                    <li>Sentiment (Entirely Negative to Entirely Positive)</li>
                    <li>Primary concerns and challenges</li>
                    <li>Coping strategies and support systems</li>
                    <li>Treatment perspectives and decisions</li>
                    <li>Timeline position in the APOE4 journey</li>
                </ul>
                

                <p class="text-sm font-serif mt-4">To protect privacy, all quotes have been anonymized and lightly edited for clarity. Some details have been altered to prevent identification while preserving the essential meaning of experiences shared.</p>

                </div>
                <div class="mt-8">
                    <h4 class="text-sm font-bold mb-6 mt-4">Limitations</h4>
                    
                    <ul class="list-disc text-sm font-serif pl-5 space-y-1">
                        <li>Our dataset primarily reflects English-language conversations</li>
                        <li>Online communities may not represent all APOE4 carriers and caregivers</li>
                        <li>Self-selection bias toward individuals seeking support or information</li>
                        <li>Limited demographic data available for most participants</li>
                    </ul>
                </div>
            </div>
        </section>
    </main>
</div>
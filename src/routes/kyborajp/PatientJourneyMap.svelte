<script lang="ts">
    export let journey: {
        stage: string;
        sentiment: string;
        actions: string[];
        hopes: string;
        fears: string;
    }[];

    const getSentimentColor = (sentiment: string) => {
        const colors = {
            'entirely_positive': 'bg-green-500',
            'positive': 'bg-green-300',
            'neutral': 'bg-gray-300',
            'somewhat_negative': 'bg-red-300',
            'entirely_negative': 'bg-red-500'
        };
        return colors[sentiment] || 'bg-gray-300';
    };

    const getSentimentEmoji = (sentiment: string) => {
        const emojis = {
            'entirely_positive': '😄',
            'positive': '🙂',
            'neutral': '😐',
            'somewhat_negative': '🙁',
            'entirely_negative': '😢'
        };
        return emojis[sentiment] || '😐';
    };
</script>

<div class="space-y-8">
    {#each journey as stage, index}
        <div class="relative">
            <!-- Timeline line -->
            {#if index < journey.length - 1}
                <div class="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            {/if}
            
            <div class="flex gap-8">
                <!-- Timeline marker -->
                <div class="relative z-10 flex-shrink-0">
                    <div class="w-8 h-8 rounded-full border-4 border-white dark:border-neutral-900 {getSentimentColor(stage.sentiment)} flex items-center justify-center">
                        <span class="text-xs">{getSentimentEmoji(stage.sentiment)}</span>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="flex-grow space-y-4">
                    <h3 class="text-lg font-semibold">{stage.stage}</h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Actions -->
                        <div class="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                            <h4 class="font-medium mb-2 text-sm text-gray-500 dark:text-gray-400">Actions</h4>
                            <ul class="list-disc list-inside text-sm space-y-1">
                                {#each stage.actions as action}
                                    <li>{action}</li>
                                {/each}
                            </ul>
                        </div>
                        
                        <!-- Hopes -->
                        <div class="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                            <h4 class="font-medium mb-2 text-sm text-gray-500 dark:text-gray-400">Hopes</h4>
                            <p class="text-sm">{stage.hopes}</p>
                        </div>
                        
                        <!-- Fears -->
                        <div class="bg-gray-50 dark:bg-neutral-800 p-4 rounded-lg">
                            <h4 class="font-medium mb-2 text-sm text-gray-500 dark:text-gray-400">Fears</h4>
                            <p class="text-sm">{stage.fears}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>
<script lang="ts">
    import { cn } from "$lib/utils";
  
    let className: any = "p-4";
    export { className as class };
    
    export let cardContent: {
        title: string;
        description: string;
    };
</script>

<div class={cn("text-left", className)}>
    <!-- Header row with icon and title -->
    <div class="flex items-center gap-3 mb-3">
        <!-- Icon slot -->
        <div class="flex-shrink-0">
            <slot />
        </div>
        <!-- Title - now using the same color as the icon -->
        <h3 class="text-xs font-semibold tracking-wide text-orange-600 group-hover:text-[#ff6b6b] transition-colors">
            {cardContent.title}
        </h3>
    </div>
    <!-- Description with proper spacing -->
    <div class="pb-4 pl-2">
        <p class="text-sm tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed">
            {cardContent.description}
        </p>
    </div>
</div>
<script lang="ts">
  import { ArrowRightIcon } from 'lucide-svelte';

  export let title: string = "";
  export let description: string = "";
</script>

<div class="grid border-t border-[#ff1515] dark:border-[#790808]">
  <div class="flex items-start gap-0">
      <!-- Left side slot for icon/image -->
          <slot name="icon">
              <!-- Default empty space for icon alignment -->
          </slot>
      </div>

      <!-- Content -->
      <div class="flex-1">
          {#if title}
              <h3 class="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
                  {title}
              </h3>
          {/if}

          {#if description}
              <p class="mb-2 text-base text-zinc-600 dark:text-zinc-300">
                  {description}
            </p>
          {/if}

          <!-- Default slot -->
          <slot></slot>
      </div>
  </div>

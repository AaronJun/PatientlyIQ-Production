<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLAttributes } from 'svelte/elements';

  interface $$Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    class?: string;
  }

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<div class={cn("l-split__one-bottom", className)} {...$$restProps}>
  <slot />
</div>

<style>
  .l-split__one-bottom {
    align-self: flex-end;
    column-gap: 77.4286px;
    display: flex;
    flex-direction: column;
    row-gap: 77.4286px;
  }

  @media (max-width: 1023px) {
    .l-split__one-bottom {
      grid-row-end: one-bottom-end;
      grid-row-start: one-bottom-start;
    }
  }

  @media (min-width: 1024px) {
    .l-split__one-bottom {
      align-content: end;
      grid-column-end: one-end;
      grid-column-start: one-start;
      grid-row-end: bottom-end;
      grid-row-start: bottom-start;
    }
  }
</style> 
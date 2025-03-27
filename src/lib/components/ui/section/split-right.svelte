<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLAttributes } from 'svelte/elements';

  interface $$Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    class?: string;
  }

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<div class={cn("l-split__two", className)} {...$$restProps}>
  <slot />
</div>

<style>
  .l-split__two {
    column-gap: 77.4286px;
    display: flex;
    flex-direction: column;
    position: relative;
    row-gap: 77.4286px;
  }

  @media (max-width: 1023px) {
    .l-split__two {
      grid-row-end: two-end;
      grid-row-start: two-start;
    }
  }

  @media (min-width: 1024px) {
    .l-split__two {
      grid-column-end: two-end;
      grid-column-start: two-start;
      grid-row-end: bottom-end;
      grid-row-start: top-start;
    }
  }
</style> 
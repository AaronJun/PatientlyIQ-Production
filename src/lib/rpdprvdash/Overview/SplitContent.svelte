<script lang="ts">
  export let className = '';
</script>

<div class="l-split {className}" {...$$restProps}>
  <slot />
</div>

<style>
  .l-split {
    column-gap: var(--size-grid-gutter);
    display: grid;
    row-gap: var(--size-40);
  }

  @media (max-width: 1023px) {
    .l-split {
      grid-template-rows: [one-top-start] auto [one-top-end one-bottom-start] auto [one-bottom-end two-start] auto [two-end];
    }
  }

  @media (min-width: 1024px) {
    .l-split {
      grid-template-columns: [one-start] 1fr [one-end two-start] 1fr [two-end];
      grid-template-rows: [top-start] auto [top-end bottom-start] auto [bottom-end];
    }
  }
</style> 
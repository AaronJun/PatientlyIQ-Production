<script lang="ts">
  export let className = '';
</script>

<div class="l-split__one-top {className}" {...$$restProps}>
  <slot />
</div>

<style>
  .l-split__one-top {
    align-self: flex-start;
    column-gap: 77.4286px;
    display: flex;
    flex-direction: column;
    row-gap: 77.4286px;
  }

  @media (max-width: 1023px) {
    .l-split__one-top {
      grid-row-end: one-top-end;
      grid-row-start: one-top-start;
    }
  }

  @media (min-width: 1024px) {
    .l-split__one-top {
      grid-column-end: one-end;
      grid-column-start: one-start;
      grid-row-end: top-end;
      grid-row-start: top-start;
    }
  }

  @media (min-width: 1024px) {
    :global(.l-split__one-top > .text-set) {
      margin-right: 8%;
    }
  }
</style> 
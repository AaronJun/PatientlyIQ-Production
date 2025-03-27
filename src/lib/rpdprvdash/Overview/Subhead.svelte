<script lang="ts">
  export let swatchColor = undefined;
  export let showSwatch = false;
  export let className = '';

  $: customStyle = swatchColor ? `--custom-swatch-color: ${swatchColor};` : '';
</script>

<div class="subhead {className}" style={customStyle} {...$$restProps}>
  {#if showSwatch}
    <div class="subhead__swatch">
      <span class="swatch"></span>
    </div>
  {/if}
  <div class="subhead__text">
    <slot />
  </div>
</div>

<style>
  .subhead {
    display: inline-flex;
  }

  .subhead__swatch {
    margin-right: .8rem;
    margin-top: .45rem;
  }

  .subhead__text {
    font-family: "Atlas Typewriter", "Helvetica Neue", arial, sans-serif;
    font-size: 1.4rem;
    font-weight: 400;
    letter-spacing: -.02em;
    line-height: 1.5;
  }

  .swatch {
    aspect-ratio: 1/1;
    background-color: var(--custom-swatch-color, var(--highlight-color, #6d28d9));
    display: block;
    transition: background-color .3s cubic-bezier(.23, 1, .32, 1);
    transition-behavior: normal;
    width: 1.2rem;
  }
</style> 
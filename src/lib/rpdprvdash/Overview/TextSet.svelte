<script lang="ts">
  export let size = "m";
  export let subheaderSpacingScale = undefined;
  export let className = '';

  $: customStyle = subheaderSpacingScale ? `--subheader-spacing-scale: ${subheaderSpacingScale};` : '';
</script>

<div 
  class="text-set text-set--{size} {className}" 
  style={customStyle}
  {...$$restProps}
>
  {#if $$slots.subheader}
    <div class="text-set__subheader">
      <slot name="subheader" />
    </div>
  {/if}

  {#if $$slots.heading}
    <h3 class="text-set__heading">
      <slot name="heading" />
    </h3>
  {/if}

  {#if $$slots.default}
    <div class="text-set__text">
      <slot />
    </div>
  {/if}

  {#if $$slots.footer}
    <div class="text-set__foot">
      <slot name="footer" />
    </div>
  {/if}
</div>

<style>
  .text-set {
    display: flex;
    flex-direction: column;
  }

  .text-set__heading {
    padding-bottom: .06em;
  }

  .text-set__foot {
    margin-top: auto;
  }

  .text-set__subheader {
    --scale: var(--subheader-spacing-scale, 1);
  }

  .text-set__subheader:global(:has(.subhead)) {
    padding-bottom: calc(var(--size-40)*var(--scale));
  }

  .text-set__subheader:global(:has(.icon-text)), 
  .text-set__subheader:global(:has(.subhead .swatch)) {
    padding-bottom: calc(var(--size-16)*var(--scale));
  }

  .text-set__foot:global(:has(.button-basic)) {
    padding-top: var(--size-40);
  }

  .text-set--s .text-set__heading {
    font-family: National, "Helvetica Neue", arial, sans-serif;
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 1.2;
  }

  @media (min-width: 768px) {
    .text-set--s .text-set__heading {
      font-size: 2.2rem;
    }
  }

  .text-set--s .text-set__text {
    font-family: "Atlas Grotesk", "Helvetica Neue", arial, sans-serif;
    font-size: 1.6rem;
    font-weight: 400;
    line-height: 1.4;
  }

  @media (min-width: 1024px) {
    .text-set--s .text-set__text {
      font-size: 1.8rem;
    }
  }

  .text-set--s .text-set__text:not(:first-child) {
    margin-top: 1rem;
  }

  .text-set--m .text-set__heading {
    font-family: National, "Helvetica Neue", arial, sans-serif;
    font-size: 30px;
    font-weight: 400;
    letter-spacing: -.02em;
    line-height: 1;
  }

  @media (min-width: 320px) {
    .text-set--m .text-set__heading {
      font-size: calc(24.8571px + 1.60714vw);
    }
  }

  @media (min-width: 1440px) {
    .text-set--m .text-set__heading {
      font-size: 48px;
    }
  }
</style> 
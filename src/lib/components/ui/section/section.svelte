<script lang="ts">
  import { cn } from "$lib/utils";
  import type { SectionProps, SectionEvents } from "./index";

  type $$Props = SectionProps;
  type $$Events = SectionEvents;

  export let max = false;
  export let spaceTop = false;
  export let spaceBottom = false;
  export let bgDark = false;
  export let backgroundColor: $$Props["backgroundColor"] = undefined;
  export let highlightColor: $$Props["highlightColor"] = undefined;
  export let id: $$Props["id"] = undefined;

  let className: $$Props["class"] = undefined;
  export { className as class };

  // Create CSS variables for dynamic colors
  $: customStyle = [
    backgroundColor ? `--theme-bg: ${backgroundColor};` : '',
    highlightColor ? `--highlight-color: ${highlightColor};` : '',
  ].filter(Boolean).join(' ');
</script>

<section
  {id}
  class={cn(
    "l-section",
    max && "l-section--max",
    spaceTop && "l-section--space-top",
    spaceBottom && "l-section--space-bottom",
    bgDark && "l-section--bg-dark",
    className
  )}
  style={customStyle}
  data-module-reveal="fade"
  {...$$restProps}
>
  <div class="l-section__inner">
    <slot />
  </div>
</section>

<style>
  :global(:root) {
    --size-outer: calc(25px + 75 * (100vw - 320px) / 1480);
    --size-section-vertical: calc(80px + 20 * (100vw - 320px) / 1120);
    --size-grid-gutter: calc(20px + 4 * (100vw - 320px) / 1480);
    --size-40: 40px;
    --size-rule-spacing: 10px;
    --size-grid-column-padding-right: calc(0px + .0625*(100vw - 320px));
    --size-16: 16px;
  }

  .l-section {
    position: relative;
    transition: background-color .15s;
    transition-behavior: normal;
  }

  .l-section--max {
    padding-left: var(--size-outer);
    padding-right: var(--size-outer);
  }

  .l-section--max .l-section__inner {
    margin-left: auto;
    margin-right: auto;
    max-width: 1600px;
  }

  .l-section--space-top {
    padding-top: var(--size-section-vertical);
  }

  .l-section--space-bottom {
    padding-bottom: var(--size-section-vertical);
  }

  .l-section--bg-dark {
    background-color: var(--theme-bg, #151515);
    color: var(--theme-text, #fff);
    --theme-text: #fff;
    --theme-bg: #151515;
  }

  /* Animation styles for reveal effect */
  @media screen and (prefers-reduced-motion:no-preference) {
    [data-module-reveal=fade] {
      opacity: 0;
      transform: translateY(0);
      transition-behavior: normal;
      transition-delay: 0s;
      transition-duration: 1s;
      transition-property: opacity, transform;
      transition-timing-function: cubic-bezier(.23, 1, .32, 1);
    }
  }

  @media screen and (prefers-reduced-motion:no-preference) and (prefers-reduced-motion) {
    [data-module-reveal=fade] {
      transition-duration: 0s;
    }
  }

  @media screen and (prefers-reduced-motion:no-preference) {
    [data-module-reveal=fade].is-visible {
      opacity: 1;
      transform: translateY(0) translate(0) scale(1);
    }
  }
</style> 
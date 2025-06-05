<script>
  // This layout file ensures proper routing for the PLHD legacy site
  // Reset the parent layout to avoid inheriting the root header and footer
  export const layoutName = "plhd";
</script>

<!-- This is a layout reset - it doesn't inherit the root layout -->
<slot />

<style>
  /* Reset any global styles that might interfere with the legacy site */
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }
  
  /* Ensure the legacy content can take up the full viewport */
  :global(body) {
    min-height: 100vh;
  }
</style> 
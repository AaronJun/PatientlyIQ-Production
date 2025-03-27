<script>
  import { Section, SplitContent, SplitTopLeft, SplitBottomLeft, SplitRight, TextSet, Subhead } from '$lib/components/ui/section';
</script>

<svelte:head>
  <title>Section Component Example</title>
</svelte:head>

<main>
  <!-- Example of a section with max width and spacing -->
  <Section max spaceTop spaceBottom>
    <TextSet>
      <svelte:fragment slot="subheader">
        <Subhead showSwatch swatchColor="#4361ee">INTRODUCING</Subhead>
      </svelte:fragment>
      <svelte:fragment slot="heading">
        Modern Section Layout Components
      </svelte:fragment>
      <p>
        This example demonstrates how to use the new section components to create beautiful, responsive layouts.
        These components are designed to work together to create consistent spacing and alignment.
      </p>
    </TextSet>
  </Section>

  <!-- Example of a split section with content on both sides -->
  <Section max spaceTop spaceBottom bgDark>
    <SplitContent>
      <SplitTopLeft>
        <TextSet>
          <svelte:fragment slot="subheader">
            <Subhead>LEFT SIDE</Subhead>
          </svelte:fragment>
          <svelte:fragment slot="heading">
            Split Content Layout
          </svelte:fragment>
          <p>
            This demonstrates a split layout with content on the left and right sides.
            On mobile, this will stack vertically in a logical order.
          </p>
        </TextSet>
      </SplitTopLeft>
      
      <SplitRight>
        <TextSet size="s">
          <svelte:fragment slot="heading">
            Right Side Content
          </svelte:fragment>
          <p>
            The right side can contain any content, such as text, images, or other components.
            This side spans the full height of the section in desktop layouts.
          </p>
          <p>
            The TextSet component can be configured with different sizes and spacing options.
          </p>
        </TextSet>
      </SplitRight>
    </SplitContent>
  </Section>

  <!-- Example with custom colors -->
  <Section max spaceTop spaceBottom backgroundColor="#240046" highlightColor="#ff9e00">
    <SplitContent>
      <SplitTopLeft>
        <TextSet>
          <svelte:fragment slot="subheader">
            <Subhead showSwatch>CUSTOM COLORS</Subhead>
          </svelte:fragment>
          <svelte:fragment slot="heading">
            Customizable Look & Feel
          </svelte:fragment>
          <p>
            Each section can have custom background colors and highlight colors,
            allowing for consistent theming throughout your application.
          </p>
        </TextSet>
      </SplitTopLeft>
      
      <SplitBottomLeft>
        <TextSet size="s">
          <svelte:fragment slot="heading">
            Bottom Left Content
          </svelte:fragment>
          <p>
            On desktop, this content appears at the bottom left of the grid.
          </p>
        </TextSet>
      </SplitBottomLeft>
      
      <SplitRight>
        <TextSet size="s">
          <svelte:fragment slot="heading">
            Flexible Grid System
          </svelte:fragment>
          <p>
            The split layout provides a flexible grid system that adapts to different screen sizes.
          </p>
        </TextSet>
      </SplitRight>
    </SplitContent>
  </Section>
</main>

<style>
  :global(html) {
    font-size: 10px; /* Base font size to support rem units */
  }
  
  :global(body) {
    background: #eee;
    margin: 0;
    padding: 0;
    font-family: "Helvetica Neue", arial, sans-serif;
    line-height: 1;
  }
  
  :global(p) {
    margin: 0;
    font-size: 1.6rem;
  }
  
  :global(p:not(:first-child)) {
    margin-top: 1rem;
  }
</style> 
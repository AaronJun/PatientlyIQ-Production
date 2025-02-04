<script lang="ts">
  import 'carbon-components-svelte/css/all.css';  
  import { Popover, Button } from 'carbon-components-svelte';

  let open = true;
  let ref: HTMLDivElement | null = null;

  </script>
  
  <div bind:this={ref} style:position="relative">
    <Button on:click={() => (open = !open)}>Toggle popover</Button>
    <Popover
      bind:open
      align="bottom-left"
      on:click:outside={({ detail }) => {
        console.log("on:click:outside");
        open = ref.contains(detail.target);
      }}
      >

      <div style="padding: var(--cds-spacing-05)">Content</div>
    </Popover>
  </div>
<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  $: routeID = $page.url.pathname.split("/");

  import { resetMode, setMode } from "mode-watcher";
    import NewNavbar from "$lib/components/dev/Navbar/NewNavbar.svelte";
  setMode("dark");
  let pageWidth = 0;
</script>

<svelte:window bind:innerWidth={pageWidth} />
<ModeWatcher />
<!-- {#if pageWidth > 1023 && routeID[1] === "examples"}
  <Navbar />
{:else if routeID[1] === ""}
  <Navbar />
{/if} -->
<NewNavbar />
<div>
  <slot />
</div>

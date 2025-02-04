<script lang="ts">  
    import WorldMap from './WorldMap.svelte';
  </script>
  
  <main>
    <h1>World Map</h1>
    <WorldMap />
  </main>
  
  <style>
    main {
      text-align: center;
      padding: 1em;
      min-width: 50vw;
      max-width: 65vw;
      margin: 0 auto;
    }
  
    h1 {
      color: #ff3e00;
      text-transform: uppercase;
      font-size: 4em;
      font-weight: 100;
    }
  
    @media (min-width: 640px) {
      main {
        max-width: none;
      }
    }
  </style>
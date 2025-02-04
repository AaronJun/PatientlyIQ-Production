<script lang="ts">
    import { slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
  
    export let isOpen: boolean = false;
    export let backgroundColor: string = '#ffffff';
    export let onClose: () => void;
    export let sentiment: string = '';
    export let quote: string = '';
  </script>
  
  {#if isOpen}
    <div class="drawer-overlay" on:click={onClose}></div>
    <div 
      class="drawer" 
      style="background-color: {backgroundColor};"
      transition:slide={{ duration: 300, easing: quintOut, axis: 'x' }}
    >
      <button class="close-btn" on:click={onClose}>&times;</button>
      <div class="drawer-content">
        <h2>Sentiment: {sentiment}</h2>
        <p class="quote">"{quote}"</p>
      </div>
    </div>
  {/if}
  
  <style>
    .drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 998;
    }
  
    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 80vw;
      max-width: 600px;
      height: 100%;
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
      z-index: 999;
      padding: 20px;
      box-sizing: border-box;
    }
  
    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 24px;
      background: none;
      border: none;
      cursor: pointer;
    }
  
    .drawer-content {
      margin-top: 40px;
    }
  
    h2 {
      margin-bottom: 20px;
    }
  
    .quote {
      font-style: italic;
      font-size: 18px;
    }
  </style>
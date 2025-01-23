<script lang="ts">
  import { createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { cn } from '$lib/utils';

  export let value: string = undefined;
  export let defaultValue: string = undefined;
  let className: string = undefined;
  export { className as class };

  const dispatch = createEventDispatcher();
  
  // Create a store for the selected value
  const selectedValue = writable(value ?? defaultValue);

  // Update store when value prop changes
  $: selectedValue.set(value);

  // Subscribe to store changes to emit events
  selectedValue.subscribe((newValue) => {
    if (newValue !== undefined) {
      dispatch('change', { value: newValue });
      // Update the bound value if it exists
      if (value !== undefined) {
        value = newValue;
      }
    }
  });

  // Set up context for child components
  setContext('tabs', {
    selectedValue,
    register: (value: string) => {
      return {
        isSelected: selectedValue.subscribe((current) => current === value)
      };
    }
  });
</script>

<div class={cn('', className)} {...$$restProps}>
  <slot />
</div>
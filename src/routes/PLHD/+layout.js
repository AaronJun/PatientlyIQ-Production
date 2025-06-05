// This is a layout reset configuration for SvelteKit
// It tells SvelteKit to use this layout as a new root layout, not inheriting from any parent layouts

export const layoutConfig = {
  reset: true
};

// We also export a flag for parent layouts to check if they should render their components
export function load() {
  return {
    header: false, // Flag to indicate header should be hidden
    footer: false  // Flag to indicate footer should be hidden
  };
} 
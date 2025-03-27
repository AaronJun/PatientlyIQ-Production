import type { HTMLAttributes } from 'svelte/elements';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'class'> {
  /**
   * Custom classes to apply to the section
   */
  class?: string;
  /**
   * Whether to add max width constraints
   */
  max?: boolean;
  /**
   * Whether to add space at the top
   */
  spaceTop?: boolean;
  /**
   * Whether to add space at the bottom
   */
  spaceBottom?: boolean;
  /**
   * Whether to use dark background
   */
  bgDark?: boolean;
  /**
   * Custom id for the section
   */
  id?: string;
  /**
   * Custom background color
   */
  backgroundColor?: string;
  /**
   * Custom highlight color for elements
   */
  highlightColor?: string;
}

export type SectionEvents = {
  // Events can be defined if needed
} 
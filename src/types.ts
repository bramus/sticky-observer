export interface StickyObserverOptions {
  /** If true, shows outlines on subject and sentinels, and logs to console. */
  debug?: boolean;
  /** * Optional scroll container to use as the IntersectionObserver root.
   * If not provided, defaults to the browser viewport.
   */
  container?: HTMLElement;
  /**
   * If true, the element remains stuck even when the bottom of the container
   * scrolls past the viewport. It only unsticks when scrolling back up to the top.
   */
  remainStickyBeyondStickyEdge?: boolean;
}

export interface StickyChangeDetail {
  target: HTMLElement;
  stuck: boolean;
}

export type StickyState = {
  topStuck: boolean;
  bottomStuck: boolean;
  isStuck: boolean;
};

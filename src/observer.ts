import { createSentinel } from "./sentinel";
import {
  StickyObserverOptions,
  StickyChangeDetail,
  StickyState,
} from "./types";

/**
 * StickyObserver
 * Implements the "Sticky Events" pattern using two sentinels and specific coordinate logic.
 * Reference: https://ebidel.github.io/demos/sticky-position-event.html
 */
export class StickyObserver extends EventTarget {
  private headerObserver: IntersectionObserver | null = null;
  private footerObserver: IntersectionObserver | null = null;
  private sentinels: WeakMap<Element, HTMLElement>;
  private stateMap: WeakMap<HTMLElement, StickyState>;
  private debug: boolean;
  private remainStickyBeyondStickyEdge: boolean;

  constructor() {
    super();
    this.sentinels = new WeakMap();
    this.stateMap = new WeakMap();
    this.debug = false;
    this.remainStickyBeyondStickyEdge = false;
  }

  /**
   * Static factory method.
   * @param selector - The CSS selector to observe.
   * @param options - Configuration object.
   */
  static observe(
    selector: string,
    options: StickyObserverOptions = {},
  ): StickyObserver {
    const instance = new StickyObserver();
    instance.debug = options.debug || false;
    instance.remainStickyBeyondStickyEdge = options.remainStickyBeyondStickyEdge || false;
    instance._init(selector, options.container);
    return instance;
  }

  private _init(selector: string, rootContainer?: HTMLElement): void {
    const targets = document.querySelectorAll<HTMLElement>(selector);

    // 1. Setup Observers
    this.headerObserver = new IntersectionObserver(
      (entries) => this._handleHeaderIntersect(entries),
      { threshold: [0], root: rootContainer || null },
    );

    this.footerObserver = new IntersectionObserver(
      (entries) => this._handleFooterIntersect(entries),
      { threshold: [1], root: rootContainer || null },
    );

    targets.forEach((target) => {
      const parent = target.parentElement as HTMLElement;
      if (!parent) return;

      const parentStyle = getComputedStyle(parent);
      if (parentStyle.position !== "relative") {
        console.warn(
          `[StickyObserver] Warning: The parent element of the sticky target is statically positioned. ` +
            `Sticky sentinels require a positioned parent. Automatically setting 'position: relative' on:`,
          parent,
        );
        parent.style.position = "relative";
      }

      this.stateMap.set(target, {
        topStuck: false,
        bottomStuck: true,
        isStuck: false,
      });

      const topSentinel = createSentinel("top", this.debug);
      const bottomSentinel = createSentinel("bottom", this.debug);

      parent.insertBefore(topSentinel, parent.firstChild);
      parent.appendChild(bottomSentinel);

      this.sentinels.set(topSentinel, target);
      this.sentinels.set(bottomSentinel, target);

      this.headerObserver!.observe(topSentinel);
      this.footerObserver!.observe(bottomSentinel);

      if (this.debug) {
        target.style.outline = "3px dashed blue";
        target.setAttribute("data-sticky-subject", "true");
      }
    });
  }

  private _handleHeaderIntersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach((record) => {
      const target = this.sentinels.get(record.target);
      if (!target) return;
      const state = this.stateMap.get(target);
      if (!state) return;

      const targetInfo = record.boundingClientRect;
      const rootBoundsInfo = record.rootBounds;
      if (!rootBoundsInfo) return;

      if (targetInfo.bottom < rootBoundsInfo.top) {
        state.topStuck = true;
      } else if (
        targetInfo.bottom >= rootBoundsInfo.top &&
        targetInfo.bottom < rootBoundsInfo.bottom
      ) {
        state.topStuck = false;
      }

      this._reconcile(target, state);
    });
  }

  private _handleFooterIntersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach((record) => {
      const target = this.sentinels.get(record.target);
      if (!target) return;
      const state = this.stateMap.get(target);
      if (!state) return;

      const targetInfo = record.boundingClientRect;
      const rootBoundsInfo = record.rootBounds;
      const ratio = record.intersectionRatio;
      if (!rootBoundsInfo) return;

      if (targetInfo.bottom > rootBoundsInfo.top && ratio === 1) {
        state.bottomStuck = true;
      } else if (
        targetInfo.top < rootBoundsInfo.top &&
        targetInfo.bottom < rootBoundsInfo.bottom
      ) {
        state.bottomStuck = false;
      }

      this._reconcile(target, state);
    });
  }

  private _reconcile(target: HTMLElement, state: StickyState): void {
    const isStuck =
      state.topStuck && (this.remainStickyBeyondStickyEdge || state.bottomStuck);

    if (isStuck !== state.isStuck) {
      state.isStuck = isStuck;
      this._fire(isStuck, target);
    }
  }

  private _fire(stuck: boolean, target: HTMLElement): void {
    const event = new CustomEvent<StickyChangeDetail>("sticky-change", {
      detail: { target, stuck },
    });
    this.dispatchEvent(event);
    target.classList.toggle("is-stuck", stuck);

    if (this.debug) {
      console.log(`[StickyObserver] ${stuck ? "STUCK" : "UNSTUCK"}`, target);
    }
  }

  public disconnect(): void {
    this.headerObserver?.disconnect();
    this.footerObserver?.disconnect();
  }
}

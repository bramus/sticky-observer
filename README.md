# Sticky Observer

Observe CSS `position: sticky` elements getting stuck or unstuck.

It implements [the "Sticky Events" pattern using sentinels and `IntersectionObserver`](https://developer.chrome.com/docs/css-ui/sticky-headers), allowing you to react to changes in the sticky state of an element.

## Installation

```bash
npm install sticky-observer
```

## Usage

### Basic Usage

1. Import `StickyObserver` in your project.
2. Call `StickyObserver.observe()` with a CSS selector for the elements you want to watch.
3. Listen for the `sticky-change` event on the observer instance.

```typescript
import { StickyObserver } from 'sticky-observer';

// Initialize and observe elements matching the selector
const observer = StickyObserver.observe('h2');

// Listen for state changes
observer.addEventListener('sticky-change', (e: Event) => {
  const { target, stuck } = e.detail;

  console.log(`Element is now ${stuck ? 'stuck' : 'unstuck'}:`, target);
});
```

### CSS Requirement

For the observer to work correctly, the parent container of your sticky element **must be positioned** (e.g., `position: relative`).

If the parent is statically positioned, `StickyObserver` will automatically set `position: relative` on it and log a warning to the console.

## API

### `StickyObserver.observe(selector, options?)`

Static method to create a new observer instance.

- **`selector`** (`string`): CSS selector for the element(s) to observe.
- **`options`** (`StickyObserverOptions`): Optional configuration object.

Returns a `StickyObserver` instance.

### Options (`StickyObserverOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `debug` | `boolean` | `false` | If `true`, shows visual outlines on the target and sentinels, and enables console logging. |
| `container` | `HTMLElement` | `null` | Optional scroll container to use as the `IntersectionObserver` root. When omitted, it uses the document viewport |
| `remainStickyBeyondStickyEdge` | `boolean` | `false` | If `true`, the element reports as "stuck" even when it has exited the scrollport beyond its sticky edge (normally it would unstick). |

### Events

The `StickyObserver` instance extends `EventTarget` and dispatches the following event:

#### `sticky-change`

Fired when the sticky state of an observed element changes.

- **Event Type**: `CustomEvent<StickyChangeDetail>`
- **`detail` property**:
  - `target`: The `HTMLElement` that changed state.
  - `stuck`: `boolean` indicating if the element is currently stuck.

### Instance Methods

#### `disconnect()`

Stops observing all elements and disconnects the internal `IntersectionObserver`s.

```typescript
observer.disconnect();
```

## How it works

This library injects two "sentinel" elements into the parent of the sticky element:

1. A **Top Sentinel** placed before the element (at the start of the parent).
2. A **Bottom Sentinel** placed after the element (at the end of the parent).

It uses `IntersectionObserver` to track when these sentinels intersect with the viewport (or container). Based on the intersection logic, it determines whether the element is currently in a "stuck" state.

Reference: [An event for CSS `position:sticky`](https://developer.chrome.com/docs/css-ui/sticky-headers)

## License

[MIT](./LICENSE)

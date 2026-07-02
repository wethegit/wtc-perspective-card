# wtc-perspective-card

A fake-3D perspective card for the web. Cards tilt toward the pointer (or
drift on an ambient animation), catch the light with a moving shine, publish
their tilt as CSS custom properties for holographic-foil effects, and can
flip open into an accessible modal dialog.

- `PerspectiveCard` — hover / ambient tilt with a light shine.
- `ClickablePerspectiveCard` — all of the above, plus click-to-open: the card
  flips and zooms into a modal `<dialog>`, operated through a real button
  with full keyboard and screen-reader support.

## Installation

```sh
npm install wtc-perspective-card
# or
pnpm add wtc-perspective-card
```

## Quick start

Add the markup:

```html
<div class="perspective-card">
  <div class="perspective-card__transformer">
    <div class="perspective-card__artwork perspective-card__artwork--front">
      <img src="card-front.png" alt="My card" />
    </div>
    <div class="perspective-card__artwork perspective-card__artwork--back">
      <img src="card-back.png" alt="" />
    </div>
    <div class="perspective-card__shine"></div>
  </div>
</div>
```

Import the stylesheet and instantiate:

```javascript
import { PerspectiveCard } from 'wtc-perspective-card'
import 'wtc-perspective-card/style.css'

const card = new PerspectiveCard(document.querySelector('.perspective-card'))
```

For a click-to-open modal card, use `ClickablePerspectiveCard` instead:

```javascript
import { ClickablePerspectiveCard } from 'wtc-perspective-card'

const card = new ClickablePerspectiveCard(
  document.querySelector('.perspective-card'),
  { buttonLabel: 'Expand the card' }
)
```

Both classes are configurable through constructor settings or `data-*`
attributes on the card element — see the usage guide for the full list.

### Without a bundler

The UMD build exposes a `WTCPerspectiveCard` global:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/wtc-perspective-card/dist/wtc-perspective-card.css"
/>
<script src="https://unpkg.com/wtc-perspective-card/dist/wtc-perspective-card.umd.js"></script>
<script>
  new WTCPerspectiveCard.PerspectiveCard(
    document.querySelector('.perspective-card')
  )
</script>
```

## Documentation

- [Usage guide](https://github.com/wethegit/wtc-perspective-card/blob/master/packages/wtc-perspective-card/USAGE.md)
  — data attributes, accessibility, CSS custom properties, the holographic
  foil recipe, events, and extension points.
- [API reference](https://github.com/wethegit/wtc-perspective-card/blob/master/packages/wtc-perspective-card/API.md)
  — generated from the source JSDoc.
- [Demo](https://github.com/wethegit/wtc-perspective-card/tree/master/demo)
  — run it locally with `pnpm install && pnpm dev` from the repo root.

## Contributing

See [CONTRIBUTING.md](https://github.com/wethegit/wtc-perspective-card/blob/master/CONTRIBUTING.md).

## License

[MIT](https://github.com/wethegit/wtc-perspective-card/blob/master/LICENSE)

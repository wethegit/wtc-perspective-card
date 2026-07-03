/**
 * Demo chrome: injects a "View markup" button under each demo that opens a
 * shared <dialog> showing that card's authored markup and the JavaScript that
 * instantiates it — tinted by origin — with a glossary describing each piece
 * and whether it belongs to the library or to userland.
 *
 * Call initMarkupViewer() BEFORE constructing the cards: construction mutates
 * the DOM (the trigger button is created or moved into the transformer, ARIA
 * state and inline transforms are added), and the viewer captures the markup
 * as authored.
 */

// ─── Glossary ─────────────────────────────────────────────────────────────────
// Class-based components, matched against a card's elements in this order.
// `term` may be a function of the matched element. Descriptions are HTML.

const GLOSSARY = [
  {
    term: '.perspective-card',
    origin: 'library',
    match: (el) => el.classList.contains('perspective-card'),
    desc: 'The component root — required. Configuration is read from its <code>data-*</code> attributes, and the per-frame custom properties (<code>--perspective-card-angle/-tilt/-x/-y</code>) are published onto it.'
  },
  {
    term: (el) => '.' + el.className.match(/js-[a-z-]+/)[0],
    origin: 'userland',
    match: (el) => /(^|\s)js-/.test(el.className),
    desc: 'Instantiation hook — <code>main.js</code> uses it to pick which class to construct. The library never reads it.'
  },
  {
    term: '.perspective-card__transformer',
    origin: 'library',
    match: (el) => el.classList.contains('perspective-card__transformer'),
    desc: "Required. The card's 3D matrix lands here every frame — everything that should tilt goes inside. On clickable cards the library also moves the trigger button in here."
  },
  {
    term: '.perspective-card__artwork--front',
    origin: 'library',
    match: (el) => el.classList.contains('perspective-card__artwork--front'),
    desc: "Required. The card's front face — its contents are yours."
  },
  {
    term: '.perspective-card__artwork--back',
    origin: 'library',
    match: (el) => el.classList.contains('perspective-card__artwork--back'),
    desc: 'Optional. The back face, pre-rotated 180° so it reads correctly when the card flips over.'
  },
  {
    term: '.perspective-card__shine',
    origin: 'library',
    match: (el) => el.classList.contains('perspective-card__shine'),
    desc: 'Required. The library paints its moving glare gradient onto this layer every frame.'
  },
  {
    term: '.perspective-card__button',
    origin: 'library',
    match: (el) => el.classList.contains('perspective-card__button'),
    desc: 'Optional to author — <code>ClickablePerspectiveCard</code> creates one when missing. Supplying it yourself (as here) lets you put visible content inside; on construction the library moves it into the transformer so it tilts with the card.'
  },
  {
    term: '.card-art',
    origin: 'userland',
    match: (el) => el.classList.contains('card-art'),
    desc: "Demo artwork — a pure-CSS gradient face. The library doesn't care what a face contains."
  },
  {
    term: 'img',
    origin: 'userland',
    match: (el) => el.tagName === 'IMG',
    desc: 'Image artwork — faces can hold any markup.'
  },
  {
    term: '.card-foil',
    origin: 'userland',
    match: (el) => el.classList.contains('card-foil'),
    desc: 'The holographic-foil recipe from the usage guide: an overlay swung by the custom properties the card publishes each frame. Its child <code>.card-foil__gradient</code> carries the rainbow gradient and the etch displacement filter.'
  },
  {
    term: '.card-badge',
    origin: 'userland',
    match: (el) => el.classList.contains('card-badge'),
    desc: 'A visible "View" affordance inside the supplied button — <code>aria-hidden</code> so the button\'s <code>aria-label</code> stays the accessible name.'
  }
]

// Configuration attributes, looked up on the card root.
const DATA_ATTRS = {
  'data-ambient': {
    origin: 'library',
    desc: "Turns on the ambient sway while the card is in view. An integer value is a phase offset, so neighbouring cards don't move in lockstep."
  },
  'data-button-label': {
    origin: 'library',
    desc: 'Accessible name for the trigger button.'
  },
  'data-start-flipped': {
    origin: 'library',
    desc: 'The card rests back-to-camera and flips over to reveal its front as it opens.'
  },
  'data-zoom': {
    origin: 'library',
    desc: 'How far the card lifts toward the viewer on hover.'
  },
  'data-intensity': {
    origin: 'library',
    desc: 'Amplitude of the ambient tilt.'
  },
  'data-duration': {
    origin: 'library',
    desc: 'Open animation duration, in milliseconds.'
  },
  'data-dialog': {
    origin: 'userland',
    desc: "Read by the demo's <code>CustomModalCard</code> subclass, not the library — selects the page <code>&lt;dialog&gt;</code> the card opens into."
  }
}

// ─── JavaScript snippets ──────────────────────────────────────────────────────
// The instantiation code shown for a demo, keyed by its js-* hook class -
// what main.js does, reduced to the single card. Demos that share a hook can
// add a per-demo note via JS_NOTES, keyed by their heading.

const JS_SNIPPETS = {
  'js-card': `import { PerspectiveCard } from 'wtc-perspective-card'
import 'wtc-perspective-card/style.css'

// Settings can also be passed directly instead of data-* attributes,
// e.g. new PerspectiveCard(el, { ambient: true }).
new PerspectiveCard(document.querySelector('.js-card'))`,

  'js-card--clickable': `import { ClickablePerspectiveCard } from 'wtc-perspective-card'
import 'wtc-perspective-card/style.css'

new ClickablePerspectiveCard(document.querySelector('.js-card--clickable'))`,

  'js-card--custom-modal': `import { ClickablePerspectiveCard } from 'wtc-perspective-card'
import 'wtc-perspective-card/style.css'

// A small subclass points the card at the page's own <dialog> (resolved from
// data-dialog) and lands it in the slot inside - see custom-modal-card.js
// for the full, commented implementation.
class CustomModalCard extends ClickablePerspectiveCard {
  get dialog() {
    /* the data-dialog element, wired once */
  }
  get openTargetRect() {
    /* the .custom-modal__slot rect */
  }
}

new CustomModalCard(document.querySelector('.js-card--custom-modal'))`
}

const JS_NOTES = {
  'Holographic foil': `// The foil layer needs no JS of its own - it's pure CSS, swung by the custom
// properties the card publishes every frame. See demo.scss.`,
  'Custom button': `// The button supplied in the markup is picked up automatically and moved
// inside the transformer - nothing extra to wire up.`
}

// ─── Markup rendering ─────────────────────────────────────────────────────────

// Class-name, attribute and JS-identifier tokens tinted in the code blocks;
// anything the library exports, requires or reads is "library", the rest is
// userland. (wtc-perspective-card is listed so the package name is consumed
// whole, rather than perspective-card matching inside it.)
const TOKEN =
  /\b(?:wtc-perspective-card|perspective-card(?:__[a-z-]+)?|js-card(?:--[a-z-]+)?|card-(?:art|foil|badge)(?:__[a-z-]+)?(?:--[a-z-]+)*|data-(?:ambient|button-label|start-flipped|zoom|intensity|duration|close-button(?:-label)?|dialog(?:-slot)?)|ClickablePerspectiveCard|PerspectiveCard|CustomModalCard)\b/g
const LIBRARY_TOKEN =
  /^(?:wtc-perspective-card|perspective-card|ClickablePerspectiveCard|PerspectiveCard|data-(?:ambient|button-label|start-flipped|zoom|intensity|duration|close-button))/

const escapeHTML = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const highlight = (escaped) =>
  escaped.replace(
    TOKEN,
    (token) =>
      `<span class="${LIBRARY_TOKEN.test(token) ? 'mk-lib' : 'mk-user'}">${token}</span>`
  )

// outerHTML keeps the source's inner indentation, which includes the page
// nesting - strip the common indent so the snippet starts at column 0.
function dedent(html) {
  const lines = html.split('\n')
  const indent = Math.min(
    ...lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => line.match(/^ */)[0].length)
  )
  return [lines[0], ...lines.slice(1).map((line) => line.slice(indent))].join(
    '\n'
  )
}

// The glossary entries present in this card: the root first, then its
// configuration attributes, then the structure in document order.
function annotate(card) {
  const els = [card, ...card.querySelectorAll('*')]
  const classItems = GLOSSARY.filter((rule) => els.some(rule.match)).map(
    (rule) => ({
      term:
        typeof rule.term === 'function' ? rule.term(els.find(rule.match)) : rule.term,
      origin: rule.origin,
      desc: rule.desc
    })
  )
  const attrItems = [...card.attributes]
    .filter((attr) => DATA_ATTRS[attr.name])
    .map((attr) => ({
      term: attr.value ? `${attr.name}="${attr.value}"` : attr.name,
      ...DATA_ATTRS[attr.name]
    }))
  return [classItems[0], ...attrItems, ...classItems.slice(1)]
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

function buildDialog() {
  const dialog = document.createElement('dialog')
  dialog.className = 'markup-modal'
  dialog.setAttribute('aria-labelledby', 'markup-modal-title')
  dialog.innerHTML = `
    <header class="markup-modal__header">
      <h2 class="markup-modal__title" id="markup-modal-title"></h2>
      <button type="button" class="markup-modal__close" aria-label="Close">
        <span aria-hidden="true">✕</span>
      </button>
    </header>
    <p class="markup-modal__legend">
      <span class="markup-modal__chip markup-modal__chip--library">library</span>
      <span>required or read by the component</span>
      <span class="markup-modal__chip markup-modal__chip--userland">userland</span>
      <span>demo markup — swap for your own</span>
    </p>
    <h3 class="markup-modal__subhead">Markup</h3>
    <pre class="markup-modal__code"><code class="markup-modal__html"></code></pre>
    <h3 class="markup-modal__subhead">JavaScript</h3>
    <pre class="markup-modal__code"><code class="markup-modal__js"></code></pre>
    <dl class="markup-modal__glossary"></dl>
  `
  // The dialog is fullscreen, so there's no backdrop to click - closing is
  // the ✕ button or Escape.
  dialog
    .querySelector('.markup-modal__close')
    .addEventListener('click', () => dialog.close())
  document.body.appendChild(dialog)
  return dialog
}

export function initMarkupViewer() {
  const dialog = buildDialog()
  const title = dialog.querySelector('.markup-modal__title')
  const htmlCode = dialog.querySelector('.markup-modal__html')
  const jsCode = dialog.querySelector('.markup-modal__js')
  const glossary = dialog.querySelector('.markup-modal__glossary')

  document.querySelectorAll('.demo-item').forEach((item) => {
    const card = item.querySelector('.perspective-card')
    if (!card) return

    // Captured now, before the card class mutates the DOM.
    const label = item.querySelector('h2')?.textContent.trim() ?? 'Card'
    const markup = highlight(escapeHTML(dedent(card.outerHTML)))
    const entries = annotate(card)
    const hook = card.className.match(/js-[a-z-]+/)?.[0]
    const js = highlight(
      escapeHTML([JS_SNIPPETS[hook], JS_NOTES[label]].filter(Boolean).join('\n\n'))
    )

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'demo-item__markup-button'
    button.setAttribute('aria-haspopup', 'dialog')
    button.textContent = 'View markup'
    button.addEventListener('click', () => {
      title.textContent = `${label} — markup`
      htmlCode.innerHTML = markup
      jsCode.innerHTML = js
      glossary.innerHTML = entries
        .map(
          ({ term, origin, desc }) => `
            <div class="markup-modal__entry">
              <dt>
                <code>${escapeHTML(term)}</code>
                <span class="markup-modal__chip markup-modal__chip--${origin}">${origin}</span>
              </dt>
              <dd>${desc}</dd>
            </div>`
        )
        .join('')
      dialog.showModal()
    })
    item.appendChild(button)
  })
}

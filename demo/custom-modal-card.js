import { ClickablePerspectiveCard, CSSCLASSES } from 'wtc-perspective-card'

/**
 * Demo extension: a clickable card that opens into a *custom* `<dialog>`
 * supplied in the page markup, so the enlarged card can share its modal with
 * arbitrary other content — a description panel, metadata, calls to action —
 * instead of the bare, library-created shared dialog.
 *
 * The dialog is resolved (once, in the constructor) from a `dialog` setting or
 * a `data-dialog="#selector"` attribute on the card. It can be an
 * `HTMLDialogElement` passed directly or a selector string. If nothing
 * resolves, the card transparently falls back to the library's shared dialog,
 * so this subclass is safe to use on cards that don't opt in.
 *
 * The card is moved into that dialog on open and returned to its place in the
 * grid on close, flipping exactly as usual. Instead of flying to the viewport
 * centre, it animates into a slot (`.custom-modal__slot`) inside the dialog's
 * layout — done by overriding the library's `openTargetRect` getter to return
 * the slot's live rect — so the card can sit in one column with a content panel
 * beside it (see `demo/index.html` and the `.custom-modal__*` rules in
 * `demo/demo.scss`). Both fall back gracefully: no custom dialog uses the shared
 * library dialog, and no slot uses the default viewport-centre target.
 *
 * @extends ClickablePerspectiveCard
 */
export class CustomModalCard extends ClickablePerspectiveCard {
  // Dialogs we've already attached the delegated listeners to. A dialog is
  // reused across every open (and may be shared between cards), so this keeps
  // us from stacking duplicate listeners on it.
  static _wired = new WeakSet()

  // The placeholder, inside the dialog's column layout, that reserves the
  // card's landing area. Overridable per card with `data-dialog-slot`.
  static SLOT_SELECTOR = '.custom-modal__slot'

  constructor(element, settings = {}) {
    super(element, settings)

    // Resolve the custom dialog from the `dialog` setting or `data-dialog`
    // attribute. The `dialog` getter falls back to the shared library dialog
    // when this is null, so an unresolved reference degrades gracefully.
    this._customDialog = CustomModalCard.resolveDialog(
      settings.dialog ?? element.dataset.dialog
    )
  }

  /**
   * Coerces a dialog reference (an element or a selector string) into an
   * `HTMLDialogElement`, or `null` if it can't be resolved.
   *
   * @static
   * @param {HTMLDialogElement|String} ref The element or a CSS selector for it.
   * @returns {HTMLDialogElement|null}
   */
  static resolveDialog(ref) {
    if (ref instanceof HTMLDialogElement) return ref
    if (typeof ref === 'string' && ref) {
      const el = document.querySelector(ref)
      if (el instanceof HTMLDialogElement) return el
    }
    return null
  }

  /**
   * (getter) The dialog the card opens into. When a custom dialog was supplied
   * it is returned here, wired once with the same delegated listeners the base
   * class binds to its shared dialog (so backdrop clicks, touch, Escape/cancel
   * and close all behave identically). Otherwise this defers to the base
   * class's shared dialog.
   *
   * @type {HTMLDialogElement}
   */
  get dialog() {
    if (!this._customDialog) return super.dialog

    const dialog = this._customDialog
    if (!CustomModalCard._wired.has(dialog)) {
      // The component CSS (backdrop fade) and the close sequence key off this
      // class, so the custom dialog must carry it to honour the same contract.
      dialog.classList.add(CSSCLASSES.dialog)

      // Delegate to whichever card currently holds the modal, exactly as the
      // base class does for its shared dialog — invoking as `card.onDialogX(e)`
      // preserves the correct `this`.
      const active = () => ClickablePerspectiveCard._activeCard
      dialog.addEventListener('click', (e) => active()?.onDialogClick(e))
      dialog.addEventListener('touchmove', (e) => active()?.onTouchMove(e))
      dialog.addEventListener('cancel', (e) => active()?.onDialogCancel(e))
      dialog.addEventListener('close', (e) => active()?.onDialogClose(e))

      CustomModalCard._wired.add(dialog)
    }
    return dialog
  }

  /**
   * (getter) The placeholder element inside the custom dialog that reserves the
   * card's landing area in the column layout. Resolved from `data-dialog-slot`
   * (falling back to `CustomModalCard.SLOT_SELECTOR`), scoped to the dialog.
   * Null when there's no custom dialog or no matching slot.
   *
   * @type {HTMLElement|null}
   */
  get slot() {
    if (!this._customDialog) return null
    const selector =
      this.element.dataset.dialogSlot || CustomModalCard.SLOT_SELECTOR
    return this._customDialog.querySelector(selector)
  }

  /**
   * (override) Land the card in the dialog's column slot instead of the
   * viewport centre. Reads the slot's live rect and fits the card inside it,
   * preserving the card's aspect ratio. Falls back to the base viewport-centre
   * target when no slot is present, so the card still opens sensibly if the
   * custom dialog markup is missing its slot.
   *
   * @type {{left: Number, top: Number, width: Number, height: Number}}
   */
  get openTargetRect() {
    const slot = this.slot
    if (!slot) return super.openTargetRect

    const rect = slot.getBoundingClientRect()
    const w0 = this.startingDimensions[0]
    const h0 = this.startingDimensions[1]
    // Fit the card inside the slot, preserving its aspect ratio (the smaller of
    // the width/height ratios), then centre it within the slot.
    const scale = Math.min(rect.width / w0, rect.height / h0)
    const width = w0 * scale
    const height = h0 * scale
    return {
      left: rect.left + (rect.width - width) * 0.5,
      top: rect.top + (rect.height - height) * 0.5,
      width,
      height
    }
  }
}

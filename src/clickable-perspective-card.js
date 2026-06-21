import { PerspectiveCard } from './perspective-card.js'

const easeInOutCubic = function (time, start, change, duration) {
  if ((time /= duration / 2) < 1)
    return change * 0.5 * time * time * time + start
  return change * 0.5 * ((time -= 2) * time * time + 2) + start
}
const easeInOutSine = function (time, start, change, duration) {
  return (-change / 2) * (Math.cos((Math.PI * time) / duration) - 1) + start
}

/**
 * The clickable perspective card adds functionality that allows the zooming
 * the card by clicking on it. In doing so the card flips and animates up to a
 * modal style display.
 *
 * For accessibility, the card is operated through a real `button` element
 * that covers the card. If the markup doesn't already contain a
 * `button.perspective-card__button`, one is created and appended
 * automatically, labelled from `settings.buttonLabel` or the
 * `data-button-label` attribute. The button exposes `aria-haspopup="dialog"`
 * and `aria-expanded`, can be operated with Enter/Space, and receives focus
 * back when the card closes. Escape closes the open card via the dialog's
 * cancel event.
 *
 * @author Liam Egan <liam@wethecollective.com>
 * @version 3.0.0
 * @created Jan 28, 2020
 * @extends PerspectiveCard
 */
export class ClickablePerspectiveCard extends PerspectiveCard {
  /**
   * The ClickablePerspectiveCard constructor. Creates and initialises the perspective
   * card component.
   *
   * @constructor
   * @param {HTMLElement} element 				The element that contains all of the card details
   * @param {Object}      settings 				The settings of the component
   * @param {String}      settings.buttonLabel 	The accessible label for the trigger button. Falls back to the `data-button-label` attribute, then to "Expand"
   * @param {Boolean}     settings.closeButton 	Show a dedicated close button inside the modal. Defaults to true. Set false or add data-close-button="false" to opt out.
   * @param {String}      settings.closeButtonLabel Accessible label for the close button. Falls back to the `data-close-button-label` attribute, then to "Close"
   * @param {Number}      settings.duration 	Open animation duration in milliseconds. Falls back to the `data-duration` attribute, then to 1500. The close animation runs at ⅔ of this value.
   */
  constructor(element, settings = {}) {
    // Call the superfunction
    super(element, settings)

    // Bind the handlers
    this.onButtonClick = this.onButtonClick.bind(this)
    this.onCloseButtonClick = this.onCloseButtonClick.bind(this)
    this._tweenBuffer = false

    this._openDuration =
      'duration' in settings
        ? settings.duration
        : parseInt(this.element.getAttribute('data-duration')) || 1500

    this._showCloseButton =
      'closeButton' in settings
        ? settings.closeButton !== false
        : this.element.getAttribute('data-close-button') !== 'false'
    this._closeButtonLabel =
      'closeButtonLabel' in settings
        ? settings.closeButtonLabel
        : this.element.getAttribute('data-close-button-label') || 'Close'

    // The modifier class routes all pointer interaction to the trigger
    // button - the transformer is made pointer-transparent in CSS so the
    // tilting plane can't intercept clicks meant for the button behind it.
    this.element.classList.add('perspective-card--clickable')

    // Find or create the trigger button. This is a real, transparent button
    // covering the card through which all open/close activation runs -
    // pointer, keyboard and assistive technology alike.
    this.button = this.element.querySelector('button.perspective-card__button')
    if (!this.button) {
      this.button = document.createElement('button')
      this.button.type = 'button'
      this.button.className = 'perspective-card__button'
      this.button.setAttribute(
        'aria-label',
        'buttonLabel' in settings
          ? settings.buttonLabel
          : this.element.getAttribute('data-button-label') || 'Expand'
      )
      this.element.appendChild(this.button)
    }
    this.button.setAttribute('aria-haspopup', 'dialog')
    this.button.setAttribute('aria-expanded', 'false')
    this.button.addEventListener('click', this.onButtonClick)
  }

  /**
   * (getter) The shared modal dialog. A single `<dialog>` is created lazily
   * on first open and reused by every card on the page - only one card can be
   * open at a time (enforced by `_activeCard`). Keeping one persistent element
   * in the DOM also lets the backdrop fade out via CSS (`allow-discrete`) on
   * every close path.
   * Future TBD: update to allow injection of dialog in userland markup for more
   * control, and support pathing of next/prev cards.
   *
   * @type {HTMLDialogElement}
   */
  get dialog() {
    if (ClickablePerspectiveCard._dialog)
      return ClickablePerspectiveCard._dialog

    const dialog = document.createElement('dialog')
    dialog.className = 'perspective-card__dialog'

    // Listeners are bound once and delegate to whichever card is currently
    // active. Invoking as `card.onDialogX(e)` preserves the correct `this`.
    // These are anon, so not removable at the moment, maybe need to revisit.
    const active = () => ClickablePerspectiveCard._activeCard
    dialog.addEventListener('click', (e) => active()?.onDialogClick(e))
    dialog.addEventListener('touchmove', (e) => active()?.onTouchMove(e))
    dialog.addEventListener('cancel', (e) => active()?.onDialogCancel(e))
    dialog.addEventListener('close', (e) => active()?.onDialogClose(e))

    document.body.appendChild(dialog)
    ClickablePerspectiveCard._dialog = dialog
    return dialog
  }

  /**
   * The event listener for the resize and scroll events
   * This updates the position and size of the element and sets the
   * axis for use in animation. This is bound to a debouncer so that
   * it doesn't get called a hundred times when scrolling or
   * resizing.
   *
   * @public
   * @param {event}  e 				The pointer event object
   * @listens pointerleave
   * @listens scroll
   */
  resize(e, force = false) {
    if (force) {
      this.updatePosition()
    } else {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(this.updatePosition, 300)
    }
  }

  updatePosition() {
    super.updatePosition()

    // When fully open, re-centre in the current viewport after resize or scroll
    if (
      this.enlarged &&
      this.element.classList.contains('perspective-card--is-open')
    ) {
      const w = parseFloat(this.element.style.width)
      const h = parseFloat(this.element.style.height)
      this.element.style.left = `${window.innerWidth * 0.5 - w * 0.5}px`
      this.element.style.top = `${window.innerHeight * 0.5 - h * 0.5}px`
    }
  }

  /**
   * This is the main run-loop function.
   * It is responsible for taking the various previously set properies
   * and transforming the card. This can be called individually, or
   * (more commonly) as the callback to a animation frame.
   *
   * @public
   * @param {number}  delta 				The delta of the animation
   * @param {boolean} raf=true      This just determines whether to run the next RAF as a part of this call
   */
  play(delta, raf = true) {
    // Call the superfunction
    super.play(delta, raf)

    // If we are tweening values and our tween time is less than the duration
    if (this.tweenTime < this.tweenDuration && this.tweening === true) {
      // Tween the position of the card on screen
      this.screenPosition = [
        easeInOutCubic(
          this.tweenTime,
          this.startingPosition[0],
          this.targetPosition[0] - this.startingPosition[0],
          this.tweenDuration
        ),
        easeInOutCubic(
          this.tweenTime,
          this.startingPosition[1],
          this.targetPosition[1] - this.startingPosition[1],
          this.tweenDuration
        )
      ]

      // Tween the card scale
      this.screenScale = easeInOutCubic(
        this.tweenTime,
        this.startingScale,
        this.targetScale - this.startingScale,
        this.tweenDuration
      )

      // Tween the rotation value
      // This is responsible for moving the look at point in a large circle
      // around the card and gives the illusion that the card is flipping
      const r = easeInOutSine(
        this.tweenTime,
        Math.PI * 0.5,
        this.rotationAmount,
        this.tweenDuration
      )
      const t = [Math.cos(r) * -800, Math.sin(r) * -800]
      this.lookPoint = [t[0], this.lookPoint[1], t[1]]

      // Update the tween time with the last frame duration
      this.tweenTime += this.lastFrameTime

      // If our time has run out, but tweening is true it means that the animation has just ended
    } else if (this.tweening === true) {
      // Set the card's position on screen to the fixed end point
      this.screenPosition = this.targetPosition
      this.tweening = false

      // Resize things so that mouse interation is sensible
      this.resize()

      // Run our end function.
      this.onEndTween()
    }
  }

  /**
   * The event listener for the trigger button's click event. This is the
   * single path through which the card is opened and closed - the browser
   * normalises pointer, keyboard and assistive-technology activation into
   * click events for us, including cancelling presses that drag away from
   * the button or turn into scrolls.
   *
   * @public
   * @param {event}  e 				The click event object
   * @listens click
   */
  onButtonClick(e) {
    // Only one card may be open at a time - ignore activation while
    // another card holds the modal.
    if (
      ClickablePerspectiveCard._activeCard !== null &&
      ClickablePerspectiveCard._activeCard !== this
    )
      return

    // Re-activating the trigger while open (or mid-open-tween) is a dismiss
    // request - route it through the shared close path.
    if (this.enlarged === true) {
      this._requestClose()
      return
    }

    // Opening: the buffer prevents an instant re-open immediately after a close.
    if (this._tweenBuffer === true) return

    this.resize(null, true)
    this.enlarged = true
  }

  /**
   * The event listener for the dialog's click event. Clicks on the modal
   * backdrop target the dialog element itself, so this closes the card on
   * backdrop click. Clicks on the card bubble up here too, but those carry
   * the button as their target and are ignored.
   *
   * @public
   * @param {event}  e 				The click event object
   * @listens click
   */
  onDialogClick(e) {
    if (e.target !== this.dialog) return

    this._requestClose()
  }

  onTouchMove(e) {
    if (e.targetTouches.length === 1) {
      e.preventDefault()
    }
  }

  onCloseButtonClick() {
    this._requestClose()
  }

  onDialogCancel(e) {
    // Prevent the native immediate-close so we can run the close animation instead.
    // Note: browsers fire a second, non-cancelable cancel event on repeated Escape
    // presses as a safety valve - preventDefault() will silently fail for those.
    // onDialogClose handles that case.
    e.preventDefault()
    this._requestClose()
  }

  /**
   * The single entry point for every user-initiated close (backdrop click,
   * close button, Escape, re-activating the trigger).
   *
   * While a tween is running the animated close can't start - the `enlarged`
   * setter is locked on `tweening` - so we go straight to the force-close path:
   * close()ing the dialog fires `close`, which onDialogClose turns into an
   * idempotent teardown. Otherwise we run the normal animated close.
   *
   * @private
   */
  _requestClose() {
    if (this.tweening === true) this.dialog.close()
    else this.enlarged = false
  }

  onDialogClose() {
    // Fires whenever the dialog closes - via our own end-of-tween close() or a
    // browser force-close (e.g. a repeated Escape, whose second, non-cancelable
    // cancel event bypasses our animation, or a close requested mid-tween).
    this.tweening = false
    this._enlarged = false
    this._teardownModal()
  }

  _teardownModal() {
    // The dialog persists and can close through several paths (scripted tween
    // end, backdrop click, browser force-close), each of which routes here.
    // Guard so the work runs exactly once per open.
    if (!this._modalActive) return
    this._modalActive = false

    if (this._closeButton) {
      this._closeButton.removeEventListener('click', this.onCloseButtonClick)
      // The dialog persists between opens, so the button must be removed from
      // it explicitly - otherwise close buttons would accumulate in the dialog.
      this._closeButton.remove()
      this._closeButton = null
    }

    if (this._placeholderObserver) {
      this._placeholderObserver.disconnect()
      this._placeholderObserver = null
    }
    this._currentPlaceholderWidth = null

    if (this._placeholder && this._placeholder.parentNode) {
      this._placeholder.replaceWith(this.element)
    } else if (this._originalParent) {
      this._originalParent.appendChild(this.element)
    }
    this._placeholder = null

    this.element.classList.remove('perspective-card--modal')
    this.element.classList.remove('perspective-card--is-open')
    this.element.style.position = ''
    this.element.style.transform = ''
    this.element.style.width = ''
    this.element.style.height = ''
    this.element.style.left = ''
    this.element.style.top = ''

    // The shared dialog stays in the DOM between opens - it is closed, not
    // removed - so `allow-discrete` can fade the backdrop out on every close
    // path, including a browser force-close that bypasses our own sequence.
    this.dialog.classList.remove('perspective-card__dialog--closing')

    // The browser can't restore focus itself here - the focused button was
    // moved out of the dialog before close() - so do it manually.
    this.button.setAttribute('aria-expanded', 'false')
    this.button.focus()

    ClickablePerspectiveCard._activeCard = null
    this._dispatch('closed')

    // Restore the ambient state to whatever it was before opening
    this.ambient = this._wasAmbient
    // Only stop playing for hover-only cards (ambient < 0) when the
    // pointer isn't over the card - ambient cards keep running
    if (this._wasAmbient < 0 && this.pointerControlled === false) {
      this.playing = false
    }

    setTimeout(() => {
      this.transformer.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)`
    }, 100)
  }

  /**
   * (getter/setter) Whether the card is enlarged or not. This is a BIG
   * setter and is really responsible for generating the tweening values
   * setting up the tween and initialising it.
   *
   * @type {Boolean}
   * @default false
   */
  set enlarged(value) {
    if (this.tweening === true) return

    // Whether we were enlarged already
    const wasEnlarged = this.enlarged

    // Set the value
    this._enlarged = value === true

    // If we're going from unenlarged to enlarged
    if (this.enlarged === true && wasEnlarged === false) {
      this._dispatch('open')

      ClickablePerspectiveCard._activeCard = this
      // Marks that there is modal state to clean up; cleared by _teardownModal.
      this._modalActive = true
      this.button.setAttribute('aria-expanded', 'true')

      // Get the current bounding client rectangle before touching the DOM
      const viewportOffset = this.element.getBoundingClientRect()

      // This makes it so that, when the card is enlarged that it runs ambiently by default
      this._wasAmbient = this.ambient
      this.ambient = 0

      // Insert a placeholder in the card's original slot so the layout is
      // maintained and we can read its current viewport position on close -
      // even if the page has been scrolled or resized since opening.
      this._originalParent = this.element.parentNode
      this._placeholder = document.createElement('div')
      this._placeholder.style.cssText = `width:${this.startingDimensions[0]}px;height:${this.startingDimensions[1]}px;visibility:hidden;pointer-events:none;`
      this._placeholder.setAttribute('aria-hidden', 'true')
      this._originalParent.insertBefore(this._placeholder, this.element)

      // Track placeholder size changes (viewport resize while open) so the
      // close tween can target the correct scale even if the slot has changed.
      this._currentPlaceholderWidth = this.startingDimensions[0]
      this._placeholderObserver = new ResizeObserver((entries) => {
        const cr = entries[0]?.contentRect
        if (cr) this._currentPlaceholderWidth = cr.width
      })
      this._placeholderObserver.observe(this._placeholder)

      // Fix the card in place at its current rendered size, then move it into
      // the dialog. Explicit width/height must be set before the move - once
      // inside the dialog the element loses its layout context (fluid vw/grid
      // widths no longer apply) and would otherwise reflow to a wrong size.
      this.element.style.position = 'fixed'
      this.element.style.width = `${this.startingDimensions[0]}px`
      this.element.style.height = `${this.startingDimensions[1]}px`
      this.element.classList.add('perspective-card--modal')
      // Accessing `this.dialog` lazily creates the shared dialog (and appends
      // it to the body) on first use. The card is moved into it so it lives in
      // the top layer.
      this.dialog.appendChild(this.element)

      // Label the dialog from the trigger so screen readers announce it with
      // context ("Expand card, dialog") rather than a bare "dialog".
      this.dialog.setAttribute(
        'aria-label',
        this.button.getAttribute('aria-label') || 'Card'
      )

      this.dialog.showModal()

      // Inject a close button and move focus to it so AT users and touch
      // users have an explicit labelled dismiss control without relying on Escape.
      if (this._showCloseButton) {
        this._closeButton = document.createElement('button')
        this._closeButton.type = 'button'
        this._closeButton.className = 'perspective-card__close-button'
        this._closeButton.setAttribute('aria-label', this._closeButtonLabel)
        this._closeButton.innerHTML = '<span aria-hidden="true">&#x2715;</span>'
        this._closeButton.addEventListener('click', this.onCloseButtonClick)
        this.dialog.appendChild(this._closeButton)
        this._closeButton.focus()
      }

      // Initialise our tween timing variables
      this.playing = true
      this.tweening = true
      this.tweenTime = 0
      this.tweenDuration = this._openDuration

      // Set up our positional arrays
      // Start position
      this.startingPosition = [viewportOffset.left, viewportOffset.top]

      // Set up our scaling properties
      // start scale
      this.startingScale = 1
      // current scale
      this.screenScale = 1
      let fscale = 0.7
      // Then we need to determine the target position based on the ratio of the screen to the card
      // This basically ensures that we scale up to 70% width *or* 70% height. Whichever is smaller
      const screenRatio = window.innerWidth / window.innerHeight
      const cardRatio = this.startingDimensions[0] / this.startingDimensions[1]
      if (screenRatio < cardRatio) {
        const width = window.innerWidth * fscale
        this.targetScale = width / this.startingDimensions[0]
      } else {
        const height = window.innerHeight * fscale
        this.targetScale = height / this.startingDimensions[1]
      }

      // Current position
      this.screenPosition = [viewportOffset.left, viewportOffset.top]
      // End position
      this.targetPosition = [
        window.innerWidth * 0.5 - this.startingDimensions[0] * 0.5,
        window.innerHeight * 0.5 - this.startingDimensions[1] * 0.5
      ]

      // Set up the amount of rotation that needs to happen
      this.rotationAmount = Math.PI * -2

      this.onEndTween = function () {
        // Convert the CSS scale() to real dimensions so the browser renders
        // at the actual display size rather than upscaling a small raster.
        // This also fixes SVG filter blurriness (feImage is rasterised at the
        // element's intrinsic size and gets blurry when scale() upscalesit).
        const scale = this.screenScale
        this._resolvedScale = scale

        const w = this.startingDimensions[0] * scale
        const h = this.startingDimensions[1] * scale

        this.element.style.width = `${w}px`
        this.element.style.height = `${h}px`
        this.element.style.left = `${window.innerWidth * 0.5 - w * 0.5}px`
        this.element.style.top = `${window.innerHeight * 0.5 - h * 0.5}px`
        this.element.style.transform = 'none'
        this._screenScale = 1

        this.element.classList.add('perspective-card--is-open')
        this._dispatch('opened')
      }

      // If we're going from enlarged to unenlarged
    } else if (this.enlarged === false && wasEnlarged === true) {
      this._dispatch('close')

      // Adds 3d transforms back in on close.
      this.element.classList.remove('perspective-card--is-open')

      // Trigger the backdrop fade-out
      this.dialog.classList.add('perspective-card__dialog--closing')

      // We converted scale() to real dimensions when opening; restore the
      // scale transform now so the close tween can animate it back down.
      // Keep explicit width/height pinned to startingDimensions - the card is
      // still inside the dialog without a layout context, so clearing them
      // here would cause a reflow. _teardownModal clears them after the element
      // is back in the document.
      const resolvedScale = this._resolvedScale || 1
      this._screenScale = resolvedScale
      this.element.style.transform = `scale(${resolvedScale})`
      this.element.style.width = `${this.startingDimensions[0]}px`
      this.element.style.height = `${this.startingDimensions[1]}px`
      this.element.style.left = `${window.innerWidth * 0.5 - this.startingDimensions[0] * 0.5}px`
      this.element.style.top = `${window.innerHeight * 0.5 - this.startingDimensions[1] * 0.5}px`

      // Initialise our tween timing variables
      this.tweening = true
      this.tweenTime = 0
      this.tweenDuration = Math.round(this._openDuration * (2 / 3))

      // Read the placeholder's current viewport position so the close tween
      // targets the right place even if the page was scrolled or resized while open.
      const placeholderOffset = this._placeholder.getBoundingClientRect()
      this.startingPosition = this.targetPosition
      this.targetPosition = [placeholderOffset.left, placeholderOffset.top]

      // Set up our scaling properties. For fluid layouts the placeholder may
      // now be a different size than when we opened (viewport was resized), so
      // derive targetScale from the current placeholder width rather than
      // hardcoding 1. The ResizeObserver keeps _currentPlaceholderWidth fresh;
      // fall back to a live getBCR read or startingDimensions if unavailable.
      const currentPlaceholderWidth =
        this._currentPlaceholderWidth ??
        placeholderOffset.width ??
        this.startingDimensions[0]
      this.startingScale = this.screenScale
      this.targetScale = currentPlaceholderWidth / this.startingDimensions[0]

      // Set up the amount of rotation that needs to happen
      // We want this to be opposite to the previous one
      this.rotationAmount = Math.PI * 2

      // At the end of this tween we clean everything up
      this.onEndTween = function () {
        this.dialog.close()
        // this._paused = true
        // console.warn('Card paused. Unpause: cardInstance._paused = false')
        this._teardownModal()
      }
    }
  }
  get enlarged() {
    return this._enlarged === true
  }

  /**
   * (getter/setter) Whether the card is in a tweening state. This just
   * enforces a boolean value.
   *
   * @type {Boolean}
   * @default false
   */
  set tweening(value) {
    if (value !== this._tweening) {
      this._tweenBuffer = true
      setTimeout(() => {
        this._tweenBuffer = false
      }, 1000)
    }
    this._tweening = value === true
  }
  get tweening() {
    return this._tweening === true
  }

  /**
   * (getter/setter) The current tween time.
   *
   * @type {Number}
   * @default 0
   */
  set tweenTime(value) {
    if (!isNaN(value)) this._tweenTime = value
  }
  get tweenTime() {
    return this._tweenTime || 0
  }

  /**
   * (getter/setter) The current tween duration.
   *
   * @type {Number}
   * @default 0
   */
  set tweenDuration(value) {
    if (!isNaN(value)) this._tweenDuration = value
  }
  get tweenDuration() {
    return this._tweenDuration || 0
  }

  /**
   * (getter/setter) The function to call when the tween ends.
   *
   * @type {Function}
   * @default null
   */
  set onEndTween(value) {
    if (value instanceof Function) {
      this._onEndTween = value.bind(this)
    }
  }
  get onEndTween() {
    return this._onEndTween || function () {}
  }

  /**
   * (getter/setter) The target position on-screen for the card.
   *
   * @type {Vec2|Array}
   * @default [0,0]
   */
  set targetPosition(value) {
    if (value instanceof Array && value.length >= 2) {
      this._targetPosition = value
    }
  }
  get targetPosition() {
    return this._targetPosition || [0, 0]
  }

  /**
   * (getter/setter) The current position on-screen for the card.
   * This also updates the element's styles left and top. So this
   * should *only* be set during a tween.
   *
   * @type {Vec2|Array}
   * @default [0,0]
   */
  set screenPosition(value) {
    if (value instanceof Array && value.length >= 2) {
      this._screenPosition = value
      this.element.style.left = `${value[0]}px`
      this.element.style.top = `${value[1]}px`
    }
  }
  get screenPosition() {
    return this._screenPosition || [0, 0]
  }

  /**
   * (getter/setter) The card's current scale value.
   *
   * @type {Number}
   * @default 0
   */
  set screenScale(value) {
    if (!isNaN(value)) {
      this._screenScale = value
      this.element.style.transform = `scale(${value})`
    }
  }
  get screenScale() {
    return this._screenScale || 1
  }

  /**
   * (getter/setter) The target dimensions for the card.
   *
   * @type {Vec2|Array}
   * @default [0,0]
   */
  set targetDimensions(value) {
    if (value instanceof Array && value.length >= 2) {
      this._targetDimensions = value
    }
  }
  get targetDimensions() {
    return this._targetDimensions || [0, 0]
  }

  // The card currently holding (or animating to/from) the modal - only one
  // card may be open at a time.
  static _activeCard = null

  // The single shared modal dialog, created lazily on first open and reused by
  // every card on the page. See the `dialog` getter.
  static _dialog = null
}

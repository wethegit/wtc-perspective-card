const EPSILON = 0.001

/**
 * Centralised CSS class names used by the base card.
 */
export const CSSCLASSES = {
  transformer: 'perspective-card__transformer',
  shine: 'perspective-card__shine',
  over: 'perspective-card--over',
  intersectionOff: 'intersection-off'
}

/**
 * This sets up the basic perspective card. This class expects markup at least
 * conforming to:
 * ```
 * .perspective-card
 *   .perspective-card__transformer
 *     .perspective-card__artwork.perspective-card__artwork--front
 *       img
 *     .perspective-card__artwork.perspective-card__artwork--back
 *       img
 *     .perspective-card__shine
 * ```
 *
 * This class is designed to be used with a decorator function (provided by
 * the new wtc-decorator static class) or used directly like:
 * ```
 * const p = new PerspectiveCard(element);
 * ```
 *
 * While animating, the card publishes its tilt as CSS custom properties on
 * the element — `--perspective-card-angle` (the tilt direction, in radians),
 * `--perspective-card-tilt` (the tilt magnitude, unitless), and
 * `--perspective-card-x` / `--perspective-card-y` (the same tilt in normalized
 * card space, ~[-1, 1] with 0 at the centre; in pointer mode these track the
 * normalized pointer position) — so custom per-frame effects like holographic
 * foils can be driven from pure CSS on any element placed inside the card.
 */
class PerspectiveCard {
  /**
   * The settings schema. Each entry declares a setting's coercion `type` (a key
   * of `PerspectiveCard.coerce`) and its `default`. This is the single source
   * of truth for what `parseSettings` resolves from constructor settings and
   * `data-*` attributes; subclasses declare their own `SETTINGS`.
   *
   * @static
   */
  static SETTINGS = {
    zoom: { type: 'int', default: 40 },
    intensity: { type: 'int', default: 10 },
    ambient: { type: 'ambient', default: -1 }
  }

  /**
   * Coercion functions keyed by setting type. Each receives the resolved raw
   * value (a real type from settings, or a string from a data-* attribute) and
   * the setting's default, and returns the final value.
   *
   * @static
   */
  static coerce = {
    // Truthy unless explicitly false / "false".
    bool: (v) => v !== false && v !== 'false',
    // Integer; a non-numeric or absent value falls back to the default.
    int: (v, def) => (isNaN(parseInt(v)) ? def : parseInt(v)),
    // String; an empty / nullish value falls back to the default.
    string: (v, def) => (v === '' || v == null ? def : String(v)),
    // Off (false / "false") -> default; on (true / "" / "true") -> 0; else the number.
    ambient: (v, def) =>
      v === false || v === 'false'
        ? def
        : v === true || v === '' || v === 'true'
          ? 0
          : parseInt(v)
  }

  /**
   * Walks a settings schema and resolves every key into a plain config object
   * ready to destructure. Each value follows the precedence: explicit
   * constructor setting -> `data-*` attribute -> default. `dataset` is the
   * native camelCase<->data-kebab bridge, so `dataset.closeButton` reads
   * `data-close-button` with no manual conversion.
   *
   * @static
   * @param {HTMLElement} element   The card element (source of `data-*` attrs)
   * @param {Object}      settings  The constructor settings object
   * @param {Object}      schema    A SETTINGS-shaped schema
   * @returns {Object}
   */
  static parseSettings(element, settings, schema) {
    const dataset = element.dataset
    const config = {}
    for (const key in schema) {
      const { type, default: def } = schema[key]
      if (settings[key] !== undefined)
        config[key] = this.coerce[type](settings[key], def)
      else if (dataset[key] !== undefined)
        config[key] = this.coerce[type](dataset[key], def)
      else config[key] = def
    }
    return config
  }

  /**
   * The PerspectiveCard constructor. Creates and initialises the perspective card component.
   *
   * @constructor
   * @param {HTMLElement} element 				The element that contains all of the card details
   * @param {Object}      settings 				The settings of the component
   */
  constructor(element, settings = {}) {
    // Set the element
    this.element = element

    const { zoom, intensity, ambient } = PerspectiveCard.parseSettings(
      element,
      settings,
      PerspectiveCard.SETTINGS
    )
    this.zoomSize = zoom
    this.intensity = intensity
    this.ambient = ambient

    // Find the transformer and shine elements. We save these so we
    // don't waste proc time doing it every frame
    this.transformer = this.element.querySelector(`.${CSSCLASSES.transformer}`)
    this.shine = this.element.querySelector(`.${CSSCLASSES.shine}`)

    // Bind our event listeners
    this.resize = this.resize.bind(this)
    this.updatePosition = this.updatePosition.bind(this)
    this.touchStart = this.touchStart.bind(this)
    this.touchEnd = this.touchEnd.bind(this)
    this.pointerMove = this.pointerMove.bind(this)
    this.pointerEnter = this.pointerEnter.bind(this)
    this.pointerLeave = this.pointerLeave.bind(this)
    this.play = this.play.bind(this)
    this.intersect = this.intersect.bind(this)
    this.hideIntersect = this.hideIntersect.bind(this)

    // Add event listeners for resize, scroll, pointer enter and leave
    window.addEventListener('resize', this.resize)
    window.addEventListener('scroll', this.resize)
    this.element.addEventListener('pointerenter', this.pointerEnter)
    this.element.addEventListener('pointerleave', this.pointerLeave)
    this.element.addEventListener('touchstart', this.touchStart)
    this.element.addEventListener('touchend', this.touchEnd)

    if (this.ambient >= 0) {
      // Set up and bind the intersection observer
      this.observer = new IntersectionObserver(this.intersect, {
        rootMargin: '0%',
        threshold: [0.1]
      })
      this.observer.observe(this.element)
    } else {
      // Set up and bind the hiding intersection observer
      this.element.classList.add(CSSCLASSES.intersectionOff)
      this.observer = new IntersectionObserver(this.hideIntersect, {
        rootMargin: '100px'
      })
      this._observerTimer = setTimeout(() => {
        if (this.element.parentNode) {
          this.observer.observe(this.element.parentNode)
        } else {
          // Constructed detached: there's no parent to watch, so fail open
          // rather than leaving the card display:none forever. The card just
          // loses the offscreen-hide optimisation.
          this.element.classList.remove(CSSCLASSES.intersectionOff)
        }
      }, 0)
    }

    // Initial resize to find the location and dimensions of the element
    this.resize()
  }

  /**
   * Tears the card down: removes all window and element listeners, disconnects
   * the intersection observer and cancels any pending timers, allowing the
   * instance (and its element) to be garbage collected. The card is inert
   * afterwards - create a new instance to reactivate it.
   *
   * @public
   */
  destroy() {
    this.playing = false
    this.pointerControlled = false // removes the window pointermove listener
    clearTimeout(this.debounceTimer)
    clearTimeout(this._restTimer)
    clearTimeout(this._observerTimer)
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('scroll', this.resize)
    this.element.removeEventListener('pointerenter', this.pointerEnter)
    this.element.removeEventListener('pointerleave', this.pointerLeave)
    this.element.removeEventListener('touchstart', this.touchStart)
    this.element.removeEventListener('touchend', this.touchEnd)
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
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
    // If `playing` is true, then request the animation frame again
    if (this.playing && raf === true) {
      requestAnimationFrame(this.play)
    }

    // Set the last frame time in order to derive the sensible delta. Real
    // frame durations are used so animation speed doesn't scale with the
    // display's refresh rate; the 50ms cap absorbs tab-switch/hitch spikes.
    this.lastFrameTime = Math.max(1, Math.min(50, delta - this.lastDelta))

    if (this.motionOff) {
      return
    }

    this.lastDelta = delta
    this.delta += this.lastFrameTime

    // Frame-rate-independent damping factor for the zoom / look-point lerps:
    // two 8ms steps move exactly as far as one 16ms step. k = 0.008 is tuned
    // to match the pre-existing feel at 60Hz (~0.12 per 16.7ms frame).
    const damp = 1 - Math.exp(-0.008 * this.lastFrameTime)

    // If this element is not pointer controlled then we want to animate
    // the ambient target point value around somehow. Here we use a simple
    // fourier simulation.
    if (!this.pointerControlled) {
      const d = this.delta * 0.0001 + this.ambient
      const s = Math.sin(d * 2)
      const c = Math.cos(d * 0.5)
      const l = this.intensity * 10 * (0.5 + 0.5 * Math.cos(d * 3.542 + 1234.5)) // Half-cosine keeps l in [0, max] so tPoint never reflects through the origin

      this.tPoint = [c * l, s * l, this.tPoint[2]]
    }

    // If our zoom differential (the different between the zoom and
    // target zoom) is greater than the EPS value. We should animate it
    if (Math.abs(this.zoom - this.center[2]) > EPSILON) {
      this.center = [
        this.center[0],
        this.center[1],
        this.center[2] + (this.zoom - this.center[2]) * damp
      ]
    }

    // If our look differential (the difference between the look
    // point and the target point) is greater than 2 then we should
    // animate it. We use a relatively arbitrary value of 2 here
    // because we're using the square of the distance (to save
    // unecessary calculation) here.
    if (this._lookDifferential > 2) {
      this.lookPoint = [
        this.lookPoint[0] + (this.tPoint[0] - this.lookPoint[0]) * damp,
        this.lookPoint[1] + (this.tPoint[1] - this.lookPoint[1]) * damp,
        this.lookPoint[2] + (this.tPoint[2] - this.lookPoint[2]) * damp
      ]
    }

    // Find the wold matrix using the targetTo method (see above)
    const worldMatrix = PerspectiveCard.targetTo(
      this.center,
      this.lookPoint,
      [0, 1, 0]
    )

    // Find the polar coordinates for the rendition of the gradient.
    const angle =
      Math.atan2(this.lookPoint[1], this.lookPoint[0]) + Math.PI * 0.5
    const len = Math.hypot(this.lookPoint[0], this.lookPoint[1])

    // Transform the transformer element using the calculated values
    this.transformer.style.transform = `matrix3d(${worldMatrix.join(',')})`

    // Draw the gradient using the polar coordinates.
    const shineAlpha = Math.max(0.01, Math.abs(len * 0.002))
    this.shine.style.background = `linear-gradient(${angle}rad, rgba(255,255,255,${shineAlpha}) 0%, rgba(255,255,255,${shineAlpha}) 5%, rgba(255,255,255,0) 80%)`

    // The tilt in normalized card space: the Cartesian form of the polar
    // values above, relative to the card centre. ~[-1, 1] across the card
    // (0 = centre), so in pointer mode it tracks the normalized pointer
    // position, and it keeps animating in ambient mode like the polar values.
    // Saves consumers re-deriving cos/sin in CSS; `(var(--x) + 1) / 2` gives
    // box coordinates for `background-position` / `radial-gradient(at …)`.
    const nx = this.size[0] > 0 ? this.lookPoint[0] / (this.size[0] * 0.5) : 0
    const ny = this.size[1] > 0 ? this.lookPoint[1] / (this.size[1] * 0.5) : 0

    // Publish the tilt as CSS custom properties so consumers can drive their
    // own per-frame effects — holographic foil, glints, texture shifts — from
    // pure CSS on any element inside the card.
    this.element.style.setProperty('--perspective-card-angle', `${angle}rad`)
    this.element.style.setProperty('--perspective-card-tilt', len)
    this.element.style.setProperty('--perspective-card-x', nx)
    this.element.style.setProperty('--perspective-card-y', ny)
  }

  /**
   * Calculates the difference between the look point and the look point target
   *
   * @public
   */
  calculateLookDifferential() {
    const d = [
      this.lookPoint[0] - this.tPoint[0],
      this.lookPoint[1] - this.tPoint[1],
      this.lookPoint[2] - this.tPoint[2]
    ]
    this._lookDifferential = d[0] * d[0] + d[1] * d[1] + d[2] * d[2]
  }

  /**
   * (getter/setter) The transform applied to the transformer when the card is
   * at rest (i.e. not actively tilting). The base card rests face-on, so this
   * defaults to the identity matrix; consumers (or subclasses) can assign
   * another `matrix3d(...)` to rest in a different orientation — e.g. the
   * clickable card resting back-to-camera.
   *
   * @type {String}
   * @default the identity matrix
   */
  set restTransform(value) {
    if (typeof value === 'string') this._restTransform = value
  }
  get restTransform() {
    return this._restTransform || `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)`
  }

  /**
   * Event Listeners
   */

  touchStart(e) {
    this.touching = true
  }

  touchEnd(e) {
    this.touching = false
  }

  /**
   * The event listener for the pointer move event.
   * This sets the target point to a value based on the pointer's position
   *
   * @public
   * @param {event}  e 				The pointer event object
   * @listens pointermove
   */
  pointerMove(e) {
    if (this.touching === true) return
    this.tPoint = [
      e.clientX - this.axis[0],
      e.clientY - this.axis[1],
      this.tPoint[2]
    ]
  }

  /**
   * The event listener for the pointer enter
   * This sets the pointerControlled property to true, updates the target
   * zoom and adds the class `perspective-card--over` to the element.
   *
   * @public
   * @param {event}  e 				The pointer event object
   * @listens pointerenter
   */
  pointerEnter(e) {
    if (this.touching === true) return

    // Cancel any pending snap-to-rest (scheduled by pointerLeave or a modal
    // teardown) so re-entering within its 100ms window doesn't snap the card
    // to rest mid-hover.
    clearTimeout(this._restTimer)

    this.pointerControlled = true
    this.zoom = this.zoomSize
    this.element.classList.add(CSSCLASSES.over)

    if (this.ambient < 0) this.playing = true
  }

  /**
   * The event listener for the pointer leave event
   * This sets the pointerControlled property to false, updates the
   * target zoom and removes the class `perspective-card--over` to the element.
   *
   * @public
   * @param {event}  e 				The pointer event object
   * @listens pointerleave
   */
  pointerLeave(e) {
    this.pointerControlled = false
    this.zoom = 0
    this.element.classList.remove(CSSCLASSES.over)

    if (this.ambient < 0) {
      this.playing = false
      clearTimeout(this._restTimer)
      this._restTimer = setTimeout(() => {
        this.transformer.style.transform = this.restTransform
        this.shine.style.background = `none`
      }, 100)
    }
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

  updatePosition() {
    const pos = this.element.getBoundingClientRect()
    this.position = [pos.left, pos.top]
    this.size = [pos.width, pos.height]
    this.axis = [
      this.position[0] + this.size[0] * 0.5,
      this.position[1] + this.size[1] * 0.5
    ]
  }

  resize(e) {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = setTimeout(this.updatePosition, 300)
  }

  /**
   * Listener for the intersection observer callback
   *
   * @public
   * @param  {object} entries   the object that contains all of the elements being calculated by this observer
   * @param  {object} observer  the observer instance itself
   * @return void
   */
  intersect(entries, observer) {
    // Loop through the entries and set up the playing state based on whether the element is onscreen or not.
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        this.playing = true
      } else {
        this.playing = false
      }
    })
  }

  /**
   * Listener for the intersection observer callback
   *
   * @public
   * @param  {object} entries   the object that contains all of the elements being calculated by this observer
   * @param  {object} observer  the observer instance itself
   * @return void
   */
  hideIntersect(entries, observer) {
    // Loop through the entries and set up the playing state based on whether the element is onscreen or not.
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        this.element.classList.remove(CSSCLASSES.intersectionOff)
      } else {
        this.element.classList.add(CSSCLASSES.intersectionOff)
      }
    })
  }

  /**
   * Getters and setters
   */

  /**
   * (getter/setter) The motion value
   *
   * @type {boolean}
   * @default true
   */
  set motionOff(value) {
    this._motionOff = value === true
  }
  get motionOff() {
    return this._motionOff === true
  }

  /**
   * (getter/setter) The element value
   *
   * @type {HTMLElement}
   * @default null
   */
  set element(value) {
    if (value instanceof HTMLElement) this._element = value
  }
  get element() {
    return this._element || null
  }

  /**
   * (getter/setter) The position of the element relative to the viewport.
   *
   * @type {Array}
   * @default [0, 0]
   */
  set position(value) {
    if (value instanceof Array && value.length >= 2) {
      this._position = value
    }
  }
  get position() {
    return this._position || [0, 0]
  }

  /**
   * (getter/setter) The 3D target look point. This is the point that the
   * look point will animate towards.
   *
   * @type {Array}
   * @default [0, 0, -800]
   */
  set tPoint(value) {
    if (value instanceof Array && value.length >= 3) {
      this._tPoint = value
      this.calculateLookDifferential()
    }
  }
  get tPoint() {
    return this._tPoint || [0, 0, -800]
  }

  /**
   * (getter/setter) The 3D look point. This is the point that the card
   * look look at.
   *
   * @type {Array}
   * @default [0, 0, -800]
   */
  set lookPoint(value) {
    if (value instanceof Array && value.length >= 3) {
      this.calculateLookDifferential()
      this._lookPoint = value
    }
  }
  get lookPoint() {
    return this._lookPoint || [0, 0, -800]
  }

  /**
   * (getter/setter) The 3D point that the card sits at.
   *
   * @type {Array}
   * @default [0, 0, 0]
   */
  set center(value) {
    if (value instanceof Array && value.length >= 3) {
      this._center = value
    }
  }
  get center() {
    return this._center || [0, 0, 0]
  }

  /**
   * (getter/setter) The current zoom value. If this is very different to the
   * Z component of the center point, the animation frame will attempt to
   * animate towards this.
   *
   * @type {Array}
   * @default [0, 0, 0]
   */
  set zoom(value) {
    if (!isNaN(value)) this._zoom = value
  }
  get zoom() {
    return this._zoom || 0
  }

  /**
   * (getter/setter) The target zoom value
   *
   * @type {Number}
   * @default 40
   */
  set zoomSize(value) {
    if (!isNaN(value)) this._zoomSize = value
  }
  get zoomSize() {
    return this._zoomSize ?? 40
  }

  /**
   * (getter/setter) The intensity for the ambient animation.
   *
   * @type {Number}
   * @default 10
   */
  set intensity(value) {
    if (!isNaN(value)) this._intensity = value
  }
  get intensity() {
    return this._intensity ?? 10
  }

  /**
   * (getter/setter) The size of the element.
   *
   * @type {Array}
   * @default [0, 0]
   */
  set size(value) {
    if (value instanceof Array && value.length >= 2) {
      this._size = value
    }
  }
  get size() {
    return this._size || [0, 0]
  }

  /**
   * (getter/setter) Ambient setting.
   * Setting to tru will automatically animate the card.
   *
   * @type {Boolean}
   * @default false
   */
  set ambient(value) {
    this._ambient = value
  }
  get ambient() {
    return this._ambient || false
  }

  /**
   * (getter/setter) The axis of the element relative to the top-left point.
   *
   * @type {Array}
   * @default [0, 0]
   */
  set axis(value) {
    if (value instanceof Array && value.length >= 2) {
      this._axis = value
    }
  }
  get axis() {
    return this._axis || [0, 0]
  }

  /**
   * (getter/setter) Whether the simulation is playing. Setting this to
   * true will start up a requestAnimationFrame with the `play` method.
   *
   * @type {Boolean}
   * @default false
   */
  set playing(value) {
    const wasPlaying = this._playing === true
    if (!wasPlaying && value === true) {
      // Reset last frame time
      this.lastFrameTime = 0
      requestAnimationFrame(this.play)
    }
    this._playing = value === true
    if (this._playing !== wasPlaying) {
      this._dispatch(this._playing ? 'play' : 'pause')
    }
  }
  get playing() {
    return this._playing === true
  }

  /**
   * (getter/setter) The amount of time the last frame took
   *
   * @type {Number}
   * @default 0
   */
  set lastFrameTime(value) {
    if (!isNaN(value)) this._lastframeTime = value
  }
  get lastFrameTime() {
    return this._lastframeTime || 0
  }

  /**
   * (getter/setter) The animation delta. We use this and not the
   * RaF delta because we want this to pause when the animation is
   * not running.
   *
   * @type {Number}
   * @default 0
   */
  set delta(value) {
    if (!isNaN(value)) this._delta = value
  }
  get delta() {
    return this._delta || 0
  }

  /**
   * (getter/setter) The animation's last frame delta delta.
   *
   * @type {Number}
   * @default 0
   */
  set lastDelta(value) {
    if (!isNaN(value)) this._lastDelta = value
  }
  get lastDelta() {
    return this._lastDelta || 0
  }

  /**
   * (getter/setter) Whether the card animates based on the position
   * of the pointer. If this is true it will set the pointermove
   * event listener, otherwise it will try to remove it.
   *
   * @type {Boolean}
   * @default false
   */
  set pointerControlled(value) {
    if (!this.pointerControlled && value === true) {
      window.addEventListener('pointermove', this.pointerMove)
    } else if (this.pointerControlled && value === false) {
      window.removeEventListener('pointermove', this.pointerMove)
    }
    this._pointerControlled = value === true
  }
  get pointerControlled() {
    return this._pointerControlled === true
  }

  /**
   * Dispatches a CustomEvent on the card element with a `perspectivecard:` prefix.
   * Events bubble so they can be caught on any ancestor.
   *
   * @param {string} name   The event name (without the prefix)
   * @param {object} detail Optional detail payload
   */
  _dispatch(name, detail = {}) {
    this.element.dispatchEvent(
      new CustomEvent(`perspectivecard:${name}`, { bubbles: true, detail })
    )
  }

  /**
   * Static classes
   */

  /**
   * Generates a matrix that makes something look at something else.
   *
   * @static
   * @param {vec3} eye Position of the viewer
   * @param {vec3} center Point the viewer is looking at
   * @param {vec3} up vec3 pointing up
   * @returns {mat4} out
   */
  static targetTo(eye, target, up) {
    if (eye.array) eye = eye.array
    if (target.array) target = target.array
    if (up.array) up = up.array

    if (
      eye.length &&
      eye.length >= 3 &&
      target.length &&
      target.length >= 3 &&
      up.length &&
      up.length >= 3
    ) {
      const e = { x: eye[0], y: eye[1], z: eye[2] },
        c = { x: target[0], y: target[1], z: target[2] },
        u = { x: up[0], y: up[1], z: up[2] }

      const off = {
        x: e.x - c.x,
        y: e.y - c.y,
        z: e.z - c.z
      }
      let l = off.x * off.x + off.y * off.y + off.z * off.z
      if (l > 0) {
        l = 1 / Math.sqrt(l)
        off.x *= l
        off.y *= l
        off.z *= l
      }

      const or = {
        x: u.y * off.z - u.z * off.y,
        y: u.z * off.x - u.x * off.z,
        z: u.x * off.y - u.y * off.x
      }
      l = or.x * or.x + or.y * or.y + or.z * or.z
      if (l > 0) {
        l = 1 / Math.sqrt(l)
        or.x *= l
        or.y *= l
        or.z *= l
      }

      return [
        or.x,
        or.y,
        or.z,
        0,

        off.y * or.z - off.z * or.y,
        off.z * or.x - off.x * or.z,
        off.x * or.y - off.y * or.x,
        0,

        off.x,
        off.y,
        off.z,
        0,

        e.x,
        e.y,
        e.z,
        1
      ]
    }

    // No silent undefined - a malformed vector would otherwise surface as
    // `matrix3d(undefined)` far from the actual mistake.
    throw new TypeError(
      'targetTo requires eye, target and up to be vec3-like (length >= 3)'
    )
  }
}

// Exported here rather than inline - jsdoc drops `export class` declarations
// entirely (the class doclet becomes a member of itself), which silently
// empties the generated API.md.
export { PerspectiveCard }

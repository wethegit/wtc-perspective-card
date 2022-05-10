const SUPPORTSTOUCH = "ontouchstart" in window || navigator.msMaxTouchPoints;
const EPSILON = 0.001;

// Easing functions
const easeInOutCubic = function(time, start, change, duration) {
  if ((time /= duration / 2) < 1)
    return change * 0.5 * time * time * time + start;
  return change * 0.5 * ((time -= 2) * time * time + 2) + start;
};
const easeInOutSine = function(time, start, change, duration) {
  return (-change / 2) * (Math.cos((Math.PI * time) / duration) - 1) + start;
};

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
 */
class PerspectiveCard {
  /**
   * The PerspectiveCard constructor. Creates and initialises the perspective card component.
   *
   * @constructor
   * @param {HTMLElement} element 				The element that contains all of the card details
   * @param {Object}      settings 				The settings of the component
   */
  constructor(element, settings = {}) {
    // Set the element
    this.element = element;

    // set settings
    this.debug =
      settings.debug || this.element.hasAttribute("data-debug") || false;
    this.zoomSize =
      settings.zoom || parseInt(this.element.getAttribute("data-zoom")) || 40;
    this.intensity =
      settings.intensity ||
      parseInt(this.element.getAttribute("data-intensity")) ||
      10;

    this.ambient = -1;

    if (settings.ambient !== undefined && settings.ambient !== false) {
      const settingsVal = settings.ambient;
      if (settingsVal === true) this.ambient = 0;
      else this.ambient = settingsVal;
    } else if (this.element.hasAttribute("data-ambient")) {
      const dataVal = this.element.getAttribute("data-ambient");

      if (dataVal !== "false") {
        if (dataVal === "" || dataVal === "true") this.ambient = 0;
        else this.ambient = parseInt(dataVal);
      }
    }

    // Find the transformer and shine elements. We save these so we
    // don't waste proc time doing it every frame
    this.transformer = this.element.querySelector(
      ".perspective-card__transformer"
    );
    this.shine = this.element.querySelector(".perspective-card__shine");

    this.cardImage = this.element.querySelector('.perspective-card [class*="front"]');

    // Bind our event listeners
    this.resize = this.resize.bind(this);
    this.pointerMove = this.pointerMove.bind(this);
    this.pointerEnter = this.pointerEnter.bind(this);
    this.pointerLeave = this.pointerLeave.bind(this);
    this.play = this.play.bind(this);
    this.intersect = this.intersect.bind(this);

    // Add event listeners for resize, scroll, pointer enter and leave
    window.addEventListener("resize", this.resize);
    window.addEventListener("scroll", this.resize);
    this.element.addEventListener("pointerenter", this.pointerEnter);
    this.element.addEventListener("pointerleave", this.pointerLeave);

    if (this.ambient >= 0) {
      // Set up and bind the intersection observer
      this.observer = new IntersectionObserver(this.intersect, {
        rootMargin: "0%",
        threshold: [0.1]
      });
      this.observer.observe(this.element);
    }

    // Initial resize to find the location and dimensions of the element
    this.resize();
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
      requestAnimationFrame(this.play);
    }

    // Set the last frame time in order to derive the sensible delta
    this.lastFrameTime = Math.max(16, Math.min(32, delta - this.lastDelta));
    this.lastDelta = delta;
    this.delta += this.lastFrameTime;

    if (this.motionOff) {
      return;
    }

    // Set the divisor for animations based on the last frame time
    let divisor = 1 / this.lastFrameTime;
    // if (isNaN(divisor) || divisor === Infinity) divisor = 1;

    // If this element is not pointer controlled then we want to animate
    // the ambient target point value around somehow. Here we use a simple
    // fourier simulation.
    if (!this.pointerControlled) {
      // const d = delta * 0.0005;
      // const a = 1.8 + Math.sin(2. * d + .2) + .4 * Math.cos(4. * 2. * d);
      // const l = a * 80.;

      const d = this.delta * 0.0001 + this.ambient;
      const s = Math.sin(d * 2);
      const c = Math.cos(d * 0.5);
      const l = this.intensity * 10 * Math.cos(d * 3.542 + 1234.5); // Some really arbitrary numbers here. They don't mean anythign in particular, they just work.

      this.tPoint = [c * l, s * l, this.tPoint[2]];
    }

    // If our zoom differential (the different between the zoom and
    // target zoom) is greater than the EPS value. We should animate it
    if (Math.abs(this.zoom - this.center[2]) > EPSILON) {
      this.center = [
        this.center[0],
        this.center[1],
        this.center[2] + (this.zoom - this.center[2]) * (divisor * 2)
      ];
    }

    // If our look differential (the difference between the look
    // point and the target point) is greater than 2 then we should
    // animate it. We use a relatively arbitrary value of 2 here
    // because we're using the square of the distance (to save
    // unecessary calculation) here.
    if (this._lookDifferential > 2) {
      this.lookPoint = [
        this.lookPoint[0] +
          (this.tPoint[0] - this.lookPoint[0]) * (divisor * 2),
        this.lookPoint[1] +
          (this.tPoint[1] - this.lookPoint[1]) * (divisor * 2),
        this.lookPoint[2] + (this.tPoint[2] - this.lookPoint[2]) * (divisor * 2)
      ];
    }

    // Find the wold matrix using the targetTo method (see above)
    const worldMatrix = PerspectiveCard.targetTo(this.center, this.lookPoint, [
      0,
      1,
      0
    ]);

    // Find the polar coordinates for the rendition of the gradient.
    const angle =
      Math.atan2(this.lookPoint[1], this.lookPoint[0]) + Math.PI * 0.5;
    const len = Math.hypot(this.lookPoint[0], this.lookPoint[1]);

    // Transform the transformer element using the calculated values
    const matrix = `matrix3d(${worldMatrix[0]},${worldMatrix[1]},${worldMatrix[2]},${worldMatrix[3]},${worldMatrix[4]},${worldMatrix[5]},${worldMatrix[6]},${worldMatrix[7]},${worldMatrix[8]},${worldMatrix[9]},${worldMatrix[10]},${worldMatrix[11]},${worldMatrix[12]},${worldMatrix[13]},${worldMatrix[14]},${worldMatrix[15]})`;
    this.transformer.style.transform = matrix;

    // Draw the gradient using the polar coordinates.
    this.shine.style.background = `linear-gradient(${angle}rad, rgba(255,255,255,${Math.max(
      0.01,
      Math.abs(len * 0.002)
    )}) 0%, rgba(255,255,255,${Math.max(
      0.01,
      Math.abs(len * 0.002)
    )}) 5%, rgba(255,255,255,0) 80%)`;
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
    ];
    this._lookDifferential = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
  }

  /**
   * Event Listeners
   */

  /**
   * The event listener for the pointer move event.
   * This sets the target point to a value based on the pointer's position
   *
   * @public
   * @param {event}  e 				The pointer event object
   * @listens pointermove
   */
  pointerMove(e) {
    this.tPoint = [
      e.clientX - this.axis[0],
      e.clientY - this.axis[1],
      this.tPoint[2]
    ];
  }

  /**
   * The event listener for the pointer enter event
   * This sets the pointerControlled property to true, updates the target
   * zoom and adds the class `perspective-card--over` to the element.
   *
   * @public
   * @param {event}  e 				The pointer event object
   * @listens pointerenter
   */
  pointerEnter(e) {
    this.pointerControlled = true;
    this.zoom = this.zoomSize;
    this.element.classList.add("perspective-card--over");

    if (this.ambient < 0) this.playing = true;
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
    this.pointerControlled = false;
    this.zoom = 0;
    this.element.classList.remove("perspective-card--over");

    if (this.ambient < 0) {
      this.playing = false;
      setTimeout(() => {
        this.transformer.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)`;
        this.shine.style.background = `none`;
      }, 100);
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
  resize(e) {
    const resize = () => {
      const pos = this.element.getBoundingClientRect();
      this.position = [pos.left, pos.top];
      this.size = [pos.width, pos.height];
      this.axis = [
        this.position[0] + this.size[0] * 0.5,
        this.position[1] + this.size[1] * 0.5
      ];
    };
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(resize, 300);
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
        this.playing = true;
      } else {
        this.playing = false;
      }
    });
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
    this._motionOff = value === true;
  }
  get motionOff() {
    return this._motionOff === true;
  }

  /**
   * (getter/setter) The element value
   *
   * @type {HTMLElement}
   * @default null
   */
  set element(value) {
    if (value instanceof HTMLElement) this._element = value;
  }
  get element() {
    return this._element || null;
  }

  /**
   * (getter/setter) The position of the element relative to the viewport.
   *
   * @type {Array}
   * @default [0, 0]
   */
  set position(value) {
    if (value instanceof Array && value.length >= 2) {
      this._position = value;
    }
  }
  get position() {
    return this._position || [0, 0];
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
      this._tPoint = value;
      this.calculateLookDifferential();
    }
  }
  get tPoint() {
    return this._tPoint || [0, 0, -800];
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
      this.calculateLookDifferential();
      this._lookPoint = value;
    }
  }
  get lookPoint() {
    return this._lookPoint || [0, 0, -800];
  }

  /**
   * (getter/setter) The 3D point that the card sits at.
   *
   * @type {Array}
   * @default [0, 0, 0]
   */
  set center(value) {
    if (value instanceof Array && value.length >= 3) {
      this._center = value;
    }
  }
  get center() {
    return this._center || [0, 0, 0];
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
    if (!isNaN(value)) this._zoom = value;
  }
  get zoom() {
    return this._zoom || 0;
  }

  /**
   * (getter/setter) The target zoom value
   *
   * @type {Number}
   * @default 40
   */
  set zoomSize(value) {
    if (!isNaN(value)) this._zoomSize = value;
  }
  get zoomSize() {
    return this._zoomSize || 40;
  }

  /**
   * (getter/setter) The intensity for the ambient animation.
   *
   * @type {Number}
   * @default 10
   */
  set intensity(value) {
    if (!isNaN(value)) this._intensity = value;
  }
  get intensity() {
    return this._intensity || 10;
  }

  /**
   * (getter/setter) The size of the element.
   *
   * @type {Array}
   * @default [0, 0]
   */
  set size(value) {
    if (value instanceof Array && value.length >= 2) {
      this._size = value;
    }
  }
  get size() {
    return this._size || [0, 0];
  }
  /**
   * (getter/setter) Debug setting.
   *
   * @type {Boolean}
   * @default false
   */

  set debug(value) {
    this._debug = value;
  }
  get debug() {
    return this._debug || false;
  }
  /**
   * (getter/setter) Ambient setting.
   * Setting to tru will automatically animate the card.
   *
   * @type {Boolean}
   * @default false
   */

  set ambient(value) {
    this._ambient = value;
  }
  get ambient() {
    return this._ambient || false;
  }

  /**
   * (getter/setter) The axis of the element relative to the top-left point.
   *
   * @type {Array}
   * @default [0, 0]
   */
  set axis(value) {
    if (value instanceof Array && value.length >= 2) {
      this._axis = value;
    }
  }
  get axis() {
    return this._axis || [0, 0];
  }

  /**
   * (getter/setter) Whether the simulation is playing. Setting this to
   * true will start up a requestAnimationFrame with the `play` method.
   *
   * @type {Boolean}
   * @default false
   */
  set playing(value) {
    if (!this.playing && value === true) {
      // Reset last frame time
      this.lastFrameTime = 0;
      requestAnimationFrame(this.play);
    }
    this._playing = value === true;
  }
  get playing() {
    return this._playing === true;
  }

  /**
   * (getter/setter) The amount of time the last frame took
   *
   * @type {Number}
   * @default 0
   */
  set lastFrameTime(value) {
    if (!isNaN(value)) this._lastframeTime = value;
  }
  get lastFrameTime() {
    return this._lastframeTime || 0;
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
    if (!isNaN(value)) this._delta = value;
  }
  get delta() {
    return this._delta || 0;
  }

  /**
   * (getter/setter) The animation's last frame delta delta.
   *
   * @type {Number}
   * @default 0
   */
  set lastDelta(value) {
    if (!isNaN(value)) this._lastDelta = value;
  }
  get lastDelta() {
    return this._lastDelta || 0;
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
      window.addEventListener("pointermove", this.pointerMove);
    } else if (this.pointerControlled && value === false) {
      window.removeEventListener("pointermove", this.pointerMove);
    }
    this._pointerControlled = value === true;
  }
  get pointerControlled() {
    return this._pointerControlled === true;
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
    if (eye.array) eye = eye.array;
    if (target.array) target = target.array;
    if (up.array) up = up.array;

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
        u = { x: up[0], y: up[1], z: up[2] };

      const off = {
        x: e.x - c.x,
        y: e.y - c.y,
        z: e.z - c.z
      };
      let l = off.x * off.x + off.y * off.y + off.z * off.z;
      if (l > 0) {
        l = 1 / Math.sqrt(l);
        off.x *= l;
        off.y *= l;
        off.z *= l;
      }

      const or = {
        x: u.y * off.z - u.z * off.y,
        y: u.z * off.x - u.x * off.z,
        z: u.x * off.y - u.y * off.x
      };
      l = or.x * or.x + or.y * or.y + or.z * or.z;
      if (l > 0) {
        l = 1 / Math.sqrt(l);
        or.x *= l;
        or.y *= l;
        or.z *= l;
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
      ];
    }
  }
}

/**
 * The clickable perspective card adds functionality that allows the zooming
 * the card by clicking on it. In doing so the card flips and animates up to a
 * modal style display.
 *
 * @todo Add some extra functionality here like a close button and keyboard close
 *
 * @author Liam Egan <liam@wethecollective.com>
 * @version 2.0.0
 * @created Jan 28, 2020
 * @extends PerspectiveCard
 */
class ClickablePerspectiveCard extends PerspectiveCard {
  /**
   * The ClickablePerspectiveCard constructor. Creates and initialises the perspective
   * card component.
   *
   * @constructor
   * @param {HTMLElement} element 				The element that contains all of the card details
   * @param {Object}      settings 				The settings of the component
   */
  constructor(element, settings) {
    // Call the superfunction
    super(element, settings);

    // We're using this varaible to prevent the user from clicking multiple
    // perspective cards and having them all open. This will make sure only the
    // FIRST clicked card will open.
    window.clickablePerspectiveCard_initialtouch = null;

    // Bind the extra handlers
    this.onClick = this.onClick.bind(this);
    this.onKey = this.onKey.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);

    this._tweenBuffer = false;

    // Create the matte - this is the element that will appear behind the card.
    this.matte = document.createElement("div");
    this.matte.className = `perspective-card--matte`;

    // Add the listener to the pointer up event
    this.element.addEventListener("pointerdown", this.onPointerDown);
    this.element.addEventListener("pointerup", this.onClick);
    this.matte.addEventListener("pointerup", this.onClick);
    this.matte.addEventListener("pointerdown", this.onPointerDown);
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

  resize(e) {
    const resize = () => {
      const pos = this.element.getBoundingClientRect();
      if (this.enlarged === false) {
        this.startingDimensions = [pos.width, pos.height];
      }
      this.position = [pos.left, pos.top];
      this.size = [pos.width, pos.height];
      this.axis = [
        this.position[0] + this.size[0] * 0.5,
        this.position[1] + this.size[1] * 0.5
      ];
    };
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(resize, 300);
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
    super.play(delta, raf);

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
      ];

      // Tween the card scale
      this.screenScale = easeInOutCubic(
        this.tweenTime,
        this.startingScale,
        this.targetScale - this.startingScale,
        this.tweenDuration
      );

      // Tween the rotation value
      // This is responsible for moving the look at point in a large circle
      // around the card and gives the illusion that the card is flipping
      const r = easeInOutSine(
        this.tweenTime,
        Math.PI * 0.5,
        this.rotationAmount,
        this.tweenDuration
      );
      const t = [Math.cos(r) * -800, Math.sin(r) * -800];
      this.lookPoint = [t[0], this.lookPoint[1], t[1]];

      // Update the tween time with the last frame duration
      this.tweenTime += this.lastFrameTime;

      // If our time has run out, but tweening is true it means that the animation has just ended
    } else if (this.tweening === true) {
      // Set the card's position on screen to the fixed end point
      this.screenPosition = this.targetPosition;
      this.tweening = false;

      // Resize things so that mouse interation is sensible
      this.resize();

      // Run our end function.
      this.onEndTween();
    }
  }

  // Toggle the enlarged flag on click
  onClick(e) {
    if (
      window.clickablePerspectiveCard_initialtouch === e.pointerId &&
      this._tweenBuffer === false
    ) {
      this.enlarged = !this.enlarged;
      window.clickablePerspectiveCard_initialtouch = null;
    }
  }

  // Toggle the enlarged flag on click
  onPointerDown(e) {
    if (
      window.clickablePerspectiveCard_initialtouch === null &&
      this._tweenBuffer === false
    ) {
      window.clickablePerspectiveCard_initialtouch = e.pointerId;
    }
  }

  onKey(e) {
    if (e.keyCode === 27) this.enlarged = false;
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
    if (this.tweening === true) return;

    // Whether we were enlarged already
    const wasEnlarged = this.enlarged;

    // Set the value
    this._enlarged = value === true;

    // If we're going from unenlarged to enlarged
    if (this.enlarged === true && wasEnlarged === false) {
      window.addEventListener("keyup", this.onKey);

      // Get the current bounding client rectangle
      const viewportOffset = this.element.getBoundingClientRect();

      // This makes it so that, when the card is enlarged that it runs ambiently by defailt
      this._wasAmbient = this.ambient;
      this.ambient = 0;

      // Set up the DOM for this. Basically the same as setting up a modal.
      document.body.style.overflow = "hidden";
      if (
        ["MacIntel", "iPhone", "iPad", "Android"].indexOf(
          navigator.platform
        ) === -1
      )
        document.body.style.paddingRight = "15px"; // Restricting this to non macs
      this.element.style.position = "fixed";
      this.element.classList.add("perspective-card--modal");
      setTimeout(() => {
        this.matte.classList.add("perspective-card--modal");
      }, 0);
      document.body.appendChild(this.matte);

      // Initialise our tween timing variables
      this.tweening = true;
      this.tweenTime = 0;
      this.tweenDuration = 1500; // 1.5 seconds

      // Set up our positional arrays
      // Start position
      this.startingPosition = [viewportOffset.left, viewportOffset.top];

      // Set up our scaling properties
      // start scale
      this.startingScale = 1;
      // current scale
      this.screenScale = 1;
      let fscale = 0.7;
      // Then we need to determine the target position based on the ratio of the screen to the card
      // This basically ensures that we scale up to 70% width *or* 70% height. Whichever is smaller
      const screenRatio = window.innerWidth / window.innerHeight;
      const cardRatio = this.startingDimensions[0] / this.startingDimensions[1];
      if (screenRatio < cardRatio) {
        const width = window.innerWidth * fscale;
        this.targetScale = width / this.startingDimensions[0];
      } else {
        const height = window.innerHeight * fscale;
        this.targetScale = height / this.startingDimensions[1];
      }

      // Current position
      this.screenPosition = [viewportOffset.left, viewportOffset.top];
      // End position
      this.targetPosition = [
        window.innerWidth * 0.5 - this.startingDimensions[0] * 0.5,
        window.innerHeight * 0.5 - this.startingDimensions[1] * 0.5
      ];

      // Set up the amount of rotation that needs to happen
      this.rotationAmount = Math.PI * -2;

      this.onEndTween = function() {
        // Transform style preserve 3d, and the translateZ were causing 
        // the card image to pixelate on non retina monitors. Removing these
        // whilst the card is open fixes that.
        this.cardImage.style.transform = "initial";
        this.transformer.style.transformStyle = "flat";
      };

      // If we're going from enlarged to unenlarged
    } else if (this.enlarged === false && wasEnlarged === true) {
      window.removeEventListener("keyup", this.onKey);

      // Adds 3d transforms back in on close. 
      this.transformer.style.transformStyle = "preserve-3d";
      this.cardImage.style.transform = "translateZ(2px)";

      // Remove the modal class from the matte
      this.matte.classList.remove("perspective-card--modal");

      // Initialise our tween timing variables
      this.tweening = true;
      this.tweenTime = 0;
      this.tweenDuration = 1000; // 1 second

      // Set up our positional arrays. Basically just opposing the previous tween
      const startingPosition = this.startingPosition;
      this.startingPosition = this.targetPosition;
      this.targetPosition = startingPosition;

      // Set up our scaling properties
      this.startingScale = this.screenScale;
      this.targetScale = 1;

      // Set up the amount of rotation that needs to happen
      // We want this to be opposite to the previous one
      this.rotationAmount = Math.PI * 2;

      // At the end of this tween we clean everything up
      this.onEndTween = function() {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        document.body.removeChild(this.matte);
        this.element.classList.remove("perspective-card--modal");

        this.element.style.position = "";
        this.screenPosition = [0, 0];

        this.element.style.left = "";
        this.element.style.top = "";

        setTimeout(() => {
          this.transformer.style.transform = `matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)`;
        }, 100);

        // Returning the ambient state to what it was, if it *was* false
        if (this._wasAmbient < 0) {
          this.ambient = -1;
        }
        if (this.pointerControlled === false) {
          this.playing = false;
        }
      };
    }
  }
  get enlarged() {
    return this._enlarged === true;
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
      this._tweenBuffer = true;
      setTimeout(() => {
        this._tweenBuffer = false;
      }, 1000);
    }
    this._tweening = value === true;
  }
  get tweening() {
    return this._tweening === true;
  }

  /**
   * (getter/setter) The current tween time.
   *
   * @type {Number}
   * @default 0
   */
  set tweenTime(value) {
    if (!isNaN(value)) this._tweenTime = value;
  }
  get tweenTime() {
    return this._tweenTime || 0;
  }

  /**
   * (getter/setter) The current tween duration.
   *
   * @type {Number}
   * @default 0
   */
  set tweenDuration(value) {
    if (!isNaN(value)) this._tweenDuration = value;
  }
  get tweenDuration() {
    return this._tweenDuration || 0;
  }

  /**
   * (getter/setter) The function to call when the tween ends.
   *
   * @type {Function}
   * @default null
   */
  set onEndTween(value) {
    if (value instanceof Function) {
      this._onEndTween = value.bind(this);
    }
  }
  get onEndTween() {
    return this._onEndTween || function() {};
  }

  /**
   * (getter/setter) The target position on-screen for the card.
   *
   * @type {Vec2|Array}
   * @default [0,0]
   */
  set targetPosition(value) {
    if (value instanceof Array && value.length >= 2) {
      this._targetPosition = value;
    }
  }
  get targetPosition() {
    return this._targetPosition || [0, 0];
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
      this._screenPosition = value;
      this.element.style.left = `${value[0]}px`;
      this.element.style.top = `${value[1]}px`;
    }
  }
  get screenPosition() {
    return this._screenPosition || [0, 0];
  }

  /**
   * (getter/setter) The card's current scale value.
   *
   * @type {Number}
   * @default 0
   */
  set screenScale(value) {
    if (!isNaN(value)) {
      this._screenScale = value;
      this.element.style.transform = `scale(${value})`;
    }
  }
  get screenScale() {
    return this._screenScale || 1;
  }

  /**
   * (getter/setter) The target dimensions for the card.
   *
   * @type {Vec2|Array}
   * @default [0,0]
   */
  set targetDimensions(value) {
    if (value instanceof Array && value.length >= 2) {
      this._targetDimensions = value;
    }
  }
  get targetDimensions() {
    return this._targetDimensions || [0, 0];
  }
}

export { PerspectiveCard as default, ClickablePerspectiveCard };

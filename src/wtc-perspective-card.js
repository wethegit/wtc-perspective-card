const SUPPORTSTOUCH = "ontouchstart" in window || navigator.msMaxTouchPoints;
const EPSILON = 0.001;

/**
 * This sets up the basic perspective card. This class expects markup at least
 * conforming to:
 * ```
 * .card
 *   .card__transformer
 *     .card__artwork card__artwork--front
 *       img
 *     .card__artwork card__artwork--rear (optional)
 *       img
 *     .card__shine
 * ```
 *
 * This class is designed to be used with a decorator function (provided by
 * the new wtc-decorator static class) or used directly like:
 * ```
 * const p = new PerspectiveCard(element);
 * ```
 *
 * @author Liam Egan <liam@wethecollective.com>
 * @version 2.0.0
 * @created Jan 28, 2020
 */
class PerspectiveCard {
  
	/**
	 * The PerspectiveCard constructor. Creates and initialises the perspective card component.
	 *
	 * @constructor
	 * @param {HTMLElement} element 				The element that contains all of the card details
	 */
  constructor(element) {
    // Set the element
    this.element = element;
    
    // Find the transformer and shine elements. We save these so we 
    // don't waste proc time doing it every frame
    this.transformer = this.element.querySelector('.card__transformer');
    this.shine = this.element.querySelector('.card__shine');
    
    // Bind our event listeners
    this.resize = this.resize.bind(this);
    this.pointerMove = this.pointerMove.bind(this);
    this.pointerEnter = this.pointerEnter.bind(this);
    this.pointerLeave = this.pointerLeave.bind(this);
    this.play = this.play.bind(this);
    this.intersect = this.intersect.bind(this);
    
    // Add event listeners for resize, scroll, pointer enter and leave
    window.addEventListener('resize', this.resize);
    window.addEventListener('scroll', this.resize);
    this.element.addEventListener("pointerenter", this.pointerEnter);
    this.element.addEventListener("pointerleave", this.pointerLeave);
    // Set up and bind the intersection observer
    this.observer = new IntersectionObserver(this.intersect, {
        rootMargin: '0%',
        threshold: [.1]
      });
    this.observer.observe(this.element);
    
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
    if(this.playing && raf === true) {
      requestAnimationFrame(this.play);
    }
    
    // Set the last frame time in order to derive the sensible delta
    this.lastFrameTime = Math.min(32, delta - this.delta);
    if(this.delta === 0) this.delta = delta;
    this.delta += this.lastFrameTime;
    
    // Set the divisor for animations based on the last frame time
    const divisor = 1. / this.lastFrameTime;
    
    // If this element is not pointer controlled then we want to animate
    // the ambient target point value around somehow. Here we use a simple
    // fourier simulation.
    if(!this.pointerControlled) {
      // const d = delta * 0.0005;
      // const a = 1.8 + Math.sin(2. * d + .2) + .4 * Math.cos(4. * 2. * d);
      // const l = a * 80.;
      
      const d = this.delta * 0.0001;
      const s = Math.sin(d*2.);
      const c = Math.cos(d*.5);
      const l = 200. * Math.cos(d * 3.542 + 1234.5);
      
      this.tPoint = [
        c * l,
        s * l,
        this.tPoint[2]
      ];
    }
    
    // If our zoom differential (the different between the zoom and 
    // target zoom) is greater than the EPS value. We should animate it
    if(Math.abs(this.zoom - this.center[2]) > EPSILON) {
      this.center = [
        this.center[0],
        this.center[1],
        this.center[2] + (this.zoom - this.center[2]) * (divisor*2)
      ];
    }
    
    // If our look differential (the difference between the look
    // point and the target point) is greater than 2 then we should
    // animate it. We use a relatively arbitrary value of 2 here 
    // because we're using the square of the distance (to save 
    // unecessary calculation) here.
    if(this._lookDifferential > 2) {
      this.lookPoint = [
        this.lookPoint[0] + (this.tPoint[0] - this.lookPoint[0]) * (divisor*2),
        this.lookPoint[1] + (this.tPoint[1] - this.lookPoint[1]) * (divisor*2),
        this.lookPoint[2] + (this.tPoint[2] - this.lookPoint[2]) * (divisor*2)
      ];
    }

    // Find the wold matrix using the targetTo method (see above)
    const worldMatrix = PerspectiveCard.targetTo(this.center, this.lookPoint, [0, 1, 0]);

    // Find the polar coordinates for the rendition of the gradient.
    const angle = Math.atan2(this.lookPoint[1], this.lookPoint[0]) + Math.PI*.5;
    const len = Math.hypot(this.lookPoint[0], this.lookPoint[1]);

    // Transform the transformer element using the calculated values
    this.transformer.style.transform = `matrix3d(${worldMatrix[0]},${worldMatrix[1]},${worldMatrix[2]},${worldMatrix[3]},${worldMatrix[4]},${worldMatrix[5]},${worldMatrix[6]},${worldMatrix[7]},${worldMatrix[8]},${worldMatrix[9]},${worldMatrix[10]},${worldMatrix[11]},${worldMatrix[12]},${worldMatrix[13]},${worldMatrix[14]},${worldMatrix[15]})`;

    // Draw the gradient using the polar coordinates.
    this.shine.style.background = `linear-gradient(${angle}rad, rgba(255,255,255,${Math.max(.01, Math.abs(len * .002))}) 0%, rgba(255,255,255,${Math.max(.01, Math.abs(len * .002))}) 5%, rgba(255,255,255,0) 80%)`;
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
      (e.clientX - this.axis[0]), 
      (e.clientY - this.axis[1]), 
      this.tPoint[2]
    ];
  }
  
  /**
   * The event listener for the pointer enter event
   * This sets the pointerControlled property to true, updates the target
   * zoom and adds the class `card--over` to the element.
   *
   * @public
	 * @param {event}  e 				The pointer event object
   * @listens pointerenter
   */
  pointerEnter(e) {
    this.pointerControlled = true;
    this.zoom = 40;
    this.element.classList.add('card--over');
  }
  
  /**
   * The event listener for the pointer leave event
   * This sets the pointerControlled property to false, updates the
   * target zoom and removes the class `card--over` to the element.
   *
   * @public
	 * @param {event}  e 				The pointer event object
   * @listens pointerleave
   */
  pointerLeave(e) {
    this.pointerControlled = false;
    this.zoom = 0;
    this.element.classList.remove('card--over');
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
      this.size = [this.element.offsetWidth, this.element.offsetHeight];
      this.axis = [ 
        this.position[0] + this.size[0] * .5,
        this.position[1] + this.size[1] * .5 ];
    }
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
      if(entry.isIntersecting) {
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
   * (getter/setter) The element value
   *
   * @type {HTMLElement}
   * @default null
   */
  set element(value) {
    if(value instanceof HTMLElement) this._element = value;
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
    if(value instanceof Array && value.length >= 2) {
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
    if(value instanceof Array && value.length >= 3) {
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
    if(value instanceof Array && value.length >= 3) {
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
    if(value instanceof Array && value.length >= 3) {
      this._center = value;
    }
  }
  get center() {
    return this._center || [0, 0, 0];
  }
  
  /**
   * (getter/setter) The target zoom value. If this is very different to the
   * Z component of the center point, the animation frame will attempt to
   * animate towards this.
   *
   * @type {Array}
   * @default [0, 0, 0]
   */
  set zoom(value) {
    if(!isNaN(value)) this._zoom = value;
  }
  get zoom() {
    return this._zoom || 0;
  }
  
  /**
   * (getter/setter) The size of the element.
   *
   * @type {Array}
   * @default [0, 0]
   */
  set size(value) {
    if(value instanceof Array && value.length >= 2) {
      this._size = value;
    }
  }
  get size() {
    return this._size || [0, 0];
  }
  
  /**
   * (getter/setter) The axis of the element relative to the top-left point.
   *
   * @type {Array}
   * @default [0, 0]
   */
  set axis(value) {
    if(value instanceof Array && value.length >= 2) {
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
    if(!this.playing && value === true) {
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
    if(!isNaN(value)) this._lastframeTime = value;
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
    if(!isNaN(value)) this._delta = value;
  }
  get delta() {
    return this._delta || 0;
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
    if(!this.pointerControlled && value === true) {
      window.addEventListener( "pointermove", this.pointerMove);
    } else if(this.pointerControlled && value === false) {
      window.removeEventListener( "pointermove", this.pointerMove);
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

    if(eye.array) eye = eye.array;
    if(target.array) target = target.array;
    if(up.array) up = up.array;

    if(
      eye.length && eye.length >= 3 && 
      target.length && target.length >= 3 && 
      up.length && up.length >= 3) {

      const e = { x: eye[0], y: eye[1], z: eye[2] },
            c = { x: target[0], y: target[1], z: target[2] },
            u = { x: up[0], y: up[1], z: up[2] };

      const off = {
        x: e.x - c.x,
        y: e.y - c.y,
        z: e.z - c.z
      };
      let l = off.x*off.x + off.y*off.y + off.z*off.z;
      if(l>0) {
        l = 1. / Math.sqrt(l);
        off.x *= l;
        off.y *= l;
        off.z *= l;
      }

      const or = {
        x: u.y * off.z - u.z * off.y,
        y: u.z * off.x - u.x * off.z,
        z: u.x * off.y - u.y * off.x
      };
      l = or.x*or.x + or.y*or.y + or.z*or.z;
      if(l>0) {
        l = 1. / Math.sqrt(l);
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
  };
  
}

export { PerspectiveCard }
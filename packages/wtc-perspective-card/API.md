# API reference

> Generated from the source JSDoc by `pnpm document` - do not edit by hand.

## Classes

<dl>
<dt><a href="#PerspectiveCard">PerspectiveCard</a></dt>
<dd><p>This sets up the basic perspective card. This class expects markup at least
conforming to:</p>
<pre><code>.perspective-card
  .perspective-card__transformer
    .perspective-card__artwork.perspective-card__artwork--front
      img
    .perspective-card__artwork.perspective-card__artwork--back
      img
    .perspective-card__shine
</code></pre>
<p>This class is designed to be used with a decorator function (provided by
the new wtc-decorator static class) or used directly like:</p>
<pre><code>const p = new PerspectiveCard(element);
</code></pre>
<p>While animating, the card publishes its tilt as CSS custom properties on
the element — <code>--perspective-card-angle</code> (the tilt direction, in radians),
<code>--perspective-card-tilt</code> (the tilt magnitude, unitless), and
<code>--perspective-card-x</code> / <code>--perspective-card-y</code> (the same tilt in normalized
card space, ~[-1, 1] with 0 at the centre; in pointer mode these track the
normalized pointer position) — so custom per-frame effects like holographic
foils can be driven from pure CSS on any element placed inside the card.</p>
</dd>
<dt><a href="#ClickablePerspectiveCard">ClickablePerspectiveCard</a> ⇐ <code><a href="#PerspectiveCard">PerspectiveCard</a></code></dt>
<dd><p>The clickable perspective card adds functionality that allows the zooming
the card by clicking on it. In doing so the card flips and animates up to a
modal style display.</p>
<p>For accessibility, the card is operated through a real <code>button</code> element
that covers the card. If the markup doesn&#39;t already contain a
<code>button.perspective-card__button</code>, one is created and appended
automatically, labelled from <code>settings.buttonLabel</code> or the
<code>data-button-label</code> attribute. The button exposes <code>aria-haspopup=&quot;dialog&quot;</code>
and <code>aria-expanded</code>, can be operated with Enter/Space, and receives focus
back when the card closes. Escape closes the open card via the dialog&#39;s
cancel event.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#CSSCLASSES">CSSCLASSES</a></dt>
<dd><p>Centralised CSS class names used by the base card.</p>
</dd>
<dt><a href="#CSSCLASSES">CSSCLASSES</a></dt>
<dd><p>The base card&#39;s class names extended with the ones the clickable card adds
(the trigger button, dialog, modal/open states and close button).</p>
</dd>
</dl>

<a name="PerspectiveCard"></a>

## PerspectiveCard
This sets up the basic perspective card. This class expects markup at least
conforming to:
```
.perspective-card
  .perspective-card__transformer
    .perspective-card__artwork.perspective-card__artwork--front
      img
    .perspective-card__artwork.perspective-card__artwork--back
      img
    .perspective-card__shine
```

This class is designed to be used with a decorator function (provided by
the new wtc-decorator static class) or used directly like:
```
const p = new PerspectiveCard(element);
```

While animating, the card publishes its tilt as CSS custom properties on
the element — `--perspective-card-angle` (the tilt direction, in radians),
`--perspective-card-tilt` (the tilt magnitude, unitless), and
`--perspective-card-x` / `--perspective-card-y` (the same tilt in normalized
card space, ~[-1, 1] with 0 at the centre; in pointer mode these track the
normalized pointer position) — so custom per-frame effects like holographic
foils can be driven from pure CSS on any element placed inside the card.

**Kind**: global class  

* [PerspectiveCard](#PerspectiveCard)
    * [new PerspectiveCard(element, settings)](#new_PerspectiveCard_new)
    * _instance_
        * [.SETTINGS](#PerspectiveCard+SETTINGS)
        * [.coerce](#PerspectiveCard+coerce)
        * [.restTransform](#PerspectiveCard+restTransform) : <code>String</code>
        * [.motionOff](#PerspectiveCard+motionOff) : <code>boolean</code>
        * [.element](#PerspectiveCard+element) : <code>HTMLElement</code>
        * [.position](#PerspectiveCard+position) : <code>Array</code>
        * [.tPoint](#PerspectiveCard+tPoint) : <code>Array</code>
        * [.lookPoint](#PerspectiveCard+lookPoint) : <code>Array</code>
        * [.center](#PerspectiveCard+center) : <code>Array</code>
        * [.zoom](#PerspectiveCard+zoom) : <code>Array</code>
        * [.zoomSize](#PerspectiveCard+zoomSize) : <code>Number</code>
        * [.intensity](#PerspectiveCard+intensity) : <code>Number</code>
        * [.size](#PerspectiveCard+size) : <code>Array</code>
        * [.ambient](#PerspectiveCard+ambient) : <code>Boolean</code>
        * [.axis](#PerspectiveCard+axis) : <code>Array</code>
        * [.playing](#PerspectiveCard+playing) : <code>Boolean</code>
        * [.lastFrameTime](#PerspectiveCard+lastFrameTime) : <code>Number</code>
        * [.delta](#PerspectiveCard+delta) : <code>Number</code>
        * [.lastDelta](#PerspectiveCard+lastDelta) : <code>Number</code>
        * [.pointerControlled](#PerspectiveCard+pointerControlled) : <code>Boolean</code>
        * [.destroy()](#PerspectiveCard+destroy)
        * [.play(delta, raf)](#PerspectiveCard+play)
        * [.calculateLookDifferential()](#PerspectiveCard+calculateLookDifferential)
        * [.touchStart()](#PerspectiveCard+touchStart)
        * [.pointerMove(e)](#PerspectiveCard+pointerMove)
        * [.pointerEnter(e)](#PerspectiveCard+pointerEnter)
        * [.pointerLeave(e)](#PerspectiveCard+pointerLeave)
        * [.updatePosition(e)](#PerspectiveCard+updatePosition)
        * [.intersect(entries, observer)](#PerspectiveCard+intersect) ⇒
        * [.hideIntersect(entries, observer)](#PerspectiveCard+hideIntersect) ⇒
        * [._dispatch(name, detail)](#PerspectiveCard+_dispatch)
    * _static_
        * [.parseSettings(element, settings, schema)](#PerspectiveCard.parseSettings) ⇒ <code>Object</code>
        * [.targetTo(eye, center, up)](#PerspectiveCard.targetTo) ⇒ <code>mat4</code>

<a name="new_PerspectiveCard_new"></a>

### new PerspectiveCard(element, settings)
The PerspectiveCard constructor. Creates and initialises the perspective card component.


| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element that contains all of the card details |
| settings | <code>Object</code> | The settings of the component |

<a name="PerspectiveCard+SETTINGS"></a>

### perspectiveCard.SETTINGS
The settings schema. Each entry declares a setting's coercion `type` (a key
of `PerspectiveCard.coerce`) and its `default`. This is the single source
of truth for what `parseSettings` resolves from constructor settings and
`data-*` attributes; subclasses declare their own `SETTINGS`.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
<a name="PerspectiveCard+coerce"></a>

### perspectiveCard.coerce
Coercion functions keyed by setting type. Each receives the resolved raw
value (a real type from settings, or a string from a data-* attribute) and
the setting's default, and returns the final value.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
<a name="PerspectiveCard+restTransform"></a>

### perspectiveCard.restTransform : <code>String</code>
(getter/setter) The transform applied to the transformer when the card is
at rest (i.e. not actively tilting). The base card rests face-on, so this
defaults to the identity matrix; consumers (or subclasses) can assign
another `matrix3d(...)` to rest in a different orientation — e.g. the
clickable card resting back-to-camera.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>the identity matrix</code>  
<a name="PerspectiveCard+motionOff"></a>

### perspectiveCard.motionOff : <code>boolean</code>
(getter/setter) The motion value

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>true</code>  
<a name="PerspectiveCard+element"></a>

### perspectiveCard.element : <code>HTMLElement</code>
(getter/setter) The element value

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>null</code>  
<a name="PerspectiveCard+position"></a>

### perspectiveCard.position : <code>Array</code>
(getter/setter) The position of the element relative to the viewport.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>[0, 0]</code>  
<a name="PerspectiveCard+tPoint"></a>

### perspectiveCard.tPoint : <code>Array</code>
(getter/setter) The 3D target look point. This is the point that the
look point will animate towards.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>[0, 0, -800]</code>  
<a name="PerspectiveCard+lookPoint"></a>

### perspectiveCard.lookPoint : <code>Array</code>
(getter/setter) The 3D look point. This is the point that the card
look look at.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>[0, 0, -800]</code>  
<a name="PerspectiveCard+center"></a>

### perspectiveCard.center : <code>Array</code>
(getter/setter) The 3D point that the card sits at.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>[0, 0, 0]</code>  
<a name="PerspectiveCard+zoom"></a>

### perspectiveCard.zoom : <code>Array</code>
(getter/setter) The current zoom value. If this is very different to the
Z component of the center point, the animation frame will attempt to
animate towards this.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>[0, 0, 0]</code>  
<a name="PerspectiveCard+zoomSize"></a>

### perspectiveCard.zoomSize : <code>Number</code>
(getter/setter) The target zoom value

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>40</code>  
<a name="PerspectiveCard+intensity"></a>

### perspectiveCard.intensity : <code>Number</code>
(getter/setter) The intensity for the ambient animation.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>10</code>  
<a name="PerspectiveCard+size"></a>

### perspectiveCard.size : <code>Array</code>
(getter/setter) The size of the element.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>[0, 0]</code>  
<a name="PerspectiveCard+ambient"></a>

### perspectiveCard.ambient : <code>Boolean</code>
(getter/setter) Ambient setting.
Setting to tru will automatically animate the card.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>false</code>  
<a name="PerspectiveCard+axis"></a>

### perspectiveCard.axis : <code>Array</code>
(getter/setter) The axis of the element relative to the top-left point.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>[0, 0]</code>  
<a name="PerspectiveCard+playing"></a>

### perspectiveCard.playing : <code>Boolean</code>
(getter/setter) Whether the simulation is playing. Setting this to
true will start up a requestAnimationFrame with the `play` method.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>false</code>  
<a name="PerspectiveCard+lastFrameTime"></a>

### perspectiveCard.lastFrameTime : <code>Number</code>
(getter/setter) The amount of time the last frame took

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>0</code>  
<a name="PerspectiveCard+delta"></a>

### perspectiveCard.delta : <code>Number</code>
(getter/setter) The animation delta. We use this and not the
RaF delta because we want this to pause when the animation is
not running.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>0</code>  
<a name="PerspectiveCard+lastDelta"></a>

### perspectiveCard.lastDelta : <code>Number</code>
(getter/setter) The animation's last frame delta delta.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>0</code>  
<a name="PerspectiveCard+pointerControlled"></a>

### perspectiveCard.pointerControlled : <code>Boolean</code>
(getter/setter) Whether the card animates based on the position
of the pointer. If this is true it will set the pointermove
event listener, otherwise it will try to remove it.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>false</code>  
<a name="PerspectiveCard+destroy"></a>

### perspectiveCard.destroy()
Tears the card down: removes all window and element listeners, disconnects
the intersection observer and cancels any pending timers, allowing the
instance (and its element) to be garbage collected. The card is inert
afterwards - create a new instance to reactivate it.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Access**: public  
<a name="PerspectiveCard+play"></a>

### perspectiveCard.play(delta, raf)
This is the main run-loop function.
It is responsible for taking the various previously set properies
and transforming the card. This can be called individually, or
(more commonly) as the callback to a animation frame.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| delta | <code>number</code> |  | The delta of the animation |
| raf | <code>boolean</code> | <code>true</code> | This just determines whether to run the next RAF as a part of this call |

<a name="PerspectiveCard+calculateLookDifferential"></a>

### perspectiveCard.calculateLookDifferential()
Calculates the difference between the look point and the look point target

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Access**: public  
<a name="PerspectiveCard+touchStart"></a>

### perspectiveCard.touchStart()
Event Listeners

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
<a name="PerspectiveCard+pointerMove"></a>

### perspectiveCard.pointerMove(e)
The event listener for the pointer move event.
This sets the target point to a value based on the pointer's position

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+pointerEnter"></a>

### perspectiveCard.pointerEnter(e)
The event listener for the pointer enter
This sets the pointerControlled property to true, updates the target
zoom and adds the class `perspective-card--over` to the element.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+pointerLeave"></a>

### perspectiveCard.pointerLeave(e)
The event listener for the pointer leave event
This sets the pointerControlled property to false, updates the
target zoom and removes the class `perspective-card--over` to the element.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+updatePosition"></a>

### perspectiveCard.updatePosition(e)
The event listener for the resize and scroll events
This updates the position and size of the element and sets the
axis for use in animation. This is bound to a debouncer so that
it doesn't get called a hundred times when scrolling or
resizing.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+intersect"></a>

### perspectiveCard.intersect(entries, observer) ⇒
Listener for the intersection observer callback

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Returns**: void  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| entries | <code>object</code> | the object that contains all of the elements being calculated by this observer |
| observer | <code>object</code> | the observer instance itself |

<a name="PerspectiveCard+hideIntersect"></a>

### perspectiveCard.hideIntersect(entries, observer) ⇒
Listener for the intersection observer callback

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Returns**: void  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| entries | <code>object</code> | the object that contains all of the elements being calculated by this observer |
| observer | <code>object</code> | the observer instance itself |

<a name="PerspectiveCard+_dispatch"></a>

### perspectiveCard.\_dispatch(name, detail)
Dispatches a CustomEvent on the card element with a `perspectivecard:` prefix.
Events bubble so they can be caught on any ancestor.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The event name (without the prefix) |
| detail | <code>object</code> | Optional detail payload |

<a name="PerspectiveCard.parseSettings"></a>

### PerspectiveCard.parseSettings(element, settings, schema) ⇒ <code>Object</code>
Walks a settings schema and resolves every key into a plain config object
ready to destructure. Each value follows the precedence: explicit
constructor setting -> `data-*` attribute -> default. `dataset` is the
native camelCase<->data-kebab bridge, so `dataset.closeButton` reads
`data-close-button` with no manual conversion.

**Kind**: static method of [<code>PerspectiveCard</code>](#PerspectiveCard)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The card element (source of `data-*` attrs) |
| settings | <code>Object</code> | The constructor settings object |
| schema | <code>Object</code> | A SETTINGS-shaped schema |

<a name="PerspectiveCard.targetTo"></a>

### PerspectiveCard.targetTo(eye, center, up) ⇒ <code>mat4</code>
Generates a matrix that makes something look at something else.

**Kind**: static method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Returns**: <code>mat4</code> - out  

| Param | Type | Description |
| --- | --- | --- |
| eye | <code>vec3</code> | Position of the viewer |
| center | <code>vec3</code> | Point the viewer is looking at |
| up | <code>vec3</code> | vec3 pointing up |

<a name="ClickablePerspectiveCard"></a>

## ClickablePerspectiveCard ⇐ [<code>PerspectiveCard</code>](#PerspectiveCard)
The clickable perspective card adds functionality that allows the zooming
the card by clicking on it. In doing so the card flips and animates up to a
modal style display.

For accessibility, the card is operated through a real `button` element
that covers the card. If the markup doesn't already contain a
`button.perspective-card__button`, one is created and appended
automatically, labelled from `settings.buttonLabel` or the
`data-button-label` attribute. The button exposes `aria-haspopup="dialog"`
and `aria-expanded`, can be operated with Enter/Space, and receives focus
back when the card closes. Escape closes the open card via the dialog's
cancel event.

**Kind**: global class  
**Extends**: [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Created**: Jan 28, 2020  
**Version**: 3.0.0  
**Author**: Liam Egan <liam@wethecollective.com>  

* [ClickablePerspectiveCard](#ClickablePerspectiveCard) ⇐ [<code>PerspectiveCard</code>](#PerspectiveCard)
    * [new ClickablePerspectiveCard(element, settings)](#new_ClickablePerspectiveCard_new)
    * [.SETTINGS](#ClickablePerspectiveCard+SETTINGS)
    * [.dialog](#ClickablePerspectiveCard+dialog) : <code>HTMLDialogElement</code>
    * [.openTargetRect](#ClickablePerspectiveCard+openTargetRect) : <code>Object</code>
    * [.enlarged](#ClickablePerspectiveCard+enlarged) : <code>Boolean</code>
    * [.tweening](#ClickablePerspectiveCard+tweening) : <code>Boolean</code>
    * [.tweenTime](#ClickablePerspectiveCard+tweenTime) : <code>Number</code>
    * [.tweenDuration](#ClickablePerspectiveCard+tweenDuration) : <code>Number</code>
    * [.onEndTween](#ClickablePerspectiveCard+onEndTween) : <code>function</code>
    * [.targetPosition](#ClickablePerspectiveCard+targetPosition) : <code>Vec2</code> \| <code>Array</code>
    * [.screenPosition](#ClickablePerspectiveCard+screenPosition) : <code>Vec2</code> \| <code>Array</code>
    * [.screenScale](#ClickablePerspectiveCard+screenScale) : <code>Number</code>
    * [.targetDimensions](#ClickablePerspectiveCard+targetDimensions) : <code>Vec2</code> \| <code>Array</code>
    * [.coerce](#PerspectiveCard+coerce)
    * [.restTransform](#PerspectiveCard+restTransform) : <code>String</code>
    * [.motionOff](#PerspectiveCard+motionOff) : <code>boolean</code>
    * [.element](#PerspectiveCard+element) : <code>HTMLElement</code>
    * [.position](#PerspectiveCard+position) : <code>Array</code>
    * [.tPoint](#PerspectiveCard+tPoint) : <code>Array</code>
    * [.lookPoint](#PerspectiveCard+lookPoint) : <code>Array</code>
    * [.center](#PerspectiveCard+center) : <code>Array</code>
    * [.zoom](#PerspectiveCard+zoom) : <code>Array</code>
    * [.zoomSize](#PerspectiveCard+zoomSize) : <code>Number</code>
    * [.intensity](#PerspectiveCard+intensity) : <code>Number</code>
    * [.size](#PerspectiveCard+size) : <code>Array</code>
    * [.ambient](#PerspectiveCard+ambient) : <code>Boolean</code>
    * [.axis](#PerspectiveCard+axis) : <code>Array</code>
    * [.playing](#PerspectiveCard+playing) : <code>Boolean</code>
    * [.lastFrameTime](#PerspectiveCard+lastFrameTime) : <code>Number</code>
    * [.delta](#PerspectiveCard+delta) : <code>Number</code>
    * [.lastDelta](#PerspectiveCard+lastDelta) : <code>Number</code>
    * [.pointerControlled](#PerspectiveCard+pointerControlled) : <code>Boolean</code>
    * [.destroy()](#ClickablePerspectiveCard+destroy)
    * [.resize(e)](#ClickablePerspectiveCard+resize)
    * [.play(delta, raf)](#ClickablePerspectiveCard+play)
    * [.onButtonClick(e)](#ClickablePerspectiveCard+onButtonClick)
    * [.onDialogClick(e)](#ClickablePerspectiveCard+onDialogClick)
    * [.calculateLookDifferential()](#PerspectiveCard+calculateLookDifferential)
    * [.touchStart()](#PerspectiveCard+touchStart)
    * [.pointerMove(e)](#PerspectiveCard+pointerMove)
    * [.pointerEnter(e)](#PerspectiveCard+pointerEnter)
    * [.pointerLeave(e)](#PerspectiveCard+pointerLeave)
    * [.updatePosition(e)](#PerspectiveCard+updatePosition)
    * [.intersect(entries, observer)](#PerspectiveCard+intersect) ⇒
    * [.hideIntersect(entries, observer)](#PerspectiveCard+hideIntersect) ⇒
    * [._dispatch(name, detail)](#PerspectiveCard+_dispatch)

<a name="new_ClickablePerspectiveCard_new"></a>

### new ClickablePerspectiveCard(element, settings)
The ClickablePerspectiveCard constructor. Creates and initialises the perspective
card component.


| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element that contains all of the card details |
| settings | <code>Object</code> | The settings of the component |
| settings.buttonLabel | <code>String</code> | The accessible label for the trigger button. Falls back to the `data-button-label` attribute, then to "Expand" |
| settings.closeButton | <code>Boolean</code> | Show a dedicated close button inside the modal. Defaults to true. Set false or add data-close-button="false" to opt out. |
| settings.closeButtonLabel | <code>String</code> | Accessible label for the close button. Falls back to the `data-close-button-label` attribute, then to "Close" |
| settings.duration | <code>Number</code> | Open animation duration in milliseconds. Falls back to the `data-duration` attribute, then to 800. The close animation runs at ⅔ of this value. |
| settings.startFlipped | <code>Boolean</code> | Start the card back-to-camera and reveal the front when it opens (flipping back on close). Falls back to the `data-start-flipped` attribute, then to false. |

<a name="ClickablePerspectiveCard+SETTINGS"></a>

### clickablePerspectiveCard.SETTINGS
The settings schema for the clickable card. Resolved by
`PerspectiveCard.parseSettings` the same way as the base settings.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>SETTINGS</code>](#PerspectiveCard+SETTINGS)  
<a name="ClickablePerspectiveCard+dialog"></a>

### clickablePerspectiveCard.dialog : <code>HTMLDialogElement</code>
(getter) The shared modal dialog. A single `<dialog>` is created lazily
on first open and reused by every card on the page - only one card can be
open at a time (enforced by `_activeCard`). Keeping one persistent element
in the DOM also lets the backdrop fade out via CSS (`allow-discrete`) on
every close path.
Future TBD: update to allow injection of dialog in userland markup for more
control, and support pathing of next/prev cards.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
<a name="ClickablePerspectiveCard+openTargetRect"></a>

### clickablePerspectiveCard.openTargetRect : <code>Object</code>
(overridable) The on-screen rectangle the card animates to when it opens —
the final visual position and size of the enlarged card, in viewport
coordinates. The base card fills 70% of the smaller viewport axis, centred
in the viewport.

Override this to land the card somewhere other than the viewport centre
(e.g. a column slot inside a custom dialog). The open tween, the open-end
pin, the close tween's start frame and the resize re-position all derive
from this single rect, so one override redirects the whole animation.

Getter-only by design: the target is recomputed on every access (the slot
can move on resize/scroll), so there's no stored rect to assign — override
the getter to change where the card lands.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
<a name="ClickablePerspectiveCard+enlarged"></a>

### clickablePerspectiveCard.enlarged : <code>Boolean</code>
(getter/setter) Whether the card is enlarged or not. This is a BIG
setter and is really responsible for generating the tweening values
setting up the tween and initialising it.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>false</code>  
<a name="ClickablePerspectiveCard+tweening"></a>

### clickablePerspectiveCard.tweening : <code>Boolean</code>
(getter/setter) Whether the card is in a tweening state. This just
enforces a boolean value.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>false</code>  
<a name="ClickablePerspectiveCard+tweenTime"></a>

### clickablePerspectiveCard.tweenTime : <code>Number</code>
(getter/setter) The current tween time.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>0</code>  
<a name="ClickablePerspectiveCard+tweenDuration"></a>

### clickablePerspectiveCard.tweenDuration : <code>Number</code>
(getter/setter) The current tween duration.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>0</code>  
<a name="ClickablePerspectiveCard+onEndTween"></a>

### clickablePerspectiveCard.onEndTween : <code>function</code>
(getter/setter) The function to call when the tween ends.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>null</code>  
<a name="ClickablePerspectiveCard+targetPosition"></a>

### clickablePerspectiveCard.targetPosition : <code>Vec2</code> \| <code>Array</code>
(getter/setter) The target position on-screen for the card.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0,0]</code>  
<a name="ClickablePerspectiveCard+screenPosition"></a>

### clickablePerspectiveCard.screenPosition : <code>Vec2</code> \| <code>Array</code>
(getter/setter) The current position on-screen for the card.
This also updates the element's styles left and top. So this
should *only* be set during a tween.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0,0]</code>  
<a name="ClickablePerspectiveCard+screenScale"></a>

### clickablePerspectiveCard.screenScale : <code>Number</code>
(getter/setter) The card's current scale value.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>1</code>  
<a name="ClickablePerspectiveCard+targetDimensions"></a>

### clickablePerspectiveCard.targetDimensions : <code>Vec2</code> \| <code>Array</code>
(getter/setter) The target dimensions for the card.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0,0]</code>  
<a name="PerspectiveCard+coerce"></a>

### clickablePerspectiveCard.coerce
Coercion functions keyed by setting type. Each receives the resolved raw
value (a real type from settings, or a string from a data-* attribute) and
the setting's default, and returns the final value.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>coerce</code>](#PerspectiveCard+coerce)  
<a name="PerspectiveCard+restTransform"></a>

### clickablePerspectiveCard.restTransform : <code>String</code>
(getter/setter) The transform applied to the transformer when the card is
at rest (i.e. not actively tilting). The base card rests face-on, so this
defaults to the identity matrix; consumers (or subclasses) can assign
another `matrix3d(...)` to rest in a different orientation — e.g. the
clickable card resting back-to-camera.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>the identity matrix</code>  
**Overrides**: [<code>restTransform</code>](#PerspectiveCard+restTransform)  
<a name="PerspectiveCard+motionOff"></a>

### clickablePerspectiveCard.motionOff : <code>boolean</code>
(getter/setter) The motion value

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>true</code>  
**Overrides**: [<code>motionOff</code>](#PerspectiveCard+motionOff)  
<a name="PerspectiveCard+element"></a>

### clickablePerspectiveCard.element : <code>HTMLElement</code>
(getter/setter) The element value

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>null</code>  
**Overrides**: [<code>element</code>](#PerspectiveCard+element)  
<a name="PerspectiveCard+position"></a>

### clickablePerspectiveCard.position : <code>Array</code>
(getter/setter) The position of the element relative to the viewport.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0, 0]</code>  
**Overrides**: [<code>position</code>](#PerspectiveCard+position)  
<a name="PerspectiveCard+tPoint"></a>

### clickablePerspectiveCard.tPoint : <code>Array</code>
(getter/setter) The 3D target look point. This is the point that the
look point will animate towards.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0, 0, -800]</code>  
**Overrides**: [<code>tPoint</code>](#PerspectiveCard+tPoint)  
<a name="PerspectiveCard+lookPoint"></a>

### clickablePerspectiveCard.lookPoint : <code>Array</code>
(getter/setter) The 3D look point. This is the point that the card
look look at.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0, 0, -800]</code>  
**Overrides**: [<code>lookPoint</code>](#PerspectiveCard+lookPoint)  
<a name="PerspectiveCard+center"></a>

### clickablePerspectiveCard.center : <code>Array</code>
(getter/setter) The 3D point that the card sits at.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0, 0, 0]</code>  
**Overrides**: [<code>center</code>](#PerspectiveCard+center)  
<a name="PerspectiveCard+zoom"></a>

### clickablePerspectiveCard.zoom : <code>Array</code>
(getter/setter) The current zoom value. If this is very different to the
Z component of the center point, the animation frame will attempt to
animate towards this.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0, 0, 0]</code>  
**Overrides**: [<code>zoom</code>](#PerspectiveCard+zoom)  
<a name="PerspectiveCard+zoomSize"></a>

### clickablePerspectiveCard.zoomSize : <code>Number</code>
(getter/setter) The target zoom value

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>40</code>  
**Overrides**: [<code>zoomSize</code>](#PerspectiveCard+zoomSize)  
<a name="PerspectiveCard+intensity"></a>

### clickablePerspectiveCard.intensity : <code>Number</code>
(getter/setter) The intensity for the ambient animation.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>10</code>  
**Overrides**: [<code>intensity</code>](#PerspectiveCard+intensity)  
<a name="PerspectiveCard+size"></a>

### clickablePerspectiveCard.size : <code>Array</code>
(getter/setter) The size of the element.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0, 0]</code>  
**Overrides**: [<code>size</code>](#PerspectiveCard+size)  
<a name="PerspectiveCard+ambient"></a>

### clickablePerspectiveCard.ambient : <code>Boolean</code>
(getter/setter) Ambient setting.
Setting to tru will automatically animate the card.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>false</code>  
**Overrides**: [<code>ambient</code>](#PerspectiveCard+ambient)  
<a name="PerspectiveCard+axis"></a>

### clickablePerspectiveCard.axis : <code>Array</code>
(getter/setter) The axis of the element relative to the top-left point.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0, 0]</code>  
**Overrides**: [<code>axis</code>](#PerspectiveCard+axis)  
<a name="PerspectiveCard+playing"></a>

### clickablePerspectiveCard.playing : <code>Boolean</code>
(getter/setter) Whether the simulation is playing. Setting this to
true will start up a requestAnimationFrame with the `play` method.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>false</code>  
**Overrides**: [<code>playing</code>](#PerspectiveCard+playing)  
<a name="PerspectiveCard+lastFrameTime"></a>

### clickablePerspectiveCard.lastFrameTime : <code>Number</code>
(getter/setter) The amount of time the last frame took

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>0</code>  
**Overrides**: [<code>lastFrameTime</code>](#PerspectiveCard+lastFrameTime)  
<a name="PerspectiveCard+delta"></a>

### clickablePerspectiveCard.delta : <code>Number</code>
(getter/setter) The animation delta. We use this and not the
RaF delta because we want this to pause when the animation is
not running.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>0</code>  
**Overrides**: [<code>delta</code>](#PerspectiveCard+delta)  
<a name="PerspectiveCard+lastDelta"></a>

### clickablePerspectiveCard.lastDelta : <code>Number</code>
(getter/setter) The animation's last frame delta delta.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>0</code>  
**Overrides**: [<code>lastDelta</code>](#PerspectiveCard+lastDelta)  
<a name="PerspectiveCard+pointerControlled"></a>

### clickablePerspectiveCard.pointerControlled : <code>Boolean</code>
(getter/setter) Whether the card animates based on the position
of the pointer. If this is true it will set the pointermove
event listener, otherwise it will try to remove it.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>false</code>  
**Overrides**: [<code>pointerControlled</code>](#PerspectiveCard+pointerControlled)  
<a name="ClickablePerspectiveCard+destroy"></a>

### clickablePerspectiveCard.destroy()
Tears the clickable card down. If this card currently holds the modal it
is force-closed and cleaned up first, then the trigger button's listener
and everything the base card registered are removed. The shared dialog is
deliberately left in the DOM (other cards may be using it, and its
delegating listeners hold no card references once no card is active), as
is the trigger button.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>destroy</code>](#PerspectiveCard+destroy)  
**Access**: public  
<a name="ClickablePerspectiveCard+resize"></a>

### clickablePerspectiveCard.resize(e)
The event listener for the resize and scroll events
This updates the position and size of the element and sets the
axis for use in animation. This is bound to a debouncer so that
it doesn't get called a hundred times when scrolling or
resizing.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="ClickablePerspectiveCard+play"></a>

### clickablePerspectiveCard.play(delta, raf)
This is the main run-loop function.
It is responsible for taking the various previously set properies
and transforming the card. This can be called individually, or
(more commonly) as the callback to a animation frame.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>play</code>](#PerspectiveCard+play)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| delta | <code>number</code> |  | The delta of the animation |
| raf | <code>boolean</code> | <code>true</code> | This just determines whether to run the next RAF as a part of this call |

<a name="ClickablePerspectiveCard+onButtonClick"></a>

### clickablePerspectiveCard.onButtonClick(e)
The event listener for the trigger button's click event. This is the
single path through which the card is opened and closed - the browser
normalises pointer, keyboard and assistive-technology activation into
click events for us, including cancelling presses that drag away from
the button or turn into scrolls.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The click event object |

<a name="ClickablePerspectiveCard+onDialogClick"></a>

### clickablePerspectiveCard.onDialogClick(e)
The event listener for the dialog's click event. Clicks on the modal
backdrop target the dialog element itself, so this closes the card on
backdrop click. Clicks on the card bubble up here too, but those carry
the button as their target and are ignored.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The click event object |

<a name="PerspectiveCard+calculateLookDifferential"></a>

### clickablePerspectiveCard.calculateLookDifferential()
Calculates the difference between the look point and the look point target

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>calculateLookDifferential</code>](#PerspectiveCard+calculateLookDifferential)  
**Access**: public  
<a name="PerspectiveCard+touchStart"></a>

### clickablePerspectiveCard.touchStart()
Event Listeners

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>touchStart</code>](#PerspectiveCard+touchStart)  
<a name="PerspectiveCard+pointerMove"></a>

### clickablePerspectiveCard.pointerMove(e)
The event listener for the pointer move event.
This sets the target point to a value based on the pointer's position

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>pointerMove</code>](#PerspectiveCard+pointerMove)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+pointerEnter"></a>

### clickablePerspectiveCard.pointerEnter(e)
The event listener for the pointer enter
This sets the pointerControlled property to true, updates the target
zoom and adds the class `perspective-card--over` to the element.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>pointerEnter</code>](#PerspectiveCard+pointerEnter)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+pointerLeave"></a>

### clickablePerspectiveCard.pointerLeave(e)
The event listener for the pointer leave event
This sets the pointerControlled property to false, updates the
target zoom and removes the class `perspective-card--over` to the element.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>pointerLeave</code>](#PerspectiveCard+pointerLeave)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+updatePosition"></a>

### clickablePerspectiveCard.updatePosition(e)
The event listener for the resize and scroll events
This updates the position and size of the element and sets the
axis for use in animation. This is bound to a debouncer so that
it doesn't get called a hundred times when scrolling or
resizing.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>updatePosition</code>](#PerspectiveCard+updatePosition)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+intersect"></a>

### clickablePerspectiveCard.intersect(entries, observer) ⇒
Listener for the intersection observer callback

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>intersect</code>](#PerspectiveCard+intersect)  
**Returns**: void  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| entries | <code>object</code> | the object that contains all of the elements being calculated by this observer |
| observer | <code>object</code> | the observer instance itself |

<a name="PerspectiveCard+hideIntersect"></a>

### clickablePerspectiveCard.hideIntersect(entries, observer) ⇒
Listener for the intersection observer callback

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>hideIntersect</code>](#PerspectiveCard+hideIntersect)  
**Returns**: void  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| entries | <code>object</code> | the object that contains all of the elements being calculated by this observer |
| observer | <code>object</code> | the observer instance itself |

<a name="PerspectiveCard+_dispatch"></a>

### clickablePerspectiveCard.\_dispatch(name, detail)
Dispatches a CustomEvent on the card element with a `perspectivecard:` prefix.
Events bubble so they can be caught on any ancestor.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>\_dispatch</code>](#PerspectiveCard+_dispatch)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The event name (without the prefix) |
| detail | <code>object</code> | Optional detail payload |

<a name="CSSCLASSES"></a>

## CSSCLASSES
Centralised CSS class names used by the base card.

**Kind**: global constant  
<a name="CSSCLASSES"></a>

## CSSCLASSES
The base card's class names extended with the ones the clickable card adds
(the trigger button, dialog, modal/open states and close button).

**Kind**: global constant  

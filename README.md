# WTC Perspective Card

wtc-perspective-card provides a way to create a fake 3d card animation.

## Installation

```sh
$ npm install wtc-perspective-card
```

## Demo

https://codepen.io/shubniggurath/pen/99df48ac9073736b0bbf5bd0e062a096?editors=0110

## Usage

Import it into your project.

```javascript
import PerspectiveCard from "wtc-perspective-card";
```

Import the stylesheet with sass or use the css file.

```scss
@import "~wtc-perspective-card";
```

Add your markup.

```html
<div class="card">
  <div class="card__transformer">
    <div class="card__artwork card__artwork--front">
      <img
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/9b1b5b5-1.png"
      />
    </div>
    <div class="card__artwork card__artwork--rear">
      <img
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/pokemon_card_backside_in_high_resolution_by_atomicmonkeytcg_dah43cy-fullview.png"
      />
    </div>
    <div class="card__shine"></div>
  </div>
</div>
```

You now have 2 options to initalize the component.

### Instanciating

#### 1. Using The Decorator function

If you are using just add **data-decorator="PerspectiveCard"** to your markup.

```html
<div class="perspective-card" data-decorator="PerspectiveCard">
  <img class="perspective-card__img" src="path/image.jpg" />
</div>
```

And then write your decorator code to take a set of DOM elements and decorate them with the class

```javascript
const decorate = function (decorator, nodeSet) {
  const controllers = [];
  Array.from(nodeSet).forEach((node) => {
    const controller = new decorator(node, node.dataset);
    node.data = node.data || {};
    node.data.controller = controller;
    controllers.push(controller);
  });
  return controllers;
};
```

Then feed your DOM elements to the decorator code

```javascript
const controllers = decorate(
  PerspectiveCard,
  document.querySelectorAll('[data-decorator="PerspectiveCard"]')
);
```

#### 2. Vanilla JS

Plain vanilla javascript with ES6 and module imports.

```javascript
const card = new PerspectiveCard(document.getElementById("card"));
```

## Accessibility

`ClickablePerspectiveCard` is operated through a real `<button>` element that
invisibly covers the card — all activation (mouse, touch, keyboard and
assistive technology) runs through it. If your markup doesn't include one,
the component creates it for you:

```html
<button
  type="button"
  class="perspective-card__button"
  aria-label="Expand"
  aria-haspopup="dialog"
  aria-expanded="false"
></button>
```

- **Labelling** — set the accessible name with the `buttonLabel` setting or a
  `data-button-label` attribute on the card element. It defaults to "Expand".

```html
<div class="perspective-card" data-button-label="Expand the Charizard card">
```

```javascript
new ClickablePerspectiveCard(element, { buttonLabel: "Expand the Charizard card" });
```

- **Bring your own button** — if a `button.perspective-card__button` already
  exists inside the card element, the component uses it instead of creating
  one, so you can supply your own label or content.
- **Keyboard** — the card can be opened and closed with Enter/Space, and
  closed with Escape (handled by the modal `dialog`'s cancel event).
- **State** — the button exposes `aria-haspopup="dialog"` and toggles
  `aria-expanded` as the card opens and closes.
- **Focus** — while open, the card lives in a modal `dialog` (the rest of the
  page is inert); when it closes, focus returns to the card's button.

The basic `PerspectiveCard` (hover/ambient) is presentational and isn't given
a button.

## Events

Both classes dispatch `CustomEvent`s on the card element. Events bubble, so you can listen on any ancestor. All event names are prefixed with `perspectivecard:`.

```javascript
cardElement.addEventListener('perspectivecard:play', (e) => {
  console.log('card animation started')
})
```

### PerspectiveCard events

| Event | Fired when |
| --- | --- |
| `perspectivecard:play` | The animation loop starts — either because the card entered the viewport (ambient mode) or the pointer entered the card. |
| `perspectivecard:pause` | The animation loop stops — card left the viewport or pointer left the card. |

### ClickablePerspectiveCard events

| Event | Fired when |
| --- | --- |
| `perspectivecard:open` | The card starts its open animation (tween begins). |
| `perspectivecard:opened` | The open animation finishes and the card is fully displayed. |
| `perspectivecard:close` | The card starts its close animation (tween begins). |
| `perspectivecard:closed` | The close animation finishes and the card is back in the document flow. |
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

**Kind**: global class  

* [PerspectiveCard](#PerspectiveCard)
    * [new PerspectiveCard(element, settings)](#new_PerspectiveCard_new)
    * _instance_
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
        * [.debug](#PerspectiveCard+debug) : <code>Boolean</code>
        * [.ambient](#PerspectiveCard+ambient) : <code>Boolean</code>
        * [.axis](#PerspectiveCard+axis) : <code>Array</code>
        * [.playing](#PerspectiveCard+playing) : <code>Boolean</code>
        * [.lastFrameTime](#PerspectiveCard+lastFrameTime) : <code>Number</code>
        * [.delta](#PerspectiveCard+delta) : <code>Number</code>
        * [.lastDelta](#PerspectiveCard+lastDelta) : <code>Number</code>
        * [.pointerControlled](#PerspectiveCard+pointerControlled) : <code>Boolean</code>
        * [.play(delta, raf)](#PerspectiveCard+play)
        * [.calculateLookDifferential()](#PerspectiveCard+calculateLookDifferential)
        * [.touchStart()](#PerspectiveCard+touchStart)
        * [.pointerMove(e)](#PerspectiveCard+pointerMove)
        * [.pointerEnter(e)](#PerspectiveCard+pointerEnter)
        * [.pointerLeave(e)](#PerspectiveCard+pointerLeave)
        * [.updatePosition(e)](#PerspectiveCard+updatePosition)
        * [.intersect(entries, observer)](#PerspectiveCard+intersect) ⇒
        * [.hideIntersect(entries, observer)](#PerspectiveCard+hideIntersect) ⇒
        * [._setupFoil()](#PerspectiveCard+_setupFoil)
        * [._dispatch(name, detail)](#PerspectiveCard+_dispatch)
    * _static_
        * [.targetTo(eye, center, up)](#PerspectiveCard.targetTo) ⇒ <code>mat4</code>

<a name="new_PerspectiveCard_new"></a>

### new PerspectiveCard(element, settings)
The PerspectiveCard constructor. Creates and initialises the perspective card component.


| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element that contains all of the card details |
| settings | <code>Object</code> | The settings of the component |

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
<a name="PerspectiveCard+debug"></a>

### perspectiveCard.debug : <code>Boolean</code>
(getter/setter) Debug setting.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>false</code>  
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

<a name="PerspectiveCard+_setupFoil"></a>

### perspectiveCard.\_setupFoil()
Builds the foil SVG overlay and appends it to the transformer element.
Called once from the constructor when foil is enabled.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
<a name="PerspectiveCard+_dispatch"></a>

### perspectiveCard.\_dispatch(name, detail)
Dispatches a CustomEvent on the card element with a `perspectivecard:` prefix.
Events bubble so they can be caught on any ancestor.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The event name (without the prefix) |
| detail | <code>object</code> | Optional detail payload |

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
**Version**: 2.0.0  
**Author**: Liam Egan <liam@wethecollective.com>  

* [ClickablePerspectiveCard](#ClickablePerspectiveCard) ⇐ [<code>PerspectiveCard</code>](#PerspectiveCard)
    * [new ClickablePerspectiveCard(element, settings)](#new_ClickablePerspectiveCard_new)
    * [.enlarged](#ClickablePerspectiveCard+enlarged) : <code>Boolean</code>
    * [.tweening](#ClickablePerspectiveCard+tweening) : <code>Boolean</code>
    * [.tweenTime](#ClickablePerspectiveCard+tweenTime) : <code>Number</code>
    * [.tweenDuration](#ClickablePerspectiveCard+tweenDuration) : <code>Number</code>
    * [.onEndTween](#ClickablePerspectiveCard+onEndTween) : <code>function</code>
    * [.targetPosition](#ClickablePerspectiveCard+targetPosition) : <code>Vec2</code> \| <code>Array</code>
    * [.screenPosition](#ClickablePerspectiveCard+screenPosition) : <code>Vec2</code> \| <code>Array</code>
    * [.screenScale](#ClickablePerspectiveCard+screenScale) : <code>Number</code>
    * [.targetDimensions](#ClickablePerspectiveCard+targetDimensions) : <code>Vec2</code> \| <code>Array</code>
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
    * [.debug](#PerspectiveCard+debug) : <code>Boolean</code>
    * [.ambient](#PerspectiveCard+ambient) : <code>Boolean</code>
    * [.axis](#PerspectiveCard+axis) : <code>Array</code>
    * [.playing](#PerspectiveCard+playing) : <code>Boolean</code>
    * [.lastFrameTime](#PerspectiveCard+lastFrameTime) : <code>Number</code>
    * [.delta](#PerspectiveCard+delta) : <code>Number</code>
    * [.lastDelta](#PerspectiveCard+lastDelta) : <code>Number</code>
    * [.pointerControlled](#PerspectiveCard+pointerControlled) : <code>Boolean</code>
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
    * [._setupFoil()](#PerspectiveCard+_setupFoil)
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
**Default**: <code>0</code>  
<a name="ClickablePerspectiveCard+targetDimensions"></a>

### clickablePerspectiveCard.targetDimensions : <code>Vec2</code> \| <code>Array</code>
(getter/setter) The target dimensions for the card.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0,0]</code>  
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
<a name="PerspectiveCard+debug"></a>

### clickablePerspectiveCard.debug : <code>Boolean</code>
(getter/setter) Debug setting.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>false</code>  
**Overrides**: [<code>debug</code>](#PerspectiveCard+debug)  
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
single path through which the card is opened and closed — the browser
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

<a name="PerspectiveCard+_setupFoil"></a>

### clickablePerspectiveCard.\_setupFoil()
Builds the foil SVG overlay and appends it to the transformer element.
Called once from the constructor when foil is enabled.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>\_setupFoil</code>](#PerspectiveCard+_setupFoil)  
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


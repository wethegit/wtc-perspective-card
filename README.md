# WTC Perspective Card
wtc-perspective-card provides a way to create a fake 3d card animation.

## Installation
```sh
$ yarn add wtc-perspective-card
```

## Demo
https://codepen.io/shubniggurath/pen/99df48ac9073736b0bbf5bd0e062a096?editors=0110

## Usage
Import it into your project.
```javascript
import PerspectiveCard from 'wtc-perspective-card';
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
      <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/9b1b5b5-1.png" />
    </div>
    <div class="card__artwork card__artwork--rear">
      <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/pokemon_card_backside_in_high_resolution_by_atomicmonkeytcg_dah43cy-fullview.png" />
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
const decorate = function(decorator, nodeSet) {
  const controllers = [];
  Array.from(nodeSet).forEach((node) => {
    const controller = new decorator(node, node.dataset);
    node.data = node.data || {};
    node.data.controller = controller;
    controllers.push(controller);
  });
  return controllers;
}
```
Then feed your DOM elements to the decorator code
```javascript
const controllers = decorate(PerspectiveCard, document.querySelectorAll('[data-decorator="PerspectiveCard"]'));
```

#### 2. Vanilla JS
Plain vanilla javascript with ES6 and module imports.
```javascript
const card = new PerspectiveCard(document.getElementById('card'));
```

## Classes

<dl>
<dt><a href="#PerspectiveCard">PerspectiveCard</a></dt>
<dd><p>This sets up the basic perspective card. This class expects markup at least
conforming to:</p>
<pre><code>.card
  .card__transformer
    .card__artwork card__artwork--front
      img
    .card__artwork card__artwork--rear (optional)
      img
    .card__shine</code></pre><p>This class is designed to be used with a decorator function (provided by
the new wtc-decorator static class) or used directly like:</p>
<pre><code>const p = new PerspectiveCard(element);</code></pre></dd>
<dt><a href="#ClickablePerspectiveCard">ClickablePerspectiveCard</a> ⇐ <code><a href="#PerspectiveCard">PerspectiveCard</a></code></dt>
<dd><p>The clickable perspective card adds functionality that allows the zooming 
the card by clicking on it. In doing so the card flips and animates up to a 
modal style display.</p>
</dd>
</dl>

<a name="PerspectiveCard"></a>

## PerspectiveCard
This sets up the basic perspective card. This class expects markup at least
conforming to:
```
.card
  .card__transformer
    .card__artwork card__artwork--front
      img
    .card__artwork card__artwork--rear (optional)
      img
    .card__shine
```

This class is designed to be used with a decorator function (provided by
the new wtc-decorator static class) or used directly like:
```
const p = new PerspectiveCard(element);
```

**Kind**: global class  
**Created**: Jan 28, 2020  
**Version**: 2.0.0  
**Author**: Liam Egan <liam@wethecollective.com>  

* [PerspectiveCard](#PerspectiveCard)
    * [new PerspectiveCard(element, settings)](#new_PerspectiveCard_new)
    * _instance_
        * [.element](#PerspectiveCard+element) : <code>HTMLElement</code>
        * [.position](#PerspectiveCard+position) : <code>Array</code>
        * [.tPoint](#PerspectiveCard+tPoint) : <code>Array</code>
        * [.lookPoint](#PerspectiveCard+lookPoint) : <code>Array</code>
        * [.center](#PerspectiveCard+center) : <code>Array</code>
        * [.zoom](#PerspectiveCard+zoom) : <code>Array</code>
        * [.size](#PerspectiveCard+size) : <code>Array</code>
        * [.axis](#PerspectiveCard+axis) : <code>Array</code>
        * [.playing](#PerspectiveCard+playing) : <code>Boolean</code>
        * [.lastFrameTime](#PerspectiveCard+lastFrameTime) : <code>Number</code>
        * [.delta](#PerspectiveCard+delta) : <code>Number</code>
        * [.pointerControlled](#PerspectiveCard+pointerControlled) : <code>Boolean</code>
        * [.play(delta, raf)](#PerspectiveCard+play)
        * [.calculateLookDifferential()](#PerspectiveCard+calculateLookDifferential)
        * [.pointerMove(e)](#PerspectiveCard+pointerMove)
        * [.pointerEnter(e)](#PerspectiveCard+pointerEnter)
        * [.pointerLeave(e)](#PerspectiveCard+pointerLeave)
        * [.resize(e)](#PerspectiveCard+resize)
        * [.intersect(entries, observer)](#PerspectiveCard+intersect) ⇒
    * _static_
        * [.targetTo(eye, center, up)](#PerspectiveCard.targetTo) ⇒ <code>mat4</code>

<a name="new_PerspectiveCard_new"></a>

### new PerspectiveCard(element, settings)
The PerspectiveCard constructor. Creates and initialises the perspective card component.


| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element that contains all of the card details |
| settings | <code>Object</code> | The settings of the component |

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
(getter/setter) The target zoom value. If this is very different to the
Z component of the center point, the animation frame will attempt to
animate towards this.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>[0, 0, 0]</code>  
<a name="PerspectiveCard+size"></a>

### perspectiveCard.size : <code>Array</code>
(getter/setter) The size of the element.

**Kind**: instance property of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Default**: <code>[0, 0]</code>  
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
The event listener for the pointer enter event
This sets the pointerControlled property to true, updates the target
zoom and adds the class `card--over` to the element.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+pointerLeave"></a>

### perspectiveCard.pointerLeave(e)
The event listener for the pointer leave event
This sets the pointerControlled property to false, updates the
target zoom and removes the class `card--over` to the element.

**Kind**: instance method of [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+resize"></a>

### perspectiveCard.resize(e)
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

**Kind**: global class  
**Extends**: [<code>PerspectiveCard</code>](#PerspectiveCard)  
**Created**: Jan 28, 2020  
**Version**: 2.0.0  
**Author**: Liam Egan <liam@wethecollective.com>  
**Todo**

- [ ] Add some extra functionality here like a close button and keyboard close


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
    * [.element](#PerspectiveCard+element) : <code>HTMLElement</code>
    * [.position](#PerspectiveCard+position) : <code>Array</code>
    * [.tPoint](#PerspectiveCard+tPoint) : <code>Array</code>
    * [.lookPoint](#PerspectiveCard+lookPoint) : <code>Array</code>
    * [.center](#PerspectiveCard+center) : <code>Array</code>
    * [.zoom](#PerspectiveCard+zoom) : <code>Array</code>
    * [.size](#PerspectiveCard+size) : <code>Array</code>
    * [.axis](#PerspectiveCard+axis) : <code>Array</code>
    * [.playing](#PerspectiveCard+playing) : <code>Boolean</code>
    * [.lastFrameTime](#PerspectiveCard+lastFrameTime) : <code>Number</code>
    * [.delta](#PerspectiveCard+delta) : <code>Number</code>
    * [.pointerControlled](#PerspectiveCard+pointerControlled) : <code>Boolean</code>
    * [.play(delta, raf)](#ClickablePerspectiveCard+play)
    * [.calculateLookDifferential()](#PerspectiveCard+calculateLookDifferential)
    * [.pointerMove(e)](#PerspectiveCard+pointerMove)
    * [.pointerEnter(e)](#PerspectiveCard+pointerEnter)
    * [.pointerLeave(e)](#PerspectiveCard+pointerLeave)
    * [.resize(e)](#PerspectiveCard+resize)
    * [.intersect(entries, observer)](#PerspectiveCard+intersect) ⇒

<a name="new_ClickablePerspectiveCard_new"></a>

### new ClickablePerspectiveCard(element, settings)
The ClickablePerspectiveCard constructor. Creates and initialises the perspective 
card component.


| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element that contains all of the card details |
| settings | <code>Object</code> | The settings of the component |

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
(getter/setter) The target zoom value. If this is very different to the
Z component of the center point, the animation frame will attempt to
animate towards this.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0, 0, 0]</code>  
**Overrides**: [<code>zoom</code>](#PerspectiveCard+zoom)  
<a name="PerspectiveCard+size"></a>

### clickablePerspectiveCard.size : <code>Array</code>
(getter/setter) The size of the element.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>[0, 0]</code>  
**Overrides**: [<code>size</code>](#PerspectiveCard+size)  
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
<a name="PerspectiveCard+pointerControlled"></a>

### clickablePerspectiveCard.pointerControlled : <code>Boolean</code>
(getter/setter) Whether the card animates based on the position 
of the pointer. If this is true it will set the pointermove
event listener, otherwise it will try to remove it.

**Kind**: instance property of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Default**: <code>false</code>  
**Overrides**: [<code>pointerControlled</code>](#PerspectiveCard+pointerControlled)  
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

<a name="PerspectiveCard+calculateLookDifferential"></a>

### clickablePerspectiveCard.calculateLookDifferential()
Calculates the difference between the look point and the look point target

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>calculateLookDifferential</code>](#PerspectiveCard+calculateLookDifferential)  
**Access**: public  
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
The event listener for the pointer enter event
This sets the pointerControlled property to true, updates the target
zoom and adds the class `card--over` to the element.

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
target zoom and removes the class `card--over` to the element.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>pointerLeave</code>](#PerspectiveCard+pointerLeave)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>event</code> | The pointer event object |

<a name="PerspectiveCard+resize"></a>

### clickablePerspectiveCard.resize(e)
The event listener for the resize and scroll events
This updates the position and size of the element and sets the
axis for use in animation. This is bound to a debouncer so that
it doesn't get called a hundred times when scrolling or
resizing.

**Kind**: instance method of [<code>ClickablePerspectiveCard</code>](#ClickablePerspectiveCard)  
**Overrides**: [<code>resize</code>](#PerspectiveCard+resize)  
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


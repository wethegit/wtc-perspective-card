# WTC Perspective Card
wtc-perspective-card provides a way to create a fake 3d card animation.

## Installation
```sh
$ yarn add wtc-perspective-card
```

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
#### 1. Using ExecuteControllers
##### Automatically
If you are using [wtc-controller-element] just add **data-controller="PerspectiveCard"** to your markup.
```html
<div class="perspective-card" data-controller="PerspectiveCard">
  <img class="perspective-card__img" src="path/image.jpg" />
</div>
```
##### Manually
```javascript
ExecuteControllers.instanciate(document.getElementById('card'), PerspectiveCard);
```

#### 2. Vanilla JS
Plain vanilla javascript with ES6 and module imports.
```javascript
const card = new PerspectiveCard(document.getElementById('card'));
```

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
    * [new PerspectiveCard(element)](#new_PerspectiveCard_new)
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

### new PerspectiveCard(element)
The PerspectiveCard constructor. Creates and initialises the perspective card component.


| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element that contains all of the card details |

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


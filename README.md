# wtc-perspective-card
wtc-perspective-card provides a way to create a fake 3d card animation.

## Install
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
<div class="perspective-card">
  <img class="perspective-card__img" src="path/image.jpg" />
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

#### 3. ES5/Browser
If you wanna use as standalone or browser directly.
```html
<script src="dist/wtc-perspective-card.es5.js"></script>
<script>
  new WTCPerspectiveCard.default(document.getElementById('card'));
</script>
```

## Customize
`data-perspective` | integer | **default 1000** - changes the perspective of the animation on the card  
`data-autoplay-negative` | integer | **default 0** - changes where in the timeline the animation should start from  

```html
<div
  data-controller="PerspectiveCard"
  data-perspective="600"
  data-autoplay-negative="1"
>
  <img class="perspective-card__img" src="path/image.jpg" />
</div>
```
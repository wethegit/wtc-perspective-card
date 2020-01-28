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


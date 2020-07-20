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

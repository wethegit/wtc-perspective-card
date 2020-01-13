import "pepjs";
import _u from "wtc-utility-helpers";
import {
  default as ElementController,
  ExecuteControllers
} from "wtc-controller-element";
import { TimelineMax } from "gsap";

const SUPPORTSTOUCH = "ontouchstart" in window || navigator.msMaxTouchPoints;

/**
 * Usage:
 * Just add data-controller="PerspectiveCard" to the image wrapper.
 *
 * @class PerspectiveCard
 * @extends {ElementController}
 */
class PerspectiveCard extends ElementController {
  constructor(element) {
    super(element);

    this.img = this.element.querySelector("img");
    this.shineHTML = document.createElement("div");
    this.wrapper = document.createElement("div");
    this.perspective = this.element.getAttribute("data-perspective") || 1000;
    this.tlNegative =
      parseFloat(this.element.getAttribute("data-autoplay-negative")) || 0;
    this.animating = false;
    this.firstHover = true;
    this.pointers = {};
    this.autoplayTimeline = new TimelineMax({ repeat: -1, paused: true });

    this.shineHTML.className = "perspective-card__shine";
    this.wrapper.className = "perspectice-card__wrapper";

    while (this.element.firstChild) {
      this.wrapper.appendChild(this.element.firstChild);
    }

    this.wrapper.appendChild(this.shineHTML);
    this.element.appendChild(this.wrapper);

    this.element.style.perspective = `${this.perspective}px`;

    if (SUPPORTSTOUCH) window.preventScroll = false;

    this.element.addEventListener(
      "pointermove",
      this.processMovement.bind(this)
    );
    this.element.addEventListener("pointerenter", this.processEnter.bind(this));
    this.element.addEventListener("pointerleave", this.processExit.bind(this));

    let that = this,
      start = {
        left: 90,
        top: 145
      },
      points = [
        {
          left: 200,
          top: 160
        },
        {
          left: 138,
          top: 227
        },
        {
          left: 90,
          top: 145
        }
      ];

    for (let point of points) {
      (function(left, top) {
        that.autoplayTimeline.to(start, 1.5, {
          ease: Power1.easeInOut,
          left: left,
          top: top,
          onUpdate: function() {
            that.move(this.target.left, this.target.top);
          }
        });
      })(point.left, point.top);
    }

    this.play(this.tlNegative);
  }

  play(fromTo = null) {
    this.autoplayTimeline.play(fromTo);
  }

  pause() {
    this.autoplayTimeline.pause();
  }

  move(left, top) {
    let elWidth = this.element.offsetWidth,
      elHeight = this.element.offsetHeight,
      offsetX = 0.52 - left / elWidth,
      offsetY = 0.52 - top / elHeight,
      dy = top - elHeight / 2,
      dx = left - elWidth / 2,
      multiple = 320 / elWidth,
      yRotate = (offsetX - dx) * (0.07 * multiple),
      xRotate = (dy - offsetY) * (0.1 * multiple),
      imgCSS = `rotateX(${xRotate}deg) rotateY(${yRotate}deg) rotateZ(0deg)`,
      arad = Math.atan2(dy, dx),
      angle = (arad * 180) / Math.PI - 90;

    if (angle < 0) {
      angle = angle + 360;
    }

    // All of this 'trickery' with the first time you hover
    // and using GSAP, is because Firefox has a flickering problem when using
    // css transitions and quickly updating the transform value.
    // So I moved the scale and opacity to css transition with the .is-over class
    // and kept the transform and gradient updated on JS.
    // This way I have a nice transition on the first time the user hovers
    // and then as he moves I just update the transform without any transition on it.
    // This makes the animation smooth as a babies bum in any browser.
    // Now give me some beer, cuz I deserve it.
    if (this.firstHover && !this.animating) {
      this.animating = true;
      this.firstHover = false;
      TweenMax.to(this.wrapper, 0.1, {
        transform: imgCSS,
        force3D: true,
        onCompleteScope: this,
        onComplete: function() {
          this.animating = false;
        }
      });
    } else if (!this.animating) {
      TweenMax.set(this.wrapper, { transform: imgCSS });
    }

    this.shineHTML.style.background =
      "linear-gradient(" +
      angle +
      "deg, rgba(255,255,255," +
      (top / elHeight) * 0.6 +
      ") 0%, rgba(255,255,255,0) 80%)";
    this.shineHTML.style.transform =
      "translateX(" +
      offsetX * 0 -
      0.1 +
      "px) translateY(" +
      offsetY * 0 -
      0.1 +
      "px)";
  }

  enter() {
    this.pause();
    _u.addClass("is-over", this.element);
  }

  exit() {
    this.firstHover = true;
    this.animating = false;
    _u.removeClass("is-over", this.element);
    TweenMax.to(this.wrapper, 0.2, {
      transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
      force3D: true
    });
    this.play();
  }

  processMovement(e) {
    let pointer = this.pointers[e.pointerId];

    if (pointer) {
      pointer.x = e.pageX;
      pointer.y = e.pageY;
    }

    let topScroll = window.scrollY || window.pageYOffset,
      leftScroll = window.scrollX || window.pageXOffset,
      pageX = pointer.x,
      pageY = pointer.y,
      elOffsets = this.element.getBoundingClientRect(),
      left = pageX - elOffsets.left - leftScroll,
      top = pageY - elOffsets.top - topScroll;

    this.move(left, top);
  }

  processEnter(e) {
    this.pointers[e.pointerId] = {
      x: e.pageX,
      y: e.pageY,
      pointerType: e.pointerType,
      pointerId: e.pointerId
    };

    this.enter();
  }

  processExit(e) {
    delete this.pointers[e.pointerId];

    this.exit();
  }
}

ExecuteControllers.registerController(PerspectiveCard, "PerspectiveCard");

export default PerspectiveCard;

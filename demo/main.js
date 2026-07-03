import { PerspectiveCard, ClickablePerspectiveCard } from 'wtc-perspective-card'
import { CustomModalCard } from './custom-modal-card.js'
import { initMarkupViewer } from './markup-dialog.js'
import 'wtc-perspective-card/style.css'
import './demo.scss'

// Before any cards are constructed: the markup viewer captures each demo's
// authored markup, which construction would otherwise mutate (trigger-button
// creation/move, ARIA state).
initMarkupViewer()

document.querySelectorAll('.js-card').forEach((el) => new PerspectiveCard(el))
document
  .querySelectorAll('.js-card--clickable')
  .forEach((el) => new ClickablePerspectiveCard(el))
document
  .querySelectorAll('.js-card--custom-modal')
  .forEach((el) => new CustomModalCard(el))

window.PerspectiveCard = PerspectiveCard

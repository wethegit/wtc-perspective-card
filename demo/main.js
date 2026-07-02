import { PerspectiveCard, ClickablePerspectiveCard } from '../src/index.js'
import { CustomModalCard } from './custom-modal-card.js'
import '../src/wtc-perspective-card.scss'
import './demo.scss'

document.querySelectorAll('.js-card').forEach((el) => new PerspectiveCard(el))
document
  .querySelectorAll('.js-card--clickable')
  .forEach((el) => new ClickablePerspectiveCard(el))
document
  .querySelectorAll('.js-card--custom-modal')
  .forEach((el) => new CustomModalCard(el))

window.PerspectiveCard = PerspectiveCard

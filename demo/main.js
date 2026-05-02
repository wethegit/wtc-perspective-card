import PerspectiveCard, { ClickablePerspectiveCard } from '../src/wtc-perspective-card.js'
import '../src/wtc-perspective-card.scss'
import './demo.scss'

document.querySelectorAll('.js-card').forEach((el) => new PerspectiveCard(el))
document.querySelectorAll('.js-card--clickable').forEach((el) => new ClickablePerspectiveCard(el))

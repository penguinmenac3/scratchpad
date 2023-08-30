import './toolbar.css'
import { ToolButton, ToolPopup } from './toolbutton'
import { Spacer } from './spacer'
import { createElement } from '../../helpers'


export class Toolbar {
  private mainDiv: HTMLDivElement
  public constructor(parent: HTMLDivElement) {
    this.mainDiv = createElement("div", {"id": "toolbar"})
    parent.appendChild(this.mainDiv)
    new ToolButton(this.mainDiv, "back", false, '<i class="fa fa-arrow-left" aria-hidden="true"></i>')
    new ToolButton(this.mainDiv, "togglePreview", false, '<i class="fa fa-columns" aria-hidden="true"></i>')
    new ToolButton(this.mainDiv, "save", false, '<i class="fa fa-gear" aria-hidden="true"></i>')
    new Spacer(this.mainDiv)
    let pen = new ToolButton(this.mainDiv, "tool_pen", true, '<i class="fa fa-circle" aria-hidden="true"></i>')
    pen.onClick()
    pen.addPopup(new ToolPopup())
    let marker = new ToolButton(this.mainDiv, "tool_marker", true, '<i class="fa fa-square" aria-hidden="true"></i>')
    marker.addPopup(new ToolPopup())
    let erasor = new ToolButton(this.mainDiv, "tool_erasor", true, '<i class="fa fa-eraser" aria-hidden="true"></i>')
    erasor.addPopup(new ToolPopup())
    let text = new ToolButton(this.mainDiv, "tool_text", true, '<i class="fa fa-font" aria-hidden="true"></i>')
    text.addPopup(new ToolPopup())
    new Spacer(this.mainDiv)
    let shape = new ToolButton(this.mainDiv, "tool_shape", true, '<i class="fa fa-square-o" aria-hidden="true"></i>')
    shape.addPopup(new ToolPopup())
    let select = new ToolButton(this.mainDiv, "tool_select", true, '<i class="fa fa-square-o" aria-hidden="true"></i>') // TODO LASSO
    select.addPopup(new ToolPopup())

    new ToolButton(this.mainDiv, "settings_document", false, '<i class="fa fa-bars" aria-hidden="true"></i>', true)
    new Spacer(this.mainDiv, true)
    new ToolButton(this.mainDiv, "redo", false, '<i class="fa fa-repeat" aria-hidden="true"></i>', true)
    new ToolButton(this.mainDiv, "undo", false, '<i class="fa fa-undo" aria-hidden="true"></i>', true)
    //new Spacer(this.mainDiv, true)
  }
}

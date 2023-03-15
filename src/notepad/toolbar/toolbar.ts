import './toolbar.css'
import { ToolButton } from './toolbutton'
import { Spacer } from './spacer'
import { createElement } from '../../helpers'


export class Toolbar {
  private mainDiv: HTMLDivElement
  public constructor(parent: HTMLDivElement) {
    this.mainDiv = createElement("div", {"id": "toolbar"})
    parent.appendChild(this.mainDiv)
    new ToolButton(this.mainDiv, "back", false, '<i class="fa fa-arrow-left" aria-hidden="true"></i>')
    new ToolButton(this.mainDiv, "togglePreview", false, '<i class="fa fa-columns" aria-hidden="true"></i>')
    new Spacer(this.mainDiv)
    new ToolButton(this.mainDiv, "tool_pen", true, '<i class="fa fa-circle" aria-hidden="true"></i>').onClick()
    new ToolButton(this.mainDiv, "tool_marker", true, '<i class="fa fa-square" aria-hidden="true"></i>')
    new ToolButton(this.mainDiv, "tool_erasor", true, '<i class="fa fa-eraser" aria-hidden="true"></i>')
    new ToolButton(this.mainDiv, "tool_text", true, '<i class="fa fa-font" aria-hidden="true"></i>')
    new ToolButton(this.mainDiv, "settings_tools", false, '<i class="fa fa-gear" aria-hidden="true"></i>')
    new Spacer(this.mainDiv)
    new ToolButton(this.mainDiv, "tool_select", true, '<i class="fa fa-square-o" aria-hidden="true"></i>')

    new ToolButton(this.mainDiv, "settings_document", false, '<i class="fa fa-bars" aria-hidden="true"></i>', true)
    new Spacer(this.mainDiv, true)
    new ToolButton(this.mainDiv, "redo", false, '<i class="fa fa-repeat" aria-hidden="true"></i>', true)
    new ToolButton(this.mainDiv, "undo", false, '<i class="fa fa-undo" aria-hidden="true"></i>', true)
    //new Spacer(this.mainDiv, true)
  }
}

import './toolbar.css'
import { ToolButton, ToolPopup } from './toolbutton'
import { Spacer } from './spacer'
import { Module } from '../../webui/module'


export class Toolbar extends Module<HTMLDivElement> {
  public constructor() {
    super("div", "", "toolbar")
    this.add(new ToolButton("back", false, '<i class="fa fa-arrow-left" aria-hidden="true"></i>'))
    this.add(new ToolButton("togglePreview", false, '<i class="fa fa-columns" aria-hidden="true"></i>'))
    this.add(new ToolButton("save", false, '<i class="fa fa-gear" aria-hidden="true"></i>'))
    this.add(new Spacer())
    let pen = new ToolButton("tool_pen", true, '<i class="fa fa-circle" aria-hidden="true"></i>')
    pen.onClick()
    pen.addPopup(new ToolPopup())
    this.add(pen)
    let marker = new ToolButton("tool_marker", true, '<i class="fa fa-square" aria-hidden="true"></i>')
    marker.addPopup(new ToolPopup())
    this.add(marker)
    let erasor = new ToolButton("tool_erasor", true, '<i class="fa fa-eraser" aria-hidden="true"></i>')
    erasor.addPopup(new ToolPopup())
    this.add(erasor)
    let text = new ToolButton("tool_text", true, '<i class="fa fa-font" aria-hidden="true"></i>')
    text.addPopup(new ToolPopup())
    this.add(text)
    this.add(new Spacer())
    let shape = new ToolButton("tool_shape", true, '<i class="fa fa-square-o" aria-hidden="true"></i>')
    shape.addPopup(new ToolPopup())
    this.add(shape)
    let select = new ToolButton("tool_select", true, '<i class="fa fa-square-o" aria-hidden="true"></i>') // TODO LASSO
    select.addPopup(new ToolPopup())
    this.add(select)

    this.add(new ToolButton("settings_document", false, '<i class="fa fa-bars" aria-hidden="true"></i>', true))
    this.add(new Spacer(true))
    this.add(new ToolButton("redo", false, '<i class="fa fa-repeat" aria-hidden="true"></i>', true))
    this.add(new ToolButton("undo", false, '<i class="fa fa-undo" aria-hidden="true"></i>', true))
    //this.add(new Spacer(true))
  }
}
